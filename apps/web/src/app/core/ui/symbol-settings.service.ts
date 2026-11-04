import { DestroyRef, inject, Injectable } from '@angular/core';
import { useSettingsStore, useSymbolSettingsStore } from '@/stores/settingsStore';
import { reactiveSignal } from '../scenario/reactive-signal';

/**
 * Symbol and ORBAT display settings. The values live in the shared settings stores (kept for the
 * shared code that reads them, such as io.ts), persisted in localStorage under the Vue app's keys.
 */
@Injectable({ providedIn: 'root' })
export class SymbolSettingsService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly symbolStore = useSymbolSettingsStore();
  private readonly settingsStore = useSettingsStore();

  readonly symbolOptions = reactiveSignal(() => ({ ...this.symbolStore.symbolOptions }), {
    destroyRef: this.destroyRef,
  });
  readonly orbatIconSize = reactiveSignal(() => this.settingsStore.orbatIconSize as number, {
    destroyRef: this.destroyRef,
  });
  readonly orbatShortName = reactiveSignal(() => this.settingsStore.orbatShortName as boolean, {
    destroyRef: this.destroyRef,
  });
}
