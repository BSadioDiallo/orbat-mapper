import {
  type EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
  type Type,
} from '@angular/core';
import { setActiveScenarioRepository } from './localdb-adapter';
import { IndexedDbScenarioRepository } from './indexeddb-scenario-repository';
import { SCENARIO_REPOSITORY, type ScenarioRepository } from './scenario-repository';

/** Registers the repository used by Angular code and by the shared domain code. */
export function provideScenarioRepository(
  implementation: Type<ScenarioRepository> = IndexedDbScenarioRepository,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: SCENARIO_REPOSITORY, useClass: implementation },
    provideEnvironmentInitializer(() => {
      setActiveScenarioRepository(inject(SCENARIO_REPOSITORY));
    }),
  ]);
}
