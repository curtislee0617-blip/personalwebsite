import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getImportedCookbook } from "@/lib/imported-cookbooks";
import { isRecipeAdminAuthenticated } from "@/lib/recipe-admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isRecipeAdminAuthenticated())) {
    return NextResponse.json({ authenticated: false, recipeIds: [] });
  }

  const cookbookId = new URL(request.url).searchParams.get("cookbookId")?.trim() ?? "";
  if (!getImportedCookbook(cookbookId)) {
    return NextResponse.json({ error: "Cookbook not found." }, { status: 404 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("recipe_wishlist_entries")
    .select("recipe_id")
    .eq("cookbook_id", cookbookId);

  if (error) {
    console.error("Failed to load cookbook wishlist", error);
    return NextResponse.json({ error: "Wishlist could not be loaded." }, { status: 500 });
  }

  return NextResponse.json({
    authenticated: true,
    recipeIds: data.flatMap((entry) => entry.recipe_id ? [entry.recipe_id] : []),
  });
}

export async function POST(request: Request) {
  if (!(await isRecipeAdminAuthenticated())) {
    return NextResponse.json({ error: "Admin login required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as {
    action?: unknown;
    cookbookId?: unknown;
    recipeId?: unknown;
  } | null;
  const action = body?.action;
  const cookbookId = typeof body?.cookbookId === "string" ? body.cookbookId.trim() : "";
  const recipeId = typeof body?.recipeId === "string" ? body.recipeId.trim() : "";
  const cookbook = getImportedCookbook(cookbookId);
  const recipe = cookbook?.recipes.find((entry) => entry.id === recipeId);

  if (!cookbook || !recipe || (action !== "add" && action !== "remove")) {
    return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
  }

  const sourceKey = `cookbook:${cookbook.id}:${recipe.id}`;
  const supabase = createAdminClient();
  const result = action === "remove"
    ? await supabase.from("recipe_wishlist_entries").delete().eq("source_key", sourceKey)
    : await supabase.from("recipe_wishlist_entries").upsert({
      source_key: sourceKey,
      title: recipe.title,
      note: recipe.subtitle?.trim() || `${recipe.category} recipe from ${cookbook.title}.`,
      href: `/recipes/${cookbook.id}#${cookbook.id}-${recipe.id}`,
      image_url: recipe.image ?? null,
      cookbook_id: cookbook.id,
      recipe_id: recipe.id,
      book_title: cookbook.title,
    }, { onConflict: "source_key" });

  if (result.error) {
    console.error("Failed to update cookbook wishlist", result.error);
    return NextResponse.json({ error: "Wishlist could not be updated." }, { status: 500 });
  }

  revalidatePath("/recipes");
  return NextResponse.json({ inWishlist: action === "add" });
}
