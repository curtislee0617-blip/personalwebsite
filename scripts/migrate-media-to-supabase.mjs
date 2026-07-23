#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const supabaseCli = path.join(root, "node_modules/.bin/supabase");
const repair = process.argv.includes("--repair");
const cacheControl = "31536000, immutable";

const directoryMappings = [
  ["public/bachour", "cookbook-media", "bachour"],
  ["public/benu", "cookbook-media", "benu"],
  ["public/core-book", "cookbook-media", "core-book"],
  ["public/frantzen", "cookbook-media", "frantzen"],
  ["public/imported-cookbooks", "cookbook-media", "imported-cookbooks"],
  ["public/modernist-cuisine", "cookbook-media", "modernist-cuisine"],
  ["public/modernist-pizza", "cookbook-media", "modernist-pizza"],
  ["public/opera", "cookbook-media", "opera"],
  ["public/pollen-street", "cookbook-media", "pollen-street"],
  ["public/recipes/cocktail-books", "cookbook-media", "recipes/cocktail-books"],
  ["public/recipes/instagram-saved", "recipe-media", "recipes/instagram-saved"],
  ["public/recipes/pasta", "recipe-media", "recipes/pasta"],
  ["public/recipes/personal-import", "recipe-media", "recipes/personal-import"],
  ["public/recipes/sushi", "recipe-media", "recipes/sushi"],
  ["public/recipes/viennoiserie", "recipe-media", "recipes/viennoiserie"],
  ["public/recipes/youtube-saved", "recipe-media", "recipes/youtube-saved"],
  ["public/documents", "site-media", "documents"],
  ["public/logos", "site-media", "logos"],
  ["public/mobile-page-backgrounds", "site-media", "mobile-page-backgrounds"],
  ["public/photos", "site-media", "photos"],
  ["public/project-documents", "site-media", "project-documents"],
  ["public/project-pages", "site-media", "project-pages"],
  ["public/project-previews", "site-media", "project-previews"],
];

const rootMediaExtensions = new Set([
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".mp4",
  ".pdf",
  ".png",
  ".svg",
  ".webm",
  ".webp",
]);

function listFiles(directory) {
  const files = [];
  const stack = [directory];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(fullPath);
      else if (entry.isFile() && entry.name !== ".gitkeep") files.push(fullPath);
    }
  }
  return files;
}

function listRemoteBucket(bucket) {
  const output = execFileSync(
    supabaseCli,
    ["storage", "ls", `ss:///${bucket}`, "--linked", "--experimental", "--recursive"],
    {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, DO_NOT_TRACK: "1" },
      maxBuffer: 32 * 1024 * 1024,
    },
  );

  const result = JSON.parse(output);
  return new Set(
    (result.paths ?? [])
      .filter((entry) => entry.startsWith(`/${bucket}/`))
      .map((entry) => entry.slice(1)),
  );
}

const expected = [];
for (const [sourceDirectory, bucket, destinationPrefix] of directoryMappings) {
  const absoluteSource = path.join(root, sourceDirectory);
  for (const localPath of listFiles(absoluteSource)) {
    const relativePath = path.relative(absoluteSource, localPath).split(path.sep).join("/");
    const storagePath = `${bucket}/${destinationPrefix}/${relativePath}`;
    expected.push({ bucket, localPath, storagePath });
  }
}

for (const entry of fs.readdirSync(path.join(root, "public"), { withFileTypes: true })) {
  if (
    !entry.isFile()
    || !/^[\x20-\x7e]+$/.test(entry.name)
    || !rootMediaExtensions.has(path.extname(entry.name).toLowerCase())
  ) continue;
  expected.push({
    bucket: "site-media",
    localPath: path.join(root, "public", entry.name),
    storagePath: `site-media/root/${entry.name}`,
  });
}

const remoteByBucket = new Map(
  [...new Set(expected.map((entry) => entry.bucket))].map((bucket) => [bucket, listRemoteBucket(bucket)]),
);

let missing = expected.filter((entry) => !remoteByBucket.get(entry.bucket)?.has(entry.storagePath));
console.log(`Expected Supabase objects: ${expected.length}`);
console.log(`Missing before repair: ${missing.length}`);

if (repair) {
  const stagingRoot = fs.mkdtempSync(path.join(root, "tmp/supabase-media-repair-"));
  try {
    for (const entry of missing) {
      const relativeStoragePath = entry.storagePath.slice(entry.bucket.length + 1);
      const stagedPath = path.join(stagingRoot, entry.bucket, relativeStoragePath);
      fs.mkdirSync(path.dirname(stagedPath), { recursive: true });
      fs.linkSync(entry.localPath, stagedPath);
    }

    const uploadGroups = new Map();
    for (const entry of missing) {
      const relativeStoragePath = entry.storagePath.slice(entry.bucket.length + 1);
      const topLevelPath = relativeStoragePath.split("/")[0];
      const key = `${entry.bucket}/${topLevelPath}`;
      uploadGroups.set(key, {
        bucket: entry.bucket,
        topLevelPath,
        count: (uploadGroups.get(key)?.count ?? 0) + 1,
      });
    }

    for (const { bucket, topLevelPath, count } of uploadGroups.values()) {
      console.log(`Uploading ${count} missing objects below ${bucket}/${topLevelPath}...`);
      const sourcePath = path.join(stagingRoot, bucket, topLevelPath);
      const isDirectory = fs.statSync(sourcePath).isDirectory();
      const args = [
        "storage",
        "cp",
        sourcePath,
        isDirectory ? `ss:///${bucket}` : `ss:///${bucket}/${topLevelPath}`,
        ...(isDirectory ? ["--recursive", "--jobs", "16"] : []),
        "--linked",
        "--experimental",
        "--cache-control",
        cacheControl,
      ];
      execFileSync(supabaseCli, args, {
        cwd: root,
        env: { ...process.env, DO_NOT_TRACK: "1" },
        stdio: "inherit",
      });
    }
  } finally {
    fs.rmSync(stagingRoot, { recursive: true, force: true });
  }

  const repairedRemoteByBucket = new Map(
    [...new Set(expected.map((entry) => entry.bucket))].map((bucket) => [bucket, listRemoteBucket(bucket)]),
  );
  missing = expected.filter((entry) => !repairedRemoteByBucket.get(entry.bucket)?.has(entry.storagePath));
  console.log(`Missing after repair: ${missing.length}`);
}

if (missing.length > 0) {
  for (const entry of missing.slice(0, 50)) console.error(`Missing: ${entry.storagePath}`);
  process.exitCode = 1;
}
