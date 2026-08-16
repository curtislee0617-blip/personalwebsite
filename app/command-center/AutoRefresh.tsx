"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * The page is force-dynamic and every connector fetch is no-store, so opening
 * it always pulls the calendar fresh. This covers the other case: a dashboard
 * left open on a phone propped against the kettle, which would otherwise show
 * whatever was true when it loaded.
 *
 * Re-runs the server render on an interval, and immediately whenever the tab
 * comes back to the foreground — the common case is unlocking the phone, where
 * waiting out the rest of an interval would show stale times. Skips the tick
 * entirely while hidden, so a backgrounded tab is not quietly spending Google
 * and TomTom quota all day.
 */
export default function AutoRefresh({ intervalMs = 5 * 60_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") router.refresh();
    };

    const timer = window.setInterval(refreshIfVisible, intervalMs);
    document.addEventListener("visibilitychange", refreshIfVisible);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, [intervalMs, router]);

  return null;
}
