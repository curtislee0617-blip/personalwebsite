import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { CoreBasicsGuide } from "@/components/core-basics-guide";

export const metadata: Metadata = { title: "Core basics" };

export default function CoreBasicsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Guide"
        title="Core basics"
        description="Foundational recipes from the Core by Clare Smyth book, where I find the recipes very useful — powders, stocks and sauces, butters and purées, brines, oils and gels, mousse, pastry and bakery starters, each written up as a single recipe block and sorted by type."
      />

      <section className="page-section pt-12 sm:pt-16">
        <Link className="back-link-bubble mb-6" href="/recipes">← Back to recipes</Link>
        <CoreBasicsGuide />
      </section>
    </>
  );
}
