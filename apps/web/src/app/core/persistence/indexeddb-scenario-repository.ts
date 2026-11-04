import { Injectable } from '@angular/core';
import type { Scenario } from '@/types/scenarioModels';
import { useIndexedDb } from '../../../../../../src/scenariostore/localdb';
import type { ScenarioDraft, ScenarioRepository } from './scenario-repository';

/**
 * IndexedDB implementation of `ScenarioRepository`: the database, stores and records of
 * `src/scenariostore/localdb.ts`, unchanged, so scenarios saved by the Vue app open here too.
 */
@Injectable({ providedIn: 'root' })
export class IndexedDbScenarioRepository implements ScenarioRepository {
  private db() {
    return useIndexedDb();
  }

  async listScenarios() {
    return (await this.db()).listScenarios();
  }

  async loadScenario(id: string) {
    return (await this.db()).loadScenario(id);
  }

  async addScenario(scenario: Scenario, id?: string) {
    return (await this.db()).addScenario(scenario, id);
  }

  async putScenario(scenario: Scenario) {
    return (await this.db()).putScenario(scenario);
  }

  async deleteScenarios(ids: string[]) {
    return (await this.db()).deleteScenarios(ids);
  }

  async duplicateScenario(id: string) {
    return (await this.db()).duplicateScenario(id);
  }

  async getScenarioInfo(id: string) {
    return (await this.db()).getScenarioInfo(id);
  }

  async putScenarioDraft(
    scenarioId: string,
    scenario: Scenario,
    options?: Pick<ScenarioDraft, 'updatedAt' | 'appVersion' | 'savedComparisonKey'>,
  ) {
    return (await this.db()).putScenarioDraft(scenarioId, scenario, options);
  }

  async getScenarioDraft(scenarioId: string) {
    return (await this.db()).getScenarioDraft(scenarioId);
  }

  async deleteScenarioDraft(scenarioId: string) {
    return (await this.db()).deleteScenarioDraft(scenarioId);
  }
}
