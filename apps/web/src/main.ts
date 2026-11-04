// The shared code relies on the dayjs plugins (utc, timezone…) being registered once at startup,
// as the Vue app's main.ts does.
import '@/dayjs';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch((err: unknown) => console.error(err));
