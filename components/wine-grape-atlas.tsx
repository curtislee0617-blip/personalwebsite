"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from "react";
import { wineGrapeCount, wineGrapeUseById, wineGrapeUseRankById, wineGrapes, type WineGrapeColour } from "@/data/wine-grape-data";
import { wineGrapeImages } from "@/data/wine-grape-images";

const number = new Intl.NumberFormat("en", { maximumFractionDigits: 0 });
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const roles = ["all", ...new Set(wineGrapes.flatMap(grape => grape.roles))];

export function WineGrapeAtlas() {
  const [query, setQuery] = useState("");
  const [colour, setColour] = useState<"all" | WineGrapeColour>("all");
  const [role, setRole] = useState("all");
  const [sort, setSort] = useState("usage");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const selected = wineGrapes.find(grape => grape.id === selectedId);
  const image = selected && wineGrapeImages[selected.id];
  const use = selected && wineGrapeUseById[selected.id];
  const rank = selected && wineGrapeUseRankById[selected.id];
  const grapes = useMemo(() => wineGrapes.filter(grape =>
    (colour === "all" || grape.colour === colour) && (role === "all" || grape.roles.includes(role)) &&
    normalize([grape.name, ...grape.aliases, grape.origin, grape.profile, ...grape.regions, ...grape.roles].join(" ")).includes(normalize(query.trim()))
  ).sort((a,b) => sort === "alphabetical" ? a.name.localeCompare(b.name) : (wineGrapeUseById[b.id]?.areaHectares ?? -1) - (wineGrapeUseById[a.id]?.areaHectares ?? -1) || a.name.localeCompare(b.name)), [colour, role, query, sort]);
  useEffect(() => {
    const element = dialog.current;
    if (!element || !selectedId) return;
    element.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { element.close(); document.body.style.overflow = previousOverflow; };
  }, [selectedId]);

  return (
    <div className="wine-grape-atlas">
      <div className="wine-variety-controls">
        <label><span>Search varieties, synonyms or regions</span><input type="search" placeholder="Pinot, Shiraz, Rioja…" value={query} onChange={event => setQuery(event.target.value)} /></label>
        <label><span>Grape colour</span><select value={colour} onChange={event => setColour(event.target.value as typeof colour)}><option value="all">All colours</option><option value="red">Red / black</option><option value="white">White</option><option value="pink">Pink / grey</option></select></label>
        <label><span>Wine style</span><select value={role} onChange={event => setRole(event.target.value)}>{roles.map(item => <option key={item} value={item}>{item === "all" ? "All styles" : item.replace("-", " ")}</option>)}</select></label>
        <label><span>Order</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="usage">Vineyard area</option><option value="alphabetical">A–Z</option></select></label>
      </div>
      <div className="wine-variety-count"><p role="status">{grapes.length} of {wineGrapeCount} entries · select a variety to read its profile</p>{(query || colour !== "all" || role !== "all") && <button type="button" onClick={() => {setQuery("");setColour("all");setRole("all");}}>Clear filters</button>}</div>
      <div className="wine-variety-library" data-lenis-prevent aria-label="Grape varieties">
        {grapes.map(grape => {
          const photo = wineGrapeImages[grape.id];
          return <button className="wine-variety-card" key={grape.id} type="button" aria-haspopup="dialog" onClick={() => setSelectedId(grape.id)}>
            <div className="wine-variety-image">{photo ? <img alt={`${grape.name} — ${photo.subject ?? "variety reference image"}`} loading="lazy" src={photo.file} width="360" height="280" /> : <span className="wine-variety-no-image">Image awaiting verification</span>}</div>
            <span className="wine-variety-card-copy"><small>{grape.colour} grape · {grape.roles.slice(0,2).join(" / ")}</small><strong>{grape.name}</strong><span>{grape.origin}</span><b>Read profile ↗</b></span>
          </button>;
        })}
      </div>
      {!grapes.length && <p className="wine-grape-empty">No matching varieties. Try a synonym or a broader region.</p>}
      <details className="wine-reference-note"><summary>About the images and vineyard-area ranking</summary><p>Photographs and historical botanical plates are attributed individually. A family entry may show a named representative; this is stated in its caption. Images are not a substitute for genetic identification. Vineyard area describes bearing vines, mainly from 2023, rather than sales; family totals and older observations are labelled separately.</p><a href="https://economics.adelaide.edu.au/wine-economics/databases" target="_blank" rel="noreferrer">University of Adelaide vineyard-area database ↗</a></details>
      <dialog ref={dialog} className="wine-variety-dialog" aria-labelledby="wine-variety-title" onClose={() => setSelectedId(null)} onClick={event => { if (event.target === event.currentTarget) { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) setSelectedId(null); } }}>
        {selected && <>
          <header><div><p className="eyebrow">Variety reference · {selected.colour} skin</p><h2 id="wine-variety-title">{selected.name}</h2></div><button autoFocus type="button" onClick={() => setSelectedId(null)} aria-label="Close grape profile">Close ×</button></header>
          <div className="wine-variety-entry" data-lenis-prevent>
            <div>
              {image ? <figure><img src={image.file} alt={`${selected.name} — ${image.subject ?? "variety reference image"}`} width="700" height="700" /><figcaption>{image.subject && <strong>{image.subject}. </strong>}{image.credit} · <a href={image.licenseUrl ?? image.sourceUrl} target="_blank" rel="noreferrer">{image.license}</a> · resized WebP · <a href={image.sourceUrl} target="_blank" rel="noreferrer">Image source ↗</a></figcaption></figure> : <p className="wine-variety-no-image">No verified image is available for this entry yet.</p>}
              {selected.aliases.length > 0 && <section><h3>Synonyms and related names</h3><p>{selected.aliases.join(" · ")}</p></section>}
              <section><h3>Wine styles</h3><p>{selected.roles.join(" · ")}</p></section>
              <section><h3>Principal regions</h3><p>{selected.regions.join(" · ")}</p></section>
            </div>
            <div className="wine-variety-facts">
              {[['Origin',selected.origin],['Aroma and flavour',selected.profile],['Structure',selected.structure],['Viticulture and climate',selected.climate],['Genetics and identity',selected.lineage]].map(([label,value]) => <section key={label}><h3>{label}</h3><p>{value}</p></section>)}
              <section><h3>Recorded vineyard area</h3><p>{use?.kind === 'family-reference' ? 'Family reference: a single planted-area figure would be misleading.' : use?.areaHectares != null ? <>{number.format(use.areaHectares)} ha · {use.dataYear}{use.kind === 'family-total' ? ' · combined family total' : rank ? ` · #${rank} among individual varieties in this library` : ''}.{use.sourceName && ` Recorded as ${use.sourceName}.`}</> : 'No comparable area observation is available.'}</p></section>
              <section className="wine-variety-references"><h3>Reference resources</h3><p>For formal identification and synonyms, consult a cultivar record; aroma and structure also depend on climate, ripeness and winemaking.</p><a href="https://www.vivc.de/" target="_blank" rel="noreferrer">Vitis International Variety Catalogue ↗</a><a href="https://www.plantgrape.fr/en" target="_blank" rel="noreferrer">Plantgrape: INRAE / IFV / Institut Agro ↗</a><a href="#wine-sources" onClick={() => setSelectedId(null)}>Guide bibliography ↗</a></section>
            </div>
          </div>
        </>}
      </dialog>
      <section className="wine-grape-family-strip"><div><p className="eyebrow">Genetics</p><h3>Varieties, synonyms and families</h3></div><div className="wine-grape-family-lines"><p><strong>Pinot × Gouais Blanc</strong><span>Chardonnay · Gamay · Aligoté · Melon</span></p><p><strong>Cabernet Franc’s line</strong><span>Merlot · Carménère · Cabernet Sauvignon</span></p><p><strong>Savagnin’s line</strong><span>Chenin Blanc · Grüner Veltliner · Silvaner relatives</span></p><p><strong>Deliberate crosses</strong><span>Zweigelt · Pinotage · Marselan · Bacchus</span></p></div><p>A synonym names the same variety; a colour mutation alters skin pigmentation within a variety; a crossing combines two parents. Names such as Lambrusco and Malvasia can encompass distinct varieties.</p></section>
    </div>
  );
}
