"""Build the Opéra Pâtisserie transcription manifest from the supplied PDF.

This importer intentionally uses the PDF text layer only as a first pass. The
generated JSON retains exact PDF page references so every recipe can be checked
against rendered source pages before publication.
"""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_TEXT_DIR = ROOT / "tmp/pdfs/cedric-grolet-opera/text/pages"
DEFAULT_OUTPUT = ROOT / "tmp/pdfs/cedric-grolet-opera/opera-draft.json"
RECIPE_STARTS: list[tuple[int, str, str]] = [
    (22, "Croissants", "7 a.m. · Breakfast pastries"),
    (25, "Pain au Chocolat", "7 a.m. · Breakfast pastries"),
    (30, "Raisin Rolls", "7 a.m. · Breakfast pastries"),
    (34, "Star Palmier", "7 a.m. · Breakfast pastries"),
    (37, "Raspberry Rolls", "7 a.m. · Breakfast pastries"),
    (40, "Latticed Apple Pastries", "7 a.m. · Breakfast pastries"),
    (43, "Kouign-Amann", "7 a.m. · Breakfast pastries"),
    (46, "Apple Turnover", "7 a.m. · Breakfast pastries"),
    (49, "Apricots with Pine Nuts", "7 a.m. · Breakfast pastries"),
    (55, "Puff Pastry Brioche Flan Tarts", "7 a.m. · Breakfast pastries"),
    (57, "Almond Hedgehog", "7 a.m. · Breakfast pastries"),
    (60, "Seeded Rolls", "7 a.m. · Breakfast pastries"),
    (64, "Lemon Rolls", "7 a.m. · Breakfast pastries"),
    (67, "Puff Pastry Crown", "7 a.m. · Breakfast pastries"),
    (70, "XL Madeleine", "7 a.m. · Breakfast pastries"),
    (73, "Praline Brioche", "7 a.m. · Breakfast pastries"),
    (76, "Savoy Cake", "7 a.m. · Breakfast pastries"),
    (79, "Powdered Kugelhopfs", "7 a.m. · Breakfast pastries"),
    (82, "Pancakes", "7 a.m. · Breakfast pastries"),
    (85, "Yogurt Cake", "7 a.m. · Breakfast pastries"),
    (87, "Marbled Chocolate Vanilla Cake", "7 a.m. · Breakfast pastries"),
    (92, "Divorcés", "11 a.m. · French pastries"),
    (95, "Citrus Baba", "11 a.m. · French pastries"),
    (99, "Grandma’s Crème Caramel", "11 a.m. · French pastries"),
    (101, "Clafoutis", "11 a.m. · French pastries"),
    (106, "Fruit Baskets", "11 a.m. · French pastries"),
    (109, "Sacher Cakes", "11 a.m. · French pastries"),
    (112, "White Forests", "11 a.m. · French pastries"),
    (117, "Fraisier Cake", "11 a.m. · French pastries"),
    (121, "Framboisier Cake", "11 a.m. · French pastries"),
    (126, "Vanilla Opera Cake", "11 a.m. · French pastries"),
    (129, "Hazelnut Paris-Brest", "11 a.m. · French pastries"),
    (133, "Tropézienne", "11 a.m. · French pastries"),
    (137, "Marvelous Choc’", "11 a.m. · French pastries"),
    (142, "Praline Success", "11 a.m. · French pastries"),
    (146, "Pears in Lace", "11 a.m. · French pastries"),
    (151, "Chestnut Baskets", "11 a.m. · French pastries"),
    (156, "Citrus Flowers", "11 a.m. · French pastries"),
    (160, "Zebra Vacherins", "11 a.m. · French pastries"),
    (163, "Éclairs", "11 a.m. · French pastries"),
    (167, "Éclair Religieuses", "11 a.m. · French pastries"),
    (171, "Peach Tart", "11 a.m. · French pastries"),
    (174, "Grandma Rose’s Tarte Tatin", "11 a.m. · French pastries"),
    (177, "Old-Fashioned Apple Tart", "11 a.m. · French pastries"),
    (180, "Rhubarb Crunch", "11 a.m. · French pastries"),
    (184, "Blackberry Puff", "11 a.m. · French pastries"),
    (187, "Puff Pastry Express", "11 a.m. · French pastries"),
    (191, "Basque Cake", "11 a.m. · French pastries"),
    (195, "Tiramisu Opera", "11 a.m. · French pastries"),
    (201, "Vanilla-Caramel Saint-Honoré", "11 a.m. · French pastries"),
    (205, "Chocolate Trianon", "11 a.m. · French pastries"),
    (209, "Chocolate Fondant", "11 a.m. · French pastries"),
    (211, "Custard in Chocolate Mousse", "11 a.m. · French pastries"),
    (214, "Healthy Seeded Galette", "11 a.m. · French pastries"),
    (218, "Pistachio Galette", "11 a.m. · French pastries"),
    (221, "Sugar Brioche", "11 a.m. · French pastries"),
    (224, "Crispy Eggs", "11 a.m. · French pastries"),
    (228, "Raspberry Crisp", "11 a.m. · French pastries"),
    (231, "Cereal Bars", "11 a.m. · French pastries"),
    (233, "Waffle Bars", "11 a.m. · French pastries"),
    (235, "Financiers", "11 a.m. · French pastries"),
    (238, "Vanilla Chouquettes", "11 a.m. · French pastries"),
    (241, "Cream Tart", "11 a.m. · French pastries"),
    (243, "Coconut Hearts", "11 a.m. · French pastries"),
    (246, "Raspberry Lunettes", "11 a.m. · French pastries"),
    (249, "XXL Chocolate Cookie", "11 a.m. · French pastries"),
    (253, "Johor Coffee", "3 p.m. · Desserts and frozen fruit"),
    (257, "Caramelized Rice Crisps", "3 p.m. · Desserts and frozen fruit"),
    (262, "Melon Granola", "3 p.m. · Desserts and frozen fruit"),
    (266, "Strawberry Ice Pops", "3 p.m. · Desserts and frozen fruit"),
    (269, "Honey Coral", "3 p.m. · Desserts and frozen fruit"),
    (273, "Salted Chocolate", "3 p.m. · Desserts and frozen fruit"),
    (277, "Tart Mango Leaves", "3 p.m. · Desserts and frozen fruit"),
    (280, "Meringue Soufflés", "3 p.m. · Desserts and frozen fruit"),
    (286, "Grapefruit Marigolds", "3 p.m. · Desserts and frozen fruit"),
    (289, "Forest Pepper Coconut", "3 p.m. · Desserts and frozen fruit"),
    (294, "Black Rice Cherry", "3 p.m. · Desserts and frozen fruit"),
    (297, "Vanilla Bubbles", "3 p.m. · Desserts and frozen fruit"),
    (301, "Colorful Rhubarb", "3 p.m. · Desserts and frozen fruit"),
    (304, "Dill Raspberries", "3 p.m. · Desserts and frozen fruit"),
    (309, "Fresh Apricots", "3 p.m. · Desserts and frozen fruit"),
    (312, "Pineapple", "3 p.m. · Desserts and frozen fruit"),
    (315, "Bananas", "3 p.m. · Desserts and frozen fruit"),
    (318, "Cherries", "3 p.m. · Desserts and frozen fruit"),
    (321, "Limes", "3 p.m. · Desserts and frozen fruit"),
    (324, "Coconut", "3 p.m. · Desserts and frozen fruit"),
    (327, "Kaffir Limes", "3 p.m. · Desserts and frozen fruit"),
    (330, "Figs", "3 p.m. · Desserts and frozen fruit"),
    (333, "Kiwifruit", "3 p.m. · Desserts and frozen fruit"),
    (336, "Fresh Mangoes", "3 p.m. · Desserts and frozen fruit"),
    (339, "Passion Fruit", "3 p.m. · Desserts and frozen fruit"),
    (342, "Peaches", "3 p.m. · Desserts and frozen fruit"),
    (345, "Pears", "3 p.m. · Desserts and frozen fruit"),
    (348, "Apples", "3 p.m. · Desserts and frozen fruit"),
    (354, "French Tradition", "5 p.m. · End of baking"),
    (357, "French Toast", "5 p.m. · End of baking"),
]


HEADING_RE = re.compile(r"^For(?: the)? (.+)$", re.IGNORECASE)
META_RE = re.compile(r"^(Makes|Serves|Preparation time|Cooking time|Resting time):?", re.IGNORECASE)
METHOD_START_RE = re.compile(
    r"^(?:In |Into |Preheat |Heat |Warm |Soak |Mix |Using |Put |Make |Halve |Melt |Bring |Combine |Blend |Whisk |Roll |Cut |Cook |Line |Pour |Peel |Wash |First, |The previous day, |On the previous day, |Leave |Place |Sprinkle |Whip |Beat |Add |Boil |Bake |Refrigerate |Freeze )",
    re.IGNORECASE,
)
EMBEDDED_METHOD_RE = re.compile(
    r"^(For(?: the)? .+?) (?=(?:In |Into |Preheat |Heat |Warm |Soak |Mix |Using |Put |Make |Halve |Melt |Bring |Combine |Blend |Whisk |Roll |Cut |Cook |Line |Pour |Peel |Wash |First, |The previous day, |On the previous day, |Leave |Place |Sprinkle |Whip |Beat |Add |Boil |Bake |Refrigerate |Freeze ))",
    re.IGNORECASE,
)
INGREDIENT_START_RE = re.compile(
    r"^(?:–\s|\d|[⅙⅛¼⅓⅜½⅝⅔¾⅞]|a few\b|as needed\b|borniambuc\b|brown sugar\b|cocoa\b|confectioners|dark chocolate\b|dried\b|egg molds\b|equipment\b|flour\b|fresh\b|gold\b|green\b|juice\b|light brown\b|milk chocolate\b|mint\b|neutral\b|oil\b|orange zest\b|pinch\b|red\b|salted\b|superfine\b|toasted\b|vanilla powder\b|white chocolate\b|yellow\b|zest\b)",
    re.IGNORECASE,
)
def slugify(value: str) -> str:
    value = value.lower().replace("œ", "oe").replace("æ", "ae").replace("’", "").replace("'", "")
    value = "".join(character for character in unicodedata.normalize("NFKD", value) if not unicodedata.combining(character))
    return re.sub(r"[^a-z0-9]+", "-", value).strip("-")


def normalize_heading(value: str) -> str:
    value = value.lower().strip().replace("–", "-")
    value = re.sub(r"\s+-\s+(?:kneaded butter|water dough).*$", "", value)
    return re.sub(r"\s+", " ", value)


def clean_lines(text: str) -> list[str]:
    # The ebook's text layer contains a handful of damaged metric glyphs even
    # though the surrounding household measures make the intended values
    # unambiguous. Correct those at import time and preserve the printed text
    # everywhere else.
    replacements = {
        "\u00ad": "",
        "water.For ": "water.\nFor ",
        "\nAssembly and baking\n": "\nFor assembly and baking\n",
        "\nFinishing and baking\n": "\nFor finishing and baking\n",
        "(⅓ g powdered)": "(13 g powdered)",
        "1 tablespoon (⅓ g)": "1 tablespoon (13 g)",
        "3 tablespoons (⅔ g) pine nuts": "3 tablespoons (30 g) pine nuts",
        "2 tablespoons (950 g) whipping cream": "2 pounds (950 g) whipping cream",
        "¾ cup plus 2 tablespoons (450 g) whole milk": "1¾ cups plus 2 tablespoons (450 g) whole milk",
        "whipping cream 2 vanilla beans": "whipping cream\n2 vanilla beans",
        "2 cups (500 g) plus 1½ tablespoons whipping cream": "2 cups plus 1½ tablespoons (500 g) whipping cream",
        "5 tablespoons (½ stick plus\n1 tablespoon/70 g) unsalted butter": "5 tablespoons (½ stick plus 1 tablespoon/70 g) unsalted butter",
        "2 fresh yellow mangoes (1 pound\n2 ounces/500 g)": "2 fresh yellow mangoes (1 pound 2 ounces/500 g)",
        "freezer four about": "freezer for about",
        "3 apples (1 pound 2 ounces/500 g) Juice of 1 lemon": "3 apples (1 pound 2 ounces/500 g)\nJuice of 1 lemon",
        "superfine sugar ⅙ teaspoon": "superfine sugar\n⅙ teaspoon",
        "ground almonds ⅙ teaspoon": "ground almonds\n⅙ teaspoon",
        " – Water dough": "\n– Water dough",
        " white couverture chocolate Decoration Codineige": " white couverture chocolate\nDecoration\nCodineige",
    }
    for damaged, corrected in replacements.items():
        text = text.replace(damaged, corrected)
    lines: list[str] = []
    for raw_line in text.splitlines():
        line = re.sub(r"\s+", " ", raw_line).strip()
        line = re.sub(r"(?<=\d)-\s+(?=(?:mm|cm|pound)\b)", "-", line)
        line = re.sub(r"(?<=[⅛¼⅓⅜½⅝⅔¾⅞])\s+-inch\b", "-inch", line)
        if not line:
            continue
        embedded = EMBEDDED_METHOD_RE.match(line)
        if embedded:
            heading = embedded.group(1).strip()
            lines.extend([heading, line[len(heading) :].strip()])
        else:
            lines.append(line)
    return lines


def append_wrapped(items: list[str], line: str) -> None:
    if not items or INGREDIENT_START_RE.match(line):
        items.append(line)
    else:
        items[-1] = f"{items[-1]} {line}"


def sentence_steps(lines: list[str]) -> list[str]:
    text = " ".join(lines).strip()
    if not text:
        return []
    return [part.strip() for part in re.split(r"(?<=[.!?])\s+(?=[A-ZÀ-ÖØ-Ý])", text) if part.strip()]


def parse_recipe(page: int, title: str, category: str, end_page: int, text_dir: Path) -> dict:
    pages = []
    source_pages = []
    for number in range(page, end_page + 1):
        path = text_dir / f"{number:03}.txt"
        text = path.read_text(encoding="utf-8") if path.exists() else ""
        if text.strip():
            pages.append(text)
            source_pages.append(number)
    lines = clean_lines("\n".join(pages))

    # Drop the printed title, including a second title line such as HONORÉ.
    if lines:
        lines.pop(0)
    while lines and not (META_RE.match(lines[0]) or HEADING_RE.match(lines[0]) or INGREDIENT_START_RE.match(lines[0])):
        lines.pop(0)

    meta: list[str] = []
    while lines and (META_RE.match(lines[0]) or (meta and not HEADING_RE.match(lines[0]) and not INGREDIENT_START_RE.match(lines[0]))):
        line = lines.pop(0)
        if META_RE.match(line):
            meta.append(line)
        elif meta:
            meta[-1] = f"{meta[-1]} {line}"

    components: list[dict] = []
    component_by_name: dict[str, dict] = {}

    def component(name: str, match_existing: bool = False) -> dict:
        key = normalize_heading(name)
        if match_existing and key not in component_by_name:
            close_keys = [
                existing
                for existing in component_by_name
                if existing.startswith(key) or key.startswith(existing) or existing.endswith(key)
            ]
            if len(close_keys) == 1:
                return component_by_name[close_keys[0]]
        if key not in component_by_name:
            entry = {"name": name.strip().capitalize(), "ingredients": [], "steps": []}
            component_by_name[key] = entry
            components.append(entry)
        return component_by_name[key]

    current = component(title)
    phase = "ingredients"
    seen_headings: set[str] = set()
    method_lines: list[str] = []

    def flush_method() -> None:
        nonlocal method_lines
        current["steps"].extend(sentence_steps(method_lines))
        method_lines = []

    for line in lines:
        heading_match = HEADING_RE.match(line)
        if phase == "ingredients" and line == "Decoration":
            current = component(line)
            continue
        heading_is_sentence = bool(re.match(r"^For (?:about|another|between|each|\d|[¼½¾⅓⅔⅛⅜⅝⅞])", line, re.IGNORECASE))
        if heading_match and len(line) < 90 and not heading_is_sentence and not line.endswith(('.', ':')):
            name = heading_match.group(1).strip()
            key = normalize_heading(name)
            if phase == "ingredients" and key in seen_headings:
                phase = "method"
            if phase == "ingredients":
                seen_headings.add(key)
                current = component(name)
            else:
                flush_method()
                current = component(name, match_existing=True)
            continue

        if phase == "ingredients" and METHOD_START_RE.match(line):
            phase = "method"

        if phase == "ingredients":
            append_wrapped(current["ingredients"], line)
        else:
            method_lines.append(line)
    flush_method()

    components = [entry for entry in components if entry["ingredients"] or entry["steps"]]
    slug = slugify(title)
    return {
        "slug": slug,
        "title": title,
        "category": category,
        "meta": meta,
        "pdfPage": page,
        "sourcePages": source_pages,
        "sourceImages": [f"/opera/pages/page-{source_page:03}.webp" for source_page in source_pages],
        "image": f"/opera/photos/{slug}.webp",
        "components": components,
    }


def main() -> None:
    text_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_TEXT_DIR
    output = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUTPUT
    recipes = []
    for index, (page, title, category) in enumerate(RECIPE_STARTS):
        next_page = RECIPE_STARTS[index + 1][0] if index + 1 < len(RECIPE_STARTS) else 359
        recipe = parse_recipe(page, title, category, next_page - 1, text_dir)
        # The book consistently places the finished pastry immediately before
        # its recipe opening. Almond Hedgehog is the one layout exception: its
        # finished pastry and title share PDF page 57.
        recipe["photoPage"] = page if page == 57 else page - 1
        recipes.append(recipe)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(recipes, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(recipes)} recipes to {output}")


if __name__ == "__main__":
    main()
