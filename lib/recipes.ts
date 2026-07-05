export type RecipeEntry = {
  slug: string;
  kind: "guide" | "recipe";
  title: string;
  description: string;
  status?: "published" | "coming-soon";
  href: string;
  // ISO "YYYY-MM-DD" — the recipes section is ordered newest first by this.
  date?: string;
};

export const recipeEntries: RecipeEntry[] = [
  {
    slug: "sourdough-guide",
    kind: "guide",
    title: "Sourdough guide",
    description:
      "A clearer version of the step-by-step sourdough notes, with a dough calculator, hydration slider, and timeline labels.",
    status: "published",
    href: "/recipes/sourdough-guide",
  },
  {
    slug: "cookbook-guide",
    kind: "guide",
    title: "Cookbook",
    description:
      "The cook.enterprise cookbook, presented as a project you can browse page by page or open as the original PDF.",
    status: "published",
    href: "/projects/cook-enterprise",
  },
  {
    slug: "future-recipe-1",
    kind: "recipe",
    title: "Recipe title",
    description: "Future recipe card scaffold for when you upload the first recipe post.",
    status: "coming-soon",
    href: "/recipes",
    date: "2026-07-01",
  },
  {
    slug: "future-recipe-2",
    kind: "recipe",
    title: "Another recipe title",
    description: "Another placeholder slot so the recipes section already has the intended structure.",
    status: "coming-soon",
    href: "/recipes",
    date: "2026-06-15",
  },
];

// Newest first; entries without a date fall to the end.
export function recipesByDate(entries: RecipeEntry[]) {
  return [...entries]
    .filter((entry) => entry.kind === "recipe")
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

// "Recipes I would like to make" — a to-cook list. Add entries here as the list grows.
export type WishlistEntry = {
  slug: string;
  title: string;
  note?: string;
};

export const wishlistEntries: WishlistEntry[] = [];

// Recipe books I've purchased. Cover photos get added later.
export type RecipeBook = {
  slug: string;
  title: string;
  author?: string;
  cover?: string;
};

export const recipeBooks: RecipeBook[] = [];
