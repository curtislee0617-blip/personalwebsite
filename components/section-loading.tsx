export type SectionLoadingVariant =
  | "home"
  | "about"
  | "projects"
  | "recipes"
  | "restaurants"
  | "tools"
  | "contact"
  | "cv"
  | "privacy";

type SectionLoadingProps = {
  variant: SectionLoadingVariant;
  title: string;
  description: string;
  compact?: boolean;
};

const loadingMarks: Partial<Record<SectionLoadingVariant, string>> = {
  home: "✦",
  projects: "✎",
  recipes: "🍳",
  restaurants: "🍴",
  contact: "👋",
  cv: "▤",
  privacy: "▤",
};

function LoadingMark({ variant }: { variant: SectionLoadingVariant }) {
  if (variant === "tools") {
    return (
      <span className="section-loading-screwdriver" aria-hidden="true">
        <i />
        <b />
      </span>
    );
  }

  if (variant === "about") {
    return (
      <span className="section-loading-more-dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    );
  }

  return (
    <span
      className={`section-loading-mark section-loading-mark-${variant}`}
      aria-hidden="true"
    >
      {loadingMarks[variant] ?? "·"}
    </span>
  );
}

export function SectionLoading({
  variant,
  title,
  description,
  compact = false,
}: SectionLoadingProps) {
  return (
    <section
      className={`section-loading section-loading-${variant}${compact ? " section-loading-compact" : ""}`}
      aria-busy="true"
      aria-label={title || description || "Loading"}
      aria-live="polite"
    >
      <div className="section-loading-simple-stack">
        <LoadingMark variant={variant} />
        {title && <h1>{title}</h1>}
        {description && <p>{description}</p>}
      </div>
    </section>
  );
}
