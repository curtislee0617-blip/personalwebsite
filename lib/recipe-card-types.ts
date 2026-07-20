export type RecipeIngredientGroup = { title: string; items: string[] };
export type RecipeMethodGroup = { title: string; steps: string[] };
export type RecipeMediaItem = {
  src: string;
  type: "image" | "video";
  alt?: string;
  poster?: string;
  caption?: string;
  position?: string;
  zoom?: number;
};

export type RecipeCardEntry = {
  recipeKey: string;
  slug: string;
  title: string;
  description: string;
  sourceLabel?: string;
  sourceLinkLabel?: string;
  sourceUrl?: string;
  instagramPostId?: string;
  status?: "published" | "coming-soon" | string;
  date?: string;
  category?: string;
  categories?: string[];
  thumbnail?: string;
  thumbnailPosition?: string;
  thumbnailZoom?: number;
  thumbnailTime?: number;
  imageUrls?: string[];
  media?: RecipeMediaItem[];
  ingredientGroups?: RecipeIngredientGroup[];
  methodGroups?: RecipeMethodGroup[];
  linkedRecipeKeys?: string[];
  referenceLinks?: Array<{ label: string; url: string }>;
  source: "site" | "uploaded";
};
