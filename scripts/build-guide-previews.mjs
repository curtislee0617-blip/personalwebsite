import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { guidePreviewSrc, guideVisuals } from "../lib/recipe-guide-visuals.ts";

const publicDirectory = fileURLToPath(new URL("../public/", import.meta.url));
const sources = [...new Set(Object.values(guideVisuals).flatMap(({ src, srcs }) => srcs ?? (src ? [src] : [])))];
const destinations = new Set();
let originalBytes = 0;
let previewBytes = 0;

for (const src of sources) {
  const original = path.join(publicDirectory, src);
  const preview = path.join(publicDirectory, guidePreviewSrc(src));
  if (destinations.has(preview)) throw new Error(`Duplicate guide preview filename: ${preview}`);
  destinations.add(preview);
  await mkdir(path.dirname(preview), { recursive: true });
  await sharp(original)
    .rotate()
    .resize({ width: 480, height: 480, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(preview);
  originalBytes += (await stat(original)).size;
  previewBytes += (await stat(preview)).size;
}

console.log(`Generated ${sources.length} guide previews: ${originalBytes} → ${previewBytes} bytes. Originals preserved.`);
