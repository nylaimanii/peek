import { create } from "zustand";
import type { DatasetName, DataPoint } from "@/lib/network/datasets";
import type { NetworkConfig, ActivationName } from "@/lib/network/model";

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

  // actions
  setDataset: (d: DatasetName) => void;
  setNoise: (n: number) => void;
  setHiddenLayers: (n: number) => void;
  setNeuronsPerLayer: (n: number) => void;
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
    hiddenLayers: 2,
    neuronsPerLayer: 6,
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

  setDataset: (d) => set({ dataset: d, status: "idle" }),
  setNoise: (n) => set({ noise: n }),
  setHiddenLayers: (n) =>
    set((s) => ({ config: { ...s.config, hiddenLayers: n }, status: "idle" })),
  setNeuronsPerLayer: (n) =>
    set((s) => ({ config: { ...s.config, neuronsPerLayer: n }, status: "idle" })),
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
