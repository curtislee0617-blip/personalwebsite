import { unstable_cache } from "next/cache";
import { recipeEntries, recipesByDate } from "@/lib/recipes";
import { importedRecipeMediaEntries } from "@/data/imported-recipe-media";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";
import type { RecipeCardEntry, RecipeIngredientGroup, RecipeMethodGroup } from "@/lib/recipe-card-types";

type UploadedRecipeRow = {
  id: string;
  description: string;
  recipe_date: string | null;
  thumbnail_url: string;
  image_urls: string[];
  status: string;
  categories: string[] | null;
};

type RecipeOverrideRow = {
  recipe_key: string;
  title: string;
  description: string;
  recipe_date: string | null;
  categories: string[];
  ingredient_groups: Json;
  method_groups: Json;
  linked_recipe_keys: string[];
  thumbnail_url: string | null;
  thumbnail_position: string | null;
  thumbnail_time_seconds: number | null;
  media_items: Json;
};

function isRecord(value: Json): value is { [key: string]: Json | undefined } {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function ingredientGroupsFromJson(value: Json): RecipeIngredientGroup[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((group) => {
    if (!isRecord(group) || typeof group.title !== "string" || !Array.isArray(group.items)) return [];
    const items = group.items.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    return items.length > 0 ? [{ title: group.title.trim() || "Ingredients", items }] : [];
  });
}

function methodGroupsFromJson(value: Json): RecipeMethodGroup[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((group) => {
    if (!isRecord(group) || typeof group.title !== "string" || !Array.isArray(group.steps)) return [];
    const steps = group.steps.filter((step): step is string => typeof step === "string" && step.trim().length > 0);
    return steps.length > 0 ? [{ title: group.title.trim() || "Method", steps }] : [];
  });
}

function mediaFromJson(value: Json, fallback?: RecipeCardEntry["media"]): RecipeCardEntry["media"] {
  if (!Array.isArray(value)) return fallback;
  const fallbackBySrc = new Map((fallback ?? []).map((item) => [item.src, item]));
  const parsed = value.flatMap((item) => {
    if (!isRecord(item) || typeof item.src !== "string" || (item.type !== "image" && item.type !== "video")) return [];
    const original = fallbackBySrc.get(item.src);
    if (!original || original.type !== item.type) return [];
    return [{
      ...original,
      caption: typeof item.caption === "string" ? item.caption.slice(0, 200) : undefined,
    }];
  });
  const included = new Set(parsed.map((item) => item.src));
  return [...parsed, ...(fallback ?? []).filter((item) => !included.has(item.src))];
}

export function parseUploadedRecipe(draft: UploadedRecipeRow): RecipeCardEntry {
  const lines = draft.description.split("\n").map((line) => line.trim()).filter(Boolean);
  const firstLine = lines[0] ?? "Uploaded recipe";
  const title = firstLine.replace(/^#+\s*/, "");
  const description = lines.slice(1).join(" ") || "Uploaded from the recipe admin.";
  const categories = draft.categories?.length ? draft.categories : ["desserts-pastries"];
  const recipeKey = `uploaded-${draft.id}`;

  return {
    recipeKey,
    slug: recipeKey,
    title,
    description,
    status: draft.status,
    date: draft.recipe_date ?? undefined,
    thumbnail: draft.thumbnail_url,
    imageUrls: draft.image_urls,
    categories,
    source: "uploaded",
  };
}

function siteRecipeCards(): RecipeCardEntry[] {
  const writtenRecipes: RecipeCardEntry[] = recipesByDate(recipeEntries).map((entry) => ({
    recipeKey: entry.slug,
    slug: entry.slug,
    title: entry.title,
    description: entry.description,
    status: entry.status,
    date: entry.date,
    category: entry.category,
    categories: entry.categories ?? (entry.category ? [entry.category] : []),
    thumbnail: entry.thumbnail,
    ingredientGroups: entry.ingredientGroups,
    methodGroups: entry.methodGroups,
    source: "site",
  }));
  return [...writtenRecipes, ...importedRecipeMediaEntries];
}

const getUploadedRecipes = unstable_cache(async (): Promise<RecipeCardEntry[]> => {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("recipe_drafts")
      .select("id,description,recipe_date,thumbnail_url,image_urls,status,categories")
      .eq("status", "published")
      .order("recipe_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) return [];
    return data.map(parseUploadedRecipe);
  } catch {
    return [];
  }
}, ["published-recipe-drafts"], { revalidate: 300, tags: ["published-recipes"] });

const getRecipeOverrides = unstable_cache(async (): Promise<RecipeOverrideRow[]> => {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("recipe_card_overrides")
      .select("recipe_key,title,description,recipe_date,categories,ingredient_groups,method_groups,linked_recipe_keys,thumbnail_url,thumbnail_position,thumbnail_time_seconds,media_items");

    if (error) return [];
    return data;
  } catch {
    return [];
  }
}, ["recipe-card-overrides"], { revalidate: 300, tags: ["recipe-card-overrides"] });

function applyOverride(entry: RecipeCardEntry, override?: RecipeOverrideRow): RecipeCardEntry {
  if (!override) return entry;
  return {
    ...entry,
    title: override.title,
    description: override.description,
    date: override.recipe_date ?? undefined,
    category: undefined,
    categories: override.categories,
    ingredientGroups: ingredientGroupsFromJson(override.ingredient_groups),
    methodGroups: methodGroupsFromJson(override.method_groups),
    linkedRecipeKeys: override.linked_recipe_keys.filter((key) => key !== entry.recipeKey),
    thumbnail: override.thumbnail_url ?? entry.thumbnail,
    thumbnailPosition: override.thumbnail_position ?? entry.thumbnailPosition,
    thumbnailTime: override.thumbnail_time_seconds ?? entry.thumbnailTime,
    media: mediaFromJson(override.media_items, entry.media),
  };
}

export async function getPersonalRecipeCards() {
  const [uploaded, overrides] = await Promise.all([getUploadedRecipes(), getRecipeOverrides()]);
  const overrideByKey = new Map(overrides.map((override) => [override.recipe_key, override]));
  return [...siteRecipeCards(), ...uploaded]
    .map((entry) => applyOverride(entry, overrideByKey.get(entry.recipeKey)))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

export function formatIngredientGroups(groups?: RecipeIngredientGroup[]) {
  return (groups ?? []).flatMap((group, index) => [
    ...(index > 0 ? [""] : []),
    `## ${group.title}`,
    ...group.items.map((item) => `- ${item}`),
  ]).join("\n");
}

export function formatMethodGroups(groups?: RecipeMethodGroup[]) {
  return (groups ?? []).flatMap((group, index) => [
    ...(index > 0 ? [""] : []),
    `## ${group.title}`,
    ...group.steps.map((step, stepIndex) => `${stepIndex + 1}. ${step}`),
  ]).join("\n");
}

function parseGroupedLines(value: string, fallbackTitle: string) {
  const groups: Array<{ title: string; lines: string[] }> = [];
  let current = { title: fallbackTitle, lines: [] as string[] };

  for (const rawLine of value.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const heading = line.match(/^#{1,3}\s+(.+)$/);
    if (heading) {
      if (current.lines.length > 0) groups.push(current);
      current = { title: heading[1].trim() || fallbackTitle, lines: [] };
      continue;
    }
    current.lines.push(line.replace(/^(?:[-*•]\s+|\d+[.)]\s+)/, "").trim());
  }

  if (current.lines.length > 0) groups.push(current);
  return groups;
}

export function parseIngredientGroupsEditor(value: string): RecipeIngredientGroup[] {
  return parseGroupedLines(value, "Ingredients").map((group) => ({ title: group.title, items: group.lines }));
}

export function parseMethodGroupsEditor(value: string): RecipeMethodGroup[] {
  return parseGroupedLines(value, "Method").map((group) => ({ title: group.title, steps: group.lines }));
}
