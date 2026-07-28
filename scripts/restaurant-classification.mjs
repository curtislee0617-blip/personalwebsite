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
const styleCategories = new Set(["Asian Fancy", "Fine Dining", "Western Nicer", "Casual"]);

const specificTypeCategories = new Map([
  ["bar", "Bars"],
  ["beer_hall", "Bars"],
  ["cocktail_bar", "Bars"],
  ["distillery", "Bars"],
  ["night_club", "Bars"],
  ["pub", "Bars"],
  ["wine_bar", "Bars"],
  ["bakery", "Bakeries"],
  ["bagel_shop", "Bakeries"],
  ["taco_restaurant", "Tacos"],
  ["hamburger_restaurant", "Burgers"],
  ["chicken_restaurant", "Chicken"],
  ["chicken_shop", "Chicken"],
  ["chicken_wings_restaurant", "Chicken"],
  ["fried_chicken_takeaway", "Chicken"],
  ["yakitori_restaurant", "Chicken"],
  ["ramen_restaurant", "Ramen"],
  ["sushi_restaurant", "Sushi"],
  ["dumpling_restaurant", "Dim Sum"],
  ["dim_sum_restaurant", "Dim Sum"],
  ["pizza_restaurant", "Pizza"],
  ["neapolitan_restaurant", "Pizza"],
  ["steak_house", "Steakhouse"],
  ["chophouse_restaurant", "Steakhouse"],
  ["french_steakhouse_restaurant", "Steakhouse"],
  ["bistro", "Bistro"],
  ["brasserie", "Bistro"],
  ["barbecue_restaurant", "Barbecue"],
  ["korean_barbecue_restaurant", "Barbecue"],
  ["yakiniku_restaurant", "Barbecue"],
  ["lechon_restaurant", "Barbecue"],
  ["deli", "Deli"],
  ["butcher_shop", "Deli"],
  ["butcher_shop_deli", "Deli"],
  ["cured_ham_bar", "Deli"],
  ["cafe", "Cafés"],
  ["coffee_roastery", "Cafés"],
  ["coffee_shop", "Cafés"],
  ["espresso_bar", "Cafés"],
  ["tea_and_coffee_shop", "Cafés"],
  ["tea_house", "Cafés"],
  ["tea_store", "Cafés"],
  ["traditional_teahouse", "Cafés"],
  ["acai_shop", "Desserts"],
  ["bubble_tea_store", "Desserts"],
  ["cake_shop", "Desserts"],
  ["confectionery", "Desserts"],
  ["dessert_restaurant", "Desserts"],
  ["dessert_shop", "Desserts"],
  ["donut_shop", "Desserts"],
  ["frozen_yogurt_shop", "Desserts"],
  ["ice_cream_shop", "Desserts"],
  ["japanese_sweets_restaurant", "Desserts"],
  ["pastry_shop", "Desserts"],
  ["patisserie", "Desserts"],
  ["sugar_shack", "Desserts"],
]);

const broadTypeCategories = new Map([
  ["indian_restaurant", "South Asian"],
  ["modern_indian_restaurant", "South Asian"],
  ["south_indian_restaurant", "South Asian"],
  ["marathi_restaurant", "South Asian"],
  ["mughlai_restaurant", "South Asian"],
  ["parsi_restaurant", "South Asian"],
  ["punjabi_restaurant", "South Asian"],
  ["pakistani_restaurant", "South Asian"],
  ["bangladeshi_restaurant", "South Asian"],
  ["sri_lankan_restaurant", "South Asian"],
  ["nepalese_restaurant", "South Asian"],
  ["chinese_restaurant", "East Asian"],
  ["chinese_noodle_restaurant", "East Asian"],
  ["chinese_takeaway", "East Asian"],
  ["cantonese_restaurant", "East Asian"],
  ["cha_chaan_teng_hong_kong_style_cafe", "East Asian"],
  ["hong_kong_style_fast_food_restaurant", "East Asian"],
  ["hot_pot_restaurant", "East Asian"],
  ["hunan_restaurant", "East Asian"],
  ["mandarin_restaurant", "East Asian"],
  ["porridge_restaurant", "East Asian"],
  ["shanghainese_restaurant", "East Asian"],
  ["sichuan_restaurant", "East Asian"],
  ["taiwanese_restaurant", "East Asian"],
  ["authentic_japanese_restaurant", "East Asian"],
  ["izakaya_restaurant", "East Asian"],
  ["japanese_curry_restaurant", "East Asian"],
  ["japanese_restaurant", "East Asian"],
  ["kaiseki_restaurant", "East Asian"],
  ["katsudon_restaurant", "East Asian"],
  ["kushiage_and_kushikatsu_restaurant", "East Asian"],
  ["okonomiyaki_restaurant", "East Asian"],
  ["ryotei_restaurant", "East Asian"],
  ["seafood_donburi_restaurant", "East Asian"],
  ["shabu_shabu_restaurant", "East Asian"],
  ["sukiyaki_restaurant", "East Asian"],
  ["syokudo_and_teishoku_restaurant", "East Asian"],
  ["takoyaki_restaurant", "East Asian"],
  ["tempura_restaurant", "East Asian"],
  ["teppanyaki_restaurant", "East Asian"],
  ["tonkatsu_restaurant", "East Asian"],
  ["udon_noodle_restaurant", "East Asian"],
  ["unagi_restaurant", "East Asian"],
  ["korean_beef_restaurant", "East Asian"],
  ["korean_restaurant", "East Asian"],
  ["balinese_restaurant", "Southeast Asian"],
  ["burmese_restaurant", "Southeast Asian"],
  ["cambodian_restaurant", "Southeast Asian"],
  ["filipino_restaurant", "Southeast Asian"],
  ["indonesian_restaurant", "Southeast Asian"],
  ["malaysian_restaurant", "Southeast Asian"],
  ["nasi_restaurant", "Southeast Asian"],
  ["nyonya_restaurant", "Southeast Asian"],
  ["pho_restaurant", "Southeast Asian"],
  ["singaporean_restaurant", "Southeast Asian"],
  ["southeast_asian_restaurant", "Southeast Asian"],
  ["thai_restaurant", "Southeast Asian"],
  ["vietnamese_restaurant", "Southeast Asian"],
  ["armenian_restaurant", "Middle Eastern"],
  ["falafel_restaurant", "Middle Eastern"],
  ["georgian_restaurant", "Middle Eastern"],
  ["lebanese_restaurant", "Middle Eastern"],
  ["middle_eastern_restaurant", "Middle Eastern"],
  ["persian_restaurant", "Middle Eastern"],
  ["sfiha_restaurant", "Middle Eastern"],
  ["shawarma_restaurant", "Middle Eastern"],
  ["turkish_restaurant", "Middle Eastern"],
  ["uzbeki_restaurant", "Middle Eastern"],
  ["african_restaurant", "African"],
  ["ethiopian_restaurant", "African"],
  ["moroccan_restaurant", "African"],
  ["west_african_restaurant", "African"],
]);

export const typeCategories = new Map([...broadTypeCategories, ...specificTypeCategories]);

const genericPrimaryTypes = new Set([
  "", "restaurant", "asian_restaurant", "asian_fusion_restaurant", "breakfast_restaurant",
  "brunch_restaurant", "cafeteria", "catering_food_and_drink_supplier", "creative_cuisine_restaurant",
  "diner", "eclectic_restaurant", "family_restaurant", "farm", "fast_food_restaurant",
  "fine_dining_restaurant", "food_court", "halal_restaurant", "hotel", "inn",
  "meal_delivery", "meal_takeaway", "non_vegetarian_restaurant", "small_plates_restaurant",
  "takeout_restaurant", "vegan_restaurant", "vegetarian_restaurant",
]);

const restaurantLedPrimaryTypes = new Set([
  ...genericPrimaryTypes,
  ...broadTypeCategories.keys(),
  "american_restaurant", "australian_restaurant", "austrian_restaurant", "bar_and_grill",
  "basque_restaurant", "british_restaurant", "californian_restaurant", "caribbean_restaurant",
  "chilean_restaurant", "continental_restaurant", "contemporary_louisiana_restaurant",
  "croatian_restaurant", "cuban_restaurant", "danish_restaurant", "european_restaurant",
  "fish_and_chips_restaurant", "fish_and_chips_takeaway", "fish_and_seafood_restaurant",
  "fish_restaurant", "frituur", "gastropub", "greek_restaurant", "grill",
  "haute_french_restaurant", "hawaiian_restaurant", "hot_dog_restaurant", "hot_dog_stand",
  "italian_restaurant", "latin_american_restaurant", "meat_dish_restaurant",
  "mediterranean_restaurant", "mexican_restaurant", "modern_british_restaurant",
  "modern_european_restaurant", "modern_french_restaurant", "new_american_restaurant",
  "norwegian_restaurant", "oyster_bar_restaurant", "pacific_rim_restaurant",
  "peruvian_restaurant", "portuguese_restaurant", "puerto_rican_restaurant",
  "scandinavian_restaurant", "seafood_restaurant", "soul_food_restaurant",
  "south_american_restaurant", "southern_restaurant_us", "spanish_restaurant",
  "swedish_restaurant", "swiss_restaurant", "tapas_restaurant", "traditional_american_restaurant",
  "western_restaurant",
]);

const westernTypeTokens = new Set([
  "american_restaurant", "australian_restaurant", "austrian_restaurant", "basque_restaurant",
  "british_restaurant", "californian_restaurant", "caribbean_restaurant", "chilean_restaurant",
  "continental_restaurant", "contemporary_louisiana_restaurant", "croatian_restaurant",
  "cuban_restaurant", "danish_restaurant", "european_restaurant", "french_restaurant",
  "greek_restaurant", "haute_french_restaurant", "hawaiian_restaurant", "italian_restaurant",
  "latin_american_restaurant", "mediterranean_restaurant", "mexican_restaurant",
  "modern_british_restaurant", "modern_european_restaurant", "modern_french_restaurant",
  "new_american_restaurant", "norwegian_restaurant", "peruvian_restaurant",
  "portuguese_restaurant", "puerto_rican_restaurant", "scandinavian_restaurant",
  "south_american_restaurant", "southern_restaurant_us", "spanish_restaurant",
  "swedish_restaurant", "swiss_restaurant", "traditional_american_restaurant",
  "western_restaurant",
]);

const strongSpecificNameRules = [
  ["Bars", /^yuki bar$/i],
  ["Tacos", /\b(taco|tacos|taqueria|taquero|tlayuda|tlayudas|birria)\b/i],
  ["Burgers", /\b(burger|burgers|hamburger)\b/i],
  ["Chicken", /\b(chicken|poulet|poulette|rotisserie|yakitori|hainanese chicken|chicken rice)\b|海南雞/i],
  ["Ramen", /\b(ramen|mazesoba|chuka soba|menya|tsukemen)\b/i],
  ["Ramen", /\bafuri\b/i],
  ["Sushi", /\b(sushi|sushiya|edomae)\b/i],
  ["Dim Sum", /\b(dim sum|dimsum|dumpling|dumplings|xiaolongbao|xiao long bao|har gow|siu mai|shumai|bao)\b/i],
  ["Pizza", /\b(pizza|pizzeria)\b/i],
  ["Pasta", /\b(pasta bar|pastificio|spaghetti|tagliatelle|rigatoni|ravioli)\b/i],
  ["Steakhouse", /\b(steakhouse|steak house|chophouse)\b/i],
  ["Barbecue", /\b(korean bbq|kbbq|bbq|barbecue|barbeque|smokehouse|yakiniku|lechon)\b/i],
];

const genericVenueNameRules = [
  ["Bars", /\b(cocktail bar|wine bar|speakeasy|taproom|pub|bar à vins|bar a vins)\b/i],
  ["Bakeries", /\b(bakery|bakehouse|boulangerie|bread|panaderia|viennoiserie)\b/i],
  ["Cafés", /\b(cafe|café|coffee|espresso|roastery|roasters|tea house|kissa)\b/i],
  ["Desserts", /\b(dessert|gelato|ice cream|patisserie|pâtisserie|pastry|cake|chocolate|creamery)\b/i],
  ["Deli", /\b(deli|delicatessen|bodega|charcuterie)\b/i],
  ["Bistro", /\b(bistro|bistrot|bistronome)\b/i],
];

const cuisineNameRules = [
  ["South Asian", /\b(indian|pakistani|bangladeshi|bengali|sri lankan|nepalese|nepali|punjabi|tandoor|tandoori|biryani|dosa|idli|chaat|masala|naan|kerala|goan|tamila)\b/i],
  ["Southeast Asian", /\b(thai|vietnamese|vietnam|pho|phở|banh mi|bánh mì|bún|xôi|malaysian|malaysia|indonesian|indonesia|filipino|philippines|singaporean|singapore|burmese|myanmar|cambodian|khmer|nasi|laksa|lechon|pad thai|ayam|geprek|mieng kham|miang kham)\b/i],
  ["Middle Eastern", /\b(middle eastern|armenian|georgian|lebanese|levantine|persian|iranian|turkish|falafel|shawarma|kebab|mezze|ocakbasi|lahmajun|sfiha|uzbek)\b/i],
  ["African", /\b(african|ethiopian|eritrean|moroccan|nigerian|ghanaian|senegalese|somali)\b/i],
  ["East Asian", /\b(chinese|cantonese|sichuan|szechuan|chengdu|taiwanese|japanese|izakaya|tempura|udon|soba|yakiniku|korean|bibimbap|tonkatsu|wagyu|wun[\s-]?tun)\b/i],
];

const broaderCuisineForSpecific = new Map([
  ["Sushi", "East Asian"],
  ["Ramen", "East Asian"],
  ["Dim Sum", "East Asian"],
  ["Chicken", null],
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
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_–—-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalNameKey(value = "") {
  return normalizeName(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// These are the small set of generic or conflicting Google listings that
// needed a venue-by-venue website/review check. Keeping the decisions here
// makes later Takeout imports deterministic instead of reintroducing them.
const reviewedNameOverrides = new Map([
  ["acre", { category: "East Asian", reason: "official site describes Japanese fermentation-led cooking" }],
  ["bobo s farm", { category: "East Asian", reason: "official site identifies Mongolian and Northeastern Chinese cuisine" }],
  ["bun cha 74 hang quat", { category: "Southeast Asian", reason: "venue is a Hanoi specialist in Vietnamese bún chả" }],
  ["cave de la tour", { category: "Bars", reason: "official site identifies a wine bar with Niçoise food" }],
  ["ca ri de an đo musa", { category: "Southeast Asian", reason: "venue specialises in Vietnamese-style goat curry" }],
  ["cempaka", { category: "Southeast Asian", reason: "restaurant site and menu identify Malaysian cuisine" }],
  ["chikinmos ayala", { category: "Chicken", secondary: ["East Asian"], reason: "official site identifies a Korean fried-chicken specialist" }],
  ["chuck s takeaway", { category: "Southeast Asian", reason: "official site identifies Vietnamese bánh mì as the core offering" }],
  ["come rice kitchen", { category: "East Asian", reason: "official tourism listing identifies Japanese onigiri and comfort food" }],
  ["golden gip", { category: "East Asian", reason: "official site identifies modern Korean-led Asian cooking" }],
  ["groa", { category: "Casual", reason: "official listing identifies a casual coastal Mediterranean-Japanese eatery" }],
  ["heng heng cooked food", { category: "Southeast Asian", reason: "Michelin listing identifies a Singapore hawker specialising in laksa and prawn mee" }],
  ["heo nuong lu ong phu đat", { category: "Southeast Asian", reason: "venue specialises in Vietnamese clay-pot roasted pork" }],
  ["hill street tai hwa pork noodle crawford lane", { category: "Southeast Asian", reason: "Singapore hawker stall specialises in bak chor mee" }],
  ["hiru omakase 日 廚師發辦", { category: "Sushi", secondary: ["East Asian", "Asian Fancy"], reason: "reviews identify a sushi omakase counter" }],
  ["holy basil market", { category: "Southeast Asian", reason: "menus and reviews identify Thai cooking" }],
  ["house of culture", { category: "Asian Fancy", secondary: ["Southeast Asian"], reason: "Hong Kong Tourism Board identifies refined Malay-Chinese-Australian tasting menus" }],
  ["jija by vicky lau", { category: "East Asian", reason: "official site identifies Yunnan and Guizhou cooking" }],
  ["juno omakase", { category: "Sushi", secondary: ["East Asian", "Asian Fancy"], reason: "official site identifies a fifteen-course sushi omakase" }],
  ["keng eng kee seafood alexandra village", { category: "Southeast Asian", reason: "Singapore restaurant serves zi char and Singaporean seafood dishes" }],
  ["mawn", { category: "Southeast Asian", reason: "restaurant coverage identifies Cambodian cooking" }],
  ["mien cua 94 cha gio cua bien", { category: "Southeast Asian", reason: "venue specialises in Vietnamese crab glass noodles and crab spring rolls" }],
  ["monroe place", { category: "Casual", reason: "reviews and menu identify a neighbourhood sandwich shop, not a café" }],
  ["nem by summer rolls", { category: "Southeast Asian", reason: "venue serves Vietnamese rolls and casual Vietnamese dishes" }],
  ["nga bui beef noodle", { category: "Southeast Asian", reason: "venue specialises in Vietnamese beef noodles" }],
  ["nopa fish", { category: "Casual", reason: "official site identifies a seafood market and counter-service restaurant" }],
  ["one65 san francisco", { category: "Desserts", reason: "the saved street-level concept is the official Patisserie & Boutique" }],
  ["paloma coffee bakery greenpoint", { category: "Bakeries", secondary: ["Cafés"], reason: "venue name and saved bakery classification identify a bakery-café" }],
  ["pane e latte", { category: "Bakeries", secondary: ["Cafés"], reason: "official site identifies an all-day bakery and restaurant" }],
  ["piglet co", { category: "East Asian", reason: "restaurant coverage identifies Taiwanese-inspired cooking" }],
  ["quan thuy 94 mien cua", { category: "Southeast Asian", reason: "venue specialises in Vietnamese crab glass noodles" }],
  ["restoran sea park", { category: "Southeast Asian", reason: "local listings identify a Malaysian kopitiam serving Hokkien mee" }],
  ["rich crab", { category: "East Asian", reason: "reviews identify a Korean raw-marinated-crab specialist" }],
  ["seafood 2b", { category: "Southeast Asian", reason: "Ho Chi Minh City seafood restaurant serves Vietnamese preparations" }],
  ["sun kwai heung", { category: "Barbecue", secondary: ["East Asian"], reason: "restaurant coverage identifies a Cantonese siu-mei specialist" }],
  ["test kitchen", { category: "Fine Dining", reason: "official site describes rotating multi-course guest-chef tasting experiences" }],
  ["the green door", { category: "Bars", reason: "Hong Kong Tourism Board identifies a cocktail-led speakeasy" }],
  ["the greyhound beaconsfield", { category: "Western Nicer", reason: "current reviews identify an upscale modern-British restaurant and tasting menu" }],
  ["thipsamai", { category: "Southeast Asian", reason: "Bangkok restaurant is known for Thai pad thai" }],
  ["thonglorhk 銅羅", { category: "Southeast Asian", reason: "venue serves Thai food inspired by Bangkok's Thonglor district" }],
  ["thongsmith hong kong", { category: "Southeast Asian", reason: "restaurant specialises in Thai boat noodles" }],
  ["weekend chicken club bar", { category: "Chicken", secondary: ["East Asian"], reason: "official site identifies Taiwanese fried chicken as the core offering" }],
  ["xoi ga number one chinh goc", { category: "Southeast Asian", reason: "venue specialises in Vietnamese chicken sticky rice" }],
  ["yang s kitchen", { category: "East Asian", reason: "restaurant coverage identifies Chinese-inspired Californian cooking" }],
  ["yuki bar", { category: "Bars", reason: "restaurant coverage identifies a natural-wine bar with Japanese-influenced snacks" }],
]);

function tokenizeTypes(primaryType = "", placeTypes = []) {
  return Array.from(new Set([primaryType, ...placeTypes].filter(Boolean)));
}

function firstRuleMatch(name, rules) {
  for (const [category, pattern] of rules) {
    const match = name.match(pattern);
    if (match) return { category, reason: `name identifies ${match[0]}`, strength: "name" };
  }
  return null;
}

function typeMatch(type, mapping, label = "Google primary type") {
  const category = mapping.get(type);
  return category ? { category, reason: `${label} (${type})`, strength: "primary-type" } : null;
}

function firstMappedType(types, mapping, label = "Google place type") {
  for (const type of types) {
    const match = typeMatch(type, mapping, label);
    if (match) return match;
  }
  return null;
}

function hasSource(sourceLists, expected) {
  return sourceLists.some((source) => source.toLowerCase() === expected.toLowerCase());
}

function inferSpecific({ primaryType, types, normalizedName, sourceCategory, sourceLists }) {
  const primaryMatch = typeMatch(primaryType, specificTypeCategories);
  const nameMatch = firstRuleMatch(normalizedName, strongSpecificNameRules);

  // A Google primary type is the strongest indication of the venue's identity.
  // The one exception is a bread-led business that Google calls a pâtisserie.
  if (primaryMatch) {
    if (
      primaryMatch.category !== "Bars"
      && nameMatch
      && nameMatch.category === sourceCategory
    ) {
      return {
        ...nameMatch,
        reason: `${nameMatch.reason}; confirms reviewed ${sourceCategory} category`,
        strength: "reviewed+name",
      };
    }
    if (["Cafés", "Desserts"].includes(primaryMatch.category)) {
      const breadLedName = /\b(bakery|bakehouse|boulangerie|bread|panaderia)\b/i.test(normalizedName);
      if (breadLedName && (types.includes("bakery") || primaryMatch.category === "Desserts")) {
        return { category: "Bakeries", reason: "bread-led name and place types", strength: "name+type" };
      }
    }
    return primaryMatch;
  }

  if (nameMatch) return nameMatch;

  if (
    sourceCategory === "Sushi"
    && /\bomakase\b/i.test(normalizedName)
    && types.some((type) => broadTypeCategories.get(type) === "East Asian")
  ) {
    return { category: "Sushi", reason: "reviewed omakase with Japanese cuisine type", strength: "reviewed+name" };
  }

  const genericVenueMatch = firstRuleMatch(normalizedName, genericVenueNameRules);
  const primaryIsGeneric = genericPrimaryTypes.has(primaryType);
  const primaryIsRestaurantLed = restaurantLedPrimaryTypes.has(primaryType);
  const drinksFirst = hasSource(sourceLists, "Bars") || hasSource(sourceLists, "Drinks");

  // Café, deli and bar words are commonly part of restaurant names. They only
  // define the pin when Google has not supplied a more specific cuisine-led
  // primary type. This keeps Golden Deli and Los Caracoles out of Deli/Bars.
  if (genericVenueMatch && primaryIsGeneric) return genericVenueMatch;

  if (drinksFirst && primaryIsGeneric) {
    return { category: "Bars", reason: "saved in a drinks-first list", strength: "source" };
  }

  const secondaryMatches = types
    .filter((type) => type !== primaryType)
    .map((type) => typeMatch(type, specificTypeCategories, "secondary Google place type"))
    .filter(Boolean);
  const currentSupported = secondaryMatches.find((match) => match.category === sourceCategory);
  if (specificPrimaryCategories.has(sourceCategory) && currentSupported) {
    return {
      ...currentSupported,
      reason: `${currentSupported.reason}; supports reviewed ${sourceCategory} category`,
      strength: "reviewed+type",
    };
  }

  const nonVenueMatches = secondaryMatches.filter((match) =>
    !["Bars", "Cafés", "Bakeries", "Desserts", "Deli"].includes(match.category)
  );
  const uniqueNonVenueCategories = Array.from(new Set(nonVenueMatches.map((match) => match.category)));
  const hasFineDiningCue = types.includes("fine_dining_restaurant")
    || hasSource(sourceLists, "Fine dining")
    || hasSource(sourceLists, "Asian fancy");

  if (primaryIsGeneric && uniqueNonVenueCategories.length === 1 && !hasFineDiningCue) {
    return {
      ...nonVenueMatches[0],
      strength: "secondary-type",
    };
  }

  if (genericVenueMatch && !primaryIsRestaurantLed) return genericVenueMatch;
  return null;
}

function inferBroadCuisine({ primaryType, types, normalizedName, sourceLists }) {
  const primaryMatch = typeMatch(primaryType, broadTypeCategories);
  if (primaryMatch) return primaryMatch;

  const nameMatch = firstRuleMatch(normalizedName, cuisineNameRules);
  if (nameMatch) return nameMatch;

  const secondaryMatch = firstMappedType(
    types.filter((type) => type !== primaryType),
    broadTypeCategories,
    "secondary Google cuisine type",
  );
  if (secondaryMatch) return secondaryMatch;

  if (
    hasSource(sourceLists, "Asian casual")
    || hasSource(sourceLists, "Asian fancy")
  ) {
    return {
      category: "East Asian",
      reason: "Asian source list without a more specific regional signal",
      strength: "source-fallback",
    };
  }

  return null;
}

function inferStyle({ primaryType, types, broadCuisine, sourceCategory, sourceLists, priceLevel }) {
  const sourceFineDining = hasSource(sourceLists, "Fine dining");
  const sourceAsianFancy = hasSource(sourceLists, "Asian fancy");
  const sourceWesternNicer = hasSource(sourceLists, "Western nicer");
  const sourceCasual = hasSource(sourceLists, "Casual");
  const isAsianCuisine = ["East Asian", "Southeast Asian", "South Asian"].includes(broadCuisine?.category ?? "");

  if (sourceAsianFancy) {
    return { category: "Asian Fancy", reason: "saved in Asian fancy", strength: "source" };
  }
  if (sourceFineDining) {
    return { category: "Fine Dining", reason: "saved in Fine dining", strength: "source" };
  }
  if (primaryType === "fine_dining_restaurant" || types.includes("fine_dining_restaurant")) {
    return isAsianCuisine
      ? { category: "Asian Fancy", reason: "fine-dining type with Asian cuisine", strength: "type+region" }
      : { category: "Fine Dining", reason: "Google fine-dining type", strength: "type" };
  }
  if (sourceWesternNicer) {
    return { category: "Western Nicer", reason: "saved in Western nicer", strength: "source" };
  }
  if (sourceCasual) return { category: "Casual", reason: "saved in Casual", strength: "source" };

  const isWestern = types.some((type) => westernTypeTokens.has(type));
  if (isWestern && Number(priceLevel) >= 3) {
    return { category: "Western Nicer", reason: "higher-priced Western restaurant", strength: "price+type" };
  }
  if (styleCategories.has(sourceCategory) && sourceCategory !== "Unclassified") {
    return { category: sourceCategory, reason: "retained reviewed style category", strength: "existing" };
  }
  return { category: "Casual", reason: "general restaurant", strength: "fallback" };
}

function relevantStyleTag(style, primaryCategory) {
  if (!style?.category || style.category === primaryCategory) return null;
  if (style.category === "Casual" && primaryCategory !== "Casual") return null;
  return style.category;
}

function confidenceFor({ specific, broadCuisine, style, primaryCategory }) {
  if (style?.category === primaryCategory && style?.strength === "source") return 0.93;
  if (specific?.strength === "primary-type") return 0.99;
  if (specific?.strength === "name+type") return 0.97;
  if (specific?.strength === "name") return 0.94;
  if (specific?.strength) return 0.9;
  if (broadCuisine?.strength === "primary-type") return 0.98;
  if (broadCuisine?.strength === "name") return 0.93;
  if (broadCuisine?.strength === "source-fallback") return 0.66;
  if (broadCuisine) return 0.88;
  if (style?.strength === "source") return 0.93;
  if (style?.strength === "type" || style?.strength === "type+region") return 0.9;
  if (style?.strength === "existing") return 0.72;
  return primaryCategory === "Unclassified" ? 0.4 : 0.58;
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
  const reviewedOverride = reviewedNameOverrides.get(canonicalNameKey(name)) ?? null;
  const types = tokenizeTypes(primaryType, placeTypes);
  const specific = inferSpecific({ primaryType, types, normalizedName, sourceCategory, sourceLists });
  const broadCuisine = inferBroadCuisine({ primaryType, types, normalizedName, sourceLists });
  const style = inferStyle({
    primaryType,
    types,
    broadCuisine,
    sourceCategory,
    sourceLists,
    priceLevel,
  });

  let primaryCategory = reviewedOverride?.category ?? specific?.category ?? null;
  if (!primaryCategory) {
    if (["Asian Fancy", "Fine Dining"].includes(style.category)) {
      primaryCategory = style.category;
    } else if (
      broadCuisine?.strength === "source-fallback"
      && sourceCategory !== "Unclassified"
      && categorySet.has(sourceCategory)
    ) {
      primaryCategory = sourceCategory;
    } else if (broadCuisine?.category) {
      primaryCategory = broadCuisine.category;
    } else if (style.category === "Western Nicer") {
      primaryCategory = "Western Nicer";
    } else if (sourceCategory !== "Unclassified" && categorySet.has(sourceCategory)) {
      primaryCategory = sourceCategory;
    } else {
      primaryCategory = style.category ?? "Casual";
    }
  }

  const secondaryCategories = [...(reviewedOverride?.secondary ?? [])];
  if (
    broadCuisine?.category
    && broadCuisine.category !== primaryCategory
    && (!reviewedOverride || broadCuisine.strength !== "source-fallback")
  ) {
    secondaryCategories.push(broadCuisine.category);
  }

  const mappedBroad = broaderCuisineForSpecific.get(primaryCategory);
  if (mappedBroad && mappedBroad !== primaryCategory) secondaryCategories.push(mappedBroad);

  // Chicken and barbecue can be Western, East Asian or Southeast Asian. Only
  // add a regional tag when the actual cuisine evidence identifies one.
  const styleTag = relevantStyleTag(style, primaryCategory);
  if (styleTag) secondaryCategories.push(styleTag);

  if (primaryCategory === "Bakeries") secondaryCategories.push("Cafés");
  if (
    ["Chicken", "Barbecue", "Desserts", "Cafés"].includes(primaryCategory)
    && broadCuisine?.category
    && broadCuisine.category !== primaryCategory
  ) {
    secondaryCategories.push(broadCuisine.category);
  }

  const existingNonCategoryTags = tags.filter((tag) => tag && !categorySet.has(tag));
  const dedupedSecondary = Array.from(new Set(secondaryCategories.filter((category) =>
    categorySet.has(category) && category !== primaryCategory
  )));
  const mergedTags = Array.from(new Set([...dedupedSecondary, ...existingNonCategoryTags]));
  const reasons = [reviewedOverride?.reason, specific?.reason, broadCuisine?.reason, style?.reason].filter(Boolean);
  const confidence = reviewedOverride
    ? 0.995
    : confidenceFor({ specific, broadCuisine, style, primaryCategory });

  return {
    primaryCategory,
    secondaryCategories: dedupedSecondary,
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
