import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isRecipeAdminAuthenticated } from "@/lib/recipe-admin-auth";
import { getInstagramSavedRecipeCards, getYouTubeSavedRecipeCards } from "@/lib/personal-recipes";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isRecipeAdminAuthenticated())) {
    return NextResponse.json({ error: "Admin login required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as {
    action?: unknown;
    recipeKey?: unknown;
  } | null;
  const action = body?.action;
  const recipeKey = typeof body?.recipeKey === "string" ? body.recipeKey.trim() : "";
  const [instagramRecipes, youtubeRecipes] = await Promise.all([
    getInstagramSavedRecipeCards(),
    getYouTubeSavedRecipeCards(),
  ]);
  const recipe = [...instagramRecipes, ...youtubeRecipes].find((entry) => entry.recipeKey === recipeKey);

  if (!recipe || (action !== "add" && action !== "remove")) {
    return NextResponse.json({ error: "Media-saved recipe not found." }, { status: 404 });
  }

  const sourceKey = `media:${recipe.recipeKey}`;
  const isYouTube = recipe.recipeKey.startsWith("youtube-saved-");
  const collectionPath = isYouTube ? "/recipes/youtube-saved" : "/recipes/instagram-saved";
  const collectionTitle = isYouTube ? "YouTube saved recipes" : "Instagram saved recipes";
  const supabase = createAdminClient();
  const result = action === "remove"
    ? await supabase.from("recipe_wishlist_entries").delete().eq("source_key", sourceKey)
    : await supabase.from("recipe_wishlist_entries").upsert({
      source_key: sourceKey,
      title: recipe.title,
      note: recipe.description || `Saved from ${recipe.sourceLabel ?? (isYouTube ? "YouTube" : "Instagram")}.`,
      href: `${collectionPath}#recipe-${recipe.slug}`,
      image_url: recipe.thumbnail ?? null,
      cookbook_id: null,
      recipe_id: recipe.recipeKey,
      book_title: collectionTitle,
    }, { onConflict: "source_key" });

  if (result.error) {
    console.error("Failed to update media-saved wishlist", result.error);
    return NextResponse.json({ error: "Wishlist could not be updated." }, { status: 500 });
  }

  revalidatePath("/recipes");
  revalidatePath("/recipes/instagram-saved");
  revalidatePath("/recipes/youtube-saved");
  return NextResponse.json({ inWishlist: action === "add" });
}
