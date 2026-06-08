import * as tf from "@tensorflow/tfjs";
import type { DataPoint } from "./datasets";

export const MNIST_DIM = 28;
export const MNIST_INPUT_SIZE = MNIST_DIM * MNIST_DIM; // 784

export interface MnistExample {
  /** flat 784 grayscale values in [0,1] */
  pixels: Float32Array;
  /** binary label: 0 = "digit A" (e.g. 3), 1 = "digit B" (e.g. 8) */
  label: 0 | 1;
}

/**
 * generates a synthetic 28x28 pseudo-digit. the goal isn't realism —
 * we just need binary-separable structured image data so the rest of
 * the pipeline (training, flow view, SAE later) has something to learn.
 * digit A = horizontal-line-heavy strokes. digit B = vertical-line-heavy
 * strokes + a closed loop. visually distinguishable, learnable by a
 * small net.
 *
 * we can swap this for real mnist later (load from /public/mnist.json).
 */
function generateSyntheticDigit(label: 0 | 1, seed: number): Float32Array {
  const pixels = new Float32Array(MNIST_INPUT_SIZE);
  const rand = mulberry32(seed);

  if (label === 0) {
    // "digit A" — horizontal strokes + sparse fill
    const numStrokes = 2 + Math.floor(rand() * 2);
    for (let s = 0; s < numStrokes; s++) {
      const y = 6 + Math.floor(rand() * 16);
      const x0 = 4 + Math.floor(rand() * 6);
      const x1 = 18 + Math.floor(rand() * 6);
      const thickness = 1 + Math.floor(rand() * 2);
      for (let x = x0; x < x1; x++) {
        for (let dy = 0; dy < thickness; dy++) {
          const py = y + dy;
          if (py < MNIST_DIM) {
            pixels[py * MNIST_DIM + x] = 0.8 + rand() * 0.2;
          }
        }
      }
    }
  } else {
    // "digit B" — vertical stroke + closed loop
    const cx = 10 + Math.floor(rand() * 6);
    for (let y = 5; y < 23; y++) {
      pixels[y * MNIST_DIM + cx] = 0.8 + rand() * 0.2;
      if (rand() > 0.5) pixels[y * MNIST_DIM + cx + 1] = 0.7;
    }
    // loop on top
    const loopY = 6 + Math.floor(rand() * 4);
    const loopR = 3 + Math.floor(rand() * 2);
    for (let theta = 0; theta < Math.PI * 2; theta += 0.2) {
      const px = Math.round(cx + loopR * Math.cos(theta));
      const py = Math.round(loopY + loopR * 0.7 * Math.sin(theta));
      if (px >= 0 && px < MNIST_DIM && py >= 0 && py < MNIST_DIM) {
        pixels[py * MNIST_DIM + px] = 0.8 + rand() * 0.2;
      }
    }
  }

  // light noise everywhere
  for (let i = 0; i < pixels.length; i++) {
    pixels[i] = Math.max(0, Math.min(1, pixels[i] + (rand() - 0.5) * 0.05));
  }

  return pixels;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * generates a fresh mnist-like dataset of nExamples.
 * roughly balanced between class 0 and class 1.
 */
export function generateMnistDataset(nExamples: number = 1000): MnistExample[] {
  const examples: MnistExample[] = [];
  for (let i = 0; i < nExamples; i++) {
    const label: 0 | 1 = i % 2 === 0 ? 0 : 1;
    examples.push({
      pixels: generateSyntheticDigit(label, i * 7919 + label * 31),
      label,
    });
  }
  // shuffle
  for (let i = examples.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [examples[i], examples[j]] = [examples[j], examples[i]];
  }
  return examples;
}

/**
 * builds tensors directly for mnist (no DataPoint conversion needed —
 * mnist doesn't fit the 2D x,y shape).
 */
export function mnistToTensors(examples: MnistExample[]): {
  xs: tf.Tensor2D;
  ys: tf.Tensor2D;
} {
  const xs = tf.tensor2d(
    examples.map((e) => Array.from(e.pixels)),
    [examples.length, MNIST_INPUT_SIZE]
  );
  const ys = tf.tensor2d(examples.map((e) => [e.label]));
  return { xs, ys };
}

/**
 * placeholder DataPoint[] for mnist so existing code that expects
 * DataPoint[] doesn't crash. x,y are unused for mnist — we keep the
 * label so the dataset is conceptually still a "dataset of N labeled
 * points," and selectedPoint can still hold an index reference via
 * a separate mnist-aware path. but most consumers should check
 * dataset === "mnist" and branch.
 */
export function mnistAsDataPoints(examples: MnistExample[]): DataPoint[] {
  return examples.map(() => ({ x: 0, y: 0, label: 0 as 0 | 1 }));
}
