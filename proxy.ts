import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  cookbookMediaObjectPath,
  isPrivateCookbookMediaPathname,
  isPrivateCookbookPathname,
  isPublicCookbookMediaPathname,
} from "@/lib/cookbook-access";
import { RECIPE_ADMIN_COOKIE, recipeAdminSessionToken } from "@/lib/recipe-admin-token";

function hasValidRecipeAdminSession(request: NextRequest) {
  if (process.env.NODE_ENV === "development") return true;

  const password = process.env.RECIPE_ADMIN_PASSWORD;
  const cookieValue = request.cookies.get(RECIPE_ADMIN_COOKIE)?.value;
  if (!password || !cookieValue) return false;

  const expected = Buffer.from(recipeAdminSessionToken(password));
  const supplied = Buffer.from(cookieValue);
  return expected.length === supplied.length && crypto.timingSafeEqual(expected, supplied);
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isPrivateCookbookMediaPathname(pathname)) {
    // Keep the checked-out copies available for offline localhost work. The
    // production deployment serves the private Supabase objects instead.
    if (process.env.NODE_ENV === "development") return NextResponse.next();
    if (!isPublicCookbookMediaPathname(pathname) && !hasValidRecipeAdminSession(request)) {
      return new NextResponse(null, { status: 404 });
    }

    const mediaUrl = request.nextUrl.clone();
    mediaUrl.pathname = `/api/cookbook-media/${cookbookMediaObjectPath(pathname)}`;
    return NextResponse.rewrite(mediaUrl);
  }

  if (!isPrivateCookbookPathname(pathname) || hasValidRecipeAdminSession(request)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/recipes", request.url);
  loginUrl.searchParams.set("admin", "required");
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/recipes/:path*",
    "/bachour/:path*",
    "/benu/:path*",
    "/core-book/:path*",
    "/frantzen/:path*",
    "/imported-cookbooks/:path*",
    "/modernist-cuisine/:path*",
    "/modernist-pizza/:path*",
    "/opera/:path*",
    "/pollen-street/:path*",
  ],
};
