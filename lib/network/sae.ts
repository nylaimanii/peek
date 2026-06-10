import * as tf from "@tensorflow/tfjs";
import type { MnistExample } from "./mnist";

export interface SaeConfig {
  dictSize: number;    // d_dict — number of features (typically 2-4x hidden dim)
  topK: number;        // K — how many features active per example
  learningRate: number;
  epochs: number;
}

export const DEFAULT_SAE_CONFIG: SaeConfig = {
  dictSize: 64,
  topK: 4,
  learningRate: 0.01,
  epochs: 60,
};

export interface SaeModel {
  encoder: tf.LayersModel;
  decoder: tf.LayersModel;
  config: SaeConfig;
  hiddenDim: number;
  dispose: () => void;
}

export interface SaeTrainingStep {
  epoch: number;
  loss: number;
}

export interface SaeFeature {
  featureIdx: number;
  /** top-activating examples by activation strength */
  topExamples: { exampleIdx: number; activation: number }[];
  /** mean activation across all examples (a "dead" feature has ~0) */
  meanActivation: number;
}

/**
 * extracts the hidden-layer activations for every example by running
 * each one through the second-to-last layer's reader. returns a flat
 * Float32Array of shape [nExamples * hiddenDim], plus hiddenDim.
 */
export function extractHiddenActivations(
  readers: tf.LayersModel[],
  examples: MnistExample[]
): { acts: Float32Array; hiddenDim: number } {
  // readers.length - 1 is the output layer; we want the last hidden layer.
  const lastHiddenIdx = readers.length - 2;
  if (lastHiddenIdx < 0) {
    throw new Error("network has no hidden layer to decompose");
  }
  const reader = readers[lastHiddenIdx];
  return tf.tidy(() => {
    const inputs = tf.tensor2d(
      examples.map((e) => Array.from(e.pixels))
    );
    const acts = reader.predict(inputs) as tf.Tensor2D;
    const flat = acts.dataSync();
    const hiddenDim = acts.shape[1]!;
    return { acts: Float32Array.from(flat), hiddenDim };
  });
}

/**
 * trains a TopK SAE on hidden activations.
 * acts: flat Float32Array of shape [nExamples, hiddenDim].
 */
export async function trainSae(
  acts: Float32Array,
  hiddenDim: number,
  config: SaeConfig,
  onStep?: (s: SaeTrainingStep) => void
): Promise<SaeModel> {
  const nExamples = acts.length / hiddenDim;
  const xs = tf.tensor2d(Array.from(acts), [nExamples, hiddenDim]);

  // encoder: hiddenDim -> dictSize with ReLU
  const encoder = tf.sequential();
  encoder.add(
    tf.layers.dense({
      units: config.dictSize,
      inputShape: [hiddenDim],
      activation: "relu",
      kernelInitializer: "glorotUniform",
    })
  );

  // decoder: dictSize -> hiddenDim, linear
  const decoder = tf.sequential();
  decoder.add(
    tf.layers.dense({
      units: hiddenDim,
      inputShape: [config.dictSize],
      activation: "linear",
      kernelInitializer: "glorotUniform",
    })
  );

  const optimizer = tf.train.adam(config.learningRate);

  for (let epoch = 0; epoch < config.epochs; epoch++) {
    const lossTensor = optimizer.minimize(() => {
      // encoder forward
      const z = encoder.apply(xs) as tf.Tensor2D;

      // TopK: keep top K values per row, zero the rest
      const { values, indices } = tf.topk(z, config.topK, true);
      // scatter back via oneHot trick: oneHot(indices) * values, sum over K axis
      const oneHots = tf.oneHot(indices, config.dictSize); // [n, K, dictSize]
      const expandedValues = values.expandDims(-1);        // [n, K, 1]
      const zTopK = (oneHots.mul(expandedValues) as tf.Tensor3D).sum(1) as tf.Tensor2D; // [n, dictSize]

      // decoder forward
      const recon = decoder.apply(zTopK) as tf.Tensor2D;

      // MSE reconstruction loss
      const loss = tf.losses.meanSquaredError(xs, recon);
      return loss as tf.Scalar;
    }, true);

    const lossVal = lossTensor!.dataSync()[0];
    lossTensor!.dispose();

    if (onStep) onStep({ epoch, loss: lossVal });

    // yield to the UI thread between epochs
    await tf.nextFrame();
  }

  xs.dispose();

  return {
    encoder,
    decoder,
    config,
    hiddenDim,
    dispose: () => {
      encoder.dispose();
      decoder.dispose();
    },
  };
}

/**
 * computes the SAE feature gallery: for each feature, the top-K examples
 * that activate it most, and its mean activation.
 */
export function computeSaeFeatures(
  sae: SaeModel,
  acts: Float32Array,
  topExamplesPerFeature: number = 6
): SaeFeature[] {
  const nExamples = acts.length / sae.hiddenDim;
  // do tensor work inside tidy (returns plain number[][]), build the typed
  // SaeFeature[] outside. tf.tidy widens its return type to TensorContainer
  // which doesn't narrow back to SaeFeature[].
  const featureActivations = tf.tidy(() => {
    const xs = tf.tensor2d(Array.from(acts), [nExamples, sae.hiddenDim]);
    const z = sae.encoder.apply(xs) as tf.Tensor2D;
    const { values, indices } = tf.topk(z, sae.config.topK, true);
    const oneHots = tf.oneHot(indices, sae.config.dictSize);
    const expandedValues = values.expandDims(-1);
    const zTopK = (oneHots.mul(expandedValues) as tf.Tensor3D).sum(1) as tf.Tensor2D;
    return zTopK.arraySync() as number[][];
  }) as number[][];

  const features: SaeFeature[] = [];
  for (let f = 0; f < sae.config.dictSize; f++) {
    const examples: { exampleIdx: number; activation: number }[] = [];
    let sum = 0;
    for (let i = 0; i < nExamples; i++) {
      const a = featureActivations[i][f];
      sum += a;
      if (a > 0) examples.push({ exampleIdx: i, activation: a });
    }
    examples.sort((a, b) => b.activation - a.activation);
    features.push({
      featureIdx: f,
      topExamples: examples.slice(0, topExamplesPerFeature),
      meanActivation: sum / nExamples,
    });
  }
  return features;
}
