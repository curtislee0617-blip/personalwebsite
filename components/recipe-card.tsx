import Image from "next/image";
import Link from "next/link";

export type RecipeCardEntry = {
  slug: string;
  title: string;
  description: string;
  status?: "published" | "coming-soon" | string;
  date?: string;
  category?: string;
  thumbnail?: string;
  ingredientGroups?: Array<{ title: string; items: string[] }>;
  methodGroups?: Array<{ title: string; steps: string[] }>;
};

function formatDate(date?: string) {
  if (!date) return null;
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function RecipeCard({ entry, showBackLink = false, carousel = false }: { entry: RecipeCardEntry; showBackLink?: boolean; carousel?: boolean }) {
  return (
    <details className={`recipe-card rounded-[1.5rem] border border-ink/10 bg-surface/55 p-4 transition hover:-translate-y-0.5 hover:border-ink/20 sm:p-5 ${carousel ? "mobile-snap-card w-[76vw] max-w-[17rem] shrink-0 snap-center sm:w-auto sm:max-w-none" : ""}`}>
      <summary className="recipe-card-summary recipes-section-summary cursor-pointer list-none marker:hidden">
        <div className="recipe-card-thumbnail relative overflow-hidden rounded-[1rem] border border-ink/10 bg-paper/70">
          <div className="relative aspect-[4/3]">
            {entry.thumbnail ? (
              <Image alt="" className="object-cover" fill sizes="(max-width: 768px) 50vw, 22vw" src={entry.thumbnail} />
            ) : (
              <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),rgba(219,210,191,0.42))] text-xs font-semibold uppercase tracking-[0.14em] text-ink/35">
                Photo soon
              </div>
            )}
          </div>
        </div>
        <div className="recipe-card-copy">
          <div className="flex items-center justify-between gap-4">
            <p className="eyebrow mt-4">Recipe</p>
            <span className="recipe-card-status rounded-full border border-ink/10 bg-paper/80 px-3 py-1 text-xs font-semibold text-ink/50">{entry.status === "published" ? "Published" : "Coming later"}</span>
          </div>
          <h3 className="mt-3 text-xl font-semibold tracking-tight">{entry.title}</h3>
          {formatDate(entry.date) && <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink/40">{formatDate(entry.date)}</p>}
          <p className="recipe-card-description mt-3 text-sm leading-6 text-ink/65">{entry.description}</p>
          <p className="recipe-card-action mt-5 text-sm font-semibold text-moss">Open recipe ↓</p>
        </div>
      </summary>
      {entry.ingredientGroups || entry.methodGroups ? (
        <div className="mt-6 grid gap-5 border-t border-ink/10 pt-6 text-sm text-ink/65">
          {entry.ingredientGroups?.map((group) => (
            <div key={group.title}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">{group.title}</h4>
              <ul className="mt-2 grid gap-1.5">
                {group.items.map((item) => (
                  <li className="flex gap-2" key={item}>
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink/30" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {entry.methodGroups?.map((group) => (
            <div key={group.title}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">{group.title}</h4>
              <ol className="mt-2 grid gap-1.5">
                {group.steps.map((step, index) => (
                  <li className="flex gap-2 leading-6" key={step}>
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-ink/15 text-[0.65rem] font-semibold text-ink/50">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
          {showBackLink && (
            <Link className="back-link-bubble" href="/recipes">
              Back to recipes
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-6 grid gap-2 border-t border-ink/10 pt-6 text-sm text-ink/45">
          <p>Title</p>
          <p>Short headnote</p>
          <p>Ingredients</p>
          <p>Method</p>
          <p>Notes / variations</p>
          {showBackLink && (
            <Link className="back-link-bubble mt-3" href="/recipes">
              Back to recipes
            </Link>
          )}
        </div>
      )}
    </details>
  );
}
