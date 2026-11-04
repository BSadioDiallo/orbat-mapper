import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { RouterLink } from '@angular/router';
import { LucideChevronRight, LucideMenu } from '@lucide/angular';
import { ScenarioService } from '../../core/scenario/scenario.service';
import { ThemeService } from '../../core/ui/theme.service';
import { ButtonDirective } from '../../shared/ui/button';

/** The actions of the main menu handled by the editor page (ScenarioActions of the Vue app). */
export type MainMenuAction =
  | 'save'
  | 'exportJson'
  | 'createNew'
  | 'duplicate'
  | 'showInfo'
  | 'restoreOriginal'
  | 'revertToSaved'
  | 'exportToClipboard';

const MENU_CLASS =
  'bg-popover text-popover-foreground z-50 min-w-[12rem] overflow-hidden rounded-md border p-1 shadow-md';
const ITEM_CLASS =
  'focus:bg-accent focus:text-accent-foreground hover:bg-accent relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-hidden select-none disabled:pointer-events-none disabled:opacity-50';

/**
 * The main menu of src/modules/scenarioeditor/MainMenu.vue, on CDK Menu (keyboard navigation,
 * roles and focus handling). Entries whose screens are not ported yet are left out (G-010).
 */
@Component({
  selector: 'app-main-menu',
  imports: [
    CdkMenu,
    CdkMenuItem,
    CdkMenuTrigger,
    RouterLink,
    ButtonDirective,
    LucideMenu,
    LucideChevronRight,
  ],
  template: `
    <button
      appButton
      variant="ghost"
      size="icon"
      type="button"
      aria-label="Main menu"
      data-testid="main-menu"
      [cdkMenuTriggerFor]="root"
    >
      <svg lucideMenu class="size-6"></svg>
    </button>

    <ng-template #root>
      <div cdkMenu [class]="menuClass">
        <a cdkMenuItem routerLink="/" [class]="itemClass + ' font-medium'">Home</a>
        <div class="bg-border -mx-1 my-1 h-px" role="separator"></div>
        <button
          cdkMenuItem
          type="button"
          [class]="itemClass"
          (cdkMenuItemTriggered)="theme.toggleDark()"
        >
          Toggle dark mode
        </button>
        <button
          cdkMenuItem
          type="button"
          [class]="itemClass"
          [cdkMenuTriggerFor]="file"
          #fileTrigger="cdkMenuTriggerFor"
          (click)="keepOpen(fileTrigger)"
        >
          File <svg lucideChevronRight class="ml-auto size-4"></svg>
        </button>
        <button
          cdkMenuItem
          type="button"
          [class]="itemClass"
          [cdkMenuTriggerFor]="edit"
          #editTrigger="cdkMenuTriggerFor"
          (click)="keepOpen(editTrigger)"
        >
          Edit <svg lucideChevronRight class="ml-auto size-4"></svg>
        </button>
      </div>
    </ng-template>

    <ng-template #file>
      <div cdkMenu [class]="menuClass" data-testid="file-menu">
        <button
          cdkMenuItem
          type="button"
          [class]="itemClass"
          (cdkMenuItemTriggered)="action.emit('exportJson')"
        >
          Download scenario
        </button>
        <button
          cdkMenuItem
          type="button"
          [class]="itemClass"
          (cdkMenuItemTriggered)="action.emit('save')"
        >
          Save scenario
        </button>
        <button
          cdkMenuItem
          type="button"
          [class]="itemClass"
          (cdkMenuItemTriggered)="action.emit('createNew')"
        >
          New scenario...
        </button>
        <div class="bg-border -mx-1 my-1 h-px" role="separator"></div>
        <button
          cdkMenuItem
          type="button"
          [class]="itemClass"
          (cdkMenuItemTriggered)="action.emit('duplicate')"
        >
          Duplicate scenario
        </button>
        <button
          cdkMenuItem
          type="button"
          [class]="itemClass"
          (cdkMenuItemTriggered)="action.emit('showInfo')"
        >
          Show scenario info
        </button>
      </div>
    </ng-template>

    <ng-template #edit>
      <div cdkMenu [class]="menuClass" data-testid="edit-menu">
        <button
          cdkMenuItem
          type="button"
          [class]="itemClass"
          [cdkMenuItemDisabled]="!scenarioService.canUndo()"
          (cdkMenuItemTriggered)="scenarioService.undo()"
        >
          Undo
          <span class="text-muted-foreground ml-auto pl-4 text-xs tracking-widest">Ctrl/⌘ Z</span>
        </button>
        <button
          cdkMenuItem
          type="button"
          [class]="itemClass"
          [cdkMenuItemDisabled]="!scenarioService.canRedo()"
          (cdkMenuItemTriggered)="scenarioService.redo()"
        >
          Redo
          <span class="text-muted-foreground ml-auto pl-4 text-xs tracking-widest"
            >Ctrl/⌘ shift Z</span
          >
        </button>
        @if (hasDistinctOpenedBaseline()) {
          <button
            cdkMenuItem
            type="button"
            [class]="itemClass"
            (cdkMenuItemTriggered)="action.emit('restoreOriginal')"
          >
            Revert to opened state
          </button>
        }
        <button
          cdkMenuItem
          type="button"
          [class]="itemClass"
          [cdkMenuItemDisabled]="!hasSavedBaseline()"
          (cdkMenuItemTriggered)="action.emit('revertToSaved')"
        >
          Revert to saved version
        </button>
        <button
          cdkMenuItem
          type="button"
          [class]="itemClass"
          (cdkMenuItemTriggered)="action.emit('exportToClipboard')"
        >
          Copy scenario to clipboard
        </button>
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainMenu {
  readonly action = output<MainMenuAction>();
  protected readonly scenarioService = inject(ScenarioService);
  protected readonly theme = inject(ThemeService);
  protected readonly menuClass = MENU_CLASS;
  protected readonly itemClass = ITEM_CLASS;
  /**
   * CDK opens a submenu on hover and toggles it on click, so a click after the hover closed it.
   * The Vue menu (reka-ui) keeps a submenu open on click: reopen it after CDK's toggle.
   */
  protected keepOpen(trigger: CdkMenuTrigger): void {
    queueMicrotask(() => {
      if (!trigger.isOpen()) trigger.open();
    });
  }

  protected readonly hasSavedBaseline = this.scenarioService.selectWhenReady(
    (s) => s.io.hasSavedBaseline.value,
    false,
  );
  protected readonly hasDistinctOpenedBaseline = this.scenarioService.selectWhenReady(
    (s) => s.io.hasDistinctOpenedBaseline.value,
    false,
  );
}
