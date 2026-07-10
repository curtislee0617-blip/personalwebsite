import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { RecipeCard, type RecipeCardEntry } from "@/components/recipe-card";
import { recipeEntries, recipeSections, recipesByDate, wishlistEntries } from "@/lib/recipes";
import { isRecipeAdminAuthenticated } from "@/lib/recipe-admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Recipes" };

function parseUploadedRecipe(draft: { id: string; description: string; recipe_date: string | null; thumbnail_url: string; status: string }): RecipeCardEntry {
  const lines = draft.description.split("\n").map((line) => line.trim()).filter(Boolean);
  const firstLine = lines[0] ?? "Uploaded recipe";
  const title = firstLine.replace(/^#+\s*/, "");
  const description = lines.slice(1).join(" ") || "Uploaded from the recipe admin.";

  return {
    slug: `uploaded-${draft.id}`,
    title,
    description,
    status: draft.status,
    date: draft.recipe_date ?? undefined,
    thumbnail: draft.thumbnail_url,
  };
}

async function getUploadedRecipes() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("recipe_drafts")
      .select("id,description,recipe_date,thumbnail_url,status")
      .eq("status", "published")
      .order("recipe_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) return [];
    return data.map(parseUploadedRecipe);
  } catch {
    return [];
  }
}

export default async function RecipesPage() {
  const guides = recipeEntries.filter((entry) => entry.kind === "guide");
  const uploadedRecipes = await getUploadedRecipes();
  const recipes = [...recipesByDate(recipeEntries), ...uploadedRecipes];
  const publishedUploadTitles = new Set(uploadedRecipes.map((entry) => entry.title.toLowerCase()));
  const wishlist = wishlistEntries.filter((entry) => !publishedUploadTitles.has(entry.title.toLowerCase()));
  const authenticated = await isRecipeAdminAuthenticated();

  return (
    <>
      <PageIntro
        eyebrow="Recipes"
        title="Guides and recipes"
        description="Guides are for deeper walkthroughs, kitchen systems, and the specific complexities within each topic. Recipes are where the finished dishes will live once they are uploaded, and I will always update the recipes whenever I can."
      />

      <section className="page-section pt-12 sm:pt-16">
        <div className="space-y-12">
          <section>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Guides</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Reference-style kitchen posts</h2>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {guides.map((entry) => (
                    <Link className="rounded-full border border-ink/10 bg-surface/70 px-2.5 py-1 text-[0.65rem] font-semibold text-ink/55 transition hover:border-ink/25 hover:text-ink" href={entry.href} key={entry.slug}>
                      {entry.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="-mx-5 mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-3 pt-1 sm:mx-0 sm:px-0">
              {guides.map((entry) => (
                <Link className="w-[20rem] shrink-0 snap-start rounded-[2rem] border border-ink/10 bg-surface/55 p-6 transition hover:-translate-y-0.5 hover:border-ink/20 sm:w-[24rem] sm:p-8" href={entry.href} id={entry.slug} key={entry.slug}>
                  <div className="flex items-center justify-between gap-4">
                    <p className="eyebrow">Guide</p>
                    <span className="rounded-full border border-ink/10 bg-paper/80 px-3 py-1 text-xs font-semibold text-ink/50">{entry.status === "coming-soon" ? "Coming soon" : "Published"}</span>
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

            <div className="mt-6 space-y-8">
              {recipeSections.map((section) => {
                const sectionRecipes = recipes.filter((entry) => (entry.category ?? "general") === section.id);
                if (sectionRecipes.length === 0) return null;

                return (
                  <details className="group rounded-[2rem] border border-ink/10 bg-surface/45 p-5 sm:p-6" key={section.id}>
                    <summary className="recipes-section-summary flex cursor-pointer list-none items-center justify-between gap-4 marker:hidden">
                      <div>
                        <p className="eyebrow">{section.title}</p>
                        <h3 className="mt-3 text-2xl font-semibold tracking-tight">{section.title}</h3>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/50">{section.description}</p>
                      </div>
                      <span className="grid size-10 shrink-0 place-items-center rounded-full border border-ink/10 bg-paper/80 text-lg text-ink/50 transition group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <div className="mt-5 grid gap-4 border-t border-ink/10 pt-5 sm:grid-cols-2 lg:grid-cols-3">
                      {sectionRecipes.map((entry) => <RecipeCard entry={entry} key={entry.slug} />)}
                    </div>
                  </details>
                );
              })}
            </div>
          </section>

          <section>
            <div>
              <p className="eyebrow">Wishlist</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Recipes I&apos;d like to make</h2>
              <p className="mt-2 text-sm text-ink/50">A running list of dishes I want to cook next.</p>
            </div>

            {wishlist.length > 0 ? (
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {wishlist.map((entry) => (
                  <article className="rounded-[2rem] border border-ink/10 bg-surface/45 p-6 sm:p-8" key={entry.slug}>
                    <p className="eyebrow">To make</p>
                    <h3 className="mt-4 text-xl font-semibold tracking-tight">{entry.title}</h3>
                    {entry.note && <p className="mt-3 text-sm leading-7 text-ink/65">{entry.note}</p>}
                    {authenticated && (
                      <Link className="mt-5 inline-flex rounded-full border border-ink/15 bg-paper/75 px-4 py-2 text-xs font-semibold text-ink/55 transition hover:border-ink/30 hover:text-ink" href={`/recipes/admin?wishlist=${entry.slug}`}>
                        Upload made dish
                      </Link>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[2rem] border border-dashed border-ink/15 bg-surface/30 p-8 text-sm text-ink/45">
                Nothing on the list yet — check back soon.
              </div>
            )}
          </section>

        </div>
      </section>
    </>
  );
}
