import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { SectionRail } from "@/components/section-rail";

export const metadata: Metadata = { title: "Pasta guide" };

const sections = [
  { id: "dough", label: "Dough" },
  { id: "shapes", label: "Pasta shapes" },
  { id: "notes", label: "Notes" },
];

const shapes = [
  ["Capelliti.jpeg", "Cappelletti", "Small filled pasta folded into a compact, hat-like shape."],
  ["mushroomtortilinifilling.jpeg", "Wrapping filled pasta", "Pipe the filling evenly, keep the sheet supple, and seal without trapping air."],
  ["spaghetti.jpeg", "Spaghetti", "Roll the sheet thin, dust lightly, and cut into fine strands."],
  ["Stuffedpasta.jpeg", "Spiralghetti & agnolotti", "A snapshot of contrasting shapes: long spiralled strands and neatly sealed parcels."],
  ["tortellini.jpeg", "Tortellini", "Folded filled pasta with a rounded belly and a clean, pinched finish."],
] as const;

export default function PastaGuidePage() {
  return (
    <>
      <PageIntro eyebrow="Guide" title="Pasta guide" description="A practical reference for fresh egg pasta: a rich yolk dough, rolling and filling, and the shapes that make the work worth doing." />
      <SectionRail ariaLabel="Pasta guide sections" sections={sections} />

      <section className="page-section pt-12 sm:pt-16">
        <div className="viennoiserie-start">
          <div className="viennoiserie-hero-image"><Image src="/recipes/pasta/Stuffedpasta.jpeg" alt="A tray of fresh stuffed pasta" width={900} height={1200} priority /></div>
          <div className="viennoiserie-hero-copy"><p className="eyebrow">The starting point</p><h2>Fresh pasta is a study in texture.</h2><p>Good dough is supple enough to roll thin, strong enough to hold a filling, and rested enough to shape cleanly. Start with the formula below, then let the shape decide the finish.</p><div className="viennoiserie-stat-row"><span><strong>2</strong> equal flour weights</span><span><strong>1</strong> egg-rich dough</span><span><strong>5</strong> shapes to practice</span></div></div>
        </div>

        <section id="dough" className="viennoiserie-recipe-section">
          <div className="viennoiserie-photo-heading"><div><p className="eyebrow">The formula</p><h2>Egg pasta dough</h2></div><p>Rich, elastic, and designed for rolling into filled pasta.</p></div>
          <div className="viennoiserie-recipe-layout"><div className="viennoiserie-recipe-main"><div className="viennoiserie-recipe-card"><p>Combine the farina and semola, then work in the eggs and tuorli until a firm dough forms. Knead until smooth, wrap tightly, and rest before rolling.</p><ul className="viennoiserie-ingredient-list"><li><span>21</span> egg yolks</li><li><span>1</span> whole egg</li><li><span>270 g</span> farina</li><li><span>270 g</span> semola</li><li><span>420 g</span> tuorli</li></ul></div><div className="viennoiserie-recipe-card"><p className="eyebrow">Working notes</p><p>Keep the dough covered whenever it is not being rolled. Dust sparingly: excess flour dries the edges and makes sealing harder. For filled shapes, aim for a thin, even sheet and press out air before closing.</p></div></div><div className="viennoiserie-step-rail"><figure><Image src="/recipes/pasta/mushroomtortilinifilling.jpeg" alt="Mushroom filling portioned on a pasta sheet" width={900} height={1200} /><figcaption>Even portions make even shapes.</figcaption></figure></div></div>
        </section>

        <section id="shapes" className="viennoiserie-photo-section"><div className="viennoiserie-photo-heading"><div><p className="eyebrow">Reference board</p><h2>Pasta shapes</h2></div><p>Shape follows dough, filling, and the way you want the sauce to cling.</p></div><div className="viennoiserie-shapes">{shapes.map(([file, title, description]) => <article key={file}><Image src={`/recipes/pasta/${file}`} alt={title} width={900} height={1200} /><div><p className="eyebrow">Shape {shapes.findIndex((item) => item[0] === file) + 1}</p><h3>{title}</h3><p>{description}</p></div></article>)}</div></section>

        <section id="notes" className="viennoiserie-section"><div className="viennoiserie-section-heading"><p className="eyebrow">Kitchen notes</p><h2>Small details, better pasta.</h2><p>A few habits make the rolling and shaping stages calmer and more consistent.</p></div><div className="viennoiserie-notes-grid"><article><span>01</span><h3>Rest the dough</h3><p>Give gluten time to relax before the final passes through the machine.</p></article><article><span>02</span><h3>Control moisture</h3><p>Use a light hand with filling and seal the edges while the sheet is still fresh.</p></article><article><span>03</span><h3>Cook to the shape</h3><p>Thin strands need seconds; filled shapes need enough time for the center to warm through.</p></article></div><Link className="back-link-bubble mt-8" href="/recipes">← Back to recipes</Link></section>
      </section>
    </>
  );
}
