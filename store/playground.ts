import { create } from "zustand";
import type { DatasetName, DataPoint } from "@/lib/network/datasets";
import type { NetworkConfig, ActivationName } from "@/lib/network/model";
import { DEFAULT_FEATURES } from "@/lib/network/features";

export type TrainingStatus = "idle" | "training" | "done";

// safely disposes a live tf model + activation readers. used by any
// action that invalidates the trained model (dataset/feature/arch/
// activation change). guards against double-dispose.
function disposeLiveModel(s: {
  trainedModel: import("@tensorflow/tfjs").LayersModel | null;
  activationReaders: import("@tensorflow/tfjs").LayersModel[] | null;
  saeModel?: import("@/lib/network/sae").SaeModel | null;
}) {
  try {
    s.trainedModel?.dispose();
  } catch {
    /* already disposed */
  }
  try {
    s.activationReaders?.forEach((r) => {
      try {
        r.dispose();
      } catch {
        /* already disposed */
      }
    });
  } catch {
    /* ignore */
  }
  try {
    s.saeModel?.dispose();
  } catch {
    /* already disposed */
  }
}

interface PlaygroundState {
  // dataset
  dataset: DatasetName;
  noise: number;
  nPoints: number;
  data: DataPoint[];

  // network config
  config: NetworkConfig;
  epochs: number;

  // training state
  status: TrainingStatus;
  currentEpoch: number;
  loss: number;
  accuracy: number;
  lossHistory: number[];
  accHistory: number[];

  // trained model + interpretability
  trainedModel: import("@tensorflow/tfjs").LayersModel | null;
  activationReaders: import("@tensorflow/tfjs").LayersModel[] | null;
  selectedPoint: { x: number; y: number } | null;
  activations: number[][] | null; // [layer][neuron]

  // feature engineering
  activeFeatures: import("@/lib/network/features").FeatureKey[];
  toggleFeature: (key: import("@/lib/network/features").FeatureKey) => void;

  // decision boundary
  predictionGrid: Float32Array | null;
  gridRes: number;
  setPredictionGrid: (grid: Float32Array | null) => void;

  // learned weights (for edge coloring)
  weights: number[][][] | null;
  setWeights: (w: number[][][] | null) => void;

  // circuit ablation
  ablatedNeurons: Set<string>;
  toggleAblateNeuron: (key: string) => void;
  clearAblations: () => void;

  // sparse autoencoder (mnist-only)
  saeModel: import("@/lib/network/sae").SaeModel | null;
  saeStatus: "idle" | "training" | "done";
  saeFeatures: import("@/lib/network/sae").SaeFeature[] | null;
  saeTrainingLoss: number[];
  setSaeModel: (m: import("@/lib/network/sae").SaeModel | null) => void;
  setSaeStatus: (s: "idle" | "training" | "done") => void;
  setSaeFeatures: (f: import("@/lib/network/sae").SaeFeature[] | null) => void;
  pushSaeLoss: (loss: number) => void;
  resetSae: () => void;

  // mnist support
  mnistExamples: import("@/lib/network/mnist").MnistExample[] | null;
  setMnistExamples: (e: import("@/lib/network/mnist").MnistExample[] | null) => void;
  selectedMnistIdx: number | null;
  setSelectedMnistIdx: (i: number | null) => void;

  // hovered neuron (for per-neuron decision boundary inspector)
  hoveredNeuron: {
    layerIdx: number;
    neuronIdx: number;
    label: string;
    grid: Float32Array;
    min: number;
    max: number;
    res: number;
  } | null;
  setHoveredNeuron: (n: PlaygroundState["hoveredNeuron"]) => void;

  // actions
  setDataset: (d: DatasetName) => void;
  setNoise: (n: number) => void;
  addLayer: () => void;
  removeLayer: () => void;
  incNeuron: (layerIdx: number) => void;
  decNeuron: (layerIdx: number) => void;
  setActivation: (a: ActivationName) => void;
  setLearningRate: (lr: number) => void;
  setEpochs: (e: number) => void;
  setData: (d: DataPoint[]) => void;

  setTrainedModel: (
    model: import("@tensorflow/tfjs").LayersModel | null,
    readers: import("@tensorflow/tfjs").LayersModel[] | null
  ) => void;
  setSelectedPoint: (p: { x: number; y: number } | null) => void;
  setActivations: (a: number[][] | null) => void;

  startTraining: () => void;
  pushTrainingStep: (epoch: number, loss: number, acc: number) => void;
  finishTraining: () => void;
  resetTraining: () => void;
}

export const usePlayground = create<PlaygroundState>((set) => ({
  dataset: "circles",
  noise: 0.1,
  nPoints: 200,
  data: [],

  config: {
    neuronCounts: [6, 6],
    activation: "tanh",
    learningRate: 0.03,
  },
  epochs: 200,

  status: "idle",
  currentEpoch: 0,
  loss: 0,
  accuracy: 0,
  lossHistory: [],
  accHistory: [],

  trainedModel: null,
  activationReaders: null,
  selectedPoint: null,
  activations: null,

  activeFeatures: DEFAULT_FEATURES,

  predictionGrid: null,
  gridRes: 50,
  weights: null,
  hoveredNeuron: null,
  mnistExamples: null,
  selectedMnistIdx: null,
  ablatedNeurons: new Set<string>(),
  saeModel: null,
  saeStatus: "idle",
  saeFeatures: null,
  saeTrainingLoss: [],

  setDataset: (d) =>
    set((s) => {
      disposeLiveModel(s);
      const isMnist = d === "mnist";
      const wasMnist = s.dataset === "mnist";
      let nextConfig = s.config;
      if (isMnist && !wasMnist) {
        // entering mnist: switch to a wider network for richer features
        // (downstream SAE needs polysemantic neurons to decompose)
        nextConfig = { ...s.config, neuronCounts: [32, 16] };
      } else if (!isMnist && wasMnist) {
        // leaving mnist: restore a 2D-friendly default
        nextConfig = { ...s.config, neuronCounts: [6, 6] };
      }
      return {
        dataset: d,
        config: nextConfig,
        status: "idle",
        selectedPoint: null,
        activations: null,
        trainedModel: null,
        activationReaders: null,
        predictionGrid: null,
        weights: null,
        hoveredNeuron: null,
        ablatedNeurons: new Set<string>(),
        mnistExamples: null,
        selectedMnistIdx: null,
        saeModel: null,
        saeStatus: "idle" as const,
        saeFeatures: null,
        saeTrainingLoss: [],
      };
    }),
  setNoise: (n) => set({ noise: n }),
  addLayer: () =>
    set((s) => {
      if (s.config.neuronCounts.length >= 6) return s;
      disposeLiveModel(s);
      return {
        config: { ...s.config, neuronCounts: [...s.config.neuronCounts, 4] },
        status: "idle",
        selectedPoint: null,
        activations: null,
        trainedModel: null,
        activationReaders: null,
        predictionGrid: null,
        weights: null,
        hoveredNeuron: null,
        mnistExamples: null,
        selectedMnistIdx: null,
        ablatedNeurons: new Set<string>(),
        saeModel: null,
        saeStatus: "idle" as const,
        saeFeatures: null,
        saeTrainingLoss: [],
      };
    }),
  removeLayer: () =>
    set((s) => {
      if (s.config.neuronCounts.length <= 1) return s;
      disposeLiveModel(s);
      return {
        config: { ...s.config, neuronCounts: s.config.neuronCounts.slice(0, -1) },
        status: "idle",
        selectedPoint: null,
        activations: null,
        trainedModel: null,
        activationReaders: null,
        predictionGrid: null,
        weights: null,
        hoveredNeuron: null,
        mnistExamples: null,
        selectedMnistIdx: null,
        ablatedNeurons: new Set<string>(),
        saeModel: null,
        saeStatus: "idle" as const,
        saeFeatures: null,
        saeTrainingLoss: [],
      };
    }),
  incNeuron: (layerIdx) =>
    set((s) => {
      const next = [...s.config.neuronCounts];
      if (next[layerIdx] >= 64) return s;
      next[layerIdx] += 1;
      disposeLiveModel(s);
      return {
        config: { ...s.config, neuronCounts: next },
        status: "idle",
        selectedPoint: null,
        activations: null,
        trainedModel: null,
        activationReaders: null,
        predictionGrid: null,
        weights: null,
        hoveredNeuron: null,
        mnistExamples: null,
        selectedMnistIdx: null,
        ablatedNeurons: new Set<string>(),
        saeModel: null,
        saeStatus: "idle" as const,
        saeFeatures: null,
        saeTrainingLoss: [],
      };
    }),
  decNeuron: (layerIdx) =>
    set((s) => {
      const next = [...s.config.neuronCounts];
      if (next[layerIdx] <= 1) return s;
      next[layerIdx] -= 1;
      disposeLiveModel(s);
      return {
        config: { ...s.config, neuronCounts: next },
        status: "idle",
        selectedPoint: null,
        activations: null,
        trainedModel: null,
        activationReaders: null,
        predictionGrid: null,
        weights: null,
        hoveredNeuron: null,
        mnistExamples: null,
        selectedMnistIdx: null,
        ablatedNeurons: new Set<string>(),
        saeModel: null,
        saeStatus: "idle" as const,
        saeFeatures: null,
        saeTrainingLoss: [],
      };
    }),
  setActivation: (a) =>
    set((s) => {
      disposeLiveModel(s);
      return {
        config: { ...s.config, activation: a },
        status: "idle",
        selectedPoint: null,
        activations: null,
        trainedModel: null,
        activationReaders: null,
        predictionGrid: null,
        weights: null,
        hoveredNeuron: null,
        mnistExamples: null,
        selectedMnistIdx: null,
        ablatedNeurons: new Set<string>(),
        saeModel: null,
        saeStatus: "idle" as const,
        saeFeatures: null,
        saeTrainingLoss: [],
      };
    }),
  setLearningRate: (lr) =>
    set((s) => ({ config: { ...s.config, learningRate: lr } })),
  setEpochs: (e) => set({ epochs: e }),
  setData: (d) => set({ data: d }),

  setTrainedModel: (model, readers) =>
    set({ trainedModel: model, activationReaders: readers }),
  setSelectedPoint: (p) => set({ selectedPoint: p }),
  setActivations: (a) => set({ activations: a }),
  setPredictionGrid: (grid) => set({ predictionGrid: grid }),
  setWeights: (w) => set({ weights: w }),
  setHoveredNeuron: (n) => set({ hoveredNeuron: n }),
  setMnistExamples: (e) => set({ mnistExamples: e }),
  setSelectedMnistIdx: (i) => set({ selectedMnistIdx: i }),
  toggleAblateNeuron: (key) =>
    set((s) => {
      const next = new Set(s.ablatedNeurons);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { ablatedNeurons: next };
    }),
  clearAblations: () => set({ ablatedNeurons: new Set<string>() }),
  setSaeModel: (m) => set({ saeModel: m }),
  setSaeStatus: (st) => set({ saeStatus: st }),
  setSaeFeatures: (f) => set({ saeFeatures: f }),
  pushSaeLoss: (loss) =>
    set((s) => ({ saeTrainingLoss: [...s.saeTrainingLoss, loss] })),
  resetSae: () =>
    set((s) => {
      try {
        s.saeModel?.dispose();
      } catch {
        /* already disposed */
      }
      return {
        saeModel: null,
        saeStatus: "idle",
        saeFeatures: null,
        saeTrainingLoss: [],
      };
    }),

  toggleFeature: (key) =>
    set((s) => {
      if (key === "x" || key === "y") return s;
      disposeLiveModel(s);
      const has = s.activeFeatures.includes(key);
      const next = has
        ? s.activeFeatures.filter((k) => k !== key)
        : [...s.activeFeatures, key];
      return {
        activeFeatures: next,
        status: "idle",
        selectedPoint: null,
        activations: null,
        trainedModel: null,
        activationReaders: null,
        predictionGrid: null,
        weights: null,
        hoveredNeuron: null,
        mnistExamples: null,
        selectedMnistIdx: null,
        ablatedNeurons: new Set<string>(),
        saeModel: null,
        saeStatus: "idle" as const,
        saeFeatures: null,
        saeTrainingLoss: [],
      };
    }),

  startTraining: () =>
    set({
      status: "training",
      currentEpoch: 0,
      loss: 0,
      accuracy: 0,
      lossHistory: [],
      accHistory: [],
      selectedPoint: null,
      activations: null,
      predictionGrid: null,
      weights: null,
      hoveredNeuron: null,
      ablatedNeurons: new Set<string>(),
      saeModel: null,
      saeStatus: "idle" as const,
      saeFeatures: null,
      saeTrainingLoss: [],
    }),
  pushTrainingStep: (epoch, loss, acc) =>
    set((s) => ({
      currentEpoch: epoch,
      loss,
      accuracy: acc,
      lossHistory: [...s.lossHistory, loss],
      accHistory: [...s.accHistory, acc],
    })),
  finishTraining: () => set({ status: "done" }),
  resetTraining: () =>
    set({
      status: "idle",
      currentEpoch: 0,
      loss: 0,
      accuracy: 0,
      lossHistory: [],
      accHistory: [],
      selectedPoint: null,
      activations: null,
      predictionGrid: null,
      weights: null,
      hoveredNeuron: null,
      ablatedNeurons: new Set<string>(),
      saeModel: null,
      saeStatus: "idle" as const,
      saeFeatures: null,
      saeTrainingLoss: [],
    }),
}));
