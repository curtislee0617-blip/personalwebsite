# Bi1x Laboratory class · April–June 2025

These reports preserve the author's written answers and Python code from the
six original notebooks. Images retain their original aspect ratios.

Bacterial-growth and efflux figures are static exports of the numerical arrays
stored in the original Bokeh outputs, not newly fitted or simulated results.
Each saved figure is rendered independently, including all concentration tabs,
with its original axes, logarithmic scales, ranges, series colors, and legends.
The exporter does not execute notebook code. PNG outputs, microscopy images,
and photographs from the other reports are displayed from their saved assets.

Lab 5 also includes static QIIME views from its saved QZV/QZA archives, exported
by `scripts/refresh-bi1x-qiime.py`: domain/phylum composition (top eight phyla plus
other taxa), Faith's phylogenetic diversity by the recorded sample metadata,
and a labeled PC1/PC2 projection of the saved weighted UniFrac coordinates.
No diversity metrics or ordination coordinates are recomputed.

`scripts/refresh-bi1x-figures.py` regenerates the derived figures and image
dimensions from a local copy of the original Bi1x folder. Python, NumPy,
Matplotlib, and Pillow are required only for this offline export.

Unfinished analyses and cells without saved results remain as in the original
reports; this presentation does not invent missing fits or experimental data.
