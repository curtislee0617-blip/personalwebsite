import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import {
  WineCellarReception,
  WineEditorialPhoto,
  WineExtractionAtlas,
  WineFaultAtlas,
  WineFinishingAndPackaging,
  WineFortificationPrimer,
  WineHazardsAndHarvest,
  WineLabelAndService,
  WineSparklingWorld,
  WineVineCycle,
  WineVineyardPracticeAtlas,
} from "@/components/wine-book-expansion";
import { WineGrapeAtlas } from "@/components/wine-grape-atlas";
import { WineRegionExplorer } from "@/components/wine-region-explorer";
import { wineCountryCount, wineRegionCount, wineSubregionCount } from "@/data/wine-guide-data";
import { wineGrapeCount } from "@/data/wine-grape-data";

const paragraphClass = "wine-copy";

const wineContents = [
  {
    href: "#wine-what",
    title: "What wine is",
    sections: [
      { href: "#wine-composition", label: "Composition & structure" },
      { href: "#wine-grape-anatomy", label: "Inside the grape" },
    ],
  },
  {
    href: "#wine-growing",
    title: "How grapes are grown",
    sections: [
      { href: "#wine-vine-cycle", label: "The vine’s year" },
      { href: "#wine-vineyard", label: "Climate & ripening" },
      { href: "#wine-vineyard-practice", label: "Planting & field work" },
      { href: "#wine-hazards-harvest", label: "Hazards & harvest" },
      { href: "#wine-regions", label: "World region map" },
    ],
  },
  {
    href: "#wine-grapes",
    title: "Grape varieties",
    sections: [
      { href: "#wine-grape-atlas", label: "Varietal atlas" },
      { href: "#wine-grape-language", label: "Names & families" },
    ],
  },
  {
    href: "#wine-making",
    title: "How wine is made",
    sections: [
      { href: "#wine-cellar-reception", label: "From fruit to must" },
      { href: "#wine-fermentation", label: "Fermentation" },
      { href: "#wine-cellar-paths", label: "Red, white, rosé & orange" },
      { href: "#wine-cellar-tools", label: "Lees, oxygen & oak" },
      { href: "#wine-finishing", label: "Finishing & packaging" },
    ],
  },
  {
    href: "#wine-types",
    title: "Types of wine",
    sections: [
      { href: "#wine-style-atlas", label: "Style atlas" },
      { href: "#wine-sweetness", label: "How sweet wine is made" },
    ],
  },
  {
    href: "#wine-sparkling",
    title: "Sparkling wine",
    sections: [
      { href: "#wine-sparkling-methods", label: "Six ways to trap CO₂" },
      { href: "#wine-champagne-process", label: "Traditional method" },
      { href: "#wine-sparkling-world", label: "World sparkling atlas" },
    ],
  },
  {
    href: "#wine-fortified",
    title: "Fortified wine",
    sections: [
      { href: "#wine-fortification-primer", label: "The fortification switches" },
      { href: "#wine-sherry", label: "Sherry" },
      { href: "#wine-port", label: "Port" },
      { href: "#wine-madeira", label: "Madeira & other families" },
    ],
  },
  {
    href: "#wine-tasting",
    title: "Reading a glass",
    sections: [
      { href: "#wine-tasting-method", label: "A tasting sequence" },
      { href: "#wine-faults", label: "Faults & harmless deposits" },
      { href: "#wine-label-service", label: "Labels, ageing & service" },
      { href: "#wine-sources", label: "Book trail" },
    ],
  },
] as const;

function GuideChapter({
  children,
  description,
  eyebrow,
  id,
  title,
}: {
  children: ReactNode;
  description: string;
  eyebrow: string;
  id: string;
  title: string;
}) {
  return (
    <section aria-labelledby={`${id}-title`} className="wine-guide-chapter scroll-mt-28" id={id}>
      <header className="wine-guide-chapter-header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={`${id}-title`}>{title}</h2>
        </div>
        <p>{description}</p>
      </header>
      <div className="wine-guide-chapter-sections">{children}</div>
    </section>
  );
}

function WineSection({
  children,
  eyebrow,
  id,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  id: string;
  title: string;
}) {
  return (
    <section aria-labelledby={`${id}-title`} className="wine-section scroll-mt-28" id={id}>
      <header>
        <p className="eyebrow">{eyebrow}</p>
        <h3 id={`${id}-title`}>{title}</h3>
      </header>
      <div className="wine-section-body">{children}</div>
    </section>
  );
}

function CopyBlock({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="wine-copy-block">
      {title ? <h4>{title}</h4> : null}
      <div>{children}</div>
    </div>
  );
}

function EssayIntro({ children }: { children: ReactNode }) {
  return <div className="wine-essay-intro">{children}</div>;
}

function WineGuideContents() {
  const sectionCount = wineContents.reduce((count, chapter) => count + chapter.sections.length, 0);

  return (
    <nav aria-labelledby="wine-guide-contents-title" className="wine-guide-contents">
      <details>
        <summary>
          <span className="wine-guide-index-kicker">Guide index</span>
          <strong id="wine-guide-contents-title">Contents</strong>
          <span className="wine-guide-index-meta">
            {wineContents.length} chapters · {sectionCount} topics
          </span>
          <span aria-hidden="true" className="wine-guide-index-toggle" />
        </summary>
        <div className="wine-guide-index-panel">
          <ol>
            {wineContents.map((chapter, chapterIndex) => (
              <li key={chapter.href}>
                <a className="wine-guide-contents-chapter" href={chapter.href}>
                  <span>{String(chapterIndex + 1).padStart(2, "0")}</span>
                  <strong>{chapter.title}</strong>
                </a>
                <div>
                  {chapter.sections.map((section) => (
                    <a href={section.href} key={section.href}>{section.label}</a>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </details>
    </nav>
  );
}

function GrapeAnatomy() {
  return (
    <figure className="wine-grape-anatomy">
      <Image
        alt="Macro photograph of a red grape cut lengthwise, showing its thin red skin, translucent pale pulp, vascular strands, stem and two seeds."
        className="wine-grape-anatomy-photo"
        height={1581}
        sizes="(max-width: 768px) 100vw, 56rem"
        src="/recipes/wine-guide/grape-cross-section.jpg"
        width={1920}
      />
      <figcaption>
        <span>
          A red grape in longitudinal section: the dark skin forms a thin perimeter around pale pulp, with seeds and
          the berry&apos;s vascular strands visible inside.
        </span>
        <span className="wine-grape-photo-credit">
          Photograph by V. Boldychev via{" "}
          <a href="https://commons.wikimedia.org/wiki/File:Rote_Weinbeere_im_L%C3%A4ngsschnitt.jpg">
            Wikimedia Commons
          </a>
          , licensed{" "}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. Resized; no other changes.
        </span>
      </figcaption>
    </figure>
  );
}

const composition = [
  { value: "≈85%", label: "water", note: "The solvent carrying every dissolved acid, salt, sugar, alcohol and aroma precursor." },
  { value: "9–16%", label: "ethanol", note: "Adds warmth, body and volatility; it changes how both sweetness and bitterness are perceived." },
  { value: "pH 3–4", label: "acidity", note: "Mostly tartaric and malic before malolactic conversion. pH and total acid describe different things." },
  { value: "0–200+ g/L", label: "residual sugar", note: "Dry wine can contain a little sugar; sweet wine depends on the balance between sugar, acid, alcohol and bitterness." },
] as const;

const vineyardFactors = [
  {
    title: "Temperature",
    text: "Heat controls the speed of photosynthesis, respiration and ripening. Too little and tannins or flavours stay green; too much and sugar runs ahead while acid disappears.",
  },
  {
    title: "Light",
    text: "Leaves need light, while grapes can sunburn. Canopy position changes berry temperature and the development of colour, aroma precursors and methoxypyrazines.",
  },
  {
    title: "Water",
    text: "A vine needs water to move nutrients and keep stomata open. Moderate deficit can restrict berry size and shoot growth; severe stress shuts photosynthesis down.",
  },
  {
    title: "Soil",
    text: "Texture, depth, drainage, water-holding capacity and rooting space matter more directly than a rock’s romantic name. Geology shapes the root environment; minerals do not travel into wine as a flavour seasoning.",
  },
  {
    title: "Slope & aspect",
    text: "Incline changes drainage, erosion and mechanisation. Aspect alters sunlight and wind, while cold air can pool on a valley floor and turn one spring night into a frost map.",
  },
  {
    title: "Canopy & crop",
    text: "Pruning fixes the starting bud count. Shoot positioning, trimming, leaf removal and crop thinning then balance leaves, shade, disease pressure and the amount of fruit each vine must ripen.",
  },
] as const;

const cellarPaths = [
  {
    type: "White",
    colour: "white",
    steps: ["crush or whole-bunch press", "separate juice from skins", "settle or clarify", "ferment", "lees / MLF / oak choices", "stabilise and bottle"],
    note: "Removing skins early limits tannin and colour. Cool 12–16°C ferments often retain more fruit-driven ester aroma.",
    image: {
      src: "/recipes/wine-guide/winemaking/paths/white.jpg",
      alt: "Freshly pressed white grapes and juice at a Santorini winery.",
      credit: "Klearchos Kapoutsis",
      source: "https://commons.wikimedia.org/wiki/File:White_wine_grape_pressing_in_Santorini.jpg",
      license: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
      position: "50% 52%",
    },
  },
  {
    type: "Red",
    colour: "red",
    steps: ["destem / crush or keep whole bunches", "ferment with skins", "manage the cap", "drain and press", "usually complete MLF", "mature and bottle"],
    note: "Alcohol, heat and cap movement extract anthocyanins, tannins and flavour. Time is not automatically quality: seeds and stems can also contribute harshness.",
    image: {
      src: "/recipes/wine-guide/winemaking/paths/red.jpg",
      alt: "A winery worker punching down the floating cap of red grape skins during fermentation.",
      credit: "Ian Brown",
      source: "https://commons.wikimedia.org/wiki/File:Fermentation_tank_and_cap_management_Smith-Madrone.jpg",
      license: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
      position: "50% 42%",
    },
  },
  {
    type: "Rosé",
    colour: "rose",
    steps: ["direct press or short maceration", "separate pale juice", "cool fermentation", "protect from oxygen", "brief ageing", "bottle"],
    note: "Pale colour can come from gentle direct pressing; deeper rosé uses more skin time. Saignée bleeds juice from a red ferment but changes that red wine too.",
    image: {
      src: "/recipes/wine-guide/winemaking/paths/rose.jpg",
      alt: "Pale pink rosé juice actively fermenting in a winery vessel.",
      credit: "Olivier Lemoine / Photo-Terroir.fr",
      source: "https://commons.wikimedia.org/wiki/File:Fermentation_vin_ros%C3%A9.jpg",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      position: "50% 50%",
    },
  },
  {
    type: "Orange / amber",
    colour: "amber",
    steps: ["use white grapes", "ferment with skins", "extract phenolics", "press later", "age with chosen oxygen", "bottle"],
    note: "This is a production method, not orange flavouring. White skins add tannin, colour, tea-like aromas and a very different texture.",
    image: {
      src: "/recipes/wine-guide/winemaking/paths/orange-amber.jpg",
      alt: "A row of amphorae used for skin-contact winemaking in a Sicilian cellar.",
      credit: "Olivier Lemoine / Photo-Terroir.fr",
      source: "https://commons.wikimedia.org/wiki/File:Amphores_Frank_Cornelissen.jpg",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      position: "50% 52%",
    },
  },
] as const;

const cellarTools = [
  {
    title: "Lees",
    text: "Dead yeast can release mannoproteins and other compounds that soften texture, bind aroma and improve foam. Stirring speeds contact but also introduces oxygen and labour.",
    image: {
      src: "/recipes/wine-guide/winemaking/tools/lees.jpg",
      alt: "Dense Merlot lees left behind after fermentation.",
      credit: "Agne27",
      source: "https://commons.wikimedia.org/wiki/File:Merlot_wine_lees_after_fermentation.JPG",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
      position: "50% 50%",
    },
  },
  {
    title: "Oxygen",
    text: "Too much browns and flattens fruit; controlled exposure polymerises tannins, develops nuts and dried fruit, and helps some reductive compounds dissipate.",
    image: {
      src: "/recipes/wine-guide/winemaking/tools/oxygen-racking.jpg",
      alt: "A transparent racking wand used to transfer wine while monitoring sediment.",
      credit: "Agne27",
      source: "https://commons.wikimedia.org/wiki/File:Close_up_of_viewer_and_racking_wand_apparatus.JPG",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
      position: "50% 48%",
    },
  },
  {
    title: "Oak",
    text: "New, small barrels give the most flavour and oxygen per litre. American oak generally carries more coconut-like oak lactone and a stronger flavour impact; European oak is often subtler and can contribute more tannin. Grain tightness varies with tree growth and origin, so “European” does not itself mean “tight-grained.” Toast level changes smoke, spice and vanillin.",
    image: {
      src: "/recipes/wine-guide/winemaking/tools/oak-barrels.jpg",
      alt: "Rows of oak barrels holding wine for maturation in a cellar.",
      credit: "Pradeep717",
      source: "https://commons.wikimedia.org/wiki/File:Wine_in_oak_barrels.jpg",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      position: "50% 55%",
    },
  },
  {
    title: "Concrete & amphora",
    text: "Concrete buffers temperature and can admit slow oxygen without adding wood aroma. Clay vessels range from porous to lined, so “amphora” alone does not tell me how oxidative the wine was.",
    image: {
      src: "/recipes/wine-guide/winemaking/tools/concrete-egg.jpg",
      alt: "An egg-shaped concrete wine vessel inside a Bordeaux cellar.",
      credit: "Jefunky",
      source: "https://commons.wikimedia.org/wiki/File:Cuve_oeuf_b%C3%A9ton_au_ch%C3%A2teau_de_Reignac_(Gironde),_janvier_2024.jpg",
      license: "CC0 1.0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      position: "50% 48%",
    },
  },
  {
    title: "Stainless steel",
    text: "Inert, cleanable and easy to cool. It is ideal when the aim is fruit protection, but the headspace still has to be managed.",
    image: {
      src: "/recipes/wine-guide/winemaking/tools/stainless-tanks.jpg",
      alt: "Temperature-controlled stainless-steel wine tanks in a cellar.",
      credit: "Cjp24",
      source: "https://commons.wikimedia.org/wiki/File:Stainless_steel_vinification_tanks.jpg",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      position: "50% 50%",
    },
  },
  {
    title: "Blending",
    text: "A blend can combine grapes, plots, vessels or years. It may build complexity, correct balance, preserve house style or create the exact volume and price a producer needs.",
    image: {
      src: "/recipes/wine-guide/winemaking/tools/blending.jpg",
      alt: "A group of tasting glasses prepared for comparing wines and trial blends.",
      credit: "Véronique Pagnier",
      source: "https://commons.wikimedia.org/wiki/File:Verres_d%C3%A9gustations.JPG",
      license: "Public domain",
      licenseUrl: "https://commons.wikimedia.org/wiki/Template:PD-self",
      position: "50% 50%",
    },
  },
] as const;

const wineStyles = [
  { name: "Light dry white", examples: "Muscadet · Vinho Verde · Pinot Grigio", structure: "high acid · little tannin · light body", making: "early pressing, cool protected fermentation, little new oak" },
  { name: "Aromatic dry white", examples: "Riesling · Sauvignon Blanc · Albariño", structure: "high aroma · medium to high acid", making: "skin contact may be brief; cool fermentation protects volatile aroma" },
  { name: "Full dry white", examples: "White Burgundy · Rhône white · Fiano", structure: "medium to full body · texture from lees / oak / MLF", making: "riper fruit, solids, lees stirring, barrels or malolactic conversion can build width" },
  { name: "Light red", examples: "Gamay · Schiava · cool Pinot Noir", structure: "high acid · low tannin · pale colour", making: "shorter extraction, whole berries or carbonic methods can foreground perfume" },
  { name: "Medium red", examples: "Sangiovese · Tempranillo · Cabernet Franc", structure: "acid and tannin in balance", making: "skin extraction, oxygen and maturation are adjusted to fruit and site" },
  { name: "Full red", examples: "Cabernet Sauvignon · Syrah · Aglianico", structure: "deep colour · high tannin · fuller alcohol/body", making: "ripe thick-skinned fruit and sustained extraction; ageing softens and integrates" },
  { name: "Rosé", examples: "Provence · Tavel · Cerasuolo d’Abruzzo", structure: "light tannin · red-fruit spectrum · dry to sweet", making: "direct press, short maceration, saignée or—in limited contexts—blending" },
  { name: "Orange / amber", examples: "Friuli · Georgia · experimental cellars worldwide", structure: "white-wine acid plus skin tannin", making: "white grapes fermented or aged on skins, sometimes with deliberate oxygen" },
  { name: "Sweet", examples: "Sauternes · Tokaji Aszú · passito · icewine", structure: "residual sugar must be balanced by acid, bitterness or alcohol", making: "concentrate sugar before fermentation or stop fermentation before it is exhausted" },
  { name: "Sparkling", examples: "Champagne · Cava · Prosecco · Pét Nat", structure: "dissolved CO₂, pressure, acid and dosage", making: "capture fermentation gas in bottle or tank, or inject it directly" },
  { name: "Fortified", examples: "Sherry · Port · Madeira · VDN", structure: "15–22% alcohol; dry to intensely sweet", making: "add grape spirit before or after fermentation, then choose oxygen, heat, flor and ageing" },
] as const;

const sparklingMethods = [
  {
    name: "Traditional method",
    gas: "Second fermentation in the bottle sold",
    lees: "Bottle lees; riddled and disgorged",
    style: "High pressure; extended lees ageing can add bread / biscuit complexity",
    examples: "Champagne, Cava, Franciacorta, Trentodoc, Cap Classique, English sparkling",
  },
  {
    name: "Transfer method",
    gas: "Second fermentation in bottle, then pooled under pressure",
    lees: "Lees ageing can occur, but no individual riddling",
    style: "Traditional-method character with easier handling of unusual bottle sizes",
    examples: "Some New World sparkling wines",
  },
  {
    name: "Tank / Charmat",
    gas: "Second fermentation in a sealed pressure tank",
    lees: "Usually brief; filtered under pressure",
    style: "Fresh primary fruit and flowers, made efficiently at scale",
    examples: "Prosecco, much Lambrusco, many aromatic sparklers",
  },
  {
    name: "Asti method",
    gas: "One fermentation of chilled sweet must, closed part-way",
    lees: "No long secondary lees ageing",
    style: "Low alcohol, sweet, grapey and intensely aromatic",
    examples: "Asti",
  },
  {
    name: "Ancestral / Pét Nat",
    gas: "Part-fermented wine finishes in bottle",
    lees: "Often remains cloudy; may or may not be disgorged",
    style: "Variable pressure, rustic sediment and direct fruit",
    examples: "Pétillant naturel, some historic regional wines",
  },
  {
    name: "Carbonation",
    gas: "Food-grade CO₂ is injected into finished wine",
    lees: "None",
    style: "Base-wine fruit stays intact, with no secondary-fermentation or lees-derived character; cheapest route",
    examples: "Inexpensive sparkling wine",
  },
] as const;

const traditionalSteps = [
  { title: "Base wine", text: "Pick just-ripe, high-acid fruit and press gently. Ferment separate grapes and parcels, usually to about 9–11% alcohol." },
  { title: "Blend", text: "Assemble varieties, villages, vintages and reserve wines to create the house shape before bubbles exist." },
  { title: "Tirage", text: "Add yeast, sugar and nutrients, then seal the bottle. Roughly 24 g/L sugar can add about 1.5% alcohol and around 6 bar pressure." },
  { title: "Second fermentation", text: "Over roughly four to six weeks, yeast converts the tirage sugar into alcohol and trapped CO₂." },
  { title: "Lees ageing", text: "Dead yeast settles in the bottle. Autolysis slowly releases compounds that change foam, texture and bread-like aroma." },
  { title: "Riddle", text: "Turn and tilt bottles by hand or gyropalette until the sediment collects in the neck." },
  { title: "Disgorge", text: "Freeze the neck, eject the lees plug under pressure and lose as little wine and gas as possible." },
  { title: "Dosage", text: "Top the bottle with wine and optional sugar. This final adjustment sets balance and the labelled sweetness category." },
] as const;

const dosageScale = [
  { name: "Brut Nature", value: "<3 g/L · no sugar added after secondary fermentation", width: "7%" },
  { name: "Extra Brut", value: "0–6", width: "10%" },
  { name: "Brut", value: "<12", width: "18%" },
  { name: "Extra Dry", value: "12–17", width: "25%" },
  { name: "Sec", value: "17–32", width: "42%" },
  { name: "Demi-Sec", value: "32–50", width: "67%" },
  { name: "Doux", value: ">50 g/L", width: "92%" },
] as const;

export function WineGuide() {
  return (
    <div className="wine-guide">
      <WineGuideContents />

      <GuideChapter
        description="Wine is fermented grape juice, but that short definition hides a moving mixture of water, ethanol, acids, sugar, phenolics and hundreds of volatile compounds."
        eyebrow="Fruit, chemistry and perception"
        id="wine-what"
        title="What wine is"
      >
        <WineSection eyebrow="The liquid itself" id="wine-composition" title="A solution that never really sits still">
          <div className="wine-two-column">
            <div>
              <CopyBlock>
                <p className={paragraphClass}>
                  We make wine by asking yeast to eat the sugar in ripe grapes. That sounds simple until the grape,
                  vineyard, microbes, oxygen, vessel and time all begin pulling the result in different directions.
                  Even after bottling, slow reactions keep changing aroma, colour and texture.
                </p>
                <p className={paragraphClass}>
                  Water is the bulk of the drink. Ethanol is more than the part that makes us tipsy: it changes body,
                  warmth, volatility and how sweetness or bitterness feels. Tartaric and malic acids give the young
                  wine its sharp frame. Lactic acid may replace some malic acid later, while acetic acid is useful in
                  tiny amounts and vinegary when it escapes control.
                </p>
              </CopyBlock>
              <CopyBlock title="pH is not the same as total acidity">
                <p className={paragraphClass}>
                  Total acidity tells us roughly how much titratable acid is present. pH tells us about hydrogen-ion
                  activity and therefore microbial stability, colour behaviour and how effective sulfur dioxide can
                  be. Two wines can taste similarly sharp while behaving very differently in the cellar.
                </p>
              </CopyBlock>
            </div>
            <div className="wine-composition-grid">
              {composition.map((item) => (
                <article key={item.label}>
                  <strong>{item.value}</strong>
                  <h4>{item.label}</h4>
                  <p>{item.note}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="wine-structure-ribbon">
            <span>sweetness</span><i />
            <span>acidity</span><i />
            <span>tannin</span><i />
            <span>alcohol</span><i />
            <span>body</span><i />
            <span>aroma</span>
            <p>Wine style is the balance between these sensations, not one flavour note.</p>
          </div>
        </WineSection>

        <WineSection eyebrow="Berry to must" id="wine-grape-anatomy" title="Inside one grape">
          <div className="wine-two-column is-anatomy">
            <GrapeAnatomy />
            <div>
              <CopyBlock title="The pulp supplies the ferment">
                <p className={paragraphClass}>
                  Pulp is mostly water, glucose, fructose and acids. Sugar rises through ripening as malic acid is
                  respired away. Tartaric acid is more stable, which is one reason it remains so important in finished
                  wine.
                </p>
              </CopyBlock>
              <CopyBlock title="The skin supplies much of the identity">
                <p className={paragraphClass}>
                  Anthocyanins colour black grapes. Tannins and other phenolics build bitterness, astringency and
                  ageing reactions. Terpenes, thiol precursors, methoxypyrazines and many other aroma precursors also
                  sit in or near the skin, so pressing and maceration are flavour decisions as much as colour decisions.
                </p>
              </CopyBlock>
              <CopyBlock title="Seeds and stems are powerful">
                <p className={paragraphClass}>
                  Seeds contain concentrated tannin and bitter compounds. Ripe stems can add perfume, freshness and
                  structure in whole-bunch fermentation; green stems can taste aggressively herbal. A winemaker is
                  constantly deciding not only what to extract, but what to leave behind.
                </p>
              </CopyBlock>
            </div>
          </div>
          <p className="wine-book-note">
            Book trail · <i>Wined4 / Wine Production</i>, grape composition, acidity, aroma compounds and wine
            structure chapters.
          </p>
        </WineSection>
      </GuideChapter>

      <GuideChapter
        description="A grape variety brings a genetic range of possibilities. Climate, slope, soil, water, canopy and crop load decide which part of that range reaches the winery."
        eyebrow="Vineyard and place"
        id="wine-growing"
        title="How wine grapes are grown"
      >
        <WineSection eyebrow="One crop, prepared across two seasons" id="wine-vine-cycle" title="The vine’s year">
          <EssayIntro>
            <p>
              A vintage lasts a season, but the crop does not begin at budburst. The buds that carry this year’s
              bunches were formed in the previous summer, and the carbohydrates that wake them were stored before
              the leaves fell. Each harvest is therefore an overlap between two years of weather and farming.
            </p>
          </EssayIntro>
          <WineVineCycle />
          <p className="wine-book-note">
            Book trail · <i>Wined4 / Wine Production</i>, anatomy, propagation, growth-cycle and grape-development
            chapters. The timing shifts with hemisphere, climate, variety and vintage; the sequence does not.
          </p>
        </WineSection>

        <WineSection eyebrow="Terroir without magic" id="wine-vineyard" title="What the vine is actually responding to">
          <EssayIntro>
            <p>
              Terroir is useful when it is treated as a set of causes rather than a promise of flavour. Latitude,
              elevation and aspect alter heat and light; soil structure changes drainage, rooting and water supply;
              wind and humidity change disease pressure. The vine responds to those conditions, not to the romance
              of a rock name.
            </p>
          </EssayIntro>
          <div className="wine-vineyard-grid">
            {vineyardFactors.map((factor) => (
              <article key={factor.title}>
                <h4>{factor.title}</h4>
                <p>{factor.text}</p>
              </article>
            ))}
          </div>
          <div className="wine-ripeness-board">
            <div>
              <p className="eyebrow">During ripening</p>
              <h4>Sugar goes up, acid changes, aroma and tannin catch up at their own speed</h4>
              <p>
                A laboratory sugar reading can estimate potential alcohol, but it cannot tell us whether seeds taste
                ripe, skins have lost harshness or varietal aroma has reached the desired point. “Ripeness” is several
                clocks running at once.
              </p>
            </div>
            <ol>
              <li><span>Veraison</span><b>berries soften and change colour</b></li>
              <li><span>Sugar loading</span><b>glucose + fructose accumulate</b></li>
              <li><span>Acid shift</span><b>malate falls faster in heat</b></li>
              <li><span>Phenolic ripeness</span><b>skins and seeds change more slowly</b></li>
              <li><span>Harvest window</span><b>the desired compromise, before weather decides for us</b></li>
            </ol>
          </div>
          <aside className="wine-climate-clock">
            <p className="eyebrow">Climate adaptation</p>
            <h4>Climate change moves the clocks at different speeds</h4>
            <p>
              Warming advances budburst and harvest, accelerates sugar gain and acid loss, and raises drought and
              extreme-weather risk; aroma and tannin development do not necessarily keep pace. Adaptation can mean
              cooler sites or aspects, later-ripening plant material, better shade and water management and—in some
              regions—different varieties.
            </p>
          </aside>
        </WineSection>

        <WineSection
          eyebrow="The vineyard is designed before it is managed"
          id="wine-vineyard-practice"
          title="Planting, roots, pruning, water and farming choices"
        >
          <EssayIntro>
            <p>
              Many of the most consequential vineyard decisions are made before the first crop: where rows run,
              which variety and rootstock are planted, how the vine is trained and how much machinery the slope will
              allow. Annual work then adjusts that permanent design rather than starting from zero.
            </p>
          </EssayIntro>
          <WineVineyardPracticeAtlas />
        </WineSection>

        <WineSection
          eyebrow="The crop meets weather, pests and logistics"
          id="wine-hazards-harvest"
          title="What can go wrong—and how picking finally happens"
        >
          <EssayIntro>
            <p>
              Farming wine grapes is less a search for perfect ripeness than a series of risk trades. Waiting may
              deepen flavour and soften tannin, but it also lengthens exposure to rain, rot, heat, birds and labour
              shortages. Harvest is the moment the grower decides which risks are still worth carrying.
            </p>
          </EssayIntro>
          <WineHazardsAndHarvest />
          <p className="wine-book-note">
            Book trail · <i>Wined4 / Wine Production</i>, vineyard establishment, soil and water management, canopy,
            hazards, pests, diseases and harvest chapters; regional examples checked against{" "}
            <i>Wines of the World</i>.
          </p>
        </WineSection>

        <WineSection eyebrow="From country to climat" id="wine-regions" title="A world map of wine regions">
          <div className="wine-section-intro">
            <p className={paragraphClass}>
              I have mapped {wineCountryCount} countries into {wineRegionCount} named regions and{" "}
              {wineSubregionCount} closer zones. Start with the world, open a country, then choose a region. Burgundy
              goes another level down because its whole argument is that a few metres of slope can deserve a
              different name.
            </p>
            <p>
              The country maps now draw the wine areas as boundaries rather than dots. Open European PDO,
              Australian GI and American AVA geometry supplies the regulatory footprints; elsewhere I use real
              county or provincial lines as an honest atlas redraw. Every map can be zoomed and dragged, while the
              Bordeaux and south Côte de Beaune views go down to finer INAO parcel geometry.
            </p>
          </div>
          <WineRegionExplorer />
        </WineSection>
      </GuideChapter>

      <GuideChapter
        description="Grape names travel, mutate and get translated. This atlas keeps synonyms, colour mutations, natural crossings and modern bred varieties from becoming one muddled family tree."
        eyebrow="Genetics and names"
        id="wine-grapes"
        title="Wine grape varieties"
      >
        <WineSection eyebrow={`${wineGrapeCount} varieties and families`} id="wine-grape-atlas" title="The grape atlas">
          <div className="wine-section-intro">
            <p className={paragraphClass}>
              The atlas now opens from the world&apos;s most widely planted varieties downward. Search by grape,
              synonym, country, flavour or wine type, or switch to A–Z. Each entry tells me how the vine behaves as
              well as what the wine can taste like, because Cabernet in a textbook and Cabernet in a wet, shaded
              vineyard are not the same useful piece of information.
            </p>
            <p>
              This is the book set&apos;s major and region-defining working collection, not a claim that the world
              contains only {wineGrapeCount} grapes. More than a thousand named wine varieties exist, many in tiny
              local plantings. “Common” here means global bearing vineyard area, not bottle sales or cultural
              importance.
            </p>
          </div>
          <WineGrapeAtlas />
        </WineSection>

        <WineSection eyebrow="A label can hide a genealogy" id="wine-grape-language" title="Variety, clone, mutation and synonym are different">
          <EssayIntro>
            <p>
              Wine labels compress botany into a few familiar words. Some words are alternate names for the same
              vine, some describe a selected clone, and others cover a family of genuinely different varieties.
              Keeping those relationships separate prevents regional custom from being mistaken for genetics.
            </p>
          </EssayIntro>
          <div className="wine-language-grid">
            <article><span>same grape, new name</span><h4>Synonym</h4><p>Syrah and Shiraz are the same variety. So are Tempranillo, Tinta Roriz and Aragonez. The name can still signal a regional or stylistic convention.</p></article>
            <article><span>same basic genome, skin changed</span><h4>Colour mutation</h4><p>Pinot Noir, Pinot Gris and Pinot Blanc are colour forms inside the Pinot family, not three unrelated vines.</p></article>
            <article><span>two parents</span><h4>Crossing</h4><p>Cabernet Sauvignon arose from Cabernet Franc and Sauvignon Blanc. A crossing can happen naturally or be made deliberately by a breeder.</p></article>
            <article><span>selected inside one variety</span><h4>Clone</h4><p>A grower propagates one vine with useful berry size, yield, aroma or disease behaviour. It stays the same variety but not an identical farming tool.</p></article>
            <article><span>many different seedlings</span><h4>Field blend</h4><p>Old vineyards may contain several varieties interplanted and harvested together. “Mixed” can therefore describe the ground before it describes the tank.</p></article>
            <article><span>a loose shared name</span><h4>Family</h4><p>Lambrusco, Malvasia, Trebbiano and Muscat can refer to families containing genuinely distinct grapes. A family name is not always a synonym.</p></article>
          </div>
        </WineSection>
      </GuideChapter>

      <GuideChapter
        description="Winemaking is controlled decomposition: give microbes the conditions to transform juice, decide what to extract, then prevent the useful reactions from becoming spoilage."
        eyebrow="Microbes, extraction and maturation"
        id="wine-making"
        title="How wine is made"
      >
        <WineSection
          eyebrow="The vulnerable hours before fermentation"
          id="wine-cellar-reception"
          title="From harvested fruit to a prepared must"
        >
          <EssayIntro>
            <p>
              The first hours in the cellar decide what the ferment will inherit. Warm, broken fruit can oxidise or
              begin an uncontrolled fermentation before a tank is filled; cool, intact fruit gives the winemaker
              time to sort, separate press fractions and choose how much stem, skin and oxygen belong in the wine.
            </p>
          </EssayIntro>
          <WineCellarReception />
          <div className="wine-language-grid wine-production-language">
            <article>
              <span>certification claim</span>
              <h4>Organic</h4>
              <p>Rules depend on jurisdiction and certifier. Organic wine may still use selected yeasts, nutrients, fining agents, processing aids and sulfur dioxide where the applicable standard permits them.</p>
            </article>
            <article>
              <span>certified fruit + cellar standard</span>
              <h4>Biodynamic</h4>
              <p>Certified biodynamic wine starts with certified biodynamic fruit and follows its certifier’s cellar standard; permitted yeasts, additions and processes vary by scheme and country.</p>
            </article>
            <article>
              <span>production philosophy</span>
              <h4>Natural / low-intervention</h4>
              <p>There is no single universal legal category. The term usually signals few additions or manipulations, but farming, yeast, filtration and sulfur practices should be stated rather than inferred from the word.</p>
            </article>
          </div>
          <p className="wine-book-note">
            Book trail · <i>Wined4 / Wine Production</i>, transport, grape reception, sorting, crushing, pressing,
            must adjustment, oxygen, sulfur dioxide and hygiene chapters.
          </p>
        </WineSection>

        <WineSection eyebrow="The central reaction" id="wine-fermentation" title="Yeast turns sugar into alcohol, gas, heat and flavour">
          <EssayIntro>
            <p>
              Fermentation is a living process rather than a formula executed once. Yeast changes its behaviour as
              sugar falls, alcohol rises and nutrients run short; the heat it produces can alter both aroma and
              extraction. The cellar’s task is to guide that ecology without pretending it can be made inert.
            </p>
          </EssayIntro>
          <div className="wine-fermentation-equation" aria-label="Simplified alcoholic fermentation equation">
            <span>grape sugar</span><b>→ yeast →</b><span>ethanol</span><i>+</i><span>carbon dioxide</span><i>+</i><span>heat</span>
          </div>
          <div className="wine-three-column">
            <CopyBlock title="Ambient or cultured yeast">
              <p className={paragraphClass}>
                An ambient ferment begins with organisms from fruit and cellar, although alcohol-tolerant{" "}
                <i>Saccharomyces</i> often dominates later. A cultured strain improves predictability. Neither choice
                excuses poor temperature, oxygen or nutrient management.
              </p>
            </CopyBlock>
            <CopyBlock title="Temperature changes the result">
              <p className={paragraphClass}>
                Cool fermentation preserves volatile fruit and slows extraction. Warmer red fermentation—often
                around 26–32°C—extracts skins more rapidly but can drive aroma away or stress yeast if heat escapes
                control.
              </p>
            </CopyBlock>
            <CopyBlock title="Malolactic conversion">
              <p className={paragraphClass}>
                Lactic-acid bacteria convert sharper malic acid into softer lactic acid plus CO₂. The wine becomes
                less acidic and slightly higher in pH; diacetyl may add butter, especially when lees and sulfur timing
                allow it to remain.
              </p>
            </CopyBlock>
          </div>
          <div className="wine-aroma-chemistry">
            <p><strong>Methoxypyrazines</strong><span>green pepper · leaf · especially Sauvignon and Cabernet family</span></p>
            <p><strong>Thiols</strong><span>grapefruit · passion fruit · blackcurrant; released from odourless precursors</span></p>
            <p><strong>Terpenes</strong><span>rose · citrus blossom · grape; abundant in Muscat and Gewürztraminer</span></p>
            <p><strong>Rotundone</strong><span>black pepper · especially Syrah, Grüner Veltliner and some local reds</span></p>
            <p><strong>Esters</strong><span>fresh fruit aromas made and rearranged during fermentation and ageing</span></p>
            <p><strong>Volatile sulfur</strong><span>from useful struck-match complexity to rotten egg and cabbage, depending on molecule and dose</span></p>
          </div>
        </WineSection>

        <WineSection eyebrow="Four routes through the same fruit" id="wine-cellar-paths" title="White, red, rosé and orange are process choices">
          <EssayIntro>
            <p>
              Colour categories are also contact decisions. Press a pale grape quickly and fermentation begins as
              juice; leave juice with skins and the wine gathers pigment, tannin, aroma precursors and texture. The
              familiar families below are not four unrelated recipes, but different answers to when solids and
              liquid should meet.
            </p>
          </EssayIntro>
          <div className="wine-cellar-paths">
            {cellarPaths.map((path) => (
              <article data-colour={path.colour} key={path.type}>
                <WineEditorialPhoto className="wine-cellar-path-photo" image={path.image} />
                <header><i aria-hidden="true" /><h4>{path.type}</h4></header>
                <ol>
                  {path.steps.map((step, index) => (
                    <li key={step}><span>{index + 1}</span>{step}</li>
                  ))}
                </ol>
                <p>{path.note}</p>
              </article>
            ))}
          </div>
          <div className="wine-extraction-note">
            <strong>Extraction is a four-knob problem</strong>
            <span>time</span><span>temperature</span><span>alcohol</span><span>movement</span>
            <p>
              Pumping over, punching down, rack-and-return and submerged caps all move liquid through skins. Whole
              berries can also ferment internally, producing the bright esters associated with carbonic maceration.
            </p>
          </div>
          <WineExtractionAtlas />
        </WineSection>

        <WineSection eyebrow="The quiet decisions after fermentation" id="wine-cellar-tools" title="Lees, oxygen, vessels and blending">
          <EssayIntro>
            <p>
              Once the ferment stops, change becomes slower but no less deliberate. Lees can broaden texture,
              oxygen can either knit tannin or flatten fruit, and a vessel controls exchange as much as it lends a
              flavour. Blending is the final version of the same work: choosing which differences should remain
              visible and which should be brought into balance.
            </p>
          </EssayIntro>
          <div className="wine-cellar-tools">
            {cellarTools.map((tool) => (
              <article key={tool.title}>
                <WineEditorialPhoto className="wine-cellar-tool-photo" image={tool.image} />
                <h4>{tool.title}</h4>
                <p>{tool.text}</p>
              </article>
            ))}
          </div>
          <p className="wine-book-note">
            Book trail · <i>Wined4 / Wine Production</i>, fermentation, extraction, MLF, maturation and blending
            chapters; cross-checked against <i>Understanding Wines</i>.
          </p>
        </WineSection>

        <WineSection
          eyebrow="Clear, stable and ready to travel"
          id="wine-finishing"
          title="Clarification, stability, packaging and closures"
        >
          <EssayIntro>
            <p>
              A wine is not finished simply because fermentation is over. It must survive temperature changes,
              transport, light, oxygen and time without throwing an avoidable haze or restarting in bottle. Fining,
              filtration and packaging are therefore trade-offs between stability, flavour, cost and intervention.
            </p>
          </EssayIntro>
          <WineFinishingAndPackaging />
          <p className="wine-book-note">
            Book trail · <i>Wined4 / Wine Production</i>, finishing, filtration, stabilisation, packaging, closures,
            quality assurance and transport chapters.
          </p>
        </WineSection>
      </GuideChapter>

      <GuideChapter
        description="Colour is only the first branch. Dryness, bubbles, alcohol, extraction, oxidation, flor, botrytis, drying and temperature create a much larger style map."
        eyebrow="A shelf organised by structure"
        id="wine-types"
        title="The main types of wine"
      >
        <WineSection eyebrow="Not just red, white and pink" id="wine-style-atlas" title="A working wine-style atlas">
          <EssayIntro>
            <p>
              Colour alone is a poor filing system. A pale wine can be sweet, sparkling, tannic or oxidative; two
              reds can share a grape and differ completely in body and extraction. A more useful taxonomy begins
              with structure—acid, tannin, alcohol, sugar and texture—then asks how the cellar built it.
            </p>
          </EssayIntro>
          <div className="wine-style-grid">
            {wineStyles.map((style) => (
              <article key={style.name}>
                <h4>{style.name}</h4>
                <p>{style.examples}</p>
                <dl>
                  <div><dt>Structure</dt><dd>{style.structure}</dd></div>
                  <div><dt>Built by</dt><dd>{style.making}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </WineSection>

        <WineSection eyebrow="Sugar has to survive fermentation" id="wine-sweetness" title="Five routes to sweet wine">
          <EssayIntro>
            <p>
              Every sweet wine solves the same problem: preserve or restore sugar without letting the result feel
              merely heavy. Some methods concentrate the grape before fermentation; others stop yeast or sweeten a
              dry base afterwards. Acidity, bitterness and aroma decide whether that sugar feels vivid or tiring.
            </p>
          </EssayIntro>
          <div className="wine-sweet-paths">
            <article><span>on the vine</span><h4>Late harvest</h4><p>Leave fruit longer so water loss and continued ripening raise sugar. The risks are rain, rot, birds and falling acidity.</p></article>
            <article><span>fungal concentration</span><h4>Noble rot</h4><p><i>Botrytis cinerea</i> perforates skins under misty mornings and drying afternoons. Water leaves, while honey, apricot, citrus-peel and ginger-like compounds develop.</p></article>
            <article><span>off the vine</span><h4>Passito / appassimento</h4><p>Dry healthy grapes on mats, racks or in ventilated rooms. Sugar, acid and flavour concentrate; oxygen and berry condition decide whether the result stays fresh.</p></article>
            <article><span>frozen water</span><h4>Icewine</h4><p>Press naturally frozen grapes so ice remains behind and the small amount of juice is extremely concentrated. Artificial freezing creates a related but separately regulated route.</p></article>
            <article><span>stop the yeast</span><h4>Arrest or fortify</h4><p>Chilling, sterile filtration, sulfur or added spirit can stop fermentation while sugar remains. A dry wine can also be sweetened later with reserved must or sweet wine where rules allow.</p></article>
          </div>
          <p className="wine-science-aside">
            Sweetness is never just a sugar number. High acid can make 100 g/L feel agile; alcohol, glycerol,
            bitterness, temperature and carbonation all shift the balance.
          </p>
        </WineSection>
      </GuideChapter>

      <GuideChapter
        description="Sparkling wine is a pressure-engineering problem wrapped around wine. The method decides where fermentation happens, how lees are removed and whether fruit or autolysis leads."
        eyebrow="Fermentation under pressure"
        id="wine-sparkling"
        title="Sparkling wine"
      >
        <WineSection eyebrow="Where the gas is captured" id="wine-sparkling-methods" title="Six ways to trap carbon dioxide">
          <EssayIntro>
            <p>
              All sparkling wine contains dissolved carbon dioxide, but the place where that gas is captured changes
              the work around it. A bottle fermentation creates lees that must be moved and removed one bottle at a
              time; a pressure tank can do the same work for a large blend; direct carbonation preserves the base
              wine most literally because there is no second ferment.
            </p>
          </EssayIntro>
          <div className="wine-sparkling-methods">
            {sparklingMethods.map((method) => (
              <article key={method.name}>
                <h4>{method.name}</h4>
                <dl>
                  <div><dt>CO₂ route</dt><dd>{method.gas}</dd></div>
                  <div><dt>Lees</dt><dd>{method.lees}</dd></div>
                  <div><dt>Result</dt><dd>{method.style}</dd></div>
                </dl>
                <p>{method.examples}</p>
              </article>
            ))}
          </div>
          <div className="wine-sparkling-base-note">
            <strong>Why start with sour, low-alcohol wine?</strong>
            <p>
              A second fermentation adds roughly 1–2% alcohol and softens the apparent acidity. Cool-climate fruit,
              gentle whole-bunch pressing and a neutral 9–11% base wine leave room for pressure, dosage, reserve wine
              and lees ageing to build the finished balance.
            </p>
          </div>
        </WineSection>

        <WineSection eyebrow="Champagne’s core engineering" id="wine-champagne-process" title="Traditional method, bottle by bottle">
          <EssayIntro>
            <p>
              The traditional method turns every bottle into a small fermenter and pressure vessel. Its apparent
              complexity comes from a simple constraint: the second fermentation happens in the bottle that will be
              sold, so the yeast sediment must be aged, gathered in the neck and expelled without losing the wine’s
              pressure.
            </p>
          </EssayIntro>
          <ol className="wine-traditional-steps">
            {traditionalSteps.map((step, index) => (
              <li key={step.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><h4>{step.title}</h4><p>{step.text}</p></div>
              </li>
            ))}
          </ol>
          <div className="wine-dosage-scale">
            <header>
              <p className="eyebrow">European sparkling-wine sweetness terms</p>
              <h4>“Extra Dry” is sweeter than “Brut”</h4>
            </header>
            <div>
              {dosageScale.map((level) => (
                <p key={level.name}>
                  <strong>{level.name}</strong>
                  <i style={{ "--wine-dose-width": level.width } as CSSProperties} />
                  <span>{level.value}</span>
                </p>
              ))}
            </div>
          </div>
          <p className="wine-book-note">
            Book trail · <i>Sparkling Wines</i>, production-method chapters and regional sections on Champagne,
            Crémant, Cava, Prosecco, Asti, Lambrusco, Franciacorta, Trentodoc, England and New World sparkling wine.
          </p>
        </WineSection>

        <WineSection
          eyebrow="The same pressure problem, eighteen regional answers"
          id="wine-sparkling-world"
          title="A world atlas of sparkling styles"
        >
          <EssayIntro>
            <p>
              Method names travel more easily than climates do. Traditional-method wine made on English chalk,
              South African limestone or an Australian mountain still begins with different fruit. The regional
              atlas is therefore best read as a set of local answers to acidity, grapes, pressure and ageing rather
              than a ranking by prestige.
            </p>
          </EssayIntro>
          <WineSparklingWorld />
          <p className="wine-book-note">
            Book trail · every regional chapter in <i>Sparkling Wines</i>: Champagne, Alsace, Burgundy, Loire, Cava,
            the major Italian families, Germany, England and Wales, the United States, Chile, Argentina, South
            Africa, Australia and New Zealand.
          </p>
        </WineSection>
      </GuideChapter>

      <GuideChapter
        description="Adding grape spirit can stop a ferment with sugar intact or strengthen a dry wine for long biological, oxidative or heated ageing. Timing is the master switch."
        eyebrow="Spirit, oxygen, flor and heat"
        id="wine-fortified"
        title="Fortified wine"
      >
        <WineSection
          eyebrow="Spirit is the switch, maturation writes the style"
          id="wine-fortification-primer"
          title="The four decisions behind fortified wine"
        >
          <EssayIntro>
            <p>
              Fortification is not one style. Spirit added during fermentation preserves grape sugar; spirit added
              after a dry ferment changes which yeasts can live and how safely the wine can age. What follows—fresh
              fruit, flor, oxygen, heat or decades in wood—matters as much as the alcohol itself.
            </p>
          </EssayIntro>
          <WineFortificationPrimer />
        </WineSection>

        <WineSection eyebrow="Andalusia" id="wine-sherry" title="Sherry: one neutral grape, several ageing environments">
          <EssayIntro>
            <p>
              Sherry is easiest to understand as an ageing system. Palomino supplies a deliberately quiet base;
              fortification strength and the presence or absence of flor then divide it into biological and
              oxidative families. The solera preserves house style by blending ages rather than by keeping one wine
              untouched forever.
            </p>
          </EssayIntro>
          <p className="wine-science-aside">
            Press fraction helps set the ageing path before fortification: low-pressure <i>primera yema</i>, with
            less skin-derived phenolic material, is generally directed toward Fino or Manzanilla because phenolics
            restrict flor; more structured <i>segunda yema</i> is generally directed toward oxidative Oloroso. This
            is a sorting tendency, not an absolute recipe.
          </p>
          <div className="wine-sherry-split">
            <article>
              <span>≈15–15.5% alcohol · flor alive</span>
              <h4>Biological ageing</h4>
              <p>
                A film of <i>Saccharomyces</i> grows over the wine in partly filled butts. Flor consumes oxygen,
                alcohol and glycerol while producing acetaldehyde. The wine stays pale, very dry and light in body,
                with apple-skin, almond and dough-like aroma.
              </p>
              <strong>Fino · coastal Manzanilla</strong>
            </article>
            <article>
              <span>≈17%+ alcohol · flor cannot survive</span>
              <h4>Oxidative ageing</h4>
              <p>
                Oxygen slowly deepens colour, concentrates body through evaporation and builds walnut, caramel,
                tobacco and dried-fruit character. Old barrels provide oxygen rather than new-oak flavour.
              </p>
              <strong>Oloroso · later life of Amontillado · Palo Cortado</strong>
            </article>
          </div>
          <div className="wine-sherry-family">
            <p><strong>Fino / Manzanilla</strong><span>biological throughout</span></p>
            <p><strong>Amontillado</strong><span>biological first, then refortified and oxidative</span></p>
            <p><strong>Palo Cortado</strong><span>Amontillado-like aroma with the body of oxidative ageing</span></p>
            <p><strong>Oloroso</strong><span>selected and fortified for oxidation from the outset</span></p>
            <p><strong>PX / Moscatel</strong><span>sun-dried grapes fermented only a little before fortification</span></p>
            <p><strong>Cream</strong><span>an oxidative dry wine blended with sweet wine or concentrated must</span></p>
          </div>
          <p className="wine-science-aside">
            The solera is fractional blending, not one endlessly old barrel. Wine moves through scales of butts;
            only part is bottled each cycle, and younger wine refreshes what remains.
          </p>
        </WineSection>

        <WineSection eyebrow="Douro" id="wine-port" title="Port: extract quickly, fortify early, then choose fruit or oxygen">
          <EssayIntro>
            <p>
              Port compresses the red-wine ferment. Colour and tannin must be extracted before spirit stops the yeast,
              often after only a day or two. Maturation then opens a second divide: protect the young wine from
              oxygen for ruby fruit, or give it years in smaller wood for the tawny family.
            </p>
          </EssayIntro>
          <div className="wine-port-process">
            <ol>
              <li><span>1</span><div><h4>Rapid extraction</h4><p>Fermentation may last only one or two days, so foot-trodden or robotic lagares, pistons and pumping-over move a great deal of colour and tannin quickly.</p></div></li>
              <li><span>2</span><div><h4>Fortify at 5–7% alcohol</h4><p>About one part 77% grape spirit to four parts fermenting must stops yeast, leaving roughly 80–120 g/L sugar and 19–22% final alcohol.</p></div></li>
              <li><span>3</span><div><h4>Blend</h4><p>Parcels, varieties, extraction lots, sweetness levels and—except vintage styles—years are assembled into the house profile.</p></div></li>
              <li><span>4</span><div><h4>Choose the ageing path</h4><p>Large vessels preserve dark fruit; smaller 600 L pipes admit more oxygen and create tawny colour, nuts, caramel and dried fruit.</p></div></li>
            </ol>
            <div>
              <article><h4>Ruby family</h4><p><strong>Ruby · Reserve Ruby · LBV · Vintage</strong></p><p>Protected from substantial oxygen to preserve deep colour and black fruit. Vintage and some LBV continue developing in bottle.</p></article>
              <article><h4>Tawny family</h4><p><strong>Tawny · 10/20/30/40/50/80-year · VVO · Colheita</strong></p><p>Long barrel exposure softens tannin and builds nuts, caramel and dried citrus. Numeric indications describe IVDP-approved organoleptic character, not the youngest component; VVO is reserved for wine aged in wood for more than 80 years, without a numeric age on the label.</p></article>
              <article><h4>White & rosé</h4><p><strong>Dry to sweet White · Rosé Port</strong></p><p>White grapes can ferment cooler and may be protected from oxygen; rosé uses gentle extraction and fresh-fruit handling.</p></article>
            </div>
          </div>
        </WineSection>

        <WineSection eyebrow="Heat, sunlight and other fortified families" id="wine-madeira" title="Madeira, VDN and Rutherglen Muscat">
          <div className="wine-fortified-grid">
            <article>
              <p className="eyebrow">Madeira</p>
              <h4>Heat becomes the ageing tool</h4>
              <p>
                Neutral 96% spirit stops the ferment at the sweetness required. Estufagem heats wine in tank around
                45–50°C for months; gentler canteiro leaves casks in warm lodges for years. Heat plus oxygen produces
                caramel, nuts, dried fruit and remarkable stability, while Madeira&apos;s natural acid prevents the
                result feeling flat.
              </p>
              <dl>
                <div><dt>Sercial</dt><dd>driest · citrus peel · very high acid</dd></div>
                <div><dt>Verdelho</dt><dd>medium-dry · smoke and dried fruit</dd></div>
                <div><dt>Boal</dt><dd>medium-sweet · raisin and caramel</dd></div>
                <div><dt>Malvasia</dt><dd>sweetest · rich but acid-balanced</dd></div>
              </dl>
            </article>
            <article>
              <p className="eyebrow">Vins doux naturels</p>
              <h4>Fruit-forward or deliberately oxidative</h4>
              <p>
                Neutral 95–96% spirit is added around 5–8% alcohol. Muscat wines may remain cool and protected for
                grape, flower and peach aromas. Grenache wines can stay on skins after fortification for more
                extraction, then age in topped tanks or deliberately untopped barrels and outdoor glass bonbonnes.
              </p>
              <dl>
                <div><dt>Muscat</dt><dd>Beaumes-de-Venise · Rivesaltes · Frontignan</dd></div>
                <div><dt>Grenache</dt><dd>Banyuls · Maury · Rasteau</dd></div>
              </dl>
            </article>
            <article>
              <p className="eyebrow">Rutherglen Muscat</p>
              <h4>Shrivel, fortify and concentrate in heat</h4>
              <p>
                Partly shrivelled Muscat ferments briefly on skins. At only 1–2% alcohol the dense juice is drained,
                pressed and fortified to about 17.5%. Warm old barrels lose water over years, concentrating sugar,
                acid and alcohol while oxidation builds raisin, fig, treacle and spice.
              </p>
              <p>
                The four tiers classify a sensory progression in richness, complexity and intensity. Age is only
                one input, so the figures below are expected average ages rather than classification thresholds.
              </p>
              <dl>
                <div><dt>Rutherglen</dt><dd>roughly 3–5 years average · fruit-led</dd></div>
                <div><dt>Classic</dt><dd>roughly 6–10 years · deeper and more complex</dd></div>
                <div><dt>Grand</dt><dd>roughly 11–19 years · very concentrated</dd></div>
                <div><dt>Rare</dt><dd>20+ years average · tiny volumes</dd></div>
              </dl>
            </article>
          </div>
          <p className="wine-book-note">
            Book trail · <i>Fortified Wines</i>, Sherry, Port, Madeira, vins doux naturels and Rutherglen Muscat
            chapters. Numerical ranges describe the book&apos;s production framework; individual appellation rules
            and bottlings can be narrower.
          </p>
        </WineSection>
      </GuideChapter>

      <GuideChapter
        description="Tasting becomes more useful when I separate what I sense from the story I expect. Structure first, aromas second, possible cause last."
        eyebrow="From evidence to inference"
        id="wine-tasting"
        title="How to read a glass"
      >
        <WineSection eyebrow="A repeatable sequence" id="wine-tasting-method" title="Taste the wine before guessing the label">
          <EssayIntro>
            <p>
              A useful tasting note separates observation from explanation. Colour, aroma and structure are evidence;
              grape, climate, method and age are hypotheses built from it. Starting with the conclusion makes every
              later sensation bend toward the label.
            </p>
          </EssayIntro>
          <ol className="wine-tasting-sequence">
            <li><span>Look</span><p>Clarity, depth and hue give clues about extraction, grape, oxidation and age, but rarely one certain answer.</p></li>
            <li><span>Smell</span><p>Check condition first. Then group fruit, flowers, herbs, spice, earth, fermentation, oak and development rather than chasing one perfect noun.</p></li>
            <li><span>Taste</span><p>Judge sweetness, acid, tannin, alcohol, body, flavour intensity and finish separately. These structural measurements travel better between tasters than poetry.</p></li>
            <li><span>Balance</span><p>Ask whether any component sticks out, whether flavour persists and whether concentration feels supported by structure.</p></li>
            <li><span>Infer</span><p>Only now connect the evidence to climate, grape, method, maturity and possible region. A tasting note is an argument with uncertainty, not a magic reveal.</p></li>
          </ol>
          <div className="wine-service-grid">
            <article><h4>Temperature</h4><p>Cold suppresses aroma, sweetness and alcohol while sharpening acid and tannin. Warmth opens aroma but can make alcohol feel louder.</p></article>
            <article><h4>Air</h4><p>Decanting removes sediment and changes oxygen exposure. Young reductive or tannic wine may open; fragile old wine may fade quickly.</p></article>
            <article><h4>Glass</h4><p>A larger bowl increases headspace and evaporation. Shape changes delivery, but it cannot repair an unbalanced wine.</p></article>
            <article><h4>Storage</h4><p>Stable cool temperature, darkness and little vibration slow reactions. Heat is usually more damaging than a slightly imperfect serving angle.</p></article>
          </div>
        </WineSection>

        <WineSection
          eyebrow="A style choice in one bottle can be a fault in another"
          id="wine-faults"
          title="Recognising faults without blaming every unusual aroma"
        >
          <EssayIntro>
            <p>
              A fault is rarely just the presence of one compound. Concentration, context and the intended style
              matter: volatile acidity may lift aroma at one level and turn vinegary at another, while a harmless
              deposit can look alarming without changing flavour at all.
            </p>
          </EssayIntro>
          <WineFaultAtlas />
          <p className="wine-science-aside">
            Cloudiness, sediment and tartrate crystals can be visually unexpected without harming flavour or safety.
            I check smell, taste and the intended style before deciding that an unpolished appearance is a fault.
          </p>
        </WineSection>

        <WineSection
          eyebrow="From shop shelf to the table"
          id="wine-label-service"
          title="Labels, price, bottle ageing, storage, service and food"
        >
          <EssayIntro>
            <p>
              A label is a legal document before it is a tasting note. It records origin, responsibility, alcohol and
              category, while many of the words that sound qualitative mean only what a local rule defines. Once the
              bottle is home, stable storage and thoughtful serving usually matter more than ritual.
            </p>
          </EssayIntro>
          <WineLabelAndService />
          <p className="wine-book-note">
            Book trail · <i>Understanding Wines: Explaining Style and Quality</i> and <i>Wined4 / Wine
            Production</i>, quality, price, labelling, faults, bottle maturation, storage, service and sensory
            assessment chapters.
          </p>
        </WineSection>

        <WineSection eyebrow="Sources used to build this guide" id="wine-sources" title="The book trail">
          <EssayIntro>
            <p>
              This is a synthesis rather than a substitute for the books. Production texts supply mechanisms,
              regional texts supply place and the current official sources settle rules that have changed since
              publication. The notes below show where each part of the argument began.
            </p>
          </EssayIntro>
          <div className="wine-source-list">
            <article>
              <span>Core production</span>
              <h4>Wined4 / Wine Production</h4>
              <p>Grape composition, vineyard factors, fermentation, aroma chemistry, extraction, MLF, vessels, oxygen, maturation, blending and sweet-wine production.</p>
            </article>
            <article>
              <span>Style and quality</span>
              <h4>Understanding Wines: Explaining Style and Quality</h4>
              <p>The link between grape growing, cellar choices, sensory structure and quality assessment.</p>
            </article>
            <article>
              <span>Regional atlas</span>
              <h4>Wines of the World</h4>
              <p>Country, region, subregion, climate, geology, grape and style chapters; the Burgundy sequence and named climat research begin here.</p>
            </article>
            <article>
              <span>Pressure</span>
              <h4>Sparkling Wines</h4>
              <p>Base wine, blending, bottle and tank methods, lees, riddling, disgorgement, dosage and the major sparkling regions.</p>
            </article>
            <article>
              <span>Spirit and maturation</span>
              <h4>Fortified Wines</h4>
              <p>Sherry, Port, Madeira, vins doux naturels and Rutherglen Muscat, including fortification timing and biological, oxidative or heated ageing.</p>
            </article>
            <article>
              <span>Global grape use</span>
              <h4>University of Adelaide wine-grape database</h4>
              <p>
                The grape atlas order uses the 2023 global bearing-area estimates rather than popularity, sales or
                production volume.{" "}
                <a
                  href="https://economics.adelaide.edu.au/wine-economics/databases"
                  rel="noreferrer"
                  target="_blank"
                >
                  Open the public methodology and workbooks ↗
                </a>
              </p>
            </article>
          </div>
          <p className="wine-source-method">
            I rewrote and reorganised the material rather than reproducing the books. Numerical ranges are retained
            only where they explain a process. Regional tasting descriptions are tendencies, not promises about
            every producer, vintage or parcel.
          </p>
        </WineSection>
      </GuideChapter>
    </div>
  );
}
