import {
  assertInInjectionContext,
  computed,
  DestroyRef,
  inject,
  type Injector,
  type Signal,
  signal,
} from '@angular/core';
import { ReactiveEffect } from '@vue/reactivity';

export interface ReactiveSignalOptions {
  /** Where to tie the subscription's lifetime. Defaults to the current injection context. */
  injector?: Injector;
  /** Manual lifetime, for code outside an injection context (tests, services). */
  destroyRef?: DestroyRef;
}

/**
 * Turns a read of the shared reactive store into an Angular signal.
 *
 * The result is a lazy Angular `computed`. Each evaluation runs `getter` inside a
 * `@vue/reactivity` `ReactiveEffect`, so both kinds of dependencies are recorded:
 * - reactive fields of the store: when one changes, the effect's scheduler bumps a version signal,
 *   which invalidates the computed;
 * - Angular signals read by `getter` (component inputs, settings): tracked by the computed itself.
 *
 * The store mutates objects in place, thus a getter may return the same object after a change:
 * the computed never compares values (`equal: () => false`) and notifies whenever a dependency
 * changed. Keep getters narrow (a name, a list of ids) so that unrelated edits do not notify.
 * Nothing runs before the first read, so component inputs are available to `getter`.
 */
export function reactiveSignal<T>(getter: () => T, options: ReactiveSignalOptions = {}): Signal<T> {
  let destroyRef = options.destroyRef ?? options.injector?.get(DestroyRef);
  if (!destroyRef) {
    assertInInjectionContext(reactiveSignal);
    destroyRef = inject(DestroyRef);
  }
  const version = signal(0);
  const reactiveEffect = new ReactiveEffect(getter);
  reactiveEffect.scheduler = () => version.update((v) => v + 1);
  destroyRef.onDestroy(() => reactiveEffect.stop());
  return computed(
    () => {
      version();
      return reactiveEffect.run();
    },
    { equal: () => false },
  );
}
