import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const sourcePath = process.argv[2] ?? "/tmp/youtube-food-playlist-analysis.json";
const outputPath = process.argv[3] ?? path.join(projectRoot, "data", "youtube-saved-recipes.ts");

const titleOverrides = {
  "TP18-9lbAtg": "Cantonese Siu Mai (燒賣)",
  "28ufp6QMoGE": "Six Cantonese Milk Desserts",
  BysMkH1gwcQ: "Taiwanese Braised Pork Rice (滷肉飯)",
  OT_HUWZHT2c: "Bouillabaisse and Bouillabaisse Paccheri",
  "WyLYK-a0QYA": "Shallot Peppercorn Chicken (沙蔥椒麻雞)",
  ZMMjaONwTr4: "Cantonese Spicy Dishes",
  gONExIBbazI: "Suan Cai Yu — Sichuan Pickled Mustard Fish (酸菜魚)",
  gwdsNkqbu8g: "Pan-Fried Buns (煎包)",
  W_Mf2d84ODE: "Cantonese Soup",
  "IoPf5vx-Wcs": "Restaurant-Style Mapo Tofu (麻婆豆腐)",
  E0hzrjAVBIY: "Tai Chi Fried Rice (太極炒飯)",
  lv5CKXofNUg: "Ten Air-Fryer Recipes",
  EH84aOuVTck: "Beijing Roast Duck (北京烤鴨)",
  ALUkX6d5I1w: "Shiitake Chicken Zongzi (香菇雞肉粽)",
  CP8jIxy8Zbw: "Pan-Fried Baozi (生煎包)",
  "dnT-wyNBNpM": "Four Steamed Pork Rib Recipes",
  bGzbJpLExDM: "Sixteen Ways to Wrap Dumplings",
  Daq92osusIA: "Fish-Broth Daikon Cake (魚湯蘿蔔糕)",
  uRc3F6uwR3E: "Chinese Fried Dough Sticks (油條)",
  an6WqeHJC0M: "Clear Beef Brisket with Chilli Sauce (清湯牛腩)",
  VgVMYNxw5rw: "Cantonese Shredded Chicken",
  qkBrsJouhhE: "Salted Lemon Drinks and Dishes (鹹檸)",
  sPQx_XmT9LE: "Hong Kong Baked Pork Chop Rice (芝士焗豬扒飯)",
  Z9WOtTpkU4c: "Ham Sui Gok — Fried Glutinous Rice Dumplings (鹹水角)",
  n0X3rR6aBBM: "Steamed Beef Balls (山竹牛肉球)",
  J8GK5aZkvK0: "Pan-Fried Baozi with Vegetables (生煎包)",
  "53ug4vhuBY0": "Chinese Braised Duck",
};

const curatedRecipes = {
  "TP18-9lbAtg": {
    description: "Cantonese siu mai transcribed and translated from 大C廚房’s linked written recipe. Makes approximately 30 dumplings.",
    categories: ["meat"],
    ingredientGroups: [
      {
        title: "Pork and shrimp filling",
        items: [
          "300 g lean pork shoulder or upper pork, sinew removed and diced",
          "2 g baking soda",
          "30 g water",
          "340 g frozen white shrimp meat, thawed",
          "19 g potato starch, for soaking the shrimp",
          "19 g sugar, for soaking the shrimp",
          "3–4 dried shiitake mushrooms, soaked and sliced",
          "Siu mai wrappers",
          "Finely chopped carrot, for garnish",
        ],
      },
      {
        title: "Seasoning",
        items: [
          "6 g salt",
          "24 g potato starch",
          "42 g lard",
          "58 g water",
          "30 g sugar",
          "15 g chicken powder",
          "Sesame oil, a little",
          "White pepper, a little",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Prepare the filling",
        steps: [
          "Mix the diced pork with the baking soda and 30 g water. Refrigerate for 1 hour at 0–4°C.",
          "Soak the thawed shrimp with 19 g potato starch, 19 g sugar, and enough water to cover for 15 minutes, stirring occasionally. Rinse under running water for 15 minutes, dry thoroughly, and refrigerate uncovered for 1 hour.",
          "Mix the chicken powder, sugar, white pepper, 58 g water, and sesame oil until dissolved.",
          "Beat the shrimp with the salt and 24 g potato starch at medium speed until sticky. Add the pork and lard and mix well.",
          "Gradually beat in the seasoning liquid, waiting for each addition to absorb. Beat on high for 1–2 minutes, then fold in the shiitakes on low speed.",
          "Cover and refrigerate the filling overnight.",
        ],
      },
      {
        title: "Shape and steam",
        steps: [
          "Fill each wrapper with 26–28 g filling and shape it so the filling rises slightly above the wrapper. Garnish with carrot.",
          "Steam over rapidly boiling water on high heat for 8 minutes.",
        ],
      },
    ],
    referenceLinks: [
      { label: "大C廚房 written siu mai recipe", url: "https://bickitchen.pixnet.net/blog/post/329190580" },
    ],
  },
  "8lfWBxtH6hk": {
    description: "A vegan foaming syrup for shaken cocktails, organized from the written Sour Syrup formula linked by Kevin Kos.",
    categories: ["drinks", "condiments"],
    ingredientGroups: [
      {
        title: "Sour syrup",
        items: [
          "3 g Methocel F50",
          "100 g boiling water",
          "200 g cold water",
          "300 g granulated sugar",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Method",
        steps: [
          "Stir the Methocel F50 into the boiling water until dissolved.",
          "Run the cold water in a high-powered blender on low and slowly pour in the hot methylcellulose mixture. Blend for 4 minutes.",
          "Freeze for about 10 minutes, or until the foam subsides.",
          "Whisk in the sugar. Let the syrup settle, whisk once more to dissolve any remaining crystals, then bottle.",
        ],
      },
    ],
    referenceLinks: [
      { label: "PUNCH Sour Syrup formula", url: "https://punchdrink.com/recipes/sour-syrup/" },
      { label: "Kevin Kos Super Syrup notes", url: "https://www.kevinkos.com/post/super-syrup" },
    ],
  },
  "OYJw9iSO-Vw": {
    description: "Classic and clear espresso martini formulas, including the coffee-oil washing technique, organized from Kevin Kos’s written recipe.",
    categories: ["drinks"],
    ingredientGroups: [
      {
        title: "Classic espresso martini",
        items: [
          "45 ml vodka",
          "30 ml Mr Black coffee liqueur",
          "1 shot freshly brewed espresso",
          "7.5 ml rich demerara syrup",
          "2 drops 20% saline solution",
        ],
      },
      {
        title: "Coffee oil",
        items: [
          "100 g freshly ground coffee",
          "200 g neutral-flavoured oil",
        ],
      },
      {
        title: "Coffee-washed vodka",
        items: [
          "120 ml coffee oil",
          "400 ml vodka",
        ],
      },
      {
        title: "Clear espresso martini",
        items: [
          "52.5 ml coffee-washed vodka",
          "22.5 ml Super Foam",
          "15 ml simple syrup",
          "7.5 ml white crème de cacao",
          "1 dash saline solution",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Classic cocktail",
        steps: [
          "Shake all ingredients hard with ice, double-strain into a chilled Martini glass, and garnish with three coffee beans.",
        ],
      },
      {
        title: "Coffee oil and washed vodka",
        steps: [
          "Blend the coffee and neutral oil for 30–60 seconds. Refrigerate for 6 hours or overnight, then filter without squeezing.",
          "Combine 15 ml coffee oil for every 50 ml vodka in a double-sealed sous-vide bag. Infuse at 55°C for 2 hours.",
          "Cool, then freeze until the oil firms. Keep the mixture cold while filtering through a coffee filter, then bottle the clear coffee-washed vodka.",
        ],
      },
      {
        title: "Clear cocktail",
        steps: [
          "Froth the ingredients with a milk frother or stick blender before adding ice.",
          "Shake hard with ice, double-strain into a chilled coupe, and garnish with three coffee beans.",
        ],
      },
    ],
    referenceLinks: [
      { label: "Kevin Kos written Clear Espresso Martini recipe", url: "https://www.kevinkos.com/post/clear-espresso-martini" },
    ],
  },
  "K-yJZYXbiAM": {
    description: "Sous pression cocktail formulas and the freeze–thaw infusion method, organized from Kevin Kos’s written notes.",
    categories: ["drinks"],
    ingredientGroups: [
      {
        title: "Sability — 2.1 litre batch",
        items: [
          "738 ml Citadelle Jardin d’Été gin",
          "410 ml Lustau Blanco vermouth",
          "328 ml fino sherry",
          "41 ml maraschino liqueur",
          "303 ml water",
          "287 g sable grapes",
        ],
      },
      {
        title: "Sability — one serve ratio",
        items: [
          "45 ml gin",
          "25 ml vermouth",
          "20 ml fino sherry",
          "2.5 ml maraschino liqueur",
          "18.5 ml water",
          "17.5 g sable grapes",
        ],
      },
      {
        title: "Sous-pressed Manhattan",
        items: [
          "326 ml Maker’s Mark bourbon",
          "163 ml 9 diDante Inferno vermouth",
          "9 ml Angostura bitters",
          "222 ml water",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Sous pression method",
        steps: [
          "Measure the exact capacity of a pressure-safe keg or cream whipper. Scale the formula so the vessel is completely full, leaving no expansion space.",
          "Seal the vessel and freeze it solid for 24–48 hours.",
          "Allow it to thaw completely for at least 24 hours before opening. Strain, bottle, and chill.",
          "Serve the Sability in a chilled coupe with the infused grapes; serve the Manhattan with a cocktail cherry.",
        ],
      },
    ],
    referenceLinks: [
      { label: "Kevin Kos written sous pression guide", url: "https://www.kevinkos.com/post/sous-pressure-drinks" },
    ],
  },
  "3E-5ib-xroQ": {
    description: "Three make-ahead sour cocktail batches, organized from Kevin Kos’s written pre-batching guide.",
    categories: ["drinks"],
    ingredientGroups: [
      {
        title: "Pre-batched Mojito",
        items: [
          "400 g (420 ml) 41% ABV white rum",
          "320 g (280 ml) clarified lime and mint cordial",
          "1.3 g (20 drops) saline solution",
        ],
      },
      {
        title: "Pre-batched Margarita",
        items: [
          "312 g (332 ml) 40% ABV tequila",
          "174 g (166 ml) Cointreau",
          "40 g (37 ml) agave syrup",
          "172 g (166 ml) lime Super Juice",
          "1.3 g (20 drops) saline solution",
        ],
      },
      {
        title: "Pre-batched whiskey sour",
        items: [
          "370 g (400 ml) 45% ABV bourbon",
          "192 g (150 ml) Super Syrup",
          "154 g (150 ml) lemon Super Juice",
          "1.3 g (20 drops) saline solution",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Batch and store",
        steps: [
          "Combine each formula in a clean bottle, turn gently to mix, label, and refrigerate.",
        ],
      },
      {
        title: "Serve the Mojito",
        steps: [
          "Pour 75 ml soda into an ice-filled glass, add 100 ml Mojito batch, stir gently, and garnish with mint and lime.",
        ],
      },
      {
        title: "Serve the Margarita",
        steps: [
          "Shake 100 ml Margarita batch with ice and double-strain into a chilled coupe with a half salt rim.",
        ],
      },
      {
        title: "Serve the whiskey sour",
        steps: [
          "Shake 100 ml whiskey sour batch with ice, discard the ice, then dry-shake. Double-strain over fresh ice and garnish with a cocktail cherry.",
        ],
      },
    ],
    referenceLinks: [
      { label: "Kevin Kos written pre-batched sours guide", url: "https://www.kevinkos.com/post/prebatched-sours" },
    ],
  },
  "ctFEPrR-954": {
    description: "Brandon Jew’s silken doufu with dry-aged rib-eye cap mapo, organized from the written recipe linked by MUNCHIES.",
    categories: ["meat"],
    ingredientGroups: [
      {
        title: "Fermented chilli paste",
        items: [
          "225 g red Fresno chillies, stems removed and halved",
          "225 g red bell peppers, stems removed and halved",
          "Kosher salt, as needed",
        ],
      },
      {
        title: "Spicy beef chilli oil",
        items: [
          "200 g beef tallow or rendered beef fat",
          "60 g minced garlic",
          "25 g Chinese chilli flakes",
          "1/2 tsp red Sichuan peppercorns",
        ],
      },
      {
        title: "Mapo powder",
        items: [
          "1 tsp white peppercorns",
          "1 tsp black peppercorns",
          "1 tsp green peppercorns",
          "1 tsp red Sichuan peppercorns",
        ],
      },
      {
        title: "Mapo doufu",
        items: [
          "1 tbsp fermented black beans",
          "2 tbsp fermented chilli paste",
          "1 tbsp red miso paste",
          "2 tsp minced garlic",
          "1 tsp granulated sugar",
          "2 tsp cornstarch",
          "1 tbsp water, plus 120 ml",
          "450 g silken doufu",
          "1 tbsp beef tallow or rendered beef fat",
          "170 g small-diced dry-aged fatty steak, such as rib-eye",
          "Kosher salt",
          "2 tbsp spicy beef chilli oil",
          "25 g thinly sliced green onions",
          "Steamed rice, to serve",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Fermented chilli paste",
        steps: [
          "Remove as many chilli seeds as desired and all bell-pepper seeds. Roughly chop, massage with 4 tsp salt for about 5 minutes, and tightly pack into a non-reactive 1-pint container.",
          "If the peppers are not submerged, top up with a 4% brine. Cover the surface directly and ferment at 18–24°C, out of sunlight, for 3–4 weeks, burping regularly. Blend to a paste and refrigerate.",
        ],
      },
      {
        title: "Chilli oil and mapo powder",
        steps: [
          "Melt the tallow over medium heat. Fry the garlic until pale gold, stir in the chilli flakes and red peppercorns, and cook until fragrant and golden. Cover and cool.",
          "Toast all four peppercorns over high heat for about 2 minutes. Cool, then grind to a fine powder.",
        ],
      },
      {
        title: "Mapo doufu",
        steps: [
          "Soak the fermented black beans in hot water for 10 minutes and drain. Mix with the chilli paste, miso, garlic, and sugar. Separately mix the cornstarch with 1 tbsp water.",
          "Steam the drained doufu in a shallow heatproof dish for about 8 minutes and keep warm.",
          "Melt the tallow in a very hot wok. Season and sear the diced steak in a single layer for about 90 seconds.",
          "Add the black-bean mixture, then 120 ml water. Toss until evenly mixed, stir in the slurry, and cook for about 30 seconds until thickened. Add the chilli oil.",
          "Drain any liquid from the doufu, spoon over the mapo sauce, dust with mapo powder, and finish with green onions. Serve with rice.",
        ],
      },
    ],
    referenceLinks: [
      { label: "MUNCHIES written mapo doufu recipe", url: "https://www.vice.com/en/article/silken-doufu-with-rib-eye-cap-mapo-recipe/" },
    ],
  },
  yVy89TnL9Zg: {
    description: "Chinese Cooking Demystified’s Hong Kong-style Fujian fried rice: egg fried rice topped with a chicken, shrimp, dried-scallop, mushroom, and gailan gravy.",
    categories: ["rice-noodles"],
    ingredientGroups: [
      {
        title: "Soaked ingredients",
        items: [
          "2 dried shiitake mushrooms (5 g)",
          "20 g dried scallops",
          "375 ml freshly boiled water",
        ],
      },
      {
        title: "Chicken and shrimp",
        items: [
          "150 g chicken thigh, cut into 1.25 cm pieces",
          "1/8 tsp each salt, white pepper, and sugar",
          "1/2 tsp each cornstarch, light soy sauce, and Shaoxing wine",
          "1 tsp oil",
          "6 large shrimp, approximately 150 g peeled weight",
          "1/8 tsp each salt and white pepper, for the shrimp",
          "100 g gailan stems, sliced",
          "120 ml oil, for passing the chicken and shrimp through",
        ],
      },
      {
        title: "Egg fried rice",
        items: [
          "230 g jasmine rice",
          "1 egg, well beaten",
          "2 tbsp oil",
          "1/4 tsp each salt, MSG, and sugar",
        ],
      },
      {
        title: "Gravy",
        items: [
          "2 1/2 tbsp potato or tapioca starch",
          "2 1/2 tbsp water",
          "1 tbsp oil",
          "1 tbsp Shaoxing wine",
          "Soaked mushrooms, scallops, and their soaking liquid",
          "1/4 tsp salt",
          "1/4 tsp chicken bouillon powder",
          "1/4 tsp MSG",
          "1/2 tsp sugar",
          "1 tsp light soy sauce",
          "2 tbsp oyster sauce",
          "1/8 tsp white pepper",
          "1/2 tbsp chicken-frying oil or 1/2 tsp toasted sesame oil, optional",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Prepare the toppings",
        steps: [
          "Cover the mushrooms and dried scallops with the boiling water and soak.",
          "Marinate the diced chicken with its seasonings. Rinse and dry the shrimp, cut into 1.25 cm pieces, and season with salt and pepper.",
          "Heat the frying oil to 150°C. Cook the chicken for about 1 minute and the shrimp for 30–60 seconds. Drain. Blanch the gailan stems for 1 minute and cool under running water.",
        ],
      },
      {
        title: "Rice",
        steps: [
          "Rinse the rice, parboil for 3 minutes, and drain. Spread in a strainer over boiling water and steam, covered, for 15 minutes.",
          "Heat 2 tbsp oil in a wok. Scramble the beaten egg until set, add the rice, and fold until the grains separate. Season with salt, MSG, and sugar; plate.",
        ],
      },
      {
        title: "Gravy and assembly",
        steps: [
          "Slice the soaked mushrooms and press the scallops into floss. Mix the starch and water into a slurry.",
          "Fry the mushrooms in 1 tbsp oil over medium heat for about 90 seconds. Add Shaoxing wine, then the scallops and soaking liquid.",
          "Add the gravy seasonings and bring to a boil. Add the chicken and shrimp for 1 minute, followed by the gailan.",
          "Gradually thicken with slurry until the sauce coats a spoon. Finish with white pepper and optional frying oil, then pour over the egg fried rice.",
        ],
      },
    ],
    referenceLinks: [
      { label: "Chinese Cooking Demystified written Fujian fried rice recipe", url: "https://chinesecookingdemystified.substack.com/p/fujian-fried-rice" },
    ],
  },
  vFJDxR9N7uk: {
    description: "Chinese Cooking Demystified’s Sichuan poached fish with pickled mustard greens, organized from the detailed written recipe linked by the video.",
    categories: ["seafood"],
    ingredientGroups: [
      {
        title: "Fish and quick stock",
        items: [
          "1 whole white flaky fish, preferably freshwater, yielding at least 300 g fillet plus the head and bones",
          "3 tbsp Shaoxing wine, for soaking the fish",
          "2 litres water",
          "1 slice ginger",
        ],
      },
      {
        title: "Fish marinade",
        items: [
          "1/2 tsp salt",
          "1 tbsp cornstarch",
          "1 tsp white pepper",
          "1 egg white",
        ],
      },
      {
        title: "Pickles and aromatics",
        items: [
          "Pickled mustard greens (suancai), as needed",
          "50 g pickled ginger, or fresh ginger",
          "50 g pickled yeshanjiao chillies, or pickled jalapeños",
          "2.5 cm ginger, minced",
          "2 garlic cloves, minced",
          "1 tbsp lard or neutral oil",
          "1 tbsp Shaoxing wine",
        ],
      },
      {
        title: "Seasoning and finish",
        items: [
          "1/2 tsp salt",
          "1/2 tbsp sugar",
          "MSG, a small pinch",
          "1 tbsp white vinegar",
          "4 scallions, sliced",
          "3 garlic cloves, minced",
          "1 tbsp whole Sichuan peppercorns",
          "10 g dried red chillies, sliced",
          "3 tbsp caiziyou, mustard-seed oil, or peanut oil",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Fish and stock",
        steps: [
          "Soak the fillets in tap water with 3 tbsp Shaoxing wine for 5 minutes, rinse, and slice very thinly on a shallow angle.",
          "Brown the head and bones in a little oil over medium-low heat for about 10 minutes. Add 2 litres water and a slice of ginger; cover and lightly boil for 30 minutes. Strain.",
          "Mix the sliced fillet thoroughly with all marinade ingredients.",
        ],
      },
      {
        title: "Pickles and poaching",
        steps: [
          "Soak the mustard greens, pickled chillies, and pickled ginger in fresh water for 5 minutes to remove excess salt, then slice.",
          "Fry the minced ginger and garlic in lard for 30 seconds. Add the mustard greens for 3 minutes, then the pickled ginger and chillies for 30 seconds.",
          "Splash the Shaoxing wine around the wok, add the fish stock, cover, and simmer for 3 minutes. Season with salt, sugar, MSG, and vinegar.",
          "Lift the pickles into a serving bowl. Bring the broth just below a simmer, add the fish slices, and poach gently for 2–3 minutes. Place the fish over the pickles and pour over the boiling broth.",
          "Top with scallions and minced garlic. Heat the finishing oil until just smoking, add the dried chillies and peppercorns, and immediately pour over the fish.",
        ],
      },
    ],
    referenceLinks: [
      { label: "Chinese Cooking Demystified written suan cai yu recipe", url: "https://www.reddit.com/r/Cooking/comments/9unu3v/recipe_suan_cai_yu_sichuanese_poached_fish_with/" },
    ],
  },
  "n0X3rR6aBBM": {
    description: "Cantonese steamed beef balls translated from 大C廚房’s linked written recipe. The beef is hydrated and rested overnight before finishing on day two.",
    categories: ["meat"],
    ingredientGroups: [
      {
        title: "Day one — beef",
        items: [
          "300 g rump steak, trimmed and minced",
          "6 g salt",
          "2 g baking soda",
          "1/2 tsp lye water",
          "167 g water",
        ],
      },
      {
        title: "Day two — additions",
        items: [
          "100 g pork fat, frozen and minced to a paste",
          "2 scallions, chopped",
          "50 g water chestnuts, crushed and squeezed dry",
          "2 coriander plants, chopped",
          "Fried bean-curd skin, as needed",
        ],
      },
      {
        title: "Seasoning",
        items: [
          "10 g chicken powder",
          "Sesame oil, a little",
          "1/4 tsp lye water",
          "16 g granulated sugar",
          "White pepper, a little",
          "38 g potato starch",
          "1/2 piece dried tangerine peel",
          "86 g water used to soak the tangerine peel",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Day one",
        steps: [
          "Beat the minced beef with the salt and baking soda at medium speed until sticky. Mix in the lye water on low.",
          "Return to medium speed and add the 167 g water in several additions, allowing each to absorb before adding more. Refrigerate at 0–4°C overnight.",
        ],
      },
      {
        title: "Day two",
        steps: [
          "Soak the dried tangerine peel, scrape away the white pith, and mince it. Mix the sugar, chicken powder, pepper, potato starch, peel-soaking water, and sesame oil.",
          "Beat the rested beef with the pork-fat paste at medium speed. Add the lye water and tangerine peel, then gradually beat in the seasoning liquid.",
          "Fold in the scallions, coriander, and squeezed water chestnuts on low speed. Chill for 30 minutes before shaping.",
          "Cut the bean-curd skin into small pieces. Fry at 160°C for about 10 seconds until pale brown, then soak briefly in cold water to soften.",
          "Place softened bean-curd skin on small dishes and pipe or squeeze three beef balls onto each. Steam over boiling water on high heat for 10 minutes.",
        ],
      },
    ],
    referenceLinks: [
      { label: "大C廚房 written steamed beef ball recipe", url: "https://bickitchen.pixnet.net/blog/post/329317834" },
    ],
  },
  "r5kJ-NcS-6A": {
    description: "Both complete Chef John Zhang recipes featured in the video, organized from the two linked Taste Life recipe pages.",
    categories: ["poultry"],
    ingredientGroups: [
      {
        title: "Lemon chicken — sauce",
        items: [
          "1 tbsp lemon zest",
          "80 ml lemon juice",
          "1/4 tsp salt",
          "2 tbsp sugar",
          "60 ml honey",
          "2 tbsp white vinegar",
          "1 tbsp custard powder",
        ],
      },
      {
        title: "Lemon chicken — chicken and coating",
        items: [
          "340 g chicken breast",
          "1/4 tsp salt",
          "2 tbsp Shaoxing wine",
          "1 egg",
          "1 tbsp custard powder",
          "1 tbsp cornstarch",
          "3 cups cornstarch, for coating",
          "Cooking oil, for deep-frying",
        ],
      },
      {
        title: "Chilli chicken — marinade",
        items: [
          "454 g boneless chicken leg quarters",
          "1 tbsp paprika",
          "3/4 tsp ground Sichuan peppercorn",
          "1 tbsp Shaoxing wine",
          "1/2 tsp salt",
          "1 egg",
          "60 ml cornstarch",
          "1 tsp olive oil",
        ],
      },
      {
        title: "Chilli chicken — aromatics and seasoning",
        items: [
          "2 tbsp Sichuan peppercorn oil, plus 1 tbsp to finish",
          "1 tbsp green Sichuan peppercorns",
          "1 tbsp red Sichuan peppercorns",
          "1 tbsp minced garlic",
          "80 ml fresh chilli pepper",
          "80 ml shallots",
          "1 tbsp minced ginger",
          "1 green onion",
          "1 cup dried chillies",
          "1 tbsp Shaoxing wine",
          "1 tsp sweet black rice vinegar",
          "1 tsp pepper-salt powder",
          "1 cup basil",
          "1 tsp sesame oil",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Lemon chicken",
        steps: [
          "Remove the bitter white pith from the lemon peel. Julienne the yellow zest and squeeze the fruit.",
          "Mix the lemon juice, salt, sugar, honey, vinegar, and custard powder for the sauce.",
          "Slice the chicken into pieces about 6–7.5 cm long and 5 mm thick. Mix with the salt, Shaoxing wine, egg, custard powder, and cornstarch.",
          "Coat the chicken in cornstarch. Fry at 170°C for 1–2 minutes until pale gold, drain, then fry again for 20–30 seconds until crisp.",
          "Boil the sauce over medium heat, stirring until thick. Add half the lemon zest, pour over the chicken, and garnish with the remainder.",
        ],
      },
      {
        title: "Chilli chicken",
        steps: [
          "Cut the chicken into 1.25 cm cubes and marinate with all marinade ingredients for 1 hour.",
          "Cut the dried chillies into short lengths.",
          "Fry the chicken at 180–200°C, drain, then refry for 40 seconds.",
          "Stir-fry the garlic, fresh chilli, shallots, ginger, green onion, and dried chillies in sequence.",
          "Return the chicken and add the peppercorns, Shaoxing wine, vinegar, pepper salt, basil, sesame oil, and peppercorn oil. Toss briefly and serve.",
        ],
      },
    ],
    referenceLinks: [
      { label: "Taste Life lemon chicken recipe", url: "https://www.tastelife.tv/recipe/better-than-takeout-lemon-chicken-chef-johns-cooking-class_48686.html" },
      { label: "Taste Life chilli chicken recipe", url: "https://www.tastelife.tv/recipe/chili-chicken-dried-pepper-chicken_6461.html" },
    ],
  },
  EbCc1FVqXn4: {
    description: "Chinese Cooking Demystified’s Macanese African chicken: a marinated roast chicken with a spiced peanut, cashew, tomato, and coconut sauce.",
    categories: ["poultry"],
    ingredientGroups: [
      {
        title: "Chicken and marinade",
        items: [
          "1 plump chicken, approximately 1.5 kg",
          "2 fresh bird’s-eye or Heaven-Facing chillies",
          "4 garlic cloves",
          "2 shallots",
          "Lime zest, a little",
          "2 tsp salt",
          "1/2 whole nutmeg, yielding approximately 1 tsp ground",
          "1 tsp black peppercorns",
          "4 bay leaves",
          "1 tsp coriander seeds",
          "1 tsp fennel seeds",
          "1 tbsp turmeric",
          "2 tsp paprika",
          "2 tbsp olive oil",
          "6 tbsp white wine",
          "Juice of 1/2 lime",
        ],
      },
      {
        title: "African chicken sauce",
        items: [
          "100 g cashews",
          "100 g peanuts",
          "1 red onion",
          "1 large shallot",
          "2 garlic cloves",
          "2 bird’s-eye or Heaven-Facing chillies",
          "2 tomatoes",
          "1 tbsp paprika",
          "3 tbsp tomato paste",
          "240 ml water",
          "240 ml coconut milk",
          "60 ml shredded coconut",
          "1 tbsp sugar",
          "2 tsp salt",
          "1 tbsp fish sauce, optional",
          "Nutmeg, a small grating, optional",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Marinate",
        steps: [
          "Spatchcock the chicken or split it in half.",
          "Pound the marinade aromatics with the salt. Grind the nutmeg, peppercorns, bay, coriander, and fennel to a powder.",
          "Mix the aromatics and spices with the turmeric, paprika, and olive oil. Massage over the chicken and refrigerate overnight.",
          "Two hours before cooking, add the white wine and lime juice to the marinade.",
        ],
      },
      {
        title: "Cook and sauce",
        steps: [
          "Toast the cashews and peanuts over low heat for about 5 minutes and pulse finely. Blend the onion, shallot, garlic, and chillies to a paste; blend the tomatoes separately.",
          "Remove the chicken and reserve the marinade. Pan-fry it skin-side down in 2 tbsp oil over medium-high heat for 1 minute, then for 5 minutes per side over medium.",
          "Roast at 200°C for 15 minutes, turn, and roast approximately 10 minutes more, until the thigh reaches 77°C.",
          "Meanwhile, fry the onion paste in the rendered chicken fat for about 3 minutes. Add the paprika for 1 minute, then the ground nuts.",
          "Add the tomatoes, tomato paste, water, coconut milk, and reserved marinade. Simmer over medium-low heat for 30 minutes, watching and stirring.",
          "When reduced by roughly one-third, add the shredded coconut, sugar, salt, fish sauce, and optional nutmeg for 1 minute. Carve the chicken and cover with the sauce.",
        ],
      },
    ],
    referenceLinks: [
      { label: "Chinese Cooking Demystified written African chicken recipe", url: "https://www.reddit.com/r/Cooking/comments/a7amhl/recipe_macau_african_chicken_%E9%9D%9E%E6%B4%B2%E9%B8%A1/" },
    ],
  },
  NrGGVB2qVHQ: {
    description: "Chinese Cooking Demystified’s restaurant-style Cantonese wonton noodle soup, including stock, shrimp-pork wontons, and homemade alkaline egg noodles.",
    categories: ["rice-noodles", "meat", "seafood"],
    ingredientGroups: [
      {
        title: "Wonton soup",
        items: [
          "500 g meaty pork bones",
          "400 g shrimp heads",
          "2 dried flounder or other unsalted dried ocean fish, plus 2 more for powder",
          "400 g soybean sprouts",
          "3 litres water",
          "25 g rock sugar",
          "1/4 tsp MSG",
          "2–2 1/2 tsp salt, to taste",
        ],
      },
      {
        title: "Wonton filling",
        items: [
          "400 g pork leg or a 70:30 lean-to-fat pork mixture",
          "400 g peeled shrimp",
          "1/4 tsp baking soda",
          "1/2 egg",
          "1 tbsp dried-shrimp powder",
          "1 tbsp dried-fish powder",
          "3/4 tbsp chicken bouillon powder",
          "1/2 tbsp white pepper",
        ],
      },
      {
        title: "Homemade wrappers and noodles",
        items: [
          "250 g all-purpose flour",
          "3/8 tsp baking soda",
          "1 1/2 tbsp water",
          "125 g beaten egg, approximately 2 1/2 eggs",
          "Extra flour, for dusting",
        ],
      },
      {
        title: "Per bowl",
        items: [
          "1 tbsp yellow chives or green onions, cut into 2.5 cm lengths",
          "1/8 tsp dried-fish powder",
          "1/8 tsp dried-shrimp eggs or dried-shrimp powder",
          "1/8 tsp toasted sesame oil",
          "1/8 tsp light soy sauce",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Soup",
        steps: [
          "Rinse the pork bones under cool water for 5 minutes. Toast all four dried fish over a medium flame for about 30 seconds per side.",
          "Place two dried fish, the pork bones, shrimp heads, and soybean sprouts in 3 litres cool water. Bring to a boil and skim thoroughly.",
          "Simmer uncovered very gently for 3 hours, skimming as needed. Strain and season with rock sugar, MSG, and salt.",
        ],
      },
      {
        title: "Wrappers and noodles",
        steps: [
          "Mix the flour, baking soda, water, and egg with a dough hook on low for 8 minutes.",
          "Working with one-quarter at a time, fold and roll through the widest pasta-machine setting six times. Pass through a medium setting, then the thinnest setting.",
          "Cut three-quarters of the sheets into 5–6 cm squares and flour well. Cut the final quarter into very thin noodles.",
        ],
      },
      {
        title: "Wontons",
        steps: [
          "Blend two toasted dried fish and approximately 20 dried shrimp separately into powders.",
          "Dice the pork fat and hand-mince the lean pork until paste-like. Roughly chop the shrimp. Mix the shrimp and pork fat with the baking soda.",
          "Beat or slap the minced lean pork until very sticky, then combine with the fat, shrimp, egg, fish powder, shrimp powder, bouillon, and white pepper.",
          "Place 1–2 tsp filling on each wrapper. Fold into a triangle, then bring the two side points up and press to seal.",
        ],
      },
      {
        title: "Assemble",
        steps: [
          "Place the bowl seasonings in each bowl and ladle in hot soup.",
          "Boil the wontons until they float, then cook 15 seconds longer. Boil the fresh noodles for about 20 seconds and rinse briefly under cold water.",
          "Add approximately 10 wontons and a portion of noodles to each bowl.",
        ],
      },
    ],
    referenceLinks: [
      { label: "Chinese Cooking Demystified written wonton noodle soup recipe", url: "https://www.reddit.com/r/Cooking/comments/6vab9e/recipe_how_to_make_authentic_wonton_soup_from/" },
    ],
  },
  "76JXtB7JFQY": {
    description: "Isaac Toups’s chicken and andouille gumbo, organized from the written MUNCHIES recipe linked by the video.",
    categories: ["poultry", "meat"],
    ingredientGroups: [
      {
        title: "Gumbo",
        items: [
          "453 g boneless, skinless chicken thighs",
          "Kosher salt, to taste",
          "74 g all-purpose flour",
          "1 tsp freshly ground black pepper, plus more to taste",
          "130 ml grapeseed oil, divided",
          "6 garlic cloves, minced",
          "2 celery ribs, diced",
          "1 jalapeño, seeded and minced",
          "1 small green bell pepper, diced",
          "1 small yellow onion, diced",
          "250 ml amber beer",
          "946 ml chicken stock",
          "1 tsp fresh thyme",
          "4 bay leaves",
          "453 g andouille sausage, sliced into 6 mm coins",
          "Cayenne pepper, to taste",
          "Cooked white rice and sliced scallions, to serve",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Method",
        steps: [
          "Season the chicken with salt, pepper, and 1 tbsp grapeseed oil. Broil until lightly charred and golden, about 10 minutes.",
          "Heat the remaining oil in a heavy Dutch oven over medium. Whisk in the flour continuously for about 25 minutes, until the roux is dark chocolate brown.",
          "Stir in the garlic, celery, jalapeño, bell pepper, and onion for 1 minute. Deglaze with the beer.",
          "Add the stock, thyme, bay leaves, and 1 tsp black pepper. Return to a simmer, then add the chicken and andouille.",
          "Cover and simmer for 3 hours, stirring occasionally. Adjust salt and cayenne, then serve with rice and scallions.",
        ],
      },
    ],
    referenceLinks: [
      { label: "MUNCHIES chicken and andouille gumbo recipe", url: "https://www.vice.com/en/article/chicken-and-andouille-sausage-gumbo/" },
    ],
  },
  "9ytqP64AVkk": {
    description: "Isaac Toups’s Cajun jambalaya, organized from the written MUNCHIES recipe linked by the video.",
    categories: ["rice-noodles", "poultry", "meat"],
    ingredientGroups: [
      {
        title: "Jambalaya",
        items: [
          "454 g chicken legs and thighs",
          "2 tbsp kosher salt, plus more to taste",
          "Freshly ground black pepper",
          "148 ml canola oil, divided",
          "1/2 cup all-purpose flour",
          "2 celery ribs, diced",
          "1 large yellow onion, diced",
          "1 red bell pepper, seeded and diced",
          "8 garlic cloves, minced",
          "1 fresh cayenne pepper, stemmed and minced",
          "1.42 litres chicken stock",
          "454 g andouille sausage, sliced 6 mm thick",
          "2 cups long-grain rice",
          "3 tbsp unsalted butter",
          "1 bunch scallions, thinly sliced",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Method",
        steps: [
          "Heat the oven to 175°C. Season the chicken with salt and pepper. Brown it in 2 tbsp oil over medium-high heat for about 8 minutes, then set aside.",
          "Add the remaining oil and flour to the pan. Stir constantly for about 6 minutes, until chocolate brown.",
          "Add the celery, bell pepper, and onion for 1 minute; add the garlic and cayenne and cook for another minute.",
          "Stir in the stock and 2 tbsp salt. Simmer for 1 hour, then mix in the sausage and rice.",
          "Set the chicken on top, cover, and bake for 30 minutes. Stir in the butter and scallions, adjust the seasoning, and serve.",
        ],
      },
    ],
    referenceLinks: [
      { label: "MUNCHIES easy jambalaya recipe", url: "https://www.vice.com/en_us/article/d3bg77/easy-jambalaya-recipe" },
    ],
  },
  "IK1m8rnjk2w": {
    description: "Richard Ho’s Taiwanese beef noodle soup, organized from the written MUNCHIES recipe linked by the video.",
    categories: ["rice-noodles", "meat"],
    ingredientGroups: [
      {
        title: "Spice bag",
        items: [
          "1 tbsp goji berries",
          "1 tsp fennel seeds",
          "1 tsp Sichuan peppercorns",
          "2 star anise",
          "1 cinnamon stick",
          "1 small sliver ginseng",
          "1 small sliver liquorice root",
        ],
      },
      {
        title: "Beef braise",
        items: [
          "1 kg beef shank",
          "60 ml canola oil",
          "1 bunch scallions, cut into 2.5 cm pieces",
          "1 head garlic, peeled and smashed",
          "5 cm fresh ginger, sliced 6 mm thick",
          "1 tbsp spicy broad-bean paste",
          "1 tbsp spicy soybean paste",
          "1 tbsp soybean paste",
          "250 ml rice wine",
          "125 ml aged soy sauce",
          "125 ml light soy sauce",
          "2 tomatoes, roughly chopped",
          "1 carrot, roughly chopped",
          "1 large piece rock sugar",
          "1 yellow onion, halved",
          "1/2 Fuji apple, roughly chopped",
        ],
      },
      {
        title: "Pickled mustard greens",
        items: [
          "3 tbsp canola oil",
          "2 garlic cloves, minced",
          "2 Thai bird’s-eye chillies, thinly sliced",
          "1 cup pickled mustard greens, roughly chopped",
          "3 tbsp granulated sugar",
          "Kosher salt, to taste",
        ],
      },
      {
        title: "Per bowl",
        items: [
          "White wheat noodles",
          "1 tsp light soy sauce",
          "1 tsp sesame oil",
          "1/2 tsp black vinegar",
          "Freshly ground white pepper",
          "Scallions and coriander",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Braise",
        steps: [
          "Tie the spice-bag ingredients in cheesecloth.",
          "Blanch the beef shank in boiling water for 2–3 minutes, drain, and clean the pot.",
          "Heat the oil over medium-high. Cook the ginger, garlic, and scallions for 3–4 minutes. Add all three bean pastes and cook for 2 minutes.",
          "Add the rice wine and soy sauces. After 3 minutes, add the tomatoes, carrot, apple, rock sugar, onion, 6 litres water, the beef, and spice bag.",
          "Simmer until the shanks are just tender, about 2 1/2 hours. Cool in the braise, then strain. Slice the beef across the grain into 1.25 cm pieces.",
        ],
      },
      {
        title: "Mustard greens and assembly",
        steps: [
          "Fry the garlic and chillies in oil for about 1 minute. Add the mustard greens and sugar and cook for 1–2 minutes; season with salt.",
          "Cook the noodles according to their package, rinse cold, then dip back into boiling water.",
          "Season each bowl with light soy, sesame oil, black vinegar, and white pepper. Add noodles, hot braising broth, sliced beef, mustard greens, scallions, and coriander.",
        ],
      },
    ],
    referenceLinks: [
      { label: "MUNCHIES Taiwanese beef noodle soup recipe", url: "https://www.vice.com/en/article/taiwanese-beef-noodle-soup-recipe/" },
    ],
  },
  "ek_CUJY-Jmc": {
    description: "Sheldon Simeon’s mochiko chicken plate lunch, organized from the written MUNCHIES recipe linked by the video.",
    categories: ["poultry", "rice-noodles"],
    ingredientGroups: [
      {
        title: "Mochiko chicken",
        items: [
          "250 g cornstarch, divided",
          "100 g mochiko flour",
          "2 tbsp granulated sugar",
          "2 tbsp gochujang",
          "2 tbsp minced ginger",
          "2 tbsp sake",
          "2 tbsp soy sauce",
          "2 large eggs",
          "280 g all-purpose flour",
          "2 tbsp garlic salt",
          "8 boneless, skin-on chicken thighs",
          "Canola oil, for frying",
        ],
      },
      {
        title: "Gochujang aioli",
        items: [
          "150 g mayonnaise",
          "1 tsp gochujang",
          "1 tsp granulated sugar",
        ],
      },
      {
        title: "Su-miso",
        items: [
          "120 g granulated sugar",
          "125 ml mirin",
          "1 tbsp sake",
          "1 3/4 tsp shiro miso",
        ],
      },
      {
        title: "Kaki mochi crumble",
        items: [
          "60 g Mini Yakko Arare rice crackers, finely chopped",
          "40 g nori-komi furikake",
          "1 tbsp fried garlic",
        ],
      },
      {
        title: "Ulu macaroni salad",
        items: [
          "225 g macaroni",
          "626 g mayonnaise",
          "450 g breadfruit or russet potatoes",
          "1 tbsp garlic salt",
          "1 tsp freshly ground black pepper",
          "1 medium carrot, grated",
          "4 hard-boiled eggs, chopped",
        ],
      },
      {
        title: "To serve",
        items: [
          "Cooked medium-grain rice",
          "Green onions, thinly sliced",
        ],
      },
    ],
    methodGroups: [
      {
        title: "Chicken and sauces",
        steps: [
          "Mix 25 g cornstarch, the mochiko flour, and sugar. Whisk the gochujang, ginger, sake, soy, eggs, and 2 tbsp water separately, then combine. Add the chicken and refrigerate for at least 4 hours.",
          "Mix the aioli ingredients and refrigerate.",
          "Boil the sugar, mirin, and sake until dissolved; remove from the heat and stir in the shiro miso.",
          "Combine the chopped rice crackers, furikake, and fried garlic.",
        ],
      },
      {
        title: "Macaroni salad",
        steps: [
          "Cook the macaroni until al dente, about 7 minutes. Rinse cold, drain, and refrigerate until chilled.",
          "Boil the breadfruit or potatoes until just tender, about 14 minutes. Cool, peel, and dice, then mix with the macaroni, mayonnaise, garlic salt, pepper, carrot, and eggs.",
        ],
      },
      {
        title: "Fry and assemble",
        steps: [
          "Heat 5 cm canola oil to 165°C. Mix the remaining cornstarch, flour, and garlic salt. Dredge the marinated thighs and fry until golden, about 3 minutes.",
          "Cut into bite-size pieces. Drizzle with su-miso and gochujang aioli, add the kaki mochi crumble and green onions, and serve with rice and macaroni salad.",
        ],
      },
    ],
    referenceLinks: [
      { label: "MUNCHIES mochiko chicken recipe", url: "https://www.vice.com/en/article/mochiko-chicken-recipe/" },
    ],
  },
};

const unitPattern =
  /(?:\d|[¼½¾⅓⅔⅛⅜⅝⅞])\s*(?:g|kg|mg|ml|cl|l|oz|lb|lbs|tsp|tbsp|cups?|pieces?|pcs?|cloves?|stalks?|sprigs?|bunch|pinch|slices?|eggs?|onions?|tomatoes?|chill(?:i|ies)|minutes?|mins?|hours?|°\s*[cf])\b/i;
const leadingAmountPattern =
  /^(?:[-–—•*]\s*)?(?:\d+(?:[.,]\d+)?(?:\s*\/\s*\d+)?|[¼½¾⅓⅔⅛⅜⅝⅞]|one|two|three|four|five|six|seven|eight|nine|ten)\b/i;
const actionPattern =
  /^(?:add|allow|assemble|bake|beat|blend|boil|braise|brown|build|chill|chop|combine|cook|cool|cover|cut|deglaze|divide|drain|dress|fold|form|fry|garnish|grate|grill|heat|infuse|knead|layer|let|marinate|melt|mix|place|plate|poach|pour|preheat|proof|reduce|remove|render|reserve|rest|roast|roll|sauté|saute|seal|season|serve|shake|shape|simmer|slice|soak|spread|sprinkle|steam|steep|stir|strain|temper|toast|top|transfer|whip|whisk|wrap)\b/i;
const ingredientHeaderPattern =
  /^(?:recipe|ingredients?|you(?:'|’)ll need|for the .+|marinade|sauce|sambal|toppings?|dough|filling|glaze|batter|stock|broth|cream|ganache|garnish|aioli)\s*:?\s*$/i;
const methodHeaderPattern =
  /^(?:method|directions?|instructions?|steps?|step by step|procedure|preparation|assembly|to assemble|to serve)\s*:?\s*$/i;
const noisePattern =
  /^(?:https?:\/\/|www\.|#|@|subscribe\b|follow\b|shop\b|books?:\b|credits?\b|about\b|chapters?\b|video chapters?\b|tools? & cookware\b|social media\b|contact\b|sponsor\b|thank you\b|thanks to\b|check out\b|want more\b|still haven.?t subscribed\b|join\b|visit\b|reference videos?\b|research articles?\b|produced by\b|edited by\b|shot by\b|director\b|senior director\b|supervising producer\b|executive producer\b|head of\b|bilibili\b|小红书|抖音|music\b|演出者\b|訂閱頻道\b|分享影片\b|點心系列\b)/i;
const timestampPattern = /^\d{1,2}:\d{2}(?::\d{2})?\s/;
const socialDomainPattern =
  /(?:instagram\.com|tiktok\.com|facebook\.com|twitter\.com|x\.com|youtube\.com|youtu\.be|amazon\.|amzn\.|shop\.|squarespace\.com|chime\.|biltrewards\.|patreon\.com\/(?!posts\/)|booklarder\.com|fromourplace\.com)/i;

function cleanLine(value) {
  return value
    .replace(/\p{Cf}/gu, "")
    .replace(/\u00a0/g, " ")
    .replace(/^\s*[-–—•]\s*/, "")
    .replace(/^\*+|\*+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isIngredientLine(line, ingredientMode = false) {
  if (!line || actionPattern.test(line) || methodHeaderPattern.test(line)) return false;
  if (
    ingredientMode
    && line.length <= 140
    && (
      line.includes(" | ")
      || /(?:\d+(?:[.,]\d+)?\s*(?:g|kg|mg|ml|cl|l|oz|lb|lbs|tsp|tbsp|cups?|nos?\.?|pieces?|pcs?)|as required|to taste|a (?:large )?pinch|a handful|q\.?b\.?)\s*(?:\([^)]*\))?$/i.test(line)
    )
  ) return true;
  if (unitPattern.test(line) || leadingAmountPattern.test(line) || /\bto taste\b/i.test(line) || /\bq\.?b\.?\b/i.test(line)) return true;
  if (!ingredientMode || line.length > 80 || /[.!?:]$/.test(line) || /[|]/.test(line)) return false;
  return (
    !noisePattern.test(line) &&
    !timestampPattern.test(line) &&
    /\b(?:anchov(?:y|ies)|anise|apple|basil|bay leaves?|belachan|bread|butter|cardamom|carrot|celery|cheese|chicken|chilli|chillies|cinnamon|cloves?|coconut|coriander|cream|cucumber|cumin|egg|fennel|fish|flour|garlic|ginger|herbs?|honey|juice|lemon|lime|milk|mushrooms?|oil|onions?|orange|oregano|pandan|peanuts?|pepper|pernod|rice|rosemary|saffron|salt|shallots?|sugar|tamarind|thyme|tomatoes?|turmeric|water|wine|yoghurt|yogurt)\b/i.test(line)
  );
}

function isComponentHeading(lines, index) {
  const line = cleanLine(lines[index] ?? "").replace(/:$/, "");
  if (!line || line.length > 58 || unitPattern.test(line) || leadingAmountPattern.test(line) || actionPattern.test(line)) return false;
  if (ingredientHeaderPattern.test(line) || methodHeaderPattern.test(line)) return true;
  let ingredientFollowers = 0;
  for (let offset = 1; offset <= 4; offset += 1) {
    const follower = cleanLine(lines[index + offset] ?? "");
    if (!follower || noisePattern.test(follower) || timestampPattern.test(follower)) continue;
    if (isIngredientLine(follower, false)) ingredientFollowers += 1;
  }
  return ingredientFollowers >= 2;
}

function parseDescription(description) {
  const lines = description.split(/\r?\n/);
  const ingredientGroups = [];
  const methodGroups = [];
  let currentIngredients = { title: "Ingredients", items: [] };
  let currentMethod = { title: "Method", steps: [] };
  let mode = "none";
  let recipeStarted = false;

  const flushIngredients = () => {
    if (currentIngredients.items.length > 0) {
      ingredientGroups.push({
        title: currentIngredients.title,
        items: [...new Set(currentIngredients.items)],
      });
    }
  };
  const flushMethod = () => {
    if (currentMethod.steps.length > 0) {
      methodGroups.push({
        title: currentMethod.title,
        steps: [...new Set(currentMethod.steps)],
      });
    }
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = cleanLine(lines[index]);
    if (!line || /^[-_=]{4,}$/.test(line) || timestampPattern.test(line)) continue;
    if (noisePattern.test(line) || /^.*https?:\/\//i.test(line)) {
      if (recipeStarted && mode === "method") mode = "none";
      continue;
    }

    if (methodHeaderPattern.test(line)) {
      flushMethod();
      currentMethod = { title: line.replace(/:$/, "") || "Method", steps: [] };
      mode = "method";
      recipeStarted = true;
      continue;
    }
    if (ingredientHeaderPattern.test(line)) {
      if (mode === "ingredients" && currentIngredients.items.length === 0) continue;
      flushIngredients();
      currentIngredients = { title: "Ingredients", items: [] };
      mode = "ingredients";
      recipeStarted = true;
      continue;
    }
    if (mode === "ingredients" && isIngredientLine(line, true)) {
      currentIngredients.items.push(line.replace(/\s+-\s*$/, ""));
      recipeStarted = true;
      continue;
    }
    if (isComponentHeading(lines, index)) {
      if (methodHeaderPattern.test(line)) {
        flushMethod();
        currentMethod = { title: line.replace(/:$/, "") || "Method", steps: [] };
        mode = "method";
      } else {
        flushIngredients();
        currentIngredients = {
          title: ingredientHeaderPattern.test(line) ? "Ingredients" : line.replace(/:$/, ""),
          items: [],
        };
        mode = "ingredients";
      }
      recipeStarted = true;
      continue;
    }

    if (isIngredientLine(line, false)) {
      if (mode !== "ingredients") {
        flushIngredients();
        currentIngredients = { title: "Ingredients", items: [] };
      }
      currentIngredients.items.push(line.replace(/\s+-\s*$/, ""));
      mode = "ingredients";
      recipeStarted = true;
      continue;
    }

    const methodLine = line.replace(/^\d+[.)]\s*/, "");
    if (actionPattern.test(methodLine) || (mode === "method" && methodLine.length > 12)) {
      if (mode !== "method") {
        flushMethod();
        currentMethod = { title: "Method", steps: [] };
      }
      currentMethod.steps.push(methodLine);
      mode = "method";
      recipeStarted = true;
    }
  }

  flushIngredients();
  flushMethod();
  return {
    ingredientGroups: ingredientGroups.filter((group) => group.items.length > 0),
    methodGroups: methodGroups.filter((group) => group.steps.length > 0),
  };
}

function categoriesFor(title) {
  const value = title.toLowerCase();
  const categories = [];
  const add = (category) => {
    if (!categories.includes(category)) categories.push(category);
  };
  if (/\b(?:rice|noodle|pasta|paccheri|ramen|laksa|tsukemen|jambalaya|zongzi|lo mai gai|fried rice)\b/.test(value)) add("rice-noodles");
  if (/\b(?:beef|steak|oxtail|pork|rib|brisket|tongue|rendang|burrito|meat)\b/.test(value)) add("meat");
  if (/\b(?:fish|seafood|bouillabaisse|shrimp|scampi|katsuobushi|mackerel|tuna)\b/.test(value)) add("seafood");
  if (/\b(?:chicken|duck|poultry)\b/.test(value)) add("poultry");
  if (/\b(?:cocktail|drink|martini|whiskey|lassi|infusion|syrup|salted lemon)\b/.test(value)) add("drinks");
  if (/\b(?:dessert|chocolate|cake|semifreddo|tart|tartelette|entremet|caramel|hazelnut|pear|strawberry|milk dessert|crème brûlée)\b/.test(value)) add("desserts-pastries");
  if (/\b(?:bread|naan|bun|bao|bánh mì|roti|fried dough|english muffin)\b/.test(value)) add("bread");
  if (/\b(?:fries|potato|daikon cake|turnip cake)\b/.test(value)) add("starches-grains");
  if (/\b(?:sauce|sambal|aioli|seasoning|fish sauces)\b/.test(value)) add("condiments");
  if (/\b(?:vegetable|salad|broccoli|asparagus)\b/.test(value)) add("vegetables");
  return categories.length > 0 ? categories : ["inspiration"];
}

function recipeReferenceLinks(description) {
  const links = [];
  for (const rawLine of description.split(/\r?\n/)) {
    const line = cleanLine(rawLine);
    const urls = line.match(/https?:\/\/[^\s<>()\]]+/g) ?? [];
    for (const rawUrl of urls) {
      const url = rawUrl
        .replace(/(?:subscribe|follow|instagram|facebook|pinterest).*$/i, "")
        .replace(/[.,;!?]+$/, "");
      if (!url) continue;
      if (socialDomainPattern.test(url) && !/patreon\.com\/posts\//i.test(url)) continue;
      if (/(?:creativecommons\.org|audionautix\.com|goo\.gl|revolut\.com|pubmed\.ncbi\.nlm\.nih\.gov|researchgate\.net)/i.test(url)) continue;
      const recipeContext = /\b(?:recipe|written|blog|breakdown|ingredients?|method|further analysis)\b/i.test(line);
      const knownRecipeSite = /(?:pixnet\.net|theanalyticalcook\.sg|brunoalbouze\.com|chefsteps\.com|seriouseats\.com|food52\.com|nytimes\.com\/.*cooking|substack\.com|reddit\.com\/r\/cooking|vice\.com|tastelife\.tv|kevinkos\.com|punchdrink\.com)/i.test(url);
      if (!recipeContext && !knownRecipeSite) continue;
      links.push({
        label: recipeContext ? "Written recipe or reference" : new URL(url).hostname.replace(/^www\./, ""),
        url,
      });
    }
  }
  return [...new Map(links.map((link) => [link.url, link])).values()].slice(0, 8);
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

const source = JSON.parse(await fs.readFile(sourcePath, "utf8"));
const ignoreAutomaticRecipeIds = new Set([
  "yw--NLjZBNk",
  "lv5CKXofNUg",
  "Daq92osusIA",
  "IoPf5vx-Wcs",
  "XHq3BZE6cDI",
  "tZ16lcfrLuA",
]);
const entries = source.videos.map((video) => {
  const title = titleOverrides[video.videoId] ?? video.title;
  const parsed = ignoreAutomaticRecipeIds.has(video.videoId)
    ? { ingredientGroups: [], methodGroups: [] }
    : parseDescription(video.description ?? "");
  const curated = curatedRecipes[video.videoId];
  const ingredientGroups = curated?.ingredientGroups ?? parsed.ingredientGroups;
  const methodGroups = curated?.methodGroups ?? parsed.methodGroups;
  const categories = curated?.categories ?? categoriesFor(title);
  const referenceLinks = curated?.referenceLinks ?? recipeReferenceLinks(video.description ?? "");
  const hasRecipe = ingredientGroups.length > 0 || methodGroups.length > 0;
  return {
    recipeKey: `youtube-saved-${video.videoId}`,
    slug: `youtube-saved-${slugify(title)}-${video.videoId.toLowerCase()}`,
    title,
    description: curated?.description ?? (hasRecipe
      ? `Recipe details organized from the video description by ${video.channel}. Open the original YouTube video for the complete demonstration and creator credit.`
      : `Saved YouTube cooking video by ${video.channel}. No complete written formula was published in the description, so the original video remains the primary reference.`),
    sourceLabel: `${video.channel} on YouTube`,
    sourceLinkLabel: "Original video",
    sourceUrl: video.sourceUrl,
    category: categories[0],
    categories,
    ingredientGroups,
    methodGroups,
    referenceLinks,
    source: "site",
    thumbnail: video.thumbnail,
    media: [],
    playlistIndex: video.playlistIndex,
  };
});

const output = `import type { RecipeCardEntry } from "@/lib/recipe-card-types";

export type YouTubeSavedRecipeEntry = RecipeCardEntry & { playlistIndex: number };

// Generated from Curtis's YouTube Food playlist. Playlist order is preserved.
export const youtubeSavedRecipes: YouTubeSavedRecipeEntry[] = ${JSON.stringify(entries, null, 2)};
`;

await fs.writeFile(outputPath, output);
console.log(`Wrote ${entries.length} YouTube saved entries to ${outputPath}`);
