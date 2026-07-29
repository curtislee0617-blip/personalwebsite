import type { StreamRow } from "@/lib/scwg-types";
import { ScwgValue } from "@/components/scwg-value";

// Server component. Renders an inlet or outlet stream table from block data.
// Purely derived — a new block's streams render here with no code change.

const PHASE_LABEL: Record<StreamRow["phase"], string> = {
  solid: "Solid",
  liquid: "Liquid",
  gas: "Gas",
  slurry: "Slurry",
  supercritical: "Supercritical",
  mixed: "Mixed",
};

export function ScwgStreamTable({ title, rows }: { title: string; rows: StreamRow[] }) {
  if (rows.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <p className="eyebrow mb-2">{title}</p>
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-ink/15 text-[0.7rem] uppercase tracking-[0.12em] text-ink/45">
            <th className="py-1.5 pr-3 font-semibold">Tag</th>
            <th className="py-1.5 pr-3 font-semibold">Stream</th>
            <th className="py-1.5 pr-3 font-semibold">Phase</th>
            <th className="py-1.5 pr-3 font-semibold">Components</th>
            <th className="py-1.5 font-semibold">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-b border-ink/8 align-top" key={`${title}-${row.tag}-${row.name}`}>
              <td className="py-2 pr-3">
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-ink/25 px-1.5 font-mono text-xs tabular-nums text-ink/70">
                  {row.tag}
                </span>
              </td>
              <td className="py-2 pr-3 font-medium text-ink/80">{row.name}</td>
              <td className="py-2 pr-3 text-ink/55">{PHASE_LABEL[row.phase]}</td>
              <td className="py-2 pr-3 text-ink/60">{row.components}</td>
              <td className="py-2">{row.quantity ? <ScwgValue data={row.quantity} /> : <span className="text-ink/35">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
