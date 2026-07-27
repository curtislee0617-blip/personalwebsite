import fs from "node:fs";
import path from "node:path";
import { categoryEmojis, suggestRestaurantCategory } from "./restaurant-classification.mjs";

const args = process.argv.slice(2);
const inputPath = args.find((arg) => !arg.startsWith("--")) ?? "imports/google-maps/staging/restaurants.json";
const outputPath = args.find((arg) => arg.startsWith("--output="))?.split("=").slice(1).join("=")
  ?? "imports/google-maps/staging/resolved-pins.json";
const reviewPath = args.find((arg) => arg.startsWith("--review="))?.split("=").slice(1).join("=")
  ?? "imports/google-maps/staging/review-required.json";
const concurrency = Math.max(1, Math.min(6, Number(args.find((arg) => arg.startsWith("--concurrency="))?.split("=")[1] ?? 4)));
const limit = Math.max(0, Number(args.find((arg) => arg.startsWith("--limit="))?.split("=")[1] ?? 0));
const selectedIds = new Set((args.find((arg) => arg.startsWith("--ids="))?.split("=").slice(1).join("=") ?? "").split(",").filter(Boolean));
const fresh = args.includes("--fresh");
const useLegacyDecisions = !args.includes("--no-legacy-decisions");
const verifyPlaces = args.includes("--verify-places");
const userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/137 Safari/537.36";

function readEnv() {
  if (!fs.existsSync(".env.local")) return {};
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

const env = readEnv();
if (verifyPlaces && !env.GOOGLE_PLACES_API_KEY) {
  console.error("GOOGLE_PLACES_API_KEY is required with --verify-places");
  process.exit(1);
}

const manualCategories = new Map([
  ["takeout-0013", "Western Nicer"],
  ["takeout-0022", "Casual"],
  ["takeout-0024", "Casual"],
  ["takeout-0049", "Burgers"],
  ["takeout-0055", "Barbecue"],
  ["takeout-0066", "East Asian"],
  ["takeout-0208", "Bakeries"],
  ["takeout-0234", "Cafés"],
  ["takeout-0505", "Western Nicer"],
  ["takeout-0683", "Casual"],
  ["takeout-0747", "South Asian"],
  ["takeout-0758", "Deli"],
  ["takeout-0823", "Western Nicer"],
  ["takeout-0832", "Tacos"],
  ["takeout-0883", "Casual"],
  ["takeout-0944", "Fine Dining"],
  ["takeout-0947", "East Asian"],
  ["takeout-0948", "East Asian"],
  ["takeout-0982", "East Asian"],
  ["takeout-0998", "East Asian"],
  ["takeout-1454", "Tacos"],
  ["takeout-1460", "Tacos"],
  ["takeout-1464", "Tacos"],
  ["takeout-1481", "Tacos"],
  ["takeout-1540", "Fine Dining"],
  ["takeout-1631", "Fine Dining"],
  ["takeout-1770", "Fine Dining"],
  ["takeout-1817", "Fine Dining"],
]);
const excludedIds = new Set([
  "takeout-0002", "takeout-0078", "takeout-0082",
  "takeout-0810", "takeout-0811", "takeout-0812", "takeout-0825",
  "takeout-0841", "takeout-0846", "takeout-0852", "takeout-0871", "takeout-0873", "takeout-0876",
  "takeout-0887", "takeout-0910", "takeout-0913", "takeout-0931", "takeout-0932", "takeout-0937", "takeout-0939",
  "takeout-0945", "takeout-0963", "takeout-0979", "takeout-0990", "takeout-1000", "takeout-1001",
]);

function cidFromUrl(url = "") {
  const match = url.match(/:0x([a-f\d]+)/i) ?? url.match(/[?&]cid=(\d+)/i);
  if (!match) return null;
  return match[0].includes(":0x") ? BigInt(`0x${match[1]}`).toString(10) : match[1];
}

function coordinatesFromUrl(url = "") {
  const match = url.match(/\/maps\/search\/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i);
  if (!match) return null;
  return { latitude: Number(match[1]), longitude: Number(match[2]) };
}

function slugType(label = "") {
  return label.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("en")
    .replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function isFoodVenue(types) {
  return types.some((type) => /(^|_)(restaurant|cafe|coffee_shop|bakery|food_court|bar|pub|dessert|ice_cream|pastry|confectionery|tea_house|meal_takeaway|meal_delivery|deli|sandwich_shop|food)(_|$)/.test(type));
}

function estimatedPrice(category) {
  if (["Asian Fancy", "Fine Dining"].includes(category)) return 4;
  if (["Western Nicer", "Bars", "Steakhouse"].includes(category)) return 3;
  if (["Bakeries", "Cafés", "Desserts"].includes(category)) return 1;
  return 2;
}

function addressPart(address, indexFromEnd) {
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  return parts.at(indexFromEnd) ?? null;
}

async function fetchWithRetry(url) {
  let lastError;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "Accept-Language": "en", "User-Agent": userAgent },
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) throw new Error(`Google Maps returned ${response.status}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 750 * (attempt + 1)));
    }
  }
  throw lastError;
}

async function resolveCid(cid, fallbackName) {
  const html = await fetchWithRetry(`https://www.google.com/maps?cid=${cid}`);
  const previewMatch = html.match(/href="([^"]*\/maps\/preview\/place[^"]+)/);
  if (!previewMatch) throw new Error("Google Maps preview URL was not available");
  const previewUrl = new URL(previewMatch[1].replaceAll("&amp;", "&"), "https://www.google.com").toString();
  const previewText = await fetchWithRetry(previewUrl);
  const payload = JSON.parse(previewText.replace(/^\)\]\}'\n?/, ""));
  const place = payload[6];
  if (!Array.isArray(place)) throw new Error("Google Maps pin payload was empty");

  const latitude = place[9]?.[2] ?? payload[4]?.[0]?.[2];
  const longitude = place[9]?.[3] ?? payload[4]?.[0]?.[1];
  const placeId = place[78] ?? `cid:${cid}`;
  const name = place[11] ?? fallbackName;
  if (!placeId || !name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Canonical place ID, name or coordinates were missing");
  }

  const address = place[39] ?? place[18] ?? place[2]?.filter(Boolean).join(", ") ?? "";
  const placeTypes = (place[13] ?? []).map(slugType).filter(Boolean);
  return {
    placeId,
    name,
    address,
    area: place[82]?.[3] ?? place[166] ?? addressPart(address, -3),
    city: place[166] ?? addressPart(address, -2),
    country: place[243] ?? addressPart(address, -1),
    position: { latitude, longitude },
    primaryType: placeTypes[0] ?? null,
    placeTypes,
    featureId: place[10] ?? null,
    googleMapsUrl: `https://www.google.com/maps?cid=${cid}`,
  };
}

function classifyResolved(item, resolved) {
  if (useLegacyDecisions && manualCategories.has(item.importId)) {
    return { category: manualCategories.get(item.importId), reason: "user review decision" };
  }
  if (resolved.placeTypes.includes("food_court")) {
    return { category: "Casual", reason: "all food courts are Casual" };
  }
  if (item.sourceLists.includes("Coffee") && /\b(bakery|bakehouse|boulangerie|patisserie|pastry)\b/i.test(resolved.name)) {
    return { category: "Bakeries", reason: "bakery in Coffee list" };
  }

  const suggestion = suggestRestaurantCategory({
    name: resolved.name,
    primaryType: resolved.primaryType,
    placeTypes: resolved.placeTypes,
    sourceCategory: item.category,
  });
  return { category: suggestion.category, reason: suggestion.reason };
}

function toPriceLevel(value) {
  switch (value) {
    case "PRICE_LEVEL_INEXPENSIVE":
      return 1;
    case "PRICE_LEVEL_MODERATE":
      return 2;
    case "PRICE_LEVEL_EXPENSIVE":
      return 3;
    case "PRICE_LEVEL_VERY_EXPENSIVE":
      return 4;
    default:
      return null;
  }
}

function addressComponent(components, wantedTypes) {
  return components?.find((component) =>
    wantedTypes.some((type) => component.types?.includes(type)))?.longText ?? null;
}

async function fetchPlaceDetails(placeId) {
  let lastError;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
        headers: {
          "X-Goog-Api-Key": env.GOOGLE_PLACES_API_KEY,
          "X-Goog-FieldMask": [
            "id",
            "displayName",
            "formattedAddress",
            "addressComponents",
            "location",
            "googleMapsUri",
            "primaryType",
            "types",
            "priceLevel",
            "businessStatus",
          ].join(","),
        },
        signal: AbortSignal.timeout(30000),
      });
      const body = await response.json();
      if (response.ok) return body;
      throw new Error(body.error?.message ?? `Places API returned ${response.status}`);
    } catch (error) {
      lastError = error;
      if (attempt < 4) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

async function verifyResolvedPlace(resolved) {
  if (!verifyPlaces) return resolved;
  const place = await fetchPlaceDetails(resolved.placeId);
  const address = place.formattedAddress ?? resolved.address;
  const components = place.addressComponents ?? [];
  return {
    ...resolved,
    name: place.displayName?.text ?? resolved.name,
    address,
    area: addressComponent(components, ["neighborhood", "sublocality", "sublocality_level_1"])
      ?? resolved.area,
    city: addressComponent(components, ["locality", "postal_town", "administrative_area_level_2"])
      ?? resolved.city,
    country: addressComponent(components, ["country"]) ?? resolved.country,
    position: {
      latitude: place.location?.latitude ?? resolved.position.latitude,
      longitude: place.location?.longitude ?? resolved.position.longitude,
    },
    primaryType: place.primaryType ?? resolved.primaryType,
    placeTypes: place.types ?? resolved.placeTypes,
    googleMapsUrl: place.googleMapsUri ?? resolved.googleMapsUrl,
    businessStatus: place.businessStatus ?? "UNKNOWN",
    googlePriceLevel: toPriceLevel(place.priceLevel),
    placesVerifiedAt: new Date().toISOString(),
  };
}

function canReuseCachedResult(item, cached) {
  if (!cached?.resolutionMethod && !(cached?.placeId && cached?.position)) return false;
  if (cached.status === "excluded_manual") return true;
  if (item.googleMapsUrl && cached.googleMapsUrl) return item.googleMapsUrl === cached.googleMapsUrl;
  return item.name === cached.name;
}

const source = JSON.parse(fs.readFileSync(inputPath, "utf8"));
let candidates = source.restaurants;
if (selectedIds.size) candidates = candidates.filter((item) => selectedIds.has(item.importId));
if (limit > 0) candidates = candidates.slice(0, limit);

const previous = !fresh && fs.existsSync(outputPath) && !selectedIds.size && limit === 0
  ? JSON.parse(fs.readFileSync(outputPath, "utf8")).restaurants ?? []
  : [];
const completedById = new Map(previous.map((item) => [item.importId, item]));
const results = new Array(candidates.length);
let nextIndex = 0;
let completed = 0;

function writeProgress() {
  const restaurants = results.filter(Boolean);
  const summary = {
    processed: restaurants.length,
    ready: restaurants.filter((item) => item.status === "ready").length,
    needsReview: restaurants.filter((item) => item.status === "needs_review").length,
    excludedNonFood: restaurants.filter((item) => item.status === "excluded_non_food").length,
    excludedClosed: restaurants.filter((item) => item.status === "excluded_closed").length,
    excludedManual: restaurants.filter((item) => item.status === "excluded_manual").length,
  };
  const payload = { generatedAt: new Date().toISOString(), source: path.basename(inputPath), summary, restaurants };
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
  fs.writeFileSync(reviewPath, `${JSON.stringify({
    generatedAt: payload.generatedAt,
    summary,
    restaurants: restaurants.filter((item) => item.status === "needs_review"),
  }, null, 2)}\n`);
  return summary;
}

async function worker() {
  while (nextIndex < candidates.length) {
    const index = nextIndex++;
    const item = candidates[index];
    const cached = completedById.get(item.importId);
    const originalCoordinates = coordinatesFromUrl(item.googleMapsUrl);
    if (useLegacyDecisions && excludedIds.has(item.importId)) {
      results[index] = { ...item, status: "excluded_manual", reviewReason: "Removed by user", resolutionMethod: "user_decision" };
    } else if (canReuseCachedResult(item, cached)) {
      const classification = classifyResolved(item, cached);
      const updatedCategory = classification.category;
      const updatedEmoji = categoryEmojis[updatedCategory] ?? cached.emoji ?? "❓";
      const needsCategoryReview = cached.status === "ready" && updatedCategory === "Unclassified";
      const retainedStatus = cached.status === "ready" && !needsCategoryReview
        ? "ready"
        : cached.status === "excluded_non_food"
          ? "excluded_non_food"
          : cached.status;
      results[index] = {
        ...cached,
        ...item,
        category: updatedCategory,
        emoji: updatedEmoji,
        classificationReason: classification.reason,
        priceLevel: estimatedPrice(updatedCategory),
        status: retainedStatus,
        reviewReason: needsCategoryReview ? "Exact pin resolved; category is still uncertain" : cached.reviewReason,
      };
    } else if (originalCoordinates) {
      results[index] = {
        ...item,
        position: originalCoordinates,
        status: "needs_review",
        reviewReason: "Exact coordinates recovered; restaurant identity and category need review",
        matchCandidates: [],
        resolutionMethod: "original_google_maps_coordinates",
      };
    } else if (cached?.resolutionMethod === "original_google_maps_cid") {
      const classification = classifyResolved(item, cached);
      const needsCategoryReview = cached.status === "ready" && classification.category === "Unclassified";
      const categoryWasReviewed = cached.status === "needs_review" && classification.category !== "Unclassified";
      results[index] = {
        ...cached,
        category: classification.category,
        emoji: categoryEmojis[classification.category] ?? "❓",
        classificationReason: classification.reason,
        priceLevel: estimatedPrice(classification.category),
        status: needsCategoryReview ? "needs_review" : categoryWasReviewed ? "ready" : cached.status,
        reviewReason: needsCategoryReview ? "Exact pin resolved; category is still uncertain" : categoryWasReviewed ? null : cached.reviewReason,
      };
    } else {
      const cid = cidFromUrl(item.googleMapsUrl);
      if (!cid) {
        results[index] = { ...item, status: "needs_review", reviewReason: "Original Google Maps URL has no CID" };
      } else {
        try {
          const exactPin = await resolveCid(cid, item.name);
          const resolved = await verifyResolvedPlace(exactPin);
          const foodVenue = isFoodVenue(resolved.placeTypes)
            || (useLegacyDecisions && manualCategories.has(item.importId));
          const closed = ["CLOSED_TEMPORARILY", "CLOSED_PERMANENTLY"].includes(resolved.businessStatus);
          const classification = classifyResolved(item, resolved);
          const needsCategoryReview = foodVenue && classification.category === "Unclassified";
          const priceLevel = resolved.googlePriceLevel ?? estimatedPrice(classification.category);
          results[index] = {
            ...item,
            ...resolved,
            category: classification.category,
            emoji: categoryEmojis[classification.category] ?? "❓",
            confidence: 1,
            classificationReason: classification.reason,
            matchConfidence: 1,
            priceLevel,
            priceLevelSource: resolved.googlePriceLevel ? "Google Places" : "category estimate",
            status: closed
              ? "excluded_closed"
              : needsCategoryReview
                ? "needs_review"
                : foodVenue
                  ? "ready"
                  : "excluded_non_food",
            reviewReason: closed
              ? `Google Places reports ${resolved.businessStatus}`
              : needsCategoryReview
              ? "Exact pin resolved; category is still uncertain"
              : foodVenue ? null : `Original pin type is ${resolved.placeTypes.join(", ") || "unknown"}`,
            matchCandidates: [],
            resolutionMethod: "original_google_maps_cid",
          };
        } catch (error) {
          results[index] = { ...item, status: "needs_review", reviewReason: error.message, cid, matchCandidates: [] };
        }
      }
    }

    completed += 1;
    if (completed % 25 === 0 || completed === candidates.length) {
      const summary = writeProgress();
      console.log(`Processed ${completed}/${candidates.length}: ${summary.ready} ready, ${summary.needsReview} unresolved`);
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));
console.log(JSON.stringify(writeProgress(), null, 2));
console.log(`Wrote exact saved-pin results to ${outputPath}`);
