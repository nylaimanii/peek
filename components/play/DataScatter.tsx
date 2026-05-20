"use client";

import type { DataPoint } from "@/lib/network/datasets";

export function DataScatter({
  data,
  size = 240,
}: {
  data: DataPoint[];
  size?: number;
}) {
  // data lives in [-1, 1] x [-1, 1]; map to [0, size]
  const toScreen = (v: number) => ((v + 1) / 2) * size;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="rounded-xl bg-white/70"
    >
      {/* axes */}
      <line
        x1={size / 2}
        y1={0}
        x2={size / 2}
        y2={size}
        stroke="var(--color-ink-300)"
        strokeWidth={0.5}
        opacity={0.4}
      />
      <line
        x1={0}
        y1={size / 2}
        x2={size}
        y2={size / 2}
        stroke="var(--color-ink-300)"
        strokeWidth={0.5}
        opacity={0.4}
      />
      {data.map((p, i) => (
        <circle
          key={i}
          cx={toScreen(p.x)}
          cy={toScreen(-p.y)}
          r={2.5}
          fill={
            p.label === 0
              ? "var(--color-lavender-300)"
              : "var(--color-mint-300)"
          }
          opacity={0.85}
        />
      ))}
    </svg>
  );
}
