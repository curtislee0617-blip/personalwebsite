import type { ReactNode } from "react";

type PageIntroProps = { eyebrow?: string; title: string; description?: ReactNode; actions?: ReactNode };

export function PageIntro({ title, description, actions }: PageIntroProps) {
  if (actions) {
    return (
      <div className="page-intro page-intro--with-actions page-shell pt-12 sm:pt-14 lg:pt-16">
        <div className="page-intro-copy">
          <h1 className="page-intro-title display-title">{title}</h1>
          {description && <p className="page-intro-description mt-4 text-sm leading-7 text-ink/60 sm:text-base sm:leading-7">{description}</p>}
        </div>
        <div className="page-intro-actions">{actions}</div>
      </div>
    );
  }

  return (
    <div className="page-intro page-shell pt-12 sm:pt-14 lg:pt-16">
      <h1 className="page-intro-title display-title">{title}</h1>
      {description && <p className="page-intro-description mt-4 text-sm leading-7 text-ink/60 sm:text-base sm:leading-7">{description}</p>}
    </div>
  );
}
