"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { dateInZone, getCurrentSky, getNightPlan, type Coordinates, type DarkWindow, type NightPlan } from "@/lib/astronomical-darkness";

const DarknessMap = dynamic(
  () => import("@/components/astronomical-darkness-map").then((module) => module.AstronomicalDarknessMap),
  { ssr: false, loading: () => <div className="astro-map astro-map-loading">Preparing night-lights map…</div> },
);

type Forecast = {
  timezone: string;
  hourly?: { time?: number[]; cloud_cover?: number[] };
};

const initialLocation = { latitude: 34.0522, longitude: -118.2437 };

function timeLabel(instant: Date | null, timeZone: string) {
  if (!instant) return "—";
  return new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" }).format(instant);
}

function dateLabel(instant: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short", month: "short", day: "numeric" }).format(instant);
}

function durationLabel(minutes: number) {
  const rounded = Math.round(minutes);
  const hours = Math.floor(rounded / 60);
  const rest = rounded % 60;
  return hours ? `${hours}h ${rest ? `${rest}m` : ""}`.trim() : `${rest}m`;
}

function coordinateLabel(location: Coordinates) {
  return `${Math.abs(location.latitude).toFixed(3)}° ${location.latitude >= 0 ? "N" : "S"}, ${Math.abs(location.longitude).toFixed(3)}° ${location.longitude >= 0 ? "E" : "W"}`;
}

function eventLabel(name: string, instant: Date | null, plan: NightPlan, timeZone: string) {
  return instant && dateInZone(instant, timeZone) !== dateInZone(plan.intervalStart, timeZone)
    ? `${name} · next day`
    : name;
}

function bestWindow(plan: NightPlan) {
  return plan.windows.reduce<DarkWindow | null>(
    (best, window) => !best || window.minutes > best.minutes ? window : best,
    null,
  );
}

function forecastCloudCover(forecast: Forecast | null, window: DarkWindow | null) {
  const times = forecast?.hourly?.time;
  const values = forecast?.hourly?.cloud_cover;
  if (!times?.length || !values?.length || !window || times.length !== values.length) return null;
  const start = window.start.getTime();
  const end = window.end.getTime();
  const inside = values.filter((value, index) => Number.isFinite(value)
    && times[index] * 1000 >= start - 30 * 60_000
    && times[index] * 1000 <= end + 30 * 60_000);
  if (inside.length) return Math.round(inside.reduce((sum, value) => sum + value, 0) / inside.length);
  const middle = (start + end) / 2;
  const closest = times.reduce((best, time, index) =>
    Math.abs(time * 1000 - middle) < Math.abs(times[best] * 1000 - middle) ? index : best, 0);
  return Math.abs(times[closest] * 1000 - middle) <= 90 * 60_000 ? Math.round(values[closest]) : null;
}

function nightVerdict(plan: NightPlan, window: DarkWindow | null, cloud: number | null) {
  if (!plan.astronomicalMinutes) return { title: "No astronomical night", detail: "The Sun does not reach 18° below the horizon on this date.", tone: "limited" };
  if (!window) return { title: "Moonlit all night", detail: "There is no interval with both the Sun and Moon below the horizon.", tone: "limited" };
  if (cloud !== null && cloud >= 70) return { title: "Clouds likely", detail: "A moonless window exists, but forecast cloud cover may block the sky.", tone: "limited" };
  if (window.minutes < 45) return { title: "Short dark window", detail: "Plan a tight shoot around the window shown below.", tone: "mixed" };
  if (cloud !== null && cloud <= 35) return { title: "Promising timing", detail: "Sun, Moon, and forecast cloud cover line up. Check local skyglow before traveling.", tone: "good" };
  return { title: "Moonless window available", detail: "The timing works; check clouds and local skyglow before heading out.", tone: "mixed" };
}

function Timeline({ plan, timeZone }: { plan: NightPlan; timeZone: string }) {
  const start = plan.intervalStart.getTime();
  const span = plan.intervalEnd.getTime() - start;
  const barStyle = (window: DarkWindow) => ({
    left: `${100 * (window.start.getTime() - start) / span}%`,
    width: `${100 * (window.end.getTime() - window.start.getTime()) / span}%`,
  });

  return (
    <div className="astro-timeline" aria-label="Timeline from local noon to the following noon">
      <div className="astro-timeline-key"><span><i className="is-astronomical" />Astronomical night</span><span><i className="is-moonless" />Moonless darkness</span></div>
      <div className="astro-timeline-track">
        {plan.astronomicalWindows.map((window) => <span className="astro-timeline-astronomical" key={window.start.toISOString()} style={barStyle(window)} />)}
        {plan.windows.map((window) => <span className="astro-timeline-moonless" key={window.start.toISOString()} style={barStyle(window)} />)}
      </div>
      <div className="astro-timeline-labels"><span>Noon · {dateLabel(plan.intervalStart, timeZone)}</span><span>Midnight</span><span>Noon · {dateLabel(plan.intervalEnd, timeZone)}</span></div>
    </div>
  );
}

export function AstronomicalDarknessTool() {
  const [location, setLocation] = useState<Coordinates>(initialLocation);
  const [placeName, setPlaceName] = useState("Los Angeles example");
  const [latitudeInput, setLatitudeInput] = useState(String(initialLocation.latitude));
  const [longitudeInput, setLongitudeInput] = useState(String(initialLocation.longitude));
  const [timeZone, setTimeZone] = useState("America/Los_Angeles");
  const [zoneIsFallback, setZoneIsFallback] = useState(false);
  const [date, setDate] = useState("");
  const [now, setNow] = useState<Date | null>(null);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [weatherMessage, setWeatherMessage] = useState("Loading cloud forecast…");
  const [locationMessage, setLocationMessage] = useState("");
  const [showLights, setShowLights] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const mapHostRef = useRef<HTMLDivElement>(null);
  const dateTouchedRef = useRef(false);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!dateTouchedRef.current) setDate(dateInZone(new Date(), timeZone));
  }, [timeZone]);

  useEffect(() => {
    const host = mapHostRef.current;
    if (!host) return;
    if (typeof IntersectionObserver === "undefined") {
      const timer = setTimeout(() => setMapReady(true), 0);
      return () => clearTimeout(timer);
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setMapReady(true);
        observer.disconnect();
      }
    }, { rootMargin: "300px" });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const params = new URLSearchParams({
        latitude: String(location.latitude),
        longitude: String(location.longitude),
        hourly: "cloud_cover",
        timeformat: "unixtime",
        timezone: "auto",
        forecast_days: "7",
      });
      setForecast(null);
      setWeatherMessage("Loading cloud forecast…");
      try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Forecast unavailable");
        const result = await response.json() as Forecast;
        if (!Array.isArray(result.hourly?.time) || !Array.isArray(result.hourly?.cloud_cover)) throw new Error("Forecast unavailable");
        if (result.timezone) {
          new Intl.DateTimeFormat("en-US", { timeZone: result.timezone });
          setTimeZone(result.timezone);
          setZoneIsFallback(false);
        }
        setForecast(result);
        setWeatherMessage("");
      } catch {
        if (!controller.signal.aborted) setWeatherMessage("Cloud forecast unavailable; astronomical times still work.");
      }
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [location.latitude, location.longitude]);

  const selectLocation = useCallback((next: Coordinates, label: string) => {
    setLocation(next);
    setPlaceName(label);
    setLatitudeInput(next.latitude.toFixed(5));
    setLongitudeInput(next.longitude.toFixed(5));
    setLocationMessage("");
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
    setZoneIsFallback(true);
  }, []);

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocationMessage("Location is unavailable in this browser. Enter coordinates or choose a point on the map.");
      return;
    }
    setLocationMessage("Finding your location…");
    navigator.geolocation.getCurrentPosition(
      (position) => selectLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }, "Your location"),
      () => setLocationMessage("Location access was not available. Enter coordinates or choose a point on the map."),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }

  function applyCoordinates(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const latitude = Number(latitudeInput);
    const longitude = Number(longitudeInput);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      setLocationMessage("Enter a latitude from −90 to 90 and longitude from −180 to 180.");
      return;
    }
    selectLocation({ latitude, longitude }, "Custom coordinates");
  }

  const plan = useMemo(() => date ? getNightPlan(date, timeZone, location) : null, [date, timeZone, location]);
  const primeWindow = plan ? bestWindow(plan) : null;
  const cloudCover = forecastCloudCover(forecast, primeWindow);
  const verdict = plan ? nightVerdict(plan, primeWindow, cloudCover) : null;
  const sky = now ? getCurrentSky(now, location) : null;
  const moonlessMinutes = plan?.windows.reduce((sum, window) => sum + window.minutes, 0) ?? 0;
  const pollutionMapUrl = `https://www.lightpollutionmap.info/#zoom=8.00&lat=${location.latitude.toFixed(4)}&lon=${location.longitude.toFixed(4)}&layers=B0FFFFFFFTFFFFFFFFFFF`;

  return (
    <div className="astro-page page-shell">
      <div className="astro-hero">
        <div className="astro-hero-copy">
          <p className="astro-eyebrow">Night photography planner</p>
          <h1>Astronomical darkness</h1>
          <p>Find the hours when the Sun is at least 18° below the horizon and the Moon is below it too. Pick a location, then plan around the real dark window.</p>
        </div>
        <div className="astro-sky-art" aria-hidden="true"><span className="astro-sky-moon" /><span className="astro-sky-horizon" /><span className="astro-sky-star star-one">✦</span><span className="astro-sky-star star-two">✧</span><span className="astro-sky-star star-three">✦</span></div>
      </div>

      <section className="astro-controls" aria-label="Location and date">
        <div className="astro-control-heading"><div><span className="astro-section-number">01 / Set the scene</span><h2>Where and when?</h2></div><button className="astro-location-button" onClick={useMyLocation} type="button">⌖ Use my location</button></div>
        <div className="astro-controls-grid">
          <div className="astro-selected-place"><span>Selected spot</span><strong>{placeName}</strong><small>{coordinateLabel(location)}</small></div>
          <label className="astro-date-field">Night of<input aria-label="Night of" onChange={(event) => { dateTouchedRef.current = true; setDate(event.target.value); }} type="date" value={date} /></label>
          <div className="astro-selected-place"><span>Local time</span><strong>{now ? new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" }).format(now) : "—"}</strong><small>{timeZone.replace(/_/g, " ")}{zoneIsFallback ? " · device time zone until location lookup succeeds" : ""}</small></div>
        </div>
        {locationMessage && <p className="astro-inline-message" role="status">{locationMessage}</p>}
      </section>

      {plan && verdict && <>
        <section className="astro-result" aria-label="Tonight's darkness assessment">
          <div className="astro-result-main"><span className="astro-section-number">02 / Best window</span><p className="astro-result-status" data-tone={verdict.tone}>{verdict.title}</p><h2>{primeWindow ? <>{timeLabel(primeWindow.start, timeZone)} <span>→</span> {timeLabel(primeWindow.end, timeZone)}</> : "No moonless window"}</h2><p>{verdict.detail}</p><div className="astro-result-meta"><span>{primeWindow ? dateLabel(primeWindow.start, timeZone) : dateLabel(plan.intervalStart, timeZone)}</span><span>{primeWindow ? `${durationLabel(primeWindow.minutes)} longest stretch` : `${durationLabel(plan.astronomicalMinutes)} astronomical night`}</span></div></div>
          <div className="astro-result-stats"><div><span>Moonless darkness</span><strong>{durationLabel(moonlessMinutes)}</strong><small>Across tonight</small></div><div><span>Moon illumination</span><strong>{Math.round(plan.moonIllumination * 100)}%</strong><small>{plan.moonPhase}</small></div><div><span>Cloud forecast</span><strong>{cloudCover === null ? "—" : `${cloudCover}%`}</strong><small>{cloudCover === null ? weatherMessage || "Outside forecast range" : "Average near best window"}</small></div></div>
        </section>

        <section className="astro-timing" aria-label="Night timeline and sky events">
          <div className="astro-section-heading"><span className="astro-section-number">03 / Timing</span><h2>From sunset to dawn</h2><p>Times are shown in {timeZone.replace(/_/g, " ")}.</p></div>
          <Timeline plan={plan} timeZone={timeZone} />
          <div className="astro-events"><div><span>Sunset</span><strong>{timeLabel(plan.sunset, timeZone)}</strong></div><div><span>Civil twilight ends</span><strong>{timeLabel(plan.civilDusk, timeZone)}</strong></div><div><span>Nautical twilight ends</span><strong>{timeLabel(plan.nauticalDusk, timeZone)}</strong></div><div><span>Astronomical dusk</span><strong>{timeLabel(plan.astronomicalDusk, timeZone)}</strong></div><div><span>Astronomical dawn</span><strong>{timeLabel(plan.astronomicalDawn, timeZone)}</strong></div><div><span>Sunrise</span><strong>{timeLabel(plan.sunrise, timeZone)}</strong></div><div><span>{eventLabel("Moonrise", plan.moonrise, plan, timeZone)}</span><strong>{timeLabel(plan.moonrise, timeZone)}</strong></div><div><span>{eventLabel("Moonset", plan.moonset, plan, timeZone)}</span><strong>{timeLabel(plan.moonset, timeZone)}</strong></div></div>
          <p className="astro-timing-note">{sky ? `Right now: Sun ${sky.sunAltitude.toFixed(1)}°, Moon ${sky.moonAltitude.toFixed(1)}° above the horizon.` : ""} Rise and set times assume a clear, flat horizon. Mountains, buildings and weather can change what you see.</p>
          {plan.windows.length > 1 && <div className="astro-extra-windows"><strong>All moonless stretches</strong>{plan.windows.map((window) => <span key={window.start.toISOString()}>{timeLabel(window.start, timeZone)}–{timeLabel(window.end, timeZone)} · {durationLabel(window.minutes)}</span>)}</div>}
        </section>
      </>}

      <section className="astro-map-section" aria-label="Night lights map">
        <div className="astro-section-heading"><span className="astro-section-number">04 / Scout the site</span><h2>Find a darker place</h2><p>Tap the map to move the pin. The satellite layer shows artificial lights recorded from space; it does not measure the brightness of your sky.</p></div>
        <div className="astro-map-toolbar"><label><input checked={showLights} onChange={(event) => setShowLights(event.target.checked)} type="checkbox" /> Show NASA night lights</label><span>VIIRS CityLights · 2012 reference imagery</span></div>
        <div className="astro-map-frame" ref={mapHostRef}>{mapReady ? <DarknessMap location={location} onSelect={(next) => selectLocation(next, "Map selection")} showLights={showLights} /> : <div className="astro-map astro-map-loading">Map loads as you scroll here…</div>}</div>
        <div className="astro-map-below"><form className="astro-coordinate-form" onSubmit={applyCoordinates}><label>Latitude<input inputMode="decimal" onChange={(event) => setLatitudeInput(event.target.value)} type="number" min="-90" max="90" step="any" value={latitudeInput} /></label><label>Longitude<input inputMode="decimal" onChange={(event) => setLongitudeInput(event.target.value)} type="number" min="-180" max="180" step="any" value={longitudeInput} /></label><button type="submit">Go to coordinates</button></form><div className="astro-site-check"><strong>Light pollution check</strong><p>A low-light patch in the satellite image is only a starting point. Check modeled sky brightness and nearby light domes before calling a site suitable for Milky Way photography.</p><a href={pollutionMapUrl} rel="noopener noreferrer" target="_blank">Inspect this spot on Light Pollution Map ↗</a></div></div>
      </section>

      <p className="astro-sources">Astronomical positions: <a href="https://github.com/mourner/suncalc" rel="noopener noreferrer" target="_blank">SunCalc</a>. Cloud forecast and location time zone: <a href="https://open-meteo.com/en/docs" rel="noopener noreferrer" target="_blank">Open-Meteo</a>. Map: <a href="https://www.openstreetmap.org/" rel="noopener noreferrer" target="_blank">OpenStreetMap</a> and <a href="https://visibleearth.nasa.gov/images/79765/night-lights-2012-map" rel="noopener noreferrer" target="_blank">NASA VIIRS CityLights</a>. Night-lights imagery is historical and not a Bortle or SQM reading. Selected coordinates are sent to forecast and map providers to load their data.</p>
    </div>
  );
}
