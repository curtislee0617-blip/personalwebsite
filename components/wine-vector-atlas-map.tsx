"use client";

import { useId, useMemo, useState, type KeyboardEvent } from "react";
import worldAtlas from "@d3-maps/atlas/world/countries/countries-50m";
import { geoBounds, geoMercator, geoPath, type GeoProjection } from "d3-geo";
import { feature, mesh } from "topojson-client";
import type {
  Feature,
  FeatureCollection,
  Geometry,
  LineString,
  MultiLineString,
  MultiPolygon,
  Polygon,
} from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import {
  layoutMapLabels,
  useWineMapViewport,
  WineMapViewportControls,
} from "@/components/wine-map-viewport";
import officialGeometryJson from "@/data/wine-map-geometry.json";
import regionBoundariesJson from "@/data/wine-region-boundaries.json";
import { wineMapCountryContext, type WineMapLine } from "@/data/wine-map-context";
import {
  bordeauxMapSites,
  type BordeauxMapSite,
  type BurgundyPlot,
  type WineCountry,
  type WineRegion,
} from "@/data/wine-guide-data";

type AtlasProperties = {
  id: string;
  name: string;
  name_long?: string;
};

type AtlasTopology = Topology<{
  features: GeometryCollection<AtlasProperties>;
}>;

type OfficialMapArea = {
  id: string;
  name: string;
  tier: "village" | "premier" | "grand" | "appellation";
  parent: string;
  label: [number, number];
  bbox: [number, number, number, number];
  polygons: number[][][][];
};

type OfficialGeometry = {
  source: {
    name: string;
    snapshot: string;
    projection: string;
    note: string;
  };
  burgundySouth: OfficialMapArea[];
  bordeaux: OfficialMapArea[];
};

type RegionBoundary = {
  precision: "regulatory" | "regulatory-group" | "administrative-redraw";
  source: string;
  featureCount: number;
  members: string[];
  label: [number, number];
  bbox: [number, number, number, number];
  polygons: number[][][][];
};

type RegionBoundaryDataset = {
  source: {
    built: string;
    note: string;
  };
  regions: Record<string, RegionBoundary>;
};

export type BurgundyBoundaryArea = OfficialMapArea & {
  classification: string;
  grapes: string;
};

const officialGeometry = officialGeometryJson as unknown as OfficialGeometry;
const regionBoundaryDataset = regionBoundariesJson as unknown as RegionBoundaryDataset;
const atlas = worldAtlas as unknown as AtlasTopology;
const countryFeatures = (
  feature(atlas, atlas.objects.features) as FeatureCollection<Geometry, AtlasProperties>
).features;

const vectorMapWidth = 900;
const vectorMapHeight = 555;

const burgundyCuratedPlotByAreaId: Record<string, string> = {
  "burgundy-meursault-perrieres": "meursault-perrieres",
  "burgundy-meursault-genevrieres": "meursault-genevrieres",
  "burgundy-montrachet": "montrachet",
  "burgundy-batard-montrachet": "batard-montrachet",
};

function grapesForBurgundyArea(area: OfficialMapArea) {
  if (area.tier === "grand") return "Chardonnay";
  if (area.parent === "Chassagne-Montrachet") {
    return "Chardonnay and Pinot Noir are authorised; the planting depends on the parcel and colour claimed";
  }
  if (area.parent === "Meursault") {
    return "Mainly Chardonnay; Pinot Noir can appear under the village rules or a neighbouring red appellation";
  }
  return "Mainly Chardonnay; red Puligny-Montrachet from Pinot Noir is possible but rare";
}

export const burgundyBoundaryAreas: BurgundyBoundaryArea[] = officialGeometry.burgundySouth.map((area) => ({
  ...area,
  classification: area.tier === "grand"
    ? "Grand Cru"
    : area.tier === "premier"
      ? "Premier Cru"
      : "Village appellation",
  grapes: grapesForBurgundyArea(area),
}));

const bordeauxBoundaryAreas = officialGeometry.bordeaux;

function signedRingArea(ring: number[][]) {
  let area = 0;
  for (let index = 0; index < ring.length - 1; index += 1) {
    const current = ring[index];
    const next = ring[index + 1];
    area += current[0] * next[1] - next[0] * current[1];
  }
  return area / 2;
}

function normalizePolygonWinding(polygons: number[][][][]): MultiPolygon["coordinates"] {
  return polygons.map((polygon) => polygon.map((ring, ringIndex) => {
    const isClockwise = signedRingArea(ring) < 0;
    const shouldBeClockwise = ringIndex === 0;
    return isClockwise === shouldBeClockwise ? ring : [...ring].reverse();
  }));
}

function asFeature(area: OfficialMapArea): Feature<MultiPolygon, OfficialMapArea> {
  return {
    type: "Feature",
    properties: area,
    geometry: {
      type: "MultiPolygon",
      coordinates: normalizePolygonWinding(area.polygons),
    },
  };
}

function lineFeature(line: WineMapLine): Feature<LineString> {
  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: line.coordinates,
    },
  };
}

function paddedRegionBounds(regions: WineRegion[]): Feature<Polygon> {
  const boundaries = regions
    .map((item) => regionBoundaryDataset.regions[item.id])
    .filter((item): item is RegionBoundary => Boolean(item));
  const minimumLongitude = Math.min(...boundaries.map((item) => item.bbox[0]));
  const maximumLongitude = Math.max(...boundaries.map((item) => item.bbox[2]));
  const minimumLatitude = Math.min(...boundaries.map((item) => item.bbox[1]));
  const maximumLatitude = Math.max(...boundaries.map((item) => item.bbox[3]));
  const longitudePadding = Math.max(1.3, (maximumLongitude - minimumLongitude) * 0.16);
  const latitudePadding = Math.max(0.9, (maximumLatitude - minimumLatitude) * 0.18);
  const west = minimumLongitude - longitudePadding;
  const east = maximumLongitude + longitudePadding;
  const south = minimumLatitude - latitudePadding;
  const north = maximumLatitude + latitudePadding;

  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [[
        [west, south],
        [west, north],
        [east, north],
        [east, south],
        [west, south],
      ]],
    },
  };
}

function polygonBounds(
  polygon: MultiPolygon["coordinates"][number],
): [number, number, number, number] {
  let west = Number.POSITIVE_INFINITY;
  let south = Number.POSITIVE_INFINITY;
  let east = Number.NEGATIVE_INFINITY;
  let north = Number.NEGATIVE_INFINITY;

  polygon.forEach((ring) => {
    ring.forEach(([longitude, latitude]) => {
      west = Math.min(west, longitude);
      south = Math.min(south, latitude);
      east = Math.max(east, longitude);
      north = Math.max(north, latitude);
    });
  });

  return [west, south, east, north];
}

function countryFeatureForMap(
  countryFeature: Feature<Geometry, AtlasProperties>,
  iso: string,
): Feature<Geometry, AtlasProperties> {
  if (iso !== "USA" || countryFeature.geometry.type !== "MultiPolygon") {
    return countryFeature;
  }

  const continentalCoordinates = countryFeature.geometry.coordinates.filter((polygon) => {
    const [west, south, east, north] = polygonBounds(polygon);
    return east > -125 && west < -66 && south < 50 && north > 24;
  });

  return {
    ...countryFeature,
    geometry: {
      ...countryFeature.geometry,
      coordinates: continentalCoordinates,
    },
  };
}

function madeiraFeatureForInset<T>(
  madeiraFeature: Feature<MultiPolygon, T>,
): Feature<MultiPolygon, T> {
  return {
    ...madeiraFeature,
    geometry: {
      ...madeiraFeature.geometry,
      coordinates: madeiraFeature.geometry.coordinates.filter(
        (polygon) => {
          const [west, , , north] = polygonBounds(polygon);
          return west < -16.7 && north > 32;
        },
      ),
    },
  };
}

function paddedOfficialBounds(
  areas: OfficialMapArea[],
  longitudePaddingRatio: number,
  latitudePaddingRatio: number,
): Feature<Polygon> {
  const west = Math.min(...areas.map((area) => area.bbox[0]));
  const south = Math.min(...areas.map((area) => area.bbox[1]));
  const east = Math.max(...areas.map((area) => area.bbox[2]));
  const north = Math.max(...areas.map((area) => area.bbox[3]));
  const longitudePadding = (east - west) * longitudePaddingRatio;
  const latitudePadding = (north - south) * latitudePaddingRatio;

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

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

type SatelliteTile = {
  height: number;
  href: string;
  key: string;
  width: number;
  x: number;
  y: number;
};

function satelliteTilesForProjection(
  projection: GeoProjection,
  width: number,
  height: number,
): SatelliteTile[] {
  const tilePixelSize = 256;
  const projectedWorldWidth = 2 * Math.PI * projection.scale();
  const zoom = clamp(
    Math.round(Math.log2(projectedWorldWidth / 220)),
    2,
    17,
  );
  const tileCount = 2 ** zoom;
  const worldPixelSize = tilePixelSize * tileCount;
  const svgUnitsPerPixel = projectedWorldWidth / worldPixelSize;
  const [translateX, translateY] = projection.translate();
  const projectedToTile = (value: number, translation: number) =>
    ((value - translation) / svgUnitsPerPixel + worldPixelSize / 2) / tilePixelSize;
  const minimumRawX = Math.floor(projectedToTile(0, translateX));
  const maximumRawX = Math.ceil(projectedToTile(width, translateX)) - 1;
  const minimumY = Math.max(0, Math.floor(projectedToTile(0, translateY)));
  const maximumY = Math.min(
    tileCount - 1,
    Math.ceil(projectedToTile(height, translateY)) - 1,
  );
  const tileSvgSize = tilePixelSize * svgUnitsPerPixel;
  const tiles: SatelliteTile[] = [];

  for (let rawX = minimumRawX; rawX <= maximumRawX; rawX += 1) {
    const wrappedX = ((rawX % tileCount) + tileCount) % tileCount;
    for (let y = minimumY; y <= maximumY; y += 1) {
      tiles.push({
        height: tileSvgSize + 0.35,
        href: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${wrappedX}`,
        key: `${zoom}-${rawX}-${y}`,
        width: tileSvgSize + 0.35,
        x: (rawX * tilePixelSize - worldPixelSize / 2) * svgUnitsPerPixel + translateX,
        y: (y * tilePixelSize - worldPixelSize / 2) * svgUnitsPerPixel + translateY,
      });
    }
  }

  return tiles;
}

function WineSatelliteTiles({
  height,
  projection,
  width,
}: {
  height: number;
  projection: GeoProjection;
  width: number;
}) {
  const tiles = useMemo(
    () => satelliteTilesForProjection(projection, width, height),
    [height, projection, width],
  );

  return (
    <g aria-hidden="true" className="wine-satellite-tiles">
      {tiles.map((tile) => (
        <image
          height={tile.height}
          href={tile.href}
          key={tile.key}
          preserveAspectRatio="none"
          width={tile.width}
          x={tile.x}
          y={tile.y}
        />
      ))}
      <rect className="wine-satellite-wash" height={height} width={width} />
    </g>
  );
}

function WineSatelliteAttribution() {
  return (
    <p className="wine-satellite-attribution">
      Imagery ©{" "}
      <a
        href="https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9"
        rel="noreferrer"
        target="_blank"
      >
        Esri, Maxar, Earthstar Geographics and the GIS User Community
      </a>
    </p>
  );
}

function asRegionBoundaryFeature(
  region: WineRegion,
  boundary: RegionBoundary,
): Feature<MultiPolygon, WineRegion & { boundary: RegionBoundary }> {
  return {
    type: "Feature",
    properties: { ...region, boundary },
    geometry: {
      type: "MultiPolygon",
      coordinates: normalizePolygonWinding(boundary.polygons),
    },
  };
}

function svgButtonKeyDown(
  event: KeyboardEvent<SVGPathElement | SVGGElement>,
  activate: () => void,
) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  activate();
}

function riverLabelPosition(
  line: WineMapLine,
  projection: ReturnType<typeof geoMercator>,
) {
  return projection(line.labelAt ?? line.coordinates[Math.floor(line.coordinates.length / 2)]);
}

function smoothWaterwayPath(line: WineMapLine, projection: GeoProjection) {
  const points = line.coordinates
    .map((coordinate) => projection(coordinate))
    .filter((point): point is [number, number] => Boolean(point));

  if (points.length < 2) return undefined;

  const format = (value: number) => Number(value.toFixed(2));
  let d = `M${format(points[0][0])} ${format(points[0][1])}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const before = points[index - 1] ?? points[index];
    const current = points[index];
    const next = points[index + 1];
    const after = points[index + 2] ?? next;
    const firstControl: [number, number] = [
      current[0] + (next[0] - before[0]) / 6,
      current[1] + (next[1] - before[1]) / 6,
    ];
    const secondControl: [number, number] = [
      next[0] - (after[0] - current[0]) / 6,
      next[1] - (after[1] - current[1]) / 6,
    ];

    d += `C${format(firstControl[0])} ${format(firstControl[1])} ${format(secondControl[0])} ${format(secondControl[1])} ${format(next[0])} ${format(next[1])}`;
  }

  return d;
}

export function WineCountryBoundaryMap({
  country,
  onSelectRegion,
  selectedRegionId,
}: {
  country: WineCountry;
  onSelectRegion: (region: WineRegion) => void;
  selectedRegionId: string | null;
}) {
  const rawId = useId();
  const clipId = `wine-country-clip-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const countryFeature = countryFeatures.find((item) => item.properties.id === country.iso);
  const context = wineMapCountryContext[country.iso];
  const viewport = useWineMapViewport(vectorMapWidth, vectorMapHeight);
  const mappedRegions = useMemo(() => country.regions.flatMap((region) => {
    const boundary = regionBoundaryDataset.regions[region.id];
    return boundary ? [{ region, boundary, feature: asRegionBoundaryFeature(region, boundary) }] : [];
  }), [country.regions]);
  const selectedMappedRegion = mappedRegions.find(({ region }) => region.id === selectedRegionId);
  const usesMadeiraInset = country.iso === "PRT" && selectedRegionId !== "pt-madeira";
  const mainMappedRegions = usesMadeiraInset
    ? mappedRegions.filter(({ region }) => region.id !== "pt-madeira")
    : mappedRegions;
  const madeiraInset = usesMadeiraInset
    ? mappedRegions.find(({ region }) => region.id === "pt-madeira")
    : undefined;
  const madeiraInsetFeature = madeiraInset
    ? madeiraFeatureForInset(madeiraInset.feature)
    : null;
  const projection = useMemo(() => {
    const target = selectedMappedRegion?.feature ?? paddedRegionBounds(
      country.iso === "PRT"
        ? country.regions.filter((region) => region.id !== "pt-madeira")
        : country.regions,
    );
    const horizontalPadding = selectedMappedRegion ? 78 : 30;
    const verticalPadding = selectedMappedRegion ? 46 : 28;

    return geoMercator().fitExtent(
      [
        [horizontalPadding, verticalPadding],
        [vectorMapWidth - horizontalPadding, vectorMapHeight - verticalPadding],
      ],
      target,
    );
  }, [country.iso, country.regions, selectedMappedRegion]);
  const path = useMemo(() => geoPath(projection), [projection]);
  const nearbyCountryFeatures = useMemo(
    () => {
      const boundaries = selectedMappedRegion
        ? [selectedMappedRegion.boundary]
        : country.regions
            .map((region) => regionBoundaryDataset.regions[region.id])
            .filter((boundary): boundary is RegionBoundary => Boolean(boundary));
      const west = Math.min(...boundaries.map((boundary) => boundary.bbox[0]));
      const south = Math.min(...boundaries.map((boundary) => boundary.bbox[1]));
      const east = Math.max(...boundaries.map((boundary) => boundary.bbox[2]));
      const north = Math.max(...boundaries.map((boundary) => boundary.bbox[3]));
      const longitudePadding = Math.max(4, (east - west) * 0.25);
      const latitudePadding = Math.max(3, (north - south) * 0.25);
      const contextWest = west - longitudePadding;
      const contextEast = east + longitudePadding;
      const contextSouth = south - latitudePadding;
      const contextNorth = north + latitudePadding;

      const longitudeOverlaps = (featureWest: number, featureEast: number) => {
        const featureRanges = featureWest <= featureEast
          ? [[featureWest, featureEast]]
          : [[featureWest, 180], [-180, featureEast]];
        return featureRanges.some(
          ([rangeWest, rangeEast]) => rangeEast >= contextWest && rangeWest <= contextEast,
        );
      };

      return countryFeatures
        .filter((item) => item.properties.id !== country.iso && item.properties.id !== "ATA")
        .map((item) => countryFeatureForMap(item, item.properties.id))
        .filter((item) => {
          const [[featureWest, featureSouth], [featureEast, featureNorth]] = geoBounds(item);
          return (
            featureNorth >= contextSouth
            && featureSouth <= contextNorth
            && longitudeOverlaps(featureWest, featureEast)
          );
        });
    },
    [country.iso, country.regions, selectedMappedRegion],
  );
  const sharedCountryBorders = useMemo(() => {
    const visibleCountryIds = new Set([
      country.iso,
      ...nearbyCountryFeatures.map((item) => item.properties.id),
    ]);
    return mesh(
      atlas,
      atlas.objects.features,
      (first, second) => {
        const firstId = (first.properties as Partial<AtlasProperties> | undefined)?.id;
        const secondId = (second.properties as Partial<AtlasProperties> | undefined)?.id;
        if (!firstId || !secondId) return false;
        return first !== second
          && visibleCountryIds.has(firstId)
          && visibleCountryIds.has(secondId);
      },
    ) as MultiLineString;
  }, [country.iso, nearbyCountryFeatures]);
  const madeiraProjection = madeiraInsetFeature
    ? geoMercator().fitExtent(
      [[48, vectorMapHeight - 105], [226, vectorMapHeight - 37]],
      madeiraInsetFeature,
    )
    : null;
  const madeiraPath = madeiraProjection ? geoPath(madeiraProjection) : null;

  if (!countryFeature) {
    return <div className="wine-vector-map-error">The country outline is not available in this atlas.</div>;
  }

  const mapCountryFeature = countryFeatureForMap(countryFeature, country.iso);
  const outlinePath = path(mapCountryFeature) ?? "";
  const denseLabels = country.regions.length > 10;
  const nearbyCountryLabels = nearbyCountryFeatures.flatMap((nearbyCountry) => {
    const [x, y] = path.centroid(nearbyCountry);
    return Number.isFinite(x)
      && Number.isFinite(y)
      && x >= 18
      && x <= vectorMapWidth - 18
      && y >= 18
      && y <= vectorMapHeight - 18
      ? [{
          id: nearbyCountry.properties.id,
          name: nearbyCountry.properties.name,
          x,
          y,
        }]
      : [];
  });
  const regionLabelData = mainMappedRegions.flatMap(({ region, boundary }) => {
    const point = projection(boundary.label);
    if (!point) return [];
    return [{
      labelWidth: Math.max(
        denseLabels ? 54 : 62,
        region.name.length * (denseLabels ? 5.7 : 6.4) + 16,
      ),
      point: point as [number, number],
      region,
    }];
  });
  const labelPlacements = layoutMapLabels(
    [
      ...regionLabelData.map(({ labelWidth, point, region }) => ({
        height: 21,
        id: `region:${region.id}`,
        point,
        priority: region.id === selectedRegionId ? 100 : 20,
        width: labelWidth,
      })),
      ...nearbyCountryLabels.map((label) => ({
        height: 14,
        id: `country:${label.id}`,
        placement: "centered" as const,
        point: [label.x, label.y] as [number, number],
        priority: 1,
        width: Math.max(44, label.name.length * 6.1 + 10),
      })),
    ],
    { scale: viewport.scale, x: viewport.x, y: viewport.y },
    vectorMapWidth,
    vectorMapHeight,
    {
      obstacles: [
        { bottom: 52, left: vectorMapWidth - 225, right: vectorMapWidth - 8, top: 8 },
        { bottom: vectorMapHeight - 7, left: 10, right: 286, top: vectorMapHeight - 37 },
      ],
    },
  );

  return (
    <div className="wine-vector-map-wrap">
      <div className="wine-map-viewport">
        <svg
          {...viewport.svgProps}
          aria-label={selectedMappedRegion
            ? `${selectedMappedRegion.region.name} regional boundary close-up. Drag within the map and use the controls to zoom.`
            : `${country.name} wine-region boundary atlas. Drag within the map and use the controls to zoom.`}
          aria-roledescription="interactive draggable map"
          className="wine-country-boundary-map"
          data-dense={denseLabels || undefined}
          data-map-layer="satellite"
          data-region-focus={selectedMappedRegion ? selectedMappedRegion.region.id : undefined}
          role="group"
          viewBox={`0 0 ${vectorMapWidth} ${vectorMapHeight}`}
        >
          <title>{country.name} wine regions, rivers and basic elevation guides</title>
          <defs>
            <clipPath id={clipId}>
              <path d={outlinePath} />
            </clipPath>
          </defs>
          <rect className="wine-vector-map-paper" height={vectorMapHeight} rx="22" width={vectorMapWidth} />

          <g className="wine-map-transform-layer" transform={viewport.transform}>
            <WineSatelliteTiles
              height={vectorMapHeight}
              projection={projection}
              width={vectorMapWidth}
            />
            <g clipPath={selectedMappedRegion ? undefined : `url(#${clipId})`}>
              <g aria-hidden="true" className="wine-country-contours">
                {context?.contours?.map((contour) => (
                  <path d={path(lineFeature(contour)) ?? undefined} key={`${contour.name}-${contour.elevation}`} />
                ))}
              </g>
              <g className="wine-country-region-shapes">
                {mainMappedRegions.map(({ region, boundary, feature: regionFeature }, index) => {
                  const isSelected = region.id === selectedRegionId;
                  const openRegion = () => onSelectRegion(region);
                  return (
                    <path
                      aria-label={`Open ${region.name}, ${region.grapes.slice(0, 3).join(", ")}`}
                      className="wine-country-region-shape"
                      d={path(regionFeature) ?? undefined}
                      data-colour-index={index % 6}
                      data-precision={boundary.precision}
                      data-selected={isSelected || undefined}
                      fillRule="evenodd"
                      key={region.id}
                      onClick={openRegion}
                      onKeyDown={(event) => svgButtonKeyDown(event, openRegion)}
                      role="button"
                      tabIndex={0}
                    >
                      <title>
                        {region.name} · {region.grapes.slice(0, 3).join(" · ")} ·{" "}
                        {boundary.featureCount} source {boundary.featureCount === 1 ? "shape" : "shapes"}
                      </title>
                    </path>
                  );
                })}
              </g>
            </g>

            <path
              aria-hidden="true"
              className="wine-country-shared-borders"
              d={path(sharedCountryBorders) ?? undefined}
            />
            <g aria-hidden="true" className="wine-country-neighbour-labels">
              {nearbyCountryLabels.map((label) => {
                const placement = labelPlacements.get(`country:${label.id}`);
                return placement && !placement.hidden ? (
                  <g
                    key={label.id}
                    transform={`translate(${label.x} ${label.y}) scale(${1 / viewport.scale}) translate(${placement.offsetX} ${placement.offsetY})`}
                  >
                    <text textAnchor="middle">{label.name}</text>
                  </g>
                ) : null;
              })}
            </g>

            {madeiraInset && madeiraPath ? (
              <g
                className="wine-country-inset"
                data-selected={madeiraInset.region.id === selectedRegionId || undefined}
              >
                <rect height="116" rx="12" width="208" x="33" y={vectorMapHeight - 136} />
                <g
                  transform={`translate(48 ${vectorMapHeight - 113}) scale(${1 / viewport.scale})`}
                >
                  <text className="wine-country-inset-title">Madeira · inset</text>
                </g>
                <path
                  aria-label={`Open ${madeiraInset.region.name}, ${madeiraInset.region.grapes.slice(0, 3).join(", ")}`}
                  className="wine-country-region-shape"
                  d={madeiraPath(madeiraInsetFeature ?? madeiraInset.feature) ?? undefined}
                  data-colour-index="2"
                  data-precision={madeiraInset.boundary.precision}
                  data-selected={madeiraInset.region.id === selectedRegionId || undefined}
                  fillRule="evenodd"
                  onClick={() => onSelectRegion(madeiraInset.region)}
                  onKeyDown={(event) => svgButtonKeyDown(
                    event,
                    () => onSelectRegion(madeiraInset.region),
                  )}
                  role="button"
                  tabIndex={0}
                >
                  <title>
                    Madeira · {madeiraInset.region.grapes.slice(0, 3).join(" · ")}
                  </title>
                </path>
              </g>
            ) : null}

            <g aria-hidden="true" className="wine-country-contour-labels">
              {context?.contours?.map((contour) => {
                const point = riverLabelPosition(contour, projection);
                return point ? (
                  <g
                    key={`${contour.name}-label`}
                    transform={`translate(${point[0]} ${point[1]}) scale(${1 / viewport.scale})`}
                  >
                    <text>{contour.elevation}</text>
                  </g>
                ) : null;
              })}
            </g>

            <g className="wine-country-region-labels">
              {regionLabelData.map(({ labelWidth, point, region }) => {
                const openRegion = () => onSelectRegion(region);
                const placement = labelPlacements.get(`region:${region.id}`);
                return placement && !placement.hidden ? (
                  <g
                    aria-label={`Open ${region.name}`}
                    data-selected={region.id === selectedRegionId || undefined}
                    key={`${region.id}-label`}
                    onClick={openRegion}
                    onKeyDown={(event) => svgButtonKeyDown(event, openRegion)}
                    role="button"
                    tabIndex={0}
                    transform={`translate(${point[0]} ${point[1]}) scale(${1 / viewport.scale}) translate(${placement.offsetX} ${placement.offsetY})`}
                  >
                    <rect height="21" rx="6" width={labelWidth} x={-labelWidth / 2} y="-12" />
                    <text textAnchor="middle" y="3">{region.name}</text>
                  </g>
                ) : null;
              })}
            </g>
          </g>
        </svg>
        <WineMapViewportControls
          onReset={viewport.reset}
          onZoomIn={viewport.zoomIn}
          onZoomOut={viewport.zoomOut}
          scale={viewport.scale}
        />
        <p className="wine-map-drag-hint">Drag to reorient · scroll or use + / − to zoom</p>
        <WineSatelliteAttribution />
      </div>

      <div className="wine-vector-map-key">
        <span><i data-layer="water" /> water</span>
        <span><i data-layer="region" /> appellation or GI footprint</span>
        <span><i data-layer="administrative" /> administrative atlas redraw</span>
        <span><i data-layer="contour" /> basic height guide</span>
        <p>
          Europe, Australia and the United States use open regulatory wine geometry. Other countries use real
          provincial, county or municipal lines grouped to explain the wine areas; those shapes are context, not
          legal appellation limits. Bordeaux and the south Côte de Beaune open into finer INAO boundaries.
        </p>
      </div>
    </div>
  );
}

const burgundyOverviewAreas: Array<{
  area: BurgundyPlot["area"];
  d: string;
  grapes: string;
  label: [number, number];
}> = [
  {
    area: "Chablis",
    d: "M506 47L580 31 646 59 633 120 580 148 512 126 477 83Z",
    grapes: "Chardonnay",
    label: [563, 84],
  },
  {
    area: "Côte de Nuits",
    d: "M394 168L438 157 467 199 452 260 468 322 447 386 416 414 386 375 397 319 379 254Z",
    grapes: "Pinot Noir",
    label: [419, 285],
  },
  {
    area: "Côte de Beaune",
    d: "M383 405L429 392 450 436 414 488 392 544 346 574 316 545 338 488 354 444Z",
    grapes: "Pinot Noir + Chardonnay",
    label: [376, 490],
  },
  {
    area: "Côte Chalonnaise",
    d: "M300 574L347 563 369 599 348 638 361 680 329 712 286 695 277 649Z",
    grapes: "Pinot Noir + Chardonnay + Aligoté",
    label: [319, 638],
  },
  {
    area: "Mâconnais",
    d: "M272 706L324 704 350 750 332 817 292 864 242 844 228 792 245 747Z",
    grapes: "Chardonnay",
    label: [289, 785],
  },
];

function BurgundyOverviewMap({
  onSelectArea,
  selectedArea,
}: {
  onSelectArea: (area: BurgundyPlot["area"]) => void;
  selectedArea: BurgundyPlot["area"];
}) {
  const viewport = useWineMapViewport(720, 900);

  return (
    <div className="wine-vector-map-wrap">
      <div className="wine-map-viewport">
        <svg
          {...viewport.svgProps}
          aria-label="Drawn overview of Burgundy wine regions. Drag to reposition and use the controls to zoom."
          aria-roledescription="interactive draggable map"
          className="wine-burgundy-overview-map"
          role="group"
          viewBox="0 0 720 900"
        >
          <title>Burgundy from Chablis to the Mâconnais</title>
          <rect className="wine-vector-map-paper" height="900" rx="22" width="720" />
          <g className="wine-map-transform-layer" transform={viewport.transform}>
        <g aria-hidden="true" className="wine-burgundy-elevation-bands">
          <path data-height="1000" d="M151 135C221 177 239 254 229 343c-11 95 13 181 52 259 40 81 30 165-15 250H79c29-96 32-187 9-273-22-84-16-173 21-267 26-67 40-126 42-177Z" />
          <path data-height="500" d="M232 130c83 46 97 116 77 209-19 92-4 179 45 262 43 73 41 153-7 241H238c48-87 52-168 11-243-44-81-58-167-41-259 18-94 8-164-31-210Z" />
          <text transform={`translate(103 169) scale(${1 / viewport.scale})`}>500–1,000 m</text>
          <text transform={`translate(238 181) scale(${1 / viewport.scale})`}>200–500 m</text>
        </g>
        <g aria-hidden="true" className="wine-burgundy-overview-water">
          <g data-waterway-size="major">
            <path className="wine-waterway-bank" d="M594 136C566 229 563 324 579 420c19 112 18 215-4 307-13 54-7 108 18 161" />
            <path className="wine-waterway-channel" d="M594 136C566 229 563 324 579 420c19 112 18 215-4 307-13 54-7 108 18 161" />
          </g>
          <text transform={`translate(602 524) scale(${1 / viewport.scale})`}>Saône</text>
          <g data-waterway-size="canal">
            <path className="wine-waterway-bank" d="M472 384C516 401 549 417 571 438" />
            <path className="wine-waterway-channel" d="M472 384C516 401 549 417 571 438" />
          </g>
          <text transform={`translate(480 373) scale(${1 / viewport.scale})`}>Canal de Bourgogne</text>
        </g>
        <g className="wine-burgundy-overview-areas">
          {burgundyOverviewAreas.map((item) => {
            const openArea = () => onSelectArea(item.area);
            return (
              <path
                aria-label={`Open ${item.area}, ${item.grapes}`}
                d={item.d}
                data-selected={item.area === selectedArea || undefined}
                key={item.area}
                onClick={openArea}
                onKeyDown={(event) => svgButtonKeyDown(event, openArea)}
                role="button"
                tabIndex={0}
              >
                <title>{item.area} · {item.grapes}</title>
              </path>
            );
          })}
        </g>
        <g className="wine-burgundy-overview-labels">
          {burgundyOverviewAreas.map((item) => (
            <g
              key={`${item.area}-label`}
              transform={`translate(${item.label[0]} ${item.label[1]}) scale(${1 / viewport.scale})`}
            >
              <text className="wine-burgundy-overview-name" textAnchor="middle">{item.area}</text>
              <text className="wine-burgundy-overview-grapes" textAnchor="middle" y="17">{item.grapes}</text>
            </g>
          ))}
          <text transform={`translate(467 160) scale(${1 / viewport.scale})`}>Dijon</text>
          <text transform={`translate(458 426) scale(${1 / viewport.scale})`}>Beaune</text>
          <text transform={`translate(373 576) scale(${1 / viewport.scale})`}>Chagny</text>
          <text transform={`translate(363 742) scale(${1 / viewport.scale})`}>Tournus</text>
          <text transform={`translate(355 855) scale(${1 / viewport.scale})`}>Mâcon</text>
        </g>
            <g aria-hidden="true" className="wine-burgundy-overview-villages">
              <text transform={`translate(463 226) scale(${1 / viewport.scale})`}>Gevrey-Chambertin</text>
              <text transform={`translate(468 311) scale(${1 / viewport.scale})`}>Vosne-Romanée</text>
              <text transform={`translate(464 364) scale(${1 / viewport.scale})`}>Nuits-Saint-Georges</text>
              <text transform={`translate(439 489) scale(${1 / viewport.scale})`}>Pommard</text>
              <text transform={`translate(423 526) scale(${1 / viewport.scale})`}>Meursault</text>
              <text transform={`translate(397 551) scale(${1 / viewport.scale})`}>Puligny-Montrachet</text>
            </g>
          </g>
        </svg>
        <WineMapViewportControls
          onReset={viewport.reset}
          onZoomIn={viewport.zoomIn}
          onZoomOut={viewport.zoomOut}
          scale={viewport.scale}
        />
        <p className="wine-map-drag-hint">Drag to reorient · scroll or use + / − to zoom</p>
      </div>
      <div className="wine-vector-map-key">
        <span><i data-layer="region" /> wine area</span>
        <span><i data-layer="river" /> river or canal</span>
        <span><i data-layer="contour" /> altitude band</span>
        <p>
          This overview follows Burgundy&apos;s real north–south sequence and broad slope pattern. Open the south
          Côte de Beaune view for the legal parcel geometry around Meursault, Puligny and Chassagne.
        </p>
      </div>
    </div>
  );
}

const burgundyRoad: WineMapLine = {
  name: "Route des Grands Crus",
  coordinates: [[4.779, 46.991], [4.771, 46.979], [4.758, 46.958], [4.748, 46.945], [4.733, 46.929], [4.727, 46.919]],
  labelAt: [4.759, 46.958],
};

const burgundyContours: Array<WineMapLine & { elevation: string }> = [
  { name: "Upper slope", elevation: "340 m", coordinates: [[4.714, 46.919], [4.718, 46.94], [4.727, 46.961], [4.744, 46.99]], labelAt: [4.727, 46.96] },
  { name: "Mid-upper slope", elevation: "300 m", coordinates: [[4.722, 46.919], [4.728, 46.941], [4.739, 46.965], [4.753, 46.991]], labelAt: [4.738, 46.964] },
  { name: "Mid slope", elevation: "260 m", coordinates: [[4.733, 46.919], [4.739, 46.941], [4.751, 46.966], [4.765, 46.991]], labelAt: [4.75, 46.966] },
  { name: "Lower slope", elevation: "220 m", coordinates: [[4.746, 46.919], [4.752, 46.942], [4.764, 46.968], [4.778, 46.991]], labelAt: [4.765, 46.968] },
];

const burgundyVillages: Array<{ name: string; coordinates: [number, number] }> = [
  { name: "Meursault", coordinates: [4.769, 46.978] },
  { name: "Puligny-Montrachet", coordinates: [4.753, 46.946] },
  { name: "Chassagne-Montrachet", coordinates: [4.727, 46.938] },
];

function BurgundySouthBoundaryMap({
  onSelectArea,
  selectedAreaId,
}: {
  onSelectArea: (area: BurgundyBoundaryArea) => void;
  selectedAreaId: string;
}) {
  const viewport = useWineMapViewport(vectorMapWidth, 760);
  const projection = useMemo(
    () => geoMercator().fitExtent(
      [[55, 28], [vectorMapWidth - 40, 724]],
      paddedOfficialBounds(burgundyBoundaryAreas, 0.09, 0.04),
    ),
    [],
  );
  const path = useMemo(() => geoPath(projection), [projection]);
  const orderedAreas = useMemo(
    () => [...burgundyBoundaryAreas].sort((first, second) => {
      const order = { village: 0, premier: 1, grand: 2, appellation: 0 };
      return order[first.tier] - order[second.tier];
    }),
    [],
  );
  const selectedArea = burgundyBoundaryAreas.find((area) => area.id === selectedAreaId);
  const grandCruCallouts = burgundyBoundaryAreas
    .filter((area) => area.tier === "grand")
    .map((area) => ({ area, point: projection(area.label) }))
    .filter((item): item is { area: BurgundyBoundaryArea; point: [number, number] } => Boolean(item.point))
    .sort((first, second) => first.point[1] - second.point[1]);
  const firstGrandCruLabelY = grandCruCallouts[0]
    ? clamp(grandCruCallouts[0].point[1] - 36, 210, 560)
    : 300;

  return (
    <div className="wine-vector-map-wrap">
      <div className="wine-map-viewport">
        <svg
          {...viewport.svgProps}
          aria-label="Official vineyard boundaries from Meursault through Puligny-Montrachet to Chassagne-Montrachet. Drag to reposition and use the controls to zoom."
          aria-roledescription="interactive draggable map"
          className="wine-burgundy-boundary-map"
          data-map-layer="satellite"
          role="group"
          viewBox={`0 0 ${vectorMapWidth} 760`}
        >
          <title>South Côte de Beaune official AOC parcel boundaries</title>
          <desc>
            Exact informative INAO parcel geometry for the three village appellations, their named premiers crus
            and the Montrachet grands crus. Click a coloured parcel to inspect its classification and grapes.
          </desc>
          <defs>
            <filter id="wine-burgundy-boundary-shadow" height="150%" width="150%" x="-25%" y="-25%">
              <feDropShadow dx="0" dy="3" floodColor="#2b2420" floodOpacity=".22" stdDeviation="4" />
            </filter>
          </defs>
          <rect className="wine-vector-map-paper" height="760" rx="22" width={vectorMapWidth} />
          <g className="wine-map-transform-layer" transform={viewport.transform}>
        <WineSatelliteTiles
          height={760}
          projection={projection}
          width={vectorMapWidth}
        />

        <g aria-hidden="true" className="wine-burgundy-exact-contours">
          {burgundyContours.map((contour) => (
            <path d={path(lineFeature(contour)) ?? undefined} key={contour.elevation} />
          ))}
          {burgundyContours.map((contour) => {
            const point = riverLabelPosition(contour, projection);
            return point ? (
              <g
                key={`${contour.elevation}-label`}
                transform={`translate(${point[0]} ${point[1]}) scale(${1 / viewport.scale})`}
              >
                <text>{contour.elevation}</text>
              </g>
            ) : null;
          })}
        </g>

        <g className="wine-burgundy-boundary-areas">
          {orderedAreas.map((area) => {
            const isSelected = area.id === selectedAreaId;
            const openArea = () => onSelectArea(area);
            return (
              <path
                aria-label={`Open ${area.name}, ${area.classification}, ${area.parent}`}
                className="wine-burgundy-boundary-area"
                d={path(asFeature(area)) ?? undefined}
                data-parent={area.parent}
                data-selected={isSelected || undefined}
                data-tier={area.tier}
                fillRule="evenodd"
                key={area.id}
                onClick={openArea}
                onKeyDown={(event) => svgButtonKeyDown(event, openArea)}
                role="button"
                tabIndex={0}
              >
                <title>{area.name} · {area.classification} · {area.grapes}</title>
              </path>
            );
          })}
        </g>

        <g aria-hidden="true" className="wine-burgundy-exact-road">
          <path d={path(lineFeature(burgundyRoad)) ?? undefined} />
          {(() => {
            const point = riverLabelPosition(burgundyRoad, projection);
            return point ? (
              <text transform={`translate(${point[0]} ${point[1]}) scale(${1 / viewport.scale})`}>
                Route des Grands Crus
              </text>
            ) : null;
          })()}
        </g>

        <g className="wine-burgundy-exact-villages">
          {burgundyVillages.map((village) => {
            const point = projection(village.coordinates);
            return point ? (
              <g
                key={village.name}
                transform={`translate(${point[0]} ${point[1]}) scale(${1 / viewport.scale})`}
              >
                <path d="M-5 0H5M0-5V5" />
                <text x="9" y="-5">{village.name}</text>
              </g>
            ) : null;
          })}
        </g>

        <g aria-hidden="true" className="wine-burgundy-grand-labels">
          {grandCruCallouts.map(({ area, point }, index) => {
            const labelX = 694;
            const labelY = firstGrandCruLabelY + index * 20;
            return (
              <g key={`${area.id}-label`}>
                <path d={`M${point[0]} ${point[1]}L${labelX - 9} ${labelY - 3}`} />
                <text transform={`translate(${labelX} ${labelY}) scale(${1 / viewport.scale})`}>
                  {area.name}
                </text>
              </g>
            );
          })}
        </g>

            {selectedArea ? (() => {
              const point = projection(selectedArea.label);
              if (!point) return null;
              const labelWidth = Math.max(116, selectedArea.name.length * 7 + 28);
              return (
                <g
                  aria-hidden="true"
                  className="wine-burgundy-selected-label"
                  transform={`translate(${clamp(point[0], labelWidth / 2 + 8, vectorMapWidth - labelWidth / 2 - 8)} ${clamp(point[1] - 17, 22, 730)}) scale(${1 / viewport.scale})`}
                >
                  <rect height="28" rx="8" width={labelWidth} x={-labelWidth / 2} y="-17" />
                  <text textAnchor="middle" y="2">{selectedArea.name}</text>
                </g>
              );
            })() : null}
          </g>
        </svg>
        <WineMapViewportControls
          onReset={viewport.reset}
          onZoomIn={viewport.zoomIn}
          onZoomOut={viewport.zoomOut}
          scale={viewport.scale}
        />
        <p className="wine-map-drag-hint">Drag to reorient · scroll or use + / − to zoom</p>
        <WineSatelliteAttribution />
      </div>

      <div className="wine-vector-map-key">
        <span><i data-layer="village" /> village AOC parcels</span>
        <span><i data-layer="premier" /> named Premier Cru</span>
        <span><i data-layer="grand" /> Grand Cru</span>
        <span><i data-layer="contour" /> broad elevation line</span>
        <p>
          The coloured geometry is the INAO&apos;s open parcel delimitation, simplified by only a few metres for
          the screen. The contour lines explain the broad west-to-east slope and are an orientation guide, not a
          land survey.
        </p>
      </div>
    </div>
  );
}

export function WineBurgundyBoundaryMap({
  onSelectArea,
  onSelectOverviewArea,
  selectedAreaId,
  selectedPlot,
  view,
  onViewChange,
}: {
  onSelectArea: (area: BurgundyBoundaryArea) => void;
  onSelectOverviewArea: (area: BurgundyPlot["area"]) => void;
  selectedAreaId: string;
  selectedPlot: BurgundyPlot;
  view: "overview" | "south";
  onViewChange: (view: "overview" | "south") => void;
}) {
  return (
    <div className="wine-burgundy-detail">
      <div className="wine-detail-map-switch" aria-label="Burgundy map view">
        <button
          aria-pressed={view === "overview"}
          onClick={() => onViewChange("overview")}
          type="button"
        >
          Burgundy overview
        </button>
        <button
          aria-pressed={view === "south"}
          onClick={() => onViewChange("south")}
          type="button"
        >
          Meursault → Chassagne
        </button>
      </div>
      {view === "overview" ? (
        <BurgundyOverviewMap
          onSelectArea={onSelectOverviewArea}
          selectedArea={selectedPlot.area}
        />
      ) : (
        <BurgundySouthBoundaryMap
          onSelectArea={onSelectArea}
          selectedAreaId={selectedAreaId}
        />
      )}
    </div>
  );
}

const bordeauxRivers: Array<WineMapLine & { size: "estuary" | "major" | "minor" }> = [
  { name: "Gironde", size: "estuary", coordinates: [[-0.98, 45.44], [-0.93, 45.4], [-0.84, 45.3], [-0.78, 45.22], [-0.69, 45.13], [-0.63, 45.06], [-0.58, 45.0]], labelAt: [-0.75, 45.2] },
  { name: "Garonne", size: "major", coordinates: [[-0.58, 44.99], [-0.57, 44.93], [-0.56, 44.86], [-0.5, 44.81], [-0.42, 44.75], [-0.36, 44.68], [-0.31, 44.61], [-0.25, 44.56], [-0.2, 44.51]], labelAt: [-0.42, 44.72] },
  { name: "Dordogne", size: "major", coordinates: [[-0.58, 44.99], [-0.49, 44.98], [-0.39, 44.97], [-0.29, 44.95], [-0.2, 44.91], [-0.1, 44.87], [0.02, 44.84], [0.09, 44.82], [0.16, 44.83]], labelAt: [-0.13, 44.93] },
  { name: "Isle", size: "minor", coordinates: [[-0.49, 45.05], [-0.41, 45.04], [-0.3, 45.04], [-0.24, 45.02], [-0.18, 45.0]], labelAt: [-0.31, 45.08] },
  { name: "Ciron", size: "minor", coordinates: [[-0.51, 44.47], [-0.47, 44.49], [-0.4, 44.53], [-0.37, 44.56], [-0.34, 44.59]], labelAt: [-0.41, 44.5] },
];

const bordeauxContours: Array<WineMapLine & { elevation: string }> = [
  { name: "Low terraces", elevation: "20 m", coordinates: [[-0.99, 45.37], [-0.78, 45.15], [-0.66, 44.95], [-0.64, 44.7]], labelAt: [-0.82, 45.16] },
  { name: "Gravel croupes", elevation: "50 m", coordinates: [[-0.9, 45.34], [-0.7, 45.09], [-0.56, 44.87], [-0.48, 44.63]], labelAt: [-0.67, 45.03] },
  { name: "Right-bank plateau", elevation: "100 m", coordinates: [[-0.45, 45.24], [-0.24, 45.08], [-0.05, 44.97], [0.15, 44.87]], labelAt: [-0.14, 45.03] },
];

function bankForBordeauxArea(areaId: string) {
  return bordeauxMapSites.find((site) => site.id === areaId)?.bank ?? "Between the rivers";
}

function bordeauxBboxArea(area: OfficialMapArea) {
  return (area.bbox[2] - area.bbox[0]) * (area.bbox[3] - area.bbox[1]);
}

export function WineBordeauxBoundaryMap({
  onSelect,
  selectedSite,
}: {
  onSelect: (site: BordeauxMapSite) => void;
  selectedSite: BordeauxMapSite;
}) {
  const [bank, setBank] = useState<"All" | BordeauxMapSite["bank"]>("All");
  const viewport = useWineMapViewport(vectorMapWidth, vectorMapHeight);
  const projection = useMemo(
    () => geoMercator().fitExtent(
      [[42, 28], [vectorMapWidth - 38, vectorMapHeight - 22]],
      paddedOfficialBounds(bordeauxBoundaryAreas, 0.04, 0.04),
    ),
    [],
  );
  const path = useMemo(() => geoPath(projection), [projection]);
  const visibleAreas = [...bordeauxBoundaryAreas]
    .filter((area) => bank === "All" || bankForBordeauxArea(area.id) === bank)
    .sort((first, second) => bordeauxBboxArea(second) - bordeauxBboxArea(first));
  const visibleEstates = bordeauxMapSites.filter(
    (site) => site.kind === "estate" && (bank === "All" || site.bank === bank),
  );
  const visibleAreaLabels = visibleAreas.flatMap((area) => {
    const site = bordeauxMapSites.find((item) => item.id === area.id);
    const point = site ? projection(site.coordinates) : null;
    return site && point
      ? [{ area, point: point as [number, number], site }]
      : [];
  });
  const riverLabelData = bordeauxRivers.flatMap((river) => {
    const point = riverLabelPosition(river, projection);
    return point ? [{ point: point as [number, number], river }] : [];
  });
  const estateLabelData = visibleEstates.flatMap((site) => {
    const point = projection(site.coordinates);
    const isSelected = selectedSite.id === site.id;
    return point && (viewport.scale >= 1.55 || isSelected)
      ? [{ isSelected, point: point as [number, number], site }]
      : [];
  });
  const bordeauxLabelPlacements = layoutMapLabels(
    [
      ...visibleAreaLabels.map(({ area, point }) => {
        const isSelected = selectedSite.id === area.id;
        return {
          height: isSelected ? 17 : 14,
          id: `area:${area.id}`,
          point,
          priority: isSelected ? 100 : 20,
          width: Math.max(42, area.name.length * (isSelected ? 7.2 : 6.2) + 10),
        };
      }),
      ...riverLabelData.map(({ point, river }) => ({
        height: 15,
        id: `river:${river.name}`,
        point,
        priority: river.size === "estuary" ? 55 : 45,
        width: Math.max(46, river.name.length * 6.4 + 12),
      })),
      ...estateLabelData.map(({ isSelected, point, site }) => ({
        height: isSelected ? 17 : 14,
        id: `estate:${site.id}`,
        point,
        priority: isSelected ? 120 : 10,
        width: Math.max(72, site.name.length * (isSelected ? 6.8 : 5.8) + 10),
      })),
    ],
    { scale: viewport.scale, x: viewport.x, y: viewport.y },
    vectorMapWidth,
    vectorMapHeight,
    {
      obstacles: [
        { bottom: 52, left: vectorMapWidth - 225, right: vectorMapWidth - 8, top: 8 },
        { bottom: vectorMapHeight - 7, left: 10, right: 286, top: vectorMapHeight - 37 },
      ],
    },
  );

  return (
    <div className="wine-bordeaux-detail-map">
      <div className="wine-detail-map-switch" aria-label="Filter Bordeaux boundary map by bank">
        {(["All", "Left Bank", "Right Bank", "Between the rivers"] as const).map((item) => (
          <button
            aria-pressed={bank === item}
            key={item}
            onClick={() => setBank(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>

      <div className="wine-vector-map-wrap">
        <div className="wine-map-viewport">
          <svg
            {...viewport.svgProps}
            aria-label="Official Bordeaux appellation parcel boundaries with rivers and estate locations. Drag to reposition and use the controls to zoom."
            aria-roledescription="interactive draggable map"
            className="wine-bordeaux-boundary-map"
            data-map-layer="satellite"
            role="group"
            viewBox={`0 0 ${vectorMapWidth} ${vectorMapHeight}`}
          >
            <title>Bordeaux banks, appellations, rivers and landmark estates</title>
            <desc>
              INAO parcel-delimitation geometry shows exact appellation vineyard areas. Diamond symbols mark a
              château location only and do not claim to show the estate&apos;s full vineyard holdings.
            </desc>
            <defs>
              <filter id="wine-bordeaux-boundary-shadow" height="150%" width="150%" x="-25%" y="-25%">
                <feDropShadow dx="0" dy="3" floodColor="#2b2420" floodOpacity=".2" stdDeviation="4" />
              </filter>
            </defs>
            <rect className="wine-vector-map-paper" height={vectorMapHeight} rx="22" width={vectorMapWidth} />
            <g className="wine-map-transform-layer" transform={viewport.transform}>
          <WineSatelliteTiles
            height={vectorMapHeight}
            projection={projection}
            width={vectorMapWidth}
          />

          <g aria-hidden="true" className="wine-bordeaux-contours">
            {bordeauxContours.map((contour) => (
              <path d={path(lineFeature(contour)) ?? undefined} key={contour.elevation} />
            ))}
            {bordeauxContours.map((contour) => {
              const point = riverLabelPosition(contour, projection);
              return point ? (
                <g
                  key={`${contour.elevation}-label`}
                  transform={`translate(${point[0]} ${point[1]}) scale(${1 / viewport.scale})`}
                >
                  <text>{contour.elevation}</text>
                </g>
              ) : null;
            })}
          </g>

          <g className="wine-bordeaux-boundary-areas">
            {visibleAreas.map((area) => {
              const site = bordeauxMapSites.find((item) => item.id === area.id);
              if (!site) return null;
              const openArea = () => onSelect(site);
              return (
                <path
                  aria-label={`Open ${area.name}, ${site.bank}, ${site.grapes}`}
                  className="wine-bordeaux-boundary-area"
                  d={path(asFeature(area)) ?? undefined}
                  data-bank={site.bank}
                  data-selected={selectedSite.id === area.id || undefined}
                  fillRule="evenodd"
                  key={area.id}
                  onClick={openArea}
                  onKeyDown={(event) => svgButtonKeyDown(event, openArea)}
                  role="button"
                  tabIndex={0}
                >
                  <title>{area.name} · {site.grapes}</title>
                </path>
              );
            })}
          </g>

          <g aria-hidden="true" className="wine-bordeaux-rivers">
            {bordeauxRivers.map((river) => {
              const riverPath = smoothWaterwayPath(river, projection);
              return (
                <g data-waterway-size={river.size} key={river.name}>
                  <path className="wine-waterway-bank" d={riverPath} />
                  <path className="wine-waterway-channel" d={riverPath} />
                </g>
              );
            })}
          </g>
          <g aria-hidden="true" className="wine-bordeaux-river-labels">
            {riverLabelData.map(({ point, river }) => {
              const placement = bordeauxLabelPlacements.get(`river:${river.name}`);
              return placement && !placement.hidden ? (
                <g
                  key={`${river.name}-label`}
                  transform={`translate(${point[0]} ${point[1]}) scale(${1 / viewport.scale}) translate(${placement.offsetX} ${placement.offsetY})`}
                >
                  <text textAnchor="middle">{river.name}</text>
                </g>
              ) : null;
            })}
          </g>

          <g className="wine-bordeaux-area-labels">
            {visibleAreaLabels.map(({ area, point }) => {
              const placement = bordeauxLabelPlacements.get(`area:${area.id}`);
              return placement && !placement.hidden ? (
                <text
                  data-selected={selectedSite.id === area.id || undefined}
                  key={`${area.id}-label`}
                  textAnchor="middle"
                  transform={`translate(${point[0]} ${point[1]}) scale(${1 / viewport.scale}) translate(${placement.offsetX} ${placement.offsetY})`}
                  y="3"
                >
                  {area.name}
                </text>
              ) : null;
            })}
          </g>

              <g className="wine-bordeaux-estates">
                {visibleEstates.map((site) => {
                  const point = projection(site.coordinates);
                  if (!point) return null;
                  const openSite = () => onSelect(site);
                  const isSelected = selectedSite.id === site.id;
                  const labelPlacement = bordeauxLabelPlacements.get(`estate:${site.id}`);
                  return (
                    <g
                      aria-label={`Open ${site.name}, ${site.classification}`}
                      data-selected={isSelected || undefined}
                      key={site.id}
                      onClick={openSite}
                      onKeyDown={(event) => svgButtonKeyDown(event, openSite)}
                      role="button"
                      tabIndex={0}
                      transform={`translate(${point[0]} ${point[1]}) scale(${1 / viewport.scale})`}
                    >
                      <path d="M0-7L7 0 0 7-7 0Z" />
                      {labelPlacement && !labelPlacement.hidden ? (
                        <text
                          textAnchor="middle"
                          transform={`translate(${labelPlacement.offsetX} ${labelPlacement.offsetY})`}
                          y="3"
                        >
                          {site.name}
                        </text>
                      ) : null}
                    </g>
                  );
                })}
              </g>
            </g>
          </svg>
          <WineMapViewportControls
            onReset={viewport.reset}
            onZoomIn={viewport.zoomIn}
            onZoomOut={viewport.zoomOut}
            scale={viewport.scale}
          />
          <p className="wine-map-drag-hint">Drag to reorient · scroll or use + / − to zoom</p>
          <WineSatelliteAttribution />
        </div>

        <div className="wine-vector-map-key">
          <span><i data-layer="water" /> water</span>
          <span><i data-layer="left-bank" /> Left Bank AOC parcels</span>
          <span><i data-layer="right-bank" /> Right Bank AOC parcels</span>
          <span><i data-layer="between" /> between the rivers</span>
          <span><i data-layer="estate" /> château location</span>
          <p>
            Appellation shapes use the INAO&apos;s informative parcel layer. Estate diamonds mark the château,
            not every plot it owns: holdings are fragmented, change over time and are not published as one
            equivalent national legal layer.
          </p>
        </div>
      </div>
    </div>
  );
}

export function curatedPlotIdForBurgundyArea(areaId: string) {
  return burgundyCuratedPlotByAreaId[areaId] ?? null;
}
