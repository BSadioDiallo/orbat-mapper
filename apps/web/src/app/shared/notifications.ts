import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { LucideCircleCheck, LucideX } from '@lucide/angular';
import { type UiNotificationAction, useNotifications } from '@/composables/notifications';
import { reactiveSignal } from '../core/scenario/reactive-signal';

/** One toast (src/components/NotificationItem.vue): closes after `duration`, timer as useTimer. */
@Component({
  selector: 'app-notification-item',
  imports: [LucideCircleCheck, LucideX],
  template: `
    <div
      class="ring-opacity-5 bg-background pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black transition duration-100 ease-in"
      [class.opacity-0]="!show()"
      role="status"
    >
      <div class="p-4">
        <div class="flex items-start">
          @if (type() === 'success') {
            <div class="mr-3 shrink-0">
              <svg lucideCircleCheck class="h-6 w-6 text-green-400" aria-hidden="true"></svg>
            </div>
          }
          <div class="flex w-0 flex-1 justify-between">
            <p class="text-foreground w-0 flex-1 text-sm font-medium">{{ message() }}</p>
          </div>
          @if (action(); as a) {
            <button
              type="button"
              class="text-primary hover:text-primary/80 focus:ring-ring ml-3 shrink-0 rounded-md text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
              (click)="runAction(a)"
            >
              {{ a.label }}
            </button>
          }
          <div class="ml-4 flex shrink-0">
            <button
              type="button"
              class="text-muted-foreground hover:text-foreground focus:ring-ring bg-background inline-flex rounded-md focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
              (click)="close()"
            >
              <span class="sr-only">Close</span>
              <svg lucideX class="h-5 w-5" aria-hidden="true"></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex w-full justify-center sm:justify-end' },
})
export class NotificationItem {
  readonly message = input('Message');
  readonly duration = input(4000);
  readonly type = input<string | undefined>(undefined);
  readonly action = input<UiNotificationAction | undefined>(undefined);
  readonly closed = output();
  protected readonly show = signal(true);

  constructor() {
    const timer = setTimeout(() => this.close(), this.duration());
    inject(DestroyRef).onDestroy(() => clearTimeout(timer));
  }

  protected runAction(action: UiNotificationAction): void {
    action.onClick();
    this.close();
  }

  protected close(): void {
    this.show.set(false);
    setTimeout(() => this.closed.emit(), 150);
  }
}

/** The notification area (src/components/AppNotifications.vue), fed by `useNotifications()`. */
@Component({
  selector: 'app-notifications',
  imports: [NotificationItem],
  template: `
    <div
      aria-live="assertive"
      class="pointer-events-none fixed inset-0 z-[9999] flex items-end px-2 py-6 sm:items-start sm:py-16"
    >
      <div class="flex w-full flex-col items-center space-y-4 sm:items-end">
        @for (n of notifications(); track n.id) {
          <app-notification-item
            [message]="n.message ?? 'Message'"
            [duration]="n.duration ?? 4000"
            [type]="n.type"
            [action]="n.action"
            (closed)="remove(n.id)"
          />
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppNotifications {
  private readonly api = useNotifications();
  protected readonly notifications = reactiveSignal(() =>
    [...this.api.notifications.value].reverse(),
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => this.api.clear());
  }

  protected remove(id: string): void {
    this.api.deleteNotification(id);
  }
}
