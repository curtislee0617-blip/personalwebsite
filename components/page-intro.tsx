import type { ReactNode } from "react";

type PageIntroProps = { eyebrow?: string; title: string; description?: ReactNode };

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <div className="page-shell pt-16 sm:pt-20 lg:pt-24">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className={`display-title max-w-4xl ${eyebrow ? "mt-5" : ""}`}>{title}</h1>
      {description && <p className="mt-7 max-w-2xl text-base leading-7 text-ink/60 sm:text-lg sm:leading-8">{description}</p>}
    </div>
  );
}
