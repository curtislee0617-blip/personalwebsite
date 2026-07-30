import Image from "next/image";
import preparedImageManifest from "@/data/sushi-prepared-images.json";
import speciesImageManifest from "@/data/sushi-species-images.json";

type AttributedImage = {
  articleTitle: string;
  artist: string;
  descriptionUrl: string;
  height: number;
  license: string;
  licenseUrl: string;
  objectName: string;
  src: string;
  width: number;
};

const speciesImages = speciesImageManifest as Record<string, AttributedImage>;
const preparedImages = preparedImageManifest as Record<string, AttributedImage>;

const uniTypes = [
  {
    english: "Ezo-bafun uni",
    imageKey: "green-sea-urchin",
    preparedKey: "uni-ezo-bafun",
    preparedNote: "This counter photograph is identified as ezo-bafun uni.",
    japanese: "蝦夷馬糞海胆",
    reading: "えぞばふんうに · ezo-bafun uni",
    scientific: "Mesocentrotus intermedius",
    shell: "about 4–5 cm at harvest",
    size: "small",
    place: "Cold Hokkaido and northern water",
    lobe: "Compact lobes, usually deep yellow to orange",
    note: "This is one of the names most associated with Hokkaido boxes. The animal is short-spined and low-domed; what it eats, especially kelp, matters enormously.",
  },
  {
    english: "Kita-murasaki uni",
    imageKey: "kita-murasaki-sea-urchin",
    preparedKey: "uni-murasaki",
    preparedNote: "A real pale uni-lobe reference; the photograph is not species-verified as kita-murasaki.",
    japanese: "北紫海胆",
    reading: "きたむらさきうに · kita-murasaki uni",
    scientific: "Mesocentrotus nudus",
    shell: "about 5 cm at harvest; capable of growing larger",
    size: "large",
    place: "Hokkaido and northern Honshu",
    lobe: "Often larger and paler than ezo-bafun",
    note: "At the counter this is the lighter side of the familiar Hokkaido pair. Pale colour is not weak flavour; good feed and timing can make it deeply sweet and aromatic.",
  },
  {
    english: "Bafun uni",
    imageKey: "bafun-sea-urchin",
    preparedKey: "uni-bafun",
    preparedNote: "The photograph is identified as ezo-bafun, a useful reference for the looser bafun trade label.",
    japanese: "馬糞海胆",
    reading: "ばふんうに · bafun uni",
    scientific: "Hemicentrotus pulcherrimus",
    shell: "roughly 3–5 cm",
    size: "small",
    place: "Temperate Japanese coasts",
    lobe: "Small, dense and often orange",
    note: "The undignified name describes the low brown shell, not the taste. In trade, bafun is also used loosely enough that a premium Hokkaido ezo-bafun may simply be called bafun.",
  },
  {
    english: "Murasaki uni",
    imageKey: "murasaki-sea-urchin",
    preparedKey: "uni-murasaki",
    preparedNote: "This prepared photograph is identified as murasaki uni.",
    japanese: "紫海胆",
    reading: "むらさきうに · murasaki uni",
    scientific: "Heliocidaris crassispina",
    shell: "roughly 5–7 cm",
    size: "medium",
    place: "Warmer water from Honshu to Kyushu",
    lobe: "Usually a broader, yellow-to-pale-orange lobe",
    note: "Murasaki and kita-murasaki are related counter ideas, not the same species. The northern animal is generally larger and lives in colder water.",
  },
  {
    english: "Aka uni",
    imageKey: "aka-sea-urchin",
    preparedKey: "uni-aka",
    preparedNote: "A real deep-orange uni-lobe reference; the photograph is not species-verified as aka uni.",
    japanese: "赤海胆",
    reading: "あかうに · aka uni",
    scientific: "Pseudocentrotus depressus",
    shell: "a scarce, medium-sized warm-water species",
    size: "medium",
    place: "Western Honshu, Shikoku and Kyushu",
    lobe: "Deep-coloured, concentrated and low-volume",
    note: "Aka uni is a real species name, but aka—red—can also be used by traders for lobe colour. The same word may be biological in one sentence and commercial shorthand in the next.",
  },
] as const;

function UniPhoto({
  image,
  name,
  sizes,
}: {
  image: AttributedImage;
  name: string;
  sizes: string;
}) {
  return (
    <div className="sushi-uni-photo">
      <Image
        alt={`${name}: ${image.objectName || image.articleTitle}`}
        fill
        sizes={sizes}
        src={image.src}
      />
    </div>
  );
}

function PhotoCredit({
  image,
  label,
}: {
  image: AttributedImage;
  label: string;
}) {
  return (
    <p className="sushi-image-credit">
      {label}:{" "}
      <a href={image.descriptionUrl} rel="noreferrer" target="_blank">{image.artist}</a>
      {" · "}
      <a href={image.licenseUrl} rel="noreferrer" target="_blank">{image.license}</a>
    </p>
  );
}

export function SushiUniGuide() {
  const wholeImage = speciesImages["green-sea-urchin"];
  const preparedImage = preparedImages["uni-gunkan"];
  const boxedUniImage = preparedImages["instagram-uni-box"];

  return (
    <section aria-labelledby="sushi-uni-title" className="sushi-uni-section" id="sushi-uni">
      <header className="sushi-section-heading">
        <div>
          <p className="eyebrow">Species, lobe size and the box it arrived in</p>
          <h2 id="sushi-uni-title">Uni needs its own map</h2>
        </div>
        <p>
          Uni is not one animal, and it is not roe. The edible part is the gonad of a male or female sea urchin.
          There are five lobes inside the shell, but their colour, size, firmness and flavour move with species,
          coast, feed, season, reproductive stage and the way the processor packs them.
        </p>
      </header>

      <div className="sushi-uni-pair">
        <figure>
          <UniPhoto image={wholeImage} name="Ezo-bafun sea urchin" sizes="(max-width: 760px) 92vw, 44vw" />
          <figcaption>The animal · an ezo-bafun sea urchin</figcaption>
          <PhotoCredit image={wholeImage} label="Animal photograph" />
        </figure>
        <figure>
          <UniPhoto image={preparedImage} name="Uni gunkan" sizes="(max-width: 760px) 92vw, 44vw" />
          <figcaption>The counter view · real uni gunkan</figcaption>
          <PhotoCredit image={preparedImage} label="Prepared photograph" />
        </figure>
      </div>

      <aside className="sushi-uni-baseline">
        <p className="eyebrow">The first useful distinction</p>
        <strong>Urchin size, lobe size and grade are three different things.</strong>
        <p>
          A larger species can produce a larger lobe, but the edible tissue also swells and shrinks with feeding and
          reproductive condition. Then a processor sorts by colour, firmness, shape and breakage. A beautiful large
          lobe is therefore not a species label, and words such as “premium” or “A-grade” are not one universal
          Japanese standard.
        </p>
      </aside>

      <div className="sushi-uni-type-grid">
        {uniTypes.map((type) => {
          const speciesImage = speciesImages[type.imageKey];
          const lobeImage = preparedImages[type.preparedKey];
          return (
            <article className="sushi-uni-type-card" key={type.english}>
              <div className="sushi-uni-card-photos">
                <figure>
                  <UniPhoto
                    image={speciesImage}
                    name={type.english}
                    sizes="(max-width: 680px) 44vw, (max-width: 1080px) 21vw, 16rem"
                  />
                  <figcaption>
                    <strong>The urchin</strong>
                    <span>{type.english}</span>
                  </figcaption>
                </figure>
                <figure className="sushi-uni-lobes">
                  <UniPhoto
                    image={lobeImage}
                    name={`${type.english} edible uni lobes`}
                    sizes="(max-width: 680px) 44vw, (max-width: 1080px) 21vw, 16rem"
                  />
                  <figcaption>
                    <strong>The edible lobes</strong>
                    <span>{type.preparedNote}</span>
                  </figcaption>
                </figure>
              </div>
              <div className="sushi-uni-type-copy">
                <p className="eyebrow">{type.place}</p>
                <h3>{type.japanese}</h3>
                <p className="sushi-uni-reading">{type.reading}</p>
                <strong>{type.english}</strong>
                <i>{type.scientific}</i>
                <div className="sushi-uni-size-line">
                  <span aria-hidden="true" className={`sushi-uni-size-dot is-${type.size}`} />
                  <span>{type.shell}</span>
                </div>
                <p><b>At the counter:</b> {type.lobe}.</p>
                <p>{type.note}</p>
              </div>
              <div className="sushi-uni-card-credits">
                <PhotoCredit image={speciesImage} label="Urchin photograph" />
                <PhotoCredit image={lobeImage} label="Lobe photograph" />
              </div>
            </article>
          );
        })}
      </div>

      <div className="sushi-uni-packing">
        <header>
          <p className="eyebrow">Same ingredient, different journey</p>
          <h3>Why some uni is in a box and some is swimming in liquid</h3>
          <p>
            These are packing methods. They tell you something about handling, but they do not tell you the species
            or guarantee the grade.
          </p>
        </header>

        <div className="sushi-uni-packing-grid">
          <article>
            <span className="sushi-uni-pack-mark" aria-hidden="true">整</span>
            <p className="eyebrow">箱ウニ · hako-uni / 板ウニ · ita-uni</p>
            <h4>Drained and arranged in a tray</h4>
            <figure className="sushi-uni-pack-photo">
              <div>
                <Image
                  alt="A real box of arranged Kyushu uni lobes"
                  fill
                  sizes="(max-width: 760px) 88vw, 28vw"
                  src={boxedUniImage.src}
                  style={{
                    objectPosition: "50% 44%",
                    transform: "scale(1.22)",
                    transformOrigin: "50% 44%",
                  }}
                />
              </div>
              <figcaption>A real hako-uni box · Kyushu uni from Curtis&apos;s counter notes</figcaption>
              <PhotoCredit image={boxedUniImage} label="Box photograph" />
            </figure>
            <p>
              Cleaned lobes are drained, sorted and lined up. The tidy rows make colour, shape and breakage easy to
              judge. Alum—usually potassium aluminium sulfate—may be used to help fragile lobes hold together, but
              additive-free boxed uni also exists. A box does not automatically mean alum, bitterness or high grade.
            </p>
          </article>
          <article>
            <span className="sushi-uni-pack-mark is-water" aria-hidden="true">水</span>
            <p className="eyebrow">塩水ウニ · ensui-uni / shio-mizu uni</p>
            <h4>Loose lobes in chilled saltwater</h4>
            <p>
              The liquid is a near-seawater-strength holding medium, not a sauce. Saltwater packs are commonly made
              without alum, so the texture can feel softer and juicier. They are drained before service, handled
              gently and used quickly because the lobes have less structural help.
            </p>
          </article>
          <article>
            <span className="sushi-uni-pack-mark is-loose" aria-hidden="true">散</span>
            <p className="eyebrow">並べ · narabe / バラ · bara</p>
            <h4>Presentation is another layer of sorting</h4>
            <p>
              Narabe describes neatly aligned intact lobes. Bara is looser or contains smaller and broken pieces.
              That changes appearance and price more directly than flavour. Salt-preserved shio-uni and paste-like
              neri-uni are different products again; neither should be confused with fresh uni held in saltwater.
            </p>
          </article>
        </div>
      </div>

      <div className="sushi-uni-chemistry">
        <div>
          <p className="eyebrow">Why uni can taste sweet, metallic or bitter</p>
          <h3>The species is only the beginning</h3>
        </div>
        <ul>
          <li><b>Feed:</b> kelp and other algae shift the amino-acid and aroma profile. Hokkaido sources explicitly connect good kelp feed with better flavour.</li>
          <li><b>Timing:</b> the gonad is reproductive tissue. Its volume and texture change as the animal approaches spawning.</li>
          <li><b>Handling:</b> damaged lobes leak and soften. Fast cleaning, cold storage and gentle drainage matter.</li>
          <li><b>Alum:</b> it can firm the surface and extend shape life, but excess treatment may add astringent, bitter or metallic notes. Bitterness can also come from age, diet or the individual animal.</li>
        </ul>
      </div>

      <nav aria-label="Sources for the uni guide" className="sushi-uni-sources">
        <a href="https://www.pref.hokkaido.lg.jp/sr/gid/fis083.html" rel="noreferrer" target="_blank">Hokkaido · ezo-bafun uni ↗</a>
        <a href="https://www.pref.hokkaido.lg.jp/sr/gid/fis084.html" rel="noreferrer" target="_blank">Hokkaido · kita-murasaki uni ↗</a>
        <a href="https://sushiuniversity.jp/basicknowledge/what-is-uni/" rel="noreferrer" target="_blank">SushiUniversity · species and hako-uni ↗</a>
        <a href="https://sushiuniversity.jp/sushiblog/why-is-it-that-sea-urchin-can-taste-bitter/" rel="noreferrer" target="_blank">SushiUniversity · alum and ensui-uni ↗</a>
        <a href="https://www.maff.go.jp/e/policies/intel/gi_act/register/s135.html" rel="noreferrer" target="_blank">MAFF · Hamanaka farmed uni ↗</a>
      </nav>
    </section>
  );
}
