export function cookbookWishlistRecipeHref(cookbookId: string, recipeId: string) {
  return `/recipes/wishlist/${encodeURIComponent(cookbookId)}/${encodeURIComponent(recipeId)}`;
}

export function cookbookWishlistImageHref(cookbookId: string, recipeId: string) {
  const params = new URLSearchParams({ cookbookId, recipeId });
  return `/api/recipe-wishlist/cookbook-media?${params.toString()}`;
}
