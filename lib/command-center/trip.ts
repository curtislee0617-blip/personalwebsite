/**
 * Turning calendar events into a trip: resolve locations, split into distinct
 * trips, and attach real road routing to the hops that have roads.
 *
 * Ported from the Cowork artifact, with the hand-rolled great-circle maths kept
 * (it's a few lines and avoids pulling Turf server-side) but geocoding and
 * routing now delegated to TomTom.
 */

import type { CalEvent } from "./google";
import { search, route, type Place, type Road } from "./tomtom";

export const HOME = { name: "Hong Kong", lat: 22.3193, lon: 114.1694 };
const AWAY_KM = 250;

/** Curated first — faster, free, and verified. TomTom fills the gaps. */
const GAZETTEER: { re: RegExp; lat: number; lon: number; label: string }[] = [
  { re: /hong kong international|HKG\b|chek lap kok/i, lat: 22.315185, lon: 113.932433, label: "HKG · Terminal 1" },
  { re: /tan son nhat|SGN\b/i, lat: 10.815871, lon: 106.664277, label: "SGN · Tan Son Nhat" },
  { re: /fusion suites saigon/i, lat: 10.772441, lon: 106.690018, label: "Fusion Suites Sai Gon" },
  { re: /ho chi minh|saigon|sài gòn/i, lat: 10.7769, lon: 106.7009, label: "Ho Chi Minh City" },
  { re: /hong kong/i, lat: 22.3193, lon: 114.1694, label: "Hong Kong" },
];

export function haversine(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function bearing(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const rad = Math.PI / 180;
  const p1 = a.lat * rad, p2 = b.lat * rad, dl = (b.lon - a.lon) * rad;
  const y = Math.sin(dl) * Math.cos(p2);
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

const COMPASS = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
export const compass = (b: number) => COMPASS[Math.round(b / 22.5) % 16];

export type Stop = {
  id: string;
  title: string;
  when: Date;
  place: Place | null;
  viaTomTom: boolean;
  isHome: boolean;
  pin: number;
  gcKm?: number;
  road?: Road | null;
  htmlLink?: string;
};

export type Trip = {
  stops: Stop[];
  start: Date;
  end: Date;
  destination: string;
  days: number;
  tripCount: number;
};

function local(text: string | undefined): Place | null {
  if (!text) return null;
  for (const g of GAZETTEER) {
    if (g.re.test(text)) return { lat: g.lat, lon: g.lon, label: g.label, source: "tomtom" };
  }
  return null;
}

export async function buildTrip(events: CalEvent[]): Promise<Trip | null> {
  const rows = events
    .map((e) => {
      const iso = e.start?.dateTime ?? e.start?.date;
      if (!iso) return null;
      const when = new Date(iso);
      if (isNaN(+when)) return null;
      const place = local(e.location) ?? local(e.summary);
      return { e, when, place, hasLoc: Boolean(e.location?.trim()), viaTomTom: false };
    })
    .filter(Boolean) as { e: CalEvent; when: Date; place: Place | null; hasLoc: boolean; viaTomTom: boolean }[];

  // Resolve unknowns through TomTom, deduped and capped.
  const unresolved = [...new Set(rows.filter((r) => !r.place && r.hasLoc).map((r) => r.e.location!.trim()))].slice(0, 12);
  const found = new Map<string, Place | null>();
  await Promise.all(unresolved.map(async (q) => found.set(q, await search(q))));
  for (const r of rows) {
    if (!r.place && r.hasLoc) {
      const hit = found.get(r.e.location!.trim());
      if (hit) { r.place = hit; r.viaTomTom = true; }
    }
  }

  const away = rows.filter((r) => r.place && haversine(r.place, HOME) > AWAY_KM);
  if (!away.length) return null;

  // Split into trips: a gap over 2 days or a jump over 2,000 km starts a new
  // one, so a Saigon hotel and a Chicago connection don't become one trip.
  const trips: (typeof away)[] = [];
  let cur: typeof away = [];
  for (const r of away) {
    if (cur.length) {
      const last = cur[cur.length - 1];
      const gapDays = (+r.when - +last.when) / 864e5;
      const jumpKm = haversine(last.place!, r.place!);
      if (gapDays > 2 || jumpKm > 2000) { trips.push(cur); cur = []; }
    }
    cur.push(r);
  }
  if (cur.length) trips.push(cur);

  const now = Date.now();
  const chosen = trips.find((t) => +t[t.length - 1].when + 864e5 >= now) ?? trips[trips.length - 1];
  const start = chosen[0].when, end = chosen[chosen.length - 1].when;

  // Include anything located in the 36h before departure — that's the outbound
  // flight, which leaves from home and so never counts as "away".
  const picked = rows.filter(
    (r) => (r.place || r.hasLoc) && +r.when >= +start - 1.5 * 864e5 && +r.when <= +end + 0.5 * 864e5
  );

  let pin = 0;
  const stops: Stop[] = picked.map((r) => ({
    id: r.e.id,
    title: r.e.summary ?? "(untitled)",
    when: r.when,
    place: r.place,
    viaTomTom: r.viaTomTom,
    isHome: r.place ? haversine(r.place, HOME) <= AWAY_KM : false,
    pin: r.place ? ++pin : 0,
    htmlLink: r.e.htmlLink,
  }));

  // Great-circle for every hop; real road routing where a road plausibly exists.
  let prev: Stop | null = null;
  for (const s of stops) {
    if (s.place && prev?.place) s.gcKm = haversine(prev.place, s.place);
    if (s.place) prev = s;
  }
  const drivable = stops.filter((s) => s.gcKm != null && s.gcKm > 0.3 && s.gcKm < 300).slice(0, 8);
  await Promise.all(
    drivable.map(async (s) => {
      const before = stops.slice(0, stops.indexOf(s)).reverse().find((x) => x.place);
      if (before?.place && s.place) s.road = await route(before.place, s.place);
    })
  );

  return {
    stops,
    start,
    end,
    destination: chosen[chosen.length - 1].place!.label.split("·").pop()!.trim(),
    days: Math.round((+end - +start) / 864e5) + 1,
    tripCount: trips.length,
  };
}
