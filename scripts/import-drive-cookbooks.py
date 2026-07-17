"""Create source-preserving cookbook recipe records from locally downloaded PDFs.

This is intentionally a conservative first pass: it captures page-linked transcriptions
instead of guessing at multi-column ingredient/step boundaries. Re-run after correcting
the local `BOOKS` configuration or adding title overrides.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
PDF_ROOT = Path("/tmp/cookbook-imports")
OUT = ROOT / "lib" / "imported-cookbooks-data.json"

BOOKS = [
    {"id": "everyday-lebanese", "file": "everyday-lebanese.pdf", "title": "Everyday Lebanese", "author": "Mona Hamadeh", "start": 35, "marker": "serves", "categories": [(35, "Maza & starters"), (98, "Salads & soups"), (136, "Meat, poultry & fish"), (268, "Vegetarian dishes"), (327, "Sweets"), (377, "Basics")], "title_mode": "before-marker"},
    {"id": "japan-the-cookbook", "file": "japan-the-cookbook.pdf", "title": "Japan: The Cookbook", "author": "Nancy Singleton Hachisu", "start": 31, "marker": "preparation time", "categories": [(31, "Before the meal"), (61, "Dressed"), (93, "Raw"), (107, "Vinegared"), (123, "Simmered"), (155, "Soups"), (188, "Steamed"), (209, "Stir-fries"), (229, "Fried"), (255, "Grilled"), (277, "Noodles"), (291, "Rice"), (321, "Pickles"), (351, "One-pots"), (377, "Sweets")], "title_mode": "uppercase"},
    {"id": "anatolia", "file": "anatolia.pdf", "title": "Anatolia", "author": "Somer Sivrioğlu & David Dale", "start": 59, "marker": "serves", "categories": [(59, "Breakfast"), (70, "Light starts & banquets"), (140, "Lunch"), (212, "Afternoon tea"), (272, "Meze"), (360, "Dinner"), (441, "Puddings, baklavas & sweets")], "title_mode": "uppercase"},
    {"id": "science-of-spice", "file": "science-of-spice.pdf", "title": "The Science of Spice", "author": "Dr Stuart Farrimond", "start": 94, "marker": "serves", "categories": [(94, "Spice-profile recipes"), (210, "Further recipes")], "title_mode": "uppercase"},
    {"id": "secrets-of-open-crumb", "file": "secrets-of-open-crumb.pdf", "title": "Secrets of Open Crumb", "author": "Adelina Roberts", "start": 62, "marker": "ingredients", "categories": [(62, "Sourdough formulas")], "title_mode": "after-recipes"},
    {"id": "thailand-the-cookbook", "file": "thailand-the-cookbook.pdf", "title": "Thailand: The Cookbook", "author": "Jean-Pierre Gabriel", "start": 60, "marker": "origin", "categories": [(60, "Snacks & drinks"), (116, "Salads"), (162, "Soups"), (202, "Curries"), (258, "Grilled, boiled & fried"), (320, "Stir-fries"), (370, "Rice & noodles"), (412, "Desserts"), (466, "Guest chefs")], "title_mode": "before-marker"},
]

def normalise(text: str) -> str:
    return re.sub(r"[ \t]+", " ", text).replace(" \n", "\n").strip()

def category_for(page: int, categories: list[tuple[int, str]]) -> str:
    return max((category for first, category in categories if page >= first), default=categories[0][1])

def title_before_marker(text: str, marker: str) -> str:
    part = text[: text.lower().find(marker)]
    lines = [normalise(line) for line in part.splitlines() if normalise(line)]
    lines = [line for line in lines if not re.search(r"(preparation|cooking|origin|recipe|page)\b", line, re.I)]
    if not lines:
        return "Untitled recipe"
    # The first line is normally the recipe name. A second, short line is commonly
    # the original-language title, while a longer line is the introductory copy.
    title_lines = lines[:1]
    if len(lines) > 1 and len(lines[1]) <= 42 and not re.search(r"[.!?]$", lines[1]):
        title_lines.append(lines[1])
    return " · ".join(title_lines)[:150]

def titles_uppercase(text: str) -> list[str]:
    lines = [normalise(line) for line in text.splitlines() if normalise(line)]
    candidates = []
    for line in lines:
        letters = re.sub(r"[^A-Za-z]", "", line)
        if len(letters) >= 4 and letters == letters.upper() and len(line) <= 72 and not re.search(r"(serves|preparation|cooking|ingredients|recipe|page)", line, re.I):
            candidates.append(line.title())
    if candidates:
        return [" ".join(candidates[:3])[:150]]
    return [title_before_marker(text, "serves")]

def title_after_recipes(text: str) -> str:
    match = re.search(r"(?:Recipes|Ingredients:)\s*(.{0,280})", text, flags=re.I | re.S)
    if match:
        lines = [normalise(line) for line in match.group(1).splitlines() if normalise(line)]
        lines = [line for line in lines if not re.search(r"(ingredients|secrets of open crumb|recipes|•)", line, re.I)]
        if lines:
            return lines[0][:150]
    return title_before_marker(text, "ingredients")

OPEN_CRUMB_TITLES = {
    62: "Parmesan Core-Shaker Sourdough",
    66: "All-Inclusive Sourdough",
    70: "Pan de Cristal-Inspired Sourdough",
    74: "Hard White Wheat Sourdough",
    78: "The Special Blend Sourdough",
    82: "High-Hydration Dinner Rolls",
    86: "The Chanel Nº5 of Sourdoughs",
    90: "Whole-Grain Sourdough",
    94: "Artisan Low-Protein Sourdough",
}

def clean_title(title: str, page: int) -> str:
    title = re.sub(r"\s+", " ", title).strip(" ·-–—")
    return title if len(title) >= 3 else f"Source recipe · PDF page {page}"

def main() -> None:
    books = []
    for config in BOOKS:
        reader = PdfReader(str(PDF_ROOT / config["file"]))
        recipes = []
        for page_number, page in enumerate(reader.pages, start=1):
            if page_number < config["start"]:
                continue
            text = normalise(page.extract_text() or "")
            if config["marker"] not in text.lower():
                continue
            if config["title_mode"] == "uppercase":
                titles = titles_uppercase(text)
            elif config["title_mode"] == "after-recipes":
                titles = [OPEN_CRUMB_TITLES.get(page_number, title_after_recipes(text))]
            else:
                titles = [title_before_marker(text, config["marker"])]
            for title_index, title in enumerate(dict.fromkeys(titles)):
                recipes.append({"id": f"p{page_number}-{title_index + 1}", "title": clean_title(title, page_number), "category": category_for(page_number, config["categories"]), "sourcePages": [page_number], "transcription": text})
        books.append({"id": config["id"], "title": config["title"], "author": config["author"], "description": f"All detected recipe pages transcribed from the supplied {config['title']} PDF.", "recipeCountLabel": f"{len(recipes)} source-linked recipes", "categories": [category for _, category in config["categories"]], "recipes": recipes})
    OUT.write_text(json.dumps(books, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {OUT} with {sum(len(book['recipes']) for book in books)} recipe records.")

if __name__ == "__main__":
    main()
