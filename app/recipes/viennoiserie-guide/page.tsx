import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HistoryBackButton } from "@/components/history-back-button";
import { PageIntro } from "@/components/page-intro";
import { SectionRail } from "@/components/section-rail";
import { ViennoiserieScaler, type ViennoiserieScaleGroup } from "@/components/viennoiserie-scaler";

export const metadata: Metadata = {
  title: "Viennoiserie guide",
  description: "A visual guide to croissants, pain au chocolat, and savoury laminated pastries.",
};

const sections = [
  { id: "croissants", label: "Croissants" },
  { id: "recipe", label: "Recipe" },
  { id: "variations", label: "Croissant variations" },
  { id: "old-man-teh-workflow", label: "Old Man Teh workflow" },
  { id: "artisan-crust-croissant", label: "Artisan Crust recipe" },
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

const bachourCroissantFormula = [
  {
    title: "Croissant dough",
    items: [
      { amount: 375, unit: "g", ingredient: "bread flour T65" },
      { amount: 375, unit: "g", ingredient: "all-purpose flour T55" },
      { amount: 112, unit: "g", ingredient: "granulated sugar" },
      { amount: 12, unit: "g", ingredient: "salt" },
      { amount: 375, unit: "g", ingredient: "whole milk" },
      { amount: 50, unit: "g", ingredient: "unsalted butter, chilled" },
      { amount: 35, unit: "g", ingredient: "fresh yeast" },
      { fixedAmount: "as needed", ingredient: "non-stick spray" },
    ],
  },
  {
    title: "Butter block",
    items: [{ amount: 500, unit: "g", ingredient: "unsalted butter, chilled" }],
  },
  {
    title: "Egg wash",
    items: [
      { amount: 100, unit: "g", ingredient: "whole eggs" },
      { amount: 100, unit: "g", ingredient: "egg yolks" },
      { amount: 100, unit: "g", ingredient: "milk" },
    ],
  },
] satisfies readonly ViennoiserieScaleGroup[];

const bachourCocoaFormula = [
  {
    title: "Cocoa détrempe",
    items: [
      { amount: 75, unit: "g", ingredient: "bread flour" },
      { amount: 75, unit: "g", ingredient: "all-purpose flour" },
      { amount: 22, unit: "g", ingredient: "sugar" },
      { amount: 2.2, unit: "g", ingredient: "salt" },
      { amount: 75, unit: "g", ingredient: "whole milk" },
      { amount: 50, unit: "g", ingredient: "water" },
      { amount: 10, unit: "g", ingredient: "unsalted butter, chilled" },
      { amount: 7, unit: "g", ingredient: "fresh yeast" },
      { amount: 20, unit: "g", ingredient: "cocoa powder" },
    ],
  },
  {
    title: "Glaze",
    items: [
      { amount: 500, unit: "g", ingredient: "sugar" },
      { amount: 200, unit: "g", ingredient: "water" },
      { amount: 150, unit: "g", ingredient: "glucose" },
    ],
  },
  {
    title: "To finish",
    items: [{ fixedAmount: "as needed", ingredient: "chocolate batons" }],
  },
] satisfies readonly ViennoiserieScaleGroup[];

const oldManTehFormula = [
  {
    title: "Dough",
    items: [
      { amount: 362, unit: "g", ingredient: "bread flour" },
      { amount: 14, unit: "g", ingredient: "fresh yeast" },
      { amount: 36, unit: "g", ingredient: "sugar" },
      { amount: 7, unit: "g", ingredient: "salt" },
      { amount: 14, unit: "g", ingredient: "milk powder" },
      { amount: 152, unit: "g", ingredient: "crushed ice" },
      { amount: 54, unit: "g", ingredient: "unsalted butter" },
    ],
  },
  {
    title: "Lamination",
    items: [{ amount: 180, unit: "g", ingredient: "lamination butter, approximately" }],
  },
] satisfies readonly ViennoiserieScaleGroup[];

const artisanCrustFormula = [
  {
    title: "Dough",
    items: [
      { amount: 542, unit: "g", ingredient: "baker’s flour · 100%" },
      { amount: 54, unit: "g", ingredient: "sugar · 10%" },
      { amount: 11, unit: "g", ingredient: "salt · 2%" },
      { amount: 6, unit: "g", ingredient: "dried yeast · 1.2%" },
      { amount: 0.43, unit: "g", ingredient: "deactivated yeast · 0.08% (a very small pinch at 1×)" },
      { amount: 22, unit: "g", ingredient: "butter · 4%" },
      { amount: 168, unit: "g", ingredient: "water · 31%" },
      { amount: 125, unit: "g", ingredient: "milk · 23%" },
      { amount: 106, unit: "g", ingredient: "scrap croissant or Danish dough · 10% of total dough" },
    ],
  },
  {
    title: "Lamination",
    items: [{ amount: 264, unit: "g", ingredient: "roll-in butter · 25% of total dough" }],
  },
  {
    title: "To finish",
    items: [{ fixedAmount: "as needed", ingredient: "egg, milk and salt glaze" }],
  },
] satisfies readonly ViennoiserieScaleGroup[];

function Photo({ file, alt }: { file: string; alt: string }) {
  const parts = file.split("/");
  const encodedFile = parts.map((part) => encodeURIComponent(part)).join("/");
  const fullSrc = `/recipes/viennoiserie/${encodedFile}`;
  const thumbSrc = parts[0] === "recipe-steps"
    ? `/recipes/viennoiserie/recipe-steps/thumbs-v2-${encodeURIComponent(parts[1])}`
    : `/recipes/viennoiserie/thumbs/${encodeURIComponent(parts[0])}`;
  const viewerHref = `/recipes/viennoiserie-guide/image?src=${encodeURIComponent(fullSrc)}&alt=${encodeURIComponent(alt)}`;
  return <Link className="viennoiserie-photo-link" href={viewerHref} aria-label={`Open full-size image: ${alt}`}><Image src={thumbSrc} alt={alt} width={900} height={1200} quality={75} sizes="(max-width: 640px) 92vw, (max-width: 1000px) 45vw, 30vw" /></Link>;
}

function OldManTehSourcePage({ page, alt }: { page: number; alt: string }) {
  const src = `/recipes/viennoiserie/old-man-teh/page-${page}.png`;
  const viewerHref = `/recipes/viennoiserie-guide/image?src=${encodeURIComponent(src)}&alt=${encodeURIComponent(alt)}`;

  return (
    <figure>
      <Link className="viennoiserie-photo-link" href={viewerHref} aria-label={`Open full-size source page ${page}`}>
        <Image src={src} alt={alt} width={1240} height={1754} quality={75} sizes="(max-width: 640px) 88vw, (max-width: 1000px) 44vw, 24vw" />
      </Link>
      <figcaption>Source page {page}</figcaption>
    </figure>
  );
}

export default function ViennoiserieGuidePage() {
  return (
    <div className="guide-page">
      <PageIntro
        eyebrow="Guide · laminated dough"
        title="Viennoiserie guide"
        description="A photo-first record of the laminated pastries coming out of the kitchen: croissants first, followed by a few sweet and savoury variations."
      />
      <SectionRail ariaLabel="Viennoiserie guide sections" sections={sections} />

      <section className="page-section pt-12 sm:pt-16">
        <HistoryBackButton className="mb-4" fallbackHref="/recipes">← Back to recipes</HistoryBackButton>

        <section id="croissants" className="viennoiserie-croissants-section viennoiserie-photo-section">
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
          <ViennoiserieScaler
            id="bachour-plain-croissant"
            baseValue={15}
            inputLabel="Target yield"
            inputUnit="croissants"
            groups={bachourCroissantFormula}
            note="This scales the dough, butter block and egg wash together. Sheet dimensions and individual pastry size must be adjusted when the batch changes."
            max={200}
          />

          <div className="viennoiserie-recipe-layout">
            <div className="viennoiserie-recipe-main">
              <div className="viennoiserie-recipe-card">
                <p className="eyebrow">Croissant dough</p>
                <p>In a mixer fitted with the hook attachment, combine the flours, sugar, salt, milk and butter and mix on low speed. After 1 minute, add the yeast and continue to mix on low speed for an additional 7 minutes. Scrape down the sides of the bowl and mix for 8 more minutes on second speed. Pick the dough (a handful) between the hands and stretch. If it does not break and creates a thin elastic dough, it is perfect.</p>
                <p>Prepare a large bowl with non-stick spray. Knead the dough, place it in the bowl, cover with plastic wrap and leave it to rest for 30 minutes at room temperature. Stretch the dough to 50x35 cm and reserve in the freezer overnight.</p>
              </div>

              <div className="viennoiserie-recipe-card">
                <p className="eyebrow">Butter block</p>
                <p>Place a piece of parchment paper on the work surface. Center the butter on the paper. Top with another sheet of parchment paper and pound the top of the butter from the left to right with the help of a rolling pin to begin to flatten it. Continue to flatten the butter until you a rectangular shape of 30x35cm is obtained. Wrap and refrigerate.</p>
              </div>

              <div className="viennoiserie-recipe-card">
                <p className="eyebrow">Egg wash</p>
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

          <details className="viennoiserie-variation-recipe">
            <summary>Cocoa détrempe &amp; pain au chocolat</summary>
            <div className="viennoiserie-variation-recipe-body">
              <ViennoiserieScaler
                id="bachour-cocoa-detrempe"
                baseValue={1}
                inputLabel="Batch multiplier"
                inputUnit="batch"
                groups={bachourCocoaFormula}
                note="The cocoa sheet is paired with the plain croissant dough after its turns. Scale both formulas by the same multiplier."
                step={0.25}
                max={10}
              />
              <div className="viennoiserie-recipe-card">
                <p className="eyebrow">Cocoa détrempe</p>
                <p>In a mixer fitted with the hook attachment, combine the flours, sugar, salt, milk, water, cocoa powder and butter and mix on low speed. After 1 minute, add the yeast and continue to mix on low speed for an additional 7 minutes. Scrape down the sides of the bowl and mix for 7 more minutes on second speed. Pick the dough (a handful) between the hands and stretch. If it does not break and creates a thin elastic dough, it is perfect. Roll the dough in a square shape, wrap in plastic and reserve in the refrigerator overnight. Roll it to the same size as the croissant dough sheet after performing all the turns.</p>
                <p className="eyebrow recipe-subhead">Glaze</p>
                <p>Place the sugar, water and glucose in a pot and bring to a boil.</p>
                <p className="eyebrow recipe-subhead">Lamination</p>
                <p>Laminate the croissant dough as for the plain croissant and proceed as for the rest of the bicolour viennoiserie. Place the cocoa dough on top of the croissant dough and laminate to 3 mm thick, leaving the cocoa side underneath. Cut 8 × 16 cm strips. Make a few shallow diagonal cuts on the underside of each strip, then turn the cocoa side down. Place a chocolate baton at one end and start rolling. Add a second baton and finish rolling to form the pain au chocolat. Place the pieces on a parchment-lined, lightly sprayed sheet pan and proof at 28°C for 2 hours.</p>
              </div>
            </div>
          </details>
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

        <section id="old-man-teh-workflow" className="viennoiserie-recipe-section old-man-teh-workflow">
          <div className="viennoiserie-photo-heading">
            <div><p className="eyebrow">Reference workflow</p><h2>Old Man Teh’s hand-rolled croissant</h2></div>
            <p>A compact, hand-rolling workflow from mixing through baking.</p>
          </div>

          <aside className="viennoiserie-source-note">
            <p>This formula and workflow are by <strong>Old Man Teh</strong>, transcribed from <cite>OldmanTeh’s Croissant Workflow</cite>. The wording has been lightly arranged for the website while preserving the quantities, dimensions, temperatures and timings in the supplied document.</p>
          </aside>

          <div className="old-man-teh-overview">
            <ViennoiserieScaler
              id="old-man-teh-croissant"
              baseValue={650}
              inputLabel="Target dough"
              inputUnit="g"
              groups={oldManTehFormula}
              note="The source describes an approximately 650 g dough. Lamination butter is 27–30% of dough weight; the listed 180 g is the source’s working amount."
              max={10000}
            />

            <div className="old-man-teh-parameters">
              <div><span>Mixing speed</span><strong>Slow → medium</strong></div>
              <div><span>Mixing time</span><strong>18–22 min</strong></div>
              <div><span>Dough block</span><strong>34 × 20 cm</strong></div>
              <div><span>Butter block</span><strong>17 × 20 cm</strong></div>
              <div><span>Final sheet</span><strong>4 mm</strong></div>
              <div><span>Triangle width</span><strong>9 cm</strong></div>
            </div>
          </div>

          <p className="old-man-teh-source-caveat"><strong>Temperature note:</strong> the source’s parameter box gives a final mixing temperature of 26–28°C, while Step II asks for 24–26°C. Both are retained here so the discrepancy remains visible.</p>

          <div className="old-man-teh-phase-grid">
            <article className="viennoiserie-recipe-card">
              <p className="eyebrow">Steps I–II · Mix and rest</p>
              <ol className="old-man-teh-steps" start={1}>
                <li>Add the crushed ice first, followed by all the dry ingredients. Mix on slow speed for 3 minutes. Add the fresh yeast; after 30 seconds, incorporate the unsalted butter. Change to second speed and mix for 18–22 minutes.</li>
                <li>Check that the mixed dough is 24–26°C, then shape it into a ball. Rest for 60 minutes at room temperature, at 26–28°C. Shape into a 34 × 20 cm square and rest in the freezer for 60–90 minutes. The dough can be kept frozen for up to 3 days.</li>
              </ol>
            </article>

            <article className="viennoiserie-recipe-card">
              <p className="eyebrow">Steps III–IV · Lock-in and double fold</p>
              <ol className="old-man-teh-steps" start={3}>
                <li>Place the 17 × 20 cm butter block in the middle of the dough. Cut both sides of the dough and place them over the butter. Press gently across the surface with a rolling pin, pinch the sides to seal, then roll to 75 cm long × 18 cm wide.</li>
                <li>Perform a double fold, also called a book fold. Cut the sides to release tension. With the open end facing you, roll to 45 cm or longer, then rest in the freezer for 10–15 minutes.</li>
              </ol>
            </article>

            <article className="viennoiserie-recipe-card">
              <p className="eyebrow">Steps V–VI · Roll and single fold</p>
              <ol className="old-man-teh-steps" start={5}>
                <li>Roll the 45 cm dough to 80 cm long. Wrap and transfer it to the freezer for 10–15 minutes. Remove it and continue rolling in the same direction until it reaches 80 cm.</li>
                <li>Perform a single fold, also called a letter fold. Rotate the dough so the open end faces you. Roll to 45–48 cm long and at least 35 cm wide, with a final thickness of 4 mm. Rest in the freezer for 30–40 minutes.</li>
              </ol>
            </article>

            <article className="viennoiserie-recipe-card">
              <p className="eyebrow">Steps VII–IX · Divide, proof and bake</p>
              <ol className="old-man-teh-steps" start={7}>
                <li>Trim approximately 1 cm from each closed end to expose the layers. Mark 9 cm widths, then trace the midpoint on the opposite side to create alternating triangles. Cut the triangles and shape the croissants.</li>
                <li>Proof for at least 2 hours at 27–28°C. Apply the first egg wash 1 hour into proofing and the second egg wash 10 minutes before baking.</li>
                <li>Bake at 165–175°C for 18–22 minutes.</li>
              </ol>
            </article>
          </div>

          <details className="old-man-teh-source-pages">
            <summary>View the exact source pages</summary>
            <div className="old-man-teh-source-grid">
              <OldManTehSourcePage page={2} alt="Old Man Teh croissant ingredients, mixing and first resting steps" />
              <OldManTehSourcePage page={3} alt="Old Man Teh croissant lock-in and double-fold diagrams" />
              <OldManTehSourcePage page={4} alt="Old Man Teh croissant rolling and single-fold diagrams" />
              <OldManTehSourcePage page={5} alt="Old Man Teh croissant dividing, proofing and baking page" />
            </div>
          </details>
        </section>

        <section id="artisan-crust-croissant" className="viennoiserie-recipe-section artisan-crust-recipe">
          <div className="viennoiserie-photo-heading">
            <div><p className="eyebrow">Croissant formula</p><h2>Scott Megee’s croissant and Danish dough</h2></div>
            <p>A scrap-dough formula with one book fold, two single folds and an overnight bulk rest.</p>
          </div>

          <aside className="viennoiserie-source-note">
            <p>
              This formula is credited in the supplied recipe sheet to <strong>Scott Megee of Artisan Crust</strong>. Quantities, percentages, temperatures and timings are reproduced from that sheet.
              {" "}<a href="https://www.theartisancrust.com" rel="noreferrer" target="_blank">Visit the Artisan Crust website ↗</a>
            </p>
          </aside>

          <ViennoiserieScaler
            id="artisan-crust-croissant"
            baseValue={1056}
            inputLabel="Target dough"
            inputUnit="g"
            groups={artisanCrustFormula}
            note="The printed base formula makes 1.056 kg dough, with 264 g roll-in butter for a 1.32 kg laminated batch. The source rounds its ingredient lines, so their displayed sum does not exactly equal the printed total."
            max={10000}
          />

          <p className="old-man-teh-source-caveat">
            <strong>What is scrap dough?</strong> It is unbaked croissant or Danish dough left from trimming and shaping an earlier batch. The offcuts are saved and mixed into the next dough, reducing waste while bringing some already-developed gluten and flavour. Because laminated offcuts can also contain butter, this is not simply extra flour-and-water dough. Scott’s sheet calls for 106 g, or 10% of the printed total dough, but does not specify its age or give a substitute for a first batch.
          </p>

          <article className="viennoiserie-recipe-card artisan-crust-method">
            <p className="eyebrow">Method</p>
            <ol className="old-man-teh-steps">
              <li>Mix for 5 minutes on first speed, followed by 3 minutes on second speed.</li>
              <li>Roll the dough to 12 mm thick, then refrigerate for 16–24 hours.</li>
              <li>Lock in the scaled roll-in butter. Perform one book fold followed by two single folds, resting the dough for at least 15 minutes between every fold.</li>
              <li>Roll to 4 mm thick. Rest on the bench for 10 minutes so the sheet can relax, then cut it into the desired shapes.</li>
              <li>Proof for 2–3 hours at 26°C and 70% relative humidity. Glaze with a mixture of egg, milk and salt.</li>
              <li>Bake in a fan-forced oven at 180°C with 2 seconds of steam for 16 minutes.</li>
            </ol>
          </article>
        </section>
      </section>
    </div>
  );
}
