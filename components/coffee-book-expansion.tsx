type DetailCard = {
  title: string;
  summary: string;
  points: string[];
  note?: string;
};

type MethodCard = {
  name: string;
  family: string;
  cup: string;
  mechanics: string;
  watch: string;
};

const plantTimeline = [
  {
    label: "Seed and nursery",
    text: "A germinating coffee seed first stands upright like a tiny soldier. The seedling normally spends about 6–12 months in a nursery before it is strong enough for the farm.",
  },
  {
    label: "Young tree",
    text: "The plant puts energy into roots, leaves and branches. A commercial crop commonly takes around three years, so replacing a sick field is not a quick reset.",
  },
  {
    label: "Flowering",
    text: "Rain after a dry period can trigger a sudden flush of white flowers. Arabica can self-pollinate, but flowers on one tree do not all become ripe fruit at once.",
  },
  {
    label: "Cherry",
    text: "The fruit may need as long as nine months to ripen. Warmth, water, shade, altitude and the tree’s health decide how quickly those months pass.",
  },
] as const;

const plantDetails: DetailCard[] = [
  {
    title: "Arabica is already a hybrid",
    summary:
      "Arabica was formed when Coffea canephora and Coffea eugenioides crossed naturally, followed by a doubling of chromosomes.",
    points: [
      "That ancient event probably happened in the Ethiopian region where Arabica still holds its deepest genetic diversity.",
      "Most cultivated Arabica outside Ethiopia descends from a surprisingly narrow set of plants, which helps explain its vulnerability to disease and heat.",
      "Canephora is usually sold under the word Robusta, but it is a genetically broad species, not one clone or one automatically low-quality flavour.",
      "There are many other Coffea species. Most are not major commercial crops, but their genetics may become increasingly valuable as climates change.",
    ],
  },
  {
    title: "A bean is one half of a seed pair",
    summary:
      "A normal cherry contains two flat-sided seeds facing each other beneath parchment and silverskin.",
    points: [
      "Skin surrounds pulp, then sticky mucilage, parchment and a thin silverskin before we reach the seed.",
      "If only one seed develops, it rounds into a peaberry. This happens in roughly a small single-digit share of a crop.",
      "Peaberry is a shape and sorting class, not a guarantee of extra sweetness or quality.",
      "The seed is alive through much of processing. Drying is therefore dehydration of biological tissue, not only removal of fruit.",
    ],
  },
  {
    title: "Variety, cultivar and varietal are not the same word",
    summary:
      "Coffee labels casually mix these words, but they describe different things.",
    points: [
      "A variety is a botanical rank or, in coffee trade language, a recognisable cultivated lineage such as Bourbon.",
      "A cultivar is a plant selected and maintained by people for useful traits.",
      "A landrace is a locally adapted population, often genetically messier than one uniform cultivar.",
      "Varietal is better used for a product made from a variety. The tree itself is a variety or cultivar.",
    ],
  },
  {
    title: "The tree is making trade-offs",
    summary:
      "Yield, flavour potential, compact growth and disease resistance rarely arrive together without a compromise.",
    points: [
      "Coffee leaf rust damages leaves and photosynthesis; severe infection can strip a tree and collapse future crops.",
      "Coffee berry borer enters the cherry and reproduces around the seed, reducing both usable yield and quality.",
      "High-yield compact plants can demand more nutrition, while old high-quality varieties may be tall and disease-susceptible.",
      "A resistant name is not permanent protection. Pathogens evolve, resistance can fail and field management still matters.",
    ],
  },
  {
    title: "The tidy origin legends are mostly too tidy",
    summary:
      "Coffee drinking is documented by the late fifteenth century, while the famous goat and saint stories are much harder to prove.",
    points: [
      "The better-supported route runs from the plant’s Ethiopian home into cultivation and drinking in Yemen.",
      "Coffeehouses spread through the Ottoman world, then into seventeenth-century Europe and later colonial production systems.",
      "Instant coffee, pressure espresso and modern specialty coffee are much later branches of the same travelling drink.",
      "A memorable legend can be worth telling as folklore, but it should not be mistaken for evidence.",
    ],
  },
  {
    title: "Coffee is not the world’s second-most-traded commodity",
    summary:
      "The phrase is repeated constantly, but it depends on a shifting and usually undefined comparison.",
    points: [
      "The commodity C-price is a trading benchmark; it does not know a farm’s cost or a cup’s quality.",
      "Direct trade, relationship coffee and fairly traded coffee describe different promises and have no single shared definition.",
      "Exporters and importers can add real value through milling, finance, quality control, consolidation, shipping and risk management.",
      "Traceability costs money. A short-looking chain is not automatically fair, and a longer one is not automatically exploitative.",
    ],
  },
] as const;

const greenCoffeeSteps = [
  {
    label: "Wet mill",
    text: "Cherry becomes dried parchment or dried whole cherry. Sorting, depulping, fermentation, washing and drying belong here, depending on the process.",
  },
  {
    label: "Condition",
    text: "Parchment coffee commonly rests for several weeks. Moisture redistributes through the seed and the protective layer reduces handling damage.",
  },
  {
    label: "Dry mill",
    text: "Parchment or dried fruit is hulled away. Screens, density tables, colour sorters and human eyes remove physical defects and divide lots.",
  },
  {
    label: "Pack and move",
    text: "Jute provides strength but little vapour protection. Hermetic liners or vacuum packs reduce humidity and oxygen exchange during hot ports and long container journeys.",
  },
] as const;

const greenCoffeeDetails: DetailCard[] = [
  {
    title: "Dry enough, but not damaged",
    summary:
      "Fresh cherry begins around 60% moisture and export green coffee commonly ends near 10–12%. The path between them matters as much as the endpoint.",
    points: [
      "A surface can feel dry while the centre remains wet, so a slower finish lets internal water move outward.",
      "Thick layers, weak airflow and rain create hot, wet pockets where mould or unwanted fermentation can continue.",
      "Very aggressive heat can stress the seed, create uneven moisture and shorten storage life.",
      "Moisture percentage and water activity answer related but different questions; neither should be treated as a perfect quality number alone.",
    ],
  },
  {
    title: "Rest is not ageing for flavour",
    summary:
      "The reposo between drying and dry milling is mainly conditioning and logistics, not the same idea as deliberately ageing wine.",
    points: [
      "A common resting window is roughly 30–60 days, though producers adapt it to process, climate and shipping.",
      "Parchment shields the green seed from direct abrasion and slows environmental exchange.",
      "Rest can make moisture more uniform before hulling, which reduces brittle edges and erratic milling.",
      "Old or poorly stored green coffee can fade, become woody or take on bag and warehouse flavours; more age is not automatically more complexity.",
    ],
  },
  {
    title: "Sorting labels can fool us",
    summary:
      "Screen size, peaberry, AA, SHB and similar grades describe a physical or trade category, not a sensory score.",
    points: [
      "Screening can make roasting more even by grouping beans of similar dimensions.",
      "Density sorting can remove many damaged or immature beans, but density also changes with variety and moisture.",
      "Colour sorting finds visible defects while hand sorting still catches shapes and colours a machine misses.",
      "The useful question is what a grade measured. A large bean can still taste poor, and a small bean can be excellent.",
    ],
  },
  {
    title: "Shipping is still part of processing",
    summary:
      "A careful lot can lose its character after the farm if it absorbs humidity, overheats or sits for months in an unsuitable bag.",
    points: [
      "Jute is breathable; a sealed liner reduces moisture and odour exchange but costs more and changes handling.",
      "Vacuum packaging gives still stronger protection for small, valuable lots, although it is impractical for every commodity shipment.",
      "Container walls and ports can become very hot. Condensation and repeated humidity changes age coffee quickly.",
      "Traceability should include the mill, exporter and shipment, not stop at a romantic farm name.",
    ],
  },
] as const;

const roastDetails: DetailCard[] = [
  {
    title: "Colour and time are separate controls",
    summary:
      "Two coffees can finish at the same colour after very different journeys and taste nothing alike.",
    points: [
      "A short, energetic roast and a long, gentle roast do not expose the seed to the same sequence of temperature, moisture and gas changes.",
      "Bean colour is useful, but surface and ground colour can differ; the measuring device and sample preparation matter too.",
      "Development after first crack changes roast character, acidity, bitterness and solubility, but one development percentage cannot travel unchanged between machines.",
      "The green coffee sets the ceiling. Roasting can reveal, balance or bury it, but it cannot rebuild damaged raw material.",
    ],
  },
  {
    title: "Roasting is overlapping chemistry",
    summary:
      "There is no single moment when one neat reaction finishes and the next begins.",
    points: [
      "Water leaves while the structure becomes more porous and internal pressure rises.",
      "Maillard and Strecker chemistry connect reducing sugars with amino compounds, creating colour and many aroma precursors.",
      "Sugar fragmentation, caramelisation and pyrolysis overlap as temperature rises.",
      "Hundreds of volatile compounds are formed and destroyed. A dark roast can lose origin-specific aromas while gaining smoke, spice and heavier roast notes.",
    ],
  },
  {
    title: "Heat reaches the bean by several routes",
    summary:
      "Drum, air, radiant and hybrid machines shift the balance; none uses only one pure kind of heat transfer.",
    points: [
      "A solid drum adds contact with hot metal, radiation from surfaces and convection from moving gas.",
      "A fluid or spouted bed uses fast air to carry most heat and to move the beans at the same time.",
      "Tangential paddles and centrifugal bowls solve large-batch mixing without relying on a rotating drum.",
      "Airflow also removes moisture, smoke and chaff, so changing it affects much more than temperature.",
    ],
  },
  {
    title: "Drop, cool, degas, then stale",
    summary:
      "The roast is not finished until the beans stop cooking, and freshness is not the same as brewing immediately.",
    points: [
      "Fast cooling prevents stored heat from continuing to roast the batch. Industrial water quenching can be controlled, but careless quenching risks uneven moisture.",
      "Carbon dioxide leaves quickly at first, then more slowly. Very fresh coffee can resist wetting and produce unstable espresso.",
      "At the same time, aroma escapes and oils oxidise. Darker, more porous coffee tends to change faster.",
      "Rest gives gas time to settle; staling is the later loss and oxidation we are trying to delay.",
    ],
  },
] as const;

const extractionDetails: DetailCard[] = [
  {
    title: "Strength is not extraction",
    summary:
      "Strength, or TDS, is how concentrated the drink is. Extraction yield is how much of the dry dose moved into the liquid.",
    points: [
      "A short espresso can be very strong but relatively low in extraction because little water was available.",
      "A long filter brew can be weaker while extracting a greater share of the grounds.",
      "The familiar 18–22% band is a historical useful zone, not a law of taste.",
      "Roast, green quality, water, grinder and preference can make excellent cups outside that band.",
    ],
    note: "Practical percolation estimate: extraction yield = TDS × beverage mass ÷ dry coffee dose.",
  },
  {
    title: "Average extraction hides the local mess",
    summary:
      "Two brews can report the same extraction yield even when one bed was evenly used and the other had channels beside dry pockets.",
    points: [
      "Evenness often matters more than chasing the highest possible number.",
      "Fast channels can wash a narrow path harshly while neighbouring particles remain barely wet.",
      "Fines and large particles extract at different rates and can release different balances of compounds.",
      "A high number produced through clogging and channels may taste worse than a lower, more even brew.",
    ],
  },
  {
    title: "Dissolution is only the first movement",
    summary:
      "Water dissolves material, diffusion moves it through a porous particle and advection carries it away in flowing liquid.",
    points: [
      "Fines contain many broken cells and give up accessible material quickly.",
      "The centre of a large, lightly roasted particle can take minutes to become fully wet.",
      "Temperature changes dissolution, diffusion and water viscosity; it does not simply turn one extraction-speed dial.",
      "Changing grind is not chemically identical to changing time because it also changes the particle distribution and the bed’s flow paths.",
    ],
  },
  {
    title: "Immersion and percolation keep different water around the coffee",
    summary:
      "Immersion water becomes progressively more concentrated; percolation keeps replacing it with fresher solvent.",
    points: [
      "Immersion therefore slows naturally and is often forgiving about an extra minute.",
      "Percolation is efficient and the bed self-filters, but it is more vulnerable to channels, bypass and clogging.",
      "Spent grounds commonly hold more than twice their dry mass in water, so water poured in is not beverage collected.",
      "An AeroPress starts with immersion and ends with pressured filtration. It is a hybrid, not a miniature espresso machine.",
    ],
  },
] as const;

const waterDetails: DetailCard[] = [
  {
    title: "Alkalinity and hardness are independent",
    summary:
      "They are often bundled together under the word minerals, which hides the two most useful controls.",
    points: [
      "Alkalinity, usually from bicarbonate, buffers coffee acids. Too much can flatten brightness; very little can make acidity feel exposed.",
      "General hardness mainly counts calcium and magnesium. Its extraction and sensory mechanisms are less certain than many online recipes imply.",
      "Both are commonly written as ppm as CaCO₃ so chemically different ions can be compared on one equivalent scale.",
      "pH alone cannot tell us buffering capacity. Two waters at pH 7 can behave very differently in coffee.",
    ],
  },
  {
    title: "There is no perfect mineral recipe",
    summary:
      "A useful bright starting point may sit near 20 ppm alkalinity, while roughly 40–50 ppm is common in specialty recipes; neither is compulsory.",
    points: [
      "Coffee, roast and preference decide how much acid buffering feels balanced.",
      "Published recipes span a broad hardness range and often converge more closely on moderate alkalinity.",
      "Calcium versus magnesium claims should be treated as hypotheses and sensory choices, not settled universal chemistry.",
      "Chlorine, odour and contamination must be fixed before fine-tuning mineral numbers.",
    ],
  },
  {
    title: "Scale is a different problem again",
    summary:
      "Temporary hardness describes the overlap between hardness ions and alkalinity that can precipitate inside hot equipment.",
    points: [
      "Heat drives carbonate scale onto boilers, kettles and narrow water paths.",
      "A water can taste acceptable yet still damage an espresso machine over time.",
      "Reverse osmosis or distilled water gives a clean base, but using it completely unmineralised can taste thin and may be unsuitable for some equipment.",
      "Adding weak acid to hard tap water does not magically remove every mineral or make composition predictable.",
    ],
  },
  {
    title: "Measure the thing you actually care about",
    summary:
      "A cheap conductivity meter estimates total dissolved material; it cannot separate hardness from alkalinity.",
    points: [
      "KH and GH titration kits are more relevant for coffee-water diagnosis.",
      "Using a larger sample can improve the coarse resolution of drop-count tests.",
      "When mixing water, food-grade salts and their exact hydrate forms matter because bound water changes the required mass.",
      "Concentrates make tiny doses easier to weigh, but they need clean containers, careful labels and sensible storage.",
    ],
  },
] as const;

const grindingDetails: DetailCard[] = [
  {
    title: "A grinder makes a distribution",
    summary:
      "The dial does not produce one particle size. It produces a peak, a tail of boulders and a very important population of fines.",
    points: [
      "Particle count, mass, surface area and expected soluble contribution make the same grind look different on a graph.",
      "Small particles dominate available surface and can dominate hydraulic resistance even when they are a small share by mass.",
      "Coffee particles are irregular rather than spherical, so one diameter cannot describe every flow path or diffusion distance.",
      "A setting number has no portable meaning between grinders—and often not after changing burrs in the same grinder.",
    ],
  },
  {
    title: "Flat versus conical is not a flavour ranking",
    summary:
      "Those words describe broad geometry, not the whole cutting system.",
    points: [
      "Burr diameter, tooth stages, sharpness, alignment, motor torque, rotation speed and feed rate all change the output.",
      "Misalignment broadens the distribution and can make one section of the burr do most of the work.",
      "New burrs season as microscopic edges settle; old burrs eventually blunt and crush more.",
      "Starting the motor before feeding can avoid grinding part of the dose while the burrs are still accelerating.",
    ],
  },
  {
    title: "The bean changes the grind",
    summary:
      "The same setting does not fracture every coffee in the same way.",
    points: [
      "Roast development, density, moisture, temperature and decaffeination change brittleness.",
      "Dark and decaf coffees often make more fines and may need a coarser setting to avoid clogging.",
      "Hopper pressure, popcorning, exchange retention and hidden old grounds can change a supposedly identical dose.",
      "Equal input and output weight does not prove zero retention; yesterday’s coffee can still exchange with today’s.",
    ],
  },
  {
    title: "Static tricks and sifting have consequences",
    summary:
      "A tiny surface mist can reduce static, but every intervention changes the experiment.",
    points: [
      "A very small amount of water on the beans can reduce charge and messy retention; soaking them is a different and bad idea.",
      "Heat, dark roast and surface oil increase clumping and aroma loss during grinding.",
      "Sifting is slow and removes coffee as well as particles. It changes bed resistance and demands a complete redial.",
      "Regrinding boulders is not free: it creates another distribution and usually another batch of fines.",
    ],
  },
] as const;

const flowDetails: DetailCard[] = [
  {
    title: "Gravity is a very small pressure source",
    summary:
      "An 8 cm water column produces only around 0.008 bar, so a pour-over depends heavily on permeability.",
    points: [
      "Flow responds to water height, bed depth, filter area, viscosity and the size and shape of pores through the packed grounds.",
      "Hotter water flows more easily partly because its viscosity is lower, separate from its chemical effect on extraction.",
      "A deeper bed generally slows drawdown; dose matters because it changes depth, not because grams have their own hydraulic magic.",
      "A bed around a few centimetres deep is a useful starting defence against easy channels, not a universal dripper law.",
    ],
  },
  {
    title: "Blooming is about wetting",
    summary:
      "The aim is not a photogenic dome. It is to get water into every part of a percolation bed before bulk flow begins.",
    points: [
      "Roast gas can repel water and open low-resistance routes while it escapes.",
      "Bubbles continuing well after the bloom can reveal dry pockets.",
      "Coarse light-roast particles may need longer for their cores to wet; dark coffee can become harsh during the same long wait.",
      "A true immersion start needs early mixing, not a separate bloom, because all of the water is already present.",
    ],
  },
  {
    title: "Fines migrate and rewrite the bed",
    summary:
      "Once water starts moving, the bed is no longer a fixed pile of particles.",
    points: [
      "Flow can detach fines and carry them deeper into the coffee or onto the paper.",
      "Local clogging redirects water, which creates more unevenness than the longer total time suggests.",
      "Violent swirling, wall washing, vibration and hard AeroPress pressing can move more fines.",
      "If a brew is badly stalled, forcing the last water through a channelled bed can add harshness; stopping and diluting separately may taste cleaner.",
    ],
  },
  {
    title: "Drawdown time is evidence, not a target shared by everyone",
    summary:
      "Pour rate, pulse count, filter, grinder, temperature, dose and even the definition of start and finish all change the clock.",
    points: [
      "A repeatable time on your own setup is useful because a sudden change tells you something moved.",
      "Matching another person’s 3:00 does not prove that the beds had the same extraction or flow.",
      "Grinding finer can eventually lower effective extraction when clogging and channels overwhelm the extra surface area.",
      "Taste the coffee before fixing a slow brew. Some fines-heavy coffees remain delicious; others become muted and dry.",
    ],
  },
] as const;

const filterDetails: DetailCard[] = [
  {
    title: "The coffee bed is the first filter",
    summary:
      "Percolation can look clear because the packed grounds trap suspended material before the paper does.",
    points: [
      "Pouring a finished immersion slurry through paper does not recreate the same depth filtration.",
      "Paper retains more fines and some oil; metal passes more of both and gives greater body and cloudiness.",
      "Clarity is therefore a mechanical choice, not proof of higher extraction or better coffee.",
      "A thicker paper can taste cleaner while also changing resistance and heat loss.",
    ],
  },
  {
    title: "Exposed paper area matters",
    summary:
      "A large filter can behave like a tiny one when a smooth brewer wall blocks most of its pores.",
    points: [
      "Ribs and folds keep drainage routes open and increase the area available to flow.",
      "Paper creping adds effective surface and room to capture fines before the sheet clogs.",
      "Dry-water flow tests do not predict in-brew flow because different papers load with coffee fines differently.",
      "A brewer or filter that seals against the server can trap air and stop flow even when the bed is not clogged.",
    ],
  },
  {
    title: "Bleached, natural and cloth",
    summary:
      "Filter material changes flavour, but maintenance and preparation decide whether that change is pleasant.",
    points: [
      "Bleached paper generally contributes less cardboard-like flavour than unbleached paper.",
      "Rinsing should be tested for the actual paper rather than performed as ritual; steep rinse water and taste it.",
      "Cloth can combine oil retention with relatively fast flow, but trapped oils become rancid and damp cloth supports microbes.",
      "If cloth is not cleaned immediately and stored correctly, its romantic appearance is not worth the off-flavour risk.",
    ],
  },
  {
    title: "Dripper geometry creates bypass",
    summary:
      "Water can travel around the bed completely or cross only its upper edge before escaping through the wall.",
    points: [
      "Cones stay relatively deep at small doses; flat beds change depth more noticeably with dose.",
      "Wall ribs increase paper area but can also create routes that dilute the drink without extracting the lower bed.",
      "Central pouring does not eliminate bypass because water can move laterally before it exits.",
      "A device name is not a recipe. Paper fit, hole obstruction, dose and server ventilation can dominate the result.",
    ],
  },
] as const;

const kettleDetails: DetailCard[] = [
  {
    title: "A kettle is an agitation tool",
    summary:
      "The useful question is not whether a spout looks elegant, but whether it can distribute water at a repeatable rate and depth.",
    points: [
      "A low smooth stream can drill a narrow hollow; a very high broken stream tends to agitate only near the surface.",
      "The deepest useful agitation often happens just below the height where the stream begins to splatter audibly.",
      "Simple, repeatable coverage matters more than drawing a perfect spiral.",
      "Fines-prone coffee usually needs gentler agitation because turbulence can migrate particles and close the filter.",
    ],
  },
  {
    title: "The number on the kettle is not the slurry",
    summary:
      "The brewer, air and coffee absorb heat before the water reaches a stable bed temperature.",
    points: [
      "Plastic is often the most thermally forgiving simple dripper material.",
      "Heavy ceramic and glass absorb substantial heat; thin metal warms quickly but also conducts heat outward.",
      "Vacuum-insulated brewers can keep slurry much closer to kettle temperature.",
      "Altitude lowers boiling point, and kettle calibration can drift, so a thermometer check is more useful than arguing over one displayed degree.",
    ],
  },
  {
    title: "More agitation is not automatically more even",
    summary:
      "Agitation can separate particles and refresh their surfaces, but it can also compact the bed and move fines.",
    points: [
      "A restrained bloom swirl can erase dry pockets and flatten cracks.",
      "Constant swirling or aggressive pulse pouring can increase clogging and bypass.",
      "Pressurised shower heads distribute several streams but may lose more heat and fluidise the bed.",
      "Kettle, grinder, filter and coffee need to be treated as one hydraulic system.",
    ],
  },
  {
    title: "Heat advice must name the brewer and roast",
    summary:
      "The same kettle setting gives different slurry temperatures in a glass cone, plastic V60, AeroPress and insulated flat bed.",
    points: [
      "Light coffee often tolerates or benefits from hotter brewing, especially when the brewer loses substantial heat.",
      "Darker coffee may taste cleaner with cooler water when roast bitterness already dominates.",
      "Cooler water is more viscous and can slow the bed, so a temperature change may also require a hydraulic adjustment.",
      "Temperature should be dialled by taste after grind and flow are under control, not chosen from a varietal slogan.",
    ],
  },
] as const;

const freshnessDetails: DetailCard[] = [
  {
    title: "Gas is not freshness flavour",
    summary:
      "Carbon dioxide is evidence of roasting and time, but too much of it can prevent even wetting.",
    points: [
      "Dark and fast roasts commonly create and release more gas.",
      "A one-way valve lets pressure escape while limiting fresh oxygen entering a sealed bag.",
      "In espresso, gas helps create crema; in filter coffee, it mostly needs to get out of the water’s way.",
      "A huge bloom is not a direct score for aroma, quality or how good the coffee will taste.",
    ],
  },
  {
    title: "Coffee does not stale in one direction",
    summary:
      "Some aromas disappear quickly, others linger, and oxidation creates new stale or rancid flavours.",
    points: [
      "Time, heat, oxygen, moisture and ultraviolet light are the main enemies.",
      "Darker, more porous beans lose aroma and expose oil faster.",
      "Repeatedly opening a large rigid container replaces protective headspace with fresh air.",
      "A compressible bag or movable-lid canister can reduce headspace more effectively.",
    ],
  },
  {
    title: "Freeze portions, not the whole daily bag",
    summary:
      "Freezing can preserve sealed coffee for months when water and repeated air exchange are kept out.",
    points: [
      "Portion before freezing so the remaining coffee stays sealed.",
      "Brew or grind the dose while it is still cold; opening and warming the full bag invites condensation.",
      "Vacuum sealing is helpful for long storage but can pull some aroma and is not worth repeating every day.",
      "The simple hierarchy is sealed future bags, cool and dark active coffee, then airtight frozen portions for anything much later.",
    ],
  },
  {
    title: "Different coffees break and brew differently",
    summary:
      "Origin, variety, process and roast are entangled, so a bag name can warn us without dictating a recipe.",
    points: [
      "Some Ethiopian coffees in one large brew log clogged more often, but the cause could be correlated moisture, density, size, roast or variety.",
      "Decaf is the clearest practical case: it often makes more fines and may need a coarser, gentler recipe.",
      "Washed, natural, high-grown and dark are probability shifts, not guaranteed drawdown or flavour outcomes.",
      "Taste first, observe flow second and avoid turning a correlation into a law about an entire country.",
    ],
  },
] as const;

const espressoDetails: DetailCard[] = [
  {
    title: "A shot recipe needs four numbers",
    summary:
      "Dose, beverage yield, time and temperature make an espresso repeatable enough to diagnose.",
    points: [
      "A shorter yield is usually stronger and less extracted; a longer yield is usually weaker and more extracted.",
      "Ristretto, espresso and lungo are ratio families rather than one global set of exact millilitres.",
      "Shot time is evidence about flow, not an independent flavour target that overrides taste.",
      "Weighing the beverage separates a real grinder change from the accident of stopping a shot early.",
    ],
  },
  {
    title: "Distribution matters more than heroic tamping",
    summary:
      "Water finds weak paths through a puck, so an even, level bed matters before the pump begins.",
    points: [
      "Break clumps and distribute grounds without creating dense edges or a hollow centre.",
      "Tamp levelly. Once the puck is compacted, much more force adds little benefit.",
      "A dirty basket, shower screen or gasket changes flow and contributes old oil flavour.",
      "The grinder normally gives a larger quality improvement than upgrading a capable machine first.",
    ],
  },
  {
    title: "Crema is beautiful but not a quality certificate",
    summary:
      "Pressure releases trapped gas and disperses oils and colloids; surface-active compounds hold the bubbles together.",
    points: [
      "Crema thickness responds to roast, age, species, trapped carbon dioxide and concentration.",
      "It cannot prove that the green coffee was good, the puck extracted evenly or the machine was clean.",
      "Crema can carry intense bitterness, so stirring a shot before tasting makes its layers more comparable.",
      "Advertised maximum pump pressure is less useful than stable pressure and temperature at the coffee.",
    ],
  },
  {
    title: "Machine architecture changes workflow",
    summary:
      "Thermoblock, heat-exchange and dual-boiler machines trade cost, recovery, steam capacity and direct control.",
    points: [
      "A thermoblock heats water on demand and can be compact, but temperature stability depends on its design and flow control.",
      "A heat exchanger brews through tubing inside a steam boiler, allowing simultaneous steaming with more temperature-management technique.",
      "Dual boilers separate brewing and steaming for direct control at greater cost and complexity.",
      "Low-scale water, backflushing where appropriate and regular gasket, screen and steam-wand cleaning protect both flavour and hardware.",
    ],
  },
  {
    title: "Milk texturing is first air, then integration",
    summary:
      "Fine foam comes from introducing air while milk is cool, then rolling the bubbles into the liquid as it heats.",
    points: [
      "Fresh milk generally holds foam better; fat changes texture and how aroma is released.",
      "A rolling vortex breaks large bubbles into a glossy, pourable microfoam rather than a dry cap.",
      "Excess heat damages sweetness and texture, so stop before the milk smells cooked.",
      "Purge before steaming, then wipe and purge the wand immediately. Dried milk is both a flavour and hygiene problem.",
    ],
  },
] as const;

const measurementDetails: DetailCard[] = [
  {
    title: "A refractometer needs a protocol",
    summary:
      "A precise-looking TDS number is only useful when sampling and temperature are controlled.",
    points: [
      "Use a dry server, mix the beverage, take a prompt sample and keep it covered while it cools.",
      "Clean and dry the prism, then check zero with appropriate pure water.",
      "Different coffees and suspended material can create small systematic differences.",
      "Use the number to test a brewing idea; do not use it to overrule a cup that tastes clearly worse.",
    ],
  },
  {
    title: "Particle-size tools see different realities",
    summary:
      "Laser diffraction, sieves and image analysis each measure a different projection of an irregular grind.",
    points: [
      "Laser systems are fast but depend on optical and particle-shape models.",
      "Sieves are sensitive to shaking, adhesion, clogging and lost fines.",
      "Image analysis preserves visible shape but struggles with touching particles, depth and the smallest fines.",
      "Vibration segregates a dose, so a pinch from the top is not a representative sample of the grinder.",
    ],
  },
  {
    title: "Flow and heat can be logged, with caveats",
    summary:
      "Two scales can reconstruct pour and drip rates; probes can follow slurry temperature, but the instruments also disturb the brew.",
    points: [
      "A bed probe can make a channel, while a wall probe may mostly measure brewer heat loss.",
      "Flow curves can reveal changing permeability and bypass more clearly than one final drawdown time.",
      "Roast-colour readings depend on reflected-light calibration and whether whole or ground coffee is measured.",
      "Filter-pore images depend on contrast, resolution and shape assumptions; a graph is not an intrinsic brand ranking.",
    ],
  },
  {
    title: "Models are useful because they are incomplete",
    summary:
      "Darcy flow, capillary wetting and extraction mass balances isolate variables that a real brew keeps changing.",
    points: [
      "Paper and coffee are layered resistances; whichever is more restrictive can dominate the whole system.",
      "Ideal drawdown equations assume a stable bed, while real particles migrate, swell, compact, bypass and receive pulsed water.",
      "Conical brewers behave very differently with free wall bypass versus a fully sealed filter.",
      "The full extraction balance includes solubles left in retained bed water; the everyday TDS equation is a practical simplification.",
    ],
  },
] as const;

const methodCards: MethodCard[] = [
  {
    name: "Pour-over",
    family: "Percolation",
    cup: "Clarity and a wide range of strength",
    mechanics: "Fresh water crosses a bed that also acts as a depth filter.",
    watch: "Full bloom wetting, level bed, controlled agitation, bypass and late clogging.",
  },
  {
    name: "Batch brewer",
    family: "Percolation",
    cup: "Repeatable larger brews",
    mechanics: "A shower head automates water distribution over a paper-filtered bed.",
    watch: "Real brew temperature, minimum practical batch, bed coverage and a thermal carafe instead of a hot plate.",
  },
  {
    name: "French press",
    family: "Immersion",
    cup: "Full body with oil and fine sediment",
    mechanics: "Coffee steeps in one body of water before coarse metal separation.",
    watch: "Wet everything early, break the crust, allow settling and pour gently without forcing the siltiest liquid through.",
  },
  {
    name: "AeroPress",
    family: "Immersion → pressured filtration",
    cup: "Compact, flexible and usually clean",
    mechanics: "A short steep is followed by hand pressure through paper or metal.",
    watch: "Pressing harder mostly raises flow and fines movement. Standard orientation is safer and holds more than inverted brewing.",
  },
  {
    name: "Moka pot",
    family: "Steam-pressure percolation",
    cup: "Strong, short and textured",
    mechanics: "Vapour pressure in the lower chamber pushes hot water through a fixed basket.",
    watch: "Use hot starting water, never tamp or cover the safety valve, keep heat restrained and stop at sustained gurgling.",
  },
  {
    name: "Siphon",
    family: "Heated immersion → vacuum drawdown",
    cup: "Aromatic and clean with theatrical control",
    mechanics: "Vapour pressure raises water; cooling creates the vacuum that pulls coffee through the filter.",
    watch: "Seat the filter, wet evenly, control heat and agitation, then decant before retained heat keeps cooking the cup.",
  },
  {
    name: "Espresso",
    family: "Pump-pressure percolation",
    cup: "Very concentrated with emulsion and crema",
    mechanics: "A pump drives hot water through a fine, compact puck at useful controlled pressure.",
    watch: "Weigh dose and yield, distribute levelly, judge by taste rather than crema, and buy the grinder before chasing machine pressure claims.",
  },
  {
    name: "Cold brew",
    family: "Cool immersion",
    cup: "Smooth, often concentrated and easy to dilute",
    mechanics: "Low temperature slows transport, so contact becomes much longer.",
    watch: "Food-safe time and temperature, a clear dilution plan, fine-particle separation and refrigerated storage.",
  },
] as const;

const troubleshootingRows = [
  {
    symptom: "Sharp, thin and short",
    first: "Check strength, full wetting and whether the brew ran through obvious channels.",
    move: "If flow was even, try finer; if the bed clogged around channels, reduce agitation or go coarser instead.",
  },
  {
    symptom: "Dry, rough or mouth-puckering",
    first: "Look for a stalled late drawdown, wall washing and a silty final portion.",
    move: "Reduce fines migration, stop a badly clogged brew earlier or use a more clog-resistant filter.",
  },
  {
    symptom: "Weak but otherwise pleasant",
    first: "This may be concentration, not extraction.",
    move: "Use a stronger ratio or dilute less before changing grind and destroying an already balanced extraction.",
  },
  {
    symptom: "Strong, heavy and muddled",
    first: "Check ratio, metal filtration, suspended fines and whether the roast itself is dark.",
    move: "Add water, use paper, reduce agitation or choose a lighter roast before assuming the extraction is too high.",
  },
  {
    symptom: "Flat acidity and little separation",
    first: "Check alkalinity, stale coffee, excessive heat loss and uneven flow.",
    move: "Test lower-alkalinity water, fresher coffee or a more thermally stable brewer one variable at a time.",
  },
  {
    symptom: "Same recipe, suddenly much slower",
    first: "Look at coffee age, decaf or roast change, grinder retention, filter seating and water temperature.",
    move: "Do not chase the old time blindly. Taste, then coarsen or lower agitation only if the cup is actually worse.",
  },
] as const;

function BookPageNote({ children }: { children: string }) {
  return <p className="coffee-book-page-note">{children}</p>;
}

function DetailGrid({
  cards,
  label,
}: {
  cards: readonly DetailCard[];
  label: string;
}) {
  return (
    <div aria-label={label} className="coffee-book-detail-grid">
      {cards.map((card) => (
        <details key={card.title}>
          <summary>
            <span>
              <strong>{card.title}</strong>
              <small>{card.summary}</small>
            </span>
            <i aria-hidden="true">+</i>
          </summary>
          <div>
            <ul>
              {card.points.map((point) => <li key={point}>{point}</li>)}
            </ul>
            {card.note ? <p className="coffee-book-formula">{card.note}</p> : null}
          </div>
        </details>
      ))}
    </div>
  );
}

function DeepDiveSection({
  cards,
  description,
  eyebrow,
  id,
  title,
}: {
  cards: readonly DetailCard[];
  description: string;
  eyebrow: string;
  id: string;
  title: string;
}) {
  return (
    <section aria-labelledby={`${id}-title`} className="coffee-book-deep-dive scroll-mt-28" id={id}>
      <header>
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h4 id={`${id}-title`}>{title}</h4>
        </div>
        <p>{description}</p>
      </header>
      <DetailGrid cards={cards} label={`${title} details`} />
    </section>
  );
}

export function CoffeePlantDeepDive() {
  return (
    <div className="coffee-book-layer">
      <section aria-labelledby="coffee-plant-life-title" className="coffee-book-journey">
        <header>
          <div>
            <p className="eyebrow">A crop measured in years</p>
            <h4 id="coffee-plant-life-title">From seed to the next ripe cherry</h4>
          </div>
          <p>
            A coffee tree makes us wait. Even once it fruits, one rainstorm can set off flowers that become cherries
            ripening at different speeds on the same branch.
          </p>
        </header>
        <ol>
          {plantTimeline.map((stage) => (
            <li key={stage.label}>
              <strong>{stage.label}</strong>
              <p>{stage.text}</p>
            </li>
          ))}
        </ol>
      </section>
      <DetailGrid cards={plantDetails} label="Coffee plant and species details" />
      <BookPageNote>
        Book note · Rewritten from The World Atlas of Coffee, revised edition, PDF pages 11–31 and 50–60.
      </BookPageNote>
    </div>
  );
}

export function CoffeeGreenCoffeeDeepDive() {
  return (
    <div className="coffee-book-layer">
      <section aria-labelledby="coffee-green-journey-title" className="coffee-book-journey">
        <header>
          <div>
            <p className="eyebrow">After drying is not after processing</p>
            <h4 id="coffee-green-journey-title">How parchment becomes exportable green coffee</h4>
          </div>
          <p>
            The wet mill gets most of the attention, but a coffee can still be improved, mixed up or damaged while it
            rests, passes through the dry mill and sits inside a shipping container.
          </p>
        </header>
        <ol>
          {greenCoffeeSteps.map((stage) => (
            <li key={stage.label}>
              <strong>{stage.label}</strong>
              <p>{stage.text}</p>
            </li>
          ))}
        </ol>
      </section>
      <DetailGrid cards={greenCoffeeDetails} label="Green coffee storage and milling details" />
      <BookPageNote>
        Book note · Rewritten from The World Atlas of Coffee, revised edition, PDF pages 32–54.
      </BookPageNote>
    </div>
  );
}

export function CoffeeRoastProfileDeepDive() {
  return (
    <div className="coffee-book-layer">
      <DetailGrid cards={roastDetails} label="Roast profile and chemistry details" />
      <BookPageNote>
        Book note · Rewritten from The World Atlas of Coffee, revised edition, PDF pages 63–80 and 182–186.
      </BookPageNote>
    </div>
  );
}

export function CoffeeBrewingScience() {
  return (
    <div className="coffee-brewing-science">
      <DeepDiveSection
        cards={extractionDetails}
        description="I used to think extraction was one slider. It is more useful to separate concentration, average extraction and how evenly every part of the bed was used."
        eyebrow="The model beneath every recipe"
        id="coffee-strength-extraction"
        title="Strength, extraction and evenness"
      />
      <DeepDiveSection
        cards={waterDetails}
        description="Water is the solvent and most of the finished drink. The useful numbers describe buffering, hardness and scale risk—not one mysterious total mineral score."
        eyebrow="The solvent"
        id="coffee-water"
        title="Water without the magic recipe"
      />
      <DeepDiveSection
        cards={grindingDetails}
        description="Grinding decides accessible surface and the tiny channels through which water must travel. This is why the grinder often changes the cup more than the brewer."
        eyebrow="Particles, not a setting number"
        id="coffee-grinding"
        title="What a grinder actually makes"
      />
      <DeepDiveSection
        cards={flowDetails}
        description="Percolation is efficient because fresh water keeps arriving, but the bed moves, clogs and creates new paths while the brew is happening."
        eyebrow="Inside the coffee bed"
        id="coffee-flow"
        title="Flow, bloom, channels and clogging"
      />
      <DeepDiveSection
        cards={filterDetails}
        description="The coffee, paper and brewer wall form one layered filter. Change the area, pore loading or bypass and the same grind behaves like a different recipe."
        eyebrow="Clarity and resistance"
        id="coffee-filters"
        title="Filters and dripper geometry"
      />
      <DeepDiveSection
        cards={kettleDetails}
        description="The kettle distributes water and agitation while the brewer decides how much heat and bypass survive. Technique belongs to the whole system."
        eyebrow="Pouring and temperature"
        id="coffee-kettles"
        title="Kettles, agitation and heat"
      />
      <DeepDiveSection
        cards={freshnessDetails}
        description="Roast gas, oxygen, oils, packaging and the coffee’s own brittleness all continue changing what happens long after the roaster stops."
        eyebrow="Before the water arrives"
        id="coffee-freshness"
        title="Freshness, storage and coffee-specific behaviour"
      />
      <DeepDiveSection
        cards={espressoDetails}
        description="Espresso compresses distribution, flow, temperature and ratio into a few seconds. The machine supplies useful pressure; the puck decides where it goes."
        eyebrow="Concentration under pressure"
        id="coffee-espresso"
        title="Espresso, crema, machines and milk"
      />

      <section aria-labelledby="coffee-methods-title" className="coffee-method-atlas scroll-mt-28" id="coffee-methods">
        <header>
          <div>
            <p className="eyebrow">Choose the mechanics first</p>
            <h4 id="coffee-methods-title">Brewing methods as different flow systems</h4>
          </div>
          <p>
            A brewer does not prescribe one flavour. It chooses how fresh water arrives, how particles are filtered,
            how much pressure is available and how easy it is to keep the extraction even.
          </p>
        </header>
        <div>
          {methodCards.map((method) => (
            <article key={method.name}>
              <header>
                <h5>{method.name}</h5>
                <span>{method.family}</span>
              </header>
              <p>{method.mechanics}</p>
              <dl>
                <div>
                  <dt>Often chosen for</dt>
                  <dd>{method.cup}</dd>
                </div>
                <div>
                  <dt>Watch carefully</dt>
                  <dd>{method.watch}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="coffee-troubleshooting-title"
        className="coffee-troubleshooting scroll-mt-28"
        id="coffee-troubleshooting"
      >
        <header>
          <div>
            <p className="eyebrow">Taste, observe, then change one thing</p>
            <h4 id="coffee-troubleshooting-title">A less misleading troubleshooting table</h4>
          </div>
          <p>
            Sour does not always mean under-extracted and bitter does not always mean over-extracted. Roast, strength,
            water and uneven flow can imitate each other, so the first check matters.
          </p>
        </header>
        <div className="coffee-troubleshooting-table" role="table" aria-label="Coffee brewing troubleshooting">
          <div className="coffee-troubleshooting-head" role="row">
            <span role="columnheader">What I taste or see</span>
            <span role="columnheader">Check first</span>
            <span role="columnheader">A useful next move</span>
          </div>
          {troubleshootingRows.map((row) => (
            <div key={row.symptom} role="row">
              <strong role="cell">{row.symptom}</strong>
              <p role="cell">{row.first}</p>
              <p role="cell">{row.move}</p>
            </div>
          ))}
        </div>
      </section>

      <DeepDiveSection
        cards={measurementDetails}
        description="Measurement makes a recipe easier to compare, but every instrument has a sampling method, a model and a way to disturb the thing it measures."
        eyebrow="Useful uncertainty"
        id="coffee-measurement"
        title="Instruments, data and the limits of the model"
      />

      <aside className="coffee-repeatability-note">
        <div>
          <p className="eyebrow">The boring things are excellent diagnostics</p>
          <h4>Make the next cup comparable</h4>
        </div>
        <p>
          Weigh coffee, water and beverage. Keep the water, paper placement, pour rate, bloom, grinder temperature and
          definition of brew time consistent. Clean the grinder and brewer, level the bed and taste at several
          temperatures. A refractometer can support this work, but only with a dry server, cooled sealed sample, clean
          prism and regular zero check. The number is evidence; the cup still decides.
        </p>
      </aside>

      <BookPageNote>
        Book note · Every section above is independently rewritten from The Physics of Filter Coffee, PDF pages
        16–239, with method context rewritten from The World Atlas of Coffee, revised edition, PDF pages 97–180.
      </BookPageNote>
    </div>
  );
}

export function CoffeeBookResearchNote() {
  return (
    <aside className="coffee-book-research-note">
      <p className="eyebrow">Books used for this expansion</p>
      <h3>A research shelf, not copied prose</h3>
      <p>
        I read every PDF page of James Hoffmann’s <i>The World Atlas of Coffee</i>, revised 2018 edition, and Jonathan
        Gagné’s <i>The Physics of Filter Coffee</i>. The guide text is rewritten and reorganised into this site’s
        plant-to-cup structure. The atlas supplies botany, processing, roasting, methods and origin geography; the
        physics book corrects and deepens the extraction, water, grinding, filtration, flow, heat and storage model.
        Production totals from the 2018 atlas are deliberately not presented as current facts.
      </p>
    </aside>
  );
}
