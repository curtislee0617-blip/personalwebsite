// David Lorenz's 2025 Light Pollution Atlas, numeric tile format:
// https://djlorenz.github.io/astronomy/lp/overlay/dark.html
export const ATLAS_YEAR = 2025;
export const ATLAS_TILES = `https://djlorenz.github.io/astronomy/image_tiles/tiles${ATLAS_YEAR}/tile_{z}_{x}_{y}.png`;

export function atlasCell(latitude: number, longitude: number) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -65 || latitude >= 75) return null;
  const x = ((longitude + 180) % 360 + 360) % 360;
  const y = latitude + 65;
  const tileX = Math.floor(x / 5) + 1;
  const tileY = Math.floor(y / 5) + 1;
  return {
    tileX, tileY,
    // Source coordinates are one-based. Clamp at tile boundaries.
    column: Math.max(1, Math.min(600, Math.round(120 * (x % 5) + 0.5))),
    row: Math.max(1, Math.min(600, Math.round(120 * (y % 5) + 0.5))),
  };
}

export function decodeAtlasBrightness(bytes: Int8Array, column: number, row: number) {
  if (bytes.length !== 360001 || row < 1 || row > 600 || column < 1 || column > 600) throw new Error("Invalid atlas tile");
  let encoded = 128 * bytes[0] + bytes[1];
  for (let y = 1; y < row; y++) encoded += bytes[600 * y + 1];
  for (let x = 1; x < column; x++) encoded += bytes[600 * (row - 1) + 1 + x];
  const ratio = (5 / 195) * Math.expm1(0.0195 * encoded);
  if (!Number.isFinite(ratio) || ratio < 0) throw new Error("Invalid atlas reading");
  return { ratio, magnitude: 22 - 2.5 * Math.log10(1 + ratio) };
}

export function pollutionAssessment(ratio: number) {
  if (ratio < 0.11) return { label: "Very little skyglow", tone: "low", detail: "A strong candidate for Milky Way and faint-sky photography when the Moon and weather cooperate." };
  if (ratio < 1) return { label: "Some skyglow", tone: "moderate", detail: "Promising for night photography. Look away from nearby towns and bright light domes." };
  if (ratio < 9) return { label: "Brightened night sky", tone: "high", detail: "Artificial glow competes with the natural sky. A darker site will help with faint stars and the Milky Way." };
  return { label: "Strong light pollution", tone: "high", detail: "Better suited to Moon, planet, and city-night photography. Travel away from the bright areas for faint-sky images." };
}
