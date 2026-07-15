import type { Metadata } from "next";
import Link from "next/link";
import { FrantzenGuide } from "@/components/frantzen-guide";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Frantzén by Björn Frantzén" };

export default function FrantzenPage() {
  return (
    <>
      <PageIntro
        eyebrow="Recipe book"
        title="Frantzén by Björn Frantzén"
        description="The supplied cookbook pages rebuilt as 64 foundation recipes from Basics pages 301–308, centered dish recipes and a separate Petit Fours collection. Every published card preserves component boundaries, scaling and an exact source-page link."
      />
      <section className="page-section pt-10 sm:pt-14">
        <Link className="back-link-bubble mb-6" href="/recipes#recipe-books">← Back to recipe books</Link>
        <FrantzenGuide />
      </section>
    </>
  );
}
