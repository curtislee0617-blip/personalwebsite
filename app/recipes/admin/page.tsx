/* eslint-disable @next/next/no-img-element */

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadToR2 } from "@/lib/r2";
import { RecipePhotoPicker } from "@/components/recipe-photo-picker";

export const metadata: Metadata = { title: "Recipe admin", robots: { index: false, follow: false } };

const COOKIE_NAME = "recipe_admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function sessionToken(password: string) {
  return crypto.createHash("sha256").update(`${password}:recipe-admin-session`).digest("hex");
}

async function isAuthenticated() {
  const adminPassword = process.env.RECIPE_ADMIN_PASSWORD;
  if (!adminPassword) return false;
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(COOKIE_NAME)?.value;
  if (!cookieValue) return false;
  const expected = sessionToken(adminPassword);
  const a = Buffer.from(cookieValue);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function login(formData: FormData) {
  "use server";
  const adminPassword = process.env.RECIPE_ADMIN_PASSWORD;
  const submitted = String(formData.get("password") ?? "");
  if (!adminPassword || submitted !== adminPassword) {
    redirect("/recipes/admin?error=wrong-password");
  }
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sessionToken(adminPassword), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/recipes/admin",
    maxAge: COOKIE_MAX_AGE,
  });
  redirect("/recipes/admin");
}

async function logout() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/recipes/admin");
}

async function submitRecipe(formData: FormData) {
  "use server";
  if (!(await isAuthenticated())) redirect("/recipes/admin");

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

async function markProcessed(formData: FormData) {
  "use server";
  if (!(await isAuthenticated())) redirect("/recipes/admin");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = createAdminClient();
  await supabase.from("recipe_drafts").update({ status: "processed" }).eq("id", id);
  redirect("/recipes/admin");
}

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

export default async function RecipeAdminPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    return (
      <div className="page-shell py-16 sm:py-20">
        <h1 className="section-title">Recipe admin</h1>
        <p className="mt-3 max-w-md text-sm text-ink/60">Enter the admin password to add a new recipe.</p>
        {params.error === "wrong-password" && <p className="mt-3 text-sm text-clay">Wrong password.</p>}
        <form action={login} className="mt-6 flex max-w-sm flex-col gap-3">
          <input autoFocus className="rounded-full border border-ink/20 bg-white px-4 py-2.5 text-sm" name="password" placeholder="Password" required type="password" />
          <button className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-moss" type="submit">Sign in</button>
        </form>
      </div>
    );
  }

  const supabase = createAdminClient();
  const { data: drafts } = await supabase.from("recipe_drafts").select("*").order("created_at", { ascending: false });

  return (
    <div className="page-shell py-16 sm:py-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="section-title">Add a recipe</h1>
        <form action={logout}>
          <button className="text-xs font-semibold text-ink/50 hover:text-ink" type="submit">Sign out</button>
        </form>
      </div>

      {params.submitted === "1" && <p className="mt-4 rounded-2xl bg-lime/40 px-4 py-3 text-sm text-ink">Saved — the first photo is the thumbnail.</p>}
      {params.error === "missing" && <p className="mt-4 rounded-2xl border border-clay/30 bg-clay/10 px-4 py-3 text-sm text-clay">Add at least one photo and a description.</p>}
      {params.error === "save-failed" && <p className="mt-4 rounded-2xl border border-clay/30 bg-clay/10 px-4 py-3 text-sm text-clay">Something went wrong saving that — try again.</p>}

      <form action={submitRecipe} className="mt-8 max-w-2xl space-y-6">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">Photos (first = thumbnail)</label>
          <div className="mt-2">
            <RecipePhotoPicker name="photos" />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/50" htmlFor="description">Description</label>
          <textarea
            className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm leading-6"
            id="description"
            name="description"
            placeholder="Write whatever you want — ingredients, steps, notes, story. I'll format it into a real recipe page later."
            required
            rows={16}
          />
        </div>
        <button className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-moss" type="submit">Save recipe</button>
      </form>

      <h2 className="section-title mt-14 text-2xl">Submitted ({drafts?.length ?? 0})</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {drafts?.map((draft) => (
          <div className="rounded-2xl border border-ink/10 bg-white/60 p-4" key={draft.id}>
            <img alt="" className="h-40 w-full rounded-xl object-cover" src={draft.thumbnail_url} />
            <p className="mt-3 text-xs uppercase tracking-[0.1em] text-ink/40">
              {new Date(draft.created_at).toLocaleDateString()} · {draft.status} · {draft.image_urls.length} photo{draft.image_urls.length === 1 ? "" : "s"}
            </p>
            <p className="mt-1 text-sm text-ink/70">{truncate(draft.description, 220)}</p>
            {draft.status !== "processed" && (
              <form action={markProcessed} className="mt-3">
                <input name="id" type="hidden" value={draft.id} />
                <button className="text-xs font-semibold text-moss hover:text-ink" type="submit">Mark processed</button>
              </form>
            )}
          </div>
        ))}
        {drafts?.length === 0 && <p className="text-sm text-ink/40">Nothing submitted yet.</p>}
      </div>
    </div>
  );
}
