#!/usr/bin/env python3
"""Split the imported cookbook library into route-sized data files.

The original importer wrote every cookbook and every recipe into one JSON file.
That made the recipes landing page load the full private library. This script
keeps a small catalogue and recipe-title search index in the shared bundle,
while each complete book is loaded only on its own route.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "lib" / "imported-cookbooks-data.json"
BOOKS_DIR = ROOT / "lib" / "imported-cookbooks"
CATALOG = BOOKS_DIR / "catalog.json"
SEARCH = BOOKS_DIR / "search-index.json"
LOADERS = ROOT / "lib" / "imported-cookbook-loaders.ts"


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(value, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )


def main() -> None:
    books = json.loads(SOURCE.read_text(encoding="utf-8"))
    catalogue: list[dict[str, object]] = []
    search_index: list[dict[str, object]] = []

    for book in books:
        book_id = book["id"]
        write_json(BOOKS_DIR / f"{book_id}.json", book)
        catalogue.append(
            {
                "author": book["author"],
                "categories": book["categories"],
                "description": book["description"],
                "id": book_id,
                "recipeCountLabel": book["recipeCountLabel"],
                "title": book["title"],
            }
        )
        search_index.extend(
            {
                "bookId": book_id,
                "bookTitle": book["title"],
                "category": recipe["category"],
                "id": recipe["id"],
                "sourcePages": recipe["sourcePages"],
                "title": recipe["title"],
            }
            for recipe in book["recipes"]
        )

    write_json(CATALOG, catalogue)
    write_json(SEARCH, search_index)

    loader_lines = [
        'import type { ImportedCookbook } from "@/components/imported-cookbook-guide";',
        "",
        "export const importedCookbookLoaders: Record<string, () => Promise<ImportedCookbook>> = {",
    ]
    for book in catalogue:
        book_id = book["id"]
        loader_lines.append(
            f'  "{book_id}": () => import("@/lib/imported-cookbooks/{book_id}.json")'
            ".then((module) => module.default as ImportedCookbook),"
        )
    loader_lines.extend(["};", ""])
    LOADERS.write_text("\n".join(loader_lines), encoding="utf-8")


if __name__ == "__main__":
    main()
