export type CornerOrigin = { x: number; y: number };
export const CORNER_SPRING = { mass: 0.85, tension: 290, friction: 31, clamp: true, precision: 0.001 };

export function cornerProgress(progress: number, index: number) {
  const delay = Math.min(index * 0.028, 0.2);
  return Math.max(0, Math.min(1, (progress - delay) / (1 - delay)));
}

/** Grow the final-size surface uniformly, with its center travelling from the menu corner. */
export function cornerTransform(rect: DOMRect, origin: CornerOrigin, progress: number) {
  const remaining = 1 - progress;
  const x = (origin.x - rect.left - rect.width / 2) * remaining;
  const y = (origin.y - rect.top - rect.height / 2) * remaining;
  const scale = 0.12 + 0.88 * progress;
  return `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
}

export function distanceFromCorner(rect: DOMRect, origin: CornerOrigin) {
  return Math.hypot(rect.left + rect.width / 2 - origin.x, rect.top + rect.height / 2 - origin.y);
}
