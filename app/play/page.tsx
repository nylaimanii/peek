"use client";

import { useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import { SiteHeader } from "@/components/SiteHeader";
import { Controls } from "@/components/play/Controls";
import { DataScatter } from "@/components/play/DataScatter";
import { LossCurve } from "@/components/play/LossCurve";
import { NetworkGraph } from "@/components/play/NetworkGraph";
import { usePlayground } from "@/store/playground";
import { generateDataset, datasetToTensors } from "@/lib/network/datasets";
import { buildModel } from "@/lib/network/model";
import { trainModel } from "@/lib/network/train";

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
  } = usePlayground();

  const trainingRef = useRef(false);

  // regenerate data whenever dataset or noise changes
  useEffect(() => {
    setData(generateDataset(dataset, nPoints, noise));
  }, [dataset, noise, nPoints, setData]);

  async function handleTrain() {
    if (trainingRef.current) return;
    trainingRef.current = true;

    startTraining();

    const { xs, ys } = datasetToTensors(data);
    const model = buildModel(config);

    await trainModel(model, xs, ys, epochs, 32, (s) => {
      pushTrainingStep(s.epoch, s.loss, s.accuracy);
    });

    finishTraining();

    xs.dispose();
    ys.dispose();
    model.dispose();
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
                {config.hiddenLayers} hidden {config.hiddenLayers === 1 ? "layer" : "layers"} · {config.neuronsPerLayer} neurons
              </span>
            </div>
            <div className="relative flex-1">
              <NetworkGraph />
            </div>
          </div>

          {/* right: output */}
          <aside className="flex flex-col gap-5 rounded-2xl border border-ink-300/20 bg-white/60 p-5 backdrop-blur">
            <div>
              <h2 className="font-mono text-xs uppercase tracking-wider text-ink-500">
                data
              </h2>
              <div className="mt-3 flex justify-center">
                <DataScatter data={data} size={220} />
              </div>
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
          </aside>
        </div>
      </section>
    </main>
  );
}
