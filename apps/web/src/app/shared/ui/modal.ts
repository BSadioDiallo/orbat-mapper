import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { nanoid } from '@/utils';

/**
 * Modal dialog in the look of src/components/NewSimpleModal.vue: backdrop, title, focus trapped
 * inside, Escape and backdrop click cancel, focus restored on close.
 */
@Component({
  selector: 'app-modal',
  imports: [A11yModule],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 bg-black/50" aria-hidden="true" (click)="dismiss.emit()"></div>
      <div
        class="bg-background fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border p-6 shadow-lg sm:max-w-lg"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="titleId"
        cdkTrapFocus
        [cdkTrapFocusAutoCapture]="true"
        (keydown.escape)="dismiss.emit()"
      >
        <h2 class="text-lg leading-none font-semibold" [id]="titleId">{{ dialogTitle() }}</h2>
        <ng-content />
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Modal {
  readonly open = input(false);
  readonly dialogTitle = input('');
  /** Escape, backdrop click: the `cancel` event of NewSimpleModal.vue. */
  readonly dismiss = output();
  protected readonly titleId = `modal-title-${nanoid(6)}`;
}
