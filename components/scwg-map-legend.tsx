import { scwgUi } from "@/lib/scwg-meta";

// How to read the marks on the siting map. Split out of scwg-siting-map.tsx to
// keep that component under the size limit. Copy lives in lib/scwg-meta.ts.

export function ScwgMapLegend() {
  return (
    <div className="rounded-[1.25rem] border border-dashed border-ink/15 bg-paper/50 p-4">
      <p className="eyebrow mb-2">{scwgUi.siting.markLegendLabel}</p>
      <ul className="space-y-1.5 text-xs leading-5 text-ink/60">
        <li className="flex items-start gap-2">
          <svg aria-hidden="true" className="mt-0.5 shrink-0" height="14" viewBox="0 0 14 14" width="14">
            <circle
              cx="7"
              cy="7"
              fill="rgb(var(--color-clay))"
              fillOpacity="0.9"
              r="6"
              stroke="rgb(var(--color-clay))"
              strokeWidth="1.6"
            />
          </svg>
          <span>{scwgUi.siting.markFilled}</span>
        </li>
        <li className="flex items-start gap-2">
          <svg aria-hidden="true" className="mt-0.5 shrink-0" height="14" viewBox="0 0 14 14" width="14">
            <circle cx="7" cy="7" fill="rgb(var(--color-paper))" r="4" stroke="rgb(var(--color-clay))" strokeWidth="1.6" />
          </svg>
          <span>{scwgUi.siting.markHollow}</span>
        </li>
        <li className="flex items-start gap-2">
          <svg aria-hidden="true" className="mt-0.5 shrink-0" height="14" viewBox="0 0 14 14" width="14">
            <path d="M1 7 h12" stroke="rgb(var(--color-ink))" strokeDasharray="2 3" strokeOpacity="0.5" strokeWidth="1.2" />
          </svg>
          <span>{scwgUi.siting.markDotted}</span>
        </li>
      </ul>
    </div>
  );
}
