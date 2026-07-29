// Geo helpers for the siting map. Great-circle distance for the haul calculator,
// kept out of the client component so the component stays small.

export type LonLat = { lon: number; lat: number };

const EARTH_KM = 6371;

/** Great-circle (haversine) distance in km between two lon/lat points. */
export function greatCircleKm(a: LonLat, b: LonLat): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(h))));
}

/** Nearest point in `sources` to `from`, with its distance in km. */
export function nearestSource<T extends LonLat>(from: LonLat, sources: T[]): { source: T; km: number } | null {
  let best: { source: T; km: number } | null = null;
  for (const source of sources) {
    const km = greatCircleKm(from, source);
    if (!best || km < best.km) best = { source, km };
  }
  return best;
}
