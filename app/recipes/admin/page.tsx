/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRecipeAdminAuthenticated } from "@/lib/recipe-admin-auth";
import { wishlistEntries } from "@/lib/recipes";
import { recipeCategories, recipeCategoryTitle } from "@/data/recipe-categories";
import { RecipePhotoPicker } from "@/components/recipe-photo-picker";
import { getPersonalRecipeCards } from "@/lib/personal-recipes";
import { markProcessed, submitRecipe } from "./actions";

export const metadata: Metadata = { title: "Recipe admin", robots: { index: false, follow: false } };

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

export default async function RecipeAdminPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const authenticated = await isRecipeAdminAuthenticated();
  const wishlistSlug = typeof params.wishlist === "string" ? params.wishlist : "";
  const wishlistEntry = wishlistEntries.find((entry) => entry.slug === wishlistSlug);

  if (!authenticated) {
    return (
      <div className="page-shell py-16 sm:py-20">
        <h1 className="section-title">Recipe admin</h1>
        <p className="mt-3 max-w-md text-sm text-ink/60">
          Log in from the footer — click “Curtis Lee” at the bottom of any page — then come back here.
        </p>
        <Link className="back-link-bubble mt-6" href="/recipes">← Back to recipes</Link>
      </div>
    );
  }

  const supabase = createAdminClient();
  const { data: drafts } = await supabase
    .from("recipe_drafts")
    .select("*")
    .order("recipe_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  const editableRecipes = await getPersonalRecipeCards();

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="page-shell py-16 sm:py-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="section-title">{wishlistEntry ? "Upload made wishlist dish" : "Add a recipe"}</h1>
        <Link className="back-link-bubble" href="/recipes">← Back to recipes</Link>
      </div>

      {params.submitted === "1" && <p className="mt-4 rounded-2xl bg-lime/40 px-4 py-3 text-sm text-ink">Saved.</p>}
      {params.error === "missing" && <p className="mt-4 rounded-2xl border border-clay/30 bg-clay/10 px-4 py-3 text-sm text-clay">Add a description.</p>}
      {params.error === "missing-categories" && <p className="mt-4 rounded-2xl border border-clay/30 bg-clay/10 px-4 py-3 text-sm text-clay">Choose at least one recipe category.</p>}
      {params.error === "save-failed" && <p className="mt-4 rounded-2xl border border-clay/30 bg-clay/10 px-4 py-3 text-sm text-clay">Something went wrong saving that — try again.</p>}
      {params.error === "recipe-not-found" && <p className="mt-4 rounded-2xl border border-clay/30 bg-clay/10 px-4 py-3 text-sm text-clay">That recipe card could not be found.</p>}

      <form action={submitRecipe} className="mt-8 max-w-2xl space-y-6">
        {wishlistEntry && (
          <div className="rounded-2xl border border-moss/20 bg-lime/25 px-4 py-3 text-sm leading-6 text-ink/65">
            This will publish <strong className="font-semibold text-ink">{wishlistEntry.title}</strong> into the recipes section after upload.
          </div>
        )}
        {wishlistEntry && <input name="publish_now" type="hidden" value="1" />}
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/50" htmlFor="title">Recipe title</label>
          <input
            className="mt-2 block w-full rounded-2xl border border-ink/15 bg-surface px-4 py-2.5 text-sm"
            defaultValue={wishlistEntry?.title ?? ""}
            id="title"
            name="title"
            placeholder="Recipe title"
            type="text"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">Photos (optional; first = thumbnail)</label>
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
        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">Categories</legend>
          <p className="mt-1 text-xs text-ink/45">Select every category where this recipe should appear.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {recipeCategories.map((category) => (
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-ink/10 bg-surface/60 px-4 py-3 text-sm text-ink/70 transition hover:border-ink/25" key={category.id}>
                <input className="size-4 accent-moss" name="categories" type="checkbox" value={category.id} />
                <span>{category.title}</span>
              </label>
            ))}
          </div>
        </fieldset>
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

      <div className="recipe-admin-editable-heading">
        <div>
          <p className="eyebrow">Published cards</p>
          <h2 className="section-title mt-3 text-2xl">Edit recipes ({editableRecipes.length})</h2>
        </div>
        <p>Change titles, dates, categories, ingredients, methods, and linked recipes.</p>
      </div>
      <div className="recipe-admin-editable-grid">
        {editableRecipes.map((recipe) => (
          <article key={recipe.recipeKey}>
            {recipe.thumbnail ? <img alt="" src={recipe.thumbnail} /> : <div className="recipe-admin-editable-placeholder">Recipe</div>}
            <div>
              <p>{recipe.date ? new Date(`${recipe.date}T00:00:00`).toLocaleDateString() : "No date"} · {recipe.source}</p>
              <h3>{recipe.title}</h3>
              <small>{(recipe.categories ?? []).map(recipeCategoryTitle).join(" · ") || "No category"}</small>
            </div>
            <Link href={`/recipes/admin/edit/${encodeURIComponent(recipe.recipeKey)}`}>Edit</Link>
          </article>
        ))}
      </div>

      <h2 className="section-title mt-14 text-2xl">Submitted ({drafts?.length ?? 0})</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {drafts?.map((draft) => (
          <div className="rounded-2xl border border-ink/10 bg-surface/60 p-4" key={draft.id}>
            {draft.thumbnail_url ? (
              <img alt="" className="h-40 w-full rounded-xl object-cover" src={draft.thumbnail_url} />
            ) : (
              <div className="flex h-40 w-full items-center justify-center rounded-xl bg-mist text-xs font-semibold uppercase tracking-[0.14em] text-ink/35">Text-only recipe</div>
            )}
            <p className="mt-3 text-xs uppercase tracking-[0.1em] text-ink/40">
              {new Date(`${draft.recipe_date ?? draft.created_at.slice(0, 10)}T00:00:00`).toLocaleDateString()} · {draft.status} · {draft.image_urls.length} photo{draft.image_urls.length === 1 ? "" : "s"}
            </p>
            <p className="mt-2 text-xs font-semibold text-moss">{(draft.categories ?? []).map(recipeCategoryTitle).join(" · ") || "No category selected"}</p>
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
