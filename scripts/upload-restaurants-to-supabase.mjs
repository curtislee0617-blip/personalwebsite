import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const inputPath = process.argv[2] ?? "imports/google-maps/staging/enriched-restaurants.json";
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
  "Bars", "Asian Fancy", "Fine Dining", "Western Nicer", "Bakeries", "Tacos", "Burgers",
  "Chicken", "Ramen", "Sushi", "Pizza", "Cafés", "Desserts", "South Asian", "East Asian",
  "Southeast Asian", "Middle Eastern", "African", "Casual", "Unclassified",
];
const source = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const confirmed = source.restaurants.filter((item) => item.status === "ready" && item.placeId && item.position);
const merged = new Map();

function descriptionFor(item) {
  return [item.comment, item.note].map((value) => value?.trim()).filter(Boolean).filter((value, index, all) => all.indexOf(value) === index).join(" — ") || null;
}

for (const item of confirmed) {
  const existing = merged.get(item.placeId);
  if (!existing) {
    merged.set(item.placeId, {
      ...item,
      sourceLists: new Set(item.sourceLists ?? []),
      sourceTags: new Set(item.sourceTags ?? []),
      description: descriptionFor(item),
    });
    continue;
  }

  (item.sourceLists ?? []).forEach((value) => existing.sourceLists.add(value));
  (item.sourceTags ?? []).forEach((value) => existing.sourceTags.add(value));
  if (!existing.description) existing.description = descriptionFor(item);
  if (categoryPriority.indexOf(item.category) < categoryPriority.indexOf(existing.category)) {
    existing.category = item.category;
    existing.emoji = item.emoji;
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

const { count, error: countError } = await supabase.from("restaurants").select("id", { count: "exact", head: true });
if (countError) throw countError;
console.log(JSON.stringify({ confirmedInputRows: confirmed.length, uniquePlacesUploaded: rows.length, remoteRestaurantCount: count }, null, 2));
