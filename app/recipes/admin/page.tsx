/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRecipeAdminAuthenticated } from "@/lib/recipe-admin-auth";
import { RecipePhotoPicker } from "@/components/recipe-photo-picker";
import { markProcessed, submitRecipe } from "./actions";

export const metadata: Metadata = { title: "Recipe admin", robots: { index: false, follow: false } };

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

export default async function RecipeAdminPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const authenticated = await isRecipeAdminAuthenticated();

  if (!authenticated) {
    return (
      <div className="page-shell py-16 sm:py-20">
        <h1 className="section-title">Recipe admin</h1>
        <p className="mt-3 max-w-md text-sm text-ink/60">
          Log in from the footer — click “Curtis Lee” at the bottom of any page — then come back here.
        </p>
        <Link className="mt-6 inline-block text-sm font-semibold text-moss hover:text-ink" href="/recipes">← Back to recipes</Link>
      </div>
    );
  }

  const supabase = createAdminClient();
  const { data: drafts } = await supabase
    .from("recipe_drafts")
    .select("*")
    .order("recipe_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="page-shell py-16 sm:py-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="section-title">Add a recipe</h1>
        <Link className="text-xs font-semibold text-ink/50 hover:text-ink" href="/recipes">← Back to recipes</Link>
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
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/50" htmlFor="recipe_date">Date made</label>
          <p className="mt-1 text-xs text-ink/45">Backdate old recipes here — the recipes list is ordered newest first.</p>
          <input
            className="mt-2 block rounded-2xl border border-ink/15 bg-surface px-4 py-2.5 text-sm"
            defaultValue={today}
            id="recipe_date"
            max={today}
            name="recipe_date"
            type="date"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/50" htmlFor="description">Description</label>
          <textarea
            className="mt-2 w-full rounded-2xl border border-ink/15 bg-surface px-4 py-3 text-sm leading-6"
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
          <div className="rounded-2xl border border-ink/10 bg-surface/60 p-4" key={draft.id}>
            <img alt="" className="h-40 w-full rounded-xl object-cover" src={draft.thumbnail_url} />
            <p className="mt-3 text-xs uppercase tracking-[0.1em] text-ink/40">
              {new Date(`${draft.recipe_date ?? draft.created_at.slice(0, 10)}T00:00:00`).toLocaleDateString()} · {draft.status} · {draft.image_urls.length} photo{draft.image_urls.length === 1 ? "" : "s"}
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
