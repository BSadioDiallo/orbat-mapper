/** Replaces `@/geo/dayNightTerminator.worker?worker&inline` (see shortest-path-worker.ts). */
function DayNightTerminatorWorker(): Worker {
  return new Worker(new URL('../../../../../src/geo/dayNightTerminator.worker', import.meta.url), {
    type: 'module',
  });
}

export default DayNightTerminatorWorker as unknown as new () => Worker;
