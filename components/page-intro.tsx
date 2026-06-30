import type { ReactNode } from "react";

type PageIntroProps = { eyebrow?: string; title: string; description?: ReactNode };

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <div className="page-shell pt-12 sm:pt-14 lg:pt-16">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className={`display-title max-w-4xl ${eyebrow ? "mt-3" : ""}`}>{title}</h1>
      {description && <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/60 sm:text-base sm:leading-7">{description}</p>}
    </div>
  );
}
