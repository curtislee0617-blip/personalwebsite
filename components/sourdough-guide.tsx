"use client";

import Image from "next/image";
import { ImportedCookbookGuide, type ImportedCookbook } from "@/components/imported-cookbook-guide";
import { RecipeImageViewer } from "@/components/recipe-image-viewer";
import { useMemo, useState } from "react";
import { normalizeNumericInputText } from "@/lib/numeric-input";

const STARTER_PERCENT = 0.2;
const SALT_PERCENT = 0.02;
const STARTER_HYDRATION = 6 / 9;
const BREAD_FLOUR_RATIO = 680 / 800;
const WHOLE_WHEAT_RATIO = 90 / 800;
const RYE_RATIO = 30 / 800;
const BASE_DOUGH_WEIGHT = 1600;
const BASE_DUSTING_BREAD = 100;
const BASE_DUSTING_RICE = 200;

const starterScienceTopics = [
  {
    title: "A starter is an ecosystem, not just yeast",
    body: "A starter is a repeatedly refreshed community rather than one heroic strain of yeast doing everything.",
    points: [
      "It is tempting to describe a starter as flour, water and yeast, but this leaves out nearly everything interesting. Flour enzymes first cut damaged starch into smaller, fermentable sugars. Yeasts and bacteria then compete for - and sometimes kindly share - these sugars, amino acids, vitamins and other metabolites.",
      "Yeasts make most of the carbon dioxide that inflates the starter and eventually our loaf, while also producing ethanol and aroma compounds. Some heterofermentative lactic-acid bacteria make carbon dioxide too, so every bubble cannot be credited to yeast alone.",
      "Lactic-acid bacteria (LAB) make lactic acid, acetic acid and a collection of flavour precursors, lowering the pH as they go. Acetic-acid bacteria can also turn up; one large survey associated them with stronger vinegary aromas and a slower rise.",
      "A mature starter may contain many detectable organisms, yet it is normally dominated by only a few bacterial species and one or two yeasts. Repeated feeding acts like an endless selection experiment: flour, hydration, temperature, timing and the microbes themselves decide who remains.",
      "So a dramatic rise is useful, but it is not a complete health report. Aroma, acidity, texture, bubble structure and how quickly the full cycle repeats tell us different things about what is actually living in the jar.",
    ],
  },
  {
    title: "Who eats what: yeast, LAB and their fermentation routes",
    body: "The same flour sugar can take several biochemical routes depending on which organism gets to it first.",
    points: [
      "We can divide LAB by what comes out after they eat a sugar. Homofermentative LAB send hexoses through glycolysis and make mainly lactic acid. They acidify very efficiently but produce little carbon dioxide through this particular route.",
      "Obligately heterofermentative LAB take the phosphoketolase route instead, producing lactic acid, carbon dioxide and either ethanol or acetate from a hexose. Which final product dominates depends on the sugar, available electron acceptors and the organism involved.",
      "Facultatively heterofermentative LAB sit awkwardly in between - appropriately. They can send hexoses down a mostly lactic route, then switch pathways when pentoses are available. A real starter can contain all three behavioural types at once.",
      "This is why the familiar rule of warm and wet equals mild lactic acid, while cool and stiff equals sharp acetic acid, is far too tidy. Species, flour sugars, oxygen, hydration, temperature, feed ratio and ripening time all change together, and microbes are not obliged to follow a sourdough infographic.",
      "Yeast and LAB are not simply fighting over the same dinner either. One organism may release a vitamin, amino acid or sugar that another cannot obtain efficiently, while acid-tolerant partners occupy slightly different niches. The starter works because competition and cooperation happen at the same time.",
    ],
  },
  {
    title: "Why useful acidity eventually weakens gluten",
    body: "A little softening helps; a long acidic holiday turns structure into soup.",
    points: [
      "As LAB acidify the starter, the falling pH changes the charge and behaviour of gluten proteins. It also wakes up flour's own acid-tolerant proteases, while LAB proteinases and peptidases contribute another route for cutting proteins into smaller pieces.",
      "This is not automatically bad. Controlled proteolysis softens dough and increases extensibility, allowing gas cells to expand instead of meeting a rubber wall. As with most useful processes in bread, the problem is not that it happens, but that it can continue for too long.",
      "Leave an underfed starter warm and acidic and the cutting continues. It becomes progressively thinner, stickier and less capable of trapping carbon dioxide. A starter can therefore rise beautifully, exhaust itself, and collapse into something watery; that final collapse is not evidence of extra strength.",
      "What we see also depends on the flour holding the microbes. White bread flour can build an elastic dome, whereas rye and whole-grain starters may be extremely active without making the same visible gluten balloon. Rise height cannot be compared as if the underlying materials were identical.",
      "If the starter reaches this sad state, dilution is more useful than trying to neutralise it with a base. Keep a small amount of healthy seed, give it a larger fresh feed, hold it at a sensible temperature and repeat until the rise, aroma and texture become predictable again.",
    ],
  },
  {
    title: "Hydration changes much more than how runny it looks",
    body: "Water changes molecular movement, enzyme access, structure and therefore the ecological conditions inside the culture.",
    points: [
      "In a liquid starter, sugars, acids and enzymes can diffuse more freely. Reactions and feeding commonly move faster, but the looser gluten network makes height and collapse much less reliable as the only maturity test - the microbes may be busy even when the jar refuses to perform.",
      "A stiff starter restricts molecular movement, feels structurally stronger and often takes longer to mature. Changing an established culture from firm to liquid conditions is therefore not just adding water; studies show that the dominant organisms and the metabolites they produce can shift too.",
      "Hydration is still not a magical acidity switch. A stiff starter is not guaranteed to be acetic, and a liquid starter is not guaranteed to be lactic. Species, temperature, flour, feed ratio and ripening time remain inconveniently involved.",
      "If I actually want to test hydration, the flour, seed percentage, temperature and feed interval should stay constant. Otherwise I have changed four experiments at once and learned very little from whichever jar rises higher.",
    ],
  },
  {
    title: "Changing flour changes the microbes' entire dinner",
    body: "Flour controls food, buffering, water binding and structure - not merely the protein number printed on the bag.",
    points: [
      "Whole-grain and rye flours arrive with more minerals, vitamins, enzymes and bran-associated microbes than refined white flour. Their higher ash content also gives more buffering capacity, so they can contain substantial total acid without tracing the same pH curve as white flour.",
      "This larger buffet often wakes up a sluggish starter. Controlled studies show that changing flour can alter the bacterial community even when the dominant yeast barely changes, which is a nice reminder that 'active' describes an ecosystem rather than one organism.",
      "Rye supplies accessible carbohydrates and a large amount of water-binding arabinoxylan, but it does not build a wheat-like gluten network. A rye starter can therefore look like a very active paste instead of the elastic dome people expect from Instagram.",
      "Strong white bread flour gives us a clearer gas-retaining structure and a more obvious peak. It may look calmer than a whole-grain feed, but a less dramatic rise does not automatically mean a microbiologically weaker starter.",
      "A mixed feed is often the least annoying compromise: mostly white bread flour for structure and repeatability, with a measured amount of whole wheat or rye for nutrients and flavour.",
    ],
  },
  {
    title: "How to shift a starter deliberately",
    body: "Change one control at a time, then watch several full cycles before announcing a scientific breakthrough.",
    points: [
      "Feed ratio controls both dilution and the amount of new food. A 1:6:6 feed means one part ripe starter, six parts flour and six parts water. The larger feed carries over less acid and needs longer to mature; the smaller feed peaks sooner and, unsurprisingly, runs out of dinner sooner too.",
      "Temperature controls reaction rate and microbial selection. Warm conditions normally shorten the cycle and cool conditions lengthen it, but a large temperature change can also favour a different population. I would adjust gradually rather than attempting to summon one exact species.",
      "Timing controls how much acid and starvation the culture repeatedly experiences. Feeding near a reliable mature peak maintains activity. Feeding very early can keep diluting a weak population, while feeding hours after collapse selects for organisms that tolerate an acidic, nutrient-poor afterparty.",
      "For a starter that is sharp, runny and collapsing early, I would use a larger feed, refresh it before a prolonged collapse, move it slightly cooler and consider a stronger or marginally drier flour mix.",
      "For one that is sluggish and smells mostly of raw flour, I would move it slightly warmer, temporarily use a smaller feed, add a modest amount of whole grain or rye, and then actually let it mature before feeding it again.",
      "Record the seed ratio, hydration, flour blend, temperature, peak time, aroma and texture. A trend across three cycles says far more than one pH reading or one suspiciously photogenic rise.",
    ],
  },
] as const;

const breadScienceChapters = [
  {
    title: "2. Dough formation: flour, hydration, autolyse and mixing",
    summary: "How two rather boring ingredients become a gas-retaining viscoelastic material, and why water, salt and a bit of violence matter.",
    sections: [
      {
        title: "Flour type as a system of variables",
        paragraphs: [
          "The first number most of us look at on a flour bag is protein, and then we decide that more must mean stronger and therefore better. Unfortunately, flour is not that cooperative. Strong white bread flour normally provides a larger glutenin-rich network and tolerates more water or a longer fermentation, but an extremely tenacious flour can resist expansion just as effectively as a weak flour fails to contain it. A lower-protein flour can perform beautifully when its protein quality, hydration and fermentation are matched.",
          "Whole-wheat flour does not simply add 'more wheat'. It brings bran, germ, minerals, lipids, enzymes and a larger microbial inoculum. Bran steals water and physically interrupts the continuity of gluten, while the higher ash content buffers acid and changes how quickly pH appears to fall. Rye relies heavily on starch and water-binding arabinoxylans rather than a wheat-like gluten network; spelt and durum have their own protein compositions and rheology. So the protein percentage is useful, but treating it as a full material specification is a bit like describing coffee only by how dark it looks.",
        ],
      },
      {
        title: "Hydration and the autolyse",
        paragraphs: [
          "Autolyse sounds far more technical than what we actually do: mix flour and water, then leave it alone before adding levain and salt. But the rest is not empty time. Water moves into starch granules, damaged starch, arabinoxylans and the gluten-forming proteins. This plasticises gliadin and glutenin (giving their chains more mobility), allowing the protein-rich phase to connect with less mechanical work later. Meanwhile, amylases begin releasing smaller carbohydrates from damaged starch and the flour's own proteases quietly begin altering proteins.",
          "So autolyse is not simply free gluten development while I do something else. A sensible rest can reduce mixing and improve extensibility, especially when bran needs time to hydrate. A very long or warm rest can soften weak or highly enzymatic flour before it has enough structure to spare. Add levain and it becomes a fermentolyse because acidification and microbial metabolism have already started; add salt and protein hydration, enzyme activity and microbial activity all change. These are chemically different rests, even if they look identical in a mixing bowl.",
        ],
      },
      {
        title: "The molecular basis of gluten",
        paragraphs: [
          "We often talk about developing 'gluten strands', which makes the dough sound like a bowl of tiny elastic bands. The reality is messier and much more interesting. Wheat dough is a composite material: swollen starch granules and flour particles sit inside a hydrated protein network. Gliadins are mainly monomeric and help the dough flow and stretch. Glutenins form much larger polymers, joined partly through intermolecular disulfide bonds, and provide elasticity, cohesion and strain hardening.",
          "Hydrogen bonds, hydrophobic interactions, tangled chains and reversible disulfide exchange all contribute, so gluten is a dynamic three-dimensional phase rather than a bundle of independent strings. We need it to be elastic enough to recover but extensible enough to expand. Too much resistance and gas cannot enlarge the cells; too much extensibility without connectivity and the walls thin, merge and leak. This is why protein percentage predicts only part of the result - glutenin composition, flour ageing, damaged starch, enzymes and milling all get a vote too.",
        ],
      },
      {
        title: "The multiple functions of salt",
        paragraphs: [
          "Salt looks like the least scientifically exciting ingredient in the formula, yet removing it changes almost everything. Sodium and chloride ions alter electrostatic interactions and the distribution of water around gluten proteins. Up to an optimum concentration, this encourages a more cohesive and resistant network and improves gas retention. Go too far and a strong dough becomes so tenacious that expansion feels like an argument.",
          "Salt also creates osmotic stress for yeast and bacteria, slowing fermentation and changing enzyme activity and metabolite production. Delaying or omitting it therefore does much more than produce bland bread: the dough ferments faster, feels more extensible and loses some protection against proteolytic softening. Around 1.5-2% of flour mass is a common working range, but flour strength, whole-grain content, fermentation time and dietary needs decide where the useful point actually sits.",
        ],
      },
      {
        title: "Mixing, folding and network development",
        paragraphs: [
          "Mixing is not just making everything homogenous. It distributes water, breaks apart dry protein masses and supplies mechanical energy that stretches, rearranges and reconnects hydrated gluten proteins into one continuous phase. It also traps the first microscopic pockets of air. Fermentation mostly enlarges these existing nuclei rather than creating a perfectly fresh set of bubbles from nothing, so the structure established during mixing follows us all the way to the crumb.",
          "There is an optimum rather than a prize for maximum kneading. Too little energy leaves disconnected protein domains; too much heats and damages the network. Stretch-and-folds and coil folds continue the process more gently: deformation extends gluten around gas cells, then the rest allows stress to relax and new interactions to form. The correct number of folds is therefore rheological, not ceremonial. Weak or very wet dough may need more early reinforcement, while a strong dough can be bullied into becoming unnecessarily tight.",
        ],
      },
    ],
  },
  {
    title: "3. Fermentation, proofing, gas-cell mechanics and shaping",
    summary: "Why more fermentation is not automatically more bread: gas production races against diffusion, thinning cell walls and a dough with limited structural patience.",
    sections: [
      {
        title: "Fermentation versus structural lifetime",
        paragraphs: [
          "Fermentation sounds simple when reduced to yeast makes gas and bread gets bigger. In reality, it produces carbon dioxide, organic acids, ethanol and dozens of flavour-active metabolites at the same time. Carbon dioxide first dissolves in the watery phase of the dough; once locally supersaturated, it diffuses into existing gas cells. Those cells expand, their walls become thinner and the gluten network is progressively pre-stretched.",
          "Some stretching is useful because the network strain-hardens and resists the growing pressure. But gas production can outrun structural development, causing cells to merge and leak. At the same time, acid changes protein charge and activates pH-dependent cereal proteases, while microbial peptidases keep cutting. Dough can therefore become wonderfully extensible and then, without much ceremony, cross into irreversible weakness. Bulk fermentation ends where useful gas, flavour and remaining load-bearing strength overlap - not at one universal rise percentage or time on a clock.",
        ],
      },
      {
        title: "Bulk fermentation and final proof are one continuum",
        paragraphs: [
          "We give bulk fermentation and final proof different names, but the microbes do not suddenly begin a new reaction after shaping. Metabolism, acidification, gas transfer and protein modification continue throughout. What changes is the geometry and mechanical history. During bulk we can fold, redistribute temperature and move gas around; during final proof, further expansion has to fit inside the architecture we created while shaping.",
          "Temperature makes this more annoying by accelerating several things at once: microbial growth, gas production, diffusion, enzyme activity and dough relaxation. Warm dough reaches the desired volume sooner, but it can also spend its structural reserve sooner. Refrigeration only slows the system; it does not press pause, and the centre of a large dough remains warm long after the outside feels cold.",
        ],
      },
      {
        title: "Gas nucleation, expansion and coalescence",
        paragraphs: [
          "Yeast does not blow a new set of tiny balloons directly into the dough. Most gas cells begin as air incorporated during mixing. Fermentation produces carbon dioxide, which divides between the dissolved and gaseous phases and diffuses towards those existing cells. Internal pressure then stretches the surrounding gluten-starch matrix.",
          "The cells are not stable little spheres. Small ones can feed larger ones by diffusion, neighbouring walls can rupture and merge, and very thin walls become permeable enough to leak. At first, strain hardening helps the gluten resist this pressure. Once expansion exceeds the network's maximum gas-holding capacity, connectivity falls and the dough becomes porous. This is why an overproofed loaf can contain plenty of fermentation gas and still bake smaller.",
        ],
      },
      {
        title: "Underproofing and overproofing as mechanical states",
        paragraphs: [
          "Underproofed and overproofed are not simply too little time and too much time; they are different mechanical states. An underproofed dough has not accumulated or redistributed enough gas and often remains excessively elastic. In the oven, pressure is forced towards the score or another weak point, producing violent opening, dense areas and the occasional dramatic tunnel.",
          "Overproofed dough has the opposite issue. Expansion and proteolysis have thinned its cell walls, reduced elastic recovery and increased gas leakage. The useful endpoint lies between them. Volume, surface curvature, bubble distribution, resistance to gentle pressure and recovery after it are all indirect measurements of gas fraction and viscoelastic reserve. The poke test is therefore not a universal truth; hydration, temperature, flour strength and a dry surface can all make the same finger produce a different answer.",
        ],
      },
      {
        title: "What shaping changes",
        paragraphs: [
          "Shaping is sometimes described as aligning every gluten strand, as if we were combing molecular hair. A better description is that it redistributes gas, introduces directionality and creates a tension gradient. Stretching and folding orient parts of the gluten-rich phase around gas cells and place the outside layers under more tension. Experiments using repeated sheeting and resting show that deformation followed by relaxation can create a more organised network through non-covalent interactions and disulfide exchange.",
          "The pre-shape first gathers a loose mass into a recognisable geometry. The bench rest then lets the imposed stress relax, so final shaping can occur without tearing it apart. Final shaping adds enough surface tension to resist sideways spread while preserving the extensibility needed for proof and oven spring. Too little gives poor support; too much damages cells or creates a tight shell that resists the expansion we spent hours fermenting for.",
        ],
      },
      {
        title: "Degassing and bubble distribution",
        paragraphs: [
          "The internet's pursuit of open crumb can make touching a bubble feel criminal, but degassing is not automatically a mistake. Gentle shaping removes isolated oversized cells that would otherwise become tunnels and redistributes gas into a more coherent population. Aggressive compression, however, destroys too many nuclei and asks fermentation to rebuild volume inside a network that is already ageing.",
          "How much gas we preserve depends on the bread. A sandwich loaf benefits from deliberate and even degassing; an open-crumb sourdough preserves more irregular cells. In both cases the aim is controlled distribution, not the maximum physically possible amount of trapped gas.",
        ],
      },
    ],
  },
  {
    title: "4. Baking, steam and crust formation",
    summary: "The final transformation: gases expand, dough becomes a starch-protein solid, and steam somehow helps us make a crust that is eventually dry and crisp.",
    sections: [
      {
        title: "Oven spring and thermal expansion",
        paragraphs: [
          "When dough enters the oven, several expansion mechanisms arrive at once. Existing gases warm, dissolved carbon dioxide becomes less soluble, water evaporates into the cells and the microbes continue briefly before heat finally kills them. Cell pressure rises and the loaf springs, which makes the oven look far more magical than it is.",
          "Expansion stops when the network cannot stretch further, gas finds an escape route or the surrounding starch-protein matrix sets. Heating rate therefore matters. A rigid surface formed too early constrains the loaf and tears away from the softer interior; a structurally exhausted dough may expand for a moment and then collapse before setting. The oven can exaggerate the structure we built, but it cannot recreate strength that fermentation has already digested.",
        ],
      },
      {
        title: "How the crumb sets",
        paragraphs: [
          "At some point, dough has to stop behaving like dough. Starch granules absorb water, swell and lose their crystalline order over a temperature range controlled by flour and water availability. Starch polymers leak out and form a continuous gel around the gas cells. At the same time, gluten proteins denature and polymerise, with heat-induced changes in connectivity and strain hardening becoming especially important above roughly 70°C.",
          "Together these changes turn a deformable foam into a solid porous crumb. Gelatinisation competes for water while evaporation consumes a large amount of latent heat, so the inside of a loaf approaches boiling temperature gradually instead of obediently matching a 240°C oven. The finished crumb is supported by both gelatinised starch and a thermally set protein network.",
        ],
      },
      {
        title: "Steam as transient surface hydration",
        paragraphs: [
          "Steam seems like a strange way to make something crisp. It first condenses on the comparatively cold dough surface, transferring latent heat and maintaining a thin mobile layer of water. This delays desiccation and keeps the skin extensible while the loaf expands. It also gelatinises more surface starch, producing gloss and changing the permeability and eventual fracture of the crust.",
          "More steam is not automatically better, because chemistry refuses to reward enthusiasm alone. Too much condensation changes the heating rate, delays browning and can produce a softer or less permeable surface. The useful amount depends on oven volume, venting, dough maturity and loaf size. A Dutch oven achieves the same early effect by trapping water released from the dough itself rather than continuously injecting more.",
        ],
      },
      {
        title: "Hydration followed by desiccation",
        paragraphs: [
          "The paradox disappears once we separate the bake into a sequence. Early water keeps the surface deformable and lets a thin starch-rich layer gelatinise. Later, we vent the oven or remove the lid; evaporation overtakes the supply of liquid water from the crumb and a drying front moves inward. The surface becomes a glassy, brittle network of denatured protein and partly gelatinised starch.",
          "Crust thickness is therefore a heat-and-mass-transfer problem, not simply a colour chart. Higher temperature accelerates evaporation and can thicken the dry zone, while internal moisture keeps diffusing towards the surface. After baking, water moves back from crumb to crust and plasticises the glassy layer. This is why the loaf that crackled magnificently on the counter can become disappointingly soft a few hours later.",
        ],
      },
      {
        title: "Browning, aroma and the end of the bake",
        paragraphs: [
          "A wet surface struggles to brown because evaporation pins its temperature near the wet-bulb plateau. Only after enough water has left can the crust become hot enough for serious browning. Most bread colour comes from the Maillard network between reducing sugars and amino compounds. Caramelisation contributes at sufficiently high local temperatures, but it is not the single explanation people often use for anything brown and delicious.",
          "Fermentation and amylase activity decide how much sugar remains available for these reactions, so browning began long before the loaf entered the oven. At the end, drying and colour have to be balanced against crumb moisture. Venting completes the crust; cooling lets steam pressure and the gelatinised starch-protein matrix redistribute and settle. Cutting immediately interrupts this process and can make a properly baked crumb look gummy - an impressive punishment for impatience.",
        ],
      },
    ],
  },
] as const;

const starterScienceSources = [
  {
    label: "Adelina “Addie” Roberts / Bread Stalker — Secrets of Open Crumb (2022)",
    href: "https://www.instagram.com/breadstalker/",
  },
  {
    label: "Modernist Bread — Sourdough Science",
    href: "https://modernistcuisine.com/mc/sourdough-science/",
  },
  {
    label: "Modernist Cuisine — How to Make a Liquid Sourdough Starter",
    href: "https://modernistcuisine.com/recipes/how-to-make-a-liquid-sourdough-starter/",
  },
  {
    label: "Serious Eats — The Science of Sourdough Starters",
    href: "https://www.seriouseats.com/sourdough-starter-science",
  },
  {
    label: "Serious Eats — Flour tests for sourdough starters",
    href: "https://www.seriouseats.com/the-best-flour-for-sourdough-starters-an-investigation",
  },
  {
    label: "Landis et al. — diversity and function of 500 sourdough starter microbiomes",
    href: "https://doi.org/10.7554/eLife.61644",
  },
  {
    label: "De Angelis et al. — proteolysis by sourdough lactic-acid bacteria",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC126681/",
  },
  {
    label: "Thiele et al. — pH-driven gluten hydrolysis and depolymerisation",
    href: "https://pubmed.ncbi.nlm.nih.gov/14995138/",
  },
  {
    label: "Vogelmann & Hertel — ecological controls on sourdough microbial associations",
    href: "https://pubmed.ncbi.nlm.nih.gov/21356468/",
  },
  {
    label: "Controlled wheat-sourdough study — temperature and backslopping time",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3126363/",
  },
  {
    label: "Minervini et al. — switching an established starter from firm to liquid fermentation",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4018931/",
  },
  {
    label: "Lau et al. — effects of flour type and feeding schedule on starter communities",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12772405/",
  },
  {
    label: "Synthetic-community study — functional roles of acetic-acid bacteria",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11498085/",
  },
  {
    label: "Sourdough microbiome review — LAB fermentation modes and representative taxa",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8306212/",
  },
  {
    label: "Kneading study — development of the continuous gluten phase",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8963076/",
  },
  {
    label: "Water-absorption study — gluten mobility, network development and bread volume",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7910979/",
  },
  {
    label: "Salt study — gluten rheology, gas retention and flour quality",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7404662/",
  },
  {
    label: "Gas-formation kinetics — dough integrity and bread volume",
    href: "https://pubmed.ncbi.nlm.nih.gov/28455072/",
  },
  {
    label: "Aerated-dough study — strain hardening during fermentation and baking",
    href: "https://pubmed.ncbi.nlm.nih.gov/36881603/",
  },
  {
    label: "Sheeting-resting study — gluten organisation and molecular interactions",
    href: "https://pubmed.ncbi.nlm.nih.gov/40191844/",
  },
  {
    label: "Steam-injection study — crust microstructure and water diffusion",
    href: "https://doi.org/10.1016/j.jfoodeng.2011.07.015",
  },
  {
    label: "Crust-formation study — evaporation, drying-front growth and browning",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4571265/",
  },
  {
    label: "Moisture-phase study — starch gelatinisation and evaporation during baking",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12071401/",
  },
  {
    label: "Serious Eats — process mechanics for a sourdough loaf",
    href: "https://www.seriouseats.com/how-to-make-sourdough-bread",
  },
  {
    label: "Shewry — wheat proteins and the three-dimensional gluten network",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10087814/",
  },
] as const;

const starterScienceReferenceGroups = [
  {
    label: "Bread Stalker",
    note: "Practical open-crumb framework and formulas",
    links: starterScienceSources.filter((source) => source.label.startsWith("Adelina")),
  },
  {
    label: "Modernist Bread",
    note: "Sourdough science and liquid-starter guidance",
    links: starterScienceSources.filter((source) => source.label.startsWith("Modernist")),
  },
  {
    label: "Serious Eats",
    note: "Starter, flour and bread-making references",
    links: starterScienceSources.filter((source) => source.label.startsWith("Serious Eats")),
  },
  {
    label: "Papers",
    note: "Peer-reviewed research behind the scientific discussion",
    links: starterScienceSources.filter(
      (source) =>
        !source.label.startsWith("Adelina") &&
        !source.label.startsWith("Modernist") &&
        !source.label.startsWith("Serious Eats"),
    ),
  },
] as const;

type ChemistryEquation = {
  label: string;
  formula: string;
  meaning: string;
};

const starterChemistryEquations: ChemistryEquation[] = [
  {
    label: "Simplified starch hydrolysis",
    formula: "(C₆H₁₀O₅)ₙ + n H₂O  →  n C₆H₁₂O₆",
    meaning:
      "A bookkeeping simplification. Flour amylases actually produce dextrins and maltose before complete conversion to glucose.",
  },
  {
    label: "Yeast alcoholic fermentation",
    formula: "C₆H₁₂O₆  →  2 C₂H₅OH + 2 CO₂ + energy",
    meaning:
      "Hexose becomes ethanol and carbon dioxide. The CO₂ inflates existing gas cells; the ethanol mostly evaporates during baking.",
  },
  {
    label: "Homofermentative LAB",
    formula: "C₆H₁₂O₆  →  2 CH₃CH(OH)COOH + energy",
    meaning:
      "One glucose molecule is converted mainly into two molecules of lactic acid, with little or no CO₂ from this route.",
  },
  {
    label: "Heterofermentative LAB",
    formula: "C₆H₁₂O₆  →  CH₃CH(OH)COOH + C₂H₅OH + CO₂ + energy",
    meaning:
      "The phosphoketolase route yields lactate, carbon dioxide and ethanol; acetate can replace ethanol under suitable redox conditions.",
  },
  {
    label: "Weak-acid dissociation",
    formula: "HA ⇌ H⁺ + A⁻",
    meaning:
      "Lactic and acetic acids only partly dissociate. The balance between undissociated acid and its conjugate base changes with pH.",
  },
  {
    label: "Henderson–Hasselbalch relation",
    formula: "pH = pKₐ + log₁₀([A⁻] / [HA])",
    meaning:
      "Useful for understanding one acid–base pair, although real dough is a buffered mixture of several acids, proteins, phosphates and minerals.",
  },
  {
    label: "Proteolysis",
    formula: "protein + H₂O  —protease→  peptides  —peptidase→  amino acids",
    meaning:
      "Hydrolysis cleaves peptide bonds. Limited cleavage improves extensibility; prolonged cleavage reduces the network’s gas-holding reserve.",
  },
];

const breadChemistryEquations: Record<string, ChemistryEquation[]> = {
  "2. Dough formation: flour, hydration, autolyse and mixing": [
    {
      label: "Baker’s hydration",
      formula: "hydration (%) = m(H₂O) / m(flour) × 100",
      meaning:
        "A mass ratio, not a direct measurement of free water. Bran, damaged starch and hydrocolloids bind water differently.",
    },
    {
      label: "Disulfide interchange",
      formula: "P₁–S–S–P₂ + P₃–SH ⇌ P₁–SH + P₂–S–S–P₃",
      meaning:
        "A thiol group can exchange partners with a protein disulfide bond, allowing gluten polymers to rearrange during mixing and resting.",
    },
    {
      label: "Ionic strength",
      formula: "I = ½ Σ cᵢzᵢ²",
      meaning:
        "Salt changes the ionic environment around charged protein groups; c is ion concentration and z is ionic charge.",
    },
    {
      label: "Mechanical work during mixing",
      formula: "W = ∫ P(t) dt",
      meaning:
        "The energy delivered to dough is the time integral of mixer power. Too little leaves the network discontinuous; too much can overheat and damage it.",
    },
    {
      label: "Water activity",
      formula: "aᵥ = p / p₀",
      meaning:
        "Water activity compares water-vapour pressure above dough with pure water. It describes availability more usefully than water mass alone.",
    },
  ],
  "3. Fermentation, proofing, gas-cell mechanics and shaping": [
    {
      label: "Henry’s law for dissolved CO₂",
      formula: "c(CO₂) = kH · p(CO₂)",
      meaning:
        "At equilibrium, dissolved CO₂ concentration is proportional to its partial pressure. Warming reduces CO₂ solubility and assists oven spring.",
    },
    {
      label: "Fickian gas diffusion",
      formula: "J = −D ∇c",
      meaning:
        "CO₂ flux J follows a concentration gradient; D depends on temperature and the dough’s changing aqueous structure.",
    },
    {
      label: "Ideal-gas approximation",
      formula: "PV = nRT",
      meaning:
        "As gas temperature and mole number rise, cells tend to expand unless pressure, gas leakage or the dough’s resistance limits them.",
    },
    {
      label: "Laplace pressure",
      formula: "ΔP = 2γ / r",
      meaning:
        "A smaller spherical bubble has a larger internal overpressure. This helps explain gas transfer from small cells into larger cells.",
    },
    {
      label: "Temperature dependence",
      formula: "k = A e^(−Eₐ/RT)",
      meaning:
        "The Arrhenius relation explains why many enzyme and reaction rates rise with temperature, but microbial growth eventually falls outside its viable range.",
    },
    {
      label: "Viscoelastic stress relaxation",
      formula: "σ(t) = σ₀ e^(−t/τ)",
      meaning:
        "A simple Maxwell-model description of how shaping stress relaxes during a bench rest; real dough requires several relaxation times.",
    },
  ],
  "4. Baking, steam and crust formation": [
    {
      label: "Fourier heat conduction",
      formula: "q = −k ∇T",
      meaning:
        "Heat flux follows the temperature gradient from the oven and crust toward the cooler crumb.",
    },
    {
      label: "Moisture diffusion",
      formula: "Jw = −Dw ∇cw",
      meaning:
        "Internal water migrates down its concentration gradient while surface evaporation pulls the drying front inward.",
    },
    {
      label: "Latent heat of evaporation",
      formula: "Q = mLᵥ",
      meaning:
        "Changing liquid water into vapour consumes substantial energy, keeping the wet crumb far cooler than the oven.",
    },
    {
      label: "Oven-spring approximation",
      formula: "V₂ / V₁ ≈ T₂ / T₁   (constant n and P)",
      meaning:
        "A first approximation for gas-cell expansion. Actual oven spring also includes new water vapour, released CO₂, changing pressure and viscoelastic resistance.",
    },
    {
      label: "Thermal setting",
      formula: "starch + H₂O + heat → gelatinised starch;  protein + heat → denatured network",
      meaning:
        "These are physical transformations rather than balanced reactions. Together they convert a deformable foam into a set crumb.",
    },
    {
      label: "Maillard reaction network",
      formula: "reducing sugar + R–NH₂ → Schiff base → Amadori products → aromas + melanoidins",
      meaning:
        "A deliberately compressed pathway: dehydration, fragmentation and Strecker chemistry generate many crust aromas and brown polymers.",
    },
  ],
};

function ChemistryEquationPlate({
  equations,
  title,
}: {
  equations: ChemistryEquation[];
  title: string;
}) {
  return (
    <figure className="mb-6 min-w-0 overflow-hidden rounded-[1.1rem] border border-ink/10 bg-surface/34">
      <div className="border-b border-ink/[0.08] px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-moss">Chemistry equations</p>
        <h3 className="mt-1 text-sm font-semibold tracking-tight text-ink">{title}</h3>
      </div>
      <div className="grid min-w-0 sm:grid-cols-2 xl:grid-cols-3">
        {equations.map((equation, index) => (
          <div
            className="min-w-0 border-b border-ink/[0.07] p-4 last:border-b-0 sm:border-r sm:[&:nth-child(2n)]:border-r-0 xl:[&:nth-child(2n)]:border-r xl:[&:nth-child(3n)]:border-r-0"
            key={equation.label}
          >
            <div className="flex items-baseline gap-2">
              <span className="text-[9px] font-semibold tabular-nums text-moss">{String(index + 1).padStart(2, "0")}</span>
              <h4 className="text-xs font-semibold leading-5 text-ink">{equation.label}</h4>
            </div>
            <div className="my-3 overflow-x-auto border-y border-ink/[0.07] py-3">
              <code className="whitespace-nowrap font-mono text-[0.78rem] font-medium text-ink sm:text-[0.82rem]">
                {equation.formula}
              </code>
            </div>
            <p className="text-[11px] leading-5 text-ink/54">{equation.meaning}</p>
          </div>
        ))}
      </div>
      <figcaption className="border-t border-ink/[0.07] px-4 py-2.5 text-[9px] leading-4 text-ink/42">
        Idealised equations used to isolate one mechanism at a time. Dough is a multiphase, buffered and non-equilibrium material, so none of these relationships alone predicts a loaf.
      </figcaption>
    </figure>
  );
}

const timelineTemplate = [
  {
    title: "Mix and knead",
    offsetMinutes: 0,
    body: "Mix and knead all ingredients except salt in a stand mixer. After it is homogenous add in the salt and knead again.",
    note: "It will be quite wet, sticky, lumpy and shaggy.",
  },
  {
    title: "Autolyse",
    offsetMinutes: 55,
    body: "Let sit and autolyse for 45 min - 1 hour.",
  },
  {
    title: "First coil fold",
    offsetMinutes: 60,
    body: "Transfer to a big bowl and do coil folds, grabbing the middle and bringing it up into a spiral.",
    note: "Coil fold until the surface is just about to tear, then stop.",
  },
  {
    title: "Second coil fold",
    offsetMinutes: 105,
    body: "Do another gentle coil fold.",
  },
  {
    title: "Third coil fold",
    offsetMinutes: 165,
    body: "Repeat the coil fold, avoiding tearing the surface or gluten.",
  },
  {
    title: "Fourth coil fold",
    offsetMinutes: 225,
    body: "One more coil fold if the dough can still take it.",
    note: "By now the dough should be smooth and shiny rather than a sticky puddle.",
  },
  {
    title: "Bulk rise finish",
    offsetMinutes: 390,
    body: "Around 4 - 5 hours after the initial mix, let the dough rise until very airy and bubbly below the surface.",
  },
  {
    title: "Divide and pre-shape",
    offsetMinutes: 390,
    body: "Turn onto a dusted counter, divide into 2 portions, and roll into balls carefully without popping the bubbles.",
  },
  {
    title: "Bench rest",
    offsetMinutes: 420,
    body: "Cover and let rest for 30 minutes so the gluten can relax.",
  },
  {
    title: "Final shape and cold proof",
    offsetMinutes: 420,
    body: "Shape into a boule or batard, dust generously, and place into a banneton.",
    note: "Cold proof, then bake between 10 and 18 hours from the beginning of proofing.",
  },
  {
    title: "Earliest bake point",
    offsetMinutes: 1020,
    body: "Bake anytime from here onward if the dough is proofed well.",
    note: "If taking it straight from the cold proof, let it warm up if it seems flat until it inflates again.",
  },
  {
    title: "Latest bake point",
    offsetMinutes: 1500,
    body: "Try to bake by this point to stay within the suggested cold-proof window.",
  },
  {
    title: "Bake",
    offsetMinutes: 1080,
    body: "Preheat the oven with the dutch oven to 500F. Score the loaf quickly at 45 degrees and about 1 cm deep, spray generously with water, cover, and bake for 45 minutes.",
  },
  {
    title: "Cool before slicing",
    offsetMinutes: 1125,
    body: "Take it out and let it cool at room temperature for at least 30 minutes before slicing.",
  },
];

function round(value: number) {
  return Math.round(value);
}

function formatOneDecimal(value: number) {
  return value.toFixed(1);
}

function formatClock(time: string, offsetMinutes: number) {
  const [hours, minutes] = time.split(":").map(Number);
  const total = hours * 60 + minutes + offsetMinutes;
  const day = Math.floor(total / (24 * 60));
  const minutesOfDay = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const nextHour = Math.floor(minutesOfDay / 60);
  const nextMinute = minutesOfDay % 60;
  const formatted = new Date(0, 0, 0, nextHour, nextMinute).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return day === 0 ? formatted : `Next day ${formatted}`;
}

function StarterMicrobeFigures() {
  const labModes = [
    {
      title: "Obligately homofermentative",
      route: "Hexose → glycolysis",
      outputs: ["mostly lactate", "no CO₂ from hexose"],
      examples: "e.g. L. acidophilus group",
    },
    {
      title: "Facultatively heterofermentative",
      route: "Hexose or pentose",
      outputs: ["hexose → mostly lactate", "pentose → lactate + acetate"],
      examples: "e.g. Lactiplantibacillus plantarum",
    },
    {
      title: "Obligately heterofermentative",
      route: "Hexose → phosphoketolase",
      outputs: ["lactate + CO₂", "ethanol or acetate"],
      examples: "e.g. F. sanfranciscensis, L. brevis",
    },
  ] as const;

  return (
    <div className="mb-6 grid min-w-0 gap-7 border-b border-ink/[0.07] pb-6 xl:grid-cols-2">
      <figure className="min-w-0">
        <div className="mb-3 flex items-baseline gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-moss">Figure 1</span>
          <h3 className="text-base font-semibold tracking-tight text-ink">Representative sourdough microbes</h3>
        </div>
        <div className="grid border-y border-ink/10 bg-surface/28 sm:grid-cols-2 sm:divide-x sm:divide-ink/10">
          <div className="border-b border-ink/10 p-4 sm:border-b-0">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-moss">Yeasts</p>
            <p className="mt-1 text-[11px] leading-4 text-ink/48">Unicellular fungi · budding forms shown</p>
            <div className="relative mt-3 aspect-[3/2] overflow-hidden rounded-xl border border-moss/15 bg-paper/75">
              <Image
                alt="Microscopy-inspired illustration of budding oval sourdough yeast cells"
                className="object-cover"
                fill
                sizes="(max-width: 639px) calc(100vw - 4rem), (max-width: 1279px) 50vw, 22vw"
                src="/recipes/sourdough-guide/sourdough-yeast-micrograph.jpg"
              />
            </div>
            <dl className="mt-3 grid gap-2 border-t border-ink/[0.07] pt-3">
              <div>
                <dt className="text-[13px] italic text-ink sm:text-sm">Saccharomyces cerevisiae</dt>
                <dd className="text-[12px] leading-5 text-ink/52">Frequent, fast CO₂ producer</dd>
              </div>
              <div>
                <dt className="text-[13px] italic text-ink sm:text-sm">Kazachstania humilis</dt>
                <dd className="text-[12px] leading-5 text-ink/52">Often associated with F. sanfranciscensis</dd>
              </div>
              <div>
                <dt className="text-[13px] italic text-ink sm:text-sm">K. servazzii · W. anomalus</dt>
                <dd className="text-[12px] leading-5 text-ink/52">Other recurrent sourdough yeasts</dd>
              </div>
            </dl>
          </div>

          <div className="p-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-clay">Lactic-acid bacteria</p>
            <p className="mt-1 text-[11px] leading-4 text-ink/48">Rods and cocci · representative morphology</p>
            <div className="relative mt-3 aspect-[3/2] overflow-hidden rounded-xl border border-clay/15 bg-paper/75">
              <Image
                alt="Microscopy-inspired illustration of rod-shaped and coccus-shaped sourdough lactic-acid bacteria"
                className="object-cover"
                fill
                sizes="(max-width: 639px) calc(100vw - 4rem), (max-width: 1279px) 50vw, 22vw"
                src="/recipes/sourdough-guide/sourdough-lab-micrograph.jpg"
              />
            </div>
            <dl className="mt-3 grid gap-2 border-t border-ink/[0.07] pt-3">
              <div>
                <dt className="text-[13px] italic text-ink sm:text-sm">Fructilactobacillus sanfranciscensis</dt>
                <dd className="text-[12px] leading-5 text-ink/52">Sourdough-adapted obligate heterofermenter</dd>
              </div>
              <div>
                <dt className="text-[13px] italic text-ink sm:text-sm">Lactiplantibacillus plantarum</dt>
                <dd className="text-[12px] leading-5 text-ink/52">Facultative heterofermenter</dd>
              </div>
              <div>
                <dt className="text-[13px] italic text-ink sm:text-sm">Levilactobacillus brevis · Pediococcus</dt>
                <dd className="text-[12px] leading-5 text-ink/52">Other frequently observed LAB groups</dd>
              </div>
            </dl>
          </div>
        </div>
        <figcaption className="mt-2 text-[10px] leading-4 text-ink/44 sm:text-[11px] sm:leading-5">
          Microscopy-inspired illustrations generated for this guide, with representative morphology based on{" "}
          <a className="underline decoration-ink/20 underline-offset-2 hover:text-ink" href="https://doi.org/10.7554/eLife.61644" rel="noreferrer" target="_blank">
            Landis et al., 2021
          </a>
          . Representative rather than exhaustive; cells are not to scale.
        </figcaption>
      </figure>

      <figure className="min-w-0">
        <div className="mb-3 flex items-baseline gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-moss">Figure 2</span>
          <h3 className="text-base font-semibold tracking-tight text-ink">Three LAB fermentation modes</h3>
        </div>
        <div className="grid border-y border-ink/10 bg-surface/28 sm:grid-cols-3 sm:divide-x sm:divide-ink/10">
          {labModes.map((mode, index) => (
            <div className="border-b border-ink/10 p-4 last:border-b-0 sm:border-b-0" key={mode.title}>
              <div className="mb-4 flex items-center gap-2">
                <span className="grid size-6 shrink-0 place-items-center rounded-full border border-moss/35 text-[11px] font-semibold text-moss">{index + 1}</span>
                <h4 className="text-[13px] font-semibold leading-5 text-ink">{mode.title}</h4>
              </div>
              <div className="text-center">
                <span className="inline-flex rounded-full border border-ink/10 px-2.5 py-1 text-[12px] font-medium text-ink/65">sugar</span>
                <div className="mx-auto h-5 w-px bg-moss/45" />
                <div className="mx-auto -mt-1 size-2 rotate-45 border-b border-r border-moss/60" />
                <p className="mt-2 text-[12px] font-medium leading-5 text-ink/55">{mode.route}</p>
              </div>
              <div className="mt-3 grid gap-1 border-t border-ink/[0.07] pt-3">
                {mode.outputs.map((output) => (
                  <p className="text-[12px] leading-5 text-ink/62" key={output}>→ {output}</p>
                ))}
              </div>
              <p className="mt-3 text-[11px] italic leading-5 text-ink/46">{mode.examples}</p>
            </div>
          ))}
        </div>
        <figcaption className="mt-2 text-[10px] leading-4 text-ink/44 sm:text-[11px] sm:leading-5">
          Original pathway summary based on the LAB classification reviewed in{" "}
          <a className="underline decoration-ink/20 underline-offset-2 hover:text-ink" href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8306212/" rel="noreferrer" target="_blank">
            Sourdough Microbiome Comparison and Benefits
          </a>
          . Products vary with substrate, strain and electron acceptors.
        </figcaption>
      </figure>
    </div>
  );
}

export function SourdoughGuide({
  isAdmin,
  openCrumbCookbook,
}: {
  isAdmin: boolean;
  openCrumbCookbook: ImportedCookbook | null;
}) {
  const [targetWeight, setTargetWeight] = useState(1600);
  const [hydration, setHydration] = useState(80);
  const [startTime, setStartTime] = useState("12:00");
  const hydrationStops = Array.from({ length: 7 }, (_, index) => 70 + index * 5);

  const formula = useMemo(() => {
    const hydrationDecimal = hydration / 100;
    const flour = targetWeight / (1 + STARTER_PERCENT + hydrationDecimal + SALT_PERCENT);
    const scale = targetWeight / BASE_DOUGH_WEIGHT;
    const starterFlour = (flour * STARTER_PERCENT) / (1 + STARTER_HYDRATION);
    const starterWater = starterFlour * STARTER_HYDRATION;
    const actualHydration = ((flour * hydrationDecimal) + starterWater) / (flour + starterFlour);

    return {
      flour,
      breadFlour: flour * BREAD_FLOUR_RATIO,
      wholeWheat: flour * WHOLE_WHEAT_RATIO,
      rye: flour * RYE_RATIO,
      starter: flour * STARTER_PERCENT,
      starterFlour,
      starterWater,
      water: flour * hydrationDecimal,
      salt: flour * SALT_PERCENT,
      dustingBread: BASE_DUSTING_BREAD * scale,
      dustingRice: BASE_DUSTING_RICE * scale,
      actualHydration,
    };
  }, [hydration, targetWeight]);

  return (
    <div className="grid gap-7 sm:gap-8">
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]" id="sourdough-calculator">
        <article className="rounded-[1.7rem] border border-ink/10 bg-surface/55 p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Calculator</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">Scale the dough</h2>
            </div>
            <p className="text-xs leading-5 text-ink/50 sm:text-sm">Flour combinations can change, so the total flour amount is shown too.</p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">Final dough weight (g)</span>
              <p className="text-[0.68rem] leading-4 text-ink/45 sm:text-[0.72rem]">
                Common boule masses: 700g small · 900g standard · 1100g large
              </p>
              <input
                className="h-11 rounded-2xl border border-ink/15 bg-surface/75 px-4 text-base outline-none transition focus:border-ink/35"
                min={300}
                onChange={(event) => {
                  const normalized = normalizeNumericInputText(event.currentTarget.value);
                  event.currentTarget.value = normalized;
                  setTargetWeight(Number(normalized) || 0);
                }}
                onFocus={(event) => event.currentTarget.select()}
                step={10}
                type="number"
                value={targetWeight}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">Start time</span>
              <p aria-hidden="true" className="text-[0.68rem] leading-4 text-transparent sm:text-[0.72rem]">
                Common boule masses: 700g small · 900g standard · 1100g large
              </p>
              <input
                className="h-11 rounded-2xl border border-ink/15 bg-surface/75 px-4 text-base outline-none transition focus:border-ink/35"
                onChange={(event) => setStartTime(event.currentTarget.value)}
                type="time"
                value={startTime}
              />
            </label>
          </div>

          <div className="mt-5 rounded-[1.3rem] border border-ink/10 bg-paper/70 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">Hydration</p>
                <p className="mt-2 text-xl font-semibold sm:text-2xl">{hydration}%</p>
              </div>
              <p className="max-w-sm text-xs leading-5 text-ink/60 sm:text-sm sm:leading-6">
                Water changes live here so you can see exactly how much to add for a wetter or tighter dough.
              </p>
            </div>
            <input
              aria-label="Hydration slider"
              className="mt-5 block w-full accent-[#7a6a58]"
              max={100}
              min={70}
              onChange={(event) => setHydration(Number(event.currentTarget.value))}
              step={1}
              type="range"
              value={hydration}
            />
            <div className="relative mt-3 h-8 text-[0.68rem] text-ink/45 sm:text-xs">
              {hydrationStops.map((stop) => {
                const left = ((stop - 70) / (100 - 70)) * 100;

                return (
                  <div
                    className="absolute top-0 -translate-x-1/2"
                    key={stop}
                    style={{ left: `${left}%` }}
                  >
                    <span className="block h-2 w-px bg-ink/20 mx-auto" />
                    <span className="mt-1 block whitespace-nowrap">{stop}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {[
              ["Total flour (100%)", round(formula.flour)],
              ["Bread flour (85%)", round(formula.breadFlour)],
              ["Whole wheat flour (11.25%)", round(formula.wholeWheat)],
              ["Dark rye flour (3.75%)", round(formula.rye)],
              ["Starter (20%)", round(formula.starter)],
              [`Water (${hydration}%)`, round(formula.water)],
              ["Salt (2%)", formatOneDecimal(formula.salt)],
            ].map(([label, value]) => (
              <div className="rounded-[1.15rem] border border-ink/10 bg-surface/70 px-4 py-3" key={String(label)}>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">{label}</p>
                <p className="mt-1.5 text-base font-semibold sm:text-lg">{value}g</p>
              </div>
            ))}
            <div className="rounded-[1.15rem] border border-ink/10 bg-paper/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">Actual hydration</p>
              <p className="mt-1.5 text-base font-semibold sm:text-lg">{(formula.actualHydration * 100).toFixed(1)}%</p>
              <p className="mt-1 text-[0.7rem] leading-4 text-ink/50 sm:text-xs">
                Includes the water already inside your lower-hydration starter.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[1.3rem] border border-ink/10 bg-surface/60 p-4 text-xs leading-6 text-ink/60 sm:text-sm">
            Dusting flour stays fixed at a <span className="font-semibold text-ink">1:2 mass ratio</span> of bread flour to rice flour.
          </div>
        </article>

        <div className="grid gap-5">
        <article className="rounded-[1.7rem] border border-ink/10 bg-surface/55 p-5 sm:p-6">
          <p className="eyebrow">Starter feed</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">Daily feeding notes</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-ink/65">
            <p>Feed twice a day.</p>
            <p>1 part starter by mass.</p>
            <p>6 part water by mass.</p>
            <p>9 part flour by mass. You can use different flours, and rye is often added.</p>
            <p>You do not have to use my starter feeding recipe exactly, even if it is the one I recommend here.</p>
            <p>My starter sits at a lower hydration than most, so the headline hydration numbers above will read a little differently from the true overall dough hydration.</p>
            <p>A lower-hydration starter tends to favour yeast activity a bit more relative to LABs, which can help give a stronger rise. That can be useful if you want lift and structure, since too much acid over time can weaken the dough.</p>
            <p>Everything is kept around 27 - 28C.</p>
          </div>
        </article>
        </div>
      </section>

      <section className="rounded-[1.7rem] border border-ink/10 bg-surface/55 p-5 sm:p-6" id="sourdough-timeline">
        <p className="eyebrow">Timeline</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Example schedule with time labels</h2>
          <p className="text-xs leading-5 text-ink/50 sm:text-sm">Based on the uploaded sourdough guide and your chosen start time.</p>
        </div>

        <div className="mt-5 grid gap-3 xl:grid-cols-2">
          {timelineTemplate.map((step) => (
            <article className="rounded-[1.2rem] border border-ink/10 bg-paper/75 p-4" key={`${step.title}-${step.offsetMinutes}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">{formatClock(startTime, step.offsetMinutes)}</p>
                  <h3 className="mt-1.5 text-base font-semibold sm:text-lg">{step.title}</h3>
                </div>
              </div>
              <p className="mt-2 text-sm leading-6 text-ink/65">{step.body}</p>
              {step.note ? <p className="mt-2 text-sm leading-6 text-ink/50">{step.note}</p> : null}
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[1.7rem] border border-ink/10 bg-surface/55 p-5 sm:p-6" id="sourdough-gallery">
        <p className="eyebrow">Gallery</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Recent loaves and crumb shots</h2>
          <p className="text-xs leading-5 text-ink/50 sm:text-sm">A quick visual reference for crust, oven spring, and interior structure.</p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              src: "/sourdough-step-1.png",
              alt: "Sourdough loaf with an open ear",
              caption: "Pronounced ear and strong oven spring.",
            },
            {
              src: "/sourdough-step-2.png",
              alt: "Sourdough crumb cross section",
              caption: "Open crumb and interior structure.",
            },
            {
              src: "/sourdough-step-3.png",
              alt: "Finished round sourdough boule",
              caption: "Round boule shape and darker crust finish.",
            },
          ].map((image) => (
            <figure className="overflow-hidden rounded-[1.35rem] border border-ink/10 bg-paper/70" key={image.src}>
              <RecipeImageViewer alt={image.alt} className="relative aspect-[4/5] w-full" src={image.src}>
                <Image alt={image.alt} className="object-cover" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" src={image.src} unoptimized />
              </RecipeImageViewer>
              <figcaption className="px-4 py-3 text-sm leading-6 text-ink/60">{image.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2" id="sourdough-notes">
        <article className="rounded-[1.7rem] border border-ink/10 bg-surface/55 p-5 sm:p-6">
          <p className="eyebrow">My flours</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">My ingredient notes</h2>
          <div className="mt-4 space-y-4 text-sm leading-6 text-ink/65">
            <div>
              <p className="font-semibold text-ink">Bread flour</p>
              <p>14.5% protein, W 370-390, P/L 0.5-0.6. High protein (above 13%) and high P/L (above 0.5) help long fermentation and acid resistance.</p>
              <a className="text-moss hover:text-ink" href="https://a.co/d/01vMqLwX" rel="noreferrer" target="_blank">Bread flour link ↗</a>
            </div>
            <div>
              <p className="font-semibold text-ink">Dark rye flour</p>
              <p>Used for flavour and a really nice creaminess, especially in the starter. If too much is used, the larger grain can weaken gluten strands.</p>
              <a className="text-moss hover:text-ink" href="https://a.co/d/0gAu4wb6" rel="noreferrer" target="_blank">Dark rye flour link ↗</a>
            </div>
            <div>
              <p className="font-semibold text-ink">Whole grain flour</p>
              <p>This one behaves more like something between bread flour and whole grain flour. It adds maltiness and helps develop colour.</p>
              <a className="text-moss hover:text-ink" href="https://a.co/d/0eHtkt0S" rel="noreferrer" target="_blank">Whole grain flour link ↗</a>
            </div>
          </div>
        </article>

        <article className="rounded-[1.7rem] border border-ink/10 bg-surface/55 p-5 sm:p-6">
          <p className="eyebrow">My additions</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">Optional extras</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-ink/65">
            <li>Vital wheat gluten can supplement a lower-gluten flour.</li>
            <li>Wheat bran can be added during folding for extra fibre and to absorb excess water.</li>
            <li>Cut malted rye grains add a very dark colour and a deep malted flavour.</li>
            <li>Dark malt powder and diastatic malt powder can be dissolved into the water for more flavour.</li>
            <li>If additions are high in sugar, like malted grains or blackstrap molasses, reduce fermentation time accordingly.</li>
          </ul>
          <a className="mt-4 inline-flex text-sm font-semibold text-moss hover:text-ink" href="https://www.shipton-mill.com/products/cut-malted-rye-grains-500g-306" rel="noreferrer" target="_blank">
            Cut malted rye grains link ↗
          </a>
        </article>
      </section>

      <section className="grid gap-5" id="sourdough-food-science">
        <article className="min-w-0 overflow-hidden rounded-[1.7rem] border border-ink/10 bg-surface/55">
          <div className="border-b border-ink/10 p-5 sm:p-6">
            <div>
              <p className="eyebrow">Food science review</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Sourdough as a coupled biochemical and mechanical system</h2>
              <p className="mt-3 max-w-3xl text-[0.95rem] leading-7 text-ink/62 sm:text-base">
                Here is my really long rant about sourdough food science, fact-checked with papers just in case.
              </p>
            </div>
          </div>

          <div className="grid min-w-0 gap-3 p-4 sm:p-5">
            <details className="group min-w-0 rounded-[1.35rem] border border-ink/10 bg-paper/68 p-4 open:bg-paper/85 sm:p-5" open>
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-lg font-semibold tracking-tight text-ink sm:text-xl">1. Starter ecology and biochemical control</p>
                  <p className="mt-1 max-w-3xl text-[0.9rem] leading-6 text-ink/52 sm:text-[0.95rem] sm:leading-7">
                    The starter ecosystem, yeast and LAB metabolism, gluten breakdown, hydration, flour choice and the controls that shift a culture.
                  </p>
                </div>
                <span aria-hidden="true" className="mt-0.5 text-xl leading-none text-moss transition group-open:rotate-45">+</span>
              </summary>

              <div className="mt-5 min-w-0 border-t border-ink/[0.07] pt-5">
                <StarterMicrobeFigures />
                <ChemistryEquationPlate
                  equations={starterChemistryEquations}
                  title="Starter metabolism, acid–base balance and proteolysis"
                />
                {starterScienceTopics.map((topic) => (
                  <section className="border-b border-ink/[0.07] py-5 first:pt-0 last:border-b-0 last:pb-0" key={topic.title}>
                    <h3 className="text-base font-semibold tracking-tight text-ink">{topic.title}</h3>
                    <div className="mt-3 grid gap-3">
                      {topic.points.map((point) => (
                        <p className="text-[0.95rem] leading-7 text-ink/62 sm:text-base" key={point}>{point}</p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </details>

            {breadScienceChapters.map((chapter) => (
              <details className="group min-w-0 rounded-[1.35rem] border border-ink/10 bg-paper/68 p-4 open:bg-paper/85 sm:p-5" key={chapter.title}>
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-lg font-semibold tracking-tight text-ink sm:text-xl">{chapter.title}</p>
                    <p className="mt-1 max-w-3xl text-[0.9rem] leading-6 text-ink/52 sm:text-[0.95rem] sm:leading-7">{chapter.summary}</p>
                  </div>
                  <span aria-hidden="true" className="mt-0.5 text-xl leading-none text-moss transition group-open:rotate-45">+</span>
                </summary>
                <div className="mt-5 min-w-0 border-t border-ink/[0.07] pt-5">
                  <ChemistryEquationPlate
                    equations={breadChemistryEquations[chapter.title] ?? []}
                    title={
                      chapter.title.startsWith("2.")
                        ? "Dough hydration, protein rearrangement and mixing"
                        : chapter.title.startsWith("3.")
                          ? "Gas transfer, bubble pressure and dough relaxation"
                          : "Heat, water transport, setting and browning"
                    }
                  />
                  {chapter.sections.map((section) => (
                    <section className="border-b border-ink/[0.07] py-5 first:pt-0 last:border-b-0 last:pb-0" key={section.title}>
                      <h3 className="text-base font-semibold tracking-tight text-ink">{section.title}</h3>
                      <div className="mt-3 grid gap-3">
                        {section.paragraphs.map((paragraph) => (
                          <p className="text-[0.95rem] leading-7 text-ink/64 sm:text-base" key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </details>
            ))}

            <details className="group/sources min-w-0 rounded-[1.15rem] border border-ink/[0.08] bg-paper/55 p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <p className="text-sm font-semibold text-ink">References and further reading</p>
                <span aria-hidden="true" className="text-lg leading-none text-moss transition group-open/sources:rotate-45">+</span>
              </summary>
              <div className="mt-3 grid gap-2 border-t border-ink/[0.07] pt-3 sm:grid-cols-2">
                {starterScienceReferenceGroups.map((group) => (
                  <details className="group/reference rounded-xl border border-ink/[0.08] bg-surface/45 px-3 py-2.5" key={group.label}>
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-ink">{group.label}</p>
                        <p className="mt-0.5 text-[11px] leading-4 text-ink/45">{group.note}</p>
                      </div>
                      <span aria-hidden="true" className="text-base leading-none text-moss transition group-open/reference:rotate-45">+</span>
                    </summary>
                    <ul className="mt-2 grid gap-1.5 border-t border-ink/[0.07] pt-2">
                      {group.links.map((source) => (
                        <li className="text-xs leading-5 text-ink/58" key={source.href}>
                          <a className="text-moss hover:text-ink" href={source.href} rel="noreferrer" target="_blank">
                            {source.label} ↗
                          </a>
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            </details>
          </div>

          <p className="border-t border-ink/10 px-5 py-4 text-xs leading-5 text-ink/45 sm:px-6">
            Research describes tendencies, not a universal starter formula. Species and strains respond differently, so practical adjustments should be made one variable at a time and judged over several feeding cycles.
          </p>
        </article>
      </section>

      {isAdmin && openCrumbCookbook ? (
        <section className="rounded-[1.7rem] border border-ink/10 bg-surface/40 p-4 sm:p-5" id="sourdough-open-crumb-recipes">
          <div className="mb-5 px-1">
            <p className="eyebrow">Bread Stalker formulas</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Nine open-crumb recipes</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/55">
              The formulas below are by Adelina “Addie” Roberts / Bread Stalker. Their methods have been shortened and placed in chronological order from the original multi-column recipe pages, while retaining the recorded temperatures, folds, fermentation, proof and bake.
            </p>
          </div>
          <ImportedCookbookGuide cookbook={openCrumbCookbook} />
        </section>
      ) : null}
    </div>
  );
}
