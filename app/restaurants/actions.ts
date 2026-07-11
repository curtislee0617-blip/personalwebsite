"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRecipeAdminAuthenticated } from "@/lib/recipe-admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function deleteRestaurantRecommendation(formData: FormData) {
  if (!(await isRecipeAdminAuthenticated())) redirect("/restaurants");

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const supabase = createAdminClient();
  const { error } = await supabase.from("restaurant_recommendations").delete().eq("id", id);

  if (error) {
    console.error("Failed to remove restaurant recommendation", error);
    throw new Error("Unable to remove this recommendation.");
  }

  revalidatePath("/restaurants");
}
