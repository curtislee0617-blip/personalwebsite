import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const sourcePath = process.argv[2] ?? "/tmp/instagram-saved-grid.json";
const recipeDataPath = path.join(projectRoot, "data", "instagram-saved-recipes.ts");
const outputPath = path.join(projectRoot, "data", "instagram-saved-reel-analysis.ts");

const gridEntries = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const recipeDataSource = fs.readFileSync(recipeDataPath, "utf8");
const recipeDataMatch = recipeDataSource.match(
  /export const instagramSavedRecipes: RecipeCardEntry\[\] = (\[[\s\S]*\]);\s*$/,
);

if (!recipeDataMatch) {
  throw new Error("Could not parse data/instagram-saved-recipes.ts");
}

const recipeEntries = JSON.parse(recipeDataMatch[1]);
const recipeByPostId = new Map(recipeEntries.map((entry) => [entry.instagramPostId, entry]));

const amountPattern =
  /(?:^|[\s(])(?:\d+(?:[.,]\d+)?|[¼½¾⅓⅔⅛⅜⅝⅞]|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:g|kg|mg|ml|cl|l|oz|lb|lbs|tsp|tbsp|tablespoons?|teaspoons?|cups?|cans?|cloves?|stalks?|sprigs?|pieces?|whole|drops?|dashes?|pinch(?:es)?|handfuls?|bottles?|pods?|slices?|eggs?|onions?|lemons?|limes?|minutes?|mins?|hours?|hrs?|°\s*[cf]|degrees?\s*(?:celsius|fahrenheit)|celsius|fahrenheit)\b/i;
const leadingAmountPattern =
  /^(?:[-–—•*]\s*)?(?:(?:\d+(?:[.,]\d+)?|\d+\s*\/\s*\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b|[¼½¾⅓⅔⅛⅜⅝⅞])/i;
const ingredientHeaderPattern =
  /^(?:the\s+)?(?:ingredients?|recipe|what i used(?: for \d+ servings?)?|you(?:'|’)ll need|you will need|for the .+|seasoning|spices?|garnish|salad|sauce|dressing|marinade|paste|aromatics?|topping|ganache|cream|cordial|foam|syrup|water|cocktail|drink|dough|filling|base|glaze|batter|stock|broth|stuffing|crème|creme|recette|ingredienti|ingrédients?|材料|食材|配料|香料|調味料|酱汁|醬汁|소스|재료)\s*:?\s*$/i;
const methodHeaderPattern =
  /^(?:the\s+)?(?:method|directions?|instructions?|steps?|process|procedure|preparation|before you start|how (?:i|to) (?:made|make|did|do) it|assembly|to assemble|to serve|做法|步骤|製作步驟|制作步骤|方法|조리법|만드는 법)\s*:?\s*$/i;
const actionPattern =
  /^(?:[-–—•*]\s*)?(?:add|allow|assemble|bake|beat|blend|boil|brown|build|chill|chop|combine|cook|cool|cover|cut|debone|develop|divide|drain|dress|fold|form|fry|garnish|grate|heat|infuse|knead|layer|let|marinate|melt|mix|place|plate|poach|pour|preheat|proof|reduce|remove|render|reserve|rest|roast|roll|sauté|saute|seal|season|serve|shake|shape|simmer|slice|soak|spread|sprinkle|steam|steep|stir|strain|temper|toast|top|transfer|whip|whisk|wipe|wrap)\b/i;
const socialPattern =
  /^(?:#|@|➡️|_{3,}|follow\b|save\b|comment\b|credit\b|source\b|track id\b|music\b|full (?:recipe|text)\b|link in bio\b|check also\b|what do you\b|how do you\b|let me know\b|tag\b|la suite en\b|process is as follows\b)/i;
const recipeCuePattern =
  /\b(?:ingredients?|recipe|method|directions?|instructions?|steps?|grams?|ingredienti|ingrédients?|recette|材料|食材|配料|食譜|做法|步骤|製作步驟|레시피)\b/i;
const numberedStepPattern = /^(?:\d+\s*[.)-]\s+|[1-9]️⃣\s*)/;

function cleanLine(value) {
  return value
    .replace(/\p{Cf}/gu, "")
    .replace(/\u2028/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/^[\s.·]+|[\s]+$/g, "")
    .replace(/^[-–—•*]\s*/, "")
    .trim();
}

function stripHashtags(value) {
  return value.replace(/(?:^|\s)#[\p{L}\p{N}_.-]+/gu, "").trim();
}

function isMethodLine(line) {
  const clean = cleanLine(line).replace(numberedStepPattern, "");
  return actionPattern.test(clean);
}

function isIngredientLine(line, ingredientMode = false) {
  const clean = cleanLine(line);
  if (/^[-_=—–]{3,}$/.test(clean)) return false;
  if (!clean || methodHeaderPattern.test(clean) || socialPattern.test(clean) || isMethodLine(clean)) return false;
  if (numberedStepPattern.test(clean)) return false;
  if (clean.length > 180 && !leadingAmountPattern.test(clean)) return false;
  if (amountPattern.test(clean) || leadingAmountPattern.test(clean)) return true;
  if (!ingredientMode) return false;
  if (clean.length > 120 || /[.!?]$/.test(clean)) return false;
  return !/^(?:serves?|makes?|difficulty|time|temp|temperature)\b/i.test(clean);
}

function looksLikeIngredientHeading(lines, index) {
  const rawLine = cleanLine(lines[index] ?? "");
  const line = rawLine.replace(/:$/, "");
  if (!line || line.length > 72 || methodHeaderPattern.test(line) || actionPattern.test(line)) return false;
  if (amountPattern.test(line) || leadingAmountPattern.test(line)) return false;
  if (ingredientHeaderPattern.test(`${line}:`)) return true;
  if (!rawLine.endsWith(":")) return false;

  let ingredientFollowers = 0;
  for (let offset = 1; offset <= 4; offset += 1) {
    const follower = cleanLine(lines[index + offset] ?? "");
    if (!follower) continue;
    if (isIngredientLine(follower)) ingredientFollowers += 1;
  }
  return ingredientFollowers >= 2;
}

function extractIngredientGroups(caption) {
  const lines = caption.replace(/\u2028/g, "\n").split(/\n/);
  const groups = [];
  let current = { title: "Ingredients", items: [] };
  let ingredientMode = false;

  const flush = () => {
    if (current.items.length > 0) {
      groups.push({
        title: current.title,
        items: [...new Set(current.items)],
      });
    }
  };

  for (let index = 1; index < lines.length; index += 1) {
    const line = cleanLine(lines[index]);
    if (!line) continue;
    if (socialPattern.test(line)) {
      ingredientMode = false;
      continue;
    }
    if (methodHeaderPattern.test(line) || numberedStepPattern.test(line) || isMethodLine(line)) {
      ingredientMode = false;
      continue;
    }
    if (looksLikeIngredientHeading(lines, index)) {
      flush();
      current = { title: line.replace(/:$/, "").trim() || "Ingredients", items: [] };
      ingredientMode = true;
      continue;
    }
    if (isIngredientLine(line, ingredientMode)) {
      const item = stripHashtags(line);
      if (item) current.items.push(item);
      ingredientMode = true;
    } else if (ingredientMode && line.length > 120) {
      ingredientMode = false;
    }
  }

  flush();
  return groups
    .map((group) => ({
      ...group,
      title: /^(?:ingredient|recipe)s?$/i.test(group.title) ? "Ingredients" : group.title,
    }))
    .filter((group) => group.items.length > 0);
}

function extractMethodGroups(caption) {
  const normalizedCaption = caption.replace(/\u2028/g, "\n");
  const captionLines = normalizedCaption.split(/\n/);
  const ingredientHeadingTexts = new Set(
    captionLines
      .map((line, index) => (looksLikeIngredientHeading(captionLines, index) ? cleanLine(line) : ""))
      .filter(Boolean),
  );
  const paragraphs = caption
    .replace(/\u2028/g, "\n")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const groups = [];
  let current = { title: "Method", steps: [] };
  let methodMode = false;

  const flush = () => {
    if (current.steps.length > 0) {
      groups.push({
        title: current.title,
        steps: [...new Set(current.steps)],
      });
    }
  };

  for (let index = 0; index < paragraphs.length; index += 1) {
    const paragraph = paragraphs[index].trim();
    const paragraphLines = paragraph.split(/\n/).map(cleanLine).filter(Boolean);
    const singleLine = cleanLine(paragraphLines.join(" "));
    if (!singleLine || socialPattern.test(singleLine)) {
      methodMode = false;
      continue;
    }
    const headerLineIndex = paragraphLines.findIndex((line) => methodHeaderPattern.test(line));
    if (headerLineIndex >= 0) {
      flush();
      current = {
        title: paragraphLines[headerLineIndex].replace(/:$/, "").trim() || "Method",
        steps: [],
      };
      methodMode = true;
      const afterHeader = paragraphLines.slice(headerLineIndex + 1);
      if (afterHeader.length > 0) {
        const numberedAfterHeader = afterHeader
          .filter((line) => numberedStepPattern.test(line))
          .map((line) => line.replace(numberedStepPattern, "").trim());
        current.steps.push(...(numberedAfterHeader.length > 0 ? numberedAfterHeader : afterHeader));
      }
      continue;
    }

    const numberedLines = paragraphLines
      .filter((line) => numberedStepPattern.test(line))
      .map((line) => line.replace(numberedStepPattern, "").trim())
      .filter(Boolean);
    if (numberedLines.length > 0) {
      current.steps.push(...numberedLines);
      methodMode = true;
      continue;
    }

    if (methodMode) {
      if (paragraphLines.some((line) => ingredientHeadingTexts.has(line))) {
        methodMode = false;
        continue;
      }
      const lines = paragraphLines.filter((line) => line && !socialPattern.test(line));
      if (lines.length > 0) current.steps.push(...lines);
      continue;
    }

    const cleanParagraph = stripHashtags(paragraph.replace(/\s*\n\s*/g, " ").trim());
    if (isMethodLine(cleanParagraph)) {
      current.steps.push(cleanParagraph.replace(/^[-–—•*]\s*/, ""));
    }
  }

  flush();
  return groups.filter((group) => group.steps.length > 0);
}

function countItems(groups, key) {
  return groups.reduce((total, group) => total + group[key].length, 0);
}

function looksLikeMisplacedMethod(item) {
  return (
    isMethodLine(item) ||
    (item.length > 90 &&
      /\b(?:add|air fry|brown|caramelize|coat|cook|microwave|reduce|serve|sweat|toast|let sit)\b/i.test(
        item,
      ))
  );
}

function cleanMethodGroups(groups) {
  return groups
    .map((group) => ({
      ...group,
      steps: group.steps
        .map((step) =>
          stripHashtags(step)
            .replace(/\s*(?:Be sure to follow|Follow us|Check also).+$/i, "")
            .trim(),
        )
        .filter((step) => step && !socialPattern.test(step)),
    }))
    .filter((group) => group.steps.length > 0);
}

const analyses = {};

for (const gridEntry of gridEntries) {
  const postId = gridEntry.href.split("/").filter(Boolean).at(-1);
  const existing = recipeByPostId.get(postId);
  if (!existing) continue;

  const caption = gridEntry.alt?.trim() ?? "";
  const hasRecipeCue = recipeCuePattern.test(caption) || amountPattern.test(caption);
  if (!hasRecipeCue) continue;

  const extractedIngredients = extractIngredientGroups(caption);
  const extractedMethods = extractMethodGroups(caption);
  const existingIngredientCount = countItems(existing.ingredientGroups ?? [], "items");
  const extractedIngredientCount = countItems(extractedIngredients, "items");

  const captionHasIngredientHeader = caption
    .split(/\n/)
    .map(cleanLine)
    .some((line) => ingredientHeaderPattern.test(line));
  const cleanExistingIngredients = (existing.ingredientGroups ?? [])
    .map((group) => ({
      ...group,
      items: group.items
        .flatMap((item) => item.replace(/\u2028/g, "\n").split(/\n/))
        .map(cleanLine)
        .filter((item) => isIngredientLine(item, true)),
    }))
    .filter((group) => group.items.length > 0);
  let ingredientGroups =
    extractedIngredientCount > 0 &&
    (captionHasIngredientHeader || existingIngredientCount === 0 || extractedIngredientCount >= existingIngredientCount * 0.7)
      ? extractedIngredients
      : cleanExistingIngredients;
  let methodGroups =
    countItems(extractedMethods, "steps") > 0 ? extractedMethods : existing.methodGroups ?? [];

  const misplacedMethodSteps = ingredientGroups.flatMap((group) =>
    group.items.filter(looksLikeMisplacedMethod),
  );
  ingredientGroups = ingredientGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          !looksLikeMisplacedMethod(item) &&
          !socialPattern.test(item) &&
          !(item.length > 180 && !/^(?:\d|[¼½¾⅓⅔⅛⅜⅝⅞])/.test(item)),
      ),
    }))
    .filter((group) => group.items.length > 0);
  if (misplacedMethodSteps.length > 0) {
    if (methodGroups.length === 0) {
      methodGroups = [{ title: "Method", steps: misplacedMethodSteps }];
    } else {
      methodGroups[0] = {
        ...methodGroups[0],
        steps: [...new Set([...methodGroups[0].steps, ...misplacedMethodSteps])],
      };
    }
  }
  methodGroups = cleanMethodGroups(methodGroups);

  if (ingredientGroups.length === 0 && methodGroups.length === 0) continue;

  analyses[existing.recipeKey] = {
    description:
      "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    ingredientGroups,
    methodGroups,
  };
}

Object.assign(analyses, {
  "instagram-saved-DHJ65LJh6UX": {
    title: "Phở Gà (Vietnamese Chicken Pho)",
    description:
      "A light, aromatic family-style Vietnamese chicken pho, transcribed from the creator’s reel caption. The caption publishes the process but not exact quantities, so adjust the seasoning to taste and open the original post for the creator’s complete presentation.",
    ingredientGroups: [
      {
        title: "Chicken broth",
        items: [
          "1 whole chicken",
          "Onions",
          "Shallots",
          "Fresh ginger",
          "Salt",
          "Rock sugar",
          "Star anise",
          "Cinnamon",
          "Coriander seeds",
          "Cloves",
          "Mushroom seasoning",
          "MSG",
          "Fish sauce",
        ],
      },
      {
        title: "To serve",
        items: [
          "Rice vermicelli noodles",
          "Fresh herbs",
          "Freshly ground black pepper",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Method",
        steps: [
          "Char the onions, shallots, and ginger until deeply aromatic.",
          "Simmer the whole chicken with the charred aromatics, salt, and rock sugar for 1 hour, skimming away any impurities.",
          "Toast the star anise, cinnamon, coriander seeds, and cloves. Add them to the broth with mushroom seasoning, MSG, and fish sauce.",
          "Strain the broth and shred the cooked chicken.",
          "Divide the vermicelli between bowls, add the chicken, and pour over the hot broth. Finish with fresh herbs and black pepper.",
        ],
      },
    ],
  },
  "instagram-saved-DCEVL8JIgvm": {
    title: "Toasted Coconut Foam",
    description:
      "A siphon foam transcribed from the creator’s reel caption, originally served over milky oolong iced tea. Observe the manufacturer’s siphon-safety instructions and never open a pressurized siphon.",
    ingredientGroups: [
      {
        title: "Coconut infusion",
        items: [
          "50 g coconut",
          "300 ml water",
        ],
      },
      {
        title: "Foam",
        items: [
          "100 ml whole milk",
          "70 ml cream",
          "50 g icing sugar",
          "1.3 g salt",
          "1.3 g methylcellulose",
          "0.15 g xanthan gum",
          "1 N₂O siphon charger",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Method",
        steps: [
          "Roast the coconut until fragrant and lightly toasted.",
          "Combine the toasted coconut with the water and infuse in the refrigerator for 48 hours, then strain.",
          "Add the milk and cream to the strained coconut infusion.",
          "Blend in the icing sugar, salt, methylcellulose, and xanthan gum until completely smooth.",
          "Transfer to a cream siphon, charge with N₂O according to the siphon manufacturer’s instructions, and chill before dispensing.",
        ],
      },
    ],
  },
  "instagram-saved-DKH7n5hIBt7": {
    title: "Duck Wellington",
    description:
      "The reel caption publishes the finished Wellington components and baking instructions, but not the complete assembly formula. The information below is therefore kept as a partial recipe and service note rather than reconstructed.",
    ingredientGroups: [
      {
        title: "Published components",
        items: [
          "Prepared duck Wellington, wrapped in spinach and chicken-truffle mousseline",
          "Egg wash, as needed",
          "Onion and port jus, to serve",
          "Gruyère AOP, potato, and guanciale croquette, to serve",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Baking",
        steps: [
          "Preheat the oven to 200°C / 392°F with a baking tray inside.",
          "Brush the Wellington with two coatings of egg wash.",
          "Transfer to the preheated tray and bake for 20–28 minutes.",
          "Rest for 15 minutes, then slice and trim the edges. One duck portion yields two generous servings, or three smaller portions.",
        ],
      },
    ],
  },
  "instagram-saved-DTkImh-E0Ns": {
    title: "Pasta alla Nerano",
    description:
      "A Korean creator’s deeply browned, nutty variation of pasta alla Nerano, translated and structured from the reel caption. The creator notes that the classic version is usually lighter and emphasizes zucchini’s sweetness.",
    ingredientGroups: [
      {
        title: "For 2 servings",
        items: [
          "Spaghetti, enough for 2 servings",
          "1–2 Korean zucchini (or regular zucchini)",
          "40 g aged Gouda, finely grated",
          "40 g Parmigiano Reggiano, finely grated",
          "1 garlic clove, crushed",
          "10 g unsalted butter",
          "A generous handful of basil leaves, stems reserved",
          "Olive oil",
          "Neutral oil, for frying",
          "Salt",
          "Freshly ground black pepper",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Method",
        steps: [
          "Slice the zucchini 2–3 mm thick. Fry until deep golden, or lightly charred for the creator’s more bitter and nutty version.",
          "Drain the zucchini on paper towels, then refrigerate for at least 2 hours. This concentrates its sweetness and gives it a pleasantly chewy texture.",
          "Finely grate and combine the Gouda and Parmigiano so they melt smoothly into the pasta water.",
          "Warm olive oil with the basil stems and crushed garlic. Once fragrant, remove and discard the aromatics.",
          "Add about 70% of the fried zucchini and a ladle of pasta water. Simmer while gently mashing the zucchini into a sauce.",
          "Add the cooked spaghetti, the remaining zucchini, and basil leaves. Toss vigorously to emulsify, adding the butter and salt to taste.",
          "Turn off the heat. Add the grated cheeses and toss quickly until they melt with the pasta water into a creamy sauce. Garnish with the reserved zucchini.",
        ],
      },
    ],
  },
  "instagram-saved-DYRlQ4QMt0v": {
    title: "Striped Bass with Saffron Beurre Blanc and Fried Zucchini Flowers",
    description:
      "Translated from the creator’s French reel caption. The original post calls the fish “bar rayé” and serves it with saffron beurre blanc, salmon roe, and a very light sparkling-water batter.",
    ingredientGroups: [
      {
        title: "Fish",
        items: [
          "1 fine striped-bass fillet",
          "Butter, for basting",
          "Salt, to taste",
        ],
      },
      {
        title: "Saffron beurre blanc",
        items: [
          "About 100 ml white wine",
          "About 150 ml water",
          "A generous pinch of saffron",
          "Thyme",
          "Rosemary",
          "Lemon juice, to taste",
          "About 150 g cold butter, cubed",
          "1 tbsp salmon roe",
        ],
      },
      {
        title: "Fried zucchini flowers",
        items: [
          "3 zucchini flowers",
          "Flour, as needed",
          "Very cold sparkling water, as needed",
          "Vegetable oil, for frying",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Saffron beurre blanc",
        steps: [
          "Combine the saffron, water, white wine, a little lemon juice, thyme, and rosemary in a small pan. Reduce by two-thirds at a gentle simmer.",
          "Strain and return the reduction to the pan over low heat. Whisk in the cold butter a few cubes at a time. Turn off the heat before adding the last of the butter, then continue whisking until emulsified.",
          "Fold in the salmon roe, adjust the seasoning, and serve immediately.",
        ],
      },
      {
        title: "Zucchini flowers and fish",
        steps: [
          "Mix flour with enough very cold sparkling water to make a thin batter. Remove the pistils from the zucchini flowers, dip them briefly in the batter, and fry at 170°C until lightly golden and crisp.",
          "Sear the bass skin-side down in a hot pan. Turn as needed and baste with foaming butter until just cooked.",
          "Plate the fish with the saffron beurre blanc and fried zucchini flowers.",
        ],
      },
    ],
  },
  "instagram-saved-DaPxwU7COXS": {
    title: "Japanese European-Style Beef Curry",
    description:
      "A detailed Japanese European-style curry formula translated from the creator’s Cantonese caption. The caption supplies a long spice blend and the final simmering times, but only brief process notes.",
    ingredientGroups: [
      {
        title: "Beef and curry base — 5 to 6 servings",
        items: [
          "600 g Japanese wagyu short ribs",
          "20 g vegetable oil",
          "100 g carrot",
          "15 g garlic",
          "30 g Japanese leek",
          "500 g red wine",
          "100 g onion (about 1/2 onion; optionally caramelized first)",
          "20 g butter",
          "100 g tomato (about 1/2 tomato)",
        ],
      },
      {
        title: "Spice blend",
        items: [
          "2 g turmeric",
          "2 g cayenne pepper",
          "8 g ground cumin",
          "4 g ground coriander",
          "0.2 g dried dill",
          "0.2 g dried tarragon",
          "0.2 g dried oregano",
          "0.2 g dried sage",
          "0.2 g dried rosemary",
          "0.2 g dried thyme",
          "0.2 g dried basil",
          "0.2 g dill seed",
          "0.2 g marjoram",
          "0.25 g licorice",
          "0.25 g clove",
          "0.5 g Kampot white pepper",
          "0.5 g Malabar black pepper",
          "0.25 g allspice",
          "0.25 g savory",
          "0.25 g fenugreek",
          "0.25 g mace",
          "0.25 g caraway",
          "0.25 g fennel",
          "0.25 g poppy seed",
          "0.5 g star anise",
          "0.25 g nutmeg",
          "0.25 g green cardamom",
          "0.25 g Indian bay-leaf powder",
          "0.25 g dried mandarin peel",
          "0.25 g celery seed",
          "0.25 g mustard seed",
          "0.25 g lemongrass",
          "0.25 g Ceylon cinnamon",
          "0.25 g fennel pollen",
          "5 g black garlic (about 1 clove)",
        ],
      },
      {
        title: "To finish",
        items: [
          "15 g flour (optionally toasted until light brown)",
          "800 g beef stock",
          "20 g dark chocolate",
          "15 g honey or maple syrup",
          "30 g apple purée",
          "30 g espresso",
          "15 g fruit jam",
          "3 g salt",
          "120 g light cream, optional for a cream curry",
          "20 g light cream, optional for plating",
        ],
      },
      {
        title: "Beef stock note",
        items: [
          "1.2 kg beef bones",
          "3.5 L water",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Published method",
        steps: [
          "For the beef stock, blanch the beef bones, add the water, and simmer for 4–6 hours, reducing to about 1.2 L.",
          "The caption suggests caramelizing the onion and toasting the flour to a light brown before adding them, if desired.",
          "Combine the curry base, spice blend, stock, and finishing ingredients except the beef and optional cream. Simmer gently for 1 hour.",
          "Add the beef and simmer gently for 1–1.5 hours, until the mixture reaches a sauce-like consistency.",
          "For a cream curry, add the 120 g cream at the end. Use the remaining cream for plating if desired.",
        ],
      },
    ],
  },
  "instagram-saved-DVqNFy7Ecr4": {
    title: "Kau Kee-Style Clear Beef Brisket Noodles (九記清湯牛腩)",
    description:
      "A Cantonese clear beef-brisket soup inspired by Hong Kong’s Kau Kee, translated from the creator’s reel caption. The herbs are grouped by the seasons suggested in the caption; research their suitability before using medicinal herbs.",
    ingredientGroups: [
      {
        title: "Beef broth — 6 servings",
        items: [
          "1.8 kg beef bones",
          "1.2 kg beef brisket",
          "5.2 L distilled or mineral water, preferably soft water",
          "15 g rock sugar",
          "20 g salt, or about 1% of the finished broth weight",
          "10 g Vietnamese fish sauce, or about 0.5% of the finished broth weight",
        ],
      },
      {
        title: "Spice sachet",
        items: [
          "1 g red Sichuan peppercorns",
          "1 g green Sichuan peppercorns",
          "3 g star anise",
          "3 g cassia bark",
          "1 g bay leaf",
          "3 g white cardamom",
          "3 g licorice root",
          "2 g tsaoko (black cardamom)",
          "3 g dried mandarin peel",
          "5 g red dates",
          "3 g xiang guo (Chinese aromatic spice)",
          "3 g goji berries",
        ],
      },
      {
        title: "Optional seasonal herbs",
        items: [
          "Spring: 1 g astragalus root",
          "Summer: 2 g Solomon’s seal, 1 g chuanxiong rhizome, and 1 g amomum fruit",
          "Autumn/winter: 3 g dried longan, 1 g Chinese angelica, 2 g Chinese yam, 1 g codonopsis root, 2 g angelica dahurica, 1 g sand ginger, and 1 g costus root",
        ],
      },
      {
        title: "Aromatic soy sauce",
        items: [
          "35 g light soy sauce",
          "35 g dark soy sauce",
          "35 g water",
          "4 g Maggi seasoning",
          "3 g white sugar",
          "25 g Chinese slab sugar",
          "3 g rock sugar",
          "5 g shallot",
          "5 g scallion",
          "1 g coriander",
        ],
      },
      {
        title: "For each bowl",
        items: [
          "60 g yi mein noodles",
          "200 g cooked brisket",
          "Aromatic soy sauce, to taste",
          "2 g butter",
          "200 g clear beef broth",
          "Sliced scallion, to finish",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Method",
        steps: [
          "Simmer the beef bones in 5.2 L water for 6 hours, reducing the liquid to about 2.8 L.",
          "Add the spice and herb sachet, beef brisket, and rock sugar. Simmer gently for another 2 hours, reducing to about 2 L.",
          "Turn off the heat, cover, and leave to infuse for 4 hours.",
          "Bring the broth back to a boil and season with the salt and fish sauce.",
          "Cook the noodles and assemble each bowl with brisket, aromatic soy sauce, butter, hot broth, and scallion.",
        ],
      },
    ],
  },
  "instagram-saved-DHLE8qmI4m9": {
    title: "Iraqi Dolma (دولمة عراقية)",
    description:
      "An Iraqi mixed-vegetable dolma formula transcribed from the creator’s bilingual Arabic and English caption. The caption publishes the ingredients but not the cooking procedure.",
    ingredientGroups: [
      {
        title: "Vegetables",
        items: [
          "5 large onions",
          "60 Swiss chard leaves",
          "50 vine leaves",
          "12 zucchini",
          "12 small eggplants",
        ],
      },
      {
        title: "Lamb and rice stuffing",
        items: [
          "600 g hand-chopped lamb, about 30% fat",
          "150 g lamb fat",
          "6 cups medium-grain rice, washed and soaked",
          "3 tomatoes, finely chopped",
          "1 onion, finely chopped",
          "6 garlic cloves",
          "1 1/2 cups dill",
          "1/2 cup reserved zucchini and eggplant flesh",
          "8 tbsp pomegranate molasses",
          "6 tbsp tamarind paste",
          "6 tbsp tomato paste",
          "8 tbsp olive oil",
          "3 tsp onion powder",
          "3 tsp garlic powder",
          "1 1/2 tbsp stock powder",
          "Salt and black pepper",
        ],
      },
      {
        title: "Pot base",
        items: [
          "Lamb chops, as needed",
          "Green broad beans, as needed",
        ],
      },
      {
        title: "Cooking sauce",
        items: [
          "1 1/2 cups water",
          "6 tbsp tomato paste",
          "7 tbsp tamarind paste",
          "6 tbsp pomegranate molasses",
          "1 tbsp sugar",
          "1 1/2 tbsp stock powder",
          "Salt and black pepper",
        ],
      },
    ],
    methodGroups: [],
  },
  "instagram-saved-DC16bsDoCBg": {
    title: "Extra-Creamy Vanilla Flan Pâtissier",
    description:
      "Translated from the creator’s French reel caption. This tall flan uses a puff-pastry shell and a cream-enriched vanilla custard; the caption notes that its pastry-shell method follows Muriel Aublet-Cuvelier’s YouTube recipe.",
    ingredientGroups: [
      {
        title: "For a 14 cm × 6 cm ring",
        items: [
          "500 g puff pastry",
          "Butter, for the ring",
          "Baking parchment",
          "Dried lentils or baking weights",
        ],
      },
      {
        title: "Vanilla custard",
        items: [
          "400 g whole milk",
          "240 g whipping cream, 35% fat",
          "2 eggs (120 g)",
          "90 g sugar",
          "20 g cornstarch",
          "1 vanilla bean",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Puff-pastry shell",
        steps: [
          "Roll the puff pastry 5 mm thick and cut a strip 6.5 cm wide and 46 cm long. For a higher custard-to-pastry ratio, roll it 3 mm thick. Chill the strip.",
          "Roll another piece 3 mm thick and use the ring to cut a base disc.",
          "Butter the inside of the ring and line it with parchment. Fit in the pastry strip, trim it, add the base, and seal the join with a water-moistened finger.",
          "Line with an oven-safe roasting bag or parchment and fill with dried lentils to 1 cm below the rim. Bake in a 160°C fan oven for about 50 minutes. If needed, remove the weights and bake for another 10–15 minutes.",
        ],
      },
      {
        title: "Custard and final bake",
        steps: [
          "Heat the milk, cream, and split and scraped vanilla bean over medium heat until the mixture begins to simmer.",
          "Whisk the eggs and sugar by hand for 1 minute without aerating them until pale. Add the cornstarch and whisk for another minute.",
          "Whisk the hot dairy into the egg mixture in three additions. Return everything to the saucepan and cook over medium heat, whisking constantly, for about 2 minutes. It should be thicker than crème anglaise but looser than pastry cream.",
          "Blend with an immersion blender until perfectly smooth, skim away the bubbles, and pour into the baked pastry shell.",
          "Refrigerate for 2 hours, then bake in a 210°C fan oven for about 25 minutes.",
        ],
      },
    ],
  },
  "instagram-saved-DPIDiGhD75i": {
    title: "Bánh Cuốn Hải Phòng",
    description:
      "A Hải Phòng-style steamed rice-roll batter, pork filling, and sweet fish-sauce formula transcribed from the creator’s bilingual Vietnamese and English caption.",
    ingredientGroups: [
      {
        title: "Rice-roll batter",
        items: [
          "1 cup rice flour",
          "1/2 cup tapioca starch",
          "1/2 cup potato starch",
          "2 cups cold water",
          "1 cup warm water, plus 1 cup more after resting",
          "1 cup hot water",
          "1 tsp salt",
          "2 tbsp shallot oil",
        ],
      },
      {
        title: "Pork filling",
        items: [
          "300 g minced pork",
          "Shallots, finely chopped, to taste",
          "20 g wood-ear mushrooms, finely chopped",
        ],
      },
      {
        title: "Fish sauce",
        items: [
          "1 tbsp caramelized sugar",
          "500 ml water or bone broth",
          "3 tbsp sugar",
          "4 tbsp fish sauce",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Published preparation",
        steps: [
          "Mix the rice flour, tapioca starch, potato starch, cold water, first measure of warm water, and hot water. Rest for 30 minutes.",
          "Pour off 1 cup of liquid and replace it with 1 cup fresh warm water. Stir in the salt and shallot oil.",
          "Stir-fry the minced pork with shallots until the meat firms up. Add the wood-ear mushrooms and cook through.",
          "Combine the caramelized sugar, water or bone broth, sugar, and fish sauce for the dipping sauce.",
          "The caption does not publish the steaming and rolling procedure; open the original reel for the visual technique.",
        ],
      },
    ],
  },
  "instagram-saved-DROz7DEEkvL": {
    title: "Eggplant Purée",
    description:
      "A flexible eggplant purée for pasta, soup, or sauces, translated from the creator’s Korean reel caption. The caption publishes the compact formula but leaves the visual cooking technique to the reel.",
    ingredientGroups: [
      {
        title: "Ingredients",
        items: [
          "3 eggplants",
          "100 g olive oil",
          "3 garlic cloves",
          "50 g lemon juice",
        ],
      },
    ],
    methodGroups: [],
  },
  "instagram-saved-DON3azNCC82": {
    title: "Spanish Rice with Ibérico Pork, Mushrooms, and Foie Gras",
    description:
      "A three-person Spanish rice dish translated from the creator’s reel caption, made with secreto ibérico, mixed mushrooms, Pedro Ximénez, saffron, and grated frozen foie gras.",
    ingredientGroups: [
      {
        title: "For 3 servings in a 46 cm paella pan",
        items: [
          "300 g secreto ibérico",
          "1 tray mixed fresh mushrooms",
          "Frozen foie gras mi-cuit, for grating",
          "1 red onion, finely chopped",
          "2 ripe pear tomatoes, grated or finely chopped",
          "1 tsp pimentón de la Vera",
          "100 ml Pedro Ximénez sherry",
          "300 g Albufera rice",
          "1.2 L roasted chicken stock",
          "Saffron infusion, to taste",
          "60 g extra-virgin olive oil",
          "Salt, to taste",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Method",
        steps: [
          "Sauté the secreto ibérico until lightly browned but not fully cooked, then reserve.",
          "Sauté the mushrooms and reserve them separately.",
          "Sweat the red onion, add the tomatoes, and cook until reduced.",
          "Stir in the pimentón briefly, then add the Pedro Ximénez and cook off the alcohol.",
          "Toast the rice in the sofrito, then return the pork and mushrooms to the pan.",
          "Pour in the hot roasted chicken stock and add the saffron infusion.",
          "Cook without disturbing for 16–17 minutes, or until the rice is done and the liquid has been absorbed.",
          "Finish by grating the frozen foie gras mi-cuit over the rice.",
        ],
      },
    ],
  },
  "instagram-saved-C1ezQQaMhgH": {
    title: "30-Minute Coffee Amaro",
    description:
      "James Hoffmann’s rapid coffee amaro, reconstructed from the saved reel and checked against his complete published formula. The reel’s automatic subtitles incorrectly call Vietnamese cassia bark ‘cassava’; the ingredient below uses the corrected name.",
    ingredientGroups: [
      {
        title: "Coffee infusion",
        items: [
          "200 g bourbon",
          "40 g coffee, ground close to espresso-fine",
          "55 g whole milk",
        ],
      },
      {
        title: "Botanicals",
        items: [
          "1.5 g dried bitter orange peel",
          "1.5 g gentian root",
          "0.5 g freshly grated Vietnamese cassia bark",
          "0.5 g freshly grated nutmeg",
          "1 allspice berry, crushed",
          "0.5 g Madagascan vanilla pod, minced",
        ],
      },
      {
        title: "To finish",
        items: [
          "60 g demerara sugar syrup, made with 2 parts sugar to 1 part water",
          "Saline solution, made with 20 g salt and 80 g water",
          "Ice, to serve",
          "Orange zest, optional garnish",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Coffee infusion and clarification",
        steps: [
          "Add the bourbon and ground coffee to a cream whipper and swirl to combine.",
          "Charge with one nitrous-oxide cartridge and wait 4–5 minutes.",
          "Rapidly release the pressure, then strain the coffee-infused bourbon through a fine sieve.",
          "Pour the whole milk into a separate container. Stir constantly while pouring in the coffee-infused bourbon.",
          "Leave for 5 minutes, or refrigerate for up to 2 hours, then pass through a sieve lined with a paper filter to clarify.",
        ],
      },
      {
        title: "Botanical infusion",
        steps: [
          "Return the clarified liquid to the cleaned cream whipper and add the bitter orange peel, gentian root, cassia bark, nutmeg, crushed allspice berry, and minced vanilla pod.",
          "Charge and immediately release one cartridge, then charge with a second cartridge.",
          "Infuse for 5 minutes, or up to 30 minutes for a stronger result. Release the pressure and strain through a paper filter.",
          "Stir in the demerara sugar syrup and bottle the finished amaro.",
          "Serve a measure over a large ice cube with a couple of drops of saline and an optional strip of orange zest. Alternatively, serve 1 part amaro with 3 parts good tonic water over ice.",
        ],
      },
    ],
  },
  "instagram-saved-DX6P-4YMZeH": {
    title: "Nori Cream Soba with Nori-Dressed Mussels",
    description:
      "A seaweed-forward soba dish transcribed from Dirty Korean’s bilingual caption and creator recipe comment. The post publishes the nori-dressing ratio; the quantity for the separate smooth nori cream is not stated.",
    ingredientGroups: [
      {
        title: "Nori dressing",
        items: [
          "1 egg yolk",
          "1/2 spoon nori crumble, as published",
          "50 g vinegar",
          "100 g oil",
          "Sugar, to taste",
          "Salt, to taste",
        ],
      },
      {
        title: "To assemble",
        items: [
          "Cooked soba noodles",
          "Soy sauce, to season the noodles",
          "Smooth nori cream",
          "Cooked mussels",
          "Perilla leaf sprouts",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Method",
        steps: [
          "Whisk the egg yolk with the nori crumble and vinegar, then slowly emulsify in the oil. Season the dressing with sugar and salt to taste.",
          "Season the cooked soba lightly with soy sauce and arrange it in a bowl.",
          "Spoon the smooth nori cream over the noodles.",
          "Dress the mussels with the nori dressing, arrange them over the soba, and finish with perilla leaf sprouts.",
          "The creator does not publish the separate nori-cream formula in the caption or visible comments; use the original reel for that visual component.",
        ],
      },
    ],
  },
  "instagram-saved-DV5gDinkr0e": {
    title: "Nori Carbonara Ramen",
    description:
      "Dirty Korean’s seaweed carbonara ramen, transcribed from the reel’s creator comment. The comment supplies the ingredient weights and clarifies that the leaves are perilla rather than sesame leaves.",
    ingredientGroups: [
      {
        title: "For 1 serving",
        items: [
          "3 egg yolks",
          "100 g Parmesan",
          "50 g perilla leaves",
          "40 g nori powder",
          "100 g bacon",
          "1 serving ramen noodles",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Method reconstructed from the reel",
        steps: [
          "Cook the bacon until browned and crisp, then reserve it.",
          "Cook the ramen noodles and reserve a little of their hot cooking water.",
          "Combine the egg yolks, Parmesan, perilla leaves, and nori powder into the carbonara base.",
          "Away from direct heat, toss the hot ramen with the carbonara base, loosening it with reserved cooking water until glossy and creamy.",
          "Fold through or finish with the bacon and serve immediately.",
        ],
      },
    ],
  },
  "instagram-saved-DXhVjsRuKRc": {
    title: "Goldtropfentorte (Tränenkuchen / Gold Drop Cake)",
    description:
      "Christina Dynamite’s German ‘cake that cries,’ transcribed from the complete recipe she posted in the comments. Golden droplets naturally form across the meringue as the chilled cake rests overnight.",
    ingredientGroups: [
      {
        title: "Crust",
        items: [
          "200 g flour",
          "75 g sugar",
          "75 g cold butter",
          "1 egg",
          "1 tsp baking powder",
          "Pinch of salt",
        ],
      },
      {
        title: "Filling",
        items: [
          "750 g Greek yogurt, 5% fat",
          "150 g sugar",
          "3 egg yolks",
          "2 packets vanilla pudding powder",
          "1 packet vanilla sugar",
          "Juice of 1/2 lemon",
          "150 ml avocado oil",
          "500 ml milk",
        ],
      },
      {
        title: "Meringue",
        items: ["3 egg whites", "100 g sugar"],
      },
    ],
    methodGroups: [
      {
        title: "Method",
        steps: [
          "Mix the crust ingredients, press into the base and sides of a parchment-lined 26 cm springform pan, and chill.",
          "Mix the filling ingredients until smooth and pour over the chilled crust.",
          "Bake on the middle rack at 180°C with conventional top and bottom heat for 45–50 minutes. The centre should remain slightly jiggly.",
          "Ten minutes before the cake finishes baking, whip the egg whites while gradually adding the sugar; continue to stiff peaks.",
          "Spread the meringue evenly over the cake and bake for another 15–20 minutes, until lightly golden.",
          "Gently poke holes across the meringue, return the cake to the switched-off oven with its door slightly open, and rest for about 15 minutes.",
          "Cool completely at room temperature, then cover and refrigerate overnight so the characteristic golden droplets form.",
        ],
      },
    ],
  },
  "instagram-saved-DTXHsATk657": {
    title: "Chả Giò Rế with Langoustine and Prawn",
    description:
      "Khanh Ong and Oishimate’s crisp Vietnamese-style laced spring rolls, transcribed from the complete creator recipe posted in the reel comments.",
    ingredientGroups: [
      {
        title: "Laced wrappers",
        items: [
          "500 g rice flour",
          "50 g tapioca starch",
          "50 g plain flour",
          "130 g caster sugar",
          "1 egg white",
          "2 tsp vegetable oil",
          "About 500 ml water",
          "Spray oil",
        ],
      },
      {
        title: "Filling",
        items: [
          "300 g fatty pork mince",
          "25 g dried wood-ear mushrooms, rehydrated and finely chopped",
          "25 g dried vermicelli, rehydrated and chopped",
          "200 g taro, grated",
          "100 g sweet potato, grated",
          "100 g carrot, grated",
          "3 spring onions, green parts only, finely chopped",
          "50 g Asian shallots, finely chopped",
          "1 egg yolk",
          "1 tsp chicken stock powder",
          "1 tsp salt",
          "1 tsp white pepper",
          "2 tsp caster sugar",
          "12 green prawns, peeled with tails left on",
        ],
      },
      {
        title: "To serve",
        items: ["Butter lettuce", "Fresh herbs", "Nước chấm"],
      },
    ],
    methodGroups: [
      {
        title: "Method",
        steps: [
          "Clean an empty food tin and drill small holes around its base from the inside out so the batter can flow evenly.",
          "Whisk all the wrapper ingredients into a thin, pourable batter.",
          "Heat a lightly oiled non-stick pan over medium heat. Fill the perforated tin with batter and drizzle it in circles to form a fine laced wrapper. Cook for 20–30 seconds until just set without flipping, then stack under a tea towel.",
          "Mix all the filling ingredients except the prawns until evenly combined.",
          "Place a wrapper lumpy-side down, spoon filling across the lower half, add a prawn, fold in the sides, and roll tightly. Seal with water.",
          "Deep-fry at 170°C for 3–4 minutes, until light golden and crisp.",
          "Cut diagonally and serve with butter lettuce, herbs, and nước chấm.",
        ],
      },
    ],
  },
  "instagram-saved-DSeXUABiFrA": {
    title: "Mom’s Egg Curry",
    description:
      "Bhukkad in Town’s family egg curry, transcribed from the complete creator recipe in the reel comments. Its roasted onion-and-coconut masala is slowly cooked in mustard oil before the boiled eggs are added.",
    ingredientGroups: [
      {
        title: "Ingredients",
        items: [
          "6 boiled eggs, halved at the end",
          "3 medium onions, sliced",
          "Desiccated or grated coconut, about one-quarter the quantity of the onions",
          "6–7 garlic cloves",
          "1 inch fresh ginger",
          "1 tsp cumin seeds",
          "1 tbsp coriander seeds",
          "1 small piece cinnamon",
          "1–2 green cardamom pods",
          "2 green chillies",
          "Tomatoes, the same quantity as the onions, puréed",
          "Mustard oil",
          "Red chilli powder, to taste",
          "Ground coriander, to taste",
          "Ground cumin, to taste",
          "Ground turmeric, to taste",
          "Garam masala or meat masala, to taste",
          "Salt, to taste",
          "Water, as required",
          "Fresh coriander, to garnish",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Method",
        steps: [
          "Dry-roast the sliced onions on a hot tawa without oil until deep brown.",
          "Add the coconut, mix, switch off the heat, and let it brown in the residual warmth.",
          "Cool slightly, then grind the onion and coconut with the garlic, ginger, cumin seeds, coriander seeds, cinnamon, cardamom, and green chillies into a smooth paste.",
          "Heat mustard oil in a pan. Add the paste and bhuno, stirring and frying, until the oil begins to release.",
          "Add the tomato purée, red chilli powder, ground coriander, ground cumin, turmeric, and salt.",
          "Cover and cook over low heat for 5 minutes, then uncover and bhuno again until the oil separates.",
          "Add enough water for the desired gravy consistency and season with garam masala or meat masala. Bring to a boil.",
          "Add the halved boiled eggs and simmer for 2–3 minutes.",
          "Garnish with fresh coriander and serve hot with phulka or rice.",
        ],
      },
    ],
  },
  "instagram-saved-DWuPBMJCTop": {
    title: "Slow-Roasted Leg of Lamb with Balsamic Glaze",
    description:
      "A very low-temperature leg of lamb with a sharp balsamic glaze and crisp fried herbs and spices, transcribed from the creator’s reel caption.",
    ingredientGroups: [
      {
        title: "Lamb",
        items: [
          "1 bone-in leg of lamb",
          "80 g mustard powder",
          "20 g salt",
          "10 g black pepper",
        ],
      },
      {
        title: "Balsamic glaze",
        items: [
          "Reserved lamb juices",
          "300 ml balsamic vinegar",
        ],
      },
      {
        title: "Crisp garnish",
        items: [
          "30 g yellow mustard seeds",
          "30 g caraway seeds",
          "About 2 cups mint leaves",
          "About 2 cups parsley leaves",
          "Neutral oil, for deep-frying",
          "Salt, to taste",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Slow roast",
        steps: [
          "Cut around the shank and score the lamb’s fat cap.",
          "Combine the mustard powder, salt, and black pepper. Sift the rub over the lamb and work it into the scored meat.",
          "Wrap the lamb tightly in foil and set it in a roasting tray.",
          "Cook in a 60°C / 140°F oven until the centre reaches 57°C / 135°F, about 12–24 hours. The longer cook produces more tender meat.",
          "Remove the lamb and strain the roasting juices into a saucepan.",
        ],
      },
      {
        title: "Glaze, garnish, and finish",
        steps: [
          "Add the balsamic vinegar to the lamb juices and reduce by about two-thirds, until the glaze coats a spoon.",
          "Heat the frying oil to 150°C / 300°F. Fry the mustard seeds, caraway seeds, mint, and parsley until dry and the bubbling stops, then drain.",
          "Increase the oven to 260°C / 500°F. Roast the lamb for 5–10 minutes, until browned and crisp.",
          "Season to taste, coat with the warm balsamic glaze, and finish generously with the crisp seeds and herbs.",
        ],
      },
    ],
  },
  "instagram-saved-DR1uig_jP8u": {
    ...analyses["instagram-saved-DR1uig_jP8u"],
    title: "Creamy Cauliflower Ramen",
    description:
      "Roasted cauliflower blended with silken tofu, miso, soy, coconut milk, and vegetable stock into a creamy plant-based ramen broth, transcribed from the creator’s reel caption.",
    methodGroups: analyses["instagram-saved-DR1uig_jP8u"]?.methodGroups?.map((group) => ({
      ...group,
      title: "Method",
    })) ?? [],
  },
});

const output = `import type { RecipeCardEntry } from "@/lib/recipe-card-types";

type InstagramSavedRecipeAnalysis = Partial<
  Pick<RecipeCardEntry, "title" | "description" | "ingredientGroups" | "methodGroups">
>;

// Structured from the full captions visible in Curtis's signed-in Instagram Saved · Food collection.
// Entries without published quantities or directions remain inspiration cards rather than inferred recipes.
export const instagramSavedReelAnalysis: Record<string, InstagramSavedRecipeAnalysis> = ${JSON.stringify(
  analyses,
  null,
  2,
)};
`;

fs.writeFileSync(outputPath, output);

const values = Object.values(analyses);
console.log(
  JSON.stringify(
    {
      sourcePosts: gridEntries.length,
      analyzedRecipes: values.length,
      recipesWithIngredients: values.filter((entry) => entry.ingredientGroups?.length).length,
      recipesWithMethods: values.filter((entry) => entry.methodGroups?.length).length,
      ingredientItems: values.reduce(
        (total, entry) => total + countItems(entry.ingredientGroups ?? [], "items"),
        0,
      ),
      methodSteps: values.reduce(
        (total, entry) => total + countItems(entry.methodGroups ?? [], "steps"),
        0,
      ),
      outputPath,
    },
    null,
    2,
  ),
);
