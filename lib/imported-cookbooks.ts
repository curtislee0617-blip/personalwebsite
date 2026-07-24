import cookbookCatalog from "@/lib/imported-cookbooks/catalog.json";
import cookbookSearchIndex from "@/lib/imported-cookbooks/search-index.json";
import { importedCookbookLoaders } from "@/lib/imported-cookbook-loaders";
import { scienceOfSpiceRegionalBlends } from "@/lib/imported-cookbooks/science-of-spice-blends";
import type { ImportedCookbook } from "@/components/imported-cookbook-guide";

export type ImportedCookbookSummary = Omit<ImportedCookbook, "recipes"> & {
  coverImage?: string;
};

export type ImportedCookbookSearchEntry = {
  bookId: string;
  bookTitle: string;
  category: string;
  id: string;
  sourcePages: number[];
  title: string;
};

export const importedCookbooks = (cookbookCatalog as ImportedCookbookSummary[]).map((book) =>
  book.id === "science-of-spice"
    ? {
        ...book,
        categories: ["Regional spice blends", ...book.categories],
        description: "Recipes and regional local spice blends, separated from spice stories and reference pages.",
        recipeCountLabel: `${scienceOfSpiceRegionalBlends.length + 9} recipes`,
      }
    : book,
);
export const importedCookbookSearchEntries = [
  ...(cookbookSearchIndex as ImportedCookbookSearchEntry[]),
  ...scienceOfSpiceRegionalBlends.map(({ category, id, sourcePages, title }) => ({
    bookId: "science-of-spice",
    bookTitle: "The Science of Spice",
    category,
    id,
    sourcePages,
    title,
  })),
];

export function hasImportedCookbook(id: string) {
  return Boolean(importedCookbookLoaders[id]);
}

export async function getImportedCookbook(id: string) {
  return importedCookbookLoaders[id]?.();
}
