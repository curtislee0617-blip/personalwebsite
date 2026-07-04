"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadToR2 } from "@/lib/r2";
import { clearRecipeAdminCookie, isRecipeAdminAuthenticated, setRecipeAdminCookie } from "@/lib/recipe-admin-auth";

export async function loginAction(password: string): Promise<{ ok: boolean }> {
  const adminPassword = process.env.RECIPE_ADMIN_PASSWORD;
  if (!adminPassword || password !== adminPassword) return { ok: false };
  await setRecipeAdminCookie(adminPassword);
  return { ok: true };
}

export async function logoutAction() {
  await clearRecipeAdminCookie();
}

export async function submitRecipe(formData: FormData) {
  if (!(await isRecipeAdminAuthenticated())) redirect("/recipes");

  const description = String(formData.get("description") ?? "").trim();
  const photos = formData.getAll("photos").filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (!description || photos.length === 0) {
    redirect("/recipes/admin?error=missing");
  }

  const draftId = crypto.randomUUID();
  const imageUrls: string[] = [];
  for (const [index, photo] of photos.entries()) {
    const buffer = Buffer.from(await photo.arrayBuffer());
    const safeName = photo.name.replace(/[^a-zA-Z0-9.-]+/g, "-").toLowerCase() || "photo.jpg";
    const key = `recipes/${draftId}/${String(index).padStart(2, "0")}-${safeName}`;
    const url = await uploadToR2(key, buffer, photo.type || "application/octet-stream");
    imageUrls.push(url);
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("recipe_drafts").insert({
    description,
    image_urls: imageUrls,
    thumbnail_url: imageUrls[0],
  });
  if (error) {
    console.error("Failed to save recipe draft", error);
    redirect("/recipes/admin?error=save-failed");
  }
  redirect("/recipes/admin?submitted=1");
}

export async function markProcessed(formData: FormData) {
  if (!(await isRecipeAdminAuthenticated())) redirect("/recipes");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = createAdminClient();
  await supabase.from("recipe_drafts").update({ status: "processed" }).eq("id", id);
  redirect("/recipes/admin");
}
