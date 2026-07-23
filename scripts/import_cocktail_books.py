#!/usr/bin/env python3
"""Build the private cocktail-book library from the three supplied PDFs.

This importer uses the PDFs' embedded text and typography for structure, while
keeping physical PDF page numbers on every recipe for visual verification.
Embedded photographs are resized to web-friendly WebP files and mapped back to
the recipe ranges in which they occur.
"""

from __future__ import annotations

import hashlib
import io
import json
import re
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from PIL import Image
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
PDF_ROOT = Path("/private/tmp/cocktail-books")
ASSET_ROOT = ROOT / "public" / "recipes" / "cocktail-books"
OUTPUT_PATH = ROOT / "data" / "cocktail-books-data.json"

PDF_PATHS = {
    "cocktail-codex": PDF_ROOT / "cocktail-codex.pdf",
    "200-cocktails": PDF_ROOT / "200-cocktails.pdf",
    "lost-cocktails": PDF_ROOT / "lost-cocktails.pdf",
}

FRACTIONS = "¼½¾⅓⅔⅛⅜⅝⅞"
AMOUNT_START = re.compile(
    rf"^(?:about\s+|approximately\s+|scant\s+)?(?:\d+(?:[.,]\d+)?|[{FRACTIONS}]|\d+[{FRACTIONS}])"
    rf"(?:\s*[-–]\s*\d+)?(?:\s+|[-–])",
    re.IGNORECASE,
)
SPECIAL_INGREDIENT_START = re.compile(
    r"^(?:garnish|optional garnish|rinse|to serve|for serving|ice|pectinex)\b",
    re.IGNORECASE,
)
METHOD_VERB = re.compile(
    r"^(?:add|arrange|beat|blend|brew|build|chill|coat|combine|cook|crack|crush|cut|decorate|"
    r"divide|dissolve|drop|express|fill|float|fold|frost|half-fill|heat|ignite|layer|light|lightly|"
    r"line|melt|microwave|mix|moisten|muddle|pack|peel|place|pour|press|put|rim|rinse|rub|"
    r"saturate|serve|set|shake|squeeze|stand|stir|strain|thread|tip|toast|top|transfer|twist|"
    r"warm|whisk)\b",
    re.IGNORECASE,
)


@dataclass
class FontLine:
    page: int
    y: float
    x: float
    size: float
    text: str


def clean_text(value: str) -> str:
    value = unicodedata.normalize("NFC", value)
    value = value.replace("\u0000", "").replace("\ufeff", "")
    value = value.replace(" ", " ").replace(" ", " ")
    value = re.sub(r"\s+", " ", value).strip()
    value = re.sub(r"\s+([,.;:!?%)])", r"\1", value)
    value = re.sub(r"([(])\s+", r"\1", value)
    value = re.sub(r"“\s+", "“", value)
    value = re.sub(r"\s+”", "”", value)
    value = re.sub(r"\s+([’'])\s*", r"\1", value)
    value = re.sub(r"\s*([–—])\s*", r" \1 ", value)
    return value.strip()


def slugify(value: str) -> str:
    folded = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "-", folded.lower()).strip("-") or "recipe"


def unique_slug(value: str, seen: set[str]) -> str:
    base = slugify(value)
    result = base
    suffix = 2
    while result in seen:
        result = f"{base}-{suffix}"
        suffix += 1
    seen.add(result)
    return result


def smart_join(parts: Iterable[str]) -> str:
    result = ""
    for raw in parts:
        part = clean_text(raw)
        if not part:
            continue
        if not result:
            result = part
        elif part in {"’", "'", ",", ".", ":", ";", ")", "%"}:
            result += part
        elif result.endswith(("(", "’", "'", "#")):
            result += part
        elif re.fullmatch(rf"[{FRACTIONS}]", part) and result[-1:].isdigit():
            result += part
        elif part in {"–", "—"}:
            result += f" {part} "
        else:
            result += f" {part}"
    return clean_text(result)


def font_lines(page, page_number: int) -> list[FontLine]:
    spans: list[tuple[float, float, float, str]] = []

    def visitor(text, cm, tm, font_dict, font_size):
        if clean_text(text):
            spans.append((float(tm[5]), float(tm[4]), float(font_size), text))

    page.extract_text(visitor_text=visitor)
    spans.sort(key=lambda item: (round(item[0], 1), item[1]))
    rows: list[list[tuple[float, float, float, str]]] = []
    for span in spans:
        if not rows or abs(rows[-1][0][0] - span[0]) > 0.8:
            rows.append([span])
        else:
            rows[-1].append(span)

    lines: list[FontLine] = []
    for row in rows:
        row.sort(key=lambda item: item[1])
        text = smart_join(item[3] for item in row)
        if text:
            lines.append(
                FontLine(
                    page=page_number,
                    y=min(item[0] for item in row),
                    x=min(item[1] for item in row),
                    size=max(item[2] for item in row),
                    text=text,
                )
            )
    return lines


def split_sentences(value: str) -> list[str]:
    value = clean_text(value)
    if not value:
        return []
    parts = re.split(r"(?<=[.!?])\s+(?=[A-ZÀ-ÖØ-Þ])", value)
    return [part.strip() for part in parts if part.strip()]


def join_instruction_lines(lines: list[FontLine]) -> str:
    if not lines:
        return ""
    paragraphs: list[list[str]] = [[]]
    previous: FontLine | None = None
    for line in lines:
        new_paragraph = False
        if previous:
            if line.page != previous.page:
                new_paragraph = previous.text.endswith((".", "!", "?"))
            elif line.y - previous.y > 30:
                new_paragraph = True
        if new_paragraph and paragraphs[-1]:
            paragraphs.append([])
        paragraphs[-1].append(line.text)
        previous = line
    return "\n\n".join(clean_text(" ".join(paragraph)) for paragraph in paragraphs if paragraph)


def is_ingredient_start(value: str) -> bool:
    return bool(AMOUNT_START.match(value) or SPECIAL_INGREDIENT_START.match(value))


def ingredient_lines_from_block(lines: list[FontLine]) -> tuple[list[str], int, int]:
    base_x = min((line.x for line in lines), default=0)
    first = next(
        (
            index
            for index, line in enumerate(lines)
            if line.x >= base_x + 10 and is_ingredient_start(line.text)
        ),
        -1,
    )
    if first < 0:
        return [], -1, -1

    ingredient_x = lines[first].x
    method_x = ingredient_x - 10
    end = len(lines)
    for index in range(first + 1, len(lines)):
        line = lines[index]
        if line.x <= method_x and METHOD_VERB.match(line.text):
            end = index
            break
        if line.x <= method_x and line.text and line.text[0].isupper() and not is_ingredient_start(line.text):
            end = index
            break

    ingredients: list[str] = []
    for line in lines[first:end]:
        value = clean_text(line.text)
        if not value:
            continue
        if is_ingredient_start(value) or not ingredients or value[:1].isupper():
            ingredients.append(value)
        else:
            ingredients[-1] = clean_text(f"{ingredients[-1]} {value}")
    return ingredients, first, end


def search_text(recipe: dict) -> str:
    values = [
        recipe.get("title", ""),
        recipe.get("description", ""),
        recipe.get("section", ""),
        recipe.get("subsection", ""),
        " ".join(recipe.get("tags", [])),
    ]
    for group in recipe.get("ingredientGroups", []):
        values.extend(group.get("lines", []))
    for group in recipe.get("methodGroups", []):
        values.extend(group.get("steps", []))
    return clean_text(" ".join(values))


def extract_images(reader: PdfReader, book_id: str) -> tuple[list[dict], dict[int, list[str]]]:
    target = ASSET_ROOT / book_id
    target.mkdir(parents=True, exist_ok=True)
    by_hash: dict[str, dict] = {}
    by_page: dict[int, list[str]] = {}

    for page_number, page in enumerate(reader.pages, 1):
        for image_index, image_file in enumerate(page.images, 1):
            raw = image_file.data
            digest = hashlib.sha256(raw).hexdigest()
            if digest in by_hash:
                by_hash[digest]["sourcePages"].append(page_number)
                by_page.setdefault(page_number, []).append(by_hash[digest]["src"])
                continue

            try:
                image = Image.open(io.BytesIO(raw))
                image.load()
            except Exception:
                continue
            if image.mode not in {"RGB", "RGBA"}:
                image = image.convert("RGB")
            if image.mode == "RGBA":
                background = Image.new("RGB", image.size, "white")
                background.paste(image, mask=image.getchannel("A"))
                image = background
            image.thumbnail((1500, 1500), Image.Resampling.LANCZOS)
            filename = f"page-{page_number:04d}-{image_index}.webp"
            output_path = target / filename
            image.save(output_path, "WEBP", quality=82, method=6)
            src = f"/recipes/cocktail-books/{book_id}/{filename}"
            entry = {
                "src": src,
                "sourcePages": [page_number],
                "width": image.width,
                "height": image.height,
            }
            by_hash[digest] = entry
            by_page.setdefault(page_number, []).append(src)

    return list(by_hash.values()), by_page


def codex_chapter(page: int, appendix_section: str) -> str:
    if page < 143:
        return "The Old-Fashioned"
    if page < 243:
        return "The Martini"
    if page < 356:
        return "The Daiquiri"
    if page < 468:
        return "The Sidecar"
    if page < 557:
        return "The Whisky Highball"
    if page < 650:
        return "The Flip"
    if page < 668:
        return "Appendix · Cocktails"
    if page < 673:
        return "Appendix · Syrups and cordials"
    if page < 690:
        return "Appendix · Infusions"
    if page < 695:
        return "Appendix · House mixes and sodas"
    if page < 696:
        return "Appendix · Salts and rims"
    return "Appendix · Solutions, tinctures, and concentrates"


def parse_codex(reader: PdfReader, page_images: dict[int, list[str]]) -> list[dict]:
    appendix_headings = {
        "COCKTAILS": "Appendix · Cocktails",
        "SYRUPS AND CORDIALS": "Appendix · Syrups and cordials",
        "INFUSIONS": "Appendix · Infusions",
        "HOUSE MIXES AND SODAS": "Appendix · House mixes and sodas",
        "SALTS AND RIMS": "Appendix · Salts and rims",
        "SOLUTIONS, TINCTURES, AND CONCENTRATES": "Appendix · Solutions, tinctures, and concentrates",
    }
    groups: list[dict] = []
    current: dict | None = None
    subsection = ""
    appendix_section = "Appendix · Cocktails"

    def close_current():
        nonlocal current
        if current:
            groups.append(current)
            current = None

    for page_number, page in enumerate(reader.pages, 1):
        if page_number < 16 or page_number > 699:
            continue
        lines = font_lines(page, page_number)
        for line in lines:
            rounded_size = round(line.size, 2)
            if rounded_size >= 28.3:
                heading = clean_text(line.text)
                if heading in appendix_headings:
                    appendix_section = appendix_headings[heading]
                if rounded_size < 36.6:
                    subsection = heading.title() if heading.isupper() else heading
                close_current()
                continue
            if abs(rounded_size - 22.5) < 0.2:
                title = clean_text(line.text)
                if len(title) <= 1 or title in {"|", "–", "—"}:
                    continue
                close_current()
                current = {
                    "title": title,
                    "titlePage": page_number,
                    "section": codex_chapter(page_number, appendix_section),
                    "subsection": subsection,
                    "lines": [],
                    "pages": {page_number},
                }
                continue
            if current:
                current["lines"].append(line)
                current["pages"].add(page_number)
        if current and page_images.get(page_number):
            current["pages"].add(page_number)
    close_current()

    recipes: list[dict] = []
    seen: set[str] = set()
    for group in groups:
        lines: list[FontLine] = group["lines"]
        ingredients, first_ingredient, method_start = ingredient_lines_from_block(lines)
        if first_ingredient < 0 or not ingredients:
            continue

        before = lines[:first_ingredient]
        attribution = ""
        description_lines: list[str] = []
        for line in before:
            value = clean_text(line.text)
            if not value:
                continue
            if line.x >= 15 and (value.isupper() or re.search(r",\s*(?:19|20)\d{2}$", value)) and not attribution:
                attribution = value
            elif line.x <= lines[first_ingredient].x - 10 and not value.isupper():
                description_lines.append(value)

        method_lines = lines[method_start:]
        extra_heading = next(
            (
                index
                for index, line in enumerate(method_lines[1:], 1)
                if line.text.isupper() and len(line.text) > 3
            ),
            len(method_lines),
        )
        method_text = join_instruction_lines(method_lines[:extra_heading])
        steps = split_sentences(method_text)
        title = clean_text(group["title"]).replace("Ti’Punch", "Ti’ Punch")
        pages = sorted(group["pages"])
        images = list(dict.fromkeys(src for page in pages for src in page_images.get(page, [])))
        recipe = {
            "id": unique_slug(title, seen),
            "title": title,
            "section": group["section"],
            "subsection": group["subsection"],
            "description": clean_text(" ".join(description_lines)),
            "attribution": attribution,
            "ingredientGroups": [{"heading": "Ingredients", "lines": ingredients}],
            "methodGroups": [{"heading": "Method", "steps": steps}] if steps else [],
            "sourcePages": pages,
            "images": images,
            "image": images[0] if images else None,
            "tags": [],
        }
        recipe["searchText"] = search_text(recipe)
        recipes.append(recipe)
    return recipes


CODEX_READING_RANGES = (
    ("Preface", 6, 9),
    ("Introduction", 10, 13),
    ("The Old-Fashioned", 16, 142),
    ("The Martini", 145, 242),
    ("The Daiquiri", 245, 355),
    ("The Sidecar", 358, 467),
    ("The Whisky Highball", 470, 556),
    ("The Flip", 559, 649),
    ("References and acknowledgments", 700, 710),
)


def codex_reading_chapter(page_number: int) -> str | None:
    return next(
        (title for title, first_page, last_page in CODEX_READING_RANGES if first_page <= page_number <= last_page),
        None,
    )


def codex_reading_blocks(lines: list[FontLine]) -> list[dict]:
    blocks: list[dict] = []
    current: dict | None = None
    previous: FontLine | None = None

    for line in lines:
        value = clean_text(line.text)
        if not value or re.fullmatch(r"\d+", value):
            continue
        is_heading = value.isupper() and len(value) <= 120 and line.size < 22.5
        starts_new_paragraph = (
            current is None
            or current["kind"] != "paragraph"
            or is_heading
            or previous is None
            or (line.page == previous.page and line.y - previous.y > max(previous.size * 2.15, 38))
            or (line.page == previous.page and abs(line.x - previous.x) > 18)
            or (line.page != previous.page and current["text"].endswith((".", "!", "?", ":", "”")))
        )

        if is_heading:
            if current:
                blocks.append(current)
            current = {"kind": "heading", "text": value}
        elif starts_new_paragraph:
            if current:
                blocks.append(current)
            current = {"kind": "paragraph", "text": value}
        elif current:
            if current["text"].endswith("-"):
                current["text"] = f"{current['text']}{value}"
            else:
                current["text"] = clean_text(f"{current['text']} {value}")
        previous = line

    if current:
        blocks.append(current)
    return blocks


def codex_display_heading(value: str) -> str:
    return (
        clean_text(value)
        .title()
        .replace("’S", "’s")
        .replace("'S", "'s")
        .replace("Diy ", "DIY ")
        .replace("Old- Fashioned", "Old-Fashioned")
    )


def parse_codex_reading_sections(reader: PdfReader, page_images: dict[int, list[str]] | None = None) -> list[dict]:
    sections: list[dict] = []
    current: dict | None = None
    page_images = page_images or {}

    def close_current():
        nonlocal current
        if not current:
            return
        current["blocks"] = codex_reading_blocks(current.pop("lines"))
        current["sourcePages"] = sorted(current["sourcePages"])
        current["images"] = list(dict.fromkeys(current["images"]))
        if current["blocks"]:
            current["searchText"] = clean_text(
                " ".join(
                    [
                        current["chapter"],
                        current["title"],
                        *(block["text"] for block in current["blocks"]),
                    ]
                )
            )
            sections.append(current)
        current = None

    for page_number, page in enumerate(reader.pages, 1):
        chapter = codex_reading_chapter(page_number)
        if not chapter:
            continue
        skip_recipe = False
        lines = font_lines(page, page_number)
        line_index = 0
        while line_index < len(lines):
            line = lines[line_index]
            rounded_size = round(line.size, 1)
            if rounded_size >= 28.0:
                heading_parts = [clean_text(line.text)]
                next_index = line_index + 1
                while (
                    next_index < len(lines)
                    and round(lines[next_index].size, 1) >= 28.0
                    and abs(lines[next_index].x - line.x) < 6
                    and lines[next_index].y - lines[next_index - 1].y < 70
                ):
                    heading_parts.append(clean_text(lines[next_index].text))
                    next_index += 1
                close_current()
                current = {
                    "id": slugify(f"{chapter}-{page_number}-{' '.join(heading_parts)}"),
                    "title": codex_display_heading(" ".join(heading_parts)),
                    "chapter": chapter,
                    "sourcePages": {page_number},
                    "lines": [],
                    "images": [],
                }
                skip_recipe = False
                line_index = next_index
                continue
            if abs(rounded_size - 22.5) < 0.2:
                skip_recipe = True
                line_index += 1
                continue
            if current and not skip_recipe and rounded_size >= 14.5:
                current["lines"].append(line)
                current["sourcePages"].add(page_number)
            line_index += 1
        if current and page_images.get(page_number):
            current["images"].extend(page_images[page_number])
            current["sourcePages"].add(page_number)
    close_current()
    return sections


def title_case(value: str) -> str:
    small = {"a", "an", "and", "at", "for", "in", "of", "on", "or", "the", "to", "with"}
    words = value.split()
    result = []
    for index, word in enumerate(words):
        if index > 0 and word.lower() in small:
            result.append(word.lower())
        elif word.lower() == "e=mc":
            result.append("E=mc")
        else:
            result.append(word[:1].upper() + word[1:])
    return " ".join(result)


def text_paragraphs(value: str) -> list[str]:
    paragraphs = []
    for part in re.split(r"\n\s*\n+", value):
        lines = [clean_text(line) for line in part.splitlines() if clean_text(line)]
        if lines:
            paragraphs.append("\n".join(lines))
    return paragraphs


def normalize_200_ingredients(lines: list[str]) -> list[str]:
    ingredients: list[str] = []
    optional_prefix = ""
    for raw in lines:
        value = clean_text(raw)
        if not value:
            continue
        if value.lower() == "(optional)":
            optional_prefix = "Optional "
            continue
        if optional_prefix:
            value = f"{optional_prefix}{value}"
            optional_prefix = ""
        continuation = value.split(maxsplit=1)[0].lower().strip(",") in {
            "and", "bitters", "cubes", "juice", "liqueur", "or", "purée", "puree", "syrup", "to",
        }
        wrapped_line = ingredients and ingredients[-1].lower().endswith((" to", " or", ",", "or 1 bottle"))
        if ingredients and not is_ingredient_start(value) and ((value[:1].islower() and continuation) or wrapped_line):
            ingredients[-1] = clean_text(f"{ingredients[-1]} {value}")
        else:
            ingredients.append(value)
    return ingredients


def parse_200(reader: PdfReader, page_images: dict[int, list[str]]) -> list[dict]:
    starts: list[tuple[int, str, str]] = []
    section = ""
    for page_number, page in enumerate(reader.pages, 1):
        titles: list[str] = []
        sections: list[str] = []

        def visitor(text, cm, tm, font_dict, font_size):
            value = clean_text(text)
            size = round(float(font_size), 1)
            if not value:
                return
            if size == 34.0:
                sections.append(value)
            elif size == 27.0:
                titles.append(value)

        page.extract_text(visitor_text=visitor)
        if sections:
            section = title_case(" ".join(sections))
        if page_number >= 65 and titles:
            starts.append((page_number, clean_text(" ".join(titles)), section))

    recipes: list[dict] = []
    seen: set[str] = set()
    for index, (start_page, raw_title, section) in enumerate(starts):
        end_page = (starts[index + 1][0] - 1) if index + 1 < len(starts) else 664
        title_page_text = reader.pages[start_page - 1].extract_text(extraction_mode="layout") or ""
        paragraphs = text_paragraphs(title_page_text)
        if len(paragraphs) < 3:
            continue

        metadata_index = next(
            (i for i, value in enumerate(paragraphs) if re.match(r"^(?:makes|serves)\s+", value, re.IGNORECASE)),
            -1,
        )
        if metadata_index < 0 or metadata_index + 1 >= len(paragraphs):
            continue
        metadata = paragraphs[metadata_index]
        body_lines: list[str] = []
        for paragraph in paragraphs[metadata_index + 1 :]:
            body_lines.extend(line for line in paragraph.splitlines() if clean_text(line))
        for page_number in range(start_page + 1, end_page + 1):
            page_text = reader.pages[page_number - 1].extract_text(extraction_mode="layout") or ""
            for paragraph in text_paragraphs(page_text):
                body_lines.extend(line for line in paragraph.splitlines() if clean_text(line))
        first_method = next(
            (
                i
                for i, value in enumerate(body_lines)
                if METHOD_VERB.match(clean_text(value))
                and not (i > 0 and clean_text(body_lines[i - 1]).lower().endswith(" to"))
            ),
            -1,
        )
        if first_method < 0:
            continue
        ingredients = normalize_200_ingredients(body_lines[:first_method])
        method_text = clean_text(" ".join(body_lines[first_method:]))

        variation_matches = list(
            re.finditer(r"\bFor\s+(?:a\s+|an\s+|the\s+)?([A-ZÀ-ÖØ-Þ][^,]{1,55}),", method_text)
        )
        primary_text = method_text[: variation_matches[0].start()].strip() if variation_matches else method_text
        makes = re.search(r"\b(makes|serves)\s+([\d–-]+)", metadata, re.IGNORECASE)
        glasses = re.search(r"\bglasses\s+(.+?)(?:\s+equipment\b|$)", metadata, re.IGNORECASE)
        equipment = re.search(r"\bequipment\s+(.+)$", metadata, re.IGNORECASE)
        title = title_case(raw_title)
        pages = list(range(start_page, end_page + 1))
        images = list(dict.fromkeys(src for page in pages for src in page_images.get(page, [])))
        recipe_id = unique_slug(title, seen)
        primary = {
            "id": recipe_id,
            "title": title,
            "section": section,
            "subsection": "Main recipes",
            "description": "",
            "attribution": "",
            "yield": f"{makes.group(1).capitalize()} {makes.group(2)}" if makes else None,
            "glassware": clean_text(glasses.group(1)) if glasses else "",
            "equipment": clean_text(equipment.group(1)) if equipment else "",
            "ingredientGroups": [{"heading": "Ingredients", "lines": ingredients}],
            "methodGroups": [{"heading": "Method", "steps": split_sentences(primary_text)}] if primary_text else [],
            "sourcePages": pages,
            "images": images,
            "image": images[0] if images else None,
            "tags": [],
        }
        primary["searchText"] = search_text(primary)
        recipes.append(primary)

        for match_index, match in enumerate(variation_matches):
            variation_title = title_case(clean_text(match.group(1)))
            content_start = match.end()
            content_end = variation_matches[match_index + 1].start() if match_index + 1 < len(variation_matches) else len(method_text)
            variation_text = clean_text(method_text[content_start:content_end])
            if not variation_title or not variation_text:
                continue
            variation = {
                "id": unique_slug(variation_title, seen),
                "title": variation_title,
                "section": section,
                "subsection": f"Variations on {title}",
                "description": f"A variation on {title}.",
                "attribution": "",
                "yield": primary["yield"],
                "glassware": primary["glassware"],
                "equipment": primary["equipment"],
                "ingredientGroups": [{"heading": f"Start with {title}", "lines": ingredients}],
                "methodGroups": [{"heading": "Variation", "steps": split_sentences(variation_text)}],
                "sourcePages": pages,
                "images": images,
                "image": images[0] if images else None,
                "variantOf": recipe_id,
                "tags": ["Variation"],
            }
            variation["searchText"] = search_text(variation)
            recipes.append(variation)
    return recipes


def split_lost_modern_build(value: str) -> tuple[list[str], list[str]]:
    value = clean_text(value)
    action = re.search(
        r"(?:^|\.\s+)(?=(?:Add|Beat|Build|Combine|Fill|Fold|Lightly|Muddle|Rinse|Saturate|Shake|Stir|Sugar-rim|Whites)\b)",
        value,
    )
    if action:
        ingredient_text = value[: action.end()].rstrip(". ")
        method_text = value[action.end() :]
    else:
        parts = value.split(". ", 1)
        ingredient_text = parts[0]
        method_text = parts[1] if len(parts) > 1 else ""
    ingredients = [clean_text(part) for part in ingredient_text.split("·") if clean_text(part)]
    return ingredients, split_sentences(method_text)


def lost_section(tags: list[str]) -> str:
    joined = " ".join(tags).upper()
    if "SPEC-CORRECTION" in joined:
        return "Spec corrections"
    if "LOST & FOUND" in joined or re.search(r"\bLOST\b", joined):
        return "Resurrections and lost drinks"
    if "OBSCURE" in joined:
        return "Obscure drinks"
    if "FAMOUS" in joined or "ESSENTIAL" in joined:
        return "Famous drinks"
    return "Historical foundations"


LOST_TITLES = (
    "Old-Fashioned Whiskey Cocktail", "Sazerac", "Manhattan", "Martinez", "Marguerite (proto-Martini)",
    "Aviation", "Last Word", "Corpse Reviver No. 2", "Hanky Panky", "Bronx", "Brooklyn", "Daiquirí (No. 1)",
    "Hemingway Daiquirí", "Mary Pickford", "Jack Rose", "Whiskey Sour", "Tom Collins", "John Collins",
    "Gin Fizz", "Ramos Gin Fizz", "Clover Club", "Pink Lady", "Bee's Knees", "Sidecar", "Between the Sheets",
    "Vieux Carré", "Blood and Sand", "Rob Roy", "Bobby Burns", "Boulevardier", "Negroni", "Americano",
    "El Presidente", "Hotel Nacional Special", "Airmail", "French 75", "Champagne Cocktail", "Stinger",
    "Alexander (gin)", "Grasshopper", "Mint Julep (cognac)", "Smash", "Brandy Crusta", "Japanese Cocktail",
    "Improved Whiskey Cocktail", "Widow's Kiss", "Saratoga", "Twentieth Century", "Apple Toddy",
    "Tom & Jerry (eggnog)",
)


def parse_lost(reader: PdfReader) -> list[dict]:
    recipes: list[dict] = []
    seen: set[str] = set()
    for page_number in range(4, 54):
        text = clean_text(reader.pages[page_number - 1].extract_text() or "")
        if not text or "MODERN BUILD" not in text or "WHY IT'S HERE" not in text:
            continue
        title_match = re.search(r"The\s+(.+?)\.\s+(.+?)\s+AS FIRST SET DOWN", text)
        if not title_match:
            continue
        title = LOST_TITLES[page_number - 4]
        attribution = clean_text(title_match.group(2))
        original_match = re.search(r"AS FIRST SET DOWN\s+(.+?)\s+MODERN BUILD", text)
        modern_match = re.search(r"MODERN BUILD\s+(.+?)\s+WHY IT'S HERE", text)
        why_match = re.search(r"WHY IT'S HERE\s+(.+?)\s+§\s+(.+?)\s+\d+$", text)
        if not modern_match:
            continue
        ingredients, steps = split_lost_modern_build(modern_match.group(1))
        tags = [clean_text(tag) for tag in (why_match.group(2).split("·") if why_match else []) if clean_text(tag)]
        if original_match:
            original = original_match.group(1).strip('"')
        else:
            original = ""
        recipe = {
            "id": unique_slug(title, seen),
            "title": title,
            "section": lost_section(tags),
            "subsection": "Fifty drinks",
            "description": clean_text(why_match.group(1)) if why_match else "",
            "attribution": attribution,
            "ingredientGroups": [{"heading": "Modern build", "lines": ingredients}],
            "methodGroups": [
                *([{"heading": "Modern method", "steps": steps}] if steps else []),
                *([{"heading": "As first set down", "steps": [original]}] if original else []),
            ],
            "sourcePages": [page_number],
            "images": [],
            "image": None,
            "tags": tags,
        }
        recipe["searchText"] = search_text(recipe)
        recipes.append(recipe)
    return recipes


def main():
    missing = [str(path) for path in PDF_PATHS.values() if not path.exists()]
    if missing:
        raise SystemExit(f"Missing downloaded PDFs: {', '.join(missing)}")

    codex_reader = PdfReader(PDF_PATHS["cocktail-codex"])
    hamlyn_reader = PdfReader(PDF_PATHS["200-cocktails"])
    lost_reader = PdfReader(PDF_PATHS["lost-cocktails"])

    codex_images, codex_by_page = extract_images(codex_reader, "cocktail-codex")
    hamlyn_images, hamlyn_by_page = extract_images(hamlyn_reader, "200-cocktails")
    lost_images, _ = extract_images(lost_reader, "lost-cocktails")

    books = [
        {
            "id": "cocktail-codex",
            "title": "Cocktail Codex",
            "author": "Alex Day, Nick Fauchald & David Kaplan",
            "description": "Cocktails organized around six root formulas, followed by the book's syrups, infusions, mixes, salts, tinctures, and other preparations.",
            "thumbnail": codex_images[0]["src"] if codex_images else None,
            "recipes": parse_codex(codex_reader, codex_by_page),
            "readingSections": parse_codex_reading_sections(codex_reader, codex_by_page),
            "images": codex_images,
        },
        {
            "id": "200-cocktails",
            "title": "200 Cocktails",
            "author": "Hamlyn Cookbooks",
            "description": "Main cocktails and their companion variations, retained in the book's seven flavour-led sections with each following drink photograph.",
            "thumbnail": hamlyn_images[0]["src"] if hamlyn_images else None,
            "recipes": parse_200(hamlyn_reader, hamlyn_by_page),
            "images": hamlyn_images,
        },
        {
            "id": "lost-cocktails",
            "title": "The Lost Cocktail Codex",
            "author": "Speakeater cellar staff",
            "description": "Fifty historical drinks presented with a measured modern build and the original wording from early bartending manuscripts.",
            "thumbnail": None,
            "recipes": parse_lost(lost_reader),
            "images": lost_images,
        },
    ]

    for book in books:
        book["sections"] = list(dict.fromkeys(recipe["section"] for recipe in book["recipes"]))
        book["recipeCountLabel"] = f"{len(book['recipes'])} recipes"

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(books, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for book in books:
        print(f"{book['title']}: {len(book['recipes'])} recipes, {len(book['images'])} unique images")
    print(f"Wrote {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
