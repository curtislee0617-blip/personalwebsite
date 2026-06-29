import { mkdir, readdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const photosDirectory = path.join(root, "public", "photos");
const stageDirectory = path.join(root, ".photo-optimization-stage");
const backupRoot = path.join(root, ".photo-originals");
const supportedImage = /\.(avif|gif|jpe?g|png|webp)$/i;

const allFiles = await readdir(photosDirectory);
const imageFiles = allFiles.filter((file) => supportedImage.test(file));
const candidates = [];

for (const file of imageFiles) {
  const metadata = await sharp(path.join(photosDirectory, file)).metadata();
  const alreadyOptimized = metadata.format === "webp" && metadata.width === 450 && metadata.height === 600;
  if (!alreadyOptimized) candidates.push(file);
}

if (!candidates.length) {
  console.log("All photos are already optimized.");
  process.exit(0);
}

await rm(stageDirectory, { recursive: true, force: true });
await mkdir(stageDirectory, { recursive: true });

const usedNames = new Set(imageFiles.map((file) => file.toLowerCase()));

function outputName(file, index) {
  const base = path.basename(file, path.extname(file)).replace(/[^a-z0-9-_]+/gi, "-").replace(/^-|-$/g, "");
  let name = `${base || "photo"}.webp`;
  let suffix = 2;
  while (usedNames.has(name.toLowerCase())) {
    name = `${base || "photo"}-${suffix}.webp`;
    suffix += 1;
  }
  usedNames.add(name.toLowerCase());
  return `${String(index + 1).padStart(3, "0")}-${name}`;
}

const jobs = candidates.map((file, index) => ({ file, output: outputName(file, index) }));
let nextJob = 0;

async function worker() {
  while (nextJob < jobs.length) {
    const job = jobs[nextJob];
    nextJob += 1;
    await sharp(path.join(photosDirectory, job.file))
      .rotate()
      .resize(450, 600, { fit: "cover", position: "centre" })
      .webp({ quality: 72, effort: 5, smartSubsample: true })
      .toFile(path.join(stageDirectory, job.output));
    console.log(`Optimized ${nextJob}/${jobs.length}: ${job.file}`);
  }
}

await Promise.all(Array.from({ length: Math.min(4, jobs.length) }, () => worker()));

const backupDirectory = path.join(backupRoot, new Date().toISOString().replace(/[:.]/g, "-"));
await mkdir(backupDirectory, { recursive: true });

for (const { file } of jobs) {
  await rename(path.join(photosDirectory, file), path.join(backupDirectory, file));
}

for (const { output } of jobs) {
  await rename(path.join(stageDirectory, output), path.join(photosDirectory, output));
}

await rm(stageDirectory, { recursive: true, force: true });
console.log(`Finished. Originals are backed up in ${path.relative(root, backupDirectory)}.`);
