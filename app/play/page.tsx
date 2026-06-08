"use client";

import { useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import { SiteHeader } from "@/components/SiteHeader";
import { Controls } from "@/components/play/Controls";
import { DataScatter } from "@/components/play/DataScatter";
import { LossCurve } from "@/components/play/LossCurve";
import { NetworkGraph } from "@/components/play/NetworkGraph";
import { BoundaryCanvas } from "@/components/play/BoundaryCanvas";
import { NeuronInspector } from "@/components/play/NeuronInspector";
import { MnistGallery } from "@/components/play/MnistGallery";
import {
  generateMnistDataset,
  mnistToTensors,
  MNIST_INPUT_SIZE,
} from "@/lib/network/mnist";
import { usePlayground } from "@/store/playground";
import { generateDataset } from "@/lib/network/datasets";
import { buildModel } from "@/lib/network/model";
import { trainModel } from "@/lib/network/train";
import { buildActivationReaders, readActivations } from "@/lib/network/activations";
import { featureVector, dataToFeatureTensors } from "@/lib/network/features";
import { predictGrid } from "@/lib/network/predict";
import { ablatedPredictGrid } from "@/lib/network/ablate";
import { extractWeights } from "@/lib/network/graph";

export default function PlayPage() {
  const {
    dataset,
    noise,
    nPoints,
    data,
    setData,
    config,
    epochs,
    status,
    currentEpoch,
    loss,
    accuracy,
    lossHistory,
    accHistory,
    startTraining,
    pushTrainingStep,
    finishTraining,
    trainedModel,
    activationReaders,
    selectedPoint,
    setTrainedModel,
    setSelectedPoint,
    setActivations,
    activeFeatures,
    predictionGrid,
    gridRes,
    setPredictionGrid,
    weights,
    setWeights,
    mnistExamples,
    setMnistExamples,
    ablatedNeurons,
    clearAblations,
  } = usePlayground();

  const trainingRef = useRef(false);

  // regenerate data whenever dataset or noise changes
  useEffect(() => {
    setData(generateDataset(dataset, nPoints, noise));
  }, [dataset, noise, nPoints, setData]);

  // lazily generate mnist examples when the user picks it
  useEffect(() => {
    if (dataset === "mnist" && !mnistExamples) {
      setMnistExamples(generateMnistDataset(1000));
    }
  }, [dataset, mnistExamples, setMnistExamples]);

  // re-render the boundary heatmap whenever ablations change. when the set
  // is empty we run the regular predictGrid (restore clean boundary); when
  // it's non-empty we run ablatedPredictGrid (zero out the selected neurons
  // in the manual forward pass).
  useEffect(() => {
    if (!trainedModel || dataset === "mnist") return;
    if (ablatedNeurons.size === 0) {
      try {
        const clean = predictGrid(trainedModel, activeFeatures, gridRes);
        setPredictionGrid(clean);
      } catch {
        /* ignore */
      }
      return;
    }
    try {
      const ablatedGrid = ablatedPredictGrid(
        trainedModel,
        activeFeatures,
        ablatedNeurons,
        gridRes
      );
      setPredictionGrid(ablatedGrid);
    } catch (e) {
      console.warn("ablation grid failed:", e);
    }
  }, [ablatedNeurons, trainedModel, activeFeatures, dataset, gridRes, setPredictionGrid]);

  async function handleTrain() {
    if (trainingRef.current) return;
    trainingRef.current = true;

    // dispose any previous trained model + readers before retraining
    const prev = usePlayground.getState();
    try {
      if (prev.trainedModel) prev.trainedModel.dispose();
    } catch {
      // already disposed — ignore
    }
    try {
      if (prev.activationReaders) {
        prev.activationReaders.forEach((r) => {
          try {
            r.dispose();
          } catch {
            // reader already disposed — ignore
          }
        });
      }
    } catch {
      // ignore
    }
    setTrainedModel(null, null);

    startTraining();

    let xs: import("@tensorflow/tfjs").Tensor2D;
    let ys: import("@tensorflow/tfjs").Tensor2D;
    let inputDim: number;
    if (dataset === "mnist") {
      if (!mnistExamples) {
        trainingRef.current = false;
        return;
      }
      const t = mnistToTensors(mnistExamples);
      xs = t.xs;
      ys = t.ys;
      inputDim = MNIST_INPUT_SIZE;
    } else {
      const t = dataToFeatureTensors(data, activeFeatures);
      xs = t.xs;
      ys = t.ys;
      inputDim = activeFeatures.length;
    }
    const model = buildModel(config, inputDim);

    const BOUNDARY_SAMPLE_EVERY = 5;

    await trainModel(model, xs, ys, epochs, 32, (s) => {
      pushTrainingStep(s.epoch, s.loss, s.accuracy);

      // live boundary sampling — skip mnist (no 2D boundary)
      if (dataset !== "mnist" && s.epoch % BOUNDARY_SAMPLE_EVERY === 0) {
        try {
          const liveGrid = predictGrid(
            model,
            activeFeatures,
            usePlayground.getState().gridRes
          );
          setPredictionGrid(liveGrid);
        } catch {
          // mid-train predictGrid may throw transiently — skip silently
        }
      }
    });

    finishTraining();

    // build activation readers and KEEP the model alive for the flow view
    const readers = buildActivationReaders(model);
    setTrainedModel(model, readers);

    // compute the decision-boundary grid for the heatmap behind the scatter
    // (skip for mnist — 2D grid samplers don't match the 784-dim input model)
    if (dataset !== "mnist") {
      const grid = predictGrid(model, activeFeatures, usePlayground.getState().gridRes);
      setPredictionGrid(grid);
    }
    setWeights(extractWeights(model));

    xs.dispose();
    ys.dispose();
    // NOTE: model is intentionally NOT disposed — needed for activations
    trainingRef.current = false;
    console.log("backend:", tf.getBackend());
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-paper text-ink-900">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-mint-200 blur-3xl opacity-60"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -right-40 h-[480px] w-[480px] rounded-full bg-lavender-200 blur-3xl opacity-50"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/4 h-[440px] w-[440px] rounded-full bg-pink-200 blur-3xl opacity-40"
      />

      <SiteHeader />

      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-12 pb-32">
        <div className="mb-12">
          <span className="font-mono text-xs uppercase tracking-wider text-ink-500">
            playground
          </span>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
            train a network
          </h1>
          <p className="mt-3 max-w-xl text-base text-ink-500">
            pick a dataset, wire up the network, then watch it learn.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr_300px]">
          {/* left: controls */}
          <aside className="rounded-2xl border border-ink-300/20 bg-white/60 p-5 backdrop-blur">
            <Controls onTrain={handleTrain} />
          </aside>

          {/* center: network graph */}
          <div className="flex min-h-[480px] flex-col rounded-2xl border border-ink-300/20 bg-white/60 backdrop-blur">
            <div className="flex items-center justify-between border-b border-ink-300/15 px-5 py-3">
              <span className="font-mono text-xs uppercase tracking-wider text-ink-500">
                network
              </span>
              <span className="font-mono text-xs text-ink-300">
                {config.neuronCounts.length} hidden {config.neuronCounts.length === 1 ? "layer" : "layers"} · [{config.neuronCounts.join(", ")}]
              </span>
              {weights && (
                <span className="ml-3 flex items-center gap-2 font-mono text-[10px] text-ink-300">
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-0.5 w-3 bg-mint-300" />+
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-0.5 w-3 bg-pink-300" />−
                  </span>
                </span>
              )}
              {ablatedNeurons.size > 0 && (
                <button
                  onClick={clearAblations}
                  className="ml-3 rounded-md border border-ink-300/30 bg-white/70 px-2 py-0.5 font-mono text-[10px] text-ink-700 transition hover:border-pink-300"
                  title="restore all ablated neurons"
                >
                  un-ablate ({ablatedNeurons.size})
                </button>
              )}
            </div>
            <div className="relative flex-1">
              <NetworkGraph />
            </div>
          </div>

          {/* right: output */}
          <aside className="flex flex-col gap-5 rounded-2xl border border-ink-300/20 bg-white/60 p-5 backdrop-blur">
            <div>
              <h2 className="font-mono text-xs uppercase tracking-wider text-ink-500">
                {dataset === "mnist" ? "input" : "data"}
              </h2>
              {dataset === "mnist" ? (
                <div className="mt-3">
                  <MnistGallery />
                </div>
              ) : (
                <>
                  <div
                    className="relative mx-auto mt-3"
                    style={{ width: 220, height: 220 }}
                  >
                    <BoundaryCanvas
                      grid={predictionGrid}
                      res={gridRes}
                      size={220}
                    />
                    <div className="absolute inset-0">
                      <DataScatter
                        data={data}
                        size={220}
                        selected={selectedPoint}
                        onSelect={(p) => {
                          setSelectedPoint(p);
                          if (activationReaders) {
                            const fv = featureVector(p.x, p.y, activeFeatures);
                            const acts = readActivations(activationReaders, fv);
                            setActivations(acts);
                          }
                        }}
                      />
                    </div>
                  </div>
                  {trainedModel && !selectedPoint && (
                    <p className="mt-2 text-center text-xs text-ink-300">
                      click a point to watch it flow through the network
                    </p>
                  )}
                  {selectedPoint && (
                    <p className="mt-2 text-center text-xs text-ink-500">
                      showing activations for ({selectedPoint.x.toFixed(2)}, {selectedPoint.y.toFixed(2)})
                    </p>
                  )}
                </>
              )}
            </div>
            <div>
              <h2 className="font-mono text-xs uppercase tracking-wider text-ink-500">
                output
              </h2>
            </div>

            <div className="font-mono text-sm">
              <div className="flex justify-between text-ink-500">
                <span>status</span>
                <span className="text-ink-900">{status}</span>
              </div>
              <div className="mt-1 flex justify-between text-ink-500">
                <span>epoch</span>
                <span className="text-ink-900">
                  {status === "idle" ? "—" : `${currentEpoch + 1} / ${epochs}`}
                </span>
              </div>
              <div className="mt-1 flex justify-between text-ink-500">
                <span>loss</span>
                <span className="text-pink-300">
                  {status === "idle" ? "—" : loss.toFixed(4)}
                </span>
              </div>
              <div className="mt-1 flex justify-between text-ink-500">
                <span>accuracy</span>
                <span className="text-mint-300">
                  {status === "idle" ? "—" : `${(accuracy * 100).toFixed(1)}%`}
                </span>
              </div>
            </div>

            <LossCurve
              lossHistory={lossHistory}
              accHistory={accHistory}
              width={260}
              height={120}
            />
            <div className="flex items-center gap-3 text-xs text-ink-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-pink-300" />
                loss
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-mint-300" />
                accuracy
              </span>
            </div>

            <NeuronInspector />
          </aside>
        </div>
      </section>
    </main>
  );
}
