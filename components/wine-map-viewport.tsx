"use client";

import {
  useCallback,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";

type ViewportTransform = {
  scale: number;
  x: number;
  y: number;
};

export type MapLabelCandidate = {
  height: number;
  id: string;
  point: [number, number];
  priority?: number;
  width: number;
};

export type MapLabelPlacement = {
  hidden: boolean;
  offsetX: number;
  offsetY: number;
};

export type MapViewportSnapshot = ViewportTransform;

type PointerStart = ViewportTransform & {
  pointerId: number;
  clientX: number;
  clientY: number;
  moved: boolean;
};

const minimumScale = 1;
const maximumScale = 6;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export type MapLabelBox = {
  bottom: number;
  left: number;
  right: number;
  top: number;
};

function overlapArea(first: MapLabelBox, second: MapLabelBox) {
  const width = Math.max(0, Math.min(first.right, second.right) - Math.max(first.left, second.left));
  const height = Math.max(0, Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top));
  return width * height;
}

export function layoutMapLabels(
  labels: MapLabelCandidate[],
  viewport: MapViewportSnapshot,
  mapWidth: number,
  mapHeight: number,
  {
    hideOnCollision = true,
    padding = 10,
    obstacles = [],
  }: {
    hideOnCollision?: boolean;
    obstacles?: MapLabelBox[];
    padding?: number;
  } = {},
) {
  const placements = new Map<string, MapLabelPlacement>();
  const occupied = [...obstacles];
  const orderedLabels = [...labels].sort(
    (first, second) => (second.priority ?? 0) - (first.priority ?? 0),
  );

  orderedLabels.forEach((label) => {
    const anchorX = viewport.x + label.point[0] * viewport.scale;
    const anchorY = viewport.y + label.point[1] * viewport.scale;
    const edgeMargin = Math.max(label.width, label.height);
    if (
      anchorX < -edgeMargin
      || anchorX > mapWidth + edgeMargin
      || anchorY < -edgeMargin
      || anchorY > mapHeight + edgeMargin
    ) {
      placements.set(label.id, { hidden: true, offsetX: 0, offsetY: 0 });
      return;
    }

    const candidates: Array<[number, number]> = [
      [0, -label.height * 0.72],
      [0, label.height * 0.72],
      [label.width * 0.5 + 8, 0],
      [-label.width * 0.5 - 8, 0],
      [label.width * 0.42, -label.height * 0.62],
      [-label.width * 0.42, -label.height * 0.62],
      [label.width * 0.42, label.height * 0.62],
      [-label.width * 0.42, label.height * 0.62],
      [0, 0],
    ];
    let best:
      | { box: MapLabelBox; centerX: number; centerY: number; score: number }
      | null = null;

    for (const [candidateX, candidateY] of candidates) {
      const centerX = clamp(
        anchorX + candidateX,
        padding + label.width / 2,
        mapWidth - padding - label.width / 2,
      );
      const centerY = clamp(
        anchorY + candidateY,
        padding + label.height / 2,
        mapHeight - padding - label.height / 2,
      );
      const box = {
        bottom: centerY + label.height / 2 + 2,
        left: centerX - label.width / 2 - 2,
        right: centerX + label.width / 2 + 2,
        top: centerY - label.height / 2 - 2,
      };
      const score = occupied.reduce(
        (total, occupiedBox) => total + overlapArea(box, occupiedBox),
        0,
      );
      if (!best || score < best.score) {
        best = { box, centerX, centerY, score };
      }
    }

    if (!best) {
      placements.set(label.id, { hidden: true, offsetX: 0, offsetY: 0 });
      return;
    }

    const collisionRatio = best.score / Math.max(1, label.width * label.height);
    if (hideOnCollision && collisionRatio > 0.12) {
      placements.set(label.id, { hidden: true, offsetX: 0, offsetY: 0 });
      return;
    }

    occupied.push(best.box);
    placements.set(label.id, {
      hidden: false,
      offsetX: best.centerX - anchorX,
      offsetY: best.centerY - anchorY,
    });
  });

  return placements;
}

export function useWineMapViewport(width: number, height: number) {
  const [viewport, setViewport] = useState<ViewportTransform>({ scale: 1, x: 0, y: 0 });
  const pointerStart = useRef<PointerStart | null>(null);
  const suppressClick = useRef(false);

  const zoomAt = useCallback((nextScale: number, focusX = width / 2, focusY = height / 2) => {
    setViewport((current) => {
      const scale = clamp(nextScale, minimumScale, maximumScale);
      if (scale === current.scale) return current;
      const ratio = scale / current.scale;
      return {
        scale,
        x: focusX - (focusX - current.x) * ratio,
        y: focusY - (focusY - current.y) * ratio,
      };
    });
  }, [height, width]);

  const reset = useCallback(() => {
    setViewport({ scale: 1, x: 0, y: 0 });
  }, []);

  const onWheel = useCallback((event: ReactWheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const focusX = ((event.clientX - bounds.left) / bounds.width) * width;
    const focusY = ((event.clientY - bounds.top) / bounds.height) * height;
    const factor = event.deltaY < 0 ? 1.18 : 1 / 1.18;
    zoomAt(viewport.scale * factor, focusX, focusY);
  }, [height, viewport.scale, width, zoomAt]);

  const onPointerDown = useCallback((event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.button !== 0) return;
    suppressClick.current = false;
    pointerStart.current = {
      ...viewport,
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      moved: false,
    };
  }, [viewport]);

  const onPointerMove = useCallback((event: ReactPointerEvent<SVGSVGElement>) => {
    const start = pointerStart.current;
    if (!start || start.pointerId !== event.pointerId) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const deltaX = ((event.clientX - start.clientX) / bounds.width) * width;
    const deltaY = ((event.clientY - start.clientY) / bounds.height) * height;
    const moved =
      start.moved
      || Math.hypot(event.clientX - start.clientX, event.clientY - start.clientY) > 6;
    pointerStart.current = { ...start, moved };
    if (!moved) return;
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    suppressClick.current = true;
    setViewport({
      scale: start.scale,
      x: start.x + deltaX,
      y: start.y + deltaY,
    });
  }, [height, width]);

  const finishPointer = useCallback((event: ReactPointerEvent<SVGSVGElement>) => {
    if (pointerStart.current?.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    pointerStart.current = null;
  }, []);

  const onClickCapture = useCallback((event: ReactMouseEvent<SVGSVGElement>) => {
    if (!suppressClick.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClick.current = false;
  }, []);

  return {
    scale: viewport.scale,
    transform: `translate(${viewport.x} ${viewport.y}) scale(${viewport.scale})`,
    x: viewport.x,
    y: viewport.y,
    zoomIn: () => zoomAt(viewport.scale * 1.35),
    zoomOut: () => zoomAt(viewport.scale / 1.35),
    reset,
    svgProps: {
      onClickCapture,
      onPointerCancel: finishPointer,
      onPointerDown,
      onPointerMove,
      onPointerUp: finishPointer,
      onWheel,
    },
  };
}

export function WineMapViewportControls({
  onReset,
  onZoomIn,
  onZoomOut,
  scale,
}: {
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  scale: number;
}) {
  return (
    <div className="wine-map-viewport-controls" aria-label="Map view controls">
      <button aria-label="Zoom in" onClick={onZoomIn} type="button">+</button>
      <button aria-label="Zoom out" disabled={scale <= minimumScale} onClick={onZoomOut} type="button">−</button>
      <button className="wine-map-reset" disabled={scale === 1} onClick={onReset} type="button">Reset</button>
      <output aria-live="polite">{Math.round(scale * 100)}%</output>
    </div>
  );
}
