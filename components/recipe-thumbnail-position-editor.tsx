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
  options,
  title,
}: {
  currentPosition?: string;
  currentThumbnail?: string;
  currentTime?: number;
  options: Array<{ src: string; type: "image" | "video"; poster?: string }>;
  title: string;
}) {
  const initialPosition = parsePosition(currentPosition);
  const [selected, setSelected] = useState(currentThumbnail ?? options[0]?.src ?? "");
  const [x, setX] = useState(initialPosition.x);
  const [y, setY] = useState(initialPosition.y);
  const [time, setTime] = useState(currentTime);
  const [duration, setDuration] = useState(0);
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const selectedOption = options.find((option) => option.src === selected);

  useEffect(() => {
    const video = videoRef.current;
    if (video && selectedOption?.type === "video" && Number.isFinite(video.duration)) {
      video.currentTime = Math.min(time, Math.max(0, video.duration - 0.05));
    }
  }, [selectedOption?.type, selected, time]);

  const updatePosition = (event: PointerEvent<HTMLDivElement>) => {
    const frame = frameRef.current;
    if (!frame) return;
    const bounds = frame.getBoundingClientRect();
    setX(Math.round(Math.min(100, Math.max(0, ((event.clientX - bounds.left) / bounds.width) * 100))));
    setY(Math.round(Math.min(100, Math.max(0, ((event.clientY - bounds.top) / bounds.height) * 100))));
  };

  return (
    <div className="recipe-thumbnail-editor">
      <input name="thumbnail_position" type="hidden" value={`${x}% ${y}%`} />
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
            <h3>Drag the focus point</h3>
            <p>The frame matches the recipe-card crop. Drag anywhere to choose which part of the full image stays in view.</p>
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
          <div
            className="recipe-thumbnail-position-frame"
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              updatePosition(event);
            }}
            onPointerMove={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) updatePosition(event);
            }}
            ref={frameRef}
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
                style={{ objectPosition: `${x}% ${y}%` }}
              />
            ) : (
              <img alt={`${title} thumbnail crop preview`} draggable={false} src={selected} style={{ objectPosition: `${x}% ${y}%` }} />
            )}
            <span aria-hidden="true" className="recipe-thumbnail-focus" style={{ left: `${x}%`, top: `${y}%` }} />
          </div>
          <p className="recipe-thumbnail-position-readout">Horizontal {x}% · Vertical {y}%</p>
        </div>
      )}
    </div>
  );
}
