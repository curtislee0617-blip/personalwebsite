"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { EARTH_PLAYBACK_RATE } from "@/lib/globe-effects";
import { dateInZone, getCurrentSky, getDayInterval, getNightPlan } from "@/lib/astronomical-darkness";
import { sampleEarthTimeline, type EarthTimeline } from "@/lib/earth-timeline";
import { GlobeWeather } from "@/components/globe-weather";
import { globeForecastUrl, type GlobeForecast } from "@/lib/globe-weather";
import { usePinnedSkyLocation } from "@/components/use-pinned-sky-location";

const EarthPreview = dynamic(() => import("@/components/earth-canvas").then(module => module.EarthCanvas), { ssr: false });

export function AstronomyThumbnail() {
  const host = useRef<HTMLDivElement>(null);
  const timeline = useRef<EarthTimeline | null>(null);
  const { spot, ready: locationReady } = usePinnedSkyLocation();
  const [instant, setInstant] = useState<Date | null>(null);
  const [playing, setPlaying] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [inView, setInView] = useState(false);
  const [ready, setReady] = useState(false);
  const [weather, setWeather] = useState<{ key: string; forecast: GlobeForecast } | null>(null);
  const weatherKey = `${spot.latitude}:${spot.longitude}`;
  useEffect(() => {
    if (!ready || !locationReady) return;
    const controller = new AbortController();
    fetch(globeForecastUrl(spot.latitude, spot.longitude), { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error("Weather unavailable"); return response.json(); })
      .then((forecast: GlobeForecast) => { if (!controller.signal.aborted) setWeather({ key: weatherKey, forecast }); })
      .catch(() => { /* The globe still works without a weather connection. */ });
    return () => controller.abort();
  }, [ready, locationReady, spot.latitude, spot.longitude, weatherKey]);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
      if (entry.isIntersecting) setReady(true);
    }, { rootMargin: "200px" });
    if (host.current) observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!ready || !locationReady) return;
    const now = new Date();
    const day = dateInZone(now, spot.timeZone);
    const interval = getDayInterval(day, spot.timeZone);
    const sunset = getNightPlan(day, spot.timeZone, spot).sunset;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const initial = !reduced && sunset ? sunset.getTime() - 90 * 60_000 : now.getTime();
    timeline.current = { instant: initial, anchor: performance.now(), rate: 0, start: interval.start.getTime(), end: interval.end.getTime() };
  }, [ready, locationReady, spot]);
  useEffect(() => {
    if (!ready || !locationReady) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncActivity = () => {
      if (!timeline.current) return;
      const stamp = performance.now();
      const time = media.matches ? Date.now() : sampleEarthTimeline(timeline.current, stamp);
      const active = !media.matches && !document.hidden && inView;
      timeline.current = { ...timeline.current, instant: time, anchor: stamp, rate: active ? EARTH_PLAYBACK_RATE : 0 };
      setInstant(new Date(time));
      setPlaying(active);
      setPreviewMode(!media.matches);
    };
    syncActivity();
    // The label samples the very same clock as each WebGL frame. Scrolling or
    // switching tabs pauses it without jumping back to the start of sunset.
    const timer = window.setInterval(() => {
      if (document.hidden || !inView || !timeline.current) return;
      if (media.matches) timeline.current.instant = Date.now();
      setInstant(new Date(sampleEarthTimeline(timeline.current, performance.now())));
    }, 100);
    media.addEventListener("change", syncActivity);
    document.addEventListener("visibilitychange", syncActivity);
    return () => {
      window.clearInterval(timer);
      media.removeEventListener("change", syncActivity);
      document.removeEventListener("visibilitychange", syncActivity);
      if (timeline.current) timeline.current = { ...timeline.current, instant: sampleEarthTimeline(timeline.current, performance.now()), anchor: performance.now(), rate: 0 };
    };
  }, [ready, locationReady, inView, spot]);
  const sky = instant ? getCurrentSky(instant, spot) : null;
  const condition = !sky ? "Checking the sky…" : sky.sunAltitude >= 0 ? "Daylight" : sky.sunAltitude >= -6 ? "Civil twilight" : sky.sunAltitude >= -12 ? "Nautical twilight" : sky.sunAltitude >= -18 ? "Astronomical twilight" : sky.moonAltitude >= 0 ? "Moonlit night" : "Moonless darkness";
  return <div className="tool-thumbnail swipe-bubble-media tool-astronomy-preview">
    <div className="tool-earth-scene" ref={host} aria-hidden="true">{ready && instant && <EarthPreview instant={instant} location={spot} compact playing={playing} timeline={timeline} />}</div>
    <span className="tool-earth-preview-label">{previewMode ? "Day → night · Time-lapse" : "Earth · Current light"}</span>
    <span className="tool-earth-cloud-label">Illustrative clouds</span>
    <div className="tool-astronomy-now"><span>{spot.name} · {previewMode ? "Time preview" : "Now"}</span><strong>{condition}</strong><small><time dateTime={instant?.toISOString()}>{instant ? new Intl.DateTimeFormat("en-US", { timeZone: spot.timeZone, hour: "numeric", minute: "2-digit" }).format(instant) : "—"}</time> · Explore the sky ↗</small><GlobeWeather compact forecast={weather?.key === weatherKey ? weather.forecast : null} instant={instant} /></div>
  </div>;
}
