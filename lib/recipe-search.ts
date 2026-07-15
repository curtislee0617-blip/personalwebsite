import modernistContents from "@/imports/modernist-cuisine-volume-6/contents-index.json";
import { bachourRecipes } from "@/lib/bachour";
import { benuRecipes } from "@/lib/benu";
import { coreCategories, coreRecipes } from "@/lib/core-basics";
import { coreDishes } from "@/lib/core-dishes";
import { frantzenBasics, frantzenPetitFours, frantzenRecipes } from "@/lib/frantzen";
import { modernistEntryHref } from "@/lib/modernist-navigation";
import { pollenStreetBasics, pollenStreetCategories, pollenStreetDishes } from "@/lib/pollen-street";
import { recipeEntries } from "@/lib/recipes";

export type RecipeSearchItem = {
  title: string;
  context: string;
  kind: string;
  href: string;
  searchText: string;
};

type ModernistSearchEntry = {
  chapter: string;
  title: string;
  displayTitle?: string;
  page: number;
  yield?: string;
  ingredients?: Array<{ name: string }>;
  components?: Array<{ name: string; ingredients: Array<{ name: string }> }>;
  sourceKind?: "recipe" | "reference";
  isRecipe?: boolean;
};

const coreCategoryLabels = new Map(coreCategories.map((category) => [category.id, category.label]));
const pollenCategoryLabels = new Map(pollenStreetCategories.map((category) => [category.id, category.label]));

export const recipeSearchItems: RecipeSearchItem[] = [
  {
    title: "Core by Clare Smyth",
    context: "Recipe book · Basics and 51 complete dish groups",
    kind: "Book",
    href: "/recipes/core-basics",
    searchText: "core clare smyth basics complete dishes cookbook",
  },
  {
    title: "Pollen Street by Jason Atherton",
    context: "Recipe book · 83 recipes",
    kind: "Book",
    href: "/recipes/pollen-street",
    searchText: "foundation basics complete dishes cookbook",
  },
  {
    title: "Modernist Cuisine recipes",
    context: "Recipe book · Volume 6 Kitchen Manual",
    kind: "Book",
    href: "/recipes/modernist-cuisine",
    searchText: "modernist cuisine kitchen manual charts techniques cookbook",
  },
  {
    title: "Benu by Corey Lee",
    context: "Recipe book · 8 supplied dishes",
    kind: "Book",
    href: "/recipes/benu",
    searchText: "benu corey lee cookbook korean chinese fine dining",
  },
  {
    title: "Bachour by Antonio Bachour",
    context: "Recipe book · 11 supplied pastries",
    kind: "Book",
    href: "/recipes/bachour",
    searchText: "bachour antonio pastry entremet tart choux chocolate cookbook",
  },
  {
    title: "Frantzén by Björn Frantzén",
    context: "Recipe book · Basics, dishes and Petit Fours",
    kind: "Book",
    href: "/recipes/frantzen",
    searchText: "frantzen bjorn basics fine dining cookbook petit fours",
  },
  ...recipeEntries
    .filter((entry) => entry.kind === "guide" || entry.status === "published")
    .map((entry): RecipeSearchItem => ({
      title: entry.title,
      context: entry.kind === "guide" ? "Recipe guide" : "Personal recipe",
      kind: entry.kind === "guide" ? "Guide" : "Recipe",
      href: entry.kind === "guide" ? entry.href : `/recipes#recipe-${entry.slug}`,
      searchText: [
        entry.description,
        ...(entry.ingredientGroups?.flatMap((group) => [group.title, ...group.items]) ?? []),
      ].join(" "),
    })),
  ...coreRecipes.map((recipe): RecipeSearchItem => ({
    title: recipe.name,
    context: `Core basics · ${coreCategoryLabels.get(recipe.category) ?? "Foundation recipe"}`,
    kind: "Core basic",
    href: `/recipes/core-basics#${recipe.slug}`,
    searchText: recipe.ingredients.join(" "),
  })),
  ...coreDishes.map((dish): RecipeSearchItem => ({
    title: dish.title,
    context: `Core by Clare Smyth${dish.subtitle ? ` · ${dish.subtitle}` : ""}`,
    kind: "Core dish",
    href: `/recipes/core-basics#core-dish-${dish.slug}`,
    searchText: dish.searchText,
  })),
  ...pollenStreetBasics.map((recipe): RecipeSearchItem => ({
    title: recipe.name,
    context: `Pollen Street Basics · ${pollenCategoryLabels.get(recipe.category) ?? "Foundation recipe"}`,
    kind: "Pollen basic",
    href: `/recipes/pollen-street#basic-${recipe.slug}`,
    searchText: `${recipe.yield ?? ""} ${recipe.ingredients.join(" ")}`,
  })),
  ...pollenStreetDishes.map((dish): RecipeSearchItem => ({
    title: dish.title,
    context: `Pollen Street recipe${dish.subtitle ? ` · ${dish.subtitle}` : ""}`,
    kind: "Pollen dish",
    href: `/recipes/pollen-street#dish-${dish.slug}`,
    searchText: dish.sections.flatMap((section) => [section.name, ...section.ingredients]).join(" "),
  })),
  ...benuRecipes.map((recipe): RecipeSearchItem => ({
    title: recipe.title,
    context: "Benu by Corey Lee",
    kind: "Benu dish",
    href: `/recipes/benu#benu-${recipe.slug}`,
    searchText: recipe.components.flatMap((component) => [component.name, ...component.ingredients]).join(" "),
  })),
  ...bachourRecipes.map((recipe): RecipeSearchItem => ({
    title: recipe.title,
    context: `Bachour by Antonio Bachour · ${recipe.yield}`,
    kind: "Bachour pastry",
    href: `/recipes/bachour#bachour-${recipe.slug}`,
    searchText: recipe.components.flatMap((component) => [component.name, ...component.ingredients]).join(" "),
  })),
  ...frantzenBasics.map((recipe): RecipeSearchItem => ({
    title: recipe.name,
    context: `Frantzén Basics · page ${recipe.page}`,
    kind: "Frantzén basic",
    href: `/recipes/frantzen#frantzen-basic-${recipe.slug}`,
    searchText: recipe.ingredients.join(" "),
  })),
  ...[...frantzenRecipes, ...frantzenPetitFours].map((recipe): RecipeSearchItem => ({
    title: recipe.title,
    context: `Frantzén by Björn Frantzén · ${recipe.description}`,
    kind: "Frantzén recipe",
    href: `/recipes/frantzen#frantzen-${recipe.slug}`,
    searchText: recipe.components.flatMap((component) => [component.name, ...component.ingredients]).join(" "),
  })),
  ...(modernistContents as ModernistSearchEntry[]).map((entry): RecipeSearchItem => ({
    title: entry.displayTitle || entry.title,
    context: `Modernist Cuisine · Kitchen Manual page ${entry.page}`,
    kind: entry.sourceKind === "recipe" || entry.isRecipe ? "Modernist recipe" : "Modernist chart",
    href: modernistEntryHref(entry),
    searchText: [
      entry.title,
      entry.yield ?? "",
      ...(entry.ingredients?.map((ingredient) => ingredient.name) ?? []),
      ...(entry.components?.flatMap((component) => [component.name, ...component.ingredients.map((ingredient) => ingredient.name)]) ?? []),
    ].join(" "),
  })),
];
