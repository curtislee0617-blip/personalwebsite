import type { Metadata } from "next";
import Link from "next/link";
import { InstagramSavedSearch } from "@/components/instagram-saved-search";
import { MobileDefaultOpenDetails } from "@/components/mobile-default-open-details";
import { RecipeCard } from "@/components/recipe-card";
import { RecipeShelf } from "@/components/recipe-shelf";
import { SectionRail } from "@/components/section-rail";
import { recipeCategories } from "@/data/recipe-categories";
import { isRecipeAdminAuthenticated } from "@/lib/recipe-admin-auth";
import { getInstagramSavedRecipeCards } from "@/lib/personal-recipes";

export const metadata: Metadata = { title: "Instagram saved food" };

const instagramCategories = [
  ...recipeCategories,
  {
    id: "inspiration",
    title: "Other inspiration",
    description: "Saved dishes, techniques, and visual references without a written recipe.",
  },
];

export default async function InstagramSavedRecipesPage() {
  const [instagramSavedRecipes, authenticated] = await Promise.all([
    getInstagramSavedRecipeCards(),
    isRecipeAdminAuthenticated(),
  ]);
  const populatedCategories = instagramCategories.flatMap((category) => {
    const entries = instagramSavedRecipes.filter((entry) => entry.categories?.[0] === category.id);
    return entries.length > 0 ? [{ ...category, entries }] : [];
  });
  const pageSections = [
    { id: "instagram-all-saved", label: "All saved posts" },
    ...populatedCategories.map((category) => ({ id: `instagram-category-${category.id}`, label: category.title })),
  ];

  return (
    <>
      <main className="page-shell page-section instagram-saved-page">
        <Link className="back-link-bubble mb-6" href="/recipes#recipe-wishlist">← Back to wishlist</Link>
        <p className="eyebrow">Wishlist · Instagram saved</p>
        <h1 className="section-title mt-3">Instagram saved food</h1>
        <p className="section-description mt-3 max-w-3xl">
          {instagramSavedRecipes.length} saved recipes, techniques, and dish ideas. Written ingredient lists are transcribed where they appeared in the caption; every card keeps the original carousel or reel together through its Instagram embed.
        </p>

        <InstagramSavedSearch entries={instagramSavedRecipes} />

        <details className="instagram-saved-all-posts recipe-all-section design-panel group" id="instagram-all-saved">
          <summary className="recipes-section-summary">
            <span>
              <span className="eyebrow">Saved order</span>
              <h2 id="instagram-all-saved-title">All saved posts</h2>
              <small>{instagramSavedRecipes.length} posts · newest to oldest</small>
            </span>
            <span className="recipe-section-expand-mark">+</span>
          </summary>
          <RecipeShelf label="All Instagram saved posts, newest first" layout="grid">
            {instagramSavedRecipes.map((entry) => (
              <RecipeCard
                adminEditHref={authenticated ? `/recipes/admin/edit/${encodeURIComponent(entry.recipeKey)}` : undefined}
                adminReturnTo="/recipes/instagram-saved"
                entry={entry}
                idPrefix="instagram-all"
                key={`all-${entry.recipeKey}`}
                variant="shelf"
              />
            ))}
          </RecipeShelf>
        </details>

        <div className="instagram-saved-categories">
          <div className="instagram-saved-category-heading">
            <p className="eyebrow">Browse by category</p>
            <h2>Categories</h2>
          </div>
          {populatedCategories.map((category) => (
              <MobileDefaultOpenDetails className="recipe-category-section design-panel group rounded-[2rem] border border-ink/10 bg-surface/45 p-5 sm:p-6" id={`instagram-category-${category.id}`} key={category.id}>
                <summary className="recipes-section-summary flex cursor-pointer list-none items-center justify-between gap-4 marker:hidden">
                  <span>
                    <h2 className="text-2xl font-semibold tracking-tight">{category.title}</h2>
                    <small>{category.entries.length} saved posts</small>
                  </span>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full border border-ink/10 bg-paper/80 text-lg text-ink/50 transition group-open:rotate-45">+</span>
                </summary>
                <RecipeShelf label={`${category.title} Instagram saves`} layout="grid">
                  {category.entries.map((entry) => (
                    <RecipeCard
                      adminEditHref={authenticated ? `/recipes/admin/edit/${encodeURIComponent(entry.recipeKey)}` : undefined}
                      adminReturnTo="/recipes/instagram-saved"
                      entry={entry}
                      key={entry.recipeKey}
                      variant="shelf"
                    />
                  ))}
                </RecipeShelf>
              </MobileDefaultOpenDetails>
          ))}
        </div>
      </main>
      <SectionRail ariaLabel="Instagram saved food sections" sections={pageSections} />
    </>
  );
}
