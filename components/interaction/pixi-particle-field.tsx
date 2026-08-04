"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

const DEFAULT_PIXI_PALETTE = [0x466f53, 0xc36a3f, 0xd4bd63] as const;

export type PixiParticleFieldProps = {
  ariaLabel: string;
  className?: string;
  count?: number;
  palette?: readonly number[];
};

type Particle = {
  graphic: import("pixi.js").Graphics;
  phase: number;
  speed: number;
};

/** GPU-backed ambient particles for dense decorative or explanatory scenes. */
export function PixiParticleField({
  ariaLabel,
  className = "",
  count = 80,
  palette = DEFAULT_PIXI_PALETTE,
}: PixiParticleFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = Boolean(useReducedMotion());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let destroy = () => undefined;

    void import("pixi.js").then(async ({ Application, Graphics }) => {
      if (disposed) return;

      const app = new Application();
      await app.init({
        antialias: true,
        autoDensity: true,
        backgroundAlpha: 0,
        powerPreference: "high-performance",
        resizeTo: container,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
      });
      if (disposed) {
        app.destroy({ removeView: true }, { children: true });
        return;
      }

      container.append(app.canvas);
      const particles: Particle[] = Array.from({ length: Math.max(1, count) }, (_, index) => {
        const radius = 1.5 + (index % 5) * 0.55;
        const graphic = new Graphics()
          .circle(0, 0, radius)
          .fill({ alpha: 0.34 + (index % 4) * 0.1, color: palette[index % palette.length] ?? 0x466f53 });
        graphic.x = ((index * 73) % 101) / 100 * app.screen.width;
        graphic.y = ((index * 47) % 97) / 96 * app.screen.height;
        app.stage.addChild(graphic);
        return { graphic, phase: index * 0.71, speed: 0.18 + (index % 7) * 0.035 };
      });

      const update = (ticker: import("pixi.js").Ticker) => {
        particles.forEach((particle, index) => {
          particle.phase += ticker.deltaTime * particle.speed * 0.018;
          particle.graphic.x += Math.sin(particle.phase + index) * 0.08 * ticker.deltaTime;
          particle.graphic.y -= particle.speed * ticker.deltaTime;
          if (particle.graphic.y < -8) particle.graphic.y = app.screen.height + 8;
        });
      };

      if (reducedMotion) app.ticker.stop();
      else app.ticker.add(update);

      destroy = () => {
        app.ticker.remove(update);
        app.destroy({ removeView: true }, { children: true });
      };
    });

    return () => {
      disposed = true;
      destroy();
    };
  }, [count, palette, reducedMotion]);

  return (
    <div
      aria-label={ariaLabel}
      className={`interaction-pixi ${className}`.trim()}
      ref={containerRef}
      role="img"
    />
  );
}
