"use client";

import Image from "next/image";
import { useState } from "react";

export function YouTubeVideoEmbed({
  poster,
  title,
  videoId,
}: {
  poster?: string;
  title: string;
  videoId: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="recipe-youtube-section">
      <p className="eyebrow">Original YouTube video</p>
      <div className="recipe-youtube-frame">
        {playing ? (
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1`}
            title={`${title} on YouTube`}
          />
        ) : (
          <button
            aria-label={`Play ${title} on YouTube`}
            className="recipe-youtube-load"
            onClick={() => setPlaying(true)}
            type="button"
          >
            {poster && <Image alt="" fill sizes="(max-width: 768px) 100vw, 42vw" src={poster} />}
            <span aria-hidden="true">▶</span>
            <strong>Play original video</strong>
          </button>
        )}
      </div>
    </section>
  );
}
