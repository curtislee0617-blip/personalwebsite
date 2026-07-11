import type { ReactNode } from "react";

type PageIntroProps = { eyebrow?: string; title: string; description?: ReactNode };

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <div className="page-intro page-shell pt-12 sm:pt-14 lg:pt-16">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className={`page-intro-title display-title ${eyebrow ? "mt-3" : ""}`}>{title}</h1>
      {description && <p className="page-intro-description mt-4 text-sm leading-7 text-ink/60 sm:text-base sm:leading-7">{description}</p>}
    </div>
  );
}
