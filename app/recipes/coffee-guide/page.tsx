import type { Metadata } from "next";
import "./coffee-guide.css";
import { CoffeeGuide } from "@/components/coffee-guide";
import { HistoryBackButton } from "@/components/history-back-button";
import { PageIntro } from "@/components/page-intro";
import { SectionRail } from "@/components/section-rail";

export const metadata: Metadata = { title: "The science of coffee" };

const sections = [
  { id: "coffee-what", label: "What coffee is" },
  { id: "coffee-growing", label: "How it is grown" },
  { id: "coffee-processing", label: "Picking & processing" },
  { id: "coffee-roasting", label: "How it is roasted" },
  { id: "coffee-brewing", label: "How it is brewed" },
] as const;

export default function CoffeeGuidePage() {
  return (
    <div className="guide-page coffee-guide-page">
      <PageIntro
        eyebrow="Guide · Coffee"
        title="The science of coffee"
        description="Follow coffee from flowering plant to finished cup: what it is, how it grows, how the cherry becomes green coffee, what roasting changes and how brewing extracts it."
      />
      <SectionRail ariaLabel="Coffee guide sections" sections={sections} />

      <section className="page-section pt-10 sm:pt-12">
        <HistoryBackButton className="mb-6" fallbackHref="/recipes">← Back to recipes</HistoryBackButton>
        <CoffeeGuide />
      </section>
    </div>
  );
}
