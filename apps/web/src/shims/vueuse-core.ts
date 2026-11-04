/**
 * Stand-in for `@vueuse/core`, limited to the functions the shared framework-independent code
 * imports (see src/shims/vue.ts for why). Each one keeps the contract the shared code relies on.
 */
import { ref, shallowRef, type Ref, type WatchSource } from '@vue/reactivity';
import { watch } from './vue';

export type EventHookOn<T> = (fn: (param: T) => void) => { off: () => void };

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

export interface Serializer<T> {
  read: (raw: string) => T;
  write: (value: T) => string;
}

/** VueUse's serializers, by the name the shared code uses. */
export const StorageSerializers = {
  boolean: { read: (v: string) => v === 'true', write: (v: boolean) => String(v) },
  object: { read: (v: string) => JSON.parse(v), write: (v: unknown) => JSON.stringify(v) },
  number: { read: (v: string) => Number.parseFloat(v), write: (v: number) => String(v) },
  any: { read: (v: string) => v, write: (v: unknown) => String(v) },
  string: { read: (v: string) => v, write: (v: string) => String(v) },
} satisfies Record<string, Serializer<any>>;

function readStorage<T>(key: string, initial: T, serializer?: Serializer<T>): T {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    if (raw === null || raw === undefined) return initial;
    if (serializer) return serializer.read(raw);
    if (typeof initial === 'string') return raw as T;
    if (typeof initial === 'number') return Number(raw) as T;
    if (typeof initial === 'boolean') return (raw === 'true') as T;
    return JSON.parse(raw) as T;
  } catch {
    return initial;
  }
}

function writeStorage<T>(key: string, value: T, serializer?: Serializer<T>): void {
  try {
    if (value === null || value === undefined) {
      globalThis.localStorage?.removeItem(key);
      return;
    }
    const raw = serializer
      ? serializer.write(value)
      : typeof value === 'string'
        ? value
        : JSON.stringify(value);
    globalThis.localStorage?.setItem(key, raw);
  } catch {
    // Storage may be unavailable (private mode, quota). VueUse also swallows these errors.
  }
}

/** A ref kept in sync with `localStorage`, serialized like VueUse does for each primitive type. */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: { serializer?: Serializer<T>; writeDefaults?: boolean; mergeDefaults?: boolean } = {},
): Ref<T> {
  const { serializer, writeDefaults = true, mergeDefaults = false } = options;
  let stored = readStorage(key, initialValue, serializer);
  // VueUse's `mergeDefaults: true`: a stored object is completed with the default's keys.
  if (mergeDefaults && stored && typeof stored === 'object' && !Array.isArray(stored)) {
    stored = { ...(initialValue as object), ...(stored as object) } as T;
  }
  const data = ref(stored) as Ref<T>;
  if (writeDefaults && globalThis.localStorage?.getItem(key) === null) {
    writeStorage(key, initialValue, serializer);
  }
  watch(data, (value) => writeStorage(key, value as T, serializer), { deep: true, flush: 'sync' });
  return data;
}

export const useStorage = useLocalStorage;

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
