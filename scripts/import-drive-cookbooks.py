"""Build structured, recipe-only records from the six supplied cookbook PDFs.

The import is intentionally book-specific.  The PDFs use very different visual
systems, so page regions and recipe boundaries are derived from each book's
layout rather than from one generic OCR/text-marker pass.

Run with the bundled PDF runtime:

  /Users/curtislee/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 \
    scripts/import-drive-cookbooks.py
"""

from __future__ import annotations

import json
import re
import subprocess
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

import pdfplumber
from PIL import Image, ImageChops, ImageStat

ROOT = Path(__file__).resolve().parents[1]
PDF_ROOT = Path("/tmp/cookbook-imports")
OUT = ROOT / "lib" / "imported-cookbooks-data.json"
IMAGE_ROOT = ROOT / "public" / "imported-cookbooks" / "recipes"
PDFTOPPM = Path(
    "/Users/curtislee/.cache/codex-runtimes/"
    "codex-primary-runtime/dependencies/bin/override/pdftoppm"
)

IMPERATIVES = {
    "add",
    "arrange",
    "bake",
    "beat",
    "blend",
    "boil",
    "bring",
    "brush",
    "char",
    "chill",
    "chop",
    "combine",
    "cook",
    "cool",
    "cover",
    "cut",
    "discard",
    "divide",
    "drain",
    "dry",
    "fill",
    "fold",
    "fry",
    "grate",
    "grill",
    "grind",
    "heat",
    "knead",
    "lay",
    "leave",
    "line",
    "make",
    "mash",
    "melt",
    "mix",
    "place",
    "poach",
    "pour",
    "preheat",
    "prepare",
    "press",
    "put",
    "reduce",
    "remove",
    "rinse",
    "roast",
    "roll",
    "rub",
    "scatter",
    "season",
    "serve",
    "set",
    "shape",
    "sift",
    "slice",
    "soak",
    "spoon",
    "sprinkle",
    "steam",
    "stir",
    "strain",
    "transfer",
    "trim",
    "turn",
    "warm",
    "wash",
    "whisk",
    "wrap",
}

QUANTITY_START = re.compile(
    r"^(?:about\s+|approximately\s+|scant\s+|a\s+few\s+|a\s+little\s+|"
    r"a\s+handful\s+|one\s+|two\s+|three\s+|four\s+|five\s+|six\s+|"
    r"\d|[¼½¾⅓⅔⅛⅜⅝⅞]|[•·▪●‧*-])",
    re.I,
)


@dataclass
class TextLine:
    text: str
    top: float
    x0: float
    bottom: float


def clean_text(value: str) -> str:
    value = unicodedata.normalize("NFKC", value)
    value = value.replace("\u00ad", "").replace("ﬁ", "fi").replace("ﬂ", "fl")
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r"\s+([,.;:!?])", r"\1", value)
    return value.strip()


def clean_line(value: str) -> str:
    value = clean_text(value)
    value = re.sub(r"^[•·▪●‧]\s*", "", value)
    return value.strip(" \t")


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = "".join(char for char in value if not unicodedata.combining(char))
    value = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return value[:90] or "recipe"


def smart_title(value: str) -> str:
    value = clean_text(value)
    if not value:
        return "Untitled recipe"
    words = []
    for word in value.split():
        if re.fullmatch(r"[IVX]+", word):
            words.append(word)
        elif word.upper() == word:
            words.append(word.title())
        else:
            words.append(word)
    title = " ".join(words)
    return re.sub(r"\bAnd\b", "and", re.sub(r"\bWith\b", "with", title))


def page_text(page: Any) -> str:
    return clean_text(page.extract_text(x_tolerance=2, y_tolerance=3) or "")


def page_lines(page: Any, bbox: tuple[float, float, float, float] | None = None) -> list[TextLine]:
    target = page.crop(bbox) if bbox else page
    result: list[TextLine] = []
    try:
        raw_lines = target.extract_text_lines()
    except Exception:
        raw_lines = []
    for line in raw_lines:
        text = clean_text(line.get("text", ""))
        if not text:
            continue
        result.append(
            TextLine(
                text=text,
                top=float(line.get("top", 0)),
                x0=float(line.get("x0", 0)),
                bottom=float(line.get("bottom", line.get("top", 0))),
            )
        )
    return sorted(result, key=lambda line: (line.top, line.x0))


def paragraph_groups(lines: Iterable[TextLine], gap: float = 24) -> list[str]:
    groups: list[list[TextLine]] = []
    for line in sorted(lines, key=lambda item: (item.top, item.x0)):
        if not groups or line.top - groups[-1][-1].top > gap:
            groups.append([line])
        else:
            groups[-1].append(line)
    return [clean_text(" ".join(item.text for item in group)) for group in groups]


def pseudo_lines(text: str) -> list[TextLine]:
    return [
        TextLine(text=clean_text(line), top=index * 18, x0=0, bottom=index * 18 + 12)
        for index, line in enumerate(text.splitlines())
        if clean_text(line)
    ]


def imperative_paragraphs(lines: Iterable[TextLine]) -> list[str]:
    steps: list[str] = []
    active = ""
    for line in lines:
        if starts_method(line.text) and active:
            steps.append(active)
            active = line.text
        elif active:
            active = clean_text(f"{active} {line.text}")
        elif starts_method(line.text):
            active = line.text
    if active:
        steps.append(active)
    return steps


def starts_method(text: str) -> bool:
    normalized = re.sub(r"^[^A-Za-z]+", "", text)
    first = normalized.split(maxsplit=1)[0].lower() if normalized.split() else ""
    return first in IMPERATIVES


def merge_ingredient_lines(lines: Iterable[str]) -> list[str]:
    merged: list[str] = []
    for raw in lines:
        line = clean_line(raw)
        if not line or re.fullmatch(r"[-–—]", line):
            continue
        if not merged or QUANTITY_START.match(raw.strip()) or starts_method(line):
            merged.append(line)
        else:
            # Ingredient continuation lines are normally indented and do not begin
            # with a quantity. Preserve short group labels as their own lines.
            if re.match(r"^(For|To)\b", line) and len(line) < 55:
                merged.append(line)
            else:
                merged[-1] = clean_text(f"{merged[-1]} {line}")
    return merged


def ingredient_groups(lines: Iterable[str]) -> list[dict[str, Any]]:
    groups: list[dict[str, Any]] = [{"heading": "Ingredients", "lines": []}]
    for line in merge_ingredient_lines(lines):
        if (
            re.match(r"^(For|To)\b", line)
            and len(line) < 60
            and not re.search(r"\d", line)
            and not line.endswith((".", ","))
        ):
            groups.append({"heading": line.rstrip(":"), "lines": []})
        else:
            groups[-1]["lines"].append(line)
    return [group for group in groups if group["lines"]]


def category_for(page: int, categories: list[tuple[int, str]]) -> str:
    return max((category for first, category in categories if page >= first), default=categories[0][1])


def unique_ids(recipes: list[dict[str, Any]]) -> None:
    used: dict[str, int] = {}
    for recipe in recipes:
        base = slugify(recipe["title"])
        used[base] = used.get(base, 0) + 1
        recipe["id"] = base if used[base] == 1 else f"{base}-{used[base]}"


def method_groups(steps: Iterable[str]) -> list[dict[str, Any]]:
    cleaned = [clean_text(step) for step in steps if clean_text(step)]
    return [{"heading": "Method", "steps": cleaned}] if cleaned else []


def extract_meta(lines: Iterable[str]) -> tuple[str | None, str | None, str | None]:
    yield_text = prep = cook = None
    for line in lines:
        text = clean_text(line)
        if re.match(r"^(Serves|Makes|Yield|Yields)\b", text, re.I):
            yield_text = text
        elif re.match(r"^(Preparation|Prep)\b", text, re.I):
            prep = re.sub(r"^(Preparation|Prep)\s*time\s*:?\s*", "", text, flags=re.I)
        elif re.match(r"^Cooking\b", text, re.I):
            cook = re.sub(r"^Cooking\s*time\s*:?\s*", "", text, flags=re.I)
    return yield_text, prep, cook


def recipe_record(
    *,
    title: str,
    category: str,
    source_pages: list[int],
    ingredients: list[str] | list[dict[str, Any]],
    steps: list[str],
    subtitle: str | None = None,
    yield_text: str | None = None,
    prep_time: str | None = None,
    cook_time: str | None = None,
    image: str | None = None,
) -> dict[str, Any]:
    groups = (
        ingredients
        if ingredients and isinstance(ingredients[0], dict)
        else ingredient_groups(ingredients)  # type: ignore[arg-type]
    )
    search_text = " ".join(
        [
            title,
            subtitle or "",
            *(line for group in groups for line in group["lines"]),
            *steps,
        ]
    )
    return {
        "id": "",
        "title": clean_text(title),
        "subtitle": clean_text(subtitle or ""),
        "category": category,
        "sourcePages": source_pages,
        "yield": yield_text,
        "prepTime": prep_time,
        "cookTime": cook_time,
        "ingredientGroups": groups,
        "methodGroups": method_groups(steps),
        "image": image,
        "searchText": clean_text(search_text),
    }


def detect_photo_page(pdf_path: Path, page_number: int, destination: Path) -> str | None:
    """Render a candidate page and keep it only when it is visibly image-heavy."""
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_suffix("")
    subprocess.run(
        [
            str(PDFTOPPM),
            "-f",
            str(page_number),
            "-l",
            str(page_number),
            "-singlefile",
            "-jpeg",
            "-scale-to-x",
            "900",
            "-scale-to-y",
            "-1",
            str(pdf_path),
            str(temporary),
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    rendered = temporary.with_suffix(".jpg")
    image = Image.open(rendered).convert("RGB")
    white = Image.new("RGB", image.size, "white")
    difference = ImageChops.difference(image, white).convert("L")
    # Ignore faint paper texture and body text. A photograph has broad tonal
    # variation and/or meaningful colour coverage; dense black type alone can
    # otherwise look "image-heavy" when reduced to a binary mask.
    mask = difference.point(lambda value: 255 if value > 34 else 0)
    sample = image.resize((120, 120))
    pixels = list(sample.getdata())
    non_white_ratio = sum(1 for pixel in pixels if max(pixel) < 245) / len(pixels)
    saturated_ratio = sum(
        1
        for red, green, blue in pixels
        if max(red, green, blue) > 0
        and (max(red, green, blue) - min(red, green, blue)) / max(red, green, blue) > 0.08
    ) / len(pixels)
    luminance_variance = ImageStat.Stat(sample.convert("L")).var[0]
    is_photo = saturated_ratio >= 0.05 or (
        non_white_ratio >= 0.32 and luminance_variance >= 1300
    )
    if not is_photo:
        rendered.unlink(missing_ok=True)
        # A previous import may have assigned this recipe a stale or overly
        # permissive image. Remove it when the actual candidate page is text.
        destination.unlink(missing_ok=True)
        return None
    bbox = mask.getbbox()
    if bbox:
        image = image.crop(bbox)
    if image.width > 1000:
        image.thumbnail((1000, 1000))
    image.save(destination, "WEBP", quality=78, method=6)
    rendered.unlink(missing_ok=True)
    return "/" + str(destination.relative_to(ROOT / "public"))


def import_everyday_lebanese() -> dict[str, Any]:
    pdf_path = PDF_ROOT / "everyday-lebanese.pdf"
    categories = [
        "Starters - Maza",
        "Salads and Soups",
        "Meat, Poultry and Fish",
        "Vegetable and Pulse Main Dishes",
        "Sweets",
        "Basic Recipes",
    ]
    chapter_pattern = re.compile(r"^[2-7]\s+(.+?)(?:\s+-\s+.+)?$")
    toc: list[tuple[str, str]] = []
    current: str | None = None
    with pdfplumber.open(pdf_path) as pdf:
        for page_number in range(6, 11):
            for line in (pdf.pages[page_number - 1].extract_text() or "").splitlines():
                line = clean_text(line)
                chapter = chapter_pattern.match(line)
                if chapter:
                    label = chapter.group(1)
                    if label.startswith("Starters"):
                        current = categories[0]
                    elif label.startswith("Salads"):
                        current = categories[1]
                    elif label.startswith("Meat"):
                        current = categories[2]
                    elif label.startswith("Vegetable"):
                        current = categories[3]
                    elif label.startswith("Sweets"):
                        current = categories[4]
                    elif label.startswith("Basic"):
                        current = categories[5]
                    continue
                if current and " - " in line:
                    toc.append((current, line))

        starts = [
            number
            for number, page in enumerate(pdf.pages, start=1)
            if number >= 35 and re.search(r"\b(?:SERVES|MAKES)\b", page_text(page), re.I)
        ]
        # Feta Cheese and Filo Slices has no stated yield, but is a complete
        # contents-listed recipe beginning on page 78.
        starts = sorted(set(starts + [78]))
        if len(starts) != len(toc):
            raise RuntimeError(f"Lebanese contents/start mismatch: {len(toc)} titles, {len(starts)} starts")

        recipes: list[dict[str, Any]] = []
        for index, (start, (category, title)) in enumerate(zip(starts, toc, strict=True)):
            next_start = starts[index + 1] if index + 1 < len(starts) else len(pdf.pages) + 1
            start_text = page_text(pdf.pages[start - 1])
            lines = [clean_text(line) for line in start_text.splitlines() if clean_text(line)]
            yield_index = next(
                (i for i, line in enumerate(lines) if re.match(r"^(?:SERVES|MAKES)\b", line, re.I)),
                None,
            )
            prep_index = next(
                (i for i, line in enumerate(lines) if re.match(r"^Preparation time", line, re.I)),
                len(lines),
            )
            cook_index = next(
                (i for i, line in enumerate(lines) if re.match(r"^Cooking time", line, re.I)),
                prep_index,
            )
            if yield_index is not None:
                ingredient_start = yield_index + 1
            else:
                ingredient_start = next(
                    (i for i, line in enumerate(lines[:prep_index]) if QUANTITY_START.match(line)),
                    prep_index,
                )
            ingredient_lines = lines[ingredient_start:prep_index]
            yield_text, prep, cook = extract_meta(lines)

            raw_method_lines = lines[cook_index + 1 :] if cook_index < len(lines) else []
            for page_number in range(start + 1, next_start):
                continuation = page_text(pdf.pages[page_number - 1])
                if continuation and len(continuation) > 80:
                    raw_method_lines.extend(continuation.splitlines())

            steps: list[str] = []
            active = ""
            for raw in raw_method_lines:
                line = clean_text(raw)
                if not line:
                    continue
                if raw.lstrip().startswith(("•", "·")):
                    if active:
                        steps.append(active)
                    active = clean_line(line)
                elif active:
                    active = clean_text(f"{active} {line}")
                elif starts_method(line):
                    active = line
            if active:
                steps.append(active)

            image = None
            for candidate in range(start + 1, next_start):
                if len(page_text(pdf.pages[candidate - 1])) <= 90:
                    image = detect_photo_page(
                        pdf_path,
                        candidate,
                        IMAGE_ROOT / "everyday-lebanese" / f"{slugify(title)}.webp",
                    )
                    if image:
                        break
            recipes.append(
                recipe_record(
                    title=title.replace(" - ", " · "),
                    category=category,
                    source_pages=[start],
                    ingredients=ingredient_lines,
                    steps=steps,
                    yield_text=yield_text,
                    prep_time=prep,
                    cook_time=cook,
                    image=image,
                )
            )

    unique_ids(recipes)
    return {
        "id": "everyday-lebanese",
        "title": "Everyday Lebanese",
        "author": "Mona Hamadeh",
        "description": "Recipe-only transcription organized from the supplied book contents.",
        "recipeCountLabel": f"{len(recipes)} recipes",
        "categories": categories,
        "recipes": recipes,
    }


ANATOLIA_CATEGORIES = [
    (55, "Breakfast · Light starts & banquets"),
    (120, "Lunch · Casual & regional"),
    (212, "Afternoon tea · Puddings, baklavas & sweets"),
    (272, "Meze · Small plates to drink with"),
    (367, "Dinner · Traditions & innovations"),
]


def is_uppercase_display_line(value: str) -> bool:
    letters = re.sub(r"[^A-Za-zÇĞİÖŞÜÂÊÎÔÛ]", "", value)
    return bool(letters) and letters.upper() == letters and len(value) <= 100


def leading_uppercase_lines(page: Any) -> list[str]:
    extracted = [clean_text(line) for line in page_text(page).splitlines() if clean_text(line)]
    result: list[str] = []
    for line in extracted[:6]:
        if is_uppercase_display_line(line):
            result.append(line)
        elif result:
            break
    return result


def anatolia_title(page: Any) -> tuple[str, str]:
    words = [
        word
        for word in page.extract_words(extra_attrs=["size"])
        if float(word["size"]) >= 20 and float(word["top"]) < 170
    ]
    grouped: list[list[dict[str, Any]]] = []
    for word in sorted(words, key=lambda item: (round(float(item["top"])), float(item["x0"]))):
        if not grouped or abs(float(word["top"]) - float(grouped[-1][0]["top"])) > 4:
            grouped.append([word])
        else:
            grouped[-1].append(word)
    lines = [clean_text(" ".join(word["text"] for word in group)) for group in grouped]
    lines = [line for line in lines if line]
    if not lines:
        lines = leading_uppercase_lines(page)
    if not lines:
        return "Untitled Anatolia recipe", ""
    if len(lines) == 1:
        return smart_title(lines[0]), ""
    return smart_title(" ".join(lines[1:])), smart_title(lines[0])


def import_anatolia() -> dict[str, Any]:
    pdf_path = PDF_ROOT / "anatolia.pdf"
    recipes: list[dict[str, Any]] = []
    with pdfplumber.open(pdf_path) as pdf:
        starts: list[int] = []
        for number in range(55, 476):
            page = pdf.pages[number - 1]
            text = page_text(page)
            displayed_titles = leading_uppercase_lines(page)
            has_ingredients = any(
                re.match(r"^(?:\d|[¼½¾⅓⅔⅛⅜⅝⅞])", clean_text(line))
                for line in text.splitlines()
            )
            if len(displayed_titles) >= 2 and len(text) > 400 and has_ingredients:
                starts.append(number)
        # Incini is a second complete cocktail on page 364 whose English title
        # is intentionally presented without a Turkish/English title pair.
        starts.append(364)
        starts = sorted(set(starts))
        for index, start in enumerate(starts):
            next_start = starts[index + 1] if index + 1 < len(starts) else 476
            page = pdf.pages[start - 1]
            title, subtitle = anatolia_title(page)
            lines = page_lines(page)
            layout_available = any(re.match(r"^SERVES\b", line.text, re.I) for line in lines)
            if not layout_available:
                lines = pseudo_lines(page_text(page))
            yield_pos = next(
                (
                    i
                    for i, line in enumerate(lines)
                    if re.match(r"^(?:SERVES?|MAKES?)\b", line.text, re.I)
                ),
                None,
            )
            ingredient_start = (
                yield_pos + 1
                if yield_pos is not None
                else next(
                    (
                        i
                        for i, line in enumerate(lines)
                        if re.match(r"^(?:\d|[¼½¾⅓⅔⅛⅜⅝⅞])", line.text)
                    ),
                    len(lines),
                )
            )
            method_pos = next(
                (i for i in range(ingredient_start, len(lines)) if starts_method(lines[i].text)),
                len(lines),
            )
            yield_text = lines[yield_pos].text if yield_pos is not None else None
            ingredients = [line.text for line in lines[ingredient_start:method_pos]]

            method_lines = lines[method_pos:]
            source_pages = [start]
            for page_number in range(start + 1, next_start):
                continuation = page_lines(pdf.pages[page_number - 1])
                text = page_text(pdf.pages[page_number - 1])
                if not continuation and text:
                    continuation = pseudo_lines(text)
                    layout_available = False
                if continuation and len(text) > 100 and not re.search(r"\bSERVES\s+\d", text, re.I):
                    method_lines.extend(continuation)
                    source_pages.append(page_number)
            steps = paragraph_groups(method_lines, gap=26) if layout_available else imperative_paragraphs(method_lines)

            image = None
            if start > 1:
                image = detect_photo_page(
                    pdf_path,
                    start - 1,
                    IMAGE_ROOT / "anatolia" / f"{slugify(title)}.webp",
                )
            recipes.append(
                recipe_record(
                    title=title,
                    subtitle=subtitle,
                    category=category_for(start, ANATOLIA_CATEGORIES),
                    source_pages=source_pages,
                    ingredients=ingredients,
                    steps=steps,
                    yield_text=yield_text,
                    image=image,
                )
            )
    unique_ids(recipes)
    categories = [category for _, category in ANATOLIA_CATEGORIES]
    return {
        "id": "anatolia",
        "title": "Anatolia",
        "author": "Somer Sivrioğlu & David Dale",
        "description": "Recipe-only transcription with stories removed and continuation pages combined.",
        "recipeCountLabel": f"{len(recipes)} recipes",
        "categories": categories,
        "recipes": recipes,
    }


JAPAN_CATEGORIES = [
    (29, "Before the Meal"),
    (59, "Dressed"),
    (91, "Raw"),
    (105, "Vinegared"),
    (121, "Simmered"),
    (153, "Soups"),
    (185, "Steamed"),
    (207, "Stir-Fries"),
    (227, "Fried"),
    (253, "Grilled"),
    (275, "Noodles"),
    (289, "Rice"),
    (319, "Pickles"),
    (349, "One-Pots"),
    (375, "Sweets"),
    (391, "Chefs"),
]


def reconstruct_display_lines(words: list[dict[str, Any]]) -> list[str]:
    groups: list[list[dict[str, Any]]] = []
    for word in sorted(words, key=lambda item: (float(item["top"]), float(item["x0"]))):
        if not groups or abs(float(word["top"]) - float(groups[-1][0]["top"])) > 4:
            groups.append([word])
        else:
            groups[-1].append(word)
    lines: list[str] = []
    for group in groups:
        text = ""
        previous_x1: float | None = None
        for word in sorted(group, key=lambda item: float(item["x0"])):
            gap = float(word["x0"]) - previous_x1 if previous_x1 is not None else 0
            if text and gap > 4:
                text += " "
            text += str(word["text"])
            previous_x1 = float(word["x1"])
        lines.append(clean_text(text))
    return lines


def crop_paragraphs(page: Any, bbox: tuple[float, float, float, float], gap: float = 13) -> list[str]:
    return paragraph_groups(page_lines(page, bbox), gap=gap)


def import_japan() -> dict[str, Any]:
    pdf_path = PDF_ROOT / "japan-the-cookbook.pdf"
    recipes: list[dict[str, Any]] = []
    with pdfplumber.open(pdf_path) as pdf:
        for page_number in range(31, 425):
            page = pdf.pages[page_number - 1]
            words = page.extract_words(extra_attrs=["size"])
            plain_words = page.extract_words()
            prep_tops = sorted(
                {
                    round(float(word["top"]))
                    for word in plain_words
                    if float(word["x0"]) < 290 and re.fullmatch(r"Preparation", str(word["text"]), re.I)
                }
            )
            for block_index, prep_top in enumerate(prep_tops):
                next_top = prep_tops[block_index + 1] - 45 if block_index + 1 < len(prep_tops) else 720
                title_words = [
                    word
                    for word in words
                    if float(word["x0"]) >= 285
                    and prep_top - 72 <= float(word["top"]) <= prep_top - 8
                    and 10.8 <= float(word["size"]) <= 12.7
                ]
                title_lines = reconstruct_display_lines(title_words)
                if not title_lines:
                    title_lines = [
                        line.text
                        for line in page_lines(page, (285, prep_top - 72, 565, prep_top - 8))
                    ]
                title = smart_title(" ".join(title_lines))
                if title == "Untitled recipe":
                    continue

                left_lines = page_lines(page, (125, prep_top - 5, 290, next_top))
                meta_lines = [line.text for line in left_lines[:5]]
                yield_text, prep, cook = extract_meta(meta_lines)
                meta_end = 0
                for i, line in enumerate(left_lines):
                    if re.match(r"^(Preparation|Cooking|Serves|Makes|Yields?)\b", line.text, re.I):
                        meta_end = i + 1
                ingredients = [line.text for line in left_lines[meta_end:]]

                first_column = page_lines(page, (290, prep_top - 5, 425, next_top))
                second_column = page_lines(page, (425, prep_top - 5, 565, next_top))
                start_index = next(
                    (
                        i + 1
                        for i, line in enumerate(first_column)
                        if re.fullmatch(r"[-–—]", line.text.strip())
                    ),
                    None,
                )
                if start_index is None:
                    start_index = next(
                        (i for i, line in enumerate(first_column) if starts_method(line.text)),
                        0,
                    )
                method_lines = first_column[start_index:] + second_column
                steps = paragraph_groups(method_lines, gap=13)
                recipes.append(
                    recipe_record(
                        title=title,
                        category=category_for(page_number, JAPAN_CATEGORIES),
                        source_pages=[page_number],
                        ingredients=ingredients,
                        steps=steps,
                        yield_text=yield_text,
                        prep_time=prep,
                        cook_time=cook,
                    )
                )
    unique_ids(recipes)
    categories = [category for _, category in JAPAN_CATEGORIES]
    return {
        "id": "japan-the-cookbook",
        "title": "Japan: The Cookbook",
        "author": "Nancy Singleton Hachisu",
        "description": "Recipe-only transcription separated from the page 6–7 contents and each recipe page footer.",
        "recipeCountLabel": f"{len(recipes)} recipes",
        "categories": categories,
        "recipes": recipes,
    }


SCIENCE_RECIPE_PAGES = [94, 106, 114, 126, 142, 158, 172, 198, 210]
SCIENCE_RECIPE_TITLES = [
    "Chinese Steamed Salmon with Chilli and Star Anise",
    "Chicken and Aubergine Biryani with Seven-Spice",
    "Ejjeh with Courgette, Feta, and Dill and Black Lime Harissa",
    "West African Peanut Curry with Durban Masala",
    "Asian Larb Salad with Curried Duck and Khao Kua",
    "Date and Tamarind Granita with Caramelized Pineapple",
    "Black Sesame, Liquorice, and Cardamom Ice Cream",
    "Spiced Scallops with Saffron Beurre Blanc",
    "Spiced Filipino Adobo with Chicken and Pork",
]


def import_science_of_spice() -> dict[str, Any]:
    pdf_path = PDF_ROOT / "science-of-spice.pdf"
    recipes: list[dict[str, Any]] = []
    with pdfplumber.open(pdf_path) as pdf:
        for page_number, title in zip(SCIENCE_RECIPE_PAGES, SCIENCE_RECIPE_TITLES, strict=True):
            page = pdf.pages[page_number - 1]
            left = page_lines(page, (145, 218, 292, 700))
            meta = [line.text for line in left[:5]]
            yield_text, prep, cook = extract_meta(meta)
            meta_end = 0
            for i, line in enumerate(left):
                if re.match(r"^(Serves|Makes|Prep|Cooking)\b", line.text, re.I):
                    meta_end = i + 1
            ingredients = [line.text for line in left[meta_end:]]
            method = crop_paragraphs(page, (295, 218, 565, 700), gap=18)
            method = [re.sub(r"^\d+\s*", "", step) for step in method]
            image = detect_photo_page(
                pdf_path,
                page_number + 1,
                IMAGE_ROOT / "science-of-spice" / f"{slugify(title)}.webp",
            )
            recipes.append(
                recipe_record(
                    title=title,
                    category="Spice-profile recipes" if page_number < 210 else "Further recipes",
                    source_pages=[page_number],
                    ingredients=ingredients,
                    steps=method,
                    yield_text=yield_text,
                    prep_time=prep,
                    cook_time=cook,
                    image=image,
                )
            )
    unique_ids(recipes)
    return {
        "id": "science-of-spice",
        "title": "The Science of Spice",
        "author": "Dr Stuart Farrimond",
        "description": "The book's complete recipes, separated from spice stories and reference pages.",
        "recipeCountLabel": f"{len(recipes)} recipes",
        "categories": ["Spice-profile recipes", "Further recipes"],
        "recipes": recipes,
    }


OPEN_CRUMB_FORMULAS = [
    {
        "start": 62,
        "title": "The Parmesan Core-Shaker Sourdough",
        "subtitle": "Durum and Parmesan at 85% hydration.",
        "source_pages": [62, 64],
        "ingredients": [
            "262.5g bread flour (12.5% protein, Bob’s Red Mill Artisan Bread Flour)",
            "87.5g durum flour (Central Milling Fancy Durum)",
            "297.5g water (85% hydration)",
            "70g strong and active starter or levain",
            "7g salt",
            "Finely grated Parmesan, to taste",
        ],
        "steps": [
            "Build a levain with 25g bathed starter, 25g flour and 25g water (1:1:1). Keep it at 81°F (27°C), stir it with mini stretch-and-folds after 1-2 hours, and use it at peak activity, about 6 hours in the author’s conditions.",
            "Autolyse the flours and water for 2 hours. A longer autolyse of up to 6 hours may also be used.",
            "Add the levain and mix by hand with the Rubaud method for 1-2 minutes. Rest for 5-7 minutes, then mix for another 1-2 minutes.",
            "Rest for 30 minutes, add the salt, and rest for another 30 minutes.",
            "Laminate the dough and sprinkle over the Parmesan. Transfer it to a bulking dish. Keep the dough around 74-76°F (23-25°C); the author moved it from a 72°F (22°C) room into a 74-75°F (23-24°C) proofer after lamination.",
            "Perform three coil folds: the first two 45 minutes apart, then the third after 60 minutes. Add another fold only if the dough remains slack and cannot hold its structure.",
            "Bulk-ferment for about 8 hours in total, counted from adding the levain, using the dough’s volume, strength and activity as the final cues.",
            "Shape and cold-proof for 8 hours at 38-40°F (3-4°C).",
            "Bake in a preheated cast-iron vessel for 20 minutes covered at 500°F (260°C), then about 20 minutes uncovered at 430°F (220°C). Bake longer for a darker crust; for an especially thick crust, leave the loaf in the switched-off oven or at 170°F (77°C) for 35-40 minutes.",
        ],
    },
    {
        "start": 66,
        "title": "With-a-Touch-of-Soft-Wheat Sourdough",
        "subtitle": "Soft wheat, overnight autolyse and long fermentation.",
        "source_pages": [66, 68],
        "ingredients": [
            "262.5g bread flour (12.5% protein, Bob’s Red Mill Artisan Bread Flour)",
            "87.5g soft wheat flour (Petra 1)",
            "259g water (74% hydration)",
            "70g levain",
            "7g salt",
        ],
        "steps": [
            "The night before, build a levain with 18g active starter, 126g flour and 126g water (1:7:7). Keep it at 75°F (24°C) and stir it with mini stretch-and-folds after 1-2 hours. The author used it after 12 hours.",
            "At the same time, combine the flours and water and autolyse overnight for 12 hours at 67-68°F (19-20°C).",
            "Add 70g mature levain and mix gently for 1-2 minutes, only until incorporated; the long autolyse has already developed the gluten.",
            "After 30 minutes, add the salt gently. Wait another 30 minutes, then laminate.",
            "Perform five coil folds. Space the first four by 45 minutes and the final fold by 60 minutes.",
            "Bulk-ferment for about 11.5 hours from the addition of the levain. Keep the dough at about 72°F (22°C) until lamination, then 74-75°F (23-24°C), with a target dough temperature of 74-76°F (23-25°C).",
            "Shape and cold-proof for 15 hours at 38°F (3°C).",
            "Bake in a preheated cast-iron vessel for 20 minutes covered at 500°F (260°C), then about 20 minutes uncovered at 430°F (220°C). Optionally extend the bake or dry the loaf in the switched-off oven for a darker, thicker crust.",
        ],
    },
    {
        "start": 70,
        "title": "The Egg and Cocoa, Less-Salt-More-Drama Sourdough",
        "subtitle": "Cocoa, egg and reduced salt balanced for a softer open crumb.",
        "source_pages": [70, 72],
        "ingredients": [
            "350g bread flour (12.5% protein, Bob’s Red Mill Artisan Bread Flour)",
            "15g cocoa powder",
            "258g water plus 50g from one egg (308g total; 88% hydration)",
            "70g starter",
            "5g salt (about 1.5%)",
        ],
        "steps": [
            "Mix the flour and cocoa with the water and egg, then autolyse for 1 hour 10 minutes.",
            "Add 70g mature egg-yolk-and-sugar starter. The author’s starter was 14.5 hours old and based on a 10:60:60 feed with 6g egg yolk and 9g sugar.",
            "After 30 minutes, add the salt. Wait another 30 minutes, then laminate.",
            "Perform four coil folds, spaced 45 minutes apart.",
            "Let the dough finish fermenting after the last fold. The author’s total bulk was 10 hours at 74-75°F (23-24°C), with a dough temperature of 74-76°F (23-25°C). The dough stayed at 72°F (22°C) until lamination and then moved to a 74-75°F (23-24°C) proofer.",
            "Shape and cold-proof for 12.5 hours at 38-40°F (3-4°C).",
            "Bake in a preheated cast-iron vessel for 20 minutes covered at 500°F (260°C), then about 20 minutes uncovered at 430°F (220°C). Optionally extend the bake or dry the loaf in the switched-off oven for a darker, thicker crust.",
        ],
    },
    {
        "start": 74,
        "title": "The All-White But Not Boring Sourdough",
        "subtitle": "Hard white wheat with an overnight autolyse.",
        "source_pages": [74, 76],
        "ingredients": [
            "280g bread flour (12.5% protein, Bob’s Red Mill Artisan Bread Flour)",
            "70g Palouse hard white wheat bread flour",
            "280g water (80% hydration)",
            "70g starter",
            "7g salt",
        ],
        "steps": [
            "Combine the flours and water and autolyse for 13.5 hours at 67-69°F (19-21°C), allowing the coarse flour and bran to hydrate and soften.",
            "Add a strong 14-hour starter; the author used starter that had received a sugar bath the night before. Mix gently for 1-2 minutes.",
            "After 30 minutes, add the salt and dimple it in gently for 1-2 minutes.",
            "Wait 30 minutes, then laminate. Follow with five coil folds spaced 30 minutes apart, adjusting the interval if the dough relaxes sooner or later.",
            "Bulk-ferment for about 10 hours at 72-75°F (22-24°C). The author kept the dough at 72°F (22°C) until lamination, then at 74-75°F (23-24°C), with a dough temperature of 72-76°F (22-25°C).",
            "Shape and cold-proof for 13 hours at 38-40°F (3-4°C).",
            "Bake in a preheated cast-iron vessel for 20 minutes covered at 500°F (260°C), then about 20 minutes uncovered at 430°F (220°C). Optionally extend the bake or dry the loaf in the switched-off oven for a darker, thicker crust.",
        ],
    },
    {
        "start": 78,
        "title": "The Special Blend Sourdough",
        "subtitle": "A whole-grain and durum blend designed for deep flavour and a crisp crust.",
        "source_pages": [78, 80],
        "ingredients": [
            "245g bread flour (12.5% protein, Bob’s Red Mill Artisan Bread Flour)",
            "105g Barrio Grains flour (Hayden Flour Mills)",
            "280g water (80% hydration)",
            "70g starter",
            "7g salt",
        ],
        "steps": [
            "Combine the flours and water and autolyse for 13.5 hours at 67-69°F (19-21°C).",
            "Add 70g mature starter. The author used a 14-hour egg-yolk-and-sugar starter based on a 10:60:60 feed with 6g egg yolk and 9g sugar.",
            "After 30 minutes, add the salt, incorporating both starter and salt gently.",
            "Laminate, then perform four coil folds spaced 45 minutes apart.",
            "Bulk-ferment for about 10 hours at 72-75°F (22-24°C), maintaining a dough temperature of 72-76°F (22-25°C).",
            "Shape and cold-proof immediately for 14 hours at 38-40°F (3-4°C).",
            "Bake in a preheated cast-iron vessel for 20 minutes covered at 500°F (260°C), then about 20 minutes uncovered at 430°F (220°C). Optionally extend the bake or dry the loaf in the switched-off oven for a darker, thicker crust.",
        ],
    },
    {
        "start": 82,
        "title": "The Very Special Rustic Dinner Rolls",
        "subtitle": "Low-salt soft-wheat rolls with a long, cool bulk and no shaping.",
        "source_pages": [82, 84, 85],
        "ingredients": [
            "245g bread flour (12.5% protein, Bob’s Red Mill Artisan Bread Flour)",
            "105g soft wheat flour (Molino Pasini Tipo 2)",
            "290.5g water (83% hydration)",
            "50g starter",
            "3.5g salt (1%)",
        ],
        "steps": [
            "Build a levain with 15g bathed starter, 30g flour and 30g water (1:2:2). Keep it at 81-82°F (27-28°C); the author’s levain peaked in about 6.5 hours.",
            "Combine the flours and water and autolyse for 2.5 hours.",
            "Add 50g levain. After 30 minutes, add the salt and mix for about 1 minute. The lower inoculation and salt are intended to suit the very long bulk.",
            "Laminate, then perform five coil folds. The fifth fold supplies extra structure because the dough will ferment untouched for many hours and the rolls are not shaped.",
            "Keep the dough near 72°F (22°C) until lamination. The author’s dough ran at 70-72°F (21-22°C) and bulk-fermented for 14 hours at 68-72°F (20-22°C), resting overnight at about 68°F (20°C) after the folds. A 16-hour bulk was also tested.",
            "Turn the fully fermented dough onto a well-floured counter and cut it into small square pieces without shaping.",
            "Transfer the rolls to parchment and bake two at a time in a preheated cast-iron vessel for 20 minutes covered at 500°F (260°C). Leave them in the switched-off hot oven for another 30 minutes to harden the crust.",
        ],
    },
    {
        "start": 86,
        "title": "The Chanel No. 5 of Sourdoughs",
        "subtitle": "A classic whole-wheat formula for repeated practice.",
        "source_pages": [86, 88],
        "ingredients": [
            "262.5g bread flour (12.5% protein, Bob’s Red Mill Artisan Bread Flour)",
            "87.5g whole wheat flour (Palouse hard red winter berry)",
            "290.5g water",
            "70g starter",
            "7g salt",
        ],
        "steps": [
            "Combine the flours and water and autolyse for 2 hours.",
            "Add 70g mature starter. The author used a 14.5-hour egg-yolk-and-sugar starter. Mix for 2-3 minutes to incorporate.",
            "After 30 minutes, add the salt and mix for 2-3 minutes.",
            "Laminate, then perform four coil folds spaced 45 minutes apart.",
            "Keep the dough at 72°F (22°C) until lamination, then at 74-75°F (23-24°C). Bulk-ferment for about 9 hours 15 minutes, maintaining a dough temperature of roughly 72-75°F (22-24°C).",
            "Shape and cold-proof for 12 hours at 38-40°F (3-4°C).",
            "Bake using the standard method: 20 minutes covered at 500°F (260°C), then about 20 minutes uncovered at 430°F (220°C).",
        ],
    },
    {
        "start": 90,
        "title": "50% Whole Meal Open Crumb Sourdough",
        "subtitle": "Half whole meal flour at 90% hydration.",
        "source_pages": [90, 92, 93],
        "ingredients": [
            "175g bread flour (12.5% protein, Bob’s Red Mill Artisan Bread Flour)",
            "175g whole meal flour (Petra 9)",
            "315g water (90% hydration)",
            "70g starter",
            "7g salt",
        ],
        "steps": [
            "Combine the flours and water and autolyse for 40 minutes. The author recommends a longer autolyse when possible so the coarse bran fully hydrates and softens; reserve some water for bassinage if the hydration feels difficult.",
            "Add the starter, then add the salt 30 minutes later.",
            "Laminate and perform three coil folds. This particular flour was strong enough that more folding would have made the dough too elastic.",
            "Bulk-ferment for about 9 hours at 72-75°F (22-24°C), watching the dough rather than assuming whole meal must finish earlier.",
            "Shape, place in a banneton, and leave for another 45 minutes at 75°F (24°C) to finish fermenting.",
            "Cold-proof for 14 hours at 38-40°F (3-4°C).",
            "Bake using the standard method: 20 minutes covered at 500°F (260°C), then about 20 minutes uncovered at 430°F (220°C).",
        ],
    },
    {
        "start": 94,
        "title": "The Artisan Low-Protein Sourdough",
        "subtitle": "Open crumb made with an 11.5% protein bread flour.",
        "source_pages": [94],
        "ingredients": [
            "245g bread flour (11.5% protein, Central Milling Artisan Bakers Craft)",
            "105g Type 80 flour (Central Milling)",
            "280g water (80% hydration)",
            "70g starter",
            "7g salt",
        ],
        "steps": [
            "Combine the flours and water and autolyse for 30 minutes.",
            "Add 70g mature starter. The author used a 15-hour egg-yolk-and-sugar starter.",
            "After 30 minutes, add the salt and mix by hand until incorporated.",
            "Laminate, then perform four coil folds spaced 45 minutes apart.",
            "Bulk-ferment for about 9 hours at 72-75°F (22-24°C), judging the end of bulk from the dough rather than its lower protein percentage.",
            "Shape and cold-proof for 14.5 hours at 38-40°F (3-4°C).",
            "Bake using the standard method: 20 minutes covered at 500°F (260°C), then about 20 minutes uncovered at 430°F (220°C).",
        ],
    },
]


def import_open_crumb() -> dict[str, Any]:
    pdf_path = PDF_ROOT / "secrets-of-open-crumb.pdf"
    recipes: list[dict[str, Any]] = []
    for formula in OPEN_CRUMB_FORMULAS:
        image = detect_photo_page(
            pdf_path,
            formula["start"] + 1,
            IMAGE_ROOT / "secrets-of-open-crumb" / f"{slugify(formula['title'])}.webp",
        )
        recipes.append(
            recipe_record(
                title=formula["title"],
                subtitle=formula["subtitle"],
                category="Sourdough formulas",
                source_pages=formula["source_pages"],
                ingredients=[{"heading": "Ingredients", "lines": formula["ingredients"]}],
                steps=formula["steps"],
                image=image,
            )
        )
    unique_ids(recipes)
    return {
        "id": "secrets-of-open-crumb",
        "title": "Secrets of Open Crumb",
        "author": "Adelina (Addie) Roberts · Bread Stalker",
        "description": "Nine formulas by Adelina (Addie) Roberts, known as Bread Stalker, condensed into chronological working methods with full source credit.",
        "recipeCountLabel": f"{len(recipes)} formulas",
        "categories": ["Sourdough formulas"],
        "recipes": recipes,
    }


THAILAND_CATEGORIES = [
    (28, "Pastes & Sauces"),
    (68, "Snacks & Drinks"),
    (118, "Salads"),
    (164, "Soups"),
    (204, "Curries"),
    (260, "Grilled, Boiled & Fried"),
    (322, "Stir-Fries"),
    (372, "Rice & Noodles"),
    (414, "Desserts"),
    (468, "Guest Chefs"),
]


def english_dictionary() -> set[str]:
    path = Path("/usr/share/dict/words")
    if not path.exists():
        return set()
    return {line.strip().lower() for line in path.read_text(errors="ignore").splitlines()}


ENGLISH_WORDS = english_dictionary() | {
    "aubergine",
    "aubergines",
    "chilli",
    "chillies",
    "coconut",
    "coriander",
    "curry",
    "daikon",
    "dipping",
    "fish",
    "fried",
    "ginger",
    "glutinous",
    "grilled",
    "jasmine",
    "kaffir",
    "lemongrass",
    "noodle",
    "noodles",
    "pandan",
    "paste",
    "peanut",
    "pork",
    "prawn",
    "prawns",
    "rice",
    "roll",
    "rolls",
    "roti",
    "salad",
    "sauce",
    "sausage",
    "seafood",
    "shrimp",
    "spicy",
    "steamed",
    "stir",
    "stuffed",
    "sweet",
    "thai",
    "turmeric",
}


def split_camel(value: str) -> str:
    return re.sub(r"(?<=[a-z])(?=[A-Z])", " ", value)


def english_line_score(value: str) -> float:
    tokens = re.findall(r"[A-Za-z]+", split_camel(value).lower())
    if not tokens:
        return 0
    return sum(token in ENGLISH_WORDS for token in tokens) / len(tokens)


def fuzzy_thai_meta(value: str) -> str:
    text = clean_text(value)
    normalized = re.sub(r"[^a-z]", "", text.lower())
    if "origin" in normalized or normalized.startswith(("orig", "origi")):
        return "Origin"
    if ("prep" in normalized or normalized.startswith(("ptcp", "ptep", "pcp"))) and "time" in normalized:
        return "Preparation time"
    if normalized.startswith(("cookingtime", "cooki", "cookingt")):
        return "Cooking time"
    if normalized.startswith(("serves", "serve", "seves")):
        return "Serves"
    if normalized.startswith(("makes", "make", "mue")):
        return "Makes"
    return text


def thai_title_groups(page: Any, x0: float, x1: float) -> list[tuple[float, float, str]]:
    words = [
        word
        for word in page.extract_words(extra_attrs=["size"])
        if x0 <= float(word["x0"]) < x1
        and 12.5 <= float(word["size"]) <= 15
        and float(word["top"]) < 535
        and re.search(r"[A-Za-z]", str(word["text"]))
    ]
    line_groups: list[list[dict[str, Any]]] = []
    for word in sorted(words, key=lambda item: (float(item["top"]), float(item["x0"]))):
        if not line_groups or abs(float(word["top"]) - float(line_groups[-1][0]["top"])) > 4:
            line_groups.append([word])
        else:
            line_groups[-1].append(word)
    lines = [
        (
            min(float(word["top"]) for word in group),
            max(float(word["bottom"]) for word in group),
            clean_text(" ".join(split_camel(str(word["text"])) for word in sorted(group, key=lambda item: float(item["x0"])))),
        )
        for group in line_groups
    ]
    blocks: list[list[tuple[float, float, str]]] = []
    for line in lines:
        if not blocks or line[0] - blocks[-1][-1][0] > 48:
            blocks.append([line])
        else:
            blocks[-1].append(line)
    result = []
    for block in blocks:
        english = [line for line in block if english_line_score(line[2]) >= 0.45]
        if not english:
            english = [max(block, key=lambda line: (english_line_score(line[2]), len(line[2])))]
        title = smart_title(" ".join(line[2] for line in english))
        if len(re.findall(r"[A-Za-z]", title)) < 4:
            continue
        result.append((block[0][0], block[-1][1], title))
    return result


def import_thailand() -> dict[str, Any]:
    pdf_path = PDF_ROOT / "thailand-the-cookbook.pdf"
    recipes: list[dict[str, Any]] = []
    with pdfplumber.open(pdf_path) as pdf:
        for page_number in range(28, 508):
            page = pdf.pages[page_number - 1]
            for x0, x1 in ((25, 198), (198, 385)):
                titles = thai_title_groups(page, x0, x1)
                for index, (top, bottom, title) in enumerate(titles):
                    end = titles[index + 1][0] - 8 if index + 1 < len(titles) else 555
                    lines = page_lines(page, (x0, bottom + 2, x1, end))
                    if not lines:
                        continue
                    normalized_lines = [fuzzy_thai_meta(line.text) for line in lines]
                    method_pos = next(
                        (i for i, line in enumerate(normalized_lines) if starts_method(line)),
                        len(lines),
                    )
                    meta_end = 0
                    for i, line in enumerate(normalized_lines[:method_pos]):
                        if line in {"Origin", "Preparation time", "Cooking time", "Serves", "Makes"}:
                            meta_end = i + 1
                    ingredients = normalized_lines[meta_end:method_pos]
                    raw_meta = [line.text for line in lines[:meta_end]]
                    yield_text, prep, cook = extract_meta(raw_meta)
                    steps = paragraph_groups(lines[method_pos:], gap=15)
                    # Discard obvious section ornaments or photo captions that have
                    # no ingredient/method body.
                    if len(ingredients) < 1 or not steps:
                        continue
                    recipes.append(
                        recipe_record(
                            title=title,
                            category=category_for(page_number, THAILAND_CATEGORIES),
                            source_pages=[page_number],
                            ingredients=ingredients,
                            steps=steps,
                            yield_text=yield_text,
                            prep_time=prep,
                            cook_time=cook,
                        )
                    )
    unique_ids(recipes)
    categories = [category for _, category in THAILAND_CATEGORIES]
    return {
        "id": "thailand-the-cookbook",
        "title": "Thailand: The Cookbook",
        "author": "Jean-Pierre Gabriel",
        "description": "Recipe-only transcription separated visually by column and the book's printed contents.",
        "recipeCountLabel": f"{len(recipes)} recipes",
        "categories": categories,
        "recipes": recipes,
    }


def main() -> None:
    books = [
        import_everyday_lebanese(),
        import_japan(),
        import_anatolia(),
        import_science_of_spice(),
        import_open_crumb(),
        import_thailand(),
    ]
    referenced_images = {
        ROOT / "public" / recipe["image"].lstrip("/")
        for book in books
        for recipe in book["recipes"]
        if recipe.get("image")
    }
    for image_path in IMAGE_ROOT.rglob("*.webp"):
        if image_path not in referenced_images:
            image_path.unlink()
    OUT.write_text(
        json.dumps(books, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    for book in books:
        print(f"{book['title']}: {len(book['recipes'])} recipes")
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
