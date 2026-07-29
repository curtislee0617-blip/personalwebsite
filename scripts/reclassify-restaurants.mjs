import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { analyzeRestaurantCategories } from "./restaurant-classification.mjs";

const args = process.argv.slice(2);
const applyChanges = args.includes("--apply");
const limit = Math.max(0, Number(args.find((arg) => arg.startsWith("--limit="))?.split("=")[1] ?? 0));
const outputPath = args.find((arg) => arg.startsWith("--output="))?.split("=").slice(1).join("=")
  ?? "imports/google-maps/staging/reclassification-audit.json";

const env = Object.fromEntries(
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

if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required in .env.local");
  process.exit(1);
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const restaurants = [];
for (let start = 0; ; start += 1000) {
  const { data, error } = await supabase
    .from("restaurants")
    .select("id,place_id,name,category,emoji,tags,source_lists,primary_type,place_types,price_level,area,city,country,address,google_maps_url,is_published")
    .eq("is_published", true)
    .range(start, start + 999);

  if (error) throw new Error(`Unable to load restaurants: ${error.message}`);
  restaurants.push(...data);
  if (data.length < 1000) break;
}

const candidates = limit > 0 ? restaurants.slice(0, limit) : restaurants;
const changes = [];
const records = [];

for (const restaurant of candidates) {
  const analysis = analyzeRestaurantCategories({
    name: restaurant.name,
    primaryType: restaurant.primary_type ?? "",
    placeTypes: restaurant.place_types ?? [],
    sourceCategory: restaurant.category,
    sourceLists: restaurant.source_lists ?? [],
    priceLevel: restaurant.price_level ?? null,
    tags: restaurant.tags ?? [],
  });

  const nextCategory = analysis.primaryCategory;
  const nextEmoji = analysis.emoji;
  const nextTags = analysis.tags;
  const categoryChanged = nextCategory !== restaurant.category;
  const emojiChanged = nextEmoji !== restaurant.emoji;
  const tagsChanged = JSON.stringify(nextTags) !== JSON.stringify(restaurant.tags ?? []);

  records.push({
    id: restaurant.id,
    placeId: restaurant.place_id,
    name: restaurant.name,
    currentCategory: restaurant.category,
    currentEmoji: restaurant.emoji,
    currentTags: restaurant.tags ?? [],
    sourceLists: restaurant.source_lists ?? [],
    primaryType: restaurant.primary_type ?? null,
    placeTypes: restaurant.place_types ?? [],
    priceLevel: restaurant.price_level ?? null,
    area: restaurant.area ?? null,
    city: restaurant.city ?? null,
    country: restaurant.country ?? null,
    address: restaurant.address ?? null,
    googleMapsUrl: restaurant.google_maps_url ?? null,
    isPublished: restaurant.is_published,
    suggestedCategory: nextCategory,
    suggestedEmoji: nextEmoji,
    suggestedTags: nextTags,
    secondaryCategories: analysis.secondaryCategories,
    confidence: analysis.confidence,
    reasons: analysis.reasons,
  });

  if (!categoryChanged && !emojiChanged && !tagsChanged) continue;

  const change = {
    id: restaurant.id,
    name: restaurant.name,
    currentCategory: restaurant.category,
    nextCategory,
    currentEmoji: restaurant.emoji,
    nextEmoji,
    currentTags: restaurant.tags ?? [],
    nextTags,
    secondaryCategories: analysis.secondaryCategories,
    confidence: analysis.confidence,
    reasons: analysis.reasons,
  };
  changes.push(change);

  if (applyChanges) {
    const { error } = await supabase
      .from("restaurants")
      .update({
        category: nextCategory,
        emoji: nextEmoji,
        tags: nextTags,
        updated_at: new Date().toISOString(),
      })
      .eq("id", restaurant.id);

    if (error) throw new Error(`Unable to update ${restaurant.name}: ${error.message}`);
  }
}

const payload = {
  generatedAt: new Date().toISOString(),
  applyChanges,
  checked: candidates.length,
  changed: changes.length,
  records,
  changes,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(JSON.stringify({ checked: candidates.length, changed: changes.length }, null, 2));
console.log(`Wrote ${outputPath}`);
