/**
 * TomTom search + routing, server-side only (the key never reaches the browser;
 * map tiles go through /api/tiles instead).
 *
 * Learned the hard way in testing: the strict /geocode endpoint mis-resolves
 * named venues — it put a District 1 hotel ~9 km away by reading "3-5 Sương
 * Nguyệt Ánh" as a street number. POI search is the right endpoint. But POI
 * search alone will happily return a hotel *named after* an airport, so
 * airport-shaped queries get a category filter.
 */

const BASE = "https://api.tomtom.com";

function key(): string {
  const k = process.env.TOMTOM_API_KEY;
  if (!k) throw new Error("Missing TOMTOM_API_KEY");
  return k;
}

export type Place = { lat: number; lon: number; label: string; source: "tomtom" };

const AIRPORTY = /\bairport\b|\bintl\b|\bterminal\b|\([A-Z]{3}\)|\b(?:HKG|SGN|LHR|JFK|LAX|SIN|NRT|ICN|BKK)\b/i;

export async function search(query: string): Promise<Place | null> {
  const qs = new URLSearchParams({ key: key(), limit: "1", idxSet: "POI,PAD,Str,Geo" });
  if (AIRPORTY.test(query)) qs.set("categorySet", "7383"); // 7383 = airport
  const url = `${BASE}/search/2/search/${encodeURIComponent(query.slice(0, 120))}.json?${qs}`;

  try {
    const res = await fetch(url, { next: { revalidate: 86_400 } }); // places rarely move
    if (!res.ok) return null;
    const json = await res.json();
    const r = json?.results?.[0];
    if (!r?.position) return null;
    return {
      lat: r.position.lat,
      lon: r.position.lon,
      label: r.poi?.name ?? r.address?.freeformAddress ?? query,
      source: "tomtom",
    };
  } catch {
    return null;
  }
}

export type Road = { km: number; min: number; delayMin: number };

export async function route(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number }
): Promise<Road | null> {
  const qs = new URLSearchParams({
    key: key(),
    traffic: "true",
    routeType: "fast",
    travelMode: "car",
    routeRepresentation: "summaryOnly",
  });
  const path = `${a.lat},${a.lon}:${b.lat},${b.lon}`;
  try {
    const res = await fetch(`${BASE}/routing/1/calculateRoute/${path}/json?${qs}`, {
      next: { revalidate: 300 }, // traffic moves; 5 min is plenty for a dashboard
    });
    if (!res.ok) return null;
    const json = await res.json();
    const s = json?.routes?.[0]?.summary;
    if (!s?.lengthInMeters) return null;
    return {
      km: s.lengthInMeters / 1000,
      min: Math.round(s.travelTimeInSeconds / 60),
      delayMin: Math.round((s.trafficDelayInSeconds ?? 0) / 60),
    };
  } catch {
    return null;
  }
}
