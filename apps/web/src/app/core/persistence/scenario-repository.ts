import { InjectionToken } from '@angular/core';
import type { Scenario } from '@/types/scenarioModels';
import type { ScenarioDraft, ScenarioMetadata } from './localdb-types';

export type { ScenarioDraft, ScenarioMetadata } from './localdb-types';

/**
 * Every read and write of stored scenarios goes through this interface.
 *
 * The browser implementation keeps today's behaviour (IndexedDB, `IndexedDbScenarioRepository`).
 * A server implementation (Spring Boot API, docs/backend/01-architecture.md) can be provided in
 * its place with `{ provide: SCENARIO_REPOSITORY, useClass: ... }`, without touching callers.
 *
 * The method names and contracts are those of `useIndexedDb()` in
 * `src/scenariostore/localdb.ts`, so the shared domain code (`io.ts`) keeps working unchanged.
 */
export interface ScenarioRepository {
  listScenarios(): Promise<ScenarioMetadata[]>;
  loadScenario(id: string): Promise<Scenario | undefined>;
  /** Adds a new scenario. Fails if the id is already stored. Returns the id. */
  addScenario(scenario: Scenario, id?: string): Promise<string>;
  /** Creates or replaces a scenario. Returns the id. */
  putScenario(scenario: Scenario): Promise<string>;
  deleteScenarios(ids: string[]): Promise<void>;
  duplicateScenario(id: string): Promise<string | undefined>;
  getScenarioInfo(id: string): Promise<ScenarioMetadata | undefined>;
  putScenarioDraft(
    scenarioId: string,
    scenario: Scenario,
    options?: Pick<ScenarioDraft, 'updatedAt' | 'appVersion' | 'savedComparisonKey'>,
  ): Promise<ScenarioDraft>;
  getScenarioDraft(scenarioId: string): Promise<ScenarioDraft | undefined>;
  deleteScenarioDraft(scenarioId: string): Promise<void>;
}

export const SCENARIO_REPOSITORY = new InjectionToken<ScenarioRepository>('ScenarioRepository');
