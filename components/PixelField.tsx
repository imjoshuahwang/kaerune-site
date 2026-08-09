"use client";

import { useEffect, useRef } from "react";

/* Dragging the cursor stamps dots into a grid behind the page; each dot fades
   out on its own clock, so the paper looks like it is being printed on and
   then settling back to white. */

const CELL = 13; // grid pitch in CSS px
const BRUSH = 1.9; // brush radius in cells
const LIFE = 850; // ms a dot takes to fade out
const DOT_RATIO = 0.28;
const INK = 0.2; // peak dot opacity
const MAX_CELLS = 5000;

/* Deterministic per-cell noise so the brush edge dithers instead of drawing a
   clean disc, and so a cell does not flicker between frames. */
function noise(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

export function PixelField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas: HTMLCanvasElement = canvasEl;
    const context = canvas.getContext("2d");
    if (!context) return;

    const ctx: CanvasRenderingContext2D = context;

    const cells = new Map<string, { x: number; y: number; born: number }>();
    let frame = 0;
    let running = false;
    let last = { x: 0, y: 0, set: false };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function stamp(px: number, py: number) {
      const now = performance.now();
      const cx = Math.floor(px / CELL);
      const cy = Math.floor(py / CELL);
      const reach = Math.ceil(BRUSH);

      for (let dx = -reach; dx <= reach; dx += 1) {
        for (let dy = -reach; dy <= reach; dy += 1) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > BRUSH) continue;
          const gx = cx + dx;
          const gy = cy + dy;
          // Thin the brush out toward its edge.
          if (noise(gx, gy) < dist / BRUSH) continue;
          cells.set(`${gx},${gy}`, { x: gx, y: gy, born: now + dist * 26 });
        }
      }

      if (cells.size > MAX_CELLS) {
        const excess = cells.size - MAX_CELLS;
        let removed = 0;
        for (const key of cells.keys()) {
          cells.delete(key);
          removed += 1;
          if (removed >= excess) break;
        }
      }
    }

    function tick() {
      const now = performance.now();
      const width = window.innerWidth;
      const height = window.innerHeight;
      ctx.clearRect(0, 0, width, height);

      for (const [key, cell] of cells) {
        const age = now - cell.born;
        if (age < 0) continue;
        if (age >= LIFE) {
          cells.delete(key);
          continue;
        }
        const life = 1 - age / LIFE;
        ctx.fillStyle = `rgba(5, 5, 5, ${(life * INK).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(
          cell.x * CELL + CELL / 2,
          cell.y * CELL + CELL / 2,
          CELL * DOT_RATIO,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      if (cells.size === 0) {
        running = false;
        return;
      }
      frame = requestAnimationFrame(tick);
    }

    function wake() {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(tick);
    }

    function onMove(event: PointerEvent) {
      const x = event.clientX;
      const y = event.clientY;

      // Interpolate between samples so fast drags leave a continuous trail.
      if (last.set) {
        const steps = Math.min(24, Math.ceil(Math.hypot(x - last.x, y - last.y) / CELL));
        for (let i = 1; i < steps; i += 1) {
          stamp(last.x + ((x - last.x) * i) / steps, last.y + ((y - last.y) * i) / steps);
        }
      }
      last = { x, y, set: true };
      stamp(x, y);
      wake();
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas className="pixel-field" ref={canvasRef} aria-hidden="true" />;
}
