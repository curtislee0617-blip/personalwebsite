import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { SectionRail } from "@/components/section-rail";

export const metadata: Metadata = { title: "Pasta guide" };

const sections = [
  { id: "pasta", label: "Pasta" },
  { id: "shapes", label: "Pasta shapes" },
] as const;

const photos = ["DSC_6482.jpeg", "Stuffedpasta.jpeg", "Capelliti.jpeg", "spaghetti.jpeg", "tortellini.jpeg"] as const;

const shapes = [
  ["Capelliti.jpeg", "Cappelletti", "Small filled pasta folded into a compact, hat-like shape."],
  ["spaghetti.jpeg", "Spaghetti", "Roll the sheet thin, dust lightly, and cut into fine strands."],
  ["Stuffedpasta.jpeg", "Spiralghetti & agnolotti", "A snapshot of contrasting shapes: long spiralled strands and neatly sealed parcels."],
  ["tortellini.jpeg", "Tortellini", "Folded filled pasta with a rounded belly and a clean, pinched finish."],
] as const;

export default function PastaGuidePage() {
  return (
    <div className="guide-page">
      <PageIntro eyebrow="Guide" title="Pasta guide" />
      <SectionRail ariaLabel="Pasta guide sections" sections={sections} />

      <section className="page-section">
        <Link className="back-link-bubble mb-6" href="/recipes">← Back to recipes</Link>

        <section id="pasta" className="pasta-collage-section">
          <div className="pasta-collage">
            {photos.map((file, index) => (
              <figure className={index === 0 ? "pasta-collage-feature" : ""} key={file}>
                <Image alt={`Fresh pasta, image ${index + 1}`} src={`/recipes/pasta/${file}`} width={900} height={1200} priority={index === 0} />
              </figure>
            ))}
          </div>
        </section>

        <section id="shapes" className="viennoiserie-photo-section">
          <div className="viennoiserie-photo-heading"><div><p className="eyebrow">Reference board</p><h2>Pasta shapes</h2></div></div>
          <div className="viennoiserie-shapes">
            {shapes.map(([file, title, description]) => (
              <article key={file}>
                <Image src={`/recipes/pasta/${file}`} alt={title} width={900} height={1200} />
                <div><h3>{title}</h3><p>{description}</p></div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
