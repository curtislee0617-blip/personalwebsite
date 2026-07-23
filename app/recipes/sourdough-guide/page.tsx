import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { SectionRail } from "@/components/section-rail";
import { SourdoughGuide } from "@/components/sourdough-guide";
import { getImportedCookbook } from "@/lib/imported-cookbooks";

export const metadata: Metadata = { title: "Sourdough guide" };

const sourdoughSections = [
  { id: "sourdough-calculator", label: "Calculator" },
  { id: "sourdough-timeline", label: "Timeline" },
  { id: "sourdough-gallery", label: "Gallery" },
  { id: "sourdough-notes", label: "My ingredient notes" },
  { id: "sourdough-open-crumb-summary", label: "Open crumb summary" },
  { id: "sourdough-open-crumb-recipes", label: "Bread Stalker recipes" },
] as const;

export default async function SourdoughGuidePage() {
  const openCrumbCookbook = await getImportedCookbook("secrets-of-open-crumb");

  if (!openCrumbCookbook) return null;

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
        <SourdoughGuide openCrumbCookbook={openCrumbCookbook} />
      </section>
    </div>
  );
}
