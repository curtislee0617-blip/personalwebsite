import type { ImageLoaderProps } from "next/image";

const STORAGE_OBJECT_PATH = "/storage/v1/object/public/";
const STORAGE_RENDER_PATH = "/storage/v1/render/image/public/";

export function isSupabaseStorageImage(src: string) {
  return src.includes(STORAGE_OBJECT_PATH);
}

/** Uses Supabase's image CDN for uploaded media instead of Vercel's image optimizer. */
export function supabaseImageLoader({ quality, src, width }: ImageLoaderProps) {
  if (!isSupabaseStorageImage(src)) return src;

  const [base, existingQuery = ""] = src.split("?", 2);
  const query = new URLSearchParams(existingQuery);
  query.set("width", String(width));
  query.set("quality", String(quality ?? 72));
  query.set("resize", "contain");
  return `${base.replace(STORAGE_OBJECT_PATH, STORAGE_RENDER_PATH)}?${query.toString()}`;
}

export default supabaseImageLoader;
