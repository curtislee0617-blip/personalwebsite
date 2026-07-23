export const privateCookbookSlugs = [
  "core-basics",
  "frantzen",
  "modernist-cuisine",
  "modernist-pizza",
  "pollen-street",
  "opera",
  "bachour",
  "benu",
  "cocktail-books",
  "everyday-lebanese",
  "japan-the-cookbook",
  "anatolia",
  "science-of-spice",
  "secrets-of-open-crumb",
  "thailand-the-cookbook",
] as const;

export function isPrivateCookbookPathname(pathname: string) {
  return privateCookbookSlugs.some((slug) => {
    const bookPath = `/recipes/${slug}`;
    return pathname === bookPath || pathname.startsWith(`${bookPath}/`);
  });
}

export function isPrivateCookbookHref(href: string) {
  const pathname = href.split(/[?#]/, 1)[0] ?? href;
  return isPrivateCookbookPathname(pathname);
}
