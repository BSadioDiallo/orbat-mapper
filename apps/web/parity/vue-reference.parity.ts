/**
 * Writes the reference serializations used by apps/web/src/app/testing/parity.spec.ts, produced by
 * the Vue app's own modules (real Vue reactivity and Pinia). Run from the repository root:
 *
 *   npx vitest run --config apps/web/parity/vitest.parity.config.mts
 *
 * For each demo: load it with useScenarioIO, serialize it, then rename a unit, undo, redo and
 * serialize again. Timestamps that depend on the clock are normalized.
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createPinia, setActivePinia } from 'pinia';
import { shallowRef } from 'vue';
import { useScenarioIO } from '@/scenariostore/io';
import { useUnitManipulations } from '@/scenariostore/unitManipulations';
import type { NewScenarioStore } from '@/scenariostore/newScenarioStore';
import falkland from '../../../public/scenarios/falkland82.json';
import narvik from '../../../public/scenarios/narvik40.json';
import northernStorm from '../../../public/scenarios/northern-storm-85.json';
import '@/dayjs';
import { it } from 'vitest';
import { runParityScript } from '../src/app/testing/parity-script';

it('writes the Vue reference serializations', () => {
  setActivePinia(createPinia());
  const out = runParityScript(
    { falkland82: falkland, narvik40: narvik, northernstorm85: northernStorm },
    () => {
      const ref = shallowRef<NewScenarioStore>({} as NewScenarioStore);
      return { io: useScenarioIO(ref), store: ref, useUnitManipulations };
    },
  );
  writeFileSync(
    resolve(process.cwd(), 'apps/web/src/app/testing/vue-reference.json'),
    JSON.stringify(out) + '\n',
  );
});
