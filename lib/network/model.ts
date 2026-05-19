import * as tf from "@tensorflow/tfjs";

export type ActivationName = "tanh" | "relu" | "sigmoid";

export interface NetworkConfig {
  /** number of hidden layers (1-4) */
  hiddenLayers: number;
  /** neurons per hidden layer (2-16). same for every hidden layer for now. */
  neuronsPerLayer: number;
  /** activation function used in hidden layers */
  activation: ActivationName;
  /** learning rate for the adam optimizer */
  learningRate: number;
}

export const DEFAULT_CONFIG: NetworkConfig = {
  hiddenLayers: 2,
  neuronsPerLayer: 4,
  activation: "tanh",
  learningRate: 0.03,
};

/**
 * builds a feedforward neural net for 2D binary classification.
 * input shape: [2]  (x, y)
 * output shape: [1] (sigmoid → probability of class 1)
 */
export function buildModel(config: NetworkConfig): tf.LayersModel {
  const model = tf.sequential();

  // first hidden layer needs inputShape
  model.add(
    tf.layers.dense({
      units: config.neuronsPerLayer,
      activation: config.activation,
      inputShape: [2],
    })
  );

  // remaining hidden layers
  for (let i = 1; i < config.hiddenLayers; i++) {
    model.add(
      tf.layers.dense({
        units: config.neuronsPerLayer,
        activation: config.activation,
      })
    );
  }

  // output: 1 neuron, sigmoid for binary
  model.add(
    tf.layers.dense({
      units: 1,
      activation: "sigmoid",
    })
  );

  model.compile({
    optimizer: tf.train.adam(config.learningRate),
    loss: "binaryCrossentropy",
    metrics: ["accuracy"],
  });

  return model;
}
