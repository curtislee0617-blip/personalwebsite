import { createAdminClient } from "@/lib/supabase/admin";
import type { WishlistEntry } from "@/lib/recipes";

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

export async function getRecipeWishlistEntries(): Promise<WishlistEntry[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("recipe_wishlist_entries")
      .select("source_key,title,note,href,image_url,cookbook_id,recipe_id,book_title,created_at")
      .order("created_at", { ascending: false });

    if (error) return [];

    return (data as RecipeWishlistRow[]).map((entry) => ({
      slug: entry.source_key,
      title: entry.title,
      note: entry.note ?? undefined,
      href: entry.href,
      image: entry.image_url ?? undefined,
      bookTitle: entry.book_title ?? undefined,
    }));
  } catch {
    return [];
  }
}
