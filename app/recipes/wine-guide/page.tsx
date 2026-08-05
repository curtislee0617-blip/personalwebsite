import type { Metadata } from "next";
import "./wine-guide.css";
import { HistoryBackButton } from "@/components/history-back-button";
import { PageIntro } from "@/components/page-intro";
import { WineGuide } from "@/components/wine-guide";

export const metadata: Metadata = {
  title: "The world of wine",
  description:
    "A comprehensive guide to wine chemistry, viticulture, world regions, grape varieties, winemaking, sparkling wine and fortified wine.",
};

export default function WineGuidePage() {
  return (
    <div className="guide-page wine-guide-page">
      <PageIntro
        eyebrow="Guide · Wine"
        title="The world of wine"
        description="A long-form field guide to the journey from berry to bottle: how climate, farming, microbes, extraction, oxygen and time become the structure and aroma of a wine."
      />

      <section className="page-section pt-10 sm:pt-12">
        <HistoryBackButton className="mb-6" fallbackHref="/recipes">← Back to recipes</HistoryBackButton>
        <WineGuide />
      </section>
    </div>
  );
}
