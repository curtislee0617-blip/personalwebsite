import type { RecipeCategoryId } from "@/data/recipe-categories";

export type RecipeEntry = {
  slug: string;
  kind: "guide" | "recipe";
  title: string;
  description: string;
  status?: "published" | "coming-soon";
  href: string;
  categories?: RecipeCategoryId[];
  category?: RecipeCategoryId;
  guideSlugs?: string[];
  showInRecipes?: boolean;
  thumbnail?: string;
  ingredientGroups?: Array<{ title: string; items: string[] }>;
  methodGroups?: Array<{ title: string; steps: string[] }>;
  // ISO "YYYY-MM-DD" — the recipes section is ordered newest first by this.
  date?: string;
};

const additionalDessertPlaceholders = Array.from({ length: 5 }, (_, index): RecipeEntry => {
  const number = index + 2;
  return {
    slug: `future-dessert-${number}`,
    kind: "recipe",
    title: `Dessert recipe ${number}`,
    description: "A compact placeholder for a future dessert or pastry recipe.",
    status: "coming-soon",
    href: "/recipes",
    category: "desserts-pastries",
  };
});

const additionalGeneralPlaceholders = Array.from({ length: 5 }, (_, index): RecipeEntry => {
  const number = index + 2;
  return {
    slug: `future-other-${number}`,
    kind: "recipe",
    title: `Other recipe ${number}`,
    description: "A compact placeholder for a future recipe, kitchen note, or finished dish.",
    status: "coming-soon",
    href: "/recipes",
  };
});

export const recipeEntries: RecipeEntry[] = [
  {
    slug: "sourdough-guide",
    kind: "guide",
    title: "Sourdough guide",
    description:
      "A practical sourdough walkthrough covering starter use, baker's percentages, hydration, timing, shaping, proofing, scoring, and baking, with tools for scaling and adjusting the dough.",
    status: "published",
    href: "/recipes/sourdough-guide",
  },
  {
    slug: "viennoiserie-guide",
    kind: "guide",
    title: "Viennoiserie guide",
    description:
      "A photo-first guide to croissants, pain au chocolat, and savoury laminated pastries, with the base croissant recipe and shaping references.",
    status: "published",
    href: "/recipes/viennoiserie-guide",
  },
  {
    slug: "pasta-guide",
    kind: "guide",
    title: "Pasta guide",
    description:
      "A working guide for fresh pasta doughs, flour blends, hydration by egg weight, resting, rolling, cutting, shaping, and cooking.",
    status: "published",
    href: "/recipes/pasta-guide",
  },
  {
    slug: "sushi-guide",
    kind: "guide",
    title: "Sushi guide",
    description:
      "A working guide for sushi rice seasoning, fish preparation, zuke marinades, nigiri notes, and other sushi ratios as they are added.",
    status: "coming-soon",
    href: "/recipes/sushi-guide",
  },
  {
    slug: "cookbook-guide",
    kind: "guide",
    title: "Cookbook",
    description:
      "The cook.enterprise cookbook, presented as a project you can browse page by page or open as the original PDF.",
    status: "published",
    href: "/projects/cook-enterprise?from=recipes",
  },
  {
    slug: "flan",
    kind: "recipe",
    title: "Flan",
    description: "A custard flan built with pastry cream and puff pastry, baked in rings until set and browned.",
    status: "published",
    href: "/recipes",
    category: "desserts-pastries",
    guideSlugs: ["viennoiserie-guide"],
    date: "2026-07-10",
    ingredientGroups: [
      {
        title: "Pastry cream",
        items: [
          "Milk - 940g",
          "Cream - 200g",
          "Yolk - 200g",
          "Sugar - 300g",
          "Cornstarch - 95g",
          "Vanilla - 2 pcs",
        ],
      },
      {
        title: "Puff pastry",
        items: [
          "Water - 500g",
          "T55 - 1000g",
          "Salt - 10g",
          "Dry butter - 500g",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Pastry cream",
        steps: [
          "Boil milk and cream.",
          "Reserve a small amount of milk to blend with the vanilla in the Thermomix.",
          "Pass the vanilla mixture back into the milk.",
          "Mix yolk, sugar, and cornstarch together.",
          "Combine the milk and yolk mixture.",
          "Cook it like a pastry cream.",
          "Cool down until ready to use.",
        ],
      },
      {
        title: "Puff pastry",
        steps: [
          "Mix water, salt, and T55 until it becomes a dough.",
          "Wrap the dough and keep it in the fridge overnight.",
          "Laminate the dough with dry butter in 6 times; use a single fold and rest 3-4 hours after 2 folds.",
          "Extend the puff pastry in the dough machine until 0.5cm thickness.",
          "Keep it in the freezer.",
        ],
      },
      {
        title: "Assemble",
        steps: [
          "Bake the puff pastry between 2 trays at 170°C for 15 minutes on fan 3, keeping 2cm space between each tray.",
          "Cut the half-cooked puff pastry into 2 types: 28cm x 3.5cm strips and N.12 rings.",
          "Place the cut puff pastry into the N.13 ring.",
          "Fill up with pastry cream.",
          "Bake at 190°C for 15 minutes on fan 4; turn and bake 5 minutes on fan 3.",
        ],
      },
    ],
  },
  {
    slug: "future-recipe-1",
    kind: "recipe",
    title: "Recipe title",
    description: "Future recipe card scaffold for when you upload the first recipe post.",
    status: "coming-soon",
    href: "/recipes",
    category: "desserts-pastries",
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
  ...additionalDessertPlaceholders,
  ...additionalGeneralPlaceholders,
];

// Newest first; entries without a date fall to the end.
export function recipesByDate(entries: RecipeEntry[]) {
  return [...entries]
    .filter((entry) => entry.kind === "recipe" && entry.showInRecipes !== false)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

export function recipesForGuide(guideSlug: string, entries: RecipeEntry[] = recipeEntries) {
  return [...entries]
    .filter((entry) => entry.kind === "recipe" && entry.guideSlugs?.includes(guideSlug))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

export { recipeCategories as recipeSections } from "@/data/recipe-categories";

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
