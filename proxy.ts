import { NextRequest, NextResponse } from "next/server";
import {
  cookbookMediaObjectPath,
  isPrivateCookbookMediaPathname,
  isPrivateCookbookPathname,
  isPublicCookbookMediaPathname,
} from "@/lib/cookbook-access";
import {
  COOKBOOK_ACCESS_COOKIE,
  cookbookAccessSessionToken,
} from "@/lib/cookbook-auth-token";

const RECIPE_ADMIN_COOKIE = "recipe_admin_session";

function timingSafeStringEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}

async function recipeAdminSessionToken(password: string) {
  const bytes = new TextEncoder().encode(`${password}:recipe-admin-session`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hasValidCookbookSession(request: NextRequest) {
  const password = process.env.COOKBOOK_ACCESS_PASSWORD || "cookbooks";
  const cookieValue = request.cookies.get(COOKBOOK_ACCESS_COOKIE)?.value;
  if (!cookieValue) return false;

  const expected = await cookbookAccessSessionToken(password);
  return timingSafeStringEqual(expected, cookieValue);
}

async function hasValidAdminSession(request: NextRequest) {
  if (process.env.NODE_ENV === "development") return true;

  const password = process.env.RECIPE_ADMIN_PASSWORD;
  const cookieValue = request.cookies.get(RECIPE_ADMIN_COOKIE)?.value;
  if (!password || !cookieValue) return false;

  const expected = await recipeAdminSessionToken(password);
  return timingSafeStringEqual(expected, cookieValue);
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const protectsCookbookMedia = isPrivateCookbookMediaPathname(pathname);
  const protectsCookbookPage = isPrivateCookbookPathname(pathname);

  if (!protectsCookbookMedia && !protectsCookbookPage) {
    return NextResponse.next();
  }

  const [hasCookbookSession, hasAdminSession] = await Promise.all([
    hasValidCookbookSession(request),
    hasValidAdminSession(request),
  ]);
  const hasCookbookAccess = hasCookbookSession || hasAdminSession;

  if (protectsCookbookMedia) {
    if (!isPublicCookbookMediaPathname(pathname) && !hasCookbookAccess) {
      return new NextResponse(null, { status: 404 });
    }

    // Checked-out cookbook files remain usable on localhost after the
    // dedicated cookbook password has been entered.
    if (process.env.NODE_ENV === "development") return NextResponse.next();

    const mediaUrl = request.nextUrl.clone();
    mediaUrl.pathname = `/api/cookbook-media/${cookbookMediaObjectPath(pathname)}`;
    return NextResponse.rewrite(mediaUrl);
  }

  if (!protectsCookbookPage || hasCookbookAccess) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/recipes", request.url);
  loginUrl.searchParams.set("cookbooks", "required");
  loginUrl.hash = "recipe-books";
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
