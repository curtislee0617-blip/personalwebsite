"use client";

import Image from "next/image";
import { useRef } from "react";

export function RecipeCardThumbnailMedia({
  position,
  poster,
  src,
  time = 0,
}: {
  position: string;
  poster?: string;
  src: string;
  time?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = /\.(?:mp4|m4v|mov)(?:\?.*)?$/i.test(src);

  if (!isVideo) {
    return <Image alt="" className="object-cover" fill sizes="(max-width: 768px) 50vw, 22vw" src={src} style={{ objectPosition: position }} />;
  }

  return (
    <video
      aria-hidden="true"
      className="h-full w-full object-cover"
      muted
      onLoadedMetadata={() => {
        const video = videoRef.current;
        if (video) video.currentTime = Math.min(Math.max(0, time), Math.max(0, video.duration - 0.05));
      }}
      playsInline
      poster={poster}
      preload="metadata"
      ref={videoRef}
      src={src}
      style={{ objectPosition: position }}
    />
  );
}
