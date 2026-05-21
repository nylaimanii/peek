"use client";

import { useEffect, useRef } from "react";
import { usePlayground } from "@/store/playground";

export function NeuronInspector() {
  const hovered = usePlayground((s) => s.hoveredNeuron);
  const ref = useRef<HTMLCanvasElement | null>(null);
  const size = 160;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (!hovered) {
      ctx.clearRect(0, 0, size, size);
      return;
    }
    const { grid, res, min, max } = hovered;
    const range = max - min || 1;
    const c0 = { r: 244, g: 174, b: 214 }; // pink (low)
    const c1 = { r: 186, g: 244, b: 215 }; // mint (high)

    const img = ctx.createImageData(res, res);
    for (let i = 0; i < res * res; i++) {
      const norm = (grid[i] - min) / range; // 0..1
      const r = Math.round(c0.r + (c1.r - c0.r) * norm);
      const g = Math.round(c0.g + (c1.g - c0.g) * norm);
      const b = Math.round(c0.b + (c1.b - c0.b) * norm);
      const o = i * 4;
      img.data[o] = r;
      img.data[o + 1] = g;
      img.data[o + 2] = b;
      img.data[o + 3] = 255;
    }
    const off = document.createElement("canvas");
    off.width = res;
    off.height = res;
    const offCtx = off.getContext("2d");
    if (!offCtx) return;
    offCtx.putImageData(img, 0, 0);
    ctx.clearRect(0, 0, size, size);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(off, 0, 0, res, res, 0, 0, size, size);
  }, [hovered]);

  if (!hovered) {
    return (
      <div className="rounded-xl border border-ink-300/15 bg-white/50 p-4 text-center text-xs text-ink-300">
        hover a neuron in the graph to see what region of space it responds to
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-mint-200 bg-white/70 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-xs text-ink-700">{hovered.label}</span>
        <span className="font-mono text-[10px] text-ink-300">
          what this neuron detects
        </span>
      </div>
      <canvas
        ref={ref}
        width={size}
        height={size}
        className="mx-auto rounded-lg"
        style={{ width: size, height: size }}
      />
      <p className="mt-2 text-center font-mono text-[10px] text-ink-300">
        mint = high activation · pink = low
      </p>
    </div>
  );
}
