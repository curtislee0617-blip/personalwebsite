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

const openCrumbSummarySections = [
  {
    title: "What “open crumb” means",
    body: "Roberts treats open crumb as well-fermented bread, not simply bread with the largest possible holes.",
    points: [
      "The target is a tender, light, well-fermented crumb with a mixture of alveoli that feels pleasant to eat.",
      "A dramatic ear or large oven spring does not prove that the crumb is open. Under-fermented dough can produce both.",
      "Very large isolated cavities are not the goal either: they can come from trapped shaping bubbles and compress the finer crumb around them.",
      "Roberts describes high-quality fermentation as the overwhelming driver of open crumb. Flour strength, hydration and technique support that fermentation rather than replacing it.",
      "Her central instruction is to use sight, smell, touch, taste and experience. Timings are records of one bake, not universal deadlines.",
    ],
  },
  {
    title: "Read the starter before using it",
    body: "The dough reflects the health, strength and acidity of the starter added to it.",
    points: [
      "A healthy starter should feel structured rather than watery, smell pleasantly sweet and fruity, taste mildly sweet-sour without bitterness, and show vigorous bubbling and rise.",
      "In Roberts’ working framework, a warm, underfed, weak and very extensible starter points toward excessive lactic acidity; tiny soapy surface bubbles are treated as a warning rather than a sign of strength.",
      "In the same framework, an acetic starter smells pungent, may look grey and can make the dough overly tight, elastic and prone to tearing. The practical aim is a balance between elasticity and extensibility.",
      "A neglected or long-refrigerated starter may become grey, pungent, runny or overly tight from accumulated acidity. Refresh it repeatedly at room temperature before baking.",
      "Acidity accelerates protease activity. Some protein breakdown improves extensibility, but too much leaves the starter and dough slack, sticky and unable to retain gas.",
      "Watch the rate of rise as well as the height. A starter that suddenly races far ahead of its usual schedule may be out of balance even if it looks impressively strong.",
      "Roberts prefers a white-flour starter for this style of bread because high-fibre feeds can ferment and acidify differently. Whole-grain flour can still be used, but the feeding and temperature need adjustment.",
    ],
  },
  {
    title: "Feed at peak activity",
    body: "Peak is the period of maximum activity, not merely the first moment a dome appears.",
    points: [
      "The starter can continue becoming more active after doming: bubbles increase, the top may level or dimple, and a strong starter can hold this active plateau for a while.",
      "A well-maintained starter may remain at this active plateau for roughly 1-1.5 hours. The first dome is the beginning of the window, not necessarily its strongest point.",
      "Feeding too early repeatedly carries forward a weak seed. Feeding long after peak carries forward exhausted, acidic starter.",
      "An early starter still smells floury and lacks bubbles; a late starter feels thin, runny and depleted. Both conditions can lengthen bulk while the dough’s gluten continues to degrade.",
      "For her room-temperature liquid starter, Roberts feeds at least twice daily and gives enough fresh flour and water to last until the next feed.",
      "Her example maintenance routine is 10g starter, 60g flour and 60g water (1:6:6) every 12 hours at 74-75°F (23-24°C). It is one model to adapt, not a compulsory universal ratio.",
      "Roberts records about pH 3.8 at her preferred peak, but treats that only as confirmation. A pH number cannot describe the full microbial balance, so she recommends learning the starter with the senses first.",
    ],
  },
  {
    title: "Stirring, ratios and levain",
    body: "Starter care is adjusted to the seed amount, feeding interval, flour, hydration and temperature.",
    points: [
      "Roberts stirs with mini stretch-and-folds 1-2 hours after feeding. This redistributes food and temperature, aerates the culture and builds enough gluten for a stronger, longer-lasting peak.",
      "If stirring later, around 3-4 hours after feeding, handle the starter more gently because proteolysis has already softened its gluten. Her preferred timing is within the first two hours.",
      "A very small seed can be overwhelmed by a very large feed; a small feed held too long becomes acidic. Increase or decrease the ratio in response to how quickly the starter peaks and falls.",
      "Lower ratios such as 1:1:1 or 1:2:2 generally need more frequent feeding. Roberts uses a higher ratio partly so one feed lasts the full 12-hour interval and dilutes more accumulated acidity.",
      "She prefers at least 10-20g of seed and a wider bowl rather than a tiny seed in a narrow jar. This is her practical observation, not a universal rule.",
      "A separate levain is optional when the maintained starter is already strong and plentiful. Her warmer levains at 80-83°F (27-28°C) commonly use 1:1:1 or 1:2:2 feeds and peak in roughly 4-6 hours.",
      "A mature starter can work as well as a younger levain when it is healthy and used at genuine peak activity.",
      "With her 1:6:6 routine, the leftover starter can remain useful beyond the nominal 12-hour feed because the high feed provides a long active window. Judge this by continued activity rather than the clock alone.",
    ],
  },
  {
    title: "Creating a starter from scratch",
    body: "The book builds a 100% hydration, white-bread-flour starter gradually and changes the feeding only when the culture shows it is ready.",
    points: [
      "Begin with 50g strong white bread flour and 50g water at 80-83°F (27-28°C). Stir after 12 hours; at 24 hours retain 50g and feed 50g flour plus 50g water.",
      "Repeat 12-hour feeds while stirring halfway through. Around 48-72 hours, move toward 40g starter, 40g flour and 40g water and lower the temperature to about 75-76°F (24-25°C).",
      "Roberts suggests flour around 12.5-13% protein for the initial culture. Weaker flour can peak sooner and collapse faster, while extremely strong flour may leave the young starter heavy and doughy.",
      "Early activity can appear, disappear and smell unpleasant before the culture stabilizes. Wait for a pleasant fermented-fruit aroma, stronger texture, regular bubbles and a repeatable rise.",
      "Once the starter is no longer runny, begin the mini stretch-and-fold stirring routine. Keep the lid mostly closed but slightly ajar, and use a container with enough room for several times the original volume.",
      "Once vigorous, keep 12-hour feeds for several days, then increase from 1:1:1 to 1:2:2 and eventually a higher ratio only as the starter rises and falls faster. Ten days is possible, but the book explicitly notes that another starter took fourteen days to show activity.",
      "A young starter that rises and falls before the next feed is asking for a little more food. Increase the ratio gradually rather than jumping straight to a large maintenance feed.",
    ],
  },
  {
    title: "Optional Bread Stalker experiments",
    body: "These are Roberts’ personal techniques and observations, not prerequisites for good sourdough.",
    points: [
      "A little sugar can sweeten the culture and improve crust colour; small amounts may accelerate fermentation while larger amounts delay it.",
      "Her sweet-starter example begins with 10g starter, 60g flour and 60g water plus roughly 9-12g sugar. A much larger 30g sugar addition took about 19-20 hours to peak at 75°F (24°C), so it must follow its own schedule.",
      "Her egg-yolk starter replaces a little water with yolk and adds sugar. She uses it to moderate acidity and add strength, tenderness and colour.",
      "The recorded egg-yolk version uses 10g starter, 60g flour, 54g water, 6g yolk and 9g sugar. Roberts also describes a smaller 2-6g yolk addition as an occasional treatment.",
      "Her short sugar-water “bath” for a strong floating starter is intended to shed acidity before a feed. She warns against using it on an already thin, weak starter.",
      "For that experiment she dissolves about 5g sugar in enough water to cover the starter, waits for it to float and removes seed after 10-15 minutes. Beyond about 20 minutes, she observed the starter beginning to disintegrate.",
      "Adding a whole egg as part of dough hydration can add protein, fat, colour and tenderness, but the dough generally needs more water and a longer bulk.",
      "These techniques are personal observations from Roberts, and she explicitly says an egg or treatment cannot compensate for poor starter care or inadequate fermentation.",
    ],
  },
  {
    title: "Autolyse and mixing",
    body: "Autolyse builds and relaxes gluten before fermentation; mixing organizes the dough and creates the initial air pockets that later expand.",
    points: [
      "Autolyse can range from about 30 minutes to overnight. Whole-grain and coarse flours benefit because the bran hydrates and softens.",
      "Long autolyses need suitable flour, cooler conditions around 69-72°F (20-22°C), and sensible hydration. They reduce the mixing needed later.",
      "Roberts’ overnight practice uses flour and water without starter; she does not refrigerate it or add salt when the dough can stay in that cool range. Fermentolyse is a separate option, and its fermentation clock starts as soon as starter is included.",
      "After autolyse, add the starter and mix gently until incorporated. Roberts normally waits 30 minutes before adding salt so fermentation gets a head start.",
      "With a long autolyse, 2-3 minutes of gentle mixing may be enough. With a short one, she mixes 3-4 minutes, rests 5-7 minutes, then mixes briefly again.",
      "The finished mix should look supple, smooth, glossy and strong. Higher hydration usually needs a little more mixing, but tearing already-developed gluten defeats the purpose.",
      "In the book’s explanation, mixing creates the initial air bubbles; fermentation enlarges them with dissolved CO₂, while later folds and shaping mainly rearrange bubbles that already exist.",
      "Lamination is optional but adds early strength and is a convenient moment to distribute seeds, cheese or other inclusions.",
      "For lamination, wet the counter well, stretch gently from the centre into a thin rectangle, add inclusions, then fold it like a letter and again into a compact square. A dry counter makes sticking and tearing more likely.",
    ],
  },
  {
    title: "Bulk fermentation and coil folds",
    body: "High-quality fermentation is the main driver of an open crumb.",
    points: [
      "Build structure early enough to retain gas, then leave the dough undisturbed long enough to relax and finish fermenting.",
      "High-hydration doughs usually need more frequent coil folds; lower-hydration doughs need fewer. Fold when the dough spreads and loses its body, not simply because a timer rings.",
      "Her rough starting point is 4-5 folds every 30-45 minutes for wetter dough, sometimes every 20 minutes at very high hydration. A firmer dough may need only 1-2 folds about 60 minutes apart.",
      "Coil folds build layered structure, even out dough temperature and redistribute gas. Folding too loosely or tightly can change the eventual alveoli pattern.",
      "Roberts commonly keeps dough around 74-76°F (23-25°C), but the flour, hydration, starter, additions and room conditions all change the rate.",
      "Measure the dough, not only the proofer: lamination on a cool counter can lower its temperature. Roberts often begins near 72°F (22°C), then brings the dough back toward 74-76°F (23-25°C).",
      "End bulk when the dough is large, puffy, glossy and smooth, with rounded edges and an easy release from its container. Her examples often run 6-11.5 hours, and the dinner rolls go longer and cooler.",
      "After the final fold, she may leave the dough untouched for 1-5 hours until it is relaxed, extensible and no longer fights shaping. A fold performed too close to shaping can leave it overly elastic.",
      "White flour, whole grain, hydration, additions, altitude and inoculation all change fermentation speed. This is why identical clock times cannot be transferred blindly between kitchens.",
      "If shaping earlier for easier handling, let the shaped loaf finish fermenting warm before refrigeration. A long cold proof cannot fully replace adequate warm fermentation.",
    ],
  },
  {
    title: "Shaping, proofing and scoring",
    body: "Handle a fully aerated dough gently, but create enough outer tension to support its final rise.",
    points: [
      "Shaping redistributes gas. Pop isolated giant bubbles that would otherwise create caverns, while preserving the finer aeration throughout the dough.",
      "Too little tension makes a weak, flat loaf; too much makes the dough resist expansion. Minimal, confident handling reduces tearing and overheating.",
      "Roberts often skips a separate pre-shape, so the final coil fold is kept neat enough to perform part of that job. A pre-shape remains useful when extra strength or more even shaping is needed.",
      "The book’s typical cold proof is 10-15 hours at 38-40°F (3-4°C), adjusted for dough maturity, salt level, inoculation and fridge temperature.",
      "An 8-9 hour proof can suit a warmer fridge, humid conditions or a lower-salt dough; Roberts reports pushing some loaves to 19 hours. Bulk maturity determines how much cold time remains appropriate.",
      "A mature starter may move proofing faster than a young levain. Longer bulk can shorten the remaining proof, but Roberts still prioritizes doing most fermentation at a useful warm temperature.",
      "Cold dough is easier to handle and score with less gas loss. Roberts also associates the warm-cold-warm temperature cycle with deeper flavour and a more irregular bubble arrangement.",
      "Score to suit the dough’s strength and fermentation. A very well-fermented loaf usually needs a shallower score; a strong or less-fermented dough can tolerate a deeper one.",
      "Wet or lightly oil the blade if it drags. Score confidently in the intended direction: the cut is the controlled weak point from which the loaf expands.",
      "Do not chase an ear by deliberately under-fermenting. The quality of the whole crumb matters more than one ridge of crust.",
    ],
  },
  {
    title: "Baking and steam",
    body: "Steam keeps the surface flexible while the loaf expands, but the amount should match the maturity of the dough.",
    points: [
      "Too little steam can set the crust early; too much can flatten a highly fermented, gas-filled loaf.",
      "Steam transfers heat efficiently, keeps the surface flexible during oven spring and encourages a thinner, glossy, blistered crust. A mature loaf needs less assistance before the crust begins supporting it.",
      "Roberts’ standard home method is a cast-iron vessel preheated for about an hour, followed by 20 minutes covered at 500°F (260°C) and roughly 20 minutes uncovered at 430°F (220°C).",
      "Spraying the loaf, adding a small ice cube, or using a stone with a steam tray are alternatives, but the amount should be adjusted to dough maturity rather than added automatically.",
      "For a darker, thicker crust, she may bake longer or leave the loaf in a switched-off or 170°F (77°C) oven for 35-40 minutes.",
      "Let the loaf cool completely before cutting. The book recommends at least two hours even though the author admits that waiting is difficult.",
    ],
  },
  {
    title: "Flour, water and salt",
    body: "Ingredients change the dough’s behaviour, so percentages must be interpreted through the specific flour and process.",
    points: [
      "Roberts favours clean, unbleached bread flour around 11.5-13% protein. Extremely strong flour can make regular sourdough tough; a small amount can strengthen a weaker blend.",
      "For starter feeds she prefers roughly 12.5-13% protein because it can hold a steadier peak. Lower-protein flour may peak sooner, so reduce hydration or shorten the interval instead of assuming the same schedule.",
      "Flour with added enzymes can accelerate fermentation and proteolysis unexpectedly. If the starter repeatedly turns thin despite careful feeding, check the ingredient label as well as the routine.",
      "Whole meal and coarse bran need more time and water. Spelt increases extensibility. Durum gives colour and flavour but can weaken as its percentage rises; smooth durum is gentler than coarse semolina.",
      "With spelt, Roberts suggests lowering hydration and adding enough early folds to counter its extensibility. With durum, she suggests learning the flour around 25-30% of the blend before attempting a 100% loaf.",
      "Learn one flour through repeated bakes. Different batches can absorb water and ferment differently even under the same label.",
      "Hydration should match the flour’s absorption and protein quality. If a familiar 80% dough suddenly behaves like 90%, hold back water and assess the new flour batch.",
      "Dechlorinate tap water by leaving it uncovered for at least 30 minutes or overnight, or use filtered or spring water. Fermented fruit water can speed the dough considerably.",
      "Salt strengthens gluten and slows fermentation. Two percent is the standard in most formulas; 1-1.5% is an intentional advanced adjustment that makes dough faster, softer and more proteolytically active.",
      "Dissolve or incorporate salt carefully. Very coarse flakes can remain uneven and may physically damage delicate gluten; Roberts reserves flaky salt for topping rather than the main dough.",
    ],
  },
] as const;

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

export function SourdoughGuide({ openCrumbCookbook }: { openCrumbCookbook: ImportedCookbook }) {
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
              src: "/Screenshot 2026-07-01 at 1.38.07 AM.png",
              alt: "Sourdough loaf with an open ear",
              caption: "Pronounced ear and strong oven spring.",
            },
            {
              src: "/Screenshot 2026-07-01 at 1.39.02 AM.png",
              alt: "Sourdough crumb cross section",
              caption: "Open crumb and interior structure.",
            },
            {
              src: "/Screenshot 2026-07-01 at 1.39.43 AM.png",
              alt: "Finished round sourdough boule",
              caption: "Round boule shape and darker crust finish.",
            },
          ].map((image) => (
            <figure className="overflow-hidden rounded-[1.35rem] border border-ink/10 bg-paper/70" key={image.src}>
              <RecipeImageViewer alt={image.alt} className="relative aspect-[4/5] w-full" src={image.src}>
                <Image alt={image.alt} className="object-cover" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" src={image.src} />
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

      <section className="grid gap-5" id="sourdough-open-crumb-summary">
        <article className="overflow-hidden rounded-[1.7rem] border border-ink/10 bg-surface/55">
          <div className="grid gap-5 border-b border-ink/10 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
            <div>
              <p className="eyebrow">Condensed book notes</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Secrets of Open Crumb - the short version</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/62">
                Open crumb is the result of a strong, well-fed starter; controlled acidity; suitable flour and hydration; deliberate dough development; and enough fermentation. The book repeatedly returns to one practical rule: record the time, but make the decision from the dough in front of you.
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-ink/10 bg-paper/75 p-4 text-sm leading-6 text-ink/58">
              <p className="font-semibold text-ink">Full source credit</p>
              <p className="mt-1">
                All ideas, original formulas and source photographs in this section are credited to Adelina “Addie” Roberts, known as Bread Stalker.
              </p>
              <a className="mt-2 inline-flex font-semibold text-moss hover:text-ink" href="https://www.instagram.com/breadstalker/" rel="noreferrer" target="_blank">
                @breadstalker ↗
              </a>
            </div>
          </div>

          <div className="grid gap-3 p-4 sm:p-5 lg:grid-cols-2">
            {openCrumbSummarySections.map((section, index) => (
              <details className="group rounded-[1.25rem] border border-ink/10 bg-paper/68 p-4 open:bg-paper/85" key={section.title} open={index < 2}>
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold tracking-tight text-ink">{section.title}</p>
                    <p className="mt-1 text-xs leading-5 text-ink/50">{section.body}</p>
                  </div>
                  <span aria-hidden="true" className="mt-0.5 text-lg leading-none text-moss transition group-open:rotate-45">+</span>
                </summary>
                <ul className="mt-4 grid gap-2.5 border-t border-ink/[0.07] pt-4">
                  {section.points.map((point) => (
                    <li className="grid grid-cols-[0.45rem_minmax(0,1fr)] gap-2 text-sm leading-6 text-ink/62" key={point}>
                      <span aria-hidden="true" className="mt-[0.65rem] h-1 w-1 rounded-full bg-moss/75" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>

          <p className="border-t border-ink/10 px-5 py-4 text-xs leading-5 text-ink/45 sm:px-6">
            This is a condensed study guide written from the supplied 2022 book, not a replacement for the original. Roberts’ egg-yolk starter and sugar-water bath are presented as her personal experiments; the wording above has been shortened and reorganized for practical reference.
          </p>
        </article>
      </section>

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
    </div>
  );
}
