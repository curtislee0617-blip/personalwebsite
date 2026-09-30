"use client";

import { useEffect, useState } from "react";
import { pinnedSkyLocation, skyLocations } from "@/lib/sky-locations";

export function usePinnedSkyLocation() {
  const [spot, setSpot] = useState(skyLocations.losAngeles);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    let loading = false;
    const refresh = async () => {
      if (document.hidden || loading) return;
      loading = true;
      try {
        const response = await fetch("/api/contact-presence", { cache: "no-store", signal: controller.signal });
        if (!response.ok) return;
        const result = await response.json() as { status?: { city?: unknown } };
        if (!controller.signal.aborted) setSpot(pinnedSkyLocation(result.status?.city));
      } catch { /* Keep the last known city if the presence service is offline. */ }
      finally {
        loading = false;
        if (!controller.signal.aborted) setReady(true);
      }
    };
    void refresh();
    const timer = window.setInterval(refresh, 10_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  return { spot, ready };
}
