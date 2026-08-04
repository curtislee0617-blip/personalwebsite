"use client";

import { useEffect, useRef } from "react";
import type { IControl } from "maplibre-gl";

const DEFAULT_CENTER: [number, number] = [0, 12];
const NO_POINTS: readonly MapLibreDeckPoint[] = [];

export type MapLibreDeckPoint = {
  color?: [number, number, number, number?];
  coordinates: [longitude: number, latitude: number];
  id: string;
  radius?: number;
};

export type MapLibreDeckMapProps = {
  ariaLabel: string;
  center?: [longitude: number, latitude: number];
  className?: string;
  points?: readonly MapLibreDeckPoint[];
  styleUrl?: string;
  zoom?: number;
};

/**
 * Route-scoped MapLibre surface with a synchronized deck.gl point layer.
 *
 * Data stays serializable so a Server Component can prepare it, while both
 * WebGL runtimes are imported only after the client surface is mounted.
 */
export function MapLibreDeckMap({
  ariaLabel,
  center = DEFAULT_CENTER,
  className = "",
  points = NO_POINTS,
  styleUrl = "https://demotiles.maplibre.org/style.json",
  zoom = 1.25,
}: MapLibreDeckMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let cleanup: () => void = () => undefined;

    void Promise.all([
      import("maplibre-gl"),
      import("@deck.gl/mapbox"),
      import("@deck.gl/layers"),
    ]).then(([maplibreModule, deckMapbox, deckLayers]) => {
      if (disposed) return;

      const maplibregl = maplibreModule;
      const map = new maplibregl.Map({
        center,
        container,
        style: styleUrl,
        zoom,
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

      const overlay = new deckMapbox.MapboxOverlay({
        interleaved: true,
        layers: [
          new deckLayers.ScatterplotLayer<MapLibreDeckPoint>({
            data: [...points],
            getFillColor: (point) => {
              const color = point.color ?? [70, 117, 83, 205];
              return [color[0], color[1], color[2], color[3] ?? 205];
            },
            getPosition: (point) => point.coordinates,
            getRadius: (point) => point.radius ?? 28_000,
            id: "portfolio-points",
            pickable: true,
            radiusMinPixels: 3,
            radiusMaxPixels: 18,
          }),
        ],
      });

      map.addControl(overlay as unknown as IControl);
      cleanup = () => map.remove();
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [center, points, styleUrl, zoom]);

  return (
    <div
      aria-label={ariaLabel}
      className={`interaction-maplibre ${className}`.trim()}
      ref={containerRef}
      role="region"
    />
  );
}
