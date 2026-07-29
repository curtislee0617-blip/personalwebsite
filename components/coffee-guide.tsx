import Image from "next/image";
import type { ReactNode } from "react";
import { RecipeImageViewer } from "@/components/recipe-image-viewer";

type CoffeeFigureProps = {
  alt: string;
  caption: string;
  height: number;
  src: string;
  width: number;
};

const paragraphClass = "text-sm leading-7 text-ink/66";

function CoffeeFigure({ alt, caption, height, src, width }: CoffeeFigureProps) {
  return (
    <figure className="overflow-hidden rounded-[1.2rem] border border-ink/10 bg-paper/70">
      <RecipeImageViewer alt={alt} className="block w-full" src={src}>
        <div className="relative grid min-h-44 place-items-center overflow-hidden bg-white/75 p-3 sm:min-h-52">
          <Image
            alt={alt}
            className="h-auto max-h-[22rem] w-auto max-w-full object-contain"
            height={height}
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
    <section className="scroll-mt-28 overflow-hidden rounded-[1.7rem] border border-ink/10 bg-surface/48" id={id}>
      <header className="border-b border-ink/[0.08] px-5 py-5 sm:px-6">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h2>
      </header>
      {children}
    </section>
  );
}

function CopyBlock({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <section className="border-b border-ink/[0.07] py-5 first:pt-0 last:border-b-0 last:pb-0">
      {title ? <h3 className="mb-3 text-base font-semibold tracking-tight text-ink sm:text-lg">{title}</h3> : null}
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

export function CoffeeGuide() {
  return (
    <div className="grid gap-7">
      <DraftSection eyebrow="Botany and process" id="coffee-botany" title="What coffee is">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="grid content-start">
            <CopyBlock>
              <p className={paragraphClass}>We take it for granted and overlook the complexity of this not-so-simple beverage. How can a bean taste like this?</p>
            </CopyBlock>
            <CopyBlock title="What is coffee?">
              <p className={paragraphClass}>
                <i>Coffea</i> - yes, it really is <i>-ea</i> - is a genus of flowering plants in the family Rubiaceae. Some species of <i>Coffea</i> produce seeds that we call coffee beans. The two most famous are Arabica, at roughly 70% of production, and Robusta, at roughly 30%.
              </p>
              <p className={paragraphClass}>
                Genetic sequencing shows that Robusta is one parent of Arabica. It crossed with <i>Coffea eugenioides</i> to create Arabica in Ethiopia, the birthplace of this drink.
              </p>
              <p className={paragraphClass}>
                First, the fruit is picked - often by hand for single-origin beans - then the flesh is removed. The beans are dried, rested to dry further and age, hulled to remove the parchment, roasted, ground and finally brewed. Being such a lengthy process, it makes me wonder who came up with such an ingenious use for the coffee bean, which would otherwise crack a tooth if anyone decided to nibble on it.
              </p>
            </CopyBlock>
          </div>
          <CoffeeFigure
            alt="Diagram of coffee cherry anatomy"
            caption="The fruit layers that have to be removed before roasting."
            height={545}
            src="/recipes/coffee-guide/coffee-cherry-anatomy.webp"
            width={685}
          />
        </div>
      </DraftSection>

      <DraftSection eyebrow="Processing and heat" id="coffee-processing" title="From cherry to roasted bean">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="grid content-start">
            <CopyBlock title="Washing process">
              <p className={paragraphClass}>
                As mentioned, after picking, the fruit has to be removed. There are three main ways of doing this: the natural, pulped and washed processes. The natural process begins with hand-picking cherries at optimal ripeness, while pulped and washed processes can use a flotation tank to sort the fruit. Riper cherries tend to sink because of their higher sugar and water content.
              </p>
              <p className={paragraphClass}>
                The natural process dries the whole cherries under the sun before resting. For pulped and washed coffees, the cherries are mechanically depulped to strip off the skin. The washed process adds a significant step - fermentation - which uses microbial enzymes to break down the pectin-rich mucilage around the bean.
              </p>
            </CopyBlock>
            <CopyBlock title="Roasting">
              <p className={paragraphClass}>
                Numerous chemical reactions make this bean taste the way it does, and they happen during roasting. We often discuss how bitter, dark or “roasty” coffee is in terms of light, medium and dark roast levels, but what exactly does this mean, and why should I care?
              </p>
              <p className={paragraphClass}>
                Coffee beans contain about 7-11% water after drying. This has to evaporate before the beans can brown, so the initial stage is called drying - again. The beans then yellow, and their outer layer, called chaff, flakes off as air expands and water boils. The process remains endothermic while the first caramelisation reactions begin.
              </p>
              <p className={paragraphClass}>
                First crack follows as the beans release energy and gases. Carbon dioxide and steam build pressure inside the bean and force open its seams, creating the signature “crack”. A roaster can continue into second crack, when the structure breaks down further and oils may become visible at the surface. After roasting, the coffee is cooled quickly with air or mist, then rested so pent-up carbon dioxide can escape.
              </p>
              <p className={paragraphClass}>
                Roaster design is therefore significant. Drum roasters tumble coffee over a heat source, with much of the transfer coming from the hot drum and moving air. Fluid-bed roasters inject hot air through the beans. Tangential roasters use internal shovels to mix larger batches evenly, while centrifugal roasters spin rapidly, carrying beans up the sides and back towards the bottom. Different designs suit different prices, volumes and levels of control; specialty coffee often favours traditional drum or fluid-bed roasting.
              </p>
            </CopyBlock>
          </div>
          <div className="grid content-start gap-3">
            <CoffeeFigure
              alt="Coffee cherries being selected from a branch"
              caption="The starting material for natural, pulped and washed processing."
              height={648}
              src="/recipes/coffee-guide/coffee-cherry-harvest.webp"
              width={1155}
            />
            <CoffeeFigure
              alt="A coffee cherry cut open"
              caption="The seed sits inside fruit, mucilage, parchment and silverskin."
              height={488}
              src="/recipes/coffee-guide/coffee-cherry-cut-open.webp"
              width={650}
            />
          </div>
        </div>
      </DraftSection>

      <DraftSection eyebrow="Smell, taste and texture" id="coffee-flavour" title="Aromatic compounds">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="grid content-start">
            <CopyBlock>
              <p className={paragraphClass}>Every consumer is exposed to the obvious final stage: consumption. Why do we taste what we taste, and why do we like it?</p>
              <p className={paragraphClass}>
                You might have seen coffee-tasting charts, and it is amazing how much complexity and difference can be found between brews. Taste and flavour combine our olfactory and gustatory senses, and much of what we “taste” is actually smell through retronasal olfaction: compounds pass from the mouth into the nasal passageways.
              </p>
              <p className={paragraphClass}>
                Sweetness identifies carbohydrates for energy; umami signals amino acids; salt helps us judge electrolyte balance; sourness can warn against fermentation - ironic here - and bitterness can warn against poisons. Sweet, bitter and umami are detected through G-protein-coupled receptors. Salt and sour, involving charged particles such as Na+ and H+, use ion channels. Transient receptor potential channels also help us judge temperature, pressure and irritating compounds, all of which affect taste sensitivity.
              </p>
            </CopyBlock>
            <CopyBlock title="Sweetness">
              <p className={paragraphClass}>
                Sweetness is often used to describe a specialty cup, yet it is easily overlooked during the day-to-day caffeine boost. Some sweetness comes from sugars naturally present in the bean. Fructose can be perceived as sweeter than glucose, while roasting creates richer caramel-like impressions through pyrolysis and thermal degradation.
              </p>
              <p className={paragraphClass}>
                Around 160°C, sugars can fragment and take part in caramelisation chemistry. These smaller fragments continue decomposing into hundreds of compounds, including furan and furanone derivatives associated with nutty aromas such as almond and hazelnut. Maltol can contribute aromas of caramel, cotton candy and roasted malt.
              </p>
            </CopyBlock>
            <CopyBlock title="Sourness">
              <p className={paragraphClass}>
                If you have ever had a shot of pure espresso, the sourness was probably apparent. Green coffee contains many acids, some pleasant and some less so. Chlorogenic acids are transformed during roasting into compounds including bitter-tasting lactones. Citric, malic and acetic acids also contribute, while nicotinic acid, or niacin, can form from the breakdown of trigonelline. As proton donors, acids activate sour-sensitive pathways.
              </p>
            </CopyBlock>
            <CopyBlock title="Umami">
              <p className={paragraphClass}>
                Umami - our favourite and most indescribable flavour - means “deliciousness” or “good taste”, a term associated with scientist Kikunae Ikeda. Umami is linked with glutamates, amino acids and peptides. Coffee beans contain roughly 10-13% protein, so roasting brings reducing sugars and amino compounds into Maillard chemistry above roughly 130°C, creating hundreds of additional compounds.
              </p>
              <p className={paragraphClass}>
                The Maillard reaction gives roasted foods, from bread to seared steak, much of their aromatic quality. Focusing only on Maillard chemistry can distract from Strecker degradation and the many connected intermediate reactions that respond to moisture, temperature and gases.
              </p>
            </CopyBlock>
            <CopyBlock title="Bitterness and texture">
              <p className={paragraphClass}>
                Bitterness is the flavour most associated with coffee. Chances are that when you first tasted it, you thought, “This is so bitter and disgusting,” then acquired the taste through peer influence - everyone else drinks it, so it has to be good - or simply for the caffeine rush.
              </p>
              <p className={paragraphClass}>
                Much of the bitterness develops during roasting. Chlorogenic acids form bitter lactones and quinic-acid-related products, while caffeine and trigonelline contribute their own bitterness. Longer roasting also removes volatile aromatic compounds, so bitterness can become more apparent. Salt levels are generally low enough to be negligible.
              </p>
              <p className={paragraphClass}>
                Texture is a huge factor in coffee flavour. Lipids give espresso body, while suspended coffee solids and melanoidins contribute texture in other brews. Greater contact between compounds and receptors can increase perceived intensity. This is one reason milk changes coffee so much: its fat carries flavour compounds and gives a rounder tasting experience.
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

      <DraftSection eyebrow="Appearance and origin" id="coffee-terroir" title="Colour, altitude and terroir">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="grid content-start">
            <CopyBlock title="Colour of coffee">
              <p className={paragraphClass}>
                Not so much taste and flavour, but why is coffee often reddish-brown or dark black? Melanoidins are a major factor. They absorb strongly in parts of the ultraviolet and visible spectrum and leave more red and yellow light to reach us, helping explain the reddish-orange brown of a classic pour-over. A more concentrated brew also contains more suspended and dissolved material, so it appears darker.
              </p>
              <p className={paragraphClass}>
                Darker roasts do not simply become darker because the beans turn into pure carbon. Roasting breaks down internal fibres and reduces the overall mass of each bean. Relatively stable pigmenting, bittering and colouring compounds then make up a larger proportion of the brew, producing its darker appearance.
              </p>
            </CopyBlock>
            <CopyBlock title="Effect of environment, altitude and diurnal range">
              <p className={paragraphClass}>
                Much like the French idea of “terroir” in wine, the environment can affect flavour notes just as much in a cup of bean water as in a glass of the finest wine. <i>Coffea</i> plants require strong light, temperatures around 18-22°C, rich soil, and regions with relatively low pest and disease pressure.
              </p>
              <p className={paragraphClass}>
                This picky plant creates the “Bean Belt”: tropical and subtropical regions between the Tropics of Capricorn and Cancer. It includes Indonesia, Vietnam, Panama and Ethiopia, producing coffees full of floral and nutty complexity.
              </p>
              <p className={paragraphClass}>
                Soil quality separates these regions. Warm conditions encourage important microbial communities, while soil pH affects mineral-ion uptake by roots. Iron, manganese and magnesium can alter the chemical makeup of the fruit and have an evident impact on taste complexity.
              </p>
              <p className={paragraphClass}>
                When buying specialty coffee, altitude is almost always mentioned. Coffee plants can be damaged by high temperatures while still requiring lots of sunlight, so high-altitude regions can provide cooler air without reducing sunshine. As rising air encounters lower pressure, it expands and cools. Coastal regions such as Panama can also receive moist trade winds that cool the climate and prevent plants from overheating.
              </p>
              <p className={paragraphClass}>
                Diurnal range is hugely important for coffee, as it is for wine: cool nights and warm days are often preferred. This part of my draft is still incomplete.
              </p>
            </CopyBlock>
          </div>
          <div className="grid content-start gap-3">
            <CoffeeFigure
              alt="CIE chromaticity diagram"
              caption="A chromaticity diagram used in the draft discussion of coffee colour."
              height={479}
              src="/recipes/coffee-guide/coffee-colour-chromaticity.webp"
              width={435}
            />
            <CoffeeFigure
              alt="Map of coffee-growing regions in South America"
              caption="Coffee-growing states in Brazil and their surrounding geography."
              height={423}
              src="/recipes/coffee-guide/coffee-bean-belt-map.webp"
              width={610}
            />
          </div>
        </div>
      </DraftSection>

      <DraftSection eyebrow="Solubility and devices" id="coffee-extraction" title="Brewing and under- or over-extraction">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="grid content-start">
            <CopyBlock title="Percolation and immersion">
              <p className={paragraphClass}>
                The final step is brewing, which can be separated into percolation and immersion. The key difference is how the water interacts with the coffee. In percolation, water passes through a bed of grounds; examples include pour-overs such as the Chemex and V60, espresso and the moka pot. In immersion, the grounds are immersed before being separated, as in cold brew and the French press.
              </p>
              <p className={paragraphClass}>
                Changing extraction time, temperature, pressure and grind size has always been a challenge for master baristas - and some scientists - to perfect. The rule of thumb is that increasing temperature, pressure or time, and decreasing grind size, increases extraction. Over-extraction is often bitter while under-extraction is acidic, but why?
              </p>
              <p className={paragraphClass}>
                Different compounds dissolve at different rates, and changing one property does not increase every part of the flavour profile equally. With hundreds or thousands of compounds, it is difficult to isolate the behaviour of each, so we return to our most “reliable” tool: taste. More dilute brews can make floral notes such as esters easier to perceive, while concentrated brews make richness and bitterness more apparent. Longer times raise intensity, while higher temperatures can extract more bitter compounds. A pour-over might use a 1:16 coffee-to-water ratio, while a concentrated coffee may be closer to 1:4-5.
              </p>
            </CopyBlock>
            <CopyBlock title="Pressure-based devices">
              <p className={paragraphClass}>
                These variables give us very different cups. Notable devices include the moka pot, AeroPress and espresso machine. Rather than relying only on gravity, they add pressure for a more concentrated extraction.
              </p>
              <p className={paragraphClass}>
                In a moka pot, heat raises the pressure in the lower chamber and forces water up a submerged tube through a relatively coarse coffee bed. The combination of heat and pressure produces a strong brew, but it can taste burnt if the water and metal become too hot.
              </p>
              <p className={paragraphClass}>
                Modern espresso machines separate temperature and pressure more deliberately. Water around 96-98°C is driven through a very fine coffee bed at roughly 9 bar. This gives more control, prevents unnecessary scorching and creates a concentration that can be diluted into many drink styles.
              </p>
              <p className={paragraphClass}>
                The AeroPress asks a slightly different question: what if immersion and percolation were combined? The user can brew below boiling, increase extraction through contact time rather than extreme temperature, then add manual pressure during filtration.
              </p>
            </CopyBlock>
          </div>
          <div className="grid content-start gap-3">
            <CoffeeFigure
              alt="Mass-transfer equation used to describe coffee extraction"
              caption="A simplified mass-transfer expression from the draft."
              height={247}
              src="/recipes/coffee-guide/coffee-extraction-equation.webp"
              width={1201}
            />
            <CoffeeFigure
              alt="Cutaway diagram of a moka pot brewing coffee"
              caption="Heat builds pressure below the coffee bed and drives water upwards."
              height={900}
              src="/recipes/coffee-guide/moka-pot-diagram.webp"
              width={808}
            />
            <CoffeeFigure
              alt="Pressure-temperature phase diagram of water"
              caption="Pressure changes the boiling point of water."
              height={1041}
              src="/recipes/coffee-guide/water-phase-diagram.webp"
              width={1202}
            />
          </div>
        </div>
      </DraftSection>

      <DraftSection eyebrow="Espresso and solvent chemistry" id="coffee-crema-water" title="Crema and water quality">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-2">
          <CopyBlock title="Pressure and temperature: crema">
            <p className={paragraphClass}>
              With the relatively recent surge in popularity of espresso, one quality has become particularly sought after: crema, a delightful by-product of high-pressure brewing.
            </p>
            <p className={paragraphClass}>
              Coffee beans contain a substantial amount of oil. Under espresso conditions, pressure and turbulence disperse these oils through water while carbon dioxide trapped in the roasted bean becomes supersaturated and escapes as many small bubbles. Surface-active compounds stabilise the bubbles, creating the crema that gives a shot body and smoothness.
            </p>
            <p className={paragraphClass}>
              There is plenty of discussion over whether crema is always desirable. Dissolved carbon dioxide can increase sharpness, while the oily and colloidal fraction can carry both wanted and unwanted compounds. A thick crema therefore does not automatically prove that the espresso underneath tastes good.
            </p>
          </CopyBlock>
          <CopyBlock title="Water quality">
            <p className={paragraphClass}>
              Water is the second most important part of this beverage, and it influences a cup in ways you might not expect. Water tastes different everywhere because hardness, alkalinity and mineral content vary. As the solvent for coffee, those dissolved ions affect both extraction and perception.
            </p>
            <p className={paragraphClass}>
              Much of the discussion concerns hardness, often expressed as calcium-carbonate equivalents, because it changes extraction, texture and limescale formation. Minerals can give body and prevent a brew from tasting bland, weak and thin. Alkalinity also buffers coffee acids, so too little can produce a sharply acidic cup while too much can flatten it.
            </p>
            <p className={paragraphClass}>
              A working target in this draft is around 68 mg/L calcium hardness, pH 7, 40 mg/L alkalinity and 10 mg/L sodium. Sodium is especially noticeable because it activates salt-sensitive pathways and changes flavour perception. This section still needs a more complete comparison of water recipes.
            </p>
          </CopyBlock>
        </div>
      </DraftSection>

      <DraftSection eyebrow="Incomplete draft" id="coffee-next" title="What I’m still working on">
        <div className="p-5 sm:p-6">
          <p className="max-w-3xl text-sm leading-7 text-ink/62">
            These headings were present in the document without a finished explanation. I have kept them here so the structure is ready when I continue writing.
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Diurnal temperature range",
              "Why reheated coffee tastes bad",
              "Instant coffee - Satori Kato and David Strang",
              "The significance of dairy and foaming",
              "Health benefits",
              "Caffeine and its effects",
              "Direct- and indirect-solvent decaffeination",
              "Swiss Water and carbon-dioxide decaffeination",
              "Naturally low-caffeine species such as Coffea charrieriana",
              "Coffee alternatives such as chicory",
            ].map((topic) => (
              <div className="flex items-center justify-between gap-3 border-b border-ink/[0.08] py-3 text-sm text-ink/62" key={topic}>
                <span>{topic}</span>
                <small className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.14em] text-moss">Draft</small>
              </div>
            ))}
          </div>
        </div>
      </DraftSection>

      <details className="group rounded-[1.35rem] border border-ink/10 bg-surface/42 p-4 sm:p-5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-ink">Sources listed in my draft</p>
            <p className="mt-1 text-xs leading-5 text-ink/48">Working references rather than a finished bibliography.</p>
          </div>
          <span aria-hidden="true" className="text-xl leading-none text-moss transition group-open:rotate-45">+</span>
        </summary>
        <div className="mt-4 grid gap-5 border-t border-ink/[0.07] pt-4 lg:grid-cols-2">
          <ul className="grid content-start gap-2 text-xs leading-5 text-ink/58">
            <li><a className="text-moss hover:text-ink" href="https://www.smithsonianmag.com/science-nature/science-behind-brewing-great-cup-coffee-180965049/" rel="noreferrer" target="_blank">Smithsonian - The science behind brewing a great cup of coffee ↗</a></li>
            <li><a className="text-moss hover:text-ink" href="https://pmc.ncbi.nlm.nih.gov/articles/PMC6395788/" rel="noreferrer" target="_blank">Paper listed for coffee chemistry ↗</a></li>
            <li><a className="text-moss hover:text-ink" href="https://www.climate.gov/news-features/climate-and/climate-coffee" rel="noreferrer" target="_blank">Climate.gov - Climate and coffee ↗</a></li>
            <li><a className="text-moss hover:text-ink" href="https://en.wikipedia.org/wiki/Coffee_production" rel="noreferrer" target="_blank">Coffee production overview ↗</a></li>
          </ul>
          <ul className="grid content-start gap-2 text-xs leading-5 text-ink/58">
            <li>James Hoffmann - <i>The World Atlas of Coffee</i></li>
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
