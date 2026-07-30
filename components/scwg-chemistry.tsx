import {
  scwgChemistryIntro,
  scwgCokingNote,
  scwgContradictions,
  scwgContradictionsIntro,
  scwgFormateCycle,
  scwgGasifierReactions,
  scwgGasifierReactionsCaption,
  scwgGasifierTopics,
  scwgIronBuffering,
  scwgOxzeoTopics,
  scwgRatioArgument,
  scwgReformerReactions,
  scwgReformerReactionsCaption,
  scwgRegimeNote,
  scwgSaltPhysics,
  scwgUnifyingInsight,
  scwgWaterCaption,
  scwgWaterIntro,
  scwgWaterProperties,
} from "@/lib/scwg-chemistry";
import type { ChemistryTopic, ReactionRow } from "@/lib/scwg-types";
import { scwgUi } from "@/lib/scwg-meta";

// Report Section 3 — thermodynamic and kinetic basis. Server component; every
// sentence, reaction and table row comes from lib/scwg-chemistry.ts.

const CALLOUT_STYLE = {
  insight: "border-moss bg-moss/8",
  warning: "border-clay bg-clay/8",
  consequence: "border-ink/25 bg-ink/5",
} as const;

function Topic({ topic }: { topic: ChemistryTopic }) {
  return (
    <div>
      <h4 className="font-semibold text-ink/85">{topic.title}</h4>
      <div className="mt-2 space-y-2 text-sm leading-7 text-ink/65">
        {topic.paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      {topic.callout ? (
        <div className={`mt-3 rounded-[1.25rem] border-l-2 px-4 py-3 ${CALLOUT_STYLE[topic.callout.kind]}`}>
          <p className="text-sm font-semibold text-ink/80">{topic.callout.title}</p>
          <p className="mt-1 text-sm leading-6 text-ink/70">{topic.callout.body}</p>
        </div>
      ) : null}
    </div>
  );
}

function ReactionTable({ rows, caption, roleHeading }: { rows: ReactionRow[]; caption: string; roleHeading: string }) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-ink/15 text-[0.7rem] uppercase tracking-[0.12em] text-ink/45">
              <th className="py-1.5 pr-3 font-semibold">Reaction</th>
              <th className="py-1.5 pr-3 font-semibold">Stoichiometry</th>
              <th className="py-1.5 pr-3 font-semibold">ΔH°₂₉₈</th>
              <th className="py-1.5 font-semibold">{roleHeading}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-b border-ink/8 align-top" key={row.name}>
                <td className="py-2 pr-3 font-medium text-ink/80">{row.name}</td>
                <td className="py-2 pr-3 font-mono text-xs tabular-nums text-ink/70">{row.stoichiometry}</td>
                <td className="py-2 pr-3 font-mono tabular-nums text-ink/70">{row.enthalpy}</td>
                <td className="py-2 text-ink/60">{row.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs leading-6 text-ink/45">{caption}</p>
    </div>
  );
}

export function ScwgChemistry() {
  return (
    <div className="space-y-10">
      <p className="text-sm leading-7 text-ink/65">{scwgChemistryIntro}</p>

      {/* §3.1 the solvent */}
      <div className="rounded-[2rem] border border-ink/10 bg-surface/55 p-6 sm:p-8">
        <p className="eyebrow">{scwgUi.chemistry.solventLabel}</p>
        <p className="mt-3 text-sm leading-7 text-ink/65">{scwgWaterIntro}</p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ink/15 text-[0.7rem] uppercase tracking-[0.12em] text-ink/45">
                <th className="py-1.5 pr-3 font-semibold">Property</th>
                <th className="py-1.5 pr-3 font-semibold">25 °C, 0.1 MPa</th>
                <th className="py-1.5 pr-3 font-semibold">400 °C, 25 MPa</th>
                <th className="py-1.5 pr-3 font-semibold">600 °C, 25 MPa</th>
                <th className="py-1.5 font-semibold">Consequence</th>
              </tr>
            </thead>
            <tbody>
              {scwgWaterProperties.map((row) => (
                <tr className="border-b border-ink/8 align-top" key={row.property}>
                  <td className="py-2 pr-3 font-medium text-ink/80">
                    {row.property}
                    {row.indicative ? (
                      <span
                        className="ml-1.5 rounded-[0.3rem] bg-clay/12 px-1 py-px align-middle text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-clay"
                        title="Extrapolated — requires a cited source before final issue."
                      >
                        ind.
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2 pr-3 font-mono tabular-nums text-ink/70">{row.ambient}</td>
                  <td className="py-2 pr-3 font-mono tabular-nums text-ink/70">{row.nearCritical}</td>
                  <td className="py-2 pr-3 font-mono tabular-nums text-ink/70">{row.operating}</td>
                  <td className="py-2 text-ink/60">{row.consequence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-6 text-ink/45">{scwgWaterCaption}</p>

        <div className="mt-5 rounded-[1.25rem] border-l-2 border-moss bg-moss/8 px-4 py-3">
          <p className="text-sm font-semibold text-ink/80">{scwgUnifyingInsight.title}</p>
          <p className="mt-1 text-sm leading-6 text-ink/70">{scwgUnifyingInsight.body}</p>
          <p className="mt-2 text-sm font-medium leading-6 text-ink/80">{scwgUnifyingInsight.consequence}</p>
        </div>

        <p className="mt-4 text-sm leading-7 text-ink/65">{scwgRegimeNote}</p>
      </div>

      {/* §3.2 gasifier reaction network */}
      <div className="rounded-[2rem] border border-ink/10 bg-surface/55 p-6 sm:p-8">
        <p className="eyebrow">{scwgUi.chemistry.gasifierLabel}</p>
        <div className="mt-4 space-y-6">
          {scwgGasifierTopics.map((topic) => (
            <Topic key={topic.id} topic={topic} />
          ))}
        </div>
        <div className="mt-6">
          <ReactionTable caption={scwgGasifierReactionsCaption} roleHeading="Role here" rows={scwgGasifierReactions} />
        </div>
      </div>

      {/* §3.3 iron and alkali */}
      <div className="rounded-[2rem] border border-ink/10 bg-surface/55 p-6 sm:p-8">
        <p className="eyebrow">{scwgUi.chemistry.ironLabel}</p>
        <div className="mt-4">
          <Topic topic={scwgIronBuffering} />
        </div>

        <div className="mt-6 rounded-[1.25rem] border border-ink/10 bg-paper/60 p-4">
          <p className="font-semibold text-ink/80">{scwgFormateCycle.title}</p>
          <p className="mt-1 text-sm leading-7 text-ink/65">{scwgFormateCycle.intro}</p>
          <ol className="mt-3 space-y-1">
            {scwgFormateCycle.steps.map((step) => (
              <li className="font-mono text-xs tabular-nums text-ink/75" key={step}>
                {step}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm leading-7 text-ink/65">{scwgFormateCycle.closing}</p>
        </div>
      </div>

      {/* §3.4 salts */}
      <div className="rounded-[2rem] border border-ink/10 bg-surface/55 p-6 sm:p-8">
        <p className="eyebrow">{scwgUi.chemistry.saltLabel}</p>
        <div className="mt-4">
          <Topic topic={scwgSaltPhysics} />
        </div>
      </div>

      {/* §3.5 bi-reforming */}
      <div className="rounded-[2rem] border border-ink/10 bg-surface/55 p-6 sm:p-8">
        <p className="eyebrow">{scwgUi.chemistry.reformerLabel}</p>
        <div className="mt-4">
          <ReactionTable caption={scwgReformerReactionsCaption} roleHeading="H₂/CO produced" rows={scwgReformerReactions} />
        </div>

        <div className="mt-6 rounded-[1.25rem] border-l-2 border-moss bg-moss/8 px-4 py-3">
          <p className="text-sm font-semibold text-ink/80">{scwgRatioArgument.title}</p>
          <p className="mt-1 text-sm leading-6 text-ink/70">{scwgRatioArgument.intro}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {scwgRatioArgument.routes.map((route) => (
              <div className="rounded-[1rem] border border-ink/10 bg-paper/70 p-3" key={route.label}>
                <p className="text-sm font-semibold text-ink/80">{route.label}</p>
                <p className="mt-1 font-mono text-xs tabular-nums text-ink/75">{route.stoichiometry}</p>
                <p className="mt-1 text-xs leading-5 text-ink/60">{route.requirement}</p>
                <p className="mt-1 text-xs font-medium leading-5 text-ink/75">{route.efficiency}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm leading-6 text-ink/70">{scwgRatioArgument.closing}</p>
        </div>

        <div className="mt-6">
          <Topic topic={scwgCokingNote} />
        </div>
      </div>

      {/* §3.6 OXZEO */}
      <div className="rounded-[2rem] border border-ink/10 bg-surface/55 p-6 sm:p-8">
        <p className="eyebrow">{scwgUi.chemistry.oxzeoLabel}</p>
        <div className="mt-4 space-y-6">
          {scwgOxzeoTopics.map((topic) => (
            <Topic key={topic.id} topic={topic} />
          ))}
        </div>
      </div>

      {/* §3.7 contradictions */}
      <div className="rounded-[2rem] border-l-2 border-clay bg-clay/8 p-6 sm:p-8">
        <p className="eyebrow">{scwgUi.chemistry.contradictionsLabel}</p>
        <p className="mt-3 text-sm leading-7 text-ink/70">{scwgContradictionsIntro}</p>
        <ul className="mt-4 space-y-3">
          {scwgContradictions.map((item) => (
            <li className="rounded-[1.25rem] border border-ink/10 bg-paper/60 p-4" key={item.title}>
              <p className="font-semibold text-ink/80">{item.title}</p>
              <p className="mt-1 text-sm leading-7 text-ink/65">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
