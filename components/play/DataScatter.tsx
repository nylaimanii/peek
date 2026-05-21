"use client";

import type { DataPoint } from "@/lib/network/datasets";

export function DataScatter({
  data,
  size = 240,
  onSelect,
  selected,
}: {
  data: DataPoint[];
  size?: number;
  onSelect?: (p: { x: number; y: number }) => void;
  selected?: { x: number; y: number } | null;
}) {
  const toScreen = (v: number) => ((v + 1) / 2) * size;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="rounded-xl bg-white/70"
    >
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
      {data.map((p, i) => {
        const isSelected =
          selected && Math.abs(selected.x - p.x) < 1e-9 && Math.abs(selected.y - p.y) < 1e-9;
        return (
          <circle
            key={i}
            cx={toScreen(p.x)}
            cy={toScreen(-p.y)}
            r={isSelected ? 5 : 2.5}
            fill={
              p.label === 0
                ? "var(--color-lavender-300)"
                : "var(--color-mint-300)"
            }
            stroke={isSelected ? "var(--color-ink-900)" : "none"}
            strokeWidth={isSelected ? 1.5 : 0}
            opacity={0.9}
            style={{ cursor: onSelect ? "pointer" : "default" }}
            onClick={() => onSelect?.({ x: p.x, y: p.y })}
          />
        );
      })}
    </svg>
  );
}
