export type ViewTransitionHandle = {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition: () => void;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (
    update: () => void | Promise<void>,
  ) => ViewTransitionHandle;
};

export type ViewTransitionOptions = {
  respectReducedMotion?: boolean;
};

/**
 * Runs a same-document DOM update through the native View Transitions API.
 * Unsupported browsers and reduced-motion users receive the update immediately.
 */
export async function runViewTransition(
  update: () => void | Promise<void>,
  { respectReducedMotion = true }: ViewTransitionOptions = {},
) {
  if (typeof document === "undefined") {
    await update();
    return null;
  }

  const viewTransitionDocument = document as ViewTransitionDocument;
  const shouldReduceMotion = respectReducedMotion
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!viewTransitionDocument.startViewTransition || shouldReduceMotion) {
    await update();
    return null;
  }

  return viewTransitionDocument.startViewTransition(update);
}
