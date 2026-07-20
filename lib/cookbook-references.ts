export type CookbookReferenceRecipe = {
  id: string;
  ingredientGroups: Array<{ lines: string[] }>;
  methodGroups: Array<{ steps: string[] }>;
  sourcePages: number[];
  title: string;
};

export type CookbookReferenceBook = {
  id: string;
  recipes: CookbookReferenceRecipe[];
};

export type CookbookReferenceTarget = {
  id: string;
  sourcePages: number[];
  title: string;
};

export type CookbookTextReference = {
  end: number;
  start: number;
  target: CookbookReferenceTarget;
};

export type CookbookReferenceIndex = {
  aliases: Map<string, CookbookReferenceTarget[]>;
  bookId: string;
  pageOffset: number;
  recipesByPage: Map<number, CookbookReferenceTarget[]>;
  titlePattern: RegExp | null;
};

export type CookbookReferenceContext = "ingredient" | "method";

const PRINTED_TO_PDF_PAGE_OFFSETS: Record<string, number> = {
  "thailand-the-cookbook": 2,
};

const REFERENCE_ALIASES: Record<string, Record<string, string[]>> = {
  "thailand-the-cookbook": {
    "crispy-pork-side-with-rice": ["Crispy Pork Side"],
    "deep-fried-tofu-with-dipping-sauce": ["Deep-Fried Tofu"],
    "fermented-soybeans": ["Fermented Soybean", "Fermented Soybean Sheet"],
    "fried-shallots": ["Fried Shallot"],
  },
};

const REFERENCE_STOP_WORDS = new Set([
  "and",
  "for",
  "from",
  "into",
  "of",
  "on",
  "recipe",
  "the",
  "to",
  "with",
]);

const PAGE_REFERENCE = /\b(?:see|refer(?:ring)?\s+to)\s+(?:the\s+)?(?:recipe\s+)?(?:on\s+)?p(?:age)?s?\.?\s*(\d+)/giu;

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function aliasKey(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase().replace(/[’‘]/g, "'").replace(/[–—]/g, "-").trim();
}

function titleAliases(bookId: string, recipe: CookbookReferenceRecipe) {
  const aliases = new Set([recipe.title.trim()]);
  const withoutParenthetical = recipe.title.replace(/\s*\([^)]*\)\s*$/, "").trim();
  if (withoutParenthetical.length >= 8) aliases.add(withoutParenthetical);

  if (recipe.title.length >= 8 && /[^s]s$/i.test(recipe.title)) {
    aliases.add(recipe.title.slice(0, -1));
  }

  for (const alias of REFERENCE_ALIASES[bookId]?.[recipe.id] ?? []) aliases.add(alias);
  return [...aliases].filter((alias) => alias.length >= 7);
}

function normalizedTokens(value: string) {
  return value
    .normalize("NFKD")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .map((token) => token.replace(/(?:es|s)$/i, ""))
    .filter((token) => token.length > 1 && !REFERENCE_STOP_WORDS.has(token));
}

function targetForCandidates(
  candidates: CookbookReferenceTarget[],
  currentRecipeId: string,
  sourceText: string,
  referencedPages: number[],
  pageOffset: number,
) {
  const available = candidates.filter((candidate) => candidate.id !== currentRecipeId);
  if (available.length === 0) return null;
  if (available.length === 1) return available[0];

  const referencedPdfPages = new Set(referencedPages.flatMap((page) => [page + pageOffset, page]));
  const pageMatches = available.filter((candidate) => candidate.sourcePages.some((page) => referencedPdfPages.has(page)));
  if (pageMatches.length === 1) return pageMatches[0];

  const choices = pageMatches.length > 1 ? pageMatches : available;
  const sourceTokens = new Set(normalizedTokens(sourceText));
  const scored = choices
    .map((target) => ({
      overlap: normalizedTokens(target.title).filter((token) => sourceTokens.has(token)).length,
      target,
    }))
    .sort((a, b) => b.overlap - a.overlap);

  if (scored.length === 1 || scored[0].overlap > scored[1].overlap) return scored[0].target;
  return null;
}

function targetForPageCandidates(
  candidates: CookbookReferenceTarget[],
  currentRecipeId: string,
  sourceText: string,
) {
  const sourceTokens = new Set(normalizedTokens(sourceText));
  const scored = candidates
    .filter((candidate) => candidate.id !== currentRecipeId)
    .map((target) => ({
      overlap: normalizedTokens(target.title).filter((token) => sourceTokens.has(token)).length,
      target,
    }))
    .filter((choice) => choice.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap);

  if (scored.length === 0) return null;
  if (scored.length === 1 || scored[0].overlap > scored[1].overlap) return scored[0].target;
  return null;
}

function pageNumbers(text: string) {
  const pages: number[] = [];
  PAGE_REFERENCE.lastIndex = 0;
  let match = PAGE_REFERENCE.exec(text);
  while (match) {
    pages.push(Number(match[1]));
    match = PAGE_REFERENCE.exec(text);
  }
  return pages;
}

export function createCookbookReferenceIndex(book: CookbookReferenceBook): CookbookReferenceIndex {
  const aliases = new Map<string, CookbookReferenceTarget[]>();
  const recipesByPage = new Map<number, CookbookReferenceTarget[]>();

  for (const recipe of book.recipes) {
    const target: CookbookReferenceTarget = {
      id: recipe.id,
      sourcePages: recipe.sourcePages,
      title: recipe.title,
    };

    for (const alias of titleAliases(book.id, recipe)) {
      const key = aliasKey(alias);
      aliases.set(key, [...(aliases.get(key) ?? []), target]);
    }

    for (const page of recipe.sourcePages) {
      recipesByPage.set(page, [...(recipesByPage.get(page) ?? []), target]);
    }
  }

  const titleAlternatives = [...aliases.keys()]
    .sort((a, b) => b.length - a.length)
    .map((alias) => escapeRegex(alias).replace(/-/g, "[-–—]").replace(/'/g, "['’‘]"));
  const titlePattern = titleAlternatives.length > 0
    ? new RegExp(`(^|[^\\p{L}\\p{N}])(${titleAlternatives.join("|")})(?=$|[^\\p{L}\\p{N}])`, "giu")
    : null;

  return {
    aliases,
    bookId: book.id,
    pageOffset: PRINTED_TO_PDF_PAGE_OFFSETS[book.id] ?? 0,
    recipesByPage,
    titlePattern,
  };
}

export function findCookbookTextReferences(
  index: CookbookReferenceIndex,
  text: string,
  currentRecipeId: string,
  context: CookbookReferenceContext = "ingredient",
) {
  const references: CookbookTextReference[] = [];
  const referencedPages = pageNumbers(text);
  const directlyReferencedIds = new Set<string>();
  const allowDirectTitleMatches = context === "ingredient" || text.length <= 500;

  if (index.titlePattern && allowDirectTitleMatches) {
    index.titlePattern.lastIndex = 0;
    let match = index.titlePattern.exec(text);
    while (match) {
      const label = match[2];
      const start = match.index + match[1].length;
      const methodCueBefore = text.slice(Math.max(0, start - 80), start);
      const methodCueAfter = text.slice(start + label.length, start + label.length + 80);
      const hasMethodReferenceCue = /\b(?:make|prepare|prepared|recipe|see|use|using)\b/i.test(methodCueBefore)
        || /^\s*\([^)]*\bsee\b/i.test(methodCueAfter);
      if (context === "method" && !hasMethodReferenceCue) {
        match = index.titlePattern.exec(text);
        continue;
      }
      const target = targetForCandidates(
        index.aliases.get(aliasKey(label)) ?? [],
        currentRecipeId,
        text,
        referencedPages,
        index.pageOffset,
      );
      if (target) {
        references.push({ end: start + label.length, start, target });
        directlyReferencedIds.add(target.id);
      }
      match = index.titlePattern.exec(text);
    }
  }

  PAGE_REFERENCE.lastIndex = 0;
  let pageMatch = PAGE_REFERENCE.exec(text);
  while (pageMatch) {
    const printedPage = Number(pageMatch[1]);
    const preferredPage = printedPage + index.pageOffset;
    const pageCandidates = index.recipesByPage.get(preferredPage) ?? index.recipesByPage.get(printedPage) ?? [];
    const target = targetForPageCandidates(pageCandidates, currentRecipeId, text);
    if (target && !directlyReferencedIds.has(target.id)) {
      references.push({
        end: pageMatch.index + pageMatch[0].length,
        start: pageMatch.index,
        target,
      });
    }
    pageMatch = PAGE_REFERENCE.exec(text);
  }

  return references
    .sort((a, b) => a.start - b.start || b.end - a.end)
    .filter((reference, referenceIndex, all) =>
      !all.slice(0, referenceIndex).some((earlier) => reference.start < earlier.end)
    );
}

export function collectCookbookRecipeReferences(
  index: CookbookReferenceIndex,
  recipe: CookbookReferenceRecipe,
) {
  const ingredientReferences = recipe.ingredientGroups
    .flatMap((group) => group.lines)
    .flatMap((text) => findCookbookTextReferences(index, text, recipe.id, "ingredient"));
  const methodReferences = recipe.methodGroups
    .flatMap((group) => group.steps)
    .flatMap((text) => findCookbookTextReferences(index, text, recipe.id, "method"));
  const references = [...ingredientReferences, ...methodReferences];
  return [...new Map(references.map((reference) => [reference.target.id, reference.target])).values()];
}
