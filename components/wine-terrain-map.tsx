"use client";

/* eslint-disable @next/next/no-img-element */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";

export type WineTerrainLocation = {
  coordinates: [number, number];
  detail: string;
  id: string;
  label: string;
  radiusKm?: number;
  tier?: "region" | "subregion" | "estate";
};

type WineTerrainMapProps = {
  ariaLabel: string;
  locations: WineTerrainLocation[];
  maximumOverviewZoom?: number;
  onSelectLocation: (locationId: string) => void;
  selectedLocationId: string | null;
};

type MapSize = { height: number; width: number };
type MapViewport = { center: [number, number]; zoom: number };
type MapViewportState = {
  locationSignature: string;
  selectionId: string | null;
  viewport: MapViewport;
};
type WorldPoint = { x: number; y: number };
type DragState = {
  center: WorldPoint;
  pointerId: number;
  x: number;
  y: number;
  zoom: number;
};

const tileSize = 256;
const minimumZoom = 2;
const maximumZoom = 13;
const maximumLatitude = 85.05112878;
const terrainServers = ["a", "b", "c"] as const;
const locationColours = [
  "#743446",
  "#8e5a35",
  "#526f4d",
  "#8a793a",
  "#4d687e",
  "#7b536f",
  "#516f69",
  "#9a654d",
];

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function wrapLongitude(longitude: number) {
  return ((longitude + 540) % 360) - 180;
}

function coordinateToWorld(
  [longitude, latitude]: [number, number],
  zoom: number,
): WorldPoint {
  const safeLatitude = clamp(latitude, -maximumLatitude, maximumLatitude);
  const latitudeRadians = safeLatitude * (Math.PI / 180);
  const scale = tileSize * 2 ** zoom;
  return {
    x: ((longitude + 180) / 360) * scale,
    y: (1 - Math.asinh(Math.tan(latitudeRadians)) / Math.PI) / 2 * scale,
  };
}

function worldToCoordinate({ x, y }: WorldPoint, zoom: number): [number, number] {
  const scale = tileSize * 2 ** zoom;
  const longitude = wrapLongitude((x / scale) * 360 - 180);
  const latitudeRadians = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / scale)));
  return [longitude, latitudeRadians * (180 / Math.PI)];
}

function viewForCoordinates(
  coordinates: Array<[number, number]>,
  size: MapSize,
  maximumFitZoom: number,
): MapViewport {
  if (!coordinates.length) return { center: [0, 10], zoom: minimumZoom };

  const horizontalPadding = Math.min(150, size.width * 0.24);
  const verticalPadding = Math.min(150, size.height * 0.28);
  let chosenZoom = maximumFitZoom;
  let bounds = { maximumX: 0, maximumY: 0, minimumX: 0, minimumY: 0 };

  for (let zoom = maximumFitZoom; zoom >= minimumZoom; zoom -= 1) {
    const points = coordinates.map((coordinate) => coordinateToWorld(coordinate, zoom));
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    bounds = {
      maximumX: Math.max(...xs),
      maximumY: Math.max(...ys),
      minimumX: Math.min(...xs),
      minimumY: Math.min(...ys),
    };
    chosenZoom = zoom;
    if (
      bounds.maximumX - bounds.minimumX <= size.width - horizontalPadding
      && bounds.maximumY - bounds.minimumY <= size.height - verticalPadding
    ) break;
  }

  return {
    center: worldToCoordinate(
      {
        x: (bounds.minimumX + bounds.maximumX) / 2,
        y: (bounds.minimumY + bounds.maximumY) / 2,
      },
      chosenZoom,
    ),
    zoom: chosenZoom,
  };
}

function terrainTileUrl(zoom: number, x: number, y: number) {
  const server = terrainServers[Math.abs(x + y) % terrainServers.length];
  return `https://${server}.tile.opentopomap.org/${zoom}/${x}/${y}.png`;
}

export function WineTerrainMap({
  ariaLabel,
  locations,
  maximumOverviewZoom = 7,
  onSelectLocation,
  selectedLocationId,
}: WineTerrainMapProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [size, setSize] = useState<MapSize>({ height: 470, width: 760 });
  const allCoordinates = useMemo(
    () => locations.map((location) => location.coordinates),
    [locations],
  );
  const locationSignature = locations
    .map((location) => `${location.id}:${location.coordinates.join(",")}`)
    .join("|");
  const [viewportState, setViewportState] = useState<MapViewportState>(() => {
    const selected = locations.find((location) => location.id === selectedLocationId);
    return {
      locationSignature,
      selectionId: selectedLocationId,
      viewport: selected
        ? {
            center: selected.coordinates,
            zoom: selected.tier === "estate" ? 13 : selected.tier === "subregion" ? 10 : 8,
          }
        : viewForCoordinates(allCoordinates, { height: 470, width: 760 }, maximumOverviewZoom),
    };
  });
  const selectionRef = useRef(selectedLocationId);

  useEffect(() => {
    selectionRef.current = selectedLocationId;
  }, [selectedLocationId]);

  const viewport = useMemo(() => {
    if (
      viewportState.locationSignature === locationSignature
      && viewportState.selectionId === selectedLocationId
    ) return viewportState.viewport;

    const selected = locations.find((location) => location.id === selectedLocationId);
    if (selected) {
      return {
        center: selected.coordinates,
        zoom: selected.tier === "estate" ? 13 : selected.tier === "subregion" ? 10 : 8,
      };
    }
    return viewForCoordinates(allCoordinates, size, maximumOverviewZoom);
  }, [
    allCoordinates,
    locationSignature,
    locations,
    maximumOverviewZoom,
    selectedLocationId,
    size,
    viewportState,
  ]);

  useEffect(() => {
    const element = mapElementRef.current;
    if (!element) return;
    const updateSize = () => {
      const nextSize = {
        height: Math.max(340, Math.round(element.clientHeight)),
        width: Math.max(280, Math.round(element.clientWidth)),
      };
      setSize(nextSize);
      if (!selectionRef.current) {
        setViewportState({
          locationSignature,
          selectionId: null,
          viewport: viewForCoordinates(allCoordinates, nextSize, maximumOverviewZoom),
        });
      }
    };
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, [allCoordinates, locationSignature, maximumOverviewZoom]);

  const tiles = useMemo(() => {
    const zoom = viewport.zoom;
    const tileCount = 2 ** zoom;
    const center = coordinateToWorld(viewport.center, zoom);
    const minimumTileX = Math.floor((center.x - size.width / 2) / tileSize) - 1;
    const maximumTileX = Math.floor((center.x + size.width / 2) / tileSize) + 1;
    const minimumTileY = Math.max(0, Math.floor((center.y - size.height / 2) / tileSize) - 1);
    const maximumTileY = Math.min(
      tileCount - 1,
      Math.floor((center.y + size.height / 2) / tileSize) + 1,
    );
    const nextTiles: Array<{ key: string; left: number; top: number; url: string }> = [];

    for (let rawX = minimumTileX; rawX <= maximumTileX; rawX += 1) {
      const x = ((rawX % tileCount) + tileCount) % tileCount;
      for (let y = minimumTileY; y <= maximumTileY; y += 1) {
        nextTiles.push({
          key: `${zoom}-${rawX}-${y}`,
          left: rawX * tileSize - (center.x - size.width / 2),
          top: y * tileSize - (center.y - size.height / 2),
          url: terrainTileUrl(zoom, x, y),
        });
      }
    }
    return nextTiles;
  }, [size, viewport]);

  const mappedLocations = useMemo(() => {
    const worldSize = tileSize * 2 ** viewport.zoom;
    const center = coordinateToWorld(viewport.center, viewport.zoom);
    return locations.map((location, index) => {
      const point = coordinateToWorld(location.coordinates, viewport.zoom);
      let horizontalOffset = point.x - center.x;
      if (horizontalOffset > worldSize / 2) horizontalOffset -= worldSize;
      if (horizontalOffset < -worldSize / 2) horizontalOffset += worldSize;
      const metresPerPixel =
        156_543.03392
        * Math.cos(location.coordinates[1] * (Math.PI / 180))
        / 2 ** viewport.zoom;
      const defaultRadius = location.tier === "estate" ? 0.45 : location.tier === "subregion" ? 10 : 55;
      const radiusInPixels = clamp(
        (location.radiusKm ?? defaultRadius) * 1_000 / Math.max(1, metresPerPixel),
        location.tier === "estate" ? 8 : 13,
        location.tier === "region" ? 105 : 75,
      );
      return {
        ...location,
        colour: locationColours[index % locationColours.length],
        isSelected: location.id === selectedLocationId,
        left: size.width / 2 + horizontalOffset,
        radiusInPixels,
        top: size.height / 2 + point.y - center.y,
      };
    });
  }, [locations, selectedLocationId, size, viewport]);

  const changeZoom = useCallback((change: number) => {
    setViewportState({
      locationSignature,
      selectionId: selectedLocationId,
      viewport: {
        ...viewport,
        zoom: clamp(viewport.zoom + change, minimumZoom, maximumZoom),
      },
    });
  }, [locationSignature, selectedLocationId, viewport]);

  const showOverview = useCallback(() => {
    setViewportState({
      locationSignature,
      selectionId: selectedLocationId,
      viewport: viewForCoordinates(allCoordinates, size, maximumOverviewZoom),
    });
  }, [allCoordinates, locationSignature, maximumOverviewZoom, selectedLocationId, size]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button, a")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      center: coordinateToWorld(viewport.center, viewport.zoom),
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      zoom: viewport.zoom,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setViewportState({
      locationSignature,
      selectionId: selectedLocationId,
      viewport: {
        center: worldToCoordinate(
          {
            x: drag.center.x - (event.clientX - drag.x),
            y: drag.center.y - (event.clientY - drag.y),
          },
          drag.zoom,
        ),
        zoom: drag.zoom,
      },
    });
  };

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button, a")) return;
    event.preventDefault();
    changeZoom(event.deltaY > 0 ? -1 : 1);
  };

  return (
    <section aria-label={ariaLabel} className="wine-terrain-map">
      <div
        className="wine-terrain-map-canvas"
        onDoubleClick={() => changeZoom(1)}
        onPointerCancel={finishDrag}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onWheel={handleWheel}
        ref={mapElementRef}
      >
        <div aria-hidden="true" className="wine-terrain-tiles">
          {tiles.map((tile) => (
            <img
              alt=""
              decoding="async"
              draggable={false}
              height={tileSize}
              key={tile.key}
              loading="eager"
              src={tile.url}
              style={{ left: tile.left, top: tile.top }}
              width={tileSize}
            />
          ))}
        </div>

        <div className="wine-terrain-locations">
          {mappedLocations.map((location) => {
            const style = {
              "--wine-location-colour": location.colour,
              "--wine-location-radius": `${location.radiusInPixels}px`,
              left: location.left,
              top: location.top,
              zIndex: location.isSelected ? 20 : location.tier === "estate" ? 8 : 3,
            } as CSSProperties;
            return (
              <button
                aria-label={`Open ${location.label}, ${location.detail}`}
                aria-pressed={location.isSelected}
                className="wine-terrain-marker"
                data-selected={location.isSelected || undefined}
                data-tier={location.tier}
                key={location.id}
                onClick={() => onSelectLocation(location.id)}
                style={style}
                type="button"
              >
                <span aria-hidden="true" className="wine-terrain-footprint" />
                <span aria-hidden="true" className="wine-terrain-pin" />
                <span className="wine-terrain-label">
                  <strong>{location.label}</strong>
                  <small>{location.detail}</small>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div aria-label="Terrain map controls" className="wine-terrain-controls" role="group">
        <span>Terrain</span>
        <button
          aria-label="Zoom out"
          disabled={viewport.zoom === minimumZoom}
          onClick={() => changeZoom(-1)}
          type="button"
        >
          −
        </button>
        <small aria-live="polite">z{viewport.zoom}</small>
        <button
          aria-label="Zoom in"
          disabled={viewport.zoom === maximumZoom}
          onClick={() => changeZoom(1)}
          type="button"
        >
          +
        </button>
        <button onClick={showOverview} type="button">Show all</button>
      </div>

      <p className="wine-terrain-help">Drag to pan · scroll or use +/− to zoom · outlines are orientation footprints.</p>
      <p className="wine-terrain-attribution">
        Map: <a href="https://opentopomap.org/about" rel="noreferrer" target="_blank">OpenTopoMap</a>
        {" · "}
        <a href="https://www.openstreetmap.org/copyright" rel="noreferrer" target="_blank">© OpenStreetMap contributors</a>
      </p>
    </section>
  );
}
