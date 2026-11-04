import { Injectable, signal } from '@angular/core';
import { formatDateString, formatDTG } from '@/geo/utils';

/** Same shape and defaults as `TimeFormatSettings` in src/stores/timeFormatStore.ts. */
export interface TimeFormatSettings {
  timeFormat: 'iso' | 'local' | 'military' | 'custom';
  locale: string;
  dateStyle: Intl.DateTimeFormatOptions['dateStyle'];
  timeStyle: Intl.DateTimeFormatOptions['timeStyle'];
}

export interface TimeFormatter {
  format(value: number): string;
}

const DEFAULTS: Record<'track' | 'scenario', TimeFormatSettings> = {
  track: { timeFormat: 'local', locale: '', dateStyle: 'short', timeStyle: 'short' },
  scenario: { timeFormat: 'local', locale: '', dateStyle: 'medium', timeStyle: 'short' },
};
const STORAGE_KEYS = { track: 'trackTimeFormat', scenario: 'scenarioTimeFormat' } as const;

function read(kind: 'track' | 'scenario'): TimeFormatSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[kind]);
    return raw ? { ...DEFAULTS[kind], ...(JSON.parse(raw) as TimeFormatSettings) } : DEFAULTS[kind];
  } catch {
    return DEFAULTS[kind];
  }
}

/**
 * The time formatters of src/stores/timeFormatStore.ts (`createFormatter`), reading the settings
 * the Vue app stores under the same localStorage keys. The store itself is not imported: its
 * module pulls Vue component injection keys.
 */
@Injectable({ providedIn: 'root' })
export class TimeFormatService {
  readonly scenarioSettings = signal(read('scenario'));
  readonly trackSettings = signal(read('track'));

  formatter(
    timeZone: string,
    settings: TimeFormatSettings,
    { dateOnly = false } = {},
  ): TimeFormatter {
    if (settings.timeFormat === 'iso') {
      if (dateOnly) return { format: (v) => formatDateString(v, timeZone).split('T')[0] };
      return { format: (v) => formatDateString(v, timeZone) };
    }
    if (settings.timeFormat === 'military') {
      return { format: (v) => formatDTG(v, timeZone) };
    }
    if (dateOnly) {
      return new Intl.DateTimeFormat(settings.locale || undefined, {
        timeZone,
        dateStyle: settings.dateStyle,
      });
    }
    return new Intl.DateTimeFormat(settings.locale || undefined, {
      timeZone,
      dateStyle: settings.dateStyle,
      timeStyle: settings.timeStyle,
    });
  }
}
