import type { BlockFlag, ProcessBlock } from "@/lib/scwg-types";
import { ScwgRange, ScwgValue } from "@/components/scwg-value";
import { ScwgStreamTable } from "@/components/scwg-stream-table";
import { scwgUi } from "@/lib/scwg-meta";

// Server component. Renders one block's right-column content generically from
// block data: header, conditions, function, roles, stream tables, duty, metrics,
// flags. Adding a block adds a section here with no code change.

const FLAG_STYLE: Record<BlockFlag["kind"], string> = {
  "needs-validation": "border-clay bg-clay/8 text-ink/80",
  warning: "border-clay bg-clay/8 text-ink/80",
  decision: "border-moss bg-moss/8 text-ink/80",
  note: "border-ink/15 bg-ink/5 text-ink/70",
};

export function ScwgProcessBlock({ block }: { block: ProcessBlock }) {
  return (
    <section
      aria-labelledby={`scwg-block-${block.id}-title`}
      className="scroll-mt-28"
      id={`scwg-block-${block.id}`}
    >
      <div className="rounded-[2rem] border border-ink/10 bg-surface/55 p-6 sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-sm font-semibold tabular-nums text-moss">{block.id}</span>
            <h3 className="text-xl font-semibold tracking-tight sm:text-2xl" id={`scwg-block-${block.id}-title`}>
              {block.name}
            </h3>
          </div>
          {block.needsValidation ? (
            <span className="rounded-full border border-clay/40 bg-clay/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-clay">
              {scwgUi.process.needsValidationBadge}
            </span>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink/60">
          {block.conditions.temperature ? (
            <span className="inline-flex items-baseline gap-1.5">
              <span className="text-xs uppercase tracking-[0.1em] text-ink/40">T</span>
              <ScwgRange data={block.conditions.temperature} />
            </span>
          ) : null}
          {block.conditions.pressure ? (
            <span className="inline-flex items-baseline gap-1.5">
              <span className="text-xs uppercase tracking-[0.1em] text-ink/40">P</span>
              <ScwgRange data={block.conditions.pressure} />
            </span>
          ) : null}
          {!block.conditions.temperature && !block.conditions.pressure ? (
            <span className="font-mono tabular-nums">{block.conditions.summary}</span>
          ) : null}
        </div>

        <div className="mt-5 space-y-3 text-sm leading-7 text-ink/65">
          {block.function.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {block.roles ? (
          <ul className="mt-5 space-y-3">
            {block.roles.map((role) => (
              <li className="rounded-[1.25rem] border border-ink/10 bg-paper/60 p-4" key={role.title}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold text-ink/80">{role.title}</p>
                  <span className="rounded-full bg-ink/8 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink/55">
                    {scwgUi.supportLabels[role.support]}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-ink/65">{role.body}</p>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <ScwgStreamTable rows={block.inlet} title={scwgUi.process.inletLabel} />
          <ScwgStreamTable rows={block.outlet} title={scwgUi.process.outletLabel} />
        </div>

        {block.duty || block.metrics ? (
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            {block.duty ? (
              <div className="rounded-[1.25rem] border border-ink/10 bg-paper/60 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/45">{block.duty.label}</dt>
                <dd className="mt-1.5">
                  <ScwgValue data={block.duty.value} />
                </dd>
                <p className="mt-1.5 text-xs text-ink/50">{block.duty.signConvention}</p>
              </div>
            ) : null}
            {block.metrics?.map((metric) => (
              <div className="rounded-[1.25rem] border border-ink/10 bg-paper/60 p-4" key={metric.label}>
                <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/45">{metric.label}</dt>
                <dd className="mt-1.5">
                  <ScwgValue data={metric.value} />
                </dd>
                <p className="mt-1.5 text-xs text-ink/50">{metric.definition}</p>
              </div>
            ))}
          </dl>
        ) : null}

        {block.contextValues ? (
          <div className="mt-5 rounded-[1.25rem] border border-dashed border-ink/15 bg-paper/40 p-4">
            <p className="eyebrow mb-2">{scwgUi.process.contextValuesLabel}</p>
            <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {block.contextValues.map((entry) => (
                <div className="flex items-baseline justify-between gap-3" key={entry.label}>
                  <dt className="text-sm text-ink/60">{entry.label}</dt>
                  <dd>
                    <ScwgValue data={entry.value} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        {block.flags ? (
          <ul className="mt-5 space-y-3">
            {block.flags.map((flag) => (
              <li className={`rounded-[1.25rem] border-l-2 px-4 py-3 ${FLAG_STYLE[flag.kind]}`} key={flag.title}>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] opacity-70">{scwgUi.flagLabels[flag.kind]}</p>
                <p className="mt-1 text-sm font-medium leading-6">{flag.title}</p>
                <p className="mt-1 text-sm leading-6 opacity-90">{flag.body}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
