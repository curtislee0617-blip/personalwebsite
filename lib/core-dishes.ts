import data from "@/lib/core-dishes-data.json";

export type CoreIngredientLine = {
  text: string;
  heading: boolean;
};

export type CoreMethodSection = {
  heading: string;
  paragraphs: string[];
};

export type CoreDishPage = {
  label: string;
  ingredientColumns: CoreIngredientLine[][];
  methodColumns: CoreMethodSection[][];
};

export type CoreDish = {
  slug: string;
  title: string;
  subtitle: string;
  yield: string | null;
  images: string[];
  sourceScans: string[];
  searchText: string;
  sourcePages: string[];
  pages: CoreDishPage[];
};

export const coreDishes = data.dishes as CoreDish[];
