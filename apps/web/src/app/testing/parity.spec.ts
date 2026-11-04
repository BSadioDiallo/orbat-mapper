import { shallowRef } from '@vue/reactivity';
import { useScenarioIO } from '@/scenariostore/io';
import type { NewScenarioStore } from '@/scenariostore/newScenarioStore';
import { useUnitManipulations } from '@/scenariostore/unitManipulations';
import falkland from '../../../public/scenarios/falkland82.json';
import narvik from '../../../public/scenarios/narvik40.json';
import northernStorm from '../../../public/scenarios/northern-storm-85.json';
import { runParityScript } from './parity-script';
import reference from './vue-reference.json';

/**
 * Data parity with the Vue app: the same steps on the same demos give the same serialized
 * scenarios as the Vue reference (apps/web/parity/vue-reference.parity.ts, real Vue + Pinia).
 * Regenerate the reference with `npx vitest run --config apps/web/parity/vitest.parity.config.mts`.
 */
describe('data parity with the Vue app', () => {
  const angular = runParityScript(
    { falkland82: falkland, narvik40: narvik, northernstorm85: northernStorm },
    () => {
      const store = shallowRef<NewScenarioStore>({} as NewScenarioStore);
      return { io: useScenarioIO(store), store, useUnitManipulations };
    },
  ) as Record<string, Record<string, unknown>>;

  for (const name of Object.keys(reference)) {
    it(`${name}: load, edit, undo and redo serialize as in the Vue app`, () => {
      const vue = (reference as Record<string, Record<string, unknown>>)[name];
      expect(angular[name]['loaded']).toEqual(vue['loaded']);
      expect(angular[name]['edited']).toEqual(vue['edited']);
      expect(angular[name]['undoneEqualsLoaded']).toBe(true);
      expect(angular[name]['redoneEqualsEdited']).toBe(true);
      expect(angular[name]['canUndo']).toBe(vue['canUndo']);
    });
  }
});
