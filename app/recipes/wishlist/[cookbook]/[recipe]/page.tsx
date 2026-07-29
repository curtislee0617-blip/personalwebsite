import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HistoryBackButton } from "@/components/history-back-button";
import { PageIntro } from "@/components/page-intro";
import { PublicCookbookWishlistRecipe } from "@/components/imported-cookbook-guide";
import { cookbookWishlistImageHref } from "@/lib/cookbook-wishlist-public";
import { getImportedCookbook } from "@/lib/imported-cookbooks";
import { getCookbookWishlistEntry } from "@/lib/recipe-wishlist";

export const dynamic = "force-dynamic";

type WishlistRecipeParams = {
  params: Promise<{ cookbook: string; recipe: string }>;
};

async function loadPublicRecipe(params: WishlistRecipeParams["params"]) {
  const { cookbook: cookbookId, recipe: recipeId } = await params;
  const wishlistEntry = await getCookbookWishlistEntry(cookbookId, recipeId);
  if (!wishlistEntry) return null;

  const cookbook = await getImportedCookbook(cookbookId);
  const recipe = cookbook?.recipes.find((entry) => entry.id === recipeId);
  if (!cookbook || !recipe) return null;

  return { cookbook, recipe };
}

export async function generateMetadata({ params }: WishlistRecipeParams): Promise<Metadata> {
  const result = await loadPublicRecipe(params);
  return {
    title: result ? `${result.recipe.title} · ${result.cookbook.title}` : "Wishlist recipe",
  };
}

export default async function PublicCookbookWishlistRecipePage({ params }: WishlistRecipeParams) {
  const result = await loadPublicRecipe(params);
  if (!result) notFound();

  const { cookbook, recipe } = result;
  const imageSrc = recipe.image
    ? cookbookWishlistImageHref(cookbook.id, recipe.id)
    : undefined;

  return (
    <>
      <PageIntro
        eyebrow="Public wishlist recipe"
        title={recipe.title}
        description={`From ${cookbook.title} by ${cookbook.author}. Only this selected recipe is shared publicly; the rest of the book remains in the private cookbook library.`}
      />
      <section className="page-section pt-8 sm:pt-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <HistoryBackButton fallbackHref="/recipes#recipe-wishlist">← Back to wishlist</HistoryBackButton>
          <Link className="back-link-bubble" href="/contact">Ask about cookbook access</Link>
        </div>
        <PublicCookbookWishlistRecipe
          cookbook={cookbook}
          imageSrc={imageSrc}
          recipe={recipe}
        />
      </section>
    </>
  );
}
