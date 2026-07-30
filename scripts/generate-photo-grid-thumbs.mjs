// Generates the small thumbnails the home/contact photo grid actually needs.
//
// The grid renders tiles at roughly 62x103 CSS px, but was downloading the
// full-size originals (20-45KB each, 118 unique files, ~3.5MB per cold visit).
// This script produces height-224 webp thumbs — enough for 2x DPR with
// object-fit: cover — at a fraction of the size.
//
// Originals are read from public/photos/ when present locally, otherwise
// fetched from the public site-media bucket. Output goes to
// public/photos/thumbs/ (gitignored, like the originals); upload to the bucket
// with:
//   supabase storage cp -r public/photos/thumbs ss:///site-media/photos/thumbs --linked --experimental

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.dirname(new URL(import.meta.url, "file:").pathname) + "/..";
const photos = JSON.parse(await fs.readFile(path.join(root, "data/home-photos.json"), "utf8"));

const supabaseUrl = (await fs.readFile(path.join(root, ".env.local"), "utf8"))
  .match(/^NEXT_PUBLIC_SUPABASE_URL=(.*)$/m)?.[1]
  ?.trim();
if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL not found in .env.local");

const outDir = path.join(root, "public/photos/thumbs");
await fs.mkdir(outDir, { recursive: true });

const THUMB_HEIGHT = 224;
const QUALITY = 62;

let beforeTotal = 0;
let afterTotal = 0;
let fetched = 0;

for (const photo of photos) {
  const name = path.basename(photo);
  const localOriginal = path.join(root, "public/photos", name);
  const outPath = path.join(outDir, name);

  let input;
  try {
    input = await fs.readFile(localOriginal);
  } catch {
    const remote = `${supabaseUrl}/storage/v1/object/public/site-media/photos/${name}`;
    const response = await fetch(remote);
    if (!response.ok) {
      console.error(`SKIP (fetch ${response.status}): ${name}`);
      continue;
    }
    input = Buffer.from(await response.arrayBuffer());
    fetched += 1;
  }

  beforeTotal += input.length;
  const output = await sharp(input)
    .resize({ height: THUMB_HEIGHT, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer();
  await fs.writeFile(outPath, output);
  afterTotal += output.length;
}

console.log(`thumbs: ${photos.length} files (${fetched} fetched from bucket)`);
console.log(`before: ${Math.round(beforeTotal / 1024)}KB -> after: ${Math.round(afterTotal / 1024)}KB`);
