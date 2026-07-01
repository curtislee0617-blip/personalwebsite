import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { analyzeRestaurantCategories, categoryEmojis } from "./restaurant-classification.mjs";

const args = process.argv.slice(2);
const applyChanges = args.includes("--apply");
const applyCategories = args.includes("--apply-categories");
const concurrency = Math.max(1, Math.min(8, Number(args.find((arg) => arg.startsWith("--concurrency="))?.split("=")[1] ?? 4)));
const limit = Math.max(0, Number(args.find((arg) => arg.startsWith("--limit="))?.split("=")[1] ?? 0));
const outputPath = args.find((arg) => arg.startsWith("--output="))?.split("=").slice(1).join("=")
  ?? "imports/google-maps/staging/google-sync-audit.json";

function readEnv() {
  const lines = fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean);
  return Object.fromEntries(lines.map((line) => {
    const separator = line.indexOf("=");
    return [line.slice(0, separator), line.slice(separator + 1)];
  }));
}

function addressPart(components, types) {
  return components?.find((component) => types.some((type) => component.types?.includes(type)))?.longText ?? null;
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

function buildOpeningHours(payload) {
  const regularHours = payload.regularOpeningHours ?? payload.currentOpeningHours ?? null;
  const weekdayDescriptions = regularHours?.weekdayDescriptions ?? [];
  const periods = regularHours?.periods ?? [];
  if (!weekdayDescriptions.length && !periods.length && typeof payload.currentOpeningHours?.openNow !== "boolean") return null;

  return {
    openNow: Boolean(payload.currentOpeningHours?.openNow ?? payload.regularOpeningHours?.openNow ?? false),
    weekdayDescriptions,
    periods,
    utcOffsetMinutes: typeof payload.utcOffsetMinutes === "number" ? payload.utcOffsetMinutes : null,
    updatedAt: new Date().toISOString(),
  };
}

const env = readEnv();
if (!env.GOOGLE_PLACES_API_KEY || !env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
  console.error("GOOGLE_PLACES_API_KEY, NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required in .env.local");
  process.exit(1);
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const restaurants = [];
for (let start = 0; ; start += 1000) {
  const { data, error } = await supabase
    .from("restaurants")
    .select("id,place_id,name,category,emoji,tags,source_lists,area,city,country,address,price_level,latitude,longitude,google_maps_url,opening_hours,business_status,is_published")
    .eq("is_published", true)
    .not("place_id", "is", null)
    .range(start, start + 999);

  if (error) throw new Error(`Unable to load restaurants from Supabase: ${error.message}`);
  restaurants.push(...data);
  if (data.length < 1000) break;
}

const candidates = limit > 0 ? restaurants.slice(0, limit) : restaurants;

async function fetchPlaceDetails(restaurant) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(restaurant.place_id)}`, {
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
          "utcOffsetMinutes",
          "businessStatus",
          "regularOpeningHours",
          "currentOpeningHours",
        ].join(","),
      },
      signal: AbortSignal.timeout(30000),
    });

    const body = await response.json();
    if (response.ok) return body;

    if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 4) {
      throw new Error(body.error?.message ?? `Places API returned ${response.status}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 1250 * (attempt + 1)));
  }

  throw new Error("Google Places retry limit reached");
}

const audit = new Array(candidates.length);
let nextIndex = 0;
let completed = 0;

async function worker() {
  while (nextIndex < candidates.length) {
    const index = nextIndex++;
    const restaurant = candidates[index];

    try {
      const place = await fetchPlaceDetails(restaurant);
      const openingHours = buildOpeningHours(place);
      const analysis = analyzeRestaurantCategories({
        name: place.displayName?.text ?? restaurant.name,
        primaryType: place.primaryType ?? "",
        placeTypes: place.types ?? [],
        sourceCategory: restaurant.category,
        sourceLists: restaurant.source_lists ?? [],
        priceLevel: toPriceLevel(place.priceLevel) ?? restaurant.price_level ?? null,
        tags: restaurant.tags ?? [],
      });
      const suggestedCategory = analysis.primaryCategory;
      const suggestedEmoji = analysis.emoji ?? restaurant.emoji ?? "❓";
      const components = place.addressComponents ?? [];
      const mappedPriceLevel = toPriceLevel(place.priceLevel);
      const shouldSuggestCategoryChange = analysis.confidence >= 0.86
        && suggestedCategory !== restaurant.category;

      const updates = {
        name: place.displayName?.text ?? restaurant.name,
        google_maps_url: place.googleMapsUri ?? restaurant.google_maps_url,
        address: place.formattedAddress ?? restaurant.address,
        area: addressPart(components, ["neighborhood", "sublocality", "sublocality_level_1"]) ?? restaurant.area,
        city: addressPart(components, ["locality", "postal_town", "administrative_area_level_2"]) ?? restaurant.city,
        country: addressPart(components, ["country"]) ?? restaurant.country,
        latitude: place.location?.latitude ?? restaurant.latitude,
        longitude: place.location?.longitude ?? restaurant.longitude,
        price_level: mappedPriceLevel ?? restaurant.price_level,
        opening_hours: openingHours,
        hours_updated_at: openingHours?.updatedAt ?? null,
        business_status: place.businessStatus ?? restaurant.business_status ?? "OPERATIONAL",
        is_published: place.businessStatus === "CLOSED_PERMANENTLY" ? false : true,
        tags: analysis.tags,
        emoji: shouldSuggestCategoryChange && applyCategories ? suggestedEmoji : (categoryEmojis[restaurant.category] ?? restaurant.emoji),
        updated_at: new Date().toISOString(),
      };

      if (shouldSuggestCategoryChange && applyCategories) {
        updates.category = suggestedCategory;
        updates.emoji = suggestedEmoji;
      }

      if (applyChanges) {
        const { error } = await supabase
          .from("restaurants")
          .update(updates)
          .eq("id", restaurant.id);

        if (error) {
          throw new Error(`Supabase update failed: ${error.message}`);
        }
      }

      audit[index] = {
        id: restaurant.id,
        placeId: restaurant.place_id,
        name: restaurant.name,
        currentCategory: restaurant.category,
        suggestedCategory,
        categoryConfidence: analysis.confidence,
        categoryReason: analysis.reasons.join(" · "),
        categoryNeedsReview: shouldSuggestCategoryChange && !applyCategories,
        currentEmoji: restaurant.emoji,
        suggestedEmoji,
        secondaryCategories: analysis.secondaryCategories,
        businessStatus: place.businessStatus ?? "UNKNOWN",
        hasOpeningHours: Boolean(openingHours?.weekdayDescriptions?.length),
        weekdayDescriptions: openingHours?.weekdayDescriptions ?? [],
        priceLevel: mappedPriceLevel,
        primaryType: place.primaryType ?? null,
        types: place.types ?? [],
      };
    } catch (error) {
      audit[index] = {
        id: restaurant.id,
        placeId: restaurant.place_id,
        name: restaurant.name,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    completed += 1;
    if (completed % 50 === 0 || completed === candidates.length) {
      console.log(`Synced ${completed}/${candidates.length}`);
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));

const reviewRequired = audit.filter((item) => item?.categoryNeedsReview);
const failed = audit.filter((item) => item?.error);
const temporarilyClosed = audit.filter((item) => item?.businessStatus === "CLOSED_TEMPORARILY");
const permanentlyClosed = audit.filter((item) => item?.businessStatus === "CLOSED_PERMANENTLY");
const missingHours = audit.filter((item) =>
  !item?.error
  && !item?.hasOpeningHours
  && !["CLOSED_PERMANENTLY", "CLOSED_TEMPORARILY"].includes(item?.businessStatus),
);

const payload = {
  generatedAt: new Date().toISOString(),
  applyChanges,
  applyCategories,
  summary: {
    checked: audit.length,
    reviewRequired: reviewRequired.length,
    missingHours: missingHours.length,
    temporarilyClosed: temporarilyClosed.length,
    permanentlyClosed: permanentlyClosed.length,
    failed: failed.length,
  },
  reviewRequired,
  missingHours,
  temporarilyClosed,
  permanentlyClosed,
  failed,
  restaurants: audit,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(JSON.stringify(payload.summary, null, 2));
console.log(`Wrote ${outputPath}`);
