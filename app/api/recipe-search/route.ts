import { NextResponse } from "next/server";
import { getPersonalRecipeCards } from "@/lib/personal-recipes";
import { recipeSearchItems } from "@/lib/recipe-search";
import { isRecipeAdminAuthenticated } from "@/lib/recipe-admin-auth";
import { isPrivateCookbookHref } from "@/lib/cookbook-access";

export const dynamic = "force-dynamic";

export async function GET() {
  const [personalRecipes, authenticated] = await Promise.all([
    getPersonalRecipeCards(),
    isRecipeAdminAuthenticated(),
  ]);
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

  const visibleLibraryItems = authenticated
    ? recipeSearchItems
    : recipeSearchItems.filter((item) => !isPrivateCookbookHref(item.href));

  return NextResponse.json([...visibleLibraryItems, ...personalItems], {
    headers: { "Cache-Control": "no-store" },
  });
}
