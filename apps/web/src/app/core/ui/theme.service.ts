import { DOCUMENT, inject, Injectable, signal } from '@angular/core';

/** Storage key of VueUse's `useDark`, so the choice carries over from the Vue app. */
const STORAGE_KEY = 'vueuse-color-scheme';

/** Dark mode: the `dark` class on <html>, as `UseDark` does in the Vue app. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  readonly isDark = signal(this.initialIsDark());

  constructor() {
    this.apply(this.isDark());
  }

  toggleDark(): void {
    const next = !this.isDark();
    this.isDark.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
    } catch {
      // ignore unavailable storage
    }
    this.apply(next);
  }

  private initialIsDark(): boolean {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      stored = null;
    }
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }

  private apply(dark: boolean): void {
    this.document.documentElement.classList.toggle('dark', dark);
  }
}
