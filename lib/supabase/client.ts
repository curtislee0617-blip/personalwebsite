"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";
import { getSupabaseConfig } from "@/lib/supabase/config";

/** Use this client in Client Components and browser event handlers. */
export function createClient() {
  const { url, publishableKey } = getSupabaseConfig();
  return createBrowserClient<Database>(url, publishableKey);
}
