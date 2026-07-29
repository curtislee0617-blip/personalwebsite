import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const inputPath = args.find((arg) => arg.startsWith("--input="))?.split("=").slice(1).join("=")
  ?? "imports/google-maps/staging/reclassification-audit-v3.json";
const outputPath = args.find((arg) => arg.startsWith("--output="))?.split("=").slice(1).join("=")
  ?? "imports/google-maps/staging/restaurant-category-research.json";
const concurrency = Math.max(
  1,
  Math.min(6, Number(args.find((arg) => arg.startsWith("--concurrency="))?.split("=")[1] ?? 3)),
);
const limit = Math.max(0, Number(args.find((arg) => arg.startsWith("--limit="))?.split("=")[1] ?? 0));

function readEnv() {
  return Object.fromEntries(
    fs.readFileSync(".env.local", "utf8").split(/\r?\n/).flatMap((rawLine) => {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) return [];
      const separator = line.indexOf("=");
      if (separator < 1) return [];
      const key = line.slice(0, separator).trim().replace(/^export\s+/, "");
      const rawValue = line.slice(separator + 1).trim();
      const value = (
        (rawValue.startsWith("\"") && rawValue.endsWith("\""))
        || (rawValue.startsWith("'") && rawValue.endsWith("'"))
      )
        ? rawValue.slice(1, -1)
        : rawValue;
      return [[key, value]];
    }),
  );
}

function reviewText(review) {
  return review?.text?.text?.replace(/\s+/g, " ").trim() ?? "";
}

const env = readEnv();
const googlePlacesApiKey = env.GOOGLE_PLACES_API_KEY ?? env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
if (!googlePlacesApiKey) {
  console.error("GOOGLE_PLACES_API_KEY or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is required in .env.local");
  process.exit(1);
}

const audit = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const categoryNames = new Set([
  "Bars", "Asian Fancy", "Fine Dining", "Western Nicer", "Bakeries", "Tacos", "Burgers",
  "Chicken", "Ramen", "Sushi", "Dim Sum", "Pizza", "Pasta", "Steakhouse", "Bistro",
  "Barbecue", "Deli", "Cafés", "Desserts", "South Asian", "East Asian", "Southeast Asian",
  "Middle Eastern", "African", "Casual", "Unclassified",
]);
const specificCategories = new Set([
  "Bars", "Bakeries", "Tacos", "Burgers", "Chicken", "Ramen", "Sushi", "Dim Sum",
  "Pizza", "Pasta", "Steakhouse", "Bistro", "Barbecue", "Deli", "Cafés", "Desserts",
]);

const reviewCandidates = audit.records.filter((record) => {
  if (!record.placeId) return false;
  if (record.confidence < 0.8) return true;
  if (record.currentCategory === record.suggestedCategory) return false;
  if (specificCategories.has(record.currentCategory)) return true;
  if (
    ["Asian Fancy", "Fine Dining", "Western Nicer"].includes(record.currentCategory)
    || ["Asian Fancy", "Fine Dining", "Western Nicer"].includes(record.suggestedCategory)
  ) {
    return true;
  }
  return !categoryNames.has(record.suggestedCategory);
});
const candidates = limit > 0 ? reviewCandidates.slice(0, limit) : reviewCandidates;

async function fetchPlace(record) {
  const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(record.placeId)}`, {
    headers: {
      "X-Goog-Api-Key": googlePlacesApiKey,
      "X-Goog-FieldMask": [
        "id",
        "displayName",
        "primaryType",
        "types",
        "priceLevel",
        "businessStatus",
        "websiteUri",
        "editorialSummary",
        "reviews",
      ].join(","),
    },
    signal: AbortSignal.timeout(30000),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message ?? `Places API returned ${response.status}`);
  return body;
}

const research = new Array(candidates.length);
let nextIndex = 0;
let completed = 0;

async function worker() {
  while (nextIndex < candidates.length) {
    const index = nextIndex++;
    const record = candidates[index];
    try {
      const place = await fetchPlace(record);
      research[index] = {
        id: record.id,
        placeId: record.placeId,
        name: place.displayName?.text ?? record.name,
        city: record.city,
        currentCategory: record.currentCategory,
        suggestedCategory: record.suggestedCategory,
        sourceLists: record.sourceLists,
        primaryType: place.primaryType ?? record.primaryType,
        placeTypes: place.types ?? record.placeTypes,
        priceLevel: place.priceLevel ?? record.priceLevel,
        businessStatus: place.businessStatus ?? null,
        websiteUri: place.websiteUri ?? null,
        editorialSummary: place.editorialSummary?.text?.replace(/\s+/g, " ").trim() ?? null,
        reviews: (place.reviews ?? []).map((review) => ({
          rating: review.rating ?? null,
          relativePublishTimeDescription: review.relativePublishTimeDescription ?? null,
          text: reviewText(review),
        })).filter((review) => review.text),
      };
    } catch (error) {
      research[index] = {
        id: record.id,
        placeId: record.placeId,
        name: record.name,
        error: error instanceof Error ? error.message : String(error),
      };
    }
    completed += 1;
    if (completed % 20 === 0 || completed === candidates.length) {
      console.log(`Researched ${completed}/${candidates.length}`);
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));

const payload = {
  generatedAt: new Date().toISOString(),
  inputPath,
  checked: research.length,
  failed: research.filter((record) => record.error).length,
  restaurants: research,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(JSON.stringify({ checked: payload.checked, failed: payload.failed }, null, 2));
console.log(`Wrote ${outputPath}`);
