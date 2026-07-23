"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentPageReturnPosition, restoreReturnPosition } from "@/components/scroll-position-restorer";

type HistoryBackButtonProps = {
  children?: ReactNode;
  className?: string;
  fallbackHref: string;
};

export function HistoryBackButton({
  children = "← Back",
  className = "",
  fallbackHref,
}: HistoryBackButtonProps) {
  const router = useRouter();

  return (
    <button
      className={`back-link-bubble ${className}`.trim()}
      onClick={() => {
        const returnPosition = getCurrentPageReturnPosition();

        if (window.history.length > 1) {
          router.back();
          if (returnPosition) restoreReturnPosition(returnPosition);
          return;
        }
        router.push(fallbackHref);
        if (returnPosition) restoreReturnPosition(returnPosition);
      }}
      type="button"
    >
      {children}
    </button>
  );
}
