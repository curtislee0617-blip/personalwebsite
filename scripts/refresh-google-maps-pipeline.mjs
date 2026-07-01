import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const importsRoot = path.join(root, "imports", "google-maps");
const sourceArg = process.argv[2];

function latestTakeoutSource() {
  const entries = fs.readdirSync(importsRoot)
    .filter((name) => /^takeout-.*(\.zip)?$/i.test(name))
    .map((name) => ({
      name,
      fullPath: path.join(importsRoot, name),
      mtime: fs.statSync(path.join(importsRoot, name)).mtimeMs,
    }))
    .sort((a, b) => {
      const zipBias = Number(a.name.toLowerCase().endsWith(".zip")) - Number(b.name.toLowerCase().endsWith(".zip"));
      return zipBias !== 0 ? -zipBias : b.mtime - a.mtime;
    });

  return entries[0]?.fullPath ?? null;
}

function run(label, args) {
  console.log(`\n== ${label} ==`);
  const result = spawnSync("node", args, { cwd: root, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const sourcePath = sourceArg
  ? path.resolve(root, sourceArg)
  : latestTakeoutSource();

if (!sourcePath || !fs.existsSync(sourcePath)) {
  console.error("No Google Maps takeout source found. Pass a zip or extracted Saved folder path.");
  process.exit(1);
}

const restaurantsPath = "imports/google-maps/staging/restaurants.json";
const resolvedPath = "imports/google-maps/staging/resolved-pins.json";

run("Import saved places", ["scripts/import-google-maps.mjs", sourcePath, restaurantsPath, restaurantsPath]);
run("Resolve original Google Maps pins", ["scripts/resolve-google-maps-pins.mjs", restaurantsPath, `--output=${resolvedPath}`]);
run("Upload published restaurants", ["scripts/upload-restaurants-to-supabase.mjs", resolvedPath, "--sync"]);
run("Sync Google hours and status", ["scripts/sync-google-maps-details.mjs", "--apply"]);
run("Export review list", ["scripts/export-restaurant-review.mjs", resolvedPath]);

console.log("\nGoogle Maps refresh complete.");
