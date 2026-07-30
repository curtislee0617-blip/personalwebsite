"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState, type KeyboardEvent } from "react";
import worldAtlas from "@d3-maps/atlas/world/countries/countries-110m";
import { geoMercator, geoNaturalEarth1, geoPath, type GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import {
  coffeeGrowingRegionCount,
  coffeeOriginCount,
  coffeeOrigins,
  coffeeRegions,
  type CoffeeAtlasOrigin,
  type CoffeeAtlasRegionId,
} from "@/data/coffee-origin-atlas";

type AtlasProperties = {
  id: string;
  name: string;
  name_long?: string;
};

type AtlasTopology = Topology<{
  features: GeometryCollection<AtlasProperties>;
}>;

type AtlasFeature = Feature<Geometry, AtlasProperties>;

type CoffeeRegionExplorerProps = {
  googleMapsApiKey: string;
  googleMapsMapId: string;
};

const CoffeeCountryTerrainMap = dynamic(
  () => import("@/components/coffee-country-terrain-map")
    .then((module) => module.CoffeeCountryTerrainMap),
  {
    loading: () => (
      <div className="coffee-country-terrain-map coffee-terrain-map-loading">
        <p>Preparing the terrain map…</p>
      </div>
    ),
    ssr: false,
  },
);

const mapWidth = 960;
const mapHeight = 500;
const atlas = worldAtlas as unknown as AtlasTopology;
const worldFeatures = (
  feature(atlas, atlas.objects.features) as FeatureCollection<Geometry, AtlasProperties>
).features;
const originsByIso = new Map(coffeeOrigins.map((origin) => [origin.iso, origin]));
const markerLabelPositions: Record<string, { dx: number; dy: number; anchor: "start" | "middle" | "end" }> = {
  RWA: { dx: -12, dy: -12, anchor: "end" },
  BDI: { dx: 12, dy: 12, anchor: "start" },
  UGA: { dx: -12, dy: 14, anchor: "end" },
  COD: { dx: -12, dy: -14, anchor: "end" },
  GTM: { dx: -12, dy: -13, anchor: "end" },
  HND: { dx: 12, dy: -17, anchor: "start" },
  SLV: { dx: -12, dy: 9, anchor: "end" },
  NIC: { dx: 12, dy: 5, anchor: "start" },
  CRI: { dx: -10, dy: 19, anchor: "end" },
  PAN: { dx: 10, dy: 19, anchor: "start" },
  JAM: { dx: -12, dy: -12, anchor: "end" },
  HTI: { dx: -12, dy: 14, anchor: "end" },
  DOM: { dx: 12, dy: -14, anchor: "start" },
  COL: { dx: 10, dy: -14, anchor: "start" },
  ECU: { dx: -10, dy: 16, anchor: "end" },
  YEM: { dx: -11, dy: 14, anchor: "end" },
  SAU: { dx: 11, dy: -14, anchor: "start" },
  LAO: { dx: -11, dy: -13, anchor: "end" },
  VNM: { dx: 11, dy: 12, anchor: "start" },
  TLS: { dx: -11, dy: -13, anchor: "end" },
};

function getRegionOrigins(regionId: CoffeeAtlasRegionId | null) {
  return regionId
    ? coffeeOrigins.filter((origin) => origin.regionId === regionId)
    : coffeeOrigins;
}

function createProjection(regionId: CoffeeAtlasRegionId | null): GeoProjection {
  if (!regionId) {
    return geoNaturalEarth1().fitExtent(
      [[18, 18], [mapWidth - 18, mapHeight - 18]],
      { type: "FeatureCollection", features: worldFeatures },
    );
  }

  const regionIsos = new Set(getRegionOrigins(regionId).map((origin) => origin.iso));
  const regionFeatures = worldFeatures.filter((country) => regionIsos.has(country.properties.id));

  return geoMercator().fitExtent(
    [[58, 42], [mapWidth - 58, mapHeight - 42]],
    { type: "FeatureCollection", features: regionFeatures },
  );
}

function svgButtonKeyDown(
  event: KeyboardEvent<SVGGElement>,
  activate: () => void,
) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  activate();
}

export function CoffeeRegionExplorer({
  googleMapsApiKey,
  googleMapsMapId,
}: CoffeeRegionExplorerProps) {
  const [selectedRegionId, setSelectedRegionId] = useState<CoffeeAtlasRegionId | null>(null);
  const [selectedOriginIso, setSelectedOriginIso] = useState<string | null>(null);
  const [selectedGrowingRegionId, setSelectedGrowingRegionId] = useState<string | null>(null);

  const selectedRegion = coffeeRegions.find((region) => region.id === selectedRegionId) ?? null;
  const regionOrigins = getRegionOrigins(selectedRegionId);
  const selectedOrigin = coffeeOrigins.find((origin) => origin.iso === selectedOriginIso) ?? null;
  const selectedGrowingRegion =
    selectedOrigin?.growingRegions.find((region) => region.id === selectedGrowingRegionId)
    ?? selectedOrigin?.growingRegions[0]
    ?? null;
  const selectedGrowingRegionIndex =
    selectedOrigin && selectedGrowingRegion
      ? selectedOrigin.growingRegions.findIndex((region) => region.id === selectedGrowingRegion.id)
      : -1;

  const { path, projection } = useMemo(() => {
    const nextProjection = createProjection(selectedRegionId);
    return { path: geoPath(nextProjection), projection: nextProjection };
  }, [selectedRegionId]);

  const selectRegion = (regionId: CoffeeAtlasRegionId | null) => {
    setSelectedRegionId(regionId);
    setSelectedOriginIso(null);
    setSelectedGrowingRegionId(null);
  };

  const selectOrigin = (origin: CoffeeAtlasOrigin) => {
    if (selectedRegionId !== origin.regionId) setSelectedRegionId(origin.regionId);
    setSelectedOriginIso(origin.iso);
    setSelectedGrowingRegionId(origin.growingRegions[0]?.id ?? null);
  };

  const selectGrowingRegion = useCallback((regionId: string) => {
    setSelectedGrowingRegionId(regionId);
  }, []);

  return (
    <div className="coffee-origin-explorer">
      <div className="coffee-map-toolbar" aria-label="Coffee-growing regions">
        <button
          aria-pressed={selectedRegionId === null}
          className="coffee-map-filter"
          onClick={() => selectRegion(null)}
          type="button"
        >
          World
        </button>
        {coffeeRegions.map((region) => (
          <button
            aria-pressed={selectedRegionId === region.id}
            className="coffee-map-filter"
            data-region={region.id}
            key={region.id}
            onClick={() => selectRegion(region.id)}
            type="button"
          >
            <span>{region.name}</span>
            <small>{getRegionOrigins(region.id).length}</small>
          </button>
        ))}
      </div>

      <div className="coffee-map-stage">
        <div className="coffee-map-frame">
          {selectedOrigin ? (
            <CoffeeCountryTerrainMap
              apiKey={googleMapsApiKey}
              key={selectedOrigin.iso}
              mapId={googleMapsMapId}
              onSelectRegion={selectGrowingRegion}
              origin={selectedOrigin}
              selectedRegionId={selectedGrowingRegion?.id ?? null}
            />
          ) : (
            <svg
              aria-label={
                selectedRegion
                  ? `Detailed map of ${selectedRegion.name}`
                  : "World map of featured coffee-growing origins"
              }
              aria-roledescription="interactive map"
              className="coffee-map-svg"
              role="group"
              viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            >
              <defs>
                <linearGradient id="coffee-map-ocean" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--color-mist) / 0.34)" />
                  <stop offset="100%" stopColor="rgb(var(--color-mist) / 0.1)" />
                </linearGradient>
              </defs>
              <rect fill="url(#coffee-map-ocean)" height={mapHeight} rx="24" width={mapWidth} />
              <g className="coffee-map-countries">
                {worldFeatures.map((country: AtlasFeature) => {
                  const origin = originsByIso.get(country.properties.id);
                  const isRegionOrigin = origin?.regionId === selectedRegionId;
                  const isFeatured = Boolean(origin);
                  const isDimmed = selectedRegionId !== null && !isRegionOrigin;

                  return (
                    <path
                      className="coffee-map-country"
                      d={path(country) ?? undefined}
                      data-dimmed={isDimmed || undefined}
                      data-featured={isFeatured || undefined}
                      data-region={origin?.regionId}
                      key={country.properties.id}
                    />
                  );
                })}
              </g>

              <g className="coffee-map-markers">
                {regionOrigins.map((origin) => {
                  const point = projection(origin.coordinates);
                  if (!point) return null;
                  const [x, y] = point;
                  const labelPosition = markerLabelPositions[origin.iso] ?? {
                    dx: 0,
                    dy: -15,
                    anchor: "middle" as const,
                  };
                  const openOrigin = () => selectOrigin(origin);

                  return (
                    <g
                      aria-label={`Open ${origin.name} coffee profile`}
                      className="coffee-map-marker"
                      data-region={origin.regionId}
                      key={origin.iso}
                      onClick={openOrigin}
                      onKeyDown={(event) => svgButtonKeyDown(event, openOrigin)}
                      role="button"
                      tabIndex={0}
                      transform={`translate(${x} ${y})`}
                    >
                      <circle className="coffee-map-marker-halo" r={12} />
                      <circle className="coffee-map-marker-dot" r={5} />
                      {selectedRegionId ? (
                        <text
                          className="coffee-map-marker-label"
                          dx={labelPosition.dx}
                          dy={labelPosition.dy}
                          textAnchor={labelPosition.anchor}
                        >
                          {origin.name}
                        </text>
                      ) : null}
                    </g>
                  );
                })}
              </g>

              {!selectedRegion ? (
                <g aria-hidden="true" className="coffee-bean-belt">
                  <line x1="22" x2={mapWidth - 22} y1="196" y2="196" />
                  <line x1="22" x2={mapWidth - 22} y1="326" y2="326" />
                  <text x="28" y="188">Tropic of Cancer</text>
                  <text x="28" y="318">Tropic of Capricorn</text>
                </g>
              ) : null}
            </svg>
          )}

          {selectedOrigin ? (
            <ol
              aria-label={`Mapped coffee-growing regions within ${selectedOrigin.name}`}
              className="coffee-country-region-key"
            >
              {selectedOrigin.growingRegions.map((region, index) => (
                <li key={region.id}>
                  <button
                    aria-pressed={selectedGrowingRegion?.id === region.id}
                    onClick={() => selectGrowingRegion(region.id)}
                    type="button"
                  >
                    <span>{index + 1}</span>
                    <span>
                      <strong>{region.name}</strong>
                      <small>{region.species} · {region.altitude}</small>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          ) : null}

          <div className="coffee-map-caption">
            <span>{selectedOrigin ? "Country atlas" : selectedRegion ? "Regional view" : "The coffee belt"}</span>
            <p>
              {selectedOrigin
                ? `${selectedOrigin.growingRegions.length} named growing regions—switch layers, pan or zoom, then choose an outlined area.`
                : selectedRegion
                  ? "Pick a country to open its own map, then compare the growing regions inside it."
                  : `${coffeeOriginCount} countries and ${coffeeGrowingRegionCount} growing zones—choose a region or click a dot.`}
            </p>
          </div>
        </div>

        <aside
          aria-live="polite"
          className={`coffee-region-summary${selectedOrigin ? " coffee-country-summary" : ""}`}
        >
          {selectedOrigin && selectedGrowingRegion ? (
            <>
              <p className="eyebrow">
                {selectedOrigin.name} · region {selectedGrowingRegionIndex + 1} of{" "}
                {selectedOrigin.growingRegions.length}
              </p>
              <h3>{selectedGrowingRegion.name}</h3>
              <p className="coffee-region-count">
                {selectedGrowingRegion.species} · {selectedGrowingRegion.altitude}
              </p>
              <p>{selectedGrowingRegion.location}</p>
              <dl>
                <div>
                  <dt>Local climate</dt>
                  <dd>{selectedGrowingRegion.climate}</dd>
                </div>
                <div>
                  <dt>Varieties grown</dt>
                  <dd>{selectedGrowingRegion.varieties}</dd>
                </div>
                <div>
                  <dt>Processing you will see</dt>
                  <dd>{selectedGrowingRegion.processing}</dd>
                </div>
              </dl>
              <blockquote>{selectedGrowingRegion.cupProfile}</blockquote>
              {selectedOrigin.sources[0] ? (
                <a
                  className="coffee-country-summary-source"
                  href={selectedOrigin.sources[0].href}
                  rel="noreferrer"
                  target="_blank"
                >
                  Read the closest origin source
                </a>
              ) : null}
            </>
          ) : selectedRegion ? (
            <>
              <p className="eyebrow">{selectedRegion.kicker}</p>
              <h3>{selectedRegion.name}</h3>
              <p className="coffee-region-count">
                {regionOrigins.length} countries ·{" "}
                {regionOrigins.reduce((total, origin) => total + origin.growingRegions.length, 0)} growing zones
              </p>
              <p>{selectedRegion.summary}</p>
              <dl>
                <div>
                  <dt>Climate pattern</dt>
                  <dd>{selectedRegion.climate}</dd>
                </div>
                <div>
                  <dt>Seasonality</dt>
                  <dd>{selectedRegion.seasonality}</dd>
                </div>
              </dl>
              <blockquote>{selectedRegion.definingIdea}</blockquote>
            </>
          ) : (
            <>
              <p className="eyebrow">Why origins taste different</p>
              <h3>One belt, many climates</h3>
              <p>
                Most coffee grows between the tropics, but latitude is only the beginning. A plant also has to deal
                with elevation, rain, shade, soil and the sea. Change any of those and you change how quickly its fruit
                ripens—and, eventually, what reaches our cup.
              </p>
              <dl>
                <div>
                  <dt>Arabica</dt>
                  <dd>Usually prefers cooler highlands and gives us most of the famous specialty varieties.</dd>
                </div>
                <div>
                  <dt>Canephora</dt>
                  <dd>Often handles warmer, lower farms and is far more diverse than the single word “Robusta” makes it sound.</dd>
                </div>
              </dl>
              <blockquote>Altitude is a clue about climate, not a score out of ten.</blockquote>
              <div className="coffee-atlas-totals" aria-label="Coffee atlas coverage">
                <span><strong>{coffeeOriginCount}</strong> countries</span>
                <span><strong>{coffeeRegions.length}</strong> broad regions</span>
                <span><strong>{coffeeGrowingRegionCount}</strong> growing zones</span>
              </div>
            </>
          )}
        </aside>
      </div>

      {selectedRegion ? (
        <div className="coffee-origin-controls" aria-label={`Featured origins in ${selectedRegion.name}`}>
          {regionOrigins.map((origin) => (
            <button
              aria-pressed={origin.iso === selectedOriginIso}
              className="coffee-origin-control"
              key={origin.iso}
              onClick={() => selectOrigin(origin)}
              type="button"
            >
              <span>{origin.name}</span>
              <small>{origin.altitude}</small>
            </button>
          ))}
        </div>
      ) : null}

      {selectedOrigin ? (
        <article className="coffee-origin-profile" key={selectedOrigin.iso}>
          <header>
            <div>
              <p className="eyebrow">{selectedRegion?.name}</p>
              <h3>{selectedOrigin.name}</h3>
            </div>
            <span>{selectedOrigin.species}</span>
          </header>

          <div className="coffee-origin-facts">
            <dl>
              <div>
                <dt>Growing elevation</dt>
                <dd>{selectedOrigin.altitude}</dd>
              </div>
              <div>
                <dt>Climate</dt>
                <dd>{selectedOrigin.climate}</dd>
              </div>
              <div>
                <dt>Harvest</dt>
                <dd>{selectedOrigin.harvest}</dd>
              </div>
              <div>
                <dt>Common processing</dt>
                <dd>{selectedOrigin.processing}</dd>
              </div>
            </dl>

            <div className="coffee-origin-notes">
              <section>
                <h4>Varieties to know</h4>
                <div className="coffee-origin-tags">
                  {selectedOrigin.varieties.map((variety) => <span key={variety}>{variety}</span>)}
                </div>
              </section>
              <section>
                <h4>Often found in the cup</h4>
                <p>{selectedOrigin.cupProfile}</p>
              </section>
              <section>
                <h4>Why this country needs a closer look</h4>
                <p>{selectedOrigin.story}</p>
              </section>
              <section>
                <h4>Growing pressure</h4>
                <p>{selectedOrigin.pressure}</p>
              </section>
            </div>
          </div>

          <p className="coffee-origin-sources">
            Profile references:{" "}
            {selectedOrigin.sources.map((source, index) => (
              <span key={source.href}>
                {index > 0 ? " · " : null}
                <a href={source.href} rel="noreferrer" target="_blank">{source.label}</a>
              </span>
            ))}
            {" · "}
            <a href="https://varieties.worldcoffeeresearch.org/" rel="noreferrer" target="_blank">
              World Coffee Research variety catalogue
            </a>
            . Regional cup notes describe useful tendencies, not a promise about every farm or harvest.
          </p>
        </article>
      ) : null}

      <p className="coffee-map-source">
        World and regional geometry:{" "}
        <a href="https://www.naturalearthdata.com/" rel="noreferrer" target="_blank">Natural Earth</a>
        {" "}through D3 Maps Atlas. Country close-ups use Google Maps{" "}
        <a
          href="https://developers.google.com/maps/documentation/javascript/maptypes"
          rel="noreferrer"
          target="_blank"
        >
          terrain and hybrid satellite map types
        </a>
        , with imagery and map-data attribution shown inside the map. The coloured outlines are approximate
        orientation footprints built around source-backed growing locations; they are not administrative,
        appellation or farm boundaries. The atlas combines national coffee bodies, origin-specific public references,{" "}
        <a href="https://varieties.worldcoffeeresearch.org/" rel="noreferrer" target="_blank">
          World Coffee Research
        </a>
        , the{" "}
        <a href="https://ico.org/what-we-do/world-coffee-statistics-database/" rel="noreferrer" target="_blank">
          International Coffee Organization
        </a>
        {" "}and the{" "}
        <a href="https://www.aboutcoffee.org/origins/coffee-regions-of-the-world/" rel="noreferrer" target="_blank">
          National Coffee Association origin guide
        </a>
        . Each country profile links its closest source, and I have condensed the ranges to describe representative
        coffee areas rather than every farm.
      </p>
    </div>
  );
}
