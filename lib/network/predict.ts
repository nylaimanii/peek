import * as tf from "@tensorflow/tfjs";
import type { FeatureKey } from "./features";
import { featureVector } from "./features";

/**
 * samples the trained model's prediction over a `res` x `res` grid
 * spanning [-1, 1] in both x and y. returns a flat array of length
 * res*res with values in [0,1] (sigmoid output = P(class 1)).
 * row-major: index = row * res + col, row 0 = top (y = +1).
 */
export function predictGrid(
  model: tf.LayersModel,
  activeFeatures: FeatureKey[],
  res: number = 50
): Float32Array {
  return tf.tidy(() => {
    const inputs: number[][] = [];
    for (let row = 0; row < res; row++) {
      // row 0 = top = y +1, last row = y -1
      const y = 1 - (row / (res - 1)) * 2;
      for (let col = 0; col < res; col++) {
        const x = -1 + (col / (res - 1)) * 2;
        inputs.push(featureVector(x, y, activeFeatures));
      }
    }
    const batch = tf.tensor2d(inputs);
    const out = model.predict(batch) as tf.Tensor;
    const data = out.dataSync();
    return Float32Array.from(data);
  });
}
