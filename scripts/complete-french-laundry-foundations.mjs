import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bookPath = path.join(root, "lib/imported-cookbooks/the-french-laundry-cookbook.json");
const catalogPath = path.join(root, "lib/imported-cookbooks/catalog.json");
const searchPath = path.join(root, "lib/imported-cookbooks/search-index.json");

const slugify = (value) => value
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/&/g, " and ")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

const ingredientGroups = (lines) => [{ heading: "Ingredients", lines }];
const methodGroups = (steps) => [{ heading: "Method", steps }];

function recipe({
  category,
  ingredients = [],
  ingredientSections,
  methods,
  methodSections,
  pages,
  subtitle = "",
  title,
  yield: recipeYield = null,
}) {
  const next = {
    category,
    cookTime: null,
    id: slugify(title),
    image: null,
    ingredientGroups: ingredientSections ?? ingredientGroups(ingredients),
    methodGroups: methodSections ?? methodGroups(methods),
    prepTime: null,
    searchText: "",
    sourcePages: pages,
    subtitle,
    title,
    yield: recipeYield,
  };
  next.searchText = [
    title,
    subtitle,
    category,
    ...next.ingredientGroups.flatMap((group) => [group.heading, ...group.lines]),
    ...next.methodGroups.flatMap((group) => [group.heading, ...group.steps]),
  ].filter(Boolean).join(" ");
  return next;
}

const additions = [
  recipe({
    category: "First Course",
    pages: [92, 93],
    title: "Pasta Dough",
    yield: "About 14 ounces dough",
    ingredients: [
      "1¾ cups (8 ounces) all-purpose flour",
      "6 large egg yolks",
      "1 large egg",
      "1½ teaspoons olive oil",
      "1 tablespoon milk",
    ],
    methodSections: [
      {
        heading: "Make the dough",
        steps: [
          "Mound the flour on a work surface and make a wide well with walls about 1 inch thick. Add the yolks, egg, oil, and milk.",
          "Break up and stir the eggs with your fingers, gradually drawing flour from the well into the liquid. Use a pastry scraper to move flour toward the eggs without collapsing the wall.",
          "When too thick to stir, cut the remaining flour into the dough with the scraper. Gather the shaggy mixture into a ball.",
          "Knead forward with the heels of your hands. Rest briefly, clean and dust the surface, then knead until silky, smooth, and springy, at least 10 to 15 minutes.",
          "Double-wrap and rest for 30 minutes to 1 hour. The dough can be refrigerated for 1 day; return it to room temperature before rolling.",
        ],
      },
      {
        heading: "Roll pasta sheets",
        steps: [
          "For 12 ravioli, take about 5 ounces dough, divide it in half, and keep one half wrapped. Pass the other through the widest pasta-machine setting.",
          "Fold end to end, rotate a quarter turn, and repeat twice; on the last pass, fold lengthwise to make a narrower sheet.",
          "Reduce the opening one notch at a time, passing without folding, until the sheet reaches the next-to-thinnest setting. Repeat with the second piece.",
          "For capellini, run the sheets through the fine cutter. Use fresh, or form loose nests on a cornmeal-dusted tray and dry completely.",
        ],
      },
      {
        heading: "Form agnolotti",
        steps: [
          "Roll ½ recipe dough into sheets at least 5 inches wide and thin enough to see your fingers through, but not translucent. Keep covered.",
          "Pipe a tube of filling along the lower edge, leaving a ¾-inch border on the left, right, and bottom.",
          "Fold the lower edge over the filling, press out air, and seal, leaving about ½ inch of dough above the filling.",
          "Pinch into 1-inch portions with about ¾ inch of sealed dough between pockets. Trim the long edge with a crimped wheel, then cut through each pinched area.",
          "Place on a cornmeal-dusted tray without touching. Cook at once, or freeze on the tray, bag, and cook from frozen.",
        ],
      },
    ],
  }),
  recipe({
    category: "Fish",
    pages: [149],
    title: "Beurre Monté",
    subtitle: "The workhorse emulsified-butter sauce used for poaching, basting, resting meats, and finishing sauces.",
    ingredientSections: [{
      heading: "Base ratio",
      lines: [
        "1 tablespoon water",
        "4 tablespoons (2 ounces) to 1 pound unsalted butter, cut into chunks",
      ],
    }],
    methods: [
      "Bring the water to a boil in an appropriately sized saucepan.",
      "Reduce the heat to low and whisk in the butter a few pieces at a time to establish an emulsion.",
      "Continue adding butter until you have the amount required. Keep the heat gentle and consistent so the emulsion does not break.",
      "Prepare close to the time of use and keep warm, ideally between 180°F and 190°F; never boil.",
      "Refrigerate leftovers and reheat for use as melted or clarified butter. When only 1 or 2 tablespoons are called for, whole butter may be substituted.",
    ],
  }),
];

const finishHerbOil = [
  "Drain and squeeze the herbs as dry as possible, then cut them into small pieces with scissors.",
  "Blend half the herbs with just enough oil to cover for 1 minute on medium and 2 minutes on high. Keep the purée only slightly warm; stop and chill it if the blender overheats.",
  "Add half the remaining herbs and blend for 2 minutes, then add the rest and blend for 2 minutes more.",
  "Refrigerate the purée for at least 1 day. Filter through cheesecloth for about 1 hour without squeezing, then refrigerate or freeze.",
];

const herbOils = [
  {
    title: "Rosemary Oil",
    yield: "About ¼ cup",
    ingredients: ["1 cup rosemary leaves", "2 cups Italian parsley sprigs", "About 1 cup canola oil", "Kosher salt for blanching water"],
    first: "Blanch the rosemary for 30 seconds, add the parsley, and blanch for 10 seconds more. Chill immediately in ice water.",
  },
  {
    title: "Fennel Oil",
    yield: "About ⅓ cup",
    ingredients: ["2 cups fennel fronds", "2 cups Italian parsley sprigs", "About ¾ cup canola oil", "Kosher salt for blanching water"],
    first: "Blanch the fennel fronds and parsley together for 10 to 15 seconds. Chill immediately in ice water.",
  },
  {
    title: "Chive Oil",
    yield: "About ⅓ cup",
    ingredients: ["1 packed cup chives, cut into 1-inch pieces", "About 1 cup canola oil"],
    first: "Place the chives in a strainer and run hot water over them for about 2 minutes to soften them and remove the raw chlorophyll taste. Drain and squeeze dry.",
  },
  {
    title: "Parsley Oil",
    yield: "About ⅓ cup",
    ingredients: ["4 cups Italian parsley sprigs", "About ¾ cup canola oil", "Kosher salt for blanching water"],
    first: "Blanch the parsley for 15 seconds. Chill immediately in ice water.",
  },
  {
    title: "Basil Oil",
    yield: "About ⅓ cup",
    ingredients: ["3 packed cups basil leaves", "About ¾ cup olive oil", "Kosher salt for blanching water"],
    first: "Blanch the basil for 15 seconds. Chill immediately in ice water.",
  },
  {
    title: "Mint Oil",
    yield: "About ⅓ cup",
    ingredients: ["4 packed cups mint leaves", "About ¾ cup canola oil", "Kosher salt for blanching water"],
    first: "Blanch the mint for 15 seconds. Chill immediately in ice water.",
  },
  {
    title: "Thyme Oil",
    yield: "About ⅓ cup",
    ingredients: ["¼ cup thyme leaves and tender stems", "3 cups Italian parsley sprigs", "About ¾ cup canola oil", "Kosher salt for blanching water"],
    first: "Blanch the thyme for 30 seconds, add the parsley, and blanch for 10 seconds more. Chill immediately in ice water.",
  },
];

additions.push(...herbOils.map((oil) => recipe({
  category: "Fish",
  pages: [179, 180],
  title: oil.title,
  yield: oil.yield,
  ingredients: oil.ingredients,
  methods: [oil.first, ...finishHerbOil],
})));

additions.push(
  recipe({
    category: "Fish",
    pages: [181],
    title: "Curry Oil",
    yield: "About ½ cup",
    ingredients: [
      "¼ cup curry powder",
      "3 tablespoons coriander seed",
      "One ½- to ¾-inch-long piece cinnamon stick",
      "3 tablespoons mace",
      "1¼ teaspoons cayenne",
      "1 cup canola oil",
    ],
    methods: [
      "Toast the curry powder and coriander seed in separate small pans just until aromatic.",
      "Grind the coriander with the cinnamon, mace, and cayenne. Stir in the curry powder and enough oil to moisten.",
      "Blend the spices with the remaining oil. Pour into a container and rest for 1 day.",
      "Strain through a cheesecloth-lined fine-mesh sieve and keep airtight at room temperature.",
    ],
  }),
  recipe({
    category: "Fish",
    pages: [181],
    title: "Carrot Oil",
    yield: "About ⅓ cup",
    ingredients: ["1 cup carrot juice (from about 1¼ pounds carrots)", "3 tablespoons canola oil"],
    methods: [
      "Reduce the carrot juice in a small saucepan to 3 tablespoons.",
      "Strain, combine with the oil in a mini-blender, and blend for 1 minute to emulsify.",
      "Transfer to a small container and refrigerate.",
    ],
  }),
  recipe({
    category: "Fish",
    pages: [181],
    title: "Coral Oil",
    yield: "About ¼ to ⅓ cup",
    ingredients: ["3 tablespoons lobster coral (roe)", "½ cup canola oil, heated"],
    methods: [
      "Blend the lobster coral for 20 to 30 seconds, until smooth.",
      "With the machine on low, drizzle in the hot oil. Increase to high and blend for 15 to 20 minutes, scraping occasionally and avoiding overheating.",
      "Strain through a cheesecloth-lined fine-mesh sieve, cover, and refrigerate.",
    ],
  }),
);

additions.push(
  recipe({
    category: "Stocks & Sauces",
    pages: [236, 237],
    title: "Veal Stock",
    yield: "About 2 quarts",
    ingredientSections: [
      {
        heading: "Stock",
        lines: [
          "10 pounds veal bones, necks, and backs",
          "1 calf's foot, split (optional)",
          "24 quarts cold water",
          "Scant 2 cups (1 pound) tomato paste",
          "1 pound tomatoes, cut into 1-inch pieces (2½ cups)",
        ],
      },
      {
        heading: "Aromatics",
        lines: [
          "2½ cups (12 ounces) carrots, cut into 1-inch mirepoix",
          "4 cups (1 pound) leeks, cut into 1-inch mirepoix, white and some light green parts only",
          "1½ cups (8 ounces) onions, cut into 1-inch mirepoix",
          "1 head garlic, halved and broken into pieces, root end and excess skin removed",
          "1½ ounces Italian parsley sprigs",
          "½ ounce thyme sprigs",
          "2 bay leaves",
        ],
      },
    ],
    methodSections: [
      {
        heading: "Blanch and make Veal #1",
        steps: [
          "Rinse the bones and calf's foot. Cover with cold water, bring slowly to a simmer while skimming, then immediately drain and rinse the hot bones and pot.",
          "Return the bones with 12 quarts cold water. Bring slowly to a simmer for 1 to 1½ hours, skimming continuously.",
          "Stir in the tomato paste, aromatics, and tomatoes. Simmer for 4 hours, skimming often.",
          "Strain without pressing. Reserve the bones and aromatics; rapidly cool the 8 to 10 quarts liquid.",
        ],
      },
      {
        heading: "Veal #2 and reduction",
        steps: [
          "Return the bones and aromatics with the remaining 12 quarts water. Bring slowly to a simmer and cook 4 hours, skimming.",
          "Strain twice without pressing and rapidly cool the second 8 to 10 quarts liquid.",
          "Combine both liquids. Bring slowly to a simmer and reduce for 6 to 8 hours, until about 2 quarts remain with a rich brown color and sauce-like consistency.",
          "Refrigerate for several days or freeze in smaller containers.",
        ],
      },
    ],
  }),
  recipe({
    category: "Stocks & Sauces",
    pages: [237],
    title: "White Veal Stock",
    yield: "3 quarts",
    ingredientSections: [
      { heading: "Stock", lines: ["10 pounds veal bones, necks, and backs", "1 calf's foot, split (optional)", "10 quarts cold water"] },
      {
        heading: "Aromatics",
        lines: [
          "4 cups (1 pound) leeks, cut into 1-inch mirepoix, white and some light green parts only",
          "3 cups (1 pound) onions, cut into 1-inch mirepoix",
          "½ ounce Italian parsley sprigs",
          "2 bay leaves",
          "5 sprigs thyme",
        ],
      },
    ],
    methods: [
      "Rinse the bones and foot. Cover generously with cold water, bring slowly to a simmer while skimming, then immediately drain.",
      "Rinse the hot bones until smooth and the water runs clear. Clean the pot and return the bones.",
      "Add the 10 quarts cold water, bring slowly to a simmer, and skim frequently.",
      "Add the aromatics and simmer for 4 hours, continuing to skim.",
      "Rest for 10 minutes, then ladle through a fine-mesh strainer without disturbing the sediment.",
      "Cool rapidly in an ice-water bath. Refrigerate for 1 to 2 days or freeze.",
    ],
  }),
  recipe({
    category: "Stocks & Sauces",
    pages: [238],
    title: "Lamb Stock",
    yield: "3 quarts",
    ingredientSections: [
      {
        heading: "Stock",
        lines: [
          "10 pounds lamb bones, cut into small pieces",
          "½ cup canola oil",
          "1 calf's foot, split (optional)",
          "10 quarts cold water",
          "Scant 2 cups tomato paste",
          "1 pound tomatoes, cut into 1-inch pieces (2½ cups)",
        ],
      },
      {
        heading: "Aromatics",
        lines: [
          "2½ cups (12 ounces) carrots, cut into 1-inch mirepoix",
          "4 cups (1 pound) leeks, cut into 1-inch mirepoix, white and some light green parts only",
          "1½ cups (8 ounces) onions, cut into 1-inch mirepoix",
          "1 head garlic, halved and broken into pieces, root end and excess skin removed",
          "1½ ounces Italian parsley sprigs",
          "½ ounce thyme sprigs",
          "2 bay leaves",
        ],
      },
    ],
    methods: [
      "Heat the oven to 400°F. Coat the bones with oil and roast in one layer for about 1½ hours, stirring occasionally, until deep brown. Do not roast the calf's foot.",
      "Transfer to a stockpot. Deglaze the pan with enough water to cover its bottom and add the glaze.",
      "Add the foot and cold water. Bring slowly to a simmer and skim.",
      "Add the aromatics, tomato paste, and tomatoes. Simmer for 5 hours.",
      "Ladle from the top, discard the bones, strain without pressing, and reduce to 3 quarts if needed. Refrigerate or freeze.",
    ],
  }),
  recipe({
    category: "Stocks & Sauces",
    pages: [239],
    title: "Duck Stock",
    yield: "2 cups",
    ingredientSections: [
      {
        heading: "Stock",
        lines: [
          "5 pounds duck bones, cut into 2- to 3-inch pieces",
          "½ cup canola oil",
          "1 pound duck feet (optional)",
          "6 quarts cold water",
          "¾ cup tomato paste",
          "1 pound tomatoes, cut into 1-inch pieces (2½ cups)",
        ],
      },
      {
        heading: "Aromatics",
        lines: [
          "1¾ cups (8 ounces) carrots, cut into 1-inch mirepoix",
          "2 cups (8 ounces) leeks, cut into 1-inch mirepoix, white and some light green parts only",
          "1½ cups (8 ounces) onions, cut into 1-inch pieces",
          "1 ounce Italian parsley sprigs",
        ],
      },
    ],
    methods: [
      "Heat the oven to 425°F. Rinse and dry the bones, coat with oil, and roast in one layer for about 1½ hours, removing liquid and fat as it accumulates, until deep red-brown. Do not roast the feet.",
      "Transfer to a stockpot. Reduce the pan liquid to a glaze, deglaze with water, and add it.",
      "Add the feet and cold water, bring slowly to a simmer, and skim. Add the aromatics, paste, and tomatoes and simmer for 4 hours.",
      "Strain through a colander, a China cap, and a fine-mesh strainer without pressing.",
      "Reduce the approximately 3 quarts stock slowly to 2 cups. Refrigerate or freeze.",
    ],
  }),
  recipe({
    category: "Stocks & Sauces",
    pages: [240],
    title: "Venison Stock",
    yield: "3 quarts",
    ingredientSections: [
      {
        heading: "Stock",
        lines: [
          "10 pounds venison bones",
          "½ cup canola oil",
          "14 quarts cold water",
          "1 pound tomatoes, cut into 1-inch pieces (2½ cups)",
          "Scant 2 cups tomato paste",
        ],
      },
      {
        heading: "Aromatics",
        lines: [
          "1 head garlic, halved and broken into pieces, root end and excess skin removed",
          "2½ cups (12 ounces) carrots, cut into 1-inch mirepoix",
          "4 cups (1 pound) leeks, cut into 1-inch mirepoix, white and some light green parts only",
          "1½ cups (8 ounces) onions, cut into 1-inch mirepoix",
          "1½ ounces Italian parsley sprigs",
          "½ ounce thyme sprigs",
          "2 bay leaves",
        ],
      },
    ],
    methods: [
      "Heat the oven to 425°F. Roast the oiled bones in one layer for about 1 hour 45 minutes, turning occasionally, until well browned.",
      "Transfer to a large stockpot. Deglaze the roasting pan with about 1 cup water and add the glaze.",
      "Add the cold water, aromatics, tomatoes, and tomato paste. Bring to a simmer and cook for 5 hours.",
      "Ladle and strain without disturbing the sediment. Chill, remove the fat, reduce to 3 quarts, and strain again. Refrigerate or freeze.",
    ],
  }),
  recipe({
    category: "Stocks & Sauces",
    pages: [240, 241],
    title: "Chicken Stock",
    yield: "About 6 quarts",
    ingredientSections: [
      { heading: "Stock", lines: ["5 pounds chicken bones, necks, and backs", "1 pound chicken feet (optional)", "4 quarts cold water", "2 quarts ice cubes"] },
      {
        heading: "Aromatics",
        lines: [
          "1¾ cups (8 ounces) carrots, cut into 1-inch mirepoix",
          "2 heaping cups (8 ounces) leeks, cut into 1-inch mirepoix, white and some light green parts only",
          "1½ cups (8 ounces) onions, cut into 1-inch mirepoix",
          "1 bay leaf",
        ],
      },
    ],
    methods: [
      "Rinse the bones, necks, backs, and feet thoroughly, removing visible blood and any attached organs.",
      "Cover with cold water in a 14- to 16-quart pot. Bring slowly to a simmer, skimming continuously.",
      "At a simmer, add the ice, remove the congealed fat, and skim again.",
      "Add the aromatics, return slowly to a simmer, and cook for 30 to 40 minutes, skimming often.",
      "Rest for 10 minutes, then ladle through a fine-mesh strainer without disturbing the sediment. Cool rapidly and refrigerate or freeze.",
    ],
  }),
  recipe({
    category: "Stocks & Sauces",
    pages: [241],
    title: "Mushroom Stock",
    yield: "3 cups",
    ingredients: [
      "1 pound button mushrooms, washed and sliced",
      "1 cup sliced carrots",
      "1 cup sliced leeks",
      "1 cup sliced onions",
      "½ cup Italian parsley sprigs",
      "¼ cup canola oil",
      "½ teaspoon curry powder",
      "1 bay leaf",
      "1 large sprig thyme",
      "4 quarts water",
    ],
    methods: [
      "Finely grind the mushrooms, carrots, leeks, onions, and parsley separately in a food processor.",
      "Heat the oil. Add the vegetables and curry powder and cook for 2 minutes.",
      "Add the bay leaf, thyme, and 2 quarts water. Simmer for 45 minutes.",
      "Strain while pressing the solids. Return the vegetables with the remaining 2 quarts water, simmer 45 minutes, and strain again.",
      "Combine both batches and reduce to 3 cups. Refrigerate for up to 2 days or freeze for up to 6 months.",
    ],
  }),
  recipe({
    category: "Stocks & Sauces",
    pages: [241],
    title: "Vegetable Stock",
    yield: "3 to 4 quarts",
    ingredients: [
      "1½ pounds leeks (1 large bunch; white part only), well washed and coarsely chopped (about 4½ cups)",
      "1 pound carrots, peeled and coarsely chopped (about 3 cups)",
      "1½ pounds (about 2) Spanish onions, coarsely chopped (about 4½ cups)",
      "1 small fennel bulb, trimmed and coarsely chopped",
      "¼ cup canola oil",
      "2 bay leaves",
      "2 sprigs thyme",
      "2 ounces (1 large bunch) Italian parsley",
      "3 to 4 quarts water",
    ],
    methods: [
      "Chop all the vegetables in a food processor.",
      "Cook them in the canola oil over low heat for 5 to 8 minutes, until softened.",
      "Add the bay leaves, thyme, parsley, and enough water to cover. Bring to a gentle simmer, skim frequently, and cook for 45 minutes.",
      "Strain through a fine-mesh strainer. Refrigerate for 1 to 2 days or freeze.",
    ],
  }),
  recipe({
    category: "Stocks & Sauces",
    pages: [242, 243],
    title: "\"Quick\" Sauces",
    yield: "About ¾ cup",
    ingredientSections: [
      {
        heading: "Master sauce",
        lines: [
          "½ cup canola oil",
          "1½ pounds bones, chopped into 1-inch pieces",
          "3 cups water",
          "2½ cups strained Chicken Stock, or water",
          "1 cup (5 to 6 ounces) onions, cut into ½-inch mirepoix",
          "1 cup (4 ounces) leeks, cut into ½-inch mirepoix, white and light green parts only",
          "1 cup (5 ounces) carrots, cut into ½-inch mirepoix",
          "2 cups strained Veal Stock; or 1 cup Veal Stock plus 1 cup matching venison, duck, or lamb stock",
        ],
      },
      {
        heading: "Variations",
        lines: [
          "Squab sauce: ½ teaspoon Squab Spice",
          "Venison sauce: 2 cups huckleberries, fresh or frozen",
          "Lamb sauce: ¼ ounce thyme sprigs, 1 cup chopped tomatoes, and 2 medium garlic cloves, crushed",
          "Vinegar sauce: ¾ cup Banyuls, sherry, white wine, or red wine vinegar",
          "Sweet-and-sour sauce: ¾ cup Banyuls, sherry, white wine, or red wine vinegar, plus ¼ cup plus 2 tablespoons sugar or honey",
        ],
      },
    ],
    methodSections: [
      {
        heading: "Master sauce",
        steps: [
          "Heat the oil over high heat in a wide, heavy pot. Add the bones in one layer and sear without stirring for about 10 minutes. Turn and brown for about 10 minutes more.",
          "Deglaze with 1 cup water, scraping the pot, and reduce until dry and reglazed.",
          "Deglaze a second time with ½ cup Chicken Stock and reduce to a glaze.",
          "Add the vegetables for the third deglazing and cook until their moisture evaporates and they lightly caramelize. Add variation ingredients at this stage.",
          "Add the remaining 2 cups Chicken Stock, the Veal Stock or mixed stocks, and the remaining 2 cups water. Deglaze and transfer to a narrower pot.",
          "Simmer with the pot partially off the burner, skim often, and cook 30 to 45 minutes, until the liquid reaches the level of the bones.",
          "Strain twice without pressing. Reduce the approximately 2 cups liquid to about 1 cup and strain again.",
        ],
      },
      {
        heading: "Variation notes",
        steps: [
          "For squab sauce, add Squab Spice with the vegetables.",
          "For venison sauce, add huckleberries after the vegetables caramelize; let their juices evaporate and reglaze the pot.",
          "For lamb sauce, add thyme, tomatoes, and garlic after the vegetables caramelize; cook until their juices form a glaze.",
          "For vinegar or sweet-and-sour sauce, deglaze with the listed vinegar mixture after the vegetables caramelize and let it evaporate before continuing.",
        ],
      },
    ],
  }),
);

const powders = [
  {
    title: "Carrot Powder",
    page: 246,
    yield: "About 1 tablespoon",
    ingredients: ["½ cup very finely chopped carrots, or carrot pulp left after juicing"],
    methods: [
      "Squeeze or blot the carrots to remove excess moisture.",
      "Spread thinly on a parchment-lined microwave tray. Microwave on low for about 40 minutes, until completely dry.",
      "Cool, grind to a powder, and store covered.",
    ],
  },
  {
    title: "Citrus Powder",
    page: 246,
    yield: "1 generous tablespoon",
    ingredients: ["¼ cup julienned orange zest", "¼ cup julienned lime zest", "¼ cup julienned lemon zest"],
    methods: [
      "Cover each zest separately with cold water, bring to a boil, and drain. Repeat twice more.",
      "Dry and spread in one layer, without mixing, on a parchment-lined microwave tray.",
      "Microwave at medium power for 8 to 10 minutes, removing any zest that dries early.",
      "Grind together until fine, sift, and store sealed.",
    ],
  },
  {
    title: "Mushroom Powder",
    page: 246,
    yield: "About 1 tablespoon",
    ingredients: ["5 shiitake mushrooms (1 ounce), stems removed"],
    methods: [
      "Slice paper-thin and arrange in one layer on a parchment-lined microwave tray.",
      "Microwave on medium for about 10 minutes, until fully dry but not brown.",
      "Cool and grind to the texture of coarsely ground black pepper. Store covered.",
    ],
  },
  {
    title: "Onion Powder",
    page: 246,
    yield: "About 1 tablespoon",
    ingredients: ["½ cup finely minced red onion"],
    methods: [
      "Spread thinly on a parchment-lined microwave tray.",
      "Microwave on medium for about 20 minutes, until completely dry. Cool.",
      "Grind to flakes resembling kosher salt and store covered.",
    ],
  },
  {
    title: "Tomato Powder",
    page: 247,
    yield: "About 1 tablespoon",
    ingredients: ["½ cup finely chopped tomato pulp from a peeled and seeded tomato"],
    methods: [
      "Squeeze the pulp to remove excess moisture.",
      "Spread thinly on a parchment-lined microwave tray. Microwave on low for 30 to 40 minutes, until dry but still colorful.",
      "Cool, grind as finely as possible, sift, and store covered.",
    ],
  },
  {
    title: "Beet Powder",
    page: 247,
    yield: "About 1 tablespoon",
    ingredients: ["½ cup finely chopped beet, or beet pulp left after juicing"],
    methods: [
      "Blot the beet pulp and spread it thinly on a parchment-lined microwave tray.",
      "Microwave on low for 30 to 40 minutes, until dry but still colorful.",
      "Cool, grind to a powder, and store covered.",
    ],
  },
  {
    title: "Mustard Powder",
    page: 247,
    yield: "About 1 tablespoon",
    ingredients: ["1 tablespoon black mustard seeds", "1 tablespoon yellow mustard seeds"],
    methods: ["Grind both seeds to a fine powder.", "Sift through a fine-mesh strainer and store covered."],
  },
  {
    title: "Fennel Powder",
    page: 247,
    yield: "About 1 tablespoon",
    ingredients: ["2 tablespoons fennel seeds"],
    methods: ["Toast over low heat until fragrant.", "Grind finely, sift, and store covered."],
  },
  {
    title: "Dried Horseradish",
    page: 247,
    yield: "About 1 generous tablespoon",
    ingredients: ["¼ cup shredded fresh horseradish"],
    methods: [
      "Drain on paper towels and spread the shreds apart on a parchment-lined microwave tray.",
      "Microwave on low for 12 to 15 minutes, until completely dry. Cool and store covered.",
    ],
  },
  {
    title: "Squab Spice",
    page: 247,
    yield: "About ⅓ cup",
    ingredients: [
      "¼ stick cinnamon, broken into small pieces",
      "1 tablespoon coriander seeds",
      "1½ teaspoons cloves",
      "2 tablespoons quatre épices (four-spice powder)",
      "2 tablespoons black peppercorns",
    ],
    methods: [
      "Toast the cinnamon, coriander, cloves, and quatre épices over low heat until fragrant.",
      "Finely grind with the black pepper.",
      "Sift and store sealed at room temperature, or freeze for longer storage.",
    ],
  },
];

additions.push(...powders.map((powder) => recipe({
  category: "Powders",
  pages: [powder.page],
  title: powder.title,
  yield: powder.yield,
  ingredients: powder.ingredients,
  methods: powder.methods,
})));

const book = JSON.parse(fs.readFileSync(bookPath, "utf8"));
const additionIds = new Set(additions.map((entry) => entry.id));
book.recipes = [
  ...book.recipes.filter((entry) => !additionIds.has(entry.id)),
  ...additions,
].sort((a, b) => {
  const pageDifference = Math.min(...a.sourcePages) - Math.min(...b.sourcePages);
  return pageDifference || a.title.localeCompare(b.title);
});
book.categories = ["Canapés", "First Course", "Fish", "Meat", "Stocks & Sauces", "Powders", "Cheese", "Dessert"];
book.description = "The complete recipe collection from The French Laundry Cookbook, including the course recipes, pasta and butter foundations, infused oils, stocks, sauces, and powders. Profiles and purveyor stories are omitted.";
book.recipeCountLabel = `${book.recipes.length} recipes`;
fs.writeFileSync(bookPath, `${JSON.stringify(book)}\n`);

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const catalogEntry = catalog.find((entry) => entry.id === book.id);
if (!catalogEntry) throw new Error(`Catalog entry missing for ${book.id}`);
Object.assign(catalogEntry, {
  categories: book.categories,
  description: book.description,
  recipeCountLabel: book.recipeCountLabel,
});
fs.writeFileSync(catalogPath, `${JSON.stringify(catalog)}\n`);

const searchIndex = JSON.parse(fs.readFileSync(searchPath, "utf8"));
const replacementEntries = book.recipes.map((entry) => ({
  bookId: book.id,
  bookTitle: book.title,
  category: entry.category,
  id: entry.id,
  sourcePages: entry.sourcePages,
  title: entry.title,
}));
const firstBookIndex = searchIndex.findIndex((entry) => entry.bookId === book.id);
const remainingEntries = searchIndex.filter((entry) => entry.bookId !== book.id);
remainingEntries.splice(firstBookIndex < 0 ? remainingEntries.length : firstBookIndex, 0, ...replacementEntries);
fs.writeFileSync(searchPath, `${JSON.stringify(remainingEntries)}\n`);

console.log(`Updated ${book.title}: ${book.recipes.length} recipes across ${book.categories.length} sections.`);
