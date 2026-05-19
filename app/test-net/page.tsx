"use client";

import { useState } from "react";
import * as tf from "@tensorflow/tfjs";
import { generateDataset, datasetToTensors } from "@/lib/network/datasets";
import { buildModel, DEFAULT_CONFIG } from "@/lib/network/model";
import { trainModel, type TrainStep } from "@/lib/network/train";

export default function TestNetPage() {
  const [status, setStatus] = useState<string>("idle");
  const [steps, setSteps] = useState<TrainStep[]>([]);
  const [finalAcc, setFinalAcc] = useState<number | null>(null);

  async function run() {
    setStatus("generating data…");
    setSteps([]);
    setFinalAcc(null);

    const data = generateDataset("spiral", 200, 0.1);
    const { xs, ys } = datasetToTensors(data);

    setStatus("building model…");
    const model = buildModel({ ...DEFAULT_CONFIG, hiddenLayers: 2, neuronsPerLayer: 8 });

    setStatus("training…");
    const collected: TrainStep[] = [];
    const final = await trainModel(model, xs, ys, 100, 32, (s) => {
      collected.push(s);
      setSteps([...collected]);
    });

    setFinalAcc(final.accuracy);
    setStatus("done");

    // cleanup tensors
    xs.dispose();
    ys.dispose();
    model.dispose();
    console.log("backend:", tf.getBackend());
    console.log("final:", final);
  }

  return (
    <main className="min-h-screen bg-paper p-12 text-ink-900">
      <h1 className="text-3xl font-semibold">net core test</h1>
      <p className="mt-2 text-ink-500">
        temporary page — proves the network actually learns. delete in step 9.
      </p>
      <button
        onClick={run}
        className="mt-6 rounded-full bg-ink-900 px-6 py-3 text-paper transition hover:bg-ink-700"
        disabled={status === "training…" || status === "building model…" || status === "generating data…"}
      >
        {status === "training…" ? "training…" : "train spiral 100 epochs"}
      </button>

      <div className="mt-6 font-mono text-sm text-ink-700">
        <div>status: {status}</div>
        <div>epochs logged: {steps.length}</div>
        {finalAcc !== null && (
          <div className="mt-2 text-lg font-semibold">
            final accuracy: {(finalAcc * 100).toFixed(1)}%
          </div>
        )}
      </div>

      {steps.length > 0 && (
        <details className="mt-6">
          <summary className="cursor-pointer text-sm text-ink-500">
            show per-epoch log
          </summary>
          <pre className="mt-2 max-h-96 overflow-y-auto rounded-lg bg-cloud p-4 font-mono text-xs">
            {steps
              .map(
                (s) =>
                  `epoch ${String(s.epoch).padStart(3)}  loss=${s.loss.toFixed(4)}  acc=${(s.accuracy * 100).toFixed(1)}%`
              )
              .join("\n")}
          </pre>
        </details>
      )}
    </main>
  );
}
