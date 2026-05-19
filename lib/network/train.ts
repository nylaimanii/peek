import * as tf from "@tensorflow/tfjs";

export interface TrainStep {
  epoch: number;
  loss: number;
  accuracy: number;
}

/**
 * trains a model for `epochs` epochs and calls onStep after each epoch.
 * returns final loss + accuracy.
 *
 * non-blocking on the UI thread because each epoch yields back to the
 * event loop before the next one starts.
 */
export async function trainModel(
  model: tf.LayersModel,
  xs: tf.Tensor2D,
  ys: tf.Tensor2D,
  epochs: number,
  batchSize: number,
  onStep?: (step: TrainStep) => void
): Promise<TrainStep> {
  let lastLoss = 0;
  let lastAcc = 0;

  await model.fit(xs, ys, {
    epochs,
    batchSize,
    shuffle: true,
    callbacks: {
      onEpochEnd: async (epoch, logs) => {
        lastLoss = logs?.loss ?? 0;
        lastAcc = logs?.acc ?? 0;
        if (onStep) {
          onStep({ epoch, loss: lastLoss, accuracy: lastAcc });
        }
        // yield to the event loop so the UI can update
        await tf.nextFrame();
      },
    },
  });

  return { epoch: epochs - 1, loss: lastLoss, accuracy: lastAcc };
}
