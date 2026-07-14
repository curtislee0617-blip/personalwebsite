import type { Metadata } from "next";
import Link from "next/link";
import { BachourGuide } from "@/components/bachour-guide";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Bachour by Antonio Bachour" };

export default function BachourPage() {
  return (
    <>
      <PageIntro
        eyebrow="Recipe book"
        title="Bachour by Antonio Bachour"
        description="The pastries from the supplied Antonio Bachour cookbook photographs, rebuilt as compact recipe cards. Each card keeps every ingredient with its own component method and includes an independent scaling calculator."
      />

      <section className="page-section pt-10 sm:pt-14">
        <Link className="back-link-bubble mb-6" href="/recipes#recipe-books">← Back to recipe books</Link>
        <BachourGuide />
      </section>
    </>
  );
}
