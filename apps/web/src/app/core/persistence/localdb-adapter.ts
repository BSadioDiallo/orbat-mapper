/**
 * Replaces `@/scenariostore/localdb` for the shared domain code (tsconfig `paths`).
 *
 * `io.ts` and the other shared modules call `useIndexedDb()` directly. Here that call returns a
 * facade whose scenario methods go to the active `ScenarioRepository` (set by Angular at startup,
 * see `provideScenarioRepository`), so the persistence of the whole app goes through the
 * repository. Basemap archive handles are local to a device by nature (ADR-0004) and stay in the
 * browser database whatever the repository is.
 */
import type { Scenario } from '@/types/scenarioModels';
import { useIndexedDb as useBrowserDb } from '../../../../../../src/scenariostore/localdb';
import type { ScenarioDraft, ScenarioRepository } from './scenario-repository';

export type { ScenarioDraft, ScenarioMetadata } from './localdb-types';

let activeRepository: ScenarioRepository | undefined;

export function setActiveScenarioRepository(repository: ScenarioRepository | undefined) {
  activeRepository = repository;
}

export function getActiveScenarioRepository(): ScenarioRepository {
  if (!activeRepository) {
    throw new Error('No ScenarioRepository is active. Call provideScenarioRepository().');
  }
  return activeRepository;
}

export async function useIndexedDb() {
  const repository = getActiveScenarioRepository();
  const browserDb = await useBrowserDb();
  return {
    addScenario: (scenario: Scenario, id?: string) => repository.addScenario(scenario, id),
    listScenarios: () => repository.listScenarios(),
    loadScenario: (id: string) => repository.loadScenario(id),
    putScenario: (scenario: Scenario) => repository.putScenario(scenario),
    deleteScenario: (id: string) => repository.deleteScenarios([id]),
    deleteScenarios: (ids: string[]) => repository.deleteScenarios(ids),
    duplicateScenario: (id: string) => repository.duplicateScenario(id),
    getScenarioInfo: (id: string) => repository.getScenarioInfo(id),
    putScenarioDraft: (
      scenarioId: string,
      scenario: Scenario,
      options?: Pick<ScenarioDraft, 'updatedAt' | 'appVersion' | 'savedComparisonKey'>,
    ) => repository.putScenarioDraft(scenarioId, scenario, options),
    getScenarioDraft: (scenarioId: string) => repository.getScenarioDraft(scenarioId),
    deleteScenarioDraft: (scenarioId: string) => repository.deleteScenarioDraft(scenarioId),
    downloadAsJson: browserDb.downloadAsJson,
    putArchiveHandle: browserDb.putArchiveHandle,
    getArchiveHandle: browserDb.getArchiveHandle,
    deleteArchiveHandle: browserDb.deleteArchiveHandle,
    listArchiveHandleKeys: browserDb.listArchiveHandleKeys,
  };
}
