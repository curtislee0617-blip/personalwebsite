"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

const STARTER_PERCENT = 0.2;
const SALT_PERCENT = 0.02;
const STARTER_HYDRATION = 6 / 9;
const BREAD_FLOUR_RATIO = 680 / 800;
const WHOLE_WHEAT_RATIO = 90 / 800;
const RYE_RATIO = 30 / 800;
const BASE_DOUGH_WEIGHT = 1600;
const BASE_DUSTING_BREAD = 100;
const BASE_DUSTING_RICE = 200;

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

export function SourdoughGuide() {
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
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <article className="rounded-[1.7rem] border border-ink/10 bg-white/55 p-5 sm:p-6">
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
                className="h-11 rounded-2xl border border-ink/15 bg-white/75 px-4 text-base outline-none transition focus:border-ink/35"
                min={300}
                onChange={(event) => setTargetWeight(Number(event.currentTarget.value) || 0)}
                step={10}
                type="number"
                value={targetWeight}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">Start time</span>
              <input
                className="h-11 rounded-2xl border border-ink/15 bg-white/75 px-4 text-base outline-none transition focus:border-ink/35"
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
              ["Salt (2%)", round(formula.salt)],
            ].map(([label, value]) => (
              <div className="rounded-[1.15rem] border border-ink/10 bg-white/70 px-4 py-3" key={String(label)}>
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

          <div className="mt-5 rounded-[1.3rem] border border-ink/10 bg-white/60 p-4 text-xs leading-6 text-ink/60 sm:text-sm">
            Dusting flour stays fixed at a <span className="font-semibold text-ink">1:2 mass ratio</span> of bread flour to rice flour.
          </div>
        </article>

        <div className="grid gap-5">
        <article className="rounded-[1.7rem] border border-ink/10 bg-white/55 p-5 sm:p-6">
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

      <section className="rounded-[1.7rem] border border-ink/10 bg-white/55 p-5 sm:p-6">
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

      <section className="rounded-[1.7rem] border border-ink/10 bg-white/55 p-5 sm:p-6">
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
            {
              src: "/Screenshot 2026-07-01 at 1.38.07 AM copy.png",
              alt: "Second sourdough loaf angle",
              caption: "Another loaf angle for crust and scoring reference.",
            },
            {
              src: "/Screenshot 2026-07-01 at 1.39.02 AM copy.png",
              alt: "Second sourdough crumb shot",
              caption: "Extra crumb view for cell size and evenness.",
            },
            {
              src: "/Screenshot 2026-07-01 at 1.39.43 AM copy.png",
              alt: "Second boule exterior shot",
              caption: "Another exterior view for shape and colour.",
            },
          ].map((image) => (
            <figure className="overflow-hidden rounded-[1.35rem] border border-ink/10 bg-paper/70" key={image.src}>
              <div className="relative aspect-[4/5]">
                <Image alt={image.alt} className="object-cover" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" src={image.src} />
              </div>
              <figcaption className="px-4 py-3 text-sm leading-6 text-ink/60">{image.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-[1.7rem] border border-ink/10 bg-white/55 p-5 sm:p-6">
          <p className="eyebrow">Flours</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">Ingredient notes</h2>
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

        <article className="rounded-[1.7rem] border border-ink/10 bg-white/55 p-5 sm:p-6">
          <p className="eyebrow">Additions</p>
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
    </div>
  );
}
