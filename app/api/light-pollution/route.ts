import { gunzipSync } from "node:zlib";
import { ATLAS_YEAR, atlasCell, decodeAtlasBrightness } from "@/lib/light-pollution";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const lat = params.get("lat");
  const lon = params.get("lon");
  const latitude = Number(lat);
  const longitude = Number(lon);
  if (!lat?.trim() || !lon?.trim() || !Number.isFinite(latitude) || !Number.isFinite(longitude)
    || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return Response.json({ error: "Valid coordinates are required." }, { status: 400 });
  }
  const headers = { "Cache-Control": "private, no-store" };
  const cell = atlasCell(latitude, longitude);
  if (!cell) return Response.json({ status: "outside-coverage", year: ATLAS_YEAR }, { headers });
  try {
    const response = await fetch(`https://djlorenz.github.io/astronomy/binary_tiles/${ATLAS_YEAR}/binary_tile_${cell.tileX}_${cell.tileY}.dat.gz`, {
      next: { revalidate: 86400 }, signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Atlas unavailable");
    const compressed = new Uint8Array(await response.arrayBuffer());
    const data = gunzipSync(compressed, { maxOutputLength: 360001 });
    const brightness = decodeAtlasBrightness(new Int8Array(data.buffer, data.byteOffset, data.byteLength), cell.column, cell.row);
    return Response.json({ status: "ok", year: ATLAS_YEAR, ...brightness }, { headers });
  } catch {
    return Response.json({ status: "unavailable", year: ATLAS_YEAR }, { status: 503, headers });
  }
}
