import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Biodiesel from used cooking oil documents",
  description: "Scrollable document viewer for the biodiesel process design report and synthesis presentation.",
};

function getRenderedPages(folder: string) {
  const directory = path.join(process.cwd(), "public", "project-pages", folder);

  if (!fs.existsSync(directory)) return [];

  return fs
    .readdirSync(directory)
    .filter((file) => file.endsWith(".jpg") || file.endsWith(".png"))
    .sort((first, second) => first.localeCompare(second, undefined, { numeric: true }))
    .map((file) => `/project-pages/${folder}/${file}`);
}

const documents = [
  {
    id: "process-design",
    title: "Process design report",
    description:
      "Plant design for biodiesel production from used cooking oil, including pretreatment, reaction sequence, separations, balances, and cost analysis.",
    pagesFolder: "biodiesel-process-design",
  },
  {
    id: "synthesis-presentation",
    title: "Synthesis presentation",
    description:
      "Presentation on biodiesel synthesis from used cooking oil and ethanol, focusing on the chemistry and feasibility tradeoffs.",
    pagesFolder: "biodiesel-synthesis-presentation",
  },
] as const;

export default function BiodieselProjectViewerPage() {
  const renderedDocuments = documents.map((document) => ({
    ...document,
    pages: getRenderedPages(document.pagesFolder),
  }));

  return (
    <main className="min-h-screen bg-[#f4efe8] text-ink">
      <div className="page-shell pt-16 sm:pt-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">Project documents</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Biodiesel from used cooking oil</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/60 sm:text-base sm:leading-8">
              A scrollable in-site reader for both parts of the biodiesel project.
            </p>
          </div>
          <Link
            className="inline-flex self-start rounded-full border border-ink/15 bg-white/85 px-4 py-2 text-sm font-semibold transition hover:border-ink/30 hover:bg-white"
            href="/projects#biodiesel-from-used-cooking-oil"
          >
            Back to projects
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {renderedDocuments.map((document) => (
            <a
              className="inline-flex rounded-full border border-ink/15 bg-white/85 px-4 py-2 text-sm font-semibold transition hover:border-ink/30 hover:bg-white"
              href={`#${document.id}`}
              key={document.id}
            >
              {document.title}
            </a>
          ))}
        </div>

        <div className="mt-8 grid gap-8">
          {renderedDocuments.map((document) => (
            <section className="scroll-mt-24 rounded-[2rem] border border-ink/10 bg-white/60 p-5 sm:p-6" id={document.id} key={document.id}>
              <div>
                <p className="eyebrow">Document</p>
                <h2 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">{document.title}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/65 sm:text-base sm:leading-8">{document.description}</p>
              </div>

              {document.pages.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {document.pages.map((page, index) => (
                    <figure className="overflow-hidden rounded-[1.5rem] border border-ink/10 bg-white shadow-[0_20px_45px_rgba(32,35,31,0.06)]" key={page}>
                      <div className="relative aspect-[1/1.414]">
                        <Image
                          alt={`${document.title} page ${index + 1}`}
                          className="object-contain object-top"
                          fill
                          priority={index < 2}
                          sizes="(max-width: 768px) 100vw, 78vw"
                          src={page}
                        />
                      </div>
                    </figure>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[1.5rem] border border-dashed border-ink/15 bg-paper/70 p-6 text-sm leading-7 text-ink/55">
                  Rendered pages are not available yet for this document.
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
