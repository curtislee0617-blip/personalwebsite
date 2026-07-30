"use client";

import { useState, type KeyboardEvent } from "react";
import worldAtlas from "@d3-maps/atlas/world/countries/countries-110m";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import {
  WineBordeauxBoundaryMap,
  WineBurgundyBoundaryMap,
  WineCountryBoundaryMap,
  burgundyBoundaryAreas,
  curatedPlotIdForBurgundyArea,
  type BurgundyBoundaryArea,
  type WineMapLayer,
} from "@/components/wine-vector-atlas-map";
import {
  layoutMapLabels,
  useWineMapViewport,
  WineMapViewportControls,
} from "@/components/wine-map-viewport";
import {
  bordeauxMapSites,
  burgundyPlots,
  wineCountries,
  wineCountryByIso,
  wineRegionCount,
  wineSubregionCount,
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

type AtlasFeature = Feature<Geometry, AtlasProperties>;

const mapWidth = 960;
const mapHeight = 560;
const atlas = worldAtlas as unknown as AtlasTopology;
const worldFeatures = (
  feature(atlas, atlas.objects.features) as FeatureCollection<Geometry, AtlasProperties>
).features;
const worldProjection = geoNaturalEarth1().fitExtent(
  [[18, 18], [mapWidth - 18, mapHeight - 18]],
  { type: "FeatureCollection", features: worldFeatures },
);
const worldPath = geoPath(worldProjection);
const worldWineLabels = worldFeatures.flatMap((countryFeature) => {
  const wineCountry = wineCountryByIso.get(countryFeature.properties.id);
  if (!wineCountry) return [];
  const [x, y] = worldPath.centroid(countryFeature);
  return Number.isFinite(x) && Number.isFinite(y)
    ? [{
        country: wineCountry,
        label: wineCountry.iso === "USA"
          ? "USA"
          : wineCountry.iso === "GBR"
            ? "UK"
            : wineCountry.name,
        x,
        y,
      }]
    : [];
});
const burgundyBands = [
  { area: "Chablis", grapes: "Chardonnay" },
  { area: "Côte de Nuits", grapes: "Pinot Noir" },
  { area: "Côte de Beaune", grapes: "Pinot Noir + Chardonnay" },
  { area: "Côte Chalonnaise", grapes: "Pinot Noir + Chardonnay + Aligoté" },
  { area: "Mâconnais", grapes: "Chardonnay" },
] as const;

function svgButtonKeyDown(
  event: KeyboardEvent<SVGGElement | SVGPathElement>,
  activate: () => void,
) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  activate();
}

export function WineRegionExplorer() {
  const [selectedCountryIso, setSelectedCountryIso] = useState<string | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [selectedSubregionName, setSelectedSubregionName] = useState<string | null>(null);
  const [selectedPlotId, setSelectedPlotId] = useState(burgundyPlots[0].id);
  const [selectedBordeauxSiteId, setSelectedBordeauxSiteId] = useState("bordeaux-pauillac");
  const [burgundyMapView, setBurgundyMapView] = useState<"overview" | "south">("south");
  const [selectedBurgundyAreaId, setSelectedBurgundyAreaId] = useState("burgundy-meursault-perrieres");
  const [mapLayer, setMapLayer] = useState<WineMapLayer>("atlas");
  const worldViewport = useWineMapViewport(mapWidth, mapHeight);
  const worldLabelPlacements = layoutMapLabels(
    worldWineLabels.map(({ country, label, x, y }) => ({
      height: 12,
      id: country.iso,
      point: [x, y],
      priority: country.regions.length,
      width: Math.max(28, label.length * 5.4 + 8),
    })),
    { scale: worldViewport.scale, x: worldViewport.x, y: worldViewport.y },
    mapWidth,
    mapHeight,
    {
      obstacles: [
        { bottom: 52, left: mapWidth - 225, right: mapWidth - 8, top: 8 },
        { bottom: mapHeight - 7, left: 10, right: 286, top: mapHeight - 37 },
      ],
    },
  );

  const selectedCountry = selectedCountryIso ? wineCountryByIso.get(selectedCountryIso) ?? null : null;
  const selectedRegion =
    selectedCountry?.regions.find((item) => item.id === selectedRegionId) ?? null;
  const selectedSubregion =
    selectedRegion?.subregions.find((item) => item.name === selectedSubregionName)
    ?? selectedRegion?.subregions[0]
    ?? null;
  const selectedPlot = burgundyPlots.find((plot) => plot.id === selectedPlotId) ?? burgundyPlots[0];
  const selectedBurgundyArea =
    burgundyBoundaryAreas.find((area) => area.id === selectedBurgundyAreaId)
    ?? burgundyBoundaryAreas[0];
  const selectedBordeauxSite =
    bordeauxMapSites.find((site) => site.id === selectedBordeauxSiteId) ?? bordeauxMapSites[0];
  const isBurgundyOpen = selectedRegion?.id === "fr-burgundy";
  const isBordeauxOpen = selectedRegion?.id === "fr-bordeaux";
  const supportsSatelliteLayer = Boolean(selectedCountry)
    && !(isBurgundyOpen && burgundyMapView === "overview");
  const activeMapLayer: WineMapLayer = supportsSatelliteLayer ? mapLayer : "atlas";
  const selectedCuratedBoundaryPlot = burgundyPlots.find(
    (plot) => plot.id === curatedPlotIdForBurgundyArea(selectedBurgundyArea.id),
  ) ?? null;

  const selectCountry = (country: WineCountry | null) => {
    setSelectedCountryIso(country?.iso ?? null);
    setSelectedRegionId(null);
    setSelectedSubregionName(null);
    setBurgundyMapView("south");
  };

  const selectRegion = (item: WineRegion) => {
    setSelectedRegionId(item.id);
    setSelectedSubregionName(item.subregions[0]?.name ?? null);
    if (item.id === "fr-burgundy") {
      setSelectedPlotId("meursault-perrieres");
      setSelectedBurgundyAreaId("burgundy-meursault-perrieres");
      setBurgundyMapView("south");
    }
    if (item.id === "fr-bordeaux") setSelectedBordeauxSiteId("bordeaux-pauillac");
  };

  const selectBurgundyBoundaryArea = (area: BurgundyBoundaryArea) => {
    setSelectedBurgundyAreaId(area.id);
    const curatedPlotId = curatedPlotIdForBurgundyArea(area.id);
    if (curatedPlotId) setSelectedPlotId(curatedPlotId);
  };

  const selectBurgundyPlot = (plotId: string) => {
    setSelectedPlotId(plotId);
    const matchingArea = burgundyBoundaryAreas.find(
      (area) => curatedPlotIdForBurgundyArea(area.id) === plotId,
    );
    if (matchingArea) {
      setSelectedBurgundyAreaId(matchingArea.id);
      setBurgundyMapView("south");
    } else {
      setBurgundyMapView("overview");
    }
  };

  return (
    <div className="wine-region-explorer">
      <div className="wine-map-country-picker" aria-label="Wine countries">
        <button
          aria-pressed={selectedCountry === null}
          onClick={() => selectCountry(null)}
          type="button"
        >
          World
        </button>
        {wineCountries.map((country) => (
          <button
            aria-pressed={selectedCountry?.iso === country.iso}
            key={country.iso}
            onClick={() => selectCountry(country)}
            type="button"
          >
            {country.name}
            <small>{country.regions.length}</small>
          </button>
        ))}
      </div>

      <div className="wine-map-stage">
        <div className="wine-map-frame">
          <div className="wine-map-breadcrumbs" aria-label="Map level">
            <button onClick={() => selectCountry(null)} type="button">World</button>
            {selectedCountry ? (
              <>
                <span aria-hidden="true">/</span>
                <button
                  aria-current={selectedRegion ? undefined : "page"}
                  onClick={() => {
                    setSelectedRegionId(null);
                    setSelectedSubregionName(null);
                  }}
                  type="button"
                >
                  {selectedCountry.name}
                </button>
              </>
            ) : null}
            {selectedRegion ? (
              <>
                <span aria-hidden="true">/</span>
                <span aria-current="page">{selectedRegion.name}</span>
              </>
            ) : null}
          </div>

          {supportsSatelliteLayer ? (
            <div
              aria-label="Wine map layer"
              className="wine-detail-map-switch wine-map-layer-switch"
            >
              <button
                aria-pressed={mapLayer === "atlas"}
                onClick={() => setMapLayer("atlas")}
                type="button"
              >
                Atlas
              </button>
              <button
                aria-pressed={mapLayer === "satellite"}
                onClick={() => setMapLayer("satellite")}
                type="button"
              >
                Satellite
              </button>
            </div>
          ) : null}

          {isBurgundyOpen ? (
            <WineBurgundyBoundaryMap
              mapLayer={activeMapLayer}
              onSelectArea={selectBurgundyBoundaryArea}
              onSelectOverviewArea={(area) => {
                const firstPlot = burgundyPlots.find((plot) => plot.area === area);
                if (firstPlot) setSelectedPlotId(firstPlot.id);
              }}
              onViewChange={setBurgundyMapView}
              selectedAreaId={selectedBurgundyArea.id}
              selectedPlot={selectedPlot}
              view={burgundyMapView}
            />
          ) : isBordeauxOpen ? (
            <WineBordeauxBoundaryMap
              mapLayer={activeMapLayer}
              onSelect={(site) => setSelectedBordeauxSiteId(site.id)}
              selectedSite={selectedBordeauxSite}
            />
          ) : selectedCountry ? (
            <WineCountryBoundaryMap
              country={selectedCountry}
              mapLayer={activeMapLayer}
              onSelectRegion={selectRegion}
              selectedRegionId={selectedRegion?.id ?? null}
            />
          ) : (
            <div className="wine-map-viewport">
              <svg
                {...worldViewport.svgProps}
                aria-label="World map of wine countries covered in the guide. Drag to reposition and use the controls to zoom."
                aria-roledescription="interactive draggable map"
                className="wine-world-map"
                role="group"
                viewBox={`0 0 ${mapWidth} ${mapHeight}`}
              >
                <defs>
                  <linearGradient id="wine-world-ocean" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="rgb(194 215 225)" />
                    <stop offset="100%" stopColor="rgb(215 229 235)" />
                  </linearGradient>
                </defs>
                <rect
                  className="wine-world-ocean"
                  fill="url(#wine-world-ocean)"
                  height={mapHeight}
                  rx="24"
                  width={mapWidth}
                />
                <g className="wine-map-transform-layer" transform={worldViewport.transform}>
                  <g className="wine-world-countries">
                    {worldFeatures.map((country: AtlasFeature) => {
                      const wineCountry = wineCountryByIso.get(country.properties.id);
                      const openCountry = () => {
                        if (wineCountry) selectCountry(wineCountry);
                      };
                      return (
                        <path
                          aria-label={wineCountry
                            ? `Open ${wineCountry.name}, ${wineCountry.regions.length} mapped regions`
                            : undefined}
                          className="wine-world-country"
                          d={worldPath(country) ?? undefined}
                          data-featured={Boolean(wineCountry) || undefined}
                          key={country.properties.id}
                          onClick={wineCountry ? openCountry : undefined}
                          onKeyDown={wineCountry ? (event) => svgButtonKeyDown(event, openCountry) : undefined}
                          role={wineCountry ? "button" : undefined}
                          tabIndex={wineCountry ? 0 : undefined}
                        />
                      );
                    })}
                  </g>
                  <g aria-hidden="true" className="wine-world-labels">
                    {worldWineLabels.map(({ country, label, x, y }) => {
                      const placement = worldLabelPlacements.get(country.iso);
                      return placement && !placement.hidden ? (
                        <g
                          key={`${country.iso}-label`}
                          transform={`translate(${x} ${y}) scale(${1 / worldViewport.scale}) translate(${placement.offsetX} ${placement.offsetY})`}
                        >
                          <text textAnchor="middle">{label}</text>
                        </g>
                      ) : null;
                    })}
                  </g>
                  <g className="wine-latitude-lines" aria-hidden="true">
                    <line x1="20" x2={mapWidth - 20} y1="190" y2="190" />
                    <line x1="20" x2={mapWidth - 20} y1="367" y2="367" />
                    <g transform={`translate(28 181) scale(${1 / worldViewport.scale})`}>
                      <text>Northern wine belt</text>
                    </g>
                    <g transform={`translate(28 358) scale(${1 / worldViewport.scale})`}>
                      <text>Southern wine belt</text>
                    </g>
                  </g>
                </g>
              </svg>
              <WineMapViewportControls
                onReset={worldViewport.reset}
                onZoomIn={worldViewport.zoomIn}
                onZoomOut={worldViewport.zoomOut}
                scale={worldViewport.scale}
              />
              <p className="wine-map-drag-hint">Drag to reorient · scroll or use + / − to zoom</p>
            </div>
          )}

          <div className="wine-map-caption">
            <span>
              {isBurgundyOpen
                ? burgundyMapView === "south"
                  ? activeMapLayer === "satellite"
                    ? "Satellite + official south Côte de Beaune parcels"
                    : "Official south Côte de Beaune parcels"
                  : "Burgundy overview"
                : isBordeauxOpen
                  ? activeMapLayer === "satellite"
                    ? "Satellite + official appellation parcels"
                    : "Official appellation parcels"
                  : selectedCountry
                    ? activeMapLayer === "satellite" ? "Satellite + boundary atlas" : "Boundary atlas"
                    : "World atlas"}
            </span>
            <p>
              {isBurgundyOpen
                ? burgundyMapView === "south"
                  ? `${burgundyBoundaryAreas.length} official village, Premier Cru and Grand Cru shapes—choose a parcel or named climat.`
                  : `${burgundyPlots.length} named sites across five wine areas—open the close-up for legal boundaries.`
                : isBordeauxOpen
                  ? `${bordeauxMapSites.filter((site) => site.kind === "zone").length} exact appellation groups and ${bordeauxMapSites.filter((site) => site.kind === "estate").length} landmark château locations.`
                : selectedCountry
                  ? `${selectedCountry.regions.length} mapped regions—choose a boundary or use the index below.`
                  : `${wineCountries.length} countries, ${wineRegionCount} regions and ${wineSubregionCount} closer subregions.`}
            </p>
          </div>
        </div>

        <aside aria-live="polite" className="wine-map-summary">
          {isBurgundyOpen ? (
            burgundyMapView === "south" ? (
              <>
                <p className="eyebrow">
                  {selectedBurgundyArea.parent} · {selectedBurgundyArea.classification}
                </p>
                <h3>{selectedBurgundyArea.name}</h3>
                <p className="wine-map-summary-lede">
                  {selectedBurgundyArea.tier === "village"
                    ? "The pale base layer shows every parcel inside this village appellation."
                    : "This shape is the named legal production area, not a producer’s ownership block."}
                </p>
                <dl>
                  <div>
                    <dt>Varieties allowed here</dt>
                    <dd>{selectedBurgundyArea.grapes}</dd>
                  </div>
                  <div>
                    <dt>Slope and ground</dt>
                    <dd>
                      {selectedCuratedBoundaryPlot?.soilAspect
                        ?? "The west side rises toward the limestone slope; the drawn 220–340 metre lines show the broad change in height, while soils still vary within the boundary."}
                    </dd>
                  </div>
                  <div>
                    <dt>What it tends to build</dt>
                    <dd>
                      {selectedCuratedBoundaryPlot?.style
                        ?? "The name fixes origin and classification. Producer, vintage, farming, vine age and cellar work still determine the wine we actually taste."}
                    </dd>
                  </div>
                </dl>
                <p className="wine-map-caveat">
                  The boundary is source geometry from INAO. It is not an estate map: several growers can own
                  rows inside one climat, and one grower can farm several climats.
                </p>
              </>
            ) : (
              <>
                <p className="eyebrow">{selectedPlot.area} · {selectedPlot.classification}</p>
                <h3>{selectedPlot.name}</h3>
                <p className="wine-map-summary-lede">{selectedPlot.village}</p>
                <dl>
                  <div>
                    <dt>Grape in this plot</dt>
                    <dd>{selectedPlot.grapes}</dd>
                  </div>
                  <div>
                    <dt>Slope and ground</dt>
                    <dd>{selectedPlot.soilAspect}</dd>
                  </div>
                  <div>
                    <dt>What it tends to build</dt>
                    <dd>{selectedPlot.style}</dd>
                  </div>
                </dl>
                <p className="wine-map-caveat">
                  A climat fixes a named place, not a flavour guarantee. Grower, vintage, vine age, farming and
                  cellar choices still sit between the soil and the glass.
                </p>
              </>
            )
          ) : isBordeauxOpen ? (
            <>
              <p className="eyebrow">{selectedBordeauxSite.bank} · {selectedBordeauxSite.appellation}</p>
              <h3>{selectedBordeauxSite.name}</h3>
              <p className="wine-map-summary-lede">{selectedBordeauxSite.classification}</p>
              <dl>
                <div>
                  <dt>Varieties here</dt>
                  <dd>{selectedBordeauxSite.grapes}</dd>
                </div>
                <div>
                  <dt>Terrain and ground</dt>
                  <dd>{selectedBordeauxSite.ground}</dd>
                </div>
                <div>
                  <dt>What it tends to build</dt>
                  <dd>{selectedBordeauxSite.style}</dd>
                </div>
              </dl>
              <p className="wine-map-caveat">
                Bordeaux classifies estates or wines, while the appellation boundary describes origin. That is a
                different logic from Burgundy, where the vineyard climat itself carries the classification.
              </p>
            </>
          ) : selectedRegion ? (
            <>
              <p className="eyebrow">{selectedCountry?.name} · regional close-up</p>
              <h3>{selectedRegion.name}</h3>
              <p className="wine-map-summary-lede">{selectedRegion.note}</p>
              <dl>
                <div>
                  <dt>Climate</dt>
                  <dd>{selectedRegion.climate}</dd>
                </div>
                <div>
                  <dt>Terrain and soils</dt>
                  <dd>{selectedRegion.terrain}</dd>
                </div>
              </dl>
              <section>
                <h4>Varieties to look for</h4>
                <div className="wine-map-tags">
                  {selectedRegion.grapes.map((grapeName) => <span key={grapeName}>{grapeName}</span>)}
                </div>
              </section>
              <section>
                <h4>Wine made here</h4>
                <div className="wine-map-tags is-style">
                  {selectedRegion.styles.map((style) => <span key={style}>{style}</span>)}
                </div>
              </section>
              {selectedRegion.subregions.length > 0 ? (
                <section>
                  <h4>Closer still</h4>
                  <div className="wine-subregion-picker">
                    {selectedRegion.subregions.map((item) => (
                      <button
                        aria-pressed={selectedSubregion?.name === item.name}
                        key={item.name}
                        onClick={() => setSelectedSubregionName(item.name)}
                        type="button"
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                  {selectedSubregion ? (
                    <div className="wine-subregion-note">
                      <strong>{selectedSubregion.grapes}</strong>
                      <p>{selectedSubregion.note}</p>
                    </div>
                  ) : null}
                </section>
              ) : null}
              {selectedRegion.id === "fr-burgundy" ? (
                <button className="wine-open-burgundy" onClick={() => setSelectedRegionId("fr-burgundy")} type="button">
                  Open the Burgundy climat map
                </button>
              ) : null}
            </>
          ) : selectedCountry ? (
            <>
              <p className="eyebrow">Country atlas</p>
              <h3>{selectedCountry.name}</h3>
              <p className="wine-map-summary-lede">{selectedCountry.summary}</p>
              <dl>
                <div>
                  <dt>Climate pattern</dt>
                  <dd>{selectedCountry.climate}</dd>
                </div>
                <div>
                  <dt>How to read it</dt>
                  <dd>{selectedCountry.vineyardLens}</dd>
                </div>
              </dl>
              <div className="wine-atlas-totals">
                <span><strong>{selectedCountry.regions.length}</strong> regions</span>
                <span>
                  <strong>{selectedCountry.regions.reduce((total, item) => total + item.subregions.length, 0)}</strong>
                  {" "}close-ups
                </span>
              </div>
            </>
          ) : (
            <>
              <p className="eyebrow">A map of climates, not prestige</p>
              <h3>The wine world is a set of edges</h3>
              <p className="wine-map-summary-lede">
                Grapevines can survive in many places, but balanced wine usually comes from a narrower compromise:
                enough warmth to ripen, enough coolness to retain acid, enough water to function and enough stress
                to stop the plant spending everything on leaves.
              </p>
              <dl>
                <div>
                  <dt>Old World</dt>
                  <dd>Labels commonly foreground a protected place whose rules also constrain grapes and methods.</dd>
                </div>
                <div>
                  <dt>New World</dt>
                  <dd>Variety is usually easier to see, while regional boundaries describe origin with fewer production rules.</dd>
                </div>
              </dl>
              <div className="wine-atlas-totals">
                <span><strong>{wineCountries.length}</strong> countries</span>
                <span><strong>{wineRegionCount}</strong> regions</span>
                <span><strong>{wineSubregionCount}</strong> close-ups</span>
              </div>
            </>
          )}
        </aside>
      </div>

      {selectedCountry && !isBurgundyOpen ? (
        <div className="wine-region-index" aria-label={`${selectedCountry.name} wine regions`}>
          {selectedCountry.regions.map((item) => (
            <button
              aria-pressed={selectedRegion?.id === item.id}
              key={item.id}
              onClick={() => selectRegion(item)}
              type="button"
            >
              <span>{item.name}</span>
              <small>{item.grapes.slice(0, 2).join(" · ")}</small>
            </button>
          ))}
        </div>
      ) : null}

      {isBordeauxOpen ? (
        <div className="wine-bordeaux-site-index" aria-label="Bordeaux appellations and landmark estates">
          {(["Left Bank", "Right Bank", "Between the rivers"] as const).map((bank) => (
            <section key={bank}>
              <h4>{bank}</h4>
              <div>
                {bordeauxMapSites.filter((site) => site.bank === bank).map((site) => (
                  <button
                    aria-pressed={selectedBordeauxSite.id === site.id}
                    data-kind={site.kind}
                    key={site.id}
                    onClick={() => setSelectedBordeauxSiteId(site.id)}
                    type="button"
                  >
                    <span>{site.name}</span>
                    <small>{site.kind === "estate" ? site.classification : site.appellation}</small>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : null}

      {isBurgundyOpen ? (
        <div className="wine-burgundy-plot-index" aria-label="Burgundy named plot index">
          {burgundyBands.map((band) => (
            <section key={band.area}>
              <h4>{band.area}</h4>
              <div>
                {burgundyPlots.filter((plot) => plot.area === band.area).map((plot) => (
                  <button
                    aria-pressed={selectedPlot.id === plot.id}
                    key={plot.id}
                    onClick={() => selectBurgundyPlot(plot.id)}
                    type="button"
                  >
                    {plot.name}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : null}

      <p className="wine-map-source-note">
        Country outlines are from Natural Earth through D3 Maps Atlas. European country views use the{" "}
        <a
          href="https://springernature.figshare.com/articles/dataset/Wine_PDO_map/19312094"
          rel="noreferrer"
          target="_blank"
        >
          CC0 European wine PDO inventory
        </a>
        , grouped into the guide&apos;s readable regional chapters. Australia uses{" "}
        <a
          href="https://www.wineaustralia.com/labelling/register-of-protected-gis-and-other-terms/geographical-indications"
          rel="noreferrer"
          target="_blank"
        >
          Wine Australia&apos;s GI boundaries
        </a>
        , and the United States uses the{" "}
        <a href="https://ucdavislibrary.github.io/ava/data.html" rel="noreferrer" target="_blank">
          UC Davis AVA project
        </a>
        . For countries without a suitable open appellation layer,{" "}
        <a href="https://www.geoboundaries.org/api.html" rel="noreferrer" target="_blank">
          geoBoundaries
        </a>
        {" "}province, county and municipality polygons provide the base for an atlas redraw. Those explain
        position and adjacency and are not presented as legal wine limits.
        {" "}River context, basic altitude lines, subregion summaries and the Burgundy overview were rebuilt from
        the regional chapters in <i>Wines of the World</i>, supported by the vineyard explanations in{" "}
        <i>Understanding Wines</i>. Bordeaux and the Meursault–Puligny–Chassagne close-up use the INAO&apos;s{" "}
        <a
          href="https://www.data.gouv.fr/datasets/delimitation-parcellaire-des-aoc-viticoles-de-linao"
          rel="noreferrer"
          target="_blank"
        >
          open AOC parcel-delimitation layer
        </a>
        {" "}dated 27 July 2026. It is an informative rendering: the{" "}
        <a href="https://www.inao.gouv.fr/en/portal-plans-delimitation" rel="noreferrer" target="_blank">
          officially deposited plans
        </a>
        {" "}remain legally authoritative. Bordeaux classification labels were checked against the{" "}
        <a href="https://www.bordeaux.com/en/classifications/classifications-1855/" rel="noreferrer" target="_blank">
          CIVB&apos;s 1855 list
        </a>{" "}
        and the{" "}
        <a href="https://www.inao.gouv.fr/node/32334/printable/print" rel="noreferrer" target="_blank">
          INAO&apos;s 2022 Saint-Émilion classification
        </a>
        . Château diamonds show a location only because there is no equivalent national open layer of each
        estate&apos;s changing, fragmented holdings. The optional close-up imagery comes from{" "}
        <a
          href="https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9"
          rel="noreferrer"
          target="_blank"
        >
          Esri World Imagery
        </a>
        ; the wine boundaries, rivers and altitude guides remain separate vector layers above it.
      </p>
    </div>
  );
}
