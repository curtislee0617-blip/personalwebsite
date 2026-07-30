"use client";

import { useMemo, useState } from "react";
import {
  wineGrapeCount,
  wineGrapeUseById,
  wineGrapeUseRankById,
  wineGrapes,
  type WineGrapeColour,
} from "@/data/wine-grape-data";

type ColourFilter = "all" | WineGrapeColour;
type RoleFilter = "all" | "still" | "sparkling" | "sweet" | "fortified" | "skin-contact";
type SortMode = "usage" | "alphabetical";

const hectareFormatter = new Intl.NumberFormat("en", {
  maximumFractionDigits: 0,
});

const colourFilters: Array<{ id: ColourFilter; label: string }> = [
  { id: "all", label: "All colours" },
  { id: "red", label: "Red grapes" },
  { id: "white", label: "White grapes" },
  { id: "pink", label: "Pink / grey skins" },
];

const roleFilters: Array<{ id: RoleFilter; label: string }> = [
  { id: "all", label: "Every role" },
  { id: "still", label: "Still wine" },
  { id: "sparkling", label: "Sparkling" },
  { id: "sweet", label: "Sweet" },
  { id: "fortified", label: "Fortified" },
  { id: "skin-contact", label: "Skin contact" },
];

export function WineGrapeAtlas() {
  const [query, setQuery] = useState("");
  const [colour, setColour] = useState<ColourFilter>("all");
  const [role, setRole] = useState<RoleFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("usage");
  const [selectedId, setSelectedId] = useState("cabernet-sauvignon");

  const filteredGrapes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return wineGrapes
      .filter((item) => colour === "all" || item.colour === colour)
      .filter((item) => role === "all" || item.roles.includes(role))
      .filter((item) => {
        if (!normalizedQuery) return true;
        return [
          item.name,
          ...item.aliases,
          item.origin,
          item.profile,
          ...item.regions,
          ...item.roles,
        ].join(" ").toLocaleLowerCase().includes(normalizedQuery);
      })
      .sort((left, right) => {
        if (sortMode === "alphabetical") return left.name.localeCompare(right.name);
        const leftArea = wineGrapeUseById[left.id]?.areaHectares ?? -1;
        const rightArea = wineGrapeUseById[right.id]?.areaHectares ?? -1;
        return rightArea - leftArea || left.name.localeCompare(right.name);
      });
  }, [colour, query, role, sortMode]);

  const selectedGrape =
    filteredGrapes.find((item) => item.id === selectedId)
    ?? filteredGrapes[0]
    ?? wineGrapes.find((item) => item.id === selectedId)
    ?? wineGrapes[0];
  const selectedUse = wineGrapeUseById[selectedGrape.id];
  const selectedRank = wineGrapeUseRankById[selectedGrape.id];

  return (
    <div className="wine-grape-atlas">
      <div className="wine-grape-toolbar">
        <label>
          <span>Find a grape or region</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try Nebbiolo, Sherry or Chile…"
            type="search"
            value={query}
          />
        </label>
        <div aria-label="Filter grape colour" className="wine-grape-filter-group">
          {colourFilters.map((filter) => (
            <button
              aria-pressed={colour === filter.id}
              data-colour={filter.id}
              key={filter.id}
              onClick={() => setColour(filter.id)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div aria-label="Filter grapes by wine role" className="wine-grape-filter-group is-role">
          {roleFilters.map((filter) => (
            <button
              aria-pressed={role === filter.id}
              key={filter.id}
              onClick={() => setRole(filter.id)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div aria-label="Sort grape varieties" className="wine-grape-sort">
          <span>Order</span>
          <button
            aria-pressed={sortMode === "usage"}
            onClick={() => setSortMode("usage")}
            type="button"
          >
            Most used
          </button>
          <button
            aria-pressed={sortMode === "alphabetical"}
            onClick={() => setSortMode("alphabetical")}
            type="button"
          >
            A–Z
          </button>
        </div>
      </div>

      <div className="wine-grape-method-note">
        <div>
          <strong>“Most used” means global bearing vineyard area</strong>
          <p>
            Area is a more stable comparison than bottle sales, although yield and final use still vary. The figures
            are mainly 2023 estimates; family labels are marked because they are not directly comparable with one
            variety.
          </p>
        </div>
        <a
          href="https://economics.adelaide.edu.au/wine-economics/databases"
          rel="noreferrer"
          target="_blank"
        >
          University of Adelaide data ↗
        </a>
      </div>

      <div className="wine-grape-atlas-layout">
        <div className="wine-grape-results">
          <header>
            <p>
              Showing <strong>{filteredGrapes.length}</strong> of {wineGrapeCount}
            </p>
            {(query || colour !== "all" || role !== "all") ? (
              <button
                onClick={() => {
                  setQuery("");
                  setColour("all");
                  setRole("all");
                }}
                type="button"
              >
                Clear filters
              </button>
            ) : null}
          </header>
          {filteredGrapes.length ? (
            <div className="wine-grape-grid">
              {filteredGrapes.map((item) => {
                const usage = wineGrapeUseById[item.id];
                const rank = wineGrapeUseRankById[item.id];
                return (
                  <button
                    aria-pressed={selectedGrape.id === item.id}
                    data-colour={item.colour}
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    type="button"
                  >
                    <i aria-hidden="true" />
                    <span>
                      <strong>{item.name}</strong>
                      <small className="wine-grape-usage">
                        {usage?.kind === "family-reference"
                          ? "family reference · no single area"
                          : usage?.kind === "family-total"
                            ? `family total · ≈${hectareFormatter.format(usage.areaHectares ?? 0)} ha`
                            : `#${rank} here · ≈${hectareFormatter.format(usage?.areaHectares ?? 0)} ha`}
                      </small>
                      <small>{item.origin}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="wine-grape-empty">Nothing matches those filters yet.</p>
          )}
        </div>

        <aside aria-live="polite" className="wine-grape-profile">
          <header>
            <div>
              <p className="eyebrow">{selectedGrape.colour} grape · {selectedGrape.roles.join(" · ")}</p>
              <h3>{selectedGrape.name}</h3>
            </div>
            <span data-colour={selectedGrape.colour} aria-hidden="true" />
          </header>
          {selectedGrape.aliases.length ? (
            <p className="wine-grape-aliases">
              Also called {selectedGrape.aliases.join(", ")}
            </p>
          ) : null}
          <dl>
            <div>
              <dt>Where it began</dt>
              <dd>{selectedGrape.origin}</dd>
            </div>
            <div>
              <dt>Growing behaviour</dt>
              <dd>{selectedGrape.climate}</dd>
            </div>
            <div>
              <dt>Aroma and flavour</dt>
              <dd>{selectedGrape.profile}</dd>
            </div>
            <div>
              <dt>Structure in the glass</dt>
              <dd>{selectedGrape.structure}</dd>
            </div>
            <div>
              <dt>Family note</dt>
              <dd>{selectedGrape.lineage}</dd>
            </div>
            <div>
              <dt>How commonly it is used</dt>
              <dd>
                {selectedUse?.kind === "family-reference" ? (
                  "This is a family reference, not one variety, so one planted-area figure would be misleading."
                ) : selectedUse?.kind === "family-total" ? (
                  `About ${hectareFormatter.format(selectedUse.areaHectares ?? 0)} hectares in ${selectedUse.dataYear}, combining the five principal named Lambrusco varieties.`
                ) : (
                  <>
                    About {hectareFormatter.format(selectedUse?.areaHectares ?? 0)} hectares of bearing vines
                    reported for {selectedUse?.dataYear}. That places it #{selectedRank} by area among the individual
                    varieties in this guide.
                    {selectedUse?.sourceName ? ` The source records it as ${selectedUse.sourceName}.` : ""}
                  </>
                )}
              </dd>
            </div>
          </dl>
          <section>
            <h4>Regions where it matters</h4>
            <div className="wine-grape-region-tags">
              {selectedGrape.regions.map((region) => <span key={region}>{region}</span>)}
            </div>
          </section>
        </aside>
      </div>

      <div className="wine-grape-family-strip">
        <div>
          <p className="eyebrow">The family is tangled</p>
          <h3>A few parents explain a surprising amount of the atlas</h3>
        </div>
        <div className="wine-grape-family-lines">
          <p><strong>Pinot × Gouais Blanc</strong><span>Chardonnay · Gamay · Aligoté · Melon</span></p>
          <p><strong>Cabernet Franc’s line</strong><span>Merlot · Carménère · Cabernet Sauvignon</span></p>
          <p><strong>Savagnin’s line</strong><span>Chenin Blanc · Grüner Veltliner · Silvaner relatives</span></p>
          <p><strong>Modern deliberate crosses</strong><span>Zweigelt · Pinotage · Marselan · Bacchus</span></p>
        </div>
        <p>
          A synonym is the same grape under another name; a colour mutation is nearly the same genome with a skin
          change; a crossing combines two parents; and a family name such as Lambrusco or Malvasia may hide several
          genuinely different varieties. I have kept those categories separate wherever the books make the distinction.
        </p>
      </div>
    </div>
  );
}
