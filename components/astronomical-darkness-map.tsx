"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker, TileLayer } from "leaflet";
import type { Coordinates } from "@/lib/astronomical-darkness";
import { ATLAS_TILES, ATLAS_YEAR } from "@/lib/light-pollution";

type Props = {
  location: Coordinates;
  onSelect: (location: Coordinates) => void;
  showLights: boolean;
};

const BASEMAP_TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

export function AstronomicalDarknessMap({ location, onSelect, showLights }: Props) {
  const [tileError, setTileError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const lightsRef = useRef<TileLayer | null>(null);
  const onSelectRef = useRef(onSelect);
  const locationRef = useRef(location);
  const showLightsRef = useRef(showLights);

  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  useEffect(() => { locationRef.current = location; }, [location]);
  useEffect(() => { showLightsRef.current = showLights; }, [showLights]);

  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | null = null;
    void import("leaflet").then((leaflet) => {
      if (cancelled || !containerRef.current) return;
      const initial = locationRef.current;
      map = leaflet.map(containerRef.current, { scrollWheelZoom: true, wheelPxPerZoomLevel: 110, zoomControl: true, minZoom: 2 })
        .setView([initial.latitude, initial.longitude], 7);
      mapRef.current = map;

      // Trackpad pinches arrive as Ctrl+wheel in Chromium. Let Leaflet handle
      // those gestures while normal two-finger scrolling still moves the page.
      const container = containerRef.current;
      const pinchOnly = (event: WheelEvent) => {
        if (!event.ctrlKey) event.stopImmediatePropagation();
      };
      container.addEventListener("wheel", pinchOnly, { capture: true, passive: false });
      map.on("unload", () => container.removeEventListener("wheel", pinchOnly, true));

      leaflet.tileLayer(BASEMAP_TILES, {
        maxZoom: 16,
        attribution: '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a>',
      }).addTo(map);
      lightsRef.current = leaflet.tileLayer(ATLAS_TILES, {
        maxZoom: 16,
        maxNativeZoom: 8,
        tileSize: 1024,
        zoomOffset: -2,
        opacity: showLightsRef.current ? 0.62 : 0,
        attribution: `<a href="https://djlorenz.github.io/astronomy/lp/" target="_blank" rel="noopener noreferrer">David Lorenz · Light Pollution Atlas ${ATLAS_YEAR}</a>`,
      }).addTo(map);
      lightsRef.current.on("tileerror", () => { if (!cancelled) setTileError(true); });

      markerRef.current = leaflet.marker([initial.latitude, initial.longitude], {
        icon: leaflet.divIcon({ className: "astro-map-marker-icon", html: '<span class="astro-map-marker"></span>', iconSize: [24, 24], iconAnchor: [12, 12] }),
      }).addTo(map);
      map.on("click", (event) => {
        const point = event.latlng.wrap();
        onSelectRef.current({ latitude: Math.max(-90, Math.min(90, point.lat)), longitude: point.lng });
      });
      const resize = new ResizeObserver(() => map?.invalidateSize());
      resize.observe(containerRef.current);
      map.on("unload", () => resize.disconnect());
    });

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
      markerRef.current = null;
      lightsRef.current = null;
    };
  }, []);

  useEffect(() => {
    markerRef.current?.setLatLng([location.latitude, location.longitude]);
    mapRef.current?.panTo([location.latitude, location.longitude], { animate: true, duration: 0.4 });
  }, [location.latitude, location.longitude]);

  useEffect(() => {
    lightsRef.current?.setOpacity(showLights ? 0.62 : 0);
  }, [showLights]);

  return <><div aria-label="Light pollution map; click to select a photography location, pinch the trackpad or use the zoom buttons to zoom" className="astro-map" ref={containerRef} />{tileError && showLights && <p className="astro-map-warning" role="status">Some skyglow map tiles could not be loaded. The location readout uses a separate atlas lookup.</p>}</>;
}
