import { Handle, Position } from "reactflow";

export type NeuronData = {
  label?: string;
  kind: "input" | "hidden" | "output";
};

export function NeuronNode({ data }: { data: NeuronData }) {
  const colorByKind: Record<NeuronData["kind"], string> = {
    input: "var(--color-lavender-200)",
    hidden: "var(--color-mint-200)",
    output: "var(--color-pink-200)",
  };

  const borderByKind: Record<NeuronData["kind"], string> = {
    input: "var(--color-lavender-300)",
    hidden: "var(--color-mint-300)",
    output: "var(--color-pink-300)",
  };

  return (
    <div
      className="flex items-center justify-center rounded-xl text-[10px] font-mono text-ink-700 shadow-sm transition"
      style={{
        width: 44,
        height: 44,
        background: colorByKind[data.kind],
        border: `1.5px solid ${borderByKind[data.kind]}`,
      }}
    >
      {data.label ?? ""}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "transparent", border: "none" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "transparent", border: "none" }}
      />
    </div>
  );
}
