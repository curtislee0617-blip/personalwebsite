"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

type MediaSavedWishlistContextValue = {
  pendingRecipeKeys: Set<string>;
  toggleRecipe: (recipeKey: string) => Promise<void>;
  wishlistedRecipeKeys: Set<string>;
};

const MediaSavedWishlistContext = createContext<MediaSavedWishlistContextValue | null>(null);

export function MediaSavedWishlistProvider({
  children,
  initialRecipeKeys,
}: {
  children: ReactNode;
  initialRecipeKeys: string[];
}) {
  const [wishlistedRecipeKeys, setWishlistedRecipeKeys] = useState(() => new Set(initialRecipeKeys));
  const [pendingRecipeKeys, setPendingRecipeKeys] = useState(() => new Set<string>());

  async function toggleRecipe(recipeKey: string) {
    if (pendingRecipeKeys.has(recipeKey)) return;

    const isWishlisted = wishlistedRecipeKeys.has(recipeKey);
    setPendingRecipeKeys((current) => new Set(current).add(recipeKey));

    try {
      const response = await fetch("/api/recipe-admin/media-wishlist", {
        body: JSON.stringify({
          action: isWishlisted ? "remove" : "add",
          recipeKey,
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      if (!response.ok) return;

      setWishlistedRecipeKeys((current) => {
        const next = new Set(current);
        if (isWishlisted) next.delete(recipeKey);
        else next.add(recipeKey);
        return next;
      });
    } finally {
      setPendingRecipeKeys((current) => {
        const next = new Set(current);
        next.delete(recipeKey);
        return next;
      });
    }
  }

  return (
    <MediaSavedWishlistContext.Provider value={{ pendingRecipeKeys, toggleRecipe, wishlistedRecipeKeys }}>
      {children}
    </MediaSavedWishlistContext.Provider>
  );
}

export function MediaSavedWishlistButton({ recipeKey }: { recipeKey: string }) {
  const context = useContext(MediaSavedWishlistContext);
  if (!context) return null;

  const isPending = context.pendingRecipeKeys.has(recipeKey);
  const isWishlisted = context.wishlistedRecipeKeys.has(recipeKey);

  return (
    <button
      aria-pressed={isWishlisted}
      className="recipe-card-wishlist-button"
      disabled={isPending}
      onClick={() => void context.toggleRecipe(recipeKey)}
      type="button"
    >
      {isPending ? "Saving…" : isWishlisted ? "✓ In wishlist" : "+ Move to wishlist"}
    </button>
  );
}
