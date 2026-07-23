import crypto from "node:crypto";

export const RECIPE_ADMIN_COOKIE = "recipe_admin_session";

export function recipeAdminSessionToken(password: string) {
  return crypto.createHash("sha256").update(`${password}:recipe-admin-session`).digest("hex");
}
