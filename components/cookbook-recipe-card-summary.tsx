import Image from "next/image";

type CookbookRecipeCardSummaryProps = {
  description: string;
  fallbackMark: string;
  image: string | null;
  imageAlt: string;
  imagePosition?: string;
  index: number;
  meta: string;
  onToggle: () => void;
  open: boolean;
  title: string;
  zoomImage?: boolean;
};

export function CookbookRecipeCardSummary({
  description,
  fallbackMark,
  image,
  imageAlt,
  imagePosition,
  index,
  meta,
  onToggle,
  open,
  title,
  zoomImage = false,
}: CookbookRecipeCardSummaryProps) {
  return (
    <button
      aria-expanded={open}
      className={`group/summary w-full overflow-hidden rounded-[1.2rem] text-left ${open ? "sm:grid sm:grid-cols-[13rem_minmax(0,1fr)]" : "flex h-full flex-col"}`}
      onClick={onToggle}
      type="button"
    >
      <div className={`relative w-full overflow-hidden rounded-[1rem] border border-ink/10 bg-paper/70 ${open ? "aspect-[4/3] sm:h-full sm:min-h-44 sm:aspect-auto" : "aspect-[4/3]"}`}>
        {image ? (
          <Image
            alt={imageAlt}
            className={`object-cover transition duration-500 ${zoomImage ? "scale-[1.08] group-hover/summary:scale-[1.11]" : "group-hover/summary:scale-[1.025]"}`}
            fill
            sizes={open ? "(max-width: 640px) 92vw, 13rem" : "(max-width: 768px) 92vw, (max-width: 1280px) 45vw, 24rem"}
            src={image}
            style={{ objectPosition: imagePosition ?? "50% 50%" }}
          />
        ) : (
          <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),rgba(219,210,191,0.42))] text-sm font-semibold uppercase tracking-[0.14em] text-ink/30">
            {fallbackMark}
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-3.5 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow">Recipe {String(index + 1).padStart(2, "0")}</p>
          <span className="truncate text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-ink/35">{meta}</span>
        </div>
        <h3 className="mt-2 text-lg font-semibold leading-tight tracking-tight sm:text-xl">{title}</h3>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-ink/52">{description}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-moss">
          {open ? "Close recipe" : "Open recipe"}
          <span aria-hidden="true" className={`transition ${open ? "rotate-180" : ""}`}>↓</span>
        </span>
      </div>
    </button>
  );
}
