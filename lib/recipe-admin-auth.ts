import crypto from "node:crypto";
import { cookies } from "next/headers";
import { RECIPE_ADMIN_COOKIE, recipeAdminSessionToken } from "@/lib/recipe-admin-token";

export { RECIPE_ADMIN_COOKIE, recipeAdminSessionToken } from "@/lib/recipe-admin-token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export async function isRecipeAdminAuthenticated() {
  if (process.env.NODE_ENV === "development") return true;

  const adminPassword = process.env.RECIPE_ADMIN_PASSWORD;
  if (!adminPassword) return false;
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(RECIPE_ADMIN_COOKIE)?.value;
  if (!cookieValue) return false;
  const expected = recipeAdminSessionToken(adminPassword);
  const a = Buffer.from(cookieValue);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function setRecipeAdminCookie(password: string) {
  const cookieStore = await cookies();
  cookieStore.set(RECIPE_ADMIN_COOKIE, recipeAdminSessionToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearRecipeAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(RECIPE_ADMIN_COOKIE);
}
