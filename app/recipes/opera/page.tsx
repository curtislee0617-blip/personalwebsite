import type { Metadata } from "next";
import { HistoryBackButton } from "@/components/history-back-button";
import { OperaGuide } from "@/components/opera-guide";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Opéra Pâtisserie by Cédric Grolet" };

export default function OperaPage() {
  return (
    <>
      <PageIntro
        eyebrow="Recipe book"
        title="Opéra Pâtisserie by Cédric Grolet"
        description="The complete supplied book rebuilt as 96 searchable, scalable pastry cards and 22 reusable basic recipes. Finished-pastry photographs, component boundaries and exact printed source pages stay attached to every transcription."
      />
      <section className="page-section pt-10 sm:pt-14">
        <HistoryBackButton className="mb-6" fallbackHref="/recipes#recipe-books">← Back to recipe books</HistoryBackButton>
        <OperaGuide />
      </section>
    </>
  );
}
