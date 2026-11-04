import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
import type { EntityId } from '@/types/base';
import { ScenarioService } from '../../core/scenario/scenario.service';
import { OrbatUnitItem } from './orbat-unit-item';

/** A side group and its root units (src/components/OrbatSideGroup.vue). */
@Component({
  selector: 'app-orbat-side-group',
  imports: [OrbatUnitItem, LucideChevronRight],
  template: `
    @let g = group();
    @if (g) {
      <div class="mt-2">
        <button
          type="button"
          class="text-foreground hover:bg-sidebar-accent/60 flex w-full items-center rounded px-1 py-1 text-left text-sm font-semibold"
          [attr.aria-expanded]="g.isOpen"
          (click)="toggle()"
        >
          <svg
            lucideChevronRight
            class="size-5 transition-transform"
            [class.rotate-90]="g.isOpen"
          ></svg>
          {{ g.name }}
        </button>
        @if (g.isOpen) {
          <div role="group">
            @for (unitId of g.subUnits; track unitId) {
              <app-orbat-unit-item [unitId]="unitId" />
            }
          </div>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrbatSideGroup {
  readonly groupId = input.required<EntityId>();
  private readonly scenarioService = inject(ScenarioService);
  protected readonly group = this.scenarioService.select((scenario) => {
    const group = scenario.store.state.sideGroupMap[this.groupId()];
    if (!group) return null;
    return { name: group.name, subUnits: [...group.subUnits], isOpen: group._isOpen !== false };
  });

  protected toggle(): void {
    const group = this.scenarioService.scenario.store.state.sideGroupMap[this.groupId()];
    if (group) group._isOpen = group._isOpen === false;
  }
}

/** A side: its groups and units placed directly under it (src/components/OrbatSide.vue). */
@Component({
  selector: 'app-orbat-side',
  imports: [OrbatSideGroup, OrbatUnitItem, LucideChevronRight],
  template: `
    @let s = side();
    @if (s) {
      <section class="border-border border-b pb-2" [attr.aria-label]="s.name">
        <button
          type="button"
          class="text-heading hover:bg-sidebar-accent/60 flex w-full items-center rounded px-1 py-2 text-left text-base font-bold"
          [attr.aria-expanded]="s.isOpen"
          (click)="toggle()"
        >
          <svg
            lucideChevronRight
            class="size-5 transition-transform"
            [class.rotate-90]="s.isOpen"
          ></svg>
          {{ s.name }}
        </button>
        @if (s.isOpen) {
          @for (unitId of s.subUnits; track unitId) {
            <app-orbat-unit-item [unitId]="unitId" />
          }
          @for (groupId of s.groups; track groupId) {
            <app-orbat-side-group [groupId]="groupId" />
          }
        }
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrbatSide {
  readonly sideId = input.required<EntityId>();
  private readonly scenarioService = inject(ScenarioService);
  protected readonly side = this.scenarioService.select((scenario) => {
    const side = scenario.store.state.sideMap[this.sideId()];
    if (!side) return null;
    return {
      name: side.name,
      groups: [...side.groups],
      subUnits: [...(side.subUnits ?? [])],
      isOpen: side._isOpen !== false,
    };
  });

  protected toggle(): void {
    const side = this.scenarioService.scenario.store.state.sideMap[this.sideId()];
    if (side) side._isOpen = side._isOpen === false;
  }
}

/** The ORBAT panel: every side of the scenario (src/components/OrbatTree.vue). */
@Component({
  selector: 'app-orbat-tree',
  imports: [OrbatSide],
  template: `
    <div role="tree" aria-label="Order of battle" data-testid="orbat-tree">
      @for (sideId of sides(); track sideId) {
        <app-orbat-side [sideId]="sideId" />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrbatTree {
  private readonly scenarioService = inject(ScenarioService);
  protected readonly sides = this.scenarioService.select((scenario) => [
    ...scenario.store.state.sides,
  ]);
}
