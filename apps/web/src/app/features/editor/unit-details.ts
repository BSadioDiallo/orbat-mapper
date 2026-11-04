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
import { renderMarkdown } from '@/composables/formatting';
import { ScenarioService } from '../../core/scenario/scenario.service';
import { SelectionService } from '../../core/ui/selection.service';
import { ButtonDirective } from '../../shared/ui/button';
import { MilitarySymbol } from '../../shared/military-symbol';

interface UnitFormModel {
  name: string;
  shortName: string;
  description: string;
}

/**
 * Details of the active unit, with an edit form (part of src/modules/scenarioeditor/UnitDetails.vue:
 * name, short name, description; the other tabs are later lots).
 */
@Component({
  selector: 'app-unit-details',
  imports: [MilitarySymbol, ButtonDirective, FormField, LucideX],
  template: `
    @let u = unit();
    @if (u) {
      <aside
        class="bg-sidebar text-sidebar-foreground flex h-full flex-col overflow-auto p-4"
        aria-label="Unit details"
        data-testid="unit-details"
      >
        <header class="flex items-start gap-3">
          <app-military-symbol [sidc]="u.sidc" [size]="34" [options]="u.symbolOptions" />
          <div class="min-w-0 flex-1">
            <h2 class="text-heading text-lg font-semibold break-words" data-testid="unit-name">
              {{ u.name }}
            </h2>
            @if (u.shortName) {
              <p class="text-muted-foreground text-sm">{{ u.shortName }}</p>
            }
          </div>
          <button
            appButton
            variant="ghost"
            size="icon-sm"
            type="button"
            aria-label="Close details"
            (click)="selection.clear()"
          >
            <svg lucideX></svg>
          </button>
        </header>

        @if (editing()) {
          <form class="mt-4 space-y-3" (submit)="save($event)" data-testid="unit-edit-form">
            <div>
              <label class="text-sm font-medium" for="unit-name-input">Name</label>
              <input
                id="unit-name-input"
                class="border-input bg-background mt-1 h-9 w-full rounded-md border px-3 text-sm"
                [formField]="editForm.name"
              />
              @if (editForm.name().invalid() && editForm.name().touched()) {
                <p class="text-destructive mt-1 text-xs" role="alert">A name is required.</p>
              }
            </div>
            <div>
              <label class="text-sm font-medium" for="unit-short-name-input">Short name</label>
              <input
                id="unit-short-name-input"
                class="border-input bg-background mt-1 h-9 w-full rounded-md border px-3 text-sm"
                [formField]="editForm.shortName"
              />
            </div>
            <div>
              <label class="text-sm font-medium" for="unit-description-input">Description</label>
              <textarea
                id="unit-description-input"
                rows="5"
                class="border-input bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
                [formField]="editForm.description"
              ></textarea>
            </div>
            <div class="flex justify-end gap-2">
              <button appButton variant="secondary" type="button" (click)="editing.set(false)">
                Cancel
              </button>
              <button appButton type="submit" [disabled]="editForm().invalid()">Save</button>
            </div>
          </form>
        } @else {
          <div class="mt-4 flex gap-2">
            <button
              appButton
              variant="outline"
              size="sm"
              type="button"
              data-testid="edit-unit"
              (click)="editing.set(true)"
            >
              Edit
            </button>
          </div>
          <dl class="mt-4 space-y-2 text-sm">
            <div>
              <dt class="text-muted-foreground">Symbol code</dt>
              <dd class="font-mono">{{ u.sidc }}</dd>
            </div>
          </dl>
          @if (u.description) {
            <div
              class="prose prose-sm dark:prose-invert mt-4"
              data-testid="unit-description"
              [innerHTML]="description()"
            ></div>
          }
        }
      </aside>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
})
export class UnitDetails {
  private readonly scenarioService = inject(ScenarioService);
  protected readonly selection = inject(SelectionService);

  private readonly data = this.scenarioService.select((scenario) => {
    const id = scenario.store.state && this.selection.items.activeUnitId.value;
    const unit = id ? scenario.store.state.unitMap[id] : undefined;
    if (!unit) return null;
    return {
      id: unit.id,
      name: unit.name,
      shortName: unit.shortName ?? '',
      description: unit.description ?? '',
      sidc: unit._state?.sidc || unit.sidc,
      symbolOptions: scenario.unitActions.getCombinedSymbolOptions(unit),
    };
  });
  protected readonly unit = this.data;
  protected readonly editing = signal(false);

  /** Rendered with markdown-it (raw HTML disabled), then sanitized by Angular on binding. */
  protected readonly description = computed(() => renderMarkdown(this.data()?.description ?? ''));

  private readonly model = linkedSignal<UnitFormModel>(() => {
    const unit = this.data();
    return {
      name: unit?.name ?? '',
      shortName: unit?.shortName ?? '',
      description: unit?.description ?? '',
    };
  });
  protected readonly editForm = form(this.model, (path) => {
    required(path.name);
  });

  protected save(event: Event): void {
    event.preventDefault();
    const unit = this.data();
    if (!unit || this.editForm().invalid()) return;
    const { name, shortName, description } = this.model();
    this.scenarioService.scenario.unitActions.updateUnit(unit.id, { name, shortName, description });
    this.editing.set(false);
  }
}
