"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRecipeAdminAuthenticated } from "@/lib/recipe-admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function deleteWebsiteErrorFeedback(formData: FormData) {
  if (!(await isRecipeAdminAuthenticated())) redirect("/recipes");

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const supabase = createAdminClient();
  const { error } = await supabase.from("website_error_feedback").delete().eq("id", id);
  if (error) {
    console.error("Failed to cancel website error feedback", error);
    throw new Error("Unable to cancel this feedback.");
  }

  revalidatePath("/recipes");
}
