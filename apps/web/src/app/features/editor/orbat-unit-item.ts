import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LucideChevronRight, LucideEyeOff } from '@lucide/angular';
import type { EntityId } from '@/types/base';
import { mapReinforcedStatus2Field } from '@/types/scenarioModels';
import { ScenarioService } from '../../core/scenario/scenario.service';
import { SelectionService } from '../../core/ui/selection.service';
import { SymbolSettingsService } from '../../core/ui/symbol-settings.service';
import { MilitarySymbol } from '../../shared/military-symbol';

/**
 * One unit of the ORBAT tree and, when expanded, its subordinates (src/components/OrbatTreeItem.vue).
 * Each item reads only its own unit, so an edit redraws only the items it touches.
 */
@Component({
  selector: 'app-orbat-unit-item',
  imports: [MilitarySymbol, LucideChevronRight, LucideEyeOff, OrbatUnitItem],
  template: `
    @let u = unit();
    @if (u) {
      <div
        class="text-foreground group relative flex items-center justify-between border-l-2 py-1 pl-2 sm:pl-0"
        role="treeitem"
        [attr.aria-expanded]="u.hasChildren ? u.isOpen : null"
        [attr.aria-selected]="isSelected()"
        [attr.aria-level]="level()"
        [attr.data-unit-id]="unitId()"
        tabindex="0"
        [class]="
          isActive()
            ? 'border-primary bg-primary/10 hover:bg-primary/20'
            : isSelected()
              ? 'bg-primary/10 hover:bg-primary/20 border-transparent'
              : 'hover:bg-sidebar-accent/60 border-transparent'
        "
        [style.padding-left.rem]="(level() - 1) * 0.75"
        (click)="select($event)"
        (keydown.enter)="select($event)"
        (keydown.space)="toggleOpen(); $event.preventDefault()"
        (dblclick)="toggleOpen()"
      >
        <div class="flex items-center space-x-1">
          <div class="h-6 w-6">
            @if (u.hasChildren) {
              <button
                type="button"
                tabindex="-1"
                [attr.aria-label]="u.isOpen ? 'Collapse' : 'Expand'"
                (click)="toggleOpen(); $event.stopPropagation()"
              >
                <svg
                  lucideChevronRight
                  class="text-muted-foreground group-hover:text-foreground h-6 w-6 transform transition-transform"
                  [class.rotate-90]="u.isOpen"
                ></svg>
              </button>
            }
          </div>
          <div class="flex items-center space-x-1 text-sm">
            <span class="flex items-center space-x-1" [class.opacity-50]="u.isHidden">
              <div class="relative flex justify-center" [style.width.pt]="settings.orbatIconSize()">
                <app-military-symbol
                  [sidc]="u.sidc"
                  [size]="settings.orbatIconSize()"
                  [options]="u.symbolOptions"
                />
                @if (u.reinforced) {
                  <span class="absolute -top-2 -right-2.5 text-xs font-medium">{{
                    u.reinforced
                  }}</span>
                }
              </div>
              <span class="flex-auto pl-1 text-left" [class.font-medium]="isActive()">{{
                u.label
              }}</span>
              @if (u.hasLocation) {
                <span class="text-destructive-foreground">&deg;</span>
              }
            </span>
          </div>
        </div>
        <div class="flex items-center">
          @if (u.isHidden) {
            <svg lucideEyeOff class="text-muted-foreground h-5 w-5"></svg>
          }
        </div>
      </div>
      @if (u.hasChildren && u.isOpen) {
        <div role="group">
          @for (childId of u.subUnits; track childId) {
            <app-orbat-unit-item [unitId]="childId" [level]="level() + 1" />
          }
        </div>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrbatUnitItem {
  readonly unitId = input.required<EntityId>();
  readonly level = input(1);

  private readonly scenarioService = inject(ScenarioService);
  private readonly selection = inject(SelectionService);
  protected readonly settings = inject(SymbolSettingsService);

  private readonly data = this.scenarioService.select((scenario) => {
    const unit = scenario.store.state.unitMap[this.unitId()];
    if (!unit) return null;
    const subUnits = [...unit.subUnits];
    const reinforcedStatus = unit._state?.reinforcedStatus ?? unit.reinforcedStatus;
    return {
      name: unit.name,
      shortName: unit.shortName,
      sidc: unit._state?.sidc || unit.sidc,
      symbolOptions: { ...scenario.unitActions.getCombinedSymbolOptions(unit), outlineWidth: 8 },
      reinforced: reinforcedStatus
        ? mapReinforcedStatus2Field(reinforcedStatus, { compact: true })
        : '',
      subUnits,
      hasChildren: subUnits.length > 0,
      isOpen: !!unit._isOpen,
      isHidden: !!unit.isHidden,
      hasLocation: !!unit._state?.location,
    };
  });

  /** Angular signals (display settings) are combined here, outside the store read. */
  protected readonly unit = computed(() => {
    const data = this.data();
    if (!data) return null;
    const label = this.settings.orbatShortName() ? data.shortName || data.name : data.name;
    return { ...data, label };
  });

  protected readonly isActive = computed(() => this.selection.activeUnitId() === this.unitId());
  protected readonly isSelected = computed(() =>
    this.selection.selectedUnitIds().has(this.unitId()),
  );

  protected select(event: Event): void {
    const mouse = event as MouseEvent;
    this.selection.selectUnit(this.unitId(), { add: mouse.ctrlKey || mouse.metaKey });
  }

  /** UI state, as in the Vue tree: `_isOpen` is set on the unit without an undo entry. */
  protected toggleOpen(): void {
    const unit = this.scenarioService.scenario.store.state.unitMap[this.unitId()];
    if (unit && unit.subUnits.length) unit._isOpen = !unit._isOpen;
  }
}
