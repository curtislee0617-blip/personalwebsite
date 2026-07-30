import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const [inputRoot, outputRoot] = process.argv.slice(2);

if (!inputRoot || !outputRoot) {
  throw new Error(
    "Usage: node scripts/make-story-contact-sheets.mjs <input-directory> <output-directory>",
  );
}

const columns = 4;
const rows = 4;
const imageWidth = 300;
const imageHeight = 533;
const labelHeight = 34;
const tileHeight = imageHeight + labelHeight;
const perSheet = columns * rows;

await mkdir(outputRoot, { recursive: true });

for (const highlight of ["ingredients", "chopsticks"]) {
  const highlightDirectory = path.join(inputRoot, highlight);
  const files = (await readdir(highlightDirectory))
    .filter((filename) => filename.endsWith(".jpg"))
    .sort();

  for (let offset = 0; offset < files.length; offset += perSheet) {
    const page = Math.floor(offset / perSheet) + 1;
    const pageFiles = files.slice(offset, offset + perSheet);
    const composites = [];

    for (const [tileIndex, filename] of pageFiles.entries()) {
      const storyNumber = path.basename(filename, ".jpg");
      const image = await sharp(path.join(highlightDirectory, filename))
        .resize(imageWidth, imageHeight, { fit: "cover", position: "centre" })
        .jpeg({ quality: 82 })
        .toBuffer();

      const label = Buffer.from(`
        <svg width="${imageWidth}" height="${labelHeight}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#111111"/>
          <text x="12" y="23" fill="#ffffff" font-family="Arial, sans-serif" font-size="17" font-weight="700">
            ${highlight} · ${storyNumber}
          </text>
        </svg>
      `);

      const tile = await sharp({
        create: {
          width: imageWidth,
          height: tileHeight,
          channels: 3,
          background: "#111111",
        },
      })
        .composite([
          { input: image, left: 0, top: 0 },
          { input: label, left: 0, top: imageHeight },
        ])
        .jpeg({ quality: 84 })
        .toBuffer();

      composites.push({
        input: tile,
        left: (tileIndex % columns) * imageWidth,
        top: Math.floor(tileIndex / columns) * tileHeight,
      });
    }

    const outputPath = path.join(
      outputRoot,
      `${highlight}-${String(page).padStart(2, "0")}.jpg`,
    );

    await sharp({
      create: {
        width: columns * imageWidth,
        height: rows * tileHeight,
        channels: 3,
        background: "#ebe7df",
      },
    })
      .composite(composites)
      .jpeg({ quality: 88 })
      .toFile(outputPath);

    console.log(outputPath);
  }
}
