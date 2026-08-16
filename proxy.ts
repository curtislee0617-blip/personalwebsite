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

/**
 * The command center shows a calendar, Drive files and travel plans on a public
 * domain, so it must never be world-readable. HTTP Basic Auth is the right
 * amount of machinery for a single-user page: no session store, no login UI,
 * and iOS remembers it after the first prompt so the home-screen icon opens
 * straight in. Its tile proxy is covered too, since that spends the TomTom key.
 */
function isCommandCenterPathname(pathname: string) {
  return (
    pathname === "/command-center" ||
    pathname.startsWith("/command-center/") ||
    pathname.startsWith("/api/tiles/")
  );
}

function commandCenterAuthResponse(request: NextRequest) {
  const user = process.env.CC_USER;
  const password = process.env.CC_PASSWORD;

  // Fail closed. An unconfigured deployment serves nothing rather than
  // publishing a calendar to anyone who guesses the URL.
  if (!user || !password) {
    return new NextResponse("Command center auth is not configured.", { status: 503 });
  }

  const header = request.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    const decoded = atob(header.slice(6));
    const separator = decoded.indexOf(":");
    // Split on the first colon only, so passwords may contain colons.
    const suppliedUser = separator === -1 ? decoded : decoded.slice(0, separator);
    const suppliedPassword = separator === -1 ? "" : decoded.slice(separator + 1);
    if (
      timingSafeStringEqual(suppliedUser, user) &&
      timingSafeStringEqual(suppliedPassword, password)
    ) {
      return null;
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Command Center", charset="UTF-8"' },
  });
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isCommandCenterPathname(pathname)) {
    const denied = commandCenterAuthResponse(request);
    return denied ?? NextResponse.next();
  }

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
    "/command-center",
    "/command-center/:path*",
    "/api/tiles/:path*",
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
