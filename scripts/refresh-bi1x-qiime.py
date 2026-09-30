"""Render saved QIIME results as static figures; never run notebook/HTML code."""
import csv
import io
import json
import sys
import textwrap
import zipfile
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(sys.argv[1]) / "Lee_Curtis_5"
ASSETS = ROOT / "public/bi1x/images"
plt.rcParams.update({"font.size": 10, "axes.spines.top": False, "axes.spines.right": False})


def archive_text(archive, suffix):
    with zipfile.ZipFile(archive) as files:
        return files.read(next(name for name in files.namelist() if name.endswith(suffix))).decode()


notebook = json.loads((SOURCE / "Lee_Curtis_5.ipynb").read_text())
figures = []


def save(fig, name, title, cell):
    filename = f"lab-5-qiime-{name}.png"
    fig.savefig(ASSETS / filename, dpi=170, facecolor="white")
    plt.close(fig)
    with Image.open(ASSETS / filename) as image:
        width, height = image.size
    figures.append({"type": "image", "src": f"/bi1x/images/{filename}", "alt": title,
                    "width": width, "height": height, "sourceCell": cell,
                    "code": "".join(notebook["cells"][cell]["source"]).rstrip()})


for level, label in [(1, "Domain"), (2, "Phylum")]:
    rows = list(csv.DictReader(io.StringIO(archive_text(SOURCE / "qiime_visualizations/taxa-bar-plots.qzv", f"data/level-{level}.csv"))))
    taxa = [key for key in rows[0] if key not in ("index", "team", "location", "estimated-depth-inches", "pH", "shallow")]
    counts = np.array([[float(row[key]) for key in taxa] for row in rows])
    totals = counts.sum(axis=1)
    assert np.all(totals > 0)
    proportions = counts / totals[:, None]
    selected = np.argsort(proportions.mean(axis=0))[::-1][:8]
    series = [(taxa[i], proportions[:, i]) for i in selected]
    if len(selected) < len(taxa):
        series.append(("Other taxa", 1 - proportions[:, selected].sum(axis=1)))
    assert np.allclose(np.sum([data for _, data in series], axis=0), 1)
    fig, ax = plt.subplots(figsize=(9.6, 5.6), layout="constrained")
    positions = np.arange(len(rows))
    bottom = np.zeros(len(rows))
    for index, (taxon, values) in enumerate(series):
        name = taxon.split(";")[-1].replace("k__", "").replace("p__", "")
        if name == "__":
            name = taxon.split(";")[0].replace("k__", "") + " · unassigned phylum"
        ax.bar(positions, values * 100, bottom=bottom * 100, label=textwrap.fill(name, 22),
               color=plt.get_cmap("tab10")(index), width=.8, edgecolor="white", linewidth=.3)
        bottom += values
    ax.set_xticks(positions, [row["index"] for row in rows], fontsize=9)
    ax.set_ylim(0, 100)
    ax.set_ylabel("Relative abundance (%)")
    ax.set_xlabel("Sample ID")
    title = f"Microbial composition · {label.lower()} level"
    ax.set_title(title, loc="left", fontweight="bold")
    ax.legend(loc="upper left", bbox_to_anchor=(1.01, 1), fontsize=8, frameon=False)
    save(fig, f"taxa-level-{level}", title + (" · Eight most abundant phyla; remaining taxa grouped" if level == 2 else ""), 23)

metadata_text = archive_text(SOURCE / "faith-pd-group-significance.qzv", "data/metadata.tsv")
metadata = list(csv.DictReader(io.StringIO("\n".join(line for line in metadata_text.splitlines() if not line.startswith("#"))), delimiter="\t"))
for key, label in [("location", "collection location"), ("pH", "soil pH"), ("estimated-depth-inches", "estimated depth (inches)")]:
    categories = sorted({row[key] for row in metadata})
    values = [[float(row["faith_pd"]) for row in metadata if row[key] == group] for group in categories]
    fig, ax = plt.subplots(figsize=(8.4, 4.8), layout="constrained")
    ax.boxplot(values, tick_labels=[textwrap.fill(group, 23) for group in categories], orientation="horizontal", showfliers=False)
    for index, samples in enumerate(values, 1):
        ax.scatter(samples, index + np.linspace(-.10, .10, len(samples)), color="#336b87", s=23, zorder=3)
    ax.set_xlim(left=0)
    ax.set_xlabel("Faith’s phylogenetic diversity")
    ax.set_ylabel(label.capitalize())
    title = f"Alpha diversity by {label}"
    ax.set_title(title, loc="left", fontweight="bold")
    ax.grid(axis="x", alpha=.17)
    save(fig, f"faith-{key}", title + " · Points show individual samples", 25)

ordination = archive_text(SOURCE / "diversity-core-metrics-phylogenetic/weighted_unifrac_pcoa_results.qza", "ordination.txt").splitlines()
proportion_index = next(i for i, line in enumerate(ordination) if line.startswith("Proportion explained"))
variance = [float(x) for x in ordination[proportion_index + 1].split("\t")]
site_index = next(i for i, line in enumerate(ordination) if line.startswith("Site\t"))
site_count = int(ordination[site_index].split("\t")[1])
sites = [line.split("\t") for line in ordination[site_index + 1:site_index + 1 + site_count]]
by_id = {row["id"]: row for row in metadata}
assert all(site[0] in by_id for site in sites)
fig, ax = plt.subplots(figsize=(8.4, 6.4), layout="constrained")
for index, location in enumerate(sorted({row["location"] for row in metadata})):
    group = [site for site in sites if by_id[site[0]]["location"] == location]
    ax.scatter([float(site[1]) for site in group], [float(site[2]) for site in group],
               label=textwrap.fill(location, 27), color=plt.get_cmap("tab20")(index),
               s=45, edgecolors="white", linewidths=.5)
ax.set_xlabel(f"PC1 ({variance[0]:.1%} of variation)")
ax.set_ylabel(f"PC2 ({variance[1]:.1%} of variation)")
ax.set_aspect("equal", adjustable="datalim")
ax.grid(alpha=.17)
ax.set_title("Weighted UniFrac PCoA · PC1 / PC2 projection", loc="left", fontweight="bold", fontsize=11)
ax.legend(loc="upper center", bbox_to_anchor=(.5, -.2), ncol=3, frameon=False, fontsize=7, columnspacing=1.2)
save(fig, "pcoa", "Weighted UniFrac PCoA · Two-dimensional PC1/PC2 view of saved coordinates; each point is one sample", 27)

data_path = ROOT / "public/bi1x/data/lab-5.json"
report = json.loads(data_path.read_text())
for section in report["sections"]:
    section["blocks"] = [b for b in section["blocks"] if not (b["type"] == "image" and "lab-5-qiime-" in b["src"])]
    for cell in (23, 25, 27):
        code = "".join(notebook["cells"][cell]["source"]).rstrip()
        index = next((i for i, b in enumerate(section["blocks"]) if b["type"] == "code" and b["code"] == code), None)
        if index is not None:
            section["blocks"][index + 1:index + 1] = [image for image in figures if image["sourceCell"] == cell]
data_path.write_text(json.dumps(report, ensure_ascii=False, separators=(",", ":")))
manifest_path = ROOT / "public/bi1x/image-dimensions.json"
manifest = json.loads(manifest_path.read_text())
for image in figures:
    manifest[image["src"]] = {"width": image["width"], "height": image["height"]}
manifest_path.write_text(json.dumps(manifest, separators=(",", ":")))
print(f"Restored {len(figures)} QIIME figures from {len(rows)} composition samples and {len(sites)} ordination samples.")
