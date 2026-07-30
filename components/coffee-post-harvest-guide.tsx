"use client";

import { useState } from "react";

type ProcessId = "washed" | "natural" | "honey" | "wet-hulled" | "controlled";

type ProcessStep = {
  action: string;
  chemistry: string;
  name: string;
};

type ProcessGuide = {
  control: string;
  cup: string;
  label: string;
  process: string;
  risk: string;
  steps: ProcessStep[];
  subtitle: string;
  whatStays: string;
};

const processOrder: ProcessId[] = ["washed", "natural", "honey", "wet-hulled", "controlled"];

const processGuides: Record<ProcessId, ProcessGuide> = {
  washed: {
    label: "Washed",
    subtitle: "Fruit off before drying",
    process:
      "The skin and most of the pulp are removed first. Fermentation or mechanical demucilaging loosens the sticky layer that remains; washing removes it before the coffee dries inside its parchment.",
    whatStays: "Mucilage stays briefly; parchment stays through drying.",
    cup:
      "Often clear and acid-defined because there is less fruit around the seed during drying. “Washed” does not automatically mean delicate or better.",
    control: "Ripeness · tank temperature · time · pH · water quality · washing endpoint",
    risk:
      "Stopping too soon can leave patches of mucilage and uneven drying. Going too long or too warm can build excessive acetic acid, solvent-like volatiles or damaged tissue.",
    steps: [
      {
        name: "Pick and sort",
        action: "Ripe cherries are selected by hand, colour and density. A flotation tank helps remove debris and many low-density, dried or damaged cherries.",
        chemistry:
          "Flotation is a useful density sort, not a perfect sugar detector. Ripeness, insect damage and trapped air can all change whether a cherry floats.",
      },
      {
        name: "Depulp",
        action: "Rollers squeeze away the skin and much of the pulp without crushing the seeds.",
        chemistry:
          "The sugar-, acid- and pectin-rich mucilage is exposed to water, oxygen and the microbes already living on the fruit and equipment.",
      },
      {
        name: "Ferment or demucilage",
        action: "The parchment coffee sits in a tank, often for hours, or passes through a machine that mechanically scrubs away mucilage.",
        chemistry:
          "Plant and microbial enzymes weaken pectin. Yeasts and lactic-acid bacteria consume sugars and can produce ethanol, lactic and acetic acids, glycerol, mannitol and aroma-active esters.",
      },
      {
        name: "Wash and sometimes soak",
        action: "Loose mucilage is rinsed away; some mills add a clean-water soak before drying.",
        chemistry:
          "Washing removes microbial substrate and soluble metabolites, sharply slowing the fermentation. Soaking can make different batches more chemically alike.",
      },
      {
        name: "Dry in parchment",
        action: "The coffee is spread on patios or raised beds, or moved through a mechanical dryer, until it is stable enough to store.",
        chemistry:
          "Water activity falls and microbial growth slows. The seed is still alive for part of drying, so respiration and other enzymatic reactions continue inside it.",
      },
      {
        name: "Rest and hull",
        action: "Dried parchment coffee is conditioned, then milled to reveal the green bean.",
        chemistry:
          "Resting lets moisture become more even through the seed. Careful hulling matters because chips and cracks give oxygen and humidity easier routes into the bean.",
      },
    ],
  },
  natural: {
    label: "Natural",
    subtitle: "Whole cherry dries together",
    process:
      "The entire cherry is dried with the seed still inside it. Fruit removal happens only after drying, so fermentation and dehydration overlap for much longer than they do in a classic washed coffee.",
    whatStays: "Skin, pulp, mucilage and parchment all stay during drying.",
    cup:
      "Often fuller, fruitier or more fermentative. The fruit does not simply pour sugar into the seed, though; microbial metabolites, drying rate and seed metabolism all help shape the result.",
    control: "Cherry ripeness · layer depth · turning · shade · airflow · rain protection",
    risk:
      "A thick, wet or poorly turned layer can create hot spots, mould and harsh acetic character. Drying too aggressively can stress the seed and make moisture uneven.",
    steps: [
      {
        name: "Pick and sort",
        action: "Uniformly ripe fruit is especially valuable because every cherry will become its own small fermentation vessel.",
        chemistry:
          "Green, overripe and damaged fruit begin with different sugar, acid and microbial populations, so a mixed harvest is difficult to dry evenly.",
      },
      {
        name: "Lay out whole",
        action: "Cherries are spread in thin layers on patios or raised beds and turned frequently.",
        chemistry:
          "The intact skin slows gas and water exchange. Inside, wet pulp supplies glucose, fructose and sucrose to yeasts, lactic-acid bacteria and acetic-acid bacteria.",
      },
      {
        name: "Ferment while drying",
        action: "For the first part of drying, the fruit remains wet enough for active microbial succession.",
        chemistry:
          "Sugars fall while alcohols, organic acids and sugar alcohols rise and fall. Some metabolites remain in the outer fruit; others are also found in the endosperm.",
      },
      {
        name: "Manage the water gradient",
        action: "The producer turns, shades or covers the coffee so the surface does not race too far ahead of the centre.",
        chemistry:
          "As available water falls, the microbial community changes and eventually becomes inactive. Temperature controls both evaporation and the speed of unwanted reactions.",
      },
      {
        name: "Condition",
        action: "The dry cherry rests before milling, protected by all of its outer layers.",
        chemistry:
          "Moisture redistributes through each seed. This reduces the gap between a dry surface and a wetter core before the protective fruit is removed.",
      },
      {
        name: "Dry mill",
        action: "The brittle skin, pulp, mucilage and parchment are hulled away together, then defects are sorted out.",
        chemistry:
          "The final green coffee carries a different metabolite profile from washed coffee, even when both began as the same variety in the same place.",
      },
    ],
  },
  honey: {
    label: "Honey / pulped natural",
    subtitle: "Some mucilage dries on",
    process:
      "The skin and pulp are removed, but some or all of the mucilage is intentionally left on the parchment during drying. It sits between washed and natural processing in fruit contact, water use and drying behaviour.",
    whatStays: "A chosen amount of mucilage plus parchment stays during drying.",
    cup:
      "Often balances clarity with more fruit weight or sweetness, but the result depends far more on ripeness and drying control than on the colour printed after the word “honey”.",
    control: "Demucilaging setting · mucilage thickness · bed depth · turning · temperature",
    risk:
      "Sticky parchment clumps easily. Slow, uneven airflow can create local over-fermentation, while aggressive drying can harden the surface before the centre catches up.",
    steps: [
      {
        name: "Pick and sort",
        action: "Ripe cherries are selected and cleaned before the skin is removed.",
        chemistry:
          "More uniform fruit gives a more uniform starting concentration of water, sugars, acids and pectin around every seed.",
      },
      {
        name: "Depulp",
        action: "The skin and pulp are stripped away while the mill deliberately leaves mucilage on the parchment.",
        chemistry:
          "Exposed mucilage becomes the main microbial substrate. Its thickness changes oxygen access, drying speed and how long microbes remain active.",
      },
      {
        name: "Choose the mucilage load",
        action: "A producer may mechanically remove part of the sticky layer or leave nearly all of it.",
        chemistry:
          "White, yellow, red and black honey are useful producer or market labels, not universal chemical grades. Their meaning changes between mills.",
      },
      {
        name: "Dry the sticky parchment",
        action: "Coffee is spread thinly and turned carefully so clumps break apart without damaging the seed.",
        chemistry:
          "Fermentation and evaporation happen together. Yeasts and bacteria consume mucilage sugars while falling water activity gradually limits them.",
      },
      {
        name: "Finish and condition",
        action: "Drying slows near the end so moisture can move from the centre to the surface before the coffee rests.",
        chemistry:
          "A gentle finish reduces internal moisture gradients. The parchment still protects the seed from direct handling and oxidation.",
      },
      {
        name: "Hull and sort",
        action: "Parchment and dried mucilage are removed before density, size, colour and hand sorting.",
        chemistry:
          "The seed is now green coffee: chemically changed by fruit metabolism, microbes and drying, but still waiting for roasting to create most familiar coffee aroma.",
      },
    ],
  },
  "wet-hulled": {
    label: "Wet-hulled",
    subtitle: "Parchment comes off early",
    process:
      "Known as giling basah in Indonesia, this method removes parchment while the bean is still soft and much wetter than ordinary export-ready coffee, then finishes drying the exposed green bean.",
    whatStays: "Mucilage is removed early; parchment protects only the first, short drying stage.",
    cup:
      "Often associated with a heavy body and earthy, herbal or savoury notes. Those are common associations, not unavoidable chemical consequences.",
    control: "Pre-dry moisture · huller pressure · weather · exposed-bean drying · sorting",
    risk:
      "Soft beans are easier to squash, split or nick in the huller. Removing parchment early also exposes the seed directly to oxygen, microbes and humid air.",
    steps: [
      {
        name: "Pulp and wash",
        action: "Cherries are depulped, briefly fermented or rested, then washed to remove much of the mucilage.",
        chemistry:
          "As in washed coffee, enzymes and microbes loosen pectin while consuming mucilage sugars and producing organic acids and alcohols.",
      },
      {
        name: "Short pre-dry",
        action: "Parchment coffee dries only part of the way—commonly to roughly 30–35% moisture—so it can move quickly through a humid supply chain.",
        chemistry:
          "The seed remains pliable and water activity is still high. It is not ready for safe long-term storage.",
      },
      {
        name: "Wet-hull",
        action: "A specially adjusted huller strips parchment from the still-soft bean.",
        chemistry:
          "Mechanical stress can distort the cellular structure or nick the surface. The usual protective barrier disappears much earlier than in other methods.",
      },
      {
        name: "Finish drying exposed",
        action: "Bare green coffee returns to patios or dryers until it reaches a stable moisture range.",
        chemistry:
          "Water leaves faster without parchment, but the seed also has more direct contact with oxygen, equipment and environmental microbes.",
      },
      {
        name: "Sort carefully",
        action: "Colour, density and hand sorting remove cracked, discoloured and otherwise damaged beans.",
        chemistry:
          "Physical damage matters later: broken tissue takes up heat and water differently and generally ages faster in storage.",
      },
      {
        name: "Store and ship",
        action: "The finished green coffee is bagged with close attention to humidity and transit time.",
        chemistry:
          "Stable moisture and water activity still matter. Wet-hulled describes when parchment left the bean, not permission to store the final coffee wet.",
      },
    ],
  },
  controlled: {
    label: "Controlled fermentation",
    subtitle: "The variables become a recipe",
    process:
      "The producer deliberately controls one or more fermentation variables—time, temperature, oxygen, pressure, pH or starter culture—before choosing whether to wash the coffee or carry fruit into drying.",
    whatStays: "It depends: whole cherry, depulped mucilage or washed parchment can each enter a controlled protocol.",
    cup:
      "Can make striking fruit, floral, spice or wine-like profiles more repeatable. A dramatic process name still tells us less than the actual temperature, time, oxygen and endpoint.",
    control: "Ripeness · sanitation · oxygen · temperature · time · pH · pressure · starter culture",
    risk:
      "A sealed tank does not remove biology; it changes which organisms prosper. Poor sanitation, runaway heat or a late endpoint can make phenolic, vinegary or solvent-like defects just as repeatable.",
    steps: [
      {
        name: "Define the substrate",
        action: "Uniform whole cherries or depulped coffee are selected so the batch begins with a known amount of fruit and mucilage.",
        chemistry:
          "Substrate decides which sugars, acids and pectins are available. Mixed ripeness makes every later control less meaningful.",
      },
      {
        name: "Prepare the vessel",
        action: "Tanks are cleaned, then left open, sealed, flushed with carbon dioxide or fitted with one-way valves according to the protocol.",
        chemistry:
          "“Anaerobic” usually means oxygen-restricted, not proof of absolute zero oxygen. Gas exchange helps select the microbial pathways that can dominate.",
      },
      {
        name: "Choose the microbiology",
        action: "Fermentation may remain spontaneous or begin with a measured yeast or bacterial starter culture.",
        chemistry:
          "Starter cultures compete for sugar and can increase particular alcohols, esters, aldehydes and organic acids. They improve control, not certainty.",
      },
      {
        name: "Measure the run",
        action: "The producer tracks time and temperature and may also follow pH, °Brix, pressure, aroma and tank liquid.",
        chemistry:
          "Sucrose is hydrolysed; simple sugars are consumed; lactic and acetic acids, ethanol and volatile compounds accumulate at different rates as the microbial population changes.",
      },
      {
        name: "Choose the endpoint",
        action: "Coffee is released, washed, cooled or moved to drying when the intended endpoint is reached.",
        chemistry:
          "Washing removes soluble metabolites and substrate; cooling and drying lower reaction rates. Leaving mucilage on carries fermentation into the drying stage.",
      },
      {
        name: "Dry, rest and disclose",
        action: "The coffee still needs controlled drying and conditioning, and a useful label records what actually happened.",
        chemistry:
          "Carbonic maceration, thermal shock and co-fermentation are not interchangeable. The useful chemistry lives in the measured protocol, not the dramatic name.",
      },
    ],
  },
};

const commonChemistry = [
  {
    name: "The substrate",
    text: "Mucilage is wet and rich in pectin, glucose, fructose, sucrose and organic acids. It is both glue to remove and food for a microbial ecosystem.",
  },
  {
    name: "The workers",
    text: "Yeasts, lactic-acid bacteria and acetic-acid bacteria appear in changing proportions. The coffee seed’s own enzymes and respiration remain active too.",
  },
  {
    name: "The products",
    text: "Microbial metabolism can produce ethanol, lactic and acetic acids, glycerol, mannitol, aldehydes and esters. Some remain outside; some are detected inside the seed.",
  },
  {
    name: "The limit",
    text: "Temperature, acidity, oxygen and available water select what can keep growing. Fermentation slows as sugars disappear, pH falls, the coffee is washed or water activity drops.",
  },
];

const dryingStages = [
  {
    name: "Free water leaves",
    text: "Airflow and heat carry water from the surface. Turning exposes wet faces and prevents cherries or parchment from clumping.",
  },
  {
    name: "Water moves outward",
    text: "The centre is now wetter than the surface. A slower finish gives moisture time to diffuse outward instead of trapping a wet core behind a dry shell.",
  },
  {
    name: "Biology quietens",
    text: "Falling water activity limits microbes, but the living seed still respires and changes sugars and amino compounds during part of the journey.",
  },
  {
    name: "Condition and protect",
    text: "A working commercial endpoint is often about 10–12% moisture, checked alongside water activity. Resting then evens out moisture before hulling and export.",
  },
];

export function CoffeePostHarvestGuide() {
  const [selectedId, setSelectedId] = useState<ProcessId>("washed");
  const selected = processGuides[selectedId];

  return (
    <div className="coffee-process-explorer">
      <div aria-label="Compare coffee post-harvest processes" className="coffee-process-selector">
        {processOrder.map((processId) => {
          const process = processGuides[processId];
          return (
            <button
              aria-pressed={selectedId === processId}
              key={processId}
              onClick={() => setSelectedId(processId)}
              type="button"
            >
              <strong>{process.label}</strong>
              <span>{process.subtitle}</span>
            </button>
          );
        })}
      </div>

      <article aria-live="polite" className="coffee-process-profile">
        <header>
          <div>
            <p className="eyebrow">Selected process</p>
            <h3>{selected.label}</h3>
          </div>
          <p>{selected.process}</p>
        </header>

        <dl className="coffee-process-facts">
          <div>
            <dt>What stays on the seed?</dt>
            <dd>{selected.whatStays}</dd>
          </div>
          <div>
            <dt>Common cup tendency</dt>
            <dd>{selected.cup}</dd>
          </div>
          <div>
            <dt>Variables worth recording</dt>
            <dd>{selected.control}</dd>
          </div>
          <div>
            <dt>Where it can go wrong</dt>
            <dd>{selected.risk}</dd>
          </div>
        </dl>

        <ol className="coffee-process-steps">
          {selected.steps.map((step, index) => (
            <li key={step.name}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h4>{step.name}</h4>
                <p>{step.action}</p>
              </div>
              <div>
                <small>Chemically</small>
                <p>{step.chemistry}</p>
              </div>
            </li>
          ))}
        </ol>
      </article>

      <section className="coffee-process-chemistry">
        <header>
          <p className="eyebrow">What fermentation actually means</p>
          <h3>It is not a flavour coating</h3>
          <p>
            Fermentation is microbial and enzymatic conversion happening around a living seed. Washing is a physical
            removal step. Drying is water transport plus continuing biology. They overlap, which is why the same named
            process can produce radically different coffee.
          </p>
        </header>
        <div>
          {commonChemistry.map((item) => (
            <article key={item.name}>
              <h4>{item.name}</h4>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="coffee-drying-guide">
        <header>
          <div>
            <p className="eyebrow">The stage every path shares</p>
            <h3>Drying is a controlled race against water</h3>
          </div>
          <p>
            Too slow and microbes, mould or uncontrolled acids get more time. Too fast or too hot and the outside can
            dry before the centre, stressing the seed. Patios, raised beds, shade and mechanical dryers are different
            ways of controlling the same gradient.
          </p>
        </header>
        <ol>
          {dryingStages.map((stage, index) => (
            <li key={stage.name}>
              <span>{index + 1}</span>
              <h4>{stage.name}</h4>
              <p>{stage.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <p className="coffee-process-source">
        Research basis:{" "}
        <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5165123/" rel="noreferrer" target="_blank">
          De Bruyn et al., post-harvest microbiota and metabolites
        </a>
        ;{" "}
        <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC6863779/" rel="noreferrer" target="_blank">
          Zhang et al., wet-processing variables
        </a>
        ;{" "}
        <a
          href="https://www.frontiersin.org/journals/microbiology/articles/10.3389/fmicb.2021.713969/full"
          rel="noreferrer"
          target="_blank"
        >
          Elhalis et al., inoculated fermentation
        </a>
        ;{" "}
        <a href="https://pubmed.ncbi.nlm.nih.gov/38324553/" rel="noreferrer" target="_blank">
          Jakkaew et al., coffee drying
        </a>
        ; and{" "}
        <a
          href="https://iad.ucdavis.edu/sites/g/files/dgvnsk4906/files/inline-files/Neil%20Rotta%20Thesis%20-%20Final%20Full%20Text%20%282020%29_1.pdf"
          rel="noreferrer"
          target="_blank"
        >
          UC Davis, post-harvest operations and wet hulling
        </a>
        . These studies describe particular coffees and conditions, so I treat flavour descriptions as tendencies,
        not laws.
      </p>
    </div>
  );
}
