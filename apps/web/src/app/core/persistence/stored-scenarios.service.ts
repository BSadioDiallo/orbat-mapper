import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { Scenario } from '@/types/scenarioModels';
import { type LoadableScenario, upgradeScenarioIfNecessary } from '@/scenariostore/upgrade';
import { nanoid } from '@/utils';
import { useNotifications } from '@/composables/notifications';
import { SCENARIO_REPOSITORY, type ScenarioMetadata } from './scenario-repository';

export type StoredScenarioSort = 'name' | 'lastModified' | 'created';
export type StoredScenarioAction = 'open' | 'delete' | 'download' | 'duplicate' | 'copyToClipboard';

/** Port of src/composables/browserScenarios.ts, on top of ScenarioRepository. */
@Injectable({ providedIn: 'root' })
export class StoredScenariosService {
  private readonly repository = inject(SCENARIO_REPOSITORY);
  private readonly router = inject(Router);
  private readonly notifications = useNotifications();

  readonly scenarios = signal<ScenarioMetadata[]>([]);
  readonly sort = signal<StoredScenarioSort>('lastModified');
  readonly direction = signal<'asc' | 'desc'>('desc');

  async reload(): Promise<void> {
    const list = await this.repository.listScenarios();
    this.scenarios.set(this.sorted(list));
  }

  setSort(sort: StoredScenarioSort): void {
    this.sort.set(sort);
    this.direction.set(sort === 'name' ? 'asc' : 'desc');
    this.scenarios.set(this.sorted(this.scenarios()));
  }

  toggleDirection(): void {
    this.direction.set(this.direction() === 'asc' ? 'desc' : 'asc');
    this.scenarios.set(this.sorted(this.scenarios()));
  }

  async onAction(action: StoredScenarioAction, scenario: ScenarioMetadata): Promise<void> {
    switch (action) {
      case 'open':
        await this.router.navigate(['/scenario', scenario.id]);
        break;
      case 'delete':
        if (
          window.confirm(
            `Are you sure you want to permanently delete the scenario "${scenario.name}"?`,
          )
        ) {
          await this.repository.deleteScenarios([scenario.id]);
        }
        break;
      case 'download':
        await this.download(scenario.id);
        break;
      case 'duplicate':
        await this.repository.duplicateScenario(scenario.id);
        break;
      case 'copyToClipboard': {
        const blob = await this.repository.loadScenario(scenario.id);
        if (blob) {
          await navigator.clipboard.writeText(JSON.stringify(blob, null, 2));
          this.notifications.send({ message: 'Scenario copied to clipboard', type: 'success' });
        }
        break;
      }
    }
    await this.reload();
  }

  async deleteMany(scenarios: ScenarioMetadata[]): Promise<void> {
    if (!scenarios.length) return;
    await this.repository.deleteScenarios(scenarios.map((s) => s.id));
    this.notifications.send({
      message: `Deleted ${scenarios.length} scenario${scenarios.length === 1 ? '' : 's'}`,
      type: 'success',
    });
    await this.reload();
  }

  /** Stores a loaded file and opens it, asking before replacing a scenario with the same id. */
  async loadScenario(input: Scenario | LoadableScenario): Promise<void> {
    const scenario = upgradeScenarioIfNecessary(input);
    const existing = await this.repository.getScenarioInfo(scenario.id ?? nanoid());
    let scenarioId: string;
    if (existing) {
      scenarioId = window.confirm(
        'A scenario with the same ID is stored in the browser. Do you want to replace it with this scenario?',
      )
        ? await this.repository.putScenario(scenario)
        : await this.repository.addScenario(scenario, nanoid());
    } else {
      scenarioId = await this.repository.addScenario(scenario);
    }
    await this.router.navigate(['/scenario', scenarioId]);
  }

  private async download(id: string): Promise<void> {
    const scenario = await this.repository.loadScenario(id);
    if (!scenario) return;
    const { default: filenamify } = await import('filenamify/browser');
    const { saveBlobToLocalFile } = await import('@/utils/files');
    await saveBlobToLocalFile(
      new Blob([JSON.stringify(scenario)], { type: 'application/json' }),
      filenamify(scenario.name) + '.json',
    );
  }

  private sorted(list: ScenarioMetadata[]): ScenarioMetadata[] {
    const factor = this.direction() === 'asc' ? 1 : -1;
    const copy = [...list];
    switch (this.sort()) {
      case 'name':
        return copy.sort((a, b) => a.name.localeCompare(b.name) * factor);
      case 'created':
        return copy.sort((a, b) => (+a.created - +b.created) * factor);
      default:
        return copy.sort((a, b) => (+a.modified - +b.modified) * factor);
    }
  }
}
