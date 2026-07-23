import "server-only";

import cocktailBookData from "@/data/cocktail-books-data.json";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CocktailBook, CocktailBookRecipe, CocktailPublication } from "@/lib/cocktail-book-types";
import type { RecipeCardEntry } from "@/lib/recipe-card-types";

export const cocktailBooks = cocktailBookData as CocktailBook[];

export function getCocktailBook(bookId: string) {
  return cocktailBooks.find((book) => book.id === bookId);
}

export function cocktailPublicationKey(bookId: string, recipeId: string) {
  return `cocktail-book:${bookId}:${recipeId}`;
}

export async function getCocktailPublications(): Promise<CocktailPublication[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("cocktail_recipe_publications")
      .select("source_key,book_id,recipe_id,published_at")
      .order("published_at", { ascending: false });

    if (error) return [];
    return data.map((row) => ({
      sourceKey: row.source_key,
      bookId: row.book_id,
      recipeId: row.recipe_id,
      publishedAt: row.published_at,
    }));
  } catch {
    return [];
  }
}

function publicRecipeCard(book: CocktailBook, recipe: CocktailBookRecipe, publishedAt: string): RecipeCardEntry {
  const sourceCredit = `From ${book.title} by ${book.author}.`;
  const description = [recipe.description, sourceCredit, recipe.attribution].filter(Boolean).join(" ");

  return {
    recipeKey: cocktailPublicationKey(book.id, recipe.id),
    slug: `cocktail-${book.id}-${recipe.id}`,
    title: recipe.title,
    description,
    sourceLabel: `${book.title} by ${book.author}`,
    status: "published",
    date: publishedAt.slice(0, 10),
    categories: ["drinks"],
    thumbnail: recipe.image ?? undefined,
    media: recipe.images.map((src) => ({ src, type: "image", alt: `${recipe.title} from ${book.title}` })),
    ingredientGroups: recipe.ingredientGroups.map((group) => ({ title: group.heading, items: group.lines })),
    methodGroups: recipe.methodGroups.map((group) => ({ title: group.heading, steps: group.steps })),
    source: "site",
  };
}

export async function getPublishedCocktailRecipeCards(): Promise<RecipeCardEntry[]> {
  const publications = await getCocktailPublications();
  return publications.flatMap((publication) => {
    const book = getCocktailBook(publication.bookId);
    const recipe = book?.recipes.find((entry) => entry.id === publication.recipeId);
    return book && recipe ? [publicRecipeCard(book, recipe, publication.publishedAt)] : [];
  });
}

export function getCocktailMatcherRecipes() {
  return cocktailBooks.flatMap((book) => book.recipes.map((recipe) => ({
    id: cocktailPublicationKey(book.id, recipe.id),
    title: recipe.title,
    bookId: book.id,
    bookTitle: book.title,
    section: recipe.section,
    href: `/recipes/cocktail-books/${book.id}#cocktail-recipe-${recipe.id}`,
    ingredients: recipe.ingredientGroups.flatMap((group) => group.lines),
  })));
}
