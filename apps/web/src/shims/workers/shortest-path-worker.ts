/**
 * Replaces `@/geo/routing/shortestPath.worker?worker&inline` (a Vite worker import). The Angular
 * builder bundles a worker written as `new Worker(new URL(…, import.meta.url))`.
 */
function ShortestPathWorker(): Worker {
  return new Worker(
    new URL('../../../../../src/geo/routing/shortestPath.worker', import.meta.url),
    {
      type: 'module',
    },
  );
}

export default ShortestPathWorker as unknown as new () => Worker;
