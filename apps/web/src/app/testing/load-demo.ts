import { TestBed } from '@angular/core/testing';
import type { Scenario } from '@/types/scenarioModels';
import narvik from '../../../public/scenarios/narvik40.json';
import { ScenarioService } from '../core/scenario/scenario.service';

/** Loads the Narvik demo into the shared store, as the editor does, and returns the service. */
export function loadNarvik(): ScenarioService {
  const service = TestBed.inject(ScenarioService);
  service.scenario.io.loadFromObject(structuredClone(narvik) as unknown as Scenario);
  return service;
}
