import { createAdminClient } from "@/lib/supabase/admin";

export const SITE_MEDIA_BUCKET = "site-media";
export const RECIPE_MEDIA_BUCKET = "recipe-media";
export const RECIPE_THUMBNAILS_BUCKET = "recipe-thumbnails";
export const COOKBOOK_MEDIA_BUCKET = "cookbook-media";

/**
 * Stores new recipe-admin uploads in Supabase rather than adding more binary
 * files to the Git/Vercel deployment. Existing R2 URLs remain valid.
 */
export async function uploadRecipeMedia(key: string, body: Buffer, contentType: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(RECIPE_MEDIA_BUCKET).upload(key, body, {
    cacheControl: "31536000",
    contentType,
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(RECIPE_MEDIA_BUCKET).getPublicUrl(key);
  return data.publicUrl;
}
