type PageIntroProps = { eyebrow: string; title: string; description: string };

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <div className="page-shell pt-16 sm:pt-20 lg:pt-24">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="display-title mt-5 max-w-4xl">{title}</h1>
      <p className="mt-7 max-w-2xl text-base leading-7 text-ink/60 sm:text-lg sm:leading-8">{description}</p>
    </div>
  );
}
