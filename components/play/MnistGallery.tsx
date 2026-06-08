"use client";

import { usePlayground } from "@/store/playground";
import { MNIST_DIM } from "@/lib/network/mnist";
import { readActivations } from "@/lib/network/activations";

function DigitThumb({
  pixels,
  size = 48,
  highlighted = false,
}: {
  pixels: Float32Array;
  size?: number;
  highlighted?: boolean;
}) {
  // render as a tight grid of grayscale divs — small enough that
  // a canvas would be overkill; svg + rects keeps it crisp.
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
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`rounded-md ${
        highlighted
          ? "ring-2 ring-mint-300 bg-white"
          : "bg-white/80 hover:bg-white"
      } transition`}
    >
      {rects}
    </svg>
  );
}

export function MnistGallery() {
  const mnistExamples = usePlayground((s) => s.mnistExamples);
  const selectedMnistIdx = usePlayground((s) => s.selectedMnistIdx);
  const setSelectedMnistIdx = usePlayground((s) => s.setSelectedMnistIdx);
  const trainedModel = usePlayground((s) => s.trainedModel);
  const activationReaders = usePlayground((s) => s.activationReaders);
  const setActivations = usePlayground((s) => s.setActivations);

  if (!mnistExamples) {
    return (
      <div className="rounded-xl border border-ink-300/15 bg-white/50 p-4 text-center text-xs text-ink-300">
        loading mnist examples…
      </div>
    );
  }

  // show first 36 as a 6x6 grid
  const shown = mnistExamples.slice(0, 36);

  return (
    <div>
      <h2 className="font-mono text-xs uppercase tracking-wider text-ink-500">
        digits
      </h2>
      <p className="mt-1 text-xs text-ink-300">
        click one to trace it through the network.
      </p>
      <div className="mt-3 grid grid-cols-6 gap-1.5">
        {shown.map((ex, i) => (
          <button
            key={i}
            onClick={() => {
              setSelectedMnistIdx(i);
              if (activationReaders && trainedModel) {
                const fv = Array.from(ex.pixels);
                const acts = readActivations(activationReaders, fv);
                setActivations(acts);
              }
            }}
            className="aspect-square"
            title={`label: ${ex.label === 0 ? "A" : "B"}`}
          >
            <DigitThumb
              pixels={ex.pixels}
              size={48}
              highlighted={selectedMnistIdx === i}
            />
          </button>
        ))}
      </div>
      {selectedMnistIdx !== null && (
        <p className="mt-3 text-center text-xs text-ink-500">
          showing activations for digit #{selectedMnistIdx + 1} (label{" "}
          {mnistExamples[selectedMnistIdx].label === 0 ? "A" : "B"})
        </p>
      )}
    </div>
  );
}
