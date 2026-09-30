"use client";

import { useEffect, useState } from "react";
import type { Coordinates } from "@/lib/astronomical-darkness";
import { ATLAS_YEAR, pollutionAssessment } from "@/lib/light-pollution";

export type PollutionReading = { status: "ok"; ratio: number; magnitude: number } | { status: "loading" | "unavailable" | "outside-coverage" };

export function useLightPollution(location: Coordinates): PollutionReading {
  const [result, setResult] = useState<{ key: string; reading: PollutionReading } | null>(null);
  const key = new URLSearchParams({ lat: location.latitude.toFixed(4), lon: location.longitude.toFixed(4) }).toString();
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const finish = (reading: PollutionReading) => setResult({ key, reading });
      try {
        const response = await fetch(`/api/light-pollution?${key}`, { signal: controller.signal });
        const result = await response.json() as PollutionReading;
        if (controller.signal.aborted) return;
        if (result.status === "outside-coverage") finish(result);
        else if (response.ok && result.status === "ok" && Number.isFinite(result.ratio) && Number.isFinite(result.magnitude)) finish(result);
        else finish({ status: "unavailable" });
      } catch { if (!controller.signal.aborted) finish({ status: "unavailable" }); }
    }, 150);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [key]);
  return result?.key === key ? result.reading : { status: "loading" };
}

export function LightPollutionReadout({ reading, placeName }: { reading: PollutionReading; placeName: string }) {
  const assessment = reading.status === "ok" ? pollutionAssessment(reading.ratio) : null;
  return <section className="astro-pollution-card" aria-label="Light pollution at selected location" aria-live="polite">
    <div><p className="astro-section-number">Local light pollution · {placeName}</p><h2>{assessment?.label ?? (reading.status === "loading" ? "Checking local skyglow…" : reading.status === "outside-coverage" ? "Outside atlas coverage" : "Skyglow data unavailable")}</h2><p>{assessment?.detail ?? (reading.status === "loading" ? "Looking up the modeled night-sky brightness at your pin." : reading.status === "outside-coverage" ? "The atlas covers 65°S to 75°N. Sun and Moon calculations still work here." : "The atlas could not be reached. Try another location or check the linked map below; astronomical timing still works.")}</p></div>
    {reading.status === "ok" && <div className="astro-pollution-values" data-tone={assessment?.tone}><div><strong>{reading.magnitude.toFixed(2)}</strong><span>mag/arcsec² · estimated sky brightness</span></div><div><strong>{reading.ratio < 0.1 ? reading.ratio.toFixed(3) : reading.ratio.toFixed(1)}×</strong><span>Artificial light / natural sky</span></div></div>}
    <small><a href="https://djlorenz.github.io/astronomy/lp/" target="_blank" rel="noopener noreferrer">David Lorenz · {ATLAS_YEAR} atlas ↗</a> · Modeled clear-sky brightness overhead, on a moonless night. This is not a live measurement or a Bortle rating.</small>
  </section>;
}
