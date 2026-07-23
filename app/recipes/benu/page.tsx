import type { Metadata } from "next";
import { HistoryBackButton } from "@/components/history-back-button";
import { BenuGuide } from "@/components/benu-guide";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Benu by Corey Lee" };

export default function BenuPage() {
  return (
    <>
      <PageIntro
        eyebrow="Recipe book"
        title="Benu by Corey Lee"
        description="The dishes from the supplied Benu cookbook photographs, rebuilt as compact recipe cards. Each card keeps its ingredients beside the method component they belong to and includes its own scaling calculator."
      />

      <section className="page-section pt-10 sm:pt-14">
        <HistoryBackButton className="mb-6" fallbackHref="/recipes#recipe-books">← Back to recipe books</HistoryBackButton>
        <BenuGuide />
      </section>
    </>
  );
}
