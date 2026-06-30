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
  Barbecue: "🌭",
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

const typeCategories = new Map([
  ["bar", "Bars"], ["wine_bar", "Bars"], ["cocktail_bar", "Bars"], ["pub", "Bars"],
  ["bakery", "Bakeries"], ["taco_restaurant", "Tacos"], ["hamburger_restaurant", "Burgers"],
  ["chicken_restaurant", "Chicken"], ["ramen_restaurant", "Ramen"], ["sushi_restaurant", "Sushi"],
  ["dumpling_restaurant", "Dim Sum"],
  ["pizza_restaurant", "Pizza"], ["cafe", "Cafés"], ["coffee_shop", "Cafés"],
  ["steak_house", "Steakhouse"],
  ["barbecue_restaurant", "Barbecue"], ["deli", "Deli"],
  ["dessert_shop", "Desserts"], ["ice_cream_shop", "Desserts"], ["confectionery", "Desserts"],
  ["pastry_shop", "Desserts"],
  ["indian_restaurant", "South Asian"], ["pakistani_restaurant", "South Asian"],
  ["sri_lankan_restaurant", "South Asian"], ["bangladeshi_restaurant", "South Asian"],
  ["nepalese_restaurant", "South Asian"],
  ["chinese_restaurant", "East Asian"], ["japanese_restaurant", "East Asian"],
  ["korean_restaurant", "East Asian"], ["taiwanese_restaurant", "East Asian"],
  ["cantonese_restaurant", "East Asian"], ["yakiniku_restaurant", "East Asian"],
  ["yakitori_restaurant", "Chicken"], ["udon_noodle_restaurant", "East Asian"],
  ["thai_restaurant", "Southeast Asian"], ["vietnamese_restaurant", "Southeast Asian"],
  ["indonesian_restaurant", "Southeast Asian"], ["malaysian_restaurant", "Southeast Asian"],
  ["filipino_restaurant", "Southeast Asian"],
  ["middle_eastern_restaurant", "Middle Eastern"], ["lebanese_restaurant", "Middle Eastern"],
  ["turkish_restaurant", "Middle Eastern"], ["persian_restaurant", "Middle Eastern"],
  ["falafel_restaurant", "Middle Eastern"], ["shawarma_restaurant", "Middle Eastern"],
  ["african_restaurant", "African"], ["ethiopian_restaurant", "African"],
  ["moroccan_restaurant", "African"],
]);

const nameRules = [
  ["Bakeries", /\b(bakery|bakehouse|boulangerie|bread|panaderia)\b/i],
  ["Tacos", /\b(taco|tacos|taqueria|taquero|tlayuda|tlayudas)\b/i],
  ["Burgers", /\b(burger|burgers|hamburger)\b/i],
  ["Chicken", /\b(chicken|poulet|poulette|rotisserie|yakitori)\b/i],
  ["Ramen", /\b(ramen|mazesoba|chuka soba|menya)\b/i],
  ["Sushi", /\b(sushi|sushiya|omakase)\b/i],
  ["Dim Sum", /\b(dim sum|dimsum|dumpling|dumplings|xiaolongbao|xiao long bao|har gow|siu mai|shumai|bao)\b/i],
  ["Pizza", /\b(pizza|pizzeria)\b/i],
  ["Pasta", /\b(pasta|pastificio|spaghetti|tagliatelle|rigatoni|ravioli)\b/i],
  ["Steakhouse", /\b(steakhouse|steak house|chophouse|steak)\b/i],
  ["Bistro", /\b(bistro|bistrot)\b/i],
  ["Barbecue", /\b(bbq|barbecue|barbeque|smokehouse)\b/i],
  ["Deli", /\b(deli|delicatessen|bodega)\b/i],
  ["South Asian", /\b(indian|india|pakistani|pakistan|bangladeshi|bangladesh|bengali|sri lankan|nepalese|nepali|punjabi|tandoor|tandoori|biryani|dosa|idli|chaat|masala|naan|kerala|goan)\b/i],
  ["Southeast Asian", /\b(thai|thailand|vietnamese|vietnam|pho|banh mi|malaysian|malaysia|indonesian|indonesia|filipino|filipina|philippines|nasi|laksa|lechon|pad thai)\b/i],
  ["Middle Eastern", /\b(middle eastern|lebanese|levantine|persian|iranian|turkish|falafel|shawarma|kebab|mezze)\b/i],
  ["African", /\b(african|ethiopian|eritrean|moroccan|nigerian|ghanaian|senegalese)\b/i],
  ["East Asian", /\b(chinese|china|hong kong|cantonese|sichuan|szechuan|chengdu|taiwanese|taiwan|japanese|japan|izakaya|tempura|udon|soba|yakiniku|korean|korea|bibimbap)\b/i],
  ["Cafés", /\b(cafe|coffee|espresso|roastery|roasters|tea house)\b/i],
  ["Desserts", /\b(dessert|gelato|ice cream|patisserie|pastry|cake|chocolate|creamery)\b/i],
  ["Bars", /\b(cocktail bar|wine bar|bar and grill|pub|taproom)\b/i],
];

function preserveFancyCategory(category, sourceCategory) {
  if (sourceCategory === "Asian Fancy" && ["East Asian", "Southeast Asian"].includes(category)) {
    return "Asian Fancy";
  }
  return category;
}

export function suggestRestaurantCategory({
  name = "",
  primaryType = "",
  placeTypes = [],
  sourceCategory = "Unclassified",
} = {}) {
  if (sourceCategory === "Fine Dining") {
    return { category: sourceCategory, confidence: 0.99, reason: "high-priority source list" };
  }

  const normalizedName = name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[_–—-]+/g, " ");
  if (sourceCategory === "Asian Fancy") {
    const isSushiOmakase = [primaryType, ...placeTypes].includes("sushi_restaurant");
    return isSushiOmakase
      ? { category: "Sushi", confidence: 0.99, reason: "sushi omakase in Asian Fancy list" }
      : { category: "Asian Fancy", confidence: 0.99, reason: "high-priority source list" };
  }

  const broadStyleName = /\b(contemporary|fusion|modern cuisine|modern dining|new american|global cuisine|international cuisine)\b/i;
  if (broadStyleName.test(normalizedName) && sourceCategory !== "Unclassified") {
    return { category: sourceCategory, confidence: 0.92, reason: "contemporary or fusion venue; retained broad source category" };
  }

  for (const [category, pattern] of nameRules) {
    if (pattern.test(normalizedName)) {
      return {
        category: preserveFancyCategory(category, sourceCategory),
        confidence: 0.9,
        reason: `name keyword (${normalizedName.match(pattern)?.[0] ?? "match"})`,
      };
    }
  }

  for (const type of [primaryType, ...placeTypes].filter(Boolean)) {
    const category = typeCategories.get(type);
    if (category) {
      return {
        category: preserveFancyCategory(category, sourceCategory),
        confidence: 0.86,
        reason: `Google place type (${type})`,
      };
    }
  }

  return { category: sourceCategory, confidence: 0, reason: "no strong cuisine clue" };
}

export { typeCategories };
