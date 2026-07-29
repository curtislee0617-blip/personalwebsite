import type { Metadata } from "next";
import Image from "next/image";
import { PageIntro } from "@/components/page-intro";
import { HistoryBackButton } from "@/components/history-back-button";
import { ScwgRegulatoryTimeline } from "@/components/scwg-regulatory-timeline";
import { ScwgRationale } from "@/components/scwg-rationale";
import { ScwgSitingMap } from "@/components/scwg-siting-map";
import { ScwgFeedstock } from "@/components/scwg-feedstock";
import { ScwgProcessScroller } from "@/components/scwg-process-scroller";
import { ScwgReportStructure } from "@/components/scwg-report-structure";
import { ScwgWasteTreatment } from "@/components/scwg-waste-treatment";
import { ScwgProductTiers } from "@/components/scwg-product-tiers";
import { ScwgValueLegend } from "@/components/scwg-value";
import { scwgAffiliation, scwgMeta, scwgUi } from "@/lib/scwg-meta";
import { scwgProcessBlocks, scwgProcessIntro } from "@/lib/scwg-process";
import { scwgProductsIntro } from "@/lib/scwg-products";
import {
  scwgSitingDataCaveat,
  scwgSitingNarrative,
  scwgSitingOverlays,
} from "@/lib/scwg-siting";
import {
  scwgDecisionsIntro,
  scwgDecisionsTaken,
  scwgOpenQuestions,
  scwgOpenQuestionsIntro,
} from "@/lib/scwg-open-questions";
import { scwgReferences, scwgReferencesNote } from "@/lib/scwg-references";
import { scwgReportMeta } from "@/lib/scwg-report-structure";

export const metadata: Metadata = {
  title: scwgMeta.title,
  description:
    "An interactive process-design concept: co-valorization of bauxite residue and soybean processing waste via supercritical water gasification.",
};

export default function SupercriticalWaterGasificationPage() {
  return (
    <div className="scwg-page">
      <PageIntro
        actions={
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            {scwgAffiliation.logos.map((logo) => (
              <Image
                alt={logo.alt}
                className={`w-auto object-contain ${logo.heightClass}`}
                height={logo.height}
                key={logo.src}
                src={logo.src}
                width={logo.width}
              />
            ))}
          </div>
        }
        eyebrow={scwgMeta.eyebrow}
        title={scwgMeta.title}
        description={scwgMeta.subtitle}
      />

      {/* Act 0 — hero abstract */}
      <section className="page-section pt-10 sm:pt-14">
        <div className="mb-6 sm:mb-8">
          <HistoryBackButton fallbackHref="/projects" />
        </div>
        <article className="rounded-[2rem] border border-ink/10 bg-surface/55 p-6 sm:p-8">
          <p className="eyebrow">{scwgUi.abstractLabel}</p>
          <div className="mt-4 space-y-4 text-sm leading-7 text-ink/70 sm:text-base sm:leading-8">
            {scwgMeta.abstractParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          <dl className="mt-6 grid gap-x-8 gap-y-2 border-t border-ink/10 pt-5 text-sm sm:grid-cols-2">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-ink/50">Document</dt>
              <dd className="text-right text-ink/75">{scwgReportMeta.kind}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-ink/50">Date</dt>
              <dd className="text-right font-mono tabular-nums text-ink/75">{scwgReportMeta.date}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 sm:col-span-2">
              <dt className="shrink-0 text-ink/50">Status</dt>
              <dd className="text-right text-ink/75">{scwgReportMeta.deliverableStatus}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 sm:col-span-2">
              <dt className="shrink-0 text-ink/50">Feedstock case</dt>
              <dd className="text-right text-ink/75">{scwgReportMeta.feedstockCase}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 sm:col-span-2">
              <dt className="shrink-0 text-ink/50">Compliance frame</dt>
              <dd className="text-right text-ink/75">{scwgReportMeta.complianceFrame}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 sm:col-span-2">
              <dt className="shrink-0 text-ink/50">{scwgAffiliation.eyebrow}</dt>
              <dd className="text-right text-ink/75">{scwgAffiliation.note}</dd>
            </div>
          </dl>

          <p className="mt-4 text-xs leading-6 text-ink/45">{scwgAffiliation.disclaimer}</p>

          <div className="mt-6 rounded-[1.25rem] border border-dashed border-ink/15 bg-paper/50 p-4 sm:p-5">
            <p className="eyebrow mb-2">{scwgMeta.legend.heading}</p>
            <div className="space-y-1.5 text-sm leading-6 text-ink/60">
              <p><strong className="font-semibold text-ink/75">{scwgUi.legendPlaceholderLabel}</strong> {scwgMeta.legend.placeholder}</p>
              <p><strong className="font-semibold text-ink/75">{scwgUi.legendIndicativeLabel}</strong> {scwgMeta.legend.indicative}</p>
              <p><strong className="font-semibold text-ink/75">{scwgUi.legendLiteratureLabel}</strong> {scwgMeta.legend.literature}</p>
            </div>
          </div>
        </article>

      </section>

      {/* Act 1 — compliance landscape */}
      <section className="page-section pt-4" id="scwg-act-regulatory">
        <ScwgRegulatoryTimeline />
      </section>

      {/* Act 2 — why these two wastes */}
      <section className="page-section pt-4" id="scwg-act-rationale">
        <p className="eyebrow">{scwgUi.acts.rationale.eyebrow}</p>
        <h2 className="section-title mt-3">{scwgUi.acts.rationale.title}</h2>
        <div className="mt-8">
          <ScwgRationale />
        </div>
      </section>

      {/* Act 3 — siting problem */}
      <section className="page-section pt-4" id="scwg-act-siting">
        <p className="eyebrow">{scwgUi.acts.siting.eyebrow}</p>
        <h2 className="section-title mt-3">{scwgUi.acts.siting.title}</h2>
        <div className="mt-4 max-w-prose space-y-3 text-sm leading-7 text-ink/65">
          {scwgSitingNarrative.intro.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <p className="mt-6 rounded-[1.25rem] border-l-2 border-clay bg-clay/8 px-4 py-3 text-sm font-medium leading-6 text-ink/80">
          {scwgSitingDataCaveat}
        </p>

        <p className="mt-6 text-sm leading-7 text-ink/60">{scwgSitingNarrative.candidatesIntro}</p>

        <div className="mt-6">
          <ScwgSitingMap />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <p className="eyebrow">{scwgUi.siting.overlaysLabel}</p>
            {scwgSitingOverlays.map((overlay) => (
              <article className="rounded-[1.5rem] border border-ink/10 bg-surface/55 p-5" key={overlay.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-semibold text-ink/85">{overlay.label}</h3>
                  <span className="text-[0.7rem] uppercase tracking-[0.1em] text-ink/45">
                    {overlay.defaultOn ? scwgUi.siting.overlayOn : scwgUi.siting.overlayOff}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-ink/65">{overlay.blurb}</p>
              </article>
            ))}
          </div>

          <div className="rounded-[2rem] border border-ink/10 bg-surface/55 p-6 lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">{scwgUi.siting.payloadLabel}</p>
            <div className="mt-3 space-y-3 text-sm leading-7 text-ink/70">
              {scwgSitingNarrative.payload.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Act 4 — feedstock characterization (report Section 1) */}
      <section className="page-section pt-4" id="scwg-act-feedstock">
        <p className="eyebrow">{scwgUi.acts.feedstock.eyebrow}</p>
        <h2 className="section-title mt-3">{scwgUi.acts.feedstock.title}</h2>
        <div className="mt-8">
          <ScwgFeedstock />
        </div>
      </section>

      {/* Act 5 — the plant */}
      <section className="page-section pt-4" id="scwg-act-process">
        <p className="eyebrow">{scwgUi.acts.process.eyebrow}</p>
        <h2 className="section-title mt-3">{scwgUi.acts.process.title}</h2>
        <p className="mt-4 max-w-prose text-sm leading-7 text-ink/65">{scwgProcessIntro}</p>

        {/* Placeholder-discipline legend: sticky above the diagram for all of Act 3. */}
        <div className="sticky top-0 z-30 -mx-1 mt-6 rounded-b-[1rem] border border-ink/10 bg-paper px-4 py-2 shadow-soft">
          <ScwgValueLegend />
        </div>

        <ScwgProcessScroller blocks={scwgProcessBlocks} />
      </section>

      {/* Act 6 — waste treatment and discharge compliance */}
      <section className="page-section pt-4" id="scwg-act-waste">
        <p className="eyebrow">{scwgUi.acts.waste.eyebrow}</p>
        <h2 className="section-title mt-3">{scwgUi.acts.waste.title}</h2>
        <div className="mt-8">
          <ScwgWasteTreatment />
        </div>
      </section>

      {/* Act 7 — product slate */}
      <section className="page-section pt-4" id="scwg-act-products">
        <p className="eyebrow">{scwgUi.acts.products.eyebrow}</p>
        <h2 className="section-title mt-3">{scwgUi.acts.products.title}</h2>
        <p className="mt-4 max-w-prose text-sm leading-7 text-ink/65">{scwgProductsIntro}</p>
        <div className="mt-8">
          <ScwgProductTiers />
        </div>
      </section>

      {/* Act 8 — state of the work */}
      <section className="page-section pt-4" id="scwg-act-open-questions">
        <p className="eyebrow">{scwgUi.acts.openQuestions.eyebrow}</p>
        <h2 className="section-title mt-3">{scwgUi.acts.openQuestions.title}</h2>

        <div className="mt-6 rounded-[2rem] border border-moss/25 bg-moss/8 p-6 sm:p-8">
          <p className="text-sm leading-7 text-ink/70">{scwgDecisionsIntro}</p>
          <ul className="mt-5 space-y-3">
            {scwgDecisionsTaken.map((decision) => (
              <li className="rounded-[1.25rem] border border-ink/10 bg-paper/60 p-4" key={decision.conflict}>
                <p className="font-semibold text-ink/80">{decision.conflict}</p>
                <p className="mt-1 text-sm leading-6 text-ink/65">{decision.decision}</p>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 max-w-prose text-sm leading-7 text-ink/65">{scwgOpenQuestionsIntro}</p>
        <ol className="mt-4 space-y-3">
          {scwgOpenQuestions.map((question, index) => (
            <li className="flex gap-4 rounded-[1.5rem] border border-ink/10 bg-surface/55 p-5" key={question.title}>
              <span className="font-mono text-sm font-semibold tabular-nums text-moss">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p className="font-semibold text-ink/80">{question.title}</p>
                <p className="mt-1 text-sm leading-7 text-ink/65">{question.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8">
          <ScwgReportStructure />
        </div>

        <div className="mt-10">
          <h3 className="section-title text-2xl">{scwgUi.references.heading}</h3>
          <p className="mt-2 max-w-prose text-sm leading-6 text-ink/55">{scwgReferencesNote}</p>
          <p className="mt-2 text-sm text-ink/55">
            <span className="text-moss">✓</span> {scwgUi.references.key} ·{" "}
            <span className="text-clay">°</span> {scwgUi.references.keyUnverified}
          </p>
          <ol className="mt-4 space-y-2.5">
            {scwgReferences.map((reference) => (
              <li className="scroll-mt-28 text-sm leading-6 text-ink/65" id={`scwg-ref-${reference.id}`} key={reference.id}>
                <span className={reference.status === "verified" ? "text-moss" : "text-clay"}>
                  {reference.status === "verified" ? "✓" : "°"}
                </span>{" "}
                <span className="font-mono text-xs font-semibold text-ink/70">[{reference.marker}]</span> {reference.citation}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
