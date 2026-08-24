import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const photosDirectory = path.join(root, "public", "photos");
const outputPath = path.join(root, "public", "mobile-photo-collage.webp");
const mobilePixelArtOutputPath = path.join(root, "public", "contact-cities-pixel-art-mobile.webp");
const pixelArtSourcePath = path.join(root, "public", "contact-cities-pixel-art-v2.png");
const manifestPath = path.join(root, "data", "home-photos.json");
const logoPath = path.join(root, "public", "logos", "caltech-collage-orange.png");
const supportedImage = /\.(avif|gif|jpe?g|png|webp)$/i;
const columns = 34;
const rows = 14;
const tileWidth = 39;
const tileHeight = 45;

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

await writeFile(
  manifestPath,
  `${JSON.stringify(files.map((file) => `/photos/${file}`), null, 2)}\n`,
  "utf8",
);

const composites = await Promise.all(
  Array.from({ length: columns * rows }, async (_, index) => {
    const isLogo = index % 29 === 17;
    const source = isLogo ? logoPath : path.join(photosDirectory, files[index % files.length]);
    const input = await sharp(source)
      .rotate()
      .resize(tileWidth, tileHeight, { fit: "cover", position: "centre" })
      .webp({ quality: 46, effort: 5, smartSubsample: true })
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
  .webp({ quality: 46, effort: 6, smartSubsample: true })
  .toFile(outputPath);

await sharp(pixelArtSourcePath)
  .resize(640, 274, { fit: "fill" })
  .webp({ quality: 54, effort: 6, smartSubsample: true })
  .toFile(mobilePixelArtOutputPath);

console.log(`Created ${path.relative(root, outputPath)} (${columns} × ${rows} low-resolution tiles).`);
console.log(`Created ${path.relative(root, mobilePixelArtOutputPath)} for the mobile dashboard screen.`);
