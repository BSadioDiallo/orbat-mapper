import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import type { SymbolOptions } from 'milsymbol';
import { symbolGenerator } from '@/symbology/milsymbwrapper';
import { SymbolSettingsService } from '../core/ui/symbol-settings.service';

/**
 * A MIL-STD-2525 / APP-6 symbol drawn by milsymbol, like src/components/MilitarySymbol.vue.
 * The SVG comes from milsymbol (as in the Vue app, which also sets it as innerHTML).
 */
@Component({
  selector: 'app-military-symbol',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'milsymbol inline-block' },
})
export class MilitarySymbol {
  readonly sidc = input<string | undefined>('');
  readonly size = input(15);
  readonly options = input<SymbolOptions | undefined>(undefined);

  private readonly settings = inject(SymbolSettingsService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly svg = computed(
    () =>
      symbolGenerator(this.sidc() || '', {
        size: this.size(),
        ...this.settings.symbolOptions(),
        ...(this.options() ?? {}),
      }).asSVG() as string,
  );

  constructor() {
    effect(() => {
      this.host.nativeElement.innerHTML = this.svg();
    });
  }
}
