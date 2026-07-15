import modernistPizzaData from "@/lib/modernist-pizza-data.json";

export type ModernistPizzaEntry = {
  slug: string;
  title: string;
  kind: "recipe" | "knowledge";
  category: string;
  label: string | null;
  printedPage: number;
  pdfPage: number;
  sourcePages: number[];
  sourceImages: string[];
  summary: string;
  steps: string[];
  aliases: string[];
  searchText: string;
};

export type ModernistPizzaHighlight = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  points: string[];
  sourcePages: number[];
};

export const modernistPizzaEntries = modernistPizzaData as ModernistPizzaEntry[];
export const modernistPizzaRecipes = modernistPizzaEntries.filter((entry) => entry.kind === "recipe");
export const modernistPizzaKnowledge = modernistPizzaEntries.filter((entry) => entry.kind === "knowledge");

export const modernistPizzaRecipeCategories = [
  "Pizza doughs",
  "Sauces",
  "Cheese",
  "Toppings & preparations",
  "Iconic pizzas",
  "Flavor-theme pizzas",
] as const;

export const modernistPizzaKnowledgeCategories = [
  "Ingredients & preferments",
  "Ovens",
  "Mixing, fermentation & shaping",
  "Dough reference",
  "Sauce technique",
  "Cheese & toppings",
  "Shaping & baking",
  "Pizza design",
  "Serving & storage",
  "Reference",
] as const;

const pdfPages = (...printedPages: number[]) => printedPages.map((page) => page + 8);

export const modernistPizzaHighlights: ModernistPizzaHighlight[] = [
  {
    slug: "scaling-with-bakers-percentages",
    title: "Scale with baker’s percentages",
    category: "Recipe planning",
    summary: "Treat flour as 100%, calculate a conversion factor from the desired yield, and rebuild every ingredient from the new flour weight.",
    points: [
      "Recipe conversion factor = desired yield divided by the published yield.",
      "Multiply the published flour weight by that factor to find the new flour weight.",
      "Multiply each baker’s percentage by the new flour weight; scale unpercented pieces or volumes with the conversion factor.",
      "Keep preferments and nested components in the same proportion as the parent dough.",
    ],
    sourcePages: pdfPages(1),
  },
  {
    slug: "poolish-readiness",
    title: "Poolish: mixing and readiness",
    category: "Preferments",
    summary: "A poolish is useful for flavor and extensibility, but its maturity matters more than a fixed clock time.",
    points: [
      "Mix flour, water, and yeast until homogeneous, then ferment covered at 21-24°C / 70-75°F.",
      "A ripe poolish should be aerated and pass the float test; temperature and inoculation change the timing.",
      "An overripe poolish can still contribute flavor, but needs additional yeast because its leavening strength has declined.",
    ],
    sourcePages: pdfPages(2),
  },
  {
    slug: "levain-maintenance",
    title: "Build, maintain, and preserve levain",
    category: "Preferments",
    summary: "The manual distinguishes young, mature, and ripe levain and adjusts feeding frequency to temperature and desired sourness.",
    points: [
      "Start with equal weights of flour and water, discard and feed consistently, and judge activity by bubbles and expansion.",
      "Warmer environments require more frequent feeding; cooler storage extends the useful window.",
      "Freeze inactive levain for flavor or dehydrate ripe levain at gentle heat for long-term storage.",
      "Inactive second-chance levain does not leaven dough by itself, so pair it with commercial yeast.",
    ],
    sourcePages: pdfPages(3, 4, 5),
  },
  {
    slug: "oven-strategy",
    title: "Match pizza style to oven",
    category: "Ovens",
    summary: "Oven choice changes the workable pizza styles, throughput, browning, and balance between top and bottom heat.",
    points: [
      "Choose the oven and baking surface around the pizza style rather than expecting one setting to suit every dough.",
      "Preheat long enough for the deck, stone, or steel to reach equilibrium—not merely until the air-temperature indicator is ready.",
      "Use the book’s style table to balance floor heat, top heat, bake time, and pizza size.",
    ],
    sourcePages: pdfPages(10, 11),
  },
  {
    slug: "mixing-and-gluten",
    title: "Choose a mixing method by dough behavior",
    category: "Mixing",
    summary: "Mixing time is a guideline; hydration, flour, inclusions, mixer geometry, dough mass, and speed all change gluten development.",
    points: [
      "Use visual and tactile tests—especially the windowpane test—to determine development.",
      "High-hydration doughs may benefit from staged hydration; inclusions should be incorporated only after enough structure exists.",
      "Avoid overheating the dough during mechanical mixing and account for friction when choosing water temperature.",
      "Bowl and no-knead methods trade speed for folds and fermentation time.",
    ],
    sourcePages: pdfPages(13, 14, 15, 16),
  },
  {
    slug: "fermentation-proofing",
    title: "Control bulk fermentation and proofing",
    category: "Fermentation",
    summary: "Time and temperature work together; dough strength, yeast level, preferment, and target style determine the useful proofing window.",
    points: [
      "Keep dough covered to prevent skin formation and use folds to strengthen wet dough during bulk fermentation.",
      "Divide accurately, preshape with appropriate tension, and use FIFO so similarly fermented portions are handled in order.",
      "Cold proofing builds scheduling flexibility and flavor but requires enough tempering time before shaping.",
      "If dough is overproofed, the Dough CPR procedure can redistribute gas and recover some structure.",
    ],
    sourcePages: pdfPages(17, 18, 19, 20, 21, 22, 23, 24),
  },
  {
    slug: "sauce-consistency",
    title: "Design sauce for pizza, not pasta",
    category: "Sauce",
    summary: "Pizza sauce must remain spreadable while limiting free water that would soften the crust or interfere with cheese browning.",
    points: [
      "Reduce, strain, or thicken a loose sauce before it reaches the dough.",
      "For xanthan-thickened sauces, disperse the hydrocolloid into a small portion before whisking it into the remainder.",
      "Use the flow test or Bostwick consistometer guidance to compare batches consistently.",
      "Adapt pasta sauces and soups by concentrating flavor while correcting viscosity and fat separation.",
    ],
    sourcePages: pdfPages(124, 125, 126, 127),
  },
  {
    slug: "topping-moisture",
    title: "Manage topping weight and moisture",
    category: "Toppings",
    summary: "Topping quantity and preparation should follow pizza size, dough strength, bake time, and oven intensity.",
    points: [
      "Use the recommended weight tables as a starting point and keep toppings in a thin, even layer.",
      "Pre-cook watery vegetables for short, hot bakes; roast, sauté, steam, sous vide, or confit according to the texture required.",
      "Drain fresh mozzarella and other wet cheeses before service.",
      "Place ingredients deliberately so every portion receives a balanced bite and the center is not overloaded.",
    ],
    sourcePages: pdfPages(151, 166, 167, 169, 170, 171, 172),
  },
  {
    slug: "peel-and-baking",
    title: "Transfer and bake with control",
    category: "Baking",
    summary: "A clean transfer, properly preheated surface, and deliberate rotation are as important as the recipe itself.",
    points: [
      "Work quickly after dressing the dough and confirm it still slides before approaching the oven.",
      "Load with a decisive pull-away motion and monitor both the underside and the rim—not only the top color.",
      "Match venting, fan speed, deck balance, and rotation to the oven type.",
      "For service, stagger shaping and baking and choose styles that tolerate short holding periods.",
    ],
    sourcePages: pdfPages(179, 180, 181, 182, 183, 184, 185, 186, 187, 188),
  },
  {
    slug: "reheating-storage",
    title: "Hold, reheat, and freeze pizza",
    category: "Storage",
    summary: "Different crust styles respond differently to holding and reheating; restore bottom crispness without drying the toppings.",
    points: [
      "Avoid trapping steam during hot holding, especially for thin and crisp styles.",
      "Use an oven, skillet, or combined method according to slice thickness and whether the pizza is refrigerated or frozen.",
      "Pre-freeze individual slices before wrapping so their shape is preserved and label them with the date.",
      "Reheat only what will be eaten; repeated cooling and reheating steadily degrades the crust.",
    ],
    sourcePages: pdfPages(336, 337, 338, 340, 342, 344, 346),
  },
  {
    slug: "style-conversion",
    title: "Convert one pizza style into another",
    category: "Reference",
    summary: "The conversion tables separate dough, sauce, cheese, pre-bake toppings, and post-bake toppings so each can be resized independently.",
    points: [
      "Start from the target dough weight or pan area rather than scaling only by diameter.",
      "Apply the book’s separate multipliers for sauce, cheese, and toppings because each changes differently between styles.",
      "Recheck bake time and oven setup after conversion; equal ingredient ratios do not imply equal baking behavior.",
    ],
    sourcePages: pdfPages(356, 357, 358),
  },
];
