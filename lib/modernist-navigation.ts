export type ModernistNavigableEntry = {
  chapter: string;
  title: string;
  displayTitle?: string;
  page: number;
};

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

export function modernistEntryId(entry: ModernistNavigableEntry) {
  return `modernist-${entry.chapter}-p${entry.page}-${slugify(entry.displayTitle || entry.title)}`;
}

export function modernistEntryHref(entry: ModernistNavigableEntry) {
  return `/recipes/modernist-cuisine#${modernistEntryId(entry)}`;
}
