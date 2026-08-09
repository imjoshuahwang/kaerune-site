"use client";

import { useEffect, useRef } from "react";

/* An ASCII field behind the page. Two travelling wave trains cross each other
   to make the moving bands, with noise on top so the pattern never repeats
   cleanly. Over that, runs of "1" are written into the grid and then struck
   out — the page saying its own tagline to itself. */

const CELL = 16; // character cell in CSS px
const RAMP = " .·:-=+*#"; // sparse to dense
const INK = 0.22; // ceiling on the ambient field
const FRAME_MS = 33; // ~30fps; the waves need to actually move

const MARK_INK = 0.62;
const MARK_IN = 150; // fade the "1" in
const MARK_STRIKE_AT = 620; // then start crossing it out
const MARK_STRIKE_MS = 230; // stroke draws left to right
const MARK_HOLD = 360;
const MARK_OUT = 450;
const MARK_LIFE = MARK_STRIKE_AT + MARK_STRIKE_MS + MARK_HOLD + MARK_OUT;
const SPAWN_MIN = 260;
const SPAWN_MAX = 720;

type Mark = { col: number; row: number; born: number };

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
  return (
    hash(xi, yi) * (1 - u) * (1 - v) +
    hash(xi + 1, yi) * u * (1 - v) +
    hash(xi, yi + 1) * (1 - u) * v +
    hash(xi + 1, yi + 1) * u * v
  );
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
    let cols = 0;
    let rows = 0;
    let frame = 0;
    let lastDraw = -Infinity;
    let nextSpawn = 0;
    const marks: Mark[] = [];
    const started = performance.now();

    // Grouping glyphs by opacity keeps fillStyle changes down to a handful per
    // frame instead of one per character.
    const BUCKETS = 7;
    const buckets: { glyph: string; x: number; y: number }[][] = Array.from(
      { length: BUCKETS },
      () => []
    );

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      cols = Math.ceil(width / CELL);
      rows = Math.ceil(height / CELL);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.textBaseline = "alphabetic";
      ctx.lineCap = "round";
      lastDraw = -Infinity;
    }

    /* Keep the middle of the viewport quiet so the type stays readable. */
    function centreFalloff(col: number, row: number, floor: number) {
      const dx = (col * CELL - width / 2) / (width / 2);
      const dy = (row * CELL - height / 2) / (height / 2);
      const radius = Math.min(1, Math.hypot(dx * 0.86, dy));
      const edge = Math.max(0, (radius - 0.2) / 0.8) ** 1.4;
      return floor + (1 - floor) * edge;
    }

    function spawnRun(now: number) {
      const count = 2 + Math.floor(Math.random() * 4);
      const col = Math.floor(Math.random() * Math.max(1, cols - count * 2 - 1));
      const row = Math.floor(Math.random() * rows);
      for (let i = 0; i < count; i += 1) {
        marks.push({ col: col + i * 2, row, born: now + i * 120 });
      }
    }

    function drawField(t: number) {
      for (const bucket of buckets) bucket.length = 0;

      for (let row = 0; row < rows; row += 1) {
        const wy = row * 0.22;
        for (let col = 0; col < cols; col += 1) {
          const wx = col * 0.16;
          // Two wave trains, each bent by the other axis, so they interfere
          // into moving lattices rather than plain stripes.
          const a = Math.sin(wx + t * 0.9 + Math.sin(wy * 0.6 + t * 0.35) * 1.6);
          const b = Math.sin(wy * 0.8 - t * 0.6 + Math.cos(wx * 0.45 - t * 0.25) * 1.3);
          const n = valueNoise(col * 0.07 + t * 0.06, row * 0.1 - t * 0.04);

          let v = 0.5 + 0.3 * a + 0.24 * b;
          v = Math.min(1, Math.max(0, v * 0.78 + n * 0.34));
          v *= centreFalloff(col, row, 0.22);

          const step = Math.floor(v ** 1.15 * RAMP.length);
          if (step < 1) continue;

          const bucket = Math.min(BUCKETS - 1, Math.floor(v * BUCKETS));
          buckets[bucket].push({
            glyph: RAMP[Math.min(step, RAMP.length - 1)],
            x: col * CELL,
            y: row * CELL + CELL * 0.82
          });
        }
      }

      ctx.font = `${CELL}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      for (let i = 0; i < BUCKETS; i += 1) {
        const bucket = buckets[i];
        if (!bucket.length) continue;
        const alpha = INK * (0.34 + (0.66 * (i + 0.5)) / BUCKETS);
        ctx.fillStyle = `rgba(5, 5, 5, ${alpha.toFixed(3)})`;
        for (const item of bucket) ctx.fillText(item.glyph, item.x, item.y);
      }
    }

    function drawMarks(now: number) {
      ctx.font = `${CELL * 1.25}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;

      for (let i = marks.length - 1; i >= 0; i -= 1) {
        const mark = marks[i];
        const age = now - mark.born;
        if (age < 0) continue;
        if (age > MARK_LIFE) {
          marks.splice(i, 1);
          continue;
        }

        let alpha = 1;
        if (age < MARK_IN) alpha = age / MARK_IN;
        const fadeFrom = MARK_LIFE - MARK_OUT;
        if (age > fadeFrom) alpha = 1 - (age - fadeFrom) / MARK_OUT;
        alpha *= MARK_INK * centreFalloff(mark.col, mark.row, 0.34);
        if (alpha <= 0.01) continue;

        const x = mark.col * CELL;
        const baseline = mark.row * CELL + CELL * 0.82;

        ctx.fillStyle = `rgba(5, 5, 5, ${alpha.toFixed(3)})`;
        ctx.fillText("1", x, baseline);

        if (age > MARK_STRIKE_AT) {
          const grown = Math.min(1, (age - MARK_STRIKE_AT) / MARK_STRIKE_MS);
          const x0 = x - CELL * 0.14;
          const y0 = baseline - CELL * 0.18;
          const x1 = x + CELL * 0.9;
          const y1 = baseline - CELL * 0.52;
          ctx.strokeStyle = `rgba(5, 5, 5, ${alpha.toFixed(3)})`;
          ctx.lineWidth = Math.max(1.2, CELL * 0.1);
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x0 + (x1 - x0) * grown, y0 + (y1 - y0) * grown);
          ctx.stroke();
        }
      }
    }

    function tick(now: number) {
      if (now - lastDraw >= FRAME_MS) {
        lastDraw = now;
        ctx.clearRect(0, 0, width, height);
        drawField((now - started) / 1000);
        if (now >= nextSpawn) {
          spawnRun(now);
          nextSpawn = now + SPAWN_MIN + Math.random() * (SPAWN_MAX - SPAWN_MIN);
        }
        drawMarks(now);
      }
      frame = requestAnimationFrame(tick);
    }

    resize();
    if (still) {
      drawField(0);
    } else {
      frame = requestAnimationFrame(tick);
    }
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas className="ascii-field" ref={canvasRef} aria-hidden="true" />;
}
