"use client";

import Image from "next/image";
import { useRef } from "react";
import { isSupabaseStorageImage, supabaseImageLoader } from "@/lib/supabase-image-loader";

export function RecipeCardThumbnailMedia({
  colorAsVideo = false,
  position,
  poster,
  src,
  time = 0,
  scale = 1,
  zoom = 1,
}: {
  colorAsVideo?: boolean;
  position: string;
  poster?: string;
  src: string;
  time?: number;
  scale?: number;
  zoom?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = /\.(?:mp4|m4v|mov)(?:\?.*)?$/i.test(src);

  if (!isVideo) {
    return <Image alt="" className={colorAsVideo ? "recipe-thumbnail-video-poster object-cover" : "object-cover"} fill loader={isSupabaseStorageImage(src) ? supabaseImageLoader : undefined} sizes="(max-width: 768px) 50vw, 22vw" src={src} style={{ objectPosition: position, transform: `scale(${zoom * scale})`, transformOrigin: position }} />;
  }

  return (
    <video
      aria-hidden="true"
      className="recipe-thumbnail-video h-full w-full object-cover"
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
      style={{ objectPosition: position, transform: `scale(${zoom * scale})`, transformOrigin: position }}
    />
  );
}
