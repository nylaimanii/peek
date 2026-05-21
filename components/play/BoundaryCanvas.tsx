"use client";

import { useEffect, useRef } from "react";

/**
 * draws the prediction grid as a soft pastel field.
 * value 0 (predict class 0) → lavender, value 1 (predict class 1) → mint,
 * 0.5 (boundary) → near white. matches the scatter dot colors.
 */
export function BoundaryCanvas({
  grid,
  res,
  size,
}: {
  grid: Float32Array | null;
  res: number;
  size: number;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!grid) {
      ctx.clearRect(0, 0, size, size);
      return;
    }

    // lavender (class 0) and mint (class 1) endpoints, blended through white
    // lavender-300 ~ #a3afea, mint-300 ~ #baf4d7
    const c0 = { r: 163, g: 175, b: 234 }; // lavender
    const c1 = { r: 186, g: 244, b: 215 }; // mint

    const img = ctx.createImageData(res, res);
    for (let i = 0; i < res * res; i++) {
      const v = grid[i]; // 0..1, P(class 1)
      // blend: v=0 → lavender, v=1 → mint, with a soft white midpoint
      // ease toward white near 0.5 so the boundary reads as light
      const toWhite = 1 - Math.abs(v - 0.5) * 2; // 1 at boundary, 0 at extremes
      const mixWhite = toWhite * 0.55;
      const base =
        v < 0.5
          ? c0
          : c1;
      const r = Math.round(base.r + (255 - base.r) * mixWhite);
      const g = Math.round(base.g + (255 - base.g) * mixWhite);
      const b = Math.round(base.b + (255 - base.b) * mixWhite);
      const o = i * 4;
      img.data[o] = r;
      img.data[o + 1] = g;
      img.data[o + 2] = b;
      img.data[o + 3] = 235; // slightly translucent
    }

    // draw the small grid then scale up smoothly to fill the canvas
    const off = document.createElement("canvas");
    off.width = res;
    off.height = res;
    const offCtx = off.getContext("2d");
    if (!offCtx) return;
    offCtx.putImageData(img, 0, 0);

    ctx.clearRect(0, 0, size, size);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(off, 0, 0, res, res, 0, 0, size, size);
  }, [grid, res, size]);

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      className="absolute inset-0 rounded-xl"
      style={{ width: size, height: size }}
    />
  );
}
