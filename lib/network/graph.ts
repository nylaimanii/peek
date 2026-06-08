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
export function layerSizes(config: NetworkConfig, inputCount: number = 2): number[] {
  return [inputCount, ...config.neuronCounts, 1];
}

/**
 * positions neurons in vertical columns, one column per layer,
 * vertically centered. returns react flow nodes.
 */
export function buildNodes(
  config: NetworkConfig,
  inputLabels: string[],
  activations?: number[][] | null,
  ablated?: Set<string> | null
): Node<NeuronData>[] {
  const sizes = layerSizes(config, inputLabels.length);
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

    // collapse high-dim inputs (e.g. mnist 784) to a single placeholder
    const isHighDimInput = layerIdx === 0 && count > 16;
    const renderedCount = isHighDimInput ? 1 : count;
    const colHeight = renderedCount * ROW_GAP;
    const yOffset = (totalHeight - colHeight) / 2;

    for (let i = 0; i < renderedCount; i++) {
      const id = `${layerIdx}-${i}`;
      let label = "";
      if (kind === "input") {
        label = isHighDimInput ? `${count} inputs` : (inputLabels[i] ?? "");
      }
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
        data: {
          kind,
          label,
          activation,
          ...(kind !== "input"
            ? { layerIdx: layerIdx - 1, neuronIdx: i }
            : {}),
          ...(ablated && kind !== "input" && ablated.has(`${layerIdx - 1}-${i}`)
            ? { ablated: true }
            : {}),
        },
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
export function buildEdges(
  config: NetworkConfig,
  inputCount: number,
  weights?: number[][][] | null
): Edge[] {
  const sizes = layerSizes(config, inputCount);
  const edges: Edge[] = [];

  for (let layerIdx = 0; layerIdx < sizes.length - 1; layerIdx++) {
    const fromCount = sizes[layerIdx];
    const toCount = sizes[layerIdx + 1];
    // when the input layer is collapsed (>16), only ONE source node "0-0"
    // exists in the graph — emit a single edge per first-hidden neuron from
    // it, with default styling (per-pixel weight coloring is meaningless
    // when 784 pixels are summarized into one node).
    const isCollapsedInput = layerIdx === 0 && fromCount > 16;

    if (isCollapsedInput) {
      for (let j = 0; j < toCount; j++) {
        edges.push({
          id: `e${layerIdx}-collapsed-${j}`,
          source: `${layerIdx}-0`,
          target: `${layerIdx + 1}-${j}`,
          type: "straight",
          style: {
            stroke: "var(--color-ink-300)",
            strokeWidth: 0.75,
            opacity: 0.4,
          },
        });
      }
      continue;
    }

    for (let i = 0; i < fromCount; i++) {
      for (let j = 0; j < toCount; j++) {
        let stroke = "var(--color-ink-300)";
        let strokeWidth = 0.75;
        let opacity = 0.35;

        if (weights && weights[layerIdx]) {
          const w = weights[layerIdx][i]?.[j];
          if (w !== undefined) {
            const clamped = Math.max(-3, Math.min(3, w));
            const mag = Math.min(1, Math.abs(clamped) / 3);
            stroke =
              clamped >= 0
                ? "var(--color-mint-300)"
                : "var(--color-pink-300)";
            strokeWidth = 0.5 + mag * 3; // 0.5..3.5
            opacity = 0.25 + mag * 0.55; // 0.25..0.8
          }
        }

        edges.push({
          id: `e${layerIdx}-${i}-${j}`,
          source: `${layerIdx}-${i}`,
          target: `${layerIdx + 1}-${j}`,
          type: "straight",
          style: { stroke, strokeWidth, opacity },
        });
      }
    }
  }

  return edges;
}

/**
 * extracts dense-layer weight matrices from a trained model.
 * returns weights[layerIdx] = 2D array [fromNeuron][toNeuron].
 * layerIdx 0 = input→firstHidden, ... last = lastHidden→output.
 */
export function extractWeights(
  model: import("@tensorflow/tfjs").LayersModel
): number[][][] {
  const matrices: number[][][] = [];
  for (const layer of model.layers) {
    const w = layer.getWeights();
    if (w.length === 0) continue;
    // w[0] = kernel (weight matrix), shape [fromDim, toDim]
    const kernel = w[0];
    const arr = kernel.arraySync() as number[][];
    matrices.push(arr);
  }
  return matrices;
}
