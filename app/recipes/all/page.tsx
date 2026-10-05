import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { RecipeCard } from "@/components/recipe-card";
import { recipeCategories } from "@/data/recipe-categories";
import { getPersonalRecipeCards } from "@/lib/personal-recipes";
import { isRecipeAdminAuthenticated } from "@/lib/recipe-admin-auth";
import type { RecipeCardEntry } from "@/lib/recipe-card-types";

export const metadata: Metadata = { title: "All Recipes" };

function sortNewestFirst(a: RecipeCardEntry, b: RecipeCardEntry) {
  if (a.date && b.date) return b.date.localeCompare(a.date) || a.title.localeCompare(b.title);
  if (a.date) return -1;
  if (b.date) return 1;
  return a.title.localeCompare(b.title);
}

export default async function AllRecipesPage() {
  const [recipes, authenticated] = await Promise.all([
    getPersonalRecipeCards(),
    isRecipeAdminAuthenticated(),
  ]);
  const sortedRecipes = [...recipes].sort(sortNewestFirst);
  const linkedRecipes = new Map(sortedRecipes.map((recipe) => [recipe.recipeKey, recipe]));
  const groups: Array<{ id: string; title: string; description: string; recipes: RecipeCardEntry[] }> = recipeCategories
    .map((category) => ({
      ...category,
      recipes: sortedRecipes.filter((recipe) => (
        recipe.category === category.id || recipe.categories?.includes(category.id)
      )),
    }))
    .filter((category) => category.recipes.length > 0);
  const uncategorized = sortedRecipes.filter((recipe) => !recipe.category && !recipe.categories?.length);
  if (uncategorized.length) {
    groups.push({
      id: "uncategorized",
      title: "Other recipes",
      description: "Recipes not assigned to a category yet.",
      recipes: uncategorized,
    });
  }

  return (
    <main className="recipe-library-page all-recipes-page">
      <div className="recipe-library-hero page-shell">
        <PageIntro
          eyebrow="Recipe index"
          title="All recipes"
          description={`${sortedRecipes.length} recipes, arranged by category and ready to browse.`}
        />
      </div>

      <section className="page-section all-recipes-content" aria-label="All recipes by category">
        <div className="all-recipes-toolbar">
          <Link className="all-recipes-back" href="/recipes#recipe-collection">← Back to recipes</Link>
          <nav aria-label="Recipe categories" className="all-recipes-category-nav">
            {groups.map((group) => (
              <a href={`#all-${group.id}`} key={group.id}>{group.title}<span>{group.recipes.length}</span></a>
            ))}
          </nav>
        </div>

        <div className="all-recipes-collage">
          {groups.map((group, groupIndex) => (
            <section
              aria-labelledby={`all-${group.id}-title`}
              className="all-recipes-category"
              id={`all-${group.id}`}
              key={group.id}
              style={{ "--category-index": groupIndex } as CSSProperties}
            >
              <header className="all-recipes-category-heading">
                <div>
                  <p className="eyebrow">Collection {String(groupIndex + 1).padStart(2, "0")}</p>
                  <h2 id={`all-${group.id}-title`}>{group.title}</h2>
                  <p>{group.description}</p>
                </div>
                <span className="all-recipes-category-count">{group.recipes.length}</span>
              </header>
              <ul className="recipe-browser-grid all-recipes-grid">
                {group.recipes.map((entry) => (
                  <li key={entry.recipeKey}>
                    <RecipeCard
                      adminEditHref={authenticated ? `/recipes/admin/edit/${encodeURIComponent(entry.recipeKey)}` : undefined}
                      entry={entry}
                      idPrefix={group.id}
                      linkedRecipes={(entry.linkedRecipeKeys ?? []).flatMap((key) => {
                        const linked = linkedRecipes.get(key);
                        return linked ? [linked] : [];
                      })}
                      variant="shelf"
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
