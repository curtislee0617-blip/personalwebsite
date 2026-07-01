import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { analyzeRestaurantCategories } from "./restaurant-classification.mjs";

const args = process.argv.slice(2);
const inputPath = args.find((arg) => !arg.startsWith("--")) ?? "imports/google-maps/staging/enriched-restaurants.json";
const syncPublished = args.includes("--sync");
const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const separator = line.indexOf("=");
    return [line.slice(0, separator), line.slice(separator + 1)];
  }),
);

if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required in .env.local");
  process.exit(1);
}

const categoryPriority = [
  "Fine Dining", "Asian Fancy", "Bars", "Western Nicer", "Bakeries", "Tacos", "Burgers",
  "Chicken", "Ramen", "Sushi", "Dim Sum", "Pizza", "Pasta", "Steakhouse", "Bistro", "Cafés", "Desserts", "South Asian", "East Asian",
  "Southeast Asian", "Middle Eastern", "African", "Barbecue", "Deli", "Casual", "Unclassified",
];
const source = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const confirmed = source.restaurants.filter((item) => item.status === "ready" && item.placeId && item.position);
const merged = new Map();

function descriptionFor(item) {
  return [item.comment, item.note].map((value) => value?.trim()).filter(Boolean).filter((value, index, all) => all.indexOf(value) === index).join(" — ") || null;
}

function mappedCategoriesFromSourceLists(sourceLists = []) {
  return sourceLists.flatMap((list) => {
    switch (list) {
      case "Fine dining":
        return ["Fine Dining"];
      case "Asian fancy":
        return ["Asian Fancy"];
      case "Asian casual":
        return ["East Asian"];
      case "Western nicer":
        return ["Western Nicer"];
      case "Coffee":
        return ["Cafés", "Bakeries"];
      case "Dessert":
        return ["Desserts"];
      case "Bars":
      case "Drinks":
        return ["Bars"];
      case "Casual":
        return ["Casual"];
      default:
        return [];
    }
  });
}

function cleanUserTag(tag = "") {
  return tag?.trim().replace(/\s+/g, " ");
}

function isFoodRelevantTag(tag = "") {
  return /\b(food|restaurant|cafe|coffee|bakery|bread|pastry|dessert|bar|wine|cocktail|pizza|pasta|burger|taco|ramen|sushi|dim sum|dumpling|bbq|barbecue|deli|steak|bistro|omakase|asian|indian|thai|vietnamese|japanese|korean|chinese|mexican|italian|french|middle eastern|african|brunch|noodle|tea)\b/i.test(tag);
}

function analysisFor(item) {
  return analyzeRestaurantCategories({
    name: item.name,
    primaryType: item.primaryType,
    placeTypes: item.placeTypes ?? [],
    sourceCategory: item.category,
    sourceLists: item.sourceLists ?? [],
    priceLevel: item.priceLevel ?? null,
    tags: (item.sourceTags ?? []).map(cleanUserTag).filter(Boolean).filter(isFoodRelevantTag),
  });
}

function tagsFor(item, analysis) {
  const extraCategories = new Set([
    ...mappedCategoriesFromSourceLists(item.sourceLists ?? []),
    ...analysis.secondaryCategories,
  ]);
  return Array.from(
    new Set([
      ...Array.from(extraCategories).filter((category) => category !== analysis.primaryCategory),
      ...(item.sourceTags ?? []).map(cleanUserTag).filter(Boolean).filter(isFoodRelevantTag),
      ...analysis.tags,
    ]),
  ).sort((a, b) => a.localeCompare(b));
}

for (const item of confirmed) {
  const analysis = analysisFor(item);
  const normalizedCategory = analysis.primaryCategory ?? item.category;
  const normalizedEmoji = analysis.emoji ?? item.emoji ?? "❓";
  const normalizedTags = tagsFor(item, analysis);
  const existing = merged.get(item.placeId);
  if (!existing) {
    merged.set(item.placeId, {
      ...item,
      category: normalizedCategory,
      emoji: normalizedEmoji,
      sourceLists: new Set(item.sourceLists ?? []),
      sourceTags: new Set(normalizedTags),
      description: descriptionFor(item),
    });
    continue;
  }

  (item.sourceLists ?? []).forEach((value) => existing.sourceLists.add(value));
  normalizedTags.forEach((value) => existing.sourceTags.add(value));
  if (!existing.description) existing.description = descriptionFor(item);
  if (categoryPriority.indexOf(normalizedCategory) < categoryPriority.indexOf(existing.category)) {
    existing.category = normalizedCategory;
    existing.emoji = normalizedEmoji;
    existing.priceLevel = item.priceLevel;
    existing.priceLevelSource = item.priceLevelSource;
  }
  existing.matchConfidence = Math.max(existing.matchConfidence ?? 0, item.matchConfidence ?? 0);
}

const rows = Array.from(merged.values()).map((item) => ({
  place_id: item.placeId,
  name: item.name,
  category: item.category,
  tags: Array.from(item.sourceTags),
  emoji: item.emoji,
  area: item.area,
  city: item.city,
  country: item.country,
  address: item.address,
  description: item.description,
  source_lists: Array.from(item.sourceLists),
  match_confidence: item.matchConfidence,
  primary_type: item.primaryType,
  place_types: item.placeTypes ?? [],
  price_level: item.priceLevel,
  price_level_source: item.priceLevelSource,
  price_per_person_usd: null,
  latitude: item.position.latitude,
  longitude: item.position.longitude,
  google_maps_url: item.googleMapsUrl,
  opening_hours: null,
  hours_updated_at: null,
  is_published: true,
  updated_at: new Date().toISOString(),
}));

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

for (let start = 0; start < rows.length; start += 100) {
  const batch = rows.slice(start, start + 100);
  const { error } = await supabase.from("restaurants").upsert(batch, { onConflict: "place_id" });
  if (error) throw new Error(`Upload failed near row ${start + 1}: ${error.message}`);
  console.log(`Uploaded ${Math.min(start + batch.length, rows.length)}/${rows.length}`);
}

let unpublishedStaleRows = 0;
if (syncPublished) {
  const currentPlaceIds = new Set(rows.map((row) => row.place_id));
  const publishedPlaceIds = [];
  for (let start = 0; ; start += 1000) {
    const { data, error } = await supabase
      .from("restaurants")
      .select("place_id")
      .eq("is_published", true)
      .range(start, start + 999);
    if (error) throw new Error(`Unable to read existing published places: ${error.message}`);
    publishedPlaceIds.push(...data.map((row) => row.place_id).filter(Boolean));
    if (data.length < 1000) break;
  }

  const stalePlaceIds = publishedPlaceIds.filter((placeId) => !currentPlaceIds.has(placeId));
  for (let start = 0; start < stalePlaceIds.length; start += 100) {
    const batch = stalePlaceIds.slice(start, start + 100);
    const { error } = await supabase
      .from("restaurants")
      .update({ is_published: false, updated_at: new Date().toISOString() })
      .in("place_id", batch);
    if (error) throw new Error(`Unable to unpublish stale places near row ${start + 1}: ${error.message}`);
    unpublishedStaleRows += batch.length;
  }
}

const { count, error: countError } = await supabase.from("restaurants").select("id", { count: "exact", head: true });
if (countError) throw countError;
const { count: publishedCount, error: publishedCountError } = await supabase
  .from("restaurants")
  .select("id", { count: "exact", head: true })
  .eq("is_published", true);
if (publishedCountError) throw publishedCountError;
console.log(JSON.stringify({
  confirmedInputRows: confirmed.length,
  uniquePlacesUploaded: rows.length,
  unpublishedStaleRows,
  remoteRestaurantCount: count,
  publishedRestaurantCount: publishedCount,
}, null, 2));
