"use client";

/* eslint-disable @next/next/no-img-element */

import { useRef, useState, type DragEvent, type PointerEvent } from "react";
import type { RecipeMediaItem } from "@/lib/recipe-card-types";

function parsePosition(value?: string) {
  const match = value?.match(/^(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);
  return {
    x: Math.min(100, Math.max(0, Number(match?.[1] ?? 50))),
    y: Math.min(100, Math.max(0, Number(match?.[2] ?? 50))),
  };
}

export function RecipeMediaOrganizer({ initialItems, title }: { initialItems: RecipeMediaItem[]; title: string }) {
  const [items, setItems] = useState(initialItems);
  const [dragging, setDragging] = useState<number | null>(null);
  const cropDrag = useRef<{ index: number; pointerId: number; clientX: number; clientY: number; x: number; y: number } | null>(null);

  const updateItem = (index: number, updates: Partial<RecipeMediaItem>) => {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...updates } : item));
  };

  const panImage = (event: PointerEvent<HTMLDivElement>, index: number) => {
    const drag = cropDrag.current;
    if (!drag || drag.index !== index || drag.pointerId !== event.pointerId) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.round(Math.min(100, Math.max(0, drag.x - ((event.clientX - drag.clientX) / bounds.width) * 100)));
    const y = Math.round(Math.min(100, Math.max(0, drag.y - ((event.clientY - drag.clientY) / bounds.height) * 100)));
    updateItem(index, { position: `${x}% ${y}%` });
  };

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
            key={item.src}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => drop(event, index)}
          >
            <div
              aria-label={`Drag to reposition ${title} media item ${index + 1}. Arrow keys also move the crop.`}
              className="recipe-media-organizer-preview"
              onKeyDown={(event) => {
                const position = parsePosition(item.position);
                const step = event.shiftKey ? 10 : 2;
                if (event.key === "ArrowLeft") position.x = Math.max(0, position.x - step);
                else if (event.key === "ArrowRight") position.x = Math.min(100, position.x + step);
                else if (event.key === "ArrowUp") position.y = Math.max(0, position.y - step);
                else if (event.key === "ArrowDown") position.y = Math.min(100, position.y + step);
                else return;
                event.preventDefault();
                updateItem(index, { position: `${position.x}% ${position.y}%` });
              }}
              onPointerDown={(event) => {
                const position = parsePosition(item.position);
                event.currentTarget.setPointerCapture(event.pointerId);
                cropDrag.current = { index, pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY, ...position };
              }}
              onPointerMove={(event) => panImage(event, index)}
              onPointerCancel={() => { cropDrag.current = null; }}
              onPointerUp={(event) => {
                if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
                cropDrag.current = null;
              }}
              role="group"
              tabIndex={0}
            >
              {item.type === "video" ? (
                <video aria-label={`${title} media item ${index + 1}`} muted playsInline poster={item.poster} preload="metadata" src={item.src} style={{ objectPosition: item.position ?? "50% 50%", transform: `scale(${item.zoom ?? 1})`, transformOrigin: item.position ?? "50% 50%" }} />
              ) : (
                <img alt={`${title} media item ${index + 1}`} draggable={false} src={item.src} style={{ objectPosition: item.position ?? "50% 50%", transform: `scale(${item.zoom ?? 1})`, transformOrigin: item.position ?? "50% 50%" }} />
              )}
              <span>{index + 1}</span>
            </div>
            <label>
              <span>Zoom · {(item.zoom ?? 1).toFixed(2)}×</span>
              <input max="4" min="1" onChange={(event) => updateItem(index, { zoom: Number(event.target.value) })} step="0.05" type="range" value={item.zoom ?? 1} />
            </label>
            <label>
              <span>Bottom-left text</span>
              <input
                maxLength={200}
                onChange={(event) => updateItem(index, { caption: event.target.value })}
                placeholder="Optional caption"
                type="text"
                value={item.caption ?? ""}
              />
            </label>
            <div className="recipe-media-organizer-actions">
              <button aria-label={`Move item ${index + 1} earlier`} disabled={index === 0} onClick={() => move(index, index - 1)} type="button">←</button>
              <button
                className="recipe-media-organizer-drag-handle"
                draggable
                onDragEnd={() => setDragging(null)}
                onDragStart={() => setDragging(index)}
                type="button"
              >
                Drag to reorder
              </button>
              <button aria-label={`Move item ${index + 1} later`} disabled={index === items.length - 1} onClick={() => move(index, index + 1)} type="button">→</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
