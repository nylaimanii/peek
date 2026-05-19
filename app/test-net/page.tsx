"use client";

import { useState } from "react";
import * as tf from "@tensorflow/tfjs";
import { generateDataset, datasetToTensors, type DatasetName } from "@/lib/network/datasets";
import { buildModel, type NetworkConfig } from "@/lib/network/model";
import { trainModel } from "@/lib/network/train";

type Result = {
  dataset: DatasetName;
  config: NetworkConfig;
  epochs: number;
  finalLoss: number;
  finalAcc: number;
  durationMs: number;
};

const PRESETS: { label: string; dataset: DatasetName; config: NetworkConfig; epochs: number }[] = [
  {
    label: "xor (easy) — 2x4 tanh, 200 epochs",
    dataset: "xor",
    config: { hiddenLayers: 2, neuronsPerLayer: 4, activation: "tanh", learningRate: 0.03 },
    epochs: 200,
  },
  {
    label: "gaussian (easy) — 1x4 tanh, 100 epochs",
    dataset: "gaussian",
    config: { hiddenLayers: 1, neuronsPerLayer: 4, activation: "tanh", learningRate: 0.03 },
    epochs: 100,
  },
  {
    label: "circles (medium) — 2x6 tanh, 300 epochs",
    dataset: "circles",
    config: { hiddenLayers: 2, neuronsPerLayer: 6, activation: "tanh", learningRate: 0.03 },
    epochs: 300,
  },
  {
    label: "spiral (hard) — 3x8 tanh, 1000 epochs",
    dataset: "spiral",
    config: { hiddenLayers: 3, neuronsPerLayer: 8, activation: "tanh", learningRate: 0.03 },
    epochs: 1000,
  },
];

export default function TestNetPage() {
  const [busy, setBusy] = useState(false);
  const [currentLabel, setCurrentLabel] = useState<string>("");
  const [progress, setProgress] = useState<{ epoch: number; total: number } | null>(null);
  const [results, setResults] = useState<Result[]>([]);

  async function runAll() {
    setBusy(true);
    setResults([]);
    for (const p of PRESETS) {
      setCurrentLabel(p.label);
      setProgress({ epoch: 0, total: p.epochs });

      const data = generateDataset(p.dataset, 200, 0.1);
      const { xs, ys } = datasetToTensors(data);
      const model = buildModel(p.config);

      const start = performance.now();
      const final = await trainModel(model, xs, ys, p.epochs, 32, (s) => {
        // update every 10 epochs to keep ui responsive
        if (s.epoch % 10 === 0 || s.epoch === p.epochs - 1) {
          setProgress({ epoch: s.epoch + 1, total: p.epochs });
        }
      });
      const duration = performance.now() - start;

      setResults((prev) => [
        ...prev,
        {
          dataset: p.dataset,
          config: p.config,
          epochs: p.epochs,
          finalLoss: final.loss,
          finalAcc: final.accuracy,
          durationMs: duration,
        },
      ]);

      xs.dispose();
      ys.dispose();
      model.dispose();
    }
    setCurrentLabel("");
    setProgress(null);
    setBusy(false);
    console.log("backend:", tf.getBackend());
  }

  return (
    <main className="min-h-screen bg-paper p-12 text-ink-900">
      <h1 className="text-3xl font-semibold">net core capacity test</h1>
      <p className="mt-2 text-ink-500">
        runs 4 configs across 4 datasets. easy ones should hit 95%+, hard ones should hit 90%+. if easy ones fail, the core is broken.
      </p>

      <button
        onClick={runAll}
        disabled={busy}
        className="mt-6 rounded-full bg-ink-900 px-6 py-3 text-paper transition hover:bg-ink-700 disabled:opacity-40"
      >
        {busy ? "running…" : "run all 4 tests"}
      </button>

      {currentLabel && (
        <div className="mt-6 font-mono text-sm">
          <div className="text-ink-700">running: {currentLabel}</div>
          {progress && (
            <div className="text-ink-500">
              epoch {progress.epoch} / {progress.total}
            </div>
          )}
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full font-mono text-sm">
            <thead className="bg-cloud text-left text-ink-700">
              <tr>
                <th className="px-3 py-2">dataset</th>
                <th className="px-3 py-2">arch</th>
                <th className="px-3 py-2">epochs</th>
                <th className="px-3 py-2">loss</th>
                <th className="px-3 py-2">acc</th>
                <th className="px-3 py-2">time</th>
                <th className="px-3 py-2">verdict</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => {
                const isEasy = r.dataset === "xor" || r.dataset === "gaussian";
                const threshold = isEasy ? 0.95 : 0.9;
                const passed = r.finalAcc >= threshold;
                return (
                  <tr key={i} className="border-t border-ink-300/30">
                    <td className="px-3 py-2">{r.dataset}</td>
                    <td className="px-3 py-2">
                      {r.config.hiddenLayers}x{r.config.neuronsPerLayer} {r.config.activation}
                    </td>
                    <td className="px-3 py-2">{r.epochs}</td>
                    <td className="px-3 py-2">{r.finalLoss.toFixed(4)}</td>
                    <td className="px-3 py-2 font-semibold">
                      {(r.finalAcc * 100).toFixed(1)}%
                    </td>
                    <td className="px-3 py-2 text-ink-500">{(r.durationMs / 1000).toFixed(1)}s</td>
                    <td className="px-3 py-2">
                      {passed ? (
                        <span className="text-mint-300">✓ pass</span>
                      ) : (
                        <span className="text-pink-300">✗ fail</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
