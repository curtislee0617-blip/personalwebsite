import pollenStreetData from "@/lib/pollen-street-data.json";

export type PollenStreetCategory = {
  id: string;
  label: string;
  blurb: string;
};

export type PollenStreetBasic = {
  slug: string;
  name: string;
  category: string;
  yield: string | null;
  ingredients: string[];
  method: string[];
};

export type PollenStreetDishSection = {
  name: string;
  ingredients: string[];
  steps: string[];
};

export type PollenStreetDish = {
  slug: string;
  title: string;
  subtitle: string;
  yield: string | null;
  images: string[];
  sections: PollenStreetDishSection[];
  basicReferences: string[];
};

const data = pollenStreetData as {
  categories: PollenStreetCategory[];
  basics: PollenStreetBasic[];
  dishes: PollenStreetDish[];
};

export const pollenStreetCategories = data.categories;
export const pollenStreetBasics = data.basics;
export const pollenStreetDishes = data.dishes;

export const pollenStreetBasicsBySlug = new Map(
  pollenStreetBasics.map((recipe) => [recipe.slug, recipe]),
);

export function pollenStreetBasicsByCategory(category: string) {
  return pollenStreetBasics.filter((recipe) => recipe.category === category);
}
