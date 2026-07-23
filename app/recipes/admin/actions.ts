"use server";

import crypto from "node:crypto";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadRecipeMedia } from "@/lib/media-storage";
import { clearRecipeAdminCookie, isRecipeAdminAuthenticated, setRecipeAdminCookie } from "@/lib/recipe-admin-auth";
import { isRecipeCategoryId } from "@/data/recipe-categories";
import { getEditableRecipeCards, parseIngredientGroupsEditor, parseMethodGroupsEditor } from "@/lib/personal-recipes";
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
  const ingredientGroups = parseIngredientGroupsEditor(String(formData.get("ingredient_groups") ?? ""));
  const methodGroups = parseMethodGroupsEditor(String(formData.get("method_groups") ?? ""));
  const categories = Array.from(new Set(formData.getAll("categories").map(String).filter(isRecipeCategoryId)));
  const photos = formData.getAll("photos").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  // A YYYY-MM-DD date so old photos can be backdated; null if left blank.
  const rawDate = String(formData.get("recipe_date") ?? "").trim();
  const recipeDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : null;

  if (!title || ingredientGroups.length === 0 || methodGroups.length === 0) {
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
    const url = await uploadRecipeMedia(key, buffer, photo.type || "application/octet-stream");
    imageUrls.push(url);
  }

  const supabase = createAdminClient();
  const { error: draftError } = await supabase.from("recipe_drafts").insert({
    id: draftId,
    description: description ? `${title}\n\n${description}` : title,
    image_urls: imageUrls,
    thumbnail_url: imageUrls[0] ?? null,
    recipe_date: recipeDate,
    categories,
    status: "published",
  });
  if (draftError) {
    console.error("Failed to save recipe draft", draftError);
    redirect("/recipes/admin?error=save-failed");
  }

  const recipeKey = `uploaded-${draftId}`;
  const mediaItems: RecipeMediaItem[] = imageUrls.map((src) => ({ src, type: "image" }));
  const { error: overrideError } = await supabase.from("recipe_card_overrides").upsert({
    recipe_key: recipeKey,
    title,
    description,
    recipe_date: recipeDate,
    categories,
    ingredient_groups: ingredientGroups as unknown as Json,
    method_groups: methodGroups as unknown as Json,
    linked_recipe_keys: [],
    thumbnail_url: imageUrls[0] ?? null,
    thumbnail_position: "50% 50%",
    thumbnail_zoom: 1,
    thumbnail_time_seconds: 0,
    media_items: mediaItems as unknown as Json,
    deleted: false,
  }, { onConflict: "recipe_key" });

  if (overrideError) {
    console.error("Failed to create published recipe card", overrideError);
    await supabase.from("recipe_drafts").delete().eq("id", draftId);
    redirect("/recipes/admin?error=save-failed");
  }

  updateTag("published-recipes");
  updateTag("recipe-card-overrides");
  redirect(`/recipes?published=1#recipe-${recipeKey}`);
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
  const rawThumbnailZoom = Number(formData.get("thumbnail_zoom") ?? 1);
  const thumbnailZoom = Number.isFinite(rawThumbnailZoom) ? Math.min(4, Math.max(1, rawThumbnailZoom)) : 1;
  const rawThumbnailTime = Number(formData.get("thumbnail_time_seconds") ?? 0);
  const thumbnailTime = Number.isFinite(rawThumbnailTime) ? Math.min(3600, Math.max(0, rawThumbnailTime)) : 0;

  const recipes = await getEditableRecipeCards();
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
    const submitted = JSON.parse(String(formData.get("media_items") ?? "[]")) as Array<{ src?: unknown; type?: unknown; caption?: unknown; position?: unknown; zoom?: unknown }>;
    const ordered = submitted.flatMap((item) => {
      if (typeof item.src !== "string" || (item.type !== "image" && item.type !== "video")) return [];
      const original = originalMediaBySrc.get(item.src);
      if (!original || original.type !== item.type) return [];
      const position = typeof item.position === "string" && /^\d{1,3}(?:\.\d+)?%\s+\d{1,3}(?:\.\d+)?%$/.test(item.position)
        ? item.position
        : original.position;
      const rawZoom = Number(item.zoom ?? original.zoom ?? 1);
      const zoom = Number.isFinite(rawZoom) ? Math.min(4, Math.max(1, rawZoom)) : 1;
      return [{
        ...original,
        caption: typeof item.caption === "string" ? item.caption.trim().slice(0, 200) : undefined,
        position,
        zoom,
      }];
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
    const src = await uploadRecipeMedia(key, buffer, photo.type);
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
    thumbnail_zoom: thumbnailZoom,
    thumbnail_time_seconds: thumbnailTime,
    media_items: mediaItems as unknown as Json,
    deleted: false,
  }, { onConflict: "recipe_key" });

  if (error) {
    console.error("Failed to update recipe card", error);
    redirect(`${editHref}?error=save-failed`);
  }

  updateTag("published-recipes");
  updateTag("recipe-card-overrides");
  redirect(`/recipes?updated=1#recipe-${recipeKey}`);
}

export async function deleteRecipeCard(formData: FormData) {
  if (!(await isRecipeAdminAuthenticated())) redirect("/recipes");

  const recipeKey = String(formData.get("recipe_key") ?? "").trim();
  const returnTo = String(formData.get("return_to") ?? "/recipes").trim();
  const recipes = await getEditableRecipeCards();
  const recipe = recipes.find((entry) => entry.recipeKey === recipeKey);
  if (!recipe) redirect("/recipes/admin?error=recipe-not-found");

  const supabase = createAdminClient();
  const { error } = await supabase.from("recipe_card_overrides").upsert({
    recipe_key: recipe.recipeKey,
    title: recipe.title,
    description: recipe.description,
    recipe_date: recipe.date ?? null,
    categories: recipe.categories ?? (recipe.category ? [recipe.category] : []),
    ingredient_groups: (recipe.ingredientGroups ?? []) as unknown as Json,
    method_groups: (recipe.methodGroups ?? []) as unknown as Json,
    linked_recipe_keys: recipe.linkedRecipeKeys ?? [],
    thumbnail_url: recipe.thumbnail ?? null,
    thumbnail_position: recipe.thumbnailPosition ?? "50% 50%",
    thumbnail_zoom: recipe.thumbnailZoom ?? 1,
    thumbnail_time_seconds: recipe.thumbnailTime ?? 0,
    media_items: (recipe.media ?? []) as unknown as Json,
    deleted: true,
  }, { onConflict: "recipe_key" });

  if (error) {
    console.error("Failed to delete recipe card", error);
    redirect(`/recipes/admin/edit/${encodeURIComponent(recipeKey)}?error=save-failed`);
  }

  updateTag("published-recipes");
  updateTag("recipe-card-overrides");
  redirect(returnTo.startsWith("/recipes") ? returnTo : "/recipes");
}
