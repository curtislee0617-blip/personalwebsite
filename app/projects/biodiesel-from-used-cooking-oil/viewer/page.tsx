import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Biodiesel from used cooking oil documents",
  description: "Document hub for the biodiesel process design report and synthesis presentation.",
};

const documents = [
  {
    id: "process-design",
    title: "Process design report",
    description:
      "Plant design for biodiesel production from used cooking oil, including pretreatment, reaction sequence, separations, balances, and cost analysis.",
    href: "/ChE62 Project (2).pdf",
  },
  {
    id: "synthesis-presentation",
    title: "Synthesis presentation",
    description:
      "Presentation on biodiesel synthesis from used cooking oil and ethanol, focusing on the chemistry and feasibility tradeoffs.",
    href: "/Curtis’s Ch9 final project.pdf",
  },
];

export default function BiodieselProjectViewerPage() {
  return (
    <main className="min-h-screen bg-[#f4efe8] text-ink">
      <div className="page-shell pt-16 sm:pt-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">Project documents</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Biodiesel from used cooking oil</h1>
          </div>
          <Link
            className="inline-flex self-start rounded-full border border-ink/15 bg-white/85 px-4 py-2 text-sm font-semibold transition hover:border-ink/30 hover:bg-white"
            href="/projects#biodiesel-from-used-cooking-oil"
          >
            Back to projects
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {documents.map((document) => (
            <a
              className="inline-flex rounded-full border border-ink/15 bg-white/85 px-4 py-2 text-sm font-semibold transition hover:border-ink/30 hover:bg-white"
              href={`#${document.id}`}
              key={document.id}
            >
              {document.title}
            </a>
          ))}
        </div>

        <div className="mt-8 grid gap-6">
          {documents.map((document) => (
            <section className="scroll-mt-24 rounded-[2rem] border border-ink/10 bg-white/60 p-5 sm:p-6" id={document.id} key={document.title}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="eyebrow">Document</p>
                  <h2 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">{document.title}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/65 sm:text-base sm:leading-8">{document.description}</p>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-ink/10 bg-white">
                <iframe
                  className="h-[70vh] w-full"
                  src={document.href}
                  title={document.title}
                />
              </div>

              <p className="mt-3 text-sm text-ink/50">If your browser blocks the embedded PDF, open it in a new tab from the browser’s frame controls.</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
