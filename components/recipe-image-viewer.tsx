"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

type RecipeImageViewerProps = {
  alt: string;
  children: ReactNode;
  className?: string;
  src: string;
  viewerImageStyle?: CSSProperties;
};

export function RecipeImageViewer({ alt, children, className = "", src, viewerImageStyle }: RecipeImageViewerProps) {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const closeViewer = useCallback(() => {
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeViewer();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [closeViewer, open]);

  const keepFocusInViewer = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab") return;
    const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button, [href], [tabindex]:not([tabindex='-1'])"));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      <button
        aria-haspopup="dialog"
        aria-label={`View full-size image: ${alt}`}
        className={`recipe-image-viewer-trigger ${className}`}
        onClick={() => setOpen(true)}
        ref={triggerRef}
        type="button"
      >
        {children}
      </button>

      {open && typeof document !== "undefined" ? createPortal(
        <div
          className="recipe-image-viewer-backdrop"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) closeViewer();
          }}
        >
          <section aria-labelledby={titleId} aria-modal="true" className="recipe-image-viewer-dialog" onKeyDown={keepFocusInViewer} role="dialog">
            <header className="recipe-image-viewer-header">
              <button className="back-link-bubble" onClick={closeViewer} ref={closeButtonRef} type="button">
                ← Back to recipe
              </button>
              <p id={titleId}>{alt}</p>
            </header>
            <div className="recipe-image-viewer-stage">
              <Image
                alt={alt}
                className="object-contain"
                fill
                sizes="100vw"
                src={src}
                style={viewerImageStyle}
              />
            </div>
          </section>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
