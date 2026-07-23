#!/bin/zsh
set -euo pipefail

ROOT=${0:A:h:h}
WORK="$ROOT/tmp/pdfs/new-cookbooks"
PDFTOPPM="/Users/curtislee/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm"
RECOGNIZER="$ROOT/scripts/recognize-cookbook-images.swift"

typeset -A PDFs
PDFs=(
  breakfast "$WORK/breakfast.pdf"
  tu-casa-mi-casa "$WORK/tu-casa-mi-casa.pdf"
  french-laundry-cookbook "$WORK/french-laundry-cookbook.pdf"
  spain-the-cookbook "$WORK/spain-the-cookbook.pdf"
)

for slug in breakfast tu-casa-mi-casa french-laundry-cookbook spain-the-cookbook; do
  render_dir="$WORK/scans/$slug"
  ocr_dir="$WORK/vision-ocr/$slug"
  mkdir -p "$render_dir" "$ocr_dir"

  if [[ -z "$(find "$render_dir" -maxdepth 1 -name '*.jpg' -print -quit)" ]]; then
    echo "Rendering $slug"
    "$PDFTOPPM" \
      -jpeg \
      -jpegopt quality=84,progressive=y,optimize=y \
      -r 135 \
      "${PDFs[$slug]}" \
      "$render_dir/page"
  fi

  echo "Recognizing $slug"
  swift "$RECOGNIZER" "$render_dir" "$ocr_dir"
done
