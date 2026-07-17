"use client";

import { deleteRecipeCard } from "@/app/recipes/admin/actions";

export function RecipeDeleteButton({
  recipeKey,
  returnTo,
  title,
}: {
  recipeKey: string;
  returnTo: string;
  title: string;
}) {
  return (
    <form
      action={deleteRecipeCard}
      onSubmit={(event) => {
        if (!window.confirm(`Delete “${title}”? This removes the card from the website.`)) {
          event.preventDefault();
        }
      }}
    >
      <input name="recipe_key" type="hidden" value={recipeKey} />
      <input name="return_to" type="hidden" value={returnTo} />
      <button className="recipe-card-delete-button" type="submit">Delete recipe</button>
    </form>
  );
}
