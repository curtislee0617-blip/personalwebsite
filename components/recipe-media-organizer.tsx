"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, type DragEvent } from "react";
import type { RecipeMediaItem } from "@/lib/recipe-card-types";

export function RecipeMediaOrganizer({ initialItems, title }: { initialItems: RecipeMediaItem[]; title: string }) {
  const [items, setItems] = useState(initialItems);
  const [dragging, setDragging] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    setItems((current) => {
      const next = [...current];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const drop = (event: DragEvent<HTMLElement>, to: number) => {
    event.preventDefault();
    if (dragging !== null) move(dragging, to);
    setDragging(null);
  };

  return (
    <div className="recipe-media-organizer">
      <input name="media_items" type="hidden" value={JSON.stringify(items)} />
      <p className="recipe-editor-help">Drag items into order, or use the arrow buttons. Add optional text for the bottom-left image overlay.</p>
      <div className="recipe-media-organizer-grid">
        {items.map((item, index) => (
          <article
            className={dragging === index ? "is-dragging" : ""}
            draggable
            key={item.src}
            onDragEnd={() => setDragging(null)}
            onDragOver={(event) => event.preventDefault()}
            onDragStart={() => setDragging(index)}
            onDrop={(event) => drop(event, index)}
          >
            <div className="recipe-media-organizer-preview">
              {item.type === "video" ? (
                <video aria-label={`${title} media item ${index + 1}`} muted playsInline poster={item.poster} preload="metadata" src={item.src} />
              ) : (
                <img alt={`${title} media item ${index + 1}`} src={item.src} />
              )}
              <span>{index + 1}</span>
            </div>
            <label>
              <span>Bottom-left text</span>
              <input
                maxLength={200}
                onChange={(event) => setItems((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, caption: event.target.value } : entry))}
                placeholder="Optional caption"
                type="text"
                value={item.caption ?? ""}
              />
            </label>
            <div className="recipe-media-organizer-actions">
              <button aria-label={`Move item ${index + 1} earlier`} disabled={index === 0} onClick={() => move(index, index - 1)} type="button">←</button>
              <span>Drag to reorder</span>
              <button aria-label={`Move item ${index + 1} later`} disabled={index === items.length - 1} onClick={() => move(index, index + 1)} type="button">→</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
