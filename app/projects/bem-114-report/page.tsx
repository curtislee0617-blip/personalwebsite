import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { bem114Sections, bem114Tables } from "@/lib/bem114-report";

export const metadata: Metadata = {
  title: "Earnings Call NLP-Based Long-Short Strategy",
  description: "Web version of the BEM 114 final project report.",
};

function DataTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: readonly (readonly string[])[];
}) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-ink/10 bg-white/70">
      <div className="border-b border-ink/10 px-5 py-4">
        <p className="text-sm font-semibold text-ink">{title}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-paper/80 text-ink/55">
            <tr>
              {headers.map((header) => (
                <th className="px-5 py-3 font-semibold" key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-t border-ink/10" key={row.join("-")}>
                {row.map((cell, index) => (
                  <td className={`px-5 py-3 ${index === 0 ? "font-medium text-ink" : "text-ink/65"}`} key={`${row[0]}-${cell}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Bem114ReportPage() {
  return (
    <>
      <PageIntro
        eyebrow="BEM 114 final project"
        title="Earnings Call NLP-Based Long-Short Strategy"
        description="Varun Gabbita, Will Minatel, and Curtis Lee."
      />

      <section className="page-section pt-10 sm:pt-12">
        <div className="flex flex-wrap gap-3">
          <Link className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper transition hover:bg-moss" href="/projects/bem-114-report/viewer">
            Open report viewer ↗
          </Link>
          <a className="rounded-full border border-ink/20 px-5 py-3 text-sm font-semibold transition hover:border-ink hover:bg-white" download href="/BEM 114 Report - Varun, Will, Curtis.pdf">
            Download original PDF ↓
          </a>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {["/project-previews/bem-114-report/preview-1.png", "/project-previews/bem-114-report/preview-2.png", "/project-previews/bem-114-report/preview-3.png"].map((src, index) => (
            <div className="relative overflow-hidden rounded-[1.6rem] border border-ink/10 bg-white/55" key={src}>
              <div className="relative aspect-[4/3]">
                <Image alt={`BEM 114 report preview ${index + 1}`} className="object-cover" fill sizes="(max-width: 768px) 100vw, 33vw" src={src} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 space-y-10">
          {bem114Sections.slice(0, 7).map((section) => (
            <article className="rounded-[2rem] border border-ink/10 bg-white/55 p-6 sm:p-8" key={section.title}>
              <p className="eyebrow">{section.title}</p>
              {"subtitle" in section && section.subtitle ? <h2 className="mt-3 text-2xl font-semibold tracking-tight">{section.subtitle}</h2> : null}
              {"paragraphs" in section && section.paragraphs ? (
                <div className="mt-5 space-y-4 text-sm leading-7 text-ink/65 sm:text-base sm:leading-8">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              ) : null}
              {"bullets" in section && section.bullets ? (
                <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-7 text-ink/65 sm:text-base sm:leading-8">
                  {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
              ) : null}
            </article>
          ))}

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <DataTable headers={["Signal", "Spread (Q1 - Q5)", "p-value"]} rows={bem114Tables.table1} title="Table 1: Q1-Q5 Spread at the 3-month Horizon for each Signal" />
            <article className="rounded-[2rem] border border-ink/10 bg-white/55 p-6 sm:p-8">
              <p className="eyebrow">Figure references</p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-ink/65">
                <p>Figure 1: Average Excess Returns 1, 2, and 3 months Post Earnings Call Based on Signal.</p>
                <p>Use the full report viewer for the original charts and page layouts.</p>
              </div>
            </article>
          </div>

          {bem114Sections.slice(7, 10).map((section) => (
            <article className="rounded-[2rem] border border-ink/10 bg-white/55 p-6 sm:p-8" key={section.title}>
              <p className="eyebrow">{section.title}</p>
              {"subtitle" in section && section.subtitle ? <h2 className="mt-3 text-2xl font-semibold tracking-tight">{section.subtitle}</h2> : null}
              {"paragraphs" in section && section.paragraphs ? (
                <div className="mt-5 space-y-4 text-sm leading-7 text-ink/65 sm:text-base sm:leading-8">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              ) : null}
            </article>
          ))}

          <div className="grid gap-6 xl:grid-cols-2">
            <DataTable headers={["Metric", "EW Prepared", "VW Prepared"]} rows={bem114Tables.table2} title="Table 2: Prepared Remarks Sentiment Portfolio Performance" />
            <DataTable headers={["Metric", "EW Q&A", "VW Q&A"]} rows={bem114Tables.table3} title="Table 3: Q&A Sentiment Portfolio Performance" />
          </div>

          <div className="grid gap-6">
            <DataTable headers={["Signal / Metric", "FF5 Alpha", "p-value"]} rows={bem114Tables.table4} title="Table 4: Each Strategy’s Performance Pre/Post 2017" />
            <DataTable headers={["Signal / Metric", "FF5 Alpha", "p-value"]} rows={bem114Tables.table5} title="Table 5: Each Strategy’s Performance Split by each 1-Month Window" />
            <DataTable headers={["Window / Period", "FF5 Alpha", "p-value"]} rows={bem114Tables.table6} title="Table 6: Zooming in on Q&A Sentiment Returns (EW portfolio) Pre/Post 2017" />
          </div>

          {bem114Sections.slice(10).map((section) => (
            <article className="rounded-[2rem] border border-ink/10 bg-white/55 p-6 sm:p-8" key={section.title}>
              <p className="eyebrow">{section.title}</p>
              {"subtitle" in section && section.subtitle ? <h2 className="mt-3 text-2xl font-semibold tracking-tight">{section.subtitle}</h2> : null}
              {"paragraphs" in section && section.paragraphs ? (
                <div className="mt-5 space-y-4 text-sm leading-7 text-ink/65 sm:text-base sm:leading-8">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              ) : null}
              {"bullets" in section && section.bullets ? (
                <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-7 text-ink/65 sm:text-base sm:leading-8">
                  {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
