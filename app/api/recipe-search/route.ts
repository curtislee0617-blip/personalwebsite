import { NextResponse } from "next/server";
import { getPersonalRecipeCards } from "@/lib/personal-recipes";
import { recipeSearchItems } from "@/lib/recipe-search";
import { isPrivateCookbookHref } from "@/lib/cookbook-access";
import { hasPrivateRecipeLibraryAccess } from "@/lib/cookbook-auth";
import { getCocktailLibrarySearchItems } from "@/lib/cocktail-books";
import { getRecipeWishlistEntries } from "@/lib/recipe-wishlist";

export const dynamic = "force-dynamic";

export async function GET() {
  const [personalRecipes, privateLibraryAccess, wishlistRecipes] = await Promise.all([
    getPersonalRecipeCards(),
    hasPrivateRecipeLibraryAccess(),
    getRecipeWishlistEntries(),
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

  const visibleLibraryItems = privateLibraryAccess
    ? [...recipeSearchItems, ...getCocktailLibrarySearchItems()]
    : recipeSearchItems.filter((item) => !isPrivateCookbookHref(item.href));
  const wishlistItems = wishlistRecipes.map((entry) => ({
    title: entry.title,
    context: entry.bookTitle ? `Public wishlist recipe · ${entry.bookTitle}` : "Recipe wishlist",
    kind: "Wishlist",
    href: entry.href ?? "/recipes#recipe-wishlist",
    searchText: [entry.note, entry.bookTitle].filter(Boolean).join(" "),
  }));

  return NextResponse.json([...visibleLibraryItems, ...personalItems, ...wishlistItems], {
    headers: { "Cache-Control": "no-store" },
  });
}
