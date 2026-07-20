import { unstable_cache } from "next/cache";
import { recipeEntries, recipesByDate } from "@/lib/recipes";
import { importedRecipeMediaEntries } from "@/data/imported-recipe-media";
import { instagramSavedRecipes } from "@/data/instagram-saved-recipes";
import { instagramSavedReelAnalysis } from "@/data/instagram-saved-reel-analysis";
import { instagramHighlightRecipeMetadata } from "@/data/instagram-highlight-recipe-metadata";
import { personalRecipeCategories } from "@/data/personal-recipe-categories";
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
  deleted: boolean;
};

const legacyImportedRecipeTitles: Record<string, readonly string[]> = {
  "personal-banhmi": ["BanhMi"],
  "personal-bolalot": ["BoLaLot"],
  "personal-bossam-jjampong": ["Bossam&Jjampong"],
  "personal-bossam-jjampong-copy": ["Bossam&Jjampong (copy)"],
  "personal-buncha": ["BunCha"],
  "personal-caneles": ["Caneles"],
  "personal-chacalan": ["ChaCaLan"],
  "personal-daikoncake": ["DaikonCake"],
  "personal-fishandchips": ["FishAndChips"],
  "personal-friedeelwnuocmam": ["FriedEelWNuocMam"],
  "personal-gamtaefishnchips": ["GamtaeFishNChips"],
  "personal-gonchauauhor": ["GonChauAuHor"],
  "personal-grilledchickenviet": ["GrilledChickenViet"],
  "personal-hariyali-chicken": ["Hariyali_Chicken"],
  "personal-muhallebi": ["Muhallebi"],
  "personal-pho": ["Pho"],
  "personal-phoschool": ["phoschool"],
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
  const importedWithHighlightMetadata: RecipeCardEntry[] = importedRecipeMediaEntries.map((entry) => {
    const recipeEntry: RecipeCardEntry = entry;
    const metadata = instagramHighlightRecipeMetadata[recipeEntry.recipeKey];
    const categories = personalRecipeCategories[recipeEntry.recipeKey];
    if (!metadata && !categories) return recipeEntry;
    const storyText = metadata?.storyText?.trim();
    return {
      ...recipeEntry,
      date: metadata?.date ?? recipeEntry.date,
      categories: categories ? [...categories] : recipeEntry.categories,
      description: [recipeEntry.description.trim(), storyText ? `Instagram story note: ${storyText}` : ""]
        .filter(Boolean)
        .join(" "),
    };
  });
  const bossamAndJjampong = importedWithHighlightMetadata.find((entry) => entry.recipeKey === "personal-bossam-jjampong");
  const bossamAndJjampongCopy: RecipeCardEntry[] = bossamAndJjampong ? [{
    ...bossamAndJjampong,
    recipeKey: "personal-bossam-jjampong-copy",
    slug: "personal-bossam-jjampong-copy",
    title: "Bossam (보쌈)",
    description: "Korean boiled pork belly wraps with salted napa cabbage, saewoo-jeot seasoning, and ssamjang, adapted from Serious Eats.",
    date: instagramHighlightRecipeMetadata["personal-bossam-jjampong-copy"]?.date,
    sourceLabel: "Serious Eats",
    sourceUrl: "https://www.seriouseats.com/bossam-korean-boiled-pork-wraps",
    categories: [...personalRecipeCategories["personal-bossam-jjampong-copy"]],
    ingredientGroups: [
      {
        title: "Salted napa cabbage",
        items: [
          "Kosher salt, as needed",
          "Inner leaves from 1/2 napa cabbage",
        ],
      },
      {
        title: "Pork",
        items: [
          "680 g skinless pork belly",
          "Rice-rinsing water, enough to cover the pork (optional; plain water may be used)",
          "45 ml doenjang",
          "1 medium onion, skin left on and quartered",
          "10 scallions, or 3 Korean large scallions (daepah), cut into short lengths",
          "1/2 apple, cored and quartered",
          "1 piece fresh ginger, thinly sliced",
          "1 cinnamon stick",
          "10 garlic cloves",
          "1 tsp whole black peppercorns",
          "1 bay leaf",
          "60 ml soju or vodka",
        ],
      },
      {
        title: "Saewoo-jeot seasoning",
        items: [
          "8 ml saewoo jeot (salted fermented shrimp)",
          "8 ml soju or vodka",
          "Gochugaru, to taste (optional)",
          "Toasted sesame seeds, to taste (optional)",
          "Green Korean chilli, thinly sliced (optional)",
        ],
      },
      {
        title: "Ssamjang",
        items: [
          "15 ml doenjang",
          "15 ml gochujang",
          "1/2 tsp toasted sesame seeds",
          "1 garlic clove, finely grated",
          "1/8 tsp toasted sesame oil",
        ],
      },
      {
        title: "To serve",
        items: [
          "Mu malaengi muchim (seasoned dried radish), optional",
          "Thinly sliced raw garlic",
          "Thinly sliced green Korean chilli",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Salt the cabbage",
        steps: [
          "Sprinkle the cabbage leaves evenly with salt, working it between the layers. Leave until softened and pliable, then rinse thoroughly and drain.",
        ],
      },
      {
        title: "Cook the pork",
        steps: [
          "Place the pork in a pot and cover with rice-rinsing water or plain water. Add the doenjang, onion, scallions, apple, ginger, cinnamon, garlic, peppercorns, bay leaf, and soju.",
          "Bring to a boil, then reduce to a steady simmer. Cook until the pork is tender but still holds its shape, approximately 1 hour, turning it occasionally so it cooks evenly.",
          "Lift out the pork and rest it briefly. Slice across the grain into pieces about 6 mm thick while still warm.",
        ],
      },
      {
        title: "Seasonings and assembly",
        steps: [
          "Mix the saewoo jeot with the soju. Add gochugaru, sesame seeds, and sliced chilli if using.",
          "Mix the doenjang, gochujang, sesame seeds, grated garlic, and sesame oil to make the ssamjang.",
          "Arrange the warm pork with the cabbage, saewoo-jeot seasoning, ssamjang, and optional accompaniments. Wrap the pork and condiments in individual cabbage leaves to eat.",
        ],
      },
    ],
    media: bossamAndJjampong.media?.map((item) => ({ ...item })),
  }] : [];
  return [...writtenRecipes, ...importedWithHighlightMetadata, ...bossamAndJjampongCopy];
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
      .select("recipe_key,title,description,recipe_date,categories,ingredient_groups,method_groups,linked_recipe_keys,thumbnail_url,thumbnail_position,thumbnail_zoom,thumbnail_time_seconds,media_items,deleted");

    if (error) return [];
    return data;
  } catch {
    return [];
  }
}, ["recipe-card-overrides"], { revalidate: 300, tags: ["recipe-card-overrides"] });

function applyOverride(entry: RecipeCardEntry, override?: RecipeOverrideRow): RecipeCardEntry {
  if (!override) return entry;
  const legacyTitle = legacyImportedRecipeTitles[entry.recipeKey]?.includes(override.title) ?? false;
  const ingredientGroups = ingredientGroupsFromJson(override.ingredient_groups);
  const methodGroups = methodGroupsFromJson(override.method_groups);
  return {
    ...entry,
    title: legacyTitle ? entry.title : override.title,
    description: override.description || entry.description,
    date: override.recipe_date ?? entry.date,
    category: undefined,
    categories: legacyTitle ? (entry.categories ?? override.categories) : override.categories,
    ingredientGroups: ingredientGroups.length > 0 ? ingredientGroups : entry.ingredientGroups,
    methodGroups: methodGroups.length > 0 ? methodGroups : entry.methodGroups,
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
    .filter((entry) => !overrideByKey.get(entry.recipeKey)?.deleted)
    .map((entry) => applyOverride(entry, overrideByKey.get(entry.recipeKey)))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

export async function getInstagramSavedRecipeCards() {
  const overrides = await getRecipeOverrides();
  const overrideByKey = new Map(overrides.map((override) => [override.recipe_key, override]));
  return instagramSavedRecipes
    .filter((entry) => !overrideByKey.get(entry.recipeKey)?.deleted)
    .map((entry) => ({
      ...entry,
      ...(instagramSavedReelAnalysis[entry.recipeKey] ?? {}),
    }))
    .map((entry) => applyOverride(entry, overrideByKey.get(entry.recipeKey)));
}

export async function getEditableRecipeCards() {
  const [personal, instagram] = await Promise.all([
    getPersonalRecipeCards(),
    getInstagramSavedRecipeCards(),
  ]);
  return [...personal, ...instagram];
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
