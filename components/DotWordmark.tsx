"use client";

import { useEffect, useRef } from "react";

/* The wordmark is rasterised onto a coarse grid and redrawn one dot per cell,
   so the letterforms are built out of dots rather than wearing a dot texture.
   Edges land on the grid, which is what makes it read as a bitmap logo. */

const CELL_DIVISOR = 17; // cell size = font size / this, so cap height ≈ 12 cells
const DOT_RATIO = 0.38; // dot radius as a fraction of the cell
const INK_AT = 0.54; // glyph coverage above which a cell gets a dot

type Props = {
  text: string;
  className?: string;
};

export function DotWordmark({ text, className }: Props) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const hostEl = hostRef.current;
    const canvasEl = canvasRef.current;
    if (!hostEl || !canvasEl) return;

    const host: HTMLSpanElement = hostEl;
    const canvas: HTMLCanvasElement = canvasEl;
    const context = canvas.getContext("2d");
    const sampler = document.createElement("canvas");
    const samplerContext = sampler.getContext("2d", { willReadFrequently: true });
    if (!context || !samplerContext) return;

    const ctx: CanvasRenderingContext2D = context;
    const sctx: CanvasRenderingContext2D = samplerContext;

    let frame = 0;

    function fontAt(size: number) {
      return `700 ${size}px Arial, Helvetica, sans-serif`;
    }

    function render() {
      const size = parseFloat(window.getComputedStyle(host).fontSize);
      if (!size) return;

      const cell = Math.max(3, size / CELL_DIVISOR);

      // Measure at the real size, then work in whole cells from there.
      ctx.font = fontAt(size);
      ctx.letterSpacing = "-0.03em";
      const metrics = ctx.measureText(text);
      const ascent = metrics.actualBoundingBoxAscent;
      const descent = metrics.actualBoundingBoxDescent;
      const textWidth = metrics.width;
      if (!textWidth || !ascent) return;

      const cols = Math.ceil(textWidth / cell) + 1;
      const rows = Math.ceil((ascent + descent) / cell) + 1;

      // Draw the word into a canvas that is one pixel per cell — each pixel's
      // alpha is then exactly that cell's ink coverage.
      sampler.width = cols;
      sampler.height = rows;
      sctx.clearRect(0, 0, cols, rows);
      sctx.font = fontAt(size / cell);
      sctx.letterSpacing = "-0.03em";
      sctx.textBaseline = "alphabetic";
      sctx.fillStyle = "#000";
      sctx.fillText(text, 0.5, ascent / cell + 0.5);
      const coverage = sctx.getImageData(0, 0, cols, rows).data;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = cols * cell;
      const height = rows * cell;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = getComputedStyle(host).color;

      const radius = cell * DOT_RATIO;
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          if (coverage[(row * cols + col) * 4 + 3] / 255 < INK_AT) continue;
          ctx.beginPath();
          ctx.arc(col * cell + cell / 2, row * cell + cell / 2, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    function schedule() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(render);
    }

    schedule();
    if (document.fonts?.ready) void document.fonts.ready.then(schedule);

    const observer = new ResizeObserver(schedule);
    observer.observe(host);
    window.addEventListener("resize", schedule);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [text]);

  return (
    <span className={className} ref={hostRef} aria-hidden="true">
      <canvas ref={canvasRef} />
    </span>
  );
}
