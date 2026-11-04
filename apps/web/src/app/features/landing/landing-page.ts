import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  type OnInit,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LucideMoonStar, LucideSun } from '@lucide/angular';
import type { EncryptedScenario } from '@/types/scenarioModels';
import type { LoadableScenario } from '@/scenariostore/upgrade';
import { saveImportedScenario } from '@/composables/importScenarioTransfer';
import { ButtonDirective } from '../../shared/ui/button';
import { ThemeService } from '../../core/ui/theme.service';
import {
  type StoredScenarioAction,
  StoredScenariosService,
  type StoredScenarioSort,
} from '../../core/persistence/stored-scenarios.service';
import {
  SCENARIO_REPOSITORY,
  type ScenarioMetadata,
} from '../../core/persistence/scenario-repository';
import { DEMO_SCENARIOS } from './demo-scenarios';

/** Port of src/views/LandingPage.vue with LandingPageScenarios.vue and DemoScenarioCards.vue. */
@Component({
  selector: 'app-landing-page',
  imports: [RouterLink, DatePipe, ButtonDirective, LucideSun, LucideMoonStar],
  templateUrl: './landing-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
})
export class LandingPage implements OnInit {
  protected readonly theme = inject(ThemeService);
  protected readonly stored = inject(StoredScenariosService);
  private readonly repository = inject(SCENARIO_REPOSITORY);
  private readonly router = inject(Router);

  protected readonly demos = DEMO_SCENARIOS;
  protected readonly query = signal('');
  protected readonly loadError = signal(false);
  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const list = this.stored.scenarios();
    return q ? list.filter((s) => s.name.toLowerCase().includes(q)) : list;
  });
  protected readonly sortOptions: { label: string; value: StoredScenarioSort }[] = [
    { label: 'Name', value: 'name' },
    { label: 'Last modified', value: 'lastModified' },
    { label: 'Created', value: 'created' },
  ];
  protected readonly actions: { label: string; action: StoredScenarioAction }[] = [
    { label: 'Open', action: 'open' },
    { label: 'Delete ...', action: 'delete' },
    { label: 'Download', action: 'download' },
    { label: 'Duplicate', action: 'duplicate' },
    { label: 'Copy to clipboard', action: 'copyToClipboard' },
  ];

  ngOnInit(): void {
    void this.stored.reload();
  }

  protected onAction(
    action: StoredScenarioAction,
    scenario: ScenarioMetadata,
    select: HTMLSelectElement,
  ) {
    select.value = '';
    void this.stored.onAction(action, scenario);
  }

  protected setSort(value: string) {
    this.stored.setSort(value as StoredScenarioSort);
  }

  protected async onFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;
    this.loadError.set(false);
    try {
      const data = JSON.parse(await file.text()) as LoadableScenario | EncryptedScenario;
      if (data?.type !== 'ORBAT-mapper' && data?.type !== 'ORBAT-mapper-encrypted') {
        throw new Error('Invalid scenario file');
      }
      if (data.type === 'ORBAT-mapper-encrypted') {
        // TODO(migration): decrypt modal (KNOWN_GAPS G-005). The import view handles it later.
        await this.routeToImportPreview(data);
        return;
      }
      if (await this.repository.getScenarioInfo(data.id)) {
        await this.routeToImportPreview(data);
        return;
      }
      await this.stored.loadScenario(data);
    } catch (error) {
      console.error('Failed to load', file.name, error);
      this.loadError.set(true);
    } finally {
      target.value = '';
    }
  }

  private async routeToImportPreview(scenario: LoadableScenario | EncryptedScenario) {
    const token = saveImportedScenario(scenario);
    await this.router.navigate(['/import'], { queryParams: { token, source: 'external' } });
  }
}
