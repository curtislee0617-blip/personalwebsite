import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = {
  title: "Biodiesel from used cooking oil",
  description: "A two-part biodiesel project covering plant design and synthesis presentation work.",
};

const sections = [
  {
    id: "process-design",
    title: "Process design report",
    description:
      "A plant-scale design for biodiesel production from used cooking oil, including pretreatment, acid esterification, base-catalyzed transesterification, decanting, methanol recovery, and supporting mass, energy, and cost analysis.",
    preview: "/project-previews/biodiesel-from-used-cooking-oil/process-flow-screenshot.png",
    previewAlt: "Process flow diagram from the biodiesel design project",
    href: "/projects/biodiesel-from-used-cooking-oil/viewer#process-design",
    cta: "View report ↗",
  },
  {
    id: "synthesis-presentation",
    title: "Synthesis presentation",
    description:
      "A companion presentation focused on the chemistry and feasibility of producing biodiesel from used cooking oil and ethanol, with attention to the greener appeal of ethanol and the processing difficulties it introduces.",
    preview: "/project-previews/biodiesel-from-used-cooking-oil/lab-synthesis-screenshot.png",
    previewAlt: "Lab synthesis setup from the biodiesel project",
    href: "/projects/biodiesel-from-used-cooking-oil/viewer#synthesis-presentation",
    cta: "View presentation ↗",
  },
];

export default function BiodieselProjectPage() {
  return (
    <>
      <PageIntro
        eyebrow="Chemical engineering coursework"
        title="Biodiesel from used cooking oil"
        description="A two-part project combining a biodiesel plant design report with a synthesis presentation on production routes using used cooking oil."
      />

      <section className="page-section pt-12 sm:pt-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.9fr)] lg:gap-16">
          <div className="space-y-8">
            <article className="rounded-[2rem] border border-ink/10 bg-white/55 p-6 sm:p-8">
              <p className="eyebrow">Overview</p>
              <div className="mt-5 space-y-4 text-sm leading-7 text-ink/65 sm:text-base sm:leading-8">
                <p>This project is split into two connected parts around biodiesel production from waste cooking oil.</p>
                <p>The first part takes a process-design angle, focusing on equipment, balances, separations, and operating logic for a full biodiesel production setup.</p>
                <p>The second part is more chemistry- and synthesis-focused, looking at the production route itself and comparing the practical tradeoffs of using ethanol as a greener alcohol.</p>
              </div>
            </article>

            <div className="grid gap-6">
              {sections.map((section) => (
                <article className="rounded-[2rem] border border-ink/10 bg-white/55 p-6 sm:p-8" key={section.title}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="eyebrow">Part</p>
                      <h2 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">{section.title}</h2>
                    </div>
                    <Link
                      className="inline-flex rounded-full border border-ink/15 bg-paper/80 px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-ink/25 hover:bg-white"
                      href={section.href}
                    >
                      {section.cta}
                    </Link>
                  </div>

                  <p className="mt-4 max-w-3xl text-sm leading-7 text-ink/65 sm:text-base sm:leading-8">{section.description}</p>

                  <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-ink/10 bg-paper/80">
                    <div className="relative aspect-[4/3]">
                      <Image
                        alt={section.previewAlt}
                        className={section.title === "Synthesis presentation" ? "object-cover" : "object-contain bg-white"}
                        fill
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        src={section.preview}
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-8">
            <div className="rounded-[2rem] border border-ink/10 bg-white/55 p-6 sm:p-8">
              <p className="eyebrow">Details</p>
              <dl className="mt-5 space-y-5 text-sm leading-6 text-ink/60">
                <div>
                  <dt className="font-semibold text-ink">Year</dt>
                  <dd className="mt-1">June 2026</dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink">Topics</dt>
                  <dd className="mt-3 flex flex-wrap gap-2">
                    {["Chemical engineering", "Process design", "Biodiesel", "Separations", "Reaction engineering"].map((tag) => (
                      <span className="rounded-full border border-ink/10 bg-paper/85 px-3 py-1.5 text-xs text-ink/60" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-[2rem] border border-ink/10 bg-white/55 p-6 sm:p-8">
              <p className="eyebrow">Documents</p>
              <h3 className="mt-3 text-lg font-semibold text-ink">Open the built-in viewer</h3>
              <p className="mt-3 text-sm leading-7 text-ink/60">
                Both parts now sit inside an on-site PDF viewer, so people can read them directly without being pushed toward downloads.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  className="inline-flex rounded-full border border-ink/15 bg-paper/80 px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-ink/25 hover:bg-white"
                  href="/projects/biodiesel-from-used-cooking-oil/viewer"
                >
                  Open viewer ↗
                </Link>
              </div>
              <p className="mt-4 text-sm text-ink/55">The report and presentation are separated clearly inside one shared viewer page.</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
