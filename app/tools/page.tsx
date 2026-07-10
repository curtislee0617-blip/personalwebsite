import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Tools" };

type ToolKind = "water" | "compound" | "vle" | "ir" | "nmr" | "planner";
type Tool = { href: string; title: string; description: string; kind: ToolKind };
type ToolSection = { title: string; tools: Tool[] };

const toolSections: ToolSection[] = [
  {
    title: "Thermodynamics",
    tools: [
      { href: "/tools/water-properties", title: "Water properties", description: "Interpolate the Koretsky superheated vapour and subcooled liquid tables from two state properties.", kind: "water" },
      { href: "/tools/compound-properties", title: "Compound properties", description: "Search Koretsky physical-property constants and calculate continuous Lee–Kesler real-fluid properties.", kind: "compound" },
      { href: "/tools/vle", title: "VLE simulator", description: "Generate binary T–x–y and P–x–y diagrams using Raoult, NRTL, Wilson, van der Waals, or Peng–Robinson.", kind: "vle" },
    ],
  },
  {
    title: "Chemistry",
    tools: [
      { href: "/tools/ir-spectrum", title: "IR spectrum plotter", description: "Upload, compare, convert, and automatically label peaks in up to ten infrared spectra.", kind: "ir" },
      { href: "/tools/nmr-spectrum", title: "NMR spectrum processor", description: "Read Spinsolve data.1d files, process the complex FID, and inspect a calibrated frequency or ppm spectrum.", kind: "nmr" },
    ],
  },
  {
    title: "Planning",
    tools: [
      { href: "/tools/course-planner", title: "Course planner", description: "Drag ChemE, BEM, CS, Math, and institute-core requirements onto a four-year, three-term grid — one class can satisfy several requirements at once.", kind: "planner" },
    ],
  },
];

function ToolThumbnail({ kind }: { kind: ToolKind }) {
  if (kind === "planner") {
    return (
      <div className="tool-thumbnail tool-thumbnail-planner" aria-hidden="true">
        <span /><span className="is-filled" /><span /><span className="is-filled" /><span /><span /><span /><span className="is-accent" /><span /><span /><span className="is-filled" /><span />
      </div>
    );
  }

  if (kind === "water" || kind === "compound") {
    return (
      <div className={`tool-thumbnail tool-thumbnail-properties is-${kind}`} aria-hidden="true">
        <div className="tool-property-heading"><span>{kind === "water" ? "H₂O state" : "Fluid state"}</span><i /></div>
        <div className="tool-property-grid">
          <span><small>{kind === "water" ? "T" : "Tᵣ"}</small><strong>{kind === "water" ? "425 K" : "1.18"}</strong></span>
          <span><small>{kind === "water" ? "P" : "Pᵣ"}</small><strong>{kind === "water" ? "2.4 MPa" : "0.74"}</strong></span>
          <span><small>{kind === "water" ? "v" : "Z"}</small><strong>{kind === "water" ? "0.091" : "0.83"}</strong></span>
        </div>
      </div>
    );
  }

  const paths: Record<"vle" | "ir" | "nmr", string> = {
    vle: "M10 75 C30 66 42 38 74 26 C104 15 126 20 150 14 M10 75 C38 73 70 59 95 42 C120 25 138 18 150 14",
    ir: "M8 23 L22 24 L27 60 L34 25 L57 27 L63 74 L69 28 L91 30 L98 58 L104 31 L129 32 L135 68 L141 32 L152 33",
    nmr: "M8 72 L31 72 L34 25 L37 72 L63 72 L68 49 L72 72 L95 72 L99 16 L103 72 L126 72 L130 40 L134 72 L152 72",
  };

  return (
    <div className={`tool-thumbnail tool-thumbnail-chart is-${kind}`} aria-hidden="true">
      <div className="tool-chart-toolbar"><span /><span /><span /><i /></div>
      <svg viewBox="0 0 160 90" preserveAspectRatio="none">
        <path className="tool-chart-grid" d="M8 18H152M8 45H152M8 72H152M32 10V80M72 10V80M112 10V80" />
        <path className="tool-chart-line" d={paths[kind]} />
      </svg>
    </div>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link className="tool-card mobile-snap-card group block w-[19rem] shrink-0 snap-start rounded-[1.5rem] border border-ink/10 bg-surface/55 p-5 transition hover:-translate-y-0.5 hover:border-ink/20 hover:bg-surface sm:w-[22rem] sm:p-6" href={tool.href}>
      <ToolThumbnail kind={tool.kind} />
      <div className="tool-card-copy flex items-end justify-between gap-5">
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
            <div className="mobile-snap-carousel -mx-5 -mt-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 pt-6 sm:mx-0 sm:px-0">
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
