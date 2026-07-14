export type BenuRecipeComponent = {
  name: string;
  ingredients: string[];
  steps: string[];
};

export type BenuRecipe = {
  slug: string;
  title: string;
  image: string | null;
  imagePosition?: string;
  sourceNote?: string;
  components: BenuRecipeComponent[];
};

export const benuRecipes: BenuRecipe[] = [
  {
    slug: "thousand-year-old-quail-egg-potage-ginger",
    title: "Thousand-Year-Old Quail Egg, Potage, Ginger",
    image: "/benu/thousand-year-old-quail-egg.jpeg",
    imagePosition: "50% 47%",
    components: [
      {
        name: "Thousand-Year-Old Quail Eggs",
        ingredients: [
          "Brine of 5% salt, 4% lye and 1% pu-erh tea leaves",
          "Quail eggs",
        ],
        steps: [
          "Make enough brine to cover the eggs generously. Soak the eggs in the brine for 12 days.",
          "Rinse the eggs thoroughly under running room-temperature water until the water runs clear, then dry them. Seal them in an airtight plastic bag, place the bag in an opaque container and age at 68–77°F / 20–25°C for 4 weeks.",
        ],
      },
      {
        name: "Pickled Ginger",
        ingredients: [
          "2 parts water",
          "1 part Champagne vinegar",
          "1 part sugar",
          "Peeled fresh young ginger",
        ],
        steps: [
          "Bring the water, vinegar and sugar to a boil. Thinly slice the ginger into a bowl, pour the hot pickling liquid over it and allow it to cool.",
          "Vacuum-pack and refrigerate for at least 3 days before using.",
        ],
      },
      {
        name: "Potage",
        ingredients: [
          "5 g butter",
          "15 g bacon",
          "100 g Savoy cabbage, sliced",
          "30 g onion, chopped",
          "1 g salt",
          "Small pinch cayenne pepper",
          "80 g chicken stock",
          "10 g cream",
        ],
        steps: [
          "Melt the butter and sweat the bacon, cabbage and onion. Season with the salt and cayenne pepper.",
          "Cover with the chicken stock and cream. Bring to a boil, cover and simmer until tender, about 45 minutes.",
          "Remove and discard the bacon. Purée the soup and pass it through a chinois.",
        ],
      },
      {
        name: "Ginger Cream",
        ingredients: [
          "200 g cream",
          "300 g water",
          "6 g salt",
          "6 g sugar",
          "4 g xanthan gum",
          "20 g fresh ginger juice",
          "4 g Versawhip",
        ],
        steps: [
          "Bring the cream and water to a simmer. Blend with the salt, sugar and xanthan gum on low speed for 4 minutes.",
          "Add the ginger juice and Versawhip, transfer to an iSi canister and charge with 2 cream chargers.",
        ],
      },
      {
        name: "To Serve",
        ingredients: ["Salt", "Pickled ginger juice"],
        steps: [
          "Cook the eggs in boiling water for 1 minute, shock them in ice water and peel. Halve the eggs and season with salt and pickled ginger juice.",
          "Place chopped pickled ginger in each bowl, add the whipped ginger cream and eggs, and pour in the piping-hot potage.",
        ],
      },
    ],
  },
  {
    slug: "oyster-pork-belly-kimchi",
    title: "Oyster, Pork Belly, Kimchi",
    image: "/benu/oyster-pork-belly-kimchi.jpeg",
    imagePosition: "50% 45%",
    components: [
      {
        name: "Kimchi",
        ingredients: [
          "275 g Korean sea salt (chun il leum)",
          "200 g water",
          "1 kg napa cabbage, outer leaves removed",
          "15 g dried oysters, blanched and rinsed",
          "5 g fresh ginger",
          "10 g sugar",
          "10 g Korean chilli flakes",
          "75 g Asian pear juice",
          "30 g salted shrimp, chopped",
          "20 g garlic, chopped, blanched and rinsed",
          "30 g spring onions, sliced",
          "40 g daikon, julienned",
        ],
        steps: [
          "Dissolve 25 g of the salt in the water. Halve the cabbage, coat it with the brine and sprinkle the remaining salt evenly between the leaves. Leave cut-side up for 4 hours, turn and leave uncovered at room temperature for another 4 hours. Rinse briefly in cold water and drain.",
          "Blend the dried oysters, ginger, sugar, chilli flakes and pear juice until smooth. Combine with the salted shrimp, garlic, spring onions and daikon. Rub the seasoning between the cabbage leaves, one leaf at a time.",
          "Pack the cabbage into an airlock container lined with a plastic bag, pressing out the air and keeping the seasoning above the cabbage. Ferment at 84°F / 29°C for 36 hours. The pH should be below 4.2; continue fermenting if necessary.",
          "Repack in a clean bag, gently press out trapped gas and refrigerate for at least 1 week, or until the desired ripeness is reached.",
        ],
      },
      {
        name: "Kimchi for Stock",
        ingredients: [
          "500 g napa cabbage, outer leaves removed",
          "7.5 g sugar",
          "15 g salt",
          "25 g Korean chilli flakes",
          "10 g fresh ginger, chopped",
          "5 g garlic, chopped",
          "25 g fish sauce",
        ],
        steps: [
          "Mix all the ingredients, vacuum-pack and ferment at room temperature for 2–3 days, or until the bag is fully expanded.",
        ],
      },
      {
        name: "Kimchi Whip",
        ingredients: [
          "200 g kimchi for stock",
          "300 g water",
          "0.2 g sodium hexametaphosphate",
          "3.5 g low-acyl gellan gum",
          "0.5 g calcium gluconate",
          "100 g skimmed milk",
          "3 g sugar",
          "3 g salt",
          "12 g Simplesse®",
          "1.4 g xanthan gum",
          "0.8 g sodium citrate",
        ],
        steps: [
          "Bring the kimchi for stock and water to a simmer for 10 minutes. Remove from the heat, steep for 30 minutes and strain.",
          "Combine 350 g of the strained stock with the sodium hexametaphosphate and gellan gum. Bring slowly to a boil while whisking, then chill in a flat pan for about 6 hours.",
          "Blend with the remaining ingredients on low speed for 4 minutes to hydrate the xanthan gum. Whisk in a mixer to a dense foam.",
        ],
      },
      {
        name: "Kimchi Glass",
        ingredients: [
          "100 g kimchi for stock",
          "400 g water",
          "30 g glucose",
          "15 g Pure-Cote® B790",
          "15 g cornflour",
          "2 g water",
        ],
        steps: [
          "Simmer the kimchi for stock with the 400 g water for 10 minutes. Remove from the heat, steep for 30 minutes and strain.",
          "Blend 300 g of the strained stock with the glucose on low speed, then add the Pure-Cote. Bring to a boil. Mix the cornflour with the 2 g water, whisk it in and boil for about 1 minute.",
          "Chill over ice and rest for 1 day. Spray acetate, spread the stock evenly and air-dry at room temperature for 6 hours. Dehydrate at 149°F / 65°C for 1–2 hours, until dry.",
          "Steam until pliable, cut into approximately 1½-inch / 4-cm squares and form inside round square moulds. Dehydrate at 133°F / 56°C until dry and crisp.",
        ],
      },
      {
        name: "Kimchi Purée",
        ingredients: [
          "200 g kimchi for stock",
          "300 g water",
          "0.2 g sodium hexametaphosphate",
          "5 g low-acyl gellan gum",
          "0.4 g calcium gluconate",
        ],
        steps: [
          "Simmer the kimchi for stock and water for 10 minutes. Remove from the heat, steep for 30 minutes and strain.",
          "Combine 300 g of the strained stock with the sodium hexametaphosphate and gellan gum. Bring slowly to a boil while whisking, whisk in the calcium gluconate, then chill in a flat pan for about 6 hours.",
          "Purée until smooth.",
        ],
      },
      {
        name: "Bacon Powder",
        ingredients: ["150 g tapioca maltodextrin", "5 g salt", "110 g rendered bacon fat"],
        steps: [
          "Process the tapioca maltodextrin and salt in a food processor. Drizzle in the bacon fat and continue processing until it becomes a light, fluffy powder.",
        ],
      },
      {
        name: "Pork Belly",
        ingredients: ["100 g bacon"],
        steps: [
          "Remove the pellicle and blanch quickly in boiling water. Shock in iced water, vacuum-pack and cook at 165°F / 74°C for 12 hours. Cut into a small dice.",
        ],
      },
      {
        name: "To Serve",
        ingredients: ["6 oysters", "Kimchi"],
        steps: [
          "Shuck and trim the oysters. Rinse and chop the kimchi.",
          "Mix equal parts kimchi purée and diced pork belly and heat until piping hot.",
          "Put bacon powder in the bottom of each kimchi glass. Half-fill with the hot kimchi and pork mixture, add kimchi whip and top with an oyster.",
        ],
      },
    ],
  },
  {
    slug: "tofu-burdock-charred-scallion-vinaigrette",
    title: "Tofu, Burdock, Charred Scallion Vinaigrette",
    image: "/benu/tofu-burdock-charred-scallion-vinaigrette.jpeg",
    imagePosition: "50% 56%",
    sourceNote: "The supplied folder contains the plated-dish photograph and title page, but no ingredient or method page for this recipe.",
    components: [],
  },
  {
    slug: "shellfish-consomme-and-raft",
    title: "Shellfish Consommé and Raft with Aromatic Roots and Herbs",
    image: "/benu/shellfish-consomme-and-raft.jpeg",
    imagePosition: "50% 50%",
    components: [
      {
        name: "Shellfish Stock Consommé",
        ingredients: [
          "Rice bran oil",
          "300 g lobster bodies, rinsed and gills removed",
          "100 g shallots, sliced",
          "200 g button mushrooms, sliced",
          "200 g carrots, sliced",
          "100 g fennel, sliced",
          "2 kg water",
          "100 g tomatoes, chopped",
          "300 g chicken legs, blanched and rinsed",
          "40 g dried scallops, pulsed to a powder and rinsed",
          "20 g dried shrimp, pulsed to a powder and rinsed",
          "30 g cured ham, chopped (Jinhua is best; Ibérico or Smithfield also works)",
          "30 g fresh ginger, sliced",
          "50 g Shaoxing rice wine",
          "30 g tamari",
        ],
        steps: [
          "Cover the bottom of a pan with rice bran oil and heat until hot. Add the lobster bodies and brown lightly.",
          "Add the shallots, mushrooms, carrots and fennel and brown lightly. Add the remaining ingredients, bring to a boil and simmer for 1 hour.",
          "Strain and reduce to 1 kg.",
        ],
      },
      {
        name: "Aromatic Stock",
        ingredients: [
          "10 g dried astragalus",
          "10 g dried codonopsis",
          "10 g dried yam",
          "20 g dried red date",
          "30 g celery, sliced",
          "2 g star anise",
          "700 g shellfish stock consommé",
        ],
        steps: [
          "Rinse the dried roots, fruit and aromatics. Bring the shellfish stock to a boil, remove from the heat, add the aromatics, cover and infuse for 1 hour.",
        ],
      },
      {
        name: "Raft",
        ingredients: [
          "300 g shellfish stock consommé",
          "17 g cornflour",
          "30 g water",
          "20 g albumen powder",
          "2 g salt",
          "5 g sugar",
          "3 g sodium phosphate",
          "3 g Ajinomoto GS transglutaminase",
          "2 g xanthan gum",
          "150 g egg white",
          "150 g shrimp",
          "100 g scallops",
          "40 g Dungeness crabmeat, steamed and picked",
        ],
        steps: [
          "Bring the shellfish stock to a boil. Whisk the cornflour with the water, add it to the stock and cook for 2 minutes. Chill.",
          "When cool, combine with the albumen powder, salt, sugar, sodium phosphate, transglutaminase, xanthan gum and egg white. Blend on low speed for 4 minutes to hydrate the xanthan gum.",
          "Add the shrimp and scallops and blend on high speed until smooth. Fold in the crabmeat.",
        ],
      },
      {
        name: "To Finish",
        ingredients: ["600 g aromatic stock", "300 g raft mixture", "Lovage leaves", "Goji berry powder"],
        steps: [
          "Loosely whisk the aromatic stock with the raft mixture. Spoon into small bowls, cover with plastic wrap and steam for 8 minutes.",
          "Garnish with lovage leaves and goji berry powder.",
        ],
      },
    ],
  },
  {
    slug: "pigs-head-lentil-hozon-bonji",
    title: "Pig’s Head with Lentil Hozön and Bönji",
    image: "/benu/pigs-head-lentil-hozon-bonji.jpeg",
    imagePosition: "50% 47%",
    components: [
      {
        name: "Pig’s Head",
        ingredients: [
          "800 g water",
          "32 g salt",
          "56 g sugar",
          "12 g curing salt",
          "6 g black peppercorns",
          "12 g garlic, crushed",
          "1 whole pig’s head",
          "400 g chicken stock",
        ],
        steps: [
          "Dissolve the salt, sugar and curing salt in the water with the peppercorns and garlic to make the brine.",
          "Remove the cheeks, tongue, ears, face meat and fat from the head. Torch the ears, scrub them and rinse well. Brine everything except the cheeks for 8 hours, then drain.",
          "Vacuum-pack the brined pieces with 300 g of the chicken stock. Season the cheeks with salt and pepper and vacuum-pack with the remaining stock. Cook the cheeks at 176°F / 80°C for 12 hours and the other pieces at 165°F / 74°C for 12 hours.",
          "Line a rectangular mould with plastic wrap, leaving an overhang. Discard the cooking stock. While warm, shred the cheeks and cut the other pieces to fit the mould. Alternate the pieces in the mould, filling it just above the rim.",
        ],
      },
      {
        name: "Gel",
        ingredients: [
          "112 g Shaoxing rice wine, reduced to 67 g",
          "12 g sugar",
          "160 g water",
          "12 g soup soy sauce",
          "12 g red wine vinegar",
          "12 g Medjool dates",
          "35 g celery, thinly sliced",
          "4 g fresh ginger, thinly sliced",
          "1 g garlic, crushed",
          "Gelatine, bloomed",
        ],
        steps: [
          "Gently simmer all the ingredients except the gelatine. Cover, remove from the heat and infuse for 30 minutes, then strain.",
          "Weigh the liquid and add bloomed gelatine equal to 4.5% of its weight. Pour over the filled mould, wrap, top with a flat lid and weight, and refrigerate for 24 hours.",
        ],
      },
      {
        name: "Lentil Hozön",
        ingredients: ["300 g lentil hozön", "45 g water", "10 g rice bran oil"],
        steps: [
          "Purée the lentil hozön with the water until smooth. Drizzle in the rice bran oil, strain and vacuum to remove trapped air.",
        ],
      },
      {
        name: "Crispy Lentils",
        ingredients: ["75 g lentils", "150 g water", "2 g salt"],
        steps: [
          "Vacuum-pack the lentils, water and salt. Boil for 9 minutes, then strain and dry.",
          "Fry at 375°F / 190°C until crisp and season lightly with salt.",
        ],
      },
      {
        name: "Pickled Onion Rings",
        ingredients: [
          "White pearl onions",
          "Red onion, coarsely chopped",
          "Pickling liquid of 2 parts Champagne vinegar to 1 part water and 1 part sugar",
        ],
        steps: [
          "Slice the onions into thin rings and rinse in hot water for 30 seconds. Place in a bowl.",
          "Bring enough pickling liquid to a boil, pour it over the onion rings and leave for at least 1 day.",
        ],
      },
      {
        name: "To Finish",
        ingredients: ["Lentil bönji", "Carrots, thinly shaved", "Parsley leaves"],
        steps: [
          "Unmould the pig’s head and cut into thin slices. Rub a drop of lentil bönji on both sides of each slice.",
          "Garnish with lentil hozön, shaved carrots, crispy lentils, pickled onion rings and parsley leaves.",
        ],
      },
    ],
  },
  {
    slug: "lobster-coral-xiao-long-bao",
    title: "Lobster Coral Xiao Long Bao",
    image: "/benu/lobster-coral-xiao-long-bao.jpeg",
    imagePosition: "50% 44%",
    components: [
      {
        name: "Dough",
        ingredients: [
          "1 g instant yeast",
          "250 g water",
          "0.3 g salt",
          "225 g plain flour",
          "220 g cake flour",
          "2 g potassium carbonate and sodium bicarbonate solution",
        ],
        steps: [
          "For the starter, dissolve the yeast in 50 g of the water. Add the salt, 25 g of the plain flour and 50 g of the cake flour. Mix with a dough hook for about 4 minutes, then knead by hand until smooth. Cover and leave in a warm place until doubled, about 2 hours.",
          "Combine the remaining flours with 5 g of the risen starter and the potassium carbonate solution. Mix with a dough hook for about 5 minutes.",
          "Pass through an electric sheeter about 20 times, until smooth and elastic. Wrap and rest for 30 minutes.",
          "Cut into 4.5 g pieces and roll into thin circular wrappers.",
        ],
      },
      {
        name: "Filling",
        ingredients: [
          "360 g shellfish stock consommé (see Shellfish Consommé and Raft)",
          "15 g soy essence",
          "21 g gelatine, bloomed",
          "120 g lobster meat",
          "10 g lobster coral, passed through a sieve",
          "2 g salt",
          "80 g clarified butter, whisked with liquid nitrogen until shattered like coffee grounds",
          "16 g spring onion, finely chopped",
          "16 g fresh ginger, finely chopped",
        ],
        steps: [
          "Bring the shellfish consommé to a boil and whisk in the soy essence and gelatine. Refrigerate until set, then chop finely.",
          "Purée the lobster meat, coral and salt. Combine with the clarified butter, spring onion and ginger.",
          "Quickly mix in 380 g of the chopped consommé gel and divide into 15.6–15.9 g balls.",
        ],
      },
      {
        name: "Vinegar",
        ingredients: ["20 g water", "20 g Banyuls vinegar", "20 g black rice vinegar"],
        steps: ["Mix all the ingredients together."],
      },
      {
        name: "To Serve",
        ingredients: [],
        steps: [
          "Place one filling ball on each wrapper and seal with 18–20 folds.",
          "Steam in a bamboo steamer for 5 minutes and serve with the vinegar sauce.",
        ],
      },
    ],
  },
  {
    slug: "24-head-kippin-abalone",
    title: "24-Head Kippin Abalone from Iwate, 2008, Potato Purée, Braising Jus",
    image: "/benu/24-head-kippin-abalone.jpeg",
    imagePosition: "50% 43%",
    components: [
      {
        name: "Abalone and Braising Jus",
        ingredients: [
          "6 × 24-head dried Kippin abalone from Iwate, 2008",
          "¼ whole chicken",
          "100 g chicken feet",
          "300 g pork neck, cut into small pieces",
          "1.5 kg chicken stock",
          "40 g dried scallops, soaked for 6 hours and rinsed",
          "30 g cured ham, chopped (Jinhua is best; Ibérico or Smithfield also works)",
          "40 g rock sugar",
          "Tamari",
        ],
        steps: [
          "Cover the abalone with room-temperature water for several days, changing the water 3 times a day. After 4 days / 96 hours, refrigerate any abalone that are soft, out of the water. Soak firmer pieces for up to another 24 hours. Cut away the mouths.",
          "Blanch the chicken, chicken feet and pork neck in boiling water, return to a boil and rinse. Combine with the chicken stock, dried scallops and abalone. Simmer for 12–14 hours, until the abalone are soft.",
          "Add the ham and rock sugar and simmer for 1 hour. Strain, reserving the stock and abalone.",
          "Simmer the abalone in the stock until it is concentrated, slightly viscous and reduced to about 300 g, approximately 1 hour. Strain and season with 10–20 g tamari, to taste.",
          "Vacuum the air from the stock, return the abalone to it and refrigerate.",
        ],
      },
      {
        name: "Potato Purée",
        ingredients: ["100 g Yukon Gold potato", "20 g skimmed milk", "2 g salt", "40 g unsalted butter"],
        steps: [
          "Vacuum-pack the potato and cook at 194°F / 90°C for about 2 hours, until soft. Pass through a tamis.",
          "Bring the milk to a boil. Beat the butter and hot milk alternately into the potato in small additions. Season, pass through a chinois and keep warm.",
        ],
      },
      {
        name: "Romaine Lettuce",
        ingredients: ["6 heads romaine lettuce", "Rice bran oil", "Salt"],
        steps: [
          "Peel away the leaves until the stem is exposed with only a few leaves attached. Weigh the prepared lettuce and add rice bran oil equal to 3% of its weight and salt equal to 1%. Vacuum-pack.",
        ],
      },
      {
        name: "To Finish",
        ingredients: [],
        steps: [
          "Heat the abalone and sauce in a covered pan. Remove the lid and reduce until the glaze coats the abalone.",
          "Cook the bagged lettuce in boiling water for 3 minutes.",
          "Spoon the potato purée into bowls and finish with the abalone, braising jus and lettuce.",
        ],
      },
    ],
  },
  {
    slug: "sesame-white-cake-salted-plum-sauce",
    title: "Sesame White Cake with Salted Plum Sauce",
    image: null,
    sourceNote: "No separate plated-dish photograph was included in the supplied sequence.",
    components: [
      {
        name: "Sesame White Cake",
        ingredients: [
          "1 kg milk",
          "300 g white sesame seeds",
          "1.08 kg plain flour",
          "16 g salt",
          "52 g baking powder",
          "540 g egg whites, at room temperature",
          "560 g butter, slightly softened",
          "900 g sugar",
        ],
        steps: [
          "Heat the oven to 350°F / 180°C and line a sheet pan with baking paper.",
          "Blend the milk and sesame seeds on high speed for 3 minutes. Pass through a fine sieve without pressing on the pulp.",
          "Sift together the flour, salt and baking powder. Separately mix the egg whites with 900 g of the sesame milk and pass through a fine sieve.",
          "Beat the butter and sugar until light and fluffy, about 5 minutes. Alternate the wet and dry mixtures into the butter mixture, mixing until smooth.",
          "Spread on the prepared sheet pan and bake for 25–30 minutes, until golden. Cool.",
        ],
      },
      {
        name: "Sesame Buttercream",
        ingredients: [
          "40 g water",
          "70 g sugar",
          "30 g egg whites",
          "180 g butter, cut into small cubes",
          "4 g lemon juice",
          "6 g cold-pressed sesame oil, not toasted",
        ],
        steps: [
          "Cook the water and sugar to 240°F / 115°C. Whip the egg whites on medium speed and slowly pour the hot syrup into them.",
          "Whip the meringue for about 10 minutes, then cool for about 5 minutes. Add the butter gradually and whip until smooth. Add the lemon juice and sesame oil.",
          "Transfer to a piping bag fitted with a thin triangular tip.",
        ],
      },
      {
        name: "Salted Plum Sauce",
        ingredients: [
          "300 g fresh plums, peeled and pitted",
          "100 g water",
          "50 g umeboshi, pitted",
          "20 g sugar",
        ],
        steps: [
          "Combine all the ingredients and bring to a boil. Cover and simmer for 2 minutes, then purée and pass through a chinois.",
        ],
      },
      {
        name: "To Finish",
        ingredients: [],
        steps: [
          "Cut two circles from the cooled cake. Pipe buttercream over one, stack the second circle on top and cover the sides smoothly with buttercream. Decorate the top and serve with the salted plum sauce.",
        ],
      },
    ],
  },
];

export const benuRecipesBySlug = new Map(benuRecipes.map((recipe) => [recipe.slug, recipe]));
