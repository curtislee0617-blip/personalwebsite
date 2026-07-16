"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { RecipeImageViewer } from "@/components/recipe-image-viewer";
import type { RecipeMediaItem } from "@/lib/recipe-card-types";

function RecipeVideo({ item, title }: { item: RecipeMediaItem; title: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = async () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) await video.play();
    else video.pause();
  };

  return (
    <figure className="recipe-media-item recipe-media-video">
      <video
        aria-label={item.alt ?? `${title} video`}
        controls
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        playsInline
        poster={item.poster}
        preload="metadata"
        ref={ref}
        src={item.src}
      />
      <button onClick={toggle} type="button">{playing ? "Pause" : "Play"}</button>
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
              <Image alt={item.alt ?? `${title}, image ${index + 1}`} className="object-cover" fill sizes="(max-width: 640px) 86vw, 28rem" src={item.src} />
              {item.caption && <span className="recipe-media-caption">{item.caption}</span>}
            </span>
          </RecipeImageViewer>
        ))}
      </div>
    </section>
  );
}
