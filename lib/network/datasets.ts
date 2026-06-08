import * as tf from "@tensorflow/tfjs";

export type DatasetName =
  | "spiral"
  | "circles"
  | "xor"
  | "gaussian"
  | "moons"
  | "rings"
  | "checkerboard"
  | "stripes"
  | "eye"
  | "mnist";

export interface DataPoint {
  x: number;
  y: number;
  label: 0 | 1;
}

/**
 * generates a 2D toy dataset for binary classification.
 * all points live in the [-1, 1] × [-1, 1] square.
 */
export function generateDataset(
  name: DatasetName,
  nPoints: number,
  noise: number = 0.1
): DataPoint[] {
  switch (name) {
    case "spiral":
      return generateSpiral(nPoints, noise);
    case "circles":
      return generateCircles(nPoints, noise);
    case "xor":
      return generateXOR(nPoints, noise);
    case "gaussian":
      return generateGaussian(nPoints, noise);
    case "moons":
      return generateMoons(nPoints, noise);
    case "rings":
      return generateRings(nPoints, noise);
    case "checkerboard":
      return generateCheckerboard(nPoints, noise);
    case "stripes":
      return generateStripes(nPoints, noise);
    case "eye":
      return generateEye(nPoints, noise);
    case "mnist":
      // mnist uses its own pipeline; this returns empty so 2D-shaped
      // consumers don't break. real mnist data lives in mnist.ts.
      return [];
  }
}

function generateSpiral(n: number, noise: number): DataPoint[] {
  const points: DataPoint[] = [];
  const perClass = Math.floor(n / 2);
  for (let c = 0; c < 2; c++) {
    for (let i = 0; i < perClass; i++) {
      const r = i / perClass;
      const t = 1.75 * i / perClass * 2 * Math.PI + c * Math.PI;
      const x = r * Math.sin(t) + (Math.random() - 0.5) * noise;
      const y = r * Math.cos(t) + (Math.random() - 0.5) * noise;
      points.push({ x, y, label: c as 0 | 1 });
    }
  }
  return shuffle(points);
}

function generateCircles(n: number, noise: number): DataPoint[] {
  const points: DataPoint[] = [];
  const perClass = Math.floor(n / 2);
  // inner circle
  for (let i = 0; i < perClass; i++) {
    const r = 0.3 + (Math.random() - 0.5) * noise;
    const t = Math.random() * 2 * Math.PI;
    points.push({
      x: r * Math.cos(t),
      y: r * Math.sin(t),
      label: 0,
    });
  }
  // outer ring
  for (let i = 0; i < perClass; i++) {
    const r = 0.75 + (Math.random() - 0.5) * noise;
    const t = Math.random() * 2 * Math.PI;
    points.push({
      x: r * Math.cos(t),
      y: r * Math.sin(t),
      label: 1,
    });
  }
  return shuffle(points);
}

function generateXOR(n: number, noise: number): DataPoint[] {
  const points: DataPoint[] = [];
  for (let i = 0; i < n; i++) {
    const x = (Math.random() - 0.5) * 2;
    const y = (Math.random() - 0.5) * 2;
    const label: 0 | 1 = (x * y >= 0 ? 1 : 0);
    points.push({
      x: x + (Math.random() - 0.5) * noise,
      y: y + (Math.random() - 0.5) * noise,
      label,
    });
  }
  return points;
}

function generateGaussian(n: number, noise: number): DataPoint[] {
  const points: DataPoint[] = [];
  const perClass = Math.floor(n / 2);
  const variance = 0.15 + noise;
  // class 0 cluster
  for (let i = 0; i < perClass; i++) {
    points.push({
      x: -0.4 + gaussianRandom() * variance,
      y: -0.4 + gaussianRandom() * variance,
      label: 0,
    });
  }
  // class 1 cluster
  for (let i = 0; i < perClass; i++) {
    points.push({
      x: 0.4 + gaussianRandom() * variance,
      y: 0.4 + gaussianRandom() * variance,
      label: 1,
    });
  }
  return shuffle(points);
}

function generateMoons(n: number, noise: number): DataPoint[] {
  // two interleaving half-circles (crescents)
  const points: DataPoint[] = [];
  const perClass = Math.floor(n / 2);
  for (let i = 0; i < perClass; i++) {
    const t = (i / perClass) * Math.PI;
    // upper moon (class 0)
    points.push({
      x: Math.cos(t) * 0.7 - 0.15 + (Math.random() - 0.5) * noise,
      y: Math.sin(t) * 0.7 - 0.2 + (Math.random() - 0.5) * noise,
      label: 0,
    });
    // lower moon (class 1), shifted + flipped
    points.push({
      x: Math.cos(t) * 0.7 + 0.15 + (Math.random() - 0.5) * noise,
      y: -Math.sin(t) * 0.7 + 0.2 + (Math.random() - 0.5) * noise,
      label: 1,
    });
  }
  return shuffle(points);
}

function generateRings(n: number, noise: number): DataPoint[] {
  // 3 concentric rings, alternating class by ring
  const points: DataPoint[] = [];
  const radii = [0.25, 0.55, 0.85];
  const per = Math.floor(n / radii.length);
  radii.forEach((r, idx) => {
    for (let i = 0; i < per; i++) {
      const t = Math.random() * 2 * Math.PI;
      const rr = r + (Math.random() - 0.5) * noise;
      points.push({
        x: rr * Math.cos(t),
        y: rr * Math.sin(t),
        label: (idx % 2) as 0 | 1,
      });
    }
  });
  return shuffle(points);
}

function generateCheckerboard(n: number, noise: number): DataPoint[] {
  // 4x4 grid of alternating-class squares across [-1,1]
  const points: DataPoint[] = [];
  for (let i = 0; i < n; i++) {
    const x = (Math.random() - 0.5) * 2;
    const y = (Math.random() - 0.5) * 2;
    // map to a 4x4 grid cell, color by parity
    const cellX = Math.floor((x + 1) * 2); // 0..3
    const cellY = Math.floor((y + 1) * 2); // 0..3
    const label = ((cellX + cellY) % 2) as 0 | 1;
    points.push({
      x: x + (Math.random() - 0.5) * noise,
      y: y + (Math.random() - 0.5) * noise,
      label,
    });
  }
  return points;
}

function generateStripes(n: number, noise: number): DataPoint[] {
  // diagonal bands, alternating class
  const points: DataPoint[] = [];
  for (let i = 0; i < n; i++) {
    const x = (Math.random() - 0.5) * 2;
    const y = (Math.random() - 0.5) * 2;
    // diagonal coordinate, banded
    const band = Math.floor((x + y + 2) * 1.5); // a few bands across the diagonal
    const label = (band % 2) as 0 | 1;
    points.push({
      x: x + (Math.random() - 0.5) * noise,
      y: y + (Math.random() - 0.5) * noise,
      label,
    });
  }
  return points;
}

function generateEye(n: number, noise: number): DataPoint[] {
  // nested target: center blob (0), ring (1), outer (0)
  const points: DataPoint[] = [];
  for (let i = 0; i < n; i++) {
    const t = Math.random() * 2 * Math.PI;
    const r = Math.sqrt(Math.random()); // uniform over disk
    const x = r * Math.cos(t) + (Math.random() - 0.5) * noise;
    const y = r * Math.sin(t) + (Math.random() - 0.5) * noise;
    const dist = Math.sqrt(x * x + y * y);
    // center (<0.33) = 0, middle ring (0.33-0.66) = 1, outer (>0.66) = 0
    const label: 0 | 1 = dist < 0.33 ? 0 : dist < 0.66 ? 1 : 0;
    points.push({ x, y, label });
  }
  return points;
}

function gaussianRandom(): number {
  // box-muller transform
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * converts a list of DataPoints into tf.js tensors ready for training.
 */
export function datasetToTensors(data: DataPoint[]): {
  xs: tf.Tensor2D;
  ys: tf.Tensor2D;
} {
  const xs = tf.tensor2d(data.map((p) => [p.x, p.y]));
  const ys = tf.tensor2d(data.map((p) => [p.label]));
  return { xs, ys };
}
