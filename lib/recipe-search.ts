import modernistContents from "@/imports/modernist-cuisine-volume-6/contents-index.json";
import { bachourPastryRecipes, bachourRecipes } from "@/lib/bachour";
import { benuRecipes } from "@/lib/benu";
import { coreCategories, coreRecipes } from "@/lib/core-basics";
import { coreDishes } from "@/lib/core-dishes";
import { frantzenBasics, frantzenPetitFours, frantzenRecipes } from "@/lib/frantzen";
import { importedCookbooks, importedCookbookSearchEntries } from "@/lib/imported-cookbooks";
import { modernistEntryHref } from "@/lib/modernist-navigation";
import { modernistPizzaEntries, modernistPizzaKnowledge, modernistPizzaRecipes } from "@/lib/modernist-pizza";
import { operaBasics, operaRecipes } from "@/lib/opera";
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
    title: "Modernist Pizza",
    context: `Recipe book · ${modernistPizzaRecipes.length} recipes and ${modernistPizzaKnowledge.length} technique references`,
    kind: "Book",
    href: "/recipes/modernist-pizza",
    searchText: "modernist pizza dough sauce cheese toppings ovens fermentation shaping baking cookbook kitchen manual",
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
      context: "Recipe book · 78 pastries and foundations",
      kind: "Book",
      href: "/recipes/bachour",
      searchText: "bachour antonio baker pastry entremet tart choux chocolate croissant brioche cookbook",
  },
  {
    title: "Frantzén by Björn Frantzén",
    context: "Recipe book · Basics, dishes and Petit Fours",
    kind: "Book",
    href: "/recipes/frantzen",
    searchText: "frantzen bjorn basics fine dining cookbook petit fours",
  },
  {
    title: "Opéra Pâtisserie by Cédric Grolet",
    context: "Recipe book · 22 Basics and 96 recipes",
    kind: "Book",
    href: "/recipes/opera",
    searchText: "opera patisserie cedric grolet pastry breakfast french desserts frozen fruit cookbook",
  },
  ...importedCookbooks.map((book): RecipeSearchItem => (
    {
      title: `${book.title} by ${book.author}`,
      context: `Recipe book · ${book.recipeCountLabel}`,
      kind: "Book",
      href: `/recipes/${book.id}`,
      searchText: `${book.title} ${book.author} cookbook ${book.categories.join(" ")}`,
    }
  )),
  ...importedCookbookSearchEntries.map((recipe): RecipeSearchItem => ({
    title: recipe.title,
    context: `${recipe.bookTitle} · ${recipe.category} · PDF page ${recipe.sourcePages.join(", ")}`,
    kind: "Cookbook recipe",
    href: `/recipes/${recipe.bookId}#${recipe.bookId}-${recipe.id}`,
    searchText: `${recipe.title} ${recipe.category} ${recipe.bookTitle}`,
  })),
  ...recipeEntries
    .filter((entry) => entry.kind === "guide")
    .map((entry): RecipeSearchItem => ({
      title: entry.title,
      context: "Recipe guide",
      kind: "Guide",
      href: entry.href,
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
  ...bachourPastryRecipes.map((recipe): RecipeSearchItem => ({
    title: recipe.title,
    context: `Bachour the Baker · ${recipe.category} · ${recipe.yield}`,
    kind: "Bachour pastry",
    href: `/recipes/bachour#bachour-baker-${recipe.slug}`,
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
  ...operaBasics.map((recipe): RecipeSearchItem => ({
    title: recipe.name,
    context: `Opéra Pâtisserie Basics · ${recipe.group}`,
    kind: "Opéra basic",
    href: `/recipes/opera#opera-basic-${recipe.slug}`,
    searchText: recipe.ingredients.join(" "),
  })),
  ...operaRecipes.map((recipe): RecipeSearchItem => ({
    title: recipe.title,
    context: `Opéra Pâtisserie · ${recipe.category}`,
    kind: "Opéra recipe",
    href: `/recipes/opera#opera-${recipe.slug}`,
    searchText: recipe.components.flatMap((component) => [component.name, ...component.ingredients]).join(" "),
  })),
  ...modernistPizzaEntries.map((entry): RecipeSearchItem => ({
    title: entry.title,
    context: `Modernist Pizza · ${entry.category} · printed page ${entry.printedPage}`,
    kind: entry.kind === "recipe" ? "Modernist Pizza recipe" : "Modernist Pizza reference",
    href: `/recipes/modernist-pizza#modernist-pizza-${entry.kind}-${entry.slug}`,
    searchText: `${entry.summary} ${entry.aliases.join(" ")} ${entry.searchText}`,
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
