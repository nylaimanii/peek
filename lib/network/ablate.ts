import * as tf from "@tensorflow/tfjs";
import type { FeatureKey } from "./features";
import { featureVector } from "./features";

/**
 * runs a manual forward pass through the network, zeroing out any
 * neurons listed in `ablated` between layers. returns the boundary
 * grid as a Float32Array of size res*res (row-major, row 0 = top = y+1).
 *
 * we walk model.layers directly (extracting kernel + bias each step),
 * apply the layer's activation, then multiply by an ablation mask
 * before passing to the next layer. all wrapped in tf.tidy so each
 * toggle stays leak-free.
 *
 * ablated set keys are "denseLayerIdx-neuronIdx" — same convention as
 * the activation readers (0 = first hidden, last = output).
 */
export function ablatedPredictGrid(
  model: tf.LayersModel,
  activeFeatures: FeatureKey[],
  ablated: Set<string>,
  res: number = 50
): Float32Array {
  return tf.tidy(() => {
    // build the grid input
    const inputs: number[][] = [];
    for (let row = 0; row < res; row++) {
      const y = 1 - (row / (res - 1)) * 2;
      for (let col = 0; col < res; col++) {
        const x = -1 + (col / (res - 1)) * 2;
        inputs.push(featureVector(x, y, activeFeatures));
      }
    }
    let acts: tf.Tensor2D = tf.tensor2d(inputs); // [res*res, inputDim]

    // walk each dense layer manually
    const denseLayers = model.layers.filter((l) => l.getWeights().length > 0);
    denseLayers.forEach((layer, layerIdx) => {
      const w = layer.getWeights();
      const kernel = w[0] as tf.Tensor2D; // [from, to]
      const bias = w[1] as tf.Tensor1D;   // [to]

      // matmul + bias
      let z: tf.Tensor2D = acts.matMul(kernel).add(bias) as tf.Tensor2D;

      // apply activation — read from the dense layer's config
      const cfg = layer.getConfig() as { activation?: string };
      const activation = cfg.activation ?? "linear";
      if (activation === "tanh") z = z.tanh();
      else if (activation === "relu") z = z.relu();
      else if (activation === "sigmoid") z = z.sigmoid();
      // linear: no-op

      // ablation: zero out any ablated neurons in THIS dense layer's output.
      const layerWidth = z.shape[1]!;
      const ablatedInLayer: number[] = [];
      for (let n = 0; n < layerWidth; n++) {
        if (ablated.has(`${layerIdx}-${n}`)) ablatedInLayer.push(n);
      }
      if (ablatedInLayer.length > 0) {
        const maskArr = new Array(layerWidth).fill(1);
        ablatedInLayer.forEach((n) => (maskArr[n] = 0));
        const mask = tf.tensor2d([maskArr], [1, layerWidth]);
        z = z.mul(mask) as tf.Tensor2D;
      }

      acts = z;
    });

    // final acts is the model output [res*res, 1] (sigmoid for binary cls)
    return Float32Array.from(acts.dataSync());
  });
}
