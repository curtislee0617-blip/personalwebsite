import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { recipeBooks, recipeEntries, recipesByDate, wishlistEntries } from "@/lib/recipes";
import { isRecipeAdminAuthenticated } from "@/lib/recipe-admin-auth";

export const metadata: Metadata = { title: "Recipes" };

function formatDate(date?: string) {
  if (!date) return null;
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default async function RecipesPage() {
  const guides = recipeEntries.filter((entry) => entry.kind === "guide");
  const recipes = recipesByDate(recipeEntries);
  const authenticated = await isRecipeAdminAuthenticated();

  return (
    <>
      <PageIntro
        eyebrow="Recipes"
        title="Guides and recipes"
        description="Guides are for deeper walkthroughs and kitchen systems. Recipes are where the finished dishes will live once they are uploaded."
      />

      <section className="page-section pt-12 sm:pt-16">
        <div className="space-y-12">
          <section>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Guides</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Reference-style kitchen posts</h2>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {guides.map((entry) => (
                <Link className="rounded-[2rem] border border-ink/10 bg-surface/55 p-6 transition hover:-translate-y-0.5 hover:border-ink/20 sm:p-8" href={entry.href} key={entry.slug}>
                  <div className="flex items-center justify-between gap-4">
                    <p className="eyebrow">Guide</p>
                    <span className="rounded-full border border-ink/10 bg-paper/80 px-3 py-1 text-xs font-semibold text-ink/50">Published</span>
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight">{entry.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-ink/65">{entry.description}</p>
                  {entry.slug === "cookbook-guide" ? (
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      {[
                        { src: "/project-documents/cook-enterprise/book1.jpeg", alt: "Cookbook team photo" },
                        { src: "/project-documents/cook-enterprise/book2.jpeg", alt: "Cookbook spread preview" },
                      ].map((image) => (
                        <div className="relative overflow-hidden rounded-[1.2rem] border border-ink/10 bg-paper/70" key={image.src}>
                          <div className="relative aspect-[4/3]">
                            <Image alt={image.alt} className="object-cover" fill sizes="(max-width: 768px) 50vw, 25vw" src={image.src} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {entry.slug === "sourdough-guide" ? (
                    <div className="mt-5 grid grid-cols-3 gap-2">
                      {[
                        { src: "/Screenshot 2026-07-01 at 1.38.07 AM.png", alt: "Sourdough loaf" },
                        { src: "/Screenshot 2026-07-01 at 1.39.02 AM.png", alt: "Sourdough crumb" },
                        { src: "/Screenshot 2026-07-01 at 1.39.43 AM.png", alt: "Sourdough boule" },
                      ].map((image) => (
                        <div className="relative overflow-hidden rounded-[1rem] border border-ink/10 bg-paper/70" key={image.src}>
                          <div className="relative aspect-square">
                            <Image alt={image.alt} className="object-cover" fill sizes="(max-width: 768px) 33vw, 12vw" src={image.src} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <p className="mt-6 text-sm font-semibold text-moss">Open guide ↗</p>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Recipes</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Recipes</h2>
                <p className="mt-2 text-sm text-ink/50">Ordered by date, newest first. Heads up: I do not have precise numbers for most of these — treat quantities as a guide, not gospel.</p>
              </div>
              {authenticated && (
                <Link className="self-start rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper transition hover:bg-moss sm:self-auto" href="/recipes/admin">
                  + Upload recipe
                </Link>
              )}
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {recipes.map((entry) => (
                <article className="rounded-[2rem] border border-dashed border-ink/15 bg-surface/40 p-6 sm:p-8" key={entry.slug}>
                  <div className="flex items-center justify-between gap-4">
                    <p className="eyebrow">Recipe</p>
                    <span className="rounded-full border border-ink/10 bg-paper/80 px-3 py-1 text-xs font-semibold text-ink/50">Coming later</span>
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight">{entry.title}</h3>
                  {formatDate(entry.date) && <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink/40">{formatDate(entry.date)}</p>}
                  <p className="mt-4 text-sm leading-7 text-ink/65">{entry.description}</p>
                  <div className="mt-6 grid gap-2 text-sm text-ink/45">
                    <p>Title</p>
                    <p>Short headnote</p>
                    <p>Ingredients</p>
                    <p>Method</p>
                    <p>Notes / variations</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <div>
              <p className="eyebrow">Wishlist</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Recipes I&apos;d like to make</h2>
              <p className="mt-2 text-sm text-ink/50">A running list of dishes I want to cook next.</p>
            </div>

            {wishlistEntries.length > 0 ? (
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {wishlistEntries.map((entry) => (
                  <article className="rounded-[2rem] border border-ink/10 bg-surface/45 p-6 sm:p-8" key={entry.slug}>
                    <p className="eyebrow">To make</p>
                    <h3 className="mt-4 text-xl font-semibold tracking-tight">{entry.title}</h3>
                    {entry.note && <p className="mt-3 text-sm leading-7 text-ink/65">{entry.note}</p>}
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[2rem] border border-dashed border-ink/15 bg-surface/30 p-8 text-sm text-ink/45">
                Nothing on the list yet — check back soon.
              </div>
            )}
          </section>

          <section>
            <div>
              <p className="eyebrow">Bookshelf</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Recipe books I&apos;ve bought</h2>
              <p className="mt-2 text-sm text-ink/50">Cookbooks in my collection. Photos coming soon.</p>
            </div>

            {recipeBooks.length > 0 ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {recipeBooks.map((book) => (
                  <article className="overflow-hidden rounded-[1.5rem] border border-ink/10 bg-surface/45" key={book.slug}>
                    {book.cover && (
                      <div className="relative aspect-[3/4]">
                        <Image alt={book.title} className="object-cover" fill sizes="(max-width: 768px) 50vw, 25vw" src={book.cover} />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-base font-semibold tracking-tight">{book.title}</h3>
                      {book.author && <p className="mt-1 text-sm text-ink/55">{book.author}</p>}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[2rem] border border-dashed border-ink/15 bg-surface/30 p-8 text-sm text-ink/45">
                The shelf is being built — book photos will go here.
              </div>
            )}
          </section>
        </div>
      </section>
    </>
  );
}
