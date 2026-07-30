"use client";

import Image from "next/image";
import { useDeferredValue, useMemo, useState } from "react";
import preparedImageManifest from "@/data/sushi-prepared-images.json";
import speciesImageManifest from "@/data/sushi-species-images.json";
import {
  sushiCategories,
  sushiIngredients,
  sushiPreparedImageCropByIngredient,
  sushiPreparedImagesByIngredient,
  sushiWholeImageCropByIngredient,
  sushiWholeImagesByIngredient,
  type SushiCategoryId,
  type SushiIngredient,
  type SushiPreparedImageReference,
} from "@/data/sushi-guide-data";

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
const searchableIngredients = sushiIngredients.map((ingredient) => ({
  ingredient,
  searchText: [
    ingredient.english,
    ingredient.japanese,
    ingredient.kana,
    ingredient.romaji,
    ingredient.animal,
    ingredient.scientific,
    ...ingredient.aliases,
  ]
    .join(" ")
    .toLocaleLowerCase(),
}));

const gizzardShadStages = [
  { size: "4–5 cm", name: "shinko", note: "the first, very brief summer stage" },
  { size: "7–10 cm", name: "kohada", note: "the classic Edomae size" },
  { size: "about 13 cm", name: "nakazumi", note: "the intermediate market stage" },
  { size: "15 cm+", name: "konoshiro", note: "the mature fish" },
] as const;

const amberjackRegionalNames = [
  { size: "under 30 cm", kanto: "wakashi", kansai: "tsubasu" },
  { size: "30–60 cm", kanto: "inada", kansai: "hamachi" },
  { size: "60–80 cm", kanto: "warasa", kansai: "mejiro" },
  { size: "80 cm+", kanto: "buri", kansai: "buri" },
] as const;

function WholeIngredientImage({
  ingredient,
  priority = false,
}: {
  ingredient: SushiIngredient;
  priority?: boolean;
}) {
  const override = sushiWholeImagesByIngredient[ingredient.id];
  const image = override
    ? preparedImages[override.imageKey] ?? null
    : ingredient.imageKey
      ? speciesImages[ingredient.imageKey] ?? null
      : null;
  const crop = sushiWholeImageCropByIngredient[ingredient.id];

  if (!image) {
    return (
      <div className="sushi-whole-image sushi-whole-image-placeholder">
        <span>Whole ingredient</span>
        <strong>{ingredient.animal}</strong>
      </div>
    );
  }

  return (
    <div className={override ? "sushi-whole-image is-food" : "sushi-whole-image"}>
      <Image
        alt={override
          ? `${image.objectName || image.articleTitle}, the ingredient behind ${ingredient.english}`
          : `${image.objectName || image.articleTitle}, the whole animal behind ${ingredient.english}`}
        fill
        priority={priority}
        sizes="(max-width: 720px) 88vw, (max-width: 1180px) 42vw, 34rem"
        src={image.src}
        style={crop
          ? {
              objectPosition: crop.objectPosition,
              transform: `scale(${crop.scale ?? 1})`,
              transformOrigin: crop.objectPosition,
            }
          : undefined}
      />
    </div>
  );
}

function PreparedIngredientImage({
  compact = false,
  ingredient,
  priority = false,
}: {
  compact?: boolean;
  ingredient: SushiIngredient;
  priority?: boolean;
}) {
  const reference = sushiPreparedImagesByIngredient[ingredient.id];
  const image = reference ? preparedImages[reference.imageKey] : null;

  if (!image) {
    return (
      <div className={compact ? "sushi-prepared-image is-compact is-placeholder" : "sushi-prepared-image is-placeholder"}>
        <span>Prepared photograph unavailable</span>
      </div>
    );
  }

  const crop = sushiPreparedImageCropByIngredient[ingredient.id];
  const alt = reference.relationship === "exact"
    ? `${ingredient.english} prepared for sashimi or sushi`
    : `A real prepared seafood reference shown beside ${ingredient.english}; ${reference.note}`;

  return (
    <div className={compact ? "sushi-prepared-image is-compact" : "sushi-prepared-image"}>
      <Image
        alt={compact ? "" : alt}
        fill
        priority={priority}
        sizes={compact
          ? "(max-width: 640px) 5rem, 6rem"
          : "(max-width: 720px) 88vw, (max-width: 1180px) 42vw, 34rem"}
        src={image.src}
        style={crop
          ? {
              objectPosition: crop.objectPosition,
              transform: `scale(${crop.scale ?? 1})`,
              transformOrigin: crop.objectPosition,
            }
          : undefined}
      />
    </div>
  );
}

function ImageCredit({
  image,
  label,
}: {
  image: AttributedImage | null;
  label: string;
}) {
  if (!image) return null;

  return (
    <p className="sushi-image-credit">
      {label}:{" "}
      <a href={image.descriptionUrl} rel="noreferrer" target="_blank">{image.artist}</a>
      {" · "}
      <a href={image.licenseUrl} rel="noreferrer" target="_blank">{image.license}</a>
    </p>
  );
}

function preparedCaption(reference: SushiPreparedImageReference | undefined) {
  if (!reference) return "Prepared view · photograph unavailable";
  if (reference.relationship === "exact") return "Prepared view · real photograph of this topping";
  if (reference.relationship === "same-species") return `Prepared view · same species. ${reference.note}`;
  return `Preparation reference · ${reference.note}`;
}

function FishNameContext({ ingredient }: { ingredient: SushiIngredient }) {
  if (ingredient.id === "kohada" || ingredient.id === "shinko") {
    return (
      <aside className="sushi-fish-name-context">
        <header>
          <div>
            <p className="eyebrow">One species, increasing size</p>
            <h4>Konosirus punctatus changes its counter name</h4>
          </div>
          <p>
            This is one gizzard shad, not four species. The sizes are approximate Kantō market conventions, and the
            cure changes sharply as the fillet gets thicker.
          </p>
        </header>
        <ol className="sushi-growth-name-ladder">
          {gizzardShadStages.map((stage) => (
            <li data-current={ingredient.id === stage.name ? "true" : undefined} key={stage.name}>
              <span>{stage.size}</span>
              <strong>{stage.name}</strong>
              <small>{stage.note}</small>
            </li>
          ))}
        </ol>
        <a
          className="sushi-context-source"
          href="https://sushiuniversity.jp/visual-dictionary/?Name=Gizzard-shad-%28Kohada%29"
          rel="noreferrer"
          target="_blank"
        >
          SushiUniversity · kohada size names ↗
        </a>
      </aside>
    );
  }

  if (ingredient.id === "buri") {
    return (
      <aside className="sushi-fish-name-context">
        <header>
          <div>
            <p className="eyebrow">Names change by region</p>
            <h4>The same Japanese amberjack has two familiar ladders</h4>
          </div>
          <p>
            These are approximate market ranges rather than biological boundaries. Hamachi is also used more
            broadly for farmed amberjack, even outside the western ladder.
          </p>
        </header>
        <div className="sushi-regional-name-table" role="table" aria-label="Japanese amberjack names by size and region">
          <div className="is-heading" role="row">
            <span role="columnheader">Approx. size</span>
            <strong role="columnheader">Kantō</strong>
            <strong role="columnheader">Kansai & west</strong>
          </div>
          {amberjackRegionalNames.map((stage) => (
            <div data-current={stage.kanto === "buri" ? "true" : undefined} key={stage.size} role="row">
              <span role="cell">{stage.size}</span>
              <strong role="cell">{stage.kanto}</strong>
              <strong role="cell">{stage.kansai}</strong>
            </div>
          ))}
        </div>
        <a
          className="sushi-context-source"
          href="https://sushiuniversity.jp/visual-dictionary/?Name=Japanese-amberjack-%28Buri%29"
          rel="noreferrer"
          target="_blank"
        >
          SushiUniversity · buri regional names ↗
        </a>
      </aside>
    );
  }

  return null;
}

function IngredientDetail({ ingredient }: { ingredient: SushiIngredient }) {
  const category = sushiCategories.find((item) => item.id === ingredient.category);
  const preparedReference = sushiPreparedImagesByIngredient[ingredient.id];
  const wholeReference = sushiWholeImagesByIngredient[ingredient.id];
  const wholeImage = wholeReference
    ? preparedImages[wholeReference.imageKey] ?? null
    : ingredient.imageKey
      ? speciesImages[ingredient.imageKey] ?? null
      : null;
  const preparedImage = preparedReference
    ? preparedImages[preparedReference.imageKey] ?? null
    : null;

  return (
    <article aria-live="polite" className="sushi-atlas-detail" id={`sushi-detail-${ingredient.id}`}>
      <div className="sushi-atlas-detail-visuals">
        <figure>
          <WholeIngredientImage ingredient={ingredient} priority={ingredient.id === "akami"} />
          <figcaption>{wholeReference?.caption ?? `Whole ingredient · ${ingredient.animal}`}</figcaption>
        </figure>
        <figure className="sushi-counter-figure">
          <PreparedIngredientImage ingredient={ingredient} priority={ingredient.id === "akami"} />
          <figcaption>{preparedCaption(preparedReference)}</figcaption>
        </figure>
      </div>

      <div className="sushi-atlas-detail-copy">
        <div className="sushi-atlas-detail-heading">
          <div>
            <p className="eyebrow">{category?.label}</p>
            <h3>{ingredient.japanese}</h3>
            <p className="sushi-reading">
              <span>{ingredient.kana}</span>
              <strong>{ingredient.romaji}</strong>
              <small>say it: {ingredient.pronunciation}</small>
            </p>
          </div>
          <div className="sushi-atlas-english">
            <span>English</span>
            <strong>{ingredient.english}</strong>
          </div>
        </div>

        <p className="sushi-counter-note">{ingredient.counterNote}</p>

        <dl className="sushi-fact-grid">
          <div><dt>Actual animal</dt><dd>{ingredient.animal}</dd></div>
          <div><dt>Scientific name</dt><dd><i>{ingredient.scientific}</i></dd></div>
          <div><dt>Family</dt><dd>{ingredient.family}</dd></div>
          <div><dt>Season</dt><dd>{ingredient.season}</dd></div>
          <div><dt>Habitat</dt><dd>{ingredient.habitat}</dd></div>
          <div><dt>Taste & texture</dt><dd>{ingredient.taste}</dd></div>
          <div className="sushi-fact-wide"><dt>At the counter</dt><dd>{ingredient.preparation}</dd></div>
        </dl>

        <div className="sushi-nerd-notes">
          <p className="eyebrow">The nerdy bit</p>
          <ul>
            {ingredient.science.map((note) => <li key={note}>{note}</li>)}
          </ul>
        </div>

        <FishNameContext ingredient={ingredient} />

        <div className="sushi-detail-footer">
          <p><span>Also called</span>{ingredient.aliases.join(" · ")}</p>
          <nav aria-label={`Sources for ${ingredient.english}`}>
            {ingredient.sources.map((source) => (
              <a href={source.href} key={`${ingredient.id}-${source.href}`} rel="noreferrer" target="_blank">
                {source.label} ↗
              </a>
            ))}
          </nav>
          <div className="sushi-image-credits">
            <ImageCredit image={wholeImage} label={wholeReference?.creditLabel ?? "Animal photograph"} />
            <ImageCredit image={preparedImage} label="Prepared photograph" />
          </div>
        </div>
      </div>
    </article>
  );
}

function IngredientCard({
  ingredient,
  isSelected,
  onSelect,
}: {
  ingredient: SushiIngredient;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const category = sushiCategories.find((item) => item.id === ingredient.category);
  const wholeReference = sushiWholeImagesByIngredient[ingredient.id];

  return (
    <article className={isSelected ? "sushi-ingredient-card is-selected" : "sushi-ingredient-card"}>
      <button
        aria-controls="sushi-atlas-detail"
        aria-pressed={isSelected}
        onClick={() => onSelect(ingredient.id)}
        type="button"
      >
        <WholeIngredientImage ingredient={ingredient} priority={isSelected} />
        <span className="sushi-card-counter-view" aria-hidden="true">
          <PreparedIngredientImage compact ingredient={ingredient} />
        </span>
        <span className="sushi-card-copy">
          <span className="sushi-card-category">{category?.japanese}</span>
          <strong>{ingredient.japanese}</strong>
          <span className="sushi-card-reading">{ingredient.kana} · {ingredient.romaji}</span>
          <span className="sushi-card-english">{ingredient.english}</span>
          <small>{wholeReference?.shortLabel ?? `Whole: ${ingredient.animal}`}</small>
        </span>
        <span className="sushi-card-open">Open notes <span aria-hidden="true">↗</span></span>
      </button>
    </article>
  );
}

export function SushiIngredientAtlas() {
  const [activeCategory, setActiveCategory] = useState<"all" | SushiCategoryId>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("akami");
  const [hasSelectedDetail, setHasSelectedDetail] = useState(false);
  const deferredQuery = useDeferredValue(query);

  const visibleIngredients = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLocaleLowerCase();
    return searchableIngredients
      .filter(({ ingredient }) => activeCategory === "all" || ingredient.category === activeCategory)
      .filter(({ searchText }) => !normalizedQuery || searchText.includes(normalizedQuery))
      .map(({ ingredient }) => ingredient);
  }, [activeCategory, deferredQuery]);

  const selectedIngredient =
    sushiIngredients.find((ingredient) => ingredient.id === selectedId) ??
    visibleIngredients[0] ??
    sushiIngredients[0];

  function chooseCategory(category: "all" | SushiCategoryId) {
    setActiveCategory(category);
    const firstInCategory = sushiIngredients.find((ingredient) => category === "all" || ingredient.category === category);
    if (firstInCategory) setSelectedId(firstInCategory.id);
  }

  function selectIngredient(id: string) {
    setSelectedId(id);
    setHasSelectedDetail(true);
    window.requestAnimationFrame(() => {
      document.getElementById("sushi-atlas-detail")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <section aria-labelledby="sushi-atlas-title" className="sushi-atlas" id="sushi-atlas">
      <header className="sushi-section-heading">
        <div>
          <p className="eyebrow">{sushiIngredients.length} counter names · 7 families of toppings</p>
          <h2 id="sushi-atlas-title">The neta atlas</h2>
        </div>
        <p>
          Search the menu word, Japanese spelling, English fish or even a scientific name. Every card now puts a
          real photograph of the prepared topping beside the whole animal. When a reusable exact photo does not
          exist, the caption says precisely what the reference photo is instead of quietly swapping species.
        </p>
      </header>

      <div className="sushi-atlas-controls">
        <label className="sushi-atlas-search">
          <span>Find an ingredient</span>
          <span className="sushi-atlas-search-box">
            <span aria-hidden="true">⌕</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try ma-aji, 真鯛, geoduck or Pagrus…"
              type="search"
              value={query}
            />
          </span>
        </label>

        <div aria-label="Filter sushi ingredients" className="sushi-atlas-filters" role="group">
          {sushiCategories.map((category) => (
            <button
              aria-pressed={activeCategory === category.id}
              key={category.id}
              onClick={() => chooseCategory(category.id)}
              type="button"
            >
              <span>{category.japanese}</span>
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div data-expanded={hasSelectedDetail ? "true" : "false"} id="sushi-atlas-detail">
        <IngredientDetail ingredient={selectedIngredient} />
      </div>

      <div className="sushi-atlas-result-line">
        <p>
          <strong>{visibleIngredients.length}</strong> {visibleIngredients.length === 1 ? "ingredient" : "ingredients"}
        </p>
        <span>Open a card for its paired photographs, biology, season, preparation and source trail.</span>
      </div>

      {visibleIngredients.length ? (
        <div className="sushi-ingredient-grid">
          {visibleIngredients.map((ingredient) => (
            <IngredientCard
              ingredient={ingredient}
              isSelected={ingredient.id === selectedIngredient.id}
              key={ingredient.id}
              onSelect={selectIngredient}
            />
          ))}
        </div>
      ) : (
        <div className="sushi-atlas-empty">
          <strong>No fish under that name yet.</strong>
          <p>Try a broader English word, Japanese reading or scientific family.</p>
          <button onClick={() => setQuery("")} type="button">Clear search</button>
        </div>
      )}
    </section>
  );
}
