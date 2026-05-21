import { create } from "zustand";
import type { DatasetName, DataPoint } from "@/lib/network/datasets";
import type { NetworkConfig, ActivationName } from "@/lib/network/model";
import { DEFAULT_FEATURES } from "@/lib/network/features";

export type TrainingStatus = "idle" | "training" | "done";

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

  setDataset: (d) => set({ dataset: d, status: "idle" }),
  setNoise: (n) => set({ noise: n }),
  addLayer: () =>
    set((s) => {
      if (s.config.neuronCounts.length >= 6) return s;
      return {
        config: { ...s.config, neuronCounts: [...s.config.neuronCounts, 4] },
        status: "idle",
        selectedPoint: null,
        activations: null,
      };
    }),
  removeLayer: () =>
    set((s) => {
      if (s.config.neuronCounts.length <= 1) return s;
      return {
        config: {
          ...s.config,
          neuronCounts: s.config.neuronCounts.slice(0, -1),
        },
        status: "idle",
        selectedPoint: null,
        activations: null,
      };
    }),
  incNeuron: (layerIdx) =>
    set((s) => {
      const next = [...s.config.neuronCounts];
      if (next[layerIdx] >= 12) return s;
      next[layerIdx] += 1;
      return {
        config: { ...s.config, neuronCounts: next },
        status: "idle",
        selectedPoint: null,
        activations: null,
      };
    }),
  decNeuron: (layerIdx) =>
    set((s) => {
      const next = [...s.config.neuronCounts];
      if (next[layerIdx] <= 1) return s;
      next[layerIdx] -= 1;
      return {
        config: { ...s.config, neuronCounts: next },
        status: "idle",
        selectedPoint: null,
        activations: null,
      };
    }),
  setActivation: (a) =>
    set((s) => ({ config: { ...s.config, activation: a }, status: "idle" })),
  setLearningRate: (lr) =>
    set((s) => ({ config: { ...s.config, learningRate: lr } })),
  setEpochs: (e) => set({ epochs: e }),
  setData: (d) => set({ data: d }),

  setTrainedModel: (model, readers) =>
    set({ trainedModel: model, activationReaders: readers }),
  setSelectedPoint: (p) => set({ selectedPoint: p }),
  setActivations: (a) => set({ activations: a }),

  toggleFeature: (key) =>
    set((s) => {
      if (key === "x" || key === "y") return s; // always on
      const has = s.activeFeatures.includes(key);
      const next = has
        ? s.activeFeatures.filter((k) => k !== key)
        : [...s.activeFeatures, key];
      return {
        activeFeatures: next,
        status: "idle",
        selectedPoint: null,
        activations: null,
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
    }),
}));
