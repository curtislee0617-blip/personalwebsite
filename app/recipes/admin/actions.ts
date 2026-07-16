"use server";

import crypto from "node:crypto";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadToR2 } from "@/lib/r2";
import { clearRecipeAdminCookie, isRecipeAdminAuthenticated, setRecipeAdminCookie } from "@/lib/recipe-admin-auth";
import { isRecipeCategoryId } from "@/data/recipe-categories";
import { getPersonalRecipeCards, parseIngredientGroupsEditor, parseMethodGroupsEditor } from "@/lib/personal-recipes";
import type { Json } from "@/lib/supabase/database.types";
import type { RecipeMediaItem } from "@/lib/recipe-card-types";

export async function loginAction(password: string): Promise<{ ok: boolean }> {
  const adminPassword = process.env.RECIPE_ADMIN_PASSWORD;
  if (!adminPassword || password !== adminPassword) return { ok: false };
  await setRecipeAdminCookie(adminPassword);
  return { ok: true };
}

export async function logoutAction() {
  await clearRecipeAdminCookie();
}

export async function submitRecipe(formData: FormData) {
  if (!(await isRecipeAdminAuthenticated())) redirect("/recipes");

  const description = String(formData.get("description") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const publishNow = String(formData.get("publish_now") ?? "") === "1";
  const categories = formData.getAll("categories").map(String).filter(isRecipeCategoryId);
  const photos = formData.getAll("photos").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  // A YYYY-MM-DD date so old photos can be backdated; null if left blank.
  const rawDate = String(formData.get("recipe_date") ?? "").trim();
  const recipeDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : null;

  if (!description) {
    redirect("/recipes/admin?error=missing");
  }
  if (categories.length === 0) {
    redirect("/recipes/admin?error=missing-categories");
  }

  const draftId = crypto.randomUUID();
  const imageUrls: string[] = [];
  for (const [index, photo] of photos.entries()) {
    const buffer = Buffer.from(await photo.arrayBuffer());
    const safeName = photo.name.replace(/[^a-zA-Z0-9.-]+/g, "-").toLowerCase() || "photo.jpg";
    const key = `recipes/${draftId}/${String(index).padStart(2, "0")}-${safeName}`;
    const url = await uploadToR2(key, buffer, photo.type || "application/octet-stream");
    imageUrls.push(url);
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("recipe_drafts").insert({
    description: title ? `${title}\n\n${description}` : description,
    image_urls: imageUrls,
    thumbnail_url: imageUrls[0] ?? null,
    recipe_date: recipeDate,
    categories: Array.from(new Set(categories)),
    status: publishNow ? "published" : "pending",
  });
  if (error) {
    console.error("Failed to save recipe draft", error);
    redirect("/recipes/admin?error=save-failed");
  }
  if (publishNow) updateTag("published-recipes");
  redirect("/recipes/admin?submitted=1");
}

export async function markProcessed(formData: FormData) {
  if (!(await isRecipeAdminAuthenticated())) redirect("/recipes");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = createAdminClient();
  await supabase.from("recipe_drafts").update({ status: "processed" }).eq("id", id);
  updateTag("published-recipes");
  updateTag("recipe-card-overrides");
  redirect("/recipes/admin");
}

export async function saveRecipeCard(formData: FormData) {
  if (!(await isRecipeAdminAuthenticated())) redirect("/recipes");

  const recipeKey = String(formData.get("recipe_key") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const rawDate = String(formData.get("recipe_date") ?? "").trim();
  const recipeDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : null;
  const categories = Array.from(new Set(formData.getAll("categories").map(String).filter(isRecipeCategoryId)));
  const ingredientGroups = parseIngredientGroupsEditor(String(formData.get("ingredient_groups") ?? ""));
  const methodGroups = parseMethodGroupsEditor(String(formData.get("method_groups") ?? ""));
  let thumbnailUrl = String(formData.get("thumbnail_url") ?? "").trim() || null;
  const rawThumbnailPosition = String(formData.get("thumbnail_position") ?? "").trim();
  const thumbnailPosition = /^\d{1,3}(?:\.\d+)?%\s+\d{1,3}(?:\.\d+)?%$/.test(rawThumbnailPosition)
    ? rawThumbnailPosition
    : "50% 50%";
  const rawThumbnailTime = Number(formData.get("thumbnail_time_seconds") ?? 0);
  const thumbnailTime = Number.isFinite(rawThumbnailTime) ? Math.min(3600, Math.max(0, rawThumbnailTime)) : 0;

  const recipes = await getPersonalRecipeCards();
  const availableKeys = new Set(recipes.map((recipe) => recipe.recipeKey));
  if (!availableKeys.has(recipeKey)) redirect("/recipes/admin?error=recipe-not-found");

  const linkedRecipeKeys = Array.from(new Set(formData.getAll("linked_recipes").map(String)))
    .filter((key) => key !== recipeKey && availableKeys.has(key))
    .slice(0, 30);

  const editHref = `/recipes/admin/edit/${encodeURIComponent(recipeKey)}`;
  const recipe = recipes.find((entry) => entry.recipeKey === recipeKey);
  const permittedThumbnails = new Set([
    recipe?.thumbnail,
    ...(recipe?.imageUrls ?? []),
    ...(recipe?.media ?? []).flatMap((item) => [item.src, item.poster]),
  ].filter((value): value is string => Boolean(value)));
  const originalMedia: RecipeMediaItem[] = recipe?.media ?? (recipe?.imageUrls ?? []).map((src) => ({ src, type: "image" as const }));
  const originalMediaBySrc = new Map(originalMedia.map((item) => [item.src, item]));
  let mediaItems = originalMedia;
  try {
    const submitted = JSON.parse(String(formData.get("media_items") ?? "[]")) as Array<{ src?: unknown; type?: unknown; caption?: unknown }>;
    const ordered = submitted.flatMap((item) => {
      if (typeof item.src !== "string" || (item.type !== "image" && item.type !== "video")) return [];
      const original = originalMediaBySrc.get(item.src);
      if (!original || original.type !== item.type) return [];
      return [{ ...original, caption: typeof item.caption === "string" ? item.caption.trim().slice(0, 200) : undefined }];
    });
    const included = new Set(ordered.map((item) => item.src));
    mediaItems = [...ordered, ...originalMedia.filter((item) => !included.has(item.src))];
  } catch {
    mediaItems = originalMedia;
  }

  if (!title || categories.length === 0 || (thumbnailUrl && !permittedThumbnails.has(thumbnailUrl))) {
    redirect(`${editHref}?error=missing`);
  }

  const newPhotos = formData.getAll("new_photos").filter((entry): entry is File => (
    entry instanceof File && entry.size > 0 && entry.type.startsWith("image/")
  )).slice(0, 30);
  const newMedia: RecipeMediaItem[] = [];
  for (const photo of newPhotos) {
    const buffer = Buffer.from(await photo.arrayBuffer());
    const safeName = photo.name.replace(/[^a-zA-Z0-9.-]+/g, "-").toLowerCase() || "photo.jpg";
    const safeRecipeKey = recipeKey.replace(/[^a-zA-Z0-9-]+/g, "-").toLowerCase();
    const key = `recipes/overrides/${safeRecipeKey}/${crypto.randomUUID()}-${safeName}`;
    const src = await uploadToR2(key, buffer, photo.type);
    newMedia.push({ src, type: "image" });
  }
  mediaItems = [...mediaItems, ...newMedia];
  thumbnailUrl ??= newMedia[0]?.src ?? null;

  const supabase = createAdminClient();
  const { error } = await supabase.from("recipe_card_overrides").upsert({
    recipe_key: recipeKey,
    title,
    description,
    recipe_date: recipeDate,
    categories,
    ingredient_groups: ingredientGroups as unknown as Json,
    method_groups: methodGroups as unknown as Json,
    linked_recipe_keys: linkedRecipeKeys,
    thumbnail_url: thumbnailUrl,
    thumbnail_position: thumbnailPosition,
    thumbnail_time_seconds: thumbnailTime,
    media_items: mediaItems as unknown as Json,
  }, { onConflict: "recipe_key" });

  if (error) {
    console.error("Failed to update recipe card", error);
    redirect(`${editHref}?error=save-failed`);
  }

  updateTag("published-recipes");
  updateTag("recipe-card-overrides");
  redirect(`/recipes?updated=1#recipe-${recipeKey}`);
}
