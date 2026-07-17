"use client";

import { RecipeCardThumbnailMedia } from "@/components/recipe-card-thumbnail-media";
import type { RecipeCardEntry } from "@/lib/recipe-card-types";

function formatDate(date?: string) {
  if (!date) return "Date to be added";
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function openRecipe(entry: RecipeCardEntry) {
  const target = document.getElementById(`recipe-${entry.slug}`);
  if (!(target instanceof HTMLDetailsElement)) return;

  const category = target.closest<HTMLDetailsElement>(".recipe-category-section");
  if (category) category.open = true;
  target.open = true;
  window.requestAnimationFrame(() => target.scrollIntoView({ behavior: "smooth", block: "start" }));
}

export function RecipeChronologyRail({ recipes }: { recipes: RecipeCardEntry[] }) {
  return (
    <div aria-label="All recipes from earliest to latest" className="recipe-chronology-rail" role="region" tabIndex={0}>
      <ol className="recipe-chronology-track">
        {recipes.map((entry) => (
          <li className="recipe-chronology-item" key={entry.recipeKey}>
            <button className={`recipe-chronology-card ${entry.thumbnail ? "" : "is-text-only"}`} onClick={() => openRecipe(entry)} type="button">
              {entry.thumbnail && (
                <span className="recipe-chronology-thumbnail">
                  <RecipeCardThumbnailMedia
                    position={entry.thumbnailPosition ?? "50% 50%"}
                    poster={entry.media?.find((item) => item.src === entry.thumbnail)?.poster}
                    src={entry.thumbnail}
                    time={entry.thumbnailTime}
                    zoom={entry.thumbnailZoom}
                  />
                </span>
              )}
              <span className="recipe-chronology-copy">
                <strong>{entry.title}</strong>
                <small>{formatDate(entry.date)}</small>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
