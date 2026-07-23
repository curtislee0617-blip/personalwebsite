import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { isPrivateCookbookPathname } from "@/lib/cookbook-access";
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
  if (!isPrivateCookbookPathname(request.nextUrl.pathname) || hasValidRecipeAdminSession(request)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/recipes", request.url);
  loginUrl.searchParams.set("admin", "required");
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/recipes/:path*"],
};
