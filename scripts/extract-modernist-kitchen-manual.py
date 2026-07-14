#!/usr/bin/env python3
"""Rebuild the Modernist Cuisine Volume 6 web index from the supplied PDF.

The PDF's embedded text is useful for locating rows, but it contains occasional
font-encoding errors. Every entry therefore keeps a fresh, high-resolution crop
of the printed page as its ground truth. Only regular ingredient/procedure grids
are transcribed; charts, programs, best-bet tables, and mixed layouts are shown
as facsimiles so that their structure and wording are not guessed.
"""

from __future__ import annotations

from pathlib import Path
import argparse
import re
import json
import unicodedata
from difflib import SequenceMatcher

import pypdf
import pdfplumber


PDF = Path('/tmp/recipe_book_drive.pdf')
OUT = Path('imports/modernist-cuisine-volume-6')
SOURCE_IMAGES = Path('public/modernist-cuisine/pages-v3')
CROP_RESOLUTION = 168


def load_word_dictionary() -> set[str]:
    dictionary_path = Path('/usr/share/dict/words')
    if not dictionary_path.exists():
        return set()
    return {
        word.strip().lower()
        for word in dictionary_path.read_text(encoding='utf-8', errors='ignore').splitlines()
        if len(word.strip()) >= 2 and word.strip().isalpha()
    }


WORD_DICTIONARY = load_word_dictionary()

# The contents page uses the printed page numbers. In this PDF, the recipe
# content begins at PDF page 13 for printed page 2, so the offset is +11.
CHAPTERS = [
    ('chapter-08-cooking-in-modern-ovens', 'Chapter 8 — Cooking in Modern Ovens', 2, 5),
    ('chapter-10-the-modernist-kitchen', 'Chapter 10 — The Modernist Kitchen', 6, 63),
    ('chapter-11-meat-and-seafood', 'Chapter 11 — Meat and Seafood', 64, 137),
    ('chapter-12-plant-foods', 'Chapter 12 — Plant Foods', 138, 199),
    ('chapter-13-thickeners', 'Chapter 13 — Thickeners', 200, 231),
    ('chapter-14-gels', 'Chapter 14 — Gels', 232, 295),
    ('chapter-15-emulsions', 'Chapter 15 — Emulsions', 296, None),
]


def clean(text: str) -> str:
    text = text.replace('\x00', '')
    text = re.sub(r'(?<!\n)\n(?!\n)', ' ', text)
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r' *\n *\n *', '\n\n', text)
    return text.strip()


def page_text(pdf: pdfplumber.PDF, printed_page: int) -> str:
    pdf_page = printed_page + 11
    if pdf_page < 1 or pdf_page > len(pdf.pages):
        return ''
    return (pdf.pages[pdf_page - 1].extract_text(layout=True) or '').strip()


def title_pattern(title: str) -> re.Pattern[str]:
    words = re.findall(r"[\w'’&/-]+", title, re.UNICODE)
    return re.compile(r'\s+'.join(re.escape(word) for word in words), re.IGNORECASE)


def isolate_entry(text: str, title: str, later_titles: list[str]) -> str:
    match = title_pattern(title).search(text)
    if not match:
        return text
    end = len(text)
    for later_title in later_titles:
        later = title_pattern(later_title).search(text, match.end())
        if later:
            end = min(end, later.start())
    return text[match.start():end].strip()


STEP_MARKER = re.compile(r'^(?:CD|\(?[0O®@©J]\)?|[①②③④⑤⑥⑦⑧⑨⑩])\s*')
QUANTITY = re.compile(
    r'^(.*?)[, ]+((?:\d|[lIO])(?:[\d.,/<>Yz ]*?)(?:kg|mg|mcg|g|ml|mL|L|lb|oz|pieces?|cloves?|sprigs?|eggs?)|as needed|to taste)$',
    re.IGNORECASE,
)


def parse_grid(text: str, title: str) -> dict[str, object]:
    lines = [line for line in text.splitlines() if not re.search(r'VOLUME 6|MODERNIST CUISINE|KITCHEN MANUAL', line, re.I)]
    header_index = next((index for index, line in enumerate(lines) if re.search(r'INGREDIENT\s+QUANTITY', line, re.I) and 'PROCEDURE' in line.upper()), -1)
    yield_match = re.search(r'Yields?\s*([^\n]+)', text, re.I)
    result: dict[str, object] = {
        'yield': yield_match.group(1).strip() if yield_match else '',
        'ingredients': [],
        'steps': [],
        'notes': [],
    }
    if header_index < 0:
        result['reference'] = [
            line.strip() for line in lines
            if line.strip() and line.strip().upper() != title.upper()
        ]
        return result

    header = lines[header_index]
    procedure_at = header.upper().find('PROCEDURE')
    ingredients: list[dict[str, str]] = []
    steps: list[str] = []
    notes: list[str] = []

    for line in lines[header_index + 1:]:
        trimmed = line.strip()
        if not trimmed:
            continue
        if re.match(r'^(from page|note\b)', trimmed, re.I):
            notes.append(trimmed)
            continue

        left = line[:procedure_at].strip()
        procedure = line[procedure_at:].strip() if len(line) > procedure_at else ''
        left = re.sub(r'\s+\(?\d+(?:\.\d+)?%\)?\*{0,2}\s*$', '', left).strip()

        if left:
            quantity_match = QUANTITY.match(left)
            if quantity_match:
                ingredients.append({'name': quantity_match.group(1).strip(' ,'), 'quantity': quantity_match.group(2).strip()})
            elif ingredients and not STEP_MARKER.match(left):
                ingredients[-1]['name'] = f"{ingredients[-1]['name']} {left}".strip()
            elif not STEP_MARKER.match(left):
                ingredients.append({'name': left, 'quantity': ''})

        if procedure:
            marker = STEP_MARKER.match(procedure)
            cleaned = STEP_MARKER.sub('', procedure).strip()
            if marker and cleaned:
                steps.append(cleaned)
            elif cleaned and steps:
                steps[-1] = f"{steps[-1]} {cleaned}".strip()
            elif cleaned:
                steps.append(cleaned)

    result['ingredients'] = ingredients
    result['steps'] = steps
    result['notes'] = notes
    return result


def normalize_title(value: str) -> str:
    return re.sub(r'[^a-z0-9]+', ' ', value.lower()).strip()


def group_word_lines(words: list[dict[str, object]], tolerance: float = 4.5) -> list[list[dict[str, object]]]:
    lines: list[list[dict[str, object]]] = []
    for word in sorted(words, key=lambda item: (float(item['top']), float(item['x0']))):
        if not lines or abs(float(word['top']) - float(lines[-1][0]['top'])) > tolerance:
            lines.append([word])
        else:
            lines[-1].append(word)
    return [sorted(line, key=lambda item: float(item['x0'])) for line in lines]


def line_text(words: list[dict[str, object]]) -> str:
    return ' '.join(str(word['text']) for word in words).strip()


def clean_ocr(value: str) -> str:
    value = unicodedata.normalize('NFC', value)
    value = value.replace('\u00ad', '')
    value = re.sub(r'\bso\s+us\s+vide\b', 'sous vide', value, flags=re.I)
    value = re.sub(r'\bsee\s*page\s*', 'see page ', value, flags=re.I)
    value = re.sub(r'\bfrom\s*page\s*', 'from page ', value, flags=re.I)
    value = re.sub(r'\b(for|about|of)(?:l|I)(?=[Yy\d])', r'\1 1', value, flags=re.I)
    value = re.sub(r'\bfor(?=\d)', 'for ', value, flags=re.I)
    value = re.sub(r'\babout(?=\d)', 'about ', value, flags=re.I)
    value = re.sub(r'\bof(?=\d)', 'of ', value, flags=re.I)
    value = re.sub(r'(?<=\d)\s*(?:[·•°\']|[oO])\s*[cC]\b', ' °C', value)
    value = re.sub(r'(?<=\d)\s*(?:[\'”“°]|[oO])\s*[fF]\b', ' °F', value)
    value = re.sub(r'\s+[lI]\s+(?=\d)', ' / ', value)
    value = re.sub(r'(?<=\d)\s+em\b', ' cm', value, flags=re.I)
    value = re.sub(r'\b([0-9]+)\s*[Yy]\s*[zZ]\b', r'\1½', value)
    value = re.sub(r'\b([0-9]+)\s*[Yy]\s*,\b', r'\1½', value)
    value = re.sub(r'\b([0-9]+)\s*[Yy]\s*,(?=\s)', r'\1½', value)
    value = repair_broken_words(value)
    value = re.sub(r'\s+([,.;:!?])', r'\1', value)
    value = re.sub(r'([(“])\s+', r'\1', value)
    value = re.sub(r'\s+', ' ', value).strip()
    return value


def repair_broken_words(value: str) -> str:
    """Repair recurring letter-spacing breaks from the PDF's custom fonts."""
    repairs = {
        'coagu lated': 'coagulated', 'comp letely': 'completely', 'complete ly': 'completely',
        'even ly': 'evenly', 'fine ly': 'finely', 'thin ly': 'thinly', 'sl iced': 'sliced',
        'sli ced': 'sliced', 'mi xture': 'mixture', 'pu ree': 'puree', 'be lly': 'belly',
        'chi li': 'chili', 'o il': 'oil', 'al l': 'all', 'un til': 'until',
        'im mediately': 'immediately', 'app lied': 'applied', 'con fit': 'confit',
        'Altern atively': 'Alternatively', 'altern atively': 'alternatively',
        'temper ature': 'temperature', 'refrig erate': 'refrigerate',
        'trans fer': 'transfer', 'resu lting': 'resulting', 'thorough ly': 'thoroughly',
        'contin uously': 'continuously', 'emu lsified': 'emulsified',
        'syr upy': 'syrupy', 'leathe ry': 'leathery', 'parchm ent': 'parchment',
        'barbecu- ing': 'barbecuing', 'chaco- late': 'chocolate',
    }
    for source, target in repairs.items():
        value = re.sub(rf'\b{re.escape(source)}\b', target, value, flags=re.I)
    if WORD_DICTIONARY:
        def join_hyphenated(match: re.Match[str]) -> str:
            joined = f'{match.group(1)}{match.group(2)}'
            return joined if joined.lower() in WORD_DICTIONARY else match.group(0)

        value = re.sub(r'\b([A-Za-z]{2,})-\s+([a-z]{2,})\b', join_hyphenated, value)

        def join_spaced(match: re.Match[str]) -> str:
            left, right = match.group(1), match.group(2)
            joined = f'{left}{right}'
            if joined.lower() not in WORD_DICTIONARY:
                return match.group(0)
            if (
                left.lower() not in WORD_DICTIONARY
                or right.lower() not in WORD_DICTIONARY
                or len(left) == 1
                or len(right) == 1
            ):
                return joined
            return match.group(0)

        adjacent_words = re.compile(r'(?=(\b([A-Za-z]{1,})\s+([a-z]{1,})\b))')
        for _ in range(40):
            replacement: tuple[int, int, str] | None = None
            for match in adjacent_words.finditer(value):
                original = match.group(1)
                joined = join_spaced(re.match(r'([A-Za-z]+)\s+([a-z]+)', original))  # type: ignore[arg-type]
                if joined != original:
                    replacement = (match.start(1), match.end(1), joined)
                    break
            if replacement is None:
                break
            start, end, joined = replacement
            value = f'{value[:start]}{joined}{value[end:]}'
    return value


def clean_quantity(value: str) -> str:
    value = clean_ocr(value)
    value = re.sub(r'(?i)\b([0-9lIJSOo]+(?:[.,][0-9lIJSOo]+)?)\s*(kg|mg|mcg|g|ml|mL|L|lb|oz)\b', _repair_quantity_match, value)
    value = re.sub(r'\bas\s+neede\s*d\b', 'as needed', value, flags=re.I)
    value = re.sub(r'\bto\s+tast\s*e\b', 'to taste', value, flags=re.I)
    return re.sub(r'\s+', ' ', value).strip()


def _repair_quantity_match(match: re.Match[str]) -> str:
    number = match.group(1)
    number = re.sub(r'[lIJ]', '1', number)
    number = re.sub(r'[oO]', '0', number)
    number = re.sub(r'[sS]', '5', number)
    unit = match.group(2)
    unit = 'mL' if unit.lower() == 'ml' else unit.lower() if unit != 'L' else 'L'
    return f'{number} {unit}'


def smart_title(value: str) -> str:
    value = re.sub(r'(?<=[a-z])(?=[A-Z])', ' ', value)
    value = re.sub(r'\bSO\s+US\b', 'SOUS', value, flags=re.I)
    value = re.sub(r'\bBEEF\]\s*ERKY\b', 'BEEF JERKY', value, flags=re.I)
    value = re.sub(r'\bSPICED\s+CHILL\s+OIL\b', 'SPICED CHILI OIL', value, flags=re.I)
    value = re.sub(r'\bJ\s+US\b', 'JUS', value, flags=re.I)
    value = re.sub(r'\bMARCON\s+A\b', 'MARCONA', value, flags=re.I)
    value = re.sub(r'\bGRAN\s+ITA\b', 'GRANITA', value, flags=re.I)
    value = re.sub(r"\bD\s+'\s*", "D'", value, flags=re.I)
    value = re.sub(r'\bA\s+IA\b', 'À LA', value, flags=re.I)
    value = re.sub(r'\bA\s+LA\b', 'À LA', value, flags=re.I)
    value = re.sub(r'\bA\s+CHOUX\b', 'À CHOUX', value, flags=re.I)
    value = re.sub(r'\bDE\s+IA\b', 'DE LA', value, flags=re.I)
    replacements = {
        'FRAJCHE': 'FRAÎCHE', 'FRALCHE': 'FRAÎCHE', 'FRAICHE': 'FRAÎCHE',
        'CREMEUX': 'CRÉMEUX', 'CREME': 'CRÈME',
        'CONSOMME': 'CONSOMMÉ', 'PUREE': 'PURÉE', 'BECHAMEL': 'BÉCHAMEL',
        'PUREES': 'PURÉES', 'PAVE': 'PAVÉ', 'SOUFFLEES': 'SOUFFLÉES',
        'SOUFFLE': 'SOUFFLÉ', 'BRIILEE': 'BRÛLÉE', 'BRULEE': 'BRÛLÉE',
        'PATE': 'PÂTE', 'EPICES': 'ÉPICES', 'GRUYERE': 'GRUYÈRE',
        'REMOULADE': 'RÉMOULADE', 'SABLE': 'SABLÉ',
    }
    for source, target in replacements.items():
        value = re.sub(rf'\b{source}\b', target, value, flags=re.I)
    titled = value.lower().title()
    for word in ('And', 'Or', 'With', 'For', 'In', 'Of', 'The', 'A', 'An', 'Au', 'De', 'La', 'To'):
        titled = re.sub(rf'(?<!^)\b{word}\b', word.lower(), titled)
    titled = re.sub(r"([’'])S\b", r"\1s", titled)
    titled = re.sub(r"(?<!^)\bD'", "d'", titled)
    titled = re.sub(r'\bSous Vide\b', 'Sous Vide', titled)
    titled = re.sub(r'\bPh\b', 'pH', titled)
    titled = re.sub(r'\bP H\b', 'pH', titled)
    titled = re.sub(r'\bCvap\b', 'CVap', titled)
    titled = re.sub(r'\b19Th\b', '19th', titled)
    titled = re.sub(r'\bVin Jaune\b', 'Vin Jaune', titled)
    titled = re.sub(r'(?<!^)\bÀ\b', 'à', titled)
    return titled.strip()


def heading_title(value: str) -> str:
    value = re.split(r'\s+(?:ADAPTED|INSPIRED|INPIRED|I\s+NSP\s+IR\s+ED)\b', value, maxsplit=1, flags=re.I)[0]
    value = re.split(r'\s+Yields?', value, maxsplit=1, flags=re.I)[0]
    value = re.sub(r'\s+Yields?\s*[lI]?\s*\d.*$', '', value, flags=re.I)
    value = re.sub(r'\s+Yields?[lI]?\d.*$', '', value, flags=re.I)
    return smart_title(value)


def display_title_at(lines: list[list[dict[str, object]]], top: float, fallback: str) -> str:
    line = next((candidate for candidate in lines if abs(float(candidate[0]['top']) - top) <= 5), None)
    if not line:
        return smart_title(fallback)
    heading = line_text(line)
    heading = re.split(r'\s+(?:Yields?|ADAPTED FROM|INSPIRED BY)\b', heading, maxsplit=1, flags=re.I)[0]
    if len(normalize_title(heading).split()) < max(2, len(normalize_title(fallback).split()) // 2):
        return smart_title(fallback)
    return smart_title(heading)


def heading_candidates(page: pdfplumber.page.Page, plain_lines: list[list[dict[str, object]]]) -> list[dict[str, object]]:
    sized_words = page.extract_words(x_tolerance=1, y_tolerance=2, keep_blank_chars=False, extra_attrs=['size'])
    sized_lines = group_word_lines(sized_words)
    candidates: list[dict[str, object]] = []
    for line in sized_lines:
        text = line_text(line)
        letters = [char for char in text if char.isalpha()]
        if len(letters) < 7 or re.search(r'INGREDIENT|QUANTITY|PROCEDURE|VOLUME 6|KITCHEN MANUAL', text, re.I):
            continue
        max_size = max(float(word['size']) for word in line)
        upper_ratio = sum(char.isupper() for char in letters) / len(letters)
        if not (max_size >= 10.8 or (max_size >= 9.9 and upper_ratio >= 0.58)):
            continue
        top = float(line[0]['top'])
        plain = min(plain_lines, key=lambda candidate: abs(float(candidate[0]['top']) - top))
        plain_text = line_text(plain)
        if re.match(r'^(?:CD|[0O®@©])\b', plain_text) or len(normalize_title(plain_text)) < 5:
            continue
        candidates.append({'top': float(plain[0]['top']), 'text': plain_text})
    unique: list[dict[str, object]] = []
    for candidate in sorted(candidates, key=lambda item: float(item['top'])):
        if unique and abs(float(candidate['top']) - float(unique[-1]['top'])) < 5:
            if len(str(candidate['text'])) > len(str(unique[-1]['text'])):
                unique[-1] = candidate
        else:
            unique.append(candidate)
    return unique


def assign_headings(entries: list[dict[str, object]], candidates: list[dict[str, object]], lines: list[list[dict[str, object]]]) -> list[dict[str, object]]:
    def score(entry: dict[str, object], candidate: dict[str, object]) -> float:
        target = normalize_title(str(entry['title']))
        candidate_text = normalize_title(str(candidate['text']))
        target_tokens = set(target.split())
        candidate_tokens = set(candidate_text.split())
        similarity = SequenceMatcher(None, target, candidate_text).ratio()
        overlap = len(target_tokens & candidate_tokens) / max(1, len(target_tokens))
        starts_alike = 0.12 if target.split()[:2] == candidate_text.split()[:2] else 0
        return similarity + 0.35 * overlap + starts_alike

    # Dynamic sequence alignment keeps TOC order and vertical page order in sync.
    # This prevents subheads such as "FOR THE BACON" from becoming entry bounds.
    entry_count = len(entries)
    candidate_count = len(candidates)
    dp = [[float('-inf')] * (candidate_count + 1) for _ in range(entry_count + 1)]
    action = [[''] * (candidate_count + 1) for _ in range(entry_count + 1)]
    dp[0][0] = 0.0
    for j in range(1, candidate_count + 1):
        dp[0][j] = dp[0][j - 1]
        action[0][j] = 'skip-candidate'
    for i in range(1, entry_count + 1):
        dp[i][0] = dp[i - 1][0] - 0.45
        action[i][0] = 'skip-entry'
    for i in range(1, entry_count + 1):
        for j in range(1, candidate_count + 1):
            options = [
                (dp[i][j - 1], 'skip-candidate'),
                (dp[i - 1][j] - 0.45, 'skip-entry'),
            ]
            match_score = score(entries[i - 1], candidates[j - 1])
            if match_score >= 0.40:
                options.append((dp[i - 1][j - 1] + match_score, 'match'))
            dp[i][j], action[i][j] = max(options, key=lambda item: item[0])

    result: list[dict[str, object] | None] = [None] * entry_count
    i, j = entry_count, candidate_count
    while i > 0 or j > 0:
        choice = action[i][j]
        if choice == 'match':
            candidate = dict(candidates[j - 1])
            candidate['matchScore'] = round(score(entries[i - 1], candidates[j - 1]), 3)
            result[i - 1] = candidate
            i -= 1
            j -= 1
        elif choice == 'skip-entry':
            i -= 1
        else:
            j -= 1

    previous_top = 24.0
    for index, entry in enumerate(entries):
        if result[index] is None:
            fallback_top = find_title_top(lines, str(entry['title']), previous_top + 4)
            result[index] = {
                'top': fallback_top if fallback_top is not None else previous_top + 8,
                'text': str(entry['title']),
                'matchScore': 0,
            }
        previous_top = max(previous_top, float(result[index]['top']))
    return [item for item in result if item is not None]


def extract_contents_entries(pdf: pdfplumber.PDF) -> list[dict[str, object]]:
    entries: list[dict[str, object]] = []
    chapter_ranges = [(8, 2, 5), (10, 6, 63), (11, 64, 137), (12, 138, 199), (13, 200, 231), (14, 232, 295), (15, 296, 999)]
    for pdf_page in range(6, 13):
        page = pdf.pages[pdf_page - 1]
        for x0, x1 in ((0, page.width / 2), (page.width / 2, page.width)):
            text = page.crop((x0, 0, x1, page.height)).extract_text(layout=True) or ''
            continuation: list[str] = []
            for raw_line in text.splitlines():
                line = raw_line.strip()
                if not line:
                    continue
                if re.match(r'^(?:TABLE OF CONTENTS|ABLE OF CONTENTS|CHAPTER\s+\d+|MODERNIST CUISINE|VOLUME 6)', line, re.I):
                    continuation = []
                    continue
                match = re.match(r'^(.*?)(?:\.{2,}|\.\s+\.)\s*([0-9lIO]{1,3})\s*$', line)
                if match:
                    title = re.sub(r'\s+', ' ', ' '.join([*continuation, match.group(1)])).strip(' .,')
                    continuation = []
                    page_text_value = match.group(2).replace('l', '1').replace('I', '1').replace('O', '0')
                    if not title or not page_text_value.isdigit():
                        continue
                    printed_page = int(page_text_value)
                    chapter = next((f'chapter-{number:02d}' for number, start, end in chapter_ranges if start <= printed_page <= end), None)
                    if chapter:
                        entries.append({'chapter': chapter, 'title': title, 'page': printed_page})
                elif not re.search(r'\.{3,}', line) and len(line) < 100:
                    continuation.append(line)
    return entries


def find_title_top(lines: list[list[dict[str, object]]], title: str, minimum_top: float = 0) -> float | None:
    target = normalize_title(title).split()
    needle = ' '.join(target[:min(5, len(target))])
    candidates: list[tuple[float, float]] = []
    for line in lines:
        top = float(line[0]['top'])
        if top < minimum_top:
            continue
        normalized_line = normalize_title(line_text(line))
        if needle and needle in normalized_line:
            return top
        if normalized_line:
            target_text = ' '.join(target)
            score = SequenceMatcher(None, target_text, normalized_line).ratio()
            if target and target[0] in normalized_line:
                score += 0.08
            candidates.append((score, top))
    if not candidates:
        return None
    score, top = max(candidates)
    return top if score >= 0.48 else None


COMPLEX_LAYOUT_MARKERS = (
    (re.compile(r'^PROGRAM$', re.I), 'oven program'),
    (re.compile(r'\bSTAGE\b.*\b(?:TEMP|TEMPERATURE)\b.*\b(?:HUMIDITY|COMMAND)\b', re.I), 'program table'),
    (re.compile(r'\bBEST BETS\b', re.I), 'best-bets chart'),
    (re.compile(r'\bREFERENCE TABLES?\b', re.I), 'reference table'),
    (re.compile(r'^EXAMPLE USES?\b', re.I), 'uses chart'),
    (re.compile(r'^VARIABLES?\b.*\b(?:LOW|HIGH|RESULT)\b', re.I), 'comparison chart'),
)


def is_ingredient_heading(value: str) -> bool:
    letters = [character for character in value if character.isalpha()]
    return bool(letters) and len(value) < 72 and sum(character.isupper() for character in letters) / len(letters) > 0.82


def valid_quantity(value: str) -> bool:
    if not value:
        return False
    if re.fullmatch(r'(?:as needed|to taste|optional)', value, re.I):
        return True
    return bool(re.match(r'^(?:about\s+)?(?:\d|[\u00bc-¾⅐-⅞])', value))


def parse_page_geometry(page: pdfplumber.page.Page, title: str, top: float, bottom: float) -> dict[str, object]:
    words = page.extract_words(x_tolerance=1, y_tolerance=2, keep_blank_chars=False)
    region = [word for word in words if top <= float(word['top']) < bottom]
    lines = group_word_lines(region)
    headers = [
        line for line in lines
        if {'INGREDIENT', 'QUANTITY', 'PROCEDURE'}.issubset({str(word['text']).upper() for word in line})
    ]

    yield_text = ''
    for line in lines[:5]:
        match = re.search(r'\b[YV]ields?\s*([^|]+)$', line_text(line), re.I)
        if match:
            candidate = re.split(
                r'\s+(?:CD|<D|\(?[0O®@©J]\)?|[①-⑩])\s+(?=[A-Z])',
                match.group(1),
                maxsplit=1,
            )[0]
            candidate = re.split(r'\b(?:INGREDIENT|PROCEDURE)\b', candidate, maxsplit=1, flags=re.I)[0]
            if ')' in candidate:
                candidate = candidate[:candidate.index(')') + 1]
            yield_text = clean_quantity(candidate) if len(candidate) <= 120 else ''
            break

    reference_lines = [clean_ocr(line_text(line)) for line in lines[1:] if line_text(line)]
    if len(headers) != 1:
        reason = 'no regular recipe grid' if not headers else 'multiple recipe grids'
        return {
            'yield': yield_text,
            'ingredients': [],
            'steps': [],
            'notes': [],
            'reference': reference_lines,
            'sourceKind': 'reference',
            'isRecipe': bool(yield_text),
            'layoutKind': 'facsimile',
            'layoutReason': reason,
        }

    header = headers[0]
    header_top = min(float(word['top']) for word in header)
    body_lines = [line for line in lines if min(float(word['top']) for word in line) > header_top + 2]
    for line in body_lines:
        cleaned_line = clean_ocr(line_text(line))
        for pattern, reason in COMPLEX_LAYOUT_MARKERS:
            if pattern.search(cleaned_line):
                return {
                    'yield': yield_text,
                    'ingredients': [],
                    'steps': [],
                    'notes': [],
                    'reference': reference_lines,
                    'sourceKind': 'reference',
                    'isRecipe': True,
                    'layoutKind': 'facsimile',
                    'layoutReason': reason,
                }

    positions = {str(word['text']).upper(): float(word['x0']) for word in header}
    ingredient_x = positions['INGREDIENT']
    quantity_x = positions['QUANTITY']
    procedure_x = positions['PROCEDURE']
    scaling_x = next(
        (float(word['x0']) for word in header if str(word['text']).upper().startswith('SCAL')),
        procedure_x - 35,
    )
    right_block_starts = []
    for line in body_lines:
        words_at_right = [word for word in line if float(word['x0']) >= procedure_x - 3]
        if words_at_right:
            start = min(float(word['x0']) for word in words_at_right)
            if start > procedure_x + 78:
                right_block_starts.append(start)
    sidebar_start = min(right_block_starts) if len(right_block_starts) >= 2 else None
    ingredients: list[dict[str, object]] = []
    steps: list[str] = []
    notes: list[str] = []
    sidebar_notes: list[str] = []
    marker_count = 0
    note_mode = False

    for line in body_lines:
        raw_line = line_text(line)
        full_line = clean_ocr(raw_line)
        if note_mode:
            notes[-1] = clean_ocr(f'{notes[-1]} {full_line}')
            continue
        if re.match(r'^(?:NOTE\b|NOTES\b|\*\s*NOTE\b)', full_line, re.I):
            notes.append(full_line)
            note_mode = True
            continue

        left_sidebar_words = [word for word in line if float(word['x0']) < ingredient_x - 4]
        ingredient_words = [word for word in line if ingredient_x - 4 <= float(word['x0']) < quantity_x - 2]
        quantity_words = [word for word in line if quantity_x - 2 <= float(word['x0']) < scaling_x - 2]
        procedure_words = sorted(
            [word for word in line if float(word['x0']) >= procedure_x - 3],
            key=lambda word: float(word['x0']),
        )
        right_sidebar_words: list[dict[str, object]] = []
        if sidebar_start is not None:
            right_sidebar_words = [word for word in procedure_words if float(word['x0']) >= sidebar_start - 2]
            procedure_words = [word for word in procedure_words if float(word['x0']) < sidebar_start - 2]
        elif procedure_words and float(procedure_words[0]['x0']) > procedure_x + 72:
            right_sidebar_words = procedure_words
            procedure_words = []
        else:
            for word_index in range(1, len(procedure_words)):
                gap = float(procedure_words[word_index]['x0']) - float(procedure_words[word_index - 1]['x1'])
                if gap > 42 and float(procedure_words[word_index]['x0']) > procedure_x + 72:
                    right_sidebar_words = procedure_words[word_index:]
                    procedure_words = procedure_words[:word_index]
                    break
        sidebar_text = clean_ocr(' '.join(filter(None, [line_text(left_sidebar_words), line_text(right_sidebar_words)])))
        if sidebar_text:
            sidebar_notes.append(sidebar_text)
        ingredient_text = clean_ocr(line_text(ingredient_words))
        quantity_text = clean_quantity(line_text(quantity_words))
        procedure_text = clean_ocr(line_text(procedure_words))

        if ingredient_text:
            if re.match(r'^(?:see|from) page\b', ingredient_text, re.I) and ingredients:
                ingredients[-1]['name'] = clean_ocr(f"{ingredients[-1]['name']} ({ingredient_text})")
            elif quantity_text:
                ingredients.append({'name': ingredient_text, 'quantity': quantity_text})
            elif is_ingredient_heading(ingredient_text):
                ingredients.append({'name': smart_title(ingredient_text), 'quantity': '', 'heading': True})
            elif ingredients:
                ingredients[-1]['name'] = clean_ocr(f"{ingredients[-1]['name']} {ingredient_text}")
            else:
                ingredients.append({'name': ingredient_text, 'quantity': ''})
        elif quantity_text and ingredients:
            ingredients[-1]['quantity'] = clean_quantity(f"{ingredients[-1]['quantity']} {quantity_text}")

        if procedure_text:
            marker = STEP_MARKER.match(procedure_text)
            if marker:
                marker_count += 1
                procedure_text = STEP_MARKER.sub('', procedure_text, count=1).strip()
                if procedure_text:
                    steps.append(procedure_text)
            elif steps:
                steps[-1] = clean_ocr(f'{steps[-1]} {procedure_text}')
            else:
                steps.append(procedure_text)

    if sidebar_notes:
        notes.append(clean_ocr(' '.join(sidebar_notes)))

    regular_ingredients = [ingredient for ingredient in ingredients if not ingredient.get('heading')]
    invalid_quantities = [
        str(ingredient.get('quantity', '')) for ingredient in regular_ingredients
        if not valid_quantity(str(ingredient.get('quantity', '')))
    ]
    contamination = any(
        re.search(r'\b(?:YIELDS?|INGREDIENT\s+QUANTITY|PROGRAM|STAGE\s+TEMP)\b', value, re.I)
        for value in [
            *[str(ingredient.get('name', '')) for ingredient in regular_ingredients],
            *[str(ingredient.get('quantity', '')) for ingredient in regular_ingredients],
            *steps,
        ]
    )
    too_long = any(len(str(ingredient.get('name', ''))) > 180 for ingredient in regular_ingredients) or any(len(step) > 520 for step in steps)
    if (
        not regular_ingredients
        or not steps
        or marker_count == 0
        or invalid_quantities
        or contamination
        or too_long
    ):
        reasons = []
        if not regular_ingredients or not steps or marker_count == 0:
            reasons.append('irregular recipe grid')
        if invalid_quantities:
            reasons.append('mixed table columns')
        if contamination or too_long:
            reasons.append('adjacent chart or commentary')
        return {
            'yield': yield_text,
            'ingredients': [],
            'steps': [],
            'notes': notes,
            'reference': reference_lines,
            'sourceKind': 'reference',
            'isRecipe': True,
            'layoutKind': 'facsimile',
            'layoutReason': ', '.join(dict.fromkeys(reasons)),
        }

    return {
        'yield': yield_text,
        'ingredients': ingredients,
        'steps': steps,
        'notes': notes,
        'reference': [],
        'sourceKind': 'recipe',
        'isRecipe': True,
        'layoutKind': 'structured',
        'layoutReason': 'regular ingredient and procedure grid',
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--skip-images', action='store_true', help='Reuse existing crops while rebuilding JSON and markdown.')
    args = parser.parse_args()
    reader = pypdf.PdfReader(str(PDF))
    layout_pdf = pdfplumber.open(str(PDF))
    OUT.mkdir(parents=True, exist_ok=True)
    SOURCE_IMAGES.mkdir(parents=True, exist_ok=True)
    all_text = []
    manifest = ['# Modernist Cuisine — Volume 6: Kitchen Manual', '', 'Source extraction starts at PDF page 6, as requested.', '']

    contents_pages = []
    for pdf_page in range(6, 13):
        text = clean(reader.pages[pdf_page - 1].extract_text() or '')
        if text:
            contents_pages.append(f'<!-- PDF page {pdf_page} -->\n\n{text}')
    (OUT / 'contents-pages-6-12.md').write_text(
        '# Contents and front matter from PDF pages 6–12\n\n' + '\n\n'.join(contents_pages) + '\n',
        encoding='utf-8',
    )
    manifest.append('- [Contents and front matter, PDF pages 6–12](./contents-pages-6-12.md)')
    manifest.append('')

    toc_entries = extract_contents_entries(layout_pdf)
    by_page: dict[int, list[dict[str, object]]] = {}
    for entry in toc_entries:
        by_page.setdefault(int(entry['page']), []).append(entry)
    for printed_page, entries in by_page.items():
        page = layout_pdf.pages[printed_page + 10]
        page_words = page.extract_words(x_tolerance=1, y_tolerance=2, keep_blank_chars=False)
        page_lines = group_word_lines(page_words)
        candidates = heading_candidates(page, page_lines)
        assignments = assign_headings(entries, candidates, page_lines)
        page_image = None
        if not args.skip_images:
            page_image = page.to_image(resolution=CROP_RESOLUTION, antialias=True).original.convert('RGB')
        image_scale = CROP_RESOLUTION / 72
        for index, entry in enumerate(entries):
            top = float(assignments[index]['top'])
            next_top = float(assignments[index + 1]['top']) if index + 1 < len(assignments) else float(page.height) - 32
            bottom = next_top - 5 if next_top > top + 24 else float(page.height) - 32
            bottom = max(top + 24, min(bottom, float(page.height) - 28))
            entry['displayTitle'] = smart_title(str(entry['title']))
            entry['pdfPage'] = printed_page + 11
            entry['headingMatchScore'] = assignments[index].get('matchScore', 0)
            entry.update(parse_page_geometry(page, str(entry['title']), top, bottom))
            slug = re.sub(r'[^a-z0-9]+', '-', str(entry['displayTitle']).lower()).strip('-')[:72]
            filename = f'p{printed_page:03d}-{index + 1:02d}-{slug}.webp'
            image_path = SOURCE_IMAGES / filename
            crop_top = max(0, round((top - 7) * image_scale))
            page_image_height = round(float(page.height) * image_scale)
            crop_bottom = min(page_image_height, round((bottom + 4) * image_scale))
            crop_width = round(float(page.width) * image_scale)
            crop_height = crop_bottom - crop_top
            if page_image is not None:
                crop = page_image.crop((0, crop_top, page_image.width, crop_bottom))
                crop.save(image_path, 'WEBP', quality=90, method=6)
                crop_width, crop_height = crop.size
            entry['sourceImage'] = f'/modernist-cuisine/pages-v3/{filename}'
            entry['sourceImageWidth'] = crop_width
            entry['sourceImageHeight'] = crop_height
            entry['sourceBounds'] = {
                'top': round(top, 2),
                'bottom': round(bottom, 2),
            }
    (OUT / 'contents-index.json').write_text(json.dumps(toc_entries, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    manifest.append('- [Structured contents index](./contents-index.json)')

    for index, (slug, title, printed_start, printed_end) in enumerate(CHAPTERS):
        pdf_start = printed_start + 11
        pdf_end = (printed_end + 11) if printed_end else len(reader.pages)
        pages = []
        for pdf_page in range(pdf_start, min(pdf_end, len(reader.pages) + 1)):
            text = clean(reader.pages[pdf_page - 1].extract_text() or '')
            if text:
                pages.append(f'<!-- PDF page {pdf_page} -->\n\n{text}')
        chapter_text = f'# {title}\n\n' + '\n\n'.join(pages) + '\n'
        (OUT / f'{slug}.md').write_text(chapter_text, encoding='utf-8')
        all_text.append(chapter_text)
        end_label = str(printed_end) if printed_end else 'end'
        manifest.append(f'- [{title}](./{slug}.md) — printed pages {printed_start}–{end_label}; PDF pages {pdf_start}–{pdf_end}')

    (OUT / 'README.md').write_text('\n'.join(manifest) + '\n', encoding='utf-8')
    (OUT / 'modernist-cuisine-volume-6-pages-6-onward.md').write_text('\n\n'.join(all_text), encoding='utf-8')
    layout_pdf.close()


if __name__ == '__main__':
    main()
