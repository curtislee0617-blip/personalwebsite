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
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const separator = line.indexOf("=");
    return [line.slice(0, separator), line.slice(separator + 1)];
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
    .select("id,name,category,emoji,tags,source_lists,primary_type,place_types,price_level,is_published")
    .eq("is_published", true)
    .range(start, start + 999);

  if (error) throw new Error(`Unable to load restaurants: ${error.message}`);
  restaurants.push(...data);
  if (data.length < 1000) break;
}

const candidates = limit > 0 ? restaurants.slice(0, limit) : restaurants;
const changes = [];

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
  changes,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(JSON.stringify({ checked: candidates.length, changed: changes.length }, null, 2));
console.log(`Wrote ${outputPath}`);
