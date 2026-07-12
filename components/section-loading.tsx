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

function LoadingMark({ variant }: { variant: SectionLoadingVariant }) {
  return (
    <div className={`section-loading-visual section-loading-visual-${variant}`} aria-hidden="true">
      <span className="section-loading-orbit" />

      {variant === "restaurants" && (
        <span className="section-loading-utensils">
          <span className="section-loading-fork"><i /><i /><i /></span>
          <span className="section-loading-knife" />
        </span>
      )}

      {variant === "recipes" && (
        <span className="section-loading-pan">
          <span />
          <i />
        </span>
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
  return (
    <section className={`section-loading section-loading-${variant}`} aria-busy="true" aria-live="polite">
      <div className="section-loading-card">
        <LoadingMark variant={variant} />
        <div className="section-loading-copy">
          <p className="section-loading-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
          <span className="section-loading-dots" aria-hidden="true"><i /><i /><i /></span>
        </div>
      </div>
    </section>
  );
}
