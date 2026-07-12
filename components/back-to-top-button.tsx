"use client";

export function BackToTopButton() {
  const handleClick = () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ behavior: prefersReducedMotion ? "auto" : "smooth", top: 0 });
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  };

  return (
    <button className="footer-link" onClick={handleClick} type="button">
      Back to top ↑
    </button>
  );
}
