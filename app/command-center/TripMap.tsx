"use client";

/**
 * The payoff for moving off the artifact: real vector/raster tiles under a
 * deck.gl ArcLayer, instead of hand-traced coastlines.
 *
 * Per the toolkit's rules — MapLibre owns the camera and basemap, deck.gl owns
 * the data layers, and nothing else animates those properties. Loaded client-
 * only and route-scoped, so it never touches the rest of the site's bundle.
 */

import { useEffect, useRef } from "react";
// maplibre-gl 6 dropped its default export, so these are named imports. `Map`
// is aliased because the global of that name is also in scope here.
import {
  Map as MapLibreMap,
  NavigationControl,
  LngLatBounds,
  type IControl,
} from "maplibre-gl";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { ArcLayer, ScatterplotLayer, TextLayer } from "@deck.gl/layers";
import "maplibre-gl/dist/maplibre-gl.css";

export type MapStop = {
  pin: number;
  label: string;
  lat: number;
  lon: number;
  isHome: boolean;
};

export default function TripMap({ stops }: { stops: MapStop[] }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!host.current || stops.length === 0) return;

    const map = new MapLibreMap({
      container: host.current,
      style: {
        version: 8,
        sources: {
          base: {
            type: "raster",
            // Proxied through our own route so the TomTom key stays server-side.
            tiles: [`${location.origin}/api/tiles/{z}/{x}/{y}`],
            tileSize: 256,
            attribution: "© TomTom",
          },
        },
        layers: [{ id: "base", type: "raster", source: "base" }],
      },
      attributionControl: { compact: true },
      dragRotate: false,
    });

    map.addControl(new NavigationControl({ showCompass: false }), "top-right");

    // Frame the whole itinerary.
    const bounds = stops.reduce(
      (b, s) => b.extend([s.lon, s.lat]),
      new LngLatBounds([stops[0].lon, stops[0].lat], [stops[0].lon, stops[0].lat])
    );
    map.fitBounds(bounds, { padding: 64, maxZoom: 13, duration: 0 });

    // Consecutive stops become great-circle arcs — deck.gl draws these on the
    // globe properly, which is the thing the SVG version could only approximate.
    const legs = stops.slice(1).map((to, i) => ({ from: stops[i], to }));

    const overlay = new MapboxOverlay({
      interleaved: true,
      layers: [
        new ArcLayer({
          id: "legs",
          data: legs,
          getSourcePosition: (d) => [d.from.lon, d.from.lat],
          getTargetPosition: (d) => [d.to.lon, d.to.lat],
          getSourceColor: [214, 91, 122],
          getTargetColor: [23, 134, 74],
          getWidth: 2.5,
          greatCircle: true,
        }),
        new ScatterplotLayer({
          id: "pins",
          data: stops,
          getPosition: (d) => [d.lon, d.lat],
          getRadius: 7,
          radiusUnits: "pixels",
          getFillColor: (d) => (d.isHome ? [120, 130, 142] : [214, 91, 122]),
          getLineColor: [255, 255, 255],
          lineWidthMinPixels: 2,
          stroked: true,
          pickable: true,
        }),
        new TextLayer({
          id: "labels",
          data: stops,
          getPosition: (d) => [d.lon, d.lat],
          getText: (d) => d.label,
          getSize: 12,
          getColor: [20, 23, 26],
          getPixelOffset: [0, -18],
          outlineWidth: 3,
          outlineColor: [255, 255, 255],
          fontSettings: { sdf: true },
          getTextAnchor: "middle",
        }),
      ],
    });

    map.addControl(overlay as unknown as IControl);
    return () => map.remove();
  }, [stops]);

  if (!stops.length) {
    return <div className="map-empty">No mapped locations on this trip yet.</div>;
  }
  return <div ref={host} className="map-host" />;
}
