import { DestroyRef, inject, Injectable, Injector, type Signal } from '@angular/core';
import { useScenario, type TScenario } from '@/scenariostore';
import { reactiveSignal } from './reactive-signal';

/**
 * Angular entry point to the shared scenario store (`src/scenariostore`).
 *
 * The store, its undo/redo stack (Immer patches applied as RFC 6902) and its domain actions are
 * the Vue app's, unchanged. This service only exposes them: `scenario` gives the same object as
 * `useScenario().scenario.value` for actions, and `select` turns reactive reads into signals.
 */
@Injectable({ providedIn: 'root' })
export class ScenarioService {
  private readonly api = useScenario();
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  /** True once a scenario is loaded. */
  readonly isReady = reactiveSignal(() => this.api.isReady.value, { destroyRef: this.destroyRef });
  readonly isLoading = reactiveSignal(() => this.api.isLoading.value, {
    destroyRef: this.destroyRef,
  });
  /** Changes on every edit, undo and redo of the open scenario. */
  readonly revision = reactiveSignal(
    () => (this.api.isReady.value ? this.api.scenario.value.store.revision.value : 0),
    { destroyRef: this.destroyRef },
  );
  readonly canUndo = reactiveSignal(
    () => this.api.isReady.value && this.api.scenario.value.store.canUndo.value,
    { destroyRef: this.destroyRef },
  );
  readonly canRedo = reactiveSignal(
    () => this.api.isReady.value && this.api.scenario.value.store.canRedo.value,
    { destroyRef: this.destroyRef },
  );

  /** The domain API of the open scenario: store, unitActions, time, io, geo, helpers, settings. */
  get scenario(): TScenario {
    return this.api.scenario.value;
  }

  /**
   * A signal of a read of the open scenario. Called in a component, it lives as long as the
   * component; pass `injector` to call it elsewhere.
   */
  select<T>(getter: (scenario: TScenario) => T, injector?: Injector): Signal<T> {
    return reactiveSignal(() => getter(this.api.scenario.value), {
      injector: injector ?? this.injectorForCaller(),
    });
  }

  /** Like `select`, but `fallback` while no scenario is loaded. */
  selectWhenReady<T>(
    getter: (scenario: TScenario) => T,
    fallback: T,
    injector?: Injector,
  ): Signal<T> {
    return reactiveSignal(
      () => (this.api.isReady.value ? getter(this.api.scenario.value) : fallback),
      { injector: injector ?? this.injectorForCaller() },
    );
  }

  private injectorForCaller(): Injector | undefined {
    try {
      return inject(Injector);
    } catch {
      return this.injector;
    }
  }

  undo(): boolean {
    return this.scenario.store.undo();
  }

  redo(): boolean {
    return this.scenario.store.redo();
  }
}
