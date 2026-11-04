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
  watch,
} from '@vue/reactivity';
export type {
  ComputedRef,
  MaybeRef,
  MaybeRefOrGetter,
  Ref,
  ShallowRef,
  UnwrapRef,
  WatchHandle,
  WritableComputedRef,
} from '@vue/reactivity';

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
