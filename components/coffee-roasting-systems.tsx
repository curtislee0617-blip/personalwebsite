const roasterScales = [
  {
    capacity: "80–120 g",
    description: "Sample roasters make just enough coffee to assess a green lot without sacrificing a production batch.",
    label: "Lab & buying table",
  },
  {
    capacity: "100 g–1 kg",
    description: "Purpose-built home and prosumer machines give a single person real control over heat, air and time.",
    label: "Personal",
  },
  {
    capacity: "0.8–8 kg",
    description: "Small drums and electric hybrids suit cafés, training rooms and micro-roasteries roasting little and often.",
    label: "Café & micro",
  },
  {
    capacity: "7–70 kg",
    description: "Production roasters balance batch flexibility with the rhythm, cooling and emissions needs of a working roastery.",
    label: "Production",
  },
  {
    capacity: "23–880 kg",
    description: "Large batch systems use drums, shovels, bowls or air to keep a much heavier coffee bed moving evenly.",
    label: "Industrial batch",
  },
  {
    capacity: "Up to 5 t/hour",
    description: "High-throughput plants judge the whole line: loading, roasting, cooling, cleaning and the time between batches.",
    label: "Industrial line",
  },
] as const;

const roasterTypes = [
  {
    description:
      "A rotating metal cylinder folds the coffee through a mixed environment of hot wall, radiant heat and moving gas. The drum stores heat, so charge temperature and batch size matter.",
    heat: "Mixed; metal contact, radiation and hot air",
    movement: "Rotating drum and internal vanes",
    name: "Solid-wall drum",
    range: "Personal to industrial",
    strapline: "The familiar workhorse",
  },
  {
    description:
      "Openings let more roast air cross the bean mass while the cylinder still tumbles it. Lower drum mass can make the system feel quicker, but it is still not a purely convective machine.",
    heat: "Mixed, with greater airflow through the bed",
    movement: "Perforated drum and vanes",
    name: "Perforated drum",
    range: "Sample to production",
    strapline: "A drum with more air access",
  },
  {
    description:
      "A blower drives heated air through a distributor or narrow spout. Once velocity is high enough, the beans lift, circulate and mix; air supplies most of the heat and does the moving too.",
    heat: "Predominantly convective",
    movement: "High-velocity air",
    name: "Fluid-bed / spouted-bed",
    range: "Sample to industrial",
    strapline: "Air does two jobs",
  },
  {
    description:
      "A fan pulls roasting gas through a chaff separator, reheats much of it and sends it around again. The beans may sit in a drum or be moved by air, so recirculation describes the air circuit, not one chamber shape.",
    heat: "Hot recirculated gas, often with other paths",
    movement: "Drum, paddles or air, depending on the machine",
    name: "Recirculating hot-air",
    range: "Shop to industrial",
    strapline: "A loop rather than one pass",
  },
  {
    description:
      "Electric elements, induction or infrared emitters can be combined with a drum and controlled airflow. The useful word is hybrid: the operator can apportion energy through several paths.",
    heat: "Conduction, convection and radiant heat",
    movement: "Usually a drum or paddles",
    name: "Electric / radiant hybrid",
    range: "Personal to production",
    strapline: "Several heat paths at once",
  },
  {
    description:
      "The roast chamber stays still while rotating shovels sweep and fold the coffee. Hot air enters tangentially around the chamber, making this architecture useful for large, repeatable batches.",
    heat: "Hot air with heated-surface contact",
    movement: "Central shaft and rotating shovels",
    name: "Tangential",
    range: "Industrial batch",
    strapline: "The paddles move, not the chamber",
  },
  {
    description:
      "A fast rotating bowl carries coffee outwards and upwards before it returns towards the centre. That thin, moving layer can accept heat quickly and supports very high plant throughput.",
    heat: "Controlled hot air across a moving layer",
    movement: "Rotating bowl and centrifugal force",
    name: "Centrifugal",
    range: "Industrial batch or line",
    strapline: "A bowl rather than a drum",
  },
  {
    description:
      "Coffee enters and leaves in a steady stream rather than as one discrete charge. Continuous is an operating mode, not a heat-transfer method: the chamber can still use air, paddles or centrifugal motion.",
    heat: "Depends on the chamber architecture",
    movement: "Continuous feed and discharge",
    name: "Continuous roasting",
    range: "Industrial line",
    strapline: "Throughput changes the workflow",
  },
] as const;

const energySources = [
  {
    detail: "A flame heats roast air, metal or both. It offers high power but brings combustion gas and emissions management with it.",
    name: "Gas or liquid fuel",
  },
  {
    detail: "Resistance elements can heat the incoming air or the chamber itself. They scale from tiny air roasters to ventless shop machines.",
    name: "Electric resistance",
  },
  {
    detail: "An electromagnetic field heats a conductive drum directly, giving a responsive metal heat source without a flame beneath it.",
    name: "Induction",
  },
  {
    detail: "Infrared or halogen emitters send radiant energy towards the bean and drum surfaces, usually alongside moving hot air.",
    name: "Radiant",
  },
] as const;

const fluidBedBeans = Array.from({ length: 14 }, (_, index) => index);
const fluidBedAirStreams = Array.from({ length: 5 }, (_, index) => index);
const fluidBedChaff = Array.from({ length: 4 }, (_, index) => index);
const drumBeans = Array.from({ length: 8 }, (_, index) => index);

function FluidBedCutaway() {
  return (
    <figure className="coffee-air-cutaway">
      <header>
        <div>
          <p className="eyebrow">Air moves the coffee</p>
          <h5>Fluidised or spouted bed</h5>
        </div>
        <span>Mostly convection</span>
      </header>
      <div aria-hidden="true" className="coffee-air-machine coffee-fluid-bed-machine">
        <span className="coffee-machine-label coffee-fluid-exhaust-label">moist air + chaff</span>
        <div className="coffee-fluid-cyclone">
          <span>cyclone</span>
          <div>
            {fluidBedChaff.map((piece) => (
              <i key={piece} />
            ))}
          </div>
        </div>

        <div className="coffee-fluid-chamber">
          <span className="coffee-machine-label">roast chamber</span>
          <div className="coffee-fluid-air">
            {fluidBedAirStreams.map((stream) => (
              <i key={stream} />
            ))}
          </div>
          <div className="coffee-fluid-beans">
            {fluidBedBeans.map((bean) => (
              <i key={bean} />
            ))}
          </div>
        </div>

        <div className="coffee-fluid-plenum">
          <span>air plenum</span>
        </div>
        <div className="coffee-fluid-heater">
          <span>heater</span>
          <i />
          <i />
          <i />
        </div>
        <div className="coffee-roaster-fan">
          <span>↻</span>
          <small>blower</small>
        </div>
        <span className="coffee-fluid-inlet">cool air</span>
        <span className="coffee-fluid-flow-label">heated air rises</span>
      </div>
      <figcaption>
        The blower forces air through a heater and into the plenum. Above the distributor, velocity lifts the beans
        into a circulating fountain; as moisture and chaff leave through the exhaust, a cyclone separates the solids.
      </figcaption>
    </figure>
  );
}

function RecirculatingAirCutaway() {
  return (
    <figure className="coffee-air-cutaway">
      <header>
        <div>
          <p className="eyebrow">Air loops; the drum moves the coffee</p>
          <h5>Recirculating hot-air drum</h5>
        </div>
        <span>Mixed heat</span>
      </header>
      <div aria-hidden="true" className="coffee-air-machine coffee-recirculating-machine">
        <div className="coffee-loop-pipe coffee-loop-pipe-top">
          <span>→</span>
          <i />
        </div>
        <div className="coffee-loop-pipe coffee-loop-pipe-right">
          <span>↓</span>
          <i />
        </div>
        <div className="coffee-loop-pipe coffee-loop-pipe-bottom">
          <span>←</span>
          <i />
        </div>
        <div className="coffee-loop-pipe coffee-loop-pipe-left">
          <span>↑</span>
          <i />
        </div>

        <div className="coffee-recirc-cyclone">
          <span>cyclone</span>
        </div>
        <span className="coffee-recirc-exhaust">controlled exhaust</span>
        <div className="coffee-recirc-heater">
          <span>reheat</span>
          <i />
          <i />
          <i />
        </div>
        <div className="coffee-recirc-fan coffee-roaster-fan">
          <span>↻</span>
          <small>fan</small>
        </div>
        <div className="coffee-recirc-chamber">
          <span className="coffee-machine-label">turning drum</span>
          <div className="coffee-recirc-drum">
            {drumBeans.map((bean) => (
              <i key={bean} />
            ))}
          </div>
        </div>
        <span className="coffee-recirc-return-label">hot air returns</span>
      </div>
      <figcaption>
        The drum tumbles the beans while a fan draws roast gas through a cyclone. Much of that cleaned gas is reheated
        and returned; a controlled bleed removes moisture and smoke so recirculation does not mean sealing everything
        inside.
      </figcaption>
    </figure>
  );
}

export function CoffeeRoastingSystems() {
  return (
    <section aria-labelledby="coffee-roaster-types-title" className="coffee-roaster-systems scroll-mt-28" id="coffee-roaster-types">
      <header className="coffee-roaster-intro">
        <div>
          <p className="eyebrow">Machine, motion and scale</p>
          <h4 id="coffee-roaster-types-title">The roaster is not a flavour button</h4>
        </div>
        <div>
          <p>
            A 100 g lab roaster and a four-tonne-per-hour line can both be called hot-air roasters, which is why the
            name alone tells us almost nothing. I find it more useful to ask three questions: what moves the beans,
            where does the heat enter, and does the air leave or loop around again?
          </p>
          <p>
            No machine is purely conduction or purely convection. A drum has hot air inside it; an air roaster still
            receives radiation from hot surfaces. The architecture changes the balance, response and mixing, but it
            does not guarantee a particular flavour or quality.
          </p>
        </div>
      </header>

      <section aria-labelledby="coffee-roaster-scale-title" className="coffee-roaster-scale">
        <header>
          <div>
            <p className="eyebrow">From a tasting bowl to a factory</p>
            <h4 id="coffee-roaster-scale-title">Representative scales, not fixed categories</h4>
          </div>
          <p>
            Batch mass and hourly output are different measurements. At larger scales, cooling and turnaround can
            limit output just as much as the roast chamber.
          </p>
        </header>
        <ol>
          {roasterScales.map((scale, index) => (
            <li key={scale.label}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{scale.label}</p>
              <strong>{scale.capacity}</strong>
              <small>{scale.description}</small>
            </li>
          ))}
        </ol>
        <p className="coffee-roaster-scale-note">
          The endpoints come from current machine specifications:{" "}
          <a href="https://www.probat.com/products/auxiliary-equipment/brz-sample-roaster/" rel="noreferrer" target="_blank">
            80–100 g for PROBAT&apos;s BRZ sample drum
          </a>
          ,{" "}
          <a href="https://www.ikawacoffee.com/blog/pro100/" rel="noreferrer" target="_blank">
            120 g for the IKAWA Pro100
          </a>
          ,{" "}
          <a href="https://aillio.com/faq" rel="noreferrer" target="_blank">
            1 kg for the Aillio Bullet
          </a>
          ,{" "}
          <a href="https://stronghold.coffee/product/s7x.sq" rel="noreferrer" target="_blank">
            up to 8 kg in Stronghold&apos;s range
          </a>
          ,{" "}
          <a href="https://loring.com/roasters/compare/" rel="noreferrer" target="_blank">
            70 kg for Loring&apos;s S70 Peregrine
          </a>
          ,{" "}
          <a
            href="https://www.probat.com/newsroom/news/neptune-4000-unrivalled-roasting-capacity/"
            rel="noreferrer"
            target="_blank"
          >
            880 kg for PROBAT&apos;s NEPTUNE 4000
          </a>
          , and{" "}
          <a href="https://www.probat.com/products/machines/roasting/jupiter-series/" rel="noreferrer" target="_blank">
            up to 5,000 kg/hour for its JUPITER line
          </a>
          .
        </p>
      </section>

      <section aria-labelledby="coffee-roaster-families-title" className="coffee-roaster-families">
        <header>
          <div>
            <p className="eyebrow">Eight useful families</p>
            <h4 id="coffee-roaster-families-title">How the beans are actually moved and heated</h4>
          </div>
          <p>
            These families overlap. A modern electric shop roaster, for example, might be a recirculating,
            perforated-drum hybrid with radiant assistance.
          </p>
        </header>
        <div className="coffee-roaster-type-grid">
          {roasterTypes.map((roaster, index) => (
            <article key={roaster.name}>
              <header>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <p>{roaster.strapline}</p>
                  <h5>{roaster.name}</h5>
                </div>
              </header>
              <p>{roaster.description}</p>
              <dl>
                <div>
                  <dt>Beans move by</dt>
                  <dd>{roaster.movement}</dd>
                </div>
                <div>
                  <dt>Heat balance</dt>
                  <dd>{roaster.heat}</dd>
                </div>
                <div>
                  <dt>Usual scale</dt>
                  <dd>{roaster.range}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="coffee-roaster-energy-title" className="coffee-roaster-energy">
        <header>
          <div>
            <p className="eyebrow">Architecture is not fuel</p>
            <h4 id="coffee-roaster-energy-title">How the machine makes heat is a separate choice</h4>
          </div>
          <p>
            “Electric” does not automatically mean fluid bed, and “gas” does not automatically mean drum. Energy
            source and chamber design can be combined in many ways.
          </p>
        </header>
        <div>
          {energySources.map((source) => (
            <article key={source.name}>
              <h5>{source.name}</h5>
              <p>{source.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="coffee-air-roaster-title" className="coffee-air-roaster-guide">
        <header>
          <div>
            <p className="eyebrow">Animated cutaways</p>
            <h4 id="coffee-air-roaster-title">Two very different meanings of “air roaster”</h4>
          </div>
          <p>
            In the first machine, air moves each bean. In the second, a drum does the mechanical work while air follows
            a recirculating thermal loop. Both depend on airflow, but their controls and temperature readings behave
            differently.
          </p>
        </header>
        <div className="coffee-air-roaster-animations">
          <FluidBedCutaway />
          <RecirculatingAirCutaway />
        </div>
      </section>

      <aside className="coffee-roaster-reading-note">
        <div>
          <p className="eyebrow">What the machine changes</p>
          <h4>Read the roast through the machine</h4>
        </div>
        <ul>
          <li>
            <strong>Thermal inertia</strong>
            <span>A heavy drum keeps releasing heat after the burner changes; a small air system can react much faster.</span>
          </li>
          <li>
            <strong>Bean movement</strong>
            <span>Paddles, vanes, bowls and air fountains expose the coffee to heat in different repeating patterns.</span>
          </li>
          <li>
            <strong>Air and smoke</strong>
            <span>Flow carries heat, moisture, chaff and smoke, so changing it affects more than one variable at once.</span>
          </li>
          <li>
            <strong>What the probes see</strong>
            <span>A thermocouple may read metal, bean mass or passing air. Curves from different machines are not directly interchangeable.</span>
          </li>
        </ul>
      </aside>

      <p className="coffee-section-source coffee-roaster-sources">
        Roaster mechanisms and representative capacities:{" "}
        <a href="https://www.ikawacoffee.com/blog/new-rob-hoos-blog/" rel="noreferrer" target="_blank">
          IKAWA on fluid-bed airflow
        </a>
        ;{" "}
        <a href="https://aillio.com/faq" rel="noreferrer" target="_blank">
          Aillio Bullet specifications
        </a>
        ;{" "}
        <a href="https://stronghold.coffee/product/s7x.sq" rel="noreferrer" target="_blank">
          Stronghold&apos;s mixed heat system
        </a>
        ;{" "}
        <a href="https://loring.com/roasters/compare/" rel="noreferrer" target="_blank">
          Loring&apos;s recirculating range
        </a>
        ;{" "}
        <a
          href="https://www.neuhaus-neotec.com/en/coffee-processing/machines-controls/roaster/detail/roaster-series-rfb/"
          rel="noreferrer"
          target="_blank"
        >
          Neuhaus Neotec&apos;s industrial hot-air system
        </a>
        ;{" "}
        <a href="https://www.probat.com/products/machines/roasting/jupiter-series/" rel="noreferrer" target="_blank">
          PROBAT JUPITER tangential roasters
        </a>
        ; and{" "}
        <a
          href="https://research.birmingham.ac.uk/en/publications/batch-scale-simulation-of-heat-and-mass-transfer-of-coffee-roasti/"
          rel="noreferrer"
          target="_blank"
        >
          University of Birmingham spouted-bed heat and mass-transfer research
        </a>
        . Product pages establish machine architecture and scale here; they are examples, not buying recommendations.
      </p>
    </section>
  );
}
