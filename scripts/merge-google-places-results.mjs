import fs from "node:fs";

const [basePath, retryPath, outputPath = basePath] = process.argv.slice(2);
if (!basePath || !retryPath) {
  console.error("Usage: node scripts/merge-google-places-results.mjs <base.json> <retry.json> [output.json]");
  process.exit(1);
}

const base = JSON.parse(fs.readFileSync(basePath, "utf8"));
const retry = JSON.parse(fs.readFileSync(retryPath, "utf8"));
const replacements = new Map(retry.restaurants.map((item) => [item.importId, item]));
const restaurants = base.restaurants.map((item) => replacements.get(item.importId) ?? item);
const summary = {
  processed: restaurants.length,
  accepted: restaurants.filter((item) => item.status === "ready").length,
  needsReview: restaurants.filter((item) => item.status === "needs_review").length,
  excludedNonFood: restaurants.filter((item) => item.status === "excluded_non_food").length,
};

const payload = { ...base, generatedAt: new Date().toISOString(), summary, restaurants };
fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
fs.writeFileSync(
  "imports/google-maps/staging/review-required.json",
  `${JSON.stringify({ generatedAt: payload.generatedAt, summary, restaurants: restaurants.filter((item) => item.status === "needs_review") }, null, 2)}\n`,
);
console.log(JSON.stringify(summary, null, 2));
