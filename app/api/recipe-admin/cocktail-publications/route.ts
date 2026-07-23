import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { cocktailPublicationKey, getCocktailBook } from "@/lib/cocktail-books";
import { isRecipeAdminAuthenticated } from "@/lib/recipe-admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isRecipeAdminAuthenticated())) {
    return NextResponse.json({ error: "Admin login required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as {
    action?: unknown;
    bookId?: unknown;
    recipeId?: unknown;
  } | null;
  const action = body?.action;
  const bookId = typeof body?.bookId === "string" ? body.bookId.trim() : "";
  const recipeId = typeof body?.recipeId === "string" ? body.recipeId.trim() : "";
  const book = getCocktailBook(bookId);
  const recipe = book?.recipes.find((entry) => entry.id === recipeId);

  if (!book || !recipe || (action !== "publish" && action !== "unpublish")) {
    return NextResponse.json({ error: "Cocktail recipe not found." }, { status: 404 });
  }

  const sourceKey = cocktailPublicationKey(bookId, recipeId);
  const supabase = createAdminClient();
  const result = action === "unpublish"
    ? await supabase.from("cocktail_recipe_publications").delete().eq("source_key", sourceKey)
    : await supabase.from("cocktail_recipe_publications").upsert({
      source_key: sourceKey,
      book_id: bookId,
      recipe_id: recipeId,
      published_at: new Date().toISOString(),
    }, { onConflict: "source_key" });

  if (result.error) {
    console.error("Failed to update cocktail recipe publication", result.error);
    return NextResponse.json({ error: "The recipe could not be moved. Check that the latest Supabase migration is applied." }, { status: 500 });
  }

  revalidateTag("published-recipes", "max");
  revalidatePath("/recipes");
  revalidatePath(`/recipes/cocktail-books/${bookId}`);
  return NextResponse.json({ published: action === "publish" });
}
