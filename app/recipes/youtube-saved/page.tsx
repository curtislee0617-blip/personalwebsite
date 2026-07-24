import type { Metadata } from "next";
import { HistoryBackButton } from "@/components/history-back-button";
import { InstagramSavedSearch } from "@/components/instagram-saved-search";
import { MediaSavedWishlistProvider } from "@/components/media-saved-wishlist";
import { RecipeCard } from "@/components/recipe-card";
import { RecipeShelf } from "@/components/recipe-shelf";
import { SectionRail } from "@/components/section-rail";
import { recipeCategories } from "@/data/recipe-categories";
import { isRecipeAdminAuthenticated } from "@/lib/recipe-admin-auth";
import { getYouTubeSavedRecipeCards } from "@/lib/personal-recipes";
import { getRecipeWishlistEntries } from "@/lib/recipe-wishlist";

export const metadata: Metadata = { title: "YouTube saved recipes" };

const youtubeCategories = [
  ...recipeCategories,
  {
    id: "inspiration",
    title: "Other inspiration",
    description: "Saved dishes, techniques, and visual references that need further transcription.",
  },
];

export default async function YouTubeSavedRecipesPage() {
  const [youtubeSavedRecipes, authenticated, wishlistEntries] = await Promise.all([
    getYouTubeSavedRecipeCards(),
    isRecipeAdminAuthenticated(),
    getRecipeWishlistEntries(),
  ]);
  const wishlistSourceKeys = new Set(wishlistEntries.map((entry) => entry.slug));
  const wishlistedRecipeKeys = authenticated
    ? youtubeSavedRecipes
      .filter((entry) => wishlistSourceKeys.has(`media:${entry.recipeKey}`))
      .map((entry) => entry.recipeKey)
    : [];
  const populatedCategories = youtubeCategories.flatMap((category) => {
    const entries = youtubeSavedRecipes.filter((entry) => entry.categories?.includes(category.id));
    return entries.length > 0 ? [{ ...category, entries }] : [];
  });
  const pageSections = [
    { id: "youtube-all-saved", label: "Playlist order" },
    ...populatedCategories.map((category) => ({ id: `youtube-category-${category.id}`, label: category.title })),
  ];

  return (
    <>
      <MediaSavedWishlistProvider initialRecipeKeys={wishlistedRecipeKeys}>
        <main className="page-shell page-section instagram-saved-page youtube-saved-page">
          <HistoryBackButton className="mb-6" fallbackHref="/recipes#recipe-media-saved">← Back to media saved recipes</HistoryBackButton>
          <p className="eyebrow">Media saved recipes · YouTube</p>
          <h1 className="section-title mt-3">YouTube saved recipes</h1>
          <p className="section-description mt-3 max-w-3xl">
            {youtubeSavedRecipes.length} videos from the Food playlist, kept in playlist order. Recipes use creator descriptions and linked written sources where available, with a simple link back to each original video.
          </p>

          <InstagramSavedSearch
            entries={youtubeSavedRecipes}
            idPrefix="youtube"
            label="Search saved YouTube videos"
            placeholder="Search dishes, creators, ingredients, or categories"
          />

          <details className="instagram-saved-all-posts recipe-all-section design-panel group" id="youtube-all-saved" open>
            <summary className="recipes-section-summary">
              <span>
                <span className="eyebrow">Saved order</span>
                <h2 id="youtube-all-saved-title">All playlist videos</h2>
                <small>{youtubeSavedRecipes.length} videos · original playlist order</small>
              </span>
              <span className="recipe-section-expand-mark">+</span>
            </summary>
            <RecipeShelf label="All YouTube saved videos in playlist order" layout="grid">
              {youtubeSavedRecipes.map((entry) => (
                <RecipeCard
                  adminEditHref={authenticated ? `/recipes/admin/edit/${encodeURIComponent(entry.recipeKey)}` : undefined}
                  adminMediaWishlist={authenticated}
                  adminReturnTo="/recipes/youtube-saved"
                  entry={entry}
                  idPrefix="youtube-all"
                  key={`all-${entry.recipeKey}`}
                  thumbnailScale={1.18}
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
              <details className="recipe-category-section design-panel group rounded-[2rem] border border-ink/10 bg-surface/45 p-5 sm:p-6" id={`youtube-category-${category.id}`} key={category.id}>
                <summary className="recipes-section-summary flex cursor-pointer list-none items-center justify-between gap-4 marker:hidden">
                  <span>
                    <h2 className="text-2xl font-semibold tracking-tight">{category.title}</h2>
                    <small>{category.entries.length} saved videos</small>
                  </span>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full border border-ink/10 bg-paper/80 text-lg text-ink/50 transition group-open:rotate-45">+</span>
                </summary>
                <RecipeShelf label={`${category.title} YouTube saves`} layout="grid">
                  {category.entries.map((entry) => (
                    <RecipeCard
                      adminEditHref={authenticated ? `/recipes/admin/edit/${encodeURIComponent(entry.recipeKey)}` : undefined}
                      adminMediaWishlist={authenticated}
                      adminReturnTo="/recipes/youtube-saved"
                      entry={entry}
                      key={entry.recipeKey}
                      thumbnailScale={1.18}
                      variant="shelf"
                    />
                  ))}
                </RecipeShelf>
              </details>
            ))}
          </div>
        </main>
      </MediaSavedWishlistProvider>
      <SectionRail ariaLabel="YouTube saved recipe sections" sections={pageSections} />
    </>
  );
}
