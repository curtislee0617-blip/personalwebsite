import type { Metadata } from "next";
import Image from "next/image";
import "./sushi-guide.css";
import { HistoryBackButton } from "@/components/history-back-button";
import { PageIntro } from "@/components/page-intro";
import { RecipeImageViewer } from "@/components/recipe-image-viewer";
import { SectionRail } from "@/components/section-rail";
import { SushiIngredientAtlas } from "@/components/sushi-ingredient-atlas";
import { SushiUniGuide } from "@/components/sushi-uni-guide";
import speciesImageManifest from "@/data/sushi-species-images.json";
import {
  sushiFoundationIngredients,
  sushiReferenceSources,
} from "@/data/sushi-guide-data";

export const metadata: Metadata = {
  title: "The sushi counter, decoded",
  description:
    "A visual guide to sushi fish and ingredients with Japanese names, pronunciation, whole-animal photographs, seasonality, preparation and food science.",
};

const sections = [
  { id: "sushi-start", label: "Start here" },
  { id: "sushi-atlas", label: "Fish & ingredients" },
  { id: "sushi-uni", label: "Uni" },
  { id: "sushi-science", label: "Why fish tastes different" },
  { id: "sushi-foundations", label: "Rice & seasoning" },
  { id: "sushi-safety", label: "Raw fish safety" },
  { id: "sushi-sources", label: "Sources" },
] as const;

type SpeciesImage = {
  artist: string;
  descriptionUrl: string;
  height: number;
  license: string;
  licenseUrl: string;
  src: string;
  width: number;
};

const speciesImages = speciesImageManifest as Record<string, SpeciesImage>;

function FoundationImage({
  english,
  imageKey,
}: {
  english: string;
  imageKey: string | null;
}) {
  const image = imageKey ? speciesImages[imageKey] : null;
  if (!image) {
    return (
      <div className="sushi-foundation-image is-graphic" aria-hidden="true">
        <span>{english === "Rice vinegar and red vinegar" ? "酢" : "醤"}</span>
      </div>
    );
  }

  return (
    <>
      <div className="sushi-foundation-image">
        <Image
          alt={`${english} before it reaches the sushi counter`}
          fill
          sizes="(max-width: 680px) 88vw, (max-width: 1100px) 42vw, 20rem"
          src={image.src}
        />
      </div>
      <p className="sushi-foundation-credit">
        <a href={image.descriptionUrl} rel="noreferrer" target="_blank">{image.artist}</a>
        {" · "}
        <a href={image.licenseUrl} rel="noreferrer" target="_blank">{image.license}</a>
      </p>
    </>
  );
}

function TunaCutMap() {
  return (
    <figure className="sushi-tuna-map">
      <div aria-label="Scrollable tuna cutting diagram" className="sushi-tuna-map-scroll" role="group" tabIndex={0}>
        <svg aria-labelledby="sushi-tuna-map-title sushi-tuna-map-description" role="img" viewBox="0 0 980 430">
        <title id="sushi-tuna-map-title">A lengthwise tuna map beside a cross-section through its central naka section</title>
        <desc id="sushi-tuna-map-description">
          The whole fish is divided into head-side kami, central naka and tail-side shimo sections. The naka
          cross-section shows akami in the central loin, chutoro around the fattier outer back and belly, otoro
          concentrated in the lower belly, a dark horizontal bloodline, and the abdominal cavity.
        </desc>
        <defs>
          <clipPath id="sushi-tuna-body-clip">
            <path d="M46 218c39-65 133-91 258-82 75 5 133 28 176 64l59-47-15 63 17 54-62-32c-43 34-102 51-177 53-125 4-217-20-256-73Z" />
          </clipPath>
          <clipPath id="sushi-tuna-section-clip">
            <ellipse cx="760" cy="222" rx="126" ry="165" />
          </clipPath>
          <linearGradient id="sushi-tuna-naka-highlight" x1="0" x2="1">
            <stop offset="0" stopColor="#ead9cc" />
            <stop offset=".5" stopColor="#f1e5dc" />
            <stop offset="1" stopColor="#ead9cc" />
          </linearGradient>
        </defs>

        <g className="sushi-tuna-length-map">
          <text className="sushi-tuna-kicker" x="38" y="36">ALONG THE FISH</text>
          <text className="sushi-tuna-panel-title" x="38" y="65">Kami → naka → shimo</text>

          <g clipPath="url(#sushi-tuna-body-clip)">
            <rect fill="#dfd1c3" height="180" width="150" x="35" y="126" />
            <rect fill="url(#sushi-tuna-naka-highlight)" height="180" width="170" x="185" y="126" />
            <rect fill="#d8c9bc" height="180" width="190" x="355" y="126" />
            <path d="M55 218h430" stroke="#8f3446" strokeOpacity=".4" strokeWidth="2" />
            <path d="M123 214c10 17 24 29 44 36l16-37-18-31c-17 7-31 17-42 32Z" fill="#efb0ab" />
            <path d="M185 122v190M355 122v190" stroke="#514640" strokeDasharray="4 5" strokeOpacity=".48" strokeWidth="2" />
            <path d="M270 120v194" stroke="#8f3446" strokeDasharray="7 5" strokeOpacity=".78" strokeWidth="3" />
          </g>

          <path
            d="M46 218c39-65 133-91 258-82 75 5 133 28 176 64l59-47-15 63 17 54-62-32c-43 34-102 51-177 53-125 4-217-20-256-73Z"
            fill="none"
            stroke="#433a35"
            strokeOpacity=".58"
            strokeWidth="3"
          />
          <circle cx="94" cy="190" fill="#39312e" r="5" />

          <g className="sushi-tuna-section-labels">
            <text x="108" y="110">KAMI</text>
            <text x="241" y="110">NAKA</text>
            <text x="397" y="110">SHIMO</text>
            <text className="is-subtle" x="95" y="327">near the head</text>
            <text className="is-subtle" x="232" y="327">centre</text>
            <text className="is-subtle" x="390" y="327">near the tail</text>
          </g>

          <g className="sushi-tuna-body-labels">
            <text x="215" y="181">se-naka · back</text>
            <text x="210" y="258">hara-naka · belly</text>
            <path d="M137 244 91 365" />
            <text x="38" y="386">kamatoro</text>
            <text className="is-subtle" x="38" y="404">fat beside the collar</text>
          </g>

          <path className="sushi-tuna-slice-arrow" d="M280 120C342 63 470 54 570 92" />
          <path className="sushi-tuna-slice-arrowhead" d="m559 82 15 11-18 5" />
        </g>

        <g className="sushi-tuna-cross-section">
          <text className="sushi-tuna-kicker" x="594" y="36">THROUGH THE CENTRE</text>
          <text className="sushi-tuna-panel-title" x="594" y="65">Naka cross-section</text>
          <text className="sushi-tuna-axis-label" x="730" y="27">dorsal / back</text>

          <path d="m760 42-12 25h24Z" fill="#514640" />
          <ellipse cx="760" cy="222" fill="#ead9d2" rx="132" ry="171" />
          <g clipPath="url(#sushi-tuna-section-clip)">
            <rect fill="#d7838d" height="350" width="270" x="625" y="50" />
            <path
              d="M682 100c39-38 119-38 158 2 30 31 43 72 36 113H646c-7-43 7-84 36-115Z"
              fill="#933248"
            />
            <path
              d="M757 231c43-3 84 12 108 43 13 17 18 40 13 67-26 30-58 47-101 50l-39-30c13-31 19-75 19-130Z"
              fill="#a9475b"
            />
            <path
              d="M815 252c36 19 57 50 58 93-23 28-51 43-86 46 21-35 34-81 28-139Z"
              fill="#efb1aa"
            />
            <ellipse cx="697" cy="306" fill="#f8f5ef" rx="48" ry="73" />
            <path d="M626 209c47-9 93-7 137 4 42-10 85-11 129-2v24c-43-9-86-8-129 3-44-12-90-13-137-3Z" fill="#6f1f3a" />
            <path d="M757 77c-5 42-6 83-2 126 8 7 12 15 12 26 0 12-5 21-14 29-7-10-10-21-8-32 1-9 4-16 9-22-5-45-4-87 3-127Z" fill="#40383a" />
            <path d="M667 130c31-30 70-43 117-39M650 170c49-31 105-37 168-18M805 243c31 15 53 40 65 74" fill="none" stroke="#f6d8d6" strokeDasharray="4 5" strokeOpacity=".8" strokeWidth="2" />
          </g>
          <ellipse cx="760" cy="222" fill="none" rx="126" ry="165" stroke="#433a35" strokeOpacity=".62" strokeWidth="3" />

          <g className="sushi-tuna-callouts">
            <path d="M676 145 586 124" />
            <text x="525" y="121">akami</text>
            <text className="is-subtle" x="525" y="139">central loin</text>

            <path d="M842 147 900 127" />
            <text textAnchor="end" x="966" y="119">chūtoro</text>
            <text className="is-subtle" textAnchor="end" x="966" y="137">outer back</text>

            <path d="M862 220 900 220" />
            <text textAnchor="end" x="966" y="216">chiai</text>
            <text className="is-subtle" textAnchor="end" x="966" y="234">bloodline</text>

            <path d="M836 278 900 275" />
            <text textAnchor="end" x="966" y="271">chūtoro</text>
            <text className="is-subtle" textAnchor="end" x="966" y="289">belly transition</text>

            <path d="M835 340 900 349" />
            <text textAnchor="end" x="966" y="347">ōtoro</text>
            <text className="is-subtle" textAnchor="end" x="966" y="365">rich lower belly</text>

            <path d="M671 318 592 356" />
            <text x="505" y="357">abdominal</text>
            <text x="505" y="376">cavity</text>
          </g>
          <text className="sushi-tuna-axis-label" x="742" y="419">belly</text>
        </g>
        </svg>
      </div>
      <figcaption>
        Original redraw using the <a href="https://sushiuniversity.jp/sushiblog/what-is-the-border-between-chutoro-and-otoro/" rel="noreferrer" target="_blank">SushiUniversity naka cross-section ↗</a> as the anatomical reference. The dashed contours are deliberately soft: wholesalers and chefs judge these borders in practice, and sections nearer the tail can be almost entirely akami.
      </figcaption>
    </figure>
  );
}

export default function SushiGuidePage() {
  return (
    <div className="guide-page sushi-guide-page">
      <PageIntro
        eyebrow="Guide · Sushi"
        title="The sushi counter, decoded"
        description="A piece of sushi is so neat that it hides the animal it came from. This is my attempt to put the fish back together: the Japanese name, how to say it, the English name, the whole creature, its season, and what the chef does to make it taste like that."
      />
      <SectionRail ariaLabel="Sushi guide sections" sections={sections} />

      <section className="page-section sushi-guide-shell">
        <HistoryBackButton className="mb-6" fallbackHref="/recipes">← Back to recipes</HistoryBackButton>

        <section aria-labelledby="sushi-start-title" className="sushi-start" id="sushi-start">
          <div className="sushi-showcase" aria-label="Sushi counter photographs">
            <figure>
              <RecipeImageViewer alt="Sushi chefs at the counter" className="w-full" src="/recipes/sushi/IMG_2842.jpeg">
                <Image
                  alt="Sushi chefs at the counter"
                  fill
                  priority
                  sizes="(max-width: 800px) 92vw, 48vw"
                  src="/recipes/sushi/IMG_2842.jpeg"
                />
              </RecipeImageViewer>
              <figcaption>The counter is where species, season and technique collapse into one bite.</figcaption>
            </figure>
            <figure>
              <RecipeImageViewer alt="Nigiri served at the counter" className="w-full" src="/recipes/sushi/IMG_1653.jpeg">
                <Image
                  alt="Nigiri served at the counter"
                  fill
                  sizes="(max-width: 800px) 92vw, 48vw"
                  src="/recipes/sushi/IMG_1653.jpeg"
                />
              </RecipeImageViewer>
              <figcaption>The topping is neta; the seasoned rice underneath is shari.</figcaption>
            </figure>
          </div>

          <div className="sushi-start-copy">
            <div>
              <p className="eyebrow">Start with the language</p>
              <h2 id="sushi-start-title">The menu name is not always the animal</h2>
            </div>
            <p>
              Akami, chūtoro and ōtoro can all come from one tuna. Engawa is the fin-driving edge of a flatfish.
              Kohada and shinko are different sizes of the same gizzard shad. Then a broad word like saba can cover
              more than one mackerel. So this guide keeps four labels apart: the counter name, its reading, the
              English market name and the actual species.
            </p>
          </div>

          <dl className="sushi-language-strip">
            <div><dt>ネタ · neta</dt><dd>The topping or prepared ingredient.</dd></div>
            <div><dt>しゃり · shari</dt><dd>The seasoned rice under it.</dd></div>
            <div><dt>旬 · shun</dt><dd>The moment an ingredient is considered at its seasonal best.</dd></div>
            <div><dt>仕事 · shigoto</dt><dd>The chef’s work: salting, curing, simmering, ageing, scoring or brushing.</dd></div>
          </dl>
        </section>

        <SushiIngredientAtlas />

        <SushiUniGuide />

        <section aria-labelledby="sushi-science-title" className="sushi-science-section" id="sushi-science">
          <header className="sushi-section-heading">
            <div>
              <p className="eyebrow">Muscle, fat, time and acid</p>
              <h2 id="sushi-science-title">Why one fish eats nothing like another</h2>
            </div>
            <p>
              The counter categories are useful, but they are a chef’s map rather than formal zoology. The real
              differences begin with what the animal does all day, where it stores energy and what happens after it
              is caught.
            </p>
          </header>

          <div className="sushi-science-grid">
            <article>
              <span className="sushi-science-number">01</span>
              <p className="eyebrow">Pigment</p>
              <h3>Red muscle is working muscle</h3>
              <p>
                Tuna and katsuo swim almost continuously. Their aerobic muscle carries much more myoglobin, an
                oxygen-binding pigment, so the flesh looks red. A flatfish waits on the bottom and bursts forward;
                much of its muscle is pale and built for shorter efforts.
              </p>
            </article>
            <article>
              <span className="sushi-science-number">02</span>
              <p className="eyebrow">Energy</p>
              <h3>Fat is a moving target</h3>
              <p>
                Season is partly an energy story. Migration, feeding and spawning move lipid in and out of the
                muscle and organs. Winter buri, returning autumn katsuo and pre-spawn liver-rich kawahagi are not
                just calendar poetry; the animal’s energy budget has changed.
              </p>
            </article>
            <article>
              <span className="sushi-science-number">03</span>
              <p className="eyebrow">Time</p>
              <h3>Freshest is not always ready</h3>
              <p>
                Immediately after death, ATP is consumed, rigor develops and the muscle tightens. Resting can relax
                texture while ATP breakdown produces IMP, one part of savoury taste. The useful window depends on
                species, size, slaughter method, temperature and the chef’s intention.
              </p>
            </article>
            <article>
              <span className="sushi-science-number">04</span>
              <p className="eyebrow">Cure</p>
              <h3>Salt and vinegar rewrite the surface</h3>
              <p>
                Salt draws water and changes protein interactions. Vinegar lowers pH, firms or whitens the surface
                and supplies aroma. A thin shinko needs minutes where a larger, fattier fillet may need much longer.
                This is flavour and texture work, not a shortcut around safe sourcing.
              </p>
            </article>
          </div>

          <div className="sushi-tuna-section">
            <div>
              <p className="eyebrow">One fish, read in two directions</p>
              <h3>The naka slice explains the tuna map</h3>
              <p>
                Along the body, a tuna is divided into kami near the head, naka through the centre and shimo near the
                tail. Through the naka, akami sits in the central loin, chūtoro wraps the fattier outer back and
                belly, and ōtoro gathers in the lower belly. It is not one flat stripe running from head to tail.
              </p>
            </div>
            <TunaCutMap />
          </div>
        </section>

        <section aria-labelledby="sushi-foundations-title" className="sushi-foundations" id="sushi-foundations">
          <header className="sushi-section-heading">
            <div>
              <p className="eyebrow">The supporting cast is not background</p>
              <h2 id="sushi-foundations-title">Rice, acid, nori and seasoning</h2>
            </div>
            <p>
              Great fish on dead-cold, overpacked rice is still disappointing sushi. These are the ingredients that
              control temperature, contrast, aroma and the way a piece comes apart.
            </p>
          </header>

          <div className="sushi-foundation-grid">
            {sushiFoundationIngredients.map((ingredient) => (
              <article key={ingredient.id}>
                <FoundationImage english={ingredient.english} imageKey={ingredient.imageKey} />
                <div>
                  <p className="eyebrow">{ingredient.role}</p>
                  <h3>{ingredient.japanese}</h3>
                  <p className="sushi-foundation-reading">{ingredient.english} · {ingredient.pronunciation}</p>
                  <p>{ingredient.detail}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="sushi-notes-grid">
            <section className="sushi-note-card">
              <p className="eyebrow">My working ratio</p>
              <h3>Sushi rice mixture</h3>
              <p>A simple seasoning ratio I have been using as a starting point, not a universal house recipe.</p>
              <ul>
                <li><span>50 g</span> salt</li>
                <li><span>90 g</span> sugar</li>
                <li><span>260 g</span> vinegar</li>
              </ul>
            </section>
            <section className="sushi-note-card">
              <p className="eyebrow">Akami seasoning</p>
              <h3>Zuke</h3>
              <p>Equal parts soy, nikiri mirin and nikiri sake for an akami zuke base.</p>
              <ul>
                <li><span>1 part</span> koikuchi soy sauce</li>
                <li><span>1 part</span> nikiri mirin</li>
                <li><span>1 part</span> nikiri sake</li>
              </ul>
            </section>
          </div>
        </section>

        <section aria-labelledby="sushi-safety-title" className="sushi-safety" id="sushi-safety">
          <div>
            <p className="eyebrow">Important before making any of this</p>
            <h2 id="sushi-safety-title">A cure is not a safety plan</h2>
          </div>
          <div className="sushi-safety-copy">
            <p>
              Salt, vinegar, citrus, soy and a quick sear can change flavour and texture without reliably destroying
              parasites or every pathogen. Fish intended for raw service needs an appropriate, documented supply
              chain and parasite-control treatment where required. FDA guidance gives specific time-and-temperature
              freezing schedules and also lists limited exceptions; local law may differ.
            </p>
            <p>
              Tuna, mackerel, bonito, sardine and some related fish also need rapid chilling. If bacteria have
              already converted histidine into histamine, later freezing, cooking, smoking or curing cannot remove
              it. When in doubt, this is the point to buy from a specialist rather than improvise.
            </p>
            <div>
              <a href="https://www.fda.gov/media/184685/download" rel="noreferrer" target="_blank">FDA Food Code · parasite destruction ↗</a>
              <a
                href="https://www.fda.gov/food/hfp-constituent-updates/fda-issues-final-compliance-policy-guide-scombrotoxin-histamine-forming-fish-and-fishery-products"
                rel="noreferrer"
                target="_blank"
              >
                FDA histamine guidance ↗
              </a>
            </div>
          </div>
        </section>

        <section aria-labelledby="sushi-sources-title" className="sushi-sources" id="sushi-sources">
          <header className="sushi-section-heading">
            <div>
              <p className="eyebrow">Source trail</p>
              <h2 id="sushi-sources-title">Where this guide gets its fish</h2>
            </div>
            <p>
              I used the supplied sites for the counter vocabulary, then kept the species and image layers separate.
              That matters because sushi names are often cuts, ages or market names rather than biological species.
            </p>
          </header>
          <div className="sushi-source-list">
            {sushiReferenceSources.map((source, index) => (
              <a href={source.href} key={source.href} rel="noreferrer" target="_blank">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><strong>{source.label}</strong><p>{source.description}</p></div>
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
          <p className="sushi-source-note">
            The whole-animal and prepared-food photographs are reusable works from Wikimedia Commons and carry their
            creator, file page and licence inside each atlas entry. The photographs from 市場魚貝類図鑑 are deliberately
            not copied because that site prohibits unauthorised image reuse. Where an exact reusable counter photo
            could not be found, the atlas labels the real reference photograph and names the mismatch plainly.
          </p>
        </section>
      </section>
    </div>
  );
}
