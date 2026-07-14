import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { PageIntro } from "@/components/page-intro";
import { RecipeCard, type RecipeCardEntry } from "@/components/recipe-card";
import { RecipeShelf } from "@/components/recipe-shelf";
import { SectionRail } from "@/components/section-rail";
import { SnapCarousel } from "@/components/snap-carousel";
import { recipeEntries, recipeSections, recipesByDate, wishlistEntries } from "@/lib/recipes";
import { isRecipeAdminAuthenticated } from "@/lib/recipe-admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Recipes" };

const recipePageSections = [
  { id: "recipe-guides", label: "Guides" },
  { id: "recipe-collection", label: "Recipes" },
  { id: "recipe-wishlist", label: "Wishlist" },
] as const;

function parseUploadedRecipe(draft: { id: string; description: string; recipe_date: string | null; thumbnail_url: string; status: string; categories: string[] | null }): RecipeCardEntry {
  const lines = draft.description.split("\n").map((line) => line.trim()).filter(Boolean);
  const firstLine = lines[0] ?? "Uploaded recipe";
  const title = firstLine.replace(/^#+\s*/, "");
  const description = lines.slice(1).join(" ") || "Uploaded from the recipe admin.";
  const categories = draft.categories?.length ? draft.categories : ["desserts-pastries"];

  return {
    slug: `uploaded-${draft.id}`,
    title,
    description,
    status: draft.status,
    date: draft.recipe_date ?? undefined,
    thumbnail: draft.thumbnail_url,
    categories,
  };
}

const getUploadedRecipes = unstable_cache(async () => {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("recipe_drafts")
      .select("id,description,recipe_date,thumbnail_url,status,categories")
      .eq("status", "published")
      .order("recipe_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) return [];
    return data.map(parseUploadedRecipe);
  } catch {
    return [];
  }
}, ["published-recipes"], { revalidate: 300, tags: ["published-recipes"] });

const guideVisuals: Record<string, { src?: string; srcs?: string[]; alt: string; mark: string; tone: string }> = {
  "sourdough-guide": {
    srcs: [
      "/Screenshot 2026-07-01 at 1.38.07 AM.png",
      "/Screenshot 2026-07-01 at 1.39.02 AM.png",
      "/Screenshot 2026-07-01 at 1.39.43 AM.png",
    ],
    alt: "Three sourdough loaves and crumb views",
    mark: "SD",
    tone: "grain",
  },
  "core-basics": { alt: "Core cooking fundamentals graphic", mark: "CORE", tone: "core" },
  "viennoiserie-guide": {
    srcs: [
      "/recipes/viennoiserie/Croissants1.jpeg",
      "/recipes/viennoiserie/Croissant4.jpeg",
      "/recipes/viennoiserie/Croissants2.jpeg",
    ],
    alt: "Croissants and laminated pastries",
    mark: "LAM",
    tone: "pastry",
  },
  "pasta-guide": { alt: "Fresh pasta guide graphic", mark: "PASTA", tone: "pasta" },
  "sushi-guide": { alt: "Sushi guide graphic", mark: "SUSHI", tone: "sushi" },
  "cookbook-guide": { src: "/project-documents/cook-enterprise/book2.jpeg", alt: "Cookbook spread preview", mark: "BOOK", tone: "book" },
};

function GuideVisual({ slug }: { slug: string }) {
  const visual = guideVisuals[slug] ?? { alt: "Recipe guide graphic", mark: "GUIDE", tone: "default" };
  return (
    <div className={`recipe-guide-media swipe-bubble-media is-${visual.tone}`}>
      {visual.srcs ? (
        <div className="recipe-guide-photo-grid">
          {visual.srcs.map((src, index) => (
            <div className="relative" key={src}>
              <Image alt={`${visual.alt}, image ${index + 1}`} className="object-cover" fill sizes="(max-width: 640px) 24vw, 8rem" src={src} />
            </div>
          ))}
        </div>
      ) : visual.src ? (
        <Image alt={visual.alt} className="object-cover" fill sizes="(max-width: 640px) 70vw, 24rem" src={visual.src} />
      ) : (
        <div className="recipe-guide-generated" aria-label={visual.alt} role="img">
          <i /><b /><span>{visual.mark}</span>
        </div>
      )}
    </div>
  );
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
      <SectionRail ariaLabel="Recipe page sections" sections={recipePageSections} />

      <section className="page-section pt-12 sm:pt-16">
        <div className="space-y-12">
          <section id="recipe-guides">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Guides</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Reference-style kitchen posts</h2>
                <div className="recipe-anchor-tabs mt-4 flex flex-wrap gap-1.5">
                  {guides.map((entry) => (
                    <Link className="recipe-anchor-tab rounded-full border border-ink/10 bg-surface/70 px-2.5 py-1 text-[0.65rem] font-semibold text-ink/55 transition hover:border-ink/25 hover:text-ink" href={entry.href} key={entry.slug}>
                      {entry.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <SnapCarousel className="recipe-guide-carousel mobile-snap-carousel -mx-5 mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-3 pt-1 sm:mx-0 sm:px-0" repeatEdges={false}>
              {guides.map((entry) => (
                <Link className="recipe-guide-card swipe-bubble-card w-[20rem] shrink-0 overflow-hidden rounded-[1.5rem] border border-ink/10 bg-surface/55 transition hover:-translate-y-0.5 hover:border-ink/20 sm:w-[24rem]" href={entry.href} id={entry.slug} key={entry.slug}>
                  <GuideVisual slug={entry.slug} />
                  <div className="recipe-guide-copy swipe-bubble-copy">
                    <div className="flex items-center justify-between gap-4">
                      <p className="eyebrow">Guide</p>
                      <span className="recipe-guide-status">{entry.status === "coming-soon" ? "Coming soon" : "Published"}</span>
                    </div>
                    <div className="recipe-guide-title-row">
                      <h3>{entry.title}</h3>
                      <span aria-hidden="true">↗</span>
                    </div>
                    <p className="recipe-guide-description">{entry.description}</p>
                  </div>
                </Link>
              ))}
            </SnapCarousel>
          </section>

          <section id="recipe-collection">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Recipes</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Recipes</h2>
                <p className="section-description mt-2 text-sm text-ink/50">Ordered by date, newest first. Heads up: I do not have precise numbers for most of these — treat quantities as a guide, not gospel.</p>
              </div>
              {authenticated && (
                <Link className="self-start rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper transition hover:bg-moss sm:self-auto" href="/recipes/admin">
                  + Upload recipe
                </Link>
              )}
            </div>

            <div className="mt-6 space-y-8">
              {recipeSections.map((section, index) => {
                const sectionRecipes = recipes.filter((entry) => entry.categories?.includes(section.id) || entry.category === section.id);

                return (
                  <details className="design-panel group rounded-[2rem] border border-ink/10 bg-surface/45 p-5 sm:p-6" key={section.id} open={index === 0}>
                    <summary className="recipes-section-summary flex cursor-pointer list-none items-center justify-between gap-4 marker:hidden">
                      <div>
                        <p className="eyebrow">{section.title}</p>
                        <h3 className="mt-3 text-2xl font-semibold tracking-tight">{section.title}</h3>
                        <p className="section-description mt-2 max-w-2xl text-sm leading-6 text-ink/50">{section.description}</p>
                      </div>
                      <span className="grid size-10 shrink-0 place-items-center rounded-full border border-ink/10 bg-paper/80 text-lg text-ink/50 transition group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    {sectionRecipes.length > 0 ? (
                      <RecipeShelf label={section.title}>
                        {sectionRecipes.map((entry) => <RecipeCard entry={entry} key={entry.slug} variant="shelf" />)}
                      </RecipeShelf>
                    ) : <div className="mt-6 rounded-2xl border border-dashed border-ink/10 p-5 text-sm text-ink/40">No recipes here yet.</div>}
                  </details>
                );
              })}
            </div>
          </section>

          <section id="recipe-wishlist">
            <div>
              <p className="eyebrow">Wishlist</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Recipes I&apos;d like to make</h2>
              <p className="section-description mt-2 text-sm text-ink/50">A running list of dishes I want to cook next.</p>
            </div>

            {wishlist.length > 0 ? (
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {wishlist.map((entry) => (
                  <article className="design-panel rounded-[2rem] border border-ink/10 bg-surface/45 p-6 sm:p-8" key={entry.slug}>
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
              <div className="design-panel mt-6 rounded-[2rem] border border-dashed border-ink/15 bg-surface/30 p-8 text-sm text-ink/45">
                Nothing on the list yet — check back soon.
              </div>
            )}
          </section>

        </div>
      </section>
    </>
  );
}
