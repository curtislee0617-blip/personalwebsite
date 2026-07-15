import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { PollenStreetGuide } from "@/components/pollen-street-guide";

export const metadata: Metadata = { title: "Pollen Street by Jason Atherton" };

export default function PollenStreetPage() {
  return (
    <>
      <PageIntro
        eyebrow="Recipe book"
        title="Pollen Street by Jason Atherton"
        description="A working collection of Pollen Street Basics and complete dishes, reconstructed from the photographed cookbook pages. Every dish keeps its component recipes and method together, with the relevant Basics included inside the card."
      />

      <section className="page-section pt-10 sm:pt-14">
        <Link className="back-link-bubble mb-6" href="/recipes#recipe-books">← Back to recipe books</Link>
        <PollenStreetGuide />
      </section>
    </>
  );
}
