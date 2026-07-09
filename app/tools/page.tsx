import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Tools" };

type Tool = { href: string; title: string; description: string };
type ToolSection = { title: string; tools: Tool[] };

const toolSections: ToolSection[] = [
  {
    title: "Thermodynamics",
    tools: [
      { href: "/tools/water-properties", title: "Water properties", description: "Interpolate the Koretsky superheated vapour and subcooled liquid tables from two state properties." },
      { href: "/tools/compound-properties", title: "Compound properties", description: "Search Koretsky physical-property constants and calculate continuous Lee–Kesler real-fluid properties." },
      { href: "/tools/vle", title: "VLE simulator", description: "Generate binary T–x–y and P–x–y diagrams using Raoult, NRTL, Wilson, van der Waals, or Peng–Robinson." },
    ],
  },
  {
    title: "Chemistry",
    tools: [
      { href: "/tools/ir-spectrum", title: "IR spectrum plotter", description: "Upload, compare, convert, and automatically label peaks in up to ten infrared spectra." },
      { href: "/tools/nmr-spectrum", title: "NMR spectrum processor", description: "Read Spinsolve data.1d files, process the complex FID, and inspect a calibrated frequency or ppm spectrum." },
    ],
  },
  {
    title: "Planning",
    tools: [
      { href: "/tools/course-planner", title: "Course planner", description: "Drag ChemE, BEM, CS, Math, and institute-core requirements onto a four-year, three-term grid — one class can satisfy several requirements at once." },
    ],
  },
];

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link className="group block w-[19rem] shrink-0 snap-start rounded-[1.5rem] border border-ink/10 bg-surface/55 p-5 transition hover:-translate-y-0.5 hover:border-ink/20 hover:bg-surface sm:w-[22rem] sm:p-6" href={tool.href}>
      <div className="flex items-end justify-between gap-5">
        <div>
          <h3 className="text-xl font-semibold">{tool.title}</h3>
          <p className="mt-1 text-sm leading-6 text-ink/55">{tool.description}</p>
        </div>
        <span className="shrink-0 text-xl transition group-hover:translate-x-1" aria-hidden="true">→</span>
      </div>
    </Link>
  );
}

export default function ToolsPage() {
  return (
    <>
      <PageIntro title="Tools" description="Engineering calculators and practical references." />
      <div className="page-section space-y-10 pt-0 sm:pt-0 lg:pt-0">
        {toolSections.map((section) => (
          <section key={section.title}>
            <h2 className="section-title">{section.title}</h2>
            <div className="-mx-5 -mt-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 pt-6 sm:mx-0 sm:px-0">
              {section.tools.map((tool) => (
                <ToolCard key={tool.href} tool={tool} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
