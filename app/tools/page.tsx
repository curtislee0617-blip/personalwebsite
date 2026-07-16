import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { SnapCarousel } from "@/components/snap-carousel";

export const metadata: Metadata = { title: "Tools" };

type ToolKind = "water" | "compound" | "vle" | "ir" | "nmr" | "planner";
type Tool = { href: string; title: string; description: string; kind: ToolKind };
type ToolSection = { title: string; tools: Tool[] };

const toolSections: ToolSection[] = [
  {
    title: "Planning",
    tools: [
      { href: "/tools/course-planner", title: "Course planner", description: "Plan four years at Caltech term by term, arranging course requirements while keeping track of classes that fulfil more than one requirement.", kind: "planner" },
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
    title: "Thermodynamics",
    tools: [
      { href: "/tools/water-properties", title: "Water properties", description: "Interpolate the Koretsky superheated vapour and subcooled liquid tables from two state properties.", kind: "water" },
      { href: "/tools/compound-properties", title: "Compound properties", description: "Search Koretsky physical-property constants and calculate continuous Lee–Kesler real-fluid properties.", kind: "compound" },
      { href: "/tools/vle", title: "VLE simulator", description: "Generate binary T–x–y and P–x–y diagrams using Raoult, NRTL, Wilson, van der Waals, or Peng–Robinson.", kind: "vle" },
    ],
  },
];

function ToolThumbnail({ kind }: { kind: ToolKind }) {
  if (kind === "planner") {
    const terms = ["Ma 1a", "Ch 41a", "Ph 1a", "Ma 1b", "Ch 41b", "CS 1", "Ma 1c", "Ch 41c", "Ph 1c", "ChE 15", "BEM 103", "ACM 95"];
    return (
      <div className="tool-thumbnail swipe-bubble-media tool-thumbnail-planner" aria-hidden="true">
        <div className="tool-planner-years"><span>Year 1</span><span>Year 2</span><span>Year 3</span><span>Year 4</span></div>
        <div className="tool-planner-grid">
          {terms.map((term, index) => <span className={index === 9 ? "is-accent" : index % 3 === 1 ? "is-filled" : ""} key={term}>{term}</span>)}
        </div>
      </div>
    );
  }

  if (kind === "water") {
    return (
      <div className="tool-thumbnail swipe-bubble-media tool-thumbnail-properties is-water" aria-hidden="true">
        <div className="tool-property-heading"><span>Water state</span><small>Steam tables</small></div>
        <div className="tool-state-inputs"><span><small>Temperature</small><strong>425 K</strong></span><b>+</b><span><small>Pressure</small><strong>2.40 MPa</strong></span></div>
        <div className="tool-property-grid">
          <span><small>v</small><strong>0.091 m³/kg</strong></span><span><small>h</small><strong>2821 kJ/kg</strong></span><span><small>s</small><strong>6.93 kJ/kg·K</strong></span>
        </div>
      </div>
    );
  }

  if (kind === "compound") {
    return (
      <div className="tool-thumbnail swipe-bubble-media tool-thumbnail-properties is-compound" aria-hidden="true">
        <div className="tool-property-heading"><span>Compound lookup</span><small>Lee–Kesler</small></div>
        <div className="tool-compound-search"><span><strong>Propane</strong><small>C₃H₈</small></span><b>⌕</b></div>
        <div className="tool-property-grid">
          <span><small>Tc</small><strong>369.8 K</strong></span><span><small>Pc</small><strong>4.25 MPa</strong></span><span><small>ω</small><strong>0.152</strong></span>
        </div>
      </div>
    );
  }

  const paths: Record<"vle" | "ir" | "nmr", string> = {
    vle: "M12 72 C29 68 43 49 62 33 C83 15 112 13 148 11 M12 72 C34 71 56 63 78 48 C101 31 122 18 148 11",
    ir: "M10 20 L27 21 L31 63 L35 22 L56 23 L61 73 L66 24 L88 26 L94 59 L99 27 L123 29 L129 68 L134 29 L150 31",
    nmr: "M10 71 L29 71 L31 30 L33 71 L52 71 L55 52 L58 71 L76 71 L79 18 L82 71 L106 71 L109 43 L112 71 L133 71 L136 58 L139 71 L150 71",
  };
  const axis = kind === "ir" ? ["4000", "3000", "2000", "1000", "cm⁻¹"] : kind === "nmr" ? ["10", "8", "6", "4", "2", "0 ppm"] : ["0", "0.25", "0.5", "0.75", "1.0", "x₁"];

  return (
    <div className={`tool-thumbnail swipe-bubble-media tool-thumbnail-chart is-${kind}`} aria-hidden="true">
      <div className="tool-chart-toolbar"><span>{kind === "ir" ? "IR · Transmittance" : kind === "nmr" ? "¹H NMR · ppm" : "Binary T–x–y"}</span><i>{kind === "vle" ? "Bubble / dew" : "Sample 01"}</i></div>
      <svg viewBox="0 0 160 90" preserveAspectRatio="none">
        <path className="tool-chart-grid" d="M8 18H152M8 45H152M8 72H152M32 10V80M72 10V80M112 10V80" />
        <path className="tool-chart-line" d={paths[kind]} />
        {kind === "vle" && <><circle className="tool-chart-point" cx="62" cy="33" r="2" /><circle className="tool-chart-point" cx="78" cy="48" r="2" /></>}
      </svg>
      <div className="tool-chart-axis">{axis.map((label) => <span key={label}>{label}</span>)}</div>
    </div>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link className="tool-card swipe-bubble-card group block w-[19rem] shrink-0 rounded-[1.5rem] border border-ink/10 bg-surface/55 p-5 transition hover:-translate-y-0.5 hover:border-ink/20 hover:bg-surface sm:w-[22rem] sm:p-6" href={tool.href}>
      <ToolThumbnail kind={tool.kind} />
      <div className="tool-card-copy swipe-bubble-copy flex items-end justify-between gap-5">
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
      <PageIntro title="Tools" description="Random tools for school, and maybe other things later on." />
      <div className="tools-page-content page-section space-y-10 pt-8 sm:pt-10 lg:pt-12">
        {toolSections.map((section) => (
          <section key={section.title}>
            <h2 className="section-title">{section.title}</h2>
            <SnapCarousel className="mobile-snap-carousel -mx-5 -mt-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 pt-6 sm:mx-0 sm:px-0" repeatEdges={false}>
              {section.tools.map((tool) => (
                <ToolCard key={tool.href} tool={tool} />
              ))}
            </SnapCarousel>
          </section>
        ))}
      </div>
    </>
  );
}
