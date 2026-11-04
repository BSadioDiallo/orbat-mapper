import { TestBed } from '@angular/core/testing';
import type { Scenario } from '@/types/scenarioModels';
import narvik from '../../../../public/scenarios/narvik40.json';
import { useIndexedDb } from './localdb-adapter';
import { provideScenarioRepository } from './provide-scenario-repository';
import { SCENARIO_REPOSITORY } from './scenario-repository';

function scenario(id: string, name = 'Narvik copy'): Scenario {
  return { ...(structuredClone(narvik) as unknown as Scenario), id, name };
}

describe('IndexedDbScenarioRepository', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideScenarioRepository()] });
    const repository = TestBed.inject(SCENARIO_REPOSITORY);
    const existing = await repository.listScenarios();
    await repository.deleteScenarios(existing.map((s) => s.id));
  });

  it('stores, lists, loads, duplicates and deletes scenarios like localdb.ts', async () => {
    const repository = TestBed.inject(SCENARIO_REPOSITORY);
    const id = await repository.addScenario(scenario('s1'));
    expect(id).toBe('s1');
    expect((await repository.listScenarios()).map((s) => s.name)).toEqual(['Narvik copy']);
    const loaded = await repository.loadScenario('s1');
    expect(loaded?.sides.length).toBe(narvik.sides.length);

    await repository.putScenario({ ...loaded!, name: 'Renamed' });
    expect((await repository.getScenarioInfo('s1'))?.name).toBe('Renamed');

    const copyId = await repository.duplicateScenario('s1');
    expect(copyId).toBeTruthy();
    expect((await repository.getScenarioInfo(copyId!))?.name).toBe('Renamed (copy)');

    await repository.deleteScenarios(['s1', copyId!]);
    expect(await repository.listScenarios()).toEqual([]);
  });

  it('keeps drafts per scenario', async () => {
    const repository = TestBed.inject(SCENARIO_REPOSITORY);
    await repository.putScenarioDraft('s2', scenario('s2'), { updatedAt: 42 });
    expect((await repository.getScenarioDraft('s2'))?.updatedAt).toBe(42);
    await repository.deleteScenarioDraft('s2');
    expect(await repository.getScenarioDraft('s2')).toBeUndefined();
  });

  it('is what the shared code reaches through useIndexedDb()', async () => {
    const repository = TestBed.inject(SCENARIO_REPOSITORY);
    const spy = vi.spyOn(repository, 'putScenario');
    const db = await useIndexedDb();
    await db.putScenario(scenario('s3'));
    expect(spy).toHaveBeenCalledOnce();
    expect((await repository.getScenarioInfo('s3'))?.name).toBe('Narvik copy');
  });
});
