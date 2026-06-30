import fs from "node:fs";
import path from "node:path";
import { categoryEmojis, suggestRestaurantCategory, typeCategories } from "./restaurant-classification.mjs";

const args = process.argv.slice(2);
const inputPath = args.find((arg) => !arg.startsWith("--")) ?? "imports/google-maps/staging/restaurants.json";
const outputPath = args.find((arg) => arg.startsWith("--output="))?.split("=").slice(1).join("=")
  ?? "imports/google-maps/staging/enriched-restaurants.json";
const reviewPath = args.find((arg) => arg.startsWith("--review="))?.split("=").slice(1).join("=")
  ?? "imports/google-maps/staging/review-required.json";
const requestedLimit = Number(args.find((arg) => arg.startsWith("--limit="))?.split("=")[1] ?? 0);
const concurrency = Math.max(1, Math.min(8, Number(args.find((arg) => arg.startsWith("--concurrency="))?.split("=")[1] ?? 4)));
const delayMs = Math.max(0, Number(args.find((arg) => arg.startsWith("--delay="))?.split("=")[1] ?? 0));

function readEnv() {
  const lines = fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean);
  return Object.fromEntries(lines.map((line) => {
    const separator = line.indexOf("=");
    return [line.slice(0, separator), line.slice(separator + 1)];
  }));
}

const apiKey = readEnv().GOOGLE_PLACES_API_KEY;
if (!apiKey) {
  console.error("GOOGLE_PLACES_API_KEY is missing from .env.local");
  process.exit(1);
}

const source = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const candidatePool = args.includes("--only-classified")
  ? source.restaurants.filter((item) => item.category !== "Unclassified")
  : source.restaurants;
const candidates = requestedLimit > 0 ? candidatePool.slice(0, requestedLimit) : candidatePool;

const foodTypes = new Set([
  "restaurant", "bar", "wine_bar", "cocktail_bar", "bakery", "cafe", "coffee_shop",
  "dessert_shop", "ice_cream_shop", "confectionery", "food_court", "meal_delivery",
  "meal_takeaway", "sandwich_shop", "juice_shop", "tea_house", "deli", ...typeCategories.keys(),
]);

const residentialTypes = new Set([
  "apartment_building", "apartment_complex", "condominium_complex", "housing_complex",
  "lodging", "hotel", "extended_stay_hotel", "bed_and_breakfast", "guest_house", "hostel",
  "motel", "private_guest_room", "resort_hotel", "rv_park", "campground",
]);

const foodSourceLists = new Set([
  "Asian casual", "Asian fancy", "Bars", "Casual", "Coffee", "Dessert", "Drinks",
  "Fine dining", "Western nicer",
]);

function normalizeName(value) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("en")
    .replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();
}

function tokenSimilarity(first, second) {
  const a = new Set(normalizeName(first).split(" ").filter(Boolean));
  const b = new Set(normalizeName(second).split(" ").filter(Boolean));
  if (!a.size || !b.size) return 0;
  const intersection = [...a].filter((token) => b.has(token)).length;
  return intersection / new Set([...a, ...b]).size;
}

function scoreCandidate(sourceName, place) {
  const expected = normalizeName(sourceName);
  const actual = normalizeName(place.displayName?.text ?? "");
  let score = expected === actual ? 1 : tokenSimilarity(expected, actual);
  if (expected && actual && (expected.includes(actual) || actual.includes(expected))) score = Math.max(score, 0.88);
  if ((place.types ?? []).some((type) => foodTypes.has(type))) score = Math.min(1, score + 0.03);
  return Number(score.toFixed(3));
}

function addressPart(components, types) {
  return components?.find((component) => types.some((type) => component.types?.includes(type)))?.longText ?? null;
}

function classify(place, sourceCategory) {
  return suggestRestaurantCategory({
    name: place.displayName?.text,
    primaryType: place.primaryType,
    placeTypes: place.types,
    sourceCategory,
  }).category;
}

function estimatedPrice(category) {
  if (["Asian Fancy", "Fine Dining"].includes(category)) return 4;
  if (["Western Nicer", "Bars", "Steakhouse"].includes(category)) return 3;
  if (["Bakeries", "Cafés", "Desserts"].includes(category)) return 1;
  return 2;
}

async function searchPlace(item) {
  async function requestSearch(textQuery) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": [
            "places.id", "places.displayName", "places.formattedAddress", "places.addressComponents",
            "places.location", "places.primaryType", "places.types", "places.googleMapsUri",
          ].join(","),
        },
        body: JSON.stringify({ textQuery, pageSize: 5 }),
      });
      const body = await response.json();
      if (response.ok) return body;
      if (response.status !== 429 || attempt === 4) {
        throw new Error(body.error?.message ?? `Places API returned ${response.status}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)));
    }
    throw new Error("Places API retry limit reached");
  }

  let body = await requestSearch(item.googleMapsUrl || item.name);
  if (!(body.places?.length) && item.googleMapsUrl) body = await requestSearch(item.name);

  const matches = (body.places ?? []).map((place) => ({ place, score: scoreCandidate(item.name, place) }))
    .sort((first, second) => second.score - first.score);
  const best = matches[0];
  const runnerUp = matches[1];
  const margin = best ? best.score - (runnerUp?.score ?? 0) : 0;
  const bestIsFood = Boolean(best && (best.place.types ?? []).some((type) => foodTypes.has(type)));
  const bestIsResidential = Boolean(best && (best.place.types ?? []).some((type) => residentialTypes.has(type)));
  const exactSavedUrlMatch = Boolean(item.googleMapsUrl && best?.score === 1);
  const accepted = Boolean(
    best && bestIsFood && best.score >= 0.88
    && (exactSavedUrlMatch || margin >= 0.08 || best.score === 1 && !runnerUp),
  );

  if (!best) {
    return { ...item, status: "needs_review", matchConfidence: 0, reviewReason: "No Places result", matchCandidates: [] };
  }

  const components = best.place.addressComponents;
  const category = classify(best.place, item.category);
  const cameFromFoodList = item.sourceLists.some((list) => foodSourceLists.has(list));
  const favouriteOnly = item.sourceLists.includes("Favorite places") && !cameFromFoodList;
  const matchCandidates = matches.slice(0, 3).map(({ place, score }) => ({
    placeId: place.id,
    name: place.displayName?.text ?? "Unknown",
    address: place.formattedAddress ?? null,
    primaryType: place.primaryType ?? null,
    score,
  }));

  return {
    ...item,
    name: accepted ? (best.place.displayName?.text ?? item.name) : item.name,
    placeId: accepted ? best.place.id : null,
    googleMapsUrl: accepted ? (best.place.googleMapsUri ?? item.googleMapsUrl) : item.googleMapsUrl,
    position: accepted ? best.place.location : null,
    address: accepted ? (best.place.formattedAddress ?? null) : null,
    area: accepted ? addressPart(components, ["neighborhood", "sublocality", "sublocality_level_1"]) : null,
    city: accepted ? addressPart(components, ["locality", "postal_town", "administrative_area_level_2"]) : null,
    country: accepted ? addressPart(components, ["country"]) : null,
    primaryType: best.place.primaryType ?? null,
    placeTypes: best.place.types ?? [],
    category,
    emoji: categoryEmojis[category] ?? "❓",
    priceLevel: estimatedPrice(category),
    priceLevelSource: "category estimate",
    matchConfidence: best.score,
    status: accepted ? "ready" : (!bestIsFood ? "excluded_non_food" : "needs_review"),
    reviewReason: accepted
      ? null
      : !bestIsFood
        ? bestIsResidential
          ? "Residential or lodging place removed"
          : favouriteOnly
            ? "Favorite place is not confirmed as food or drink"
            : "Place is not confirmed as a restaurant, café or food/drink venue"
        : `Ambiguous match (top score ${best.score}, margin ${margin.toFixed(3)})`,
    matchCandidates,
  };
}

const results = new Array(candidates.length);
let nextIndex = 0;
let completed = 0;

async function worker() {
  while (nextIndex < candidates.length) {
    const index = nextIndex++;
    try {
      results[index] = await searchPlace(candidates[index]);
    } catch (error) {
      results[index] = { ...candidates[index], status: "needs_review", reviewReason: error.message, matchCandidates: [] };
    }
    completed += 1;
    if (completed % 25 === 0 || completed === candidates.length) console.log(`Processed ${completed}/${candidates.length}`);
    if (delayMs > 0) await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));

const accepted = results.filter((item) => item.status === "ready");
const review = results.filter((item) => item.status === "needs_review");
const excluded = results.filter((item) => item.status === "excluded_non_food");
const payload = {
  generatedAt: new Date().toISOString(),
  source: path.basename(inputPath),
  summary: { processed: results.length, accepted: accepted.length, needsReview: review.length, excludedNonFood: excluded.length },
  restaurants: results,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
fs.writeFileSync(reviewPath, `${JSON.stringify({ generatedAt: payload.generatedAt, summary: payload.summary, restaurants: review }, null, 2)}\n`);
console.log(JSON.stringify(payload.summary, null, 2));
console.log(`Wrote ${outputPath} and ${reviewPath}`);
