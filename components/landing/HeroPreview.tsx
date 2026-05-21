"use client";

/**
 * a decorative, animated mockup of the peek tool for the landing hero.
 * NOT a real network — pure CSS/SVG — but styled to match the actual
 * /play look (pastel neurons, soft boundary field, faint edges) so it
 * reads as an authentic preview.
 */
export function HeroPreview() {
  // layer layout: 2 inputs, 4 hidden, 4 hidden, 1 output
  const layers = [2, 4, 4, 1];
  const colGap = 92;
  const rowGap = 46;
  const nodeR = 13;
  const width = (layers.length - 1) * colGap + 80;
  const maxNodes = Math.max(...layers);
  const height = maxNodes * rowGap + 40;

  // compute node positions
  const nodes: { x: number; y: number; layer: number; idx: number; kind: string }[] = [];
  layers.forEach((count, layer) => {
    const colH = count * rowGap;
    const yOff = (height - colH) / 2 + rowGap / 2;
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: 40 + layer * colGap,
        y: yOff + i * rowGap,
        layer,
        idx: i,
        kind: layer === 0 ? "input" : layer === layers.length - 1 ? "output" : "hidden",
      });
    }
  });

  // edges: connect each layer to the next
  const edges: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];
  for (let l = 0; l < layers.length - 1; l++) {
    const from = nodes.filter((n) => n.layer === l);
    const to = nodes.filter((n) => n.layer === l + 1);
    from.forEach((a) =>
      to.forEach((b) => {
        edges.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, key: `${a.layer}-${a.idx}-${b.idx}` });
      })
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      {/* the card frame — mimics peek's /play network panel */}
      <div className="relative overflow-hidden rounded-2xl border border-ink-300/15 bg-white/70 shadow-[0_8px_40px_-12px_rgba(45,45,45,0.15)] backdrop-blur">
        {/* panel header bar */}
        <div className="flex items-center justify-between border-b border-ink-300/10 px-4 py-2.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-400">
            network
          </span>
          <span className="flex items-center gap-2 font-mono text-[10px] text-ink-300">
            <span className="flex items-center gap-1">
              <span className="inline-block h-0.5 w-3 bg-mint-300" />+
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-0.5 w-3 bg-pink-300" />−
            </span>
          </span>
        </div>

        {/* soft boundary field behind the graph */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 top-10 opacity-50"
          style={{
            background:
              "radial-gradient(ellipse 40% 55% at 65% 50%, var(--color-mint-200) 0%, transparent 60%), radial-gradient(ellipse 35% 50% at 30% 45%, var(--color-lavender-200) 0%, transparent 55%)",
          }}
        />

        {/* the network svg */}
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="relative w-full"
          style={{ maxHeight: 300 }}
        >
          {/* edges */}
          {edges.map((e, i) => (
            <line
              key={e.key}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              stroke={i % 3 === 0 ? "var(--color-mint-300)" : i % 3 === 1 ? "var(--color-pink-300)" : "var(--color-ink-300)"}
              strokeWidth={i % 4 === 0 ? 1.6 : 0.6}
              opacity={i % 4 === 0 ? 0.5 : 0.2}
            />
          ))}
          {/* neurons */}
          {nodes.map((n, i) => {
            const fill =
              n.kind === "input"
                ? "var(--color-lavender-200)"
                : n.kind === "output"
                ? "var(--color-pink-200)"
                : "var(--color-mint-200)";
            const stroke =
              n.kind === "input"
                ? "var(--color-lavender-300)"
                : n.kind === "output"
                ? "var(--color-pink-300)"
                : "var(--color-mint-300)";
            return (
              <circle
                key={`${n.layer}-${n.idx}`}
                cx={n.x}
                cy={n.y}
                r={nodeR}
                fill={fill}
                stroke={stroke}
                strokeWidth={1.5}
                className="peek-neuron"
                style={{
                  animationDelay: `${(n.layer * 0.4 + n.idx * 0.18).toFixed(2)}s`,
                  transformOrigin: `${n.x}px ${n.y}px`,
                }}
                rx={4}
              />
            );
          })}
        </svg>
      </div>

      {/* pulse animation — neurons softly breathe to mimic activation */}
      <style>{`
        @keyframes peekPulse {
          0%, 100% { opacity: 0.55; transform: scale(0.92); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        .peek-neuron {
          animation: peekPulse 3.2s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .peek-neuron { animation: none; opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}
