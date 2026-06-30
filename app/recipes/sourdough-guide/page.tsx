import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { SourdoughGuide } from "@/components/sourdough-guide";

export const metadata: Metadata = { title: "Sourdough guide" };

export default function SourdoughGuidePage() {
  return (
    <>
      <PageIntro
        eyebrow="Guide"
        title="Sourdough guide"
        description="A clearer web version of the sourdough steps PDF, with scaling, hydration adjustment, time labels for each stage, and a reminder that flour combinations can change from loaf to loaf."
      />

      <section className="page-section pt-12 sm:pt-16">
        <SourdoughGuide />
      </section>
    </>
  );
}
