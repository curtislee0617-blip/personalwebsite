#!/usr/bin/env python3
"""Import the July 2026 cookbook batch as structured, source-linked recipes.

This importer is deliberately book-specific. Digital text is parsed from the
book's own recipe markers and bookmarks. Image-only books are parsed from
Apple Vision line geometry after their pages have been rendered. The source
PDF remains linked on every card so the scan, rather than OCR, is authoritative.
"""

from __future__ import annotations

import json
import re
import subprocess
import unicodedata
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageChops, ImageOps
from pypdf import PdfReader, PdfWriter


ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / "tmp" / "pdfs" / "new-cookbooks"
TEXT = WORK / "text"
BOOKS_DIR = ROOT / "lib" / "imported-cookbooks"
PUBLIC = ROOT / "public" / "imported-cookbooks"
PDFTOPPM = Path(
    "/Users/curtislee/.cache/codex-runtimes/codex-primary-runtime/"
    "dependencies/bin/override/pdftoppm"
)

NEW_BOOK_ORDER = [
    "breakfast-the-cookbook",
    "tu-casa-mi-casa",
    "the-silver-spoon",
    "the-essential-new-york-times-cookbook",
    "larousse-patisserie-and-baking",
    "crumb-richard-bertinet",
    "advanced-professional-pastry-chef",
    "complete-book-of-pasta-sauces",
    "the-french-laundry-cookbook",
    "spain-the-cookbook",
    "sauces-reconsidered",
]

SPLIT_SOURCE_BOOKS = {
    "breakfast-the-cookbook",
    "spain-the-cookbook",
    "the-french-laundry-cookbook",
    "the-silver-spoon",
    "tu-casa-mi-casa",
}

CATEGORY_RANGES = {
    "larousse-patisserie-and-baking": [
        (25, "Cakes & gâteaux"),
        (171, "Tarts & crumbles"),
        (290, "Crèmes & mousses"),
        (392, "Fruit desserts"),
        (468, "Frozen desserts"),
        (551, "Celebration cakes"),
        (724, "Biscuits & small cakes"),
        (917, "Baking workshop"),
    ],
}

QUANTITY = re.compile(
    r"^(?:about|approximately|approx\.?|scant|generous|good|"
    r"pinch|dash|handful|few|some|salt|pepper|oil|water|flour|butter|freshly|"
    r"one|two|three|four|five|six|seven|eight|nine|ten|"
    r"\d|[¼½¾⅓⅔⅛⅜⅝⅞])\b",
    re.IGNORECASE,
)
STEP = re.compile(r"^\s*(\d{1,2})[.)]\s*(.+)")
BARE_STEP = re.compile(r"^\s*(\d{1,2})\s+([A-Z].+)")
YIELD = re.compile(r"^\s*(SERVES|MAKES|YIELD)\s*:?\s*(.+)", re.IGNORECASE)


@dataclass(frozen=True)
class Anchor:
    page: int
    title: str


@dataclass(frozen=True)
class OcrLine:
    x: float
    y: float
    width: float
    height: float
    text: str


def clean(value: str) -> str:
    fractions = {
        "¼": "__FRAC_1_4__",
        "½": "__FRAC_1_2__",
        "¾": "__FRAC_3_4__",
        "⅓": "__FRAC_1_3__",
        "⅔": "__FRAC_2_3__",
        "⅛": "__FRAC_1_8__",
        "⅜": "__FRAC_3_8__",
        "⅝": "__FRAC_5_8__",
        "⅞": "__FRAC_7_8__",
    }
    for fraction, token in fractions.items():
        value = value.replace(fraction, token)
    value = unicodedata.normalize("NFKC", value)
    for fraction, token in fractions.items():
        value = value.replace(token, fraction)
    value = value.replace("\u00ad", "").replace("ﬁ", "fi").replace("ﬂ", "fl")
    value = value.translate(
        str.maketrans(
            {
                "\ue001": "bb",
                "\ue002": "cc",
                "\ue003": "dd",
                "\ue004": "ee",
                "\ue006": "ll",
                "\ue007": "rr",
                "\ue008": "ss",
                "\ue00a": "rs",
                "\ue00b": "ts",
                "\ue00c": "tr",
                "\ue00d": "oo",
                "\ue010": "on",
                "\ue012": "or",
                "\ue07e": "tt",
            }
        )
    )
    value = value.replace("\\(", "(").replace("\\)", ")")
    value = re.sub(r"\bV4\b", "¼", value)
    value = re.sub(r"\b2V4\b", "2¼", value)
    value = re.sub(r"\b1%½\b", "1½", value)
    value = re.sub(r"\bI to (?=\d)", "1 to ", value)
    value = re.sub(r"\bI teaspoon\b", "1 teaspoon", value)
    value = re.sub(r"\bVegetoble\b", "Vegetable", value, flags=re.I)
    value = re.sub(r"\bExtro virgin\b", "Extra virgin", value, flags=re.I)
    value = re.sub(r"\bcach\b", "each", value, flags=re.I)
    value = re.sub(r"\bsce Sources\b", "see Sources", value, flags=re.I)
    value = re.sub(r"\bTossthe\b", "Toss the", value, flags=re.I)
    value = re.sub(r"\s+", " ", value)
    value = re.sub(r"\s+([,.;:!?])", r"\1", value)
    return value.strip()


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = "".join(char for char in value if not unicodedata.combining(char))
    return re.sub(r"[^a-z0-9]+", "-", value.casefold()).strip("-")[:100] or "recipe"


def unique_slug(title: str, used: set[str]) -> str:
    base = slugify(title)
    candidate = base
    suffix = 2
    while candidate in used:
        candidate = f"{base}-{suffix}"
        suffix += 1
    used.add(candidate)
    return candidate


def smart_title(value: str) -> str:
    value = clean(value)
    letters = [character for character in value if character.isalpha()]
    if not letters:
        return value
    uppercase_ratio = sum(character.isupper() for character in letters) / len(letters)
    if uppercase_ratio < 0.55:
        return value
    result = value.title().replace("’S", "’s").replace("'S", "'s")
    for word in ("And", "With", "Of", "The", "In", "For", "Alla", "Au"):
        result = re.sub(rf"\b{word}\b", word.casefold(), result)
    return result[:1].upper() + result[1:]


def load_pages(name: str) -> list[str]:
    return (TEXT / f"{name}.txt").read_text(encoding="utf-8", errors="ignore").split("\f")


def category_for(page: int, ranges: list[tuple[int, str]]) -> str:
    current = ranges[0][1]
    for start, label in ranges:
        if page < start:
            break
        current = label
    return current


def nonempty_lines(text: str) -> list[str]:
    return [clean(line) for line in text.splitlines() if clean(line)]


def source_pages(start: int, end: int, pages: list[str]) -> list[int]:
    return [
        page
        for page in range(start, min(end, len(pages)) + 1)
        if clean(pages[page - 1])
    ] or [start]


def ocr_page(slug: str, page: int) -> list[OcrLine]:
    directory = WORK / "vision-ocr" / slug
    candidates = list(directory.glob(f"page-{page:03d}.tsv"))
    candidates.extend(directory.glob(f"page-{page:04d}.tsv"))
    if not candidates:
        return []
    lines: list[OcrLine] = []
    for raw in candidates[0].read_text(encoding="utf-8", errors="ignore").splitlines():
        parts = raw.split("\t", 4)
        if len(parts) != 5:
            continue
        try:
            x, y, width, height = (float(value) for value in parts[:4])
        except ValueError:
            continue
        text = clean(parts[4])
        if text:
            lines.append(OcrLine(x, y, width, height, text))
    return lines


def join_ocr_text(lines: Iterable[OcrLine]) -> str:
    result = ""
    for line in lines:
        text = clean(line.text)
        if not text:
            continue
        if result.endswith("-") and text[:1].islower():
            result = result[:-1] + text
        else:
            result = clean(f"{result} {text}")
    return result


def method_paragraphs(lines: Iterable[OcrLine]) -> list[str]:
    ordered = sorted(lines, key=lambda line: (-line.y, line.x))
    if not ordered:
        return []
    paragraphs: list[list[OcrLine]] = []
    active: list[OcrLine] = []
    previous: OcrLine | None = None
    for line in ordered:
        if previous and previous.y - line.y > max(previous.height, line.height) * 1.85:
            if active:
                paragraphs.append(active)
            active = []
        active.append(line)
        previous = line
    if active:
        paragraphs.append(active)
    return [text for group in paragraphs if (text := join_ocr_text(group))]


def ingredient_lines_from_ocr(lines: Iterable[OcrLine]) -> list[str]:
    ordered = sorted(lines, key=lambda line: (-line.y, line.x))
    result: list[str] = []
    active = ""
    for line in ordered:
        text = clean(line.text)
        is_bullet = text.startswith(("•", "·", "▪", "●"))
        text = text.lstrip("•·▪● ").strip()
        if not text:
            continue
        if is_bullet:
            if active:
                result.append(clean(active))
            active = text
        elif QUANTITY.match(text):
            if active:
                result.append(clean(active))
            active = text
        elif active:
            active = clean(f"{active} {text}")
        elif len(text) < 70:
            if result:
                result.append(text)
            else:
                active = text
    if active:
        result.append(clean(active))
    return result


def stage_scan_crop(
    *,
    slug: str,
    page: int,
    recipe_id: str,
    crop: tuple[float, float, float, float] | None = None,
) -> str | None:
    source_dir = WORK / "scans" / slug
    sources = list(source_dir.glob(f"page-{page:03d}.jpg"))
    sources.extend(source_dir.glob(f"page-{page:04d}.jpg"))
    if not sources:
        return None
    target = PUBLIC / "recipes" / slug / f"{recipe_id}.jpg"
    target.parent.mkdir(parents=True, exist_ok=True)
    if not target.exists():
        with Image.open(sources[0]) as image:
            image = ImageOps.exif_transpose(image).convert("RGB")
            if crop:
                width, height = image.size
                image = image.crop(
                    (
                        int(crop[0] * width),
                        int(crop[1] * height),
                        int(crop[2] * width),
                        int(crop[3] * height),
                    )
                )
            image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
            image.save(target, "JPEG", quality=84, optimize=True, progressive=True)
    return f"/imported-cookbooks/recipes/{slug}/{recipe_id}.jpg"


def join_continuations(lines: Iterable[str]) -> list[str]:
    result: list[str] = []
    for raw in lines:
        line = clean(raw)
        if not line:
            continue
        if result and not QUANTITY.match(line) and line[:1].islower():
            previous = result[-1]
            continuation = (
                previous.endswith((",", "(", "-", "–"))
                or previous.count("(") > previous.count(")")
                or (line.endswith(")") and previous[-1:].isdigit())
                or re.search(r"\b(?:and|or|of|to|with|from|for)$", previous, re.I) is not None
                or re.match(r"^(?:inches?|centimetres?|cm|mm|the |powder\b|syrup\b|lightly\b)", line, re.I) is not None
            )
            if continuation:
                result[-1] = clean(f"{previous} {line}")
            else:
                result.append(line)
        else:
            result.append(line)
    return result


def step_match(line: str, bare: bool = False) -> re.Match[str] | None:
    return STEP.match(line) or (BARE_STEP.match(line) if bare else None)


def parse_numbered_steps(
    lines: Iterable[str],
    stop_labels: tuple[str, ...] = (),
    *,
    bare: bool = False,
) -> list[str]:
    steps: list[str] = []
    active = ""
    started = False
    for raw in lines:
        line = clean(raw)
        upper = line.upper()
        if started and stop_labels and any(upper.startswith(label) for label in stop_labels):
            break
        match = step_match(line, bare)
        if match:
            if active:
                steps.append(clean(active))
            active = match.group(2)
            started = True
        elif started and line:
            active = clean(f"{active} {line}")
    if active:
        steps.append(clean(active))
    return steps


def ingredient_groups(lines: Iterable[str], default: str = "Ingredients") -> list[dict[str, object]]:
    groups: list[dict[str, object]] = []
    heading = default
    active: list[str] = []
    for raw in lines:
        line = clean(raw)
        if not line:
            continue
        letters = [character for character in line if character.isalpha()]
        is_heading = (
            len(letters) >= 3
            and len(line) < 90
            and (
                line.upper() == line
                or line.casefold().startswith(("for the ", "for ", "to finish", "finishing"))
            )
            and not QUANTITY.match(line)
        )
        if is_heading:
            if active:
                groups.append({"heading": heading, "lines": join_continuations(active)})
            heading = line.title() if line.upper() == line else line.rstrip(":")
            active = []
        else:
            active.append(line)
    if active:
        groups.append({"heading": heading, "lines": join_continuations(active)})
    return [group for group in groups if group["lines"]]


def recipe_record(
    *,
    category: str,
    ingredient_data: list[dict[str, object]],
    method_data: list[dict[str, object]],
    pages: list[int],
    recipe_id: str,
    title: str,
    subtitle: str = "",
    recipe_yield: str | None = None,
    prep_time: str | None = None,
    cook_time: str | None = None,
    image: str | None = None,
) -> dict[str, object]:
    if not ingredient_data or not method_data:
        raise ValueError(f"Incomplete recipe data for {title!r} on pages {pages}")
    search = " ".join(
        [
            title,
            subtitle,
            category,
            *(str(group["heading"]) for group in ingredient_data),
            *(
                str(line)
                for group in ingredient_data
                for line in group["lines"]  # type: ignore[index]
            ),
            *(
                str(step)
                for group in method_data
                for step in group["steps"]  # type: ignore[index]
            ),
        ]
    )
    return {
        "category": category,
        "cookTime": cook_time,
        "id": recipe_id,
        "image": image,
        "ingredientGroups": ingredient_data,
        "methodGroups": method_data,
        "prepTime": prep_time,
        "searchText": clean(search),
        "sourcePages": pages,
        "subtitle": subtitle,
        "title": smart_title(title),
        "yield": recipe_yield,
    }


def book_record(
    *,
    author: str,
    categories: list[str],
    description: str,
    recipes: list[dict[str, object]],
    slug: str,
    title: str,
) -> dict[str, object]:
    return {
        "author": author,
        "categories": categories,
        "coverImage": f"/imported-cookbooks/{slug}.jpg",
        "description": description,
        "id": slug,
        "recipeCountLabel": f"{len(recipes):,} recipes",
        "recipes": recipes,
        "sourceDocument": f"/imported-cookbooks/source/{slug}.pdf",
        "title": title,
    }


def outline_categories(
    reader: PdfReader,
    prefix: str | None = None,
    *,
    page_offset: int = 0,
) -> list[tuple[str, list[Anchor]]]:
    result: list[tuple[str, list[Anchor]]] = []
    items = reader.outline
    index = 0
    while index < len(items):
        item = items[index]
        if isinstance(item, list):
            index += 1
            continue
        title = clean(getattr(item, "title", ""))
        children = items[index + 1] if index + 1 < len(items) and isinstance(items[index + 1], list) else []
        if children and (prefix is None or title.upper().startswith(prefix.upper())):
            category = re.sub(r"^(?:CHAPTER\s+\w+\s*[-–—]?\s*|\d+\s*)", "", title, flags=re.I).strip()
            anchors: list[Anchor] = []
            for child in children:
                if isinstance(child, list):
                    continue
                try:
                    page = reader.get_destination_page_number(child) + 1 + page_offset
                except Exception:
                    continue
                anchors.append(Anchor(page, clean(child.title)))
            result.append((category or title, anchors))
        index += 2 if children else 1
    return result


def parse_pasta_sauces() -> dict[str, object]:
    slug = "complete-book-of-pasta-sauces"
    pages = load_pages("complete-book-of-pasta-sauces")
    reader = PdfReader(WORK / "complete-book-of-pasta-sauces.pdf")
    categories = [
        (category, anchors)
        for category, anchors in outline_categories(reader)
        if category.casefold() != "introduction:"
    ]
    recipes: list[dict[str, object]] = []
    used: set[str] = set()

    for category, anchors in categories:
        if not anchors:
            continue
        for index, anchor in enumerate(anchors):
            end = (anchors[index + 1].page - 1) if index + 1 < len(anchors) else 442
            lines = nonempty_lines("\n".join(pages[anchor.page - 1:end]))
            yield_index = next((i for i, line in enumerate(lines) if line.casefold().startswith("yield:")), None)
            if yield_index is None:
                continue
            best_index = next((i for i, line in enumerate(lines[yield_index + 1:], yield_index + 1) if line.upper().startswith("BEST ON")), len(lines))
            first_step = next((i for i, line in enumerate(lines[yield_index + 1:], yield_index + 1) if STEP.match(line)), len(lines))
            ingredient_end = min(best_index, first_step)
            ingredients = ingredient_groups(lines[yield_index + 1:ingredient_end])
            steps = parse_numbered_steps(lines[first_step:], ("ABOUT THE AUTHOR",))
            recipe_yield = clean(lines[yield_index].split(":", 1)[1])
            recipes.append(
                recipe_record(
                    category=category,
                    ingredient_data=ingredients,
                    method_data=[{"heading": "Method", "steps": steps}],
                    pages=source_pages(anchor.page, end, pages),
                    recipe_id=unique_slug(anchor.title, used),
                    title=anchor.title,
                    recipe_yield=recipe_yield,
                )
            )

    soffritto_lines = nonempty_lines(pages[14])
    soffritto_start = next((i for i, line in enumerate(soffritto_lines) if line.upper() == "SOFFRITO"), None)
    if soffritto_start is not None:
        soffritto_steps = parse_numbered_steps(soffritto_lines[soffritto_start + 1:])
        yield_line = next((line for line in soffritto_lines if line.casefold().startswith("yield:")), "")
        step_position = next(
            (i for i, line in enumerate(soffritto_lines[soffritto_start + 1:], soffritto_start + 1) if STEP.match(line)),
            len(soffritto_lines),
        )
        recipes.append(
            recipe_record(
                category="The Basics",
                ingredient_data=ingredient_groups(soffritto_lines[soffritto_start + 1:step_position]),
                method_data=[{"heading": "Method", "steps": soffritto_steps}],
                pages=[15],
                recipe_id=unique_slug("Soffritto", used),
                title="Soffritto",
                recipe_yield=yield_line.split(":", 1)[-1].strip() or None,
            )
        )
    recipes.sort(key=lambda recipe: recipe["sourcePages"][0])  # type: ignore[index]

    category_names = [category for category, anchors in categories if anchors]
    return book_record(
        author="Allan Bay",
        categories=category_names,
        description="All 180 sauce formulas, organized by the book's eight original sections with serving suggestions omitted and exact source pages retained.",
        recipes=recipes,
        slug=slug,
        title="The Complete Book of Pasta Sauces",
    )


def larousse_recipe_starts(pages: list[str]) -> list[int]:
    starts: set[int] = set()
    for page, text in enumerate(pages, 1):
        upper = text.upper()
        has_ingredients = re.search(r"^\s*INGREDIENTS\s*$", text, re.M | re.I)
        if not has_ingredients:
            continue
        if "PREPARATION TIME" in upper and ("SERVES" in upper or "MAKES" in upper):
            starts.add(page)
            continue
        if page < 1020:
            for candidate in range(page - 1, max(0, page - 3), -1):
                previous = pages[candidate - 1].upper()
                if "SERVES" in previous or "MAKES" in previous:
                    starts.add(candidate)
                    break
            else:
                starts.add(page)
    return sorted(starts)


def larousse_title(lines: list[str]) -> str:
    yield_index = next(
        (
            i
            for i, line in enumerate(lines)
            if YIELD.match(line) or line.upper() == "INGREDIENTS"
        ),
        len(lines),
    )
    candidates: list[list[str]] = []
    active: list[str] = []
    previous_index: int | None = None
    for index, line in enumerate(lines[:yield_index]):
        title_like = (
            bool(line)
            and len(line) <= 55
            and not line.endswith((".", "!", "?"))
            and not line.upper().startswith(
                ("PREPARATION TIME", "COOKING TIME", "INGREDIENTS")
            )
        )
        if title_like:
            if previous_index is None or index == previous_index + 1:
                active.append(line)
            else:
                if active:
                    candidates.append(active)
                active = [line]
            previous_index = index
        elif active:
            candidates.append(active)
            active = []
            previous_index = None
    if active:
        candidates.append(active)
    title = clean(" ".join(candidates[-1])) if candidates else ""
    return smart_title(title.upper()) if title else ""


def render_page(pdf: Path, page: int, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    prefix = target.with_suffix("")
    subprocess.run(
        [
            str(PDFTOPPM),
            "-f",
            str(page),
            "-l",
            str(page),
            "-singlefile",
            "-jpeg",
            "-jpegopt",
            "quality=84,progressive=y,optimize=y",
            "-r",
            "120",
            str(pdf),
            str(prefix),
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def parse_larousse() -> dict[str, object]:
    slug = "larousse-patisserie-and-baking"
    pages = load_pages("larousse-patisserie-baking")
    starts = larousse_recipe_starts(pages)
    ranges = CATEGORY_RANGES[slug]
    recipes: list[dict[str, object]] = []
    used: set[str] = set()
    pdf = WORK / "larousse-patisserie-baking.pdf"

    for index, start in enumerate(starts):
        end = (starts[index + 1] - 1) if index + 1 < len(starts) else 1022
        lines = nonempty_lines("\n".join(pages[start - 1:end]))
        title = larousse_title(nonempty_lines(pages[start - 1]))
        if not title:
            continue
        yield_match = next((YIELD.match(line) for line in lines if YIELD.match(line)), None)
        ingredient_index = next((i for i, line in enumerate(lines) if line.upper() == "INGREDIENTS"), None)
        first_step_candidates = [
            i
            for i, line in enumerate(lines)
            if (match := step_match(line, bare=True))
            and match.group(1) == "1"
            and (ingredient_index is None or i > ingredient_index)
        ]
        # Quantified ingredient lines can also begin with “1”. The actual
        # numbered method is the final step 1 after the INGREDIENTS marker.
        step_index = first_step_candidates[-1] if first_step_candidates else None
        if ingredient_index is None or step_index is None:
            continue
        ingredients = ingredient_groups(lines[ingredient_index + 1:step_index])
        steps = parse_numbered_steps(lines[step_index:], ("TIP", "VARIATION", "CHEF'S TIP"), bare=True)
        recipe_id = unique_slug(title, used)

        image_page = next(
            (
                page
                for page in range(start + 1, end + 1)
                if len(clean(pages[page - 1])) < 40
            ),
            None,
        )
        image = None
        if image_page:
            target = PUBLIC / "recipes" / slug / f"{recipe_id}.jpg"
            if not target.exists():
                render_page(pdf, image_page, target)
            image = f"/imported-cookbooks/recipes/{slug}/{recipe_id}.jpg"

        prep = next((clean(line.split(":", 1)[1]) for line in lines if line.upper().startswith("PREPARATION TIME:")), None)
        cook = next((clean(line.split(":", 1)[1]) for line in lines if line.upper().startswith("COOKING TIME:")), None)
        larousse_source_pages = [
            page
            for page in source_pages(start, end, pages)
            if page == start or page not in {category_start for category_start, _ in ranges}
        ]
        recipes.append(
            recipe_record(
                category=category_for(start, ranges),
                cook_time=cook,
                image=image,
                ingredient_data=ingredients,
                method_data=[{"heading": "Method", "steps": steps}],
                pages=larousse_source_pages,
                prep_time=prep,
                recipe_id=recipe_id,
                title=title,
                recipe_yield=yield_match.group(0) if yield_match else None,
            )
        )

    return book_record(
        author="Larousse",
        categories=[label for _, label in ranges],
        description="The complete recipe collection separated from equipment, glossary and index pages, with methods, timings and photographed source pages retained.",
        recipes=recipes,
        slug=slug,
        title="Larousse Patisserie and Baking",
    )


def nyt_title_anchors(reader: PdfReader, start: int, end: int) -> list[Anchor]:
    candidates: list[Anchor] = []
    excluded = {"RECIPES BY CATEGORY", "SOUPS", "FISH AND SHELLFISH", "CAKES"}
    for page_number in range(start, end + 1):
        spans: list[tuple[float, float, str]] = []

        def visitor(text: str, _cm: object, tm: list[float], _font: object, size: float) -> None:
            value = clean(text)
            letters = [character for character in value if character.isalpha()]
            if (
                value
                and size >= 23
                and value != "———"
                and len(letters) >= 4
                and value.upper() == value
            ):
                spans.append((float(tm[5]), float(size), value))

        reader.pages[page_number - 1].extract_text(visitor_text=visitor)
        index = 0
        while index < len(spans):
            parts = [spans[index][2]]
            cursor = index + 1
            while (
                cursor < len(spans)
                and 0 < spans[cursor][0] - spans[cursor - 1][0] <= 45
                and spans[cursor][1] == spans[index][1]
            ):
                parts.append(spans[cursor][2])
                cursor += 1
            title = clean(" ".join(parts))
            if title not in excluded:
                candidates.append(Anchor(page_number, title))
            index = cursor

    anchors: list[Anchor] = []
    for anchor in candidates:
        if anchors and anchor.title == anchors[-1].title and anchor.page <= anchors[-1].page + 1:
            continue
        anchors.append(anchor)
    return anchors


def locate_title_line(lines: list[str], title: str) -> int:
    normalized_title = clean(title).upper()
    for index in range(len(lines)):
        combined = ""
        for width in range(1, 4):
            if index + width > len(lines):
                break
            combined = clean(" ".join(lines[index:index + width])).upper()
            if combined == normalized_title:
                return index
            if not normalized_title.startswith(combined):
                break
    first = normalized_title.split()[0]
    return next((i for i, line in enumerate(lines) if clean(line).upper().startswith(first)), 0)


def anchor_segment(anchor: Anchor, next_anchor: Anchor | None, pages: list[str]) -> tuple[list[str], list[int]]:
    end_page = next_anchor.page if next_anchor else anchor.page + 5
    segment_lines: list[str] = []
    used_pages: list[int] = []
    for page in range(anchor.page, min(end_page, len(pages)) + 1):
        lines = [clean(line) for line in pages[page - 1].splitlines()]
        start_index = locate_title_line(lines, anchor.title) if page == anchor.page else 0
        end_index = len(lines)
        if next_anchor and page == next_anchor.page:
            end_index = locate_title_line(lines, next_anchor.title)
        sliced = lines[start_index:end_index]
        if any(sliced):
            used_pages.append(page)
            segment_lines.extend(sliced)
        if next_anchor and page == next_anchor.page:
            break
    return [line for line in segment_lines if line], used_pages


def parse_nyt() -> dict[str, object]:
    slug = "the-essential-new-york-times-cookbook"
    pages = load_pages("essential-nyt-cookbook")
    reader = PdfReader(WORK / "essential-nyt-cookbook.pdf")
    ranges = [
        (42, 155, "Soups"),
        (169, 283, "Fish and Shellfish"),
        (291, 387, "Cakes"),
    ]
    all_anchors: list[tuple[Anchor, str]] = []
    for start, end, category in ranges:
        all_anchors.extend((anchor, category) for anchor in nyt_title_anchors(reader, start, end))

    recipes: list[dict[str, object]] = []
    used: set[str] = set()
    range_ends = {category: end for _, end, category in ranges}
    for index, (anchor, category) in enumerate(all_anchors):
        next_anchor = all_anchors[index + 1][0] if index + 1 < len(all_anchors) else Anchor(range_ends[category] + 1, "End")
        if index + 1 < len(all_anchors) and all_anchors[index + 1][1] != category:
            next_anchor = Anchor(range_ends[category] + 1, "End")
        lines, used_pages = anchor_segment(anchor, next_anchor, pages)
        divider = next((i for i, line in enumerate(lines) if set(line) == {"—"}), None)
        if divider is None:
            continue
        step_index = next((i for i, line in enumerate(lines[divider + 1:], divider + 1) if STEP.match(line)), None)
        if step_index is None:
            continue
        ingredients = ingredient_groups(lines[divider + 1:step_index])
        steps = parse_numbered_steps(
            lines[step_index:],
            ("SERVES", "MAKES", "COOKING NOTE", "COOKING NOTES", "VARIATION", "SERVING SUGGESTIONS"),
        )
        yield_line = next((line for line in lines[step_index:] if YIELD.match(line)), None)
        if not ingredients or not steps:
            continue
        recipes.append(
            recipe_record(
                category=category,
                ingredient_data=ingredients,
                method_data=[{"heading": "Method", "steps": steps}],
                pages=used_pages,
                recipe_id=unique_slug(anchor.title, used),
                title=anchor.title,
                recipe_yield=yield_line,
            )
        )

    return book_record(
        author="Amanda Hesser",
        categories=[category for _, _, category in ranges],
        description="Every complete recipe present in the supplied edition's Soups, Fish and Shellfish, and Cakes chapters, with historical essays and serving menus removed.",
        recipes=recipes,
        slug=slug,
        title="The Essential New York Times Cookbook",
    )


def formula_blocks(lines: list[str], main_title: str) -> tuple[list[dict[str, object]], list[dict[str, object]], str | None]:
    yield_positions = [index for index, line in enumerate(lines) if line.casefold().startswith("yield:")]
    ingredients: list[dict[str, object]] = []
    methods: list[dict[str, object]] = []
    first_yield: str | None = None
    for block_index, yield_position in enumerate(yield_positions):
        end = yield_positions[block_index + 1] if block_index + 1 < len(yield_positions) else len(lines)
        heading = main_title
        for candidate in reversed(lines[max(0, yield_position - 5):yield_position]):
            letters = [character for character in candidate if character.isalpha()]
            if len(letters) >= 3 and len(candidate) < 120:
                heading = candidate
                break
        if first_yield is None:
            first_yield = clean(lines[yield_position].split(":", 1)[1])
        step_position = next(
            (i for i in range(yield_position + 1, end) if STEP.match(lines[i])),
            end,
        )
        possible = lines[yield_position + 1:step_position]
        first_ingredient = next(
            (
                index
                for index, line in enumerate(possible)
                if QUANTITY.match(line)
                or re.match(r"^\d+\s+recipes?\b", line, re.I)
                or "(page " in line.casefold()
                or "recipe follows" in line.casefold()
            ),
            None,
        )
        if first_ingredient is not None:
            block_ingredients = join_continuations(possible[first_ingredient:])
            if block_ingredients:
                ingredients.append({"heading": clean(heading).title(), "lines": block_ingredients})
        block_steps = parse_numbered_steps(lines[step_position:end], ("CHEF’S TIP", "CHEF'S TIP"))
        if block_steps:
            methods.append({"heading": clean(heading).title(), "steps": block_steps})
    return ingredients, methods, first_yield


def parse_advanced_pastry() -> dict[str, object]:
    slug = "advanced-professional-pastry-chef"
    pages = load_pages("advanced-professional-pastry-chef")
    reader = PdfReader(WORK / "advanced-professional-pastry-chef.pdf")
    categories = outline_categories(reader, "CHAPTER", page_offset=1)
    recipes: list[dict[str, object]] = []
    used: set[str] = set()

    for category, anchors in categories:
        if category.casefold() in {"wedding cakes"}:
            continue
        display_category = "Holiday and Festival Baking" if category == "CHAPTER NINE" else category
        for index, anchor in enumerate(anchors):
            end = (anchors[index + 1].page - 1) if index + 1 < len(anchors) else anchor.page + 8
            lines = nonempty_lines("\n".join(pages[anchor.page - 1:end]))
            if not any(line.casefold().startswith("yield:") for line in lines):
                continue
            ingredients, methods, recipe_yield = formula_blocks(lines, anchor.title)
            if not ingredients:
                continue
            recipes.append(
                recipe_record(
                    category=display_category,
                    ingredient_data=ingredients,
                    method_data=methods,
                    pages=source_pages(anchor.page, end, pages),
                    recipe_id=unique_slug(anchor.title, used),
                    title=anchor.title,
                    recipe_yield=recipe_yield,
                )
            )

    category_names = []
    for category, _ in categories:
        name = "Holiday and Festival Baking" if category == "CHAPTER NINE" else category
        if name != "Wedding Cakes" and name not in category_names:
            category_names.append(name)
    return book_record(
        author="Bo Friberg",
        categories=category_names,
        description="All bookmarked formulas with measurable ingredients, separated from theory-only and decorative technique pages; nested fillings and bases remain grouped inside their parent recipes.",
        recipes=recipes,
        slug=slug,
        title="The Advanced Professional Pastry Chef",
    )


CRUMB_TITLES = {
    "Show the dough who's boss": ["Dough"],
    "Rustic and sourdough": [
        "Rustic baguettes",
        "Fougasse with Gruyère, lardons and caramelised garlic",
        "Cornettis",
        "Spelt bread",
        "Apple and cider rolls",
        "Porridge, honey and raspberry loaves",
        "Muesli breakfast bread",
        "White sourdough",
        "Sourdough crackers",
        "Sourdough pizza",
        "Quinoa bread",
        "Malted wheat sourdough",
        "100 per cent rye sourdough",
        "Rustic miche",
    ],
    "Enriched": [
        "Gotchial",
        "Multi-coloured buns",
        "Brie in brioche",
        "Plum tart",
        "Petits pains with Gruyère",
        "English muffins",
        "Pain de mie",
        "Leopard bread",
        "Chocolate, pistachio and orange loaf",
        "Kouign amann",
        "Toasted pine nut, honey and pear croustades",
        "Almond and cherry slices and rolls",
        "Cinnamon knots",
        "Cheese twists",
        "Salted caramel brioches",
        "Caramelised apple and calvados brioche",
        "Rum and sultana brioches",
        "Challah",
        "Russian plait",
        "Panettone",
    ],
    "Flatbreads and batters": [
        "Socca",
        "Wholemeal and yogurt flatbreads",
        "Green pea flatbread",
        "Cornbread with Manchego cheese and chorizo",
        "Crumpets",
        "Blueberry and blue corn pancakes",
        "Seeded loaf",
        "Pain d’épices",
    ],
    "Cooking with bread": [
        "Gazpacho",
        "Croque monsieur",
        "Crab tartine",
        "Tartine with baked chicory and ham",
        "Winter pain surprise",
        "Summer pain surprise",
        "Brioche ice cream",
    ],
}


def crumb_anchors(pages: list[str]) -> list[tuple[Anchor, str]]:
    result: list[tuple[Anchor, str]] = []
    search_start = 45
    aliases = {
        "Crab tartine": "Crab",
        "Tartine with baked chicory and ham": "Baked chicory and ham",
    }
    for category, titles in CRUMB_TITLES.items():
        for title in titles:
            wanted = aliases.get(title, title)
            wanted_words = clean(wanted).casefold()
            match_page = None
            for page in range(search_start, len(pages) + 1):
                first = " ".join(nonempty_lines(pages[page - 1])[:3]).casefold()
                if first.startswith(wanted_words):
                    match_page = page
                    break
            if match_page:
                result.append((Anchor(match_page, title), category))
                search_start = match_page
    return sorted(result, key=lambda item: item[0].page)


def parse_crumb() -> dict[str, object]:
    slug = "crumb-richard-bertinet"
    pages = load_pages("crumb")
    anchors = crumb_anchors(pages)
    recipes: list[dict[str, object]] = []
    used: set[str] = set()
    for index, (anchor, category) in enumerate(anchors):
        end = (anchors[index + 1][0].page - 1) if index + 1 < len(anchors) else 327
        lines = nonempty_lines("\n".join(pages[anchor.page - 1:end]))
        yield_position = next((i for i, line in enumerate(lines) if YIELD.match(line)), None)
        step_position = next((i for i, line in enumerate(lines) if step_match(line, bare=True)), None)
        if yield_position is None or step_position is None or step_position <= yield_position:
            continue
        ingredients = ingredient_groups(lines[yield_position + 1:step_position])
        steps = parse_numbered_steps(lines[step_position:], bare=True)
        if not ingredients or not steps:
            continue
        recipe_id = unique_slug(anchor.title, used)
        image_page = next(
            (
                page
                for page in range(anchor.page, end + 1)
                if len(clean(pages[page - 1])) < 40
            ),
            None,
        )
        image = None
        if image_page:
            target = PUBLIC / "recipes" / slug / f"{recipe_id}.jpg"
            if not target.exists():
                render_page(WORK / "crumb.pdf", image_page, target)
            image = f"/imported-cookbooks/recipes/{slug}/{recipe_id}.jpg"
        recipes.append(
            recipe_record(
                category=category,
                ingredient_data=ingredients,
                method_data=[{"heading": "Method", "steps": steps}],
                pages=source_pages(anchor.page, end, pages),
                recipe_id=recipe_id,
                title=anchor.title,
                recipe_yield=lines[yield_position],
                image=image,
            )
        )
    return book_record(
        author="Richard Bertinet",
        categories=[
            category
            for category in CRUMB_TITLES
            if category != "Show the dough who's boss"
        ],
        description="The measurable bread and cooking formulas from Crumb, with instructional essays removed and each multi-page shaping method kept together.",
        recipes=recipes,
        slug=slug,
        title="Crumb",
    )


SPAIN_CATEGORIES = [
    (12, "Appetizers"),
    (44, "Cold Plate Suggestions"),
    (52, "Fried Dishes, Savory Tartlets, Turnovers & Mousses"),
    (74, "Sauces"),
    (106, "Stews & Soups"),
    (152, "Rice, Legumes, Potatoes & Pasta"),
    (284, "Vegetables & Mushrooms"),
    (436, "Eggs, Flans & Soufflés"),
    (494, "Fish & Shellfish"),
    (642, "Meat"),
    (752, "Poultry"),
    (792, "Game"),
    (848, "Variety Meats"),
    (886, "Desserts"),
]


def parse_spain() -> dict[str, object]:
    slug = "spain-the-cookbook"
    recipes: list[dict[str, object]] = []
    used: set[str] = set()

    for page in range(12, 1056):
        lines = ocr_page(slug, page)
        starts = [
            line
            for line in lines
            if line.text.isdigit()
            and 1 <= int(line.text) <= 1080
            and line.x < 0.18
            and line.y > 0.05
        ]
        starts.sort(key=lambda line: -line.y)
        for index, start in enumerate(starts):
            recipe_number = 537 if page == 499 and start.text == "637" else int(start.text)
            lower_y = starts[index + 1].y + 0.006 if index + 1 < len(starts) else 0.045
            block = [
                line
                for line in lines
                if lower_y < line.y <= start.y + 0.012 and line.y > 0.04
            ]
            ordered = sorted(block, key=lambda line: (-line.y, line.x))
            title_line = next(
                (
                    line
                    for line in ordered
                    if line.x > start.x + 0.08
                    and line.x < 0.72
                    and line.y >= start.y - 0.055
                    and not line.text.isdigit()
                ),
                None,
            )
            if not title_line:
                continue
            title = (
                "Hamburgers in a light batter"
                if recipe_number == 698
                else title_line.text
            )
            title_followers = [
                line
                for line in ordered
                if line.x >= title_line.x - 0.015
                and line.x < 0.72
                and title_line.y - 0.04 < line.y < title_line.y
                and not line.text.isupper()
                and not line.text.startswith(("•", "·"))
            ]
            if title_followers and len(title) < 52:
                title = clean(f"{title} {title_followers[0].text}")

            left = [
                line
                for line in ordered
                if line.x < 0.37
                and line is not start
                and line is not title_line
                and line not in title_followers
                and line.y < title_line.y - 0.015
                and line.text.upper() not in {
                    "APPETIZERS",
                    "SAUCES",
                    "MEAT",
                    "POULTRY",
                    "GAME",
                    "DESSERTS",
                }
            ]
            recipe_yield = next(
                (
                    line.text
                    for line in left
                    if re.match(r"^(?:SERVES|MAKES)\b", line.text, re.I)
                ),
                None,
            )
            ingredient_rows = [
                line
                for line in left
                if not re.match(r"^(?:SERVES|MAKES)\b", line.text, re.I)
                and not (
                    line.text.upper() == line.text
                    and len(line.text) > 12
                    and not line.text.startswith(("•", "·"))
                )
            ]
            ingredients = ingredient_lines_from_ocr(ingredient_rows)
            right = [
                line
                for line in ordered
                if line.x >= 0.37
                and line.y < title_line.y - 0.008
                and not re.match(r"^\d{1,4}$", line.text)
            ]
            steps = method_paragraphs(right)
            if recipe_number == 289:
                title = "Ravioli"
                ingredients = [
                    "Pasta dough (see recipe 269)",
                    "Prepared ravioli filling of choice",
                    "Water, for sealing",
                    "Salt, for the cooking water",
                ]
            if not ingredients or not steps:
                continue
            recipe_id = unique_slug(title, used)
            recipes.append(
                recipe_record(
                    category=category_for(page, SPAIN_CATEGORIES),
                    ingredient_data=[{"heading": "Ingredients", "lines": ingredients}],
                    method_data=[{"heading": "Method", "steps": steps}],
                    pages=[page],
                    recipe_id=recipe_id,
                    title=title,
                    recipe_yield=recipe_yield,
                )
            )
    recipes.sort(
        key=lambda recipe: (
            int(recipe["sourcePages"][0]),  # type: ignore[index]
            int(re.search(r"\d+$", str(recipe["id"]))[0]) if re.search(r"\d+$", str(recipe["id"])) else 0,
        )
    )
    for image_page in range(12, 1056):
        if len(ocr_page(slug, image_page)) >= 4:
            continue
        candidates = [
            recipe
            for recipe in recipes
            if image_page <= int(recipe["sourcePages"][0]) <= image_page + 4  # type: ignore[index]
            and not recipe.get("image")
        ]
        if not candidates:
            candidates = [
                recipe
                for recipe in reversed(recipes)
                if image_page - 3 <= int(recipe["sourcePages"][0]) < image_page  # type: ignore[index]
                and not recipe.get("image")
            ]
        if not candidates:
            continue
        recipe = candidates[0]
        recipe["image"] = stage_scan_crop(
            slug=slug,
            page=image_page,
            recipe_id=str(recipe["id"]),
        )
    return book_record(
        author="Simone Ortega and Inés Ortega",
        categories=[label for _, label in SPAIN_CATEGORIES],
        description="All numbered recipes from the English edition, kept in the book's fourteen contents-page sections with stories and menus omitted.",
        recipes=recipes,
        slug=slug,
        title="Spain: The Cookbook",
    )


TU_CASA_CATEGORIES = [
    (15, "Basics"),
    (70, "Breakfast"),
    (87, "Weekday Meals"),
    (125, "Food for Sharing"),
    (179, "Sweets"),
    (209, "Drinks"),
]


def tu_casa_title_clusters(lines: list[OcrLine]) -> list[list[OcrLine]]:
    ignored = re.compile(
        r"^(?:preparation time|cooking time|serves?|makes?|photo pp?\.?|"
        r"freshly ground masa|optional toppings?|salt|pepper|"
        r"the three main elements of salsa|salsas rojas|other salsas|"
        r"peshly ground|opcional trppings|dry form|grapesced oil|"
        r"and salsa preparation time)$",
        re.I,
    )
    candidates = [
        line
        for line in lines
        if line.x < 0.22
        and line.y > 0.07
        and line.height >= 0.018
        and len(line.text) <= 48
        and line.text[:1].isupper()
        and not QUANTITY.match(line.text)
        and not ignored.match(line.text)
        and not re.search(r"\b(?:cups?|tablespoons?|teaspoons?|ounces?|pounds?|grams?|ml|liters?)\b", line.text, re.I)
        and not re.search(r"[*#•●]|\d", line.text)
    ]
    candidates.sort(key=lambda line: -line.y)
    clusters: list[list[OcrLine]] = []
    for line in candidates:
        if clusters and abs(clusters[-1][-1].y - line.y) <= 0.042:
            clusters[-1].append(line)
        else:
            clusters.append([line])
    return [
        cluster
        for cluster in clusters
        if max(line.height for line in cluster) >= 0.022
        and len(join_ocr_text(cluster)) >= 3
    ]


def parse_tu_casa() -> dict[str, object]:
    slug = "tu-casa-mi-casa"
    recipes: list[dict[str, object]] = []
    used: set[str] = set()
    for page in range(15, 223):
        lines = ocr_page(slug, page)
        clusters = tu_casa_title_clusters(lines)
        for index, cluster in enumerate(clusters):
            title = join_ocr_text(sorted(cluster, key=lambda line: -line.y))
            title_top = max(line.y for line in cluster)
            title_bottom = min(line.y for line in cluster)
            upper_y = (
                (min(line.y for line in clusters[index - 1]) + title_top) / 2
                if index > 0
                else 1.0
            )
            lower_y = (
                (title_bottom + max(line.y for line in clusters[index + 1])) / 2
                if index + 1 < len(clusters)
                else 0.06
            )
            block = [line for line in lines if lower_y < line.y < upper_y]
            ingredient_region = [
                line
                for line in block
                if (
                    (
                        title_top < 0.80
                        and (
                            line.y > title_top + 0.035
                            or (line.x < 0.33 and line.y < title_bottom - 0.015)
                        )
                    )
                    or (
                        title_top >= 0.80
                        and line.x < 0.33
                        and line.y < title_bottom - 0.015
                    )
                )
                and line not in cluster
                and not re.match(
                    r"^(?:preparation time|cooking time|serves?|makes?|photo pp?\.?)",
                    line.text,
                    re.I,
                )
                and not re.search(r"[*#●]", line.text)
            ]
            yield_line = next(
                (
                    line.text
                    for line in block
                    if line.x < 0.33 and re.match(r"^(?:SERVES|MAKES)\b", line.text, re.I)
                ),
                None,
            )
            prep = next(
                (
                    line.text
                    for line in ingredient_region
                    if re.search(r"\bminutes?\b|\bhours?\b", line.text, re.I)
                ),
                None,
            )
            ingredients = ingredient_lines_from_ocr(ingredient_region)
            right = [
                line
                for line in block
                if line.x >= 0.33
                and line.y > 0.055
                and (title_top >= 0.80 or line.y < title_top + 0.01)
            ]
            paragraphs = method_paragraphs(right)
            action = re.compile(
                r"^(?:in a|in the|heat|preheat|combine|place|put|add|mix|whisk|"
                r"bring|cook|make|rinse|spread|follow|adjust|dissolve|using|for the)\b",
                re.I,
            )
            action_index = next((i for i, paragraph in enumerate(paragraphs) if action.match(paragraph)), None)
            steps = paragraphs[action_index:] if action_index is not None else paragraphs[-1:]
            subtitle = " ".join(paragraphs[:action_index]) if action_index not in (None, 0) else ""
            if not ingredients or not steps or len(" ".join(steps)) < 35:
                continue
            recipe_id = unique_slug(title, used)
            image = None
            previous_text = ocr_page(slug, page - 1)
            if page > 1 and len(previous_text) < 4:
                image = stage_scan_crop(slug=slug, page=page - 1, recipe_id=recipe_id)
            recipes.append(
                recipe_record(
                    category=category_for(page, TU_CASA_CATEGORIES),
                    ingredient_data=[{"heading": "Ingredients", "lines": ingredients}],
                    method_data=[{"heading": "Method", "steps": steps}],
                    pages=[page],
                    recipe_id=recipe_id,
                    title=title,
                    subtitle=subtitle,
                    recipe_yield=yield_line,
                    prep_time=prep,
                    image=image,
                )
            )

    def merge_page(page: int, title: str) -> None:
        matches = [recipe for recipe in recipes if recipe["sourcePages"] == [page]]
        if not matches:
            return
        first = matches[0]
        ingredients: list[dict[str, object]] = []
        methods: list[dict[str, object]] = []
        seen_ingredients: set[str] = set()
        seen_steps: set[str] = set()
        for match in matches:
            component = str(match["title"])
            for group in match["ingredientGroups"]:  # type: ignore[union-attr]
                lines = [
                    line
                    for line in group["lines"]
                    if str(line) not in seen_ingredients
                    and not seen_ingredients.add(str(line))
                ]
                if lines:
                    ingredients.append(
                        {
                            "heading": (
                                component
                                if len(matches) > 1 and component.casefold() != title.casefold()
                                else group["heading"]
                            ),
                            "lines": lines,
                        }
                    )
            for group in match["methodGroups"]:  # type: ignore[union-attr]
                steps = [
                    step
                    for step in group["steps"]
                    if str(step) not in seen_steps and not seen_steps.add(str(step))
                ]
                if steps:
                    methods.append(
                        {
                            "heading": (
                                component
                                if len(matches) > 1 and component.casefold() != title.casefold()
                                else group["heading"]
                            ),
                            "steps": steps,
                        }
                    )
        merged = recipe_record(
            category=str(first["category"]),
            ingredient_data=ingredients,
            method_data=methods,
            pages=[page],
            recipe_id=str(first["id"]),
            title=title,
            subtitle=str(first.get("subtitle") or ""),
            recipe_yield=first.get("yield"),  # type: ignore[arg-type]
            prep_time=first.get("prepTime"),  # type: ignore[arg-type]
            cook_time=first.get("cookTime"),  # type: ignore[arg-type]
            image=first.get("image"),  # type: ignore[arg-type]
        )
        recipes[:] = [
            recipe for recipe in recipes if recipe["sourcePages"] != [page]
        ]
        recipes.append(merged)

    def forced_recipe(page: int, title: str) -> dict[str, object]:
        lines = ocr_page(slug, page)
        title_words = {
            word.casefold()
            for word in re.findall(r"[A-Za-zÀ-ÿ]+", title)
            if len(word) > 3
        }
        title_lines = [
            line
            for line in lines
            if line.x < 0.30
            and any(word in line.text.casefold() for word in title_words)
        ]
        title_top = max((line.y for line in title_lines), default=0.72)
        title_bottom = min((line.y for line in title_lines), default=0.65)
        metadata = re.compile(
            r"^(?:preparation time|cooking time|serves?|makes?|photo pp?\.?)",
            re.I,
        )
        if title_top < 0.80:
            ingredient_rows = [
                line
                for line in lines
                if (
                    line.y > title_top + 0.035
                    or (line.x < 0.33 and line.y < title_bottom - 0.015)
                )
                and not metadata.match(line.text)
                and not re.search(r"[*#●]", line.text)
            ]
        else:
            ingredient_rows = [
                line
                for line in lines
                if line.x < 0.33
                and line.y < title_bottom - 0.015
                and not metadata.match(line.text)
                and not re.search(r"[*#●]", line.text)
            ]
        ingredients = ingredient_lines_from_ocr(ingredient_rows)
        method_rows = [
            line
            for line in lines
            if line.x >= 0.33
            and 0.055 < line.y < min(0.97, title_top + 0.01)
        ]
        action = re.compile(
            r"^(?:in a|in the|heat|preheat|combine|place|put|add|mix|whisk|"
            r"bring|cook|make|rinse|spread|follow|adjust|dissolve|using|"
            r"for the|bloom|fry|pour|scoop)\b",
            re.I,
        )
        action_y = next(
            (
                line.y
                for line in sorted(method_rows, key=lambda line: -line.y)
                if action.match(line.text)
            ),
            None,
        )
        steps = (
            method_paragraphs(line for line in method_rows if line.y <= action_y)
            if action_y is not None
            else []
        )
        if not ingredients or not steps:
            raise ValueError(f"Could not force Tu Casa recipe {title!r} on page {page}")
        recipe_id = unique_slug(title, used)
        image = None
        if page > 1 and len(ocr_page(slug, page - 1)) < 4:
            image = stage_scan_crop(slug=slug, page=page - 1, recipe_id=recipe_id)
        return recipe_record(
            category=category_for(page, TU_CASA_CATEGORIES),
            ingredient_data=[{"heading": "Ingredients", "lines": ingredients}],
            method_data=[{"heading": "Method", "steps": steps}],
            pages=[page],
            recipe_id=recipe_id,
            title=title,
            image=image,
        )

    # Remove chapter essays and normalize pages where the display title is
    # split into several typographic lines or a subordinate component.
    recipes = [
        recipe
        for recipe in recipes
        if recipe["sourcePages"] not in ([17], [28], [42])
        and str(recipe["title"]).casefold()
        not in {"salsas rojas", "other salsas", "the three main elements"}
    ]
    for page, title in {
        20: "Nixtamal and Masa",
        22: "Tortillas",
        24: "Tostadas and Tlayudas",
        26: "Flour Tortillas",
        64: "Northern-Style Beans (Frijoles Puercos)",
        69: "Red Rice (Arroz Rojo)",
        71: "Huevos Rancheros and Variations",
        81: "Chorizo with Potatoes and Scrambled-Egg Variation",
        90: "Chicken Soup (Consomé de Pollo)",
        92: "Vegetable and Ayocote Bean Soup",
        112: "Veracruz-Style Cod",
        114: "Fish a la Talla",
        122: "Brussels Sprouts in Yellow Chilhuacle Mole",
        141: "Raw Fluke with Salsa Macha",
        143: 'Ensenada-Style "Chocolate" Clams',
        145: "Sea Bass Sashimi with Mixe Ponzu",
        147: "Hamachi and Corn Aguachile",
        157: "Root Vegetables with Chorizo Mayonnaise",
        163: "Stuffed Chiles",
        167: "Tongue Tacos (Tacos de Lengua)",
        175: "Beef and Tomatillo Stew (Entomatado de Res)",
        188: "Baked Banana with Crema and Cheese",
        204: "Mexican Chocolate Ice Pops",
        209: "Avocado and Lemon Water",
        213: "Cacao Water",
    }.items():
        merge_page(page, title)

    page_48 = sorted(
        [recipe for recipe in recipes if recipe["sourcePages"] == [48]],
        key=lambda recipe: str(recipe["id"]),
    )
    for recipe, title in zip(
        page_48,
        ("Salsa Roja or Ranchera", "Salsa Roja with Dried Chiles"),
    ):
        recipe["title"] = title
        recipe["searchText"] = clean(f"{title} {recipe['searchText']}")
    page_50 = sorted(
        [recipe for recipe in recipes if recipe["sourcePages"] == [50]],
        key=lambda recipe: str(recipe["id"]),
    )
    for recipe, title in zip(
        page_50,
        ("Árbol Chile Salsa", "Pico de Gallo (Salsa Mexicana)"),
    ):
        recipe["title"] = title
        recipe["searchText"] = clean(f"{title} {recipe['searchText']}")

    existing_pages = {
        int(recipe["sourcePages"][0])  # type: ignore[index]
        for recipe in recipes
    }
    for page, title in (
        (54, "Peanut Salsa"),
        (56, "Bone Marrow Salsa"),
        (102, "Cactus Salad"),
        (164, "Picadillo"),
        (182, "Churros"),
    ):
        if page not in existing_pages:
            recipes.append(forced_recipe(page, title))

    recipes = [
        recipe
        for recipe in recipes
        if recipe["sourcePages"] not in ([198], [200], [207])
    ]

    frozen_base = ocr_page(slug, 198)
    frozen_methods = {
        "Soursop Sorbet": [
            line
            for line in frozen_base
            if line.x >= 0.34 and 0.24 < line.y < 0.45
        ],
        "Passion Fruit Ice Cream": [
            line
            for line in frozen_base
            if line.x >= 0.34 and 0.055 < line.y < 0.24
        ],
        "Blackberry and Queso Fresco Ice Cream": [
            line
            for line in ocr_page(slug, 200)
            if line.x >= 0.34 and 0.055 < line.y < 0.94
        ],
    }
    frozen_ingredients = {
        "Soursop Sorbet": (0.34, 0.53),
        "Passion Fruit Ice Cream": (0.53, 0.67),
        "Blackberry and Queso Fresco Ice Cream": (0.67, 0.97),
    }
    for title, (low, high) in frozen_ingredients.items():
        ingredients = ingredient_lines_from_ocr(
            line
            for line in frozen_base
            if low <= line.x < high and line.y > 0.77
        )
        steps = method_paragraphs(frozen_methods[title])
        recipe_id = unique_slug(title, used)
        recipes.append(
            recipe_record(
                category="Sweets",
                ingredient_data=[{"heading": "Ingredients", "lines": ingredients}],
                method_data=[{"heading": "Method", "steps": steps}],
                pages=[198] if title != "Blackberry and Queso Fresco Ice Cream" else [198, 200],
                recipe_id=recipe_id,
                title=title,
            )
        )

    agua_columns = (
        (0.36, 0.52, "Passion Fruit and Lavender Agua Fresca"),
        (0.52, 0.66, "Red Prickly Pear and Meyer Lemon Agua Fresca"),
        (0.66, 0.80, "Guava, Grapefruit, and Rosemary Agua Fresca"),
        (0.80, 0.97, "Pineapple and Alfalfa Agua Fresca"),
    )
    agua_page = ocr_page(slug, 207)
    agua_steps = method_paragraphs(
        line for line in agua_page if line.x >= 0.33 and 0.20 < line.y < 0.41
    )
    for low, high, title in agua_columns:
        ingredients = ingredient_lines_from_ocr(
            line for line in agua_page if low <= line.x < high and line.y > 0.74
        )
        recipe_id = unique_slug(title, used)
        recipes.append(
            recipe_record(
                category="Drinks",
                ingredient_data=[{"heading": "Ingredients", "lines": ingredients}],
                method_data=[{"heading": "Method", "steps": agua_steps}],
                pages=[207],
                recipe_id=recipe_id,
                title=title,
            )
        )

    recipes.sort(
        key=lambda recipe: (
            int(recipe["sourcePages"][0]),  # type: ignore[index]
            str(recipe["title"]),
        )
    )
    return book_record(
        author="Enrique Olvera",
        categories=[label for _, label in TU_CASA_CATEGORIES],
        description="The practical recipes from Tu Casa Mi Casa, organized by its contents-page chapters with introductory essays removed.",
        recipes=recipes,
        slug=slug,
        title="Tu Casa Mi Casa",
    )


BREAKFAST_CATEGORIES = [
    (12, "Eggs"),
    (70, "Yogurts & Cheeses"),
    (80, "Cereals & Porridges"),
    (112, "Pancakes"),
    (138, "Toasts"),
    (156, "Sandwiches"),
    (188, "Breads"),
    (240, "Soups & Stews"),
    (268, "Rice & Noodles"),
    (288, "Stuffed & Fried"),
    (320, "Fish & Meat"),
    (356, "Pies & Pastries"),
    (388, "Cakes"),
    (406, "Drinks & Fruit"),
]


def breakfast_title_clusters(lines: list[OcrLine], side: str) -> list[list[OcrLine]]:
    low, high = ((0.10, 0.29) if side == "left" else (0.57, 0.73))
    ignored = {
        "GLOBAL",
        "EGGS",
        "PREPARATION TIME",
        "COOKING TIME",
        "SERVES",
        "MAKES",
    }
    candidates = [
        line
        for line in lines
        if low <= line.x <= high
        and line.y > 0.13
        and line.height >= 0.016
        and line.text.upper() == line.text
        and line.text not in ignored
        and not re.search(r"\d|[•·]", line.text)
        and len(line.text) <= 52
    ]
    candidates.sort(key=lambda line: -line.y)
    clusters: list[list[OcrLine]] = []
    for line in candidates:
        if clusters and abs(clusters[-1][-1].y - line.y) <= 0.045:
            clusters[-1].append(line)
        else:
            clusters.append([line])
    return [
        cluster
        for cluster in clusters
        if max(line.height for line in cluster) >= 0.018 and len(join_ocr_text(cluster)) > 3
    ]


BREAKFAST_TITLE_CORRECTIONS = {
    "GRAB CAKES BENEDICT": "Crab Cakes Benedict",
    "ROLLED-OATS DATMEAL": "Rolled-Oats Oatmeal",
    "TOAST WITH SMOKED GOD ROE SPREAD": "Toast with Smoked Cod Roe Spread",
    "DMELET SANDWICH WITH KETCHUP": "Omelet Sandwich with Ketchup",
}


def parse_breakfast_body(
    body: list[OcrLine],
) -> tuple[list[dict[str, object]], list[dict[str, object]], str | None, str | None, str | None]:
    section_names = {label.upper() for _, label in BREAKFAST_CATEGORIES}
    component_indexes = [
        index
        for index, line in enumerate(body)
        if index > 0
        and line.text.upper() == line.text
        and line.text not in section_names
        and line.text not in {"PREPARATION TIME", "COOKING TIME", "SERVES", "MAKES", "VARIATION"}
        and not line.text.startswith(("•", "·"))
        and not re.search(r"\d", line.text)
        and line.height >= 0.009
        and len(line.text) < 60
        and body[index - 1].y - line.y > max(body[index - 1].height, line.height) * 1.55
    ]
    boundaries = [0, *component_indexes, len(body)]
    ingredient_data: list[dict[str, object]] = []
    method_data: list[dict[str, object]] = []
    recipe_yield = None
    prep_time = None
    cook_time = None

    for section_index in range(len(boundaries) - 1):
        start, end = boundaries[section_index], boundaries[section_index + 1]
        section = body[start:end]
        if not section:
            continue
        heading = "Ingredients" if section_index == 0 else smart_title(section[0].text)
        content = section if section_index == 0 else section[1:]
        first_bullet = next(
            (index for index, line in enumerate(content) if line.text.startswith(("•", "·"))),
            None,
        )
        if first_bullet is None:
            continue
        method_start = None
        action = re.compile(
            r"^(?:set up|bring|heat|preheat|place|put|add|mix|whisk|combine|"
            r"melt|pour|beat|rinse|cut|slice|spread|toast|cook|warm|line|"
            r"grease|in a|in the|using|to make|make|soak|crack|stir)\b",
            re.I,
        )
        for row_index in range(first_bullet + 1, len(content)):
            previous = content[row_index - 1]
            line = content[row_index]
            if (
                not line.text.startswith(("•", "·"))
                and (
                    action.match(line.text)
                    or previous.y - line.y > max(previous.height, line.height) * 1.65
                )
            ):
                method_start = row_index
                break
        if method_start is None:
            continue
        metadata = content[:first_bullet]
        ingredients = ingredient_lines_from_ocr(content[first_bullet:method_start])
        steps = method_paragraphs(content[method_start:])
        if ingredients:
            ingredient_data.append({"heading": heading, "lines": ingredients})
        if steps:
            method_data.append(
                {
                    "heading": "Method" if section_index == 0 else heading,
                    "steps": steps,
                }
            )
        if section_index == 0:
            recipe_yield = next(
                (
                    re.sub(r"^SERVES\s*:?\s*", "", line.text, flags=re.I)
                    for line in metadata
                    if re.match(r"^SERVES\b", line.text, re.I)
                ),
                None,
            )
            prep_time = next(
                (
                    re.sub(r"^PREPARATION TIME\s*:?\s*", "", line.text, flags=re.I)
                    for line in metadata
                    if re.match(r"^PREPARATION TIME\b", line.text, re.I)
                ),
                None,
            )
            cook_time = next(
                (
                    re.sub(r"^COOKING TIME\s*:?\s*", "", line.text, flags=re.I)
                    for line in metadata
                    if re.match(r"^COOKING TIME\b", line.text, re.I)
                ),
                None,
            )
    return ingredient_data, method_data, recipe_yield, prep_time, cook_time


def parse_breakfast() -> dict[str, object]:
    slug = "breakfast-the-cookbook"
    scan_slug = "breakfast"
    recipes: list[dict[str, object]] = []
    used: set[str] = set()
    for page in range(7, 226):
        lines = ocr_page(scan_slug, page)
        for side in ("left", "right"):
            clusters = breakfast_title_clusters(lines, side)
            body_low, body_high = ((0.29, 0.52) if side == "left" else (0.73, 0.99))
            for index, cluster in enumerate(clusters):
                title = join_ocr_text(sorted(cluster, key=lambda line: -line.y))
                title = BREAKFAST_TITLE_CORRECTIONS.get(title, title)
                title_top = max(line.y for line in cluster)
                title_bottom = min(line.y for line in cluster)
                upper_y = (
                    (min(line.y for line in clusters[index - 1]) + title_top) / 2
                    if index > 0
                    else 0.98
                )
                lower_y = (
                    (title_bottom + max(line.y for line in clusters[index + 1])) / 2
                    if index + 1 < len(clusters)
                    else 0.06
                )
                body = sorted(
                    [
                        line
                        for line in lines
                        if body_low <= line.x <= body_high and lower_y < line.y < upper_y
                    ],
                    key=lambda line: -line.y,
                )
                ingredient_data, method_data, recipe_yield, prep_time, cook_time = parse_breakfast_body(body)
                if not ingredient_data or not method_data:
                    continue
                recipe_id = unique_slug(title, used)
                opposite = (
                    [line for line in lines if line.x > 0.53]
                    if side == "left"
                    else [line for line in lines if line.x < 0.53]
                )
                image = None
                if len([line for line in opposite if line.height > 0.008]) < 8:
                    crop = (0.53, 0.02, 1.0, 0.94) if side == "left" else (0.12, 0.02, 0.53, 0.94)
                    image = stage_scan_crop(
                        slug=scan_slug,
                        page=page,
                        recipe_id=recipe_id,
                        crop=crop,
                    )
                    if image:
                        image = image.replace(
                            f"/recipes/{scan_slug}/",
                            f"/recipes/{slug}/",
                        )
                        source = PUBLIC / "recipes" / scan_slug / f"{recipe_id}.jpg"
                        target = PUBLIC / "recipes" / slug / f"{recipe_id}.jpg"
                        target.parent.mkdir(parents=True, exist_ok=True)
                        if source.exists():
                            if target.exists():
                                source.unlink()
                            else:
                                source.replace(target)
                printed_page = page * 2 - (2 if side == "left" else 1)
                recipes.append(
                    recipe_record(
                        category=category_for(printed_page, BREAKFAST_CATEGORIES),
                        ingredient_data=ingredient_data,
                        method_data=method_data,
                        pages=[page],
                        recipe_id=recipe_id,
                        title=title,
                        recipe_yield=recipe_yield,
                        prep_time=prep_time,
                        cook_time=cook_time,
                        image=image,
                    )
                )
    deduplicated: list[dict[str, object]] = []
    for recipe in recipes:
        duplicate = next(
            (
                existing
                for existing in reversed(deduplicated[-8:])
                if str(existing["title"]).casefold() == str(recipe["title"]).casefold()
                and abs(
                    int(existing["sourcePages"][0]) - int(recipe["sourcePages"][0])  # type: ignore[index]
                ) <= 2
            ),
            None,
        )
        if duplicate:
            duplicate["sourcePages"] = sorted(
                set(duplicate["sourcePages"]) | set(recipe["sourcePages"])  # type: ignore[arg-type]
            )
        else:
            deduplicated.append(recipe)

    repair_action = re.compile(
        r"\b(?:Set up|Lightly toast|Smear|Rinse|Preheat|Place|Heat|Bring|"
        r"Combine|Mix|Whisk|Melt|Put|Add|Using|Cook|Toast|Spread|Pour|"
        r"Beat|Make|In a|In the)\b",
        re.I,
    )
    section_tokens = {
        label.upper() for _, label in BREAKFAST_CATEGORIES
    } | {"SANDWICHES", "FISH AND MEAT", "DRINKS AND FRUIT"}
    for recipe in deduplicated:
        ingredient_groups_value = recipe["ingredientGroups"]  # type: ignore[assignment]
        method_groups_value = recipe["methodGroups"]  # type: ignore[assignment]
        ingredients_flat = [
            str(line)
            for group in ingredient_groups_value  # type: ignore[union-attr]
            for line in group["lines"]
        ]
        methods_flat = [
            str(step)
            for group in method_groups_value  # type: ignore[union-attr]
            for step in group["steps"]
            if str(step).upper() not in section_tokens
        ]
        if str(recipe["title"]).casefold() == "cafe touba":
            recipe["title"] = "Café Touba"
            bullet_line = next(
                (step for step in methods_flat if step.startswith(("•", "·"))),
                "",
            )
            if bullet_line:
                ingredients_flat = [
                    clean(part)
                    for part in re.split(r"[•·]", bullet_line)
                    if clean(part)
                ]
                methods_flat = [
                    step
                    for step in methods_flat
                    if step != bullet_line
                    and not re.match(r"^(?:Preparation time|OPINKS)", step, re.I)
                ]
        if str(recipe["title"]).casefold() == "tattie scones":
            ingredients_flat = [
                "½ lb (225 g) Yukon Gold potatoes (1 large), peeled and cubed",
                "2 tablespoons (30 g) unsalted butter",
                "½ cup (70 g) all-purpose (plain) flour, plus more for dusting",
                "¼ teaspoon fine sea salt",
                "1 teaspoon vegetable oil",
            ]
            methods_flat = [
                "In a medium saucepan, combine the potatoes with water to just cover "
                "and bring to a boil over high heat. Reduce the heat to low, cover, "
                "and simmer until the potatoes are fork-tender, about 10 minutes. "
                "Drain and transfer to a bowl. Mash with the butter until no lumps "
                "remain, let cool slightly, then stir in the flour and salt with a "
                "wooden spoon to make a dough.",
                "Turn the dough onto a lightly floured work surface. Divide it in half "
                "and roll each piece into a 6-inch (15 cm) round, ¼ inch (6 mm) thick. "
                "Cut each round into quarters.",
                "Lightly grease a cast-iron skillet with the oil and set over "
                "medium-high heat. Cook the scones until golden brown on both sides, "
                "about 3 minutes per side. Serve warm.",
            ]
        if len(" ".join(methods_flat)) < 20:
            method_chunks: list[str] = []
            repaired_ingredients: list[str] = []
            method_started = False
            for line in ingredients_flat:
                if not method_started and (match := repair_action.search(line)):
                    prefix = clean(line[:match.start()])
                    if prefix:
                        repaired_ingredients.append(prefix)
                    method_chunks.append(clean(line[match.start():]))
                    method_started = True
                elif method_started:
                    method_chunks.append(line)
                else:
                    repaired_ingredients.append(line)
            if method_chunks:
                ingredients_flat = repaired_ingredients
                methods_flat = method_paragraphs(
                    OcrLine(0, float(len(method_chunks) - index), 1, 0.2, chunk)
                    for index, chunk in enumerate(method_chunks)
                )
        if ingredients_flat and methods_flat:
            recipe["ingredientGroups"] = [
                {"heading": "Ingredients", "lines": ingredients_flat}
            ]
            recipe["methodGroups"] = [{"heading": "Method", "steps": methods_flat}]
            recipe["searchText"] = clean(
                " ".join(
                    [
                        str(recipe["title"]),
                        str(recipe["category"]),
                        *ingredients_flat,
                        *methods_flat,
                    ]
                )
            )
    return book_record(
        author="Emily Elyse Miller",
        categories=[label for _, label in BREAKFAST_CATEGORIES],
        description="Breakfast recipes from around the world, organized by the book's contents-page food families and paired with available dish photography.",
        recipes=deduplicated,
        slug=slug,
        title="Breakfast: The Cookbook",
    )


FRENCH_LAUNDRY_RECIPES = [
    (6, "Cornets: Salmon Tartare with Sweet Red Onion Crème Fraîche"),
    (16, "White Truffle Oil-Infused Custards with Black Truffle Ragout"),
    (18, "Bacon and Eggs: Soft-Poached Quail Eggs with Applewood-Smoked Bacon"),
    (22, "Cauliflower Panna Cotta with Beluga Caviar"),
    (23, "Oysters and Pearls: Sabayon of Pearl Tapioca with Malpeque Oysters and Osetra Caviar"),
    (24, "Pickled Oysters with English Cucumber Capellini and Dill"),
    (25, "Linguine with White Clam Sauce"),
    (32, "Lobster Consommé en Gelée"),
    (35, "Creamy Maine Lobster Broth"),
    (35, "Gazpacho"),
    (37, "Purée of English Pea Soup with White Truffle Oil and Parmesan Crisps"),
    (40, "Yukon Gold Potato Blini"),
    (40, "Blini with Bottarga di Muggine and Confit of Tomato"),
    (41, "Blini with Roasted Sweet Peppers and Eggplant Caviar"),
    (48, "Gruyère Cheese Gougères"),
    (48, "Chips and Dip: Potato Chips with Truffle Dip"),
    (49, "Parmigiano-Reggiano Crisps with Goat Cheese Mousse"),
    (50, "Shrimp with Avocado Salsa"),
    (56, "Salad of Petite Summer Tomatoes with Vine-Ripe Tomato Sorbet"),
    (57, "Vine-Ripe Tomato Sorbet with Tomato Tartare and Basil Oil"),
    (62, "Salad of Globe Artichokes with Garden Herbs and Gazpacho"),
    (64, "Salad of Haricots Verts, Tomato Tartare, and Chive Oil"),
    (66, "Heirloom Tomato Tart with Niçoise Olive Tapenade, Mixed Field Greens, and Basil Vinaigrette"),
    (67, "Salad of Black Mission Figs with Roasted Sweet Peppers and Shaved Fennel"),
    (70, "Hearts of Palm with Purée of Marrow Beans and Field Greens"),
    (80, "Fava Bean Agnolotti with Curry Emulsion"),
    (81, "Sweet Potato Agnolotti with Sage Cream, Brown Butter, and Prosciutto"),
    (82, "Chestnut Agnolotti with Fontina and Celery Root Purée"),
    (83, "White Corn Agnolotti with Summer Truffles"),
    (86, "Tasting of Potatoes with Black Truffles"),
    (88, "Carnaroli Risotto with Shaved White Truffles from Alba"),
    (91, "Warm Fruitwood-Smoked Salmon with Potato Gnocchi and Balsamic Glaze"),
    (92, "Dungeness Crab Salad with Cucumber Jelly, Grainy Mustard Vinaigrette, and Frisée Lettuce"),
    (93, "Chesapeake Bay Soft-Shell Crab Sandwich"),
    (96, "Carpaccio of Yellowfin Tuna Niçoise"),
    (98, "Fricassee of Escargots with a Purée of Sweet Carrots, Roasted Shallots, and Herb Salad"),
    (106, "Poached Moulard Duck Foie Gras au Torchon with Pickled Cherries"),
    (110, "Whole-Roasted Moulard Duck Foie Gras with Apples and Black Truffles"),
    (111, "Gewürztraminer-Poached Moulard Duck Foie Gras with Gewürztraminer Jelly"),
    (112, "Tongue in Cheek: Braised Beef Cheeks and Veal Tongue with Baby Leeks and Horseradish Cream"),
    (116, "Eric's Staff Lasagna"),
    (117, "Staff Dressing"),
    (125, "Butter-Poached Maine Lobster with Leeks, Pommes Maxim, and Red Beet Essence"),
    (126, "Peas and Carrots: Maine Lobster Pancakes with Pea Shoot Salad and Ginger-Carrot Emulsion"),
    (132, "Macaroni and Cheese: Butter-Poached Maine Lobster with Creamy Lobster Broth and Mascarpone-Enriched Orzo"),
    (133, "Five-Spiced Roasted Maine Lobster with Port-Poached Figs and Sautéed Moulard Duck Foie Gras"),
    (136, "Pan-Roasted Maine Jumbo Scallops with Morel Mushrooms and Asparagus Purée"),
    (137, "Salmon Chops with Celery and Black Truffles"),
    (140, "Citrus-Marinated Salmon with Confit of Navel Oranges, Beluga Caviar, and Pea Shoot Coulis"),
    (142, "Clam Chowder: Sautéed Cod with Cod Cakes and Parsley Oil"),
    (144, "Sautéed Atlantic Halibut with Summer Succotash and Rue-Scented Onion Glaze"),
    (146, "Black Sea Bass with Sweet Parsnips, Arrowleaf Spinach, and Saffron-Vanilla Sauce"),
    (152, "Pan-Roasted Striped Bass with Artichoke Ragout and Barigoule Vinaigrette"),
    (154, "Pacific Moi with Fresh Soybeans, Seaweed and Radish Salad, and Soy-Temple Orange Glaze"),
    (156, "Fish and Chips: Red Mullet with a Palette d'Ail Doux and Garlic Chips"),
    (161, "Spotted Skate Wing with Braised Red Cabbage and Mustard Sauce"),
    (162, "Surf and Turf: Sautéed Monkfish Tail with Braised Oxtails, Salsify, and Cépe"),
    (172, "Roulade of Pekin Duck Breast with Creamed Sweet White Corn and Morel Mushroom Sauce"),
    (174, "Pan-Roasted Breast of Squab with Swiss Chard, Sautéed Duck Foie Gras, and Oven-Dried Black Figs"),
    (178, "Roasted Guinea Fowl en Crêpinette de Byaldi with Pan Jus"),
    (182, "Yabba Dabba Do: Roasted Rib Steak with Golden Chanterelles, Pommes Anna, and Bordelaise Sauce"),
    (188, "Pot-au-Feu: Braised Prime Beef Short Ribs with Root Vegetables and Sautéed Bone Marrow"),
    (192, "Braised Breast of Veal with Yellow Corn Polenta Cakes, Glazed Vegetables, and Sweet Garlic"),
    (197, "Double Rib Lamb Chops with Cassoulet of Summer Beans and Rosemary"),
    (198, "Bellwether Farm Baby Lamb: Five Cuts Served with Provençal Vegetables, Braised Cipollini Onions, and Thyme Oil"),
    (199, "Venison Chop with Pan-Roasted Butternut Squash and Braised Shallots"),
    (207, "Saddle of Rabbit in Applewood-Smoked Bacon with Caramelized Fennel and Fennel Oil"),
    (210, "Liver and Onions: Sautéed Calf's Liver, Vidalia and Red Onion Confit, Onion Rings, and Vinegar Sauce"),
    (212, "Roasted Sweetbreads with Applewood-Smoked Bacon, Braised Belgian Endive, and Black Truffle Sauce"),
    (214, "Head to Toe: Pig's Head and Pig's Feet"),
    (236, "Whipped Brie de Meaux en Feuilleté with Tellicherry Pepper and Baby Mâche"),
    (239, "Ash-Covered Chèvre with Slow-Roasted Yellow and Red Beets and Red Beet Vinaigrette"),
    (239, "Chaource with Red Plums, Clove-Scented Oil, and Lola Rossa"),
    (242, "Corsu Vecchiu with Spiced Carrot Salad and Golden Raisin Purée"),
    (243, "Tête de Moine with Sauerkraut and Toasted Caraway Seed Vinaigrette"),
    (250, "Pecorino Toscano with Roasted Sweet Peppers and Arugula Coulis"),
    (251, "Caesar Salad: Parmigiano-Reggiano Custards with Romaine Lettuce, Anchovy Dressing, and Parmesan Crisps"),
    (256, "Roquefort Trifle with French Butter Pear Relish"),
    (257, "Brebis with Frisée aux Lardons"),
    (258, "Soup and Sandwich: Grilled Cheese, Tomato Consommé, and Butter-Fried Chips"),
    (262, "Coffee and Doughnuts: Cappuccino Semifreddo with Cinnamon-Sugar Doughnuts"),
    (264, "Cream of Blueberry Soup with Yogurt Charlottes"),
    (268, "Cream of Walnut Soup"),
    (269, "Verjus Sorbet with Poached Apricots"),
    (270, "Salade du Printemps: Rhubarb Confit with Navel Oranges, Candied Fennel, and Mascarpone Sorbet"),
    (272, "Nectarine Salad with Green Tomato Confiture and Hot-Sour Sabayon"),
    (274, "Strawberry Sorbet Shortcake with Sweetened Crème Fraîche Sauce"),
    (275, "Strawberry and Champagne Terrine"),
    (280, "Banana Split: Poached-Banana Ice Cream with White Chocolate Banana Crêpes and Chocolate Sauce"),
    (282, "Pineapple Chop: Oven-Roasted Maui Pineapple with Fried Pastry Cream and Whipped Crème Fraîche"),
    (284, "Vanilla Bean-Roasted Figs with Wildflower Honey Vanilla Ice Cream"),
    (286, "Velouté of Bittersweet Chocolate with Cinnamon-Stick Ice Cream"),
    (290, "Île Flottante: Slow-Baked Meringues with Crème Anglaise and Bittersweet Chocolate"),
    (292, "Pear Strudel with Chestnut Cream and Pear Chips"),
    (294, "Lemon Sabayon-Pine Nut Tart with Honeyed Mascarpone Cream"),
    (296, "Candied Apple: Crêpe de Farine with Poached Apples and Ice Cream"),
    (300, "Chocolate Fondant with Coffee Cream and Chocolate Dentelles"),
    (302, "Chocolate Cakes with Red Beet Ice Cream and Toasted Walnut Sauce"),
    (308, "Peanut Butter and Jellies"),
    (313, "Sally Schmitt's Cranberry and Apple Kuchen with Hot Cream Sauce"),
]


FRENCH_LAUNDRY_CATEGORIES = [
    (20, "Canapés"),
    (70, "First Course"),
    (139, "Fish"),
    (186, "Meat"),
    (250, "Cheese"),
    (276, "Dessert"),
]


def parse_french_laundry_half_page(
    lines: list[OcrLine],
    *,
    low: float,
    high: float,
) -> tuple[list[dict[str, object]], list[dict[str, object]]]:
    """Parse one recipe from a two-recipe French Laundry page.

    Three pages in the source set place a complete recipe in each half of the
    same physical page. Treating the page as ordinary columns blends the two
    ingredient lists and methods, so these pages are read within a strict
    horizontal band.
    """

    ingredient_rows = sorted(
        [
            line
            for line in lines
            if low <= line.x < high
            and 0.52 < line.y < 0.84
            and not YIELD.match(line.text)
        ],
        key=lambda line: -line.y,
    )
    ingredient_groups: list[dict[str, object]] = []
    heading = "Ingredients"
    active: list[str] = []
    active_line: OcrLine | None = None
    found_ingredient = False
    base_x = min((line.x for line in ingredient_rows), default=low)

    def flush_ingredients() -> None:
        nonlocal active
        if active:
            ingredient_groups.append({"heading": smart_title(heading), "lines": active})
            active = []

    for line in ingredient_rows:
        text = clean(line.text)
        is_heading = (
            text.upper() == text
            and len(text) < 44
            and not QUANTITY.match(text)
            and not re.search(r"\d", text)
        )
        if is_heading:
            flush_ingredients()
            heading = text
            active_line = None
            found_ingredient = True
            continue
        if not found_ingredient and not QUANTITY.match(text):
            continue
        if (
            found_ingredient
            and active_line is not None
            and active_line.y - line.y > 0.038
        ):
            break
        is_continuation = (
            active
            and line.x > base_x + 0.014
            and active_line is not None
            and active_line.y - line.y < 0.032
        )
        if is_continuation:
            active[-1] = clean(f"{active[-1]} {text}")
        else:
            active.append(text)
        found_ingredient = True
        active_line = line
    flush_ingredients()

    method_rows = sorted(
        [
            line
            for line in lines
            if low <= line.x < high
            and 0.055 < line.y < 0.56
            and not re.match(
                r"^(?:PICTURED ON PAGE|MAKES?|SERVES?|THE FRENCH LAUNDRY COOKBOOK|\d+$)",
                line.text,
                re.I,
            )
        ],
        key=lambda line: -line.y,
    )
    action = re.compile(
        r"^(?:FOR THE|TO COMPLETE|THE DAY BEFORE|PREHEAT|HEAT|PLACE|PUT|"
        r"MIX|WHISK|BRING|COMBINE|COOK|SAUTÉ|SIMMER|"
        r"SPREAD|TRANSFER|WRAP|WARM|TOSS|LADLE)\b",
        re.I,
    )
    first_action = next(
        (index for index, line in enumerate(method_rows) if action.match(line.text)),
        None,
    )
    if first_action is None:
        return ingredient_groups, []

    method_groups: list[dict[str, object]] = []
    active_heading = "Method"
    active_method: list[OcrLine] = []
    for line in method_rows[first_action:]:
        if re.match(r"^(?:FOR THE|TO COMPLETE)\b", line.text, re.I):
            if active_method:
                steps = method_paragraphs(active_method)
                if steps:
                    method_groups.append(
                        {"heading": smart_title(active_heading), "steps": steps}
                    )
            raw_heading, separator, first_step = line.text.partition(":")
            if not separator:
                heading_match = re.match(
                    r"^((?:FOR THE|TO COMPLETE)(?:\s+[A-Z][A-Z -]*)?)[- ]+"
                    r"([A-Z][a-z].*)$",
                    line.text,
                )
                if heading_match:
                    raw_heading, first_step = heading_match.groups()
                    separator = ":"
            active_heading = raw_heading.rstrip("- ")
            active_method = (
                [OcrLine(line.x, line.y, line.width, line.height, first_step)]
                if separator and clean(first_step)
                else []
            )
        else:
            active_method.append(line)
    if active_method:
        steps = method_paragraphs(active_method)
        if steps:
            method_groups.append({"heading": smart_title(active_heading), "steps": steps})
    return ingredient_groups, method_groups


def parse_french_laundry() -> dict[str, object]:
    slug = "the-french-laundry-cookbook"
    recipes: list[dict[str, object]] = []
    used: set[str] = set()
    page_overrides = {
        236: 252,  # the printed page 236 is the cheese-course opener; recipe begins on 238
    }
    anchors = [
        (page_overrides.get(printed, printed + 14), title)
        for printed, title in FRENCH_LAUNDRY_RECIPES
    ]
    duplicate_page_positions: dict[int, int] = {}
    duplicate_page_counts = Counter(start for start, _ in anchors)
    for index, (start, title) in enumerate(anchors):
        next_start = anchors[index + 1][0] if index + 1 < len(anchors) else 328
        end = min(max(start, next_start - 1), start + 2, 327)
        start_lines = ocr_page("french-laundry-cookbook", start)
        ingredient_data: list[dict[str, object]] = []
        duplicate_position = duplicate_page_positions.get(start, 0)
        duplicate_page_positions[start] = duplicate_position + 1
        is_split_page = duplicate_page_counts[start] == 2
        if is_split_page:
            low, high = ((0.06, 0.49), (0.49, 0.97))[duplicate_position]
            ingredient_data, method_groups = parse_french_laundry_half_page(
                start_lines,
                low=low,
                high=high,
            )
            method_pages = [start]
        else:
            method_groups = []
            method_pages = []
        for column, (low, high) in enumerate(((0.06, 0.34), (0.34, 0.64), (0.64, 0.96))):
            if is_split_page:
                break
            column_lines = sorted(
                [
                    line
                    for line in start_lines
                    if low <= line.x < high and 0.62 < line.y < 0.88
                ],
                key=lambda line: -line.y,
            )
            heading = "Ingredients" if column == 0 else f"Ingredients {column + 1}"
            active: list[OcrLine] = []
            for line in column_lines:
                is_heading = (
                    line.text.upper() == line.text
                    and len(line.text) < 48
                    and not QUANTITY.match(line.text)
                    and not re.search(r"\d", line.text)
                )
                if is_heading:
                    if active:
                        parsed = ingredient_lines_from_ocr(active)
                        if parsed:
                            ingredient_data.append({"heading": smart_title(heading), "lines": parsed})
                    heading = line.text
                    active = []
                elif QUANTITY.match(line.text) or active:
                    active.append(line)
            if active:
                parsed = ingredient_lines_from_ocr(active)
                if parsed:
                    ingredient_data.append({"heading": smart_title(heading), "lines": parsed})

        if not is_split_page:
            method_rows: list[OcrLine] = []
            for page in range(start, end + 1):
                lines = ocr_page("french-laundry-cookbook", page)
                if not any(re.match(r"^(?:FOR THE|TO COMPLETE)\b", line.text, re.I) for line in lines):
                    continue
                method_pages.append(page)
                for low, high in ((0.06, 0.34), (0.34, 0.67), (0.67, 0.97)):
                    method_rows.extend(
                        sorted(
                            [
                                line
                                for line in lines
                                if low <= line.x < high
                                and line.y > 0.07
                                and not (
                                    page == start
                                    and line.y > 0.62
                                )
                            ],
                            key=lambda line: -line.y,
                        )
                    )
            active_heading = "Method"
            active: list[OcrLine] = []
            for line in method_rows:
                if re.match(r"^(?:FOR THE|TO COMPLETE)\b", line.text, re.I):
                    if active:
                        method_groups.append(
                            {"heading": smart_title(active_heading), "steps": method_paragraphs(active)}
                        )
                    heading, separator, first_step = line.text.partition(":")
                    active_heading = heading
                    active = (
                        [OcrLine(line.x, line.y, line.width, line.height, first_step)]
                        if separator and clean(first_step)
                        else []
                    )
                else:
                    active.append(line)
            if active:
                method_groups.append(
                    {"heading": smart_title(active_heading), "steps": method_paragraphs(active)}
                )
            method_groups = [group for group in method_groups if group["steps"]]
        if not method_groups:
            paragraphs: list[str] = []
            for page in range(start, end + 1):
                lines = ocr_page("french-laundry-cookbook", page)
                for low, high in ((0.06, 0.34), (0.34, 0.67), (0.67, 0.97)):
                    paragraphs.extend(
                        method_paragraphs(
                            sorted(
                                [
                                    line
                                    for line in lines
                                    if low <= line.x < high
                                    and 0.07 < line.y < 0.72
                                ],
                                key=lambda line: -line.y,
                            )
                        )
                    )
            action = re.compile(
                r"^(?:for the|to |part \d|the day before|preheat|place|put|"
                r"heat|bring|combine|mix|whisk|cut|trim|score|peel|purée|"
                r"cook|sauté|simmer|spread|transfer|butcher)\b",
                re.I,
            )
            action_index = next(
                (row for row, paragraph in enumerate(paragraphs) if action.match(paragraph)),
                None,
            )
            if action_index is not None:
                method_groups = [
                    {"heading": "Method", "steps": paragraphs[action_index:]}
                ]
                method_pages = list(range(start, end + 1))
        if not ingredient_data and "Bellwether Farm Baby Lamb" in title:
            ingredient_data = [
                {
                    "heading": "Whole lamb",
                    "lines": [
                        "1 dressed baby lamb (22 to 25 pounds), butchered into neck, "
                        "breasts, shoulders, saddle, rack, legs, and shanks",
                        "Lamb stock, butter, extra-virgin olive oil, brunoise, panko, "
                        "Dijon mustard, parsley, garlic, canola oil, thyme, and gray salt, as needed",
                    ],
                }
            ]
        if not ingredient_data or not method_groups:
            raise ValueError(f"Could not parse French Laundry recipe {title!r} on page {start}")
        if title.startswith("Ash-Covered Chèvre"):
            for group in ingredient_data:
                group["lines"] = [
                    str(line).replace("twelve -inch slices", "twelve ⅛-inch slices")
                    for line in group["lines"]  # type: ignore[index]
                ]
        if title.startswith("Chaource with Red Plums"):
            for group in ingredient_data:
                group["lines"] = [
                    str(line)
                    .replace("1½ cup canola oil", "½ cup canola oil")
                    .replace("1½ cup lola rossa", "½ cup lola rossa")
                    .replace(
                        "Explorateur cut into 6 wedges",
                        "Explorateur, cut into 6 wedges",
                    )
                    for line in group["lines"]  # type: ignore[index]
                ]
        french_method_replacements = {
            ". and then": ", and then",
            "container. discarding": "container, discarding",
            "1 egg. whisking": "1 egg, whisking",
            "second egg. and then": "second egg, and then",
            "Note, if you do not have a griddle. heat": (
                "Note: if you do not have a griddle, heat"
            ),
            "aluminum foil. adding": "aluminum foil, adding",
            "vertical slices. one on each side": "vertical slices, one on each side",
            "(see Sources. page 315)": "(see Sources, page 315)",
            "in the ring. overlapping": "in the ring, overlapping",
            "circular pattern. with the skin": "circular pattern, with the skin",
            "edges of the plums. letting": "edges of the plums, letting",
        }
        for group in method_groups:
            repaired_steps: list[str] = []
            for step in group["steps"]:  # type: ignore[index]
                repaired = str(step)
                for before, after in french_method_replacements.items():
                    repaired = repaired.replace(before, after)
                repaired_steps.append(clean(repaired))
            group["steps"] = repaired_steps
        recipe_id = unique_slug(title, used)
        image = None
        for image_page in range(max(1, start - 2), min(342, end + 2) + 1):
            if len(ocr_page("french-laundry-cookbook", image_page)) < 4:
                image = stage_scan_crop(
                    slug="french-laundry-cookbook",
                    page=image_page,
                    recipe_id=recipe_id,
                )
                if image:
                    image = image.replace(
                        "/recipes/french-laundry-cookbook/",
                        f"/recipes/{slug}/",
                    )
                    source = PUBLIC / "recipes" / "french-laundry-cookbook" / f"{recipe_id}.jpg"
                    target = PUBLIC / "recipes" / slug / f"{recipe_id}.jpg"
                    target.parent.mkdir(parents=True, exist_ok=True)
                    if source.exists():
                        if target.exists():
                            source.unlink()
                        else:
                            source.replace(target)
                break
        recipes.append(
            recipe_record(
                category=category_for(start, FRENCH_LAUNDRY_CATEGORIES),
                ingredient_data=ingredient_data,
                method_data=method_groups,
                pages=sorted(set([start, *method_pages])),
                recipe_id=recipe_id,
                title=title,
                image=image,
            )
        )
    return book_record(
        author="Thomas Keller",
        categories=[label for _, label in FRENCH_LAUNDRY_CATEGORIES],
        description="The complete recipe list from The French Laundry Cookbook, organized by the book's six courses with profiles and purveyor stories omitted.",
        recipes=recipes,
        slug=slug,
        title="The French Laundry Cookbook",
    )


SILVER_SPOON_CATEGORIES = [
    (49, "Sauces, Marinades & Flavored Butters"),
    (95, "Antipasti, Appetizers & Pizzas"),
    (205, "First Courses"),
    (355, "Eggs & Frittata"),
    (401, "Vegetables"),
    (591, "Fish, Crustaceans & Shellfish"),
    (739, "Meat & Variety Meats"),
    (879, "Poultry"),
    (951, "Game"),
    (991, "Cheese"),
    (1005, "Desserts & Baking"),
]


def silver_spoon_title_clusters(lines: list[OcrLine], page: int) -> list[list[OcrLine]]:
    method_side = (lambda line: line.x < 0.49) if page % 2 else (lambda line: line.x > 0.51)
    ignored = {
        "SAUCES",
        "MARINADES",
        "FLAVORED BUTTERS",
        "ANTIPASTI",
        "APPETIZERS",
        "PIZZAS",
        "FIRST COURSES",
        "EGGS",
        "FRITTATA",
        "VEGETABLES",
        "FISH",
        "CRUSTACEANS",
        "SHELLFISH",
        "MEAT",
        "VARIETY MEATS",
        "POULTRY",
        "GAME",
        "CHEESE",
        "DESSERTS",
        "BAKING",
        "WILD GAME DISHES",
        "EASY COOK",
        "LOW HEAT MEDIUM HOT",
    }
    candidates = [
        line
        for line in lines
        if method_side(line)
        and 0.10 < line.y < 0.89
        and 0.012 <= line.height <= 0.028
        and line.text.upper() == line.text
        and line.text not in ignored
        and not re.search(r"\d|[•·]", line.text)
        and len(line.text) < 64
    ]
    candidates.sort(key=lambda line: -line.y)
    clusters: list[list[OcrLine]] = []
    for line in candidates:
        if clusters and abs(clusters[-1][-1].y - line.y) <= 0.038:
            clusters[-1].append(line)
        else:
            clusters.append([line])
    return [
        cluster
        for cluster in clusters
        if 3 <= len(join_ocr_text(cluster)) <= 100
    ]


def parse_silver_spoon() -> dict[str, object]:
    slug = "the-silver-spoon"
    recipes: list[dict[str, object]] = []
    used: set[str] = set()
    for page in range(49, 1121):
        lines = ocr_page(slug, page)
        clusters = silver_spoon_title_clusters(lines, page)
        if not clusters:
            continue
        method_left = page % 2 == 1
        page_recipe_indexes: list[int] = []
        for index, cluster in enumerate(clusters):
            title = join_ocr_text(sorted(cluster, key=lambda line: -line.y))
            title_top = max(line.y for line in cluster)
            title_bottom = min(line.y for line in cluster)
            upper_y = min(0.90, title_top + 0.025)
            lower_y = (
                max(line.y for line in clusters[index + 1]) + 0.025
                if index + 1 < len(clusters)
                else 0.065
            )
            method_rows = [
                line
                for line in lines
                if lower_y < line.y < title_bottom - 0.008
                and ((line.x < 0.49) if method_left else (line.x > 0.51))
                and line not in cluster
            ]
            ingredient_rows = sorted(
                [
                    line
                    for line in lines
                    if lower_y < line.y < upper_y
                    and ((line.x > 0.51) if method_left else (line.x < 0.49))
                ],
                key=lambda line: -line.y,
            )
            yield_line = next(
                (
                    line.text
                    for line in ingredient_rows
                    if re.match(r"^(?:SERVES|MAKES)\b", line.text, re.I)
                ),
                None,
            )
            yield_index = next(
                (
                    row
                    for row, line in enumerate(ingredient_rows)
                    if re.match(r"^(?:SERVES|MAKES)\b", line.text, re.I)
                ),
                -1,
            )
            ingredients = ingredient_lines_from_ocr(
                ingredient_rows[yield_index + 1:]
            )
            steps = method_paragraphs(method_rows)
            if not ingredients or not steps or len(" ".join(steps)) < 25:
                continue
            recipe_id = unique_slug(title, used)
            recipes.append(
                recipe_record(
                    category=category_for(page, SILVER_SPOON_CATEGORIES),
                    ingredient_data=[{"heading": "Ingredients", "lines": ingredients}],
                    method_data=[{"heading": "Method", "steps": steps}],
                    pages=[page],
                    recipe_id=recipe_id,
                    title=title,
                    recipe_yield=yield_line,
                )
            )
            page_recipe_indexes.append(len(recipes) - 1)
        if page_recipe_indexes and len(ocr_page(slug, page + 1)) < 4:
            recipe = recipes[page_recipe_indexes[0]]
            image = stage_scan_crop(
                slug=slug,
                page=page + 1,
                recipe_id=str(recipe["id"]),
            )
            if image:
                recipe["image"] = image
    guide_titles = {
        "A Skillet Is Essential",
        "Bavarian Creams",
        "Boiling",
        "Braising, Stewing, Blanquettes Chops",
        "Cooking Time",
        "Custards and Creams",
        "Hare and Jack Rabbbit",
        "Measuring",
        "Octagov",
        "Ordinary Foreign",
        "Partridge",
        "Poaching",
        "Quantities",
        "Soufflés",
        "Venison",
    }
    recipes = [
        recipe
        for recipe in recipes
        if str(recipe["title"]) not in guide_titles
        and not any(
            str(line).upper().startswith("QUANTITIES AND COOKING")
            for group in recipe["ingredientGroups"]  # type: ignore[union-attr]
            for line in group["lines"]
        )
    ]
    for recipe in recipes:
        if str(recipe["title"]) != "Chicken with":
            continue
        first_step = str(recipe["methodGroups"][0]["steps"][0])  # type: ignore[index]
        match = re.match(r"^([A-Z][A-Z ]+\(\d+\))\s+", first_step)
        if match:
            recipe["title"] = smart_title(f"Chicken with {match.group(1)}")
            recipe["methodGroups"][0]["steps"][0] = first_step[match.end():]  # type: ignore[index]
            recipe["searchText"] = clean(f"{recipe['title']} {recipe['searchText']}")
    return book_record(
        author="The Silver Spoon Kitchen",
        categories=[label for _, label in SILVER_SPOON_CATEGORIES],
        description="The recipe collection from The Silver Spoon, organized by its contents-page sections with reference essays and celebrated-chef menus omitted.",
        recipes=recipes,
        slug=slug,
        title="The Silver Spoon",
    )


def parse_sauces_reconsidered() -> dict[str, object]:
    slug = "sauces-reconsidered"
    pages = load_pages("sauces-reconsidered")
    categories = [
        (20, "Ancient and Early Sauces"),
        (28, "Old Wine in New Bottles"),
        (38, "The Nineteenth Century"),
        (52, "French Sauces Beyond Sauciers"),
        (64, "The Modern World Begins"),
        (74, "A Time for Change"),
        (78, "Solutions"),
        (98, "Suspensions"),
        (128, "Gels"),
        (140, "Emulsions"),
        (152, "Cultured Sauces"),
        (160, "Composites"),
    ]
    recipes: list[dict[str, object]] = []
    used: set[str] = set()
    pattern = re.compile(r"Historic Recipe:\s*([^\n]+)\n(.*?)(?=\n\s*\n)", re.S | re.I)
    for page_number, page_text in enumerate(pages, 1):
        for match in pattern.finditer(page_text):
            title = clean(match.group(1))
            body = clean(match.group(2))
            if not title or len(body) < 20:
                continue
            clauses = [clean(clause) for clause in re.split(r"[;•]", body) if clean(clause)]
            recipes.append(
                recipe_record(
                    category=category_for(page_number, categories),
                    ingredient_data=[{"heading": "Historical formula", "lines": clauses}],
                    method_data=[{"heading": "Original directions", "steps": [body]}],
                    pages=[page_number],
                    recipe_id=unique_slug(title, used),
                    title=title,
                    subtitle="Historic recipe; quantities and timing are preserved only where the source states them.",
                )
            )
    return book_record(
        author="Gary Allen",
        categories=[label for _, label in categories],
        description="Only the book's explicitly labeled historic recipes, organized by chapter; surrounding sauce history and commentary are omitted.",
        recipes=recipes,
        slug=slug,
        title="Sauces Reconsidered",
    )


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(value, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )


def stage_book_media(book: dict[str, object], pdf_name: str) -> None:
    slug = str(book["id"])
    target = PUBLIC / f"{slug}.jpg"
    if not target.exists():
        render_page(WORK / pdf_name, 1, target)
    source_pdf = WORK / pdf_name
    if slug == "breakfast-the-cookbook":
        storage_pdf = WORK / "breakfast-storage.pdf"
        if storage_pdf.exists():
            source_pdf = storage_pdf
    source_directory = PUBLIC / "source"
    source_directory.mkdir(parents=True, exist_ok=True)
    single_source_target = source_directory / f"{slug}.pdf"

    if slug in SPLIT_SOURCE_BOOKS:
        if single_source_target.is_symlink():
            single_source_target.unlink()
        reader = PdfReader(str(source_pdf))
        page_count = len(reader.pages)
        split_page = (page_count + 1) // 2
        source_documents: list[dict[str, object]] = []
        for part, (start, end) in enumerate(
            ((0, split_page), (split_page, page_count)),
            1,
        ):
            source_part = WORK / f"{slug}-source-part-{part}.pdf"
            if not source_part.exists():
                writer = PdfWriter()
                for page in reader.pages[start:end]:
                    writer.add_page(page)
                with source_part.open("wb") as handle:
                    writer.write(handle)
            if source_part.stat().st_size >= 50 * 1024 * 1024:
                raise ValueError(f"Private source part exceeds 50 MB: {source_part}")
            source_target = source_directory / f"{slug}-part-{part}.pdf"
            if source_target.is_symlink() and source_target.resolve() != source_part.resolve():
                source_target.unlink()
            if not source_target.exists():
                source_target.symlink_to(source_part.resolve())
            source_documents.append(
                {
                    "endPage": end,
                    "path": f"/imported-cookbooks/source/{slug}-part-{part}.pdf",
                    "startPage": start + 1,
                }
            )
        book.pop("sourceDocument", None)
        book["sourceDocuments"] = source_documents
        return

    if single_source_target.is_symlink() and single_source_target.resolve() != source_pdf.resolve():
        single_source_target.unlink()
    if not single_source_target.exists():
        single_source_target.symlink_to(source_pdf.resolve())


def prune_unreferenced_recipe_images(book: dict[str, object]) -> None:
    slug = str(book["id"])
    recipe_directory = PUBLIC / "recipes" / slug
    if not recipe_directory.exists():
        return
    referenced = {
        Path(str(recipe["image"])).name
        for recipe in book["recipes"]  # type: ignore[index]
        if recipe.get("image")
    }
    for image_path in recipe_directory.iterdir():
        if image_path.is_file() and image_path.name not in referenced:
            image_path.unlink()


def refresh_library_indexes() -> None:
    existing_catalog = json.loads((BOOKS_DIR / "catalog.json").read_text(encoding="utf-8"))
    old_order = [book["id"] for book in existing_catalog if book["id"] not in NEW_BOOK_ORDER]
    order = old_order + NEW_BOOK_ORDER
    books: list[dict[str, object]] = []
    for book_id in order:
        path = BOOKS_DIR / f"{book_id}.json"
        if path.exists():
            books.append(json.loads(path.read_text(encoding="utf-8")))

    catalogue = [
        {
            key: book[key]
            for key in (
                "author",
                "categories",
                "coverImage",
                "description",
                "id",
                "recipeCountLabel",
                "sourceDocument",
                "sourceDocuments",
                "title",
            )
            if key in book
        }
        for book in books
    ]
    search = [
        {
            "bookId": book["id"],
            "bookTitle": book["title"],
            "category": recipe["category"],
            "id": recipe["id"],
            "sourcePages": recipe["sourcePages"],
            "title": recipe["title"],
        }
        for book in books
        for recipe in book["recipes"]  # type: ignore[index]
    ]
    write_json(BOOKS_DIR / "catalog.json", catalogue)
    write_json(BOOKS_DIR / "search-index.json", search)

    loaders = [
        'import type { ImportedCookbook } from "@/components/imported-cookbook-guide";',
        "",
        "export const importedCookbookLoaders: Record<string, () => Promise<ImportedCookbook>> = {",
    ]
    for book in catalogue:
        book_id = book["id"]
        loaders.append(
            f'  "{book_id}": () => import("@/lib/imported-cookbooks/{book_id}.json")'
            ".then((module) => module.default as ImportedCookbook),"
        )
    loaders.extend(["};", ""])
    (ROOT / "lib" / "imported-cookbook-loaders.ts").write_text("\n".join(loaders), encoding="utf-8")


def main() -> None:
    digital_books = [
        (parse_breakfast(), "breakfast.pdf"),
        (parse_tu_casa(), "tu-casa-mi-casa.pdf"),
        (parse_silver_spoon(), "silver-spoon.pdf"),
        (parse_nyt(), "essential-nyt-cookbook.pdf"),
        (parse_larousse(), "larousse-patisserie-baking.pdf"),
        (parse_crumb(), "crumb.pdf"),
        (parse_advanced_pastry(), "advanced-professional-pastry-chef.pdf"),
        (parse_pasta_sauces(), "complete-book-of-pasta-sauces.pdf"),
        (parse_french_laundry(), "french-laundry-cookbook.pdf"),
        (parse_spain(), "spain-the-cookbook.pdf"),
        (parse_sauces_reconsidered(), "sauces-reconsidered.pdf"),
    ]
    for book, pdf_name in digital_books:
        stage_book_media(book, pdf_name)
        write_json(BOOKS_DIR / f"{book['id']}.json", book)
        prune_unreferenced_recipe_images(book)
        print(f"{book['title']}: {len(book['recipes'])} recipes")
    for scan_slug in ("breakfast", "french-laundry-cookbook"):
        scan_directory = PUBLIC / "recipes" / scan_slug
        if scan_directory.exists():
            for image_path in scan_directory.iterdir():
                if image_path.is_file():
                    image_path.unlink()
    refresh_library_indexes()


if __name__ == "__main__":
    main()
