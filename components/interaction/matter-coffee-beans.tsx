"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef } from "react";
import type { Body, Mouse } from "matter-js";

const BEAN_COLORS = ["#6e3d25", "#7e482c", "#8d5231", "#5a321f", "#9b603a"];
const INITIAL_BEAN_COUNT = 24;

export type MatterCoffeeBeansProps = {
  className?: string;
};

/** Matter.js rigid-body sandbox with custom-drawn, draggable coffee beans. */
export function MatterCoffeeBeans({ className = "" }: MatterCoffeeBeansProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropBeansRef = useRef<((count?: number) => void) | null>(null);
  const reducedMotion = Boolean(useReducedMotion());

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let disposed = false;
    let animationFrame = 0;
    let mouse: Mouse | null = null;
    let observer: ResizeObserver | null = null;
    let cleanup = () => undefined;

    void import("matter-js").then((Matter) => {
      if (disposed) return;

      const { Bodies, Body, Composite, Engine, Mouse, MouseConstraint } = Matter;
      const engine = Engine.create({ gravity: { scale: 0.0012, x: 0, y: 1 } });
      const beanBodies: Body[] = [];
      const beanColor = new Map<number, string>();
      let walls: Body[] = [];
      let width = 0;
      let height = 0;
      let lastTime = performance.now();

      const resize = () => {
        const bounds = canvas.getBoundingClientRect();
        width = Math.max(280, Math.round(bounds.width));
        height = Math.max(260, Math.round(bounds.height));
        canvas.width = width;
        canvas.height = height;

        Composite.remove(engine.world, walls);
        walls = [
          Bodies.rectangle(width / 2, height + 18, width + 80, 40, { isStatic: true }),
          Bodies.rectangle(-18, height / 2, 40, height + 80, { isStatic: true }),
          Bodies.rectangle(width + 18, height / 2, 40, height + 80, { isStatic: true }),
        ];
        Composite.add(engine.world, walls);

        beanBodies.forEach((body) => {
          Body.setPosition(body, {
            x: Math.min(width - 20, Math.max(20, body.position.x)),
            y: Math.min(height - 28, body.position.y),
          });
        });
      };

      const spawnBeans = (count = 8) => {
        const additions = Array.from({ length: count }, (_, index) => {
          const radius = 12 + (index % 4) * 1.6;
          const bean = Bodies.circle(
            28 + Math.random() * Math.max(40, width - 56),
            -24 - index * 17 - Math.random() * 42,
            radius,
            {
              angle: Math.random() * Math.PI,
              chamfer: { radius: radius * 0.48 },
              density: 0.0014,
              friction: 0.28,
              frictionAir: 0.006,
              label: "coffee-bean",
              restitution: 0.48,
            },
          );
          beanColor.set(bean.id, BEAN_COLORS[(bean.id + index) % BEAN_COLORS.length] ?? BEAN_COLORS[0]);
          beanBodies.push(bean);
          return bean;
        });
        Composite.add(engine.world, additions);
      };

      const drawBean = (body: Body) => {
        const color = beanColor.get(body.id) ?? BEAN_COLORS[0];
        context.save();
        context.translate(body.position.x, body.position.y);
        context.rotate(body.angle);
        context.scale(1.25, 0.78);
        context.beginPath();
        context.arc(0, 0, body.circleRadius ?? 13, 0, Math.PI * 2);
        context.fillStyle = color;
        context.shadowColor = "rgb(35 18 10 / 0.22)";
        context.shadowBlur = 7;
        context.shadowOffsetY = 3;
        context.fill();
        context.shadowColor = "transparent";
        context.lineWidth = 1.45;
        context.strokeStyle = "rgb(255 236 210 / 0.34)";
        context.beginPath();
        context.moveTo(0, -(body.circleRadius ?? 13) * 0.72);
        context.bezierCurveTo(
          -(body.circleRadius ?? 13) * 0.28,
          -(body.circleRadius ?? 13) * 0.22,
          (body.circleRadius ?? 13) * 0.3,
          (body.circleRadius ?? 13) * 0.22,
          0,
          (body.circleRadius ?? 13) * 0.72,
        );
        context.stroke();
        context.restore();
      };

      const draw = () => {
        context.clearRect(0, 0, width, height);
        const gradient = context.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, "#eee9dc");
        gradient.addColorStop(1, "#d8c8ae");
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);

        context.strokeStyle = "rgb(67 54 43 / 0.09)";
        context.lineWidth = 1;
        for (let y = 28; y < height; y += 28) {
          context.beginPath();
          context.moveTo(0, y + 0.5);
          context.lineTo(width, y + 0.5);
          context.stroke();
        }

        beanBodies.forEach(drawBean);
      };

      const tick = (time: number) => {
        const delta = Math.min(33.3, time - lastTime || 16.67);
        lastTime = time;
        Engine.update(engine, delta);
        draw();
        animationFrame = requestAnimationFrame(tick);
      };

      resize();
      spawnBeans(INITIAL_BEAN_COUNT);
      if (reducedMotion) {
        beanBodies.forEach((body, index) => {
          Body.setPosition(body, {
            x: 24 + (index % 8) * Math.max(28, (width - 48) / 7),
            y: height - 24 - Math.floor(index / 8) * 28,
          });
          Body.setStatic(body, true);
        });
        draw();
      } else {
        mouse = Mouse.create(canvas);
        const mouseConstraint = MouseConstraint.create(engine, {
          constraint: { damping: 0.16, stiffness: 0.18, render: { visible: false } },
          mouse,
        });
        Composite.add(engine.world, mouseConstraint);
        animationFrame = requestAnimationFrame(tick);
      }

      observer = new ResizeObserver(() => {
        resize();
        if (reducedMotion) draw();
      });
      observer.observe(canvas);
      dropBeansRef.current = reducedMotion ? null : spawnBeans;

      cleanup = () => {
        cancelAnimationFrame(animationFrame);
        observer?.disconnect();
        if (mouse) Mouse.clearSourceEvents(mouse);
        dropBeansRef.current = null;
        Composite.clear(engine.world, false, true);
        Engine.clear(engine);
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [reducedMotion]);

  const dropBeans = useCallback(() => dropBeansRef.current?.(8), []);

  return (
    <figure className={`matter-coffee-beans ${className}`.trim()}>
      <div className="matter-coffee-beans-stage">
        <canvas
          aria-label="Coffee beans falling, colliding and responding to pointer dragging"
          ref={canvasRef}
          role="img"
        />
        <div className="matter-coffee-beans-label" aria-hidden="true">
          <span>Matter.js rigid-body sandbox</span>
          <strong>gravity · collisions · constraints</strong>
        </div>
      </div>
      <figcaption>
        <div>
          <strong>A physics engine, not a pre-rendered animation.</strong>
          <span>Each bean is a rigid body. Drag one to disturb the pile, or add another batch and watch the collisions resolve.</span>
        </div>
        <button disabled={reducedMotion} onClick={dropBeans} type="button">
          {reducedMotion ? "Motion reduced" : "Drop 8 beans"}
        </button>
      </figcaption>
    </figure>
  );
}
