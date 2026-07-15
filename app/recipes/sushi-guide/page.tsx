import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { SectionRail } from "@/components/section-rail";

export const metadata: Metadata = { title: "Sushi guide" };

const sections = [
  { id: "sushi", label: "Sushi" },
  { id: "rice", label: "Sushi rice" },
  { id: "zuke", label: "Zuke" },
] as const;

export default function SushiGuidePage() {
  return (
    <div className="guide-page">
      <PageIntro eyebrow="Guide" title="Sushi guide" />
      <SectionRail ariaLabel="Sushi guide sections" sections={sections} />

      <section className="page-section">
        <Link className="back-link-bubble mb-6" href="/recipes">← Back to recipes</Link>

        <section id="sushi" className="sushi-showcase" aria-label="Sushi guide photographs">
          <figure><Image alt="Sushi chefs at the counter" src="/recipes/sushi/IMG_2842.jpeg" width={1536} height={2048} priority /></figure>
          <figure><Image alt="Nigiri served at the counter" src="/recipes/sushi/IMG_1653.jpeg" width={3213} height={5712} /></figure>
        </section>

        <div className="sushi-notes-grid">
          <section id="rice" className="sushi-note-card">
            <p className="eyebrow">Sushi rice</p><h2>Sushi rice mixture</h2><p>A simple sushi vinegar ratio for seasoning rice.</p>
            <ul><li><span>50 g</span> salt</li><li><span>90 g</span> sugar</li><li><span>260 g</span> vinegar</li></ul>
          </section>
          <section id="zuke" className="sushi-note-card">
            <p className="eyebrow">Akami brine</p><h2>Zuke</h2><p>Equal parts soy, nikiri mirin, and nikiri sake for Akami zuke.</p>
            <ul><li><span>1 part</span> koikuchi soy sauce</li><li><span>1 part</span> nikiri mirin</li><li><span>1 part</span> nikiri sake</li></ul>
          </section>
        </div>
      </section>
    </div>
  );
}
