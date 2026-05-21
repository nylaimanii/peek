import type { Node, Edge } from "reactflow";
import type { NetworkConfig } from "@/lib/network/model";
import type { NeuronData } from "@/components/play/NeuronNode";

const COL_GAP = 160;
const ROW_GAP = 64;
const NODE_SIZE = 44;

/**
 * builds the layer structure: [inputCount, ...hiddenCounts, outputCount]
 * input is always 2 (x, y), output is always 1 (binary prob).
 */
export function layerSizes(config: NetworkConfig): number[] {
  const hidden = Array.from(
    { length: config.hiddenLayers },
    () => config.neuronsPerLayer
  );
  return [2, ...hidden, 1];
}

/**
 * positions neurons in vertical columns, one column per layer,
 * vertically centered. returns react flow nodes.
 */
export function buildNodes(
  config: NetworkConfig,
  activations?: number[][] | null
): Node<NeuronData>[] {
  const sizes = layerSizes(config);
  const maxCount = Math.max(...sizes);
  const totalHeight = maxCount * ROW_GAP;
  const nodes: Node<NeuronData>[] = [];

  sizes.forEach((count, layerIdx) => {
    const kind: NeuronData["kind"] =
      layerIdx === 0
        ? "input"
        : layerIdx === sizes.length - 1
        ? "output"
        : "hidden";

    // vertically center this column
    const colHeight = count * ROW_GAP;
    const yOffset = (totalHeight - colHeight) / 2;

    for (let i = 0; i < count; i++) {
      const id = `${layerIdx}-${i}`;
      let label = "";
      if (kind === "input") label = i === 0 ? "x" : "y";
      if (kind === "output") label = "ŷ";

      let activation: number | undefined = undefined;
      if (activations && kind !== "input") {
        // graph layerIdx L (1-based for hidden) maps to activations[L-1]
        const actLayer = activations[layerIdx - 1];
        if (actLayer && actLayer[i] !== undefined) {
          activation = actLayer[i];
        }
      }

      nodes.push({
        id,
        type: "neuron",
        position: {
          x: layerIdx * COL_GAP,
          y: yOffset + i * ROW_GAP,
        },
        data: { kind, label, activation },
        draggable: false,
        connectable: false,
        selectable: false,
      });
    }
  });

  return nodes;
}

/**
 * fully connects each layer to the next (dense). returns react flow edges.
 */
export function buildEdges(config: NetworkConfig): Edge[] {
  const sizes = layerSizes(config);
  const edges: Edge[] = [];

  for (let layerIdx = 0; layerIdx < sizes.length - 1; layerIdx++) {
    const fromCount = sizes[layerIdx];
    const toCount = sizes[layerIdx + 1];
    for (let i = 0; i < fromCount; i++) {
      for (let j = 0; j < toCount; j++) {
        edges.push({
          id: `e${layerIdx}-${i}-${j}`,
          source: `${layerIdx}-${i}`,
          target: `${layerIdx + 1}-${j}`,
          type: "straight",
          style: {
            stroke: "var(--color-ink-300)",
            strokeWidth: 0.75,
            opacity: 0.35,
          },
        });
      }
    }
  }

  return edges;
}
