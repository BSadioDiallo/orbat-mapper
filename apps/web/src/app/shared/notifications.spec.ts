import { TestBed } from '@angular/core/testing';
import { useNotifications } from '@/composables/notifications';
import { AppNotifications } from './notifications';

describe('AppNotifications', () => {
  afterEach(() => useNotifications().clear());

  it('shows what the shared code sends, newest first, and removes it on close', async () => {
    const fixture = TestBed.createComponent(AppNotifications);
    const { send, notifications } = useNotifications();
    send({ message: 'First', duration: 60_000 });
    send({ message: 'Scenario saved in browser', type: 'success', duration: 60_000 });
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement;
    const items = host.querySelectorAll('app-notification-item');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('Scenario saved in browser');

    vi.useFakeTimers();
    items[0].querySelector<HTMLButtonElement>('button:last-of-type')!.click();
    vi.advanceTimersByTime(200);
    vi.useRealTimers();
    await fixture.whenStable();
    expect(notifications.value.map((n) => n.message)).toEqual(['First']);
  });
});
