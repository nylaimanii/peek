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

  // helper: draw a stroke along a parametric path with soft thickness
  const drawStroke = (
    pathFn: (t: number) => [number, number],
    thickness: number,
    intensity: number
  ) => {
    const steps = 80;
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const [cx, cy] = pathFn(t);
      const r = thickness / 2;
      for (let dy = -Math.ceil(r); dy <= Math.ceil(r); dy++) {
        for (let dx = -Math.ceil(r); dx <= Math.ceil(r); dx++) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > r) continue;
          const x = Math.round(cx + dx);
          const y = Math.round(cy + dy);
          if (x < 0 || x >= MNIST_DIM || y < 0 || y >= MNIST_DIM) continue;
          const falloff = 1 - dist / (r + 0.5);
          const v = intensity * falloff;
          const idx = y * MNIST_DIM + x;
          pixels[idx] = Math.min(1, pixels[idx] + v);
        }
      }
    }
  };

  // jitter for realism
  const jx = (rand() - 0.5) * 2;
  const jy = (rand() - 0.5) * 2;
  const scale = 0.85 + rand() * 0.3;
  const cx = 14 + jx;
  const cy = 14 + jy;
  const intensity = 0.7 + rand() * 0.3;

  if (label === 0) {
    // "digit 3" — two stacked curves opening left
    const topR = 5 * scale;
    const botR = 5 * scale;
    drawStroke(
      (t) => {
        const theta = -Math.PI / 2 + t * Math.PI * 1.4;
        return [cx + Math.cos(theta) * topR, cy - 4 + Math.sin(theta) * topR];
      },
      2.5,
      intensity
    );
    drawStroke(
      (t) => {
        const theta = -Math.PI / 2 + t * Math.PI * 1.4;
        return [cx + Math.cos(theta) * botR, cy + 4 + Math.sin(theta) * botR];
      },
      2.5,
      intensity
    );
  } else {
    // "digit 8" — two stacked loops
    const topR = 4 * scale;
    const botR = 5 * scale;
    drawStroke(
      (t) => {
        const theta = t * Math.PI * 2;
        return [cx + Math.cos(theta) * topR, cy - 4 + Math.sin(theta) * topR];
      },
      2,
      intensity
    );
    drawStroke(
      (t) => {
        const theta = t * Math.PI * 2;
        return [cx + Math.cos(theta) * botR, cy + 4.5 + Math.sin(theta) * botR];
      },
      2,
      intensity
    );
  }

  // realistic noise — gentle ambient + occasional speckle
  for (let i = 0; i < pixels.length; i++) {
    pixels[i] = Math.max(0, Math.min(1, pixels[i] + (rand() - 0.5) * 0.04));
    if (rand() < 0.005) {
      pixels[i] = Math.min(1, pixels[i] + rand() * 0.3);
    }
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
export function generateMnistDataset(nExamples: number = 1500): MnistExample[] {
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
