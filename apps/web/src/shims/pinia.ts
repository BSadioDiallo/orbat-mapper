/**
 * Stand-in for `pinia`, for the few stores the shared domain code imports (for instance
 * `io.ts` reads `useSymbolSettingsStore`). A store is a singleton `reactive` object per id, like a
 * Pinia store with one app: state refs are unwrapped, getters are computed, actions are bound.
 *
 * Angular UI state does not live here: it lives in signal-based services (DECISIONS.md, D-006).
 */
import { computed, reactive, toRefs } from '@vue/reactivity';

type AnyRecord = Record<string, unknown>;

interface OptionsStore {
  state?: () => AnyRecord;
  getters?: Record<string, (state: any) => unknown>;
  actions?: Record<string, (...args: any[]) => unknown>;
}

const stores = new Map<string, AnyRecord>();

export function defineStore(id: string, definition: OptionsStore | (() => AnyRecord)): any {
  return function useStore() {
    const existing = stores.get(id);
    if (existing) return existing;
    let store: AnyRecord;
    if (typeof definition === 'function') {
      store = reactive(definition()) as AnyRecord;
    } else {
      store = reactive({ ...(definition.state?.() ?? {}) }) as AnyRecord;
      for (const [name, getter] of Object.entries(definition.getters ?? {})) {
        const value = computed(() => getter.call(store, store));
        Object.defineProperty(store, name, { get: () => value.value, enumerable: true });
      }
      for (const [name, action] of Object.entries(definition.actions ?? {})) {
        store[name] = action.bind(store);
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
