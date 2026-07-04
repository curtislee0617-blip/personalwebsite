import { createClient } from "@/lib/supabase/client";
import type { MajorId } from "@/data/caltech-requirements";
import type { Json } from "@/lib/supabase/database.types";

export type StoredIdentity = { loginKey: string; displayName: string; majors: MajorId[] };

const IDENTITY_STORAGE_KEY = "caltech-course-planner-identity-v1";

/** The whole "login" model: same name + same majors always resolves to the same saved row. No password. */
export function buildLoginKey(name: string, majorIds: MajorId[]) {
  const normalizedName = name.trim().toLowerCase().replace(/\s+/g, " ");
  const normalizedMajors = [...majorIds].sort().join(",");
  return `${normalizedName}::${normalizedMajors}`;
}

export function loadStoredIdentity(): StoredIdentity | null {
  try {
    const raw = window.localStorage.getItem(IDENTITY_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredIdentity) : null;
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
