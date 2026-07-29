import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { CoursePlannerThumbnail } from "@/components/course-planner-thumbnail";
import { NmrPhaseThumbnailPath } from "@/components/nmr-phase-thumbnail-path";
import { PageIntro } from "@/components/page-intro";
import { SnapCarousel } from "@/components/snap-carousel";

export const metadata: Metadata = { title: "Tools" };

type ToolKind = "water" | "compound" | "vle" | "ir" | "nmr" | "planner";
type Tool = { href: string; title: string; description: string; kind: ToolKind };
type ToolSection = { title: string; tools: Tool[] };

type SpectrumPeak = { position: number; width: number; intensity: number };

function spectrumPath({
  baseline,
  direction,
  domain,
  peaks,
  phaseDeg = 0,
  samples = 240,
}: {
  baseline: number;
  direction: "up" | "down";
  domain: [number, number];
  peaks: SpectrumPeak[];
  phaseDeg?: number;
  samples?: number;
}) {
  const [start, end] = domain;
  const phase = (phaseDeg * Math.PI) / 180;
  const points = Array.from({ length: samples }, (_, index) => {
    const ratio = index / (samples - 1);
    const position = start + (end - start) * ratio;
    const signal = peaks.reduce((sum, peak) => {
      const scaled = (position - peak.position) / peak.width;
      const absorption = 1 / (1 + scaled * scaled);
      // Zero-order phase error mixes in the dispersive Lorentzian component.
      return sum + peak.intensity * (Math.cos(phase) * absorption + Math.sin(phase) * scaled * absorption);
    }, 0);
    const x = 8 + ratio * 144;
    const y = direction === "up"
      ? Math.min(88, Math.max(12, baseline - signal))
      : Math.min(76, baseline + signal);
    return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  });
  return points.join(" ");
}

// AIST SDBS ethanol liquid-film IR: broad O–H, C–H stretches, bends,
// and the dominant C–O region, drawn sharp so peaks read at card size.
const ethanolIrPath = spectrumPath({
  baseline: 20,
  direction: "down",
  domain: [4000, 0],
  peaks: [
    { position: 3340, width: 230, intensity: 38 },
    { position: 2975, width: 28, intensity: 26 },
    { position: 2930, width: 25, intensity: 18 },
    { position: 2880, width: 25, intensity: 15 },
    { position: 1460, width: 28, intensity: 24 },
    { position: 1380, width: 23, intensity: 19 },
    { position: 1270, width: 20, intensity: 12 },
    { position: 1090, width: 26, intensity: 34 },
    { position: 1050, width: 24, intensity: 56 },
    { position: 880, width: 21, intensity: 22 },
  ],
});

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

// Flip-clock column: values stack vertically inside a one-row window and the
// track scrolls to each in turn (the first value repeats at the end so the loop
// wraps seamlessly). Scrolls only while the card is hovered/focused. Variant
// controls the rhythm — "steady" cycles evenly (water: six live states);
// "fast" flips quickly through the list and holds on the last value (compound:
// riffles through compounds and lands on Propane). Every column in a card must
// share the same variant and value count so they stay in sync.
function CycleValue({ values, variant = "steady" }: { values: readonly string[]; variant?: "steady" | "fast" | "fast6" }) {
  return (
    <span className={`tool-cycle is-cycle-${variant}`}>
      <span className="tool-cycle-track">
        {[...values, values[0]].map((value, index) => (
          <span key={`${index}-${value}`}>{value}</span>
        ))}
      </span>
    </span>
  );
}

function ToolThumbnail({ kind }: { kind: ToolKind }) {
  if (kind === "planner") {
    return <CoursePlannerThumbnail />;
  }

  if (kind === "water") {
    return (
      <div className="tool-thumbnail swipe-bubble-media tool-thumbnail-properties is-water" aria-hidden="true">
        <div className="tool-property-heading"><span>Water state</span><small>Steam tables</small></div>
        <div className="tool-state-inputs"><span><small>Temperature</small><strong><CycleValue values={["573 K", "673 K", "623 K", "773 K", "723 K", "480 K"]} variant="fast6" /></strong></span><b>+</b><span><small>Pressure</small><strong><CycleValue values={["0.50 MPa", "1.00 MPa", "2.50 MPa", "5.00 MPa", "10.0 MPa", "1.00 MPa"]} variant="fast6" /></strong></span></div>
        <div className="tool-property-grid">
          <span><small>v</small><strong><CycleValue values={["0.523 m³/kg", "0.307 m³/kg", "0.110 m³/kg", "0.069 m³/kg", "0.030 m³/kg", "0.210 m³/kg"]} variant="fast6" /></strong></span>
          <span><small>h</small><strong><CycleValue values={["3064 kJ/kg", "3264 kJ/kg", "3126 kJ/kg", "3434 kJ/kg", "3241 kJ/kg", "2844 kJ/kg"]} variant="fast6" /></strong></span>
          <span><small>s</small><strong><CycleValue values={["7.460 kJ/kg·K", "7.465 kJ/kg·K", "6.840 kJ/kg·K", "6.976 kJ/kg·K", "6.419 kJ/kg·K", "6.726 kJ/kg·K"]} variant="fast6" /></strong></span>
        </div>
      </div>
    );
  }

  if (kind === "compound") {
    return (
      <div className="tool-thumbnail swipe-bubble-media tool-thumbnail-properties is-compound" aria-hidden="true">
        <div className="tool-property-heading"><span>Compound lookup</span><small>Lee–Kesler</small></div>
        <div className="tool-compound-search"><span><strong><CycleValue values={["Water", "Methane", "Ethanol", "Benzene", "Ammonia", "Acetone", "Ethane", "Propane"]} variant="fast" /></strong><small><CycleValue values={["H₂O", "CH₄", "C₂H₆O", "C₆H₆", "NH₃", "C₃H₆O", "C₂H₆", "C₃H₈"]} variant="fast" /></small></span><b>⌕</b></div>
        <div className="tool-property-grid">
          <span><small>Tc</small><strong><CycleValue values={["647.3 K", "190.6 K", "516.2 K", "562.1 K", "405.6 K", "508.1 K", "305.4 K", "370.0 K"]} variant="fast" /></strong></span>
          <span><small>Pc</small><strong><CycleValue values={["22.05 MPa", "4.60 MPa", "6.38 MPa", "4.89 MPa", "11.28 MPa", "4.70 MPa", "4.87 MPa", "4.24 MPa"]} variant="fast" /></strong></span>
          <span><small>ω</small><strong><CycleValue values={["0.344", "0.008", "0.635", "0.212", "0.250", "0.309", "0.099", "0.152"]} variant="fast" /></strong></span>
        </div>
      </div>
    );
  }

  const axis = kind === "ir" ? ["4000", "3000", "2000", "1000", "0 cm⁻¹"] : kind === "nmr" ? ["6", "4", "2", "0 ppm"] : ["0", "0.25", "0.5", "0.75", "1.0", "x₁"];

  return (
    <div className={`tool-thumbnail swipe-bubble-media tool-thumbnail-chart is-${kind}`} aria-hidden="true">
      <div className="tool-chart-toolbar"><span>{kind === "ir" ? "IR · Transmittance" : kind === "nmr" ? "¹H NMR · ppm" : "Binary P–x–y"}</span><i>{kind === "vle" ? "Acetone / chloroform · 50 °C" : kind === "ir" ? "Ethanol · liquid film" : "Ethanol · 89.56 MHz"}</i></div>
      <svg viewBox="0 0 160 90" preserveAspectRatio="none">
        <path className="tool-chart-grid" d="M8 18H152M8 45H152M8 72H152M32 10V80M72 10V80M112 10V80" />
        {kind === "nmr" && <NmrPhaseThumbnailPath />}
        {kind === "ir" && <path className="tool-chart-line tool-chart-line-ir-load" d={ethanolIrPath} pathLength={1} />}
        {kind === "vle" && (
          <>
            <path className="tool-chart-line tool-vle-curve-1" d="M8 73.4 L15.2 54.2 L22.4 41.5 L29.6 33.2 L36.8 27.7 L44 24.1 L51.2 21.9 L58.4 20.4 L65.6 19.5 L72.8 19 L80 18.7 L87.2 18.6 L94.4 18.7 L101.6 19 L108.8 19.8 L116 21.2 L123.2 23.5 L130.4 27.4 L137.6 33.5 L144.8 43.1 L152 57.8" />
            <path className="tool-chart-line tool-vle-curve-2" d="M8 73.4 L41 54.2 L57.4 41.5 L66.9 33.2 L73 27.7 L77.1 24.1 L80 21.9 L82.1 20.4 L83.8 19.5 L85.1 19 L86.3 18.7 L87.6 18.6 L88.9 18.7 L90.5 19 L92.6 19.8 L95.4 21.2 L99.3 23.5 L104.9 27.4 L113.4 33.5 L127.1 43.1 L152 57.8" />
            <path className="tool-chart-line tool-vle-tie" d="M29.6 33.2 H66.9" />
          </>
        )}
      </svg>
      <div className="tool-chart-axis">{axis.map((label) => <span key={label}>{label}</span>)}</div>
    </div>
  );
}

function ToolCard({ index, tool }: { index: number; tool: Tool }) {
  return (
    <Link className="tool-card swipe-bubble-card group block w-[19rem] shrink-0 rounded-[1.5rem] border border-ink/10 bg-surface/55 p-5 transition hover:-translate-y-0.5 hover:border-ink/20 hover:bg-surface sm:w-[22rem] sm:p-6" data-reveal data-spotlight href={tool.href} style={{ "--reveal-delay": `${index * 80}ms` } as CSSProperties}>
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
              {section.tools.map((tool, index) => (
                <ToolCard index={index} key={tool.href} tool={tool} />
              ))}
            </SnapCarousel>
          </section>
        ))}
      </div>
    </>
  );
}
