"use client";

import { useId, useMemo, type KeyboardEvent } from "react";
import worldAtlas from "@d3-maps/atlas/world/countries/countries-110m";
import { geoBounds, geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type {
  Feature,
  FeatureCollection,
  Geometry,
  Polygon,
} from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import {
  layoutMapLabels,
  useWineMapViewport,
  WineMapViewportControls,
} from "@/components/wine-map-viewport";

export type CoffeeMapLocation = {
  coordinates: Array<[number, number]>;
  detail: string;
  id: string;
  label: string;
};

type CoffeeAltitudeMapProps = {
  ariaLabel: string;
  context: "country" | "macro";
  focusIso?: string;
  locations: CoffeeMapLocation[];
  onSelectLocation: (locationId: string) => void;
  selectedLocationId: string | null;
};

type AtlasProperties = {
  id: string;
  name: string;
  name_long?: string;
};

type AtlasTopology = Topology<{
  features: GeometryCollection<AtlasProperties>;
}>;

type AltitudeRange = {
  maximum: number;
  minimum: number;
};

const mapWidth = 900;
const mapHeight = 540;
const atlas = worldAtlas as unknown as AtlasTopology;
const worldFeatures = (
  feature(atlas, atlas.objects.features) as FeatureCollection<Geometry, AtlasProperties>
).features;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function paddedLocationBounds(
  locations: CoffeeMapLocation[],
  context: CoffeeAltitudeMapProps["context"],
): Feature<Polygon> {
  const coordinates = locations.flatMap((location) => location.coordinates);
  if (!coordinates.length) {
    return {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [[[-15, -8], [-15, 18], [15, 18], [15, -8], [-15, -8]]],
      },
    };
  }

  const west = Math.min(...coordinates.map(([longitude]) => longitude));
  const east = Math.max(...coordinates.map(([longitude]) => longitude));
  const south = Math.min(...coordinates.map(([, latitude]) => latitude));
  const north = Math.max(...coordinates.map(([, latitude]) => latitude));
  const longitudePadding = Math.max(
    context === "macro" ? 3.8 : 0.85,
    (east - west) * (context === "macro" ? 0.18 : 0.28),
  );
  const latitudePadding = Math.max(
    context === "macro" ? 2.8 : 0.7,
    (north - south) * (context === "macro" ? 0.22 : 0.32),
  );

  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [[
        [west - longitudePadding, south - latitudePadding],
        [west - longitudePadding, north + latitudePadding],
        [east + longitudePadding, north + latitudePadding],
        [east + longitudePadding, south - latitudePadding],
        [west - longitudePadding, south - latitudePadding],
      ]],
    },
  };
}

function altitudeRange(detail: string): AltitudeRange {
  const match = detail.match(/([\d,]+)(?:\s*[–-]\s*([\d,]+))?\s*m\b/i);
  if (!match) return { minimum: 0, maximum: 1_000 };

  const first = Number(match[1].replace(/,/g, ""));
  const second = match[2] ? Number(match[2].replace(/,/g, "")) : null;
  if (second !== null) {
    return {
      minimum: Math.min(first, second),
      maximum: Math.max(first, second),
    };
  }

  return {
    minimum: /\blowland\b/i.test(detail) ? 0 : Math.max(0, first - 300),
    maximum: first,
  };
}

function altitudeLevels(range: AltitudeRange) {
  const midpoint = Math.round(((range.minimum + range.maximum) / 2) / 50) * 50;
  return Array.from(new Set([range.minimum, midpoint, range.maximum]))
    .sort((first, second) => first - second);
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function smoothClosedPath(points: Array<[number, number]>) {
  if (points.length < 3) return "";
  const midpoint = (
    first: [number, number],
    second: [number, number],
  ): [number, number] => [
    (first[0] + second[0]) / 2,
    (first[1] + second[1]) / 2,
  ];
  const format = (value: number) => Number(value.toFixed(2));
  const startingPoint = midpoint(points[points.length - 1], points[0]);
  let d = `M${format(startingPoint[0])} ${format(startingPoint[1])}`;

  points.forEach((point, index) => {
    const nextPoint = points[(index + 1) % points.length];
    const nextMidpoint = midpoint(point, nextPoint);
    d += `Q${format(point[0])} ${format(point[1])} ${format(nextMidpoint[0])} ${format(nextMidpoint[1])}`;
  });

  return `${d}Z`;
}

function contourPath(
  center: [number, number],
  radius: number,
  seed: number,
  levelIndex: number,
) {
  const pointCount = 28;
  const points = Array.from({ length: pointCount }, (_, index) => {
    const angle = (index / pointCount) * Math.PI * 2;
    const wobble =
      1
      + Math.sin(angle * 3 + seed * 0.017 + levelIndex) * 0.055
      + Math.cos(angle * 5 + seed * 0.011) * 0.035;
    return [
      center[0] + Math.cos(angle) * radius * wobble,
      center[1] + Math.sin(angle) * radius * 0.68 * wobble,
    ] as [number, number];
  });

  return smoothClosedPath(points);
}

function mapKeyDown(
  event: KeyboardEvent<SVGGElement>,
  activate: () => void,
) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  activate();
}

export function CoffeeAltitudeMap({
  ariaLabel,
  context,
  focusIso,
  locations,
  onSelectLocation,
  selectedLocationId,
}: CoffeeAltitudeMapProps) {
  const rawId = useId();
  const clipId = `coffee-altitude-clip-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const viewport = useWineMapViewport(mapWidth, mapHeight);
  const boundsFeature = useMemo(
    () => paddedLocationBounds(locations, context),
    [context, locations],
  );
  const projection = useMemo(
    () => geoMercator().fitExtent(
      [[34, 28], [mapWidth - 34, mapHeight - 34]],
      boundsFeature,
    ),
    [boundsFeature],
  );
  const path = useMemo(() => geoPath(projection), [projection]);
  const [[contextWest, contextSouth], [contextEast, contextNorth]] = geoBounds(boundsFeature);
  const visibleCountries = useMemo(
    () => worldFeatures.filter((country) => {
      const [[west, south], [east, north]] = geoBounds(country);
      return (
        east >= contextWest
        && west <= contextEast
        && north >= contextSouth
        && south <= contextNorth
      );
    }),
    [contextEast, contextNorth, contextSouth, contextWest],
  );
  const highlightedCountryIds = useMemo(
    () => new Set(
      focusIso
        ? [focusIso]
        : locations
          .map((location) => location.id)
          .filter((id) => /^[A-Z]{3}$/.test(id)),
    ),
    [focusIso, locations],
  );
  const projectedCoordinates = useMemo(
    () => locations.flatMap((location, locationIndex) =>
      location.coordinates.flatMap((coordinate, coordinateIndex) => {
        const point = projection(coordinate);
        return point
          ? [{
              coordinateIndex,
              location,
              locationIndex,
              point: point as [number, number],
            }]
          : [];
      })
    ),
    [locations, projection],
  );
  const mappedLocations = useMemo(
    () => projectedCoordinates.map((item, itemIndex) => {
      let nearestDistance = Number.POSITIVE_INFINITY;
      projectedCoordinates.forEach((other, otherIndex) => {
        if (itemIndex === otherIndex || other.location.id === item.location.id) return;
        nearestDistance = Math.min(
          nearestDistance,
          Math.hypot(item.point[0] - other.point[0], item.point[1] - other.point[1]),
        );
      });
      const radius = Number.isFinite(nearestDistance)
        ? clamp(
            nearestDistance * 0.34,
            context === "macro" ? 15 : 24,
            context === "macro" ? 42 : 76,
          )
        : context === "macro" ? 38 : 74;
      const levels = altitudeLevels(altitudeRange(item.location.detail));
      const seed = hashString(`${item.location.id}-${item.coordinateIndex}`);
      const nameLabelWidth = Math.min(
        174,
        Math.max(82, item.location.label.length * 6.2 + 22),
      );
      const detailLabelWidth = Math.min(
        248,
        Math.max(nameLabelWidth, item.location.detail.length * 4.25 + 22),
      );
      const contours = levels.map((altitude, levelIndex) => {
        const progress = levels.length === 1 ? 0 : levelIndex / (levels.length - 1);
        const levelRadius = radius * (1 - progress * 0.55);
        return {
          altitude,
          d: contourPath(item.point, levelRadius, seed, levelIndex),
          labelX: item.point[0] + levelRadius * 0.72,
          labelY: item.point[1] - levelRadius * 0.38,
        };
      });

      return {
        ...item,
        contours,
        detailLabelWidth,
        isSelected: item.location.id === selectedLocationId,
        nameLabelWidth,
        radius,
      };
    }),
    [context, projectedCoordinates, selectedLocationId],
  );
  const locationLabelPlacements = useMemo(
    () => layoutMapLabels(
      mappedLocations.flatMap((mappedLocation) => {
        if (mappedLocation.coordinateIndex > 0) return [];
        const showDetail = viewport.scale >= 1.55 || mappedLocation.isSelected;
        return [{
          height: showDetail ? 31 : 20,
          id: mappedLocation.location.id,
          point: mappedLocation.point,
          priority: mappedLocation.isSelected ? 100 : 10,
          width: showDetail
            ? mappedLocation.detailLabelWidth
            : mappedLocation.nameLabelWidth,
        }];
      }),
      { scale: viewport.scale, x: viewport.x, y: viewport.y },
      mapWidth,
      mapHeight,
      {
        obstacles: [
          { bottom: 52, left: mapWidth - 225, right: mapWidth - 8, top: 8 },
          { bottom: mapHeight - 7, left: 10, right: 286, top: mapHeight - 37 },
        ],
      },
    ),
    [mappedLocations, viewport.scale, viewport.x, viewport.y],
  );

  return (
    <section
      aria-label={ariaLabel}
      className="coffee-altitude-map"
      data-context={context}
    >
      <div className="coffee-altitude-map-viewport">
        <svg
          {...viewport.svgProps}
          aria-label={ariaLabel}
          aria-roledescription="interactive draggable map"
          className="coffee-altitude-map-svg"
          role="group"
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
        >
          <title>{ariaLabel}</title>
          <defs>
            <clipPath id={clipId}>
              <rect height={mapHeight} rx="22" width={mapWidth} />
            </clipPath>
          </defs>
          <rect className="coffee-altitude-map-paper" height={mapHeight} rx="22" width={mapWidth} />

          <g clipPath={`url(#${clipId})`}>
            <g className="coffee-altitude-map-transform" transform={viewport.transform}>
              <g aria-hidden="true" className="coffee-altitude-countries">
                {visibleCountries.map((country) => (
                  <path
                    d={path(country) ?? undefined}
                    data-focus={highlightedCountryIds.has(country.properties.id) || undefined}
                    key={country.properties.id}
                  />
                ))}
              </g>

              <g className="coffee-altitude-locations">
                {mappedLocations.map((mappedLocation) => {
                  const openLocation = () => onSelectLocation(mappedLocation.location.id);
                  const showDetail = viewport.scale >= 1.55 || mappedLocation.isSelected;
                  const labelWidth = showDetail
                    ? mappedLocation.detailLabelWidth
                    : mappedLocation.nameLabelWidth;
                  const labelPlacement = locationLabelPlacements.get(
                    mappedLocation.location.id,
                  );
                  return (
                    <g
                      aria-label={`Open ${mappedLocation.location.label}, ${mappedLocation.location.detail}`}
                      className="coffee-altitude-location"
                      data-colour-index={mappedLocation.locationIndex % 6}
                      data-secondary={mappedLocation.coordinateIndex > 0 || undefined}
                      data-selected={mappedLocation.isSelected || undefined}
                      key={`${mappedLocation.location.id}-${mappedLocation.coordinateIndex}`}
                      onClick={openLocation}
                      onKeyDown={(event) => mapKeyDown(event, openLocation)}
                      role="button"
                      tabIndex={0}
                    >
                      <path
                        className="coffee-altitude-footprint"
                        d={mappedLocation.contours[0]?.d}
                      />
                      {mappedLocation.contours.map((contour, contourIndex) => (
                        <g aria-hidden="true" key={contour.altitude}>
                          <path
                            className="coffee-altitude-contour"
                            d={contour.d}
                            data-major={contourIndex === 0 || contourIndex === mappedLocation.contours.length - 1 || undefined}
                          />
                          {context === "country"
                          || contourIndex === 0
                          || viewport.scale >= 1.8 ? (
                            <g
                              transform={`translate(${contour.labelX} ${contour.labelY}) scale(${1 / viewport.scale})`}
                            >
                              <text className="coffee-altitude-contour-label">
                                {contour.altitude.toLocaleString()} m
                              </text>
                            </g>
                          ) : null}
                        </g>
                      ))}
                      <g
                        transform={`translate(${mappedLocation.point[0]} ${mappedLocation.point[1]}) scale(${1 / viewport.scale})`}
                      >
                        <circle
                          className="coffee-altitude-location-point"
                          r="3.8"
                        />
                      </g>
                      {mappedLocation.coordinateIndex === 0
                      && labelPlacement
                      && !labelPlacement.hidden ? (
                        <g
                          className="coffee-altitude-location-label"
                          data-detail={showDetail || undefined}
                          transform={`translate(${mappedLocation.point[0]} ${mappedLocation.point[1]}) scale(${1 / viewport.scale}) translate(${labelPlacement.offsetX} ${labelPlacement.offsetY})`}
                        >
                          <rect
                            height={showDetail ? 31 : 20}
                            rx="7"
                            width={labelWidth}
                            x={-labelWidth / 2}
                            y={showDetail ? -18 : -13}
                          />
                          <text textAnchor="middle" y={showDetail ? -5 : 2}>
                            {mappedLocation.location.label}
                          </text>
                          {showDetail ? (
                            <text className="is-detail" textAnchor="middle" y="7">
                              {mappedLocation.location.detail}
                            </text>
                          ) : null}
                        </g>
                      ) : null}
                    </g>
                  );
                })}
              </g>
            </g>
          </g>
        </svg>

        <WineMapViewportControls
          onReset={viewport.reset}
          onZoomIn={viewport.zoomIn}
          onZoomOut={viewport.zoomOut}
          scale={viewport.scale}
        />
        <p className="coffee-altitude-map-hint">Drag to reorient · scroll or use + / − to zoom</p>
      </div>

      <div className="coffee-altitude-map-key">
        <span><i data-layer="water" /> water</span>
        <span><i data-layer="origin" /> mapped growing area</span>
        <span><i data-layer="contour" /> altitude guide</span>
        <span><i data-layer="boundary" /> country boundary</span>
        <p>
          Altitude lines are schematic guides built from each published growing range, not surveyed topographic contours.
        </p>
      </div>
    </section>
  );
}
