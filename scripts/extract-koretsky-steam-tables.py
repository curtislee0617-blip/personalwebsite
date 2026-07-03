"""Extract Koretsky Appendix B water tables into a compact website data file."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import pdfplumber


SOURCE = Path(sys.argv[1])
OUTPUT = Path(sys.argv[2])
NUMBER = re.compile(r"^(?:sat|[-+]?\.?\d[\d.]*)$")
SUPERHEATED_PRESSURES = [
    [0.01, 0.05, 0.1, 0.2, 0.3, 0.4],
    [0.5, 0.6, 0.8, 1, 1.2, 1.4],
    [1.6, 1.8, 2, 2.5, 3, 3.5],
    [4, 4.5, 5, 6, 7, 8],
    [9, 10, 12.5, 15, 17.5, 20],
    [25, 30, 35, 40, 50, 60],
]
SUBCOOLED_PRESSURES = [5, 10, 15, 20, 30, 50]


def table_rows(page, x_bounds, y_bounds, allow_sat=False):
    words = page.extract_words(x_tolerance=1, y_tolerance=1)
    rows = {}
    for word in words:
        if x_bounds[0] <= word["x0"] < x_bounds[1] and y_bounds[0] <= word["top"] < y_bounds[1]:
            rows.setdefault(round(word["top"], 1), []).append(word)

    parsed = []
    for words_at_y in rows.values():
        tokens = [word["text"] for word in sorted(words_at_y, key=lambda item: item["x0"])]
        if len(tokens) != 5 or not all(NUMBER.match(token) for token in tokens):
            continue
        if tokens[0] == "sat" and not allow_sat:
            continue
        parsed.append(tokens)
    return parsed


def saturation_rows(pdf):
    result = []
    for page_number in (2, 3):
        text = pdf.pages[page_number - 1].extract_text(x_tolerance=1, y_tolerance=2) or ""
        for line in text.splitlines():
            tokens = line.split()
            if len(tokens) < 12:
                continue
            try:
                temperature = float(tokens[0])
                pressure = float(tokens[1])
            except ValueError:
                continue
            if not (0 <= temperature <= 374.14):
                continue
            if page_number == 2 and temperature < 100:
                pressure /= 1000
            result.append({"t": temperature, "p": pressure})
    return sorted({row["t"]: row for row in result}.values(), key=lambda row: row["t"])


def saturation_temperature(pressure, saturation):
    for left, right in zip(saturation, saturation[1:]):
        if left["p"] <= pressure <= right["p"]:
            fraction = (pressure - left["p"]) / (right["p"] - left["p"])
            return left["t"] + fraction * (right["t"] - left["t"])
    raise ValueError(f"No saturation temperature available at {pressure} MPa")


def values(tokens, temperature):
    return {
        "t": round(temperature, 5),
        "v": float(tokens[1]),
        "u": float(tokens[2]),
        "h": float(tokens[3]),
        "s": float(tokens[4]),
    }


with pdfplumber.open(SOURCE) as pdf:
    saturation = saturation_rows(pdf)
    superheated = []
    superheated_x = [(90, 280), (295, 485), (500, 700)]
    superheated_y = [(130, 325), (335, 570)]

    for page_offset, page_number in enumerate(range(7, 13)):
        page = pdf.pages[page_number - 1]
        for half, y_bounds in enumerate(superheated_y):
            for column, x_bounds in enumerate(superheated_x):
                pressure = SUPERHEATED_PRESSURES[page_offset][half * 3 + column]
                rows = table_rows(page, x_bounds, y_bounds, allow_sat=True)
                points = []
                for row in rows:
                    if row[0] == "sat":
                        temperature = saturation_temperature(pressure, saturation)
                    else:
                        temperature = float(row[0])
                    point = values(row, temperature)
                    if pressure == 7 and temperature == 450 and point["u"] == 2077.9:
                        point["u"] = 2977.9
                    points.append(point)
                superheated.append({"p": pressure, "points": points})

    page = pdf.pages[12]
    subcooled = []
    subcooled_x = [(90, 280), (290, 480), (485, 700)]
    subcooled_y = [(125, 335), (345, 570)]
    for half, y_bounds in enumerate(subcooled_y):
        for column, x_bounds in enumerate(subcooled_x):
            pressure = SUBCOOLED_PRESSURES[half * 3 + column]
            rows = table_rows(page, x_bounds, y_bounds)
            points = [values(row, float(row[0])) for row in rows]
            if pressure == 50 and points and points[0]["t"] != 0:
                points.insert(0, {"t": 0, "v": 0.0009766, "u": 0.20, "h": 49.03, "s": -0.0014})
            subcooled.append({"p": pressure, "points": points})

payload = {
    "source": "Milo D. Koretsky, Engineering and Chemical Thermodynamics, Appendix B, Tables B.4 and B.5",
    "units": {"p": "MPa", "t": "°C", "v": "m³/kg", "u": "kJ/kg", "h": "kJ/kg", "s": "kJ/(kg·K)"},
    "saturation": saturation,
    "superheated": superheated,
    "subcooled": subcooled,
}

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text(json.dumps(payload, separators=(",", ":")))
print(f"Wrote {OUTPUT} with {sum(len(item['points']) for item in superheated)} superheated and "
      f"{sum(len(item['points']) for item in subcooled)} subcooled points.")
