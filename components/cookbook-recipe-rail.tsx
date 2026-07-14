import { Children, type ReactNode } from "react";
import { SnapCarousel } from "@/components/snap-carousel";

export function CookbookRecipeRail({ children, title }: { children: ReactNode; title: string }) {
  const count = Children.count(children);
  if (count === 0) return null;

  return (
    <section className="book-recipe-section" aria-label={`${title}, ${count} recipes`}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Collection</p>
          <h3 className="mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">{title}</h3>
        </div>
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-ink/35">
          <span>{count} recipes</span>
          <span className="ml-2 sm:hidden">· Swipe</span>
        </p>
      </div>
      <SnapCarousel
        className="book-recipe-carousel mobile-snap-carousel -mx-5 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 pt-1 sm:mx-0 sm:px-0"
        repeatEdges={false}
      >
        {children}
      </SnapCarousel>
    </section>
  );
}
