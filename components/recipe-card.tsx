import Image from "next/image";
import Link from "next/link";
import { RecipeMediaGallery } from "@/components/recipe-media-gallery";
import type { RecipeCardEntry } from "@/lib/recipe-card-types";

export type { RecipeCardEntry } from "@/lib/recipe-card-types";

function formatDate(date?: string) {
  if (!date) return null;
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function StructuredRecipeContent({ entry, nested = false }: { entry: RecipeCardEntry; nested?: boolean }) {
  return (
    <div className={nested ? "recipe-card-nested-content" : "recipe-card-structured-content"}>
      {entry.ingredientGroups?.map((group, groupIndex) => (
        <div key={`ingredients-${group.title}-${groupIndex}`}>
          <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">{group.title}</h4>
          <ul className="mt-2 grid gap-1.5">
            {group.items.map((item, itemIndex) => (
              <li className="flex gap-2" key={`${item}-${itemIndex}`}>
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink/30" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {entry.methodGroups?.map((group, groupIndex) => (
        <div key={`method-${group.title}-${groupIndex}`}>
          <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">{group.title}</h4>
          <ol className="mt-2 grid gap-1.5">
            {group.steps.map((step, stepIndex) => (
              <li className="flex gap-2 leading-6" key={`${step}-${stepIndex}`}>
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-ink/15 text-[0.65rem] font-semibold text-ink/50">
                  {stepIndex + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

function LinkedRecipeSection({ adminEditHref, recipes }: { adminEditHref?: string; recipes: RecipeCardEntry[] }) {
  if (recipes.length === 0 && !adminEditHref) return null;

  return (
    <section className="recipe-card-linked-recipes">
      <div className="recipe-card-linked-heading">
        <div>
          <p className="eyebrow">Reusable components</p>
          <h4>Linked recipes</h4>
        </div>
        {adminEditHref && (
          <Link aria-label="Link another recipe" className="recipe-card-link-add" href={`${adminEditHref}#linked-recipes`} title="Link another recipe">
            +
          </Link>
        )}
      </div>

      {recipes.length > 0 ? (
        <div className="recipe-card-linked-list">
          {recipes.map((recipe) => (
            <details className="recipe-card-linked-item" key={recipe.recipeKey}>
              <summary>
                <span>
                  <strong>{recipe.title}</strong>
                  <small>{recipe.description}</small>
                </span>
                <i aria-hidden="true">+</i>
              </summary>
              <div className="recipe-card-linked-body">
                <StructuredRecipeContent entry={recipe} nested />
                <Link className="recipe-card-linked-jump" href={`/recipes#recipe-${recipe.slug}`}>Open its recipe card ↗</Link>
              </div>
            </details>
          ))}
        </div>
      ) : (
        <p className="recipe-card-linked-empty">No linked recipes yet. Use + to add a reusable component.</p>
      )}
    </section>
  );
}

export function RecipeCard({
  adminEditHref,
  entry,
  linkedRecipes = [],
  showBackLink = false,
  variant = "default",
}: {
  adminEditHref?: string;
  entry: RecipeCardEntry;
  linkedRecipes?: RecipeCardEntry[];
  showBackLink?: boolean;
  variant?: "default" | "shelf";
}) {
  const shelf = variant === "shelf";
  const hasStructuredContent = Boolean(entry.ingredientGroups?.length || entry.methodGroups?.length);
  const media = entry.media ?? (entry.imageUrls ?? []).map((src) => ({ src, type: "image" as const }));
  const hasExpandedContent = hasStructuredContent || media.length > 0 || linkedRecipes.length > 0 || Boolean(adminEditHref) || showBackLink;

  return (
    <details className={`recipe-card scroll-mt-24 rounded-[1.5rem] border border-ink/10 bg-surface/55 p-4 transition hover:-translate-y-0.5 hover:border-ink/20 sm:p-5 ${shelf ? "recipe-shelf-card" : ""} ${!entry.thumbnail ? "recipe-card-text-only" : ""}`} id={`recipe-${entry.slug}`}>
      <summary className="recipe-card-summary recipes-section-summary cursor-pointer list-none marker:hidden">
        {entry.thumbnail && <div className="recipe-card-thumbnail relative overflow-hidden rounded-[1rem] border border-ink/10 bg-paper/70">
          <div className="relative aspect-[4/3]">
            <Image alt="" className="object-cover" fill sizes="(max-width: 768px) 50vw, 22vw" src={entry.thumbnail} />
          </div>
        </div>}
        <div className="recipe-card-copy">
          <p className="eyebrow mt-4">Recipe</p>
          <h3 className="mt-3 text-xl font-semibold tracking-tight">{entry.title}</h3>
          {formatDate(entry.date) && <p className="recipe-card-date mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink/40">{formatDate(entry.date)}</p>}
          {entry.description && <p className="recipe-card-description mt-3 text-sm leading-6 text-ink/65">{entry.description}</p>}
          {hasExpandedContent && <p className="recipe-card-action mt-5 text-sm font-semibold text-moss">Open recipe ↓</p>}
        </div>
      </summary>

      {adminEditHref && (
        <div className="recipe-card-admin-toolbar">
          <Link href={adminEditHref}>Edit recipe</Link>
          <Link href={`${adminEditHref}#linked-recipes`}>+ Link recipe</Link>
        </div>
      )}

      {hasExpandedContent && (
        <div className="recipe-card-expanded-content">
          <RecipeMediaGallery media={media} title={entry.title} />
          {hasStructuredContent && <StructuredRecipeContent entry={entry} />}
          <LinkedRecipeSection adminEditHref={adminEditHref} recipes={linkedRecipes} />
          {showBackLink && <Link className="back-link-bubble" href="/recipes">Back to recipes</Link>}
        </div>
      )}
    </details>
  );
}
