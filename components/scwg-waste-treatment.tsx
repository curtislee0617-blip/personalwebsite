import {
  scwgAirStandards,
  scwgWasteCaveat,
  scwgWasteClosing,
  scwgWasteIntro,
  scwgWasteStreams,
  scwgWaterStandards,
  type WasteStandard,
} from "@/lib/scwg-waste-treatment";
import { scwgUi } from "@/lib/scwg-meta";

// Waste treatment and discharge compliance, after the flowsheet. Server
// component; every standard and stream row comes from lib.

function StandardTable({ label, rows }: { label: string; rows: WasteStandard[] }) {
  return (
    <div>
      <p className="eyebrow mb-3">{label}</p>
      <ul className="space-y-3">
        {rows.map((row) => (
          <li className="rounded-[1.25rem] border border-ink/10 bg-paper/60 p-4" key={row.code}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-mono text-sm font-semibold tabular-nums text-ink/85">{row.code}</p>
              <span className="rounded-full border border-clay/40 bg-clay/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-clay">
                {scwgUi.waste.verifyBadge}
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-ink/75">{row.title}</p>
            <p className="mt-2 max-w-prose text-sm leading-7 text-ink/60">{row.relevance}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ScwgWasteTreatment() {
  return (
    <div className="space-y-8">
      <p className="max-w-prose text-sm leading-7 text-ink/65">{scwgWasteIntro}</p>

      <p className="max-w-prose rounded-[1.25rem] border-l-2 border-clay bg-clay/8 px-4 py-3 text-sm font-medium leading-6 text-ink/80">
        {scwgWasteCaveat}
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <StandardTable label={scwgUi.waste.waterLabel} rows={scwgWaterStandards} />
        <StandardTable label={scwgUi.waste.airLabel} rows={scwgAirStandards} />
      </div>

      <div className="rounded-[2rem] border border-ink/10 bg-surface/55 p-6 sm:p-8">
        <p className="eyebrow">{scwgUi.waste.streamsLabel}</p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ink/15 text-[0.7rem] uppercase tracking-[0.12em] text-ink/45">
                <th className="py-1.5 pr-3 font-semibold">Stream</th>
                <th className="py-1.5 pr-3 font-semibold">Origin</th>
                <th className="py-1.5 pr-3 font-semibold">Contaminants</th>
                <th className="py-1.5 pr-3 font-semibold">Treatment route</th>
                <th className="py-1.5 font-semibold">Residual risk</th>
              </tr>
            </thead>
            <tbody>
              {scwgWasteStreams.map((row) => (
                <tr className="border-b border-ink/8 align-top" key={row.stream}>
                  <td className="py-2.5 pr-3 font-medium text-ink/80">{row.stream}</td>
                  <td className="py-2.5 pr-3 text-ink/60">{row.origin}</td>
                  <td className="py-2.5 pr-3 text-ink/60">{row.contaminants}</td>
                  <td className="py-2.5 pr-3 text-ink/60">{row.route}</td>
                  <td className="py-2.5 text-clay/90">{row.residualRisk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="max-w-prose text-sm leading-7 text-ink/70">{scwgWasteClosing}</p>
    </div>
  );
}
