"use client";

import { usePlayground } from "@/store/playground";
import {
  trainSae,
  computeSaeFeatures,
  extractHiddenActivations,
  DEFAULT_SAE_CONFIG,
} from "@/lib/network/sae";
import { MNIST_DIM } from "@/lib/network/mnist";

function DigitThumb({
  pixels,
  size = 28,
}: {
  pixels: Float32Array;
  size?: number;
}) {
  const cell = size / MNIST_DIM;
  const rects = [];
  for (let y = 0; y < MNIST_DIM; y++) {
    for (let x = 0; x < MNIST_DIM; x++) {
      const v = pixels[y * MNIST_DIM + x];
      if (v < 0.05) continue;
      rects.push(
        <rect
          key={y * MNIST_DIM + x}
          x={x * cell}
          y={y * cell}
          width={cell}
          height={cell}
          fill={`rgba(45,45,45,${v.toFixed(3)})`}
        />
      );
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="white" />
      {rects}
    </svg>
  );
}

export function SaeGallery() {
  const dataset = usePlayground((s) => s.dataset);
  const trainedModel = usePlayground((s) => s.trainedModel);
  const activationReaders = usePlayground((s) => s.activationReaders);
  const mnistExamples = usePlayground((s) => s.mnistExamples);
  const saeStatus = usePlayground((s) => s.saeStatus);
  const saeFeatures = usePlayground((s) => s.saeFeatures);
  const saeTrainingLoss = usePlayground((s) => s.saeTrainingLoss);
  const setSaeModel = usePlayground((s) => s.setSaeModel);
  const setSaeStatus = usePlayground((s) => s.setSaeStatus);
  const setSaeFeatures = usePlayground((s) => s.setSaeFeatures);
  const pushSaeLoss = usePlayground((s) => s.pushSaeLoss);

  // only render this gallery for mnist + trained model
  if (dataset !== "mnist") return null;
  if (!trainedModel || !activationReaders || !mnistExamples) {
    return (
      <div className="mt-6 rounded-xl border border-ink-300/15 bg-white/50 p-4 text-center text-xs text-ink-300">
        train the network on mnist first, then you can decompose it with a sparse autoencoder
      </div>
    );
  }

  const handleTrainSae = async () => {
    if (saeStatus === "training") return;
    setSaeStatus("training");
    setSaeFeatures(null);
    try {
      const { acts, hiddenDim } = extractHiddenActivations(
        activationReaders,
        mnistExamples
      );
      const sae = await trainSae(
        acts,
        hiddenDim,
        DEFAULT_SAE_CONFIG,
        (s) => pushSaeLoss(s.loss)
      );
      setSaeModel(sae);
      const features = computeSaeFeatures(sae, acts, 6);
      setSaeFeatures(features);
      setSaeStatus("done");
    } catch (e) {
      console.error("SAE training failed:", e);
      setSaeStatus("idle");
    }
  };

  const training = saeStatus === "training";
  const done = saeStatus === "done" && saeFeatures;

  // alive features = non-zero mean activation. dead features are a normal
  // byproduct of overcomplete SAE training — filter from display but keep
  // them in saeFeatures[].
  const aliveFeatures = (saeFeatures || []).filter((f) => f.meanActivation > 0.001);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-mono text-xs uppercase tracking-wider text-ink-500">
            sparse autoencoder
          </h2>
          <p className="mt-1 text-xs text-ink-300">
            decompose the hidden layer into clean monosemantic features
          </p>
        </div>
        {!done && (
          <button
            onClick={handleTrainSae}
            disabled={training}
            className="rounded-full bg-lavender-300 px-4 py-1.5 text-xs font-medium text-ink-900 transition hover:bg-lavender-200 disabled:opacity-40"
          >
            {training ? "training sae…" : "train sae"}
          </button>
        )}
        {done && (
          <span className="font-mono text-[10px] text-ink-500">
            {aliveFeatures.length} alive / {saeFeatures!.length} features
          </span>
        )}
      </div>

      {training && (
        <div className="mt-3 text-xs text-ink-500">
          epoch {saeTrainingLoss.length} · loss {saeTrainingLoss.at(-1)?.toFixed(4) ?? "…"}
        </div>
      )}

      {done && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {aliveFeatures.slice(0, 12).map((f) => (
            <div
              key={f.featureIdx}
              className="rounded-lg border border-ink-300/15 bg-white/60 p-2"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[10px] text-ink-700">
                  feature {f.featureIdx}
                </span>
                <span className="font-mono text-[9px] text-ink-300">
                  μ {f.meanActivation.toFixed(2)}
                </span>
              </div>
              <div className="flex gap-0.5">
                {f.topExamples.slice(0, 4).map((ex) => (
                  <DigitThumb
                    key={ex.exampleIdx}
                    pixels={mnistExamples[ex.exampleIdx].pixels}
                    size={28}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
