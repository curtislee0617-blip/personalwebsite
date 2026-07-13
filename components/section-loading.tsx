type SectionLoadingVariant =
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
  eyebrow?: string;
};

function LoadingMark({ variant, simple = false }: { variant: SectionLoadingVariant; simple?: boolean }) {
  if (simple) {
    const simpleEmoji: Partial<Record<SectionLoadingVariant, string>> = {
      restaurants: "🍴",
      recipes: "🍳",
      projects: "🖊️",
      tools: "🪛",
      contact: "👋",
    };
    const emoji = simpleEmoji[variant];

    if (emoji) {
      return (
        <div className={`section-loading-visual section-loading-visual-${variant}`} aria-hidden="true">
          <span className={`section-loading-emoji section-loading-emoji-${variant}`}>{emoji}</span>
        </div>
      );
    }

    if (variant === "about") {
      return (
        <span className="section-loading-more-dots" aria-hidden="true">
          <i /><i /><i /><i /><i /><i /><i />
        </span>
      );
    }
  }

  return (
    <div className={`section-loading-visual section-loading-visual-${variant}`} aria-hidden="true">
      {!simple && <span className="section-loading-orbit" />}

      {variant === "restaurants" && (
        <span className="section-loading-emoji section-loading-emoji-fork">🍴</span>
      )}

      {variant === "recipes" && (
        <span className="section-loading-emoji section-loading-emoji-knife">🔪</span>
      )}

      {variant === "tools" && (
        <span className="section-loading-gear">
          <i />
          <b />
        </span>
      )}

      {variant === "projects" && (
        <span className="section-loading-cards">
          <i />
          <b />
          <em />
        </span>
      )}

      {variant === "about" && (
        <span className="section-loading-engine">
          <i />
          <b />
          <em />
          <span />
        </span>
      )}

      {variant === "contact" && (
        <span className="section-loading-envelope">
          <i />
        </span>
      )}

      {variant === "home" && (
        <span className="section-loading-home">
          <i />
          <b />
          <em />
        </span>
      )}

      {(variant === "cv" || variant === "privacy") && (
        <span className="section-loading-document">
          <i />
          <b />
          <em />
        </span>
      )}
    </div>
  );
}

export function SectionLoading({ variant, title, description, eyebrow = "Loading" }: SectionLoadingProps) {
  const simpleLoaders: SectionLoadingVariant[] = ["about", "projects", "recipes", "restaurants", "tools", "contact"];
  const isSimpleLoader = simpleLoaders.includes(variant);

  if (isSimpleLoader) {
    return (
      <section className={`section-loading section-loading-minimal section-loading-${variant}`} aria-busy="true" aria-label={title || description || "Loading"} aria-live="polite">
        <div className="section-loading-simple-stack">
          {variant !== "about" && <LoadingMark variant={variant} simple />}
          {title && <h1>{title}</h1>}
          {variant === "about" && <LoadingMark variant={variant} simple />}
          {description && <p>{description}</p>}
        </div>
      </section>
    );
  }

  return (
    <section className={`section-loading section-loading-${variant}`} aria-busy="true" aria-live="polite">
      <div className="section-loading-card">
        <LoadingMark variant={variant} />
        <div className="section-loading-copy">
          {eyebrow && <p className="section-loading-eyebrow">{eyebrow}</p>}
          <h1>{title}</h1>
          <p>{description}</p>
          <span className="section-loading-dots" aria-hidden="true"><i /><i /><i /></span>
        </div>
      </div>
    </section>
  );
}
