import * as tf from "@tensorflow/tfjs";

export type ActivationName = "tanh" | "relu" | "sigmoid";

export interface NetworkConfig {
  /** neuron count for each hidden layer. length = number of hidden layers (1-6). each value 1-12. */
  neuronCounts: number[];
  activation: ActivationName;
  learningRate: number;
}

export const DEFAULT_CONFIG: NetworkConfig = {
  neuronCounts: [6, 6],
  activation: "tanh",
  learningRate: 0.03,
};

/**
 * builds a feedforward net for 2D binary classification.
 * input shape: [inputDim] (default 2 = x,y; more when feature eng added)
 * one dense layer per entry in neuronCounts, then a sigmoid output.
 */
export function buildModel(
  config: NetworkConfig,
  inputDim: number = 2
): tf.LayersModel {
  const model = tf.sequential();

  config.neuronCounts.forEach((units, idx) => {
    model.add(
      tf.layers.dense({
        units,
        activation: config.activation,
        ...(idx === 0 ? { inputShape: [inputDim] } : {}),
      })
    );
  });

  model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));

  model.compile({
    optimizer: tf.train.adam(config.learningRate),
    loss: "binaryCrossentropy",
    metrics: ["accuracy"],
  });

  return model;
}
