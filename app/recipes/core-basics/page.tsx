import type { Metadata } from "next";
import { HistoryBackButton } from "@/components/history-back-button";
import { PageIntro } from "@/components/page-intro";
import { CoreBookGuide } from "@/components/core-book-guide";

export const metadata: Metadata = { title: "Core by Clare Smyth" };

export default function CoreBasicsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Recipe book"
        title="Core by Clare Smyth"
        description="The complete supplied cookbook: Core Basics and 51 complete dish groups in book order. Recipes retain the original ingredient-grid and method flow, with scalable quantities, plated images, and exact source pages for checking dense layouts."
      />

      <section className="page-section pt-10 sm:pt-14">
        <HistoryBackButton className="mb-6" fallbackHref="/recipes#recipe-books">← Back to recipe books</HistoryBackButton>
        <CoreBookGuide />
      </section>
    </>
  );
}
