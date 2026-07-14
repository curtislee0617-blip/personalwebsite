import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { SectionRail } from "@/components/section-rail";
import { ViennoiserieScaler } from "@/components/viennoiserie-scaler";

export const metadata: Metadata = {
  title: "Viennoiserie guide",
  description: "A visual guide to croissants, pain au chocolat, and savoury laminated pastries.",
};

const sections = [
  { id: "croissants", label: "Croissants" },
  { id: "variations", label: "Croissant variations" },
  { id: "recipe", label: "Recipe" },
] as const;

const croissants = ["Croissants.jpeg", "Croissants1.jpeg", "Croissants2.jpeg", "Croissants3.jpeg", "Croissants5.jpeg", "Croissant1.jpeg", "Croissant2.jpeg", "Croissant3.jpeg", "Croissant4.jpeg"] as const;

const variations = [
  {
    title: "Haggis and sausage",
    eyebrow: "Savoury variation",
    files: ["Haggis_And_Sausage.jpeg"],
  },
  {
    title: "Ham and cheese",
    eyebrow: "Savoury variation",
    files: ["Ham&Cheese.jpeg", "Ham&Cheese1.jpeg"],
  },
  {
    title: "Pain au chocolat",
    eyebrow: "Sweet variation",
    files: ["Pain_Au_Chocolat.jpeg", "Pain_Au_Chocolat1.jpeg", "Pain_Au_Chocolat2.jpeg", "Pain_Au_Chocolat3.jpeg", "Pain_Au_Chocolat4.jpeg"],
  },
] as const;

function Photo({ file, alt }: { file: string; alt: string }) {
  const parts = file.split("/");
  const encodedFile = parts.map((part) => encodeURIComponent(part)).join("/");
  const fullSrc = `/recipes/viennoiserie/${encodedFile}`;
  const thumbSrc = parts[0] === "recipe-steps"
    ? `/recipes/viennoiserie/recipe-steps/thumbs-v2-${encodeURIComponent(parts[1])}`
    : `/recipes/viennoiserie/thumbs/${encodeURIComponent(parts[0])}`;
  return <a className="viennoiserie-photo-link" href={fullSrc} target="_blank" rel="noreferrer" aria-label={`Open full-size image: ${alt}`}><Image src={thumbSrc} alt={alt} width={900} height={1200} quality={78} sizes="(max-width: 640px) 92vw, (max-width: 1000px) 45vw, 30vw" /></a>;
}

export default function ViennoiserieGuidePage() {
  return (
    <>
      <PageIntro
        eyebrow="Guide · laminated dough"
        title="Viennoiserie guide"
        description="A photo-first record of the laminated pastries coming out of the kitchen: croissants first, followed by a few sweet and savoury variations."
      />
      <SectionRail ariaLabel="Viennoiserie guide sections" sections={sections} />

      <section className="page-section pt-12 sm:pt-16">
        <Link className="back-link-bubble mb-8" href="/recipes">← Back to recipes</Link>

        <section id="croissants" className="viennoiserie-photo-section">
          <div className="viennoiserie-photo-heading">
            <div><p className="eyebrow">The main event</p><h2>Croissants</h2></div>
            <p>All of the croissant images in one place — from full trays to close-ups of the baked layers.</p>
          </div>
          <div className="viennoiserie-croissant-grid">
            {croissants.map((file, index) => <figure key={file} className={index === 0 ? "croissant-feature" : ""}><Photo file={file} alt={`Croissant bake ${index + 1}`} /></figure>)}
          </div>
        </section>

        <section id="recipe" className="viennoiserie-recipe-section">
          <div className="viennoiserie-photo-heading"><div><p className="eyebrow">The recipe</p><h2>Plain croissants</h2></div><p>Yield: 15 croissants</p></div>
          <aside className="viennoiserie-source-note">
            <p className="eyebrow">Recipe source</p>
            <p>This croissant recipe is by <strong>Antonio Bachour</strong>. The photographed pages include the plain croissant method and the cocoa détrempe variation for pain au chocolat.</p>
          </aside>
          <ViennoiserieScaler />

          <div className="viennoiserie-recipe-layout">
            <div className="viennoiserie-recipe-main">
              <div className="viennoiserie-recipe-card">
                <p className="eyebrow">Croissant dough</p>
                <ul className="viennoiserie-ingredient-list">
                  <li><span>375 g</span> bread flour T65</li><li><span>375 g</span> all-purpose flour T55</li><li><span>112 g</span> granulated sugar</li><li><span>12 g</span> salt</li><li><span>375 g</span> whole milk</li><li><span>50 g</span> unsalted butter, chilled</li><li><span>35 g</span> fresh yeast</li><li><span>—</span> non-stick spray, as needed</li>
                </ul>
                <p>In a mixer fitted with the hook attachment, combine the flours, sugar, salt, milk and butter and mix on low speed. After 1 minute, add the yeast and continue to mix on low speed for an additional 7 minutes. Scrape down the sides of the bowl and mix for 8 more minutes on second speed. Pick the dough (a handful) between the hands and stretch. If it does not break and creates a thin elastic dough, it is perfect.</p>
                <p>Prepare a large bowl with non-stick spray. Knead the dough, place it in the bowl, cover with plastic wrap and leave it to rest for 30 minutes at room temperature. Stretch the dough to 50x35 cm and reserve in the freezer overnight.</p>
              </div>

              <div className="viennoiserie-recipe-card">
                <p className="eyebrow">Butter block</p>
                <ul className="viennoiserie-ingredient-list"><li><span>500 g</span> unsalted butter, chilled</li></ul>
                <p>Place a piece of parchment paper on the work surface. Center the butter on the paper. Top with another sheet of parchment paper and pound the top of the butter from the left to right with the help of a rolling pin to begin to flatten it. Continue to flatten the butter until you a rectangular shape of 30x35cm is obtained. Wrap and refrigerate.</p>
              </div>

              <div className="viennoiserie-recipe-card">
                <p className="eyebrow">Egg wash</p>
                <ul className="viennoiserie-ingredient-list"><li><span>100 g</span> whole eggs</li><li><span>100 g</span> egg yolks</li><li><span>100 g</span> milk</li></ul>
                <p>Put all the ingredients in a bowl and mix with a hand whisk. Reserve in the refrigerator until ready to use.</p>
              </div>

              <div className="viennoiserie-recipe-card">
                <p className="eyebrow">Lamination</p>
                <p>Start rolling the dough in a rectangular shape, 50x35 cm, while always keeping the edges squared. The dough should be firm to the touch and be at a temperature of approximately 0°C.</p>
                <p>Place the cold butter block (6-8°C) and cover 2/3 of the dough. Fold the top of the dough to the center and fold the bottom of the dough over the top. This is called a single turn and will count as the first turn.</p>
                <p>Lightly dust the work surface and the top of the dough with flour and turn the dough to a horizontal position. Begin rolling evenly from the top to the bottom. Alternate in both directions to ensure a proper, even lamination. It is important to make sure that the dough has the same thickness throughout its entire length, approximately 5 mm. Always ensure that the dough does not stick to the rolling pin or to the work surface. If so, lightly dust with bread flour.</p>
                <p>Now perform a triple turn or fold. Divide the dough mentally in 5 parts. Take the two parts of the opposite sides and fold to the center. Following this, take one of the sides and fold to the center and then cover with the other part of the dough (see the step-by-step photographs). Cover the dough with plastic wrap and leave to rest in the refrigerator for 30 minutes.</p>
                <p>Then roll the dough to its final shape. Start by lightly dusting the work surface and the top of the dough with flour. Turn the dough so that the seam is vertical and on your right side, and roll out. Turn the dough to a horizontal position and laminate to a thickness of 3 mm. Trim the edges. Cut the dough into 9x38-cm triangles. Roll up the triangles from the base to the vertex, thus creating the croissants. Spray a sheet pan with non-stick spray, line with parchment paper, and place the croissants allowing some space in between. Leave to proof at 28°C for about 2.5 hours.</p>
              </div>

              <div className="viennoiserie-recipe-card">
                <p className="eyebrow">Finishing and baking</p>
                <p>Preheat the oven to 170°C. Brush the pieces to lightly coat with the egg wash. Bake for 18 minutes. Remove the croissants from the oven and place on a cooling rack.</p>
              </div>
            </div>
            <div className="viennoiserie-step-rail">
              <figure><Photo file="recipe-steps/02-croissant-shaping.jpeg" alt="Croissant shaping from the recipe book" /><figcaption>01 · Shape the croissants</figcaption></figure>
              <figure><Photo file="recipe-steps/05-pain-au-chocolat-shaping.jpeg" alt="Pain au chocolat shaping from the recipe book" /><figcaption>02 · Pain au chocolat</figcaption></figure>
              <figure><Photo file="recipe-steps/01-lamination-folds.jpeg" alt="Lamination folds from the recipe book" /><figcaption>03 · Lamination folds</figcaption></figure>
            </div>
          </div>

          <details className="viennoiserie-variation-recipe"><summary>Cocoa détrempe &amp; pain au chocolat</summary><div className="viennoiserie-recipe-card"><p className="eyebrow">Cocoa détrempe</p><ul className="viennoiserie-ingredient-list"><li><span>75 g</span> bread flour</li><li><span>75 g</span> all-purpose flour</li><li><span>22 g</span> sugar</li><li><span>2.2 g</span> salt</li><li><span>75 g</span> whole milk</li><li><span>50 g</span> water</li><li><span>10 g</span> unsalted butter, chilled</li><li><span>7 g</span> fresh yeast</li><li><span>20 g</span> cocoa powder</li></ul><p>In a mixer fitted with the hook attachment, combine the flours, sugar, salt, milk, water, cocoa powder and butter and mix on low speed. After 1 minute, add the yeast and continue to mix on low speed for an additional 7 minutes. Scrape down the sides of the bowl and mix for 7 more minutes on second speed. Pick the dough (a handful) between the hands and stretch. If it does not break and creates a thin elastic dough, it is perfect. Roll the dough in a square shape, wrap in plastic and reserve in the refrigerator overnight. Roll it to the same size as the croissant dough sheet after performing all the turns.</p><p className="eyebrow recipe-subhead">Glaze</p><ul className="viennoiserie-ingredient-list"><li><span>500 g</span> sugar</li><li><span>200 g</span> water</li><li><span>150 g</span> glucose</li></ul><p>Place everything in a pot and bring to a boil.</p><p className="eyebrow recipe-subhead">Lamination</p><p>Laminate the croissant dough as for the Plain croissant and proceed as for the rest of the bicolor viennoiserie. To do this, place the cocoa dough on top of the croissant dough. Laminate to a thickness of 3 mm leaving the cocoa part underneath. Cut strips of bicolor dough of 8x16 cm. Make a few shallow diagonal cuts on the bottom of the strip, turn the cocoa side. Turn the strip so that the cocoa side is facing down, place a chocolate baton at one end and start rolling up. Place a second baton and finish rolling up the strip to form the pain au chocolat (see step-by-step photographs). Spray a sheet pan with non-stick spray, line with parchment paper. Place the pieces on the sheet pan and leave to proof at 28°C for 2 hours.</p></div></details>
        </section>

        <section id="variations" className="viennoiserie-photo-section">
          <div className="viennoiserie-photo-heading"><div><p className="eyebrow">Variations</p><h2>Croissant variations</h2></div><p>Three variations from the same laminated pastry family.</p></div>
          <div className="viennoiserie-variation-list">
            {variations.map((variation) => (
              <article className={`viennoiserie-variation ${variation.files.length === 1 ? "is-single-image" : ""}`} key={variation.title}>
                <div className="viennoiserie-variation-copy"><p className="eyebrow">{variation.eyebrow}</p><h3>{variation.title}</h3><p>{variation.files.length} {variation.files.length === 1 ? "image" : "images"}</p></div>
                <div className="viennoiserie-variation-grid">{variation.files.map((file, index) => <figure key={file}><Photo file={file} alt={`${variation.title}, image ${index + 1}`} /></figure>)}</div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </>
  );
}
