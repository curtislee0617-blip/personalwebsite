"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { RecipeImageViewer } from "@/components/recipe-image-viewer";
import type { RecipeMediaItem } from "@/lib/recipe-card-types";

function RecipeVideo({ item, title }: { item: RecipeMediaItem; title: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const trimStart = Math.max(0, item.trimStart ?? 0);

  const trimEnd = (video: HTMLVideoElement) => {
    const requestedEnd = item.trimEnd;
    return requestedEnd && requestedEnd > trimStart
      ? Math.min(requestedEnd, video.duration || requestedEnd)
      : video.duration;
  };

  const resetToClipStart = (video: HTMLVideoElement) => {
    if (Number.isFinite(video.duration)) video.currentTime = Math.min(trimStart, Math.max(0, video.duration - 0.05));
  };

  const toggle = async () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      const end = trimEnd(video);
      if (video.currentTime < trimStart || (Number.isFinite(end) && video.currentTime >= end - 0.05)) resetToClipStart(video);
      await video.play();
    }
    else video.pause();
  };

  return (
    <figure className="recipe-media-item recipe-media-video">
      <video
        aria-label={item.alt ?? `${title} video`}
        controls
        onEnded={() => setPlaying(false)}
        onLoadedMetadata={(event) => resetToClipStart(event.currentTarget)}
        onPause={() => setPlaying(false)}
        onPlay={(event) => {
          const video = event.currentTarget;
          const end = trimEnd(video);
          if (video.currentTime < trimStart || (Number.isFinite(end) && video.currentTime >= end - 0.05)) resetToClipStart(video);
          setPlaying(true);
        }}
        onTimeUpdate={(event) => {
          const video = event.currentTarget;
          const end = trimEnd(video);
          if (Number.isFinite(end) && video.currentTime >= end - 0.03) {
            video.pause();
            resetToClipStart(video);
            setPlaying(false);
          }
        }}
        playsInline
        poster={item.poster}
        preload="metadata"
        ref={ref}
        src={item.src}
        style={{ objectPosition: item.position ?? "50% 50%", transform: `scale(${item.zoom ?? 1})`, transformOrigin: item.position ?? "50% 50%" }}
      />
      <button onClick={toggle} type="button">{playing ? "Pause" : "Play"}</button>
      {(trimStart > 0 || item.trimEnd !== undefined) && (
        <span className="recipe-media-trim-label">
          {trimStart.toFixed(1)}–{item.trimEnd !== undefined ? `${item.trimEnd.toFixed(1)}s` : "end"}
        </span>
      )}
      {item.caption && <figcaption>{item.caption}</figcaption>}
    </figure>
  );
}

export function RecipeMediaGallery({ media, title }: { media: RecipeMediaItem[]; title: string }) {
  if (media.length === 0) return null;

  return (
    <section className="recipe-media-section">
      <p className="eyebrow">Photos &amp; videos</p>
      <div className="recipe-media-gallery">
        {media.map((item, index) => item.type === "video" ? (
          <RecipeVideo item={item} key={`${item.src}-${index}`} title={title} />
        ) : (
          <RecipeImageViewer
            alt={item.alt ?? `${title}, image ${index + 1}`}
            className="recipe-media-item"
            key={`${item.src}-${index}`}
            src={item.src}
          >
            <span className="relative block aspect-[4/3] w-full">
              <Image
                alt={item.alt ?? `${title}, image ${index + 1}`}
                className="object-cover"
                fill
                sizes="(max-width: 640px) 44vw, 11rem"
                src={item.src}
                style={{ objectPosition: item.position ?? "50% 50%", transform: `scale(${item.zoom ?? 1})`, transformOrigin: item.position ?? "50% 50%" }}
              />
              {item.caption && <span className="recipe-media-caption">{item.caption}</span>}
            </span>
          </RecipeImageViewer>
        ))}
      </div>
    </section>
  );
}
