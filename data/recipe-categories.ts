export const recipeCategories = [
  { id: "rice-noodles", title: "Rice & Noodles", description: "Rice dishes, noodles, pasta, dumplings, and other grain-based recipes." },
  { id: "meat", title: "Meat", description: "Beef, pork, lamb, and other meat-focused dishes." },
  { id: "seafood", title: "Seafood", description: "Fish, shellfish, and recipes from the sea." },
  { id: "condiments", title: "Condiments", description: "Sauces, pickles, ferments, oils, seasonings, and other flavor-building additions." },
  { id: "poultry", title: "Poultry", description: "Chicken, duck, turkey, and other poultry recipes." },
  { id: "vegetables", title: "Vegetables", description: "Vegetable-led dishes, sides, salads, and plant-forward cooking notes." },
  { id: "starches-grains", title: "Starches & Grains", description: "Potatoes, grains, legumes, pulses, and other starchy foundations." },
  { id: "desserts-pastries", title: "Desserts & Pastries", description: "Sweet bakes, plated desserts, laminated doughs, cakes, and pastry projects." },
  { id: "bread", title: "Bread", description: "Sourdough, loaves, rolls, enriched doughs, and other breads." },
] as const;

export type RecipeCategoryId = (typeof recipeCategories)[number]["id"];

export function isRecipeCategoryId(value: string): value is RecipeCategoryId {
  return recipeCategories.some((category) => category.id === value);
}

export function recipeCategoryTitle(id: string) {
  return recipeCategories.find((category) => category.id === id)?.title ?? id;
}
