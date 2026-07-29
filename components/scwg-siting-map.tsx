"use client";

import { useMemo, useState } from "react";
import { geoConicEqualArea, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection, Geometry } from "geojson";
import topo from "@/data/scwg-china-provinces.json";
import mapData from "@/data/scwg-map-sites.json";
import { scwgSitingCandidates, scwgSitingOverlays } from "@/lib/scwg-siting";
import { nearestSource } from "@/lib/scwg-geo";
import type { SitingOverlayId } from "@/lib/scwg-types";

// Act 2 — the siting map. An analytical choropleth (no API key, no network): the
// vendored TopoJSON is decoded with topojson-client and projected with d3-geo
// (geoConicEqualArea, parallels 25/47, rotate [-105,0]). Overlays use distinct
// mark SHAPES, not colour alone. The haul calculator reports great-circle
// distance from a candidate site to the nearest source in each active overlay.

const W = 760;
const H = 620;
const shading = mapData.fragmentedShading as Record<string, number>;
type Site = (typeof mapData.sites)[number];

export function ScwgSitingMap() {
  const [active, setActive] = useState<Record<SitingOverlayId, boolean>>(() =>
    Object.fromEntries(scwgSitingOverlays.map((o) => [o.id, o.defaultOn])) as Record<SitingOverlayId, boolean>,
  );
  const [candidateId, setCandidateId] = useState<string | null>(null);

  const provinces = useMemo(
    () => feature(topo as unknown as Topology, (topo as unknown as Topology).objects.provinces as GeometryCollection) as FeatureCollection<Geometry, { name: string }>,
    [],
  );
  const projection = useMemo(() => geoConicEqualArea().parallels([25, 47]).rotate([-105, 0]).fitSize([W, H], provinces), [provinces]);
  const path = useMemo(() => geoPath(projection), [projection]);

  const candidate = scwgSitingCandidates.find((c) => c.id === candidateId) ?? null;

  const hauls = useMemo(() => {
    if (!candidate) return [];
    return scwgSitingOverlays
      .filter((o) => active[o.id] && o.mark !== "shade")
      .map((o) => {
        const sites = mapData.sites.filter((s) => s.overlay === o.id);
        const near = nearestSource({ lon: candidate.lon, lat: candidate.lat }, sites);
        return near ? { overlay: o.label, km: near.km, name: near.source.name } : null;
      })
      .filter((x): x is { overlay: string; km: number; name: string } => x !== null);
  }, [candidate, active]);

  function markFor(site: Site, x: number, y: number) {
    const overlay = scwgSitingOverlays.find((o) => o.id === site.overlay);
    const filled = site.capacity != null;
    const r = site.capacity != null ? 5 + Math.min(6, site.capacity * 2) : 4.5;
    const common = {
      className: site.overlay === "redmud" ? "text-moss" : site.overlay === "okara-industrial" ? "text-clay" : "text-ink",
      fill: filled ? "currentColor" : "rgb(var(--color-paper))",
      fillOpacity: filled ? 0.85 : 1,
      stroke: "currentColor",
      strokeWidth: 1.4,
    };
    if (overlay?.mark === "square") return <rect {...common} height={r * 1.8} width={r * 1.8} x={x - r * 0.9} y={y - r * 0.9} />;
    if (overlay?.mark === "triangle") return <path {...common} d={`M ${x} ${y - r} L ${x + r} ${y + r} L ${x - r} ${y + r} Z`} />;
    return <circle {...common} cx={x} cy={y} r={r} />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="overflow-hidden rounded-[2rem] border border-ink/10 bg-surface/40 p-3">
        <svg aria-label="Choropleth of China: red mud and okara sources by province" className="h-auto w-full" role="img" viewBox={`0 0 ${W} ${H}`}>
          {/* provinces + fragmented shading */}
          <g>
            {provinces.features.map((f, i) => {
              const intensity = active["okara-fragmented"] ? shading[f.properties.name] ?? 0 : 0;
              return (
                <path
                  d={path(f) ?? undefined}
                  fill={intensity ? `rgb(var(--color-clay) / ${(intensity * 0.4).toFixed(3)})` : "rgb(var(--color-surface))"}
                  key={i}
                  stroke="rgb(var(--color-ink) / 0.18)"
                  strokeWidth={0.6}
                />
              );
            })}
          </g>

          {/* haul lines from candidate to nearest active source */}
          {candidate
            ? scwgSitingOverlays
                .filter((o) => active[o.id] && o.mark !== "shade")
                .map((o) => {
                  const sites = mapData.sites.filter((s) => s.overlay === o.id);
                  const near = nearestSource({ lon: candidate.lon, lat: candidate.lat }, sites);
                  if (!near) return null;
                  const a = projection([candidate.lon, candidate.lat]);
                  const b = projection([near.source.lon, near.source.lat]);
                  if (!a || !b) return null;
                  return <line key={o.id} stroke="rgb(var(--color-ink) / 0.45)" strokeDasharray="4 4" strokeWidth={1.2} x1={a[0]} x2={b[0]} y1={a[1]} y2={b[1]} />;
                })
            : null}

          {/* overlay marks */}
          {scwgSitingOverlays
            .filter((o) => active[o.id] && o.mark !== "shade")
            .flatMap((o) =>
              mapData.sites
                .filter((s) => s.overlay === o.id)
                .map((s) => {
                  const p = projection([s.lon, s.lat]);
                  if (!p) return null;
                  return <g key={s.id}>{markFor(s, p[0], p[1])}</g>;
                }),
            )}

          {/* candidate marker */}
          {candidate
            ? (() => {
                const p = projection([candidate.lon, candidate.lat]);
                if (!p) return null;
                return (
                  <g className="text-ink">
                    <circle cx={p[0]} cy={p[1]} fill="none" r={9} stroke="currentColor" strokeWidth={2} />
                    <circle cx={p[0]} cy={p[1]} fill="currentColor" r={2.5} />
                  </g>
                );
              })()
            : null}
        </svg>
      </div>

      <div className="space-y-5">
        <div>
          <p className="eyebrow mb-2">Overlays</p>
          <div className="flex flex-wrap gap-2">
            {scwgSitingOverlays.map((o) => (
              <button
                aria-pressed={active[o.id]}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  active[o.id] ? "border-ink/25 bg-ink/8 text-ink" : "border-ink/12 bg-paper/70 text-ink/50 hover:text-ink/75"
                }`}
                key={o.id}
                onClick={() => setActive((prev) => ({ ...prev, [o.id]: !prev[o.id] }))}
                type="button"
              >
                {o.mark === "shade" ? "▦" : o.mark === "square" ? "■" : o.mark === "triangle" ? "▲" : "●"} {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="eyebrow mb-2">Haul-distance calculator</p>
          <p className="mb-3 text-xs leading-6 text-ink/55">Pick a candidate site; distances are great-circle to the nearest source in each active overlay.</p>
          <div className="flex flex-col gap-2">
            {scwgSitingCandidates.map((c) => (
              <button
                aria-pressed={candidateId === c.id}
                className={`rounded-[1rem] border px-3 py-2 text-left text-sm font-semibold transition ${
                  candidateId === c.id ? "border-moss/40 bg-moss/10 text-ink" : "border-ink/12 bg-paper/70 text-ink/70 hover:border-ink/25"
                }`}
                key={c.id}
                onClick={() => setCandidateId((prev) => (prev === c.id ? null : c.id))}
                type="button"
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {candidate ? (
          <div className="rounded-[1.25rem] border border-ink/10 bg-surface/60 p-4">
            <p className="text-sm font-semibold text-ink/80">{candidate.label}</p>
            <p className="mt-1 text-xs leading-6 text-ink/55">{candidate.note}</p>
            <dl className="mt-3 space-y-2">
              {hauls.length === 0 ? (
                <p className="text-xs text-ink/50">No point-source overlays active.</p>
              ) : (
                hauls.map((h) => (
                  <div className="flex items-baseline justify-between gap-3 text-sm" key={h.overlay}>
                    <dt className="text-ink/60">{h.overlay}</dt>
                    <dd className="font-mono tabular-nums text-ink/85">{h.km.toLocaleString()} km</dd>
                  </div>
                ))
              )}
            </dl>
          </div>
        ) : null}
      </div>
    </div>
  );
}
