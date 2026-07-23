export const cocktailCodexStyles = [
  { chapter: "The Old-Fashioned", label: "Old-Fashioned", slug: "old-fashioned" },
  { chapter: "The Martini", label: "Martini", slug: "martini" },
  { chapter: "The Daiquiri", label: "Daiquiri", slug: "daiquiri" },
  { chapter: "The Sidecar", label: "Sidecar", slug: "sidecar" },
  { chapter: "The Whisky Highball", label: "Whisky Highball", slug: "whisky-highball" },
  { chapter: "The Flip", label: "Flip", slug: "flip" },
] as const;

export function getCocktailCodexStyle(styleSlug: string) {
  return cocktailCodexStyles.find((style) => style.slug === styleSlug);
}

export function cocktailCodexStyleHref(styleSlug: string) {
  return `/recipes/cocktail-books/cocktail-codex/styles/${styleSlug}`;
}
