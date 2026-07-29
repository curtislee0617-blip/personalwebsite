import type { ProcessValue, ProcessRange } from "@/lib/scwg-types";
import { scwgReferenceByMarker } from "@/lib/scwg-references";

// Renders a single ProcessValue (or ProcessRange) with placeholder / literature
// styling. This is the ONE place placeholder discipline is expressed visually.
//
// - Placeholder: muted colour, dotted underline, small `est.` marker; the dotted
//   underline and marker carry the distinction so colour is never the sole cue.
//   Hover/focus reveals "Placeholder — pending balance closure."
// - Literature: normal weight, superscript citation marker resolving to a source.

const PLACEHOLDER_TITLE = "Placeholder — pending balance closure.";
const INDICATIVE_TITLE =
  "Indicative — general engineering knowledge, not yet traceable to a primary source. Must not survive to a final version without a citation.";

function formatNumber(value: number) {
  // Placeholders are stored as 0; show an em dash instead of a fake number.
  return Number.isFinite(value) ? value.toLocaleString("en-US") : "—";
}

function LiteratureMarker({ source }: { source: string }) {
  const reference = scwgReferenceByMarker(source);
  const label = reference ? reference.marker : source;
  return (
    <sup className="ml-0.5 font-sans text-[0.62em] font-semibold text-moss">
      <a
        className="no-underline hover:underline focus-visible:underline"
        href={`#scwg-ref-${reference?.id ?? source}`}
        title={reference ? reference.citation : `Source: ${source}`}
      >
        [{label}]
      </a>
    </sup>
  );
}

export function ScwgValue({ data }: { data: ProcessValue }) {
  const isPlaceholder = data.status === "placeholder";
  const numeral = data.status === "placeholder" && data.value === 0 ? "—" : formatNumber(data.value);

  if (isPlaceholder) {
    return (
      <span
        className="group inline-flex items-baseline gap-1 font-mono tabular-nums text-ink/45 [border-bottom:1px_dotted_rgb(var(--color-ink)/0.4)] focus-within:text-ink/70 hover:text-ink/70"
        tabIndex={0}
        title={data.note ? `${PLACEHOLDER_TITLE} ${data.note}` : PLACEHOLDER_TITLE}
      >
        <span>
          {numeral}
          {numeral !== "—" ? <span className="ml-1">{data.unit}</span> : null}
        </span>
        <span
          aria-label="estimate, placeholder pending balance closure"
          className="rounded-[0.3rem] bg-ink/8 px-1 py-px font-sans text-[0.6em] font-semibold uppercase tracking-[0.12em] text-ink/50"
        >
          est.
        </span>
      </span>
    );
  }

  if (data.status === "indicative") {
    return (
      <span
        className="group inline-flex items-baseline gap-1 font-mono tabular-nums text-ink/70 [border-bottom:1px_dashed_rgb(var(--color-clay)/0.7)] focus-within:text-ink/90 hover:text-ink/90"
        tabIndex={0}
        title={`${INDICATIVE_TITLE} ${data.note}`}
      >
        <span>
          {formatNumber(data.value)}
          <span className="ml-1">{data.unit}</span>
        </span>
        <span
          aria-label="indicative, not yet traceable to a primary source"
          className="rounded-[0.3rem] bg-clay/12 px-1 py-px font-sans text-[0.6em] font-semibold uppercase tracking-[0.12em] text-clay"
        >
          ind.
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-baseline font-mono tabular-nums text-ink/85">
      <span>
        {formatNumber(data.value)}
        <span className="ml-1">{data.unit}</span>
      </span>
      <LiteratureMarker source={data.source} />
    </span>
  );
}

/** A T/P range, e.g. "600–650 °C". Status is shared across both endpoints. */
export function ScwgRange({ data }: { data: ProcessRange }) {
  const isPlaceholder = data.status === "placeholder";
  const single = data.min === data.max;
  // "to" instead of an en dash when an endpoint is negative: "-60–-30" is unreadable.
  const separator = data.min < 0 || data.max < 0 ? " to " : "–";
  const body = single ? formatNumber(data.min) : `${formatNumber(data.min)}${separator}${formatNumber(data.max)}`;

  if (isPlaceholder) {
    return (
      <span
        className="group inline-flex items-baseline gap-1 font-mono tabular-nums text-ink/45 [border-bottom:1px_dotted_rgb(var(--color-ink)/0.4)] focus-within:text-ink/70 hover:text-ink/70"
        tabIndex={0}
        title={data.note ? `${PLACEHOLDER_TITLE} ${data.note}` : PLACEHOLDER_TITLE}
      >
        <span>
          {body} {data.unit}
        </span>
        <span
          aria-label="estimate, placeholder pending balance closure"
          className="rounded-[0.3rem] bg-ink/8 px-1 py-px font-sans text-[0.6em] font-semibold uppercase tracking-[0.12em] text-ink/50"
        >
          est.
        </span>
      </span>
    );
  }

  if (data.status === "indicative") {
    return (
      <span
        className="group inline-flex items-baseline gap-1 font-mono tabular-nums text-ink/70 [border-bottom:1px_dashed_rgb(var(--color-clay)/0.7)] focus-within:text-ink/90 hover:text-ink/90"
        tabIndex={0}
        title={`${INDICATIVE_TITLE} ${data.note}`}
      >
        <span>
          {body} {data.unit}
        </span>
        <span
          aria-label="indicative, not yet traceable to a primary source"
          className="rounded-[0.3rem] bg-clay/12 px-1 py-px font-sans text-[0.6em] font-semibold uppercase tracking-[0.12em] text-clay"
        >
          ind.
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-baseline font-mono tabular-nums text-ink/85">
      <span>
        {body} {data.unit}
      </span>
      <LiteratureMarker source={data.source} />
    </span>
  );
}

/** The legend shown in the sticky header while Act 3 is in view. */
export function ScwgValueLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink/60">
      <span className="inline-flex items-baseline gap-1.5">
        <span className="font-mono text-ink/45 [border-bottom:1px_dotted_rgb(var(--color-ink)/0.4)]">000</span>
        <span className="rounded-[0.3rem] bg-ink/8 px-1 py-px text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-ink/50">est.</span>
        <span>Placeholder — pending balance closure</span>
      </span>
      <span className="inline-flex items-baseline gap-1.5">
        <span className="font-mono text-ink/70 [border-bottom:1px_dashed_rgb(var(--color-clay)/0.7)]">000</span>
        <span className="rounded-[0.3rem] bg-clay/12 px-1 py-px text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-clay">ind.</span>
        <span>Indicative — needs a citation</span>
      </span>
      <span className="inline-flex items-baseline gap-1.5">
        <span className="font-mono text-ink/85">000<sup className="ml-0.5 text-[0.62em] font-semibold text-moss">[src]</sup></span>
        <span>Literature — cited source</span>
      </span>
    </div>
  );
}
