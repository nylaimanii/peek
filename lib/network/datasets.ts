import * as tf from "@tensorflow/tfjs";

export type DatasetName = "spiral" | "circles" | "xor" | "gaussian";

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
