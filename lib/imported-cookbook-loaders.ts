import type { ImportedCookbook } from "@/components/imported-cookbook-guide";
import { scienceOfSpiceRegionalBlends } from "@/lib/imported-cookbooks/science-of-spice-blends";

export const importedCookbookLoaders: Record<string, () => Promise<ImportedCookbook>> = {
  "everyday-lebanese": () => import("@/lib/imported-cookbooks/everyday-lebanese.json").then((module) => module.default as ImportedCookbook),
  "japan-the-cookbook": () => import("@/lib/imported-cookbooks/japan-the-cookbook.json").then((module) => module.default as ImportedCookbook),
  "anatolia": () => import("@/lib/imported-cookbooks/anatolia.json").then((module) => module.default as ImportedCookbook),
  "science-of-spice": () => import("@/lib/imported-cookbooks/science-of-spice.json").then((module) => {
    const book = module.default as ImportedCookbook;
    return {
      ...book,
      description: "Recipes and regional local spice blends, separated from spice stories and reference pages.",
      recipeCountLabel: `${book.recipes.length + scienceOfSpiceRegionalBlends.length} recipes`,
      categories: ["Regional blends · Middle East", "Regional blends · Africa", "Regional blends · South Asia", "Regional blends · Southeast Asia", "Regional blends · East Asia", "Regional blends · Americas", "Regional blends · Europe", ...book.categories],
      recipes: [...scienceOfSpiceRegionalBlends, ...book.recipes],
    };
  }),
  "secrets-of-open-crumb": () => import("@/lib/imported-cookbooks/secrets-of-open-crumb.json").then((module) => module.default as ImportedCookbook),
  "thailand-the-cookbook": () => import("@/lib/imported-cookbooks/thailand-the-cookbook.json").then((module) => module.default as ImportedCookbook),
  "breakfast-the-cookbook": () => import("@/lib/imported-cookbooks/breakfast-the-cookbook.json").then((module) => module.default as ImportedCookbook),
  "tu-casa-mi-casa": () => import("@/lib/imported-cookbooks/tu-casa-mi-casa.json").then((module) => module.default as ImportedCookbook),
  "the-silver-spoon": () => import("@/lib/imported-cookbooks/the-silver-spoon.json").then((module) => module.default as ImportedCookbook),
  "the-essential-new-york-times-cookbook": () => import("@/lib/imported-cookbooks/the-essential-new-york-times-cookbook.json").then((module) => module.default as ImportedCookbook),
  "larousse-patisserie-and-baking": () => import("@/lib/imported-cookbooks/larousse-patisserie-and-baking.json").then((module) => module.default as ImportedCookbook),
  "crumb-richard-bertinet": () => import("@/lib/imported-cookbooks/crumb-richard-bertinet.json").then((module) => module.default as ImportedCookbook),
  "advanced-professional-pastry-chef": () => import("@/lib/imported-cookbooks/advanced-professional-pastry-chef.json").then((module) => module.default as ImportedCookbook),
  "complete-book-of-pasta-sauces": () => import("@/lib/imported-cookbooks/complete-book-of-pasta-sauces.json").then((module) => module.default as ImportedCookbook),
  "the-french-laundry-cookbook": () => import("@/lib/imported-cookbooks/the-french-laundry-cookbook.json").then((module) => module.default as ImportedCookbook),
  "spain-the-cookbook": () => import("@/lib/imported-cookbooks/spain-the-cookbook.json").then((module) => module.default as ImportedCookbook),
  "sauces-reconsidered": () => import("@/lib/imported-cookbooks/sauces-reconsidered.json").then((module) => module.default as ImportedCookbook),
};
