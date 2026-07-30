"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CoffeeAtlasOrigin } from "@/data/coffee-origin-atlas";
import {
  configureGoogleMaps,
  importGoogleMapsLibrary,
} from "@/lib/google-maps-loader";

type CoffeeCountryTerrainMapProps = {
  apiKey: string;
  mapId: string;
  onSelectRegion: (regionId: string) => void;
  origin: CoffeeAtlasOrigin;
  selectedRegionId: string | null;
};

type MapLayer = "terrain" | "satellite";
type MapStatus = "idle" | "loading" | "ready" | "error";

type RegionOverlay = {
  circles: google.maps.Circle[];
  colour: string;
  markerElements: HTMLButtonElement[];
  markers: google.maps.marker.AdvancedMarkerElement[];
};

const compactMapQuery =
  "(max-width: 1099px), (max-width: 1366px) and (pointer: coarse) and (hover: none)";
const regionColours = [
  "#b7603f",
  "#3f755f",
  "#b88936",
  "#557395",
  "#8d5c7d",
  "#6d813c",
  "#357b7d",
  "#9a6840",
];

function toRadians(value: number) {
  return value * (Math.PI / 180);
}

function distanceInKilometres(
  first: [number, number],
  second: [number, number],
) {
  const [firstLng, firstLat] = first;
  const [secondLng, secondLat] = second;
  const latitudeDifference = toRadians(secondLat - firstLat);
  const longitudeDifference = toRadians(secondLng - firstLng);
  const firstLatitude = toRadians(firstLat);
  const secondLatitude = toRadians(secondLat);
  const haversine =
    Math.sin(latitudeDifference / 2) ** 2
    + Math.cos(firstLatitude)
      * Math.cos(secondLatitude)
      * Math.sin(longitudeDifference / 2) ** 2;

  return 6_371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function footprintRadiusInKilometres(
  origin: CoffeeAtlasOrigin,
  regionId: string,
  coordinate: [number, number],
) {
  let nearestOtherRegion = Number.POSITIVE_INFINITY;

  for (const region of origin.growingRegions) {
    if (region.id === regionId) continue;
    for (const otherCoordinate of region.coordinates) {
      nearestOtherRegion = Math.min(
        nearestOtherRegion,
        distanceInKilometres(coordinate, otherCoordinate),
      );
    }
  }

  if (!Number.isFinite(nearestOtherRegion)) return 45;
  return Math.min(140, Math.max(16, nearestOtherRegion * 0.34));
}

function makeRegionMarker(
  index: number,
  name: string,
  altitude: string,
  isSecondary: boolean,
) {
  const marker = document.createElement("button");
  marker.type = "button";
  marker.className = "coffee-terrain-region-marker";
  marker.dataset.secondary = isSecondary ? "true" : "false";
  marker.setAttribute("aria-label", `Open ${name}, ${altitude}`);

  const number = document.createElement("span");
  number.textContent = String(index + 1);
  marker.append(number);

  if (!isSecondary) {
    const copy = document.createElement("span");
    const label = document.createElement("strong");
    const detail = document.createElement("small");
    label.textContent = name;
    detail.textContent = altitude;
    copy.append(label, detail);
    marker.append(copy);
  }

  return marker;
}

function fitMapToBounds(
  map: google.maps.Map,
  bounds: google.maps.LatLngBounds,
  maximumZoom: number,
) {
  if (bounds.isEmpty()) return;

  map.fitBounds(bounds, {
    bottom: 54,
    left: 42,
    right: 42,
    top: 76,
  });
  google.maps.event.addListenerOnce(map, "idle", () => {
    if ((map.getZoom() ?? 0) > maximumZoom) map.setZoom(maximumZoom);
  });
}

export function CoffeeCountryTerrainMap({
  apiKey,
  mapId,
  onSelectRegion,
  origin,
  selectedRegionId,
}: CoffeeCountryTerrainMapProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const onSelectRegionRef = useRef(onSelectRegion);
  const overviewBoundsRef = useRef<google.maps.LatLngBounds | null>(null);
  const regionBoundsRef = useRef(new Map<string, google.maps.LatLngBounds>());
  const regionOverlaysRef = useRef(new Map<string, RegionOverlay>());
  const previousSelectedRegionRef = useRef(selectedRegionId);
  const [layer, setLayer] = useState<MapLayer>("terrain");
  const [status, setStatus] = useState<MapStatus>(apiKey ? "idle" : "error");

  useEffect(() => {
    onSelectRegionRef.current = onSelectRegion;
  }, [onSelectRegion]);

  useEffect(() => {
    if (!apiKey || !mapElementRef.current) return;

    let cancelled = false;
    const overlays = regionOverlaysRef.current;
    const regionBoundsById = regionBoundsRef.current;
    const markerListeners: Array<{
      element: HTMLButtonElement;
      listener: () => void;
    }> = [];

    async function initialiseMap() {
      setStatus("loading");

      try {
        configureGoogleMaps(apiKey, mapId);
        const [{ Circle, Map }, { AdvancedMarkerElement }] =
          await Promise.all([
            importGoogleMapsLibrary("maps"),
            importGoogleMapsLibrary("marker"),
          ]);

        if (cancelled || !mapElementRef.current) return;

        const compact = window.matchMedia(compactMapQuery).matches;
        const [longitude, latitude] = origin.coordinates;
        const map = new Map(mapElementRef.current, {
          center: { lat: latitude, lng: longitude },
          clickableIcons: false,
          controlSize: compact ? 28 : 32,
          fullscreenControl: !compact,
          gestureHandling: compact ? "greedy" : "cooperative",
          keyboardShortcuts: !compact,
          mapId,
          mapTypeControl: false,
          mapTypeId: "terrain",
          rotateControl: false,
          scaleControl: true,
          streetViewControl: false,
          zoom: 6,
          zoomControl: true,
        });
        const overviewBounds = new google.maps.LatLngBounds();

        mapRef.current = map;
        overviewBoundsRef.current = overviewBounds;

        origin.growingRegions.forEach((region, regionIndex) => {
          const colour = regionColours[regionIndex % regionColours.length];
          const circles: google.maps.Circle[] = [];
          const markers: google.maps.marker.AdvancedMarkerElement[] = [];
          const markerElements: HTMLButtonElement[] = [];
          const regionBounds = new google.maps.LatLngBounds();

          region.coordinates.forEach((coordinate, pointIndex) => {
            const [lng, lat] = coordinate;
            const radius =
              footprintRadiusInKilometres(origin, region.id, coordinate) * 1_000;
            const circle = new Circle({
              center: { lat, lng },
              clickable: true,
              fillColor: colour,
              fillOpacity: 0.14,
              map,
              radius,
              strokeColor: colour,
              strokeOpacity: 0.9,
              strokeWeight: 1.7,
              zIndex: regionIndex + 1,
            });
            const circleBounds = circle.getBounds();
            if (circleBounds) {
              regionBounds.union(circleBounds);
              overviewBounds.union(circleBounds);
            } else {
              regionBounds.extend({ lat, lng });
              overviewBounds.extend({ lat, lng });
            }

            circle.addListener("click", () => {
              onSelectRegionRef.current(region.id);
            });
            circles.push(circle);

            const markerElement = makeRegionMarker(
              regionIndex,
              region.name,
              region.altitude,
              pointIndex > 0,
            );
            const markerListener = () => onSelectRegionRef.current(region.id);
            markerElement.addEventListener("click", markerListener);
            markerListeners.push({
              element: markerElement,
              listener: markerListener,
            });
            markerElements.push(markerElement);

            markers.push(
              new AdvancedMarkerElement({
                content: markerElement,
                gmpClickable: true,
                map,
                position: { lat, lng },
                title: `${region.name} — ${region.location}`,
                zIndex: 100 + regionIndex,
              }),
            );
          });

          regionBoundsById.set(region.id, regionBounds);
          overlays.set(region.id, {
            circles,
            colour,
            markerElements,
            markers,
          });
        });

        fitMapToBounds(map, overviewBounds, 8);
        setStatus("ready");
      } catch (error) {
        console.error("Coffee terrain map failed to load", error);
        setStatus("error");
      }
    }

    void initialiseMap();

    return () => {
      cancelled = true;
      markerListeners.forEach(({ element, listener }) => {
        element.removeEventListener("click", listener);
      });
      overlays.forEach((overlay) => {
        overlay.circles.forEach((circle) => {
          google.maps.event.clearInstanceListeners(circle);
          circle.setMap(null);
        });
        overlay.markers.forEach((marker) => {
          marker.map = null;
        });
      });
      overlays.clear();
      regionBoundsById.clear();
      overviewBoundsRef.current = null;
      if (mapRef.current) {
        google.maps.event.clearInstanceListeners(mapRef.current);
      }
      mapRef.current = null;
    };
  }, [apiKey, mapId, origin]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setMapTypeId(layer === "satellite" ? "hybrid" : "terrain");
  }, [layer, status]);

  useEffect(() => {
    if (status !== "ready") return;

    regionOverlaysRef.current.forEach((overlay, regionId) => {
      const isSelected = regionId === selectedRegionId;
      overlay.circles.forEach((circle) => {
        circle.setOptions({
          fillOpacity: isSelected ? 0.3 : layer === "satellite" ? 0.16 : 0.12,
          strokeColor: isSelected ? "#f5efe4" : overlay.colour,
          strokeOpacity: isSelected ? 1 : 0.9,
          strokeWeight: isSelected ? 3.2 : 1.7,
          zIndex: isSelected ? 50 : 1,
        });
      });
      overlay.markerElements.forEach((markerElement) => {
        markerElement.dataset.selected = isSelected ? "true" : "false";
      });
      overlay.markers.forEach((marker, markerIndex) => {
        marker.zIndex = isSelected ? 1_000 + markerIndex : 100 + markerIndex;
      });
    });

    if (
      previousSelectedRegionRef.current !== selectedRegionId
      && selectedRegionId
      && mapRef.current
    ) {
      const bounds = regionBoundsRef.current.get(selectedRegionId);
      if (bounds) fitMapToBounds(mapRef.current, bounds, 9);
    }
    previousSelectedRegionRef.current = selectedRegionId;
  }, [layer, selectedRegionId, status]);

  const showOverview = useCallback(() => {
    if (!mapRef.current || !overviewBoundsRef.current) return;
    fitMapToBounds(mapRef.current, overviewBoundsRef.current, 8);
  }, []);

  return (
    <section
      aria-label={`${origin.name} satellite and terrain coffee map`}
      aria-busy={status === "loading"}
      className="coffee-country-terrain-map"
      data-layer={layer}
    >
      <div className="coffee-terrain-map-canvas" ref={mapElementRef} />

      <div aria-label="Map view" className="coffee-terrain-map-controls" role="group">
        <div>
          <button
            aria-pressed={layer === "terrain"}
            onClick={() => setLayer("terrain")}
            type="button"
          >
            Terrain
          </button>
          <button
            aria-pressed={layer === "satellite"}
            onClick={() => setLayer("satellite")}
            type="button"
          >
            Satellite
          </button>
        </div>
        <button onClick={showOverview} type="button">Show all regions</button>
      </div>

      {status === "loading" ? (
        <div className="coffee-terrain-map-message">
          <p>Loading the terrain and growing regions…</p>
        </div>
      ) : null}
      {status === "error" ? (
        <div className="coffee-terrain-map-message">
          <p>
            The close-up map could not load. The regional locations and sources
            are still available in the key and profile.
          </p>
        </div>
      ) : null}

      <p className="coffee-terrain-map-legend">
        Shaded outlines show the approximate location of each named growing
        area—not a legal or farm boundary.
      </p>
    </section>
  );
}
