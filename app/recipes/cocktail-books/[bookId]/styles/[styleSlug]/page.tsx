import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { RecipeImageViewer } from "@/components/recipe-image-viewer";
import { cocktailCodexStyleHref, cocktailCodexStyles, getCocktailCodexStyle } from "@/lib/cocktail-codex";
import { getCocktailBook } from "@/lib/cocktail-books";
import { isRecipeAdminAuthenticated } from "@/lib/recipe-admin-auth";

export const dynamic = "force-dynamic";

type StylePageParams = Promise<{ bookId: string; styleSlug: string }>;

function pageLabel(pages: number[]) {
  return pages.length === 1 ? `PDF page ${pages[0]}` : `PDF pages ${pages.join(", ")}`;
}

export async function generateMetadata({ params }: { params: StylePageParams }): Promise<Metadata> {
  const { bookId, styleSlug } = await params;
  const style = getCocktailCodexStyle(styleSlug);
  return {
    title: bookId === "cocktail-codex" && style ? `${style.label} — Cocktail Codex` : "Cocktail Codex guide",
    robots: { index: false, follow: false },
  };
}

export default async function CocktailCodexStylePage({ params }: { params: StylePageParams }) {
  const authenticated = await isRecipeAdminAuthenticated();
  const { bookId, styleSlug } = await params;
  const book = getCocktailBook(bookId);
  const style = getCocktailCodexStyle(styleSlug);

  if (!book || book.id !== "cocktail-codex" || !style) notFound();

  if (!authenticated) {
    return (
      <div className="page-shell py-16 sm:py-20">
        <h1 className="section-title">Admin login required</h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-ink/60">The full source-book reading guides are kept private.</p>
        <Link className="back-link-bubble mt-6" href="/recipes#recipe-books">← Back to recipe books</Link>
      </div>
    );
  }

  const sections = (book.readingSections ?? []).filter((section) => section.chapter === style.chapter);
  if (sections.length === 0) notFound();

  const sourcePages = Array.from(new Set(sections.flatMap((section) => section.sourcePages))).sort((first, second) => first - second);

  return (
    <>
      <PageIntro
        eyebrow="Cocktail Codex style guide"
        title={style.label}
        description={`${book.author} · ${sections.length} reading sections · PDF pages ${sourcePages[0]}–${sourcePages[sourcePages.length - 1]}`}
      />
      <section className="cocktail-codex-article page-section pt-8 sm:pt-10">
        <div className="cocktail-codex-article-actions">
          <Link className="back-link-bubble" href="/recipes/cocktail-books/cocktail-codex">← Cocktail Codex</Link>
          <Link className="back-link-bubble" href={`/recipes/cocktail-books/cocktail-codex#cocktail-section-${style.slug}`}>View {style.label} recipes</Link>
        </div>

        <nav aria-label="Cocktail styles" className="cocktail-codex-article-style-nav">
          {cocktailCodexStyles.map((entry) => (
            <Link
              aria-current={entry.slug === style.slug ? "page" : undefined}
              href={cocktailCodexStyleHref(entry.slug)}
              key={entry.slug}
            >
              {entry.label}
            </Link>
          ))}
        </nav>

        <div className="cocktail-codex-article-layout">
          <aside className="cocktail-codex-article-contents">
            <p className="eyebrow">On this page</p>
            <ol>
              {sections.map((section, sectionIndex) => (
                <li key={section.id}>
                  <a href={`#cocktail-codex-reading-${section.id}`}>
                    <span>{String(sectionIndex + 1).padStart(2, "0")}</span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </aside>

          <article className="cocktail-codex-article-body">
            {sections.map((section, sectionIndex) => (
              <section id={`cocktail-codex-reading-${section.id}`} key={section.id}>
                <header>
                  <p className="eyebrow">{pageLabel(section.sourcePages)}</p>
                  <h2>{section.title}</h2>
                </header>

                {section.images.length > 0 && (
                  <div className="cocktail-codex-article-media">
                    {section.images.map((src, imageIndex) => (
                      <RecipeImageViewer
                        alt={`${section.title}, source image ${imageIndex + 1}`}
                        className="cocktail-codex-article-image"
                        key={src}
                        src={src}
                      >
                        <Image
                          alt={`${section.title}, source image ${imageIndex + 1}`}
                          className="object-contain"
                          fill
                          sizes="(max-width: 760px) 88vw, 46rem"
                          src={src}
                        />
                      </RecipeImageViewer>
                    ))}
                  </div>
                )}

                <div className="cocktail-codex-article-copy">
                  {section.blocks.map((block, blockIndex) => block.kind === "heading" ? (
                    <h3 key={`${block.text}-${blockIndex}`}>{block.text}</h3>
                  ) : (
                    <p key={`${block.text}-${blockIndex}`}>{block.text}</p>
                  ))}
                </div>

                {sectionIndex < sections.length - 1 && <hr />}
              </section>
            ))}
          </article>
        </div>
      </section>
    </>
  );
}
