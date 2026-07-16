import { unstable_cache } from "next/cache";
import { recipeEntries, recipesByDate } from "@/lib/recipes";
import { importedRecipeMediaEntries } from "@/data/imported-recipe-media";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";
import type { RecipeCardEntry, RecipeIngredientGroup, RecipeMediaItem, RecipeMethodGroup } from "@/lib/recipe-card-types";

type UploadedRecipeRow = {
  id: string;
  description: string;
  recipe_date: string | null;
  thumbnail_url: string | null;
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
  thumbnail_zoom: number | null;
  thumbnail_time_seconds: number | null;
  media_items: Json;
};

function isRecord(value: Json): value is { [key: string]: Json | undefined } {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function ingredientGroupsFromJson(value: Json): RecipeIngredientGroup[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((group): RecipeIngredientGroup[] => {
    if (!isRecord(group) || typeof group.title !== "string" || !Array.isArray(group.items)) return [];
    const parsed: RecipeIngredientGroup[] = [];
    let current = { title: group.title.replace(/^#{1,3}\s*/, "").trim() || "Ingredients", items: [] as string[] };
    const flush = () => {
      if (current.items.length > 0) parsed.push(current);
    };
    for (const item of group.items) {
      if (typeof item !== "string" || !item.trim()) continue;
      const heading = item.trim().match(/^#{1,3}\s*(.+)$/);
      if (heading) {
        flush();
        current = { title: heading[1].trim() || "Ingredients", items: [] };
      } else {
        current.items.push(item.trim());
      }
    }
    flush();
    return parsed;
  });
}

function methodGroupsFromJson(value: Json): RecipeMethodGroup[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((group): RecipeMethodGroup[] => {
    if (!isRecord(group) || typeof group.title !== "string" || !Array.isArray(group.steps)) return [];
    const parsed: RecipeMethodGroup[] = [];
    let current = { title: group.title.replace(/^#{1,3}\s*/, "").trim() || "Method", steps: [] as string[] };
    const flush = () => {
      if (current.steps.length > 0) parsed.push(current);
    };
    for (const step of group.steps) {
      if (typeof step !== "string" || !step.trim()) continue;
      const heading = step.trim().match(/^#{1,3}\s*(.+)$/);
      if (heading) {
        flush();
        current = { title: heading[1].trim() || "Method", steps: [] };
      } else {
        current.steps.push(step.trim());
      }
    }
    flush();
    return parsed;
  });
}

function mediaFromJson(value: Json, fallback?: RecipeCardEntry["media"]): RecipeCardEntry["media"] {
  if (!Array.isArray(value)) return fallback;
  const fallbackBySrc = new Map((fallback ?? []).map((item) => [item.src, item]));
  const parsed: RecipeMediaItem[] = [];
  for (const item of value) {
    if (!isRecord(item) || typeof item.src !== "string" || (item.type !== "image" && item.type !== "video")) continue;
    const original = fallbackBySrc.get(item.src);
    if (original && original.type !== item.type) continue;
    parsed.push({
      ...(original ?? { src: item.src, type: item.type }),
      alt: typeof item.alt === "string" ? item.alt.slice(0, 200) : original?.alt,
      poster: typeof item.poster === "string" ? item.poster : original?.poster,
      caption: typeof item.caption === "string" ? item.caption.slice(0, 200) : undefined,
      position: typeof item.position === "string" && /^\d{1,3}(?:\.\d+)?%\s+\d{1,3}(?:\.\d+)?%$/.test(item.position) ? item.position : original?.position,
      zoom: typeof item.zoom === "number" && Number.isFinite(item.zoom) ? Math.min(4, Math.max(1, item.zoom)) : original?.zoom,
    });
  }
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
    thumbnail: draft.thumbnail_url ?? undefined,
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
  const bossamAndJjampong = importedRecipeMediaEntries.find((entry) => entry.recipeKey === "personal-bossam-jjampong");
  const bossamAndJjampongCopy: RecipeCardEntry[] = bossamAndJjampong ? [{
    ...bossamAndJjampong,
    recipeKey: "personal-bossam-jjampong-copy",
    slug: "personal-bossam-jjampong-copy",
    title: "Bossam&Jjampong (copy)",
    media: bossamAndJjampong.media?.map((item) => ({ ...item })),
  }] : [];
  return [...writtenRecipes, ...importedRecipeMediaEntries, ...bossamAndJjampongCopy];
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
      .select("recipe_key,title,description,recipe_date,categories,ingredient_groups,method_groups,linked_recipe_keys,thumbnail_url,thumbnail_position,thumbnail_zoom,thumbnail_time_seconds,media_items");

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
    thumbnailZoom: override.thumbnail_zoom ?? entry.thumbnailZoom,
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
    const heading = line.match(/^#{1,3}\s*(.+)$/);
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
