"use client";

export function LossCurve({
  lossHistory,
  accHistory,
  width = 240,
  height = 120,
}: {
  lossHistory: number[];
  accHistory: number[];
  width?: number;
  height?: number;
}) {
  if (lossHistory.length < 2) {
    return (
      <div
        className="flex items-center justify-center rounded-xl bg-white/70 text-xs text-ink-300"
        style={{ width, height }}
      >
        loss curve appears during training
      </div>
    );
  }

  const n = lossHistory.length;
  const maxLoss = Math.max(...lossHistory, 0.7);

  const lossPath = lossHistory
    .map((l, i) => {
      const x = (i / (n - 1)) * width;
      const y = height - (l / maxLoss) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const accPath = accHistory
    .map((a, i) => {
      const x = (i / (n - 1)) * width;
      const y = height - a * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="rounded-xl bg-white/70">
      {/* loss = pink, accuracy = mint */}
      <path d={lossPath} fill="none" stroke="var(--color-pink-300)" strokeWidth={1.5} />
      <path d={accPath} fill="none" stroke="var(--color-mint-300)" strokeWidth={1.5} />
    </svg>
  );
}
