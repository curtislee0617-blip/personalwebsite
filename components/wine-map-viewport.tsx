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
    event.currentTarget.setPointerCapture(event.pointerId);
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
    const moved = start.moved || Math.hypot(event.clientX - start.clientX, event.clientY - start.clientY) > 3;
    pointerStart.current = { ...start, moved };
    if (!moved) return;
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
