import * as tf from "@tensorflow/tfjs";

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
