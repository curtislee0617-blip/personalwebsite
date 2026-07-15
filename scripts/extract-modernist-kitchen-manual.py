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

import numpy as np
import pypdf
import pdfplumber
from PIL import Image


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
    ('chapter-15-emulsions', 'Chapter 15 — Emulsions', 296, 311),
    ('chapter-16-foams', 'Chapter 16 — Foams', 312, 349),
    ('chapter-18-coffee', 'Chapter 18 — Coffee', 350, 351),
    ('reference-tables', 'Reference Tables', 352, None),
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


STEP_MARKER = re.compile(r'^(?:CD|<D|\[\)|\(!\)|\(?[0O®@©Jj]\)?|[①②③④⑤⑥⑦⑧⑨⑩])\s*')
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


def repair_ocr_number(value: str) -> str:
    value = re.sub(r'[lIJ]', '1', value)
    value = re.sub(r'[oO]', '0', value)
    value = re.sub(r'[sS]', '5', value)
    return re.sub(r'[bB]', '8', value)


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
    value = re.sub(r'\b80i\s*l\b', 'boil', value, flags=re.I)
    value = re.sub(r'\b5i\s*l\s*ica\b', 'silica', value, flags=re.I)
    value = re.sub(r'\b5i\s*l\s*icone\b', 'silicone', value, flags=re.I)
    value = re.sub(r'\b5i\s*l\s*ky\b', 'silky', value, flags=re.I)
    value = re.sub(r'\b50i\s*l\b', 'soil', value, flags=re.I)
    value = re.sub(
        r'\b([0-9lIJSOoB]{2,})\s+([0-9]{2,3})\s*[°º\'”"]?\s*F\b',
        lambda match: f'{repair_ocr_number(match.group(1))} °C / {match.group(2)} °F',
        value,
        flags=re.I,
    )
    value = re.sub(
        r'\b([0-9lIJSOoB]{2,})\s*[°º\'”"]\s*([CF])(?=\b|oil\b)',
        lambda match: f'{repair_ocr_number(match.group(1))} °{match.group(2).upper()}',
        value,
    )
    value = re.sub(r'(?i)\b(for|about|of|at)l(?=\s*(?:bar|h|min|d|s|kg|mg|mcg|g|ml|l|lb|oz)\b)', r'\1 1', value)
    value = re.sub(r'(?i)(?<=[a-z])for(?=\d)', ' for ', value)
    value = re.sub(r'(?i)(?<=[a-z])forl(?=\s*(?:h|min|d)\b)', ' for 1', value)
    value = re.sub(r'(?i)\b(for|about|at|seal|additional|remaining|fill|layer|four|cylinder|or|heat)(?=\d)', r'\1 ', value)
    value = re.sub(r'(?i)\badditiona1(?=\d\s*[YV])', 'additional ', value)
    value = re.sub(r'(?i)\badditiona(?=\d)', 'additional ', value)
    value = re.sub(r'(?<=\d)(?=(?:min|h|d|s)\b)', ' ', value, flags=re.I)
    value = re.sub(r'(?<=\d)(?=g\b)', ' ', value, flags=re.I)
    value = re.sub(r'(?<=\d)(?=(?:psi|bar|cm|mm|mbar|torr|kHz|W)\b)', ' ', value, flags=re.I)
    value = re.sub(r'(?<=\d)\s*(?:[·•°\']|[oO])\s*[cC]\b', ' °C', value)
    value = re.sub(r'(?<=\d)\s*(?:[\'”“°]|[oO])\s*[fF]\b', ' °F', value)
    value = re.sub(r'(?i)(\d)\s*[YV]\s*2\b', r'\1½', value)
    value = re.sub(r'(?i)(\d)\s*[YV][.,\'’]?\s+(?=(?:h|in\.?|kg)\b)', r'\1½ ', value)
    value = re.sub(r'(?<=°C)\s*[1Il]\s*(?=\d+\s*°F\b)', ' / ', value)
    value = re.sub(r'(?<=\bbar)\s*[1Il]\s*(?=\d+\s*psi\b)', ' / ', value)
    value = re.sub(
        r'\b([0-9lIJSOoB]{2,})\s*[°º]\s*([CF])(?=\b|oil\b)',
        lambda match: f'{repair_ocr_number(match.group(1))} °{match.group(2).upper()}',
        value,
    )
    value = re.sub(r'\s+[lI]\s+(?=\d)', ' / ', value)
    value = re.sub(r'(?<=\d)\s+em\b', ' cm', value, flags=re.I)
    value = re.sub(r'\b21[/\\>]?>?\s*h\b', '2½ h', value)
    value = re.sub(r'\b1[\]}]<?\s*(?=(?:h|in\.?)\b)', '1¼ ', value)
    value = re.sub(r'\b([0-9]+)\s*[Yy]\s*[zZ]\b', r'\1½', value)
    value = re.sub(r'\b([0-9]+)\s*[Yy]\s*,\b', r'\1½', value)
    value = re.sub(r'\b([0-9]+)\s*[Yy]\s*,(?=\s)', r'\1½', value)
    value = re.sub(
        r'(?i)\b([0-9lIJSOoB]*\d[0-9lIJSOoB]*(?:[.,][0-9lIJSOoB]+)?)\s*(kg|mg|mcg|g|ml|mL|L|lb|oz)\b',
        _repair_quantity_match,
        value,
    )
    value = re.sub(r'(?i)\bSaute\b', 'Sauté', value)
    value = re.sub(r'(?i)([°º]\s*F)(?=oil\b)', r'\1 ', value)
    value = re.sub(r'^(?:<D|\[\)|\(!\))\s*', '', value)
    value = repair_broken_words(value)
    post_repairs = {
        'alow': 'a low', 'ona': 'on a', 'asa': 'as a', 'apiece': 'a piece',
        "it'snot": "it's not", 'anda': 'and a', 'goa': 'go a',
        'Th is': 'This', 'grill- ing': 'grilling', 'compou nds': 'compounds',
        'Chem ists': 'Chemists', 'temper atures': 'temperatures',
        'flu id': 'fluid', 'add ing': 'adding',
        'layerl.5': 'layer 1.5',
    }
    for source, target in post_repairs.items():
        value = re.sub(rf'\b{re.escape(source)}\b', target, value, flags=re.I)
    value = re.sub(r'(?i)\btoa\b', 'to a', value)
    value = re.sub(r'(?i)(?<=[a-z])for(?=\s+\d)', ' for', value)
    value = re.sub(r'\s+in the table below refer.*$', '', value, flags=re.I)
    value = re.sub(
        r'(\d+)\s*°C\s*1\s*(\d+)\s*bath to core\s*°F\s*temperature',
        r'\1 °C / \2 °F bath to core temperature',
        value,
        flags=re.I,
    )
    value = value.replace('1]4', '1¼').replace('1 Y>', '1½')
    value = re.sub(r'(?<=\d\s(?:cm|mm))\s*[I1]\s*(?=1¼\b)', ' / ', value)
    dimension_repairs = {
        '1 mm I){. in': '1 mm / 1/16 in',
        '1 mm I ){6 in': '1 mm / 1/16 in',
        '1 mm I ){ 6 in': '1 mm / 1/16 in',
        '1 mm I ){, in': '1 mm / 1/16 in',
        '2 mm I ){, in': '2 mm / 1/16 in',
        '1.5 mm I ){6 in': '1.5 mm / 1/16 in',
        "8 mm I '}i'Gin": '8 mm / 5/16 in',
    }
    for source, target in dimension_repairs.items():
        value = value.replace(source, target)
    value = value.replace('{Brown Ribbon', '(Brown Ribbon').replace('{National Starch', '(National Starch')
    value = re.sub(r'(?i)([°º]\s*F)(?=oil\b)', r'\1 ', value)
    value = re.sub(
        r'(?i)\b(page\s+\d+[·-])([0-9lIJSOoB]+)\b',
        lambda match: f'{match.group(1)}{repair_ocr_number(match.group(2))}',
        value,
    )
    value = re.sub(r'(?i)\bpage\s+[lI](\d{1,2})\b', lambda match: f'page 1{match.group(1)}', value)
    value = re.sub(r'(?i)\bpage\s+([1-5])(\d{3})\b', r'page \1·\2', value)
    value = value.replace('(sweet}', '(sweet)')
    value = re.sub(r'(?<=[A-Za-z])\(', ' (', value)
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
        'Cand lenuts': 'Candlenuts', 'shal lots': 'shallots',
        'Neutral 0i l': 'Neutral oil', '0i l': 'oil',
        'jam6n Ib e rico': 'jamón ibérico',
        'Shoyusoysauce': 'Shoyu soy sauce',
        'so us vid e': 'sous vide', 'so us': 'sous', 'vid e': 'vide',
        'Roasttogethe r': 'Roast together', 'd issolved': 'dissolved',
        'ge lled': 'gelled', 'air cool ing': 'air cooling',
        'scorch ing': 'scorching', 'surround ing': 'surrounding',
        'goa long': 'go a long', 'anda small': 'and a small',
        'asa seasoning': 'as a seasoning', 'd ilu ted': 'diluted',
        'Austral ian': 'Australian', 'accept able': 'acceptable',
        'cal led': 'called', 'rep lace': 'replace', 'a very': 'a very',
        'abo ut': 'about', 'additiona l': 'additional',
        'ata frequency': 'at a frequency', 'adry': 'a dry',
        'ona flaming': 'on a flaming', "it'snot": "it's not",
        'apiece of meat': 'a piece of meat',
        'toa boil': 'to a boil', 'fora smoother': 'for a smoother',
        'avery fine': 'a very fine', 'o i l': 'oil',
        'fall ing': 'falling', 'w i1 l': 'will',
        'Av i eel': 'Avicel', 'Avice I': 'Avicel',
        'de}eunes': 'de Jeunes', 'Gargouil/ou': 'Gargouillou',
        'alow': 'a low', 'ch icke n': 'chicken',
        'store- bought': 'store-bought',
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
    value = re.sub(
        r'(?i)\b([0-9lIJSOoB]+(?:[.,][0-9lIJSOoB]+)?)\s*(kg|mg|mcg|g|ml|mL|L|lb|oz)\b',
        _repair_quantity_match,
        value,
    )
    value = re.sub(r'\bas\s+neede\s*d\b', 'as needed', value, flags=re.I)
    value = re.sub(r'\bto\s+tast\s*e\b', 'to taste', value, flags=re.I)
    return re.sub(r'\s+', ' ', value).strip()


def _repair_quantity_match(match: re.Match[str]) -> str:
    number = repair_ocr_number(match.group(1))
    unit = match.group(2)
    unit = 'mL' if unit.lower() == 'ml' else unit.lower() if unit != 'L' else 'L'
    return f'{number} {unit}'


def smart_title(value: str) -> str:
    value = re.sub(r'^CHAPTER\s*\d+\s*:\s*[A-Z ]+?\s+\d+\s+', '', value, flags=re.I)
    value = re.sub(r'^REFERENCE TABLES?\s+\d+\s+', '', value, flags=re.I)
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
    value = re.sub(r'\bBAY\s+LEA£', 'BAY LEAF', value, flags=re.I)
    value = re.sub(r'\bMAS\s+ALA\b', 'MASALA', value, flags=re.I)
    value = re.sub(r'\bPASTA\s+VEI1\b', 'PASTA VEIL', value, flags=re.I)
    value = re.sub(r'\bPEA\s*JUICE\b', 'PEA JUICE', value, flags=re.I)
    value = re.sub(r'\bPRAWN\s*JUS\b', 'PRAWN JUS', value, flags=re.I)
    value = re.sub(r'\bVEGETABLE\s*JUS\b', 'VEGETABLE JUS', value, flags=re.I)
    value = re.sub(r'\bBEEF\s*JUICE\b', 'BEEF JUICE', value, flags=re.I)
    value = re.sub(r'\bBBQ\s*CARAMELS\b', 'BBQ CARAMELS', value, flags=re.I)
    replacements = {
        'FRAJCHE': 'FRAÎCHE', 'FRALCHE': 'FRAÎCHE', 'FRAICHE': 'FRAÎCHE',
        'CREMEUX': 'CRÉMEUX', 'CREME': 'CRÈME',
        'CONSOMME': 'CONSOMMÉ', 'PUREE': 'PURÉE', 'BECHAMEL': 'BÉCHAMEL',
        'PUREES': 'PURÉES', 'PAVE': 'PAVÉ', 'SOUFFLEES': 'SOUFFLÉES',
        'SOUFFLE': 'SOUFFLÉ', 'BRIILEE': 'BRÛLÉE', 'BRULEE': 'BRÛLÉE',
        'GELEE': 'GELÉE',
        'PATE': 'PÂTE', 'EPICES': 'ÉPICES', 'GRUYERE': 'GRUYÈRE',
        'REMOULADE': 'RÉMOULADE', 'SABLE': 'SABLÉ',
    }
    for source, target in replacements.items():
        value = re.sub(rf'\b{source}\b', target, value, flags=re.I)
    titled = value.lower().title()
    for word in ('And', 'Or', 'With', 'For', 'In', 'Of', 'On', 'The', 'A', 'An', 'Au', 'De', 'En', 'La', 'To'):
        titled = re.sub(rf'(?<!^)\b{word}\b', word.lower(), titled)
    titled = re.sub(r"([’'])S\b", r"\1s", titled)
    titled = re.sub(r"(?<!^)\bD'", "d'", titled)
    titled = re.sub(r'\bSous Vide\b', 'Sous Vide', titled)
    titled = re.sub(r'\bPh\b', 'pH', titled)
    titled = re.sub(r'\bP H\b', 'pH', titled)
    titled = re.sub(r'\bCvap\b', 'CVap', titled)
    titled = re.sub(r'\bBbq\b', 'BBQ', titled)
    titled = re.sub(r'\bKc\b', 'KC', titled)
    titled = re.sub(r'\bDe(?=\d)', 'DE', titled)
    titled = re.sub(r'\bDmf\b', 'DMF', titled)
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
    chapter_ranges = [
        ('chapter-08', 2, 5),
        ('chapter-10', 6, 63),
        ('chapter-11', 64, 137),
        ('chapter-12', 138, 199),
        ('chapter-13', 200, 231),
        ('chapter-14', 232, 295),
        ('chapter-15', 296, 311),
        ('chapter-16', 312, 349),
        ('chapter-18', 350, 351),
        ('reference-tables', 352, 999),
    ]
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
                    title = re.sub(r'^CHAPTER\s*\d+\s*:\s*[A-Z ]+?\s+\d+\s+', '', title, flags=re.I)
                    title = re.sub(r'^REFERENCE TABLES?\s+\d+\s+', '', title, flags=re.I)
                    continuation = []
                    page_text_value = match.group(2).replace('l', '1').replace('I', '1').replace('O', '0')
                    if not title or not page_text_value.isdigit():
                        continue
                    printed_page = int(page_text_value)
                    chapter = next((identifier for identifier, start, end in chapter_ranges if start <= printed_page <= end), None)
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


def plausible_sidebar_note(value: str) -> bool:
    """Keep complete commentary paragraphs and reject clipped adjacent columns."""
    if len(value) < 30 or not re.match(r'^[A-Z“"]', value):
        return False
    if re.match(r'^[A-Z]\s+[A-Z]\b', value):
        return False
    if re.search(r'\b(?:Yields?|INGREDIENT|QUANTITY|PROCEDURE)\b', value, re.I):
        return False
    return bool(re.search(r'[.!?”)]$', value))


def detect_horizontal_rules(
    image_path: Path | None,
    page_width: float,
    image_top: float,
    ingredient_x: float,
    procedure_x: float,
    procedure_right: float,
    sidebar_start: float | None,
    region_top: float,
    region_bottom: float,
) -> list[float]:
    """Read the printed table rules from the raster page crop.

    Each PDF page is a scan with an OCR text layer, so pdfplumber has no vector
    line objects to inspect. Long, nearly continuous dark runs are instead
    detected in the recipe-grid span. Text never fills 82% of a wide moving
    window, while the solid component rules do.
    """
    if image_path is None or not image_path.exists():
        return []
    try:
        with Image.open(image_path) as source:
            gray = np.asarray(source.convert('L'))
    except (OSError, ValueError):
        return []
    if gray.ndim != 2 or gray.shape[0] < 12 or gray.shape[1] < 80:
        return []

    scale = gray.shape[1] / page_width
    x0 = max(0, round((ingredient_x - 2) * scale))
    estimated_right = sidebar_start - 4 if sidebar_start is not None else procedure_right + 4
    x1 = min(gray.shape[1], round(max(procedure_x + 90, estimated_right) * scale))
    if x1 - x0 < 80:
        return []

    dark = gray[:, x0:x1] < 210
    window = max(30, round(dark.shape[1] * 0.34))
    cumulative = np.pad(np.cumsum(dark, axis=1), ((0, 0), (1, 0)))
    window_sums = cumulative[:, window:] - cumulative[:, :-window]
    density = window_sums.max(axis=1) / window
    candidate_rows = np.flatnonzero(density >= 0.82).tolist()
    if not candidate_rows:
        return []

    groups: list[list[int]] = []
    for row in candidate_rows:
        if not groups or row - groups[-1][-1] > 2:
            groups.append([row])
        else:
            groups[-1].append(row)

    rules: list[float] = []
    for group in groups:
        row = max(group, key=lambda candidate: float(density[candidate]))
        page_y = image_top + row / scale
        if region_top - 4 <= page_y <= region_bottom + 3:
            rules.append(round(page_y, 2))
    return rules


def public_ingredient(ingredient: dict[str, object]) -> dict[str, object]:
    return {
        key: value
        for key, value in ingredient.items()
        if not key.startswith('_')
    }


def component_output_name(ingredient_name: str) -> str | None:
    match = re.match(r'^(.*?)(?:,?\s*\(?from above\)?)(?:\s|$)', ingredient_name, re.I)
    if not match:
        return None
    name = re.sub(r'\s+', ' ', match.group(1)).strip(' ,()')
    return smart_title(name) if name else None


def build_component_groups(
    title: str,
    ingredients: list[dict[str, object]],
    steps: list[dict[str, object]],
    rules: list[float],
    region_top: float,
    region_bottom: float,
) -> list[dict[str, object]]:
    """Group ingredient rows and method steps by the printed horizontal rules."""
    grouped: dict[int, dict[str, object]] = {}

    def row_center(row: dict[str, object]) -> float:
        if '_anchor' in row:
            return float(row['_anchor'])
        top = float(row.get('_top', region_top))
        return (top + float(row.get('_bottom', top))) / 2

    def group_for(anchor: float) -> dict[str, object]:
        band = sum(rule < anchor for rule in rules)
        return grouped.setdefault(band, {'band': band, 'ingredients': [], 'steps': [], '_anchors': []})

    for ingredient in ingredients:
        anchor = row_center(ingredient)
        group = group_for(anchor)
        group['ingredients'].append(public_ingredient(ingredient))  # type: ignore[union-attr]
        group['_anchors'].append(anchor)  # type: ignore[union-attr]
    for step in steps:
        anchor = row_center(step)
        group = group_for(anchor)
        group['steps'].append({  # type: ignore[union-attr]
            'number': int(step.get('number', 0)),
            'text': str(step.get('text', '')),
        })
        group['_anchors'].append(anchor)  # type: ignore[union-attr]

    components = [grouped[key] for key in sorted(grouped) if grouped[key]['ingredients'] or grouped[key]['steps']]
    for index, component in enumerate(components):
        component_ingredients = component['ingredients']
        headings = [
            str(ingredient.get('name', ''))
            for ingredient in component_ingredients  # type: ignore[union-attr]
            if ingredient.get('heading')
        ]
        inferred_output = None
        if index + 1 < len(components):
            for next_ingredient in components[index + 1]['ingredients']:  # type: ignore[union-attr]
                inferred_output = component_output_name(str(next_ingredient.get('name', '')))
                if inferred_output:
                    break
        if len(components) == 1:
            name = smart_title(title)
            name_source = 'recipe title'
        elif headings:
            name = smart_title(headings[0])
            name_source = 'printed heading'
        elif inferred_output:
            name = inferred_output
            name_source = 'next-band from-above ingredient'
        elif index == len(components) - 1:
            name = smart_title(title)
            name_source = 'recipe title'
        else:
            ingredient_labels = [
                re.sub(r'\s*\([^)]*\)\s*', '', str(ingredient.get('name', '')))
                .split(',', maxsplit=1)[0]
                .strip(' ,')
                for ingredient in component_ingredients  # type: ignore[union-attr]
                if not ingredient.get('heading')
            ]
            ingredient_labels = [label for label in ingredient_labels if label]
            if ingredient_labels:
                name = ' + '.join(smart_title(label) for label in ingredient_labels[:2])
                name_source = 'ingredient band'
            else:
                name = f'Component {index + 1}'
                name_source = 'rule sequence'

        anchors = [float(anchor) for anchor in component.pop('_anchors')]
        upper_rules = [rule for rule in rules if rule < min(anchors)]
        lower_rules = [rule for rule in rules if rule > max(anchors)]
        component['name'] = name
        component['nameSource'] = name_source
        component['sourceBand'] = {
            'top': round(max(upper_rules) if upper_rules else region_top, 2),
            'bottom': round(min(lower_rules) if lower_rules else region_bottom, 2),
        }
        component.pop('band', None)
    return components


def parse_page_geometry(
    page: pdfplumber.page.Page,
    title: str,
    top: float,
    bottom: float,
    source_image_path: Path | None = None,
    source_image_top: float | None = None,
) -> dict[str, object]:
    words = page.extract_words(x_tolerance=1, y_tolerance=2, keep_blank_chars=False)
    full_region = [word for word in words if top <= float(word['top']) < bottom]
    full_lines = group_word_lines(full_region)
    full_headers = [
        line for line in full_lines
        if {'INGREDIENT', 'QUANTITY', 'PROCEDURE'}.issubset({str(word['text']).upper() for word in line})
    ]
    sidebar_starts: list[float] = []
    grid_left = 0.0
    if len(full_headers) == 1:
        header_hint = full_headers[0]
        grid_left = next(
            float(word['x0']) for word in header_hint if str(word['text']).upper() == 'INGREDIENT'
        ) - 4
        procedure_hint = next(
            float(word['x0']) for word in header_hint if str(word['text']).upper() == 'PROCEDURE'
        )
        header_hint_top = min(float(word['top']) for word in header_hint)
        for line in full_lines:
            line_start = min(float(word['x0']) for word in line)
            line_top = min(float(word['top']) for word in line)
            if line_top > header_hint_top + 5 and line_start > procedure_hint + 100:
                sidebar_starts.append(line_start)
    sidebar_start_hint = min(sidebar_starts) if sidebar_starts else None
    grid_cutoff = sidebar_start_hint - 2 if sidebar_start_hint is not None else float(page.width)
    region = [word for word in full_region if grid_left <= float(word['x0']) < grid_cutoff]
    sidebar_region = [
        word for word in full_region
        if float(word['x0']) < grid_left or float(word['x0']) >= grid_cutoff
    ]
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

    reference_lines = [clean_ocr(line_text(line)) for line in full_lines[1:] if line_text(line)]
    if len(headers) != 1:
        reason = 'no regular recipe grid' if not headers else 'multiple recipe grids'
        return {
            'yield': yield_text,
            'ingredients': [],
            'steps': [],
            'components': [],
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
                    'components': [],
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
    sidebar_start = grid_cutoff if sidebar_region else None
    ingredients: list[dict[str, object]] = []
    step_rows: list[dict[str, object]] = []
    notes: list[str] = []
    sidebar_notes = [
        clean_ocr(line_text(line))
        for line in group_word_lines(sidebar_region)
        if line_text(line)
    ]
    pending_references: list[tuple[int, str, float]] = []
    marker_count = 0
    note_mode = False
    procedure_right = procedure_x + 90

    for line in body_lines:
        line_top = min(float(word['top']) for word in line)
        line_bottom = max(float(word['bottom']) for word in line)
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
        if procedure_words:
            procedure_right = max(procedure_right, max(float(word['x1']) for word in procedure_words))
        sidebar_text = clean_ocr(' '.join(filter(None, [line_text(left_sidebar_words), line_text(right_sidebar_words)])))
        if sidebar_text:
            sidebar_notes.append(sidebar_text)
        ingredient_text = clean_ocr(line_text(ingredient_words))
        quantity_text = clean_quantity(line_text(quantity_words))
        procedure_text = clean_ocr(line_text(procedure_words))

        if ingredient_text:
            if re.match(r'^(?:see|from) page\b', ingredient_text, re.I) and ingredients:
                pending_references.append((len(ingredients) - 1, ingredient_text, line_top))
            elif quantity_text:
                ingredients.append({
                    'name': ingredient_text,
                    'quantity': quantity_text,
                    '_top': line_top,
                    '_bottom': line_bottom,
                    '_anchor': (line_top + line_bottom) / 2,
                })
            elif (
                (ingredient_text[:1].isupper() and STEP_MARKER.match(procedure_text))
                or normalize_title(ingredient_text) in {'salt', 'pepper', 'black pepper', 'flaky sea salt'}
            ):
                ingredients.append({
                    'name': ingredient_text,
                    'quantity': '',
                    '_implicit_quantity': True,
                    '_top': line_top,
                    '_bottom': line_bottom,
                    '_anchor': (line_top + line_bottom) / 2,
                })
            elif is_ingredient_heading(ingredient_text):
                ingredients.append({
                    'name': smart_title(ingredient_text),
                    'quantity': '',
                    'heading': True,
                    '_top': line_top,
                    '_bottom': line_bottom,
                    '_anchor': (line_top + line_bottom) / 2,
                })
            elif ingredients:
                ingredients[-1]['name'] = clean_ocr(f"{ingredients[-1]['name']} {ingredient_text}")
                ingredients[-1]['_bottom'] = line_bottom
            else:
                ingredients.append({
                    'name': ingredient_text,
                    'quantity': '',
                    '_top': line_top,
                    '_bottom': line_bottom,
                    '_anchor': (line_top + line_bottom) / 2,
                })
        elif quantity_text and ingredients:
            ingredients[-1]['quantity'] = clean_quantity(f"{ingredients[-1]['quantity']} {quantity_text}")
            ingredients[-1]['_bottom'] = line_bottom

        if procedure_text:
            marker = STEP_MARKER.match(procedure_text)
            if marker:
                marker_count += 1
                procedure_text = STEP_MARKER.sub('', procedure_text, count=1).strip()
                if procedure_text:
                    step_rows.append({
                        'number': marker_count,
                        'text': procedure_text,
                        '_top': line_top,
                        '_bottom': line_bottom,
                        '_anchor': (line_top + line_bottom) / 2,
                    })
            elif step_rows:
                step_rows[-1]['text'] = clean_ocr(f"{step_rows[-1]['text']} {procedure_text}")
                step_rows[-1]['_bottom'] = line_bottom
            else:
                step_rows.append({
                    'number': 1,
                    'text': procedure_text,
                    '_top': line_top,
                    '_bottom': line_bottom,
                    '_anchor': (line_top + line_bottom) / 2,
                })

    rules = detect_horizontal_rules(
        source_image_path,
        float(page.width),
        source_image_top if source_image_top is not None else top,
        ingredient_x,
        procedure_x,
        procedure_right,
        sidebar_start,
        header_top,
        bottom,
    )

    for ingredient_index, reference, reference_top in pending_references:
        ingredient = ingredients[ingredient_index]
        if re.match(r'^from page\b', reference, re.I):
            notes.append(reference)
            continue
        ingredient_anchor = float(ingredient.get('_anchor', ingredient.get('_top', reference_top)))
        if any(ingredient_anchor < rule < reference_top for rule in rules):
            notes.append(reference)
        else:
            ingredient['name'] = clean_ocr(f"{ingredient['name']} ({reference})")

    if sidebar_notes:
        sidebar_note = clean_ocr(' '.join(sidebar_notes))
        if plausible_sidebar_note(sidebar_note):
            notes.append(sidebar_note)

    regular_ingredients = [ingredient for ingredient in ingredients if not ingredient.get('heading')]
    steps = [str(step['text']) for step in step_rows]
    invalid_quantities = [
        str(ingredient.get('quantity', '')) for ingredient in regular_ingredients
        if not ingredient.get('_implicit_quantity') and not valid_quantity(str(ingredient.get('quantity', '')))
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
            'components': [],
            'notes': notes,
            'reference': reference_lines,
            'sourceKind': 'reference',
            'isRecipe': True,
            'layoutKind': 'facsimile',
            'layoutReason': ', '.join(dict.fromkeys(reasons)),
        }

    return {
        'yield': yield_text,
        'ingredients': [public_ingredient(ingredient) for ingredient in ingredients],
        'steps': steps,
        'components': build_component_groups(
            title,
            ingredients,
            step_rows,
            rules,
            header_top,
            bottom,
        ),
        'notes': notes,
        'reference': [],
        'sourceKind': 'recipe',
        'isRecipe': True,
        'layoutKind': 'structured',
        'layoutReason': 'rule-aware ingredient and procedure grid',
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
            slug = re.sub(r'[^a-z0-9]+', '-', str(entry['displayTitle']).lower()).strip('-')[:72]
            filename = f'p{printed_page:03d}-{index + 1:02d}-{slug}.webp'
            image_path = SOURCE_IMAGES / filename
            if args.skip_images:
                existing_crops = sorted(SOURCE_IMAGES.glob(f'p{printed_page:03d}-{index + 1:02d}-*.webp'))
                if len(existing_crops) == 1:
                    image_path = existing_crops[0]
                    filename = image_path.name
            crop_top = max(0, round((top - 7) * image_scale))
            page_image_height = round(float(page.height) * image_scale)
            crop_bottom = min(page_image_height, round((bottom + 4) * image_scale))
            crop_width = round(float(page.width) * image_scale)
            crop_height = crop_bottom - crop_top
            if page_image is not None:
                crop = page_image.crop((0, crop_top, page_image.width, crop_bottom))
                crop.save(image_path, 'WEBP', quality=90, method=6)
                crop_width, crop_height = crop.size
            entry.update(parse_page_geometry(
                page,
                str(entry['title']),
                top,
                bottom,
                image_path,
                crop_top / image_scale,
            ))
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
