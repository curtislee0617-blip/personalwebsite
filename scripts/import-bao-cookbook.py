#!/usr/bin/env python3
"""Build the private BAO cookbook dataset from rendered, visually reviewed pages.

The source is a photographed spread PDF. Apple Vision OCR is used only to
transcribe the already-rendered half-pages; the recipe/page map and all Larder
formulas below were checked against the rendered pages.
"""

from __future__ import annotations

import json
import math
import re
import shutil
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from PIL import Image, ImageChops, ImageEnhance, ImageStat


ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / "tmp/pdfs/bao"
OCR_DIR = WORK / "printed-ocr"
PAGE_DIR = WORK / "printed-pages"
BOOKS_DIR = ROOT / "lib/imported-cookbooks"
PUBLIC_DIR = ROOT / "public/imported-cookbooks"
IMAGE_DIR = PUBLIC_DIR / "recipes/bao-the-cookbook"
SOURCE_PDF = WORK / "bao-cookbook.pdf"
BOOK_ID = "bao-the-cookbook"


@dataclass(frozen=True)
class RecipeSpec:
    title: str
    category: str
    pages: tuple[int, ...]
    image_page: int | None = None
    subtitle: str | None = None


RECIPE_SPECS = [
    RecipeSpec("BAO", "BAO · Holy Grail", (48, 49), 47),
    RecipeSpec("Sesame BAO", "BAO · Holy Grail", (51,), 50),
    RecipeSpec("Classic Pork BAO", "BAO · Fillings", (53,), 52),
    RecipeSpec("Confit Pork BAO", "BAO · Fillings", (54,), 55),
    RecipeSpec("Daikon BAO", "BAO · Fillings", (57,), 56),
    RecipeSpec("Curry Cheese BAO", "BAO · Fillings", (58,), 59),
    RecipeSpec("Prawn Shia Song BAO", "BAO · Fillings", (61,), 60),
    RecipeSpec("Cod Black BAO", "BAO · Fillings", (63,), 62),
    RecipeSpec("Fried Chicken BAO", "BAO · Fillings", (65,), 64),
    RecipeSpec("Chicken Nugget BAO", "BAO · Fillings", (66,), 67),
    RecipeSpec("Breakfast Sausage BAO", "BAO · Fillings", (68,), 69),
    RecipeSpec("Lamb Shoulder BAO", "BAO · Fillings", (71,), 70),
    RecipeSpec("Shortrib BAO", "BAO · Fillings", (72,), 73),
    RecipeSpec("Fried Horlicks Ice Cream BAO", "BAO · Bakery Goods", (75,), 74),
    RecipeSpec("Sad Face BAO", "BAO · Bakery Goods", (76,), 77),
    RecipeSpec("Peach BAO", "BAO · Bakery Goods", (78, 79), 78),
    RecipeSpec("Coconut BAO Loaf", "BAO · Bakery Goods", (80,), 81),
    RecipeSpec("Soho House Pickles", "Xiao Chi · BAO Soho", (91,), 90),
    RecipeSpec("House Salad", "Xiao Chi · BAO Soho", (92,), 92),
    RecipeSpec("Sweet Potato Chips with Pickled Plum Ketchup", "Xiao Chi · BAO Soho", (93,), 93),
    RecipeSpec("Taiwanese Fried Chicken", "Xiao Chi · BAO Soho", (94,), 95),
    RecipeSpec("Pig’s Blood Cake with Soy-cured Egg Yolk", "Xiao Chi · BAO Soho", (97,), 96),
    RecipeSpec("Trotter Nuggets with Burnt Chilli Sauce", "Xiao Chi · BAO Soho", (98,), 99),
    RecipeSpec("Scallops with Yellow Bean Garlic", "Xiao Chi · BAO Soho", (101,), 100),
    RecipeSpec("Guinea Fowl Rice", "Xiao Chi · BAO Soho", (102, 103), 102),
    RecipeSpec("40-day Aged Beef Rump Cap with Aged White Soy", "Xiao Chi · BAO Soho", (104,), 105),
    RecipeSpec("Braised Pork Skin Sushi", "The Bar · BAO Fitz", (113,), 112),
    RecipeSpec("Whipped Tofu with Century Eggs", "The Bar · BAO Fitz", (114,), 115),
    RecipeSpec("Raw Oyster in Mee Shua Broth", "The Bar · BAO Fitz", (117,), 116),
    RecipeSpec("Beef Cheek and Tendon Nuggets", "The Bar · BAO Fitz", (119,), 118),
    RecipeSpec("Half Roasted Chilli Chicken with Aged White Soy", "The Bar · BAO Fitz", (120,), 121),
    RecipeSpec("XO Sweetcorn and Ox Heart with Beef Butter", "The Bar · BAO Fitz", (123,), 122),
    RecipeSpec("Bone Marrow Rice with Fermented Daikon", "The Bar · BAO Fitz", (124,), 125),
    RecipeSpec("Peanut Ice Cream Roon Bing with Coriander", "The Bar · BAO Fitz", (127,), 126),
    RecipeSpec("Borough House Pickles", "Grill House · BAO Borough", (137,), 136),
    RecipeSpec("Yu Shiang Boiled Eggs", "Grill House · BAO Borough", (139,), 138),
    RecipeSpec("Cold Smoked Aubergine with Panko BAO", "Grill House · BAO Borough", (140,), 141),
    RecipeSpec("Homestyle Pork Jowl", "Grill House · BAO Borough", (143,), 142),
    RecipeSpec("Glazed Tofu and Taiwanese Pickles", "Grill House · BAO Borough", (145,), 144),
    RecipeSpec("Chilli Chicken Wings", "Grill House · BAO Borough", (147,), 146),
    RecipeSpec("San Bei Chicken Butt Skewers", "Grill House · BAO Borough", (149,), 148),
    RecipeSpec("Shacha Ox Heart Skewers", "Grill House · BAO Borough", (150,), 150),
    RecipeSpec("Ox Tongue Skewers", "Grill House · BAO Borough", (151,), 151),
    RecipeSpec("40-day Aged Beef and Taipei Butter Rice", "Grill House · BAO Borough", (152, 153), 153),
    RecipeSpec("Savoury Soy Milk with Fried Youtiao", "Taiwanese Café · BAO King’s Cross", (162, 163), 162),
    RecipeSpec("Dan Bing", "Taiwanese Café · BAO King’s Cross", (165,), 164),
    RecipeSpec("Fried Prawn Roll", "Taiwanese Café · BAO King’s Cross", (166,), 167),
    RecipeSpec("Taro Congee with Crispy Shallot Rings", "Taiwanese Café · BAO King’s Cross", (169,), 168),
    RecipeSpec("Jiang Shao Beef Short Rib Pancake with Bone Marrow", "Taiwanese Café · BAO King’s Cross", (170,), 171),
    RecipeSpec("Chilli Chicken Rice with Meinong Daikon", "Taiwanese Café · BAO King’s Cross", (172, 173), 172),
    RecipeSpec("‘Pork Chop’ Lard Rice", "Taiwanese Café · BAO King’s Cross", (174, 175), 174),
    RecipeSpec("40-day Aged Beef Rump Rice", "Taiwanese Café · BAO King’s Cross", (176, 177), 176),
    RecipeSpec("Plain Wheat Noodles", "BAO Noodle Shop", (185,), 181),
    RecipeSpec(
        "Slow-cooked Beef Cheek and Short Rib Noodles in a Rich Beef Soup with Beef Butter (Taipei Style)",
        "BAO Noodle Shop",
        (186, 187),
        186,
    ),
    RecipeSpec("Rare Beef Rump Noodles in a Light Beef Soup (Tainan Style)", "BAO Noodle Shop", (189,), 188),
    RecipeSpec("Dan Dan Tofu Noodles", "BAO Noodle Shop", (190,), 191),
    RecipeSpec("Kelp Soup Noodles with Aubergine Tempura", "BAO Noodle Shop", (193,), 192),
    RecipeSpec("Pao Tsai Pickles", "BAO Noodle Shop", (194,), 195),
    RecipeSpec("Spinach with Tofu Sauce", "BAO Noodle Shop", (196,), 197),
    RecipeSpec("Eel and Smacked Cucumber", "BAO Noodle Shop", (199,), 198),
    RecipeSpec("Lu Rou Fan with Egg and Fish Floss Rice", "BAO Noodle Shop", (200, 201), 200),
    RecipeSpec("Crispy Tripe", "BAO Noodle Shop", (202,), 203),
    RecipeSpec("Fried Ogleshield Cheese Rolls", "BAO Noodle Shop", (205,), 204),
    RecipeSpec("Cull Yaw Dumplings", "BAO Noodle Shop", (206, 207), 206),
    RecipeSpec("BAO HI", "BAO Drinks", (215,), 214),
    RecipeSpec("Peanut Milk", "BAO Drinks", (216,), 217),
    RecipeSpec("QQ HI", "BAO Drinks", (218,), 218),
    RecipeSpec("Melon Floatini", "BAO Drinks", (219,), 219),
    RecipeSpec("Melon Sour", "BAO Drinks", (221,), 220),
    RecipeSpec("Yakult Float", "BAO Drinks", (222,), 222),
    RecipeSpec("Grapeade", "BAO Drinks", (223,), 223),
    RecipeSpec("Sweet Potato Sour", "BAO Drinks", (224,), 225),
    RecipeSpec("Iron Shake", "BAO Drinks", (226,), 226),
    RecipeSpec("Milk Foam Tea", "BAO Drinks", (227,), 227),
]


SUBTITLE_OVERRIDES = {
    "Sesame BAO": "A sesame-enriched burger-style BAO, developed to hold sandwich fillings while keeping the soft texture of the house dough.",
    "Prawn Shia Song BAO": "A fried BAO filled with fluffy prawn shia song, vegetables and fermented green chillies—a crisp alternative to the traditional lettuce cup.",
    "Fried Chicken BAO": "One of BAO’s original market-stall dishes: crisp fried chicken paired with bright Taiwanese Golden Kimchi.",
    "Breakfast Sausage BAO": "A soft BAO inspired by a sausage breakfast muffin, balancing a juicy patty with the sweetness of the bun.",
    "Lamb Shoulder BAO": "Cumin-spiced lamb shoulder, cooked slowly until tender and then crisped before filling the BAO.",
    "Peach BAO": "BAO’s version of the peach-shaped longevity buns served at Chinese birthday celebrations.",
    "Coconut BAO Loaf": "A soft pull-apart BAO loaf with a sweet coconut filling, best served gently warmed.",
    "Soho House Pickles": "A selection of crisp, bright house pickles designed to sharpen the appetite and balance richer dishes.",
    "Taiwanese Fried Chicken": "A night-market-inspired fried chicken dish and one of the three items served at BAO’s first market stall.",
    "Trotter Nuggets with Burnt Chilli Sauce": "Slow-braised pig’s trotters are pressed, portioned and fried into crisp nuggets, then served with burnt chilli sauce.",
    "Beef Cheek and Tendon Nuggets": "Rich beef cheek and tendon are cooked down, set and fried into crisp nuggets with a deeply savoury centre.",
    "XO Sweetcorn and Ox Heart with Beef Butter": "Sweetcorn and ox heart layered with XO-style aromatics and spiced beef butter.",
    "Peanut Ice Cream Roon Bing with Coriander": "A Taiwanese ice-cream roon bing: peanut ice cream and coriander wrapped in a thin popiah skin.",
    "Savoury Soy Milk with Fried Youtiao": "Warm soy milk curdled lightly with vinegar, topped with fermented vegetables, chilli oil and crisp fried youtiao.",
    "Slow-cooked Beef Cheek and Short Rib Noodles in a Rich Beef Soup with Beef Butter (Taipei Style)": "BAO’s rich Taipei-style beef noodles, built from slow-cooked beef cheek and short rib, concentrated broth and beef butter.",
    "Dan Dan Tofu Noodles": "A meat-free interpretation of Taiwanese noodle-shop dan dan noodles, with seasoned tofu and a carefully balanced dressing.",
    "Kelp Soup Noodles with Aubergine Tempura": "A clear, fragrant kelp broth with wheat noodles and crisp aubergine tempura.",
    "Pao Tsai Pickles": "Three clean, crunchy pickles with contrasting acidic, sweet and spicy profiles.",
    "Lu Rou Fan with Egg and Fish Floss Rice": "A Tainan-inspired lu rou fan, served with egg and fish floss to balance the rich pork sauce.",
    "Yakult Float": "A bright Yakult-based float with pineapple and a light foam topping.",
}


MANUAL_IMAGE_CROPS: dict[int, tuple[float, float, float, float]] = {
    # These photographs have pale tabletops joined to the page background, so
    # colour segmentation otherwise isolates only the dark upper backdrop.
    162: (0.25, 0.13, 0.76, 0.68),
    168: (0.20, 0.07, 0.83, 0.88),
}


LARDER_RECIPES: list[dict[str, Any]] = [
    {
        "title": "Fermented Chillies",
        "yield": "Makes 100 g",
        "ingredients": ["100 g mild red or green chillies, coarsely chopped", "salt, as needed (see method)"],
        "steps": [
            "Cut the heads off the chillies and chop finely. Weigh the chopped chillies, then mix thoroughly with 2 per cent of their total weight in salt.",
            "Transfer to a sterilized glass jar, leaving a 1 cm (½ inch) headspace, and seal. Ferment in a cool, dry, dark place for 2 weeks, briefly opening the lid each night to release gas.",
            "Once fermented, store in the refrigerator for up to 3 months.",
        ],
        "page": 116,
    },
    {
        "title": "Peanut Powder",
        "yield": "Makes 200 g",
        "ingredients": ["200 g shelled peanuts (groundnuts)", "2 tablespoons caster (superfine) sugar"],
        "steps": [
            "Heat the oven to 180°C/350°F/Gas Mark 4. Roast the peanuts for 20–25 minutes until golden, turning every 5 minutes, then cool completely.",
            "Process in small batches to a coarse powder. Mix with the sugar and store in a jar in the refrigerator for up to 1 month.",
        ],
        "page": 116,
    },
    {
        "title": "Soy-cured Egg Yolk",
        "yield": "Makes 1 soy-cured egg yolk",
        "ingredients": ["50 ml mirin", "35 ml light soy sauce", "15 ml dark soy sauce", "1 egg yolk"],
        "steps": [
            "Mix the liquid ingredients in a small bowl. Lower in the cleaned egg yolk and cure for 10 minutes.",
            "Remove all egg white and the cloudy chalaza from the yolk before curing.",
        ],
        "page": 116,
    },
    {
        "title": "Salted Duck Eggs",
        "yield": "Makes 12 salted eggs",
        "ingredients": ["12 duck eggs", "250 g salt", "50 g alcohol above 40% ABV, such as kao liang wine or brandy"],
        "steps": [
            "Wash and dry the eggs, checking that no shells are cracked, and place them in a glass jar.",
            "Bring 1 litre water to the boil, remove from the heat, dissolve in the salt and cool completely. Add the alcohol.",
            "Pour the brine over the eggs and weigh them down so they remain submerged. Cover and hold at room temperature for about 1 month; begin checking from day 25.",
            "Rinse the cured eggs and refrigerate in an airtight container for up to 10 days, or boil and refresh the brine to keep them for up to 1 month.",
        ],
        "page": 116,
    },
    {
        "title": "Crispy Shallots",
        "yield": "Makes 40 g",
        "ingredients": ["1 litre rapeseed (canola) oil", "5 banana shallots, very finely sliced"],
        "steps": [
            "Heat the oil to 160°C/325°F, then briefly turn off the heat and add the shallots with a slotted spoon. Turn the heat back on once the oil bubbles vigorously.",
            "Fry until golden brown, rigid and floating. Remove before they darken further, drain on paper towels and season lightly with salt.",
            "Store in an airtight container in a cool, dry place for up to 2 weeks.",
        ],
        "page": 116,
    },
    {
        "title": "Ginger Spring Onion Oil",
        "yield": "Makes 150 ml",
        "ingredients": [
            "100 ml rapeseed (canola) oil",
            "90 g fresh ginger, finely chopped",
            "40 g spring onions (scallions), white parts only, finely chopped",
            "1 clove garlic, finely chopped",
            "caster (superfine) sugar, to taste",
            "salt",
        ],
        "steps": [
            "Heat the oil in a frying pan over high heat. Add the ginger, spring onions and garlic and cook for 5–10 seconds.",
            "Remove from the heat and season heavily with sugar and salt to taste.",
        ],
        "page": 116,
    },
    {
        "title": "Spring Onion Tofu",
        "yield": "Makes 200 ml",
        "ingredients": [
            "90 g silken tofu",
            "½ clove garlic",
            "2 teaspoons rice vinegar",
            "¼ teaspoon salt",
            "pinch of ground white pepper",
            "¼ teaspoon caster (superfine) sugar",
            "90 g spring onions (scallions), coarsely chopped",
            "20 ml rapeseed (canola) oil",
        ],
        "steps": [
            "Blend all ingredients at high speed until very smooth and bright green.",
            "Store in an airtight container in the refrigerator for up to 2 days.",
        ],
        "page": 116,
    },
    {
        "title": "Black Garlic Glaze",
        "yield": "Makes 115 ml",
        "ingredients": [
            "2 tablespoons premium soy sauce",
            "35 ml vegetarian oyster sauce",
            "½ teaspoon smoked paprika",
            "2 cloves garlic, grated",
            "1 tablespoon rice vinegar",
            "2 tablespoons mirin",
            "1½ teaspoons Taiwanese red rice vinegar",
            "15 g Fermented Chillies",
            "25 g black garlic",
        ],
        "steps": [
            "Blend all ingredients to a paste, adding a little water to loosen to a glaze consistency.",
            "Store in an airtight container in the refrigerator for up to 1 month.",
        ],
        "page": 116,
    },
    {
        "title": "Rice Dressing",
        "yield": "Makes 140 ml",
        "ingredients": ["100 ml rice vinegar", "20 g salt", "20 g caster (superfine) sugar"],
        "steps": [
            "Whisk all ingredients in a non-reactive bowl until the salt and sugar dissolve, or seal in a jar and shake.",
            "Store in an airtight container at room temperature for up to 1 month.",
        ],
        "page": 116,
    },
    {
        "title": "Tiger Dressing",
        "yield": "Makes 150 ml",
        "ingredients": [
            "1 jalapeño, halved",
            "1 clove garlic, crushed",
            "80 ml Chinkiang black rice vinegar",
            "2 tablespoons sesame oil",
            "25 g caster (superfine) sugar",
            "2 tablespoons rapeseed (canola) oil",
            "½ teaspoon salt",
            "pinch of ground white pepper",
        ],
        "steps": [
            "Whisk all ingredients in a small non-reactive bowl and infuse, covered, in a cold, dark place for 1 week.",
            "Remove the chilli and garlic, then whisk or shake to emulsify. Refrigerate in a sterilized bottle for up to 2 weeks.",
        ],
        "page": 116,
    },
    {
        "title": "Sichuan Chilli Oil",
        "yield": "Makes 250 ml",
        "ingredients": [
            "18 g coriander seeds",
            "250 ml rapeseed (canola) oil",
            "4 cloves garlic, lightly crushed",
            "20 g fresh ginger, peeled, sliced and lightly crushed",
            "1 star anise",
            "60 g dried red chillies",
            "15 g Sichuan peppercorns",
            "generous ½ teaspoon salt",
            "1 teaspoon sugar",
            "30 g Korean chilli flakes",
            "25 g whole bean soy sauce",
            "½ teaspoon sesame seeds",
        ],
        "steps": [
            "Toast the coriander seeds for 3 minutes over low heat. Simmer them with the oil, garlic, ginger and star anise over low heat for 10–20 minutes without browning.",
            "Toast the dried chillies at 180°C/350°F/Gas Mark 4 for 8 minutes until reddish brown, adding the Sichuan peppercorns for the final 3 minutes. Cool, then grind with the salt, sugar and Korean chilli flakes.",
            "Place the spice powder in a heatproof bowl beneath a fine-mesh sieve. Heat the infused oil to 180°C/350°F, then pour it through the sieve over the powder. Let it bubble for about 20 seconds.",
            "Add the soy sauce and sesame seeds. Cover and steep for at least 2 days at room temperature. Store in a sterilized jar in a cool, dark place for up to 1 month.",
        ],
        "page": 116,
    },
    {
        "title": "Homemade Mayonnaise",
        "yield": "Makes 240 ml",
        "ingredients": ["70 g egg yolks (from about 4 eggs)", "2 teaspoons Dijon mustard", "pinch of salt", "1 teaspoon lemon juice", "155 ml vegetable oil"],
        "steps": [
            "Pulse all ingredients except the oil in a food processor or blender. With the motor running, slowly pour in the oil, pausing every 30 seconds; add the final 50 ml a little faster.",
            "Blend for a further 10 seconds to fully emulsify. Refrigerate in a covered container for up to 3 days.",
            "For garlic mayonnaise, mix in 10 g grated garlic or 1 large grated clove.",
        ],
        "page": 117,
    },
    {
        "title": "Sichuan Mayonnaise",
        "yield": "Makes 200 ml",
        "ingredients": [
            "75 ml rapeseed (canola) oil",
            "45 ml Sichuan Chilli Oil",
            "60 g egg yolks (from about 3 eggs)",
            "1½ teaspoons Dijon mustard",
            "¼ teaspoon salt",
            "1 teaspoon lime juice",
        ],
        "steps": [
            "Whisk the two oils together. Pulse the remaining ingredients in a processor or blender, then slowly pour in the oils with the motor running.",
            "Pause every 30 seconds; add the final 50 ml a little faster and blend 10 seconds more. Refrigerate for up to 3 days.",
        ],
        "page": 117,
    },
    {
        "title": "Spiced Beef Butter",
        "yield": "Makes 100 g",
        "ingredients": [
            "¼ teaspoon red Sichuan peppercorns",
            "1 dried red chilli",
            "1 star anise",
            "½ cinnamon stick",
            "100 g beef fat",
            "⅛ spring onion (scallion), finely diced",
            "1 clove garlic, finely diced",
            "1 cm (½ inch) fresh ginger, peeled and finely diced",
            "1 teaspoon doubanjiang (fermented chilli bean paste)",
            "1½ teaspoons chilli powder",
            "1 teaspoon premium soy sauce",
        ],
        "steps": [
            "Toast the peppercorns, dried chilli, star anise and cinnamon until fragrant. Cool and grind to a powder.",
            "Melt the beef fat over medium heat. Add the spring onion, garlic and ginger and cook until light golden, then strain and discard the solids.",
            "Return the fat to the pan, stir in the ground spices, doubanjiang and chilli powder, then remove from the heat and infuse for 2 hours.",
            "Strain the fat, gently remelting if necessary, stir in the premium soy sauce and use immediately.",
        ],
        "page": 117,
    },
    {
        "title": "Green Sauce",
        "yield": "Makes 350 ml",
        "ingredients": [
            "240 g coriander (cilantro)",
            "1 clove garlic",
            "dash of rice vinegar",
            "½ tablespoon salt",
            "1½ teaspoons caster (superfine) sugar",
            "squeeze of lemon juice",
            "2 jalapeños, halved, seeded and coarsely chopped",
            "2 teaspoons honey",
            "1 tablespoon fish sauce",
            "100 ml rapeseed (canola) oil",
        ],
        "steps": [
            "Process half the coriander and all remaining ingredients except the oil until the leaves break down. Add the remaining coriander and blend smooth.",
            "With the motor running, slowly pour in the oil. Refrigerate for up to 1 week or freeze for up to 3 months.",
        ],
        "page": 117,
    },
    {
        "title": "Burnt Chilli Sauce",
        "yield": "Makes 250 ml",
        "ingredients": [
            "60 g green chillies",
            "60 g fresh ginger, sliced",
            "60 g garlic cloves",
            "25 ml lemon juice",
            "1½ teaspoons chopped coriander (cilantro)",
            "1 teaspoon Dijon mustard",
            "55 ml rapeseed (canola) oil",
            "½ teaspoon salt",
            "3 tablespoons light muscovado sugar",
        ],
        "steps": [
            "Blacken the chillies over a gas burner or beneath a very hot grill, then cool and peel off the burnt skins.",
            "Blend with the remaining ingredients at high speed to form an emulsion.",
            "Store in a sterilized jar in the refrigerator for up to 1 week, or freeze for up to 3 months.",
        ],
        "page": 117,
    },
    {
        "title": "Hot Sauce",
        "yield": "Makes 850 ml",
        "ingredients": [
            "20 g garlic, chopped",
            "165 g fresh ginger, chopped into 1 cm (½ inch) cubes",
            "210 ml rice vinegar",
            "265 ml light soy sauce",
            "30 g chilli powder",
            "20 g hot paprika",
            "185 ml honey",
            "5 teaspoons caster (superfine) sugar",
        ],
        "steps": [
            "Blend the garlic and ginger with enough vinegar to cover until completely smooth.",
            "Add the remaining ingredients and blend at high speed for 6–8 minutes. Pass through a fine-mesh sieve, pressing the solids for their juices.",
            "Store at room temperature in a sterilized jar for up to 1 month, or refrigerate for up to 3 months.",
        ],
        "page": 117,
    },
    {
        "title": "Pickled Plum Ketchup",
        "yield": "Makes 400 ml",
        "ingredients": [
            "160 ml rice vinegar",
            "40 g caster (superfine) sugar",
            "20 g salt",
            "200 g plums, halved, pitted and thinly sliced",
            "200 g drained pickled plums",
            "65 g caster (superfine) sugar",
            "1 teaspoon salt",
            "2 teaspoons rice vinegar",
            "150 ml rapeseed (canola) oil",
        ],
        "steps": [
            "For the pickled plums, dissolve the vinegar, sugar and salt over low heat and cool. Pour over the plums in a sterilized jar, seal and pickle in a cool, dark place for 2 weeks.",
            "For the ketchup, blend 200 g drained pickled plums with the sugar, salt and vinegar until completely smooth, ideally for 15 minutes.",
            "With the motor running, slowly pour in the oil to emulsify. Refrigerate in a sterilized jar for up to 1 month.",
        ],
        "page": 117,
    },
    {
        "title": "Fermented Mustard Greens",
        "yield": "Makes 350 g",
        "ingredients": ["500 g Chinese mustard greens, washed and chopped into 2.5 cm (1 inch) pieces", "2 teaspoons salt (2% of the total weight of the greens)"],
        "steps": [
            "Massage the salt evenly into the chopped greens. Pack tightly into a 500 ml sterilized jar.",
            "After about 30 minutes, ensure the liquid drawn from the greens covers them, using a fermenting weight if needed.",
            "Seal and ferment at room temperature for at least 14 days, ideally 1 month, opening the lid briefly each night to release gas.",
            "Refrigerate when fermented to your liking. Store for up to 3 months.",
        ],
        "page": 117,
    },
    {
        "title": "Soy-Pickled Chillies",
        "yield": "Makes 1 × 500 ml jar",
        "ingredients": [
            "100 ml rice vinegar",
            "25 g caster (superfine) sugar",
            "20 ml light soy sauce",
            "20 ml dark soy sauce",
            "100 g green snub-nose chillies, very finely sliced",
        ],
        "steps": [
            "Whisk the vinegar, sugar and soy sauces until the sugar dissolves.",
            "Put the chillies in a sterilized 500 ml jar, pour over the liquid leaving a 1 cm (½ inch) headspace, and seal.",
            "Pickle at room temperature for 2 days, then refrigerate for up to 3 months.",
        ],
        "page": 117,
    },
    {
        "title": "Yellow Chilli Marinade",
        "yield": "Makes 220 ml",
        "ingredients": [
            "60 g carrot, coarsely chopped",
            "2 cloves garlic",
            "35 ml lemon juice",
            "½ teaspoon lemon zest",
            "80 ml rapeseed (canola) oil",
            "10 g lemongrass stalks, thinly sliced",
            "50 g tamarind paste",
            "100 g mild yellow chillies, stems removed",
        ],
        "steps": [
            "Process all ingredients except the chillies until smooth. With the motor running, slowly add the chillies and continue blending to a smooth paste.",
            "Refrigerate in an airtight container for up to 3 days or freeze for up to 3 months.",
        ],
        "page": 118,
    },
    {
        "title": "Taiwanese Golden Kimchi",
        "yield": "Makes 4 × 500 ml jars",
        "ingredients": [
            "1.5 kg Chinese (napa) cabbage, chopped",
            "30 g salt",
            "½ teaspoon sesame oil",
            "2 teaspoons rice vinegar",
            "½ clove garlic",
            "100 g white fermented tofu",
            "30 g apple, cored",
            "60 g carrot",
            "1½ teaspoons caster (superfine) sugar",
            "1 teaspoon ground turmeric",
            "2 green snub-nose chillies, halved lengthways",
        ],
        "steps": [
            "Mix the cabbage with the salt in a colander and drain for 1–2 hours.",
            "Blend all remaining ingredients except the green chillies with 40 ml cold water until smooth.",
            "Wash and drain the cabbage, pour over the liquid and massage it in while wearing gloves.",
            "Pack into four sterilized 500 ml jars, add the chillies, leave a 1 cm (½ inch) headspace and seal. Ferment at room temperature for 7 days, briefly opening the jars each night.",
            "Refrigerate for another week before using. Keep refrigerated for at least 1 month.",
        ],
        "page": 118,
    },
    {
        "title": "Master Stock (broth)",
        "yield": "Makes 1 litre",
        "ingredients": [
            "350 g beef shin on the bone",
            "1 kg 40-day aged beef bones",
            "1 whole chicken carcass",
            "1 tablespoon vegetable oil",
            "1½ onions, unpeeled and quartered",
            "15 g fresh ginger, smashed",
            "1 bulb garlic, halved horizontally",
            "1 tomato, halved",
            "pinch of red Sichuan peppercorns",
            "pinch of black peppercorns",
            "1 star anise",
            "1 bay leaf",
            "1 dried red chilli",
            "1 cinnamon stick",
            "1.35 litres filtered water",
            "1 jujube (red date)",
        ],
        "steps": [
            "Blanch the beef shin, bones and chicken carcass in boiling water for 5 minutes. Drain and rinse clean.",
            "Heat the oil in a large saucepan. Brown the onion and ginger for 15 minutes, add the garlic halfway through, then add the tomato.",
            "Toast the peppercorns, star anise, bay leaf, chilli and cinnamon over low heat until fragrant. Cool slightly and wrap in muslin or place in a spice bag.",
            "Add the blanched meat and bones to the browned aromatics, pour in the water and add the spice bag and jujube.",
            "Bring to the boil and skim thoroughly. Reduce to about 95°C/203°F, cover and cook very gently for 8 hours. Strain through a fine-mesh sieve and discard the solids.",
        ],
        "page": 118,
    },
]


FOAMS = [
    {
        "title": "Yakult Foam",
        "ingredients": ["2 bottles Yakult (130 ml)", "50 ml double (heavy) cream", "26 ml sugar syrup", "3 g egg white"],
    },
    {
        "title": "Aloe Foam",
        "ingredients": ["150 ml aloe vera juice", "1 egg white"],
    },
    {
        "title": "Milk Foam",
        "ingredients": ["133 ml milk", "123 ml double (heavy) cream", "23 ml sugar syrup", "3 ml good-quality vanilla extract", "1 egg white"],
    },
]


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    value = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return value or "recipe"


def source_pdf_page(printed_half_page: int) -> int:
    return (printed_half_page + 2) // 2


def clean_text(text: str) -> str:
    replacements = {
        "Hour": "flour",
        "Io assemble": "To assemble",
        "To assamble": "To assemble",
        "Jow!": "Jowl",
        "Havour": "flavour",
        "retrigerator": "refrigerator",
        "neat": "heat",
        "sov sauce": "soy sauce",
        "liaht soy": "light soy",
        "canola) oi": "canola) oil",
        "snub-nose": "snub-nose",
        "2% tablespoons": "2½ tablespoons",
        "(% inch)": "(½ inch)",
        "(2 inch)": "(½ inch)",
        "oill": "oil",
        "COr charger": "CO₂ charger",
        "CO charger": "CO₂ charger",
        "Lip": "Tip",
        "Remove from the heat anc": "Remove from the heat and",
        "i teaspoon": "1 teaspoon",
        "i star anise": "1 star anise",
        "l litre": "1 litre",
        "S5u a beet shin on the bone": "350 g beef shin on the bone",
        "They they": "They",
        "Alter- natively": "Alternatively",
        "medium- high": "medium-high",
        "tofu anc ginger": "tofu and ginger",
        "(2 x% inch)": "(2 × ⅝ inch)",
        "8 cm (34 inches)": "8 cm (3¼ inches)",
        "7 cm (24 inch)": "7 cm (2¾ inch)",
        "No sauce": "Ng sauce",
        "Iofu": "Tofu",
    }
    text = text.strip()
    for old, new in replacements.items():
        text = text.replace(old, new)
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\b(\d+(?:\.\d+)?)\s+mi\b", r"\1 ml", text)
    text = re.sub(r"\s+([,.;:)\]])", r"\1", text)
    return text


def read_ocr(page: int) -> list[dict[str, Any]]:
    path = OCR_DIR / f"page-{page:03d}.tsv"
    if not path.exists():
        return []
    rows = []
    for raw in path.read_text(encoding="utf-8").splitlines():
        parts = raw.split("\t", 4)
        if len(parts) != 5:
            continue
        x, y, width, height, text = parts
        text = clean_text(text)
        if not text:
            continue
        rows.append(
            {
                "x": float(x),
                "y": float(y),
                "w": float(width),
                "h": float(height),
                "text": text,
            }
        )
    return rows


def row_y(row: dict[str, Any]) -> float:
    return float(row.get("sort_y", row["y"]))


def join_paragraphs(rows: list[dict[str, Any]], gap: float = 0.021) -> list[str]:
    rows = sorted(rows, key=lambda row: (-row_y(row), row["x"]))
    paragraphs: list[str] = []
    current = ""
    previous_y: float | None = None
    for row in rows:
        text = row["text"]
        if text.isdigit() or text in {"BAO", "BAO LARDER"}:
            continue
        y = row_y(row)
        new_para = previous_y is not None and previous_y - y > gap
        if new_para and current:
            paragraphs.append(clean_text(current))
            current = text
        else:
            current = f"{current} {text}".strip()
        previous_y = y
    if current:
        paragraphs.append(clean_text(current))
    return [paragraph for paragraph in paragraphs if len(paragraph) > 1]


def likely_heading(row: dict[str, Any]) -> bool:
    text = row["text"].rstrip(":")
    return (
        len(text) <= 48
        and row["w"] <= 0.24
        and bool(text)
        and (text[0].isupper() or text[0] in {"‘", "'", '"'})
        and not re.match(r"^(?:\d|[¼½¾⅓⅔⅛⅜⅝⅞]|pinch|salt|oil\b)", text, re.I)
        and not text.endswith((".", ",", ";"))
    )


def ingredient_groups(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rows = sorted(rows, key=lambda row: -row_y(row))
    groups: list[dict[str, Any]] = []
    heading = "Ingredients"
    lines: list[str] = []

    def flush() -> None:
        nonlocal lines
        if lines:
            groups.append({"heading": heading, "lines": lines})
            lines = []

    for row in rows:
        text = row["text"]
        if text.isdigit() or text in {"BAO", "BAO LARDER"}:
            continue
        if text in {"Tip", "Tips"} or text.startswith(("Shout out ", "Try to find ")):
            break
        if (text.lower().startswith(("for the ", "to serve", "to garnish", "to finish")) and len(text) < 65) or (
            text.endswith(":") and len(text) < 65
        ):
            flush()
            heading = text.rstrip(":")
            continue
        starts_quantity = bool(
            re.match(r"^(?:\d|[¼½¾⅓⅔⅛⅜⅝⅞]|pinch\b|salt\b|oil\b)", text, re.I)
        )
        if lines and (
            text.startswith(
                (
                    "(",
                    "BAO,",
                    "white parts",
                    "lengthways",
                    "coarsely",
                    "finely",
                    "peeled and",
                    "for deep-frying",
                    "for dusting",
                )
            )
            or (not starts_quantity and lines[-1].count("(") > lines[-1].count(")"))
        ):
            lines[-1] = clean_text(f"{lines[-1]} {text}")
        else:
            lines.append(text)
    flush()
    return groups or [{"heading": "Ingredients", "lines": []}]


def method_groups(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rows = sorted(rows, key=lambda row: -row_y(row))
    groups: list[dict[str, Any]] = []
    heading = "Method"
    paragraph_rows: list[dict[str, Any]] = []

    def flush() -> None:
        nonlocal paragraph_rows
        steps = join_paragraphs(paragraph_rows)
        if steps:
            groups.append({"heading": heading, "steps": steps})
        paragraph_rows = []

    for row in rows:
        is_known_heading = row["text"].rstrip(".").lower() == "fried youtiao (dough sticks)"
        if (likely_heading(row) or is_known_heading) and row["text"].lower() not in {"tip"}:
            flush()
            heading = row["text"].rstrip(":").rstrip(".")
        else:
            paragraph_rows.append(row)
    flush()
    return groups or [{"heading": "Method", "steps": []}]


def parse_standard_recipe(spec: RecipeSpec) -> dict[str, Any]:
    intro_rows: list[dict[str, Any]] = []
    all_ingredients: list[dict[str, Any]] = []
    all_methods: list[dict[str, Any]] = []
    yield_text: str | None = None

    for page_index, page in enumerate(spec.pages):
        rows = [
            {**row, "sort_y": row["y"] - page_index * 2}
            for row in read_ocr(page)
            if 0.055 < row["y"] < 0.955
        ]
        title_rows = [row for row in rows if spec.title.lower().split()[0] in row["text"].lower() and row["y"] > 0.84]
        yield_rows = [
            row
            for row in rows
            if re.match(r"^(?:Makes(?:\s+about)?|Serves|Yields)\s+\d", row["text"], re.I)
        ]
        yield_row = max(yield_rows, key=lambda row: row["y"]) if yield_rows else None
        if yield_row and not yield_text:
            yield_text = yield_row["text"]

        if yield_row:
            y_top = yield_row["y"] + 0.012
            intro_rows.extend(
                row
                for row in rows
                if row["y"] > y_top
                and row not in title_rows
                and row not in yield_rows
                and not row["text"].isdigit()
            )
            below = [row for row in rows if row["y"] < yield_row["y"] - 0.008]
            # Recipe pages alternate the ingredient and method columns. The
            # yield sits above the ingredient column, so use it to determine
            # the page orientation rather than assuming ingredients are left.
            ingredients_on_right = yield_row["x"] >= 0.48
            if ingredients_on_right:
                all_ingredients.extend(row for row in below if row["x"] >= 0.50)
                all_methods.extend(row for row in below if row["x"] < 0.50)
            else:
                all_ingredients.extend(row for row in below if row["x"] < 0.32)
                all_methods.extend(
                    row
                    for row in rows
                    if row["x"] >= 0.32
                    and row not in title_rows
                    and row not in yield_rows
                    and not row["text"].isdigit()
                )
        elif page_index == 0:
            intro_rows.extend(
                row for row in rows if row not in title_rows and not row["text"].isdigit() and row["y"] > 0.49
            )
        else:
            # Continuation pages are method copy unless a left-column ingredient list
            # is clearly present.
            continuation = [
                row
                for row in rows
                if not row["text"].isdigit()
                and row["x"] < 0.48
                and not re.search(r"\b(?:PHOTO|BAOS BY HAND|ROLLING THE DOUGH)\b", row["text"], re.I)
            ]
            all_methods.extend(continuation)

    intro = " ".join(join_paragraphs(intro_rows, gap=0.025))
    intro = re.sub(r"\s+", " ", intro).strip()
    if len(intro) > 460:
        sentences = re.split(r"(?<=[.!?])\s+", intro)
        concise = ""
        for sentence in sentences:
            if concise and len(concise) + len(sentence) > 430:
                break
            concise = f"{concise} {sentence}".strip()
        intro = concise or intro[:430].rstrip() + "…"

    recipe_id = slugify(spec.title)
    return {
        "id": recipe_id,
        "title": spec.title,
        "subtitle": spec.subtitle or intro,
        "category": spec.category,
        "sourcePages": sorted({source_pdf_page(page) for page in spec.pages}),
        "yield": yield_text,
        "prepTime": None,
        "cookTime": None,
        "image": f"/imported-cookbooks/recipes/{BOOK_ID}/{recipe_id}.jpg" if spec.image_page else None,
        "ingredientGroups": ingredient_groups(all_ingredients),
        "methodGroups": method_groups(all_methods),
        "searchText": "",
    }


def larder_recipe(data: dict[str, Any]) -> dict[str, Any]:
    recipe_id = slugify(data["title"])
    return {
        "id": recipe_id,
        "title": data["title"],
        "subtitle": "BAO Larder foundation recipe.",
        "category": "BAO Larder",
        "sourcePages": [data["page"]],
        "yield": data.get("yield"),
        "prepTime": None,
        "cookTime": None,
        "image": None,
        "ingredientGroups": [{"heading": "Ingredients", "lines": data["ingredients"]}],
        "methodGroups": [{"heading": "Method", "steps": data["steps"]}],
        "searchText": "",
    }


def foam_recipe(data: dict[str, Any]) -> dict[str, Any]:
    recipe_id = slugify(data["title"])
    return {
        "id": recipe_id,
        "title": data["title"],
        "subtitle": "Base foam for BAO drinks, made in a whipped-cream dispenser.",
        "category": "BAO Drinks · Foams",
        "sourcePages": [107],
        "yield": None,
        "prepTime": None,
        "cookTime": None,
        "image": None,
        "ingredientGroups": [{"heading": "Ingredients", "lines": data["ingredients"]}],
        "methodGroups": [
            {
                "heading": "Method",
                "steps": [
                    "Mix all ingredients, pour into a whipped-cream dispenser and charge with a CO₂ charger.",
                    "Test into another vessel first. Keep the dispenser steady; shake or chill it briefly if the foam is too loose. Refrigerate for no more than 1 day.",
                ],
            }
        ],
        "searchText": "",
    }


def hot_dog_bao_recipe() -> dict[str, Any]:
    return {
        "id": "hot-dog-bao",
        "title": "Hot Dog BAO",
        "subtitle": "The elongated BAO foundation used for sandwich-style fillings, including the deep-fried Prawn Shia Song BAO.",
        "category": "BAO · Holy Grail",
        "sourcePages": [25, 31],
        "yield": "45 g per BAO",
        "prepTime": None,
        "cookTime": None,
        "image": None,
        "ingredientGroups": [
            {
                "heading": "BAO dough",
                "lines": ["1 batch BAO dough (see BAO)", "plain (all-purpose) flour, for dusting"],
            },
            {
                "heading": "For deep-fried Hot Dog BAOs",
                "lines": ["vegetable oil, for deep-frying"],
            },
        ],
        "methodGroups": [
            {
                "heading": "Shape and prove",
                "steps": [
                    "Make the BAO dough through its first prove, following the master BAO recipe.",
                    "Divide the dough into 45 g pieces. Knead each piece firmly, roll it into a smooth ball, then roll it back and forth under your palm into a hot-dog-bun shape.",
                    "Place each BAO on a square of baking (parchment) paper, cover and prove somewhere warm for 15–20 minutes, until doubled in height and relaxed and puffed.",
                ],
            },
            {
                "heading": "For steamed Hot Dog BAOs",
                "steps": [
                    "Transfer the proved BAOs on their paper squares to a prepared bamboo steamer. Cover and steam over medium-high heat for 15 minutes, until soft, podgy and evenly springy.",
                ],
            },
            {
                "heading": "For the Prawn Shia Song BAO",
                "steps": [
                    "Use the proved Hot Dog BAOs unsteamed. Heat vegetable oil in a deep, heavy-based saucepan to 180°C/350°F.",
                    "Deep-fry the BAOs in batches for 1 minute on each side until golden brown. Remove with a slotted spoon and drain on paper towels.",
                    "Cut a slit lengthways like a hot dog bun, taking care not to cut all the way through, then fill as directed in the Prawn Shia Song BAO recipe.",
                ],
            },
        ],
        "searchText": "",
    }


def fix_generated_recipe(recipe: dict[str, Any]) -> None:
    recipe["subtitle"] = SUBTITLE_OVERRIDES.get(recipe["title"], recipe.get("subtitle") or "")
    if (
        recipe["methodGroups"]
        and recipe["methodGroups"][0]["heading"] == "Method"
        and recipe["ingredientGroups"]
        and recipe["ingredientGroups"][0]["heading"] != "Ingredients"
    ):
        ingredient_heading = recipe["ingredientGroups"][0]["heading"]
        recipe["methodGroups"][0]["heading"] = re.sub(r"^For the\s+", "", ingredient_heading, flags=re.I).capitalize()

    if recipe["title"] == "Guinea Fowl Rice":
        first = recipe["ingredientGroups"][0]["lines"][0]
        recipe["ingredientGroups"][0]["lines"][0] = first.rstrip() + ("" if first.endswith(")") else ")")
        for group in recipe["methodGroups"]:
            if group["heading"] == "Infused goose fat":
                group["steps"] = [
                    step + " the solids." if step.endswith("and discard") else step
                    for step in group["steps"]
                ]

    if recipe["title"] == "Cull Yaw Dumplings":
        for group in recipe["ingredientGroups"]:
            group["lines"] = [
                "⅓ teaspoon ground white pepper" if line == "teaspoon ground white pepper"
                else "⅓ teaspoon salt" if line == "teaspoon salt"
                else line
                for line in group["lines"]
            ]
        for group in recipe["methodGroups"]:
            if group["heading"] == "Dumpling dough":
                group["steps"] = [
                    step + " temperature for 2 hours." if step.endswith("rest at room") else step
                    for step in group["steps"]
                ]
            if group["heading"] == "To assemble":
                group["steps"] = [
                    step + " diameter discs." if step.endswith("(2¾ inch)") else step
                    for step in group["steps"]
                ]


def crop_media(
    source: Path,
    destination: Path,
    *,
    title_page: bool = False,
    manual_box: tuple[float, float, float, float] | None = None,
) -> None:
    image = Image.open(source).convert("RGB")
    if title_page:
        # Keep the complete title-side composition from the photographed spread.
        width, height = image.size
        image = image.crop((width // 2, 0, width, height))
    elif manual_box:
        width, height = image.size
        left, top, right, bottom = manual_box
        image = image.crop((int(left * width), int(top * height), int(right * width), int(bottom * height)))
    else:
        small = image.copy()
        small.thumbnail((420, 420))
        pixels = small.load()
        mask = Image.new("L", small.size, 0)
        mask_pixels = mask.load()
        for y in range(small.height):
            for x in range(small.width):
                r, g, b = pixels[x, y]
                brightness = (r + g + b) / 3
                spread = max(r, g, b) - min(r, g, b)
                if brightness < 225 or spread > 18:
                    mask_pixels[x, y] = 255
        # Use the largest connected non-paper region rather than one bounding
        # box around every line of text on the page. This isolates the plated
        # dish rectangle on title-and-photo pages.
        visited = bytearray(small.width * small.height)
        components: list[tuple[int, tuple[int, int, int, int]]] = []
        mask_data = mask.load()
        for start_y in range(small.height):
            for start_x in range(small.width):
                start_index = start_y * small.width + start_x
                if visited[start_index] or mask_data[start_x, start_y] == 0:
                    continue
                stack = [(start_x, start_y)]
                visited[start_index] = 1
                area = 0
                left = right = start_x
                top = bottom = start_y
                while stack:
                    x, y = stack.pop()
                    area += 1
                    left = min(left, x)
                    right = max(right, x)
                    top = min(top, y)
                    bottom = max(bottom, y)
                    for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                        if not (0 <= nx < small.width and 0 <= ny < small.height):
                            continue
                        index = ny * small.width + nx
                        if visited[index] or mask_data[nx, ny] == 0:
                            continue
                        visited[index] = 1
                        stack.append((nx, ny))
                if area >= 30:
                    components.append((area, (left, top, right + 1, bottom + 1)))
        bbox = max(components, key=lambda component: component[0])[1] if components else mask.getbbox()
        if bbox:
            sx = image.width / small.width
            sy = image.height / small.height
            left, top, right, bottom = bbox
            pad_x = max(8, int((right - left) * 0.025))
            pad_y = max(8, int((bottom - top) * 0.025))
            box = (
                max(0, int((left - pad_x) * sx)),
                max(0, int((top - pad_y) * sy)),
                min(image.width, int((right + pad_x) * sx)),
                min(image.height, int((bottom + pad_y) * sy)),
            )
            if (box[2] - box[0]) * (box[3] - box[1]) > image.width * image.height * 0.08:
                image = image.crop(box)
    if image.width > 1800:
        height = round(image.height * 1800 / image.width)
        image = image.resize((1800, height), Image.Resampling.LANCZOS)
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, "JPEG", quality=88, optimize=True, progressive=True)


def add_search_text(recipe: dict[str, Any]) -> None:
    bits = [
        recipe["title"],
        recipe.get("subtitle") or "",
        recipe["category"],
        recipe.get("yield") or "",
    ]
    bits.extend(line for group in recipe["ingredientGroups"] for line in group["lines"])
    bits.extend(step for group in recipe["methodGroups"] for step in group["steps"])
    recipe["searchText"] = " ".join(bits)


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")


def main() -> None:
    recipes = [parse_standard_recipe(spec) for spec in RECIPE_SPECS]
    recipes.insert(2, hot_dog_bao_recipe())
    recipes.extend(foam_recipe(data) for data in FOAMS)
    recipes.extend(larder_recipe(data) for data in LARDER_RECIPES)
    for recipe in recipes:
        fix_generated_recipe(recipe)
        add_search_text(recipe)

    categories = list(dict.fromkeys(recipe["category"] for recipe in recipes))
    book = {
        "id": BOOK_ID,
        "title": "BAO: The Cookbook",
        "author": "Erchen Chang, Shing Tat Chung & Wai Ting Chung",
        "description": "The complete practical recipe collection, organized by the BAO restaurants and followed by the linked BAO Larder foundations.",
        "recipeCountLabel": f"{len(recipes)} recipes",
        "categories": categories,
        "coverImage": f"/imported-cookbooks/{BOOK_ID}.jpg",
        "sourceDocument": f"/imported-cookbooks/source/{BOOK_ID}.pdf",
        "recipes": recipes,
    }
    write_json(BOOKS_DIR / f"{BOOK_ID}.json", book)

    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    for spec in RECIPE_SPECS:
        if spec.image_page is None:
            continue
        source = PAGE_DIR / f"page-{spec.image_page:03d}.jpg"
        if source.exists():
            crop_media(
                source,
                IMAGE_DIR / f"{slugify(spec.title)}.jpg",
                manual_box=MANUAL_IMAGE_CROPS.get(spec.image_page),
            )

    crop_media(WORK / "pages135/page-003.jpg", PUBLIC_DIR / f"{BOOK_ID}.jpg", title_page=True)
    (PUBLIC_DIR / "source").mkdir(parents=True, exist_ok=True)
    shutil.copy2(SOURCE_PDF, PUBLIC_DIR / "source" / f"{BOOK_ID}.pdf")

    catalog_path = BOOKS_DIR / "catalog.json"
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    catalog = [entry for entry in catalog if entry["id"] != BOOK_ID]
    catalog.append({key: value for key, value in book.items() if key != "recipes"})
    write_json(catalog_path, catalog)

    search_path = BOOKS_DIR / "search-index.json"
    search = json.loads(search_path.read_text(encoding="utf-8"))
    search = [
        entry
        for entry in search
        if entry.get("bookId") != BOOK_ID and not (entry.get("id") == BOOK_ID and "recipes" in entry)
    ]
    search.extend(
        {
            "bookId": BOOK_ID,
            "bookTitle": book["title"],
            "category": recipe["category"],
            "id": recipe["id"],
            "sourcePages": recipe["sourcePages"],
            "title": recipe["title"],
        }
        for recipe in recipes
    )
    write_json(search_path, search)
    print(f"Wrote {len(recipes)} BAO recipes across {len(categories)} sections.")


if __name__ == "__main__":
    main()
