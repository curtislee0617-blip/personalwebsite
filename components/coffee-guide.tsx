import Image from "next/image";
import type { ReactNode } from "react";
import {
  CoffeeBookResearchNote,
  CoffeeBrewingScience,
  CoffeeGreenCoffeeDeepDive,
  CoffeePlantDeepDive,
  CoffeeRoastProfileDeepDive,
} from "@/components/coffee-book-expansion";
import { CoffeePostHarvestGuide } from "@/components/coffee-post-harvest-guide";
import { CoffeeRegionExplorer } from "@/components/coffee-region-explorer";
import { CoffeeRoastingSystems } from "@/components/coffee-roasting-systems";
import { RecipeImageViewer } from "@/components/recipe-image-viewer";
import { CoffeeVarietyFamilyTree } from "@/components/coffee-variety-family-tree";
import { coffeeGrowingRegionCount, coffeeOriginCount } from "@/data/coffee-origin-atlas";

type CoffeeFigureProps = {
  alt: string;
  caption: string;
  height: number;
  priority?: boolean;
  src: string;
  width: number;
};

const paragraphClass = "text-sm leading-7 text-ink/66";

const coffeeGuideContents = [
  {
    href: "#coffee-what",
    sections: [
      { href: "#coffee-botany", label: "Plant and cherry anatomy" },
      { href: "#coffee-plant-life-title", label: "Seed to ripe fruit" },
    ],
    title: "What coffee is",
  },
  {
    href: "#coffee-growing",
    sections: [
      { href: "#coffee-terroir", label: "Climate and terroir" },
      { href: "#coffee-regions", label: "Origins map" },
      { href: "#coffee-varieties", label: "Variety family tree" },
    ],
    title: "How it is grown",
  },
  {
    href: "#coffee-processing",
    sections: [
      { href: "#coffee-post-harvest", label: "Picking and processing methods" },
      { href: "#coffee-green-journey-title", label: "Green coffee and storage" },
    ],
    title: "Picking & processing",
  },
  {
    href: "#coffee-roasting",
    sections: [
      { href: "#coffee-roast-process", label: "The roasting process" },
      { href: "#coffee-roaster-types", label: "Roaster designs" },
      { href: "#coffee-flavour", label: "Flavour and aroma" },
      { href: "#coffee-colour", label: "Colour" },
    ],
    title: "How it is roasted",
  },
  {
    href: "#coffee-brewing",
    sections: [
      { href: "#coffee-strength-extraction", label: "Strength and extraction" },
      { href: "#coffee-water", label: "Water chemistry" },
      { href: "#coffee-grinding", label: "Grinding" },
      { href: "#coffee-flow", label: "Flow and filters" },
      { href: "#coffee-espresso", label: "Espresso and milk" },
      { href: "#coffee-methods", label: "Brewing methods" },
      { href: "#coffee-troubleshooting", label: "Troubleshooting" },
      { href: "#coffee-measurement", label: "Measurement" },
    ],
    title: "How it is brewed",
  },
] as const;

function CoffeeFigure({ alt, caption, height, priority = false, src, width }: CoffeeFigureProps) {
  return (
    <figure className="overflow-hidden rounded-[1.2rem] border border-ink/10 bg-paper/70">
      <RecipeImageViewer alt={alt} className="block w-full" src={src}>
        <div className="relative grid min-h-44 place-items-center overflow-hidden bg-white/75 p-3 sm:min-h-52">
          <Image
            alt={alt}
            className="h-auto max-h-[22rem] w-auto max-w-full object-contain"
            height={height}
            priority={priority}
            sizes="(max-width: 760px) 88vw, 26rem"
            src={src}
            width={width}
          />
        </div>
      </RecipeImageViewer>
      <figcaption className="border-t border-ink/[0.07] px-3 py-2 text-[10px] leading-4 text-ink/46">{caption}</figcaption>
    </figure>
  );
}

function DraftSection({
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
    <section
      className="coffee-draft-section scroll-mt-28 overflow-hidden rounded-[1.7rem] border border-ink/10 bg-surface/48"
      id={id}
    >
      <header className="border-b border-ink/[0.08] px-5 py-5 sm:px-6">
        <p className="eyebrow">{eyebrow}</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h3>
      </header>
      {children}
    </section>
  );
}

function CoffeeGuideTableOfContents() {
  return (
    <nav aria-labelledby="coffee-guide-contents-title" className="coffee-guide-contents">
      <header>
        <div>
          <p className="eyebrow">Guide index</p>
          <h2 id="coffee-guide-contents-title">On this page</h2>
        </div>
        <p>Jump to a chapter, or go straight to a map, process or brewing method.</p>
      </header>
      <ol>
        {coffeeGuideContents.map((chapter) => (
          <li key={chapter.href}>
            <a className="coffee-guide-contents-chapter" href={chapter.href}>
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
    </nav>
  );
}

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
  const headingId = `${id}-title`;

  return (
    <section aria-labelledby={headingId} className="coffee-guide-chapter scroll-mt-28" id={id}>
      <header className="coffee-guide-chapter-header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={headingId}>{title}</h2>
        </div>
        <p>{description}</p>
      </header>
      <div className="coffee-guide-chapter-sections">{children}</div>
    </section>
  );
}

function CopyBlock({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <section className="border-b border-ink/[0.07] py-5 first:pt-0 last:border-b-0 last:pb-0">
      {title ? <h4 className="mb-3 text-base font-semibold tracking-tight text-ink sm:text-lg">{title}</h4> : null}
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

export function CoffeeGuide() {
  return (
    <div className="coffee-guide">
      <CoffeeGuideTableOfContents />

      <GuideChapter
        description="The plant, the fruit and the seeds we keep calling beans. This is the small piece of botany that makes the rest of the guide much easier to follow."
        eyebrow="Plant and fruit"
        id="coffee-what"
        title="What coffee is"
      >
        <DraftSection eyebrow="Botany and anatomy" id="coffee-botany" title="Coffee begins as a fruit">
          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="grid content-start">
              <CopyBlock>
                <p className={paragraphClass}>We take it for granted and overlook the complexity of this not-so-simple beverage. How can a bean taste like this?</p>
              </CopyBlock>
              <CopyBlock title="What is coffee?">
                <p className={paragraphClass}>
                  <i>Coffea</i> - yes, it really is <i>-ea</i> - is a genus of flowering plants in the family
                  Rubiaceae. Several species produce seeds that can become coffee, although most commercial coffee
                  comes from <i>Coffea arabica</i> and <i>Coffea canephora</i>, the latter usually sold under the
                  broad name Robusta.
                </p>
                <p className={paragraphClass}>
                  Arabica is itself a natural hybrid. An ancestor of Canephora crossed with{" "}
                  <i>Coffea eugenioides</i>, then the chromosomes doubled to produce a fertile plant. Its deepest
                  diversity survives around Ethiopia, while most cultivated Arabica descends from a much narrower
                  collection that travelled out through Yemen.
                </p>
                <p className={paragraphClass}>
                  First, the fruit is picked, sorted and processed. The seed is dried, usually rested inside
                  parchment so its moisture can settle, hulled, graded, shipped, roasted, ground and finally brewed.
                  Being such a lengthy process, it makes me wonder who came up with such an ingenious use for a seed
                  that would otherwise crack a tooth if anyone decided to nibble on it.
                </p>
              </CopyBlock>
            </div>
            <CoffeeFigure
              alt="Diagram of coffee cherry anatomy"
              caption="The fruit layers that have to be removed before roasting."
              height={545}
              priority
              src="/recipes/coffee-guide/coffee-cherry-anatomy.webp"
              width={685}
            />
          </div>
          <div className="border-t border-ink/[0.07] p-5 sm:p-6">
            <CoffeePlantDeepDive />
          </div>
        </DraftSection>
      </GuideChapter>

      <GuideChapter
        description="Climate, altitude, rain, soil and genetics decide how the fruit develops before anyone picks it. Explore the map first, then follow the family tree."
        eyebrow="Farm and origin"
        id="coffee-growing"
        title="How coffee is grown"
      >
        <DraftSection eyebrow="Climate and place" id="coffee-terroir" title="Altitude, climate and terroir">
          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
            <div className="grid content-start">
              <CopyBlock title="Effect of environment, altitude and diurnal range">
                <p className={paragraphClass}>
                  Much like the French idea of “terroir” in wine, the environment can affect flavour notes just as
                  much in a cup of bean water as in a glass of the finest wine. <i>Coffea</i> plants need enough light,
                  suitable temperatures, water and nutrients while somehow avoiding frost, heat stress, pests and
                  disease.
                </p>
                <p className={paragraphClass}>
                  This picky plant creates the “Bean Belt”: tropical and subtropical regions between the Tropics of
                  Capricorn and Cancer. It includes Indonesia, Vietnam, Panama and Ethiopia, but a latitude alone
                  cannot describe a farm.
                </p>
                <p className={paragraphClass}>
                  Soil texture, drainage, organic matter and pH affect how roots take up water and mineral ions.
                  Shade, slope and wind change the temperature around the leaves and cherries. The result is not one
                  magic “terroir chemical”, but a growing environment that alters how quickly the plant develops its
                  fruit.
                </p>
                <p className={paragraphClass}>
                  When buying specialty coffee, altitude is almost always mentioned. Higher farms are often cooler,
                  which can slow ripening without removing sunlight. Coastal mountains can also receive moist trade
                  winds, while valleys and slopes create their own rain and temperature patterns.
                </p>
                <p className={paragraphClass}>
                  Diurnal range matters too: warm days keep photosynthesis moving while cool nights can slow
                  respiration. Altitude is therefore a clue about the climate around a plant, not a quality score
                  printed in metres.
                </p>
              </CopyBlock>
            </div>
            <CoffeeFigure
              alt="Map of coffee-growing regions in South America"
              caption="Coffee-growing states in Brazil and their surrounding geography."
              height={423}
              src="/recipes/coffee-guide/coffee-bean-belt-map.webp"
              width={610}
            />
          </div>
        </DraftSection>

      <DraftSection eyebrow="Geography you can explore" id="coffee-regions" title="The world’s coffee-growing regions">
        <div className="p-5 sm:p-6">
          <div className="mb-6 grid gap-3 border-b border-ink/[0.07] pb-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <p className={paragraphClass}>
              Coffee is grown in the “Bean Belt” between the two tropics, but that tells us surprisingly little about
              how it will taste. Why can two farms in the same country produce completely different coffee? This atlas
              now follows {coffeeOriginCount} countries into {coffeeGrowingRegionCount} individual growing zones.
              Click a broad region, choose a country, then open its local regions to compare elevation, rain,
              varieties, processing and the cup they can create.
            </p>
            <p className="text-xs leading-6 text-ink/48">
              These are useful regional ranges, not a promise about every farm. A mountain can change the temperature,
              rain and sunshine within what looks like a tiny distance on the map.
            </p>
          </div>
          <CoffeeRegionExplorer />
        </div>
      </DraftSection>

      <DraftSection eyebrow="Species, selections and crosses" id="coffee-varieties" title="A coffee variety family tree">
        <div className="p-5 sm:p-6">
          <div className="mb-6 grid gap-3 border-b border-ink/[0.07] pb-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <p className={paragraphClass}>
              We talk about coffee varieties as if they are neat, separate boxes, but the family is much messier than
              that. A “variety” might be a stable cultivar, a local landrace or an entire family of related plants.
              Click any coffee below to find its parents, its descendants and the reason someone decided it was worth
              growing.
            </p>
            <p className="text-xs leading-6 text-ink/48">
              I have focused on the major cultivated lineages. There are far more coffees than I could fit into one
              readable tree, and some of their relationships are still being untangled.
            </p>
          </div>
          <CoffeeVarietyFamilyTree />
        </div>
      </DraftSection>
      </GuideChapter>

      <GuideChapter
        description="Ripe cherries become stable green coffee through sorting, fruit removal, fermentation, washing, drying, resting and milling. This is where careful agriculture becomes careful food processing."
        eyebrow="Harvest and green coffee"
        id="coffee-processing"
        title="How coffee is picked and processed"
      >
      <DraftSection eyebrow="After harvest, before heat" id="coffee-post-harvest" title="Post-harvest processing">
        <div className="p-5 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="grid content-start">
              <CopyBlock title="Picking the cherry">
                <p className={paragraphClass}>
                  Coffee can be selectively picked by hand over several passes, strip-picked from a branch in one go
                  or harvested mechanically where the terrain and farm design allow it. Hand-picking gives someone the
                  chance to choose ripe fruit on the tree, but it is not an automatic guarantee of quality; the picker
                  needs the time, incentive and training to be selective.
                </p>
                <p className={paragraphClass}>
                  Strip and mechanical harvesting collect a broader range of ripeness, so sorting becomes especially
                  important. Colour selection, flotation, density separation and hand sorting can all remove unripe,
                  overripe, dried, insect-damaged or otherwise defective cherries before they begin affecting the rest
                  of the batch.
                </p>
              </CopyBlock>
              <CopyBlock title="Removing a fruit without losing control">
                <p className={paragraphClass}>
                  As mentioned, after picking, the fruit has to be removed. The familiar branches are natural,
                  pulped or honey, and washed coffee, but wet-hulling and carefully controlled fermentations give us
                  several important variations. They all solve the same awkward problem: how do we remove a sweet,
                  wet fruit from a seed without letting water, heat and microbes run away with it?
                </p>
                <p className={paragraphClass}>
                  Selective picking helps, while flotation tanks can separate much of the low-density, dried or
                  damaged fruit. They are not magical ripeness machines, so colour and hand sorting still matter. In
                  natural processing, the whole cherry dries before milling. Pulped and washed coffees lose their
                  skin first; washed coffee then removes the pectin-rich mucilage by fermentation, mechanical
                  demucilaging and rinsing.
                </p>
                <p className={paragraphClass}>
                  I used to think fermentation belonged only to washed coffee. It does not. Microbes are active in
                  wet tanks, sticky honey coffees and whole drying cherries; the method changes their substrate,
                  oxygen, temperature and available time. Pick a process below and follow the fruit, water and
                  chemistry step by step.
                </p>
              </CopyBlock>
            </div>
            <div className="grid content-start gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <CoffeeFigure
                alt="Coffee cherries being selected from a branch"
                caption="Good processing begins with the fruit: ripeness and defects set the starting chemistry."
                height={648}
                src="/recipes/coffee-guide/coffee-cherry-harvest.webp"
                width={1155}
              />
              <CoffeeFigure
                alt="A coffee cherry cut open"
                caption="Skin, pulp, mucilage and parchment decide what remains around the seed at each stage."
                height={488}
                src="/recipes/coffee-guide/coffee-cherry-cut-open.webp"
                width={650}
              />
            </div>
          </div>
          <CoffeePostHarvestGuide />
          <div className="mt-6 border-t border-ink/[0.07] pt-6">
            <CoffeeGreenCoffeeDeepDive />
          </div>
        </div>
      </DraftSection>
      </GuideChapter>

      <GuideChapter
        description="Roasting turns a dense green seed into something brittle, soluble and wonderfully aromatic. Heat creates colour and flavour while also erasing parts of the original green coffee."
        eyebrow="Heat and transformation"
        id="coffee-roasting"
        title="How coffee is roasted"
      >
      <DraftSection eyebrow="Heat, pressure and aroma" id="coffee-roast-process" title="The roasting process">
        <div className="p-5 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="grid content-start">
              <CopyBlock title="Why roast at all?">
                <p className={paragraphClass}>
                  Numerous chemical reactions make this bean taste the way it does, and most of the familiar coffee
                  aroma appears during roasting. We often discuss how bitter, dark or “roasty” coffee is in terms of
                  light, medium and dark roast levels, but what exactly does this mean, and why should I care?
                </p>
                <p className={paragraphClass}>
                  Green coffee is dense, hard and grassy. Heat removes water, expands its porous structure and
                  transforms sugars, amino compounds, chlorogenic acids and trigonelline. Maillard reactions,
                  Strecker degradation, sugar breakdown and pyrolysis overlap; “caramelisation” alone is much too
                  small a word for what is going on.
                </p>
              </CopyBlock>
              <CopyBlock title="Cracks, development and the end of the roast">
                <p className={paragraphClass}>
                  Coffee usually arrives at the roaster with roughly 10-12% moisture. This has to move and evaporate
                  before browning accelerates, so the initial stage is called drying - again. The beans then yellow,
                  grassy aromas fade and their outer silverskin, called chaff, begins to flake away.
                </p>
                <p className={paragraphClass}>
                  First crack follows as water vapour and carbon dioxide build pressure inside an increasingly brittle
                  bean. The structure expands and fractures with the signature sound. Continuing through development
                  builds more roast-derived aroma and colour; pushing towards second crack breaks the structure down
                  further and may bring oils to the surface.
                </p>
                <p className={paragraphClass}>
                  Darker is therefore not simply “more caramelised”. Longer and hotter roasting destroys or transforms
                  more acids and aroma precursors while increasing some bitter, smoky and pyrolytic compounds. A
                  lighter roast can preserve more origin distinction, but an underdeveloped one can still taste raw,
                  cereal-like or sharply sour.
                </p>
              </CopyBlock>
            </div>
            <aside className="coffee-roast-note">
              <p className="eyebrow">One useful distinction</p>
              <h3>Process makes the green coffee. Roasting reveals and rewrites it.</h3>
              <p>
                Fermentation changes the material entering the roaster; heat decides how those precursors react. A
                roaster cannot restore damaged green coffee, and a careful process does not remove the need for a
                careful roast.
              </p>
            </aside>
          </div>

          <ol className="coffee-roast-stages">
            {[
              {
                name: "Charge & drying",
                text: "The cold beans absorb heat. Water migrates towards the surface and evaporates while the drum or hot air supplies more energy.",
              },
              {
                name: "Yellowing",
                text: "Green fades through pale yellow; chaff loosens and grassy volatiles give way to bread- and hay-like aromas.",
              },
              {
                name: "Browning",
                text: "Reducing sugars and amino compounds enter Maillard and Strecker chemistry, forming colour, melanoidins and many aroma precursors.",
              },
              {
                name: "First crack",
                text: "Steam and gases expand the porous cell structure. The audible crack marks a physical transition, not one exact universal temperature.",
              },
              {
                name: "Development",
                text: "Heat and time after first crack steer sweetness, acidity, bitterness and solubility. The coffee is then dropped and cooled quickly.",
              },
              {
                name: "Second crack",
                text: "Further structural fracture, smoke and oil migration signal a darker roast in which roast character increasingly overtakes origin.",
              },
            ].map((stage, index) => (
              <li key={stage.name}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{stage.name}</h3>
                <p>{stage.text}</p>
              </li>
            ))}
          </ol>

          <div className="mt-6">
            <CoffeeRoastProfileDeepDive />
          </div>

          <CoffeeRoastingSystems />

          <div className="mt-6">
            <CopyBlock title="Cooling, degassing and rest">
              <p className={paragraphClass}>
                Once dropped, the coffee has to cool quickly or it will continue roasting under its own stored heat.
                Air is most common; some large systems use a controlled water quench. The beans then release a great
                deal of carbon dioxide over the following hours and days.
              </p>
              <p className={paragraphClass}>
                That gas helps protect aroma in the bag but can disturb brewing when coffee is extremely fresh. Resting
                is therefore not the same as letting coffee go stale: it is giving pressure and extraction a chance to
                become more predictable.
              </p>
            </CopyBlock>
          </div>

          <p className="coffee-section-source">
            Sources for this chapter:{" "}
            <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8620865/" rel="noreferrer" target="_blank">
              From Plantation to Cup: Changes in Bioactive Compounds during Coffee Processing
            </a>
            ;{" "}
            <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10138461/" rel="noreferrer" target="_blank">
              Thermal Contaminants in Coffee Induced by Roasting: A Review
            </a>
            ; and{" "}
            <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8948666/" rel="noreferrer" target="_blank">
              a metabolomics review of processing, roasting and brewing
            </a>
            .
          </p>
        </div>
      </DraftSection>

      <DraftSection eyebrow="Smell, taste and texture" id="coffee-flavour" title="What roasting creates in the cup">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="grid content-start">
            <CopyBlock>
              <p className={paragraphClass}>Every consumer is exposed to the obvious final stage: consumption. Why do we taste what we taste, and why do we like it?</p>
              <p className={paragraphClass}>
                You might have seen coffee-tasting charts, and it is amazing how much complexity and difference can be
                found between brews. Taste and flavour combine our olfactory and gustatory senses, and much of what we
                “taste” is actually smell through retronasal olfaction: compounds pass from the mouth into the nasal
                passageways.
              </p>
              <p className={paragraphClass}>
                Sweetness identifies carbohydrates for energy; umami signals amino acids; salt helps us judge
                electrolyte balance; sourness can warn against fermentation - ironic here - and bitterness can warn
                against poisons. Sweet, bitter and umami are detected through G-protein-coupled receptors. Salt and
                sour, involving charged particles such as Na+ and H+, use ion channels. Temperature, pressure and
                irritating compounds also change what we perceive.
              </p>
            </CopyBlock>
            <CopyBlock title="Sweetness">
              <p className={paragraphClass}>
                Sweetness is often used to describe a specialty cup, yet it is easily overlooked during the day-to-day
                caffeine boost. Some sweetness comes from sugars naturally present in the bean. Fructose can be
                perceived as sweeter than glucose, while roasting creates richer caramel-like impressions through
                pyrolysis and thermal degradation.
              </p>
              <p className={paragraphClass}>
                Around 160°C, sugars can fragment and take part in caramelisation chemistry. These smaller fragments
                continue decomposing into hundreds of compounds, including furan and furanone derivatives associated
                with nutty aromas such as almond and hazelnut. Maltol can contribute aromas of caramel, cotton candy
                and roasted malt.
              </p>
            </CopyBlock>
            <CopyBlock title="Sourness">
              <p className={paragraphClass}>
                If you have ever had a shot of pure espresso, the sourness was probably apparent. Green coffee contains
                many acids, some pleasant and some less so. Chlorogenic acids are transformed during roasting into
                compounds including bitter-tasting lactones. Citric, malic and acetic acids also contribute, while
                nicotinic acid, or niacin, can form from the breakdown of trigonelline.
              </p>
            </CopyBlock>
            <CopyBlock title="Umami">
              <p className={paragraphClass}>
                Umami - our favourite and most indescribable flavour - means “deliciousness” or “good taste”, a term
                associated with scientist Kikunae Ikeda. Umami is linked with glutamates, amino acids and peptides.
                Coffee beans contain roughly 10-13% protein, so roasting brings reducing sugars and amino compounds
                into Maillard chemistry, creating hundreds of additional compounds.
              </p>
              <p className={paragraphClass}>
                The Maillard reaction gives roasted foods, from bread to seared steak, much of their aromatic quality.
                Focusing only on Maillard chemistry can distract from Strecker degradation and the many connected
                intermediate reactions that respond to moisture, temperature and gases.
              </p>
            </CopyBlock>
            <CopyBlock title="Bitterness and texture">
              <p className={paragraphClass}>
                Bitterness is the flavour most associated with coffee. Chances are that when you first tasted it, you
                thought, “This is so bitter and disgusting,” then acquired the taste through peer influence - everyone
                else drinks it, so it has to be good - or simply for the caffeine rush.
              </p>
              <p className={paragraphClass}>
                Much of the bitterness develops during roasting. Chlorogenic acids form bitter lactones and
                quinic-acid-related products, while caffeine and trigonelline contribute their own bitterness. Longer
                roasting also removes volatile aromatic compounds, so bitterness can become more apparent.
              </p>
              <p className={paragraphClass}>
                Texture is a huge factor in coffee flavour. Lipids give espresso body, while suspended coffee solids
                and melanoidins contribute texture in other brews. This is one reason milk changes coffee so much: its
                fat carries flavour compounds and gives a rounder tasting experience.
              </p>
            </CopyBlock>
          </div>
          <div className="grid content-start gap-3">
            <CoffeeFigure
              alt="Coffee flavour wheel"
              caption="A visual vocabulary for the aromas and flavours found in coffee."
              height={2048}
              src="/recipes/coffee-guide/coffee-flavour-wheel.webp"
              width={1823}
            />
            <CoffeeFigure
              alt="Graph comparing the time-intensity curves of different sweeteners"
              caption="Sweetness perception: different sweeteners rise, peak and linger differently."
              height={519}
              src="/recipes/coffee-guide/sweetness-perception.webp"
              width={494}
            />
          </div>
        </div>
      </DraftSection>

      <DraftSection eyebrow="Colour and concentration" id="coffee-colour" title="Why coffee turns brown">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="grid content-start">
            <CopyBlock title="Colour of coffee">
              <p className={paragraphClass}>
                Not so much taste and flavour, but why is coffee often reddish-brown or dark black? Melanoidins formed
                through roasting are a major factor. They absorb parts of the ultraviolet and visible spectrum and
                leave more red and yellow light to reach us, helping explain the reddish-orange brown of a classic
                pour-over.
              </p>
              <p className={paragraphClass}>
                Concentration matters as well: more dissolved and suspended material makes a brew appear darker.
                Darker roasts do not simply become darker because the beans turn into pure carbon. Heat transforms and
                concentrates colouring compounds while the bean loses water and other mass.
              </p>
            </CopyBlock>
          </div>
          <CoffeeFigure
            alt="CIE chromaticity diagram"
            caption="A chromaticity diagram used in the discussion of coffee colour."
            height={479}
            src="/recipes/coffee-guide/coffee-colour-chromaticity.webp"
            width={435}
          />
        </div>
      </DraftSection>
      </GuideChapter>

      <GuideChapter
        description="Brewing is dissolution, transport and flow happening through an irregular pile of porous particles. Strength, extraction and evenness are separate, and every brewer rearranges their balance."
        eyebrow="Water and extraction"
        id="coffee-brewing"
        title="How coffee is brewed"
      >
      <DraftSection eyebrow="From particles to the cup" id="coffee-brew-science" title="The physics of brewing">
        <div className="p-5 sm:p-6">
          <CoffeeBrewingScience />
        </div>
      </DraftSection>
      </GuideChapter>

      <DraftSection eyebrow="Caffeine, decaf and the future" id="coffee-next" title="Caffeine and beyond">
        <div className="p-5 sm:p-6">
          <p className="max-w-3xl text-sm leading-7 text-ink/62">
            Coffee is both a sensory drink and a delivery system for hundreds of compounds. The final variables are biological as well as culinary: dose, timing, tolerance and the way the bean was processed.
          </p>
          <div className="coffee-next-grid mt-5">
            {[
              {
                title: "Caffeine is not all of coffee’s bitterness",
                text: "Caffeine is a bitter stimulant, but chlorogenic-acid products, roast chemistry and concentration contribute plenty of bitterness too.",
              },
              {
                title: "Decaf is a different brewing material",
                text: "Decaffeination removes most, not every trace, of caffeine. It also changes the seed and often creates more fines, so the grinder may need to move coarser.",
              },
              {
                title: "Milk changes more than colour",
                text: "Fat, protein, sweetness, temperature and foam alter texture and how aroma is released. A good black coffee and a good milk coffee are not the same sensory target.",
              },
              {
                title: "Holding hot is slow flavour destruction",
                text: "Heat keeps driving aroma loss and oxidation. A thermal carafe is kinder than a hot plate, and reheating only the cup you need is kinder than reheating the whole pot.",
              },
              {
                title: "Instant coffee has already been brewed",
                text: "Soluble coffee is an extracted beverage made shelf-stable by spray- or freeze-drying. Brewing it again is really controlled rehydration.",
              },
              {
                title: "Coffee’s future needs more genetics",
                text: "Cultivated Arabica is narrow and climate-sensitive. Canephora, wild Coffea species, landraces and careful breeding all hold traits that future farms may need.",
              },
            ].map((topic) => (
              <article key={topic.title}>
                <h4>{topic.title}</h4>
                <p>{topic.text}</p>
              </article>
            ))}
          </div>
        </div>
      </DraftSection>

      <CoffeeBookResearchNote />

      <details className="group rounded-[1.35rem] border border-ink/10 bg-surface/42 p-4 sm:p-5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-ink">Sources and further reading</p>
            <p className="mt-1 text-xs leading-5 text-ink/48">
              Primary research and specialist references used across the guide.
            </p>
          </div>
          <span aria-hidden="true" className="text-xl leading-none text-moss transition group-open:rotate-45">+</span>
        </summary>
        <div className="mt-4 grid gap-5 border-t border-ink/[0.07] pt-4 lg:grid-cols-2">
          <ul className="grid content-start gap-2 text-xs leading-5 text-ink/58">
            <li className="font-semibold text-ink/72">Origins, climate and varieties</li>
            <li><a className="text-moss hover:text-ink" href="https://varieties.worldcoffeeresearch.org/" rel="noreferrer" target="_blank">World Coffee Research - Coffee Varieties Catalog ↗</a></li>
            <li><a className="text-moss hover:text-ink" href="https://ico.org/what-we-do/world-coffee-statistics-database/" rel="noreferrer" target="_blank">International Coffee Organization - World Coffee Statistics ↗</a></li>
            <li><a className="text-moss hover:text-ink" href="https://www.aboutcoffee.org/origins/coffee-regions-of-the-world/" rel="noreferrer" target="_blank">National Coffee Association - Coffee regions of the world ↗</a></li>
            <li><a className="text-moss hover:text-ink" href="https://www.ico.org/documents/cy2024-25/coffee-development-report-2022-23.pdf" rel="noreferrer" target="_blank">International Coffee Organization - Coffee Development Report ↗</a></li>
            <li><a className="text-moss hover:text-ink" href="https://www.climate.gov/news-features/climate-and/climate-coffee" rel="noreferrer" target="_blank">Climate.gov - Climate and coffee ↗</a></li>
            <li><a className="text-moss hover:text-ink" href="https://www.naturalearthdata.com/" rel="noreferrer" target="_blank">Natural Earth - World map data ↗</a></li>
            <li className="text-ink/46">Each country profile also links its national coffee body or closest public origin reference.</li>
            <li className="mt-2 font-semibold text-ink/72">Brewing and sensory science</li>
            <li><a className="text-moss hover:text-ink" href="https://www.smithsonianmag.com/science-nature/science-behind-brewing-great-cup-coffee-180965049/" rel="noreferrer" target="_blank">Smithsonian - The science behind brewing a great cup of coffee ↗</a></li>
            <li><a className="text-moss hover:text-ink" href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10074501/" rel="noreferrer" target="_blank">Acids in brewed coffees: composition and sensory threshold ↗</a></li>
          </ul>
          <ul className="grid content-start gap-2 text-xs leading-5 text-ink/58">
            <li className="font-semibold text-ink/72">Post-harvest processing and roasting</li>
            <li><a className="text-moss hover:text-ink" href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5165123/" rel="noreferrer" target="_blank">De Bruyn et al. - Post-harvest microbiota and metabolite profiles ↗</a></li>
            <li><a className="text-moss hover:text-ink" href="https://pmc.ncbi.nlm.nih.gov/articles/PMC6863779/" rel="noreferrer" target="_blank">Zhang et al. - Variables in wet coffee processing ↗</a></li>
            <li><a className="text-moss hover:text-ink" href="https://www.frontiersin.org/journals/microbiology/articles/10.3389/fmicb.2021.713969/full" rel="noreferrer" target="_blank">Elhalis et al. - Inoculated coffee fermentation ↗</a></li>
            <li><a className="text-moss hover:text-ink" href="https://pubmed.ncbi.nlm.nih.gov/38324553/" rel="noreferrer" target="_blank">Jakkaew et al. - A data-driven approach to coffee drying ↗</a></li>
            <li><a className="text-moss hover:text-ink" href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8620865/" rel="noreferrer" target="_blank">From Plantation to Cup - Changes in bioactive compounds ↗</a></li>
            <li><a className="text-moss hover:text-ink" href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10138461/" rel="noreferrer" target="_blank">Thermal Contaminants in Coffee Induced by Roasting ↗</a></li>
            <li><a className="text-moss hover:text-ink" href="https://research.birmingham.ac.uk/en/publications/batch-scale-simulation-of-heat-and-mass-transfer-of-coffee-roasti/" rel="noreferrer" target="_blank">University of Birmingham - Spouted-bed heat and mass transfer ↗</a></li>
            <li><a className="text-moss hover:text-ink" href="https://www.mdpi.com/2306-5710/9/4/87" rel="noreferrer" target="_blank">NMR comparison of drum, fluidised-bed and infrared roasting ↗</a></li>
            <li><a className="text-moss hover:text-ink" href="https://www.probat.com/products/machines/roasting/jupiter-series/" rel="noreferrer" target="_blank">PROBAT - JUPITER tangential roasting systems ↗</a></li>
            <li><a className="text-moss hover:text-ink" href="https://www.neuhaus-neotec.com/en/coffee-processing/machines-controls/roaster/detail/roaster-series-rfb/" rel="noreferrer" target="_blank">Neuhaus Neotec - Industrial hot-air roasting ↗</a></li>
            <li className="mt-2 font-semibold text-ink/72">Books</li>
            <li>James Hoffmann - <i>The World Atlas of Coffee</i></li>
            <li>Jonathan Gagné - <i>The Physics of Filter Coffee</i></li>
            <li>Harold McGee - <i>On Food and Cooking</i></li>
            <li>John W. Brady - <i>Food Chemistry</i></li>
            <li>Charles S. Sell - <i>Chemistry and the Sense of Smell</i></li>
            <li>Michael Brenner, Pia Sörensen and David Weitz - <i>Science and Cooking</i></li>
          </ul>
        </div>
      </details>
    </div>
  );
}
