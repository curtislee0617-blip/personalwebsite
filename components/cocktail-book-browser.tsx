"use client";

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { RecipeImageViewer } from "@/components/recipe-image-viewer";
import { cocktailCodexStyles } from "@/lib/cocktail-codex";
import type { CocktailBook, CocktailBookRecipe } from "@/lib/cocktail-book-types";

function pageLabel(pages: number[]) {
  return pages.length === 1 ? `PDF page ${pages[0]}` : `PDF pages ${pages.join(", ")}`;
}

function findReferencedRecipes(recipe: CocktailBookRecipe, index: CocktailBookRecipe[]) {
  const referenced = new Map<string, CocktailBookRecipe>();

  recipe.ingredientGroups.flatMap((group) => group.lines).forEach((line) => {
    const normalizedLine = line.toLocaleLowerCase();
    if (!normalizedLine.includes("this page")) return;

    const target = index
      .filter((candidate) => candidate.id !== recipe.id && normalizedLine.includes(candidate.title.toLocaleLowerCase()))
      .sort((first, second) => second.title.length - first.title.length)[0];

    if (target) referenced.set(target.id, target);
  });

  return Array.from(referenced.values());
}

function CocktailReferencedPreparations({ recipes }: { recipes: CocktailBookRecipe[] }) {
  if (recipes.length === 0) return null;

  return (
    <section className="cocktail-referenced-preparations">
      <div className="cocktail-referenced-heading">
        <div>
          <p className="eyebrow">Referenced preparations</p>
          <h4>Open the components used in this recipe</h4>
        </div>
        <small>{recipes.length} {recipes.length === 1 ? "preparation" : "preparations"}</small>
      </div>
      <div className="cocktail-referenced-list">
        {recipes.map((recipe) => (
          <details className="cocktail-referenced-item" key={recipe.id}>
            <summary>
              <span>
                <strong>{recipe.title}</strong>
                <small>{pageLabel(recipe.sourcePages)}</small>
              </span>
              <i aria-hidden="true">+</i>
            </summary>
            <div className="cocktail-referenced-body">
              {(recipe.description || recipe.attribution) && (
                <header>
                  {recipe.description && <p>{recipe.description}</p>}
                  {recipe.attribution && <small>{recipe.attribution}</small>}
                </header>
              )}
              <div className="cocktail-referenced-formula">
                <section>
                  <p className="eyebrow">Ingredients</p>
                  {recipe.ingredientGroups.map((group, groupIndex) => (
                    <div key={`${group.heading}-${groupIndex}`}>
                      {recipe.ingredientGroups.length > 1 && <h5>{group.heading}</h5>}
                      <ul>
                        {group.lines.map((line, lineIndex) => <li key={`${line}-${lineIndex}`}>{line}</li>)}
                      </ul>
                    </div>
                  ))}
                </section>
                <section>
                  <p className="eyebrow">Method</p>
                  {recipe.methodGroups.map((group, groupIndex) => (
                    <div key={`${group.heading}-${groupIndex}`}>
                      {recipe.methodGroups.length > 1 && <h5>{group.heading}</h5>}
                      <ol>
                        {group.steps.map((step, stepIndex) => <li key={`${step}-${stepIndex}`}>{step}</li>)}
                      </ol>
                    </div>
                  ))}
                  {recipe.methodGroups.length === 0 && (
                    <p className="cocktail-library-empty">No separate method was printed for this preparation.</p>
                  )}
                </section>
              </div>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function LostCocktailFormula({ recipe }: { recipe: CocktailBookRecipe }) {
  const originalGroups = recipe.methodGroups.filter((group) => group.heading.toLocaleLowerCase() === "as first set down");
  const modernMethodGroups = recipe.methodGroups.filter((group) => group.heading.toLocaleLowerCase() !== "as first set down");

  return (
    <div className="cocktail-library-formula cocktail-library-lost-formula">
      <section>
        <p className="eyebrow">As first set down</p>
        <div className="cocktail-library-original-copy">
          {originalGroups.flatMap((group) => group.steps).map((step, stepIndex) => (
            <p key={`${step}-${stepIndex}`}>{step}</p>
          ))}
        </div>
      </section>
      <section>
        <p className="eyebrow">Modern build</p>
        {recipe.ingredientGroups.map((group, groupIndex) => (
          <div key={`${group.heading}-${groupIndex}`}>
            {recipe.ingredientGroups.length > 1 && <h4>{group.heading}</h4>}
            <ul>
              {group.lines.map((line, lineIndex) => (
                <li key={`${line}-${lineIndex}`}>{line}</li>
              ))}
            </ul>
          </div>
        ))}
        {modernMethodGroups.map((group, groupIndex) => (
          <div key={`${group.heading}-${groupIndex}`}>
            <h4>{group.heading}</h4>
            <ol>
              {group.steps.map((step, stepIndex) => <li key={`${step}-${stepIndex}`}>{step}</li>)}
            </ol>
          </div>
        ))}
      </section>
    </div>
  );
}

function CocktailRecipeCard({
  book,
  bookOrder,
  pending,
  published,
  recipe,
  referencedRecipes,
  onPublish,
}: {
  book: CocktailBook;
  bookOrder?: number;
  pending: boolean;
  published: boolean;
  recipe: CocktailBookRecipe;
  referencedRecipes: CocktailBookRecipe[];
  onPublish: (recipe: CocktailBookRecipe, publish: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const metadata = [recipe.yield, recipe.glassware, recipe.equipment].filter(Boolean).join(" · ");

  return (
    <details
      className={`cocktail-library-recipe ${recipe.image ? "has-image" : "text-only"}`}
      id={`cocktail-recipe-${recipe.id}`}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>
        {recipe.image && (
          <div className="cocktail-library-recipe-thumb">
            <Image alt={`${recipe.title} from ${book.title}`} className="object-cover" fill sizes="(max-width: 640px) 44vw, 15rem" src={recipe.image} />
          </div>
        )}
        <span className="cocktail-library-recipe-copy">
          <small>{bookOrder ? `No. ${String(bookOrder).padStart(2, "0")} · ${recipe.subsection || recipe.section}` : recipe.subsection || recipe.section}</small>
          <strong>{recipe.title}</strong>
          <span>{metadata || pageLabel(recipe.sourcePages)}</span>
        </span>
        <i aria-hidden="true">+</i>
      </summary>

      {open && <div className="cocktail-library-recipe-body">
        {recipe.images.length > 0 && (
          <div className="cocktail-library-media">
            {recipe.images.map((src, imageIndex) => (
              <RecipeImageViewer alt={`${recipe.title}, image ${imageIndex + 1}`} className="cocktail-library-media-item" key={src} src={src}>
                <Image alt={`${recipe.title}, image ${imageIndex + 1}`} className="object-contain" fill loading="eager" sizes="(max-width: 640px) 82vw, 30rem" src={src} />
              </RecipeImageViewer>
            ))}
          </div>
        )}

        <header>
          <p className="eyebrow">{pageLabel(recipe.sourcePages)}</p>
          <h3>{recipe.title}</h3>
          {book.id !== "cocktail-codex" && recipe.description && <p>{recipe.description}</p>}
          {book.id !== "cocktail-codex" && recipe.attribution && <small>{recipe.attribution}</small>}
        </header>

        {book.id === "cocktail-codex" && (recipe.description || recipe.attribution) && (
          <details className="cocktail-recipe-book-notes">
            <summary>
              <span>
                <strong>From the book</strong>
                <small>Background, history and serving notes for this recipe</small>
              </span>
              <i aria-hidden="true">+</i>
            </summary>
            <div>
              {recipe.description && <p>{recipe.description}</p>}
              {recipe.attribution && <small>{recipe.attribution}</small>}
            </div>
          </details>
        )}

        {book.id === "lost-cocktails" ? (
          <LostCocktailFormula recipe={recipe} />
        ) : (
          <div className="cocktail-library-formula">
            <section>
              <p className="eyebrow">Ingredients</p>
              {recipe.ingredientGroups.map((group, groupIndex) => (
                <div key={`${group.heading}-${groupIndex}`}>
                  {recipe.ingredientGroups.length > 1 && <h4>{group.heading}</h4>}
                  <ul>
                    {group.lines.map((line, lineIndex) => (
                      <li key={`${line}-${lineIndex}`}>{line}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
            <section>
              <p className="eyebrow">Method</p>
              {recipe.methodGroups.map((group, groupIndex) => (
                <div key={`${group.heading}-${groupIndex}`}>
                  {recipe.methodGroups.length > 1 && <h4>{group.heading}</h4>}
                  <ol>
                    {group.steps.map((step, stepIndex) => <li key={`${step}-${stepIndex}`}>{step}</li>)}
                  </ol>
                </div>
              ))}
              {recipe.methodGroups.length === 0 && <p className="cocktail-library-empty">The formula is retained exactly as supplied; no separate method was printed.</p>}
            </section>
          </div>
        )}

        <CocktailReferencedPreparations recipes={referencedRecipes} />

        <div className="cocktail-library-admin-action">
          <button disabled={pending} onClick={() => onPublish(recipe, !published)} type="button">
            {pending ? "Saving…" : published ? "✓ In my cocktail recipes" : "+ Move to my cocktail recipes"}
          </button>
          {published && <Link href={`/recipes#recipe-cocktail-${book.id}-${recipe.id}`}>View public card ↗</Link>}
        </div>
      </div>}
    </details>
  );
}

export function CocktailBookBrowser({ book, initiallyPublished }: { book: CocktailBook; initiallyPublished: string[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase());
  const [published, setPublished] = useState(() => new Set(initiallyPublished));
  const [pending, setPending] = useState(() => new Set<string>());
  const [error, setError] = useState("");
  const [expandAll, setExpandAll] = useState(false);
  const recipes = useMemo(
    () => deferredQuery ? book.recipes.filter((recipe) => recipe.searchText.toLocaleLowerCase().includes(deferredQuery)) : book.recipes,
    [book.recipes, deferredQuery],
  );
  const referencesByRecipe = useMemo(
    () => new Map(book.recipes.map((recipe) => [recipe.id, findReferencedRecipes(recipe, book.recipes)])),
    [book.recipes],
  );
  const recipeGroups = book.id === "lost-cocktails"
    ? [{ name: "Fifty drinks in book order", recipes, slug: "book-order" }]
    : book.id === "cocktail-codex"
      ? [
          ...cocktailCodexStyles.map((style) => ({
            name: style.chapter,
            recipes: recipes.filter((recipe) => recipe.section === style.chapter),
            slug: style.slug,
          })),
          {
            name: "Appendix",
            recipes: recipes.filter((recipe) => recipe.section.startsWith("Appendix")),
            slug: "appendix",
          },
        ]
      : book.sections.map((section) => ({
          name: section,
          recipes: recipes.filter((recipe) => recipe.section === section),
          slug: undefined,
        }));

  async function togglePublication(recipe: CocktailBookRecipe, shouldPublish: boolean) {
    setError("");
    setPending((current) => new Set(current).add(recipe.id));
    try {
      const response = await fetch("/api/recipe-admin/cocktail-publications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: shouldPublish ? "publish" : "unpublish", bookId: book.id, recipeId: recipe.id }),
      });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(result.error || "The recipe could not be moved.");
      setPublished((current) => {
        const next = new Set(current);
        if (shouldPublish) next.add(recipe.id);
        else next.delete(recipe.id);
        return next;
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The recipe could not be moved.");
    } finally {
      setPending((current) => {
        const next = new Set(current);
        next.delete(recipe.id);
        return next;
      });
    }
  }

  return (
    <div className="cocktail-library-browser">
      <div className="cocktail-library-controls">
        <label>
          <span className="sr-only">Search {book.title}</span>
          <input onChange={(event) => setQuery(event.currentTarget.value)} placeholder={`Search ${book.title}`} type="search" value={query} />
        </label>
        <button onClick={() => setExpandAll((value) => !value)} type="button">{expandAll ? "Collapse sections" : "Expand all sections"}</button>
      </div>
      {error && <p className="cocktail-library-error">{error}</p>}
      <p className="cocktail-library-result-count">
        {recipes.length} of {book.recipes.length} recipes and preparations
      </p>

      <div className="cocktail-library-sections">
        {recipeGroups.map((group) => {
          const sectionRecipes = group.recipes;
          if (sectionRecipes.length === 0) return null;
          return (
            <details
              className="cocktail-library-section"
              id={group.slug ? `cocktail-section-${group.slug}` : undefined}
              key={group.name}
              open={expandAll || Boolean(deferredQuery)}
            >
              <summary>
                <span><strong>{group.name}</strong><small>{sectionRecipes.length} recipes</small></span>
                <i aria-hidden="true">+</i>
              </summary>
              <div className="cocktail-library-grid">
                {sectionRecipes.map((recipe) => (
                  <CocktailRecipeCard
                    book={book}
                    bookOrder={book.id === "lost-cocktails" ? book.recipes.findIndex((entry) => entry.id === recipe.id) + 1 : undefined}
                    key={recipe.id}
                    onPublish={togglePublication}
                    pending={pending.has(recipe.id)}
                    published={published.has(recipe.id)}
                    recipe={recipe}
                    referencedRecipes={referencesByRecipe.get(recipe.id) ?? []}
                  />
                ))}
              </div>
            </details>
          );
        })}
      </div>

      {book.images.length > 0 && (
        <details className="cocktail-library-image-archive">
          <summary><span><strong>Book image archive</strong><small>{book.images.length} unique images, all retained</small></span><i aria-hidden="true">+</i></summary>
          <div>
            {book.images.map((image) => (
              <RecipeImageViewer alt={`${book.title}, PDF page ${image.sourcePages.join(", ")}`} className="cocktail-library-archive-image" key={image.src} src={image.src}>
                <Image alt={`${book.title}, PDF page ${image.sourcePages.join(", ")}`} className="object-contain" fill sizes="(max-width: 640px) 45vw, 18rem" src={image.src} />
                <span>PDF p. {image.sourcePages.join(", ")}</span>
              </RecipeImageViewer>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
