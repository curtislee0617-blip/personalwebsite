import { createAdminClient } from "@/lib/supabase/admin";
import { unstable_cache } from "next/cache";
import type { WishlistEntry } from "@/lib/recipes";
import {
  cookbookWishlistImageHref,
  cookbookWishlistRecipeHref,
} from "@/lib/cookbook-wishlist-public";

type RecipeWishlistRow = {
  source_key: string;
  title: string;
  note: string | null;
  href: string;
  image_url: string | null;
  cookbook_id: string | null;
  recipe_id: string | null;
  book_title: string | null;
  created_at: string;
};

const getCachedRecipeWishlistEntries = unstable_cache(async (): Promise<WishlistEntry[]> => {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("recipe_wishlist_entries")
      .select("source_key,title,note,href,image_url,cookbook_id,recipe_id,book_title,created_at")
      .order("created_at", { ascending: false });

    if (error) return [];

    return (data as RecipeWishlistRow[]).map((entry) => {
      const isCookbookRecipe = Boolean(entry.cookbook_id && entry.recipe_id);
      return {
        slug: entry.source_key,
        title: entry.title,
        note: entry.note ?? undefined,
        href: isCookbookRecipe
          ? cookbookWishlistRecipeHref(entry.cookbook_id!, entry.recipe_id!)
          : entry.href,
        image: isCookbookRecipe && entry.image_url
          ? cookbookWishlistImageHref(entry.cookbook_id!, entry.recipe_id!)
          : entry.image_url ?? undefined,
        bookTitle: entry.book_title ?? undefined,
        cookbookId: entry.cookbook_id ?? undefined,
        recipeId: entry.recipe_id ?? undefined,
      };
    });
  } catch {
    return [];
  }
}, ["recipe-wishlist-entries"], { revalidate: 300, tags: ["recipe-wishlist-entries"] });

export async function getRecipeWishlistEntries() {
  return getCachedRecipeWishlistEntries();
}

export async function getCookbookWishlistEntry(cookbookId: string, recipeId: string) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("recipe_wishlist_entries")
      .select("source_key,title,note,href,image_url,cookbook_id,recipe_id,book_title,created_at")
      .eq("cookbook_id", cookbookId)
      .eq("recipe_id", recipeId)
      .maybeSingle();

    if (error || !data) return null;
    return data as RecipeWishlistRow;
  } catch {
    return null;
  }
}
