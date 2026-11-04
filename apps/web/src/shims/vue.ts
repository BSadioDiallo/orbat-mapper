/**
 * Stand-in for the `vue` module, for the framework-independent code shared with the Vue app.
 *
 * The scenario store and its domain modules (`src/scenariostore/*`, part of `src/geo/*`) were
 * written against Vue's reactivity: deep `reactive` proxies mutated in place, `computed`,
 * `toRaw`, `watch`. Rewriting that code would break the rule that the domain logic is kept as is
 * (docs/migration/DECISIONS.md, D-004). This module maps the `vue` import of that code to
 * `@vue/reactivity`, the framework-independent reactivity package. No Vue UI runtime is bundled.
 *
 * Angular code never imports this module: it reads the store through `ScenarioStoreBridge`, which
 * turns reactive reads into Angular signals.
 */
export {
  computed,
  customRef,
  effect,
  effectScope,
  isProxy,
  isReactive,
  isReadonly,
  isRef,
  markRaw,
  reactive,
  readonly,
  ref,
  shallowReactive,
  shallowReadonly,
  shallowRef,
  stop,
  toRaw,
  toRef,
  toRefs,
  toValue,
  triggerRef,
  unref,
} from '@vue/reactivity';
import {
  watch as reactivityWatch,
  type WatchCallback,
  type WatchEffect,
  type WatchHandle,
  type WatchOptions as ReactivityWatchOptions,
  type WatchSource,
} from '@vue/reactivity';

export type {
  ComputedRef,
  MaybeRef,
  MaybeRefOrGetter,
  Ref,
  ShallowRef,
  UnwrapRef,
  WatchCallback,
  WatchEffect,
  WatchHandle,
  WatchSource,
  WritableComputedRef,
} from '@vue/reactivity';

/** The `flush` timings of Vue's runtime `watch`, which `@vue/reactivity`'s `watch` lacks. */
export type WatchFlush = 'pre' | 'post' | 'sync';
export type WatchOptions<Immediate = boolean> = Omit<
  ReactivityWatchOptions<Immediate>,
  'scheduler'
> & {
  flush?: WatchFlush;
};

const queuedJobs = new Set<() => void>();
let flushQueued = false;

function queueJob(job: () => void): void {
  queuedJobs.add(job);
  if (flushQueued) return;
  flushQueued = true;
  queueMicrotask(() => {
    flushQueued = false;
    const jobs = [...queuedJobs];
    queuedJobs.clear();
    for (const run of jobs) run();
  });
}

/**
 * Vue's `watch`: with the default `flush: 'pre'` (and `'post'`) the callback runs after the
 * current synchronous code, once per tick, as in a Vue app; `flush: 'sync'` runs it at once.
 * There is no render here, thus `pre` and `post` both run in a microtask.
 */
export function watch(
  source: WatchSource | WatchSource[] | WatchEffect | object,
  cb?: WatchCallback | null,
  options: WatchOptions = {},
): WatchHandle {
  const { flush, ...rest } = options;
  if (flush === 'sync') return reactivityWatch(source, cb, rest);
  return reactivityWatch(source, cb, {
    ...rest,
    scheduler: (job, isFirstRun) => {
      if (isFirstRun) job();
      else queueJob(job);
    },
  });
}

export function watchEffect(effectFn: WatchEffect, options: WatchOptions = {}): WatchHandle {
  return watch(effectFn, null, options);
}

export function watchSyncEffect(effectFn: WatchEffect): WatchHandle {
  return watch(effectFn, null, { flush: 'sync' });
}

export function watchPostEffect(effectFn: WatchEffect): WatchHandle {
  return watch(effectFn, null, { flush: 'post' });
}

/** Shared code calls these only from Vue components, never on the paths Angular uses. */
export function onUnmounted(_hook: () => void): void {}
export function onMounted(_hook: () => void): void {}
export function onBeforeUpdate(_hook: () => void): void {}
export function onBeforeUnmount(_hook: () => void): void {}
export function getCurrentInstance(): null {
  return null;
}
export function nextTick(fn?: () => void): Promise<void> {
  return Promise.resolve().then(fn);
}
export type InjectionKey<T> = symbol & { __type?: T };
export function inject<T>(_key: InjectionKey<T> | string, defaultValue?: T): T | undefined {
  return defaultValue;
}
export function provide<T>(_key: InjectionKey<T> | string, _value: T): void {}
