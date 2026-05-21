import * as tf from "@tensorflow/tfjs";
import type { DataPoint } from "./datasets";

/** the feature inputs a user can toggle. x and y are always on. */
export type FeatureKey = "x" | "y" | "x2" | "y2" | "xy" | "sinx" | "siny";

export interface FeatureDef {
  key: FeatureKey;
  label: string;
  /** computes this feature from raw x, y */
  fn: (x: number, y: number) => number;
  /** x and y can't be turned off */
  alwaysOn?: boolean;
}

export const FEATURES: FeatureDef[] = [
  { key: "x", label: "X₁", fn: (x) => x, alwaysOn: true },
  { key: "y", label: "X₂", fn: (_x, y) => y, alwaysOn: true },
  { key: "x2", label: "X₁²", fn: (x) => x * x },
  { key: "y2", label: "X₂²", fn: (_x, y) => y * y },
  { key: "xy", label: "X₁X₂", fn: (x, y) => x * y },
  { key: "sinx", label: "sin X₁", fn: (x) => Math.sin(x * Math.PI) },
  { key: "siny", label: "sin X₂", fn: (_x, y) => Math.sin(y * Math.PI) },
];

/** default active features: just raw x, y */
export const DEFAULT_FEATURES: FeatureKey[] = ["x", "y"];

/** given active feature keys (in FEATURES order), compute the feature vector for one point */
export function featureVector(
  x: number,
  y: number,
  activeKeys: FeatureKey[]
): number[] {
  return FEATURES.filter((f) => activeKeys.includes(f.key)).map((f) =>
    f.fn(x, y)
  );
}

/** labels for the active features, in order — used for input neuron labels */
export function activeFeatureLabels(activeKeys: FeatureKey[]): string[] {
  return FEATURES.filter((f) => activeKeys.includes(f.key)).map((f) => f.label);
}

/** turns a dataset into a feature matrix + labels using the active features */
export function dataToFeatureTensors(
  data: DataPoint[],
  activeKeys: FeatureKey[]
): {
  xs: tf.Tensor2D;
  ys: tf.Tensor2D;
} {
  const xs = tf.tensor2d(
    data.map((p) => featureVector(p.x, p.y, activeKeys))
  );
  const ys = tf.tensor2d(data.map((p) => [p.label]));
  return { xs, ys };
}
