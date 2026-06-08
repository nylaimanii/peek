"use client";

import { usePlayground } from "@/store/playground";
import type { DatasetName } from "@/lib/network/datasets";
import type { ActivationName } from "@/lib/network/model";
import { FEATURES } from "@/lib/network/features";

const DATASETS: { id: DatasetName; label: string }[] = [
  { id: "circles", label: "circles" },
  { id: "xor", label: "xor" },
  { id: "gaussian", label: "gaussian" },
  { id: "spiral", label: "spiral" },
  { id: "moons", label: "moons" },
  { id: "rings", label: "rings" },
  { id: "checkerboard", label: "checker" },
  { id: "stripes", label: "stripes" },
  { id: "eye", label: "eye" },
  { id: "mnist", label: "mnist" },
];

const ACTIVATIONS: ActivationName[] = ["tanh", "relu", "sigmoid"];

export function Controls({ onTrain }: { onTrain: () => void }) {
  const {
    dataset,
    setDataset,
    noise,
    setNoise,
    config,
    addLayer,
    removeLayer,
    incNeuron,
    decNeuron,
    setActivation,
    setLearningRate,
    epochs,
    setEpochs,
    status,
    activeFeatures,
    toggleFeature,
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
        {(dataset === "spiral" ||
          dataset === "checkerboard" ||
          dataset === "rings" ||
          dataset === "eye") && (
          <p className="mt-2 text-xs text-pink-300">
            this one is hard — add layers, neurons, or engineered features.
          </p>
        )}
      </div>

      {/* feature inputs (hidden for mnist — raw pixels are the features) */}
      {dataset !== "mnist" && (
      <div>
        <h2 className="font-mono text-xs uppercase tracking-wider text-ink-500">
          input features
        </h2>
        <p className="mt-1 text-xs text-ink-300">
          x₁, x₂ always on. add engineered features to help the net.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {FEATURES.map((f) => {
            const on = activeFeatures.includes(f.key);
            return (
              <button
                key={f.key}
                onClick={() => toggleFeature(f.key)}
                disabled={training || f.alwaysOn}
                className={`rounded-lg border px-3 py-2 text-xs transition disabled:opacity-100 ${
                  on
                    ? "border-cream-300 bg-cream-100 text-ink-900"
                    : "border-ink-300/20 bg-white/60 text-ink-400 hover:border-cream-200"
                } ${f.alwaysOn ? "cursor-default opacity-70" : ""}`}
                title={f.alwaysOn ? "always on" : on ? "click to remove" : "click to add"}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>
      )}

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

      {/* per-layer architecture */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-xs uppercase tracking-wider text-ink-500">
            architecture
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={removeLayer}
              disabled={training || config.neuronCounts.length <= 1}
              className="flex h-6 w-6 items-center justify-center rounded-md border border-ink-300/30 bg-white/60 text-ink-700 transition hover:border-pink-200 disabled:opacity-30"
              title="remove last layer"
            >
              −
            </button>
            <span className="font-mono text-xs text-ink-500">
              {config.neuronCounts.length} {config.neuronCounts.length === 1 ? "layer" : "layers"}
            </span>
            <button
              onClick={addLayer}
              disabled={training || config.neuronCounts.length >= 6}
              className="flex h-6 w-6 items-center justify-center rounded-md border border-ink-300/30 bg-white/60 text-ink-700 transition hover:border-mint-200 disabled:opacity-30"
              title="add a layer"
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          {config.neuronCounts.map((count, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-ink-300/15 bg-white/50 px-3 py-2"
            >
              <span className="font-mono text-xs text-ink-500">
                layer {i + 1}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => decNeuron(i)}
                  disabled={training || count <= 1}
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-ink-300/30 bg-white/70 text-ink-700 transition hover:border-pink-200 disabled:opacity-30"
                >
                  −
                </button>
                <span className="w-6 text-center font-mono text-sm text-ink-900">
                  {count}
                </span>
                <button
                  onClick={() => incNeuron(i)}
                  disabled={training || count >= 12}
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-ink-300/30 bg-white/70 text-ink-700 transition hover:border-mint-200 disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
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

      {/* train */}
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
