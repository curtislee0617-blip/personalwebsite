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
    // The same artwork as the /tools page cursor, so the loading screen
    // hands off seamlessly to the pointer once the page arrives.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt=""
        aria-hidden="true"
        className="section-loading-screwdriver"
        src="/cursors/screwdriver-loading.png"
      />
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
