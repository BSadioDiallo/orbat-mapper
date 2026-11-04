import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { LucideX } from '@lucide/angular';
import { timeZonesNames } from '@vvo/tzdb';
import dayjs from 'dayjs';
import { renderMarkdown } from '@/composables/formatting';
import { useSymbolSettingsStore } from '@/stores/settingsStore';
import { getSymbologyStandardName, stableSymbologyStandardOptions } from '@/symbology/standards';
import type { ScenarioInfo, SymbologyStandard } from '@/types/scenarioModels';
import { MILITARY_TIME_ZONE_NAMES, resolveTimeZone } from '@/utils/militaryTimeZones';
import { ScenarioService } from '../../core/scenario/scenario.service';
import { SelectionService } from '../../core/ui/selection.service';
import { ButtonDirective } from '../../shared/ui/button';

interface InfoForm {
  name: string;
  description: string;
  timeZone: string;
  symbologyStandard: SymbologyStandard;
}

/**
 * The "Info" tab of src/modules/scenarioeditor/ScenarioInfoPanel.vue (ScenarioInfoDetails.vue):
 * description, start time, time zone, symbology standard, number of units, and their edit form.
 * The other tabs (groups, statuses, equipment, personnel, supplies) are later lots (G-009).
 */
@Component({
  selector: 'app-scenario-info-panel',
  imports: [FormField, ButtonDirective, LucideX],
  template: `
    @let i = info();
    <aside
      class="bg-sidebar text-sidebar-foreground flex h-full flex-col overflow-auto p-4"
      aria-label="Scenario info"
      data-testid="scenario-info"
    >
      <header class="flex items-start justify-between gap-3">
        <h2 class="text-heading text-lg font-semibold break-words">{{ i.name }}</h2>
        <button
          appButton
          variant="ghost"
          size="icon-sm"
          type="button"
          aria-label="Close scenario info"
          (click)="selection.items.showScenarioInfo.value = false"
        >
          <svg lucideX></svg>
        </button>
      </header>
      @if (editing()) {
        <form class="mt-4 space-y-4" (submit)="save($event)" data-testid="scenario-info-form">
          <div>
            <label class="text-sm font-medium" for="scenario-name-input">Name</label>
            <input
              id="scenario-name-input"
              class="border-input bg-background mt-1 h-9 w-full rounded-md border px-3 text-sm"
              [formField]="infoForm.name"
            />
          </div>
          <div>
            <label class="text-sm font-medium" for="scenario-description-input">Description</label>
            <textarea
              id="scenario-description-input"
              rows="6"
              class="border-input bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
              [formField]="infoForm.description"
            ></textarea>
            <p class="text-muted-foreground mt-1 text-xs">Use markdown syntax for formatting</p>
          </div>
          <div>
            <label class="text-sm font-medium" for="scenario-tz-select">Time zone</label>
            <select
              id="scenario-tz-select"
              class="border-input bg-background mt-1 h-9 w-full rounded-md border px-2 text-sm"
              [formField]="infoForm.timeZone"
            >
              @for (tz of timeZones; track tz) {
                <option [value]="tz">{{ tz }}</option>
              }
            </select>
          </div>
          <div>
            <label class="text-sm font-medium" for="scenario-standard-select"
              >Symbology standard</label
            >
            <select
              id="scenario-standard-select"
              class="border-input bg-background mt-1 h-9 w-full rounded-md border px-2 text-sm"
              [formField]="infoForm.symbologyStandard"
            >
              @for (s of standards; track s.value) {
                <option [value]="s.value">{{ s.name }}</option>
              }
            </select>
          </div>
          <div class="flex justify-end space-x-2">
            <button appButton type="submit" [disabled]="infoForm().invalid()">Update</button>
            <button appButton variant="outline" type="button" (click)="editing.set(false)">
              Cancel
            </button>
          </div>
        </form>
      } @else {
        <dl class="mt-4 space-y-4 text-sm">
          <div>
            <dt class="text-muted-foreground font-medium">Description</dt>
            <dd class="prose-sm prose dark:prose-invert mt-1" [innerHTML]="description()"></dd>
          </div>
          <div>
            <dt class="text-muted-foreground font-medium">Start time</dt>
            <dd class="mt-1" data-testid="scenario-start-time">{{ startTime() }}</dd>
          </div>
          <div>
            <dt class="text-muted-foreground font-medium">Time zone name</dt>
            <dd class="mt-1">{{ i.timeZone }}</dd>
          </div>
          <div>
            <dt class="text-muted-foreground font-medium">Symbology standard</dt>
            <dd class="mt-1">{{ standardName() }}</dd>
          </div>
          <div>
            <dt class="text-muted-foreground font-medium">Number of units</dt>
            <dd class="mt-1" data-testid="scenario-unit-count">{{ i.unitCount }}</dd>
          </div>
        </dl>
        <div class="mt-4">
          <button
            appButton
            variant="outline"
            size="sm"
            type="button"
            data-testid="edit-scenario-info"
            (click)="editing.set(true)"
          >
            Edit
          </button>
        </div>
      }
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
})
export class ScenarioInfoPanel {
  private readonly scenarioService = inject(ScenarioService);
  protected readonly selection = inject(SelectionService);
  private readonly settingsStore = useSymbolSettingsStore();
  protected readonly timeZones = [...timeZonesNames, 'UTC', ...MILITARY_TIME_ZONE_NAMES];
  protected readonly standards = stableSymbologyStandardOptions;
  protected readonly editing = signal(false);

  protected readonly info = this.scenarioService.select((s) => {
    const info: ScenarioInfo = s.store.state.info;
    return {
      name: info.name,
      description: info.description ?? '',
      startTime: info.startTime,
      timeZone: info.timeZone,
      symbologyStandard: info.symbologyStandard,
      unitCount: Object.keys(s.store.state.unitMap).length,
    };
  });

  protected readonly description = computed(() => renderMarkdown(this.info().description));
  protected readonly standardName = computed(() =>
    getSymbologyStandardName(this.info().symbologyStandard),
  );
  /** `computedStartTime.format()` of ScenarioInfoDetails.vue. */
  protected readonly startTime = computed(() => {
    const { startTime, timeZone } = this.info();
    try {
      return dayjs(startTime)
        .tz(resolveTimeZone(timeZone || 'UTC'))
        .format();
    } catch {
      return dayjs(startTime).format();
    }
  });

  private readonly model = linkedSignal<InfoForm>(() => {
    const info = this.info();
    return {
      name: info.name,
      description: info.description,
      timeZone: info.timeZone || 'UTC',
      symbologyStandard: info.symbologyStandard ?? '2525d',
    };
  });
  protected readonly infoForm = form(this.model, (path) => {
    required(path.name);
  });

  /** `updateScenarioInfo` of ScenarioInfoDetails.vue: one undoable update of `state.info`. */
  protected save(event: Event): void {
    event.preventDefault();
    if (this.infoForm().invalid()) return;
    const data = this.model();
    this.scenarioService.scenario.store.update((s) => {
      Object.assign(s.info, { ...data });
    });
    this.settingsStore.symbologyStandard = data.symbologyStandard;
    this.editing.set(false);
  }
}
