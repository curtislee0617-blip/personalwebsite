"""Catalog Modernist Pizza Volume 4 into recipe and knowledge entries.

The kitchen manual mixes conventional recipes, parametric tables, ingredient
variations, photographic procedures, and several recipes on a single page.
This importer uses the page's typographic hierarchy to identify the primary
entry and keeps the complete source spread attached to it. Search aliases are
drawn from every prominent heading on the spread so secondary recipes remain
discoverable without inventing unreliable table transcriptions.
"""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from pathlib import Path

import pdfplumber
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_PDF = ROOT / "tmp/pdfs/modernist-pizza/modernist-pizza.pdf"
DEFAULT_OUTPUT = ROOT / "lib/modernist-pizza-data.json"

RECIPE_LABELS = {
    "MASTER RECIPE",
    "SUBMASTER RECIPE",
    "ASSEMBLY RECIPE",
    "PARAMETRIC RECIPE",
    "INGREDIENT VARIATION",
    "TOPPING VARIATION",
    "INNOVATIVE VARIATION",
    "TECHNIQUE VARIATION",
}

TITLE_EXCLUSIONS = {
    "TOTAL TIME",
    "YIELD",
    "YIELD/SHAPE",
    "INGREDIENTS",
    "WEIGHT",
    "VOLUME",
    "SCALING %",
    "PROCEDURE",
    "GENERAL DIRECTIONS",
    "NET CONTENTS",
    "MACHINE MIXING OPTIONS",
}

KNOWLEDGE_PREFIXES = (
    "HOW TO ",
    "STRATEGIES ",
    "BEST BETS ",
    "TIPS FOR ",
    "RECOMMENDED ",
    "COMMON ",
    "FACTORS ",
    "IMPROVING ",
    "MIX-AND-MATCH ",
    "SELECT ",
    "PUREE SUBSTITUTIONS",
    "FAT PERCENTAGES",
    "MEASURING ",
    "OUR PROOFING ",
    "ASSEMBLY AND BAKING TIMES",
    "DID ANYONE ORDER",
    "DOUGH, SAUCE, CHEESE",
    "SIMPLE PIZZA RECIPES",
    "HOT-HOLDING ",
    "REHEATING ",
    "ENHANCING ",
    "COOKING GRAINS",
    "COOKING PORRIDGE",
    "THE MATH FOR ",
)


def clean(value: str) -> str:
    replacements = {
        "Piiza": "Pizza",
        "Pizzzeria": "Pizzeria",
        "A1 Taglio": "Al Taglio",
        "l00�": "100% ",
        "30�": "30% ",
        "3000 FAT": "30% FAT",
        "Foolish": "Poolish",
        "Qµad": "Quad",
        "Thi n": "Thin",
        "T hin": "Thin",
    }
    for before, after in replacements.items():
        value = value.replace(before, after)
    value = value.replace("­", "").replace("�", "")
    return re.sub(r"\s+", " ", value).strip(" -–—|:")


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value.lower())
    value = "".join(character for character in value if not unicodedata.combining(character))
    return re.sub(r"[^a-z0-9]+", "-", value).strip("-")


def display_title(value: str) -> str:
    if value.upper() != value:
        return value
    value = value.title()
    replacements = {
        "Avpn": "AVPN",
        "Bbq": "BBQ",
        "Ph ": "pH ",
        "Sous Vide": "Sous Vide",
        "Al Taglio": "Al Taglio",
        "Fior Di Latte": "Fior di Latte",
        "Cacio E Pepe": "Cacio e Pepe",
    }
    for before, after in replacements.items():
        value = value.replace(before, after)
    value = value.replace("'S", "'s").replace("Al Tag Lio", "Al Taglio")
    value = value.replace("How To ", "How to ").replace("Best Bets For ", "Best Bets for ").replace("Strategies For ", "Strategies for ")
    return value


def title_from_text(text: str, label: str | None, fallback: str) -> str:
    lines = [clean(line) for line in text.splitlines() if clean(line)]
    while lines and (lines[0].upper() in RECIPE_LABELS or re.fullmatch(r"[\W_]+", lines[0])):
        lines.pop(0)
    if not lines:
        return display_title(fallback)
    if lines[0].upper().startswith(KNOWLEDGE_PREFIXES) or lines[0].upper().startswith("HOW TO"):
        return display_title(clean(lines[0]))
    title_lines: list[str] = []
    for line in lines[:5]:
        upper = line.upper()
        if upper in TITLE_EXCLUSIONS or upper.startswith(("INGREDIENT", "TOTAL TIME", "YIELD")):
            break
        is_title_line = upper == line and any(character.isalpha() for character in line)
        if not is_title_line:
            break
        title_lines.append(line)
        if len(title_lines) == 3:
            break
    title = display_title(clean(" ".join(title_lines))) if title_lines else display_title(fallback)
    title = re.sub(r"\s+(?:Total Time|Yield|Ingredients|Weight|Volume|Scaling ?%).*$", "", title, flags=re.IGNORECASE)
    title = re.sub(r"\s+Inspired By .*$", "", title, flags=re.IGNORECASE)
    title = re.sub(r"\s+[DV]$", "", title)
    # The percent glyph on this variation is rendered as several zeros by the
    # PDF text layer. Keep the correction here so regenerated data stays clean.
    title = re.sub(r"^10000 Rye\b", "100% Rye", title, flags=re.IGNORECASE)
    return clean(title)


def category_for(printed_page: int, kind: str) -> str:
    if kind == "knowledge":
        if printed_page <= 9:
            return "Ingredients & preferments"
        if printed_page <= 11:
            return "Ovens"
        if printed_page <= 24:
            return "Mixing, fermentation & shaping"
        if printed_page <= 107:
            return "Dough reference"
        if printed_page <= 150:
            return "Sauce technique"
        if printed_page <= 178:
            return "Cheese & toppings"
        if printed_page <= 268:
            return "Shaping & baking"
        if printed_page <= 335:
            return "Pizza design"
        if printed_page <= 346:
            return "Serving & storage"
        return "Reference"
    if printed_page <= 107:
        return "Pizza doughs"
    if printed_page <= 150:
        return "Sauces"
    if printed_page <= 165:
        return "Cheese"
    if printed_page <= 178:
        return "Toppings & preparations"
    if printed_page <= 268:
        return "Iconic pizzas"
    return "Flavor-theme pizzas"


def grouped_rows(page) -> list[dict]:
    words = page.extract_words(extra_attrs=["fontname", "size"], use_text_flow=False)
    rows: list[dict] = []
    for word in sorted(words, key=lambda item: (round(item["top"], 1), item["x0"])):
        match = next((row for row in rows if abs(row["top"] - word["top"]) <= 1.25), None)
        if match is None:
            match = {"top": float(word["top"]), "words": []}
            rows.append(match)
        match["words"].append(word)
    output: list[dict] = []
    for row in rows:
        words = sorted(row["words"], key=lambda item: item["x0"])
        clusters: list[list[dict]] = []
        for word in words:
            if not clusters or word["x0"] - clusters[-1][-1]["x1"] > 35:
                clusters.append([word])
            else:
                clusters[-1].append(word)
        for cluster in clusters:
            output.append(
                {
                    "top": row["top"],
                    "text": clean(" ".join(word["text"] for word in cluster)),
                    "size": max(float(word["size"]) for word in cluster),
                    "bold": any("Bold" in word["fontname"] for word in cluster),
                }
            )
    return output


def prominent_headings(rows: list[dict]) -> list[str]:
    headings: list[str] = []
    for row in rows:
        text = row["text"]
        if not text or text.upper() in TITLE_EXCLUSIONS or re.fullmatch(r"[\d®©°\W]+", text):
            continue
        uppercase = text.upper() == text and any(character.isalpha() for character in text)
        if (row["size"] >= 18 and (row["bold"] or uppercase)) or (row["size"] >= 15 and row["bold"] and uppercase) or text.upper().startswith(KNOWLEDGE_PREFIXES):
            if text not in headings:
                headings.append(text)
    return headings


def primary_title(rows: list[dict]) -> tuple[str | None, str | None]:
    top_rows = [row for row in rows if 45 <= row["top"] <= 145]
    label = next((row["text"].upper() for row in top_rows if row["text"].upper() in RECIPE_LABELS), None)
    candidates = []
    for row in top_rows:
        text = row["text"]
        if not text or text.upper() in RECIPE_LABELS | TITLE_EXCLUSIONS:
            continue
        if re.fullmatch(r"[\d®©°\W]+", text):
            continue
        uppercase = text.upper() == text and any(character.isalpha() for character in text)
        if row["size"] >= 20 and (row["bold"] or uppercase):
            candidates.append(row)
        elif text.upper().startswith(KNOWLEDGE_PREFIXES):
            candidates.append(row)
        elif text.upper() == "HOW TO":
            candidates.append(row)
    if not candidates:
        return label, None
    candidates.sort(key=lambda row: row["top"])
    first = candidates[0]
    title_parts = [first["text"]]
    for row in candidates[1:]:
        if row["top"] - candidates[0]["top"] > 42:
            break
        if row["text"] not in title_parts:
            title_parts.append(row["text"])
    title = clean(" ".join(title_parts))
    title = re.sub(r"\bHOW TO HOW TO\b", "HOW TO", title, flags=re.IGNORECASE)
    return label, title


def summary_from_text(text: str, title: str) -> str:
    lines = [clean(line) for line in text.splitlines() if clean(line)]
    title_words = set(slugify(title).split("-"))
    fragments: list[str] = []
    started = False
    for line in lines:
        normalized = slugify(line)
        if not started and normalized and set(normalized.split("-")).issubset(title_words):
            continue
        if line.upper() in RECIPE_LABELS or line.upper() in TITLE_EXCLUSIONS:
            continue
        if re.match(r"^(?:INGREDIENTS|WEIGHT|VOLUME|TOTAL TIME|YIELD|NET CONTENTS)\b", line, re.I):
            continue
        if re.match(r"^\d+\s", line) or re.search(r"\b\d+(?:\.\d+)?\s*(?:g|kg|oz|tsp|Tbsp)\b", line):
            if started:
                break
            continue
        if len(line) >= 45 and any(character.islower() for character in line):
            fragments.append(line)
            started = True
            if len(" ".join(fragments)) >= 240:
                break
        elif started:
            break
    summary = clean(" ".join(fragments))
    if len(summary) > 360:
        summary = summary[:357].rsplit(" ", 1)[0] + "..."
    return summary


def numbered_steps(text: str) -> list[str]:
    lines = [clean(line) for line in text.splitlines() if clean(line)]
    steps: list[str] = []
    current = ""
    for line in lines:
        match = re.match(r"^(\d{1,2})\s+(.+)$", line)
        if match and int(match.group(1)) <= 20:
            if current:
                steps.append(clean(current))
            current = match.group(2)
        elif current and not line.upper() in TITLE_EXCLUSIONS and not re.match(r"^[A-Z][A-Z /&-]{5,}$", line):
            current += " " + line
    if current:
        steps.append(clean(current))
    return [step for step in steps if len(step) >= 18][:16]


def main() -> None:
    pdf_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PDF
    output_path = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUTPUT
    reader = PdfReader(pdf_path)
    starts: list[dict] = []
    page_headings: dict[int, list[str]] = {}
    with pdfplumber.open(pdf_path) as pdf:
        for pdf_page in range(9, 386):
            printed_page = pdf_page - 8
            rows = grouped_rows(pdf.pages[pdf_page - 1])
            page_headings[pdf_page] = prominent_headings(rows)
            label, title = primary_title(rows)
            if not title:
                continue
            upper = title.upper()
            if upper in TITLE_EXCLUSIONS or upper.endswith("BAKING TIMES AND TEMPERATURES"):
                kind = "knowledge"
            elif upper.startswith(KNOWLEDGE_PREFIXES) or upper.startswith("HOW TO"):
                kind = "knowledge"
            elif label in RECIPE_LABELS:
                kind = "recipe"
            else:
                page_text = reader.pages[pdf_page - 1].extract_text() or ""
                has_recipe_structure = "INGREDIENT" in page_text.upper() and printed_page >= 25
                if not has_recipe_structure:
                    continue
                kind = "recipe"
            page_text = reader.pages[pdf_page - 1].extract_text() or ""
            clean_title = title_from_text(page_text, label, title)
            if clean_title.lower().startswith("reheating time rating"):
                continue
            clean_upper = clean_title.upper()
            if clean_upper.startswith(KNOWLEDGE_PREFIXES) or clean_upper.startswith("HOW TO") or clean_upper.endswith("BAKING TIMES AND TEMPERATURES"):
                kind = "knowledge"
            starts.append(
                {
                    "pdfPage": pdf_page,
                    "printedPage": printed_page,
                    "title": clean_title,
                    "label": label,
                    "kind": kind,
                    "headings": prominent_headings(rows),
                }
            )

    entries: list[dict] = []
    for index, start in enumerate(starts):
        next_page = starts[index + 1]["pdfPage"] if index + 1 < len(starts) else 386
        end_page = next_page - 1
        pages = list(range(start["pdfPage"], end_page + 1))
        text = "\n".join(reader.pages[page - 1].extract_text() or "" for page in pages)
        aliases = []
        for page in pages:
            aliases.extend(page_headings.get(page, []))
        aliases = [display_title(clean(alias)) for alias in aliases]
        aliases = list(dict.fromkeys(alias for alias in aliases if slugify(alias) != slugify(start["title"])))
        title = clean(start["title"])
        entries.append(
            {
                "slug": slugify(title),
                "title": title,
                "kind": start["kind"],
                "category": category_for(start["printedPage"], start["kind"]),
                "label": start["label"].title() if start["label"] else None,
                "printedPage": start["printedPage"],
                "pdfPage": start["pdfPage"],
                "sourcePages": pages,
                "sourceImages": [f"/modernist-pizza/pages/page-{page:03}.webp" for page in pages],
                "summary": summary_from_text(text, title),
                "steps": numbered_steps(text) if start["kind"] == "knowledge" else [],
                "aliases": aliases[:80],
                "searchText": clean(" ".join(aliases) + " " + text[:1800]),
            }
        )

    output_path.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    recipe_count = sum(entry["kind"] == "recipe" for entry in entries)
    knowledge_count = len(entries) - recipe_count
    print(f"Wrote {recipe_count} recipes and {knowledge_count} knowledge entries to {output_path}")


if __name__ == "__main__":
    main()
