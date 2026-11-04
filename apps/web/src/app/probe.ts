import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ScenarioService } from './core/scenario/scenario.service';

@Component({
  selector: 'app-probe',
  template: `<p>ready: {{ scenarioService.isReady() }} rev: {{ scenarioService.revision() }}</p>
    <button (click)="load()">load</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Probe {
  protected readonly scenarioService = inject(ScenarioService);
  load() {
    void this.scenarioService.scenario.io.loadDemoScenario('narvik40');
  }
}
