import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const args = new Map(
  process.argv
    .slice(2)
    .map((argument, index, all) => [argument, all[index + 1]])
    .filter(([argument]) => argument.startsWith("--")),
);

const indexPath = args.get("--index");
const outputDirectory = args.get("--out");

if (!indexPath || !outputDirectory) {
  throw new Error(
    "Usage: node scripts/fetch-instagram-story-images.mjs --index <story-index.json> --out <directory>",
  );
}

const storyIndex = JSON.parse(await readFile(indexPath, "utf8"));
const jobs = Object.entries(storyIndex.highlights).flatMap(([highlight, stories]) =>
  stories
    .filter((story) => story.tag === "img" && story.src?.startsWith("https://"))
    .map((story) => ({ highlight, ...story })),
);

const manifest = [];
let cursor = 0;

async function downloadNext() {
  while (cursor < jobs.length) {
    const job = jobs[cursor++];
    const highlightDirectory = path.join(outputDirectory, job.highlight);
    const filename = `${String(job.index).padStart(3, "0")}.jpg`;
    const destination = path.join(highlightDirectory, filename);

    await mkdir(highlightDirectory, { recursive: true });

    try {
      const response = await fetch(job.src, {
        headers: {
          accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          referer: "https://www.instagram.com/",
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/138 Safari/537.36",
        },
        redirect: "follow",
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const body = Buffer.from(await response.arrayBuffer());
      await writeFile(destination, body);
      manifest.push({
        destination,
        highlight: job.highlight,
        index: job.index,
        naturalHeight: job.naturalH,
        naturalWidth: job.naturalW,
        sourceUrl: job.src,
        status: "downloaded",
      });
    } catch (error) {
      manifest.push({
        error: error instanceof Error ? error.message : String(error),
        highlight: job.highlight,
        index: job.index,
        sourceUrl: job.src,
        status: "failed",
      });
    }
  }
}

await Promise.all(Array.from({ length: 6 }, () => downloadNext()));

manifest.sort(
  (a, b) =>
    a.highlight.localeCompare(b.highlight) ||
    Number(a.index) - Number(b.index),
);

await mkdir(outputDirectory, { recursive: true });
await writeFile(
  path.join(outputDirectory, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

const downloaded = manifest.filter((item) => item.status === "downloaded").length;
const failed = manifest.length - downloaded;
console.log(`Downloaded ${downloaded} story images; ${failed} failed.`);

if (failed) {
  for (const item of manifest.filter((entry) => entry.status === "failed")) {
    console.error(`${item.highlight} ${item.index}: ${item.error}`);
  }
  process.exitCode = 1;
}
