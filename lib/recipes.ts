export type RecipeEntry = {
  slug: string;
  kind: "guide" | "recipe";
  title: string;
  description: string;
  status?: "published" | "coming-soon";
  href: string;
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
  },
  {
    slug: "future-recipe-2",
    kind: "recipe",
    title: "Another recipe title",
    description: "Another placeholder slot so the recipes section already has the intended structure.",
    status: "coming-soon",
    href: "/recipes",
  },
];
