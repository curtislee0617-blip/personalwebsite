import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { recipeEntries } from "@/lib/recipes";

export const metadata: Metadata = { title: "Recipes" };

export default function RecipesPage() {
  const guides = recipeEntries.filter((entry) => entry.kind === "guide");
  const recipes = recipeEntries.filter((entry) => entry.kind === "recipe");

  return (
    <>
      <PageIntro
        eyebrow="Recipes"
        title="Guides and recipes"
        description="Guides are for deeper walkthroughs and kitchen systems. Recipes are where the finished dishes will live once they are uploaded."
      />

      <section className="page-section pt-12 sm:pt-16">
        <div className="space-y-14">
          <section>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Guides</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Reference-style kitchen posts</h2>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {guides.map((entry) => (
                <Link className="rounded-[2rem] border border-ink/10 bg-white/55 p-6 transition hover:-translate-y-0.5 hover:border-ink/20 sm:p-8" href={entry.href} key={entry.slug}>
                  <div className="flex items-center justify-between gap-4">
                    <p className="eyebrow">Guide</p>
                    <span className="rounded-full border border-ink/10 bg-paper/80 px-3 py-1 text-xs font-semibold text-ink/50">Published</span>
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight">{entry.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-ink/65">{entry.description}</p>
                  <p className="mt-6 text-sm font-semibold text-moss">Open guide ↗</p>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <div>
              <p className="eyebrow">Recipes</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Scaffold for future recipe posts</h2>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {recipes.map((entry) => (
                <article className="rounded-[2rem] border border-dashed border-ink/15 bg-white/40 p-6 sm:p-8" key={entry.slug}>
                  <div className="flex items-center justify-between gap-4">
                    <p className="eyebrow">Recipe</p>
                    <span className="rounded-full border border-ink/10 bg-paper/80 px-3 py-1 text-xs font-semibold text-ink/50">Coming later</span>
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight">{entry.title}</h3>
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
        </div>
      </section>
    </>
  );
}
