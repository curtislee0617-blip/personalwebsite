import type { Metadata } from "next";
import "./wine-guide.css";
import { HistoryBackButton } from "@/components/history-back-button";
import { PageIntro } from "@/components/page-intro";
import { SectionRail } from "@/components/section-rail";
import { WineGuide } from "@/components/wine-guide";

export const metadata: Metadata = {
  title: "The world of wine",
  description:
    "A comprehensive guide to wine chemistry, viticulture, world regions, grape varieties, winemaking, sparkling wine and fortified wine.",
};

const sections = [
  { id: "wine-what", label: "What wine is" },
  { id: "wine-growing", label: "How grapes are grown" },
  { id: "wine-grapes", label: "Grape varieties" },
  { id: "wine-making", label: "How wine is made" },
  { id: "wine-types", label: "Types of wine" },
  { id: "wine-sparkling", label: "Sparkling wine" },
  { id: "wine-fortified", label: "Fortified wine" },
  { id: "wine-tasting", label: "Reading a glass" },
] as const;

export default function WineGuidePage() {
  return (
    <div className="guide-page wine-guide-page">
      <PageIntro
        eyebrow="Guide · Wine"
        title="The world of wine"
        description="Wine begins as one very small fruit and ends as a map of climate, farming, microbes, extraction, oxygen and time. This is my attempt to follow the whole thing without losing the chemistry—or the places—along the way."
      />
      <SectionRail ariaLabel="Wine guide sections" sections={sections} />

      <section className="page-section pt-10 sm:pt-12">
        <HistoryBackButton className="mb-6" fallbackHref="/recipes">← Back to recipes</HistoryBackButton>
        <WineGuide />
      </section>
    </div>
  );
}
