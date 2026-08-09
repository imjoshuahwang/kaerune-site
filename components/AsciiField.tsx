"use client";

import { useEffect, useRef } from "react";

/* An ambient field of ASCII characters behind the page. Density comes from a
   slowly drifting noise field and thins out toward the middle, so the corners
   carry texture while the type sits on clean paper. */

const CELL = 15; // character cell in CSS px
const RAMP = " .·:-=+*#"; // sparse to dense
const INK = 0.2; // ceiling on how dark any character gets
const DRIFT = 0.05; // noise units per second
const REDRAW_MS = 110; // the field moves slowly; no need for 60fps

function hash(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function valueNoise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

function fbm(x: number, y: number) {
  return 0.62 * valueNoise(x, y) + 0.38 * valueNoise(x * 2.3 + 11.3, y * 2.3 + 7.7);
}

export function AsciiField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const canvas: HTMLCanvasElement = canvasEl;
    const context = canvas.getContext("2d");
    if (!context) return;

    const ctx: CanvasRenderingContext2D = context;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let frame = 0;
    let lastDraw = -Infinity;
    const started = performance.now();

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${CELL}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      ctx.textBaseline = "alphabetic";
      lastDraw = -Infinity;
    }

    function draw(now: number) {
      const t = still ? 0 : ((now - started) / 1000) * DRIFT;
      const cols = Math.ceil(width / CELL);
      const rows = Math.ceil(height / CELL);
      const halfW = width / 2;
      const halfH = height / 2;

      ctx.clearRect(0, 0, width, height);

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          // Clear the middle of the screen, keep the corners busy.
          const dx = (col * CELL - halfW) / halfW;
          const dy = (row * CELL - halfH) / halfH;
          const radius = Math.min(1, Math.hypot(dx * 0.86, dy));
          const edge = Math.max(0, (radius - 0.22) / 0.78) ** 1.5;

          const density = fbm(col * 0.075 + t, row * 0.11 - t * 0.4) * (0.26 + 0.74 * edge);
          const step = Math.floor(density ** 1.18 * RAMP.length);
          if (step < 1) continue;

          const glyph = RAMP[Math.min(step, RAMP.length - 1)];
          ctx.fillStyle = `rgba(5, 5, 5, ${(INK * (0.35 + 0.65 * density)).toFixed(3)})`;
          ctx.fillText(glyph, col * CELL, row * CELL + CELL * 0.82);
        }
      }
    }

    function tick(now: number) {
      if (now - lastDraw >= REDRAW_MS) {
        lastDraw = now;
        draw(now);
      }
      if (!still) frame = requestAnimationFrame(tick);
    }

    resize();
    frame = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas className="ascii-field" ref={canvasRef} aria-hidden="true" />;
}
