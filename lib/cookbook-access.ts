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

export const privateCookbookMediaPrefixes = [
  "/bachour/",
  "/benu/",
  "/core-book/",
  "/frantzen/",
  "/imported-cookbooks/",
  "/modernist-cuisine/",
  "/modernist-pizza/",
  "/opera/",
  "/pollen-street/",
  "/recipes/cocktail-books/",
] as const;

const MEDIA_FILE_PATTERN = /\.(?:avif|gif|jpe?g|png|webp|pdf|mp4|m4v|mov)$/i;
const publicCookbookMediaPaths = [
  "/imported-cookbooks/secrets-of-open-crumb.jpg",
  "/imported-cookbooks/recipes/secrets-of-open-crumb/",
] as const;

export function isPrivateCookbookPathname(pathname: string) {
  return privateCookbookSlugs.some((slug) => {
    const bookPath = `/recipes/${slug}`;
    return pathname === bookPath || pathname.startsWith(`${bookPath}/`);
  });
}

export function isPrivateCookbookMediaPathname(pathname: string) {
  return MEDIA_FILE_PATTERN.test(pathname)
    && privateCookbookMediaPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export function isPublicCookbookMediaPathname(pathname: string) {
  return MEDIA_FILE_PATTERN.test(pathname)
    && publicCookbookMediaPaths.some((path) => pathname === path || pathname.startsWith(path));
}

export function cookbookMediaObjectPath(pathname: string) {
  return pathname.replace(/^\/+/, "");
}

export function isPrivateCookbookHref(href: string) {
  const pathname = href.split(/[?#]/, 1)[0] ?? href;
  return isPrivateCookbookPathname(pathname);
}
