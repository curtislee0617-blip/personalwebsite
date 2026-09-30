import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { guidePreviewSrc, guideVisuals } from "@/lib/recipe-guide-visuals";
import { PageIntro } from "@/components/page-intro";
import { RecipeLibrarySearch } from "@/components/recipe-library-search";
import { SpringAnchor, SpringLink } from "@/components/spring-links";
import { RecipeCollection } from "@/components/recipe-collection";
import { SnapCarousel } from "@/components/snap-carousel";
import { CookbookAccessGate } from "@/components/cookbook-access-gate";
import { recipeEntries, wishlistEntries, type WishlistEntry } from "@/lib/recipes";
import { getInstagramSavedRecipeCount, getPersonalRecipeCards, getYouTubeSavedRecipeCount } from "@/lib/personal-recipes";
import type { RecipeCardEntry } from "@/lib/recipe-card-types";
import type { RecipeSearchItem } from "@/lib/recipe-search";
import { isRecipeAdminAuthenticated } from "@/lib/recipe-admin-auth";
import { importedCookbooks, importedCookbookSearchEntries } from "@/lib/imported-cookbooks";
import { modernistPizzaKnowledge, modernistPizzaRecipes } from "@/lib/modernist-pizza";
import { getRecipeWishlistEntries } from "@/lib/recipe-wishlist";
import { cocktailBooks } from "@/lib/cocktail-books";
import { isPrivateCookbookHref } from "@/lib/cookbook-access";
import { isCookbookAuthenticated } from "@/lib/cookbook-auth";

export const metadata: Metadata = { title: "Recipes" };

const recipePageSections = [
  { id: "recipe-guides", label: "Guides" },
  { id: "recipe-collection", label: "Recipes" },
  { id: "recipe-cocktails", label: "Cocktails" },
  { id: "recipe-media-saved", label: "Media saved" },
  { id: "recipe-wishlist", label: "Wishlist" },
  { id: "recipe-books", label: "Books" },
] as const;

function buildRecipeSearchPreview(
  personalRecipes: RecipeCardEntry[],
  wishlistRecipes: WishlistEntry[],
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
  const publicWishlistEntries: RecipeSearchItem[] = wishlistRecipes.map((entry) => ({
    title: entry.title,
    context: entry.bookTitle ? `Public wishlist recipe · ${entry.bookTitle}` : "Recipe wishlist",
    kind: "Wishlist",
    href: entry.href ?? "/recipes#recipe-wishlist",
    searchText: [entry.note, entry.bookTitle].filter(Boolean).join(" "),
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
    ...importedCookbooks.map((book): RecipeSearchItem => (
      {
        title: `${book.title} by ${book.author}`,
        context: `Recipe book · ${book.recipeCountLabel}`,
        kind: "Book",
        href: `/recipes/${book.id}`,
        searchText: `${book.title} ${book.author} cookbook ${book.categories.join(" ")}`,
      }
    )),
    ...importedCookbookSearchEntries.map((recipe): RecipeSearchItem => ({
      title: recipe.title,
      context: `${recipe.bookTitle} · ${recipe.category} · PDF page ${recipe.sourcePages.join(", ")}`,
      kind: "Cookbook recipe",
      href: `/recipes/${recipe.bookId}#${recipe.bookId}-${recipe.id}`,
      searchText: `${recipe.title} ${recipe.category} ${recipe.bookTitle}`,
    })),
    ...siteEntries,
    ...personalEntries,
    ...publicWishlistEntries,
  ];
}

type RecipeBookGroupId = "fine-dining" | "cuisines" | "baking";

type RecipeBookCardData = {
  id: string;
  group: RecipeBookGroupId;
  href: string;
  title: string;
  count: string;
  description: string;
  image: string;
  imageAlt: string;
  imageBackground?: string;
  imagePosition?: string;
};

const recipeBookGroups = [
  { id: "fine-dining", label: "Fine dining" },
  { id: "cuisines", label: "Cuisines" },
  { id: "baking", label: "Baking" },
] as const;

const featuredRecipeBooks: RecipeBookCardData[] = [
  {
    id: "core",
    group: "fine-dining",
    href: "/recipes/core-basics",
    title: "Core by Clare Smyth",
    count: "Basics + 51 dish groups",
    description: "Core Basics and the complete supplied dishes, rebuilt as searchable, scalable cards while retaining the book's page flow.",
    image: "/core-book/dishes/core-teser-1-v2.jpg",
    imageAlt: "Core-teser by Clare Smyth",
  },
  {
    id: "frantzen",
    group: "fine-dining",
    href: "/recipes/frantzen",
    title: "Frantzén by Björn Frantzén",
    count: "64 Basics + 53 dishes + 5 Petit Fours",
    description: "The supplied Basics, plated dishes and Petit Fours rebuilt as scalable component cards with exact source-page references.",
    image: "/frantzen/dishes/roasted-scallops.jpg",
    imageAlt: "Roasted scallops from Frantzén by Björn Frantzén",
    imagePosition: "50% 52%",
  },
  {
    id: "modernist-cuisine",
    group: "fine-dining",
    href: "/recipes/modernist-cuisine",
    title: "Modernist Cuisine recipes",
    count: "749 entries",
    description: "Volume 6, rebuilt from every indexed page with scalable recipe grids and exact source layouts for charts and complex techniques.",
    image: "/modernist-cuisine/title-page.jpg",
    imageAlt: "Modernist Cuisine title and authors page",
    imageBackground: "bg-white",
    imagePosition: "50% 39%",
  },
  {
    id: "pollen-street",
    group: "fine-dining",
    href: "/recipes/pollen-street",
    title: "Pollen Street by Jason Atherton",
    count: "83 recipes",
    description: "54 foundation recipes and 29 complete dishes, with scaling and called-for Basics built into every card.",
    image: "/pollen-street/cumbrian-suckling-pig.jpg",
    imageAlt: "Cumbrian suckling pig from Pollen Street",
  },
  {
    id: "benu",
    group: "fine-dining",
    href: "/recipes/benu",
    title: "Benu by Corey Lee",
    count: "8 dishes",
    description: "The supplied dishes rebuilt as searchable, scalable cards, with every ingredient kept beside its corresponding method.",
    image: "/benu/thousand-year-old-quail-egg.jpeg",
    imageAlt: "Thousand-Year-Old Quail Egg from Benu",
    imagePosition: "50% 47%",
  },
  {
    id: "modernist-pizza",
    group: "baking",
    href: "/recipes/modernist-pizza",
    title: "Modernist Pizza",
    count: `${modernistPizzaRecipes.length} recipes + ${modernistPizzaKnowledge.length} references`,
    description: "Volume 4 separated into searchable recipe spreads and a remade practical guide to dough, ovens, baking, service, and troubleshooting.",
    image: "/modernist-pizza/cover.webp",
    imageAlt: "Modernist Pizza title and authors page",
    imageBackground: "bg-white",
    imagePosition: "50% 24%",
  },
  {
    id: "opera",
    group: "baking",
    href: "/recipes/opera",
    title: "Opéra Pâtisserie by Cédric Grolet",
    count: "22 Basics + 96 recipes",
    description: "Breakfast pastries, French classics, plated desserts, frozen fruit and annex basics rebuilt with scaling and exact source pages.",
    image: "/opera/photos/pain-au-chocolat.webp",
    imageAlt: "Pain au chocolat from Opéra Pâtisserie by Cédric Grolet",
    imageBackground: "bg-black",
    imagePosition: "50% 50%",
  },
  {
    id: "bachour",
    group: "baking",
    href: "/recipes/bachour",
    title: "Bachour by Antonio Bachour",
    count: "78 pastries & foundations",
    description: "Two collections: the supplied entremets and all 67 recipes from Bachour the Baker, rebuilt as searchable, scalable component-by-component cards.",
    image: "/bachour/coffee-caramel-gianduja.jpeg",
    imageAlt: "Coffee Caramel and Gianduja pastry by Antonio Bachour",
    imagePosition: "50% 50%",
  },
];

const importedRecipeBookGroups: Record<string, RecipeBookGroupId> = {
  "everyday-lebanese": "cuisines",
  "japan-the-cookbook": "cuisines",
  anatolia: "cuisines",
  "science-of-spice": "cuisines",
  "secrets-of-open-crumb": "baking",
  "thailand-the-cookbook": "cuisines",
  "breakfast-the-cookbook": "cuisines",
  "tu-casa-mi-casa": "cuisines",
  "the-silver-spoon": "cuisines",
  "the-essential-new-york-times-cookbook": "cuisines",
  "larousse-patisserie-and-baking": "baking",
  "crumb-richard-bertinet": "baking",
  "advanced-professional-pastry-chef": "baking",
  "complete-book-of-pasta-sauces": "cuisines",
  "the-french-laundry-cookbook": "fine-dining",
  "spain-the-cookbook": "cuisines",
  "sauces-reconsidered": "cuisines",
  "bao-the-cookbook": "cuisines",
};

function RecipeBookCard({ book }: { book: RecipeBookCardData }) {
  return (
    <Link
      className="recipe-book-card design-card group overflow-hidden rounded-[2rem] border border-ink/10 bg-surface/55 p-3"
      data-reveal
      data-spotlight
      href={book.href}
    >
      <div className={`relative aspect-[16/9] overflow-hidden rounded-[1.45rem] ${book.imageBackground ?? "bg-mist/30"}`}>
        <div className="absolute inset-0 transition duration-500 group-hover:scale-[1.025]">
          <Image
            alt={book.imageAlt}
            className="object-cover"
            fill
            sizes="(max-width: 640px) 45vw, 12rem"
            src={book.image}
            style={book.imagePosition ? { objectPosition: book.imagePosition } : undefined}
            unoptimized
          />
        </div>
      </div>
      <div className="p-3 pb-4 pt-4">
        <p className="eyebrow">Book · {book.count}</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight">{book.title}</h3>
        <p className="mt-2 text-sm leading-6 text-ink/52">{book.description}</p>
      </div>
    </Link>
  );
}

function GuideVisual({ slug }: { slug: string }) {
  const visual = guideVisuals[slug] ?? { alt: "Recipe guide graphic", mark: "GUIDE", tone: "default" };
  return (
    <div className={`recipe-guide-media swipe-bubble-media is-${visual.tone}`}>
      {visual.srcs ? (
        <div className="recipe-guide-photo-grid">
          {visual.srcs.map((src, index) => (
            <div className="relative" key={src}>
              <Image alt={`${visual.alt}, image ${index + 1}`} className="object-cover" fill sizes="(max-width: 640px) 24vw, 8rem" src={guidePreviewSrc(src)} unoptimized />
            </div>
          ))}
        </div>
      ) : visual.src ? (
        <Image alt={visual.alt} className="object-cover" fill sizes="(max-width: 640px) 70vw, 24rem" src={guidePreviewSrc(visual.src)} unoptimized />
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
  const [recipes, instagramRecipeCount, youtubeRecipeCount, savedCookbookRecipes] = await Promise.all([
    getPersonalRecipeCards(),
    getInstagramSavedRecipeCount(),
    getYouTubeSavedRecipeCount(),
    getRecipeWishlistEntries(),
  ]);
  const publishedUploadTitles = new Set(recipes.filter((entry) => entry.source === "uploaded").map((entry) => entry.title.toLowerCase()));
  const wishlist = [...savedCookbookRecipes, ...wishlistEntries]
    .filter((entry) => !publishedUploadTitles.has(entry.title.toLowerCase()));
  const [authenticated, cookbookAuthenticated] = await Promise.all([
    isRecipeAdminAuthenticated(),
    isCookbookAuthenticated(),
  ]);
  const privateLibraryAccess = authenticated || cookbookAuthenticated;
  const searchPreview = buildRecipeSearchPreview(recipes, wishlist)
    .filter((item) => privateLibraryAccess || !isPrivateCookbookHref(item.href));
  const chronologicalRecipes = [...recipes].sort((a, b) => {
    if (a.date && b.date) return b.date.localeCompare(a.date) || a.title.localeCompare(b.title);
    if (a.date) return -1;
    if (b.date) return 1;
    return a.title.localeCompare(b.title);
  });
  const recipeBookCards: RecipeBookCardData[] = [
    ...featuredRecipeBooks,
    ...importedCookbooks.map((book) => ({
      id: book.id,
      group: importedRecipeBookGroups[book.id] ?? "cuisines",
      href: `/recipes/${book.id}`,
      title: book.title,
      count: book.recipeCountLabel,
      description: `${book.author} · source-linked recipes organized by the book's original sections.`,
      image: book.coverImage ?? `/imported-cookbooks/${book.id}.jpg`,
      imageAlt: `${book.title} cover`,
    })),
  ];

  return (
    <div className="recipe-library-page">
      <div className="recipe-library-hero page-shell">
        <PageIntro
          eyebrow="Recipes"
          title="From my kitchen"
          description="Dishes I love to cook, practical guides, and ideas for the next meal."
        />
      </div>
      <div className="recipe-library-toolbar page-shell">
        <nav aria-label="Recipe page sections" className="recipe-index-nav">
          {recipePageSections.map((section) => <SpringAnchor href={`#${section.id}`} key={section.id}>{section.label}</SpringAnchor>)}
        </nav>
        <div className="recipe-search-shell">
          <RecipeLibrarySearch
            initialItems={searchPreview}
            key={privateLibraryAccess ? "private-library-search" : "public-recipe-search"}
          />
        </div>
      </div>

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
                <Link className="recipe-guide-card swipe-bubble-card w-[20rem] shrink-0 overflow-hidden rounded-[1.5rem] border border-ink/10 bg-surface/55 transition hover:-translate-y-0.5 hover:border-ink/20 sm:w-[24rem]" data-spotlight href={entry.href} id={entry.slug} key={entry.slug}>
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

            <RecipeCollection authenticated={authenticated} recipes={chronologicalRecipes} />

          </section>

          <section className="recipe-cocktail-section" id="recipe-cocktails" aria-labelledby="recipe-cocktails-title">
            <div className="recipe-cocktail-intro">
              <div>
                <p className="eyebrow">At the bar</p>
                <h2 id="recipe-cocktails-title">Cocktail library</h2>
                <p>Classic drinks, modern techniques, and ideas for the next round. Explore {cocktailBooks.length} cocktail books, browse by style, or find a drink using what is in your cabinet.</p>
                <SpringLink className="back-link-bubble" href={privateLibraryAccess ? "/recipes/cocktail-books" : "#recipe-books"}>
                  {privateLibraryAccess ? "Explore the cocktail library ↗" : "Unlock with cookbook access ↓"}
                </SpringLink>
                {!privateLibraryAccess && <small>The source books share the private bookshelf login below.</small>}
              </div>
            </div>
            {privateLibraryAccess && (
              <div className="recipe-cocktail-books">
                {cocktailBooks.map((book) => (
                  <SpringLink className="recipe-cocktail-book" href={`/recipes/cocktail-books/${book.id}`} key={book.id}>
                    <div className="recipe-cocktail-cover">
                      {book.thumbnail ? <Image alt={`${book.title} cover`} fill sizes="(max-width: 639px) 30vw, 10rem" src={book.thumbnail} className="object-contain" unoptimized /> : <span aria-hidden="true">LOST<br />COCKTAILS</span>}
                    </div>
                    <div><h3>{book.title}</h3><p>{book.author}</p><small>{book.recipeCountLabel}</small></div>
                  </SpringLink>
                ))}
              </div>
            )}
          </section>

          <section id="recipe-media-saved">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Saved inspiration</h2>
              <p className="section-description mt-2 text-sm text-ink/50">
                Ideas collected from Instagram and YouTube.
              </p>
            </div>

            <div className="recipe-media-links">
              <Link className="recipe-media-link" data-reveal data-spotlight href="/recipes/instagram-saved">
                <h3>Instagram <span aria-hidden="true">↗</span></h3>
                <p className="mt-3 text-sm leading-7 text-ink/65">
                  {instagramRecipeCount} saved recipes
                </p>
              </Link>
              <Link className="recipe-media-link" data-reveal data-spotlight href="/recipes/youtube-saved" style={{ "--reveal-delay": "90ms" } as CSSProperties}>
                <h3>YouTube <span aria-hidden="true">↗</span></h3>
                <p className="mt-3 text-sm leading-7 text-ink/65">
                  {youtubeRecipeCount} saved videos
                </p>
              </Link>
            </div>
          </section>

          <section id="recipe-wishlist">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">To cook next</h2>
              <p className="section-description mt-2 text-sm text-ink/50">A running list of dishes I want to cook next.</p>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {wishlist.map((entry, index) => (
                  <article className="design-panel rounded-[2rem] border border-ink/10 bg-surface/45 p-6 sm:p-8" data-reveal key={entry.slug} style={{ "--reveal-delay": `${Math.min(index % 3, 2) * 80}ms` } as CSSProperties}>
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
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Bookshelf</h2>
                <p className="section-description mt-2 max-w-3xl text-sm leading-6 text-ink/50">
                  These books are kept for private use because of copyright restrictions. If you would like to use them,{" "}
                  <Link className="font-semibold text-moss underline decoration-moss/25 underline-offset-2" href="/contact">
                    contact me
                  </Link>
                  .
                </p>
              </div>
              <CookbookAccessGate adminAuthenticated={authenticated} authenticated={cookbookAuthenticated} />
            </div>

            {privateLibraryAccess ? (
              <div className="mt-7 space-y-10">
                {recipeBookGroups.map((group) => {
                  const books = recipeBookCards.filter((book) => book.group === group.id);

                  return (
                    <section aria-labelledby={`recipe-book-group-${group.id}`} key={group.id}>
                      <div className="flex items-baseline justify-between gap-4 border-b border-ink/10 pb-3">
                        <h3 className="text-xl font-semibold tracking-tight sm:text-2xl" id={`recipe-book-group-${group.id}`}>
                          {group.label}
                        </h3>
                        <span className="text-xs font-medium text-ink/38">{books.length} books</span>
                      </div>
                      <div className="recipe-book-grid">
                        {books.map((book) => <RecipeBookCard book={book} key={book.id} />)}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              <div className="mt-6 rounded-[1.5rem] border border-dashed border-ink/15 bg-surface/30 p-6 text-sm leading-6 text-ink/48">
                Enter the cookbook password above to show the private library.
              </div>
            )}
          </section>

        </div>
      </section>
    </div>
  );
}
