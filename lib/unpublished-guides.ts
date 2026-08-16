/**
 * Guides that are drafted but not finished.
 *
 * They stay visible everywhere, so the shape of the site is honest about what is
 * coming, but only the admin can open them: entries render blurred and inert for
 * visitors, and the routes themselves 404.
 *
 * Single source of truth — the recipes page, the sidebar nav and the guide
 * routes all read this list. `status: "coming-soon"` in lib/recipes.ts mirrors
 * it for display copy; this module is what actually gates access.
 *
 * Deliberately tiny and dependency-free: the sidebar nav is a client component,
 * so importing the full recipe catalogue here would drag it into that bundle.
 */

export const UNPUBLISHED_GUIDE_HREFS = [
  "/recipes/coffee-guide",
  "/recipes/wine-guide",
  "/recipes/sushi-guide",
] as const;

export const UNPUBLISHED_GUIDE_LABEL = "Not published yet";

/** Matches the guide itself and anything nested under it, e.g. an image viewer. */
export function isUnpublishedGuideHref(href: string) {
  return UNPUBLISHED_GUIDE_HREFS.some((guide) => href === guide || href.startsWith(`${guide}/`));
}
