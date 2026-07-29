import {
  scwgProductPreview,
  scwgProductPreviewIntro,
  scwgRationaleCaveat,
  scwgRationaleIntro,
  scwgSynergyPoints,
  scwgWhyPairs,
} from "@/lib/scwg-rationale";
import { scwgUi } from "@/lib/scwg-meta";

// Why these two wastes — the case for the pairing, between the compliance
// framing and the siting problem. Server component; content from lib.

export function ScwgRationale() {
  return (
    <div className="space-y-8">
      <p className="text-sm leading-7 text-ink/65">{scwgRationaleIntro}</p>

      {/* Each feed: the problem, and what it brings */}
      <div className="grid gap-5 lg:grid-cols-2">
        {scwgWhyPairs.map((pair) => (
          <article className="rounded-[2rem] border border-ink/10 bg-surface/55 p-6" key={pair.id}>
            <h3 className="text-lg font-semibold tracking-tight sm:text-xl">{pair.feed}</h3>
            <p className="mt-1 text-sm font-medium text-clay">{pair.problem}</p>
            <p className="mt-3 text-sm leading-7 text-ink/65">{pair.body}</p>
            <div className="mt-4 rounded-[1.25rem] border-l-2 border-moss bg-moss/8 px-4 py-3">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-moss">
                {scwgUi.rationale.contributionLabel}
              </p>
              <p className="mt-1 text-sm leading-6 text-ink/70">{pair.contribution}</p>
            </div>
          </article>
        ))}
      </div>

      {/* Why the pairing works */}
      <div className="rounded-[2rem] border border-ink/10 bg-surface/55 p-6 sm:p-8">
        <p className="eyebrow">{scwgUi.rationale.synergyLabel}</p>
        <ul className="mt-4 grid gap-4 lg:grid-cols-2">
          {scwgSynergyPoints.map((point) => (
            <li className="rounded-[1.25rem] border border-ink/10 bg-paper/60 p-4" key={point.title}>
              <p className="font-semibold text-ink/80">{point.title}</p>
              <p className="mt-1 text-sm leading-7 text-ink/65">{point.body}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* What comes out */}
      <div className="rounded-[2rem] border border-ink/10 bg-surface/55 p-6 sm:p-8">
        <p className="eyebrow">{scwgUi.rationale.productsLabel}</p>
        <p className="mt-3 text-sm leading-7 text-ink/65">{scwgProductPreviewIntro}</p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ink/15 text-[0.7rem] uppercase tracking-[0.12em] text-ink/45">
                <th className="py-1.5 pr-3 font-semibold">Stream</th>
                <th className="py-1.5 pr-3 font-semibold">Origin</th>
                <th className="py-1.5 font-semibold">Basis of value</th>
              </tr>
            </thead>
            <tbody>
              {scwgProductPreview.map((row) => (
                <tr className="border-b border-ink/8 align-top" key={row.stream}>
                  <td className="py-2 pr-3 font-medium text-ink/80">{row.stream}</td>
                  <td className="py-2 pr-3 text-ink/60">{row.origin}</td>
                  <td className="py-2 text-ink/60">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="rounded-[1.25rem] border-l-2 border-clay bg-clay/8 px-4 py-3 text-sm leading-7 text-ink/75">
        {scwgRationaleCaveat}
      </p>
    </div>
  );
}
