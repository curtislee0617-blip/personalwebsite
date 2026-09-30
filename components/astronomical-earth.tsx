"use client";

import { useEffect, useMemo, useState } from "react";
import { EarthCanvas } from "@/components/earth-canvas";
import { dateInZone, getCurrentSky, getDayInterval, getNightPlan, type Coordinates } from "@/lib/astronomical-darkness";
import { earthLighting } from "@/lib/earth-lighting";
import { GlobeWeather } from "@/components/globe-weather";
import type { GlobeForecast } from "@/lib/globe-weather";
import { EARTH_PLAYBACK_RATE } from "@/lib/globe-effects";

export function AstronomicalEarth({ location, date, timeZone, forecast, onToday }: { location: Coordinates; date: string; timeZone: string; forecast: GlobeForecast | null; onToday: () => void }) {
  const [clock, setClock] = useState(() => new Date());
  const [preview, setPreview] = useState<number | null>(null);
  const [showMoon, setShowMoon] = useState(false);
  const [showClouds, setShowClouds] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [dotted, setDotted] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const start = window.setTimeout(() => {
      if (media.matches) return;
      const sunset = getNightPlan(date, timeZone, location).sunset;
      if (sunset) setPreview(sunset.getTime() - 90 * 60000);
      setPlaying(true);
    }, 0);
    const stop = () => { if (media.matches) setPlaying(false); };
    media.addEventListener("change", stop);
    return () => { window.clearTimeout(start); media.removeEventListener("change", stop); };
  }, [date, timeZone, location]);
  const interval = useMemo(() => getDayInterval(date, timeZone), [date, timeZone]);
  const today = dateInZone(clock, timeZone) === date;
  const instant = preview !== null ? new Date(preview) : today ? clock : new Date((interval.start.getTime() + interval.end.getTime()) / 2);
  const live = preview === null && today && !playing;
  const sky = getCurrentSky(instant, location);
  const fraction = earthLighting(instant).moonFraction;
  const condition = sky.sunAltitude >= 0 ? "Daylight" : sky.sunAltitude >= -6 ? "Civil twilight" : sky.sunAltitude >= -12 ? "Nautical twilight" : sky.sunAltitude >= -18 ? "Astronomical twilight" : sky.moonAltitude >= 0 ? "Moon above horizon" : "Moonless darkness";
  const clockLabel = new Intl.DateTimeFormat("en-US", { timeZone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(instant);
  const dateLabel = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short", month: "short", day: "numeric" }).format(instant);
  useEffect(() => {
    if (!live) return;
    const timer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, [live]);
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const timer = window.setInterval(() => {
      const current = performance.now();
      const elapsed = Math.min(current - last, 500);
      last = current;
      if (document.hidden) return;
      setPreview(previous => {
        const start = interval.start.getTime();
        const end = interval.end.getTime() - 60000;
        const initial = previous ?? (today ? Date.now() : start);
        return start + ((initial - start + elapsed * EARTH_PLAYBACK_RATE) % (end - start));
      });
    }, 250);
    return () => window.clearInterval(timer);
  }, [playing, interval, today]);
  return <section className="astro-earth-section" aria-labelledby="astro-earth-title">
    <div className="astro-earth-heading"><div><span className="astro-section-number">01 / Earth · day & night</span><h2 id="astro-earth-title">The edge of night.</h2><p>Watch dusk cross the continents and city lights emerge as Earth slips into night.</p></div><span className="astro-earth-live" data-live={live}>{live ? "● Live" : playing ? "Preview · 30 minutes / second" : "Time preview"}</span></div>
    <div className="astro-earth-display-controls" role="group" aria-label="Globe appearance"><button type="button" aria-pressed={!dotted} onClick={() => setDotted(false)}>Satellite</button><button type="button" aria-pressed={dotted} onClick={() => setDotted(true)}>Dotted globe</button><button type="button" aria-pressed={showClouds} onClick={() => setShowClouds(value => !value)}>Clouds</button><span>Stars · Daylight · City lights</span></div>
    <div className="astro-earth-layout"><EarthCanvas instant={instant} location={location} showMoon={showMoon} showClouds={showClouds} playing={playing} dotted={dotted} />
      <div className="astro-earth-details"><span className="astro-earth-kicker">{live ? "Current sky at your spot" : "Preview at your spot"}</span><time dateTime={instant.toISOString()} className="astro-earth-clock">{clockLabel}</time><p className="astro-earth-date">{dateLabel}<br />{timeZone.replace(/_/g, " ")}</p><p className="astro-earth-condition">{condition}</p><dl><div><dt>Sun altitude</dt><dd>{sky.sunAltitude.toFixed(1)}°</dd></div><div><dt>Moon altitude</dt><dd>{sky.moonAltitude.toFixed(1)}°</dd></div><div><dt>Moon illuminated</dt><dd>{Math.round(fraction * 100)}%</dd></div></dl><label className="astro-moon-switch"><input type="checkbox" checked={showMoon} onChange={event => setShowMoon(event.target.checked)} /> Enhance moonlight</label><GlobeWeather forecast={forecast} instant={instant} /><span className="astro-earth-pin-key">◉ Selected location · NASA imagery</span></div>
    </div>
    <div className="astro-earth-scrubber"><div><label htmlFor="astro-earth-time">Time at your location</label><button type="button" aria-pressed={playing} onClick={() => setPlaying(value => !value)}>{playing ? "Ⅱ Pause motion" : "▶ Play a day"}</button><button type="button" onClick={() => { setPlaying(false); setPreview(null); setClock(new Date()); onToday(); }}>Back to now ↗</button></div><input id="astro-earth-time" type="range" min={interval.start.getTime()} max={interval.end.getTime() - 60000} step={60000} value={instant.getTime()} onChange={event => { setPlaying(false); setPreview(Number(event.target.value)); }} aria-valuetext={`${dateLabel}, ${clockLabel} ${timeZone}`} /><div className="astro-earth-time-labels"><span>00:00</span><span>Drag to explore {Math.round((interval.end.getTime() - interval.start.getTime()) / 3600000)} hours</span><span>23:59</span></div></div>
    <div className="astro-earth-legend"><span><i className="day" />Sunlight</span><span><i className="twilight" />Twilight</span><span><i className="moon" />Moonlight</span><span><i className="night" />Deep night</span></div>
    <p className="astro-earth-note">Sun and Moon directions use Astronomy Engine, including Earth’s rotation, axial orientation, and the selected time. NASA Blue Marble (2004) and Black Marble (2016) provide the surface and city lights; these are historical composites, not live satellite images. City lights fade in around sunset and out through dawn. Stars use <a href="https://svs.gsfc.nasa.gov/4851/" target="_blank" rel="noopener noreferrer">NASA/Goddard’s Deep Star Maps 2020</a> (Gaia DR2: ESA/Gaia/DPAC), aligned to the selected time. Rendering adapts <a href="https://github.com/inventhq/dot-globe" target="_blank" rel="noopener noreferrer">dot-globe</a> and <a href="https://github.com/Pana-g/flutter_earth_globe" target="_blank" rel="noopener noreferrer">flutter_earth_globe</a>. Star brightness is enhanced for visibility; moonlight enhancement is optional. Clouds use a gently drifting NASA Blue Marble composite, with reduced opacity over land; they illustrate the atmosphere rather than current cloud positions. Local weather readings come from the Open-Meteo forecast for the selected hour. Terrain shadows and eclipses are not simulated.</p>
  </section>;
}
