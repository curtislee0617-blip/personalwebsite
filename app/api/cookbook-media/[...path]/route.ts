import { NextResponse } from "next/server";
import {
  cookbookMediaObjectPath,
  isPrivateCookbookMediaPathname,
  isPublicCookbookMediaPathname,
} from "@/lib/cookbook-access";
import { hasPrivateRecipeLibraryAccess } from "@/lib/cookbook-auth";
import { COOKBOOK_MEDIA_BUCKET } from "@/lib/media-storage";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const pathname = `/${path.join("/")}`;
  if (
    path.length === 0
    || path.some((segment) => !segment || segment === "." || segment === ".." || segment.includes("\\"))
    || !isPrivateCookbookMediaPathname(pathname)
  ) {
    return NextResponse.json({ error: "Invalid cookbook media path." }, { status: 400 });
  }

  if (!isPublicCookbookMediaPathname(pathname) && !(await hasPrivateRecipeLibraryAccess())) {
    return new NextResponse(null, { status: 404 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(COOKBOOK_MEDIA_BUCKET)
    .createSignedUrl(cookbookMediaObjectPath(pathname), 10 * 60);

  if (error || !data?.signedUrl) {
    console.error("Unable to create cookbook media URL", {
      objectPath: cookbookMediaObjectPath(pathname),
      message: error?.message,
    });
    return new NextResponse(null, { status: 404 });
  }

  const response = NextResponse.redirect(data.signedUrl, 307);
  response.headers.set("Cache-Control", "private, max-age=540");
  return response;
}
