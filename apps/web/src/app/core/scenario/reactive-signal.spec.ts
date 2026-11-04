import { DestroyRef, Injector, runInInjectionContext, signal } from '@angular/core';
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

function inContext<T>(fn: () => T): T {
  return runInInjectionContext(TestBed.inject(Injector), fn);
}

describe('reactiveSignal (shared store → Angular signals)', () => {
  it('tracks the same value as a Vue computed through edits, undo and redo', () => {
    const store = loadNarvik();
    const unitActions = useUnitManipulations(store);
    const unitId = Object.keys(store.state.unitMap)[0];
    const name = inContext(() => reactiveSignal(() => store.state.unitMap[unitId].name));
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
    const unit = inContext(() => reactiveSignal(() => store.state.unitMap[unitId]));
    expect(unit().shortName).not.toBe('X1');
    unitActions.updateUnit(unitId, { shortName: 'X1' });
    expect(unit().shortName).toBe('X1');
    // A direct in-place mutation (UI state such as `_isOpen`, set without an undo entry).
    const before = unit()._isOpen;
    store.state.unitMap[unitId]._isOpen = !before;
    expect(unit()._isOpen).toBe(!before);
  });

  it('follows Angular signals read by the getter', () => {
    const store = loadNarvik();
    const [first, second] = Object.keys(store.state.unitMap);
    const id = signal(first);
    const name = inContext(() => reactiveSignal(() => store.state.unitMap[id()].name));
    expect(name()).toBe(store.state.unitMap[first].name);
    id.set(second);
    expect(name()).toBe(store.state.unitMap[second].name);
  });

  it('does not run the getter before the first read', () => {
    const store = loadNarvik();
    let runs = 0;
    const value = inContext(() =>
      reactiveSignal(() => {
        runs++;
        return store.state.unitMap[Object.keys(store.state.unitMap)[0]].name;
      }),
    );
    expect(runs).toBe(0);
    value();
    expect(runs).toBe(1);
  });

  it('stops tracking when its owner is destroyed', () => {
    const store = loadNarvik();
    const unitId = Object.keys(store.state.unitMap)[0];
    const hooks: (() => void)[] = [];
    const destroyRef = {
      onDestroy: (fn: () => void) => {
        hooks.push(fn);
        return () => undefined;
      },
    } as unknown as DestroyRef;
    let runs = 0;
    const name = reactiveSignal(
      () => {
        runs++;
        return store.state.unitMap[unitId].name;
      },
      { destroyRef },
    );
    name();
    expect(runs).toBe(1);
    hooks.forEach((fn) => fn());
    useUnitManipulations(store).updateUnit(unitId, { name: 'After destroy' });
    name();
    expect(runs).toBe(1);
  });
});
