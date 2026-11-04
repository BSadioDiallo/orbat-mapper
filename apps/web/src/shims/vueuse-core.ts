/**
 * Stand-in for `@vueuse/core`, limited to the functions the shared framework-independent code
 * imports (see src/shims/vue.ts for why). Each one keeps the contract the shared code relies on.
 */
import { ref, shallowRef, watch, type Ref, type WatchSource } from '@vue/reactivity';

export interface EventHookOn<T> {
  (fn: (param: T) => void): { off: () => void };
}

export interface EventHook<T> {
  on: EventHookOn<T>;
  off: (fn: (param: T) => void) => void;
  trigger: (param: T) => Promise<unknown[]>;
  clear: () => void;
}

/** Same contract as VueUse's `createEventHook`: `on` returns `{ off }`, `trigger` awaits all. */
export function createEventHook<T = void>(): EventHook<T> {
  const fns = new Set<(param: T) => void>();
  const off = (fn: (param: T) => void) => {
    fns.delete(fn);
  };
  const on: EventHookOn<T> = (fn) => {
    fns.add(fn);
    return { off: () => off(fn) };
  };
  const trigger = (param: T) => Promise.all(Array.from(fns).map((fn) => fn(param)));
  const clear = () => fns.clear();
  return { on, off, trigger, clear };
}

function readStorage<T>(key: string, initial: T): T {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    if (raw === null || raw === undefined) return initial;
    if (typeof initial === 'string') return raw as T;
    if (typeof initial === 'number') return Number(raw) as T;
    if (typeof initial === 'boolean') return (raw === 'true') as T;
    return JSON.parse(raw) as T;
  } catch {
    return initial;
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    if (value === null || value === undefined) {
      globalThis.localStorage?.removeItem(key);
      return;
    }
    const raw = typeof value === 'string' ? value : JSON.stringify(value);
    globalThis.localStorage?.setItem(key, raw);
  } catch {
    // Storage may be unavailable (private mode, quota). VueUse also swallows these errors.
  }
}

/** A ref kept in sync with `localStorage`, serialized like VueUse does for each primitive type. */
export function useLocalStorage<T>(key: string, initialValue: T, _options?: unknown): Ref<T> {
  const data = ref(readStorage(key, initialValue)) as Ref<T>;
  if (globalThis.localStorage?.getItem(key) === null) writeStorage(key, initialValue);
  watch(data, (value) => writeStorage(key, value), { deep: true });
  return data;
}

export const useStorage = useLocalStorage;

export const StorageSerializers = {} as const;

/** `until(ref).toBe(value)`, the only form the shared code uses. */
export function until<T>(source: WatchSource<T> | Ref<T>) {
  return {
    toBe(value: T): Promise<void> {
      return new Promise((resolve) => {
        const stop = watch(
          source as WatchSource<T>,
          (current) => {
            if (current === value) {
              queueMicrotask(() => stop());
              resolve();
            }
          },
          { immediate: true },
        );
      });
    },
  };
}

/** The `useFetch(url).json()` form used by `io.ts#loadFromUrl`. */
export function useFetch<T = any>(url: string) {
  const data = shallowRef<T>(null as T);
  const error = shallowRef<unknown>(null);
  const statusCode = ref<number | null>(null);
  const isFinished = ref(false);
  const isFetching = ref(true);
  const run = () => {
    fetch(url)
      .then(async (response) => {
        statusCode.value = response.status;
        if (!response.ok) throw new Error(response.statusText || `HTTP ${response.status}`);
        data.value = (await response.json()) as T;
      })
      .catch((e: unknown) => {
        error.value = e;
      })
      .finally(() => {
        isFetching.value = false;
        isFinished.value = true;
      });
  };
  const result = {
    data,
    error,
    statusCode,
    isFinished,
    isFetching,
    // VueUse types the parsed body as `any` unless a type is given to `json`, as io.ts relies on.
    json: <J = any>() => result as unknown as Omit<typeof result, 'data'> & { data: Ref<J> },
  };
  run();
  return result;
}

export function watchDebounced<T>(
  source: WatchSource<T>,
  cb: (value: T) => void,
  options: { debounce?: number; deep?: boolean; immediate?: boolean } = {},
) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return watch(
    source,
    (value) => {
      clearTimeout(timer);
      timer = setTimeout(() => cb(value), options.debounce ?? 0);
    },
    { deep: options.deep, immediate: options.immediate },
  );
}

export function promiseTimeout(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
