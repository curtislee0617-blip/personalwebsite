"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState, type PointerEvent } from "react";

function parsePosition(value?: string) {
  const match = value?.match(/^(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);
  return {
    x: Math.min(100, Math.max(0, Number(match?.[1] ?? 50))),
    y: Math.min(100, Math.max(0, Number(match?.[2] ?? 50))),
  };
}

export function RecipeThumbnailPositionEditor({
  currentPosition,
  currentThumbnail,
  currentTime = 0,
  currentZoom = 1,
  options,
  title,
}: {
  currentPosition?: string;
  currentThumbnail?: string;
  currentTime?: number;
  currentZoom?: number;
  options: Array<{ src: string; type: "image" | "video"; poster?: string }>;
  title: string;
}) {
  const initialPosition = parsePosition(currentPosition);
  const [selected, setSelected] = useState(currentThumbnail ?? options[0]?.src ?? "");
  const [x, setX] = useState(initialPosition.x);
  const [y, setY] = useState(initialPosition.y);
  const [zoom, setZoom] = useState(Math.min(4, Math.max(1, currentZoom)));
  const [time, setTime] = useState(currentTime);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const dragRef = useRef<{ pointerId: number; clientX: number; clientY: number; x: number; y: number } | null>(null);
  const selectedOption = options.find((option) => option.src === selected);

  useEffect(() => {
    const video = videoRef.current;
    if (video && selectedOption?.type === "video" && Number.isFinite(video.duration)) {
      video.currentTime = Math.min(time, Math.max(0, video.duration - 0.05));
    }
  }, [selectedOption?.type, selected, time]);

  const panImage = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setX(Math.round(Math.min(100, Math.max(0, drag.x - ((event.clientX - drag.clientX) / bounds.width) * 100))));
    setY(Math.round(Math.min(100, Math.max(0, drag.y - ((event.clientY - drag.clientY) / bounds.height) * 100))));
  };

  return (
    <div className="recipe-thumbnail-editor">
      <input name="thumbnail_position" type="hidden" value={`${x}% ${y}%`} />
      <input name="thumbnail_zoom" type="hidden" value={zoom} />
      <input name="thumbnail_time_seconds" type="hidden" value={time} />

      {options.length > 1 && (
        <div className="recipe-editor-thumbnail-grid">
          {options.map((option, index) => (
            <label key={option.src}>
              <input
                checked={option.src === selected}
                name="thumbnail_url"
                onChange={() => setSelected(option.src)}
                type="radio"
                value={option.src}
              />
              {option.type === "video" ? (
                <video aria-label={`${title} video thumbnail option ${index + 1}`} muted playsInline poster={option.poster} preload="metadata" src={option.src} />
              ) : (
                <img alt={`${title} thumbnail option ${index + 1}`} src={option.src} />
              )}
              {option.type === "video" && <span className="recipe-thumbnail-video-badge">Video</span>}
            </label>
          ))}
        </div>
      )}

      {options.length === 1 && <input name="thumbnail_url" type="hidden" value={selected} />}

      {selected && (
        <div className="recipe-thumbnail-position-panel">
          <div>
            <p className="eyebrow">Crop position</p>
            <h3>Drag the image to frame it</h3>
            <p>Click and drag the image itself. Use the zoom slider to crop more closely.</p>
          </div>
          {selectedOption?.type === "video" && (
            <label className="recipe-thumbnail-time-control">
              <span>Choose frame · {time.toFixed(1)}s</span>
              <input
                max={duration || 1}
                min="0"
                onChange={(event) => setTime(Number(event.target.value))}
                step="0.05"
                type="range"
                value={Math.min(time, duration || 1)}
              />
            </label>
          )}
          <label className="recipe-thumbnail-zoom-control">
            <span>Zoom · {zoom.toFixed(2)}×</span>
            <input max="4" min="1" onChange={(event) => setZoom(Number(event.target.value))} step="0.05" type="range" value={zoom} />
          </label>
          <div
            aria-label="Drag to reposition the thumbnail. Arrow keys also move the crop."
            className="recipe-thumbnail-position-frame"
            onKeyDown={(event) => {
              const step = event.shiftKey ? 10 : 2;
              if (event.key === "ArrowLeft") setX((value) => Math.max(0, value - step));
              else if (event.key === "ArrowRight") setX((value) => Math.min(100, value + step));
              else if (event.key === "ArrowUp") setY((value) => Math.max(0, value - step));
              else if (event.key === "ArrowDown") setY((value) => Math.min(100, value + step));
              else return;
              event.preventDefault();
            }}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              dragRef.current = { pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY, x, y };
            }}
            onPointerMove={panImage}
            onPointerCancel={() => { dragRef.current = null; }}
            onPointerUp={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
              dragRef.current = null;
            }}
            role="group"
            tabIndex={0}
          >
            {selectedOption?.type === "video" ? (
              <video
                aria-label={`${title} video thumbnail crop preview`}
                muted
                onLoadedMetadata={(event) => {
                  setDuration(event.currentTarget.duration);
                  event.currentTarget.currentTime = Math.min(time, Math.max(0, event.currentTarget.duration - 0.05));
                }}
                playsInline
                poster={selectedOption.poster}
                preload="auto"
                ref={videoRef}
                src={selected}
                style={{ objectPosition: `${x}% ${y}%`, transform: `scale(${zoom})`, transformOrigin: `${x}% ${y}%` }}
              />
            ) : (
              <img alt={`${title} thumbnail crop preview`} draggable={false} src={selected} style={{ objectPosition: `${x}% ${y}%`, transform: `scale(${zoom})`, transformOrigin: `${x}% ${y}%` }} />
            )}
          </div>
          <div className="recipe-thumbnail-position-footer">
            <p className="recipe-thumbnail-position-readout">Horizontal {x}% · Vertical {y}%</p>
            <button onClick={() => { setX(50); setY(50); setZoom(1); }} type="button">Reset crop</button>
          </div>
        </div>
      )}
    </div>
  );
}
