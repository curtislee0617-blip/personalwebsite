"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { dateInZone, getCurrentSky, getNightPlan, type Coordinates, type DarkWindow, type NightPlan } from "@/lib/astronomical-darkness";
import { LightPollutionReadout, useLightPollution } from "@/components/light-pollution-readout";
import { earthLighting } from "@/lib/earth-lighting";
import { pollutionAssessment } from "@/lib/light-pollution";
import { usePinnedSkyLocation } from "@/components/use-pinned-sky-location";
import { skyLocations } from "@/lib/sky-locations";
import { globeForecastUrl, type GlobeForecast as Forecast } from "@/lib/globe-weather";

const DarknessMap = dynamic(
  () => import("@/components/astronomical-darkness-map").then((module) => module.AstronomicalDarknessMap),
  { ssr: false, loading: () => <div className="astro-map astro-map-loading">Preparing night-lights map…</div> },
);

const EarthExplorer = dynamic(
  () => import("@/components/astronomical-earth").then(module => module.AstronomicalEarth),
  { ssr: false, loading: () => <div className="astro-earth-loading">Preparing your view of Earth…</div> },
);

const initialLocation = skyLocations.losAngeles;

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
  const inside = values.filter((value, index): value is number => typeof value === "number" && Number.isFinite(value)
    && times[index] * 1000 >= start - 30 * 60_000
    && times[index] * 1000 <= end + 30 * 60_000);
  if (inside.length) return Math.round(inside.reduce((sum, value) => sum + value, 0) / inside.length);
  const middle = (start + end) / 2;
  const closest = times.reduce((best, time, index) =>
    Math.abs(time * 1000 - middle) < Math.abs(times[best] * 1000 - middle) ? index : best, 0);
  const nearest = values[closest];
  return typeof nearest === "number" && Number.isFinite(nearest) && Math.abs(times[closest] * 1000 - middle) <= 90 * 60_000 ? Math.round(nearest) : null;
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
  const { spot: pinnedSpot, ready: presenceReady } = usePinnedSkyLocation();
  const locationTouchedRef = useRef(false);
  const [location, setLocation] = useState<Coordinates>(initialLocation);
  const [placeName, setPlaceName] = useState("Los Angeles");
  const pollution = useLightPollution(location);
  const [latitudeInput, setLatitudeInput] = useState(String(initialLocation.latitude));
  const [longitudeInput, setLongitudeInput] = useState(String(initialLocation.longitude));
  const [timeZone, setTimeZone] = useState("America/Los_Angeles");
  const [zoneIsFallback, setZoneIsFallback] = useState(false);
  const [date, setDate] = useState("");
  const [now, setNow] = useState<Date | null>(null);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [weatherMessage, setWeatherMessage] = useState("Loading cloud forecast…");
  const [locationMessage, setLocationMessage] = useState("");
  const [locationPrompt, setLocationPrompt] = useState(true);
  const [locating, setLocating] = useState(false);
  const [showLights, setShowLights] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const mapHostRef = useRef<HTMLDivElement>(null);
  const dateTouchedRef = useRef(false);

  useEffect(() => {
    // Follow the pixel-art pin until a visitor chooses their own observing spot.
    if (!presenceReady || locationTouchedRef.current) return;
    setLocation(pinnedSpot);
    setPlaceName(pinnedSpot.name);
    setLatitudeInput(String(pinnedSpot.latitude));
    setLongitudeInput(String(pinnedSpot.longitude));
    setTimeZone(pinnedSpot.timeZone);
    setZoneIsFallback(false);
  }, [pinnedSpot, presenceReady]);

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
      setForecast(null);
      setWeatherMessage("Loading cloud forecast…");
      try {
        const response = await fetch(globeForecastUrl(location.latitude, location.longitude), { signal: controller.signal });
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
    locationTouchedRef.current = true;
    setLocation(next);
    setPlaceName(label);
    setLatitudeInput(next.latitude.toFixed(5));
    setLongitudeInput(next.longitude.toFixed(5));
    setLocationMessage("");
    setLocationPrompt(false);
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
    setZoneIsFallback(true);
  }, []);

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocationMessage("Location is unavailable in this browser. Enter coordinates or choose a point on the map.");
      return;
    }
    setLocationMessage("Finding your location…");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => { setLocating(false); selectLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }, "Your location"); },
      (error) => { setLocating(false); setLocationMessage(error.code === 1 ? "Location permission was declined. You can still choose a point on the map or enter coordinates below." : "Your location could not be found. Try again, choose a point on the map, or enter coordinates below."); },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }

  function applyCoordinates(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const latitude = Number(latitudeInput);
    const longitude = Number(longitudeInput);
    if (!latitudeInput.trim() || !longitudeInput.trim() || !Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
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
  const currentPlan = useMemo(() => now ? getNightPlan(dateInZone(now, timeZone), timeZone, location) : null, [now, timeZone, location]);
  const currentCloud = now ? forecastCloudCover(forecast, { start: new Date(now.getTime() - 1800000), end: new Date(now.getTime() + 1800000), minutes: 60 }) : null;
  const currentCondition = !sky ? "Checking the sky…" : sky.sunAltitude >= 0 ? "Daylight" : sky.sunAltitude >= -6 ? "Civil twilight" : sky.sunAltitude >= -12 ? "Nautical twilight" : sky.sunAltitude >= -18 ? "Astronomical twilight" : sky.moonAltitude >= 0 ? "Moonlit night" : "Moonless darkness";
  const moonlessMinutes = plan?.windows.reduce((sum, window) => sum + window.minutes, 0) ?? 0;
  const pollutionMapUrl = `https://www.lightpollutionmap.info/#zoom=8.00&lat=${location.latitude.toFixed(4)}&lon=${location.longitude.toFixed(4)}&layers=B0FFFFFFFTFFFFFFFFFFF`;

  return (
    <div className="astro-page page-shell">
      <header className="astro-page-heading">
        <p className="astro-eyebrow">Night photography / Earth observatory</p>
        <h1>Astronomical darkness</h1>
        <p>Follow the light around Earth, then find your next moonless night.</p>
      </header>
      <section className="astro-current" aria-label={`Current conditions in ${placeName}`}>
        <div className="astro-current-place"><span>● Current sky · {placeName}</span><h2>{currentCondition}</h2><p>{now ? `${dateLabel(now, timeZone)} · ${timeLabel(now, timeZone)}` : "Loading local time…"}</p></div>
        <dl><div><dt>Sunset today</dt><dd>{timeLabel(currentPlan?.sunset ?? null, timeZone)}</dd></div><div><dt>Darkness begins</dt><dd>{timeLabel(currentPlan?.astronomicalDusk ?? null, timeZone)}</dd></div><div><dt>Moon illuminated now</dt><dd>{now ? `${Math.round(earthLighting(now).moonFraction * 100)}%` : "—"}</dd></div><div><dt>Clouds · hourly forecast</dt><dd>{currentCloud === null ? "Unavailable" : `${currentCloud}%`}</dd></div></dl>
      </section>
      {date && <EarthExplorer key={`${date}:${timeZone}`} date={date} location={location} timeZone={timeZone} forecast={forecast} onToday={() => { dateTouchedRef.current = false; setDate(dateInZone(new Date(), timeZone)); }} />}

      <section className="astro-controls" aria-label="Location and date">
        <div className="astro-control-heading"><div><span className="astro-section-number">02 / Set the scene</span><h2>Where and when?</h2></div><button className="astro-location-button" disabled={locating} onClick={useMyLocation} type="button">{locating ? "Locating…" : "⌖ Use my location"}</button></div>
        {locationPrompt && <div className="astro-location-prompt"><div><strong>Find the darkness where you are.</strong><p>Use your location to see local skyglow, your dark window, and your spot on Earth. Your browser will ask permission. Coordinates are used for weather and map lookups.</p></div><div><button disabled={locating} type="button" onClick={useMyLocation}>{locating ? "Locating…" : "Enable location"}</button><a href="#astro-scout" onClick={() => setLocationPrompt(false)}>Choose on map</a><button type="button" className="astro-location-skip" onClick={() => setLocationPrompt(false)}>Keep {placeName}</button></div></div>}
        <div className="astro-controls-grid">
          <div className="astro-selected-place"><span>Selected spot</span><strong>{placeName}</strong><small>{coordinateLabel(location)}</small></div>
          <label className="astro-date-field">Night of<input aria-label="Night of" onChange={(event) => { dateTouchedRef.current = true; setDate(event.target.value); }} type="date" value={date} /></label>
          <div className="astro-selected-place"><span>Local time</span><strong>{now ? new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" }).format(now) : "—"}</strong><small>{timeZone.replace(/_/g, " ")}{zoneIsFallback ? " · device time zone until location lookup succeeds" : ""}</small></div>
        </div>
        {locationMessage && <p className="astro-inline-message" role="status">{locationMessage}</p>}
      </section>

      <LightPollutionReadout reading={pollution} placeName={placeName} />


      {plan && verdict && <>
        <section className="astro-result" aria-label="Tonight's darkness assessment">
          <div className="astro-result-main"><span className="astro-section-number">03 / Best window</span><p className="astro-result-status" data-tone={verdict.tone}>{verdict.title}</p><h2>{primeWindow ? <>{timeLabel(primeWindow.start, timeZone)} <span>→</span> {timeLabel(primeWindow.end, timeZone)}</> : "No moonless window"}</h2><p>{verdict.detail}</p><div className="astro-result-meta"><span>{primeWindow ? dateLabel(primeWindow.start, timeZone) : dateLabel(plan.intervalStart, timeZone)}</span><span>{primeWindow ? `${durationLabel(primeWindow.minutes)} longest stretch` : `${durationLabel(plan.astronomicalMinutes)} astronomical night`}</span></div></div>
          <div className="astro-result-stats"><div><span>Moonless darkness</span><strong>{durationLabel(moonlessMinutes)}</strong><small>Across tonight</small></div><div><span>Moon illumination</span><strong>{Math.round(plan.moonIllumination * 100)}%</strong><small>{plan.moonPhase}</small></div><div><span>Cloud forecast</span><strong>{cloudCover === null ? "—" : `${cloudCover}%`}</strong><small>{cloudCover === null ? weatherMessage || "Outside forecast range" : "Average near best window"}</small></div></div>
        </section>

        <section className="astro-timing" aria-label="Night timeline and sky events">
          <div className="astro-section-heading"><span className="astro-section-number">04 / Timing</span><h2>From sunset to dawn</h2><p>Times are shown in {timeZone.replace(/_/g, " ")}.</p></div>
          <Timeline plan={plan} timeZone={timeZone} />
          <div className="astro-events"><div><span>Sunset</span><strong>{timeLabel(plan.sunset, timeZone)}</strong></div><div><span>Civil twilight ends</span><strong>{timeLabel(plan.civilDusk, timeZone)}</strong></div><div><span>Nautical twilight ends</span><strong>{timeLabel(plan.nauticalDusk, timeZone)}</strong></div><div><span>Astronomical dusk</span><strong>{timeLabel(plan.astronomicalDusk, timeZone)}</strong></div><div><span>Astronomical dawn</span><strong>{timeLabel(plan.astronomicalDawn, timeZone)}</strong></div><div><span>Sunrise</span><strong>{timeLabel(plan.sunrise, timeZone)}</strong></div><div><span>{eventLabel("Moonrise", plan.moonrise, plan, timeZone)}</span><strong>{timeLabel(plan.moonrise, timeZone)}</strong></div><div><span>{eventLabel("Moonset", plan.moonset, plan, timeZone)}</span><strong>{timeLabel(plan.moonset, timeZone)}</strong></div></div>
          <p className="astro-timing-note">{sky ? `Right now: Sun ${sky.sunAltitude.toFixed(1)}°, Moon ${sky.moonAltitude.toFixed(1)}° above the horizon.` : ""} Rise and set times assume a clear, flat horizon. Mountains, buildings and weather can change what you see.</p>
          {plan.windows.length > 1 && <div className="astro-extra-windows"><strong>All moonless stretches</strong>{plan.windows.map((window) => <span key={window.start.toISOString()}>{timeLabel(window.start, timeZone)}–{timeLabel(window.end, timeZone)} · {durationLabel(window.minutes)}</span>)}</div>}
        </section>
      </>}

      <section className="astro-map-section" aria-label="Light pollution map" id="astro-scout">
        <div className="astro-section-heading"><span className="astro-section-number">05 / Scout the site</span><h2>Find a darker place</h2><p>Tap the map to move your pin and update the local skyglow reading and Earth view. Cooler colors mark darker skies; yellow, red, and white mark more artificial skyglow.</p></div>
        <div className="astro-map-toolbar"><label><input checked={showLights} onChange={(event) => setShowLights(event.target.checked)} type="checkbox" /> Show light pollution</label><span>David Lorenz · 2025 skyglow model</span></div>
        <div className="astro-map-frame" ref={mapHostRef}>{mapReady ? <DarknessMap location={location} onSelect={(next) => selectLocation(next, "Map selection")} showLights={showLights} /> : <div className="astro-map astro-map-loading">Map loads as you scroll here…</div>}</div>
        <div className="astro-pollution-legend"><span>Darker sky</span><i /><span>Brighter sky</span></div><div className="astro-map-below"><form className="astro-coordinate-form" onSubmit={applyCoordinates}><label>Latitude<input inputMode="decimal" onChange={(event) => setLatitudeInput(event.target.value)} type="number" min="-90" max="90" step="any" value={latitudeInput} /></label><label>Longitude<input inputMode="decimal" onChange={(event) => setLongitudeInput(event.target.value)} type="number" min="-180" max="180" step="any" value={longitudeInput} /></label><button type="submit">Go to coordinates</button></form><div className="astro-site-check"><strong>Light pollution at this pin</strong>{pollution.status === "ok" ? <p className="astro-map-reading"><strong>{pollution.magnitude.toFixed(2)} mag/arcsec²</strong> · {pollutionAssessment(pollution.ratio).label}</p> : <p role="status">{pollution.status === "loading" ? "Checking skyglow…" : pollution.status === "outside-coverage" ? "Outside atlas coverage (65°S–75°N)." : "Atlas reading unavailable."}</p>}<p>The local reading estimates clear, moonless sky brightness directly overhead. Nearby light domes and weather can still affect the horizon. Compare this location with Light Pollution Map before traveling.</p><a href={pollutionMapUrl} rel="noopener noreferrer" target="_blank">Inspect this spot on Light Pollution Map ↗</a></div></div>
      </section>

      <p className="astro-sources">Astronomical positions: <a href="https://github.com/mourner/suncalc" rel="noopener noreferrer" target="_blank">SunCalc</a>. Cloud forecast and location time zone: <a href="https://open-meteo.com/en/docs" rel="noopener noreferrer" target="_blank">Open-Meteo</a>. Map: <a href="https://www.openstreetmap.org/" rel="noopener noreferrer" target="_blank">OpenStreetMap</a> and <a href="https://djlorenz.github.io/astronomy/lp/" rel="noopener noreferrer" target="_blank">David Lorenz’s 2025 Light Pollution Atlas</a> (VIIRS inputs, modeled skyglow). Globe positions: <a href="https://github.com/cosinekitty/astronomy" rel="noopener noreferrer" target="_blank">Astronomy Engine (MIT)</a>. Earth imagery: <a href="https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-map/" rel="noopener noreferrer" target="_blank">NASA Blue Marble</a> and <a href="https://science.nasa.gov/earth/earth-observatory/earth-at-night/maps/" rel="noopener noreferrer" target="_blank">NASA Black Marble</a>. Interaction inspired by <a href="https://ciechanow.ski/earth-and-sun/" rel="noopener noreferrer" target="_blank">Bartosz Ciechanowski’s Earth and Sun</a>. Selected coordinates are used for weather, time-zone, map, and skyglow lookups; the atlas is historical, not a live sky measurement.</p>
    </div>
  );
}
