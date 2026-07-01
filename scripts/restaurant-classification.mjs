export const categoryEmojis = {
  Bars: "🥂",
  "Asian Fancy": "🍵",
  "Fine Dining": "🍷",
  "Western Nicer": "🍽️",
  Bakeries: "🍞",
  Tacos: "🌮",
  Burgers: "🍔",
  Chicken: "🍗",
  Ramen: "🍜",
  Sushi: "🍣",
  "Dim Sum": "🥟",
  Pizza: "🍕",
  Pasta: "🍝",
  Steakhouse: "🥩",
  Bistro: "🥘",
  Barbecue: "🍖",
  Deli: "🥓",
  Cafés: "☕",
  Desserts: "🍰",
  "South Asian": "🍛",
  "East Asian": "🥢",
  "Southeast Asian": "🌶️",
  "Middle Eastern": "🧆",
  African: "🍲",
  Casual: "🍴",
  Unclassified: "❓",
};

export const allCategories = Object.keys(categoryEmojis);

const categorySet = new Set(allCategories);
const specificPrimaryCategories = new Set([
  "Bars", "Bakeries", "Tacos", "Burgers", "Chicken", "Ramen", "Sushi", "Dim Sum",
  "Pizza", "Pasta", "Steakhouse", "Bistro", "Barbecue", "Deli", "Cafés", "Desserts",
]);
const broadCuisineCategories = new Set([
  "South Asian", "East Asian", "Southeast Asian", "Middle Eastern", "African",
]);
const styleCategories = new Set(["Asian Fancy", "Fine Dining", "Western Nicer", "Casual"]);

const typeCategories = new Map([
  ["bar", "Bars"], ["wine_bar", "Bars"], ["cocktail_bar", "Bars"], ["pub", "Bars"], ["night_club", "Bars"],
  ["bakery", "Bakeries"], ["taco_restaurant", "Tacos"], ["hamburger_restaurant", "Burgers"],
  ["chicken_restaurant", "Chicken"], ["ramen_restaurant", "Ramen"], ["sushi_restaurant", "Sushi"],
  ["dumpling_restaurant", "Dim Sum"], ["dim_sum_restaurant", "Dim Sum"], ["pizza_restaurant", "Pizza"], ["coffee_shop", "Cafés"],
  ["cafe", "Cafés"], ["steak_house", "Steakhouse"], ["barbecue_restaurant", "Barbecue"],
  ["deli", "Deli"], ["dessert_shop", "Desserts"], ["ice_cream_shop", "Desserts"],
  ["confectionery", "Desserts"], ["pastry_shop", "Desserts"],
  ["indian_restaurant", "South Asian"], ["pakistani_restaurant", "South Asian"],
  ["sri_lankan_restaurant", "South Asian"], ["bangladeshi_restaurant", "South Asian"],
  ["nepalese_restaurant", "South Asian"],
  ["chinese_restaurant", "East Asian"], ["japanese_restaurant", "East Asian"],
  ["korean_restaurant", "East Asian"], ["taiwanese_restaurant", "East Asian"],
  ["cantonese_restaurant", "East Asian"], ["yakiniku_restaurant", "East Asian"],
  ["udon_noodle_restaurant", "East Asian"],
  ["thai_restaurant", "Southeast Asian"], ["vietnamese_restaurant", "Southeast Asian"],
  ["indonesian_restaurant", "Southeast Asian"], ["malaysian_restaurant", "Southeast Asian"],
  ["filipino_restaurant", "Southeast Asian"],
  ["middle_eastern_restaurant", "Middle Eastern"], ["lebanese_restaurant", "Middle Eastern"],
  ["turkish_restaurant", "Middle Eastern"], ["persian_restaurant", "Middle Eastern"],
  ["falafel_restaurant", "Middle Eastern"], ["shawarma_restaurant", "Middle Eastern"],
  ["african_restaurant", "African"], ["ethiopian_restaurant", "African"], ["moroccan_restaurant", "African"],
]);

const venueSpecificRules = [
  ["Bars", /\b(cocktail bar|wine bar|speakeasy|taproom|pub)\b/i],
  ["Bakeries", /\b(bakery|bakehouse|boulangerie|bread|panaderia|viennoiserie)\b/i],
  ["Cafés", /\b(cafe|coffee|espresso|roastery|roasters|tea house|kissa)\b/i],
  ["Desserts", /\b(dessert|gelato|ice cream|patisserie|pastry|cake|chocolate|creamery)\b/i],
  ["Deli", /\b(deli|delicatessen|bodega|marketplace|quality meats|charcuterie)\b/i],
];

const dishSpecificRules = [
  ["Tacos", /\b(taco|tacos|taqueria|taquero|tlayuda|tlayudas|birria)\b/i],
  ["Burgers", /\b(burger|burgers|hamburger)\b/i],
  ["Chicken", /\b(chicken|poulet|poulette|rotisserie|yakitori|hainanese chicken)\b/i],
  ["Ramen", /\b(ramen|mazesoba|chuka soba|menya|tsukemen)\b/i],
  ["Sushi", /\b(sushi|sushiya|omakase|edomae)\b/i],
  ["Dim Sum", /\b(dim sum|dimsum|dumpling|dumplings|xiaolongbao|xiao long bao|har gow|siu mai|shumai|bao)\b/i],
  ["Pizza", /\b(pizza|pizzeria)\b/i],
  ["Pasta", /\b(pasta|pastificio|spaghetti|tagliatelle|rigatoni|ravioli)\b/i],
  ["Steakhouse", /\b(steakhouse|steak house|chophouse)\b/i],
  ["Barbecue", /\b(bbq|barbecue|barbeque|smokehouse)\b/i],
];

const cuisineRules = [
  ["South Asian", /\b(indian|india|pakistani|pakistan|bangladeshi|bangladesh|bengali|sri lankan|nepalese|nepali|punjabi|tandoor|tandoori|biryani|dosa|idli|chaat|masala|naan|kerala|goan)\b/i],
  ["Southeast Asian", /\b(thai|thailand|vietnamese|vietnam|pho|banh mi|malaysian|malaysia|indonesian|indonesia|filipino|philippines|nasi|laksa|lechon|pad thai)\b/i],
  ["Middle Eastern", /\b(middle eastern|lebanese|levantine|persian|iranian|turkish|falafel|shawarma|kebab|mezze|halal)\b/i],
  ["African", /\b(african|ethiopian|eritrean|moroccan|nigerian|ghanaian|senegalese)\b/i],
  ["East Asian", /\b(chinese|china|hong kong|cantonese|sichuan|szechuan|chengdu|taiwanese|taiwan|japanese|japan|izakaya|tempura|udon|soba|yakiniku|korean|korea|bibimbap)\b/i],
];

const westernTypeTokens = [
  "american_restaurant", "french_restaurant", "italian_restaurant", "spanish_restaurant",
  "mediterranean_restaurant", "californian_restaurant", "modern_european_restaurant",
  "continental_restaurant", "european_restaurant", "british_restaurant", "mexican_restaurant",
];

const genericPrimaryTypes = new Set([
  "", "restaurant", "brunch_restaurant", "vegetarian_restaurant", "family_restaurant",
  "diner", "meal_takeaway", "meal_delivery", "food_court", "asian_restaurant",
  "halal_restaurant", "breakfast_restaurant",
]);

const sourceListPriority = new Map([
  ["Fine dining", "Fine Dining"],
  ["Asian fancy", "Asian Fancy"],
  ["Western nicer", "Western Nicer"],
  ["Bars", "Bars"],
  ["Drinks", "Bars"],
  ["Coffee", "Cafés"],
  ["Dessert", "Desserts"],
  ["Casual", "Casual"],
]);

const broaderCuisineForCategory = new Map([
  ["Sushi", "East Asian"],
  ["Ramen", "East Asian"],
  ["Dim Sum", "East Asian"],
  ["Tacos", "Casual"],
  ["Burgers", "Casual"],
  ["Pizza", "Casual"],
  ["Pasta", "Casual"],
  ["Steakhouse", "Western Nicer"],
  ["Bistro", "Western Nicer"],
  ["Barbecue", "Casual"],
  ["Bakeries", "Cafés"],
  ["Deli", "Casual"],
]);

function normalizeName(value = "") {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[_–—-]+/g, " ").replace(/\s+/g, " ").trim();
}

function tokenizeTypes(primaryType = "", placeTypes = []) {
  return [primaryType, ...placeTypes].filter(Boolean);
}

function hasType(types, expected) {
  return types.includes(expected);
}

function hasAnyType(types, expected) {
  return expected.some((type) => types.includes(type));
}

function firstRuleMatch(name, rules) {
  for (const [category, pattern] of rules) {
    if (pattern.test(name)) {
      return { category, reason: `name keyword (${name.match(pattern)?.[0] ?? "match"})` };
    }
  }
  return null;
}

function inferredCuisineFromTypes(types) {
  for (const type of types) {
    const category = typeCategories.get(type);
    if (category && broadCuisineCategories.has(category)) {
      return { category, reason: `Google place type (${type})` };
    }
  }
  return null;
}

function inferredSpecificFromTypes(primaryType, types) {
  if (typeCategories.has(primaryType) && specificPrimaryCategories.has(typeCategories.get(primaryType))) {
    return { category: typeCategories.get(primaryType), reason: `primary Google place type (${primaryType})` };
  }

  for (const type of types) {
    const category = typeCategories.get(type);
    if (category && specificPrimaryCategories.has(category)) {
      return { category, reason: `Google place type (${type})` };
    }
  }

  return null;
}

function styleFromContext({ types, broadCuisine, specificCategory, sourceCategory, sourceLists, priceLevel }) {
  const manualSourceStyle = sourceLists.map((value) => sourceListPriority.get(value)).find((value) => styleCategories.has(value));

  if (sourceCategory === "Fine Dining" || manualSourceStyle === "Fine Dining") {
    return { category: "Fine Dining", reason: "manual fine-dining list" };
  }

  if (sourceCategory === "Asian Fancy" || manualSourceStyle === "Asian Fancy") {
    return { category: "Asian Fancy", reason: "manual Asian Fancy list" };
  }

  const hasFineDiningType = hasType(types, "fine_dining_restaurant");
  const isAsianCuisine = ["East Asian", "Southeast Asian", "South Asian"].includes(broadCuisine ?? "")
    || ["Sushi", "Ramen", "Dim Sum"].includes(specificCategory ?? "");

  if (hasFineDiningType) {
    return isAsianCuisine
      ? { category: "Asian Fancy", reason: "fine dining + Asian cuisine" }
      : { category: "Fine Dining", reason: "fine_dining_restaurant type" };
  }

  if (manualSourceStyle === "Western Nicer" || sourceCategory === "Western Nicer") {
    return { category: "Western Nicer", reason: "manual Western nicer list" };
  }

  const westernLean = westernTypeTokens.some((type) => types.includes(type));
  if (!specificCategory && westernLean && priceLevel >= 3) {
    return { category: "Western Nicer", reason: "higher-priced western restaurant" };
  }

  if (sourceCategory === "Casual" || manualSourceStyle === "Casual") {
    return { category: "Casual", reason: "manual casual list" };
  }

  return { category: "Casual", reason: "default broad restaurant style" };
}

function preferredSpecificCategory({ primaryType, types, normalizedName, sourceCategory }) {
  const byPrimaryType = inferredSpecificFromTypes(primaryType, [primaryType]);
  const byNameVenue = firstRuleMatch(normalizedName, venueSpecificRules);
  const byNameDish = firstRuleMatch(normalizedName, dishSpecificRules);
  const byAnyType = inferredSpecificFromTypes(primaryType, types);

  const bakeryCafeCombo = (byNameVenue?.category === "Bakeries" || byAnyType?.category === "Bakeries")
    && (hasAnyType(types, ["cafe", "coffee_shop", "tea_house"]) || /\b(cafe|coffee|tea)\b/i.test(normalizedName));

  const currentSpecific = specificPrimaryCategories.has(sourceCategory) ? sourceCategory : null;

  if (sourceCategory === "Asian Fancy") {
    if (byNameDish?.category === "Sushi" || byAnyType?.category === "Sushi") {
      return { category: "Sushi", reason: "sushi omakase promoted from Asian Fancy" };
    }
  }

  if (byNameVenue?.category === "Bakeries") {
    if (bakeryCafeCombo) return { category: "Bakeries", reason: "bakery-café naming and type cues" };
    return byNameVenue;
  }
  if (byNameDish) return byNameDish;
  if (byPrimaryType) return byPrimaryType;
  if (byNameVenue) {
    if (bakeryCafeCombo) return { category: "Bakeries", reason: "bakery-café naming and type cues" };
    return byNameVenue;
  }
  const canPromoteSecondaryVenueType = genericPrimaryTypes.has(primaryType)
    && !["Fine Dining", "Asian Fancy", "Western Nicer"].includes(sourceCategory);
  if (byAnyType && canPromoteSecondaryVenueType) return byAnyType;
  if (/\b(bistro|bistrot)\b/i.test(normalizedName) && ["Western Nicer", "Fine Dining", "Bistro"].includes(sourceCategory)) {
    return { category: "Bistro", reason: "bistro naming retained in western category" };
  }
  if (currentSpecific) return { category: currentSpecific, reason: "retained existing specific category" };
  return null;
}

function preferredBroadCuisine({ normalizedName, primaryType, types, sourceCategory }) {
  const currentBroad = broadCuisineCategories.has(sourceCategory) ? sourceCategory : null;
  const byName = firstRuleMatch(normalizedName, cuisineRules);

  if (byName) return byName;
  if (typeCategories.has(primaryType) && broadCuisineCategories.has(typeCategories.get(primaryType))) {
    return { category: typeCategories.get(primaryType), reason: `primary Google place type (${primaryType})` };
  }

  // Secondary Google types can be noisy (for example, a primarily American
  // restaurant may also carry a Turkish type). Only let secondary types set
  // the broad cuisine when Google has supplied a generic primary type.
  const byTypes = inferredCuisineFromTypes(types);
  if (byTypes && genericPrimaryTypes.has(primaryType)) return byTypes;
  if (currentBroad) return { category: currentBroad, reason: "retained existing cuisine category" };
  return null;
}

export function analyzeRestaurantCategories({
  name = "",
  primaryType = "",
  placeTypes = [],
  sourceCategory = "Unclassified",
  sourceLists = [],
  priceLevel = null,
  tags = [],
} = {}) {
  const normalizedName = normalizeName(name);
  const types = tokenizeTypes(primaryType, placeTypes);
  const specific = preferredSpecificCategory({ primaryType, types, normalizedName, sourceCategory });
  const broadCuisine = preferredBroadCuisine({ normalizedName, primaryType, types, sourceCategory });
  const style = styleFromContext({
    primaryType,
    types,
    broadCuisine: broadCuisine?.category ?? null,
    specificCategory: specific?.category ?? null,
    sourceCategory,
    sourceLists,
    priceLevel,
  });

  const manualSourceCategory = sourceListPriority.get(sourceLists[0] ?? "");
  let primaryCategory = specific?.category ?? null;

  if (!primaryCategory) {
    if (style.category === "Asian Fancy" && broadCuisine?.category) primaryCategory = "Asian Fancy";
    else if (style.category === "Fine Dining") primaryCategory = "Fine Dining";
    else if (broadCuisine?.category) primaryCategory = broadCuisine.category;
    else if (sourceCategory !== "Unclassified") primaryCategory = sourceCategory;
    else if (manualSourceCategory) primaryCategory = manualSourceCategory;
    else primaryCategory = style.category ?? "Casual";
  }

  const secondaryCategories = [];

  if (broadCuisine?.category && broadCuisine.category !== primaryCategory) secondaryCategories.push(broadCuisine.category);
  const broaderMapped = broaderCuisineForCategory.get(primaryCategory);
  if (broaderMapped && broaderMapped !== primaryCategory && categorySet.has(broaderMapped)) secondaryCategories.push(broaderMapped);
  if (style.category && style.category !== primaryCategory && (style.category !== "Casual" || primaryCategory === "Casual")) {
    secondaryCategories.push(style.category);
  }
  if (sourceCategory !== "Unclassified" && sourceCategory !== primaryCategory) secondaryCategories.push(sourceCategory);

  if (primaryCategory === "Bakeries" && !secondaryCategories.includes("Cafés")) secondaryCategories.push("Cafés");
  if (primaryCategory === "Sushi" && !secondaryCategories.includes("Asian Fancy")
    && (sourceCategory === "Asian Fancy" || sourceLists.includes("Asian fancy") || hasType(types, "fine_dining_restaurant"))) {
    secondaryCategories.push("Asian Fancy");
  }

  const existingNonCategoryTags = tags.filter((tag) => tag && !categorySet.has(tag));
  const mergedTags = Array.from(new Set([...secondaryCategories, ...existingNonCategoryTags]));

  const reasons = [specific?.reason, broadCuisine?.reason, style?.reason].filter(Boolean);
  const confidence = specific
    ? 0.94
    : broadCuisine
      ? 0.88
      : sourceCategory !== "Unclassified"
        ? 0.72
        : 0.56;

  return {
    primaryCategory,
    secondaryCategories: Array.from(new Set(secondaryCategories)),
    tags: mergedTags,
    emoji: categoryEmojis[primaryCategory] ?? "❓",
    confidence,
    reasons,
  };
}

export function suggestRestaurantCategory(input = {}) {
  const analysis = analyzeRestaurantCategories(input);
  return {
    category: analysis.primaryCategory,
    confidence: analysis.confidence,
    reason: analysis.reasons[0] ?? "layered category analysis",
  };
}

export { typeCategories };
