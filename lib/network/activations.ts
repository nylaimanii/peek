import * as tf from "@tensorflow/tfjs";
import type { FeatureKey } from "./features";
import { featureVector } from "./features";

/**
 * activations for one input, layer by layer.
 * activations[layerIdx][neuronIdx] = scalar activation value.
 * layerIdx 0 = first hidden layer output, ... last = output neuron.
 * (we don't include the raw input as a "layer" here — the graph treats
 *  inputs separately.)
 */
export type LayerActivations = number[][];

/**
 * builds a list of tf models, each outputting the activation of one
 * dense layer. lets us read every hidden + output layer's activations
 * for a given input in one go.
 *
 * call once after training, reuse for many inputs. dispose when done.
 */
export function buildActivationReaders(
  model: tf.LayersModel
): tf.LayersModel[] {
  const readers: tf.LayersModel[] = [];
  // model.layers includes every dense layer (hidden + output)
  for (const layer of model.layers) {
    const reader = tf.model({
      inputs: model.inputs,
      outputs: layer.output as tf.SymbolicTensor,
    });
    readers.push(reader);
  }
  return readers;
}

/**
 * runs a feature vector through each reader and returns the activation
 * of every neuron in every dense layer.
 */
export function readActivations(
  readers: tf.LayersModel[],
  featureVec: number[]
): LayerActivations {
  return tf.tidy(() => {
    const input = tf.tensor2d([featureVec]);
    const result: LayerActivations = readers.map((reader) => {
      const out = reader.predict(input) as tf.Tensor;
      return Array.from(out.dataSync());
    });
    return result;
  });
}

/**
 * samples ONE neuron's activation across a res x res grid of input space.
 * layerIdx is the dense-layer index (0 = first hidden, matching the
 * readers array). neuronIdx is which neuron in that layer.
 * returns Float32Array length res*res, row 0 = top (y=+1), with min/max
 * for normalization in the renderer.
 */
export function neuronActivationGrid(
  readers: tf.LayersModel[],
  layerIdx: number,
  neuronIdx: number,
  activeFeatures: FeatureKey[],
  res: number = 40
): { grid: Float32Array; min: number; max: number } {
  const reader = readers[layerIdx];
  if (!reader) {
    return { grid: new Float32Array(res * res), min: 0, max: 0 };
  }
  return tf.tidy(() => {
    const inputs: number[][] = [];
    for (let row = 0; row < res; row++) {
      const y = 1 - (row / (res - 1)) * 2;
      for (let col = 0; col < res; col++) {
        const x = -1 + (col / (res - 1)) * 2;
        inputs.push(featureVector(x, y, activeFeatures));
      }
    }
    const batch = tf.tensor2d(inputs);
    const out = reader.predict(batch) as tf.Tensor;
    // out shape [res*res, layerWidth]; grab the neuronIdx column
    const arr = out.arraySync() as number[][];
    const col = arr.map((rowVals) => rowVals[neuronIdx]);
    const min = Math.min(...col);
    const max = Math.max(...col);
    return { grid: Float32Array.from(col), min, max };
  });
}
