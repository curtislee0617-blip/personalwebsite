"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState, type KeyboardEvent } from "react";
import worldAtlas from "@d3-maps/atlas/world/countries/countries-110m";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import type { CoffeeMapLocation } from "@/components/coffee-country-terrain-map";
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
const mapHeight = 580;
const atlas = worldAtlas as unknown as AtlasTopology;
const worldFeatures = (
  feature(atlas, atlas.objects.features) as FeatureCollection<Geometry, AtlasProperties>
).features;
const originsByIso = new Map(coffeeOrigins.map((origin) => [origin.iso, origin]));
const worldProjection = geoNaturalEarth1().fitExtent(
  [[18, 18], [mapWidth - 18, mapHeight - 18]],
  { type: "FeatureCollection", features: worldFeatures },
);
const worldPath = geoPath(worldProjection);

function getRegionOrigins(regionId: CoffeeAtlasRegionId | null) {
  return regionId
    ? coffeeOrigins.filter((origin) => origin.regionId === regionId)
    : coffeeOrigins;
}

function svgButtonKeyDown(
  event: KeyboardEvent<SVGGElement>,
  activate: () => void,
) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  activate();
}

export function CoffeeRegionExplorer() {
  const [selectedRegionId, setSelectedRegionId] = useState<CoffeeAtlasRegionId | null>(null);
  const [selectedOriginIso, setSelectedOriginIso] = useState<string | null>(null);
  const [selectedGrowingRegionId, setSelectedGrowingRegionId] = useState<string | null>(null);

  const selectedRegion = coffeeRegions.find((region) => region.id === selectedRegionId) ?? null;
  const regionOrigins = useMemo(
    () => getRegionOrigins(selectedRegionId),
    [selectedRegionId],
  );
  const selectedOrigin = coffeeOrigins.find((origin) => origin.iso === selectedOriginIso) ?? null;
  const selectedGrowingRegion =
    selectedOrigin?.growingRegions.find((region) => region.id === selectedGrowingRegionId)
    ?? selectedOrigin?.growingRegions[0]
    ?? null;

  const selectRegion = (regionId: CoffeeAtlasRegionId | null) => {
    setSelectedRegionId(regionId);
    setSelectedOriginIso(null);
    setSelectedGrowingRegionId(null);
  };

  const selectOrigin = useCallback((origin: CoffeeAtlasOrigin) => {
    setSelectedRegionId(origin.regionId);
    setSelectedOriginIso(origin.iso);
    setSelectedGrowingRegionId(origin.growingRegions[0]?.id ?? null);
  }, []);

  const selectGrowingRegion = useCallback((regionId: string) => {
    setSelectedGrowingRegionId(regionId);
  }, []);

  const terrainLocations = useMemo<CoffeeMapLocation[]>(() => {
    if (selectedOrigin) {
      return selectedOrigin.growingRegions.map((region) => ({
        coordinates: region.coordinates,
        detail: `${region.species} · ${region.altitude}`,
        id: region.id,
        label: region.name,
      }));
    }

    return regionOrigins.map((origin) => ({
      coordinates: [origin.coordinates],
      detail: `${origin.growingRegions.length} growing zones · ${origin.altitude}`,
      id: origin.iso,
      label: origin.name,
    }));
  }, [regionOrigins, selectedOrigin]);

  const selectMapLocation = useCallback((locationId: string) => {
    if (selectedOrigin) {
      selectGrowingRegion(locationId);
      return;
    }

    const origin = originsByIso.get(locationId);
    if (origin) selectOrigin(origin);
  }, [selectGrowingRegion, selectOrigin, selectedOrigin]);

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
          {selectedRegion ? (
            <CoffeeCountryTerrainMap
              ariaLabel={
                selectedOrigin
                  ? `${selectedOrigin.name} terrain and satellite coffee-growing map`
                  : `${selectedRegion.name} terrain and satellite coffee-growing map`
              }
              context={selectedOrigin ? "country" : "macro"}
              key={selectedOrigin?.iso ?? selectedRegion.id}
              locations={terrainLocations}
              onSelectLocation={selectMapLocation}
              selectedLocationId={
                selectedOrigin ? selectedGrowingRegion?.id ?? null : null
              }
            />
          ) : (
            <svg
              aria-label="World map of featured coffee-growing origins"
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
                      d={worldPath(country) ?? undefined}
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
                  const point = worldProjection(origin.coordinates);
                  if (!point) return null;
                  const [x, y] = point;
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
                    </g>
                  );
                })}
              </g>

              <g aria-hidden="true" className="coffee-bean-belt">
                <line x1="22" x2={mapWidth - 22} y1="226" y2="226" />
                <line x1="22" x2={mapWidth - 22} y1="378" y2="378" />
                <text x="28" y="218">Tropic of Cancer</text>
                <text x="28" y="370">Tropic of Capricorn</text>
              </g>
            </svg>
          )}

          {selectedOrigin ? (
            <ul
              aria-label={`Mapped coffee-growing regions within ${selectedOrigin.name}`}
              className="coffee-country-region-key"
            >
              {selectedOrigin.growingRegions.map((region) => (
                <li key={region.id}>
                  <button
                    aria-pressed={selectedGrowingRegion?.id === region.id}
                    onClick={() => selectGrowingRegion(region.id)}
                    type="button"
                  >
                    <span aria-hidden="true" className="coffee-country-region-swatch" />
                    <span>
                      <strong>{region.name}</strong>
                      <small>{region.species} · {region.altitude}</small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="coffee-map-caption">
            <span>{selectedOrigin ? "Country atlas" : selectedRegion ? "Regional view" : "The coffee belt"}</span>
            <p>
              {selectedOrigin
                ? `${selectedOrigin.growingRegions.length} named growing regions—switch layers, pan or zoom, then choose an outlined area.`
                : selectedRegion
                  ? `${regionOrigins.length} countries—switch between terrain and satellite, then choose a country marker.`
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
                {selectedOrigin.name} · {selectedGrowingRegion.species}
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
                <p className="coffee-country-summary-source">
                  Research note · {selectedOrigin.sources[0].label}
                </p>
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
            Profile references: The World Atlas of Coffee, revised edition, origin chapters, PDF pages 189–404 ·{" "}
            {selectedOrigin.sources.map((source, index) => (
              <span key={source.label}>
                {index > 0 ? " · " : null}
                {source.label}
              </span>
            ))}
            {" · "}World Coffee Research variety catalogue. Regional cup notes describe useful tendencies, not a
            promise about every farm or harvest.
          </p>
        </article>
      ) : null}

      <p className="coffee-map-source">
        World overview geometry:{" "}
        <a href="https://www.naturalearthdata.com/" rel="noreferrer" target="_blank">Natural Earth</a>
        {" "}through D3 Maps Atlas. Regional and country terrain views use{" "}
        <a
          href="https://opentopomap.org/about"
          rel="noreferrer"
          target="_blank"
        >
          OpenTopoMap
        </a>
        {" "}with{" "}
        <a href="https://www.openstreetmap.org/copyright" rel="noreferrer" target="_blank">
          OpenStreetMap data
        </a>
        , while satellite mode uses{" "}
        <a
          href="https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9"
          rel="noreferrer"
          target="_blank"
        >
          Esri World Imagery
        </a>
        . Full attribution is shown inside each map. The coloured outlines are approximate
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
