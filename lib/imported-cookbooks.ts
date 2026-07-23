import cookbookCatalog from "@/lib/imported-cookbooks/catalog.json";
import cookbookSearchIndex from "@/lib/imported-cookbooks/search-index.json";
import { importedCookbookLoaders } from "@/lib/imported-cookbook-loaders";
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

export const importedCookbooks = cookbookCatalog as ImportedCookbookSummary[];
export const importedCookbookSearchEntries = cookbookSearchIndex as ImportedCookbookSearchEntry[];

export function hasImportedCookbook(id: string) {
  return Boolean(importedCookbookLoaders[id]);
}

export async function getImportedCookbook(id: string) {
  return importedCookbookLoaders[id]?.();
}
