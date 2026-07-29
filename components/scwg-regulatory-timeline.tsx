import { scwgRegulatoryIntro, scwgRegulatoryPanels } from "@/lib/scwg-regulatory";
import { scwgUi } from "@/lib/scwg-meta";

// Act 1 — the compliance landscape. Server component; a timeline rail runs down
// the left and each framework reveals via the site-wide `data-reveal` observer
// (reduced-motion aware). Prose stays server-rendered from lib/scwg-regulatory.ts.

export function ScwgRegulatoryTimeline() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <p className="eyebrow">{scwgUi.acts.regulatory.eyebrow}</p>
        <h2 className="section-title mt-3">{scwgUi.acts.regulatory.title}</h2>
        <p className="mt-4 text-sm leading-7 text-ink/60">{scwgRegulatoryIntro}</p>
      </div>

      <ol className="relative space-y-6 border-l border-ink/15 pl-6 sm:pl-8">
        {scwgRegulatoryPanels.map((panel) => (
          <li className="relative" data-reveal key={panel.id}>
            <span
              aria-hidden="true"
              className="absolute -left-[1.875rem] top-1.5 h-3 w-3 rounded-full border-2 border-moss bg-paper sm:-left-[2.375rem]"
            />
            <article className="rounded-[2rem] border border-ink/10 bg-surface/55 p-6 sm:p-7">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="eyebrow">{panel.eyebrow}</p>
                <h3 className="text-lg font-semibold tracking-tight sm:text-xl">{panel.title}</h3>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-7 text-ink/65">
                {panel.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              {panel.emphasis ? (
                <p className="mt-4 rounded-[1.25rem] border-l-2 border-clay bg-clay/8 px-4 py-3 text-sm font-medium leading-7 text-ink/80">
                  {panel.emphasis}
                </p>
              ) : null}
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
