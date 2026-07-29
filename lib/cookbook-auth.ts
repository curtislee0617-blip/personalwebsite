import crypto from "node:crypto";
import { cookies } from "next/headers";
import {
  COOKBOOK_ACCESS_COOKIE,
  cookbookAccessSessionToken,
} from "@/lib/cookbook-auth-token";
import { isRecipeAdminAuthenticated } from "@/lib/recipe-admin-auth";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
const DEFAULT_COOKBOOK_PASSWORD = "cookbooks";

export function configuredCookbookPassword() {
  return process.env.COOKBOOK_ACCESS_PASSWORD || DEFAULT_COOKBOOK_PASSWORD;
}

export function cookbookPasswordMatches(password: string) {
  const expected = Buffer.from(configuredCookbookPassword());
  const supplied = Buffer.from(password);
  return expected.length === supplied.length && crypto.timingSafeEqual(expected, supplied);
}

export async function isCookbookAuthenticated() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(COOKBOOK_ACCESS_COOKIE)?.value;
  if (!cookieValue) return false;

  const expected = Buffer.from(await cookbookAccessSessionToken(configuredCookbookPassword()));
  const supplied = Buffer.from(cookieValue);
  return expected.length === supplied.length && crypto.timingSafeEqual(expected, supplied);
}

export async function hasPrivateRecipeLibraryAccess() {
  const [cookbookAuthenticated, adminAuthenticated] = await Promise.all([
    isCookbookAuthenticated(),
    isRecipeAdminAuthenticated(),
  ]);
  return cookbookAuthenticated || adminAuthenticated;
}

export async function setCookbookAccessCookie() {
  const cookieStore = await cookies();
  cookieStore.set(
    COOKBOOK_ACCESS_COOKIE,
    await cookbookAccessSessionToken(configuredCookbookPassword()),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    },
  );
}

export async function clearCookbookAccessCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKBOOK_ACCESS_COOKIE);
}
