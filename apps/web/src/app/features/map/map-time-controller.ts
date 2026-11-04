import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  LucideChevronLeft,
  LucideChevronRight,
  LucideSkipBack,
  LucideSkipForward,
} from '@lucide/angular';
import { resolveTimeZone } from '@/utils/militaryTimeZones';
import { TimeFormatService } from '../../core/ui/time-format.service';
import { ScenarioService } from '../../core/scenario/scenario.service';

/**
 * Scenario time over the map (src/components/MapTimeController.vue) with the day and event steps
 * of useScenarioMapModeController.ts: ±1 day and previous/next scenario event.
 * TODO(migration): time and date modal, time settings panel (G-011).
 */
@Component({
  selector: 'app-map-time-controller',
  imports: [LucideChevronLeft, LucideChevronRight, LucideSkipBack, LucideSkipForward],
  template: `
    <div class="flex flex-col items-center">
      <p
        class="pointer-events-none font-mono text-base font-bold whitespace-nowrap text-gray-100 [text-shadow:black_0_0_2px] sm:text-2xl"
        data-testid="scenario-time"
      >
        {{ formatted() }}
      </p>
      <div
        class="bg-background pointer-events-auto mt-1 inline-flex rounded-md shadow-sm"
        role="toolbar"
        aria-label="Scenario time"
      >
        <button
          type="button"
          [class]="buttonClass + ' rounded-l-md'"
          data-testid="dec-day"
          (click)="decDay()"
        >
          <span class="sr-only">Previous day</span>
          <svg lucideChevronLeft class="h-5 w-5" aria-hidden="true"></svg>
        </button>
        <button type="button" [class]="buttonClass" data-testid="inc-day" (click)="incDay()">
          <span class="sr-only">Next day</span>
          <svg lucideChevronRight class="h-5 w-5" aria-hidden="true"></svg>
        </button>
        <button type="button" [class]="buttonClass" data-testid="prev-event" (click)="prevEvent()">
          <span class="sr-only">Previous event</span>
          <svg lucideSkipBack class="h-5 w-5" aria-hidden="true"></svg>
        </button>
        <button
          type="button"
          [class]="buttonClass + ' rounded-r-md'"
          data-testid="next-event"
          (click)="nextEvent()"
        >
          <span class="sr-only">Next event</span>
          <svg lucideSkipForward class="h-5 w-5" aria-hidden="true"></svg>
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapTimeController {
  private readonly scenarioService = inject(ScenarioService);
  private readonly timeFormat = inject(TimeFormatService);
  protected readonly buttonClass =
    'text-muted-foreground hover:bg-accent hover:text-foreground focus:ring-ring relative inline-flex items-center border px-2 py-1.5 focus:z-10 focus:ring-2 focus:outline-hidden';

  private readonly time = this.scenarioService.select((s) => ({
    currentTime: s.store.state.currentTime,
    timeZone: s.store.state.info.timeZone ?? 'UTC',
  }));

  /** `fmt.scenarioFormatter.format(state.currentTime)`, in the scenario's time zone. */
  protected readonly formatted = computed(() => {
    const { currentTime, timeZone } = this.time();
    return this.timeFormat
      .formatter(resolveTimeZone(timeZone), this.timeFormat.scenarioSettings())
      .format(currentTime);
  });

  protected incDay(): void {
    this.scenarioService.scenario.time.add(1, 'day', true);
  }

  protected decDay(): void {
    this.scenarioService.scenario.time.subtract(1, 'day', true);
  }

  protected nextEvent(): void {
    this.scenarioService.scenario.time.goToNextScenarioEvent();
  }

  protected prevEvent(): void {
    this.scenarioService.scenario.time.goToPrevScenarioEvent();
  }
}
