import type { RecipeCardEntry } from "@/lib/recipe-card-types";

type InstagramSavedRecipeAnalysis = Partial<
  Pick<RecipeCardEntry, "title" | "description" | "ingredientGroups" | "methodGroups">
>;

// Structured from the full captions visible in Curtis's signed-in Instagram Saved · Food collection.
// Entries without published quantities or directions remain inspiration cards rather than inferred recipes.
export const instagramSavedReelAnalysis: Record<string, InstagramSavedRecipeAnalysis> = {
  "instagram-saved-Da_glhdBoVB": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Salad",
        "items": [
          "5 oz baby arugula",
          "1 hard-boiled egg",
          "¾ cup freshly grated Parmigiano Reggiano, plus more for serving",
          "Freshly cracked black pepper"
        ]
      },
      {
        "title": "Lemon Dijon Vinaigrette",
        "items": [
          "3 tbsp extra virgin olive oil",
          "1 tbsp fresh lemon juice",
          "1 tsp Dijon mustard",
          "1 tsp lemon zest",
          "1 small garlic clove, finely grated",
          "Salt & freshly cracked black pepper"
        ]
      },
      {
        "title": "Anchovy Parmesan Panko",
        "items": [
          "½ cup panko breadcrumbs",
          "2 tbsp extra virgin olive oil",
          "3 anchovy fillets, finely minced",
          "2 tbsp finely grated Parmigiano Reggiano",
          "Freshly cracked black pepper"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Directions",
        "steps": [
          "Whisk together the olive oil, lemon juice, Dijon, lemon zest, garlic, salt, and pepper until emulsified.",
          "Heat the olive oil in a skillet over medium heat. Add the anchovies and cook for about 30 seconds, stirring, until they melt into the oil. Add the panko, stirring often until golden, about 5 minutes. Remove from the heat and immediately stir in the Parmesan and a few cracks of black pepper.",
          "Lightly dress the arugula with the vinaigrette and transfer to a plate. Grate the hard-boiled egg over the salad. Sprinkle the anchovy Parmesan panko evenly over the egg, then finish with grated Parmigiano Reggiano."
        ]
      }
    ]
  },
  "instagram-saved-DaiY-_dIFXX": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Grainy caramel: Caramelize the sugar correctly",
          "Melt sugar and glucose syrup into a golden syrup.",
          "If the final caramel later on turns grainy, the sugar has crystallized instead of of staying smooth.",
          "Avoid crystallisation by NOT whisking while the sugar is melting - only gently swirl the pan.",
          "Bitter caramel: Cook the caramel to the right color",
          "Cook the caramel to 180°C - 185°C a golden amber color.",
          "Cooking it less will give a too mild caramel flavor, while cooking it too long will make it taste bitter.",
          "Seized caramel: Add the cream correctly",
          "Making a good caramel is all about avoiding a big temperature difference.",
          "That’s why the milk and cream need to be hot, before adding them to the caramel.",
          "If the caramel turns hard and sticks to the whisk when you add the cream, the cream was too cold.",
          "Add the hot cream gradually while whisking to avoid hard lumps.",
          "Caramel texture: Cook it to the right temperature",
          "If the caramel cooked too low, the caramel will stay runny. If it’s cooked too high, it can become too firm.",
          "I cook the caramel to 110°C for a pipeable texture, blend in room-temperature butter, and let it cool until pipeable."
        ]
      }
    ]
  },
  "instagram-saved-DaIpfgQhkBL": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "7g jasmine tea",
          "5g pink peppercorns",
          "250ml water at 200 degrees Fahrenheit",
          "225g jasmine peppercorn tea (this will be how much is left after steeping)",
          "150g peach nectar",
          "45g ume plum syrup",
          "25g lemon juice",
          "1g vanilla paste",
          "12 drops 25% saline",
          "150g oat milk"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Steep the jasmine tea and peppercorns in the preheated water for 3 minutes before straining it and adding it to the rest of the base ingredients.",
          "Combine all the ingredients except for the oat milk in a carafe and stir to combine. In a separate carafe or cambro, add the oat milk and then pour the tea and juice mixture into it. Allow it to sit and form small curds for 15 minutes. Pour the curdled mixture through a coffee filter and let it fully filter through. Repeat the process by pouring the once-clarified liquid back through the bed of curds for a secondary finer filtration. Repeat again if the milk punch is still cloudy. Fully chill the milk punch before serving over ice."
        ]
      }
    ]
  },
  "instagram-saved-DaPxwU7COXS": {
    "title": "Japanese European-Style Beef Curry",
    "description": "A detailed Japanese European-style curry formula translated from the creator’s Cantonese caption. The caption supplies a long spice blend and the final simmering times, but only brief process notes.",
    "ingredientGroups": [
      {
        "title": "Beef and curry base — 5 to 6 servings",
        "items": [
          "600 g Japanese wagyu short ribs",
          "20 g vegetable oil",
          "100 g carrot",
          "15 g garlic",
          "30 g Japanese leek",
          "500 g red wine",
          "100 g onion (about 1/2 onion; optionally caramelized first)",
          "20 g butter",
          "100 g tomato (about 1/2 tomato)"
        ]
      },
      {
        "title": "Spice blend",
        "items": [
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
          "5 g black garlic (about 1 clove)"
        ]
      },
      {
        "title": "To finish",
        "items": [
          "15 g flour (optionally toasted until light brown)",
          "800 g beef stock",
          "20 g dark chocolate",
          "15 g honey or maple syrup",
          "30 g apple purée",
          "30 g espresso",
          "15 g fruit jam",
          "3 g salt",
          "120 g light cream, optional for a cream curry",
          "20 g light cream, optional for plating"
        ]
      },
      {
        "title": "Beef stock note",
        "items": [
          "1.2 kg beef bones",
          "3.5 L water"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Published method",
        "steps": [
          "For the beef stock, blanch the beef bones, add the water, and simmer for 4–6 hours, reducing to about 1.2 L.",
          "The caption suggests caramelizing the onion and toasting the flour to a light brown before adding them, if desired.",
          "Combine the curry base, spice blend, stock, and finishing ingredients except the beef and optional cream. Simmer gently for 1 hour.",
          "Add the beef and simmer gently for 1–1.5 hours, until the mixture reaches a sauce-like consistency.",
          "For a cream curry, add the 120 g cream at the end. Use the remaining cream for plating if desired."
        ]
      }
    ]
  },
  "instagram-saved-DZ8Hz3TJker": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Sauce recipe is",
        "items": [
          "1/4 cup fish sauce",
          "2tsp lime juice",
          "2 tsp rice vinegar",
          "1/4 cup water",
          "2 tbsp sugar",
          "Chopped garlic and chili paste :)"
        ]
      }
    ],
    "methodGroups": []
  },
  "instagram-saved-DXwqH9DoOn3": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "1kg Tomatoes, hulled, finely chopped, and well drained",
          "½ Courgette, grated and squeezed dry",
          "1 Onion, finely chopped",
          "3 Spring onions, finely sliced",
          "A Large handful of fresh mint, finely chopped",
          "1 Tbsp chopped fresh parsley, basil, or dill",
          "½ Tsp cumin",
          "3 Tsp dried oregano",
          "2 Tbsp breadcrumbs",
          "50g cornflour",
          "75g Plain flour",
          "1 Tsp baking powder",
          "100g Crumbled Feta (Optional)",
          "Salt and black pepper, to taste",
          "vegetable oil, for frying"
        ]
      }
    ],
    "methodGroups": []
  },
  "instagram-saved-DX4QD-aITZ8": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Preheat the oven to 180°C.",
          "Mix sugar, egg whites and salt.",
          "Add the flour, then the melted butter until you get a very liquid dough.",
          "On a baking sheet covered with baking paper, spread the dough very thinly (until smooth)",
          "Bake for 8 to 10 minutes: The dough must be well brown.",
          "At the oven outlet, let it cool → it becomes very crispy.",
          "Crumbs by hand: you get your paper"
        ]
      }
    ]
  },
  "instagram-saved-DZpEfolpMNK": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "1 pre-prepared tart shell",
          "750 ml milk",
          "100g sugar",
          "2 whole eggs",
          "15g corn flour",
          "15g AP flour",
          "Pinch of salt",
          "50g Butter",
          "Cinnamon for dusting"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Heat milk over the stove until barely simmering, remove from heat.",
          "Whilst milk is heating, mix together eggs, sugar, both flours and salt in a bowl, whisk together until combined.",
          "Slowly pour half the hot milk into the egg mixture while whisking to temper the eggs",
          "Pour mixture back into the saucepan on the stove and cook over medium heat while stirring constantly",
          "Once thickened completely, whisk in the butter, then pour into the prepared tart shell.",
          "Work quickly to smooth custard into tart shell, as a skin will form very quickly as it cools.",
          "Allow to cool for half an hour at room temperature before dusting with cinnamon and transferring to the fridge to set (minimum 3 hours)"
        ]
      }
    ]
  },
  "instagram-saved-DZfJsGuoczK": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "What I used for 1 serving",
        "items": [
          "1 duck leg"
        ]
      },
      {
        "title": "The Chili Paste",
        "items": [
          "3 dried chilies",
          "3 garlic cloves",
          "1 shallot"
        ]
      },
      {
        "title": "The Stir-fry Aromatics",
        "items": [
          "1/2 lemongrass stalk, chopped",
          "3 g galangal, chopped",
          "½  shallot, sliced",
          "1 pinch salt"
        ]
      },
      {
        "title": "The Dressing",
        "items": [
          "½  lime",
          "1 tsp fish sauce",
          "1 tbsp toasted rice powder",
          "1 tsp chili flakes",
          "1 culantro leaf, chopped",
          "1 green onion, chopped",
          "1 shallot, sliced fresh"
        ]
      },
      {
        "title": "The Crispy Topping & Garnish",
        "items": [
          "5 kaffir lime leaves",
          "3 dried chilies",
          "1 tbsp crispy fried onions  or crispy garlic"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "How I made it",
        "steps": [
          "Debone the duck leg and separate the skin from the meat. Slice the skin into small pieces, then mince the duck meat finely using a knife.",
          "Render the duck skin pieces in a pan over medium heat until they are completely crispy. Remove the crispy skin and set it aside, keeping the rendered duck fat in the pan.",
          "In a dry pan, toast the chili paste ingredients (3 dried chilies, 3 garlic cloves, and 1 shallot) with a small splash of water until deeply fragrant, then pound them together in a mortar and pestle to make a paste.",
          "In the pan with the rendered duck fat, fry 5 kaffir lime leaves and 3 whole dried chilies until crisp, then set them aside for the topping.",
          "In that same pan with the remaining fat, sauté the stir-fry aromatics (chopped lemongrass, galangal, and half of the sliced shallot) until fragrant. Add the minced duck meat, the pounded chili paste, and a pinch of salt. Cook until the duck is fully done.",
          "Transfer the cooked duck to a mixing bowl. Mix in the dressing ingredients (fresh lime juice, fish sauce, toasted rice powder, chili flakes, chopped culantro, chopped green onion, and the fresh sliced shallots). Toss everything together well.",
          "Plate the laab and top it generously with the crispy duck skin, crispy fried onions/garlic, fried whole chilies, and fried kaffir lime leaves."
        ]
      }
    ]
  },
  "instagram-saved-DZHju6cxaGB": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "1/4 cup verjuice",
          "1 tablespoon white wine vinegar",
          "Finely diced eshallot or white onion",
          "Pinch of saffron",
          "100g diced COLD butter",
          "Finely chopped chives",
          "Salt and pepper"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Add everything except the butter and chives to a small pot and simmer until reduced by 3/4. Add in cold butter cubes 1-2 at a time while whisking. You’ll create a glorious sauce once all the butter emulsifies. Mix in chives before serving."
        ]
      }
    ]
  },
  "instagram-saved-DZFyM_GO3wM": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Brownie",
        "items": [
          "1/4 cup unsalted butter, melted",
          "1/4 cup brown butter",
          "1/4 cup granulated sugar",
          "1 egg, room temperature",
          "1 tsp vanilla extract",
          "1/4 cup all purpose flour",
          "1/4 cup unsweetened cocoa powder",
          "1/8 tsp baking powder",
          "1/8 tsp salt"
        ]
      },
      {
        "title": "Mochi",
        "items": [
          "1/2 cup glutinous rice flour",
          "2 tbsp cornstarch",
          "1/2 cup milk",
          "1 tbsp sugar",
          "1 tbsp unsalted butter, room temperature"
        ]
      },
      {
        "title": "Cheesecake",
        "items": [
          "16oz cream cheese, room temperature",
          "1/2 cup sugar",
          "3 large eggs, room temperature",
          "2 tbsp corn starch",
          "1 tsp vanilla extract",
          "1 cup heavy cream"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Bake brownie at 350 F for 15-18 min, then bake again at 400 F for 40-45 min",
          "Chill for 4 hours or overnight"
        ]
      }
    ]
  },
  "instagram-saved-DZE0FeHR42i": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "1 frozen basa",
          "3 tbsp water",
          "50g tapioca starch",
          "50g rice flour",
          "1/2 tsp salt",
          "1/2 tsp sugar",
          "100g hot water",
          "1/2 cup chicken stock",
          "3 tbsp soy sauce",
          "1 tbsp sugar"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Slice into chunks then blend until a white opaque paste is formed. Add water tablespoons at a time if caught in blender/food processor. No more than 3 tablespoons.",
          "Add all dry ingredients into a separate bowl, combine before adding hot water in one go to form slurry. Blend with fish until homogenous.",
          "Wipe surface and adhere one large sheet of cling film. Spray or brush a thin layer of oil to prevent sticking. Spread fish mixture into a 1-2mm layer before decorating with scallions and dried shrimp. Spray or brush a thin layer of oil on top before enclosing with another sheet of cling film. Fold and poach in just shy of simmering water for five minutes.",
          "Combine in a saucepan and stir over medium heat until sugar dissolved.",
          "Serve with scorched oil and seasoned soy sauce."
        ]
      }
    ]
  },
  "instagram-saved-DY1zy_5CcUV": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients A",
        "items": [
          "1.6kg of beef brisket or beef chuck, diced into 4cm chunks",
          "800ml of coconut cream",
          "400ml of coconut milk",
          "1 tbsp of chicken powder",
          "1 tbsp of Sugar",
          "2 tsp of salt",
          "4 tbsp of palm sugar",
          "1 cup of vegetable oil for stir fry",
          "1/2 cup of kerisik (Toasted Desiccated Coconut)"
        ]
      },
      {
        "title": "Ingredients B, to blend",
        "items": [
          "100g of chili",
          "15 cloves of garlic",
          "3 medium onions, chopped",
          "30g of ginger, cut into small pieces",
          "30g of turmeric, cut into small pieces",
          "6 candlenuts",
          "30g of galangal, cut into small pieces",
          "4 stalks lemongrass, chopped",
          "100ml of vegetable oil or more, to blend"
        ]
      },
      {
        "title": "Ingredients C",
        "items": [
          "5 bay leaves",
          "8 kaffir lime leaves",
          "4 lemongrass, chopped",
          "8 cloves",
          "3 cinnamon sticks",
          "4 cardamoms",
          "4 star anises"
        ]
      },
      {
        "title": "Seasoning",
        "items": [
          "2 tsp of coriander ground",
          "2 tsp of turmeric ground",
          "2 tsp of white pepper",
          "2 tsp of cinnamon",
          "11.Serve with hot steamed rice and enjoy!"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Steps",
        "steps": [
          "Cut the beef into 4cm chunks and do not cut the beef into smaller pieces as they will break down during the cooking.",
          "Add all of the Ingredients B in a blender or food processor. Then, blend it or give it a blitz until all the become a thick paste.Set aside",
          "In the heavily-bottomed pan, heat the vegetable oil over medium-high heat.",
          "Then, pour the paste (from Ingredients B into the pan and cook the paste until fragrant for 2 minutes.",
          "Add the “Ingredients C” to the pan and stir to mix.",
          "Next, add the “Seasoning” and followed by chicken powder, sugar and salt to the pan. Cook the paste until fragrant (the paste will change color to red-brown ish)",
          "Add the beef to the pan and cook the beef until it is lightly browned.",
          "Add coconut milk into the pan and stir to combine. Then, add coconut cream and bring it to simmer.",
          "Cover and simmer in low heat for 4 hours until the beef is tender and the sauce thickens. (Stir it periodically to prevent the meat from burning)",
          "Once the sauce has thickened and released reddish oil, add palm sugar, kerisik and give it a mix until the sauce is reduce and it turns into dark brown",
          "11.Serve with hot steamed rice and enjoy!"
        ]
      }
    ]
  },
  "instagram-saved-DY2M8jXhylY": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "350 g banana without skin",
          "1.75 g amylase",
          "1.5 g pectinex",
          "Pinch ascorbic acid",
          "1.5 oz Nikka Coffey Malt",
          "5 oz Butter Monochrome",
          "1 oz Banana Water",
          "125 or less oz vanilla liqueur"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Blend banana with Amylase and ascorbic acid, then cook sousvide at 149 F for 3 hours. Place in an ice bath and let it come to body temperature, ~90 F. Add pectinex, stir, and wait an hour, then pour through a filter to extract the banana water.",
          "Combine all ingredients in a mixing glass, stir with ice, then serve over a large cube. Garnish with a banana palmier."
        ]
      }
    ]
  },
  "instagram-saved-DYueGiCyKcQ": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "21 day dry aged pekin duck, budosansho duck jus"
        ]
      }
    ],
    "methodGroups": []
  },
  "instagram-saved-DYkKyIthfk9": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "7.5g jasmine pearls",
          "500ml hot water",
          "75g sugar",
          "2.5g citric acid",
          "Butterfly pea flowers, to color",
          "1 can guava juice",
          "3 g Xanthan gum",
          "1.8 g Methocel F50"
        ]
      },
      {
        "title": "Cocktail",
        "items": [
          "3 oz jasmine cordial",
          "1.5 oz gin",
          "0.25 oz elderflower liqueur"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Steep jasmine pearls in hot water for 10 minutes, then strain. While warm, stir in sugar and citric acid until dissolved. Add butterfly pea flowers and stir until the cordial shifts into a deep purple.",
          "Blend with a milk frother until aerated, then add to a whipper. Charge with N2O and refrigerate for 2 hours.",
          "Stir with ice, strain over a large cube, and top with guava foam."
        ]
      }
    ]
  },
  "instagram-saved-DYPGFk7Mopk": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "Price: ~£2.99 per 1kg",
          "Protein: 12.5%",
          "W-Rating: 270-290",
          "The Recipe 🍕",
          "150g Sourdough Starter",
          "638g Caputo Nuvola Flour",
          "389g Water",
          "25g Extra Virgin Olive Oil",
          "10g Honey",
          "10g Salt"
        ]
      }
    ],
    "methodGroups": []
  },
  "instagram-saved-DYRlQ4QMt0v": {
    "title": "Striped Bass with Saffron Beurre Blanc and Fried Zucchini Flowers",
    "description": "Translated from the creator’s French reel caption. The original post calls the fish “bar rayé” and serves it with saffron beurre blanc, salmon roe, and a very light sparkling-water batter.",
    "ingredientGroups": [
      {
        "title": "Fish",
        "items": [
          "1 fine striped-bass fillet",
          "Butter, for basting",
          "Salt, to taste"
        ]
      },
      {
        "title": "Saffron beurre blanc",
        "items": [
          "About 100 ml white wine",
          "About 150 ml water",
          "A generous pinch of saffron",
          "Thyme",
          "Rosemary",
          "Lemon juice, to taste",
          "About 150 g cold butter, cubed",
          "1 tbsp salmon roe"
        ]
      },
      {
        "title": "Fried zucchini flowers",
        "items": [
          "3 zucchini flowers",
          "Flour, as needed",
          "Very cold sparkling water, as needed",
          "Vegetable oil, for frying"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Saffron beurre blanc",
        "steps": [
          "Combine the saffron, water, white wine, a little lemon juice, thyme, and rosemary in a small pan. Reduce by two-thirds at a gentle simmer.",
          "Strain and return the reduction to the pan over low heat. Whisk in the cold butter a few cubes at a time. Turn off the heat before adding the last of the butter, then continue whisking until emulsified.",
          "Fold in the salmon roe, adjust the seasoning, and serve immediately."
        ]
      },
      {
        "title": "Zucchini flowers and fish",
        "steps": [
          "Mix flour with enough very cold sparkling water to make a thin batter. Remove the pistils from the zucchini flowers, dip them briefly in the batter, and fry at 170°C until lightly golden and crisp.",
          "Sear the bass skin-side down in a hot pan. Turn as needed and baste with foaming butter until just cooked.",
          "Plate the fish with the saffron beurre blanc and fried zucchini flowers."
        ]
      }
    ]
  },
  "instagram-saved-DYOVgCASXpv": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "600g skin-on, bone-in chicken thighs",
          "1½ tbsp light soy sauce",
          "1½ tbsp oyster sauce",
          "1½ tbsp fish sauce",
          "1 tbsp dark soy sauce",
          "1 tsp sugar",
          "3 garlic cloves, minced",
          "1 knob ginger, grated",
          "Zest + juice of 1 lime",
          "1 stalk lemongrass, finely chopped",
          "1 tbsp oil",
          "2–3 Thai chillies",
          "1 tbsp Thai red curry paste",
          "½ cup coconut milk",
          "2–3 kaffir lime leaves (optional)",
          "Thai basil",
          "Crispy fried eggs with runny yolk"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Sear the marinated chicken thighs skin-side down in a pan over medium-low heat until golden and crispy.",
          "Flip and cook through, around 6–8 minutes each side. Set aside to rest.",
          "In the same pan, add Thai chillies and red curry paste. Sauté until fragrant.",
          "Pour in the coconut milk, add kaffir lime leaves and Thai basil, then simmer until slightly reduced.",
          "Serve over steamed rice with the curry sauce underneath, sliced chicken on top, and finish with a crispy fried egg 🤤",
          "✨ Smoky charred chicken, creamy coconut curry & that runny yolk… unreal combination."
        ]
      }
    ]
  },
  "instagram-saved-DYMpcvxRrCh": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "2 potatoes",
          "4 soft-boiled eggs (one is topping)",
          "Half cucumber",
          "Bacon",
          "(Dressing)",
          "2 tbsp of Greek yogurt",
          "2 tbsp of mayonnaise",
          "1 tbsp of mustard",
          "2 tbsp of milk",
          "Black pepper",
          "In a pot, Add water enough to cover 4 eggs completely",
          "Bring to a boil",
          "Carefully add eggs in a pot and cook for 6 minutes",
          "Take them out to the ice water and leave for about 5-10 minutes"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Soften potatoes",
          "Make soft boiled eggs",
          "Slice cucumber and add a bit of salt and leave it for about 5 minutes to squeeze out the water",
          "Make crispy bacon",
          "Make dressing in a bowl",
          "In a dressing bowl,",
          "Smash potatoes and boiled eggs",
          "Topped with soft-boiled egg and sprinkle some black pepper",
          "Enjoy🫶🫶🫶"
        ]
      }
    ]
  },
  "instagram-saved-DXsn5rGAj40": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "8 eggs (@peteandgerrys )",
          "10 tbsp melted & unsalted butter.",
          "1 sleeve ritz crackers or golden rounds.",
          "2 tbsp chives + a lot more for topping.",
          "8 oz cream cheese.",
          "4 oz creme fraiche.",
          "1 shallot (brunoise).",
          "1/2 tsp onion powder.",
          "1/4 tsp white pepper.",
          "1 lemon (zest).",
          "Caviar to taste (@imperiacaviar )"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Directions",
        "steps": [
          "Add your eggs to boiling water for 8 minutes. Shock in ice water for 15 min before peeling and halving. I want the whites fully set and the yolks semi-runny and tender.",
          "Add the crackers to a food processor and pulse until semi pulverized. Add in 7 tbsp melted butter and the chives. Pulse until incorporated.",
          "Line your springform pan (I'm using an 8 in) with 2 overlaping layers of plastic wrap.",
          "Press the crackers really well and set in the fridge for about 30 min.",
          "Whip the cream cheese with the lemon zest, white pepper and onion powder until smooth and set aside.",
          "To the food processor add in the eggs, 1 tbsp of the cream cheese, a pinch of salt, remaining melted butter and pulse until semi smooth. Add in shallots and pulse 1-2 times until incorporated. Add black pepper to taste and adjust salt.",
          "Spread the egg on top of the cracker base and set for 30-60 min in the fridge.",
          "Mix in the creme fraiche into the cream cheese and spread on top of the egg. Set for 12 hrs in the fridge.",
          "Unmold and clean the edges, add chives, caviar and that's it."
        ]
      }
    ]
  },
  "instagram-saved-DXuSKNVCcie": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "You need to add 100ml white wine to the bag before sealing to create the steam."
        ]
      },
      {
        "title": "For the peppercorn sauce",
        "items": [
          "Once reduced add 200ml fish or chicken stock and reduce this by 2/3.",
          "Happy cooking",
          "Adam x"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Add back the juices from cooking your skate. Now add 50ml double cream, bring to the boil and finish with the green peppercorns, chopped parsley, and serve with the fish.",
          "Firstly, sweat down 2 diced shallots in a knob of salted butter. Add 1 tsp crushed black peppercorns and continue to cook, now add 120ml red wine vinegar and reduce this fully.",
          "Now add 50ml double cream, bring to the boil and finish with the green peppercorns, chopped parsley, and serve with the fish."
        ]
      }
    ]
  },
  "instagram-saved-DXX5fpmEQ16": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "2 pork belly slices",
          "1 stalk green onion whites",
          "2 knobs of ginger",
          "1tbsp salt",
          "1tbsp cooking wine"
        ]
      },
      {
        "title": "dressing",
        "items": [
          "1 shallot",
          "1/2c cilantro",
          "2tbsp toasted rice powder",
          "1tbsp chili paste (i used @bahnhao jeow)",
          "2tbsp fish sauce",
          "juice from 2 limes",
          "1/4c pineapple juice",
          "2tbsp sugar",
          "1tbsp sweet soy sauce (can sub reg soy)",
          "1/4c oil from the pork belly",
          "pho noodles",
          "lettuce"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "boil pork belly in ginger, green onion, salt and cooking wine for 30 mins then pat dry -sear pork belly on all s ides until its nice and crispy/charred then slice -to make the dressing, add all the seasonings listed and then the noodles and give it a good mix -assemble the pork in a bowl with the noodles and serce with a side of lettuce + enjoy!"
        ]
      }
    ]
  },
  "instagram-saved-DXHQdWijZ6p": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Pasta recipe",
        "items": [
          "375g 00 flour",
          "125g semolina",
          "4g salt",
          "125g yolks",
          "125g whole eggs",
          "20-30g saffron infused milk",
          "25g extra virgin olive oil"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Mix the flour, semolina and salt on your work surface, then form a mound and make a well in the centre.",
          "Add the eggs, yolks, saffron milk and olive oil. Bring everything together, then knead for 5–10 minutes until you have a smooth dough.",
          "Wrap the dough in a ziplock bag or cling film and rest it in the fridge for at least 4–5 hours, or freeze if not using the next day.",
          "It takes a bit of practice to get the feel of the dough right. You’re looking for a firm but smooth texture. If it feels too dry, you can add a tiny bit of water, but it’s easier to manage by holding back about 10% of the flour to begin with. That way, you can add a little more flour as needed if the dough turns out too soft or sticky."
        ]
      }
    ]
  },
  "instagram-saved-DWuPBMJCTop": {
    "title": "Slow-Roasted Leg of Lamb with Balsamic Glaze",
    "description": "A very low-temperature leg of lamb with a sharp balsamic glaze and crisp fried herbs and spices, transcribed from the creator’s reel caption.",
    "ingredientGroups": [
      {
        "title": "Lamb",
        "items": [
          "1 bone-in leg of lamb",
          "80 g mustard powder",
          "20 g salt",
          "10 g black pepper"
        ]
      },
      {
        "title": "Balsamic glaze",
        "items": [
          "Reserved lamb juices",
          "300 ml balsamic vinegar"
        ]
      },
      {
        "title": "Crisp garnish",
        "items": [
          "30 g yellow mustard seeds",
          "30 g caraway seeds",
          "About 2 cups mint leaves",
          "About 2 cups parsley leaves",
          "Neutral oil, for deep-frying",
          "Salt, to taste"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Slow roast",
        "steps": [
          "Cut around the shank and score the lamb’s fat cap.",
          "Combine the mustard powder, salt, and black pepper. Sift the rub over the lamb and work it into the scored meat.",
          "Wrap the lamb tightly in foil and set it in a roasting tray.",
          "Cook in a 60°C / 140°F oven until the centre reaches 57°C / 135°F, about 12–24 hours. The longer cook produces more tender meat.",
          "Remove the lamb and strain the roasting juices into a saucepan."
        ]
      },
      {
        "title": "Glaze, garnish, and finish",
        "steps": [
          "Add the balsamic vinegar to the lamb juices and reduce by about two-thirds, until the glaze coats a spoon.",
          "Heat the frying oil to 150°C / 300°F. Fry the mustard seeds, caraway seeds, mint, and parsley until dry and the bubbling stops, then drain.",
          "Increase the oven to 260°C / 500°F. Roast the lamb for 5–10 minutes, until browned and crisp.",
          "Season to taste, coat with the warm balsamic glaze, and finish generously with the crisp seeds and herbs."
        ]
      }
    ]
  },
  "instagram-saved-DV1A-90jK1P": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "2 oz Gentian Amaro @lofiaperitifs",
          "1 oz Faccia Bruto Centerbe @faccia_brutto_spirits",
          "1.5 oz Acid Adjusted Fluffy Sumo Juice",
          "3/4 oz Sumo Oleo",
          "Pinch of salt",
          "Optional: Tajin garnish"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Add all ingredients to shaker and shake with ice, strain out ice and dry shake or use frother to whip up."
        ]
      }
    ]
  },
  "instagram-saved-DV0i_GSDIG-": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "40g dried Kashmiri chillies",
          "40g dried spicy chillies",
          "80g shallot",
          "40g garlic",
          "25g shrimp paste",
          "30g dried anchovies",
          "30g tamarind pulp",
          "70g dark palm sugar",
          "1 cup neutral oil"
        ]
      },
      {
        "title": "Water",
        "items": [
          "Salt (approximately 1 tsp)"
        ]
      }
    ],
    "methodGroups": []
  },
  "instagram-saved-DVs1GcCsIAQ": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "1 Chicken",
          "1 Bulb of Garlic",
          "Olive Oil",
          "Salt",
          "2 Egg Yolks",
          "1 Tbsp Dijon Mustard",
          "40g White Wine Vinegar",
          "1/2 Lemon Juice",
          "1 Raw Garlic Clove",
          "200g Vegetable Oil",
          "100g Olive Oil",
          "2 Anchovies",
          "Parmesan, to taste",
          "Salt, to taste",
          "Black Pepper, to taste"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Preheat the oven to 200°C",
          "Season to taste with extra lemon, parmesan, salt and pepper."
        ]
      }
    ]
  },
  "instagram-saved-DVqNFy7Ecr4": {
    "title": "Kau Kee-Style Clear Beef Brisket Noodles (九記清湯牛腩)",
    "description": "A Cantonese clear beef-brisket soup inspired by Hong Kong’s Kau Kee, translated from the creator’s reel caption. The herbs are grouped by the seasons suggested in the caption; research their suitability before using medicinal herbs.",
    "ingredientGroups": [
      {
        "title": "Beef broth — 6 servings",
        "items": [
          "1.8 kg beef bones",
          "1.2 kg beef brisket",
          "5.2 L distilled or mineral water, preferably soft water",
          "15 g rock sugar",
          "20 g salt, or about 1% of the finished broth weight",
          "10 g Vietnamese fish sauce, or about 0.5% of the finished broth weight"
        ]
      },
      {
        "title": "Spice sachet",
        "items": [
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
          "3 g goji berries"
        ]
      },
      {
        "title": "Optional seasonal herbs",
        "items": [
          "Spring: 1 g astragalus root",
          "Summer: 2 g Solomon’s seal, 1 g chuanxiong rhizome, and 1 g amomum fruit",
          "Autumn/winter: 3 g dried longan, 1 g Chinese angelica, 2 g Chinese yam, 1 g codonopsis root, 2 g angelica dahurica, 1 g sand ginger, and 1 g costus root"
        ]
      },
      {
        "title": "Aromatic soy sauce",
        "items": [
          "35 g light soy sauce",
          "35 g dark soy sauce",
          "35 g water",
          "4 g Maggi seasoning",
          "3 g white sugar",
          "25 g Chinese slab sugar",
          "3 g rock sugar",
          "5 g shallot",
          "5 g scallion",
          "1 g coriander"
        ]
      },
      {
        "title": "For each bowl",
        "items": [
          "60 g yi mein noodles",
          "200 g cooked brisket",
          "Aromatic soy sauce, to taste",
          "2 g butter",
          "200 g clear beef broth",
          "Sliced scallion, to finish"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Simmer the beef bones in 5.2 L water for 6 hours, reducing the liquid to about 2.8 L.",
          "Add the spice and herb sachet, beef brisket, and rock sugar. Simmer gently for another 2 hours, reducing to about 2 L.",
          "Turn off the heat, cover, and leave to infuse for 4 hours.",
          "Bring the broth back to a boil and season with the salt and fish sauce.",
          "Cook the noodles and assemble each bowl with brisket, aromatic soy sauce, butter, hot broth, and scallion."
        ]
      }
    ]
  },
  "instagram-saved-DUzvAWviZlS": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "Makes 4 servings of 250 g each",
          "~ 347 Kcal | 20 G P | 25 g F | 12 g C per serving",
          "Ingredients (using ~500 g bone-in chicken)",
          "Nut & coconut paste",
          "10–15 cashews",
          "10 almonds",
          "3 tbsp desiccated coconut",
          "Water, as needed"
        ]
      },
      {
        "title": "Marinade",
        "items": [
          "500 g bone-in chicken",
          "½ cup thick curd",
          "1½ tbsp ginger-garlic paste",
          "2–3 slit green chilies",
          "1 cup browned onions",
          "Handful mint leaves",
          "Handful coriander leaves",
          "1 tbsp green chili sauce",
          "1 tbsp red chili sauce",
          "2 tsp dark soy sauce",
          "¼ tsp turmeric powder",
          "2–3 tbsp Kashmiri chili powder (for color - adjust acc to spice)",
          "1 tbsp coriander powder",
          "1 tsp garam masala",
          "Salt & pepper to taste",
          "1 tbsp lemon juice",
          "2 tsp ghee",
          "For cooking",
          "1 tbsp neutral oil",
          "Few curry leaves",
          "2 tsp fresh cream",
          "Chopped coriander leaves"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Blend cashews, almonds, desiccated coconut, and water into a smooth paste.",
          "In a large bowl, combine the nut paste with all the marinade ingredients.",
          "Add chicken and coat well.",
          "Heat oil in a heavy pan. Add curry leaves and let them crackle.",
          "Transfer the entire marinated chicken into the pan. Cook on low–medium heat, covered, for 40–45 minutes, stirring occasionally so the masala doesn’t burn.",
          "Once oil separates, the gravy deepens to a darker red, and the chicken becomes tender and almost fall-off-the-bone, add fresh cream and chopped coriander. Switch off heat.",
          "Rest for 10 minutes before serving. Serve with soft roti or rice.",
          "(Hyderabadi red chicken curry, shaadi wala chicken, wedding style chicken curry, Indian chicken gravy)",
          "Thinly slice 2 large onions, toss with a few drops of oil, microwave on high for 10-12 mins, stirring every two mins, until golden OR air fry at 180°C for 10–12 mins until browned."
        ]
      }
    ]
  },
  "instagram-saved-DTn2xeLAXCP": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "3.5 lb russet potatoes (peeled and grated).",
          "1/2 cup heavy cream (shamrock)",
          "1/2 cup duck fat or clarified butter.",
          "4 garlic cloves.",
          "1 rosemary sprig.",
          "1/2 tsp white pepper.",
          "1/2 tsp kosher salt + more for sprinkling.",
          "8 egg yolks.",
          "8 oz cream cheese (tillamook, room temp).",
          "Zest of 1 lemon."
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Directions",
        "steps": [
          "Add the duck fat to a saucepan with the garlic cloves and rosemary sprig. Let it come to a slow simmer and then turn to low. Let it sit for 10 min and turn the heat off. Let the garlic and rosemary infuse the fat.",
          "Mix the cream, salt and white pepper. Add in the potatoes and mix.",
          "Grease a baking dish (8x8). Overlap 2 parchment paper sheets over it. Add a bit of the duck fat on the bottom and then a layer of potatoes followed by more duck fat and a sprinkle of salt. Press well. Repeat 3 times. Press the potatoes well with your hands and add another parchment paper on top. Add another baking pan on top and let it bake at 300F for 1 hr 30 min. Turn oven off and let the potatoes sit there for 30 min.",
          "Remove from oven, add some cans on top of the other pan to press the potatoes. Let it cool on the counter and refrigerate 6-12 hrs.",
          "Remove from fridge, flip the potatoes onto a cutting board and still covered place in the freezer for 45 min.",
          "Fill a saucepan with 1/3 water and simmer. Add  yolks to a bowl and place over the  pot of water and lower to heat to low. Mix it and cook til slightly thickened and jammy. About 2 min, mixing non stop.",
          "Strain onto the cream cheese and add the lemon zest. Whip until smooth and you can refrigerate for 30 min to set.",
          "Cut them into rectangles.",
          "Fry until nice and golden on both sides in duck fat. about 10 min per side.",
          "Let them cool.",
          "Pipe the yolk cheese, add chives and caviar."
        ]
      }
    ]
  },
  "instagram-saved-DT1b1WVkfBU": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "2-3 oz tins smoked oysters (drained).",
          "8 oz cream cheese (Tillamook)",
          "2 tbsp japanese mayo.",
          "2 tbsp sour cream (Shamrock)",
          "2 tbsp chives + a lot more for topping.",
          "2 tbsp fresh dill.",
          "2 anchovy filets (optional).",
          "1/4 bunch parsley (separate the leaves from the stems and chop the leaves and stems).",
          "1/2 tsp franks red hot.",
          "2 tbsp pepperoncini + 2 tsp brine.",
          "Zest of 1 lemon.",
          "1.5 tsp lemon juice.",
          "1/2 tsp onion powder.",
          "1/4 tsp white pepper.",
          "1/2 tsp honey.",
          "2 tbsp jalapeños in brine (finely chopped).",
          "2 shallots."
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Directions",
        "steps": [
          "Thinly slice the shallots and add to a saucepan with olive oil. Turn heat to medium heat and once it simmers, turn it to medium low mixing often until golden.",
          "Add the cream cheese to a food processor and process until smooth.",
          "Add the oysters, 2 tbsp chives, 2 tbsp of the parsley, 2 tbsp dill, white pepper, onion powder, pepperoncini, the brine, lemon zest, lemon juice, honey, anchovies if using, franks, sour cream and mayo. Process until smooth. Adjust for salt and lemon.",
          "Mix in the chopped jalapeños and parsley stems. Chill for 20-30 min. The longer it sits, the flavors meld together.",
          "Layer dip, chives, parsley and crispy shallots as shown in the video.",
          "Serve with chips."
        ]
      }
    ]
  },
  "instagram-saved-DURwRipEc9g": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "1/2 cup + 2 tbsp Shamrock Farms Natural Sour Cream",
          "10 oz cream cheese",
          "3 strips of bacon",
          "3 tbsp tomato paste",
          "1 tsp celery salt (you can do ½, but I love that taste)",
          "1 tsp onion powder",
          "1/2 tsp garlic powder",
          "1/2 tsp smoked paprika",
          "1/4 tsp white pepper",
          "1-2 tsp horseradish (I did 2 but I love it strong, start with 1)",
          "2 anchovy filets (optional but it mimics the clam base from traditional mixers)",
          "1.5tbsp hot sauce (I am using buffalo)",
          "1 tsp Worcestershire sauce",
          "2 tbsp vodka",
          "1/4 cup pimento peppers (minced)",
          "1/8 bunch parsley (finely chopped, including stems)",
          "1-8oz  jar pitted Castelvetrano olives (drained)",
          "2 tbsp chives + more for topping",
          "Olive oil for topping",
          "Black pepper"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Directions",
        "steps": [
          "Cook your bacon in a pan on low heat until crispy. Set aside bacon and cut into pieces.",
          "Remove the fat from the pan, leaving behind 1 tbsp.",
          "Turn the heat up to medium and add in your tomato paste. Cook for 3 min. Let cool.",
          "Add your cream cheese and 1/2 cup Shamrock Farms Natural Sour Cream to a food processor and process until smooth.",
          "Remove 1/4 of the mixture and set aside.",
          "To the food processor add in spices, tomato paste, hot sauce, Worcestershire, anchovy, 1 tbsp vodka and horseradish. Process until smooth. Refrigerate for 1 hour.",
          "To the sour cream & cream cheese bowl, add remaining sour cream, the pimentos, parsley, chives and vodka. Add a pinch of salt. Mix.",
          "Pipe that mixture into the olives and crown with a piece of bacon.",
          "Pipe the dip, arrange the olives, drizzle with olive oil, chives, black pepper and serve with chips."
        ]
      }
    ]
  },
  "instagram-saved-DTkImh-E0Ns": {
    "title": "Pasta alla Nerano",
    "description": "A Korean creator’s deeply browned, nutty variation of pasta alla Nerano, translated and structured from the reel caption. The creator notes that the classic version is usually lighter and emphasizes zucchini’s sweetness.",
    "ingredientGroups": [
      {
        "title": "For 2 servings",
        "items": [
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
          "Freshly ground black pepper"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Slice the zucchini 2–3 mm thick. Fry until deep golden, or lightly charred for the creator’s more bitter and nutty version.",
          "Drain the zucchini on paper towels, then refrigerate for at least 2 hours. This concentrates its sweetness and gives it a pleasantly chewy texture.",
          "Finely grate and combine the Gouda and Parmigiano so they melt smoothly into the pasta water.",
          "Warm olive oil with the basil stems and crushed garlic. Once fragrant, remove and discard the aromatics.",
          "Add about 70% of the fried zucchini and a ladle of pasta water. Simmer while gently mashing the zucchini into a sauce.",
          "Add the cooked spaghetti, the remaining zucchini, and basil leaves. Toss vigorously to emulsify, adding the butter and salt to taste.",
          "Turn off the heat. Add the grated cheeses and toss quickly until they melt with the pasta water into a creamy sauce. Garnish with the reserved zucchini."
        ]
      }
    ]
  },
  "instagram-saved-DT0ll-0Aooa": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "1kg mixed bouillabaisse fish, filleted, scaled and pin boned",
          "1 carrot, diced",
          "1 onion, diced",
          "1 celery stalks, diced",
          "Sprig of thyme",
          "Sprig of rosemary, no stalk",
          "1 bay leaves",
          "2g saffron",
          "4 peppercorns",
          "1 tbsp coriander seeds",
          "1 tbsp fennel seeds",
          "2 star anise",
          "½ orange, zest",
          "100g brandy",
          "100g pernod",
          "250ml white wine",
          "½ orange, juice",
          "2 litres cold water",
          "4 tomatoes, diced",
          "200g passata",
          "1/2 bunch tarragon",
          "1 orange, zest"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Heat a large rondelle over medium heat with a generous amount of olive oil. Add the fish bones and trimmings and cook, stirring and scraping frequently, until they break down and a deep golden fond forms on the base of the pan. Do not allow to burn – this will take around 15/20 minutes.",
          "Add the diced carrots, onions, and celery. Season lightly, allow to sweat without colour, and cook until the vegetables release their moisture and the steam lifts the fond from the pan, at this point cover with a lid and remove from the heat for 5 minutes. Remove the lid and continue cooking until softened and lightly coloured.",
          "Add the coriander seeds, fennel seeds, peppercorns, star anise, saffron, orange zest, thyme, rosemary, and bay leaves. Sweat gently for 5 minutes until aromatic. Deglaze with the brandy and Pernod and reduce until nearly dry, then add the white wine and reduce again until the alcohol is cooked out.",
          "Add the orange juice, passata and cold water. Bring to the boil, don’t be tempted to skim at this stage. Reduce to a gentle simmer and cook for 40 minutes. In the last 10 minutes of cooking, add the fresh tomatoes",
          "Remove from the heat, blend the stock until smooth, then pass through a fine chinois, pressing well. Return to a clean pan and reduce by one third. Add the orange zest and tarragon and adjust seasoning."
        ]
      }
    ]
  },
  "instagram-saved-DTfi5BZCJxA": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "You’ll need",
        "items": [
          "6 Chicken thighs (skin on or off, you choose)",
          "Salt",
          "1 Lime",
          "Water; enough to cover the chicken",
          "2 Onions and 1 tomato",
          "1 tbsp crushed garlic",
          "1 tsp grated ginger",
          "1 fresh chilli",
          "2 tsp simba mbili spice mix",
          "1 tsp ground cumin",
          "2 cups  Coconut milk",
          "1 tsp Black pepper",
          "a little Olive oil (Al Wali) (ok a lot) @ndcmuscat"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Brine the chicken in salt, lime, and water.",
          "Cook the onions until soft (Shape doesn’t matter, it’s getting blended).",
          "Sauté the spices, add coconut milk, blend smooth.",
          "Add the chicken and slow-poach until just cooked.",
          "This is where the magic happens — the coconut milk makes it rich, silky, and luxurious.",
          "Never skip this step — it’s how the chicken stays juicy.",
          "Lightly oil, grill until charred.",
          "Return it to the coconut sauce to soak up all that creamy goodness.",
          "We had it with mkate wa ufuta (sesame bread)."
        ]
      }
    ]
  },
  "instagram-saved-DR1uig_jP8u": {
    "description": "Roasted cauliflower blended with silken tofu, miso, soy, coconut milk, and vegetable stock into a creamy plant-based ramen broth, transcribed from the creator’s reel caption.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "1 small cauliflower",
          "Olive oil spray",
          "300g silken tofu",
          "Drizzle oil",
          "2 tbsp white miso paste",
          "1 tbsp soy sauce",
          "400ml vegetable stock",
          "400ml coconut milk",
          "2 cloves garlic",
          "1 thumb-sized piece ginger",
          "3 x 100g packs ramen noodles",
          "Chilli oil and coriander, to finish"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Prep | Slice the cauliflower into florets | Dice the garlic and ginger | Slice spring onions",
          "Roast the cauliflower | Spread florets on the tray | Drizzle with olive oil + a pinch of salt | Roast for 20 mins until golden",
          "Make the creamy broth | Reserve some cauliflower for garnish | Add the rest to a blender with silken tofu, miso, soy sauce, coconut milk + veg stock | Blend until completely smooth | Heat a drizzle of oil in a saucepan, fry the garlic + ginger for 2 mins | Pour in the blended broth and bring to a gentle simmer (add a splash of water if needed to loosen)",
          "Cook the noodles | Cook ramen noodles according to packet instructions",
          "Assemble | Ladle noodles and broth into bowls | Top with crispy cauliflower | Finish with chilli oil + coriander"
        ]
      }
    ],
    "title": "Creamy Cauliflower Ramen"
  },
  "instagram-saved-DS1LtMICf9b": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "Tỉ lệ: 200g thịt : 1 thìa xốt đầy.",
          "Bánh cuốn chay: công thức bột tui pin trên page rùi nhá các bác tua lên là thấy liền"
        ]
      },
      {
        "title": "Grilled Pork Marinade",
        "items": [
          "200g pork : 1 heaping tbsp marinade.",
          "Rice Rolls:",
          "Dipping Sauce:"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Marinate Meat: 200g pork : 1 heaping tbsp marinade.",
          "Caramelize 3 tbsp sugar. Add 1 tbsp water, chili sauce, 4 tbsp oyster sauce, 3 tbsp fish sauce, 2 tbsp scallion oil, 1/2 tsp five-spice, garlic & fried shallots. Cool.",
          "Caramelize 1 tbsp sugar. Mix 5 water : 1 sugar : 1 fish sauce : 1 lime. Add citrus after cooling."
        ]
      }
    ]
  },
  "instagram-saved-DTCx0D4jFZ6": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "1 kg chicken ( I used thighs )",
          "2 cups of basmati rice",
          "3 tbsps yogurt",
          "1 tbsp ginger & garlic paste",
          "2 tbsps garam masala",
          "3 tbsp tandoori spices",
          "salt & pepper",
          "an onion",
          "1 tsp cumin seeds",
          "1 stick of cinnamon",
          "3 cardamom pods",
          "2 bay leaves",
          "3 cloves",
          "4 tbsp ghee",
          "3 cups water",
          "start by washing & soaking the rice for about 20 minutes"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "add the seasonings to the chicken & if you have time let it marinate or just place it in the oven at 180c for 40 minutes. Switch the broiler on and bake it for 10 minutes on high flipping half way through. ( you can do it in the air fryer as well )",
          "saute the sliced onions with the aromatics in 1 tbsp of ghee then add the rice. Give it a quick toast then add the seasoning and water.",
          "let the rice boil on high till it starts absorbing the water. For about 7 minutes. Then drop the heat to the lowest. Cover and let it cook for 20 minutes.",
          "top the rice with the chicken pieces. Garnish with coriander. Radish. Have it with raita and enjoy."
        ]
      }
    ]
  },
  "instagram-saved-DPIDiGhD75i": {
    "title": "Bánh Cuốn Hải Phòng",
    "description": "A Hải Phòng-style steamed rice-roll batter, pork filling, and sweet fish-sauce formula transcribed from the creator’s bilingual Vietnamese and English caption.",
    "ingredientGroups": [
      {
        "title": "Rice-roll batter",
        "items": [
          "1 cup rice flour",
          "1/2 cup tapioca starch",
          "1/2 cup potato starch",
          "2 cups cold water",
          "1 cup warm water, plus 1 cup more after resting",
          "1 cup hot water",
          "1 tsp salt",
          "2 tbsp shallot oil"
        ]
      },
      {
        "title": "Pork filling",
        "items": [
          "300 g minced pork",
          "Shallots, finely chopped, to taste",
          "20 g wood-ear mushrooms, finely chopped"
        ]
      },
      {
        "title": "Fish sauce",
        "items": [
          "1 tbsp caramelized sugar",
          "500 ml water or bone broth",
          "3 tbsp sugar",
          "4 tbsp fish sauce"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Published preparation",
        "steps": [
          "Mix the rice flour, tapioca starch, potato starch, cold water, first measure of warm water, and hot water. Rest for 30 minutes.",
          "Pour off 1 cup of liquid and replace it with 1 cup fresh warm water. Stir in the salt and shallot oil.",
          "Stir-fry the minced pork with shallots until the meat firms up. Add the wood-ear mushrooms and cook through.",
          "Combine the caramelized sugar, water or bone broth, sugar, and fish sauce for the dipping sauce.",
          "The caption does not publish the steaming and rolling procedure; open the original reel for the visual technique."
        ]
      }
    ]
  },
  "instagram-saved-DRx8E2SEqjf": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "200g pork mince",
          "100g prawn meat minced",
          "3 scallions sliced",
          "3 garlic cloves minced",
          "1 tbsp minced ginger",
          "2 tbsp Lee Kum Kee Gluten Free Panda Brand Oyster Sauce",
          "2 tbsp Lee Kum Kee Gluten Free Soy Sauce",
          "1 tbsp sugar",
          "250g snow peas",
          "2 tbsp cornstarch",
          "1 tsp dried anchovy minced/ 1 Italian anchovy",
          "1 tsp minced ginger",
          "1 tsp minced chilli",
          "3 tbsp neutral oil",
          "1 tbsp soy sauce",
          "1/2 tbsp oyster sauce",
          "1 tbsp white vinegar"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Combine filling ingredients until a uniform mass and sticky. Top and tail snow peas then use a skewer to open. Dust worn cornstarch then fill. Fry until golden brown. Serve with anchovy and ginger dressing 🥢"
        ]
      }
    ]
  },
  "instagram-saved-DPOzhcMk-2N": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "Butter 100g",
          "Garlic 4 cloves",
          "Shallots 60g",
          "Chilli padi 2 pc",
          "Nestum Cereal 1 Cup",
          "Pork Lard 3 Tbs",
          "Crispy Seaweed 1/2 cup",
          "Pork Floss 1/2 cup"
        ]
      }
    ],
    "methodGroups": []
  },
  "instagram-saved-DRvb5oUEnRt": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "For 1.2kg pork collar:"
        ]
      },
      {
        "title": "Marinade",
        "items": [
          "150g pitted dates",
          "100g hot water",
          "150g sugar",
          "25g MSG",
          "3g five spice",
          "3g ginger powder",
          "10g garlic powder",
          "2g white pepper",
          "40g roasted sesame paste",
          "140g light soy sauce",
          "2 cubes red ferm bean curd",
          "20g Chinese cooking wine",
          "20g oyster sauce",
          "40g hoisin sauce",
          "3 shallots/ 2 brown onions",
          "300g maltose",
          "50g honey",
          "100g water",
          "150g reserved marinade"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Blend and marinate for at least 8 hours or overnight. Bake at 250 degrees for 30 minutes on a wire rack over a foil lined baking sheet.",
          "Combine ingredients in a wide pan. Stir and simmer on medium low until reduced and caramelised. Lacquer pork then return to oven for 10 minutes. Meanwhile dilute any leftover caramel with pork drippings/stock/water. Dress over finished pork and enjoy!",
          "In a pan wide enough for each portion, brown alliums then halt frying with reserved marinade. Coat char siu three times returning to oven at 210 degrees for 15 minutes each."
        ]
      }
    ]
  },
  "instagram-saved-DROz7DEEkvL": {
    "title": "Eggplant Purée",
    "description": "A flexible eggplant purée for pasta, soup, or sauces, translated from the creator’s Korean reel caption. The caption publishes the compact formula but leaves the visual cooking technique to the reel.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "3 eggplants",
          "100 g olive oil",
          "3 garlic cloves",
          "50 g lemon juice"
        ]
      }
    ],
    "methodGroups": []
  },
  "instagram-saved-DQaqb3pj-Wy": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Dough",
        "items": [
          "300g flour",
          "3G salt",
          "10g sugar",
          "160g water"
        ]
      },
      {
        "title": "Filling",
        "items": [
          "500g chicken feet; manicured,  blanched & rinsed",
          "2 scallion stalks",
          "3 Coriander stalks",
          "2 slices ginger",
          "3 dried scallops",
          "1/2 tsp sichuan peppercorns",
          "2 star anise",
          "Braise for 45 minutes. Reserve chicken feet and refrigerate stock.",
          "300g chicken mince",
          "3 scallions, sliced",
          "3 tbsp fine sliced coriander",
          "1 small red chilli, minced",
          "1 tbsp minced ginger",
          "3 garlic cloves minced",
          "1 tbsp sesame oil",
          "2 tbsp oyster sauce",
          "1/2 tsp salt",
          "1 tsp sugar",
          "1 tsp flour",
          "3 tbsp neutral oil"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Combine flour salt sugar. Stir through water until shaggy. Knead and combine, rest for one hour.",
          "Combine with flesh of feet and stock jelly. Mix in one direction until a sticky uniform mass.",
          "Heat oil then pour over flour. Stir to combine.",
          "Roll dough into half cm thickness. Lacquer with oil paste then coil into log. Divide into eight pieces. Fold edges over to encapsulate layers and form into spheres. Rest for twenty minutes.",
          "Form pies with 2 tbsp of filling in each. Fry on medium low until golden and cooked through. Enjoy with dipping sauce of scallions ginger chilli sugar and white vinegar."
        ]
      }
    ]
  },
  "instagram-saved-DPvl2l-kXMy": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "357.5g bread flour + 25g for yudane",
          "231g whole milk",
          "55g water",
          "22g sugar",
          "11g honey",
          "3.3g instant yeast",
          "7.7g salt",
          "28g bacon fat (room temp)",
          "4 rashers bacon"
        ]
      }
    ],
    "methodGroups": []
  },
  "instagram-saved-DO51cspkxrK": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "4 chicken thighs",
          "Cooking oil spray",
          "🌿 Marinade",
          "1 tsp garlic powder",
          "¼ tsp black pepper",
          "1 tsp salt",
          "1 tsp paprika",
          "1 tbsp baking powder (for the skin only)",
          "💫 Flour Coating",
          "½ cup all-purpose flour",
          "½ cup cornstarch",
          "A few drops of water",
          "🧈Gravy",
          "3 tbsp unsalted butter",
          "3 tbsp flour",
          "½ tsp black pepper",
          "Chicken bouillon or broth (about 1 to 1½ cups, adjust as needed)",
          "📝 Steps"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Mix the garlic powder, black pepper, salt, and paprika in a bowl. Rub it all over the chicken thighs.",
          "Sprinkle baking powder on just the skin. ❗️This is the key to getting it crispy!",
          "In a container, mix the flour and cornstarch. Add a few drops of water for the crispy bits on the skin.",
          "Add the chicken to the container, close the lid, and shake well to coat the chicken evenly.",
          "Place the chicken in the air fryer, skin side down. Spray lightly with oil. Air fry at 190°C for 12 minutes.",
          "Flip the chicken so it’s skin side up. Spray again with oil and air fry for another 10 to 12 minutes, or until golden and crispy.",
          "Melt the butter in a pan over low heat. Stir in the flour and keep stirring until it turns golden brown.",
          "Slowly pour in the chicken broth while whisking so it stays smooth.",
          "Add black pepper and keep whisking until the gravy thickens. Enjoy! 🫶🏻"
        ]
      }
    ]
  },
  "instagram-saved-DNyOZf6XJ1b": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Sponge cake",
        "items": [
          "33g hazelnut paste Irca",
          "16g egg yolk",
          "20g butter",
          "36g milk chocolate Reno 34%",
          "82g egg white",
          "38g sugar",
          "20g flour",
          "80g Delicrisp praline noir Irca"
        ]
      },
      {
        "title": "Caramel layer",
        "items": [
          "90g Toffee caramel Irca",
          "30g roasted peanuts"
        ]
      },
      {
        "title": "White mousse",
        "items": [
          "33g milk",
          "1g gelatine 240B",
          "60g white chocolate Reno 31.5%",
          "65g cream 33-35%"
        ]
      },
      {
        "title": "Caramel mousse",
        "items": [
          "84g milk",
          "34g hazelnut paste",
          "3.2g gelatine 240B",
          "19g water",
          "112g caramel chocolate Sinfonia",
          "208g cream 33-35%"
        ]
      },
      {
        "title": "Chocolate velour",
        "items": [
          "50g cocoa butter",
          "50g milk chocolate Reno 34%"
        ]
      }
    ],
    "methodGroups": []
  },
  "instagram-saved-DNp_Jeyz3e7": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "For the black curry powder",
        "items": [
          "1 ½ tbsp Sri Lankan roasted curry powder",
          "¾ tbsp chili powder"
        ]
      },
      {
        "title": "For the pork marinade",
        "items": [
          "1 kg pork shoulder, cut into 2 ½–3 inch pieces",
          "1 tbsp salt (or to taste)",
          "1 tsp turmeric powder",
          "1 tsp jaggery",
          "1 ½ tbsp freshly ground black pepper",
          "½ tbsp coconut vinegar",
          "1 tbsp prepared black curry powder"
        ]
      },
      {
        "title": "For the curry paste",
        "items": [
          "1 large red onion",
          "1 stalk lemongrass (white part only)",
          "5 garlic cloves",
          "1 inch knob ginger",
          "2 small green chilies",
          "2 sprigs curry leaves",
          "1 tbsp coconut oil"
        ]
      },
      {
        "title": "For the curry",
        "items": [
          "2–3 tbsp coconut oil",
          "Pork fat/lard trimmings (optional)",
          "½ cinnamon stick",
          "2 cloves",
          "2 cardamom pods",
          "Prepared curry paste",
          "Marinated pork",
          "2 cups water (or enough to cover pork)",
          "Remaining black curry powder",
          "1 pandan leaf",
          "1 piece garcinia (goraka)",
          "Salt to taste",
          "For garnish",
          "Fried curry leaves",
          "Fried julienned ginger",
          "Methods"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Roast roasted curry powder + chili powder 5–7 mins till almost black. Cool. Use 1 tbsp for marinade, reserve rest.",
          "Marinate pork with salt, turmeric, jaggery, black pepper, coconut vinegar + 1 tbsp black curry powder. Rest 1–4 hrs.",
          "Blend onion, lemongrass, garlic, ginger, green chilies, curry leaves + coconut oil into a smooth paste.",
          "Heat coconut oil, render lard if using. Add cinnamon, cloves, cardamom, fry 30 secs. Add curry paste, cook 10 mins till dark + oil splits.",
          "Add pork, sear 6–8 mins, coat well. Add water, remaining black curry powder, pandan + goraka. Simmer 1.5 hrs on low till tender + oil separates. Season with salt.",
          "Garnish with fried curry leaves + ginger. Serve with coconut roti or rice."
        ]
      }
    ]
  },
  "instagram-saved-DMqMS78tJYb": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "2 kgs lamb shanks",
          "2 large onions",
          "2 tbsps saffron water",
          "salt & pepper",
          "1 tsp turmeric powder",
          "splash of oil",
          "2 cups basmati rice",
          "1 packet of chopped dill",
          "1 packet of broad beans"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "add the sliced onions to the same pan with the shanks on top. Season with salt pepper turmeric and saffron water.",
          "cover the pan and let them cook on low heat for about 2 hours or till the shanks are literally falling apart.",
          "boil the soaked rice for about 7-8 minutes till 90% cooked. Then take a small amount and mix it with saffron water and a bit of dill. Mix the rest of the rice with dill.",
          "cover and place it in the lowest heat possible for 20-30 minutes to get a crispy bottom.",
          "serve the shanks on top of the rice with the onion sauce and enjoy."
        ]
      }
    ]
  },
  "instagram-saved-DMieQdZRVwS": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "Tempura flour — ½ cup",
          "Egg — 1",
          "Cold water — ⅔ cup",
          "Dip, coat with panko, and fry at 350°F (175°C) for 5–6 min until golden brown.",
          "Japanese comfort food at its best 🇯🇵"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Whisk: Tempura flour — ½ cup Egg — 1 Cold water — ⅔ cup"
        ]
      }
    ]
  },
  "instagram-saved-DHJ65LJh6UX": {
    "title": "Phở Gà (Vietnamese Chicken Pho)",
    "description": "A light, aromatic family-style Vietnamese chicken pho, transcribed from the creator’s reel caption. The caption publishes the process but not exact quantities, so adjust the seasoning to taste and open the original post for the creator’s complete presentation.",
    "ingredientGroups": [
      {
        "title": "Chicken broth",
        "items": [
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
          "Fish sauce"
        ]
      },
      {
        "title": "To serve",
        "items": [
          "Rice vermicelli noodles",
          "Fresh herbs",
          "Freshly ground black pepper"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Char the onions, shallots, and ginger until deeply aromatic.",
          "Simmer the whole chicken with the charred aromatics, salt, and rock sugar for 1 hour, skimming away any impurities.",
          "Toast the star anise, cinnamon, coriander seeds, and cloves. Add them to the broth with mushroom seasoning, MSG, and fish sauce.",
          "Strain the broth and shred the cooked chicken.",
          "Divide the vermicelli between bowls, add the chicken, and pour over the hot broth. Finish with fresh herbs and black pepper."
        ]
      }
    ]
  },
  "instagram-saved-DLdgNA8OYS5": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "8Cups water divided (4cups to soak rice and spices, 4 Cups to finish)",
          "1Cup jasmine rice",
          "3 small cinnamon sticks",
          "1 star anise",
          "1/4C almonds (optional)",
          "12oz evaporated milk",
          "12oz sweetened condensed milk",
          "1tsp Vanilla extract",
          "oven 350F for toasting"
        ]
      }
    ],
    "methodGroups": []
  },
  "instagram-saved-DHLE8qmI4m9": {
    "title": "Iraqi Dolma (دولمة عراقية)",
    "description": "An Iraqi mixed-vegetable dolma formula transcribed from the creator’s bilingual Arabic and English caption. The caption publishes the ingredients but not the cooking procedure.",
    "ingredientGroups": [
      {
        "title": "Vegetables",
        "items": [
          "5 large onions",
          "60 Swiss chard leaves",
          "50 vine leaves",
          "12 zucchini",
          "12 small eggplants"
        ]
      },
      {
        "title": "Lamb and rice stuffing",
        "items": [
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
          "Salt and black pepper"
        ]
      },
      {
        "title": "Pot base",
        "items": [
          "Lamb chops, as needed",
          "Green broad beans, as needed"
        ]
      },
      {
        "title": "Cooking sauce",
        "items": [
          "1 1/2 cups water",
          "6 tbsp tomato paste",
          "7 tbsp tamarind paste",
          "6 tbsp pomegranate molasses",
          "1 tbsp sugar",
          "1 1/2 tbsp stock powder",
          "Salt and black pepper"
        ]
      }
    ],
    "methodGroups": []
  },
  "instagram-saved-DIerl3uPDuz": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "45ml El Dorado 12",
          "7.5ml Mezcal",
          "10ml Amontillado Sherry",
          "22.5ml Vanilla & Lemongrass Cordial*",
          "3 dashes Cacao Bitters",
          "Coffee Foam **",
          "Grated Nutmeg",
          "Vanilla and Lemongrass Cordial",
          "3g Lemongrass Powder",
          "1 Vanilla Pod",
          "500ml Water",
          "8g Lactic Acid",
          "2g Citric Acid",
          "250g White Sugar",
          "1g Salt",
          "Sous vide 2 hours 66.5 Celsius",
          "500g Water",
          "50g Vanilla Syrup",
          "100g Simple Syrup",
          "100g Coffee",
          "2g Salt",
          "30g Black Garlic Pickle",
          "0.5g Xanthan Gum",
          "2.5g Methyl Cellulose",
          "ISI double charge"
        ]
      }
    ],
    "methodGroups": []
  },
  "instagram-saved-DC16bsDoCBg": {
    "title": "Extra-Creamy Vanilla Flan Pâtissier",
    "description": "Translated from the creator’s French reel caption. This tall flan uses a puff-pastry shell and a cream-enriched vanilla custard; the caption notes that its pastry-shell method follows Muriel Aublet-Cuvelier’s YouTube recipe.",
    "ingredientGroups": [
      {
        "title": "For a 14 cm × 6 cm ring",
        "items": [
          "500 g puff pastry",
          "Butter, for the ring",
          "Baking parchment",
          "Dried lentils or baking weights"
        ]
      },
      {
        "title": "Vanilla custard",
        "items": [
          "400 g whole milk",
          "240 g whipping cream, 35% fat",
          "2 eggs (120 g)",
          "90 g sugar",
          "20 g cornstarch",
          "1 vanilla bean"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Puff-pastry shell",
        "steps": [
          "Roll the puff pastry 5 mm thick and cut a strip 6.5 cm wide and 46 cm long. For a higher custard-to-pastry ratio, roll it 3 mm thick. Chill the strip.",
          "Roll another piece 3 mm thick and use the ring to cut a base disc.",
          "Butter the inside of the ring and line it with parchment. Fit in the pastry strip, trim it, add the base, and seal the join with a water-moistened finger.",
          "Line with an oven-safe roasting bag or parchment and fill with dried lentils to 1 cm below the rim. Bake in a 160°C fan oven for about 50 minutes. If needed, remove the weights and bake for another 10–15 minutes."
        ]
      },
      {
        "title": "Custard and final bake",
        "steps": [
          "Heat the milk, cream, and split and scraped vanilla bean over medium heat until the mixture begins to simmer.",
          "Whisk the eggs and sugar by hand for 1 minute without aerating them until pale. Add the cornstarch and whisk for another minute.",
          "Whisk the hot dairy into the egg mixture in three additions. Return everything to the saucepan and cook over medium heat, whisking constantly, for about 2 minutes. It should be thicker than crème anglaise but looser than pastry cream.",
          "Blend with an immersion blender until perfectly smooth, skim away the bubbles, and pour into the baked pastry shell.",
          "Refrigerate for 2 hours, then bake in a 210°C fan oven for about 25 minutes."
        ]
      }
    ]
  },
  "instagram-saved-DCEVL8JIgvm": {
    "title": "Toasted Coconut Foam",
    "description": "A siphon foam transcribed from the creator’s reel caption, originally served over milky oolong iced tea. Observe the manufacturer’s siphon-safety instructions and never open a pressurized siphon.",
    "ingredientGroups": [
      {
        "title": "Coconut infusion",
        "items": [
          "50 g coconut",
          "300 ml water"
        ]
      },
      {
        "title": "Foam",
        "items": [
          "100 ml whole milk",
          "70 ml cream",
          "50 g icing sugar",
          "1.3 g salt",
          "1.3 g methylcellulose",
          "0.15 g xanthan gum",
          "1 N₂O siphon charger"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Roast the coconut until fragrant and lightly toasted.",
          "Combine the toasted coconut with the water and infuse in the refrigerator for 48 hours, then strain.",
          "Add the milk and cream to the strained coconut infusion.",
          "Blend in the icing sugar, salt, methylcellulose, and xanthan gum until completely smooth.",
          "Transfer to a cream siphon, charge with N₂O according to the siphon manufacturer’s instructions, and chill before dispensing."
        ]
      }
    ]
  },
  "instagram-saved-DFawzTZR0NM": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "250g Banana Peel",
          "150g Unsalted Butter",
          "1 bottle Cachaça",
          "Time: 2 hours"
        ]
      }
    ],
    "methodGroups": []
  },
  "instagram-saved-DExhNNovoJl": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "2 oz | 60 ml Fat Washed Tequila Reposado*",
          "1/2 oz | 15 ml Licor 43",
          "2-4 Dashes Orange Bitters",
          "2 Drops of Saline Solution*",
          "Orange Peel"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Build into a mixing glass, stir, and strain over ice. Express a citrus peel over the top.",
          "Brown Butter/Coffee Fat Washed Reposado Tequila- combine 10 oz of tequila into a mason jar with 2 oz of browned liquid butter. Follow that 1-2 tbsps of coffee beans. Seal, shake, and let it sit in the freezer overnight. Strain infusion out through 2-3 coffee filters to remove particles. Once filtered, bottle the infused tequila and store in the fridge for up to 3 weeks."
        ]
      }
    ]
  },
  "instagram-saved-DD7eBV4yBJG": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "2 oz. / 60 ml. aged rum blend (Guyana or Barbados)",
          "1 oz. / 30 ml. sweet vermouth",
          "¼ oz. / 7.5 ml. maraschino liqueur",
          "3 dashes orange bitters",
          "10 drops Angostura bitters",
          "4 drops absinthe",
          "lime peel to stir",
          "lemon peel oil"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "METHOD",
        "steps": [
          "add all ingredients to mixing glass including lime peel / stir with ice until chilled / strain into a glass over a BFC / express two lemon peels over the surface and discard / no garnish",
          "Cheers! 🥂",
          "❤️ Daniel",
          "- -"
        ]
      }
    ]
  },
  "instagram-saved-DABXDc0ue_V": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "1 oz Luxardo Bitter Bianco",
          "1 oz Coconut oil washed gin",
          "1 oz Pandan infused white vermouth",
          "250 ml gin",
          "50 ml unrefined coconut oil",
          "2 g pandan",
          "200 ml white vermouth"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Add all ingredients into a mixing glass with ice and stir until cold. Pour over a large ice cube and garnish with a pandan leaf.",
          "Soak pandan and vermouth overnight, then strain."
        ]
      }
    ]
  },
  "instagram-saved-DD2Da4XPxIm": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "⦿ ¾ oz of Mango Liqueur",
          "⦿ ¼ of Fino Sherry",
          "⦿ chili tajin oil garnish"
        ]
      }
    ],
    "methodGroups": []
  },
  "instagram-saved-DAOtFhHOZMW": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Sous Vide Chicken Legs",
        "items": [
          "4 pieces of chicken drum legs (without bone)",
          "4 sous vide bags",
          "4 thyme sprigs",
          "Sea salt",
          "Neutral oil"
        ]
      }
    ],
    "methodGroups": []
  },
  "instagram-saved-C-acPZBumBA": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Recipe (makes about 3 servings)",
        "items": [
          "7.5 oz toasted rice infused rum",
          "6 oz pineapple juice",
          "3 oz acid adjusted mango juice",
          "3 oz coconut cream",
          "3 3/4 oz whole milk"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Rice infused rum: Toast dry rice until brownish, add ~1/4 c of rice into a jar with about 1.5C of rum. Let sit on the counter for about 2 hours until it smells like rice!"
        ]
      }
    ]
  },
  "instagram-saved-C-5kQidITdb": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "800 grams of overripe tomatoes",
          "1 cleaned shallot",
          "50 grams of sushi vinegar",
          "100 grams of ginger syrup",
          "5 grams of salt",
          "3 pieces of star anise",
          "5 black pepper corns",
          "2 sprigs of basil",
          "30 grams of fig leaves",
          "150 grams of sunflower oil."
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Cut the overripe tomatoes in four and transfer them into a blender. Also add the cleaned shallot together with the sushi vinegar, the ginger syrup, the salt, the star anise, the black pepper corns and the basil. Now blend it till smooth. Then pour the tomato on a sieve that’s lined with a rinsed clean kitchen towel and let it drain in your fridge for a couple of hours. After that pour the broth into a pan and reduce it till you’re left with 200 grams of liquid. Now bind the broth with a knife tip of Xanthan gum. You’ll end up with a beautiful clear and intense broth. Now for the fig leaf oil transfer the fig leaves into a blender and also add the neutral oil. I use sunflower oil. Then blend it till the temperature of the oil is 65 degrees Celsius. It will heat up from the friction. Once that’s done pour the oil on a super fine sieve and let it drain for a couple of hours in your fridge. Mix the broth and oil just before serving."
        ]
      }
    ]
  },
  "instagram-saved-C9KvuAmoLWN": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients from caption",
        "items": [
          "Marigold Ajo Branco:"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "soak 500g water, 100g almonds, 50g bread & salt for 20m then in blender very strong for at least 4m, add olive oil, and balance with marigol vinegar, and lemon juice to taste. Drain everything, and check seasoning."
        ]
      }
    ]
  },
  "instagram-saved-Cw71fkNLRzj": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "4.5 oz | 135 ml gin",
          "2 oz | 60 ml vanilla syrup (2:1 sugar to water)",
          "1 oz | 30 ml 6% citric acid solution",
          "3 oz Full Fat Greek Yogurt",
          "0.5 oz matcha powder",
          "white chocolate"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Combine all ingredients into a blender and then blend until smooth. Let sit in refrigerator for a few hours, then pour mix through a coffee filter/ cheesecloth. The liquid that comes out should be cloudy for a bit, then clear. once you notice the clarity, swap vessels, and pour the contents of the original vessel back through the filter. wait until all the liquid passes through. Bottle and store in fridge"
        ]
      }
    ]
  },
  "instagram-saved-CvhFG8QIVjT": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "180g spaghetti",
          "10 gamberi rossi medi",
          "Ingredients x2",
          "10 medium red prawns",
          "lime zest to taste",
          "extra virgin olive oil to taste"
        ]
      }
    ],
    "methodGroups": []
  },
  "instagram-saved-CuBwcfKJcwl": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "Bread flour: 1000g",
          "Egg whites: 450g",
          "Pasta madre: 500g",
          "Sugar: 420g",
          "Egg yolks: 520g",
          "Butter: 500g",
          "Salt: 15g",
          "Honey: 50g",
          "Take the dough of the mixing bowl and let rest for 20 minutes",
          "Or 160c in a convection oven for 30mins"
        ]
      }
    ],
    "methodGroups": []
  },
  "instagram-saved-Cqp00goJTYR": {
    "description": "Recipe details transcribed and organized from the creator’s Instagram reel caption. Open the original post below for the complete presentation and creator credit.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
          "100g Egg Whites",
          "200g Caster Sugar"
        ]
      },
      {
        "title": "Swiss Meringue",
        "items": [
          "125g Egg Whites",
          "250g Sugar",
          "17g Cornflour",
          "1 Tbsp Lemon Juice"
        ]
      },
      {
        "title": "Italian Meringue",
        "items": [
          "80g Egg Whites",
          "225g Caster Sugar",
          "50g Water"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Add the egg whites to a stand mixer and whisk on a medium low speed until you have a frothy mixture with small bubbles.",
          "With the mixer off, add a tbsp of the sugar then whisk on a medium speed for 20s. Then turn the mixer off, add another tbsp of sugar and mix again. This seems odd, but just prevents the sugar from flying all over the edge of the bowl. Once you’ve added all the sugar, scrape the sides to get ride of any excess granules. Then keep whisking for 10m on a medium speed (you can add any flavourings during this point too)",
          "Add it to a piping bag and pipe small meringue kisses. Bake at 90C/195F for 75 Minutes. Remove from the oven and cool.",
          "Add the egg whites and sugar to the bowel of a stand mixer. Place it over a pan of gently simmering water and whisk constantly until it reaches around 65C/149F on a digital thermometer.",
          "Remove it from the heat and place it on a stand mixer. Whisk for 7m or until the bowl is cool and you have a stiff meringue. Fold in cornflour, lemon juice any flavouring.",
          "Pipe into your desired shapes for a pavlova and bake at 90C/195F for 1h 40m",
          "Add the water + sugar to a small saucepan and cook to 118C/244F. Meanwhile whisk the whites on a medium speed. Slowly pour the hot sugar syrup over the frothy whites and whisk for 7m, or until stiff peaks and bowl is cool"
        ]
      }
    ]
  },
  "instagram-saved-DKH7n5hIBt7": {
    "title": "Duck Wellington",
    "description": "The reel caption publishes the finished Wellington components and baking instructions, but not the complete assembly formula. The information below is therefore kept as a partial recipe and service note rather than reconstructed.",
    "ingredientGroups": [
      {
        "title": "Published components",
        "items": [
          "Prepared duck Wellington, wrapped in spinach and chicken-truffle mousseline",
          "Egg wash, as needed",
          "Onion and port jus, to serve",
          "Gruyère AOP, potato, and guanciale croquette, to serve"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Baking",
        "steps": [
          "Preheat the oven to 200°C / 392°F with a baking tray inside.",
          "Brush the Wellington with two coatings of egg wash.",
          "Transfer to the preheated tray and bake for 20–28 minutes.",
          "Rest for 15 minutes, then slice and trim the edges. One duck portion yields two generous servings, or three smaller portions."
        ]
      }
    ]
  },
  "instagram-saved-DON3azNCC82": {
    "title": "Spanish Rice with Ibérico Pork, Mushrooms, and Foie Gras",
    "description": "A three-person Spanish rice dish translated from the creator’s reel caption, made with secreto ibérico, mixed mushrooms, Pedro Ximénez, saffron, and grated frozen foie gras.",
    "ingredientGroups": [
      {
        "title": "For 3 servings in a 46 cm paella pan",
        "items": [
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
          "Salt, to taste"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Sauté the secreto ibérico until lightly browned but not fully cooked, then reserve.",
          "Sauté the mushrooms and reserve them separately.",
          "Sweat the red onion, add the tomatoes, and cook until reduced.",
          "Stir in the pimentón briefly, then add the Pedro Ximénez and cook off the alcohol.",
          "Toast the rice in the sofrito, then return the pork and mushrooms to the pan.",
          "Pour in the hot roasted chicken stock and add the saffron infusion.",
          "Cook without disturbing for 16–17 minutes, or until the rice is done and the liquid has been absorbed.",
          "Finish by grating the frozen foie gras mi-cuit over the rice."
        ]
      }
    ]
  },
  "instagram-saved-C1ezQQaMhgH": {
    "title": "30-Minute Coffee Amaro",
    "description": "James Hoffmann’s rapid coffee amaro, reconstructed from the saved reel and checked against his complete published formula. The reel’s automatic subtitles incorrectly call Vietnamese cassia bark ‘cassava’; the ingredient below uses the corrected name.",
    "ingredientGroups": [
      {
        "title": "Coffee infusion",
        "items": [
          "200 g bourbon",
          "40 g coffee, ground close to espresso-fine",
          "55 g whole milk"
        ]
      },
      {
        "title": "Botanicals",
        "items": [
          "1.5 g dried bitter orange peel",
          "1.5 g gentian root",
          "0.5 g freshly grated Vietnamese cassia bark",
          "0.5 g freshly grated nutmeg",
          "1 allspice berry, crushed",
          "0.5 g Madagascan vanilla pod, minced"
        ]
      },
      {
        "title": "To finish",
        "items": [
          "60 g demerara sugar syrup, made with 2 parts sugar to 1 part water",
          "Saline solution, made with 20 g salt and 80 g water",
          "Ice, to serve",
          "Orange zest, optional garnish"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Coffee infusion and clarification",
        "steps": [
          "Add the bourbon and ground coffee to a cream whipper and swirl to combine.",
          "Charge with one nitrous-oxide cartridge and wait 4–5 minutes.",
          "Rapidly release the pressure, then strain the coffee-infused bourbon through a fine sieve.",
          "Pour the whole milk into a separate container. Stir constantly while pouring in the coffee-infused bourbon.",
          "Leave for 5 minutes, or refrigerate for up to 2 hours, then pass through a sieve lined with a paper filter to clarify."
        ]
      },
      {
        "title": "Botanical infusion",
        "steps": [
          "Return the clarified liquid to the cleaned cream whipper and add the bitter orange peel, gentian root, cassia bark, nutmeg, crushed allspice berry, and minced vanilla pod.",
          "Charge and immediately release one cartridge, then charge with a second cartridge.",
          "Infuse for 5 minutes, or up to 30 minutes for a stronger result. Release the pressure and strain through a paper filter.",
          "Stir in the demerara sugar syrup and bottle the finished amaro.",
          "Serve a measure over a large ice cube with a couple of drops of saline and an optional strip of orange zest. Alternatively, serve 1 part amaro with 3 parts good tonic water over ice."
        ]
      }
    ]
  },
  "instagram-saved-DX6P-4YMZeH": {
    "title": "Nori Cream Soba with Nori-Dressed Mussels",
    "description": "A seaweed-forward soba dish transcribed from Dirty Korean’s bilingual caption and creator recipe comment. The post publishes the nori-dressing ratio; the quantity for the separate smooth nori cream is not stated.",
    "ingredientGroups": [
      {
        "title": "Nori dressing",
        "items": [
          "1 egg yolk",
          "1/2 spoon nori crumble, as published",
          "50 g vinegar",
          "100 g oil",
          "Sugar, to taste",
          "Salt, to taste"
        ]
      },
      {
        "title": "To assemble",
        "items": [
          "Cooked soba noodles",
          "Soy sauce, to season the noodles",
          "Smooth nori cream",
          "Cooked mussels",
          "Perilla leaf sprouts"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Whisk the egg yolk with the nori crumble and vinegar, then slowly emulsify in the oil. Season the dressing with sugar and salt to taste.",
          "Season the cooked soba lightly with soy sauce and arrange it in a bowl.",
          "Spoon the smooth nori cream over the noodles.",
          "Dress the mussels with the nori dressing, arrange them over the soba, and finish with perilla leaf sprouts.",
          "The creator does not publish the separate nori-cream formula in the caption or visible comments; use the original reel for that visual component."
        ]
      }
    ]
  },
  "instagram-saved-DV5gDinkr0e": {
    "title": "Nori Carbonara Ramen",
    "description": "Dirty Korean’s seaweed carbonara ramen, transcribed from the reel’s creator comment. The comment supplies the ingredient weights and clarifies that the leaves are perilla rather than sesame leaves.",
    "ingredientGroups": [
      {
        "title": "For 1 serving",
        "items": [
          "3 egg yolks",
          "100 g Parmesan",
          "50 g perilla leaves",
          "40 g nori powder",
          "100 g bacon",
          "1 serving ramen noodles"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method reconstructed from the reel",
        "steps": [
          "Cook the bacon until browned and crisp, then reserve it.",
          "Cook the ramen noodles and reserve a little of their hot cooking water.",
          "Combine the egg yolks, Parmesan, perilla leaves, and nori powder into the carbonara base.",
          "Away from direct heat, toss the hot ramen with the carbonara base, loosening it with reserved cooking water until glossy and creamy.",
          "Fold through or finish with the bacon and serve immediately."
        ]
      }
    ]
  },
  "instagram-saved-DXhVjsRuKRc": {
    "title": "Goldtropfentorte (Tränenkuchen / Gold Drop Cake)",
    "description": "Christina Dynamite’s German ‘cake that cries,’ transcribed from the complete recipe she posted in the comments. Golden droplets naturally form across the meringue as the chilled cake rests overnight.",
    "ingredientGroups": [
      {
        "title": "Crust",
        "items": [
          "200 g flour",
          "75 g sugar",
          "75 g cold butter",
          "1 egg",
          "1 tsp baking powder",
          "Pinch of salt"
        ]
      },
      {
        "title": "Filling",
        "items": [
          "750 g Greek yogurt, 5% fat",
          "150 g sugar",
          "3 egg yolks",
          "2 packets vanilla pudding powder",
          "1 packet vanilla sugar",
          "Juice of 1/2 lemon",
          "150 ml avocado oil",
          "500 ml milk"
        ]
      },
      {
        "title": "Meringue",
        "items": [
          "3 egg whites",
          "100 g sugar"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Mix the crust ingredients, press into the base and sides of a parchment-lined 26 cm springform pan, and chill.",
          "Mix the filling ingredients until smooth and pour over the chilled crust.",
          "Bake on the middle rack at 180°C with conventional top and bottom heat for 45–50 minutes. The centre should remain slightly jiggly.",
          "Ten minutes before the cake finishes baking, whip the egg whites while gradually adding the sugar; continue to stiff peaks.",
          "Spread the meringue evenly over the cake and bake for another 15–20 minutes, until lightly golden.",
          "Gently poke holes across the meringue, return the cake to the switched-off oven with its door slightly open, and rest for about 15 minutes.",
          "Cool completely at room temperature, then cover and refrigerate overnight so the characteristic golden droplets form."
        ]
      }
    ]
  },
  "instagram-saved-DTXHsATk657": {
    "title": "Chả Giò Rế with Langoustine and Prawn",
    "description": "Khanh Ong and Oishimate’s crisp Vietnamese-style laced spring rolls, transcribed from the complete creator recipe posted in the reel comments.",
    "ingredientGroups": [
      {
        "title": "Laced wrappers",
        "items": [
          "500 g rice flour",
          "50 g tapioca starch",
          "50 g plain flour",
          "130 g caster sugar",
          "1 egg white",
          "2 tsp vegetable oil",
          "About 500 ml water",
          "Spray oil"
        ]
      },
      {
        "title": "Filling",
        "items": [
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
          "12 green prawns, peeled with tails left on"
        ]
      },
      {
        "title": "To serve",
        "items": [
          "Butter lettuce",
          "Fresh herbs",
          "Nước chấm"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Clean an empty food tin and drill small holes around its base from the inside out so the batter can flow evenly.",
          "Whisk all the wrapper ingredients into a thin, pourable batter.",
          "Heat a lightly oiled non-stick pan over medium heat. Fill the perforated tin with batter and drizzle it in circles to form a fine laced wrapper. Cook for 20–30 seconds until just set without flipping, then stack under a tea towel.",
          "Mix all the filling ingredients except the prawns until evenly combined.",
          "Place a wrapper lumpy-side down, spoon filling across the lower half, add a prawn, fold in the sides, and roll tightly. Seal with water.",
          "Deep-fry at 170°C for 3–4 minutes, until light golden and crisp.",
          "Cut diagonally and serve with butter lettuce, herbs, and nước chấm."
        ]
      }
    ]
  },
  "instagram-saved-DSeXUABiFrA": {
    "title": "Mom’s Egg Curry",
    "description": "Bhukkad in Town’s family egg curry, transcribed from the complete creator recipe in the reel comments. Its roasted onion-and-coconut masala is slowly cooked in mustard oil before the boiled eggs are added.",
    "ingredientGroups": [
      {
        "title": "Ingredients",
        "items": [
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
          "Fresh coriander, to garnish"
        ]
      }
    ],
    "methodGroups": [
      {
        "title": "Method",
        "steps": [
          "Dry-roast the sliced onions on a hot tawa without oil until deep brown.",
          "Add the coconut, mix, switch off the heat, and let it brown in the residual warmth.",
          "Cool slightly, then grind the onion and coconut with the garlic, ginger, cumin seeds, coriander seeds, cinnamon, cardamom, and green chillies into a smooth paste.",
          "Heat mustard oil in a pan. Add the paste and bhuno, stirring and frying, until the oil begins to release.",
          "Add the tomato purée, red chilli powder, ground coriander, ground cumin, turmeric, and salt.",
          "Cover and cook over low heat for 5 minutes, then uncover and bhuno again until the oil separates.",
          "Add enough water for the desired gravy consistency and season with garam masala or meat masala. Bring to a boil.",
          "Add the halved boiled eggs and simmer for 2–3 minutes.",
          "Garnish with fresh coriander and serve hot with phulka or rice."
        ]
      }
    ]
  }
};
