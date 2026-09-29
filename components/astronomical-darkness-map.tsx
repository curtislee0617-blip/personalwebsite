"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker, TileLayer } from "leaflet";
import type { Coordinates } from "@/lib/astronomical-darkness";

type Props = {
  location: Coordinates;
  onSelect: (location: Coordinates) => void;
  showLights: boolean;
};

const NIGHT_LIGHT_TILES = "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_CityLights_2012/default//GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg";
const BASEMAP_TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

export function AstronomicalDarknessMap({ location, onSelect, showLights }: Props) {
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
      map = leaflet.map(containerRef.current, { scrollWheelZoom: false, zoomControl: true })
        .setView([initial.latitude, initial.longitude], 7);
      mapRef.current = map;

      leaflet.tileLayer(BASEMAP_TILES, {
        maxZoom: 16,
        attribution: '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a>',
      }).addTo(map);
      lightsRef.current = leaflet.tileLayer(NIGHT_LIGHT_TILES, {
        maxZoom: 16,
        maxNativeZoom: 8,
        opacity: showLightsRef.current ? 0.72 : 0,
        attribution: '<a href="https://earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs" target="_blank" rel="noopener noreferrer">NASA GIBS · VIIRS CityLights 2012</a>',
      }).addTo(map);

      markerRef.current = leaflet.marker([initial.latitude, initial.longitude], {
        icon: leaflet.divIcon({ className: "astro-map-marker-icon", html: '<span class="astro-map-marker"></span>', iconSize: [24, 24], iconAnchor: [12, 12] }),
      }).addTo(map);
      map.on("click", (event) => {
        onSelectRef.current({ latitude: event.latlng.lat, longitude: event.latlng.lng });
      });
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
    lightsRef.current?.setOpacity(showLights ? 0.72 : 0);
  }, [showLights]);

  return <div aria-label="Night lights map; click to select a photography location" className="astro-map" ref={containerRef} role="application" />;
}
