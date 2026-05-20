"use client";

import { usePlayground } from "@/store/playground";
import type { DatasetName } from "@/lib/network/datasets";
import type { ActivationName } from "@/lib/network/model";

const DATASETS: { id: DatasetName; label: string }[] = [
  { id: "circles", label: "circles" },
  { id: "xor", label: "xor" },
  { id: "gaussian", label: "gaussian" },
  { id: "spiral", label: "spiral" },
];

const ACTIVATIONS: ActivationName[] = ["tanh", "relu", "sigmoid"];

export function Controls({ onTrain }: { onTrain: () => void }) {
  const {
    dataset,
    setDataset,
    noise,
    setNoise,
    config,
    setHiddenLayers,
    setNeuronsPerLayer,
    setActivation,
    setLearningRate,
    epochs,
    setEpochs,
    status,
  } = usePlayground();

  const training = status === "training";

  return (
    <div className="flex flex-col gap-6 text-sm">
      {/* dataset */}
      <div>
        <h2 className="font-mono text-xs uppercase tracking-wider text-ink-500">
          dataset
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {DATASETS.map((d) => (
            <button
              key={d.id}
              onClick={() => setDataset(d.id)}
              disabled={training}
              className={`rounded-lg border px-3 py-2 text-xs transition disabled:opacity-40 ${
                dataset === d.id
                  ? "border-lavender-300 bg-lavender-100 text-ink-900"
                  : "border-ink-300/20 bg-white/60 text-ink-500 hover:border-lavender-200"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        {dataset === "spiral" && (
          <p className="mt-2 text-xs text-pink-300">
            spiral is hard — needs ~1000 epochs + 3 layers to crack.
          </p>
        )}
      </div>

      {/* noise */}
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-ink-500">
          noise: {noise.toFixed(2)}
        </label>
        <input
          type="range"
          min={0}
          max={0.5}
          step={0.05}
          value={noise}
          disabled={training}
          onChange={(e) => setNoise(parseFloat(e.target.value))}
          className="mt-2 w-full accent-lavender-300 disabled:opacity-40"
        />
      </div>

      {/* hidden layers */}
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-ink-500">
          hidden layers: {config.hiddenLayers}
        </label>
        <input
          type="range"
          min={1}
          max={4}
          step={1}
          value={config.hiddenLayers}
          disabled={training}
          onChange={(e) => setHiddenLayers(parseInt(e.target.value))}
          className="mt-2 w-full accent-mint-300 disabled:opacity-40"
        />
      </div>

      {/* neurons per layer */}
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-ink-500">
          neurons / layer: {config.neuronsPerLayer}
        </label>
        <input
          type="range"
          min={2}
          max={16}
          step={1}
          value={config.neuronsPerLayer}
          disabled={training}
          onChange={(e) => setNeuronsPerLayer(parseInt(e.target.value))}
          className="mt-2 w-full accent-mint-300 disabled:opacity-40"
        />
      </div>

      {/* activation */}
      <div>
        <h2 className="font-mono text-xs uppercase tracking-wider text-ink-500">
          activation
        </h2>
        <div className="mt-3 flex gap-2">
          {ACTIVATIONS.map((a) => (
            <button
              key={a}
              onClick={() => setActivation(a)}
              disabled={training}
              className={`flex-1 rounded-lg border px-2 py-2 text-xs transition disabled:opacity-40 ${
                config.activation === a
                  ? "border-mint-300 bg-mint-100 text-ink-900"
                  : "border-ink-300/20 bg-white/60 text-ink-500 hover:border-mint-200"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* learning rate */}
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-ink-500">
          learning rate: {config.learningRate}
        </label>
        <input
          type="range"
          min={0.001}
          max={0.1}
          step={0.001}
          value={config.learningRate}
          disabled={training}
          onChange={(e) => setLearningRate(parseFloat(e.target.value))}
          className="mt-2 w-full accent-cream-300 disabled:opacity-40"
        />
      </div>

      {/* epochs */}
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-ink-500">
          epochs: {epochs}
        </label>
        <input
          type="range"
          min={50}
          max={1000}
          step={50}
          value={epochs}
          disabled={training}
          onChange={(e) => setEpochs(parseInt(e.target.value))}
          className="mt-2 w-full accent-cream-300 disabled:opacity-40"
        />
      </div>

      {/* train button */}
      <button
        onClick={onTrain}
        disabled={training}
        className="mt-2 rounded-full bg-ink-900 px-6 py-3 text-paper transition hover:bg-ink-700 disabled:opacity-40"
      >
        {training ? "training…" : "train network"}
      </button>
    </div>
  );
}
