import type { Metadata } from "next";
import { HistoryBackButton } from "@/components/history-back-button";
import { BachourGuide } from "@/components/bachour-guide";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Bachour & Bachour the Baker by Antonio Bachour" };

export default function BachourPage() {
  return (
    <>
      <PageIntro
        eyebrow="Recipe book"
        title="Bachour by Antonio Bachour"
        description="Two Antonio Bachour collections rebuilt as compact recipe cards: the original supplied pastries and all 67 recipes and foundations from Bachour the Baker. Search across both books, scale ingredients and open the exact source pages."
      />

      <section className="page-section pt-10 sm:pt-14">
        <HistoryBackButton className="mb-6" fallbackHref="/recipes#recipe-books">← Back to recipe books</HistoryBackButton>
        <BachourGuide />
      </section>
    </>
  );
}
