import { createClient } from "@/lib/supabase/client";
import type { MajorId } from "@/data/caltech-requirements";
import type { Json } from "@/lib/supabase/database.types";

export type StoredIdentity = {
  loginKey: string;
  displayName: string;
  firstName: string;
  lastName: string;
  majors: MajorId[];
};

const IDENTITY_STORAGE_KEY = "caltech-course-planner-identity-v1";

/** Legacy profile key kept so existing saved plans can be found and migrated without deleting them. */
export function buildLegacyLoginKey(name: string, majorIds: MajorId[]) {
  const normalizedName = name.trim().toLowerCase().replace(/\s+/g, " ");
  const normalizedMajors = [...majorIds].sort().join(",");
  return `${normalizedName}::${normalizedMajors}`;
}

/** New account key: majors are editable, while first name + last name + password identify the saved row. */
export function buildAccountLoginKey(firstName: string, lastName: string, password: string) {
  const normalizedFirst = firstName.trim().toLowerCase().replace(/\s+/g, " ");
  const normalizedLast = lastName.trim().toLowerCase().replace(/\s+/g, " ");
  const normalizedPassword = password.trim();
  return `account::${normalizedFirst}::${normalizedLast}::${normalizedPassword}`;
}

export function displayNameFor(firstName: string, lastName: string) {
  return [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
}

export function loadStoredIdentity(): StoredIdentity | null {
  try {
    const raw = window.localStorage.getItem(IDENTITY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredIdentity>;
    const displayName = parsed.displayName ?? "";
    return {
      loginKey: parsed.loginKey ?? "",
      displayName,
      firstName: parsed.firstName ?? displayName.split(/\s+/)[0] ?? "",
      lastName: parsed.lastName ?? displayName.split(/\s+/).slice(1).join(" "),
      majors: parsed.majors ?? [],
    };
  } catch {
    return null;
  }
}

export function saveStoredIdentity(identity: StoredIdentity | null) {
  if (identity) window.localStorage.setItem(IDENTITY_STORAGE_KEY, JSON.stringify(identity));
  else window.localStorage.removeItem(IDENTITY_STORAGE_KEY);
}

/** Returns the saved row, or null if this login_key has never saved a plan before. */
export async function fetchCoursePlan(loginKey: string) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_course_plan", { p_login_key: loginKey });
  if (error) throw error;
  return data;
}

export async function saveCoursePlan(identity: StoredIdentity, plan: Json) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("upsert_course_plan", {
    p_login_key: identity.loginKey,
    p_display_name: identity.displayName,
    p_majors: identity.majors,
    p_plan: plan,
  });
  if (error) throw error;
  return data;
}
