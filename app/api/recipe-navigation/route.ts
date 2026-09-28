import { NextResponse } from "next/server";
import { getPersonalRecipeCards } from "@/lib/personal-recipes";

export const dynamic = "force-dynamic";

// The sidebar only needs public recipe labels and categories, not the multi-MB
// search index (ingredients, methods, guides and private cookbook search text).
export async function GET() {
  const recipes = await getPersonalRecipeCards();
  return NextResponse.json(recipes.map((recipe) => ({
    title: recipe.title,
    href: `/recipes#recipe-${recipe.slug}`,
    categories: recipe.categories ?? (recipe.category ? [recipe.category] : []),
  })), { headers: { "Cache-Control": "no-store" } });
}
