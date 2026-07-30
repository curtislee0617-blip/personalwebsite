"use client";

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

export type CoffeeMapLocation = {
  coordinates: Array<[number, number]>;
  detail: string;
  id: string;
  label: string;
};

type CoffeeCountryTerrainMapProps = {
  ariaLabel: string;
  context: "country" | "macro";
  locations: CoffeeMapLocation[];
  onSelectLocation: (locationId: string) => void;
  selectedLocationId: string | null;
};

type MapLayer = "terrain" | "satellite";

type MapSize = {
  height: number;
  width: number;
};

type MapViewport = {
  center: [number, number];
  zoom: number;
};

type MapViewportState = {
  selectionId: string | null;
  viewport: MapViewport;
};

type WorldPoint = {
  x: number;
  y: number;
};

type DragState = {
  center: WorldPoint;
  pointerId: number;
  x: number;
  y: number;
  zoom: number;
};

const tileSize = 256;
const minimumZoom = 2;
const maximumZoom = 10;
const maximumLatitude = 85.05112878;
const terrainServers = ["a", "b", "c"] as const;
const locationColours = [
  "#a95639",
  "#356b55",
  "#a47828",
  "#496a8d",
  "#7c4e70",
  "#607831",
  "#2f7173",
  "#8d5b34",
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
  const x = ((longitude + 180) / 360) * scale;
  const y =
    (1 - Math.asinh(Math.tan(latitudeRadians)) / Math.PI) / 2 * scale;

  return { x, y };
}

function worldToCoordinate(
  { x, y }: WorldPoint,
  zoom: number,
): [number, number] {
  const scale = tileSize * 2 ** zoom;
  const longitude = wrapLongitude((x / scale) * 360 - 180);
  const latitudeRadians = Math.atan(
    Math.sinh(Math.PI * (1 - (2 * y) / scale)),
  );

  return [longitude, latitudeRadians * (180 / Math.PI)];
}

function distanceInKilometres(
  first: [number, number],
  second: [number, number],
) {
  const [firstLongitude, firstLatitude] = first;
  const [secondLongitude, secondLatitude] = second;
  const latitudeDifference =
    (secondLatitude - firstLatitude) * (Math.PI / 180);
  const longitudeDifference =
    (secondLongitude - firstLongitude) * (Math.PI / 180);
  const firstLatitudeRadians = firstLatitude * (Math.PI / 180);
  const secondLatitudeRadians = secondLatitude * (Math.PI / 180);
  const haversine =
    Math.sin(latitudeDifference / 2) ** 2
    + Math.cos(firstLatitudeRadians)
      * Math.cos(secondLatitudeRadians)
      * Math.sin(longitudeDifference / 2) ** 2;

  return 6_371 * 2 * Math.atan2(
    Math.sqrt(haversine),
    Math.sqrt(1 - haversine),
  );
}

function footprintRadiusInKilometres(
  context: CoffeeCountryTerrainMapProps["context"],
  locations: CoffeeMapLocation[],
  locationId: string,
  coordinate: [number, number],
) {
  let nearestOtherLocation = Number.POSITIVE_INFINITY;

  for (const location of locations) {
    if (location.id === locationId) continue;
    for (const otherCoordinate of location.coordinates) {
      nearestOtherLocation = Math.min(
        nearestOtherLocation,
        distanceInKilometres(coordinate, otherCoordinate),
      );
    }
  }

  if (!Number.isFinite(nearestOtherLocation)) {
    return context === "macro" ? 180 : 45;
  }

  return context === "macro"
    ? clamp(nearestOtherLocation * 0.3, 55, 280)
    : clamp(nearestOtherLocation * 0.34, 16, 140);
}

function viewForCoordinates(
  coordinates: Array<[number, number]>,
  size: MapSize,
  maximumFitZoom: number,
): MapViewport {
  if (!coordinates.length) return { center: [0, 5], zoom: minimumZoom };

  const horizontalPadding = Math.min(112, size.width * 0.2);
  const verticalPadding = Math.min(126, size.height * 0.27);
  let chosenZoom = maximumFitZoom;
  let bounds = {
    maximumX: 0,
    maximumY: 0,
    minimumX: 0,
    minimumY: 0,
  };

  for (let zoom = maximumFitZoom; zoom >= minimumZoom; zoom -= 1) {
    const points = coordinates.map((coordinate) =>
      coordinateToWorld(coordinate, zoom)
    );
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
    ) {
      break;
    }
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

function tileUrl(layer: MapLayer, zoom: number, x: number, y: number) {
  if (layer === "satellite") {
    return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`;
  }

  const server = terrainServers[
    Math.abs(x + y) % terrainServers.length
  ];
  return `https://${server}.tile.opentopomap.org/${zoom}/${x}/${y}.png`;
}

export function CoffeeCountryTerrainMap({
  ariaLabel,
  context,
  locations,
  onSelectLocation,
  selectedLocationId,
}: CoffeeCountryTerrainMapProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const selectedLocationIdRef = useRef(selectedLocationId);
  const [layer, setLayer] = useState<MapLayer>("terrain");
  const [size, setSize] = useState<MapSize>({ height: 440, width: 760 });

  const allCoordinates = useMemo(
    () => locations.flatMap((location) => location.coordinates),
    [locations],
  );
  const maximumOverviewZoom = context === "macro" ? 5 : 7;
  const [viewportState, setViewportState] = useState<MapViewportState>(() => ({
    selectionId: selectedLocationId,
    viewport: viewForCoordinates(
      allCoordinates,
      { height: 440, width: 760 },
      maximumOverviewZoom,
    ),
  }));

  const viewport = useMemo(() => {
    if (viewportState.selectionId === selectedLocationId) {
      return viewportState.viewport;
    }

    const selectedLocation = locations.find(
      (location) => location.id === selectedLocationId,
    );

    return viewForCoordinates(
      selectedLocation?.coordinates ?? allCoordinates,
      size,
      selectedLocation ? (context === "macro" ? 7 : 9) : maximumOverviewZoom,
    );
  }, [
    allCoordinates,
    context,
    locations,
    maximumOverviewZoom,
    selectedLocationId,
    size,
    viewportState,
  ]);

  const showOverview = useCallback(() => {
    setViewportState({
      selectionId: selectedLocationId,
      viewport: viewForCoordinates(allCoordinates, size, maximumOverviewZoom),
    });
  }, [allCoordinates, maximumOverviewZoom, selectedLocationId, size]);

  useEffect(() => {
    selectedLocationIdRef.current = selectedLocationId;
  }, [selectedLocationId]);

  useEffect(() => {
    const element = mapElementRef.current;
    if (!element) return;

    const updateSize = () => {
      const nextWidth = Math.max(280, Math.round(element.clientWidth));
      const nextHeight = Math.max(320, Math.round(element.clientHeight));
      const nextSize = { height: nextHeight, width: nextWidth };
      setSize((current) => (
        current.width === nextWidth && current.height === nextHeight
          ? current
          : nextSize
      ));
      setViewportState({
        selectionId: selectedLocationIdRef.current,
        viewport: viewForCoordinates(
          allCoordinates,
          nextSize,
          maximumOverviewZoom,
        ),
      });
    };
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, [allCoordinates, maximumOverviewZoom]);

  const tiles = useMemo(() => {
    const zoom = viewport.zoom;
    const tileCount = 2 ** zoom;
    const center = coordinateToWorld(viewport.center, zoom);
    const minimumTileX = Math.floor((center.x - size.width / 2) / tileSize) - 1;
    const maximumTileX = Math.floor((center.x + size.width / 2) / tileSize) + 1;
    const minimumTileY = Math.max(
      0,
      Math.floor((center.y - size.height / 2) / tileSize) - 1,
    );
    const maximumTileY = Math.min(
      tileCount - 1,
      Math.floor((center.y + size.height / 2) / tileSize) + 1,
    );
    const nextTiles: Array<{
      key: string;
      left: number;
      top: number;
      url: string;
    }> = [];

    for (let rawX = minimumTileX; rawX <= maximumTileX; rawX += 1) {
      const x = ((rawX % tileCount) + tileCount) % tileCount;
      for (let y = minimumTileY; y <= maximumTileY; y += 1) {
        nextTiles.push({
          key: `${layer}-${zoom}-${rawX}-${y}`,
          left: rawX * tileSize - (center.x - size.width / 2),
          top: y * tileSize - (center.y - size.height / 2),
          url: tileUrl(layer, zoom, x, y),
        });
      }
    }

    return nextTiles;
  }, [layer, size, viewport]);

  const mappedLocations = useMemo(() => {
    const worldSize = tileSize * 2 ** viewport.zoom;
    const center = coordinateToWorld(viewport.center, viewport.zoom);

    return locations.flatMap((location, locationIndex) =>
      location.coordinates.map((coordinate, coordinateIndex) => {
        const point = coordinateToWorld(coordinate, viewport.zoom);
        let horizontalOffset = point.x - center.x;
        if (horizontalOffset > worldSize / 2) horizontalOffset -= worldSize;
        if (horizontalOffset < -worldSize / 2) horizontalOffset += worldSize;

        const latitude = coordinate[1];
        const metresPerPixel =
          156_543.03392
          * Math.cos(latitude * (Math.PI / 180))
          / 2 ** viewport.zoom;
        const radiusInPixels = clamp(
          footprintRadiusInKilometres(
            context,
            locations,
            location.id,
            coordinate,
          ) * 1_000 / Math.max(1, metresPerPixel),
          context === "macro" ? 18 : 13,
          context === "macro" ? 130 : 105,
        );

        return {
          colour: locationColours[locationIndex % locationColours.length],
          coordinateIndex,
          detail: location.detail,
          id: location.id,
          isSelected: location.id === selectedLocationId,
          label: location.label,
          left: size.width / 2 + horizontalOffset,
          radiusInPixels,
          top: size.height / 2 + point.y - center.y,
        };
      })
    );
  }, [context, locations, selectedLocationId, size, viewport]);

  const changeZoom = useCallback((change: number) => {
    setViewportState((current) => {
      const currentViewport =
        current.selectionId === selectedLocationId
          ? current.viewport
          : viewport;

      return {
        selectionId: selectedLocationId,
        viewport: {
          ...currentViewport,
          zoom: clamp(
            currentViewport.zoom + change,
            minimumZoom,
            maximumZoom,
          ),
        },
      };
    });
  }, [selectedLocationId, viewport]);

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
    <section
      aria-label={ariaLabel}
      className="coffee-country-terrain-map coffee-slippy-map"
      data-context={context}
      data-layer={layer}
    >
      <div
        className="coffee-terrain-map-canvas"
        onDoubleClick={() => changeZoom(1)}
        onPointerCancel={finishDrag}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onWheel={handleWheel}
        ref={mapElementRef}
      >
        <div aria-hidden="true" className="coffee-slippy-tiles">
          {tiles.map((tile) => (
            // Map tiles are already-sized raster assets; using a native image
            // keeps them eager and avoids routing third-party tiles through Next.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
              className="coffee-slippy-tile"
              decoding="async"
              draggable={false}
              height={tileSize}
              key={tile.key}
              loading="eager"
              src={tile.url}
              style={{
                left: tile.left,
                top: tile.top,
              }}
              width={tileSize}
            />
          ))}
        </div>

        <div className="coffee-slippy-locations">
          {mappedLocations.map((location) => {
            const style = {
              "--coffee-location-colour": location.colour,
              "--coffee-location-radius": `${location.radiusInPixels}px`,
              left: location.left,
              top: location.top,
              zIndex: location.isSelected ? 20 : 3,
            } as CSSProperties;

            return (
              <button
                aria-label={`Open ${location.label}, ${location.detail}`}
                aria-pressed={location.isSelected}
                className="coffee-slippy-marker"
                data-secondary={location.coordinateIndex > 0 || undefined}
                data-selected={location.isSelected || undefined}
                key={`${location.id}-${location.coordinateIndex}`}
                onClick={() => onSelectLocation(location.id)}
                style={style}
                type="button"
              >
                <span aria-hidden="true" className="coffee-slippy-footprint" />
                <span aria-hidden="true" className="coffee-slippy-pin" />
                {location.coordinateIndex === 0 ? (
                  <span className="coffee-slippy-label">
                    <strong>{location.label}</strong>
                    <small>{location.detail}</small>
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

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
        <div className="coffee-map-zoom-controls">
          <button
            aria-label="Zoom out"
            disabled={viewport.zoom === minimumZoom}
            onClick={() => changeZoom(-1)}
            type="button"
          >
            −
          </button>
          <span aria-live="polite">z{viewport.zoom}</span>
          <button
            aria-label="Zoom in"
            disabled={viewport.zoom === maximumZoom}
            onClick={() => changeZoom(1)}
            type="button"
          >
            +
          </button>
        </div>
        <button onClick={showOverview} type="button">Show all</button>
      </div>

      <p className="coffee-terrain-map-legend">
        Drag to pan · scroll or use +/− to zoom · shaded circles are approximate growing areas.
      </p>

      <p className="coffee-map-attribution">
        {layer === "terrain" ? (
          <>
            Map:{" "}
            <a href="https://opentopomap.org/about" rel="noreferrer" target="_blank">
              OpenTopoMap
            </a>
            {" · "}
            <a href="https://www.openstreetmap.org/copyright" rel="noreferrer" target="_blank">
              © OpenStreetMap contributors
            </a>
          </>
        ) : (
          <>
            Imagery:{" "}
            <a
              href="https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9"
              rel="noreferrer"
              target="_blank"
            >
              Esri, Maxar, Earthstar Geographics and the GIS User Community
            </a>
          </>
        )}
      </p>
    </section>
  );
}
