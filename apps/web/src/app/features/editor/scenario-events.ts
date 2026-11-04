import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject } from '@angular/core';
import { LucideX } from '@lucide/angular';
import type { NScenarioEvent } from '@/types/internalModels';
import { renderMarkdown } from '@/composables/formatting';
import { resolveTimeZone } from '@/utils/militaryTimeZones';
import { ScenarioService } from '../../core/scenario/scenario.service';
import { SelectionService } from '../../core/ui/selection.service';
import { TimeFormatService } from '../../core/ui/time-format.service';
import { ButtonDirective } from '../../shared/ui/button';

/** The scenario's time zone and formatters, shared by the event components. */
function useEventTime() {
  const scenarioService = inject(ScenarioService);
  const timeFormat = inject(TimeFormatService);
  const zone = scenarioService.select((s) => resolveTimeZone(s.store.state.info.timeZone ?? 'UTC'));
  return {
    date: computed(() =>
      timeFormat.formatter(zone(), timeFormat.scenarioSettings(), { dateOnly: true }),
    ),
    dateTime: computed(() => timeFormat.formatter(zone(), timeFormat.scenarioSettings())),
  };
}

/** The list of scenario events (src/modules/scenarioeditor/ScenarioEventsPanel.vue). */
@Component({
  selector: 'app-scenario-events-panel',
  template: `
    <div class="p-0.5" data-testid="scenario-events">
      <h2 class="text-heading text-sm font-semibold">Scenario events</h2>
      <div class="flow-root">
        <ul class="mt-4">
          @for (event of events(); track event.id; let last = $last) {
            <li class="group flex">
              <div class="relative flex-auto pb-4">
                @if (!last) {
                  <span
                    class="bg-muted-foreground/30 absolute top-2 left-2 -ml-px h-full w-0.5"
                    aria-hidden="true"
                  ></span>
                }
                <div class="relative flex space-x-4">
                  <button
                    type="button"
                    class="ring-ring mt-1 flex size-4 items-center justify-center rounded-full ring-4"
                    [class.bg-muted]="event.startTime > currentTime()"
                    [class.bg-background]="event.startTime < currentTime()"
                    [class.bg-accent-foreground]="event.startTime === currentTime()"
                    [attr.aria-label]="'Go to ' + event.title"
                    (click)="onEventClick(event)"
                  ></button>
                  <button
                    type="button"
                    class="min-w-0 flex-1 cursor-pointer text-left text-sm"
                    [class]="
                      event.startTime === currentTime()
                        ? 'border-primary/60 bg-primary/10 rounded-md border px-2 py-1'
                        : ''
                    "
                    data-testid="scenario-event"
                    (click)="onEventClick(event)"
                  >
                    <p class="text-muted-foreground text-xs font-medium">
                      {{ time.date().format(event.startTime) }}
                    </p>
                    <p class="font-medium" data-testid="scenario-event-title">{{ event.title }}</p>
                    @if (event.subTitle) {
                      <p class="text-muted-foreground">{{ event.subTitle }}</p>
                    }
                  </button>
                </div>
              </div>
            </li>
          } @empty {
            <li class="text-muted-foreground text-sm">No scenario events</li>
          }
        </ul>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScenarioEventsPanel {
  private readonly scenarioService = inject(ScenarioService);
  private readonly selection = inject(SelectionService);
  protected readonly time = useEventTime();
  protected readonly events = this.scenarioService.select((s) =>
    s.store.state.events.map((id) => {
      const { id: eventId, title, subTitle, startTime } = s.store.state.eventMap[id];
      return { id: eventId, title, subTitle, startTime };
    }),
  );
  protected readonly currentTime = this.scenarioService.select((s) => s.store.state.currentTime);

  /** `goToScenarioEvent` moves the clock; the details panel then shows the event. */
  protected onEventClick(event: { id: string }): void {
    const scenario = this.scenarioService.scenario;
    scenario.time.goToScenarioEvent(scenario.store.state.eventMap[event.id] as NScenarioEvent);
    this.selection.clear();
    this.selection.items.activeScenarioEventId.value = event.id;
  }
}

/**
 * Details of the active scenario event (read part of ScenarioEventDetails.vue): title, time,
 * subtitle, image and description. Editing, location and actions are a later lot (G-012).
 */
@Component({
  selector: 'app-scenario-event-details',
  imports: [ButtonDirective, LucideX],
  template: `
    @let e = event();
    @if (e) {
      <aside
        class="bg-sidebar text-sidebar-foreground flex h-full flex-col overflow-auto p-4"
        aria-label="Event details"
        data-testid="event-details"
      >
        <header class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 class="text-heading text-lg font-semibold break-words" data-testid="event-title">
              {{ e.title }}
            </h2>
            <p class="text-muted-foreground text-sm">{{ time.dateTime().format(e.startTime) }}</p>
          </div>
          <button
            appButton
            variant="ghost"
            size="icon-sm"
            type="button"
            aria-label="Close event details"
            (click)="close()"
          >
            <svg lucideX></svg>
          </button>
        </header>
        @if (e.imageUrl) {
          <figure class="mt-4">
            <img class="w-full rounded-md" [src]="e.imageUrl" alt="" />
            @if (e.imageCaption) {
              <figcaption class="text-muted-foreground mt-1 text-xs">
                {{ e.imageCaption }}
              </figcaption>
            }
          </figure>
        }
        @if (e.subTitle) {
          <p class="text-muted-foreground mt-4 text-sm">{{ e.subTitle }}</p>
        }
        <div class="prose prose-sm dark:prose-invert mt-4" [innerHTML]="description()"></div>
      </aside>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
})
export class ScenarioEventDetails {
  private readonly scenarioService = inject(ScenarioService);
  private readonly selection = inject(SelectionService);
  protected readonly time = useEventTime();

  protected readonly event = this.scenarioService.select((s) => {
    const id = this.selection.items.activeScenarioEventId.value;
    const event = id ? s.store.state.eventMap[id] : undefined;
    if (!event) return null;
    return {
      title: event.title,
      subTitle: event.subTitle,
      startTime: event.startTime,
      description: event.description ?? '',
      imageUrl: event.media?.[0]?.url,
      imageCaption: event.media?.[0]?.caption,
    };
  });
  protected readonly description = computed(() => renderMarkdown(this.event()?.description ?? ''));

  constructor() {
    // As ScenarioEventDetails.vue: stepping to another event shows that event.
    const off = this.scenarioService.scenario.time.onGoToScenarioEventEvent(({ event }) => {
      if (event.id) this.selection.items.activeScenarioEventId.value = event.id;
    });
    inject(DestroyRef).onDestroy(() => off.off());
  }

  protected close(): void {
    this.selection.items.activeScenarioEventId.value = null;
  }
}
