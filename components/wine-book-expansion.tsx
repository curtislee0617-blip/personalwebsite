import Image from "next/image";

export type WineEditorialPhotoData = {
  src: string;
  alt: string;
  credit: string;
  source: string;
  license: string;
  licenseUrl: string;
  position: string;
};

export function WineEditorialPhoto({
  image,
  className,
  sizes = "(max-width: 760px) calc(100vw - 5rem), (max-width: 1100px) 34vw, 420px",
}: {
  image: WineEditorialPhotoData;
  className?: string;
  sizes?: string;
}) {
  return (
    <figure className={`wine-editorial-photo${className ? ` ${className}` : ""}`}>
      <div>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          style={{ objectPosition: image.position }}
        />
      </div>
      <figcaption>
        Photo: <a href={image.source}>{image.credit}</a>
        {" · "}
        <a href={image.licenseUrl}>{image.license}</a>
      </figcaption>
    </figure>
  );
}

const vineCycle = [
  {
    stage: "Dormancy",
    timing: "winter",
    vine: "Leaves are gone and the vine lives from carbohydrates stored in its roots, trunk and old wood.",
    work: "Prune to decide where next year’s shoots can grow and how many buds—and therefore how much potential crop—to retain.",
    image: {
      src: "/recipes/wine-guide/vine-cycle/dormancy.jpg",
      alt: "Bare, pruned grapevines in a winter vineyard.",
      credit: "Arria Belli",
      source: "https://commons.wikimedia.org/wiki/File:Vineyard_winter.jpg",
      license: "CC BY 2.5",
      licenseUrl: "https://creativecommons.org/licenses/by/2.5/",
      position: "center 56%",
    },
  },
  {
    stage: "Budburst",
    timing: "early spring",
    vine: "Sap rises and compound buds open. Primary buds carry most of the crop; backup buds may grow after frost but are usually less fruitful.",
    work: "Watch frost forecasts, remove badly placed shoots and begin tying or positioning the young canopy.",
    image: {
      src: "/recipes/wine-guide/vine-cycle/budburst.jpg",
      alt: "Pale green grapevine shoots and folded young leaves emerging at budburst.",
      credit: "Jennifer Woodard Maderazo",
      source: "https://commons.wikimedia.org/wiki/File:Grape_leaves_during_budbreak.jpg",
      license: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
      position: "center center",
    },
  },
  {
    stage: "Flowering & fruit set",
    timing: "late spring",
    vine: "Tiny self-pollinating flowers become berries. Coulure is failed fruit set: cold or cloudy bloom weather, water stress or overly vigorous shoots can limit carbohydrate supply to the flowers. Cold, wet or windy fruit-set conditions can also leave many small seedless berries, called millerandage.",
    work: "Keep the canopy open and healthy. There is very little a grower can repair once flowering weather has reduced the crop.",
    image: {
      src: "/recipes/wine-guide/vine-cycle/flowering.jpg",
      alt: "Open grapevine flowers and unopened buds on a green inflorescence.",
      credit: "Darijanus",
      source: "https://commons.wikimedia.org/wiki/File:Vitis_vinifera_-_flower.jpg",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      position: "center 45%",
    },
  },
  {
    stage: "Berry growth",
    timing: "early summer",
    vine: "Cells divide, berries remain hard and green, and malic acid, tannin and herbaceous compounds accumulate. Shoots are still competing strongly with fruit.",
    work: "Manage water and vigour, tuck shoots, trim when needed and keep disease away from tight bunches.",
    image: {
      src: "/recipes/wine-guide/vine-cycle/berry-growth.jpg",
      alt: "A compact bunch of hard green Merlot berries before véraison.",
      credit: "David Huang",
      source: "https://commons.wikimedia.org/wiki/File:Merlot_grapes_pre-veraison.jpg",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
      position: "center center",
    },
  },
  {
    stage: "Véraison & ripening",
    timing: "mid to late summer",
    vine: "Berries soften and change colour. Sugar and water arrive, malic acid is respired, skins build aroma and colour, and seeds gradually lose green bitterness.",
    work: "Adjust fruit exposure, protect against sunburn and begin sampling separate blocks rather than trusting one vineyard average.",
    image: {
      src: "/recipes/wine-guide/vine-cycle/veraison.jpg",
      alt: "Pinot Noir grapes at véraison, with green berries turning blue-purple on the vine.",
      credit: "Philip Larson",
      source: "https://commons.wikimedia.org/wiki/File:Pinot_noir_grapes_going_through_veraison.jpg",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
      position: "center center",
    },
  },
  {
    stage: "Harvest & leaf fall",
    timing: "late summer to autumn",
    vine: "Picking stops berry ripening, but the leaves keep photosynthesising afterwards and replenish the vine’s reserves before they fall.",
    work: "Choose the compromise between sugar, acid, flavour, tannin and weather; then protect enough healthy leaf area for next spring.",
    image: {
      src: "/recipes/wine-guide/vine-cycle/harvest-leaf-fall.jpg",
      alt: "Ripe dark wine grapes among red autumn vine leaves.",
      credit: "Ilares Riolfi",
      source: "https://commons.wikimedia.org/wiki/File:Early_October_wine_grapes_with_leaf_color_change.jpg",
      license: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
      position: "65% center",
    },
  },
] as const;

const vineyardDecisions = [
  {
    title: "Site before vine",
    label: "establishment",
    text: "Slope, frost drainage, water, access, labour, machinery and appellation rules belong in the same decision as climate and soil. A beautiful steep plot may cost far more to farm; a flat warm one can make healthy fruit cheaply and consistently.",
    image: {
      src: "/recipes/wine-guide/planting/site-and-rows.jpg",
      alt: "Aerial view of vineyard parcels whose rows curve and change direction across the landscape.",
      credit: "Taxiarchos228",
      source: "https://commons.wikimedia.org/wiki/File:Aerial_View_-_Landschaft_Markgr%C3%A4flerland1.jpg",
      license: "CC BY 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
      position: "50% 50%",
    },
  },
  {
    title: "Variety, clone and selection",
    label: "plant material",
    text: "The variety sets the broad ripening window. A clone narrows berry size, yield or aroma within it. Mass selection takes cuttings from many good vines, preserving more diversity but also demanding careful disease screening.",
    image: {
      src: "/recipes/wine-guide/planting/plant-material.jpg",
      alt: "Dense parallel rows of young grafted grapevines growing in a vine nursery.",
      credit: "Graftedvines",
      source: "https://commons.wikimedia.org/wiki/File:Grafted_vine_rows.JPG",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      position: "50% 55%",
    },
  },
  {
    title: "The rootstock is half the plant",
    label: "below ground",
    text: "Most vinifera is grafted for phylloxera protection. Rootstocks also alter vigour, rooting depth and tolerance of drought, lime, salinity, waterlogging or nematodes, so there is no universally superior one.",
    image: {
      src: "/recipes/wine-guide/planting/rootstock-graft.jpg",
      alt: "Close view of a woody graft union on a young grapevine beside its support stake.",
      credit: "W.carter",
      source: "https://commons.wikimedia.org/wiki/File:Graft_union_on_vines_in_Lysekil_1.jpg",
      license: "CC0 1.0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      position: "40% 50%",
    },
  },
  {
    title: "Training and pruning",
    label: "permanent shape",
    text: "Head or cordon training describes old wood; spur or replacement-cane pruning describes the fruitful one-year wood retained each winter. VSP suits moderate vigour, while divided canopies spread a larger vine into more light.",
    image: {
      src: "/recipes/wine-guide/planting/training-pruning.jpg",
      alt: "Vineyard worker pruning and tying a dormant cane along a wire trellis.",
      credit: "Mark Smith",
      source: "https://commons.wikimedia.org/wiki/File:Example_of_grapevine_pruning.jpg",
      license: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
      position: "42% 50%",
    },
  },
  {
    title: "Balance is not simply low yield",
    label: "crop × canopy",
    text: "Too much fruit can delay ripening and drain stored carbohydrates. Too little can let shoots keep growing, making a dense shady canopy. The useful yield is the largest crop that this vine, site and wine style can ripen properly.",
    image: {
      src: "/recipes/wine-guide/planting/crop-canopy-balance.jpg",
      alt: "Pinot Noir bunches lying between vineyard rows after green harvesting reduced the crop.",
      credit: "kvins.com",
      source: "https://commons.wikimedia.org/wiki/File:Leftovers_of_green_harvesting.jpg",
      license: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
      position: "50% 67%",
    },
  },
  {
    title: "Soil is a living reservoir",
    label: "nutrients",
    text: "Structure, oxygen, drainage, water holding, humus and microbial activity decide how roots function. Compost and cover crops work slowly; mineral fertilisers act more directly. Excess nitrogen can be as troublesome as deficiency.",
    image: {
      src: "/recipes/wine-guide/planting/soil-cover-crop.jpg",
      alt: "Chianti vineyard rows separated by a tall, continuous green cover crop.",
      credit: "drdcuddy",
      source: "https://commons.wikimedia.org/wiki/File:Organic_Chianti_vineyard_with_expansive_cover_crop_Italia_2010.jpg",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
      position: "50% 55%",
    },
  },
  {
    title: "Water is timed, not merely supplied",
    label: "irrigation",
    text: "Drip irrigation is precise and can carry nutrients. Mild deficit between fruit set and véraison can slow shoot growth; severe stress closes stomata and stops photosynthesis. Dry farming can be a choice, a legal requirement or simply no available water.",
    image: {
      src: "/recipes/wine-guide/planting/drip-irrigation.jpg",
      alt: "Drip-irrigated vines in dry soil, with black irrigation lines running beneath the rows.",
      credit: "Greg Rinder, CSIRO",
      source: "https://commons.wikimedia.org/wiki/File:CSIRO_ScienceImage_4206_Drip_irrigation_vineyard_near_Angle_Vale_SA_2003.jpg",
      license: "CC BY 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
      position: "50% 70%",
    },
  },
  {
    title: "Rows create a microclimate",
    label: "canopy",
    text: "Orientation, shoot position and leaf removal alter light, berry temperature, wind and drying speed. More exposure can reduce green methoxypyrazines and improve colour, but hot afternoon sun can scar berries and flatten aroma.",
    image: {
      src: "/recipes/wine-guide/planting/canopy-microclimate.jpg",
      alt: "Dormant wine vines trained on V-shaped trellises to open the canopy to light and air.",
      credit: "Sandy Austin",
      source: "https://commons.wikimedia.org/wiki/File:Tatura_Trellis_%22V-shape%22_grape_vine_system.jpg",
      license: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
      position: "50% 70%",
    },
  },
] as const;

const farmingApproaches = [
  {
    name: "Sustainable",
    idea: "Balance environmental, social and financial survival rather than follow one prohibited-input list.",
    detail: "Integrated pest management monitors pressure, protects useful predators and treats only when an action threshold is reached.",
  },
  {
    name: "Organic",
    idea: "Reject most synthetic fertilisers, herbicides and pesticides, then certify the permitted alternatives.",
    detail: "Cover crops, compost, sulfur and copper can be useful, but repeated tractor passes, soil compaction and copper accumulation remain real trade-offs.",
  },
  {
    name: "Biodynamic",
    idea: "Add a whole-farm philosophy, preparations and a cosmological calendar to an organic baseline.",
    detail: "Some growers value the attention it forces onto the farm; controlled evidence separating its effect from careful organic farming remains limited.",
  },
  {
    name: "Precision",
    idea: "Map variation with GPS, imaging, soil sensors and yield monitors, then treat blocks or even vines differently.",
    detail: "It can reduce wasted water and sprays and sharpen picking decisions, but equipment, interpretation and clean data all cost money.",
  },
] as const;

const vineyardHazards = [
  {
    name: "Spring frost",
    trigger: "Tender buds or shoots fall below freezing.",
    consequence: "Primary shoots die; secondary buds may carry a smaller, later crop.",
    response: "Avoid frost pockets, delay pruning, train higher, keep bare soil, or use water, wind machines or heaters when conditions suit.",
  },
  {
    name: "Freeze, hail & wind",
    trigger: "Deep winter cold kills wood; hail tears leaves and berries; wind breaks shoots or strips flowers.",
    consequence: "Yield can disappear in one event and damaged berries become entry points for rot.",
    response: "Choose hardy material and protected sites, hill soil over grafts, use nets where light permits, keep replacement trunks and spread plots or insure the crop.",
  },
  {
    name: "Drought & heat",
    trigger: "Water supply cannot match transpiration, especially during a heatwave.",
    consequence: "Stomata close, photosynthesis slows, berries shrink and exposed fruit can sunburn.",
    response: "Build soil organic matter, reduce competition, use adapted roots and varieties, shade fruit and irrigate efficiently where lawful and possible.",
  },
  {
    name: "Rain & waterlogging",
    trigger: "Rain arrives at flowering, during ripening or just before picking; roots sit without oxygen.",
    consequence: "Poor set, diluted berries, splitting, vigorous shade and disease; saturated ground may also stop machinery.",
    response: "Drain and structure the soil, use slopes and cover strategically, open the canopy and decide whether an early pick is safer than the forecast.",
  },
  {
    name: "Fungal disease",
    trigger: "Warm, wet conditions favour downy mildew and grey rot; powdery mildew needs moisture for some primary infections but can spread through warm, relatively dry weather, especially in dense, shaded canopies. Pruning wounds admit trunk fungi.",
    consequence: "Leaves lose function, berries split or rot, off-flavours develop and vines may decline permanently.",
    response: "Airflow, monitoring, timely sprays and clean pruning matter. Noble rot is only useful when healthy ripe fruit meets humid mornings and dry afternoons.",
  },
  {
    name: "Pests & systemic disease",
    trigger: "Phylloxera, nematodes, moths, mites and birds attack directly; insects also spread bacterial and viral disease.",
    consequence: "Roots fail, bunches are wounded, ripening slows and infected vines can become unproductive or die.",
    response: "Use matched rootstocks and clean nursery stock, quarantine movement, monitor vectors, encourage predators and remove incurably infected vines.",
  },
  {
    name: "Fire & smoke",
    trigger: "Wildfire smoke reaches fruit, with risk increasing after véraison.",
    consequence: "Volatile phenols bind to sugars in the berry, hide during tasting and can reappear through fermentation and bottle ageing.",
    response: "Test fruit by small ferments, reduce skin contact and harsh handling, separate lots and accept that no treatment guarantees complete removal.",
  },
] as const;

const harvestClocks = [
  ["Sugar", "refractometer", "Potential alcohol, not flavour maturity; many dry table wines are picked around 19–25 °Brix."],
  ["Acid", "titration + pH", "Total acid, individual acids and pH move differently and control both taste and cellar stability."],
  ["Aroma", "taste + analysis", "Green, fresh, ripe and dried-fruit characters can change quickly near the end."],
  ["Phenolics", "skins + seeds", "Colour, extractability, bitterness and tannin maturity matter most when skins will ferment."],
  ["Weather", "forecast + logistics", "A perfect lab number is useless if rain, rot, labour or tank space prevents a clean pick."],
] as const;

const cellarReception = [
  {
    step: "Cool and protect",
    text: "Small crates reduce crushing. Night picking, refrigeration, inert gas and carefully timed sulfur slow oxidation and unwanted microbes before the chosen ferment begins.",
    image: {
      src: "/recipes/wine-guide/winemaking/reception/cool-protect.jpg",
      alt: "Freshly harvested white grape clusters resting in shallow crates on grass.",
      credit: "W.carter",
      source: "https://commons.wikimedia.org/wiki/File:Grape_harvest_in_Chateaux_Luna_vineyard_2.jpg",
      license: "CC0 1.0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      position: "50% 52%",
    },
  },
  {
    step: "Sort",
    text: "Remove leaves, insects, rot and badly unripe or shrivelled fruit. Hand sorting is flexible; optical sorting is fast and precise but expensive. Every rejected berry also reduces saleable volume.",
    image: {
      src: "/recipes/wine-guide/winemaking/reception/sorting.jpg",
      alt: "Workers’ hands sorting dark wine grapes across a winery sorting table.",
      credit: "ryanovineyards",
      source: "https://commons.wikimedia.org/wiki/File:Table_de_triage_de_la_vendange.jpg",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
      position: "50% 44%",
    },
  },
  {
    step: "Destem or keep whole",
    text: "Stems add space, tannin and fresh herbal or floral character when ripe. Whole bunches enable carbonic behaviour; destemming makes extraction and vessel filling more uniform.",
    image: {
      src: "/recipes/wine-guide/winemaking/reception/destem-or-whole.jpg",
      alt: "Whole clusters of white wine grapes being tipped into a crusher-destemmer hopper.",
      credit: "Fabio Ingrosso",
      source: "https://commons.wikimedia.org/wiki/File:Harvested_grapes_being_loaded_into_crusher_destemmer.jpg",
      license: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
      position: "52% 58%",
    },
  },
  {
    step: "Crush",
    text: "Breaking skins releases juice without deliberately breaking seeds. Crusher settings decide how many berries remain whole and how quickly skin extraction or ambient fermentation can start.",
    image: {
      src: "/recipes/wine-guide/winemaking/reception/crush.jpg",
      alt: "Dark grapes and juice falling from a crusher into a collection bucket.",
      credit: "Daniel Spiess",
      source: "https://commons.wikimedia.org/wiki/File:Crushed_grape_must.jpg",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
      position: "50% 55%",
    },
  },
  {
    step: "Press in fractions",
    text: "Free-run or low-pressure juice is gentler. Harder pressings add yield, solids, potassium and phenolics, so fractions are kept apart and blended only if they improve the wine.",
    image: {
      src: "/recipes/wine-guide/winemaking/reception/press-fractions.jpg",
      alt: "Pinot Noir juice dripping from a press into stainless-steel collection pans.",
      credit: "Robert Pitkin",
      source: "https://commons.wikimedia.org/wiki/File:Pinot_noir_juice_from_press_collecting_in_the_press_pans.jpg",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
      position: "50% 62%",
    },
  },
  {
    step: "Measure and adjust",
    text: "Sugar, acid, pH, nitrogen and fruit condition decide whether the must needs enrichment, acidification, deacidification, nutrients or simply restraint. Law determines which options exist.",
    image: {
      src: "/recipes/wine-guide/winemaking/reception/measure-must.jpg",
      alt: "A winegrower looking through a handheld refractometer to assess grape-juice sugar.",
      credit: "Kandschwar",
      source: "https://commons.wikimedia.org/wiki/File:WinzerMitRefraktometer.jpg",
      license: "CC BY-SA 2.0 DE",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/de/deed.en",
      position: "48% 45%",
    },
  },
] as const;

const pressTypes = [
  {
    name: "Pneumatic",
    scale: "small estate to large winery",
    note: "An inflatable membrane applies programmable pressure. It is gentle, can separate fractions and may be flushed with inert gas.",
  },
  {
    name: "Basket / vertical",
    scale: "small and premium batches",
    note: "Pressure comes from above and juice drains through the basket. It is slow and exposed to air, but many producers value its gentle cake and tactile control.",
  },
  {
    name: "Continuous screw",
    scale: "industrial volume",
    note: "Fruit can enter continuously, making it quick and economical. Stronger mechanical action usually means more solids and phenolics, so it suits inexpensive streams.",
  },
] as const;

const cellarControls = [
  {
    title: "Oxygen",
    text: "Needed briefly for yeast growth and useful in some red-colour and tannin reactions; dangerous when it browns delicate must or feeds acetic bacteria. Headspace, transfers and porous vessels matter more than slogans.",
  },
  {
    title: "Sulfur dioxide",
    text: "Suppresses microbes and interrupts oxidation chains. Only free molecular SO₂ is strongly active, and lower pH makes it more effective. Too little risks spoilage; too much mutes aroma and tastes hard.",
  },
  {
    title: "Temperature",
    text: "Cooling slows oxidation, microbes and fermentation; warmth speeds extraction and yeast. A ferment can make enough heat to stop itself, so tank jackets and probes are quality tools, not decoration.",
  },
  {
    title: "Yeast nutrition",
    text: "Yeast needs available nitrogen, vitamins and an early dose of oxygen. Starved cells can produce hydrogen sulfide or stop with sugar remaining, leaving a fragile wine open to spoilage.",
  },
  {
    title: "Acid and pH",
    text: "Tartaric acid is usually added in warm regions; carbonate can reduce excess acidity in cool fruit. Because pH controls colour, SO₂ and microbes, the same tasting adjustment can have a much larger technical effect.",
  },
  {
    title: "Hygiene",
    text: "Cleaning removes dirt, sanitation lowers organisms and sterilisation targets critical equipment. Hoses, valves, filler heads and porous barrels are common hiding places; good wine cannot be inspected clean later.",
  },
] as const;

const extractionMethods = [
  {
    group: "white must",
    name: "Whole-bunch pressing",
    mechanism: "Intact bunches create drainage channels and reduce broken skin before the press.",
    result: "Low solids, colour and phenolics, with gentle juice suited to sparkling bases and delicate premium white wine.",
    caution: "It requires hand-picked fruit and fills the press inefficiently, so each cycle produces less juice.",
  },
  {
    group: "white must",
    name: "Short skin contact",
    mechanism: "Cool crushed white grapes remain with skins from roughly an hour to a day before pressing.",
    result: "More terpenes, thiol precursors and texture in grapes such as Muscat, Riesling, Sauvignon or Gewürztraminer.",
    caution: "Time also extracts bitterness and tannin; warmth raises oxidation, spoilage and spontaneous-fermentation risk.",
  },
  {
    group: "white must",
    name: "Hyperoxidation",
    mechanism: "The must is deliberately saturated with oxygen so its most oxidisable phenolics brown and later precipitate.",
    result: "A post-fermentation wine more resistant to browning, sometimes with less bitterness.",
    caution: "It can destroy delicate thiols and methoxypyrazines, so it suits neutral grapes better than a highly aromatic style.",
  },
  {
    group: "white must",
    name: "Solids choice",
    mechanism: "Settling, flotation or centrifugation changes how much grape material follows juice into fermentation.",
    result: "Cleaner must favours simple fruit; more fine solids can broaden texture and aroma complexity and feed yeast.",
    caution: "Too clean can starve yeast; too dirty can make reductive sulfur, bitterness and difficult ferments.",
  },
  {
    group: "red extraction",
    name: "Cold soak",
    mechanism: "Hold crushed fruit around 4–10°C before yeast becomes active, usually with gentle cap movement.",
    result: "Water-soluble colour and aroma are extracted before alcohol begins pulling harder on tannin.",
    caution: "It uses refrigeration and tank time, and research does not show that more colour always remains after ageing.",
  },
  {
    group: "red extraction",
    name: "Cap management",
    mechanism: "Punch down, pump over, rack-and-return, rotary tanks or CO₂ pressure repeatedly reconnect skins with liquid.",
    result: "Frequency, timing and force control colour, flavour, tannin, oxygen and temperature—not just “more extraction.”",
    caution: "Late, warm and forceful work is especially effective at extracting seed and skin tannin.",
  },
  {
    group: "red extraction",
    name: "Heat and flash",
    mechanism: "Thermovinification warms must for minutes or hours; flash détente heats very quickly, then cools it under vacuum.",
    result: "Fast colour and fruit extraction, denatured rot enzymes and useful treatment of some smoke-affected fruit.",
    caution: "Equipment or energy is costly, subtle site character can be blurred and low-tannin wine may lose colour stability.",
  },
  {
    group: "whole fruit",
    name: "Carbonic maceration",
    mechanism: "Whole bunches sit in CO₂; intact berries metabolise sugar and malic acid internally before yeast finishes the juice.",
    result: "Bright kirsch, banana or cinnamon-like aroma, softer acidity, little tannin and early-drinking fruit.",
    caution: "True carbonic wine is pressed at very low alcohol; extending normal skin fermentation changes the result completely.",
  },
  {
    group: "whole fruit",
    name: "Semi-carbonic & partial whole bunch",
    mechanism: "Fruit at the bottom crushes and ferments, making the CO₂ that surrounds berries above; or whole clusters are mixed into crushed must.",
    result: "A sliding scale from carbonic perfume to the structure of a normal red ferment, often with stem spice and fresher texture.",
    caution: "Hand picking and genuinely ripe stems matter; green stems add bitterness rather than lift.",
  },
  {
    group: "after ferment",
    name: "Extended maceration",
    mechanism: "Finished red wine remains on skins after sugar is gone and extraction continues in alcoholic liquid.",
    result: "More tannin and sometimes a rounder texture as tannins and colour compounds react.",
    caution: "The cap must stay protected from spoilage, and extra time can simply extract dryness from unsuitable fruit.",
  },
] as const;

const finishingStages = [
  {
    name: "Settle & rack",
    purpose: "Gravity drops grape fragments, yeast and tartrates; clean wine is moved off the sediment.",
    tradeoff: "Very gentle and cheap in equipment, but it occupies vessels and ties up wine for longer.",
  },
  {
    name: "Fine",
    purpose: "An oppositely charged material binds microscopic colloids, haze-forming proteins, harsh tannin, browning or some odours.",
    tradeoff: "Bench trials find the smallest useful dose. Too much can strip flavour, colour or texture.",
  },
  {
    name: "Filter",
    purpose: "Depth media trap a dirty load; membranes make a final absolute barrier; cross-flow cleans itself while wine moves tangentially.",
    tradeoff: "Filtration gives reliable clarity and microbial stability, but costs equipment and can be overused.",
  },
  {
    name: "Stabilise",
    purpose: "Bentonite prevents protein haze; cold, seeding, electrodialysis or additives control tartrate crystals; filtration removes yeast and bacteria.",
    tradeoff: "Tartrates are harmless. Stability is mainly preventing an ordinary natural change from surprising the drinker.",
  },
  {
    name: "Final checks",
    purpose: "Recheck alcohol, sugar, acid, free and total SO₂, dissolved oxygen, CO₂, filterability and sensory condition.",
    tradeoff: "Blending comes before this stage because changing pH or composition can make a previously stable wine unstable again.",
  },
  {
    name: "Package",
    purpose: "Fill with low oxygen pickup, leave controlled headspace, close consistently, record the lot and keep samples.",
    tradeoff: "The closure’s oxygen transmission must fit the intended shelf life; the most expensive closure is not automatically the best match.",
  },
] as const;

const finingAgents = [
  ["Bentonite", "unstable protein", "Clay; common for white and rosé, but creates bulky lees and some wine loss."],
  ["Egg white", "firm red-wine tannin", "Gentle protein fining; animal-derived and an allergen if residues exceed local limits."],
  ["Gelatine / isinglass", "bitterness or clarity", "Very effective animal proteins; easy to over-fine and unsuitable for vegan wine."],
  ["Casein / PVPP", "brown phenolics", "Milk protein or synthetic polymer; useful for oxidised white and rosé streams."],
  ["Plant protein", "tannin and clarity", "Pea, potato and other options can replace animal proteins after bench trials."],
  ["Charcoal", "colour or strong odour", "Powerful and blunt. Treating one fraction and blending it back can avoid erasing the whole wine."],
] as const;

const packageOptions = [
  {
    name: "Natural & technical cork",
    use: "ritual, premium image and ageing",
    truth: "Natural cork is renewable and elastic but varies in oxygen ingress and can carry TCA. Technical cork is cleaned and engineered for more consistent transmission.",
  },
  {
    name: "Screwcap & glass stopper",
    use: "consistency and easy opening",
    truth: "A liner sets oxygen transmission. Very tight seals demand careful pre-bottling oxygen and sulfur management; a screwcap is not evidence of cheap wine.",
  },
  {
    name: "Glass bottle",
    use: "longest shelf life",
    truth: "Inert and impermeable but heavy and energy-intensive. Dark glass protects against light strike; lighter bottles usually matter more environmentally than decorative thickness.",
  },
  {
    name: "Bag, can & carton",
    use: "early drinking and low transport weight",
    truth: "A collapsing bag protects opened wine well; lined cans and cartons exclude light. Their barrier layers and taps set a shorter shelf life than glass.",
  },
] as const;

const sparklingRegions = [
  ["Champagne", "Chardonnay · Pinot Noir · Meunier", "traditional", "High-acid base wines, reserve blending and long lees ageing; chalk and cool northern exposures are central to the regional argument."],
  ["Crémant d’Alsace", "Pinot Blanc / Auxerrois · Pinot Gris · Riesling · Chardonnay · Pinot Noir", "traditional", "Usually fruit-led and fresh; Pinot Noir supplies rosé while aromatic varieties can keep a clear Alsace accent."],
  ["Crémant de Bourgogne", "Chardonnay · Pinot Noir · Aligoté · Gamay", "traditional", "Runs from lean northern fruit to broader southern material; grape and precise origin matter more than the word Crémant alone."],
  ["Loire", "Chenin Blanc · Chardonnay · Cabernet Franc", "traditional", "Chenin’s acid and quince-like fruit connect Crémant de Loire, Saumur and sparkling Vouvray, with sweetness and lees time varying."],
  ["Cava", "Macabeo · Xarel·lo · Parellada · Chardonnay · Pinot Noir", "traditional", "Xarel·lo gives structure, Macabeo fruit and Parellada delicacy; warmer Mediterranean fruit makes picking date especially important."],
  ["Prosecco", "Glera", "tank", "Tank fermentation protects pear, apple and blossom. The broad DOC, Asolo and the steeper Conegliano–Valdobbiadene hills should not be read as one identical landscape."],
  ["Asti", "Moscato Bianco", "single tank fermentation", "Fermentation of stored must is stopped while sugar remains, giving grapey terpenes, gentle pressure and low alcohol."],
  ["Lambrusco", "Sorbara · Salamino · Grasparossa and relatives", "mostly tank", "A family rather than one grape: pale floral Sorbara and darker tannic Grasparossa can make dry or sweet, frizzante or spumante wine."],
  ["Franciacorta", "Chardonnay · Pinot Noir · Pinot Blanc", "traditional", "A warmer Lombardy basin gives riper base wine; Satèn lowers pressure for a creamier mousse, while rosé and longer-aged styles add breadth."],
  ["Trentodoc", "Chardonnay · Pinot Noir · Pinot Blanc · Meunier", "traditional", "High Alpine vineyards combine intense light with cold nights, giving ripe aroma without surrendering the acid needed for lees ageing."],
  ["Germany", "Riesling · Pinot family and many others", "tank or traditional", "Sekt ranges from large-volume blends to estate-grown traditional-method wine. Origin and producer tell me far more than the word Sekt by itself."],
  ["England & Wales", "Chardonnay · Pinot Noir · Meunier", "traditional", "A long, marginal growing season preserves acid; chalk and clay sites can produce precise base wines, while weather makes vintage blending valuable."],
  ["United States", "Chardonnay · Pinot Noir · local varieties", "traditional and tank", "Coastal California leads premium production, but Oregon, Washington, New York and New Mexico show that altitude, latitude and water can all provide cool fruit."],
  ["Chile", "Chardonnay · Pinot Noir", "traditional and tank", "Pacific influence and high or southern sites supply freshness; large producers can blend across cool zones for consistent base wine."],
  ["Argentina", "Chardonnay · Pinot Noir", "traditional and tank", "Elevation moderates strong sun and dry heat. Acidity depends on altitude, harvest date and irrigation rather than latitude alone."],
  ["South Africa", "Chardonnay · Pinot Noir · Chenin Blanc · Pinotage", "traditional / Cap Classique", "Coastal and elevated sites bring acid; Chenin Blanc and Pinotage add local identity beside the classic Champagne grapes."],
  ["Australia", "Chardonnay · Pinot Noir · Shiraz", "traditional and tank", "Tasmania, Yarra Valley and Adelaide Hills supply cool base wine; sparkling Shiraz is the distinctive red branch."],
  ["New Zealand", "Pinot Noir · Chardonnay", "traditional", "Marlborough is the volume centre while cooler subregions and Central Otago offer increasingly precise, long-lees styles."],
] as const;

const fortificationChoices = [
  {
    title: "When the spirit enters",
    text: "Fortify during fermentation and the higher alcohol stops yeast with grape sugar left behind, as in Port, many VDNs and Madeira. Fortify a dry wine and sugar is no longer part of the decision, as with dry Sherry bases.",
  },
  {
    title: "How strong and how neutral",
    text: "A high-strength neutral spirit adds less water and less flavour; lower-strength brandy contributes more character. The spirit must be clean because fortification concentrates any roughness as well as alcohol.",
  },
  {
    title: "What happens to oxygen",
    text: "Full vessels and flor can protect wine; partly filled casks deliberately oxidise it. Small wood, hot lofts, outdoor glass vessels and fractional blending each control oxygen in a different way.",
  },
  {
    title: "Heat, biology and time",
    text: "Flor consumes alcohol and glycerol and makes acetaldehyde. Madeira uses heat and oxygen. Port chooses bottle reduction or barrel oxidation. Time is therefore not one universal ageing process.",
  },
] as const;

const wineFaults = [
  {
    fault: "Cork taint",
    clue: "damp cardboard · mould · muted fruit",
    cause: "Usually TCA from natural cork, though contaminated wood or a cellar can also carry related compounds.",
    note: "Opening or decanting does not repair it; the missing fruit is often as revealing as the smell.",
  },
  {
    fault: "Oxidation",
    clue: "premature brown colour · bruised apple · fading fruit",
    cause: "Excess oxygen during handling, filling, closure failure, heat or simply keeping a fragile wine too long.",
    note: "Nutty oxidation is correct in Oloroso or Vin Jaune; the fault is oxygen outside the intended style.",
  },
  {
    fault: "Volatile acidity",
    clue: "vinegar · nail-polish remover",
    cause: "Acetic acid bacteria, oxygen and insufficient protection create acetic acid and ethyl acetate.",
    note: "Every wine contains some. It becomes a fault when pungency or solvent character overtakes the fruit.",
  },
  {
    fault: "Reduction",
    clue: "struck match · onion · rotten egg · cabbage",
    cause: "Stressed yeast or an extremely oxygen-poor environment builds volatile sulfur compounds.",
    note: "A little smoke can be intentional complexity; severe hydrogen sulfide may lift with air, while later sulfur forms often do not.",
  },
  {
    fault: "Brettanomyces",
    clue: "barnyard · leather · medicinal spice · fruit loss",
    cause: "A spoilage yeast survives especially well in porous barrels and at higher pH with low effective sulfur.",
    note: "Some drinkers tolerate a trace, but it is not terroir and can continue erasing fruit in bottle.",
  },
  {
    fault: "Light strike",
    clue: "cabbage · drains · wet wool",
    cause: "UV and visible light react with riboflavin and sulfur-bearing compounds, especially in clear bottles.",
    note: "Sparkling and pale wines under bright shop lights are vulnerable; brown glass gives the strongest protection.",
  },
  {
    fault: "Unwanted re-fermentation",
    clue: "unexpected gas · cloudiness · pushed cork",
    cause: "Yeast remained in a wine with fermentable sugar, or bacteria restarted malolactic conversion.",
    note: "A deliberate spritz is different. Stable sweet wine needs filtration, inhibition or both.",
  },
  {
    fault: "Heat damage",
    clue: "stewed fruit · flatness · seepage or raised cork",
    cause: "Warm storage accelerates several reactions at different rates; it does not simply age wine faster.",
    note: "One hot shipping container can do more damage than years in a steady cool room.",
  },
] as const;

const labelLayers = [
  ["Producer / brand", "Who takes responsibility for the wine. Estate, merchant, cooperative and supermarket label describe different supply chains, not automatic quality levels."],
  ["Origin", "Country, GI, PDO, AVA, village or named vineyard. Smaller legal boundaries usually bring stricter rules and less blending freedom, but the producer still has to farm and make well."],
  ["Grape", "A varietal name may be explicit or hidden behind a place such as Chablis or Barolo. Percentage rules and permitted blending partners change by jurisdiction."],
  ["Vintage", "Usually the harvest year. It matters most where weather varies, while reserve wine and multi-vintage blending deliberately soften that variation."],
  ["Style terms", "Dryness, colour, method, ageing or hierarchy terms only mean what that region’s rulebook says. “Reserve,” “old vines” and “selection” may be tightly defined, loosely defined or unregulated."],
  ["Technical line", "Alcohol, volume, allergens, importer, bottler and lot code make the bottle traceable. None is a tasting score, but each tells me how the product entered the market."],
] as const;

const serviceTemperatures = [
  ["Sparkling", "6–10°C", "Cool enough to retain pressure, warmer for complex mature bottles."],
  ["Light white / rosé", "8–12°C", "Cold sharpens freshness; too cold hides perfume and texture."],
  ["Full white / orange", "10–14°C", "More warmth opens oak, lees and phenolics."],
  ["Light red", "12–15°C", "A slight chill keeps alcohol quiet and red fruit bright."],
  ["Full red", "15–18°C", "Traditional “room temperature” meant a cool room, not a modern hot apartment."],
  ["Sweet / fortified", "6–16°C", "Fresh Muscat and Fino suit the cool end; old Madeira, Tawny or complex Sherry can be warmer."],
] as const;

const pairingRules = [
  ["Acid", "cuts fat, refreshes salt and should usually match or exceed the food’s acidity."],
  ["Sweetness", "calms chilli and salt, but the wine normally needs to be sweeter than the dessert."],
  ["Tannin", "binds with protein and fat; chilli, bitterness and very lean food can make it feel harsher."],
  ["Alcohol", "adds weight and heat. Capsaicin makes that heat louder, while sweetness and cooling temperature soften it."],
  ["Umami", "can expose acid, tannin and bitterness, so add salt, fat or sweetness and choose gentler structure."],
  ["Bubbles", "scrub the palate and carry aroma; high acid plus pressure is especially useful with fried food."],
] as const;

export function WineVineCycle() {
  return (
    <div className="wine-vine-cycle">
      <ol>
        {vineCycle.map((phase, index) => (
          <li key={phase.stage}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <WineEditorialPhoto className="wine-vine-cycle-photo" image={phase.image} />
            <div>
              <p>{phase.timing}</p>
              <h4>{phase.stage}</h4>
              <dl>
                <div><dt>Inside the vine</dt><dd>{phase.vine}</dd></div>
                <div><dt>In the vineyard</dt><dd>{phase.work}</dd></div>
              </dl>
            </div>
          </li>
        ))}
      </ol>
      <div className="wine-vine-physiology">
        <article><strong>≈18–33°C</strong><p>the broad useful band for vine photosynthesis; severe heat or water stress can close stomata and stop it</p></article>
        <article><strong>≈15–25°C</strong><p>a useful berry-temperature range for anthocyanin formation; excess heat can slow colour development</p></article>
        <article><strong>≈0.6°C / 100 m</strong><p>a rough fall in air temperature with elevation before slope, inversion, wind and local geography modify it</p></article>
        <article><strong>one year ahead</strong><p>latent buds form the future inflorescences during the current season, so shade today can lower next year’s crop</p></article>
      </div>
    </div>
  );
}

export function WineVineyardPracticeAtlas() {
  return (
    <>
      <div className="wine-vineyard-practice-grid">
        {vineyardDecisions.map((decision) => (
          <article key={decision.title}>
            <WineEditorialPhoto className="wine-planting-photo" image={decision.image} />
            <span>{decision.label}</span>
            <h4>{decision.title}</h4>
            <p>{decision.text}</p>
          </article>
        ))}
      </div>
      <div className="wine-farming-approaches">
        {farmingApproaches.map((approach) => (
          <article key={approach.name}>
            <h4>{approach.name}</h4>
            <p>{approach.idea}</p>
            <small>{approach.detail}</small>
          </article>
        ))}
      </div>
      <p className="wine-science-aside">
        I use soil and rock names to explain drainage, heat, rooting and water—not as a claim that slate, limestone
        or granite dissolves into a matching flavour. The vine builds aroma compounds through biology, and
        fermentation transforms them again.
      </p>
    </>
  );
}

export function WineHazardsAndHarvest() {
  return (
    <div className="wine-hazards-harvest">
      <div className="wine-hazard-grid">
        {vineyardHazards.map((hazard) => (
          <article key={hazard.name}>
            <h4>{hazard.name}</h4>
            <dl>
              <div><dt>What starts it</dt><dd>{hazard.trigger}</dd></div>
              <div><dt>What it changes</dt><dd>{hazard.consequence}</dd></div>
              <div><dt>What can be done</dt><dd>{hazard.response}</dd></div>
            </dl>
          </article>
        ))}
      </div>
      <div className="wine-harvest-board">
        <div>
          <p className="eyebrow">The five harvest clocks</p>
          <h4>Picking is a compromise, not the moment every number becomes perfect</h4>
          <div>
            {harvestClocks.map(([clock, measure, note]) => (
              <p key={clock}><strong>{clock}</strong><span>{measure}</span><small>{note}</small></p>
            ))}
          </div>
        </div>
        <div className="wine-harvest-compare">
          <article>
            <span>selective and gentle</span>
            <h4>Hand harvest</h4>
            <p>
              Keeps whole bunches, works on steep or mixed plots and allows repeated passes for botrytis. It is slow,
              expensive and depends on skilled labour arriving exactly when the fruit is ready.
            </p>
          </article>
          <article>
            <span>fast and cool</span>
            <h4>Machine harvest</h4>
            <p>
              Can pick a large vineyard at night, lowering oxidation and refrigeration demand. Modern machines can
              sort well, but they shake berries from stems and cannot supply intact bunches for every wine style.
            </p>
          </article>
        </div>
      </div>
    </div>
  );
}

export function WineCellarReception() {
  return (
    <>
      <ol className="wine-cellar-reception">
        {cellarReception.map((item, index) => (
          <li key={item.step}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <WineEditorialPhoto className="wine-cellar-reception-photo" image={item.image} />
            <div><h4>{item.step}</h4><p>{item.text}</p></div>
          </li>
        ))}
      </ol>
      <div className="wine-press-grid">
        {pressTypes.map((press) => (
          <article key={press.name}>
            <span>{press.scale}</span>
            <h4>{press.name} press</h4>
            <p>{press.note}</p>
          </article>
        ))}
      </div>
      <div className="wine-cellar-control-grid">
        {cellarControls.map((control) => (
          <article key={control.title}>
            <h4>{control.title}</h4>
            <p>{control.text}</p>
          </article>
        ))}
      </div>
    </>
  );
}

export function WineExtractionAtlas() {
  return (
    <div className="wine-extraction-atlas">
      <header>
        <p className="eyebrow">What moves from solid fruit into liquid</p>
        <h4>Extraction starts before fermentation and can continue after it</h4>
        <p>
          Anthocyanins dissolve readily in watery must; tannin extraction rises as alcohol and heat build. Every
          method is therefore a choice about which compounds arrive, when they arrive and what else comes with them.
        </p>
      </header>
      <div>
        {extractionMethods.map((method) => (
          <article key={method.name}>
            <span>{method.group}</span>
            <h4>{method.name}</h4>
            <dl>
              <div><dt>How it works</dt><dd>{method.mechanism}</dd></div>
              <div><dt>What it can build</dt><dd>{method.result}</dd></div>
              <div><dt>What can go wrong</dt><dd>{method.caution}</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}

export function WineFinishingAndPackaging() {
  return (
    <>
      <div className="wine-finishing-flow">
        {finishingStages.map((stage, index) => (
          <article key={stage.name}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h4>{stage.name}</h4>
            <p>{stage.purpose}</p>
            <small>{stage.tradeoff}</small>
          </article>
        ))}
      </div>
      <div className="wine-finishing-detail">
        <section>
          <p className="eyebrow">Fining is targeted chemistry</p>
          <h4>The material should match the thing I am trying to remove</h4>
          <div>
            {finingAgents.map(([agent, target, note]) => (
              <p key={agent}><strong>{agent}</strong><span>{target}</span><small>{note}</small></p>
            ))}
          </div>
        </section>
        <section>
          <p className="eyebrow">Package and closure</p>
          <h4>The last production choice keeps changing the wine</h4>
          <div className="wine-package-grid">
            {packageOptions.map((option) => (
              <article key={option.name}>
                <span>{option.use}</span>
                <h4>{option.name}</h4>
                <p>{option.truth}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
      <p className="wine-science-aside">
        A crystal at the bottom may be harmless tartrate, not glass. “Unfined and unfiltered” describes omitted
        processes, not automatic quality; the useful question is whether the wine remained clear, stable and
        expressive without them.
      </p>
    </>
  );
}

export function WineSparklingWorld() {
  return (
    <>
      <div className="wine-sparkling-science">
        <article><strong>pressure</strong><p>More dissolved CO₂ means more pressure; bottle strength, fill level and fermentation sugar have to be calculated together.</p></article>
        <article><strong>nucleation</strong><p>Bubbles begin on microscopic scratches, fibres and particles. A perfectly smooth clean glass can look quieter than the same wine in an etched one.</p></article>
        <article><strong>autolysis</strong><p>Yeast cells slowly break down on lees, releasing mannoproteins that can change texture, foam and savoury bread-like aroma.</p></article>
        <article><strong>dosage</strong><p>Sugar balances acid and changes texture; reserve wine, spirit and ageing of the liqueur can also alter the final aromatic shape.</p></article>
      </div>
      <div className="wine-sparkling-region-atlas">
        {sparklingRegions.map(([region, grapes, method, note]) => (
          <article key={region}>
            <header><h4>{region}</h4><span>{method}</span></header>
            <p>{grapes}</p>
            <small>{note}</small>
          </article>
        ))}
      </div>
    </>
  );
}

export function WineFortificationPrimer() {
  return (
    <>
      <div className="wine-fortification-choices">
        {fortificationChoices.map((choice) => (
          <article key={choice.title}>
            <h4>{choice.title}</h4>
            <p>{choice.text}</p>
          </article>
        ))}
      </div>
      <div className="wine-fortified-compass">
        <div><span>dry + biological</span><strong>Fino · Manzanilla</strong><small>fortify a dry base lightly enough for flor</small></div>
        <div><span>dry + oxidative</span><strong>Oloroso · Amontillado</strong><small>more alcohol, oxygen and fractional cask ageing</small></div>
        <div><span>sweet + fruit-led</span><strong>Ruby Port · young VDN</strong><small>fortify during fermentation, then exclude most oxygen</small></div>
        <div><span>sweet + oxidative / heated</span><strong>Tawny · Madeira · Rancio · Rutherglen</strong><small>spirit preserves sugar while time, air and sometimes heat reshape it</small></div>
      </div>
    </>
  );
}

export function WineFaultAtlas() {
  return (
    <div className="wine-fault-atlas">
      {wineFaults.map((item) => (
        <article key={item.fault}>
          <header><h4>{item.fault}</h4><span>{item.clue}</span></header>
          <p>{item.cause}</p>
          <small>{item.note}</small>
        </article>
      ))}
    </div>
  );
}

export function WineLabelAndService() {
  return (
    <>
      <div className="wine-label-service-layout">
        <section className="wine-label-decoder">
          <p className="eyebrow">Read from responsibility to detail</p>
          <h4>A label is a legal address before it is a tasting note</h4>
          <ol>
            {labelLayers.map(([layer, explanation]) => (
              <li key={layer}><strong>{layer}</strong><p>{explanation}</p></li>
            ))}
          </ol>
        </section>
        <section className="wine-price-ladder">
          <p className="eyebrow">Why one bottle costs more</p>
          <h4>Price pays for scarcity, work, time and story in different proportions</h4>
          <div>
            <p><strong>Land & yield</strong><span>expensive appellation land, steep slopes, low yields and hand work raise cost before fruit reaches the winery</span></p>
            <p><strong>Selection & equipment</strong><span>sorting, small lots, barrels, long lees ageing and specialist presses need capital, labour and lost volume</span></p>
            <p><strong>Time & stock</strong><span>cellar and bottle ageing delay cash flow while storage, insurance, evaporation and breakage continue</span></p>
            <p><strong>Package & route</strong><span>heavy glass, cork, freight, duty, distributor and retailer margins can cost more than the liquid</span></p>
            <p><strong>Demand & rarity</strong><span>classification, critic attention, brand, vintage and tiny supply can move price far beyond production cost</span></p>
          </div>
          <small>Expensive can mean rare or desired; it does not guarantee that I will prefer the wine.</small>
        </section>
      </div>
      <div className="wine-service-temperatures">
        {serviceTemperatures.map(([style, temperature, note]) => (
          <article key={style}><strong>{temperature}</strong><h4>{style}</h4><p>{note}</p></article>
        ))}
      </div>
      <div className="wine-storage-pairing">
        <section>
          <p className="eyebrow">Bottle ageing and storage</p>
          <h4>Ageing is several reactions moving at once</h4>
          <p>
            Fruit esters hydrolyse, oxygen and phenolics change colour, tannins bind into new forms and slow aroma
            reactions produce wax, earth, dried fruit, nuts or savoury notes. Acid, tannin, sugar, alcohol,
            concentration and balance can make a wine durable, but none guarantees improvement.
          </p>
          <dl>
            <div><dt>Keep</dt><dd>dark, vibration-free and steadily around 10–15°C</dd></div>
            <div><dt>Avoid</dt><dd>heat spikes, direct light, dry corks and repeated temperature cycling</dd></div>
            <div><dt>After opening</dt><dd>refrigerate nearly every style; reduce headspace or use inert gas to slow oxidation</dd></div>
            <div><dt>Decant</dt><dd>old wine to remove sediment carefully; young wine for air only when tasting shows it helps</dd></div>
          </dl>
        </section>
        <section>
          <p className="eyebrow">Food pairing without rigid rules</p>
          <h4>Match the strongest structural interaction first</h4>
          <div>
            {pairingRules.map(([element, effect]) => (
              <p key={element}><strong>{element}</strong><span>{effect}</span></p>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
