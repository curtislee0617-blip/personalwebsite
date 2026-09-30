"""Re-export saved Bokeh data without executing any notebook code.

Usage: python scripts/refresh-bi1x-figures.py /path/to/Bi1x
Requires numpy, matplotlib and Pillow. Original notebooks are read-only.
"""
import base64
import json
import re
import sys
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(sys.argv[1])
ASSETS = ROOT / "public/bi1x/images"
plt.rcParams.update({"font.size": 10, "axes.labelsize": 11, "legend.fontsize": 8,
                     "axes.spines.top": False, "axes.spines.right": False})


def walk(value):
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from walk(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk(child)


def scalar(value, default=None):
    return value.get("value", default) if isinstance(value, dict) else value


def decode(value):
    if isinstance(value, dict) and value.get("type") == "ndarray":
        data = value["array"]
        if isinstance(data, dict) and data.get("type") == "bytes":
            dtype = np.dtype(value["dtype"]).newbyteorder("<" if value.get("order", "little") == "little" else ">")
            array = np.frombuffer(base64.b64decode(data["data"]), dtype=dtype)
        else:
            array = np.asarray(data)
        return array.reshape(value.get("shape", array.shape))
    return np.asarray(value)


def documents(cell):
    for output in cell.get("outputs", []):
        js = output.get("data", {}).get("application/javascript", "")
        js = "".join(js) if isinstance(js, list) else js
        match = re.search(r"const docs_json = (.*?);\n  const render_items", js, re.S)
        if match:
            yield from json.loads(match[1]).values()


def render_document(document, slug, cell_index, output_index):
    models = {o["id"]: o for o in walk(document) if "id" in o and "name" in o}

    def resolve(model):
        return models.get(model.get("id"), model) if isinstance(model, dict) else {}

    def attrs(model):
        return resolve(model).get("attributes", {})

    figures = [model for model in models.values() if model["name"] == "Figure"]
    outputs = []
    for figure_index, figure in enumerate(figures):
        a = attrs(figure)
        title = attrs(a.get("title", {})).get("text", "")
        fig, ax = plt.subplots(figsize=(8.2, 4.8), dpi=170, layout="constrained")
        legend_labels = {}
        # Legends belong to this figure, not to every sibling in a Tabs layout.
        for side in ("center", "above", "below", "left", "right"):
            for model in a.get(side, []):
                if resolve(model).get("name") == "Legend":
                    for item in attrs(model).get("items", []):
                        item_a = attrs(item)
                        label = scalar(item_a.get("label"), "")
                        for renderer in item_a.get("renderers", []):
                            legend_labels[renderer["id"]] = label

        categories = {}
        for axis in ("x", "y"):
            range_model = resolve(a.get(f"{axis}_range", {}))
            range_a = attrs(range_model)
            if range_model.get("name") == "FactorRange":
                categories[axis] = range_a["factors"]
            if resolve(a.get(f"{axis}_scale", {})).get("name") == "LogScale":
                getattr(ax, f"set_{axis}scale")("log")

        drawn, point_count = 0, 0
        seen_labels = set()
        for renderer_ref in a.get("renderers", []):
            renderer = resolve(renderer_ref)
            if renderer.get("name") != "GlyphRenderer":
                continue
            r = attrs(renderer)
            glyph = resolve(r.get("glyph", {}))
            g = attrs(glyph)
            source = dict(attrs(r["data_source"])["data"]["entries"])
            kind = glyph.get("name")
            if kind not in ("Line", "Scatter", "Circle", "Step"):
                raise ValueError(f"Unsupported saved glyph {kind} in {slug} cell {cell_index}")

            def coordinates(axis):
                spec = g.get(axis, {"field": axis})
                values = decode(source[spec["field"]])
                if axis in categories:
                    factors = categories[axis]
                    # Bokeh swarm coordinates contain a factor plus an offset.
                    return np.array([factors.index(str(v[0])) + float(v[-1]) if isinstance(v, (list, tuple, np.ndarray)) else factors.index(str(v)) for v in values])
                return np.asarray(values, dtype=float)

            x, y = coordinates("x"), coordinates("y")
            if len(x) != len(y):
                raise ValueError("Mismatched saved coordinate arrays")
            color_spec = g.get("line_color" if kind in ("Line", "Step") else "fill_color", "#1f77b4")
            if isinstance(color_spec, dict) and "field" in color_spec:
                mapper = attrs(color_spec.get("transform", {}))
                color = [mapper["palette"][mapper["factors"].index(str(v))] for v in decode(source[color_spec["field"]])]
            else:
                color = scalar(color_spec, "#1f77b4")
            alpha = scalar(g.get("line_alpha" if kind in ("Line", "Step") else "fill_alpha", 1), 1)
            label = legend_labels.get(renderer["id"])
            shown_label = label if label and label not in seen_labels else None
            if kind in ("Line", "Step"):
                dash = scalar(g.get("line_dash", "solid"), "solid")
                style = {"solid": "-", "dashed": "--", "dotted": ":", "dotdash": "-."}.get(dash, "-") if isinstance(dash, str) else (0, dash) if dash else "-"
                ax.plot(x, y, color=color, alpha=alpha, linewidth=1.35, linestyle=style, label=shown_label)
            else:
                ax.scatter(x, y, c=color, alpha=alpha, s=scalar(g.get("size", 5), 5) ** 2, edgecolors="none", label=shown_label)
            if label:
                seen_labels.add(label)
            drawn += 1
            point_count += len(x)

        if not drawn:
            plt.close(fig)
            continue
        for axis, side in (("x", "below"), ("y", "left")):
            axis_model = next((model for model in a.get(side, []) if resolve(model).get("name", "").endswith("Axis")), {})
            getattr(ax, f"set_{axis}label")(scalar(attrs(axis_model).get("axis_label", ""), ""))
            range_model = resolve(a.get(f"{axis}_range", {}))
            if range_model.get("name") == "Range1d":
                range_a = attrs(range_model)
                getattr(ax, f"set_{axis}lim")(range_a.get("start", 0), range_a.get("end", 1))
            if axis in categories:
                getattr(ax, f"set_{axis}ticks")(range(len(categories[axis])), categories[axis])
        if title:
            ax.set_title(title, loc="left", fontweight="semibold", pad=12)
        ax.grid(alpha=.17, linewidth=.7)
        if seen_labels:
            ax.legend(loc="upper left", bbox_to_anchor=(1.015, 1), frameon=False)
        filename = f"{slug}-saved-cell-{cell_index}-output-{output_index}-{figure_index + 1}.png"
        target = ASSETS / filename
        fig.savefig(target, facecolor="white")
        plt.close(fig)
        width, height = Image.open(target).size
        outputs.append({"type": "image", "src": f"/bi1x/images/{filename}",
                        "alt": title or "Growth rate by strain", "width": width, "height": height,
                        "sourceCell": cell_index})
        print(f"{slug} cell {cell_index}, figure {figure_index + 1}: {drawn} series, {point_count} points")
    return outputs


for lab in (4, 6):
    slug = f"lab-{lab}"
    notebook = json.loads((SOURCE / f"Lee_Curtis_{lab}" / f"Lee_Curtis_{lab}.ipynb").read_text())
    data_path = ROOT / f"public/bi1x/data/{slug}.json"
    project = json.loads(data_path.read_text())
    for section in project["sections"]:
        # Replace earlier derived figures; leave written answers and all code intact.
        section["blocks"] = [b for b in section["blocks"] if not (b["type"] == "image" and ("-figure-" in b["src"] or "-saved-cell-" in b["src"]))]
    section = None
    for cell_index, cell in enumerate(notebook["cells"]):
        source = "".join(cell.get("source", []))
        if cell["cell_type"] == "markdown":
            heading = re.search(r"(?m)^#{1,2}\s+(.+)$", source)
            if heading:
                section = next((s for s in project["sections"] if s["title"].lower() == heading[1].strip().lower()), section)
        elif section is not None:
            code_index = next((i for i, b in enumerate(section["blocks"]) if b["type"] == "code" and b["code"] == source.rstrip()), None)
            if code_index is None:
                continue
            images = [image for output_index, doc in enumerate(documents(cell), 1) for image in render_document(doc, slug, cell_index, output_index)]
            display_only = re.fullmatch(r"\s*bokeh\.io\.show\((\w+)\)\s*(?:#[^\n]*)?\s*", source)
            related = []
            if display_only:
                name = display_only[1]
                for other in notebook["cells"]:
                    other_source = "".join(other.get("source", []))
                    if other["cell_type"] == "code" and re.search(r"\b" + re.escape(name) + r"\s*(?:=|\.(?:line|scatter|circle)\()", other_source):
                        related.append(other_source.rstrip())
            for image in images:
                image["code"] = "\n\n".join(related + [source.rstrip()])
                image["displayCode"] = source.rstrip()
            section["blocks"][code_index + 1:code_index + 1] = images
    data_path.write_text(json.dumps(project, ensure_ascii=False, separators=(",", ":")))

# Add real dimensions to every image and pair microscopy/PNG outputs with code.
for data_path in sorted((ROOT / "public/bi1x/data").glob("*.json")):
    project = json.loads(data_path.read_text())
    all_code = [b["code"] for s in project["sections"] for b in s["blocks"] if b["type"] == "code"]
    for section in project["sections"]:
        previous_code = None
        for block in section["blocks"]:
            if block["type"] == "code":
                previous_code = block["code"]
            elif block["type"] == "markdown":
                previous_code = None
            elif block["type"] == "image":
                block["width"], block["height"] = Image.open(ROOT / "public" / block["src"].lstrip("/")).size
                if project["slug"] == "lab-2":
                    filename = block["alt"].split(" · ")[-1]
                    matches = [code for code in all_code if re.search(r"[\"']" + re.escape(filename) + r"[\"']", code)]
                    if matches:
                        block["code"] = matches[0]
                elif previous_code and "code" not in block:
                    block["code"] = previous_code
    data_path.write_text(json.dumps(project, ensure_ascii=False, separators=(",", ":")))

# Remove only superseded derived assets created by this exporter.
referenced = set()
for data_path in (ROOT / "public/bi1x/data").glob("*.json"):
    project = json.loads(data_path.read_text())
    referenced.update(b["src"] for s in project["sections"] for b in s["blocks"] if b["type"] == "image")
for image in ASSETS.glob("*-saved-cell-*.png"):
    if f"/bi1x/images/{image.name}" not in referenced:
        image.unlink()

# The manifest lets inline markdown images reserve their exact aspect ratio, too.
manifest = {}
for image in ASSETS.iterdir():
    if image.suffix.lower() in (".png", ".webp", ".jpg", ".jpeg"):
        with Image.open(image) as source:
            manifest[f"/bi1x/images/{image.name}"] = {"width": source.width, "height": source.height}
(ROOT / "public/bi1x/image-dimensions.json").write_text(json.dumps(manifest, separators=(",", ":")))
