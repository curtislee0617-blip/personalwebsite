#!/usr/bin/env python3
"""Optimize a user-organized recipe-media folder and print its web manifest."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import re
import shutil
import subprocess
import unicodedata


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".heic", ".webp"}
VIDEO_EXTENSIONS = {".mov", ".mp4", ".m4v"}


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "-", normalized.lower()).strip("-") or "recipe"


def run(*command: str) -> None:
    subprocess.run(command, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    grouped: dict[str, list[Path]] = {}
    for source in sorted(args.source.rglob("*"), key=lambda path: str(path).lower()):
        if not source.is_file() or source.name.startswith(".") or source.suffix.lower() not in IMAGE_EXTENSIONS | VIDEO_EXTENSIONS:
            continue
        relative = source.relative_to(args.source)
        title = relative.parts[0] if len(relative.parts) > 1 else source.stem
        grouped.setdefault(title, []).append(source)

    manifest = []
    for title, sources in grouped.items():
        recipe_slug = f"personal-{slugify(title)}"
        output_directory = args.output / recipe_slug
        output_directory.mkdir(parents=True, exist_ok=True)
        media = []

        for index, source in enumerate(sources, start=1):
            base = f"{index:02d}-{slugify(source.stem)}"
            if source.suffix.lower() in IMAGE_EXTENSIONS:
                destination = output_directory / f"{base}.jpg"
                run("sips", "-Z", "1800", "-s", "format", "jpeg", "-s", "formatOptions", "78", str(source), "--out", str(destination))
                media.append({"src": f"/recipes/personal-import/{recipe_slug}/{destination.name}", "type": "image", "alt": f"{title} — {source.stem}"})
            else:
                destination = output_directory / f"{base}.m4v"
                try:
                    run("avconvert", "--source", str(source), "--preset", "PresetAppleM4V720pHD", "--output", str(destination), "--replace")
                except subprocess.CalledProcessError:
                    destination = output_directory / f"{base}{source.suffix.lower()}"
                    shutil.copy2(source, destination)

                poster = output_directory / f"{base}-poster.png"
                preview_directory = output_directory / ".preview"
                preview_directory.mkdir(exist_ok=True)
                try:
                    run("qlmanage", "-t", "-s", "1200", "-o", str(preview_directory), str(source))
                    generated = next(preview_directory.glob(f"{source.name}*.png"))
                    shutil.move(str(generated), poster)
                except (StopIteration, subprocess.CalledProcessError):
                    poster = None
                shutil.rmtree(preview_directory, ignore_errors=True)
                media.append({
                    "src": f"/recipes/personal-import/{recipe_slug}/{destination.name}",
                    "type": "video",
                    "alt": f"{title} — {source.stem}",
                    **({"poster": f"/recipes/personal-import/{recipe_slug}/{poster.name}"} if poster else {}),
                })

        images = [item["src"] for item in media if item["type"] == "image"]
        posters = [item["poster"] for item in media if item.get("poster")]
        manifest.append({
            "recipeKey": recipe_slug,
            "slug": recipe_slug,
            "title": title,
            "description": "",
            "categories": ["bread"],
            "thumbnail": (images or posters or [None])[0],
            "media": media,
            "source": "site",
        })

    print(json.dumps(manifest, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
