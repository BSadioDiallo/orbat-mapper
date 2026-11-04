/**
 * The same steps run by the Vue reference (vue-reference.parity.ts) and by the Angular test
 * (parity.spec.ts, next to this file), on the same demo files.
 */
import type { NewScenarioStore } from '@/scenariostore/newScenarioStore';
import type { Scenario } from '@/types/scenarioModels';

interface Io {
  loadFromObject: (data: Scenario) => void;
  serializeToObject: () => Scenario;
}
interface Ctx {
  io: Io;
  store: { value: NewScenarioStore };
  useUnitManipulations: (store: NewScenarioStore) => {
    updateUnit: (id: string, data: { name: string }) => void;
  };
}

function normalize(scenario: Scenario): Scenario {
  const copy = JSON.parse(JSON.stringify(scenario)) as Scenario;
  if (copy.meta) {
    copy.meta.createdDate = '<date>';
    copy.meta.lastModifiedDate = '<date>';
  }
  return copy;
}

export function runParityScript(demos: Record<string, unknown>, create: () => Ctx) {
  const out: Record<string, unknown> = {};
  for (const [name, data] of Object.entries(demos)) {
    const { io, store, useUnitManipulations } = create();
    io.loadFromObject(JSON.parse(JSON.stringify(data)) as Scenario);
    const loaded = normalize(io.serializeToObject());
    const unitId = Object.keys(store.value.state.unitMap).sort()[0];
    useUnitManipulations(store.value).updateUnit(unitId, { name: 'Parity rename' });
    const edited = normalize(io.serializeToObject());
    store.value.undo();
    const undone = normalize(io.serializeToObject());
    store.value.redo();
    const redone = normalize(io.serializeToObject());
    out[name] = {
      loaded,
      edited,
      undoneEqualsLoaded: JSON.stringify(undone) === JSON.stringify(loaded),
      redoneEqualsEdited: JSON.stringify(redone) === JSON.stringify(edited),
      canUndo: store.value.canUndo.value,
    };
  }
  return out;
}
