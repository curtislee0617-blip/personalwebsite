import { scwgSitingOverlays } from "@/lib/scwg-siting";
import type { SitingOverlayId } from "@/lib/scwg-types";

// One map mark. Split out of scwg-siting-map.tsx to keep that file under the
// size limit.
//
// Each overlay gets a distinct hue AND a distinct shape, so the distinction
// survives colour-blindness and high-contrast modes — colour is never the sole
// carrier. `--color-map-*` are added in globals.css for the overlays with no
// suitable existing token.
export const OVERLAY_COLOR: Record<SitingOverlayId, string> = {
  redmud: "var(--color-clay)", // warm red — red mud
  "okara-industrial": "var(--color-map-industrial)", // blue — industrial okara plants
  "okara-fragmented": "var(--color-moss)", // green — shading only
  ports: "var(--color-map-port)", // amber — major ports
  context: "var(--color-map-context)", // violet — straw / origin context
};

type MarkSite = { overlay: string; capacity: number | null };

/** Radius encodes capacity where known; hollow and uniform where it is not. */
export function ScwgMapMark({ site, x, y }: { site: MarkSite; x: number; y: number }) {
  const overlay = scwgSitingOverlays.find((o) => o.id === site.overlay);
  const filled = site.capacity != null;
  const r = site.capacity != null ? 5 + Math.min(6, site.capacity * 2) : 4.5;
  const color = OVERLAY_COLOR[site.overlay as SitingOverlayId] ?? "var(--color-ink)";
  const common = {
    fill: filled ? `rgb(${color})` : "rgb(var(--color-paper))",
    fillOpacity: filled ? 0.9 : 1,
    stroke: `rgb(${color})`,
    strokeWidth: 1.8,
  };

  if (overlay?.mark === "square") {
    return <rect {...common} height={r * 1.8} width={r * 1.8} x={x - r * 0.9} y={y - r * 0.9} />;
  }
  if (overlay?.mark === "triangle") {
    return <path {...common} d={`M ${x} ${y - r} L ${x + r} ${y + r} L ${x - r} ${y + r} Z`} />;
  }
  if (overlay?.mark === "diamond") {
    return <path {...common} d={`M ${x} ${y - r} L ${x + r} ${y} L ${x} ${y + r} L ${x - r} ${y} Z`} />;
  }
  return <circle {...common} cx={x} cy={y} r={r} />;
}
