#!/usr/bin/env python3
"""Build the Core complete-dish inventory and web artwork from supplied scans.

The scans are the authority for page selection, order and layout. Vision OCR is
kept as searchable draft text and every card links back to its exact recipe-page
renders so dense or unusual layouts can be checked without losing information.
"""

from __future__ import annotations

import json
import re
import unicodedata
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageChops, ImageOps


ROOT = Path(__file__).resolve().parents[1]
WORK = Path("/tmp/core-book-work")
PUBLIC = ROOT / "public/core-book"
OUTPUT = ROOT / "lib/core-dishes-data.json"


@dataclass(frozen=True)
class DishSpec:
    title: str
    subtitle: str
    recipe_pages: tuple[tuple[int, int], ...]
    image_pages: tuple[tuple[int, int], ...]


DISHES = [
    DishSpec("Jellied Eel", "Toasted seaweed and malt vinegar", ((1, 4),), ((1, 2),)),
    DishSpec("Caviar Sandwich", "Buckwheat crêpe, egg and crème fraîche", ((1, 7),), ((1, 5),)),
    DishSpec("CFC", "Core fried chicken and caviar", ((1, 10),), ((1, 8),)),
    DishSpec("TFC", "Truffle fried chicken", ((1, 13),), ((1, 11),)),
    DishSpec("Core Caesar Salad", "Little Gem lettuce, anchovy and Parmesan", ((1, 16),), ((1, 14),)),
    DishSpec("Crispy Smoked Chicken Wing", "Beer, honey, lemon and thyme", ((1, 19),), ((1, 17),)),
    DishSpec("Crispy Smoked Duck Wing", "Burnt orange and spices", ((1, 22),), ((1, 20),)),
    DishSpec("Chicken Liver Parfait", "Smoked duck and Madeira", ((1, 25),), ((1, 23),)),
    DishSpec("Sausage in Brioche", "The Lyonnaise classic, rebuilt for Core", ((1, 28),), ((1, 26),)),
    DishSpec("Core Gougères", "Master recipe and six seasonal variations", ((1, 31), (1, 33), (1, 35), (1, 37), (1, 39)), ((1, 32), (1, 34), (1, 36), (1, 38))),
    DishSpec("Isle of Harris Scallop Tartare", "Sea vegetable consommé", ((1, 42),), ((1, 40),)),
    DishSpec("Scottish Langoustine and Wasabi", "Pea, rose geranium and almond", ((1, 47),), ((1, 45),)),
    DishSpec("Colchester Crab", "Sabayon, consommé and caviar", ((1, 52),), ((1, 50),)),
    DishSpec("Lobster and Spelt", "Fenland celery, caviar and Selim pepper", ((1, 55),), ((1, 53),)),
    DishSpec("Cold Slaw", "A chilled summer vegetable composition", ((1, 60),), ((1, 58),)),
    DishSpec("Nettle and Nasturtium Velouté", "Celtuce, voatsiperifery pepper and argan oil", ((2, 3),), ((1, 61),)),
    DishSpec("Potato and Roe", "Trout and herring roe with dulse beurre blanc", ((2, 6),), ((2, 4),)),
    DishSpec("Lamb Carrot", "Braised lamb and sheep’s milk yogurt", ((2, 11),), ((2, 9),)),
    DishSpec("Cheese and Onion", "A refined version of the British pairing", ((2, 14), (2, 15)), ((2, 12),)),
    DishSpec("Jerusalem Artichoke", "Mushroom, truffle, malt and Cheddar", ((2, 18), (2, 19)), ((2, 16),)),
    DishSpec("Beans on Toast", "Core’s three-Michelin-star interpretation", ((2, 22),), ((2, 20),)),
    DishSpec("Celeriac Roasted over Wood", "Black truffle and hazelnut", ((2, 25), (2, 26)), ((2, 23),)),
    DishSpec("Tartlets", "Morel, girolle, Jerusalem artichoke and cep tartlets", ((2, 30), (2, 31), (2, 33), (2, 35), (2, 36), (2, 38)), ((2, 29), (2, 32), (2, 34), (2, 37))),
    DishSpec("Poached Sea Bass", "Cockles, clams, coastal herbs and lovage", ((3, 1),), ((2, 39),)),
    DishSpec("Roasted Monkfish", "Morecambe Bay shrimps, Swiss chard and brown butter", ((3, 4), (3, 5)), ((3, 2),)),
    DishSpec("Cornish Turbot", "Smoked mussels, red apple, cabbage and cider", ((3, 8), (3, 9)), ((3, 6),)),
    DishSpec("Cornish Brill", "Oysters, cucumber and caviar", ((3, 14),), ((3, 12),)),
    DishSpec("Dover Sole", "Black truffle, leeks and Champagne sauce", ((3, 17),), ((3, 15),)),
    DishSpec("Duck and Nectarine", "Thyme, honey and Timut pepper", ((3, 20),), ((3, 18),)),
    DishSpec("Beef and Oyster", "Wagyu tongue, oyster and beef", ((3, 23), (3, 24)), ((3, 21),)),
    DishSpec("Lamb, Hogget and Mutton", "Celtuce, savory and black cardamom", ((3, 29), (3, 30)), ((3, 27),)),
    DishSpec("Dexter Short Rib", "Oxtail, onion and bone marrow", ((3, 33),), ((3, 31),)),
    DishSpec("Roast Grouse", "Red cabbage and bell heather", ((3, 36),), ((3, 34),)),
    DishSpec("Rhug Estate Venison", "Haggis, pearl barley and Lagavulin whisky", ((3, 41), (4, 1), (4, 2)), ((3, 39),)),
    DishSpec("Cherry Bakewell", "Cherry and almond", ((4, 7),), ((4, 5),)),
    DishSpec("Core Apple", "The restaurant’s signature apple dessert", ((4, 10),), ((4, 8),)),
    DishSpec("Core-teser", "Chocolate, malt and caramel", ((4, 13), (4, 14)), ((4, 11),)),
    DishSpec("Lemonade Parfait", "Honey and sheep’s milk yogurt", ((4, 19),), ((4, 17),)),
    DishSpec("Eton Mess", "Pear and verbena; wild strawberry and lemon verbena", ((4, 24), (4, 25)), ((4, 22), (4, 23))),
    DishSpec("The Other Carrot", "A carrot-led dessert", ((4, 28),), ((4, 26),)),
    DishSpec("Mont Blanc Pain Perdu", "Chestnut, prune and Earl Grey", ((4, 31),), ((4, 29),)),
    DishSpec("Notting Hill Forest", "Chestnut, hazelnut, pine and woodruff", ((4, 34), (4, 35)), ((4, 32),)),
    DishSpec("Snowball", "Rum, prune and pine", ((4, 38), (4, 39)), ((4, 36),)),
    DishSpec("Wine Gums", "Banyuls and red wine variations", ((5, 2),), ((4, 40),)),
    DishSpec("Warm Chocolate Tarts", "Classic chocolate and chocolate-clementine variations", ((5, 5), (5, 6)), ((5, 3),)),
    DishSpec("Malted Sourdough", "Core’s house bread", ((5, 9),), ((5, 7),)),
    DishSpec("Lamb Buns", "Savoury glazed buns", ((5, 15),), ((5, 14),)),
    DishSpec("Onion Buns", "Red onion marmalade and laminated bun dough", ((5, 17),), ((5, 16),)),
    DishSpec("Fig Rolls", "A cheese-course accompaniment", ((5, 19),), ((5, 18),)),
    DishSpec("Cheese and Crackers", "Oat and pumpkin seed; multigrain crackers", ((5, 23),), ((5, 21),)),
    DishSpec("Treacle Yogurt Buns", "Treacle-glazed yogurt buns", ((5, 26),), ((5, 24),)),
]


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = "".join(char for char in value if not unicodedata.combining(char))
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def page_path(volume: int, page: int) -> Path:
    return WORK / f"rendered/CORE{volume}/page-{page:02d}.jpg"


def ocr_path(volume: int, page: int) -> Path:
    return WORK / f"ocr/CORE{volume}/page-{page:02d}.tsv"


def ocr_lines(volume: int, page: int) -> list[dict[str, float | str]]:
    lines: list[dict[str, float | str]] = []
    for raw in ocr_path(volume, page).read_text(encoding="utf-8").splitlines():
        parts = raw.split("\t", 4)
        if len(parts) != 5:
            continue
        x, y, width, height, text = parts
        lines.append({"x": float(x), "y": float(y), "width": float(width), "height": float(height), "text": text.strip()})
    return lines


def reading_order(volume: int, page: int) -> list[str]:
    lines = ocr_lines(volume, page)
    # Recipe methods use two columns. Ingredient grids use four narrow columns;
    # retaining both orders gives search a complete index without pretending it
    # is the final visual transcription.
    columns: list[list[dict[str, float | str]]] = [[], []]
    for line in lines:
        columns[0 if float(line["x"]) < 0.5 else 1].append(line)
    ordered: list[str] = []
    for column in columns:
        column.sort(key=lambda line: (-float(line["y"]), float(line["x"])))
        ordered.extend(str(line["text"]) for line in column if line["text"])
    return ordered


def clean_ocr(text: str) -> str:
    """Repair recurring recognition artefacts without rewriting cookbook prose."""
    replacements = {
        "I hour": "1 hour",
        "I minute": "1 minute",
        "I garlic": "1 garlic",
        "l50°F": "150°F",
        "l40°F": "140°F",
        "l95°F": "195°F",
        "offlour": "of flour",
        "to caste": "to taste",
        "salt. to taste": "salt, to taste",
        "garlic.": "garlic,",
        "chives.": "chives,",
        "2.5 x |-cm (I x ½-inch)": "2.5 x 1-cm (1 x ½-inch)",
        "2-mm (16-inch)": "2-mm (1/16-inch)",
    }
    cleaned = text.replace("• ", "").replace("//", "")
    for source, target in replacements.items():
        cleaned = cleaned.replace(source, target)
    cleaned = re.sub(r"(?<=\d)(?=(?:g|kg|ml|litres?)\b)", " ", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned


def heading_text(text: str) -> bool:
    letters = [character for character in text if character.isalpha()]
    return len(letters) >= 3 and all(character.isupper() for character in letters)


def page_transcription(volume: int, page: int) -> dict[str, object]:
    lines = ocr_lines(volume, page)
    usable = [line for line in lines if clean_ocr(str(line["text"]))]
    yield_lines = [line for line in usable if re.match(r"^(Serves|Makes):?\s", str(line["text"]), re.IGNORECASE)]

    # The main recipe layouts repeat the first component heading below the
    # ingredient rule. That repeated heading gives us a more reliable split
    # than a fixed page coordinate.
    split_y: float | None = None
    if yield_lines:
        headings: dict[str, list[float]] = {}
        for line in usable:
            text = clean_ocr(str(line["text"]))
            if heading_text(text):
                headings.setdefault(text, []).append(float(line["y"]))
        repeated_lower = [min(points) for points in headings.values() if len(points) > 1 and max(points) > 0.6]
        split_y = max(repeated_lower) if repeated_lower else 0.58

    title_cutoff = max((float(line["y"]) for line in yield_lines), default=0.9)
    if split_y is None:
        ingredient_lines: list[dict[str, float | str]] = []
        method_lines = [line for line in usable if float(line["y"]) < title_cutoff + 0.08]
    else:
        ingredient_lines = [line for line in usable if split_y < float(line["y"]) < title_cutoff]
        method_lines = [line for line in usable if float(line["y"]) <= split_y]

    ingredient_columns: list[list[dict[str, object]]] = [[], [], [], []]
    for line in ingredient_lines:
        column = min(3, max(0, int(float(line["x"]) / 0.22)))
        ingredient_columns[column].append({
            "text": clean_ocr(str(line["text"])),
            "heading": heading_text(clean_ocr(str(line["text"]))),
        })
    # Vision returns lines in an arbitrary order.
    for index, column in enumerate(ingredient_columns):
        source_column = [line for line in ingredient_lines if min(3, max(0, int(float(line["x"]) / 0.22))) == index]
        source_column.sort(key=lambda line: -float(line["y"]))
        ingredient_columns[index] = [{"text": clean_ocr(str(line["text"])), "heading": heading_text(clean_ocr(str(line["text"])))} for line in source_column]

    method_columns: list[list[dict[str, object]]] = [[], []]
    for column_index in range(2):
        column = [line for line in method_lines if (float(line["x"]) < 0.5) == (column_index == 0)]
        column.sort(key=lambda line: -float(line["y"]))
        sections: list[dict[str, object]] = []
        current: dict[str, object] = {"heading": "Continuation", "paragraphs": []}
        paragraph: list[str] = []
        last_y: float | None = None
        for line in column:
            text = clean_ocr(str(line["text"]))
            if heading_text(text) and len(text) < 80:
                if paragraph:
                    current["paragraphs"].append(" ".join(paragraph))  # type: ignore[union-attr]
                    paragraph = []
                if current["paragraphs"] or current["heading"] != "Continuation":
                    sections.append(current)
                current = {"heading": text.title(), "paragraphs": []}
            else:
                if last_y is not None and last_y - float(line["y"]) > 0.022 and paragraph:
                    current["paragraphs"].append(" ".join(paragraph))  # type: ignore[union-attr]
                    paragraph = []
                paragraph.append(text)
            last_y = float(line["y"])
        if paragraph:
            current["paragraphs"].append(" ".join(paragraph))  # type: ignore[union-attr]
        if current["paragraphs"] or current["heading"] != "Continuation":
            sections.append(current)
        method_columns[column_index] = sections

    return {
        "label": f"Core PDF {volume} · supplied page {page}",
        "ingredientColumns": [column for column in ingredient_columns if column],
        "methodColumns": [column for column in method_columns if column],
    }


def original_yield(pages: tuple[tuple[int, int], ...]) -> str | None:
    pattern = re.compile(r"^(Serves|Makes):?\s+.+$", re.IGNORECASE)
    for volume, page in pages:
        for line in reading_order(volume, page):
            if pattern.match(line):
                return line.replace("I loaf", "1 loaf").replace("I ", "1 ")
    return None


def save_scan(source: Path, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as raw:
        image = ImageOps.exif_transpose(raw).convert("RGB")
        image.thumbnail((1500, 1942), Image.Resampling.LANCZOS)
        image.save(target, "JPEG", quality=85, optimize=True, progressive=True)


def content_crop(source: Path, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as raw:
        image = ImageOps.exif_transpose(raw).convert("RGB")
    background = Image.new("RGB", image.size, (250, 250, 250))
    difference = ImageChops.difference(image, background).convert("L")
    mask = difference.point(lambda value: 255 if value > 18 else 0)
    bbox = mask.getbbox() or (0, 0, image.width, image.height)
    pad_x = max(20, int((bbox[2] - bbox[0]) * 0.07))
    pad_y = max(20, int((bbox[3] - bbox[1]) * 0.07))
    left = max(0, bbox[0] - pad_x)
    top = max(0, bbox[1] - pad_y)
    right = min(image.width, bbox[2] + pad_x)
    bottom = min(image.height, bbox[3] + pad_y)
    cropped = image.crop((left, top, right, bottom))
    cropped.thumbnail((1800, 1800), Image.Resampling.LANCZOS)
    cropped.save(target, "JPEG", quality=87, optimize=True, progressive=True)


def main() -> None:
    # This directory is entirely generated by this script. Clear stale assets
    # when page boundaries or image assignments are corrected.
    for directory in (PUBLIC / "dishes", PUBLIC / "scans"):
        if directory.exists():
            for asset in directory.glob("*.jpg"):
                asset.unlink()
    data = []
    for spec in DISHES:
        slug = slugify(spec.title)
        scans: list[str] = []
        images: list[str] = []
        searchable: list[str] = []
        for index, (volume, page) in enumerate(spec.recipe_pages, start=1):
            target = PUBLIC / f"scans/{slug}-{index}.jpg"
            save_scan(page_path(volume, page), target)
            scans.append("/" + str(target.relative_to(ROOT / "public")))
            searchable.extend(reading_order(volume, page))
        for index, (volume, page) in enumerate(spec.image_pages, start=1):
            # Keep a version in the URL so Next's image optimizer cannot serve
            # a stale crop after a cookbook boundary is corrected.
            target = PUBLIC / f"dishes/{slug}-{index}-v2.jpg"
            content_crop(page_path(volume, page), target)
            images.append("/" + str(target.relative_to(ROOT / "public")))
        data.append({
            "slug": slug,
            "title": spec.title,
            "subtitle": spec.subtitle,
            "yield": original_yield(spec.recipe_pages),
            "images": images,
            "sourceScans": scans,
            "searchText": " ".join(searchable),
            "sourcePages": [f"Core PDF {volume}, supplied page {page}" for volume, page in spec.recipe_pages],
            "pages": [page_transcription(volume, page) for volume, page in spec.recipe_pages],
        })
    OUTPUT.write_text(json.dumps({"dishes": data}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(data)} Core dish groups to {OUTPUT}")


if __name__ == "__main__":
    main()
