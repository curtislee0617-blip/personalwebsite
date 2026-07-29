import type { Metadata } from "next";
import { CoffeeGuide } from "@/components/coffee-guide";
import { HistoryBackButton } from "@/components/history-back-button";
import { PageIntro } from "@/components/page-intro";
import { SectionRail } from "@/components/section-rail";

export const metadata: Metadata = { title: "The science of coffee" };

const sections = [
  { id: "coffee-botany", label: "What coffee is" },
  { id: "coffee-processing", label: "Processing & roasting" },
  { id: "coffee-flavour", label: "Aromatic compounds" },
  { id: "coffee-terroir", label: "Colour & terroir" },
  { id: "coffee-extraction", label: "Brewing & extraction" },
  { id: "coffee-crema-water", label: "Crema & water" },
  { id: "coffee-next", label: "Still developing" },
] as const;

export default function CoffeeGuidePage() {
  return (
    <div className="guide-page">
      <PageIntro
        eyebrow="Guide · In progress"
        title="The science of coffee"
        description="Its existence doesn’t make sense, but we absolutely love it - coffee. This guide is incomplete, and I’ll continue developing it."
      />
      <SectionRail ariaLabel="Coffee guide sections" sections={sections} />

      <section className="page-section pt-10 sm:pt-12">
        <HistoryBackButton className="mb-6" fallbackHref="/recipes">← Back to recipes</HistoryBackButton>
        <CoffeeGuide />
      </section>
    </div>
  );
}
