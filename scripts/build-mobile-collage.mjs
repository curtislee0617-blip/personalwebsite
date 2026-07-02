import { readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const photosDirectory = path.join(root, "public", "photos");
const outputPath = path.join(root, "public", "mobile-photo-collage.webp");
const logoPath = path.join(root, "public", "logos", "caltech-collage-orange.png");
const supportedImage = /\.(avif|gif|jpe?g|png|webp)$/i;
const columns = 18;
const rows = 5;
const tileWidth = 96;
const tileHeight = 128;

function score(name) {
  let hash = 2166136261;
  for (const character of name) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

const files = (await readdir(photosDirectory))
  .filter((file) => supportedImage.test(file))
  .sort((first, second) => score(first) - score(second));

if (!files.length) throw new Error("No photos found in public/photos.");

const composites = await Promise.all(
  Array.from({ length: columns * rows }, async (_, index) => {
    const isLogo = index % 29 === 17;
    const source = isLogo ? logoPath : path.join(photosDirectory, files[index % files.length]);
    const input = await sharp(source)
      .rotate()
      .resize(tileWidth, tileHeight, { fit: "cover", position: "centre" })
      .webp({ quality: 58, effort: 4, smartSubsample: true })
      .toBuffer();

    return {
      input,
      left: Math.floor(index / rows) * tileWidth,
      top: (index % rows) * tileHeight,
    };
  }),
);

await sharp({
  create: {
    width: columns * tileWidth,
    height: rows * tileHeight,
    channels: 3,
    background: "#dce8e5",
  },
})
  .composite(composites)
  .webp({ quality: 58, effort: 6, smartSubsample: true })
  .toFile(outputPath);

console.log(`Created ${path.relative(root, outputPath)} (${columns} × ${rows} tiles).`);
