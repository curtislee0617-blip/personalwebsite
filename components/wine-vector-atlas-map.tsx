"use client";

import { useId, useMemo, useState, type KeyboardEvent } from "react";
import worldAtlas from "@d3-maps/atlas/world/countries/countries-110m";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type {
  Feature,
  FeatureCollection,
  Geometry,
  LineString,
  MultiPolygon,
  Polygon,
} from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import {
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

function asFeature(area: OfficialMapArea): Feature<MultiPolygon, OfficialMapArea> {
  return {
    type: "Feature",
    properties: area,
    geometry: {
      type: "MultiPolygon",
      coordinates: area.polygons as MultiPolygon["coordinates"],
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

function asRegionBoundaryFeature(
  region: WineRegion,
  boundary: RegionBoundary,
): Feature<MultiPolygon, WineRegion & { boundary: RegionBoundary }> {
  return {
    type: "Feature",
    properties: { ...region, boundary },
    geometry: {
      type: "MultiPolygon",
      coordinates: boundary.polygons as MultiPolygon["coordinates"],
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
  const usesMadeiraInset = country.iso === "PRT";
  const mappedRegions = country.regions.flatMap((region) => {
    const boundary = regionBoundaryDataset.regions[region.id];
    return boundary ? [{ region, boundary, feature: asRegionBoundaryFeature(region, boundary) }] : [];
  });
  const mainMappedRegions = usesMadeiraInset
    ? mappedRegions.filter(({ region }) => region.id !== "pt-madeira")
    : mappedRegions;
  const madeiraInset = usesMadeiraInset
    ? mappedRegions.find(({ region }) => region.id === "pt-madeira")
    : undefined;
  const madeiraInsetFeature = madeiraInset
    ? madeiraFeatureForInset(madeiraInset.feature)
    : null;
  const projection = useMemo(
    () => geoMercator().fitExtent(
      [[30, 28], [vectorMapWidth - 30, vectorMapHeight - 28]],
      paddedRegionBounds(
        country.iso === "PRT"
          ? country.regions.filter((region) => region.id !== "pt-madeira")
          : country.regions,
      ),
    ),
    [country.iso, country.regions],
  );
  const path = useMemo(() => geoPath(projection), [projection]);
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

  return (
    <div className="wine-vector-map-wrap">
      <div className="wine-map-viewport">
        <svg
          {...viewport.svgProps}
          aria-label={`${country.name} wine-region boundary atlas. Drag to reposition and use the controls to zoom.`}
          aria-roledescription="interactive draggable map"
          className="wine-country-boundary-map"
          data-dense={denseLabels || undefined}
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
            <g clipPath={`url(#${clipId})`}>
              <path className="wine-country-land" d={outlinePath} />
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
              <g aria-hidden="true" className="wine-country-rivers">
                {context?.rivers?.map((river) => (
                  <path d={path(lineFeature(river)) ?? undefined} key={river.name} />
                ))}
              </g>
            </g>

            <path aria-hidden="true" className="wine-country-border" d={outlinePath} />

            {madeiraInset && madeiraPath ? (
              <g
                className="wine-country-inset"
                data-selected={madeiraInset.region.id === selectedRegionId || undefined}
              >
                <rect height="116" rx="12" width="208" x="33" y={vectorMapHeight - 136} />
                <text className="wine-country-inset-title" x="48" y={vectorMapHeight - 113}>
                  Madeira · inset
                </text>
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
                  <text key={`${contour.name}-label`} x={point[0]} y={point[1]}>
                    {contour.elevation}
                  </text>
                ) : null;
              })}
            </g>

            <g aria-hidden="true" className="wine-country-river-labels">
              {context?.rivers?.map((river) => {
                const point = riverLabelPosition(river, projection);
                return point ? <text key={`${river.name}-label`} x={point[0]} y={point[1]}>{river.name}</text> : null;
              })}
            </g>

            <g className="wine-country-region-labels">
              {mainMappedRegions.map(({ region, boundary }) => {
                const point = projection(boundary.label);
                if (!point) return null;
                const openRegion = () => onSelectRegion(region);
                const labelWidth = Math.max(
                  denseLabels ? 54 : 62,
                  region.name.length * (denseLabels ? 5.7 : 6.4) + 16,
                );
                return (
                  <g
                    aria-label={`Open ${region.name}`}
                    data-selected={region.id === selectedRegionId || undefined}
                    key={`${region.id}-label`}
                    onClick={openRegion}
                    onKeyDown={(event) => svgButtonKeyDown(event, openRegion)}
                    role="button"
                    tabIndex={0}
                    transform={`translate(${point[0]} ${point[1]}) scale(${1 / viewport.scale})`}
                  >
                    <rect height="21" rx="6" width={labelWidth} x={-labelWidth / 2} y="-12" />
                    <text textAnchor="middle" y="3">{region.name}</text>
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
      </div>

      <div className="wine-vector-map-key">
        <span><i data-layer="region" /> appellation or GI footprint</span>
        <span><i data-layer="administrative" /> administrative atlas redraw</span>
        <span><i data-layer="river" /> river</span>
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
          <text x="103" y="169">500–1,000 m</text>
          <text x="238" y="181">200–500 m</text>
        </g>
        <g aria-hidden="true" className="wine-burgundy-overview-water">
          <path d="M594 136C566 229 563 324 579 420c19 112 18 215-4 307-13 54-7 108 18 161" />
          <text x="602" y="524">Saône</text>
          <path d="M472 384C516 401 549 417 571 438" />
          <text x="480" y="373">Canal de Bourgogne</text>
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
            <g key={`${item.area}-label`} transform={`translate(${item.label[0]} ${item.label[1]})`}>
              <text className="wine-burgundy-overview-name" textAnchor="middle">{item.area}</text>
              <text className="wine-burgundy-overview-grapes" textAnchor="middle" y="17">{item.grapes}</text>
            </g>
          ))}
          <text x="467" y="160">Dijon</text>
          <text x="458" y="426">Beaune</text>
          <text x="373" y="576">Chagny</text>
          <text x="363" y="742">Tournus</text>
          <text x="355" y="855">Mâcon</text>
        </g>
            <g aria-hidden="true" className="wine-burgundy-overview-villages">
              <text x="463" y="226">Gevrey-Chambertin</text>
              <text x="468" y="311">Vosne-Romanée</text>
              <text x="464" y="364">Nuits-Saint-Georges</text>
              <text x="439" y="489">Pommard</text>
              <text x="423" y="526">Meursault</text>
              <text x="397" y="551">Puligny-Montrachet</text>
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

        <g aria-hidden="true" className="wine-burgundy-exact-contours">
          {burgundyContours.map((contour) => (
            <path d={path(lineFeature(contour)) ?? undefined} key={contour.elevation} />
          ))}
          {burgundyContours.map((contour) => {
            const point = riverLabelPosition(contour, projection);
            return point ? <text key={`${contour.elevation}-label`} x={point[0]} y={point[1]}>{contour.elevation}</text> : null;
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
            return point ? <text x={point[0]} y={point[1]}>Route des Grands Crus</text> : null;
          })()}
        </g>

        <g className="wine-burgundy-exact-villages">
          {burgundyVillages.map((village) => {
            const point = projection(village.coordinates);
            return point ? (
              <g key={village.name} transform={`translate(${point[0]} ${point[1]})`}>
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
                <text x={labelX} y={labelY}>{area.name}</text>
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

const bordeauxRivers: WineMapLine[] = [
  { name: "Gironde", coordinates: [[-0.98, 45.44], [-0.84, 45.3], [-0.69, 45.13], [-0.58, 45.0]], labelAt: [-0.75, 45.2] },
  { name: "Garonne", coordinates: [[-0.58, 44.99], [-0.56, 44.86], [-0.42, 44.75], [-0.31, 44.61], [-0.2, 44.51]], labelAt: [-0.42, 44.72] },
  { name: "Dordogne", coordinates: [[-0.58, 44.99], [-0.39, 44.97], [-0.2, 44.91], [0.02, 44.84], [0.16, 44.83]], labelAt: [-0.13, 44.93] },
  { name: "Isle", coordinates: [[-0.49, 45.05], [-0.3, 45.04], [-0.18, 45.0]], labelAt: [-0.31, 45.08] },
  { name: "Ciron", coordinates: [[-0.51, 44.47], [-0.4, 44.53], [-0.34, 44.59]], labelAt: [-0.41, 44.5] },
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

          <g aria-hidden="true" className="wine-bordeaux-contours">
            {bordeauxContours.map((contour) => (
              <path d={path(lineFeature(contour)) ?? undefined} key={contour.elevation} />
            ))}
            {bordeauxContours.map((contour) => {
              const point = riverLabelPosition(contour, projection);
              return point ? <text key={`${contour.elevation}-label`} x={point[0]} y={point[1]}>{contour.elevation}</text> : null;
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
            {bordeauxRivers.map((river) => (
              <path d={path(lineFeature(river)) ?? undefined} key={river.name} />
            ))}
          </g>
          <g aria-hidden="true" className="wine-bordeaux-river-labels">
            {bordeauxRivers.map((river) => {
              const point = riverLabelPosition(river, projection);
              return point ? <text key={`${river.name}-label`} x={point[0]} y={point[1]}>{river.name}</text> : null;
            })}
          </g>

          <g className="wine-bordeaux-area-labels">
            {visibleAreas.map((area) => {
              const site = bordeauxMapSites.find((item) => item.id === area.id);
              if (!site) return null;
              const point = projection(site.coordinates);
              if (!point) return null;
              return (
                <text
                  data-selected={selectedSite.id === area.id || undefined}
                  key={`${area.id}-label`}
                  textAnchor="middle"
                  x={point[0]}
                  y={point[1]}
                >
                  {area.name}
                </text>
              );
            })}
          </g>

              <g className="wine-bordeaux-estates">
                {visibleEstates.map((site, index) => {
                  const point = projection(site.coordinates);
                  if (!point) return null;
                  const openSite = () => onSelect(site);
                  const isSelected = selectedSite.id === site.id;
                  const labelRight = index % 3 !== 1;
                  return (
                    <g
                      aria-label={`Open ${site.name}, ${site.classification}`}
                      data-selected={isSelected || undefined}
                      key={site.id}
                      onClick={openSite}
                      onKeyDown={(event) => svgButtonKeyDown(event, openSite)}
                      role="button"
                      tabIndex={0}
                      transform={`translate(${point[0]} ${point[1]})`}
                    >
                      <path d="M0-7L7 0 0 7-7 0Z" />
                      <text textAnchor={labelRight ? "start" : "end"} x={labelRight ? 10 : -10} y="-7">{site.name}</text>
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
        </div>

        <div className="wine-vector-map-key">
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
