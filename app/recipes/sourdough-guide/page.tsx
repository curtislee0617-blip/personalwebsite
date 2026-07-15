import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { SectionRail } from "@/components/section-rail";
import { SourdoughGuide } from "@/components/sourdough-guide";

export const metadata: Metadata = { title: "Sourdough guide" };

const sourdoughSections = [
  { id: "sourdough-calculator", label: "Calculator" },
  { id: "sourdough-timeline", label: "Timeline" },
  { id: "sourdough-gallery", label: "Gallery" },
  { id: "sourdough-notes", label: "Notes" },
] as const;

export default function SourdoughGuidePage() {
  return (
    <div className="guide-page">
      <PageIntro
        eyebrow="Guide"
        title="Sourdough guide"
        description="A practical guide for making and adjusting sourdough: how to read the dough formula, scale the loaf, change hydration, plan the timing, follow the folds and proofing stages, and bake with clearer cues instead of relying only on a fixed recipe."
      />
      <SectionRail ariaLabel="Sourdough guide sections" sections={sourdoughSections} />

      <section className="page-section pt-12 sm:pt-16">
        <Link className="back-link-bubble mb-6" href="/recipes">← Back to recipes</Link>
        <SourdoughGuide />
      </section>
    </div>
  );
}
