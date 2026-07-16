import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { RecipeImageViewer } from "@/components/recipe-image-viewer";
import { SectionRail } from "@/components/section-rail";

export const metadata: Metadata = { title: "Pasta guide" };

const sections = [
  { id: "pasta", label: "Pasta" },
  { id: "dough", label: "Egg pasta dough" },
  { id: "shapes", label: "Pasta shapes" },
] as const;

const photos = ["Stuffedpasta.jpeg", "Capelliti.jpeg", "spaghetti.jpeg", "tortellini.jpeg"] as const;

const shapes = [
  ["Capelliti.jpeg", "Cappelletti", "Cappelletti means “little hats” in Italian—a diminutive of cappello—after the folded pasta’s resemblance to a small hat. The filled pasta is traditional to Romagna and Emilia."],
  ["spaghetti.jpeg", "Spaghetti", "Spaghetti is the plural of spaghetto, a diminutive of spago, meaning “string” or “twine”—a direct reference to its long, thin form."],
  ["Stuffedpasta.jpeg", "Long agnolotto", "This coil is a long agnolotto inspired by dishes I’ve seen online."],
  ["tortellini.jpeg", "Tortellini", "The name follows torta to tortello to tortellino: each ending makes the word smaller, so tortellini are literally very small tortelli. They are closely associated with Emilia-Romagna, particularly Bologna and Modena."],
] as const;

function PastaPhoto({ alt, className = "", file, priority = false }: { alt: string; className?: string; file: string; priority?: boolean }) {
  const src = `/recipes/pasta/${file}`;
  return (
    <RecipeImageViewer alt={alt} className={className} src={src}>
      <Image alt={alt} height={1200} priority={priority} sizes="(max-width: 640px) 92vw, (max-width: 1000px) 45vw, 30vw" src={src} width={900} />
    </RecipeImageViewer>
  );
}

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
                <PastaPhoto alt={`Fresh pasta, image ${index + 1}`} file={file} priority={index === 0} />
              </figure>
            ))}
          </div>
        </section>

        <section id="dough" className="viennoiserie-recipe-section">
          <div className="viennoiserie-photo-heading">
            <div><p className="eyebrow">Original recipe</p><h2>Egg pasta dough</h2></div>
            <p>Equal weights of farina and semola with an egg-rich dough.</p>
          </div>
          <div className="viennoiserie-recipe-layout">
            <div className="viennoiserie-recipe-main">
              <div className="viennoiserie-recipe-card">
                <p>This is the base dough I like using for fresh egg pasta. Tuorli is the total egg and yolk weight, equivalent to about 21 egg yolks and 1 whole egg.</p>
                <ul className="viennoiserie-ingredient-list">
                  <li><span>270 g</span> farina</li>
                  <li><span>270 g</span> semola</li>
                  <li><span>420 g</span> tuorli (about 21 egg yolks and 1 whole egg)</li>
                </ul>
                <p>Combine the farina and semola, then work in the tuorli until a firm dough forms. Knead until smooth, wrap tightly, and rest before rolling.</p>
              </div>
              <div className="viennoiserie-recipe-card">
                <p className="eyebrow">Working notes</p>
                <p>Keep the dough covered whenever it is not being rolled. Dust sparingly: excess flour dries the edges and makes sealing harder. For filled shapes, aim for a thin, even sheet and press out the air before closing.</p>
              </div>
            </div>
            <div className="viennoiserie-step-rail">
              <figure>
                <PastaPhoto alt="Mushroom filling portioned on a pasta sheet" file="mushroomtortilinifilling.jpeg" />
                <figcaption>Even portions make even shapes.</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section id="shapes" className="viennoiserie-photo-section">
          <div className="viennoiserie-photo-heading"><div><p className="eyebrow">Reference board</p><h2>Pasta shapes</h2></div></div>
          <div className="viennoiserie-shapes">
            {shapes.map(([file, title, description]) => (
              <article key={file}>
                <PastaPhoto alt={title} file={file} />
                <div><h3>{title}</h3><p>{description}</p></div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
