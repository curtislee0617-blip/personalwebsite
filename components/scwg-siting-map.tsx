"use client";

import { useMemo, useState } from "react";
import { geoConicEqualArea, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection, Geometry } from "geojson";
import topo from "@/data/scwg-china-provinces.json";
import neighbourTopo from "@/data/scwg-neighbours.json";
import mapData from "@/data/scwg-map-sites.json";
import { scwgSitingCandidates, scwgSitingOverlays } from "@/lib/scwg-siting";
import { nearestSource } from "@/lib/scwg-geo";
import { scwgUi } from "@/lib/scwg-meta";
import { MAINLAND_FOCUS, MAP_H, MAP_PAD, MAP_W } from "@/lib/scwg-map-frame";
import { ScwgMapLegend } from "@/components/scwg-map-legend";
import { OVERLAY_COLOR, ScwgMapMark } from "@/components/scwg-map-mark";
import type { SitingOverlayId } from "@/lib/scwg-types";

// Act 2 — the siting map. An analytical choropleth (no API key, no network): the
// vendored TopoJSON is decoded with topojson-client and projected with d3-geo
// (geoConicEqualArea, parallels 25/47, rotate [-105,0]). Overlays use distinct
// mark SHAPES, not colour alone. The haul calculator reports great-circle
// distance from a candidate site to the nearest source in each active overlay.

const shading = mapData.fragmentedShading as Record<string, number>;

export function ScwgSitingMap() {
  const [active, setActive] = useState<Record<SitingOverlayId, boolean>>(() =>
    Object.fromEntries(scwgSitingOverlays.map((o) => [o.id, o.defaultOn])) as Record<SitingOverlayId, boolean>,
  );
  const [candidateId, setCandidateId] = useState<string | null>(null);

  const provinces = useMemo(
    () => feature(topo as unknown as Topology, (topo as unknown as Topology).objects.provinces as GeometryCollection) as FeatureCollection<Geometry, { name: string }>,
    [],
  );
  // Neighbouring countries, drawn faint and dotted for geographic context only.
  const neighbours = useMemo(
    () =>
      feature(
        neighbourTopo as unknown as Topology,
        (neighbourTopo as unknown as Topology).objects.neighbours as GeometryCollection,
      ) as FeatureCollection<Geometry, { name: string }>,
    [],
  );
  // Fit to mainland China rather than to the province set. The provinces file
  // includes a South China Sea islands feature reaching ~3°N, so fitting to it
  // stretched the frame over 50° of latitude and left a tall column of empty
  // ocean below the landmass. Framing on an explicit mainland box crops that
  // tail; anything outside the box is simply clipped by the viewBox.
  const projection = useMemo(
    () => geoConicEqualArea().parallels([25, 47]).rotate([-105, 0]).fitExtent(
      [
        [MAP_PAD, MAP_PAD],
        [MAP_W - MAP_PAD, MAP_H - MAP_PAD],
      ],
      MAINLAND_FOCUS,
    ),
    [],
  );
  const path = useMemo(() => geoPath(projection), [projection]);
  const viewBox = `0 0 ${MAP_W} ${MAP_H}`;

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

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
      <div className="w-full overflow-hidden rounded-[2rem] border border-ink/10 bg-surface/40 p-3">
        {/* Height-bounded so the frame always fits inside one browser height. */}
        <svg
          aria-label={scwgUi.siting.mapAriaLabel}
          className="mx-auto block h-auto max-h-[76vh] w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          viewBox={viewBox}
        >
          {/* neighbouring countries — faint dotted context, drawn beneath China */}
          <g>
            {neighbours.features.map((f, i) => (
              <path
                d={path(f) ?? undefined}
                fill="rgb(var(--color-ink) / 0.03)"
                key={`nb-${i}`}
                stroke="rgb(var(--color-ink) / 0.22)"
                strokeDasharray="2 3"
                strokeWidth={0.6}
              />
            ))}
          </g>

          {/* provinces + fragmented shading. Taiwan is drawn dotted and unfilled. */}
          <g>
            {provinces.features.map((f, i) => {
              const isTaiwan = f.properties.name === "Taiwan";
              const intensity =
                active["douzha-fragmented"] && !isTaiwan ? shading[f.properties.name] ?? 0 : 0;
              return (
                <path
                  d={path(f) ?? undefined}
                  fill={
                    isTaiwan
                      ? "rgb(var(--color-ink) / 0.03)"
                      : intensity
                        ? `rgb(var(--color-moss) / ${(intensity * 0.45).toFixed(3)})`
                        : "rgb(var(--color-surface))"
                  }
                  key={i}
                  stroke={`rgb(var(--color-ink) / ${isTaiwan ? 0.22 : 0.18})`}
                  strokeDasharray={isTaiwan ? "2 3" : undefined}
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
                  return <ScwgMapMark key={s.id} site={s} x={p[0]} y={p[1]} />;
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

      <div className="space-y-3">
        <div>
          <p className="eyebrow mb-2">{scwgUi.siting.overlaysLabel}</p>
          <div className="flex flex-col gap-1.5">
            {scwgSitingOverlays.map((o) => (
              <details className="w-full rounded-[0.9rem] border border-ink/12 bg-paper/70 px-3 py-1.5" key={o.id}>
                <summary className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-ink/70 marker:content-['']">
                  <button
                    aria-label={`Toggle ${o.label}`}
                    aria-pressed={active[o.id]}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 transition ${
                      active[o.id] ? "bg-ink/8 text-ink" : "text-ink/45"
                    }`}
                    onClick={(event) => {
                      event.preventDefault();
                      setActive((prev) => ({ ...prev, [o.id]: !prev[o.id] }));
                    }}
                    type="button"
                  >
                    <span aria-hidden="true" style={{ color: `rgb(${OVERLAY_COLOR[o.id]})` }}>
                      {o.mark === "shade" ? "▦" : o.mark === "square" ? "■" : o.mark === "triangle" ? "▲" : o.mark === "diamond" ? "◆" : "●"}
                    </span>
                    {o.label}
                  </button>
                </summary>
                <p className="mt-1.5 text-xs leading-5 text-ink/55">{o.blurb}</p>
              </details>
            ))}
          </div>
        </div>

        <ScwgMapLegend />

        <div>
          <p className="eyebrow mb-2">{scwgUi.siting.haulLabel}</p>
          <p className="mb-3 text-xs leading-6 text-ink/55">{scwgUi.siting.haulHelp}</p>
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
                <p className="text-xs text-ink/50">{scwgUi.siting.noOverlays}</p>
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
