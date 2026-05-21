import { Handle, Position } from "reactflow";

export type NeuronData = {
  label?: string;
  kind: "input" | "hidden" | "output";
  activation?: number;
  /** dense-layer index (0 = first hidden); undefined for input */
  layerIdx?: number;
  /** index within the layer */
  neuronIdx?: number;
};

/**
 * maps an activation value to a pastel fill.
 * positive activation → mint (cool), negative → peach/pink (warm),
 * magnitude → opacity. tanh/sigmoid roughly [-1,1]; relu can exceed,
 * so we clamp the visual at ±2.
 */
function activationFill(activation: number): { bg: string; border: string } {
  const clamped = Math.max(-2, Math.min(2, activation));
  const mag = Math.min(1, Math.abs(clamped) / 2); // 0..1
  if (clamped >= 0) {
    // mint, more opaque as it gets stronger
    return {
      bg: `color-mix(in srgb, var(--color-mint-300) ${20 + mag * 80}%, white)`,
      border: "var(--color-mint-300)",
    };
  }
  return {
    bg: `color-mix(in srgb, var(--color-pink-300) ${20 + mag * 80}%, white)`,
    border: "var(--color-pink-300)",
  };
}

export function NeuronNode({ data }: { data: NeuronData }) {
  const staticColorByKind: Record<NeuronData["kind"], string> = {
    input: "var(--color-lavender-200)",
    hidden: "var(--color-mint-200)",
    output: "var(--color-pink-200)",
  };
  const staticBorderByKind: Record<NeuronData["kind"], string> = {
    input: "var(--color-lavender-300)",
    hidden: "var(--color-mint-300)",
    output: "var(--color-pink-300)",
  };

  // if we have an activation (post-training, point selected), color by it.
  // inputs never have activation — they stay lavender.
  const hasActivation =
    data.activation !== undefined && data.kind !== "input";

  const { bg, border } = hasActivation
    ? activationFill(data.activation as number)
    : { bg: staticColorByKind[data.kind], border: staticBorderByKind[data.kind] };

  return (
    <div
      className="flex items-center justify-center rounded-xl text-[10px] font-mono text-ink-700 shadow-sm transition"
      style={{
        width: 44,
        height: 44,
        background: bg,
        border: `1.5px solid ${border}`,
      }}
      title={
        hasActivation ? `activation: ${(data.activation as number).toFixed(3)}` : undefined
      }
    >
      {data.label ?? ""}
      <Handle type="target" position={Position.Left} style={{ background: "transparent", border: "none" }} />
      <Handle type="source" position={Position.Right} style={{ background: "transparent", border: "none" }} />
    </div>
  );
}
