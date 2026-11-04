/**
 * Stand-in for `pinia`, for the few stores the shared domain code imports (for instance
 * `io.ts` reads `useSymbolSettingsStore`). A store is a singleton `reactive` object per id, like a
 * Pinia store with one app: state refs are unwrapped, getters are computed, actions are bound.
 *
 * Angular UI state does not live here: it lives in signal-based services (DECISIONS.md, D-006).
 */
import { computed, reactive, toRefs, type UnwrapNestedRefs, type UnwrapRef } from '@vue/reactivity';

type AnyRecord = Record<string, unknown>;

type StoreGetters<G> = {
  readonly [K in keyof G]: G[K] extends (...args: any[]) => infer R ? R : never;
};

type OptionsStore<S extends AnyRecord, G, A> = UnwrapRef<S> & StoreGetters<G> & A & { $id: string };

interface OptionsDefinition<S extends AnyRecord, G, A> {
  state?: () => S;
  getters?: G &
    ThisType<UnwrapRef<S> & StoreGetters<G>> &
    Record<string, (state: UnwrapRef<S>) => unknown>;
  actions?: A & ThisType<A & UnwrapRef<S> & StoreGetters<G>>;
}

const stores = new Map<string, unknown>();

/** Options store, typed like Pinia's: state refs unwrapped, getters as values, actions bound. */
export function defineStore<S extends AnyRecord, G = object, A = object>(
  id: string,
  definition: OptionsDefinition<S, G, A>,
): () => OptionsStore<S, G, A>;
/** Setup store: the returned refs are unwrapped, as in Pinia. */
export function defineStore<SS extends AnyRecord>(
  id: string,
  setup: () => SS,
): () => UnwrapNestedRefs<SS> & { $id: string };
export function defineStore(
  id: string,
  definition: OptionsDefinition<AnyRecord, AnyRecord, AnyRecord> | (() => AnyRecord),
): () => unknown {
  return function useStore() {
    const existing = stores.get(id);
    if (existing) return existing;
    let store: AnyRecord;
    if (typeof definition === 'function') {
      store = reactive(definition()) as AnyRecord;
    } else {
      store = reactive({ ...(definition.state?.() ?? {}) }) as AnyRecord;
      for (const [name, getter] of Object.entries(definition.getters ?? {})) {
        const value = computed(() => (getter as (s: unknown) => unknown).call(store, store));
        Object.defineProperty(store, name, { get: () => value.value, enumerable: true });
      }
      for (const [name, action] of Object.entries(definition.actions ?? {})) {
        store[name] = (action as (...args: unknown[]) => unknown).bind(store);
      }
    }
    store['$id'] = id;
    stores.set(id, store);
    return store;
  };
}

export function storeToRefs<T extends object>(store: T) {
  return toRefs(store);
}

/** Test helper: forget every store, as a fresh Pinia would. */
export function resetShimStores(): void {
  stores.clear();
}

export function createPinia() {
  return { install() {} };
}

export function setActivePinia(_pinia: unknown) {}
