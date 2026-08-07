import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";

export const TOWNGAS_ACCESS_COOKIE = "towngas_private_session";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function configuredPassword() {
  return process.env.TOWNGAS_ACCESS_PASSWORD?.trim() ?? "";
}

function sessionToken(password: string) {
  return crypto.createHash("sha256").update(`${password}:towngas-private-session`).digest("hex");
}

function timingSafeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function isTowngasAccessConfigured() {
  return configuredPassword().length > 0;
}

export function isTowngasPasswordValid(candidate: string) {
  const password = configuredPassword();
  return password.length > 0 && timingSafeEqual(candidate, password);
}

export async function isTowngasAccessAuthenticated() {
  const password = configuredPassword();
  if (!password) return false;

  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(TOWNGAS_ACCESS_COOKIE)?.value;
  return Boolean(cookieValue && timingSafeEqual(cookieValue, sessionToken(password)));
}

export async function setTowngasAccessCookie() {
  const password = configuredPassword();
  if (!password) return false;

  const cookieStore = await cookies();
  cookieStore.set(TOWNGAS_ACCESS_COOKIE, sessionToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return true;
}

export async function clearTowngasAccessCookie() {
  const cookieStore = await cookies();
  cookieStore.set(TOWNGAS_ACCESS_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
