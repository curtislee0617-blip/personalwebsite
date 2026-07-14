#!/usr/bin/env python3
"""Build structured Pollen Street recipe data and web-ready dish crops.

The script combines the supplied photographed pages with a text reference of
the same edition. The reference corrects recognition errors; the photographs
remain the source for recipe selection, ordering, and plated-dish artwork.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import unicodedata
from pathlib import Path
from typing import Any

from PIL import Image, ImageOps


BASIC_CATEGORIES = [
    {"id": "mashes-purees", "label": "Mashes, purées & grains", "blurb": "Mash, risotto, vegetable purées and savoury powders."},
    {"id": "dressings-condiments", "label": "Dressings & condiments", "blurb": "Mayonnaise, vinaigrettes, infused dressings and herb sauces."},
    {"id": "sauces-gravy", "label": "Sauces & gravy", "blurb": "Reduced meat sauces and deeply flavoured gravy."},
    {"id": "pickles-brines", "label": "Pickles & brines", "blurb": "Pickling liquids, brines and preserved garnishes."},
    {"id": "stocks-dashi", "label": "Stocks, dashi & consommé", "blurb": "The stocks, dashi and consommé that underpin the dishes."},
    {"id": "oils-crumbs", "label": "Oils & crumbs", "blurb": "Flavoured oils and crisp finishing crumbs."},
    {"id": "sweet-components", "label": "Pastry & sweet components", "blurb": "Crêpes, meringue, preserves and fruit preparations."},
    {"id": "frozen", "label": "Sorbets & ice creams", "blurb": "Fruit sorbets and restaurant-style ice creams."},
]


BASICS: list[tuple[str, str]] = [
    ("Olive Oil Mash", "mashes-purees"),
    ("Saffron & Garlic Mash", "mashes-purees"),
    ("Mushroom Purée", "mashes-purees"),
    ("Pearl Barley Risotto", "mashes-purees"),
    ("Lettuce & Seaweed Powder", "mashes-purees"),
    ("Tarragon Mayonnaise", "dressings-condiments"),
    ("Spice Water Dressing", "dressings-condiments"),
    ("Truffle Dressing", "dressings-condiments"),
    ("Beef Sauce", "sauces-gravy"),
    ("Duck Sauce", "sauces-gravy"),
    ("Game Sauce", "sauces-gravy"),
    ("Lamb Sauce", "sauces-gravy"),
    ("Chicken Gravy", "sauces-gravy"),
    ("Mint Sauce", "dressings-condiments"),
    ("Vinaigrette", "dressings-condiments"),
    ("Pickling Liquid", "pickles-brines"),
    ("Salt Pickling Liquid", "pickles-brines"),
    ("Pickled Cobnuts", "pickles-brines"),
    ("Kombu Brine", "pickles-brines"),
    ("Kombu Dashi", "stocks-dashi"),
    ("Vegetarian Dashi", "stocks-dashi"),
    ("Lobster Consommé", "stocks-dashi"),
    ("Fish Stock", "stocks-dashi"),
    ("Vegetable Stock", "stocks-dashi"),
    ("Chicken Stock", "stocks-dashi"),
    ("Brown Chicken Stock", "stocks-dashi"),
    ("Duck Stock", "stocks-dashi"),
    ("Lamb Stock", "stocks-dashi"),
    ("Veal Stock", "stocks-dashi"),
    ("Pumpkin & Seaweed Oil", "oils-crumbs"),
    ("Black Olive Oil", "oils-crumbs"),
    ("Chive & Dill Oil", "oils-crumbs"),
    ("Lemon Oil", "oils-crumbs"),
    ("Pistachio Crumb", "oils-crumbs"),
    ("Crêpes", "sweet-components"),
    ("Pain d’épices", "sweet-components"),
    ("Lemon & Yoghurt Meringue", "sweet-components"),
    ("Mulled Elderberries", "sweet-components"),
    ("Apple & Blackberry Jam", "sweet-components"),
    ("Damson Jam", "sweet-components"),
    ("Plum Jam", "sweet-components"),
    ("Cherry Purée", "sweet-components"),
    ("Whole Lemon Purée", "sweet-components"),
    ("Lemon Purée", "sweet-components"),
    ("Basil Sorbet", "frozen"),
    ("Pear Sorbet", "frozen"),
    ("Blackcurrant Sorbet", "frozen"),
    ("Rhubarb & Rose Sorbet", "frozen"),
    ("Strawberry Sorbet", "frozen"),
    ("Goat’s Cheese Ice Cream", "frozen"),
    ("Minus 8 Vinegar Ice Cream", "frozen"),
    ("Olive Oil Ice Cream", "frozen"),
    ("Rum & Raisin Ice Cream", "frozen"),
    ("Vanilla Ice Cream", "frozen"),
]


# Image specs are (source filename, horizontal focus, vertical focus, crop scale).
# Crop scale is the fraction of source width retained before fitting to 4:3.
DISHES: list[dict[str, Any]] = [
    {"title": "Tomato Tartare", "subtitle": "with verjus granita and sourdough croutons", "images": [("IMG_2062.jpeg", .50, .70, .94)]},
    {"title": "Dressed Paignton Harbour Crab", "subtitle": "with crab jelly, bread foam and lemon purée", "images": [("IMG_2066.jpeg", .50, .50, .98)]},
    {"title": "Fruits of the Sea", "subtitle": "with oyster ice cream and tomato foam", "images": [("IMG_2071.jpeg", .50, .52, .94)]},
    {"title": "Isle of Mull Langoustine", "subtitle": "with braised oxtail and Parmesan rice", "images": [("IMG_2077.jpeg", .50, .56, .72)]},
    {"title": "Raw Orkney Scallop", "subtitle": "with pear purée, pickled turnip and jalapeño granita", "images": [("IMG_2083.jpeg", .50, .62, .72)]},
    {"title": "Roast Orkney Scallops", "subtitle": "with artichoke & black olive soup and lemon, artichoke & celery brunoise", "images": []},
    {"title": "Paignton Harbour Crab", "subtitle": "with crab, yoghurt & sake sauce and mixed radishes", "images": [("IMG_2091.jpeg", .50, .52, .92)]},
    {"title": "St Austell Bay Lobster", "subtitle": "with yuzu jam and savoury seaweed custard", "images": [("IMG_2099.jpeg", .50, .60, .72)]},
    {"title": "Poached Day-netted South Coast Sea Bass", "subtitle": "with Tokyo turnip, Paignton Harbour crab reduction and olive oil mash", "images": [("IMG_2104.jpeg", .50, .59, .72)]},
    {"title": "Looe Day Boat Turbot", "subtitle": "with wild garlic & cockle velouté and cauliflower & yoghurt purée", "images": [("IMG_2109.jpeg", .50, .60, .72)]},
    {"title": "Poached South Coast John Dory", "subtitle": "with caramelised celeriac & chestnut purée, chestnut gnocchi and Périgord truffle sauce", "images": [("IMG_2114.jpeg", .50, .61, .72)]},
    {"title": "Brixham Day Boat Brill", "subtitle": "with goat’s cheese & cauliflower purée, Maylor prawns and herb sauce", "images": [("IMG_2123.jpeg", .50, .61, .72)]},
    {"title": "Newlyn Line-caught Sea Bass", "subtitle": "with shellfish fondue, crushed potatoes and seaweed butter sauce", "images": [("IMG_2127.jpeg", .50, .60, .72), ("IMG_2128.jpeg", .50, .60, .72)]},
    {"title": "Cumbrian Suckling Pig", "subtitle": "with red cabbage purée, stuffed dates and lardo-roasted potatoes", "images": [("IMG_2134.jpeg", .50, .60, .72)]},
    {"title": "Braised West Country Ox Cheek", "subtitle": "with beef dashi and bone marrow crumb", "images": [("IMG_2140.jpeg", .50, .62, .72)]},
    {"title": "40-day Dry-aged Lake District Beef Fillet", "subtitle": "with aubergine & miso purée, confit garlic and Dorset snails", "images": [("IMG_2146.jpeg", .50, .62, .72)]},
    {"title": "Roasted Squab Pigeon", "subtitle": "with baked Roscoff onion, violet artichoke barigoule and braised ceps", "images": [("IMG_2152.jpeg", .50, .60, .72)]},
    {"title": "Ribble Valley Chicken", "subtitle": "with braised leeks, mustard purée and chicken-fat mash", "images": [("IMG_2158.jpeg", .50, .60, .72), ("IMG_2159.jpeg", .50, .60, .72)]},
    {"title": "Game Pithivier", "subtitle": "with grouse, pheasant and wild mushrooms", "images": [("IMG_2166.jpeg", .50, .61, .72)]},
    {"title": "Salad of Wild Duck", "subtitle": "with liver parfait, walnut & pear purée and crushed potatoes", "images": [("IMG_2170.jpeg", .50, .61, .72), ("IMG_2171.jpeg", .50, .61, .72)]},
    {"title": "Soy-glazed Norfolk Quail", "subtitle": "with cured foie gras roll and compressed apple", "images": [("IMG_2176.jpeg", .50, .60, .72)]},
    {"title": "Grouse", "subtitle": "with chanterelle-stuffed cabbage, game chips and damson jam", "images": [("IMG_2180.jpeg", .73, .70, .48)]},
    {"title": "Banana Soufflé", "subtitle": "with tempered chocolate discs and rum & raisin ice cream", "images": [("IMG_2185.jpeg", .50, .54, .72)]},
    {"title": "Pistachio Soufflé", "subtitle": "with tempered chocolate discs and vanilla ice cream", "images": [("IMG_2189.jpeg", .50, .55, .72)]},
    {"title": "Brogdale Pear", "subtitle": "with milk crisp, whisky caramel and oat crumble", "images": [("IMG_2193.jpeg", .50, .67, .78)]},
    {"title": "Bitter Chocolate Pavé", "subtitle": "with olive oil biscuit, black olive tuile and olive oil jelly", "images": [("IMG_2198.jpeg", .50, .60, .72)]},
    {"title": "Parsnip Crème Caramel", "subtitle": "with blood orange granita and Pedro Ximénez-soaked raisins", "images": [("IMG_2204.jpeg", .50, .60, .72)]},
    {"title": "Wild Strawberries", "subtitle": "with sorrel & sake granita and buttermilk cream", "images": [("IMG_2208.jpeg", .50, .60, .72)]},
    {"title": "Clementine & Almond Macarons", "subtitle": "with yuzu & white chocolate crème pâtissière and white chocolate discs", "images": [("IMG_2213.jpeg", .50, .58, .72)]},
]


YIELD_PATTERN = re.compile(
    r"^(?P<yield>"
    r"SERVES\s+\d+(?:\s*[–-]\s*\d+)?|"
    r"MAKES(?:\s+ABOUT)?\s+(?:\d+(?:\.\d+)?(?:\s*[–-]\s*\d+(?:\.\d+)?)?\s*(?:KG|G|ML|L)|\d+(?:\s*[–-]\s*\d+)?|1\s+LOAF)|"
    r"ABOUT\s+\d+(?:\.\d+)?\s*(?:KG|G|ML|L)"
    r")\s+",
    re.IGNORECASE,
)


def normalized(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = "".join(character for character in value if not unicodedata.combining(character))
    value = value.replace("’", "'").replace("‘", "'").replace("–", "-").replace("—", "-")
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def slugify(value: str) -> str:
    return normalized(value).replace(" ", "-")


def load_blocks(reference_html: Path) -> list[str]:
    source = reference_html.read_text(encoding="utf-8", errors="ignore")
    paragraphs = re.findall(r'<p class="d-block text-justify">(.*?)</p>', source, flags=re.DOTALL | re.IGNORECASE)
    if not paragraphs:
        raise RuntimeError("Could not find the cookbook text in the reference HTML")
    raw = max(paragraphs, key=len)
    raw = re.sub(r"<br\s*/?>", "\n", raw, flags=re.IGNORECASE)
    raw = re.sub(r"<[^>]+>", "", raw)
    raw = html.unescape(raw)
    raw = re.sub(r"[ \t]+", " ", raw)
    return [re.sub(r"\s+", " ", block).strip() for block in re.split(r"\n\s*\n", raw) if block.strip()]


def find_recipe_start(blocks: list[str], title: str, *, require_yield: bool = True) -> int:
    title_key = normalized(title)
    candidates: list[int] = []
    for index, block in enumerate(blocks):
        if normalized(block) != title_key:
            continue
        next_block = blocks[index + 1] if index + 1 < len(blocks) else ""
        after_subtitle = blocks[index + 2] if index + 2 < len(blocks) else ""
        has_recipe_shape = bool(
            YIELD_PATTERN.match(next_block)
            or (next_block.lower().startswith("with ") and YIELD_PATTERN.match(after_subtitle))
        )
        if not require_yield or has_recipe_shape:
            candidates.append(index)
    if not candidates:
        raise RuntimeError(f"Could not locate recipe: {title}")
    return candidates[-1]


def split_yield(text: str) -> tuple[str | None, str]:
    match = YIELD_PATTERN.match(text)
    if not match:
        return None, text
    return match.group("yield").strip(), text[match.end():].strip()


def heading_and_ingredients(text: str) -> tuple[str | None, str]:
    tokens = text.split()
    heading_tokens: list[str] = []
    for token in tokens:
        if any(character.isdigit() for character in token):
            break
        letters = "".join(character for character in token if character.isalpha())
        if not letters:
            if heading_tokens and token in {"&", "/", "+"}:
                heading_tokens.append(token)
                continue
            break
        if letters == letters.upper() and len(letters) > 1:
            heading_tokens.append(token)
            continue
        break
    if not heading_tokens:
        return None, text
    heading = " ".join(heading_tokens).strip(" ,")
    rest = " ".join(tokens[len(heading_tokens):]).strip()
    return heading, rest


NON_NUMERIC_STARTS = [
    "olive oil", "vegetable oil", "rapeseed oil", "sunflower oil", "sesame oil",
    "Maldon sea salt", "fine sea salt", "salt and pepper", "black pepper", "white pepper",
    "cold water", "hot water", "water,", "ice,", "knobs of", "sprigs of",
    "a bunch", "a handful", "a pinch", "a squeeze", "a splash", "a drizzle", "a few",
    "freshly grated", "finely grated zest", "pared zest", "juice of", "zest of", "rind of",
    "mixed summer herbs", "mixed herbs", "mixed salad leaves", "edible flowers",
    "tahini paste", "bee pollen", "Périgord truffles", "dry mineral sake",
]


DEPENDENT_NUMBER_WORDS = {
    "a", "about", "around", "at", "capacity", "for", "from", "heated", "made", "mark",
    "number", "of", "page", "see", "to", "into", "use", "using", "over",
    "stabiliser",
}


METHOD_STARTS = (
    "add ", "arrange ", "bake ", "blanch ", "blitz ", "bring ", "brush ", "chill ",
    "combine ", "cook ", "cover ", "cut ", "drain ", "dress ", "fill ", "for each ",
    "freeze ", "fry ", "gently ", "have ", "heat ", "lay ", "lightly ", "line ",
    "make ", "melt ", "mix ", "peel ", "place ", "poach ", "pour ", "preheat ",
    "prepare ", "press ", "put ", "remove ", "return ", "rinse ", "roast ", "score ",
    "scrape ", "season ", "set ", "shuck ", "sift ", "slice ", "soak ", "spoon ",
    "spread ", "stir ", "strain ", "sweat ", "take ", "thinly ", "tip ", "to assemble ",
    "transfer ", "trim ", "turn ", "use ", "warm ", "wash ", "whisk ", "wrap ",
)


def split_ingredients(text: str, known_names: list[str]) -> list[str]:
    text = re.sub(r"\s+", " ", text).strip(" ,")
    if not text:
        return []

    prefixes = sorted({*NON_NUMERIC_STARTS, *known_names}, key=lambda item: (-len(item), item.lower()))
    prefix_tokens = [(prefix, prefix.lower().split()) for prefix in prefixes]
    tokens = text.split()
    boundaries = [0]
    parenthesis_depth = 0

    for index, token in enumerate(tokens):
        if index > 0 and parenthesis_depth == 0:
            cleaned = token.lstrip("([{‘\"")
            previous = re.sub(r"[^a-z]+", "", tokens[index - 1].lower())
            current = " ".join(tokens[boundaries[-1]:index]).strip()
            quantity_only = bool(re.match(
                r"^(?:\d+(?:\.\d+)?(?:\s*[¼½¾⅓⅔⅛⅜⅝⅞])?|[¼½¾⅓⅔⅛⅜⅝⅞])"
                r"(?:\s*(?:kg|g|ml|l|litres?|tablespoons?|teaspoons?|cloves?|sprigs?|bunches?|drops?|dashes?|large|small|medium))?$",
                current,
                flags=re.IGNORECASE,
            ))
            numeric = bool(re.match(r"^(?:\d|[¼½¾⅓⅔⅛⅜⅝⅞])", cleaned))
            if numeric and previous not in DEPENDENT_NUMBER_WORDS and not quantity_only:
                boundaries.append(index)
            elif not numeric:
                remaining = [part.lower().strip(".,;:()[]") for part in tokens[index:]]
                for prefix, candidate in prefix_tokens:
                    if len(remaining) >= len(candidate) and remaining[:len(candidate)] == [part.strip(".,;:()[]") for part in candidate]:
                        brand_continuation = prefix.lower() == "olive oil" and current.lower().endswith(" arbequina")
                        current_without_quantity = re.sub(
                            r"^(?:\d+(?:\.\d+)?|[¼½¾⅓⅔⅛⅜⅝⅞])(?:\s*(?:kg|g|ml|l|litres?))?\s+",
                            "",
                            current,
                            flags=re.IGNORECASE,
                        )
                        recipe_name_continuation = any(
                            normalized(f"{current_without_quantity} {prefix}") == normalized(name)
                            for name in known_names
                        )
                        if not quantity_only and not current.lower().endswith(" and") and not brand_continuation and not recipe_name_continuation:
                            boundaries.append(index)
                        break
                else:
                    reference_window = " ".join(tokens[index:index + 9])
                    current_words = [word.strip(".,;:()[]") for word in current.split()]
                    current_is_title_phrase = bool(current_words) and all(word[:1].isupper() for word in current_words if word)
                    if (
                        cleaned[:1].isupper()
                        and "(see " in reference_window.lower()
                        and not quantity_only
                        and not current_is_title_phrase
                        and not current.lower().endswith(" and")
                    ):
                        boundaries.append(index)

        parenthesis_depth += token.count("(") + token.count("[")
        parenthesis_depth -= token.count(")") + token.count("]")
        parenthesis_depth = max(parenthesis_depth, 0)

    unique = sorted(set(boundaries))
    ingredients: list[str] = []
    for position, start in enumerate(unique):
        end = unique[position + 1] if position + 1 < len(unique) else len(tokens)
        item = " ".join(tokens[start:end]).strip(" ,")
        if item:
            ingredients.append(item)
    return ingredients


def tidy_ingredients(items: list[str]) -> list[str]:
    """Repair line-wrap joins inherited from the print edition's columns."""
    expanded: list[str] = []
    for item in items:
        parts = re.split(r"(?<=\w)\s+(?=a sprig of\b)", item, flags=re.IGNORECASE)
        if len(parts) == 1:
            parts = re.split(r"(?<=\w)\s+(?=about\s+\d)", item, flags=re.IGNORECASE)
        expanded.extend(part.strip() for part in parts if part.strip())

    joined: list[str] = []
    for item in expanded:
        if joined and (
            re.fullmatch(r"(?:\d+\s*[x×]|a few)", joined[-1], flags=re.IGNORECASE)
            or joined[-1].lower().endswith((" of", "extra virgin", "finely grated", "type"))
            or (item == "Stock" and joined[-1].endswith(("Fish", "Veal", "Chicken", "Duck", "Lamb")))
            or (re.fullmatch(r"\d+(?:[–-]\d+)?g each", item, flags=re.IGNORECASE) and "fillet" in joined[-1].lower())
        ):
            separator = ", " if item.lower().endswith(" each") else " "
            joined[-1] = f"{joined[-1]}{separator}{item}"
        else:
            joined.append(item)
    return joined


def display_heading(value: str) -> str:
    heading = value.title().replace("’S", "’s").replace("'S", "'s")
    return re.sub(r"\b(And|Of|With|In)\b", lambda match: match.group(1).lower(), heading)


DISH_INGREDIENT_REWRAPS: dict[str, list[str]] = {
    "500g white crab meat mayonnaise, to bind": ["500g white crab meat", "mayonnaise, to bind"],
    "12 cleaned oyster shells, to serve oyster leaves, to garnish": ["12 cleaned oyster shells, to serve", "oyster leaves, to garnish"],
    "150ml spring": ["150ml spring water"],
    "water": [],
    "100ml double cream extra virgin olive oil, to drizzle": ["100ml double cream", "extra virgin olive oil, to drizzle"],
    "a handful of dill, leaves picked and chopped cooked lobster meat, from 1–2 claws, chopped": [
        "a handful of dill, leaves picked and chopped",
        "cooked lobster meat, from 1–2 claws, chopped",
    ],
    "Tomato Foam (see above) extra virgin olive oil, to drizzle": ["Tomato Foam (see above)", "extra virgin olive oil, to drizzle"],
    "1 clove 2 tablespoons tomato paste": ["1 clove", "2 tablespoons tomato paste"],
    "1 small can": ["1 small can (30g) Ossetra caviar"],
    "(30g) Ossetra caviar (we use Petrossian)": [],
    "(30g) Ossetra caviar": [],
    "Wasabi &": ["Wasabi & Yuzu Dressing (see Raw Orkney Scallop recipe)"],
    "Yuzu Dressing (see Raw Orkney Scallop recipe)": [],
    "Lemon Purée a small handful of blanched sea herbs": ["Lemon Purée", "a small handful of blanched sea herbs"],
    "125ml cold": ["125ml cold water"],
    "a handful of celery leaves, soaked in iced": ["a handful of celery leaves, soaked in iced water"],
    "1 clove 1 tablespoon tomato paste": ["1 clove", "1 tablespoon tomato paste"],
    "1 clove 1 small cinnamon stick": ["1 clove", "1 small cinnamon stick"],
    "250 full-fat plain yoghurt": ["250g full-fat plain yoghurt"],
    "50ml olive oil lime juice, to taste": ["50ml olive oil", "lime juice, to taste"],
    "Lemon Purée Crab Powder (see Dressed Paignton Harbour Crab recipe)": [
        "Lemon Purée",
        "Crab Powder (see Dressed Paignton Harbour Crab recipe)",
    ],
    "400g cooked lobster meat (from the claws and tail trimmings) finely grated lime zest and juice": [
        "400g cooked lobster meat (from the claws and tail trimmings)",
        "finely grated lime zest and juice",
    ],
    "thin discs of Granny Smith apple thin discs of Tokyo turnip": [
        "thin discs of Granny Smith apple",
        "thin discs of Tokyo turnip",
    ],
    "Pickling Liquid Arbequina olive oil, to drizzle meat from 4–5 cooked crab claws, cut into smaller pieces": [
        "Pickling Liquid",
        "Arbequina olive oil, to drizzle",
        "meat from 4–5 cooked crab claws, cut into smaller pieces",
    ],
    "1 rack of suckling pig with": ["1 rack of suckling pig with 8 bones, about 1kg"],
    "8 bones, about 1kg": [],
    "7 cloves a few": ["7 cloves", "a few sprigs of thyme"],
    "sprigs of thyme": [],
    "1 litre reduced": ["1 litre reduced Veal Stock"],
    "Veal Stock": [],
    "1 clove 1 litre red wine": ["1 clove", "1 litre red wine"],
    "a few knobs of unsalted butter finely grated lime zest": ["a few knobs of unsalted butter", "finely grated lime zest"],
    "4 ox cheeks meat brine (see above)": ["4 ox cheeks", "Meat Brine (see above)"],
    "100g unsalted butter pan-roasted confit garlic cloves (see above)": [
        "100g unsalted butter",
        "pan-roasted confit garlic cloves (see above)",
    ],
    "550–600g each": [],
    "100g Salt": ["100g Salt Cure (see Suckling Pig recipe)"],
    "Cure (see Suckling Pig recipe)": [],
    "2 litres reduced": ["2 litres reduced Veal Stock"],
    "200g stale breadcrumbs pigeon hearts and livers (see above)": [
        "200g stale breadcrumbs",
        "pigeon hearts and livers (see above)",
    ],
    "2 teaspoons Mushroom": ["2 teaspoons Mushroom Purée"],
    "Purée confit pigeon leg meat (see above) pigeon sauce (see above) grated truffle, to garnish": [
        "confit pigeon leg meat (see above)",
        "pigeon sauce (see above)",
        "grated truffle, to garnish",
    ],
    "1.5kg Spanish onions, sliced scooped-out baked onion (see above)": [
        "1.5kg Spanish onions, sliced",
        "scooped-out baked onion (see above)",
    ],
    "100ml pigeon sauce (see above) a sprig of thyme": ["100ml pigeon sauce (see above)", "a sprig of thyme"],
    "a few sprigs of rosemary meat glue, for dusting": ["a few sprigs of rosemary", "meat glue, for dusting"],
    "100–200ml": ["100–200ml Chicken Stock"],
    "Chicken Stock ready-made English mustard, to taste": ["ready-made English mustard, to taste"],
    "50ml water a dash of Minus": ["50ml water", "a dash of Minus 8 vinegar"],
    "8 vinegar": [],
    "1 small head of white-variegated kale, leaves separated candied walnuts, for grating": [
        "1 small head of white-variegated kale, leaves separated",
        "candied walnuts, for grating",
    ],
    "1–2": ["1–2 Périgord truffles, for grating"],
    "Périgord truffles, for grating": [],
    "300ml Meat": ["300ml Meat Brine (see Braised West Country Ox Cheek recipe)"],
    "Brine (see Braised West Country Ox Cheek recipe)": [],
    "300ml lemon juice pared peel of 1 lemon": ["300ml lemon juice", "pared peel of 1 lemon"],
    "100ml runny honey Pistachio Crumbs": ["100ml runny honey", "Pistachio Crumb"],
    "½ teaspoon crushed": ["½ teaspoon crushed white pepper"],
    "white pepper": [],
    "about 500ml": ["about 500ml vegetable oil, for deep-frying"],
    "olive oil, for cooking diced unsalted butter, for cooking": [
        "olive oil, for cooking",
        "diced unsalted butter, for cooking",
    ],
    "250g banana purée (we use Boivron purées) scant": ["250g banana purée (we use Boivron purées)", "scant 1 teaspoon cornflour"],
    "1 teaspoon cornflour": [],
    "1 teaspoon cold": ["1 teaspoon cold water"],
    "8 Tempered": ["8 Tempered Chocolate Discs (see Chocolate Pavé recipe)"],
    "Chocolate Discs (see Chocolate Pavé recipe)": [],
    "Rum & Raisin": ["Rum & Raisin Ice Cream"],
    "Ice Cream": [],
    "Vanilla": ["Vanilla Ice Cream"],
    "Goat’s Cheese": ["Goat’s Cheese Ice Cream"],
    "Olive Oil": ["Olive Oil Ice Cream"],
    "Ice Cream edible gold leaf": ["edible gold leaf"],
    "250g Valrhona white chocolate silver dust": ["250g Valrhona white chocolate", "silver dust"],
}


def rewrap_dish_ingredients(title: str, sections: list[dict[str, Any]]) -> None:
    for section in sections:
        rebuilt: list[str] = []
        for item in section["ingredients"]:
            rebuilt.extend(DISH_INGREDIENT_REWRAPS.get(item, [item]))
        section["ingredients"] = rebuilt

        if title == "Grouse" and section["name"] == "Game Chips":
            section["ingredients"] = [
                item for index, item in enumerate(section["ingredients"])
                if not (item == "vegetable oil, for deep-frying" and index > 0)
            ]

    if title == "Roasted Squab Pigeon":
        first = sections[0]["ingredients"]
        first[0] = "4 squab pigeons, 550–600g each"


def sentence_steps(blocks: list[str]) -> list[str]:
    text = " ".join(blocks)
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\s+([,.;:!?])", r"\1", text).strip()
    if not text:
        return []
    pieces = re.split(r"(?<=[.!?])\s+(?=(?:[A-ZÀ-ÖØ-Þ]|\())", text)
    return [piece.strip() for piece in pieces if len(piece.strip()) > 1]


def looks_like_ingredient_block(text: str, known_names: list[str]) -> bool:
    stripped = text.strip()
    if re.match(r"^(?:\d|[¼½¾⅓⅔⅛⅜⅝⅞])", stripped):
        return True
    lowered = stripped.lower()
    prefixes = [*NON_NUMERIC_STARTS, *known_names]
    return any(lowered.startswith(prefix.lower()) for prefix in prefixes)


def looks_like_method(text: str) -> bool:
    return text.strip().lower().startswith(METHOD_STARTS)


def split_ingredient_method(text: str) -> tuple[str, str]:
    candidates: list[int] = []
    for match in re.finditer(r"(?:^|\s)([A-ZÀ-ÖØ-Þ][^\s]*)", text):
        start = match.start(1)
        if start > 0 and text[start:].lower().startswith(METHOD_STARTS):
            candidates.append(start)
    if not candidates:
        return text, ""
    boundary = min(candidates)
    return text[:boundary].strip(), text[boundary:].strip()


def parse_basic_recipes(blocks: list[str]) -> list[dict[str, Any]]:
    starts = {
        title: find_recipe_start(blocks, title)
        for title, _ in BASICS
        if title != "Chicken Gravy"
    }

    known_names = [title for title, _ in BASICS]
    recipes: list[dict[str, Any]] = []
    for title, category in BASICS:
        if title == "Chicken Gravy":
            start = next(
                index for index, block in enumerate(blocks)
                if normalized(block).startswith("chicken gravy olive oil for cooking")
            )
            heading, ingredient_text = heading_and_ingredients(blocks[start])
            if heading != "CHICKEN GRAVY":
                raise RuntimeError("Could not parse the Chicken Gravy component")
            recipes.append({
                "slug": slugify(title),
                "name": title,
                "category": category,
                "yield": None,
                "ingredients": split_ingredients(ingredient_text, known_names),
                "method": sentence_steps(blocks[start + 1:start + 4]),
            })
            continue

        start = starts[title]
        later_starts = [candidate for candidate in starts.values() if candidate > start]
        if later_starts:
            end = min(later_starts)
        else:
            end = next(
                (index for index in range(start + 1, len(blocks)) if normalized(blocks[index]) == "about the author"),
                len(blocks),
            )
        segment = blocks[start + 1:end]
        if not segment:
            raise RuntimeError(f"No content found for basic recipe: {title}")
        recipe_yield, ingredient_text = split_yield(segment[0])
        recipes.append({
            "slug": slugify(title),
            "name": title,
            "category": category,
            "yield": recipe_yield,
            "ingredients": split_ingredients(ingredient_text, known_names),
            "method": sentence_steps(segment[1:]),
        })
    return recipes


def parse_dish(blocks: list[str], definition: dict[str, Any], known_names: list[str]) -> dict[str, Any]:
    title = definition["title"]
    start = find_recipe_start(blocks, title)
    title_key = normalized(title)
    end = len(blocks)
    for index in range(start + 1, len(blocks)):
        if normalized(blocks[index]) == title_key:
            end = index
            break

    segment = blocks[start + 1:end]
    sections: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None
    method_blocks: list[str] = []
    dish_yield: str | None = None
    searchable_parts = [title, definition["subtitle"]]

    def finish_current() -> None:
        nonlocal current, method_blocks
        if current is None:
            return
        current["steps"] = sentence_steps(method_blocks)
        sections.append(current)
        searchable_parts.extend(current["ingredients"])
        searchable_parts.extend(current["steps"])
        current = None
        method_blocks = []

    for raw_block in segment:
        if normalized(raw_block) == normalized(definition["subtitle"]):
            continue
        block_yield, remainder = split_yield(raw_block)
        if block_yield:
            dish_yield = dish_yield or block_yield
        heading, ingredient_text = heading_and_ingredients(remainder)
        if heading and heading not in {"POLLEN STREET", "STARTERS", "SHELLFISH", "FISH", "MEAT & GAME", "POULTRY & GAME BIRDS", "SWEETS"}:
            finish_current()
            begins_with_method = heading == "ASSEMBLY" and looks_like_method(ingredient_text)
            current = {
                "name": display_heading(heading) if heading != "ASSEMBLY" else "Assembly",
                "ingredients": [] if begins_with_method else tidy_ingredients(split_ingredients(ingredient_text, known_names)),
                "steps": [],
            }
            if begins_with_method:
                method_blocks.append(ingredient_text)
        elif block_yield and remainder:
            finish_current()
            current = {
                "name": title,
                "ingredients": tidy_ingredients(split_ingredients(remainder, known_names)),
                "steps": [],
            }
        elif current is not None:
            if not method_blocks and looks_like_ingredient_block(raw_block, known_names):
                ingredient_continuation, method_start = split_ingredient_method(raw_block)
                current["ingredients"].extend(tidy_ingredients(split_ingredients(ingredient_continuation, known_names)))
                if method_start:
                    method_blocks.append(method_start)
            else:
                method_blocks.append(raw_block)

    finish_current()
    if not sections:
        raise RuntimeError(f"No component sections found for dish: {title}")

    rewrap_dish_ingredients(title, sections)

    if title == "Poached Day-netted South Coast Sea Bass":
        sections[0]["name"] = "Sea Bass"
        sections[0]["steps"] = [step.replace("John Dory", "sea bass") for step in sections[0]["steps"]]

    searchable = normalized(" ".join(searchable_parts))
    references = [slugify(name) for name in known_names if normalized(name) in searchable and normalized(name) != normalized(title)]
    return {
        "slug": slugify(title),
        "title": title,
        "subtitle": definition["subtitle"],
        "yield": dish_yield,
        "images": [],
        "sections": sections,
        "basicReferences": references,
    }


def crop_photo(source: Path, destination: Path, focus_x: float, focus_y: float, crop_scale: float) -> None:
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")
        width, height = image.size
        crop_width = min(width, max(320, round(width * crop_scale)))
        crop_height = round(crop_width * 3 / 4)
        if crop_height > height:
            crop_height = height
            crop_width = round(crop_height * 4 / 3)
        centre_x = width * focus_x
        centre_y = height * focus_y
        left = max(0, min(width - crop_width, round(centre_x - crop_width / 2)))
        top = max(0, min(height - crop_height, round(centre_y - crop_height / 2)))
        cropped = image.crop((left, top, left + crop_width, top + crop_height))
        cropped = cropped.resize((1200, 900), Image.Resampling.LANCZOS)
        destination.parent.mkdir(parents=True, exist_ok=True)
        cropped.save(destination, format="JPEG", quality=84, optimize=True, progressive=True)


def build_images(dishes: list[dict[str, Any]], source_dir: Path, public_dir: Path) -> None:
    definition_by_title = {definition["title"]: definition for definition in DISHES}
    for dish in dishes:
        specs = definition_by_title[dish["title"]]["images"]
        for index, (filename, focus_x, focus_y, crop_scale) in enumerate(specs):
            suffix = f"-{index + 1}" if len(specs) > 1 else ""
            output_name = f"{dish['slug']}{suffix}.jpg"
            crop_photo(source_dir / filename, public_dir / output_name, focus_x, focus_y, crop_scale)
            dish["images"].append(f"/pollen-street/{output_name}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--reference-html", type=Path, required=True)
    parser.add_argument("--image-dir", type=Path, required=True)
    parser.add_argument("--output-json", type=Path, required=True)
    parser.add_argument("--public-dir", type=Path, required=True)
    args = parser.parse_args()

    blocks = load_blocks(args.reference_html)
    basics = parse_basic_recipes(blocks)
    basic_names = [recipe["name"] for recipe in basics]
    dishes = [parse_dish(blocks, definition, basic_names) for definition in DISHES]
    build_images(dishes, args.image_dir, args.public_dir)

    payload = {
        "categories": BASIC_CATEGORIES,
        "basics": basics,
        "dishes": dishes,
    }
    args.output_json.parent.mkdir(parents=True, exist_ok=True)
    args.output_json.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(basics)} basics and {len(dishes)} dishes to {args.output_json}")


if __name__ == "__main__":
    main()
