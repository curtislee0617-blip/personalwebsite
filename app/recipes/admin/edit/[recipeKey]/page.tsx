/* eslint-disable @next/next/no-img-element */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HistoryBackButton } from "@/components/history-back-button";
import { RecipeLinkPicker } from "@/components/recipe-link-picker";
import { RecipeThumbnailPositionEditor } from "@/components/recipe-thumbnail-position-editor";
import { RecipeMediaOrganizer } from "@/components/recipe-media-organizer";
import { RecipePhotoPicker } from "@/components/recipe-photo-picker";
import { RecipeDeleteButton } from "@/components/recipe-delete-button";
import { recipeCategories } from "@/data/recipe-categories";
import { isRecipeAdminAuthenticated } from "@/lib/recipe-admin-auth";
import { formatIngredientGroups, formatMethodGroups, getEditableRecipeCards } from "@/lib/personal-recipes";
import { saveRecipeCard } from "../../actions";

export const metadata: Metadata = { title: "Edit recipe", robots: { index: false, follow: false } };

export default async function EditRecipeCardPage({
  params,
  searchParams,
}: {
  params: Promise<{ recipeKey: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const authenticated = await isRecipeAdminAuthenticated();
  const { recipeKey: encodedRecipeKey } = await params;
  const recipeKey = decodeURIComponent(encodedRecipeKey);
  const query = await searchParams;

  if (!authenticated) {
    return (
      <div className="page-shell py-16 sm:py-20">
        <h1 className="section-title">Recipe editor</h1>
        <p className="mt-3 max-w-md text-sm text-ink/60">Log in through the footer before editing recipe cards.</p>
        <HistoryBackButton className="mt-6" fallbackHref="/recipes">← Back to recipes</HistoryBackButton>
      </div>
    );
  }

  const recipes = await getEditableRecipeCards();
  const recipe = recipes.find((entry) => entry.recipeKey === recipeKey);
  if (!recipe) notFound();

  const linkedOptions = recipes
    .filter((entry) => entry.recipeKey !== recipe.recipeKey)
    .map((entry) => ({ key: entry.recipeKey, title: entry.title, description: entry.description, thumbnail: entry.thumbnail }));
  const thumbnailOptionMap = new Map<string, { src: string; type: "image" | "video"; poster?: string }>();
  if (recipe.thumbnail) thumbnailOptionMap.set(recipe.thumbnail, { src: recipe.thumbnail, type: /\.(?:mp4|m4v|mov)(?:\?.*)?$/i.test(recipe.thumbnail) ? "video" : "image" });
  recipe.imageUrls?.forEach((src) => thumbnailOptionMap.set(src, { src, type: "image" }));
  recipe.media?.forEach((item) => thumbnailOptionMap.set(item.src, { src: item.src, type: item.type, poster: item.poster }));
  const thumbnailOptions = Array.from(thumbnailOptionMap.values());
  const recipeMedia = recipe.media ?? (recipe.imageUrls ?? []).map((src) => ({ src, type: "image" as const }));

  return (
    <div className="page-shell py-12 sm:py-16">
      <div className="recipe-editor-heading">
        <div>
          <p className="eyebrow">Admin · {recipe.source === "uploaded" ? "Uploaded recipe" : "Site recipe"}</p>
          <h1 className="section-title mt-3">Edit {recipe.title}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className="back-link-bubble" href="/recipes/admin">Admin list</Link>
          <Link className="back-link-bubble" href={`/recipes#recipe-${recipe.slug}`}>View card</Link>
          <RecipeDeleteButton recipeKey={recipe.recipeKey} returnTo="/recipes/admin" title={recipe.title} />
        </div>
      </div>

      {query.error === "missing" && <p className="recipe-editor-alert">Add a title, at least one category, and choose a valid thumbnail.</p>}
      {query.error === "save-failed" && <p className="recipe-editor-alert">The update could not be saved. Make sure the latest Supabase migration has been applied.</p>}

      <form action={saveRecipeCard} className="recipe-editor-form">
        <input name="recipe_key" type="hidden" value={recipe.recipeKey} />

        <section className="recipe-editor-panel recipe-editor-identity">
          <div className="recipe-editor-panel-heading">
            <div><p className="eyebrow">Card details</p><h2>Identity and date</h2></div>
            {recipe.thumbnail && <img alt="" src={recipe.thumbnail} />}
          </div>
          <label>
            <span>Recipe title</span>
            <input defaultValue={recipe.title} name="title" required type="text" />
          </label>
          <label>
            <span>Date made</span>
            <input defaultValue={recipe.date ?? ""} name="recipe_date" type="date" />
          </label>
          <label className="recipe-editor-wide-field">
            <span>Card description</span>
            <textarea defaultValue={recipe.description} name="description" rows={5} />
          </label>
        </section>

        {thumbnailOptions.length > 0 && (
          <fieldset className="recipe-editor-panel">
            <legend className="sr-only">Recipe thumbnail</legend>
            <div className="recipe-editor-panel-heading">
              <div><p className="eyebrow">Card image</p><h2>Choose thumbnail</h2></div>
            </div>
            <RecipeThumbnailPositionEditor
              currentPosition={recipe.thumbnailPosition}
              currentThumbnail={recipe.thumbnail}
              currentTime={recipe.thumbnailTime}
              currentZoom={recipe.thumbnailZoom}
              options={thumbnailOptions}
              title={recipe.title}
            />
          </fieldset>
        )}

        {recipeMedia.length > 0 && (
          <section className="recipe-editor-panel">
            <div className="recipe-editor-panel-heading">
              <div><p className="eyebrow">Expanded gallery</p><h2>Media order and captions</h2></div>
            </div>
            <RecipeMediaOrganizer initialItems={recipeMedia} title={recipe.title} />
          </section>
        )}

        <section className="recipe-editor-panel">
          <div className="recipe-editor-panel-heading">
            <div><p className="eyebrow">Add later</p><h2>Upload more images</h2></div>
          </div>
          <p className="recipe-editor-help">New images are added to the end of the gallery. If this card has no thumbnail, the first new image becomes its thumbnail automatically. Save, then reopen the editor to reorder, caption, or crop them.</p>
          <RecipePhotoPicker name="new_photos" />
        </section>

        <fieldset className="recipe-editor-panel">
          <legend className="sr-only">Recipe categories</legend>
          <div className="recipe-editor-panel-heading">
            <div><p className="eyebrow">Placement</p><h2>Recipe categories</h2></div>
          </div>
          <p className="recipe-editor-help">Choose every row where this card should appear.</p>
          <div className="recipe-editor-category-grid">
            {recipeCategories.map((category) => (
              <label key={category.id}>
                <input defaultChecked={recipe.categories?.includes(category.id) || recipe.category === category.id} name="categories" type="checkbox" value={category.id} />
                <span>{category.title}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <section className="recipe-editor-panel recipe-editor-content-grid">
          <div className="recipe-editor-panel-heading recipe-editor-wide-field">
            <div><p className="eyebrow">Recipe content</p><h2>Ingredients and method</h2></div>
          </div>
          <label>
            <span>Ingredient groups</span>
            <small>Start each component with ##, then put one ingredient on each line.</small>
            <textarea defaultValue={formatIngredientGroups(recipe.ingredientGroups)} name="ingredient_groups" placeholder={"## Chips\n- Potatoes — 500 g\n- Frying oil — as needed"} rows={16} />
          </label>
          <label>
            <span>Method groups</span>
            <small>Start each component with ##, then put one step on each line.</small>
            <textarea defaultValue={formatMethodGroups(recipe.methodGroups)} name="method_groups" placeholder={"## Chips\n1. Cut the potatoes.\n2. Fry until crisp."} rows={16} />
          </label>
        </section>

        <section className="recipe-editor-panel" id="linked-recipes">
          <div className="recipe-editor-panel-heading">
            <div><p className="eyebrow">Reusable components</p><h2>Linked recipes</h2></div>
            <span className="recipe-editor-plus" aria-hidden="true">+</span>
          </div>
          <p className="recipe-editor-help">Link recipes this dish calls upon. They will expand inside this card like a cookbook Basic.</p>
          <RecipeLinkPicker options={linkedOptions} selectedKeys={recipe.linkedRecipeKeys ?? []} />
        </section>

        <div className="recipe-editor-savebar">
          <p>Only the admin session can save these changes.</p>
          <button type="submit">Save recipe card</button>
        </div>
      </form>
    </div>
  );
}
