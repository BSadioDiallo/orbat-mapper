import {
  assertInInjectionContext,
  DestroyRef,
  inject,
  type Injector,
  type Signal,
  signal,
} from '@angular/core';
import { effect, stop } from '@vue/reactivity';

export interface ReactiveSignalOptions {
  /** Where to tie the subscription's lifetime. Defaults to the current injection context. */
  injector?: Injector;
  /** Manual lifetime, for code outside an injection context (tests, services). */
  destroyRef?: DestroyRef;
}

/**
 * Turns a read of the shared reactive store into an Angular signal.
 *
 * `getter` runs inside a `@vue/reactivity` effect, which records exactly which reactive fields it
 * read. When one of them changes, the getter runs again and the signal is set. The store mutates
 * objects in place, thus a getter may return the same object after a change: the signal therefore
 * never compares values (`equal: () => false`) and notifies whenever the tracked fields changed.
 * Keep getters narrow (a name, a list of ids) so that unrelated edits do not notify.
 */
export function reactiveSignal<T>(getter: () => T, options: ReactiveSignalOptions = {}): Signal<T> {
  let destroyRef = options.destroyRef ?? options.injector?.get(DestroyRef);
  if (!destroyRef) {
    assertInInjectionContext(reactiveSignal);
    destroyRef = inject(DestroyRef);
  }
  let initialized = false;
  const state = signal<T>(undefined as T, { equal: () => false });
  const runner = effect(() => {
    const value = getter();
    if (initialized) {
      state.set(value);
    } else {
      initialized = true;
      state.set(value);
    }
  });
  destroyRef.onDestroy(() => stop(runner));
  return state.asReadonly();
}
