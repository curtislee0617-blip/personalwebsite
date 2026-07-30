import {
  scwgBlendConstraints,
  scwgBlendIntro,
  scwgBlendNotes,
  scwgChlorideNote,
  scwgDealkalizationSynergy,
  scwgFeedstockIntro,
  scwgFeedstockProfiles,
  scwgHeteroatomFates,
  scwgHeteroatomIntro,
  scwgRedMudComposition,
} from "@/lib/scwg-feedstock";
import { scwgReferenceByMarker } from "@/lib/scwg-references";
import { scwgUi } from "@/lib/scwg-meta";
import { ScwgFeedstockConstraints } from "@/components/scwg-feedstock-constraints";

// Report Section 1 — feedstock characterization and blend design. Server
// component; all prose and every table row comes from lib/scwg-feedstock.ts.

function Cite({ source }: { source: string }) {
  const reference = scwgReferenceByMarker(source);
  return (
    <sup className="ml-0.5 font-sans text-[0.62em] font-semibold text-moss">
      <a
        className="no-underline hover:underline focus-visible:underline"
        href={`#scwg-ref-${reference?.id ?? source}`}
        title={reference?.citation ?? source}
      >
        [{reference?.marker ?? source}]
      </a>
    </sup>
  );
}

function IndicativeTag() {
  return (
    <span
      className="ml-1.5 rounded-[0.3rem] bg-clay/12 px-1 py-px align-middle text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-clay"
      title="Indicative — not yet traceable to a primary source."
    >
      ind.
    </span>
  );
}

export function ScwgFeedstock() {
  return (
    <div className="space-y-10">
      <p className="text-sm leading-7 text-ink/65">{scwgFeedstockIntro}</p>

      {/* The three feeds */}
      <div className="space-y-6">
        {scwgFeedstockProfiles.map((feed) => (
          <article className="rounded-[2rem] border border-ink/10 bg-surface/55 p-6 sm:p-8" key={feed.id}>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">{feed.name}</h3>
              <p className="text-sm text-ink/50">{feed.subtitle}</p>
            </div>

            <div className="mt-4 space-y-3 text-sm leading-7 text-ink/65">
              {feed.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {feed.analyses ? (
              <dl className="mt-5 grid gap-x-8 gap-y-2 rounded-[1.25rem] border border-dashed border-ink/15 bg-paper/50 p-4 sm:grid-cols-2">
                {feed.analyses.map((entry) => (
                  <div className="flex items-baseline justify-between gap-3" key={entry.label}>
                    <dt className="text-sm text-ink/60">{entry.label}</dt>
                    <dd className="text-right font-mono text-sm tabular-nums text-ink/85">
                      {entry.value}
                      {entry.source ? <Cite source={entry.source} /> : null}
                      {entry.indicative ? <IndicativeTag /> : null}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {feed.consequences ? (
              <ul className="mt-5 space-y-3">
                {feed.consequences.map((consequence) => (
                  <li className="rounded-[1.25rem] border border-ink/10 bg-paper/60 p-4" key={consequence.title}>
                    <p className="font-semibold text-ink/80">{consequence.title}</p>
                    <p className="mt-1 text-sm leading-7 text-ink/65">{consequence.body}</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>

      {/* The load-bearing claim */}
      <div className="rounded-[2rem] border-l-2 border-moss bg-moss/8 p-6 sm:p-8">
        <p className="eyebrow">{scwgUi.feedstock.synergyLabel}</p>
        <h3 className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">
          {scwgDealkalizationSynergy.title}
        </h3>
        <p className="mt-3 text-sm leading-7 text-ink/70">
          {scwgDealkalizationSynergy.body}
          <Cite source={scwgDealkalizationSynergy.source} />
        </p>
        <p className="mt-3 text-sm font-medium leading-7 text-ink/80">
          {scwgDealkalizationSynergy.consequence}
        </p>
      </div>

      {/* Red mud composition */}
      <div className="rounded-[2rem] border border-ink/10 bg-surface/55 p-6 sm:p-8">
        <p className="eyebrow">{scwgUi.feedstock.compositionLabel}</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ink/15 text-[0.7rem] uppercase tracking-[0.12em] text-ink/45">
                <th className="py-1.5 pr-3 font-semibold">Component</th>
                <th className="py-1.5 pr-3 font-semibold">Typical range (wt%)</th>
                <th className="py-1.5 pr-3 font-semibold">Representative Chinese Bayer residue</th>
                <th className="py-1.5 font-semibold">Function in this process</th>
              </tr>
            </thead>
            <tbody>
              {scwgRedMudComposition.map((row) => (
                <tr className="border-b border-ink/8 align-top" key={row.component}>
                  <td className="py-2 pr-3 font-mono font-semibold tabular-nums text-ink/85">{row.component}</td>
                  <td className="py-2 pr-3 font-mono tabular-nums text-ink/65">{row.typicalRange}</td>
                  <td className="py-2 pr-3 font-mono tabular-nums text-ink/65">{row.representative}</td>
                  <td className="py-2 text-ink/60">{row.functionNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-6 text-ink/45">
          {scwgUi.feedstock.compositionCaption}
        </p>
      </div>

      {/* Blend design */}
      <div className="rounded-[2rem] border border-ink/10 bg-surface/55 p-6 sm:p-8">
        <p className="eyebrow">{scwgUi.feedstock.blendLabel}</p>
        <p className="mt-3 text-sm leading-7 text-ink/65">{scwgBlendIntro}</p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ink/15 text-[0.7rem] uppercase tracking-[0.12em] text-ink/45">
                <th className="py-1.5 pr-3 font-semibold">Constraint</th>
                <th className="py-1.5 pr-3 font-semibold">Bounding variable</th>
                <th className="py-1.5 pr-3 font-semibold">Design window</th>
                <th className="py-1.5 font-semibold">Binding?</th>
              </tr>
            </thead>
            <tbody>
              {scwgBlendConstraints.map((row) => (
                <tr className="border-b border-ink/8 align-top" key={row.constraint}>
                  <td className="py-2 pr-3 font-medium text-ink/80">{row.constraint}</td>
                  <td className="py-2 pr-3 text-ink/60">{row.boundingVariable}</td>
                  <td className="py-2 pr-3 text-ink/60">
                    {row.designWindow}
                    {row.indicative ? <IndicativeTag /> : null}
                  </td>
                  <td className="py-2 text-ink/60">{row.binding}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 space-y-3 text-sm leading-7 text-ink/65">
          {scwgBlendNotes.map((note, index) => (
            <p key={index}>{note}</p>
          ))}
        </div>
      </div>

      {/* Heteroatom fate */}
      <div className="rounded-[2rem] border border-ink/10 bg-surface/55 p-6 sm:p-8">
        <p className="eyebrow">{scwgUi.feedstock.heteroatomLabel}</p>
        <p className="mt-3 text-sm leading-7 text-ink/65">{scwgHeteroatomIntro}</p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ink/15 text-[0.7rem] uppercase tracking-[0.12em] text-ink/45">
                <th className="py-1.5 pr-3 font-semibold">Element</th>
                <th className="py-1.5 pr-3 font-semibold">Source</th>
                <th className="py-1.5 pr-3 font-semibold">Form after gasification</th>
                <th className="py-1.5 font-semibold">Assigned fate and responsible unit</th>
              </tr>
            </thead>
            <tbody>
              {scwgHeteroatomFates.map((row) => (
                <tr className="border-b border-ink/8 align-top" key={row.element}>
                  <td className="py-2 pr-3">
                    <span className="font-mono font-semibold tabular-nums text-ink/85">{row.element}</span>
                    {row.dataGap ? (
                      <span className="ml-2 rounded-full border border-clay/40 bg-clay/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-clay">
                        {scwgUi.feedstock.dataGapBadge}
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2 pr-3 text-ink/60">{row.source}</td>
                  <td className="py-2 pr-3 text-ink/60">{row.form}</td>
                  <td className="py-2 text-ink/60">{row.fate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 rounded-[1.25rem] border-l-2 border-clay bg-clay/8 px-4 py-3">
          <p className="text-sm font-semibold text-ink/80">{scwgChlorideNote.title}</p>
          <p className="mt-1 text-sm leading-6 text-ink/70">
            {scwgChlorideNote.body}
            <Cite source={scwgChlorideNote.source} />
          </p>
        </div>
      </div>

      <ScwgFeedstockConstraints />
    </div>
  );
}
