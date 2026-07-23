"use client";

import { HistoryBackButton } from "@/components/history-back-button";

export function ImageViewerBackButton({ fallbackHref }: { fallbackHref: string }) {
  return <HistoryBackButton fallbackHref={fallbackHref} />;
}
