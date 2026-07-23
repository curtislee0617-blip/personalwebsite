import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CocktailBookBrowser } from "@/components/cocktail-book-browser";
import { PageIntro } from "@/components/page-intro";
import { cocktailCodexStyleHref, cocktailCodexStyles } from "@/lib/cocktail-codex";
import { getCocktailBook, getCocktailPublications } from "@/lib/cocktail-books";
import { isRecipeAdminAuthenticated } from "@/lib/recipe-admin-auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ bookId: string }> }): Promise<Metadata> {
  const { bookId } = await params;
  const book = getCocktailBook(bookId);
  return {
    title: book?.title ?? "Cocktail recipe book",
    robots: { index: false, follow: false },
  };
}

export default async function CocktailBookPage({ params }: { params: Promise<{ bookId: string }> }) {
  const authenticated = await isRecipeAdminAuthenticated();
  const { bookId } = await params;
  const book = getCocktailBook(bookId);
  if (!book) notFound();

  if (!authenticated) {
    return (
      <div className="page-shell py-16 sm:py-20">
        <h1 className="section-title">Admin login required</h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-ink/60">The full source-book recipes are kept private.</p>
        <Link className="back-link-bubble mt-6" href="/recipes#recipe-books">← Back to recipe books</Link>
      </div>
    );
  }

  const publications = await getCocktailPublications();
  const initiallyPublished = publications
    .filter((publication) => publication.bookId === book.id)
    .map((publication) => publication.recipeId);
  const structureLabel = book.id === "lost-cocktails"
    ? "50 drinks in the book’s original numbered order"
    : book.id === "cocktail-codex"
      ? "6 cocktail styles + 1 appendix"
      : `${book.sections.length} original sections`;

  return (
    <>
      <PageIntro
        eyebrow="Private cocktail book"
        title={book.title}
        description={`${book.author} · ${book.recipeCountLabel} · ${structureLabel} · ${book.images.length} imported images`}
      />
      <section className="cocktail-library-book-page page-section pt-8 sm:pt-10">
        <div className="flex flex-wrap gap-3">
          <Link className="back-link-bubble" href="/recipes/cocktail-books">← Cocktail library</Link>
          <Link className="back-link-bubble" href="/recipes#recipe-category-drinks">Cocktails &amp; Drinks</Link>
        </div>
        <p className="cocktail-library-book-description">{book.description}</p>
        {book.id === "cocktail-codex" && (
          <nav aria-label="Cocktail Codex style guides" className="cocktail-codex-style-links">
            <div className="cocktail-codex-style-links-heading">
              <div>
                <p className="eyebrow">Read the book</p>
                <h2>The six cocktail styles</h2>
              </div>
              <p>History, structure, ingredients and technique are collected into six continuous reading guides.</p>
            </div>
            <div className="cocktail-codex-style-link-grid">
              {cocktailCodexStyles.map((style, styleIndex) => {
                const sections = book.readingSections?.filter((section) => section.chapter === style.chapter) ?? [];
                const sourcePages = Array.from(new Set(sections.flatMap((section) => section.sourcePages))).sort((first, second) => first - second);
                return (
                  <Link className="cocktail-codex-style-link" href={cocktailCodexStyleHref(style.slug)} key={style.slug}>
                    <small>Style {String(styleIndex + 1).padStart(2, "0")}</small>
                    <strong>{style.label}</strong>
                    <span>{sections.length} sections · PDF pages {sourcePages[0]}–{sourcePages[sourcePages.length - 1]}</span>
                    <i aria-hidden="true">Read guide →</i>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
        <CocktailBookBrowser book={book} initiallyPublished={initiallyPublished} />
      </section>
    </>
  );
}
