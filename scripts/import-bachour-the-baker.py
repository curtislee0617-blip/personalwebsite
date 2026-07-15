"""Extract Bachour the Baker into structured pastry recipe data.

The supplied PDF has a reliable embedded text layer but disables copying in
ordinary viewers. pdfplumber can still read the document after authenticating
with its empty user password. Font styles carry the recipe hierarchy:
Capitol titles, Minion bold component headings, Minion italic ingredients and
Minion regular methods. This importer keeps exact source-page references so
every generated card remains visually auditable.
"""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from dataclasses import dataclass
from pathlib import Path

import pdfplumber
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_PDF = ROOT / "tmp/pdfs/bachour-pastries/bachour-pastries.pdf"
DEFAULT_OUTPUT = ROOT / "lib/bachour-pastries-data.json"

METHOD_START_RE = re.compile(
    r"^(?:add|after|allow|apply|bake|beat|blend|bloom|boil|bring|brush|butter|center|combine|cook|cool|cover|cream|create|cut|divide|drop|fill|fold|freeze|give|glaze|heat|in |laminate|lay|leave|let|lightly|line|lower|make|melt|mix|once|peel|pick|pipe|place|pour|prepare|preheat|press|process|punch|put|refrigerate|remove|reserve|return|roll|set|sift|soak|spray|sprinkle|start|stir|take|temper|the next day|top|transfer|trim|unmold|using|whip|with |work|wrap)",
    re.IGNORECASE,
)


RECIPE_STARTS: list[tuple[int, str, str]] = [
    (10, "Puff Pastry", "Foundations"),
    (12, "Palmiers", "Puff pastry & breakfast"),
    (14, "Apple Tart", "Puff pastry & breakfast"),
    (18, "Vanilla Napoleon", "Puff pastry & breakfast"),
    (20, "Chocolate Napoleon", "Puff pastry & breakfast"),
    (22, "Diplomat Napoleon", "Puff pastry & breakfast"),
    (24, "Raisin Scones", "Puff pastry & breakfast"),
    (28, "Butter Croissant", "Croissants"),
    (32, "Almond Croissant", "Croissants"),
    (34, "Baklava Croissant", "Croissants"),
    (38, "Dulce de Leche Croissant", "Croissants"),
    (40, "Gianduja Croissant", "Croissants"),
    (42, "Mascarpone and Strawberry Croissant", "Croissants"),
    (46, "Passion Fruit Croissant", "Croissants"),
    (50, "Pecan Croissant", "Croissants"),
    (54, "Chocolate Baton Croissant", "Croissants"),
    (58, "Carrot Croissant", "Croissants"),
    (62, "Chocolate Almond Praline Croissant", "Croissants"),
    (64, "Hazelnut Praline Croissant", "Croissants"),
    (66, "Pain aux Chocolat", "Croissants"),
    (68, "Chocolate Croissant", "Croissants"),
    (72, "Kougin-amann", "Croissants"),
    (76, "Pistachio Raspberry Croissant", "Croissants"),
    (78, "Guava and Cheese Croissant", "Croissants"),
    (80, "Mojito Croissant", "Croissants"),
    (82, "Mango Croissant", "Croissants"),
    (84, "Mascarpone Mixed Berry Croissant", "Croissants"),
    (86, "Coconut Croissant", "Croissants"),
    (88, "Pain aux Raisins", "Croissants"),
    (90, "Babka Croissant", "Croissants"),
    (92, "Mango Passion Fruit Croissant", "Croissants"),
    (94, "Pear Croissant", "Croissants"),
    (98, "Vanilla Brioche", "Brioche"),
    (102, "Almond Brioche", "Brioche"),
    (104, "Chocolate Custard Brioche", "Brioche"),
    (106, "Chocolate Hazelnut Brioche", "Brioche"),
    (108, "Coconut Brioche", "Brioche"),
    (110, "Kouglof", "Brioche"),
    (112, "Savarin", "Brioche"),
    (114, "Tiramisu Brioche", "Brioche"),
    (118, "Almond Blueberry Loaf Cake", "Cakes & financiers"),
    (120, "Banana Loaf Cake", "Cakes & financiers"),
    (122, "Carrot Loaf Cake", "Cakes & financiers"),
    (124, "Chocolate Loaf Cake", "Cakes & financiers"),
    (126, "Corn Financier", "Cakes & financiers"),
    (128, "Hazelnut Financier", "Cakes & financiers"),
    (130, "Pistachio Financier with White Chocolate Whipped Ganache", "Cakes & financiers"),
    (132, "Praline Passion Fruit Loaf Cake", "Cakes & financiers"),
    (134, "Olive Oil Madeleines", "Cakes & financiers"),
    (136, "Brownies", "Cakes & financiers"),
    (140, "Choux Pastry", "Choux & canelés"),
    (142, "Chocolate Éclair", "Choux & canelés"),
    (144, "Strawberry and Cream Éclair", "Choux & canelés"),
    (146, "Passion Fruit Éclair", "Choux & canelés"),
    (148, "Canelés", "Choux & canelés"),
    (152, "Sablé", "Foundations"),
    (152, "Chocolate Sablé", "Foundations"),
    (154, "Lemon Basil Tart", "Tarts & cookies"),
    (156, "Strawberry Tart", "Tarts & cookies"),
    (158, "Gianduja Tart", "Tarts & cookies"),
    (160, "Milk Chocolate Raspberry Tart", "Tarts & cookies"),
    (162, "Dulcey Sablé Cookies", "Tarts & cookies"),
    (164, "Salted Caramel Chocolate Sablé Cookies", "Tarts & cookies"),
    (168, "Chocolate Chip Cookies", "Tarts & cookies"),
    (170, "Chocolate White Chocolate Chip Cookies", "Tarts & cookies"),
    (172, "Macadamia Nut Cookies", "Tarts & cookies"),
    (174, "Oatmeal Raisin Cookies", "Tarts & cookies"),
]


@dataclass
class Line:
    text: str
    top: float
    page: int
    font: str
    size: float
    first_font: str


def slugify(value: str) -> str:
    value = value.lower().replace("œ", "oe").replace("æ", "ae").replace("’", "").replace("'", "")
    value = "".join(character for character in unicodedata.normalize("NFKD", value) if not unicodedata.combining(character))
    return re.sub(r"[^a-z0-9]+", "-", value).strip("-")


def clean_text(value: str) -> str:
    value = value.replace("Y ou", "You").replace("Chef ’s", "Chef’s").replace("confectioner’s", "confectioners’")
    value = value.replace("on top of 15 the baked croissants", "on top of the 15 baked croissants")
    value = re.sub(r"\s+", " ", value).strip()
    return value


def join_wrapped(previous: str, continuation: str) -> str:
    if previous.endswith("-") and continuation and continuation[0].islower():
        return previous[:-1] + continuation
    return f"{previous} {continuation}".strip()


def page_lines(page, page_number: int) -> list[Line]:
    attributes = ["fontname", "size"]
    words = page.extract_words(extra_attrs=attributes, use_text_flow=True)
    rows_for_layout: dict[float, list[dict]] = {}
    for word in words:
        rows_for_layout.setdefault(round(word["top"], 1), []).append(word)
    two_columns = False
    for top, row in rows_for_layout.items():
        if top <= 80:
            continue
        row.sort(key=lambda item: item["x0"])
        if row and row[0]["x0"] >= 300:
            two_columns = True
            break
        if any(right["x0"] >= 280 and right["x0"] - left["x1"] > 18 for left, right in zip(row, row[1:])):
            two_columns = True
            break
    word_sets = (
        [
            page.crop((0, 0, 315, page.height)).extract_words(extra_attrs=attributes, use_text_flow=True),
            page.crop((315, 0, page.width, page.height)).extract_words(extra_attrs=attributes, use_text_flow=True),
        ]
        if two_columns
        else [words]
    )

    grouped: list[list[dict]] = []
    for word_set in word_sets:
        rows: list[list[dict]] = []
        for word in sorted(word_set, key=lambda item: (round(item["top"], 1), item["x0"])):
            if word["top"] > 735:
                continue
            if not rows or abs(rows[-1][0]["top"] - word["top"]) > 1.2:
                rows.append([word])
            else:
                rows[-1].append(word)
        grouped.extend(rows)

    lines: list[Line] = []
    for row in grouped:
        row.sort(key=lambda item: item["x0"])
        text = clean_text(" ".join(word["text"] for word in row))
        if not text or text == "Bachour the Baker" or re.fullmatch(r"\d+", text):
            continue
        fonts = [word["fontname"].split("+")[-1] for word in row]
        sizes = [float(word["size"]) for word in row]
        font = max(set(fonts), key=fonts.count)
        lines.append(Line(text, float(row[0]["top"]), page_number, font, max(sizes), fonts[0]))
    merged: list[Line] = []
    for line in lines:
        if merged and is_title(merged[-1]) and is_title(line) and line.page == merged[-1].page and line.top - merged[-1].top < 40:
            merged[-1].text = f"{merged[-1].text} {line.text}"
            continue
        merged.append(line)
    return merged


def is_title(line: Line) -> bool:
    return "Capitol" in line.font or line.size >= 20


def is_italic(line: Line) -> bool:
    return "It" in line.font


def is_bold(line: Line) -> bool:
    return "Bold" in line.first_font or "MinionPro-Bold" in line.font


def explicit_reference(text: str) -> bool:
    lowered = text.lower()
    return (
        "see recipe page" in lowered
        or "as needed" in lowered
        or bool(re.match(r"^(?:\d|[¼½¾⅓⅔⅛⅜⅝⅞]|four\b)", lowered))
    )


def looks_like_ingredient(text: str) -> bool:
    lowered = text.lower()
    return explicit_reference(text) or bool(
        re.match(
            r"^(?:\d|[¼½¾⅓⅔⅛⅜⅝⅞]|pinch\b|non-?stick\b|unsalted butter\b|flour\b|egg wash\b|[a-z].*, as needed\b)",
            lowered,
        )
    )


def ingredient_continuation(previous: str, current: str) -> bool:
    if previous.endswith(("-", "/", "(", ",")):
        return True
    first = current.split()[0] if current.split() else ""
    return bool(first and first[0].islower())


def source_range(index: int) -> tuple[int, int]:
    printed, _, _ = RECIPE_STARTS[index]
    start = printed + 1
    following = [entry[0] for entry in RECIPE_STARTS[index + 1 :] if entry[0] > printed]
    end = following[0] if following else 175
    return start, end


def plain_page_lines(reader: PdfReader, page_number: int) -> list[str]:
    text = reader.pages[page_number - 1].extract_text() or ""
    lines: list[str] = []
    for raw in text.splitlines():
        line = clean_text(raw)
        if not line or line == "Bachour the Baker" or re.fullmatch(r"\d+", line):
            continue
        if lines and lines[-1].endswith("-") and line[0].islower():
            lines[-1] = lines[-1][:-1] + line
        else:
            lines.append(line)
    return lines


def title_words(value: str) -> set[str]:
    return {word for word in slugify(value).split("-") if len(word) > 2}


def plain_ingredient_start(text: str) -> bool:
    lowered = text.lower()
    return bool(
        re.match(r"^(?:\d|[¼½¾⅓⅔⅛⅜⅝⅞]|four\b|pinch\b|non-?stick\b)", lowered)
        or "see recipe page" in lowered
        or "as needed" in lowered
    )


def heading_candidate(lines: list[str], position: int, seen: set[str]) -> bool:
    text = lines[position].strip().rstrip(":")
    normalized = slugify(text)
    if not text or len(text) > 75 or normalized in seen or plain_ingredient_start(text):
        return False
    explicit = text.startswith("To ") or text.lower() in {
        "assembly",
        "glaze",
        "syrup",
        "egg wash",
        "butter block",
        "vanilla bean sugar",
    }
    if explicit:
        return True
    if text.endswith((".", ",", ";")) or METHOD_START_RE.match(text):
        return False
    if text.lower().startswith(("chef", "*available")):
        return False
    # Extracted PDF paragraphs wrap at the column edge. A wrapped sentence often
    # has no terminal punctuation, so only title-like, capitalized lines can open
    # a component. The following line must also look like an ingredient; method
    # prose alone is never enough evidence for a new component.
    if not text[0].isupper() or any(mark in text for mark in ".!?"):
        return False
    next_line = lines[position + 1] if position + 1 < len(lines) else ""
    return plain_ingredient_start(next_line)


def split_steps(lines: list[str]) -> list[str]:
    text = " ".join(lines).strip()
    if not text:
        return []
    text = re.sub(r"\s+", " ", text)
    return [step.strip() for step in re.split(r"(?<=[.!?])\s+(?=[A-Z])", text) if step.strip()]


def parse_recipe_plain(index: int, reader: PdfReader, all_lines: dict[int, list[Line]]) -> dict:
    _, title, category = RECIPE_STARTS[index]
    start, end = source_range(index)
    lines = [line for page in range(start, end + 1) for line in plain_page_lines(reader, page)]

    # The two sablé foundations share one printed page.
    if title == "Sablé" and "Chocolate Sablé" in lines:
        lines = lines[: lines.index("Chocolate Sablé")]
    elif title == "Chocolate Sablé" and "Chocolate Sablé" in lines:
        lines = lines[lines.index("Chocolate Sablé") + 1 :]

    wanted_words = title_words(title)
    lines = [
        line
        for line in lines
        if not (
            line.upper() == line
            and title_words(line)
            and title_words(line).issubset(wanted_words)
        )
        and slugify(line) != slugify(title)
    ]

    recipe_yield = "Yield not stated"
    components: list[dict] = []
    component_by_name: dict[str, dict] = {}

    def component(name: str) -> dict:
        key = slugify(name)
        if key not in component_by_name:
            entry = {"name": clean_text(name), "ingredients": [], "steps": []}
            component_by_name[key] = entry
            components.append(entry)
        return component_by_name[key]

    current = component(title)
    seen: set[str] = set()
    method_buffer: list[str] = []
    method_started = False

    def flush_method() -> None:
        nonlocal method_buffer
        current["steps"].extend(split_steps(method_buffer))
        method_buffer = []

    for position, text in enumerate(lines):
        if text.lower().startswith("yields "):
            recipe_yield = text[7:].strip()
            continue
        if text.lower().startswith("chef") or (text.startswith("*") and "available" in text.lower()):
            continue
        # A named component repeated beneath an Assembly/finishing heading is a
        # reference ingredient, not a second copy of that component or a method
        # command (for example "Glaze" beneath "To Decorate...").
        if not method_started and slugify(text) in seen:
            current["ingredients"].append(text)
            continue
        if heading_candidate(lines, position, seen):
            flush_method()
            current = component(text.rstrip(":"))
            seen.add(slugify(text))
            method_started = False
            continue
        if not method_started and (plain_ingredient_start(text) or not METHOD_START_RE.match(text)):
            if current["ingredients"] and text[0].islower():
                current["ingredients"][-1] = join_wrapped(current["ingredients"][-1], text)
            else:
                current["ingredients"].append(text)
            continue
        method_started = True
        method_buffer.append(text)
    flush_method()

    components = [entry for entry in components if entry["ingredients"] or entry["steps"]]
    source_pages = list(range(start, end + 1))
    image_candidates = [page for page in source_pages if len(" ".join(line.text for line in all_lines.get(page, []))) < 45]
    photo_page = image_candidates[0] if image_candidates else start
    if title == "Puff Pastry":
        photo_page = 9
    slug = slugify(title)
    return {
        "slug": slug,
        "title": title,
        "yield": recipe_yield,
        "category": category,
        "image": f"/bachour/the-baker/photos/{slug}.webp",
        "pdfPage": start,
        "photoPage": photo_page,
        "sourcePages": source_pages,
        "sourceImages": [f"/bachour/the-baker/pages/page-{page:03}.webp" for page in source_pages],
        "components": components,
    }


def parse_recipe(index: int, all_lines: dict[int, list[Line]]) -> dict:
    printed, title, category = RECIPE_STARTS[index]
    start, end = source_range(index)
    lines = [line for page in range(start, end + 1) for line in all_lines.get(page, [])]

    title_positions = [position for position, line in enumerate(lines) if is_title(line)]
    matching = next((position for position in title_positions if slugify(lines[position].text) == slugify(title)), None)
    if matching is None:
        matching = next((position for position in title_positions if slugify(title) in slugify(lines[position].text)), 0)
    stop = next((position for position in title_positions if position > matching), len(lines))
    lines = lines[matching + 1 : stop]

    recipe_yield = "Yield not stated"
    components: list[dict] = []
    component_by_name: dict[str, dict] = {}

    def component(name: str) -> dict:
        key = slugify(name)
        if key not in component_by_name:
            entry = {"name": clean_text(name), "ingredients": [], "steps": []}
            component_by_name[key] = entry
            components.append(entry)
        return component_by_name[key]

    current = component(title)
    prior_heading_names: set[str] = set()
    previous_line: Line | None = None
    current_step_page: int | None = None

    for line in lines:
        text = line.text
        if text.lower().startswith("yields "):
            recipe_yield = text[7:].strip()
            previous_line = line
            continue
        if text.startswith("*") and "available" in text.lower():
            previous_line = line
            continue

        gap = line.top - previous_line.top if previous_line and line.page == previous_line.page else 99
        if is_italic(line):
            if current["ingredients"] and ingredient_continuation(current["ingredients"][-1], text) and gap <= 13:
                current["ingredients"][-1] = join_wrapped(current["ingredients"][-1], text)
            else:
                current["ingredients"].append(text)
            previous_line = line
            continue

        if is_bold(line):
            normalized = slugify(text)
            if text.lower().startswith("chef"):
                previous_line = line
                continue
            if explicit_reference(text) or (gap <= 17 and (normalized in prior_heading_names or current["steps"] == [])):
                current["ingredients"].append(text)
            else:
                current = component(text.rstrip(":"))
                prior_heading_names.add(normalized)
                current_step_page = None
            previous_line = line
            continue

        if not text:
            previous_line = line
            continue
        if not current["steps"] and (looks_like_ingredient(text) or not METHOD_START_RE.match(text)):
            current["ingredients"].append(text)
            previous_line = line
            continue
        if current["steps"] and line.page == current_step_page and gap <= 13:
            current["steps"][-1] = join_wrapped(current["steps"][-1], text)
        else:
            current["steps"].append(text)
        current_step_page = line.page
        previous_line = line

    components = [entry for entry in components if entry["ingredients"] or entry["steps"]]
    source_pages = list(range(start, end + 1))
    image_candidates = [page for page in source_pages if len(" ".join(line.text for line in all_lines.get(page, []))) < 45]
    photo_page = image_candidates[0] if image_candidates else start
    if title == "Puff Pastry":
        photo_page = 9

    slug = slugify(title)
    return {
        "slug": slug,
        "title": title,
        "yield": recipe_yield,
        "category": category,
        "image": f"/bachour/the-baker/photos/{slug}.webp",
        "pdfPage": start,
        "photoPage": photo_page,
        "sourcePages": source_pages,
        "sourceImages": [f"/bachour/the-baker/pages/page-{page:03}.webp" for page in source_pages],
        "components": components,
    }


def main() -> None:
    pdf_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PDF
    output = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUTPUT
    with pdfplumber.open(pdf_path, password="") as pdf:
        all_lines = {number: page_lines(page, number) for number, page in enumerate(pdf.pages, 1)}
    reader = PdfReader(pdf_path)
    reader.decrypt("")
    recipes = [parse_recipe_plain(index, reader, all_lines) for index in range(len(RECIPE_STARTS))]
    output.write_text(json.dumps(recipes, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(recipes)} recipes to {output}")


if __name__ == "__main__":
    main()
