type InstagramHighlightRecipeMetadata = {
  date: string;
  storyText?: string;
};

// Manually matched against “My dishes vol 1” and “My dishes vol.2”.
// When a dish appears more than once, this keeps the newest matching story date.
export const instagramHighlightRecipeMetadata: Record<string, InstagramHighlightRecipeMetadata> = {
  "personal-aupoivre": {
    date: "2026-06-24",
    storyText: "A very herby au poivre.",
  },
  "personal-bakedporkchoprice": { date: "2026-01-22" },
  "personal-banhmi": {
    date: "2026-01-25",
    storyText: "Bánh mì heo quay. A bit of red vinegar makes the pork skin a dark mahogany colour.",
  },
  "personal-beefwellington": { date: "2026-05-31" },
  "personal-blackcodclamsbeurreblanc": {
    date: "2024-12-30",
    storyText: "Black cod, scallops and leeks with a clam-and-chive beurre blanc.",
  },
  "personal-bolalot": { date: "2026-02-12" },
  "personal-bossam-jjampong": { date: "2025-06-12" },
  "personal-bossam-jjampong-copy": { date: "2025-06-12" },
  "personal-buncha": { date: "2026-05-20" },
  "personal-burger": { date: "2026-01-22" },
  "personal-caesarsaladwrap": { date: "2026-04-16" },
  "personal-caneles": { date: "2025-03-18" },
  "personal-chacalan": { date: "2026-05-14" },
  "personal-chickenmushroomagnolotti": {
    date: "2025-10-21",
    storyText: "Tortellini stuffed with mushroom and pork, served in browned butter with sage, crispy fennel and fresh fennel. Cashews and pecorino were added inside.",
  },
  "personal-chickentrufflecapaletti": {
    date: "2025-03-16",
    storyText: "Cappelletti stuffed with pâté, chicken mousse, mushrooms and a gelatinised consommé, like a soup dumpling.",
  },
  "personal-chili-oil": {
    date: "2025-04-05",
    storyText: "Crispy fried shallots, red chilli and garlic, with chilli flakes, Sichuan peppercorn, black pepper and brown sugar.",
  },
  "personal-chutorodonburi": { date: "2025-10-02" },
  "personal-claypot-rice": { date: "2026-03-03" },
  "personal-coffeeicecream": { date: "2024-06-28" },
  "personal-confitducklegs": {
    date: "2025-05-02",
    storyText: "Confit duck legs with duck jus and pomme purée.",
  },
  "personal-daikoncake": { date: "2026-02-17" },
  "personal-deboned-chicken-wings-ricebowl": {
    date: "2026-06-07",
    storyText: "Deboned chicken wings with sansho pepper, chives, ginger and crispy chicken skin.",
  },
  "personal-dry-aged-duck": {
    date: "2024-12-06",
    storyText: "Inspired by David Chang’s duck bossam: dry-aged duck and confit duck legs on crispy rice, with chives, crispy duck skin and a duck demi-glace.",
  },
  "personal-dryagedturbotsaffronhollandaise": {
    date: "2026-01-01",
    storyText: "Dry-aged turbot for crisp skin, with saffron hollandaise, chive oil and prawn-head oil.",
  },
  "personal-ducktofudonabe": {
    date: "2024-11-13",
    storyText: "Duck, mushroom and tofu donabe, inspired by Mrs Donabe and Made by Musashi.",
  },
  "personal-duckwbloodorangeandtonnatosauce": {
    date: "2025-03-16",
    storyText: "Duck on tonnato sauce with radicchio and blood orange.",
  },
  "personal-eggsbenedict": { date: "2025-11-02" },
  "personal-fishandchips": {
    date: "2026-02-28",
    storyText: "Heston Blumenthal-style fish and chips with triple-cooked chips and fish batter aerated in a whipping siphon.",
  },
  "personal-frenchonionsoup": { date: "2025-03-07" },
  "personal-friedeelwnuocmam": {
    date: "2026-04-23",
    storyText: "Fried eel with kaffir lime leaf, lemongrass and prik nam pla.",
  },
  "personal-figcake": { date: "2025-10-06" },
  "personal-gamtaefishnchips": {
    date: "2026-05-31",
    storyText: "Gamtae-wrapped red snapper with yuzu-kosho tartare sauce.",
  },
  "personal-gonchauauhor": { date: "2025-05-19" },
  "personal-grilledchickenviet": { date: "2025-10-23" },
  "personal-grilledsmokedbeefribherbsauce": {
    date: "2024-06-29",
    storyText: "Chilean wagyu short rib with roasted leeks and an allium sauce of green onions, chives, garlic and plenty of butter.",
  },
  "personal-grilledtrout": {
    date: "2026-06-19",
    storyText: "Dry-aged trout on sweet peas, squid and herbs.",
  },
  "personal-guinessicecream": { date: "2025-07-22" },
  "personal-hariyali-chicken": {
    date: "2026-05-06",
    storyText: "Hariyali chicken with kaffir lime leaf, lemongrass, kasoori methi and chicken skin.",
  },
  "personal-hongshaorou": { date: "2024-10-14" },
  "personal-italianmeatballs": { date: "2026-01-29" },
  "personal-keemapav": { date: "2026-05-27" },
  "personal-khaosoi": { date: "2026-02-09" },
  "personal-kimchi": { date: "2024-01-24" },
  "personal-koreanstuff": {
    date: "2025-05-01",
    storyText: "Kimchi jjigae with boiled Spam and myeolchi-ttangkong-bokkeum, stir-fried anchovies and peanuts.",
  },
  "personal-lambbiryani": { date: "2024-11-17" },
  "personal-lambdumplings": { date: "2025-02-02" },
  "personal-lambwellington": {
    date: "2024-12-21",
    storyText: "Mosaic lamb Wellington.",
  },
  "personal-lotusleafrice": { date: "2026-02-18" },
  "personal-mapotofu": { date: "2025-10-12" },
  "personal-meyerlemontart": { date: "2025-03-16" },
  "personal-murghmakhani": { date: "2025-06-13" },
  "personal-muhallebi": { date: "2025-05-26" },
  "personal-mushroomtortellini": {
    date: "2024-05-10",
    storyText: "Tortellini stuffed with mushroom and pork, served in browned butter with sage, crispy fennel and fresh fennel. Cashews and pecorino were added inside.",
  },
  "personal-padseeew": { date: "2026-01-15" },
  "personal-pandanicecream": { date: "2024-03-05" },
  "personal-pannacotta": { date: "2025-05-04" },
  "personal-pho": { date: "2026-03-05" },
  "personal-phoschool": { date: "2024-11-25" },
  "personal-pithivier": {
    date: "2025-07-21",
    storyText: "Wellington pithivier with pomme purée and Madeira jus.",
  },
  "personal-roastchicken": { date: "2026-04-16" },
  "personal-roastlambhispicabbage": {
    date: "2026-01-01",
    storyText: "Lamb with yellow beetroot and Savoy cabbage.",
  },
  "personal-roastporkcroquettasdejamon": {
    date: "2025-05-05",
    storyText: "Croquetas de jamón with crispy pork belly and habanero vinegar.",
  },
  "personal-saladvennoise": { date: "2026-01-22" },
  "personal-scallopnorisoba": {
    date: "2026-06-19",
    storyText: "Soba with nori vinaigrette, nori-wasabi-sesame hollandaise, grilled scallops and mint, inspired by Dirty Korean’s nori cream soba.",
  },
  "personal-shakshuka": {
    date: "2025-08-20",
    storyText: "Chorizo shakshuka with roasted mini sweet peppers and labneh.",
  },
  "personal-shepherdspie": { date: "2025-03-09" },
  "personal-skatewing": {
    date: "2024-05-05",
    storyText: "Skate wing, scallops and charred potatoes, smoked with apple wood.",
  },
  "personal-sourdoughpizza": {
    date: "2025-05-29",
    storyText: "Sourdough pizza with chilli oil, stracciatella and guanciale.",
  },
  "personal-spaghettiaallanerano": { date: "2026-03-31" },
  "personal-spaghettiallavongole": {
    date: "2024-05-08",
    storyText: "Spaghetti alle vongole with shirodashi and salted lemon peel.",
  },
  "personal-strawberrycake-tart": { date: "2025-02-15" },
  "personal-taiwanesebeefnoodlesoup": {
    date: "2026-02-02",
    storyText: "Beef noodle soup with pickled mustard stems and beef ribs.",
  },
  "personal-taiwanesefriedchicken": {
    date: "2024-05-10",
    storyText: "Taiwanese fried chicken with burnt chilli sauce, from BAO London. An important step is to let the dry batter hydrate fully. Hydrating the tapioca-starch batter lets the coating adhere; during frying, the starches bond into a network, then desiccate into an airy, brittle layer. Evaporating water also creates small pores that make it crisper.",
  },
  "personal-tempura": { date: "2026-02-08" },
  "personal-tarte-l-ambrosie": { date: "2026-05-05" },
  "personal-torosear": { date: "2025-10-02" },
};
