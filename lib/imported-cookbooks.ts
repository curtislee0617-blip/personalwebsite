import cookbookData from "@/lib/imported-cookbooks-data.json";
import type { ImportedCookbook } from "@/components/imported-cookbook-guide";

export const importedCookbooks = cookbookData as ImportedCookbook[];

export function getImportedCookbook(id: string) {
  return importedCookbooks.find((book) => book.id === id);
}
