import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CocktailCabinetMatcher } from "@/components/cocktail-cabinet-matcher";
import { PageIntro } from "@/components/page-intro";
import { cocktailBooks, getCocktailMatcherRecipes } from "@/lib/cocktail-books";
import { isRecipeAdminAuthenticated } from "@/lib/recipe-admin-auth";

export const metadata: Metadata = {
  title: "Private cocktail library",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function CocktailBooksPage() {
  const authenticated = await isRecipeAdminAuthenticated();

  if (!authenticated) {
    return (
      <div className="page-shell py-16 sm:py-20">
        <h1 className="section-title">Private cocktail library</h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-ink/60">
          This source library is visible only after admin login. Log in from the footer, then return here.
        </p>
        <Link className="back-link-bubble mt-6" href="/recipes#recipe-category-drinks">← Back to Cocktails &amp; Drinks</Link>
      </div>
    );
  }

  const matcherRecipes = getCocktailMatcherRecipes();

  return (
    <>
      <PageIntro
        eyebrow="Admin-only recipe books"
        title="Cocktail library"
        description={`${cocktailBooks.length} separate books · ${matcherRecipes.length} recipes and preparations · original section hierarchies and source images retained.`}
      />
      <section className="cocktail-library-index page-section pt-8 sm:pt-10">
        <div className="flex flex-wrap gap-3">
          <Link className="back-link-bubble" href="/recipes#recipe-category-drinks">← Back to Cocktails &amp; Drinks</Link>
          <Link className="back-link-bubble" href="/recipes/admin">Recipe admin</Link>
        </div>

        <div className="cocktail-library-book-grid">
          {cocktailBooks.map((book) => (
            <Link className="cocktail-library-book-card" href={`/recipes/cocktail-books/${book.id}`} key={book.id}>
              {book.thumbnail ? (
                <div className="cocktail-library-book-cover">
                  <Image alt={`${book.title} source cover`} className="object-cover" fill priority sizes="(max-width: 760px) 92vw, 28rem" src={book.thumbnail} />
                </div>
              ) : (
                <div className="cocktail-library-book-cover is-text-only" aria-hidden="true">
                  <span>LOST</span><small>COCKTAILS</small>
                </div>
              )}
              <div>
                <p className="eyebrow">Private book · {book.recipeCountLabel}</p>
                <h2>{book.title}</h2>
                <p>{book.author}</p>
                <small>{book.sections.length} original sections · {book.images.length} imported images</small>
              </div>
            </Link>
          ))}
        </div>

        <CocktailCabinetMatcher recipes={matcherRecipes} />
      </section>
    </>
  );
}
