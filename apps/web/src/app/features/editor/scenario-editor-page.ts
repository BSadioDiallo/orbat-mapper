import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { Router } from '@angular/router';
import { LucideMoonStar, LucideRedo2, LucideSun, LucideUndo2 } from '@lucide/angular';
import type { Scenario } from '@/types/scenarioModels';
import { useNotifications } from '@/composables/notifications';
import { inputEventFilter } from '@/components/helpers';
import {
  SCENARIO_REPOSITORY,
  type ScenarioDraft,
} from '../../core/persistence/scenario-repository';
import { ScenarioService } from '../../core/scenario/scenario.service';
import { SelectionService } from '../../core/ui/selection.service';
import { ThemeService } from '../../core/ui/theme.service';
import { ButtonDirective } from '../../shared/ui/button';
import { Modal } from '../../shared/ui/modal';
import { ScenarioMap } from '../map/scenario-map';
import { OrbatTree } from './orbat-tree';
import { ScenarioNotFound } from './scenario-not-found';
import { UnitDetails } from './unit-details';
import { MainMenu, type MainMenuAction } from './main-menu';
import { ScenarioInfoPanel } from './scenario-info-panel';

type LeaveChoice = 'save' | 'discard' | 'cancel';

/**
 * The scenario editor route (`/scenario/:scenarioId`): the loading and leaving rules of
 * src/modules/scenarioeditor/ScenarioEditorWrapper.vue and the frame of ScenarioEditor.vue.
 */
@Component({
  selector: 'app-scenario-editor-page',
  imports: [
    ButtonDirective,
    Modal,
    ScenarioMap,
    OrbatTree,
    UnitDetails,
    ScenarioInfoPanel,
    MainMenu,
    ScenarioNotFound,
    LucideUndo2,
    LucideRedo2,
    LucideSun,
    LucideMoonStar,
  ],
  templateUrl: './scenario-editor-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block h-full',
    '(document:keydown)': 'onKeydown($event)',
    '(document:keyup)': 'onKeyup($event)',
    '(document:visibilitychange)': 'onVisibilityChange()',
    '(window:pagehide)': 'flushDraft()',
    '(window:beforeunload)': 'onBeforeUnload($event)',
  },
})
export class ScenarioEditorPage {
  /** Route parameter (withComponentInputBinding). */
  readonly scenarioId = input.required<string>();

  protected readonly scenarioService = inject(ScenarioService);
  protected readonly selection = inject(SelectionService);
  protected readonly theme = inject(ThemeService);
  private readonly repository = inject(SCENARIO_REPOSITORY);
  private readonly router = inject(Router);
  private readonly notifications = useNotifications();
  private readonly destroyRef = inject(DestroyRef);

  protected readonly localReady = signal(false);
  protected readonly notFound = signal(false);
  protected readonly showDraftRecovery = signal(false);
  protected readonly showLeavePrompt = signal(false);
  private pendingDraft: ScenarioDraft | null = null;
  private canonicalScenario: Scenario | null = null;
  private resolveLeavePrompt?: (choice: LeaveChoice) => void;

  /** Increments on every (re)load, like `sessionRevision` keys the Vue editor. */
  protected readonly session = this.scenarioService.selectWhenReady(
    (s) => s.io.sessionRevision.value,
    0,
  );
  protected readonly scenarioName = this.scenarioService.selectWhenReady(
    (s) => s.store.state.info.name,
    '',
  );
  protected readonly savedDirty = this.scenarioService.selectWhenReady(
    (s) => s.io.savedDirty.value,
    false,
  );
  protected readonly showInfoPanel = this.scenarioService.selectWhenReady(
    () => this.selection.items.showScenarioInfo.value,
    false,
  );
  protected readonly showEditor = computed(
    () => this.localReady() && this.scenarioService.isReady() && this.session() > 0,
  );

  constructor() {
    effect(() => {
      const id = this.scenarioId();
      untracked(() => void this.load(id));
    });
    this.destroyRef.onDestroy(() => this.selection.clear());
  }

  private async load(scenarioId: string): Promise<void> {
    this.localReady.set(false);
    this.notFound.set(false);
    this.showDraftRecovery.set(false);
    this.pendingDraft = null;
    this.canonicalScenario = null;
    const io = this.scenarioService.scenario.io;

    if (scenarioId.startsWith('demo-')) {
      const demo = await io.loadDemoScenario(scenarioId.replace('demo-', ''));
      if (demo) {
        this.showScenarioInfo();
        await this.maybePromptForDraftRecovery(demo);
      }
      this.localReady.set(true);
      return;
    }

    const stored = await this.repository.loadScenario(scenarioId);
    if (stored) {
      io.loadFromObject(stored);
      this.showScenarioInfo();
      await this.maybePromptForDraftRecovery(stored);
    } else {
      this.notFound.set(true);
      console.error('Scenario not found in indexeddb');
    }
    this.localReady.set(true);
  }

  private showScenarioInfo(): void {
    this.selection.clear();
    this.selection.items.showScenarioInfo.value = true;
  }

  private async maybePromptForDraftRecovery(saved: Scenario): Promise<void> {
    const draft = await this.scenarioService.scenario.io.getNewerDraft(saved.id, saved);
    if (!draft) return;
    this.pendingDraft = draft;
    this.canonicalScenario = saved;
    this.showDraftRecovery.set(true);
  }

  protected onRestoreDraft(): void {
    if (!this.pendingDraft || !this.canonicalScenario) return;
    this.scenarioService.scenario.io.loadFromObject(this.pendingDraft.scenario, {
      loadedBaseline: this.canonicalScenario,
      savedBaseline: this.canonicalScenario,
    });
    this.showScenarioInfo();
    this.closeDraftRecovery();
  }

  protected async onOpenSavedVersion(): Promise<void> {
    if (this.pendingDraft) {
      await this.scenarioService.scenario.io.discardDraft(this.pendingDraft.scenarioId);
    }
    this.closeDraftRecovery();
  }

  protected closeDraftRecovery(): void {
    this.showDraftRecovery.set(false);
    this.pendingDraft = null;
    this.canonicalScenario = null;
  }

  /** Same as the "save" action of ScenarioEditor.vue. */
  async save(): Promise<void> {
    const io = this.scenarioService.scenario.io;
    const previousId = this.scenarioService.scenario.store.state.id;
    const newId = await io.saveToIndexedDb();
    this.notifications.send({ message: 'Scenario saved in browser' });
    if (previousId !== newId || this.scenarioId() !== newId) {
      await this.router.navigate(['/scenario', newId], { replaceUrl: false });
    }
  }

  /** Port of `onScenarioAction` in ScenarioEditor.vue, for the actions of the ported menu. */
  protected async onMenuAction(action: MainMenuAction): Promise<void> {
    const io = this.scenarioService.scenario.io;
    switch (action) {
      case 'save':
        await this.save();
        break;
      case 'exportJson':
        await io.downloadAsJson();
        break;
      case 'createNew':
        await this.router.navigate(['/newscenario']);
        break;
      case 'duplicate': {
        const scenarioId = await io.duplicateScenario();
        await this.router.navigate(['/scenario', scenarioId]);
        break;
      }
      case 'showInfo':
        this.showScenarioInfo();
        break;
      case 'restoreOriginal':
        if (io.restoreLoadedBaseline()) {
          this.notifications.send({ message: 'Reverted scenario to the opened state' });
        }
        break;
      case 'revertToSaved':
        if (io.revertToSaved()) {
          this.notifications.send({ message: 'Reverted scenario to the saved version' });
        }
        break;
      case 'exportToClipboard':
        await navigator.clipboard.writeText(io.stringifyScenario());
        this.notifications.send({ message: 'Scenario copied to clipboard', type: 'success' });
        break;
    }
  }

  /** Called by the CanDeactivate guard: same rules as onBeforeRouteLeave in the Vue wrapper. */
  async confirmNavigationAway(): Promise<boolean> {
    if (!this.scenarioService.isReady()) return true;
    const io = this.scenarioService.scenario.io;
    if (!io.hasUnsavedChanges()) {
      await io.flushDraft();
      return true;
    }
    this.showLeavePrompt.set(true);
    const choice = await new Promise<LeaveChoice>((resolve) => (this.resolveLeavePrompt = resolve));
    if (choice === 'save') {
      await io.saveToIndexedDb();
      return true;
    }
    if (choice === 'discard') {
      await io.discardDraft();
      return true;
    }
    return false;
  }

  protected resolveLeave(choice: LeaveChoice): void {
    this.showLeavePrompt.set(false);
    this.resolveLeavePrompt?.(choice);
    this.resolveLeavePrompt = undefined;
  }

  protected undo(): void {
    this.scenarioService.undo();
  }

  protected redo(): void {
    this.scenarioService.redo();
  }

  /** Meta variants on keydown, Ctrl variants on keyup, as the GlobalEvents of ScenarioEditor.vue. */
  protected onKeydown(event: KeyboardEvent): void {
    if (!this.showEditor() || !inputEventFilter(event) || !event.metaKey) return;
    if (event.key.toLowerCase() === 'z' && !event.shiftKey && !event.ctrlKey && !event.altKey) {
      this.undo();
    } else if (event.key.toLowerCase() === 'z' && event.shiftKey) {
      this.redo();
    }
  }

  protected onKeyup(event: KeyboardEvent): void {
    if (!this.showEditor() || !inputEventFilter(event) || !event.ctrlKey) return;
    const key = event.key.toLowerCase();
    if (key === 'z' && !event.shiftKey && !event.metaKey && !event.altKey) this.undo();
    else if (key === 'z' && event.shiftKey) this.redo();
    else if (key === 'y') this.redo();
  }

  protected onVisibilityChange(): void {
    if (document.visibilityState === 'hidden') void this.flushDraft();
  }

  protected async flushDraft(): Promise<void> {
    if (this.scenarioService.isReady()) await this.scenarioService.scenario.io.flushDraft();
  }

  protected onBeforeUnload(event: BeforeUnloadEvent): void {
    if (!this.scenarioService.isReady()) return;
    const io = this.scenarioService.scenario.io;
    void io.flushDraft();
    if (!io.hasUnsavedChanges()) return;
    event.preventDefault();
    event.returnValue = '';
  }
}
