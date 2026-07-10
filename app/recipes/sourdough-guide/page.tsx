import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { SourdoughGuide } from "@/components/sourdough-guide";

export const metadata: Metadata = { title: "Sourdough guide" };

export default function SourdoughGuidePage() {
  return (
    <>
      <PageIntro
        eyebrow="Guide"
        title="Sourdough guide"
        description="A practical guide for making and adjusting sourdough: how to read the dough formula, scale the loaf, change hydration, plan the timing, follow the folds and proofing stages, and bake with clearer cues instead of relying only on a fixed recipe."
      />

      <section className="page-section pt-12 sm:pt-16">
        <Link className="back-link-bubble mb-6" href="/recipes">← Back to recipes</Link>
        <SourdoughGuide />
      </section>
    </>
  );
}
