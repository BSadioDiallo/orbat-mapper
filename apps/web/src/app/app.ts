import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppNotifications } from './shared/notifications';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppNotifications],
  template: '<router-outlet /><app-notifications />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
})
export class App {}
