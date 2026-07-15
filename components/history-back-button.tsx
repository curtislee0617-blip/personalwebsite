"use client";

import { useRouter } from "next/navigation";

export function HistoryBackButton({ fallbackHref }: { fallbackHref: string }) {
  const router = useRouter();

  return (
    <button
      className="back-link-bubble"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
          return;
        }
        router.push(fallbackHref);
      }}
      type="button"
    >
      ← Back
    </button>
  );
}
