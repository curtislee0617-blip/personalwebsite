export const COOKBOOK_ACCESS_COOKIE = "cookbook_access_session";

export async function cookbookAccessSessionToken(password: string) {
  const payload = new TextEncoder().encode(`${password}:cookbook-access-session`);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", payload);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
