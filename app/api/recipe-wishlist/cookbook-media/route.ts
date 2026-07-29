import { NextResponse } from "next/server";
import {
  cookbookMediaObjectPath,
  isPrivateCookbookMediaPathname,
} from "@/lib/cookbook-access";
import { getImportedCookbook } from "@/lib/imported-cookbooks";
import { COOKBOOK_MEDIA_BUCKET } from "@/lib/media-storage";
import { getCookbookWishlistEntry } from "@/lib/recipe-wishlist";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cookbookId = url.searchParams.get("cookbookId")?.trim() ?? "";
  const recipeId = url.searchParams.get("recipeId")?.trim() ?? "";
  if (!cookbookId || !recipeId) return new NextResponse(null, { status: 404 });

  const wishlistEntry = await getCookbookWishlistEntry(cookbookId, recipeId);
  if (!wishlistEntry) return new NextResponse(null, { status: 404 });

  const cookbook = await getImportedCookbook(cookbookId);
  const recipe = cookbook?.recipes.find((entry) => entry.id === recipeId);
  const image = recipe?.image?.trim();
  if (!image) return new NextResponse(null, { status: 404 });

  if (/^https?:\/\//i.test(image)) {
    return NextResponse.redirect(image, 307);
  }

  if (!image.startsWith("/") || !isPrivateCookbookMediaPathname(image)) {
    return NextResponse.redirect(new URL(image, request.url), 307);
  }

  if (process.env.NODE_ENV === "development") {
    return NextResponse.redirect(new URL(image, request.url), 307);
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(COOKBOOK_MEDIA_BUCKET)
    .createSignedUrl(cookbookMediaObjectPath(image), 10 * 60);

  if (error || !data?.signedUrl) {
    console.error("Unable to create public wishlist cookbook image URL", {
      cookbookId,
      recipeId,
      objectPath: cookbookMediaObjectPath(image),
      message: error?.message,
    });
    return new NextResponse(null, { status: 404 });
  }

  const response = NextResponse.redirect(data.signedUrl, 307);
  response.headers.set("Cache-Control", "public, max-age=540");
  return response;
}
