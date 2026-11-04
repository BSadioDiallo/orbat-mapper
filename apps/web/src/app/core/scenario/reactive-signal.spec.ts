import { DestroyRef, Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { computed as vueComputed } from '@vue/reactivity';
import { useNewScenarioStore } from '@/scenariostore/newScenarioStore';
import { useUnitManipulations } from '@/scenariostore/unitManipulations';
import narvik from '../../../../public/scenarios/narvik40.json';
import type { Scenario } from '@/types/scenarioModels';
import { reactiveSignal } from './reactive-signal';

function loadNarvik() {
  return useNewScenarioStore(structuredClone(narvik) as unknown as Scenario);
}

describe('reactiveSignal (shared store → Angular signals)', () => {
  it('tracks the same value as a Vue computed through edits, undo and redo', () => {
    const store = loadNarvik();
    const unitActions = useUnitManipulations(store);
    const unitId = Object.keys(store.state.unitMap)[0];
    const injector = TestBed.inject(Injector);
    const name = runInInjectionContext(injector, () =>
      reactiveSignal(() => store.state.unitMap[unitId].name),
    );
    const reference = vueComputed(() => store.state.unitMap[unitId].name);
    const original = reference.value;

    expect(name()).toBe(original);
    unitActions.updateUnit(unitId, { name: 'Renamed' });
    expect(reference.value).toBe('Renamed');
    expect(name()).toBe(reference.value);

    store.undo();
    expect(name()).toBe(original);
    expect(name()).toBe(reference.value);

    store.redo();
    expect(name()).toBe('Renamed');
    expect(name()).toBe(reference.value);
  });

  it('notifies when an object is mutated in place', () => {
    const store = loadNarvik();
    const unitActions = useUnitManipulations(store);
    const unitId = Object.keys(store.state.unitMap)[0];
    const injector = TestBed.inject(Injector);
    const unit = runInInjectionContext(injector, () =>
      reactiveSignal(() => ({ ...store.state.unitMap[unitId] })),
    );
    unitActions.updateUnit(unitId, { shortName: 'X1' });
    expect(unit().shortName).toBe('X1');
  });

  it('stops tracking when its injector is destroyed', () => {
    const store = loadNarvik();
    const unitId = Object.keys(store.state.unitMap)[0];
    const child = Injector.create({ providers: [], parent: TestBed.inject(Injector) });
    let destroyHooks: (() => void)[] = [];
    const destroyRef = {
      onDestroy: (fn: () => void) => {
        destroyHooks.push(fn);
        return () => undefined;
      },
    } as unknown as DestroyRef;
    let runs = 0;
    runInInjectionContext(child, () =>
      reactiveSignal(
        () => {
          runs++;
          return store.state.unitMap[unitId].name;
        },
        { destroyRef },
      ),
    );
    expect(runs).toBe(1);
    destroyHooks.forEach((fn) => fn());
    destroyHooks = [];
    useUnitManipulations(store).updateUnit(unitId, { name: 'After destroy' });
    expect(runs).toBe(1);
  });
});
