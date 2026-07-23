export type CocktailIngredientGroup = {
  heading: string;
  lines: string[];
};

export type CocktailMethodGroup = {
  heading: string;
  steps: string[];
};

export type CocktailBookImage = {
  src: string;
  sourcePages: number[];
  width: number;
  height: number;
};

export type CocktailBookReadingBlock = {
  kind: "heading" | "paragraph";
  text: string;
};

export type CocktailBookReadingSection = {
  id: string;
  title: string;
  chapter: string;
  sourcePages: number[];
  blocks: CocktailBookReadingBlock[];
  images: string[];
  searchText: string;
};

export type CocktailBookRecipe = {
  id: string;
  title: string;
  section: string;
  subsection: string;
  description: string;
  attribution: string;
  yield?: string | null;
  glassware?: string;
  equipment?: string;
  ingredientGroups: CocktailIngredientGroup[];
  methodGroups: CocktailMethodGroup[];
  sourcePages: number[];
  images: string[];
  image?: string | null;
  variantOf?: string;
  tags: string[];
  searchText: string;
};

export type CocktailBook = {
  id: string;
  title: string;
  author: string;
  description: string;
  thumbnail?: string | null;
  recipes: CocktailBookRecipe[];
  images: CocktailBookImage[];
  sections: string[];
  readingSections?: CocktailBookReadingSection[];
  recipeCountLabel: string;
};

export type CocktailPublication = {
  sourceKey: string;
  bookId: string;
  recipeId: string;
  publishedAt: string;
};
