import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { RecipeLibrarySearch } from "@/components/recipe-library-search";
import { RecipeCard } from "@/components/recipe-card";
import { RecipeShelf } from "@/components/recipe-shelf";
import { SectionRail } from "@/components/section-rail";
import { SnapCarousel } from "@/components/snap-carousel";
import { recipeEntries, recipeSections, wishlistEntries } from "@/lib/recipes";
import { getInstagramSavedRecipeCards, getPersonalRecipeCards, getYouTubeSavedRecipeCards } from "@/lib/personal-recipes";
import type { RecipeCardEntry } from "@/lib/recipe-card-types";
import type { RecipeSearchItem } from "@/lib/recipe-search";
import { isRecipeAdminAuthenticated } from "@/lib/recipe-admin-auth";
import { importedCookbooks } from "@/lib/imported-cookbooks";
import { modernistPizzaKnowledge, modernistPizzaRecipes } from "@/lib/modernist-pizza";
import { getRecipeWishlistEntries } from "@/lib/recipe-wishlist";

export const metadata: Metadata = { title: "Recipes" };

const recipePageSections = [
  { id: "recipe-guides", label: "Guides" },
  { id: "recipe-collection", label: "Recipes" },
  { id: "recipe-media-saved", label: "Media saved" },
  { id: "recipe-wishlist", label: "Wishlist" },
  { id: "recipe-books", label: "Books" },
] as const;

function buildRecipeSearchPreview(
  personalRecipes: RecipeCardEntry[],
  instagramRecipes: RecipeCardEntry[],
  youtubeRecipes: RecipeCardEntry[],
): RecipeSearchItem[] {
  const siteEntries: RecipeSearchItem[] = recipeEntries
    .filter((entry) => entry.kind === "guide")
    .map((entry) => ({
      title: entry.title,
      context: "Recipe guide",
      kind: "Guide",
      href: entry.href,
      searchText: entry.description,
    }));
  const personalEntries: RecipeSearchItem[] = personalRecipes.map((entry) => ({
    title: entry.title,
    context: "Personal recipe",
    kind: "Recipe",
    href: `/recipes#recipe-${entry.slug}`,
    searchText: [
      entry.description,
      ...(entry.ingredientGroups?.flatMap((group) => [group.title, ...group.items]) ?? []),
      ...(entry.methodGroups?.flatMap((group) => [group.title, ...group.steps]) ?? []),
    ].join(" "),
  }));
  const instagramEntries: RecipeSearchItem[] = instagramRecipes.map((entry) => ({
    title: entry.title,
    context: "Media saved recipes · Instagram",
    kind: "Media saved",
    href: `/recipes/instagram-saved#recipe-${entry.slug}`,
    searchText: [entry.description, ...(entry.categories ?? []), ...(entry.ingredientGroups?.flatMap((group) => group.items) ?? [])].join(" "),
  }));
  const youtubeEntries: RecipeSearchItem[] = youtubeRecipes.map((entry) => ({
    title: entry.title,
    context: `Media saved recipes · ${entry.sourceLabel ?? "YouTube"}`,
    kind: "Media saved",
    href: `/recipes/youtube-saved#recipe-${entry.slug}`,
    searchText: [
      entry.description,
      ...(entry.categories ?? []),
      ...(entry.ingredientGroups?.flatMap((group) => [group.title, ...group.items]) ?? []),
      ...(entry.methodGroups?.flatMap((group) => [group.title, ...group.steps]) ?? []),
    ].join(" "),
  }));
  return [
    {
      title: "Core by Clare Smyth",
      context: "Recipe book · Basics and 51 complete dish groups",
      kind: "Book",
      href: "/recipes/core-basics",
      searchText: "core clare smyth basics complete dishes cookbook",
    },
    {
      title: "Pollen Street by Jason Atherton",
      context: "Recipe book · 83 recipes",
      kind: "Book",
      href: "/recipes/pollen-street",
      searchText: "foundation basics complete dishes cookbook",
    },
    {
      title: "Modernist Cuisine recipes",
      context: "Recipe book · Volume 6 Kitchen Manual",
      kind: "Book",
      href: "/recipes/modernist-cuisine",
      searchText: "modernist cuisine kitchen manual charts techniques cookbook",
    },
    {
      title: "Modernist Pizza",
      context: `Recipe book · ${modernistPizzaRecipes.length} recipes and ${modernistPizzaKnowledge.length} technique references`,
      kind: "Book",
      href: "/recipes/modernist-pizza",
      searchText: "modernist pizza dough sauce cheese toppings ovens fermentation shaping baking cookbook kitchen manual",
    },
    {
      title: "Benu by Corey Lee",
      context: "Recipe book · 8 supplied dishes",
      kind: "Book",
      href: "/recipes/benu",
      searchText: "benu corey lee cookbook korean chinese fine dining",
    },
    {
      title: "Frantzén by Björn Frantzén",
      context: "Recipe book · Basics, dishes and Petit Fours",
      kind: "Book",
      href: "/recipes/frantzen",
      searchText: "frantzen bjorn basics fine dining cookbook petit fours",
    },
    {
      title: "Opéra Pâtisserie by Cédric Grolet",
      context: "Recipe book · 22 Basics and 96 recipes",
      kind: "Book",
      href: "/recipes/opera",
      searchText: "opera patisserie cedric grolet pastry breakfast french desserts frozen fruit cookbook",
    },
    {
      title: "Bachour by Antonio Bachour",
      context: "Recipe book · 78 pastries and foundations",
      kind: "Book",
      href: "/recipes/bachour",
      searchText: "bachour antonio baker pastry entremet tart choux chocolate croissant brioche cookbook",
    },
    ...importedCookbooks.flatMap((book): RecipeSearchItem[] => [
      {
        title: `${book.title} by ${book.author}`,
        context: `Recipe book · ${book.recipeCountLabel}`,
        kind: "Book",
        href: `/recipes/${book.id}`,
        searchText: `${book.title} ${book.author} cookbook ${book.categories.join(" ")}`,
      },
      ...book.recipes.map((recipe) => ({
        title: recipe.title,
        context: `${book.title} · ${recipe.category} · PDF page ${recipe.sourcePages.join(", ")}`,
        kind: "Cookbook recipe",
        href: `/recipes/${book.id}#${book.id}-${recipe.id}`,
        searchText: recipe.searchText,
      })),
    ]),
    ...siteEntries,
    ...personalEntries,
    ...instagramEntries,
    ...youtubeEntries,
  ];
}

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
  "pasta-guide": {
    srcs: ["/recipes/pasta/Capelliti.jpeg", "/recipes/pasta/Stuffedpasta.jpeg", "/recipes/pasta/DSC_6482.jpeg"],
    alt: "Fresh cappelletti, stuffed pasta, and handmade noodles",
    mark: "PASTA",
    tone: "pasta",
  },
  "sushi-guide": {
    srcs: ["/recipes/sushi/IMG_2842.jpeg", "/recipes/sushi/IMG_1653.jpeg"],
    alt: "Sushi chefs and nigiri",
    mark: "SUSHI",
    tone: "sushi",
  },
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
  const [recipes, instagramRecipes, youtubeRecipes, savedCookbookRecipes] = await Promise.all([
    getPersonalRecipeCards(),
    getInstagramSavedRecipeCards(),
    getYouTubeSavedRecipeCards(),
    getRecipeWishlistEntries(),
  ]);
  const recipeByKey = new Map(recipes.map((entry) => [entry.recipeKey, entry]));
  const publishedUploadTitles = new Set(recipes.filter((entry) => entry.source === "uploaded").map((entry) => entry.title.toLowerCase()));
  const wishlist = [...savedCookbookRecipes, ...wishlistEntries]
    .filter((entry) => !publishedUploadTitles.has(entry.title.toLowerCase()));
  const authenticated = await isRecipeAdminAuthenticated();
  const searchPreview = buildRecipeSearchPreview(recipes, instagramRecipes, youtubeRecipes);
  const chronologicalRecipes = [...recipes].sort((a, b) => {
    if (a.date && b.date) return b.date.localeCompare(a.date) || a.title.localeCompare(b.title);
    if (a.date) return -1;
    if (b.date) return 1;
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="recipe-library-page">
      <div className="recipe-library-hero page-shell">
        <PageIntro
          eyebrow="Recipes"
          title="Guides and recipes"
          description="Here I’ll upload recipes for dishes I’ve made that I think are worth sharing. Keep in mind that the quantities are mostly estimates of what I added, so they can vary. The guides are a little more precise, and I might yap a bit about the specifics."
        />
        <div className="recipe-search-shell">
          <RecipeLibrarySearch initialItems={searchPreview} />
        </div>
      </div>
      <SectionRail ariaLabel="Recipe page sections" sections={recipePageSections} />

      <section className="recipe-content-section page-section">
        <div className="space-y-12">
          <section id="recipe-guides">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Guides</h2>
              </div>
            </div>

            <SnapCarousel className="recipe-guide-carousel mobile-snap-carousel -mx-5 mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-3 pt-1 sm:mx-0 sm:px-0" repeatEdges={false}>
              {guides.map((entry) => (
                <Link className="recipe-guide-card swipe-bubble-card w-[20rem] shrink-0 overflow-hidden rounded-[1.5rem] border border-ink/10 bg-surface/55 transition hover:-translate-y-0.5 hover:border-ink/20 sm:w-[24rem]" href={entry.href} id={entry.slug} key={entry.slug}>
                  <GuideVisual slug={entry.slug} />
                  <div className="recipe-guide-copy swipe-bubble-copy">
                    <p className="eyebrow">Guide</p>
                    <div className="recipe-guide-title-row">
                      <h3>{entry.title}</h3>
                    </div>
                    <p className="recipe-guide-description">{entry.description}</p>
                  </div>
                </Link>
              ))}
            </SnapCarousel>
          </section>

          <section id="recipe-collection">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Recipes</h2>
              {authenticated && (
                <Link className="self-start rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper transition hover:bg-moss sm:self-auto" href="/recipes/admin">
                  + Upload recipe
                </Link>
              )}
            </div>

            <details className="recipe-all-section design-panel group mt-6" open>
              <summary className="recipes-section-summary">
                <span>
                  <span className="eyebrow">Newest to oldest</span>
                  <h3>All recipes</h3>
                  <small>{chronologicalRecipes.length} recipes</small>
                </span>
                <span className="recipe-section-expand-mark">+</span>
              </summary>
              <RecipeShelf label="All personal recipes, newest to oldest" layout="grid">
                {chronologicalRecipes.map((entry) => (
                  <RecipeCard
                    adminEditHref={authenticated ? `/recipes/admin/edit/${encodeURIComponent(entry.recipeKey)}` : undefined}
                    entry={entry}
                    idPrefix="all"
                    key={`all-${entry.recipeKey}`}
                    linkedRecipes={(entry.linkedRecipeKeys ?? []).flatMap((key) => {
                      const linked = recipeByKey.get(key);
                      return linked ? [linked] : [];
                    })}
                    variant="shelf"
                  />
                ))}
              </RecipeShelf>
            </details>

            <div className="recipe-category-heading">
              <h3>Browse by category</h3>
            </div>
            <div className="recipe-category-list mt-4 space-y-8">
              {recipeSections.map((section) => {
                const sectionRecipes = recipes.filter((entry) => entry.categories?.includes(section.id) || entry.category === section.id);

                return (
                  <details className="recipe-category-section design-panel group rounded-[2rem] border border-ink/10 bg-surface/45 p-5 sm:p-6" id={`recipe-category-${section.id}`} key={section.id}>
                    <summary className="recipes-section-summary flex cursor-pointer list-none items-center justify-between gap-4 marker:hidden">
                      <h3 className="text-2xl font-semibold tracking-tight">{section.title}</h3>
                      <span className="grid size-10 shrink-0 place-items-center rounded-full border border-ink/10 bg-paper/80 text-lg text-ink/50 transition group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    {sectionRecipes.length > 0 ? (
                      <RecipeShelf label={section.title} layout="grid">
                        {sectionRecipes.map((entry) => (
                          <RecipeCard
                            adminEditHref={authenticated ? `/recipes/admin/edit/${encodeURIComponent(entry.recipeKey)}` : undefined}
                            entry={entry}
                            key={entry.slug}
                            linkedRecipes={(entry.linkedRecipeKeys ?? []).flatMap((key) => {
                              const linked = recipeByKey.get(key);
                              return linked ? [linked] : [];
                            })}
                            variant="shelf"
                          />
                        ))}
                      </RecipeShelf>
                    ) : <div className="mt-6 rounded-2xl border border-dashed border-ink/10 p-5 text-sm text-ink/40">No recipes here yet.</div>}
                  </details>
                );
              })}
            </div>
          </section>

          <section id="recipe-media-saved">
            <div>
              <p className="eyebrow">Media saved recipes</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Recipes saved from media</h2>
              <p className="section-description mt-2 text-sm text-ink/50">
                Recipes and ideas collected from social media, kept separate until I move individual dishes into the wishlist.
              </p>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <Link className="design-panel group rounded-[2rem] border border-ink/10 bg-surface/45 p-6 transition hover:-translate-y-0.5 hover:border-ink/20 sm:p-8" href="/recipes/instagram-saved">
                <p className="eyebrow">Instagram</p>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">Instagram saved recipes</h3>
                <p className="mt-3 text-sm leading-7 text-ink/65">
                  {instagramRecipes.length} saved posts, with recipe details transcribed from captions, on-screen text, and reels where available.
                </p>
              </Link>
              <Link className="design-panel group rounded-[2rem] border border-ink/10 bg-surface/45 p-6 transition hover:-translate-y-0.5 hover:border-ink/20 sm:p-8" href="/recipes/youtube-saved">
                <p className="eyebrow">YouTube</p>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">YouTube saved recipes</h3>
                <p className="mt-3 text-sm leading-7 text-ink/65">
                  {youtubeRecipes.length} playlist videos, with recipes organized from descriptions, linked sources, transcripts, and on-screen details where available.
                </p>
              </Link>
            </div>
          </section>

          <section id="recipe-wishlist">
            <div>
              <p className="eyebrow">Wishlist</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Recipes I&apos;d like to make</h2>
              <p className="section-description mt-2 text-sm text-ink/50">A running list of dishes I want to cook next.</p>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {wishlist.map((entry) => (
                  <article className="design-panel rounded-[2rem] border border-ink/10 bg-surface/45 p-6 sm:p-8" key={entry.slug}>
                    {entry.image && (
                      <div className="relative mb-5 aspect-[16/9] overflow-hidden rounded-[1.25rem] bg-mist/30">
                        <Image alt={entry.title} className="object-cover" fill sizes="(max-width: 768px) 90vw, 24rem" src={entry.image} />
                      </div>
                    )}
                    <p className="eyebrow">{entry.bookTitle ? `From ${entry.bookTitle}` : "To make"}</p>
                    <h3 className="mt-4 text-xl font-semibold tracking-tight">{entry.title}</h3>
                    {entry.note && <p className="mt-3 text-sm leading-7 text-ink/65">{entry.note}</p>}
                    {(entry.href || authenticated) && (
                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        {entry.href && (
                          <Link className="inline-flex rounded-full border border-moss/20 bg-lime/25 px-4 py-2 text-xs font-semibold text-moss transition hover:border-moss/35" href={entry.href}>
                            Open saved recipe
                          </Link>
                        )}
                        {authenticated && (
                          <Link className="inline-flex rounded-full border border-ink/15 bg-paper/75 px-4 py-2 text-xs font-semibold text-ink/55 transition hover:border-ink/30 hover:text-ink" href={`/recipes/admin?wishlist=${encodeURIComponent(entry.slug)}`}>
                            Upload made dish
                          </Link>
                        )}
                      </div>
                    )}
                  </article>
              ))}
              {wishlist.length === 0 && (
                <p className="rounded-[1.5rem] border border-dashed border-ink/15 p-6 text-sm leading-6 text-ink/45">
                  No recipes have been moved into the wishlist yet.
                </p>
              )}
            </div>
          </section>

          <section id="recipe-books">
            <div>
              <p className="eyebrow">Books</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Recipe books</h2>
              <p className="section-description mt-2 text-sm text-ink/50">Reference books and their recipe contents.</p>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <Link
                className="design-card order-1 group overflow-hidden rounded-[2rem] border border-ink/10 bg-surface/55 p-3"
                href="/recipes/core-basics"
              >
                <div className="relative aspect-[16/9] overflow-hidden rounded-[1.45rem] bg-mist/30">
                  <div className="absolute inset-0 transition duration-500 group-hover:scale-[1.025]">
                    <Image
                      alt="Core-teser by Clare Smyth"
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 92vw, (max-width: 1280px) 45vw, 28rem"
                      src="/core-book/dishes/core-teser-1-v2.jpg"
                    />
                  </div>
                </div>
                <div className="p-3 pb-4 pt-4">
                  <p className="eyebrow">Book · Basics + 51 dish groups</p>
                  <div className="mt-2 flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold tracking-tight">Core by Clare Smyth</h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink/52">Core Basics and the complete supplied dishes, rebuilt as searchable, scalable cards while retaining the book&apos;s page flow.</p>
                </div>
              </Link>
              <Link
                className="design-card order-5 group overflow-hidden rounded-[2rem] border border-ink/10 bg-surface/55 p-3"
                href="/recipes/pollen-street"
              >
                <div className="relative aspect-[16/9] overflow-hidden rounded-[1.45rem] bg-mist/30">
                  <div className="absolute inset-0 transition duration-500 group-hover:scale-[1.025]">
                    <Image
                      alt="Cumbrian suckling pig from Pollen Street"
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 92vw, (max-width: 1280px) 45vw, 28rem"
                      src="/pollen-street/cumbrian-suckling-pig.jpg"
                    />
                  </div>
                </div>
                <div className="p-3 pb-4 pt-4">
                  <p className="eyebrow">Book · 83 recipes</p>
                  <div className="mt-2 flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold tracking-tight">Pollen Street by Jason Atherton</h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink/52">54 foundation recipes and 29 complete dishes, with scaling and called-for Basics built into every card.</p>
                </div>
              </Link>
              <Link
                className="design-card order-8 group overflow-hidden rounded-[2rem] border border-ink/10 bg-surface/55 p-3"
                href="/recipes/benu"
              >
                <div className="relative aspect-[16/9] overflow-hidden rounded-[1.45rem] bg-mist/30">
                  <div className="absolute inset-0 transition duration-500 group-hover:scale-[1.025]">
                    <Image
                      alt="Thousand-Year-Old Quail Egg from Benu"
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 92vw, (max-width: 1280px) 45vw, 28rem"
                      src="/benu/thousand-year-old-quail-egg.jpeg"
                      style={{ objectPosition: "50% 47%" }}
                    />
                  </div>
                </div>
                <div className="p-3 pb-4 pt-4">
                  <p className="eyebrow">Book · 8 dishes</p>
                  <div className="mt-2 flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold tracking-tight">Benu by Corey Lee</h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink/52">The supplied dishes rebuilt as searchable, scalable cards, with every ingredient kept beside its corresponding method.</p>
                </div>
              </Link>
              <Link
                className="design-card order-7 group overflow-hidden rounded-[2rem] border border-ink/10 bg-surface/55 p-3"
                href="/recipes/bachour"
              >
                <div className="relative aspect-[16/9] overflow-hidden rounded-[1.45rem] bg-mist/30">
                  <div className="absolute inset-0 transition duration-500 group-hover:scale-[1.025]">
                    <Image
                      alt="Coffee Caramel and Gianduja pastry by Antonio Bachour"
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 92vw, (max-width: 1280px) 45vw, 28rem"
                      src="/bachour/coffee-caramel-gianduja.jpeg"
                      style={{ objectPosition: "50% 50%" }}
                    />
                  </div>
                </div>
                <div className="p-3 pb-4 pt-4">
                  <p className="eyebrow">Book · 78 pastries & foundations</p>
                  <div className="mt-2 flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold tracking-tight">Bachour by Antonio Bachour</h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink/52">Two collections: the supplied entremets and all 67 recipes from Bachour the Baker, rebuilt as searchable, scalable component-by-component cards.</p>
                </div>
              </Link>
              <Link
                className="design-card order-3 group overflow-hidden rounded-[2rem] border border-ink/10 bg-surface/55 p-3"
                href="/recipes/modernist-cuisine"
              >
                <div className="relative aspect-[16/9] overflow-hidden rounded-[1.45rem] bg-white">
                  <div className="absolute inset-0 transition duration-500 group-hover:scale-[1.025]">
                    <Image
                      alt="Modernist Cuisine title and authors page"
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 92vw, (max-width: 1280px) 45vw, 28rem"
                      src="/modernist-cuisine/title-page.jpg"
                      style={{ objectPosition: "50% 39%" }}
                    />
                  </div>
                </div>
                <div className="p-3 pb-4 pt-4">
                  <p className="eyebrow">Book · 749 entries</p>
                  <div className="mt-2 flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold tracking-tight">Modernist Cuisine recipes</h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink/52">Volume 6, rebuilt from every indexed page with scalable recipe grids and exact source layouts for charts and complex techniques.</p>
                </div>
              </Link>
              <Link
                className="design-card order-4 group overflow-hidden rounded-[2rem] border border-ink/10 bg-surface/55 p-3"
                href="/recipes/modernist-pizza"
              >
                <div className="relative aspect-[16/9] overflow-hidden rounded-[1.45rem] bg-white">
                  <div className="absolute inset-0 transition duration-500 group-hover:scale-[1.025]">
                    <Image
                      alt="Modernist Pizza title and authors page"
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 92vw, (max-width: 1280px) 45vw, 28rem"
                      src="/modernist-pizza/cover.webp"
                      style={{ objectPosition: "50% 24%" }}
                    />
                  </div>
                </div>
                <div className="p-3 pb-4 pt-4">
                  <p className="eyebrow">Book · {modernistPizzaRecipes.length} recipes + {modernistPizzaKnowledge.length} references</p>
                  <div className="mt-2 flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold tracking-tight">Modernist Pizza</h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink/52">Volume 4 separated into searchable recipe spreads and a remade practical guide to dough, ovens, baking, service, and troubleshooting.</p>
                </div>
              </Link>
              <Link
                className="design-card order-2 group overflow-hidden rounded-[2rem] border border-ink/10 bg-surface/55 p-3"
                href="/recipes/frantzen"
              >
                <div className="relative aspect-[16/9] overflow-hidden rounded-[1.45rem] bg-mist/30">
                  <div className="absolute inset-0 transition duration-500 group-hover:scale-[1.025]">
                    <Image
                      alt="Roasted scallops from Frantzén by Björn Frantzén"
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 92vw, (max-width: 1280px) 45vw, 28rem"
                      src="/frantzen/dishes/roasted-scallops.jpg"
                      style={{ objectPosition: "50% 52%" }}
                    />
                  </div>
                </div>
                <div className="p-3 pb-4 pt-4">
                  <p className="eyebrow">Book · 64 Basics + 53 dishes + 5 Petit Fours</p>
                  <div className="mt-2 flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold tracking-tight">Frantzén by Björn Frantzén</h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink/52">The supplied Basics, plated dishes and Petit Fours rebuilt as scalable component cards with exact source-page references.</p>
                </div>
              </Link>
              <Link
                className="design-card order-6 group overflow-hidden rounded-[2rem] border border-ink/10 bg-surface/55 p-3"
                href="/recipes/opera"
              >
                <div className="relative aspect-[16/9] overflow-hidden rounded-[1.45rem] bg-black">
                  <div className="absolute inset-0 transition duration-500 group-hover:scale-[1.025]">
                    <Image
                      alt="Pain au chocolat from Opéra Pâtisserie by Cédric Grolet"
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 92vw, (max-width: 1280px) 45vw, 28rem"
                      src="/opera/photos/pain-au-chocolat.webp"
                      style={{ objectPosition: "50% 50%" }}
                    />
                  </div>
                </div>
                <div className="p-3 pb-4 pt-4">
                  <p className="eyebrow">Book · 22 Basics + 96 recipes</p>
                  <div className="mt-2 flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold tracking-tight">Opéra Pâtisserie by Cédric Grolet</h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink/52">Breakfast pastries, French classics, plated desserts, frozen fruit and annex basics rebuilt with scaling and exact source pages.</p>
                </div>
              </Link>
              {importedCookbooks.map((book) => (
                <Link className="design-card order-9 group overflow-hidden rounded-[2rem] border border-ink/10 bg-surface/55 p-3" href={`/recipes/${book.id}`} key={book.id}>
                  <div className="relative aspect-[16/9] overflow-hidden rounded-[1.45rem] bg-mist/30">
                    <div className="absolute inset-0 transition duration-500 group-hover:scale-[1.025]">
                      <Image alt={`${book.title} cover`} className="object-cover" fill sizes="(max-width: 768px) 92vw, (max-width: 1280px) 45vw, 28rem" src={`/imported-cookbooks/${book.id}.jpg`} />
                    </div>
                  </div>
                  <div className="p-3 pb-4 pt-4">
                    <p className="eyebrow">Book · {book.recipeCountLabel}</p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight">{book.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-ink/52">{book.author} · source-linked recipes organized by the book&apos;s original sections.</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

        </div>
      </section>
    </div>
  );
}
