import { NextResponse } from "next/server";
import { getPersonalRecipeCards } from "@/lib/personal-recipes";
import { recipeSearchItems } from "@/lib/recipe-search";

export const dynamic = "force-dynamic";

export async function GET() {
  const personalRecipes = await getPersonalRecipeCards();
  const personalItems = personalRecipes.map((entry) => ({
    title: entry.title,
    context: "Personal recipe",
    kind: "Recipe",
    href: `/recipes#recipe-${entry.slug}`,
    categories: entry.categories ?? (entry.category ? [entry.category] : []),
    searchText: [
      entry.description,
      ...(entry.categories ?? []),
      ...(entry.ingredientGroups?.flatMap((group) => [group.title, ...group.items]) ?? []),
      ...(entry.methodGroups?.flatMap((group) => [group.title, ...group.steps]) ?? []),
    ].join(" "),
  }));

  return NextResponse.json([...recipeSearchItems, ...personalItems], {
    headers: { "Cache-Control": "no-store" },
  });
}
