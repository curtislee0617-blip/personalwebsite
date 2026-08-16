/**
 * /command-center — a private morning dashboard, sized for a phone.
 *
 * Everything is fetched server-side, so no API key or OAuth token is ever sent
 * to the browser. Rendered fresh on each request. Access is gated in proxy.ts.
 */

import { listEvents, listRecentFiles, type CalEvent } from "@/lib/command-center/google";
import { listDeployments } from "@/lib/command-center/vercel";
import { buildTrip, bearing, compass, type Stop, type Trip } from "@/lib/command-center/trip";
import AutoRefresh from "./AutoRefresh";
import TripMap from "./TripMap";
import "./command-center.css";

// TripMap is a client component and only touches maplibre inside useEffect, so
// it server-renders safely as an empty div. (`next/dynamic` with `ssr: false`
// is not allowed in a Server Component — it throws at build time.)

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Command Center",
  manifest: "/command-center.webmanifest",
  // Keeps the standalone home-screen launch; themeColor lives on `viewport`
  // rather than `metadata`, which is what this version of Next expects.
  appleWebApp: { capable: true, title: "Command Center" },
};

export const viewport = { themeColor: "#d65b7a" };

const TZ = "Asia/Hong_Kong";
const fmt = (d: Date, o: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-GB", { ...o, timeZone: TZ }).format(d);
const hhmm = (d: Date) => fmt(d, { hour: "2-digit", minute: "2-digit", hour12: false });

/** Settled results only — one dead connector shouldn't blank the whole page. */
async function safe<T>(p: Promise<T>, fallback: T): Promise<[T, string | null]> {
  try {
    return [await p, null];
  } catch (e) {
    return [fallback, e instanceof Error ? e.message : String(e)];
  }
}

export default async function CommandCenter() {
  const now = new Date();
  const [[weekEvents, calErr], [files, driveErr], [deploys, vercelErr], [tripEvents]] =
    await Promise.all([
      safe(listEvents(now.toISOString(), new Date(+now + 7 * 864e5).toISOString(), 60), [] as CalEvent[]),
      safe(listRecentFiles(10), []),
      safe(listDeployments(6), []),
      safe(listEvents(new Date(+now - 2 * 864e5).toISOString(), new Date(+now + 120 * 864e5).toISOString(), 200), [] as CalEvent[]),
    ]);

  const [trip] = await safe(buildTrip(tripEvents), null);

  const hr = Number(fmt(now, { hour: "2-digit", hour12: false }));
  const greeting = hr < 5 ? "Late night" : hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening";

  const todayKey = fmt(now, { day: "2-digit", month: "2-digit", year: "numeric" });
  const parsed = weekEvents
    .map((e) => ({ e, s: new Date(e.start?.dateTime ?? e.start?.date ?? 0) }))
    .filter((r) => !isNaN(+r.s));
  const today = parsed.filter((r) => fmt(r.s, { day: "2-digit", month: "2-digit", year: "numeric" }) === todayKey);
  const next = parsed.find((r) => +r.s > +now);

  const mapStops = (trip?.stops ?? [])
    .filter((s) => s.place)
    .map((s) => ({ pin: s.pin, label: s.place!.label, lat: s.place!.lat, lon: s.place!.lon, isHome: s.isHome }));

  return (
    <main className="cc">
      <AutoRefresh />
      <header className="cc-head">
        <h1>{greeting}, Curtis</h1>
        <p>
          {fmt(now, { weekday: "long", day: "numeric", month: "long" })} · {hhmm(now)} HKT
        </p>
      </header>

      <section className="cc-kpis">
        <Kpi label="Today" value={String(today.length)} meta={today.length ? `${today.filter((r) => +r.s > +now).length} still ahead` : "Nothing scheduled"} />
        <Kpi label="Up next" value={next ? hhmm(next.s) : "—"} meta={next?.e.summary ?? "Clear for 7 days"} />
        <Kpi label="Trip" value={trip ? `${trip.days}d` : "—"} meta={trip ? trip.destination : "No trip booked"} />
        <Kpi label="Last deploy" value={deploys[0]?.state ?? "—"} meta={deploys[0]?.project ?? ""} />
      </section>

      {trip && (
        <section className="cc-card">
          <h2>
            Trip map <span>{trip.destination} · {trip.days} days{trip.tripCount > 1 ? ` · ${trip.tripCount} trips on the books` : ""}</span>
          </h2>
          <TripMap stops={mapStops} />
          <ol className="cc-stops">
            {trip.stops.map((s) => <StopRow key={s.id} stop={s} trip={trip} />)}
          </ol>
          <p className="cc-evidence">
            <b>Method.</b> Arcs are true great circles rendered by deck.gl over TomTom tiles.
            Ground hops use TomTom road routing with live traffic; legs with no road route fall
            back to great-circle distance, labelled <i>direct</i>. Places come from calendar
            locations, matched against a curated list first, then TomTom POI search.
          </p>
        </section>
      )}

      <div className="cc-grid">
        <section className="cc-card">
          <h2>Schedule <span>next 7 days</span></h2>
          {calErr ? <Err msg={calErr} /> : (
            <ul className="cc-rows">
              {parsed.map(({ e, s }) => (
                <li key={e.id}>
                  <time>{fmt(s, { weekday: "short", day: "numeric" })} {hhmm(s)}</time>
                  <a href={e.htmlLink} target="_blank" rel="noopener">{e.summary ?? "(untitled)"}</a>
                </li>
              ))}
              {!parsed.length && <li className="cc-muted">Nothing scheduled.</li>}
            </ul>
          )}
        </section>

        <section className="cc-card">
          <h2>Recent files</h2>
          {driveErr ? <Err msg={driveErr} /> : (
            <ul className="cc-rows">
              {files.map((f) => (
                <li key={f.id}>
                  <time>{fmt(new Date(f.modifiedTime), { day: "numeric", month: "short" })}</time>
                  <a href={f.webViewLink} target="_blank" rel="noopener">{f.name}</a>
                </li>
              ))}
              {!files.length && <li className="cc-muted">Nothing recent.</li>}
            </ul>
          )}
        </section>

        <section className="cc-card">
          <h2>Deployments</h2>
          {vercelErr ? <Err msg={vercelErr} /> : (
            <ul className="cc-rows">
              {deploys.map((d) => (
                <li key={d.uid}>
                  <span className={`cc-pill ${d.state === "READY" ? "is-ok" : d.state === "ERROR" ? "is-bad" : "is-warn"}`}>
                    {d.state}
                  </span>
                  <a href={d.inspectorUrl} target="_blank" rel="noopener">
                    {(d.meta?.githubCommitMessage ?? d.name).split("\n")[0]}
                  </a>
                </li>
              ))}
              {!deploys.length && <li className="cc-muted">No deployments found.</li>}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function Kpi({ label, value, meta }: { label: string; value: string; meta: string }) {
  return (
    <div className="cc-kpi">
      <span className="cc-k-label">{label}</span>
      <strong>{value}</strong>
      <span className="cc-k-meta">{meta}</span>
    </div>
  );
}

function Err({ msg }: { msg: string }) {
  return <p className="cc-err">Couldn&apos;t load: {msg}</p>;
}

function StopRow({ stop, trip }: { stop: Stop; trip: Trip }) {
  const idx = trip.stops.indexOf(stop);
  const prev = trip.stops.slice(0, idx).reverse().find((s) => s.place);
  let hop: string | null = null;
  if (stop.road) {
    hop = `${stop.road.km.toFixed(1)} km · ${stop.road.min} min drive${stop.road.delayMin > 0 ? ` (+${stop.road.delayMin} traffic)` : ""}`;
  } else if (stop.gcKm && stop.gcKm > 0.3 && prev?.place && stop.place) {
    const km = stop.gcKm;
    hop = `${km >= 100 ? Math.round(km).toLocaleString() : km.toFixed(1)} km ${compass(bearing(prev.place, stop.place))} direct`;
  }

  return (
    <li className={stop.isHome ? "cc-stop is-home" : "cc-stop"}>
      <span className="cc-n">{stop.pin || "–"}</span>
      <div>
        <strong>{stop.title}</strong>
        <span className="cc-w">
          {fmt(stop.when, { day: "numeric", month: "short" })}, {hhmm(stop.when)}
          {stop.place ? (
            <>
              {" · "}
              <a href={`https://www.google.com/maps/search/?api=1&query=${stop.place.lat},${stop.place.lon}`} target="_blank" rel="noopener">
                {stop.place.label}
              </a>
              {stop.viaTomTom && <em className="cc-src">TomTom</em>}
            </>
          ) : " · location not mapped"}
          {hop && <> · <span className="cc-hop">{hop}</span></>}
        </span>
      </div>
    </li>
  );
}
