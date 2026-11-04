import { DestroyRef, inject, Injectable } from '@angular/core';
import type { EntityId } from '@/types/base';
import { useSelectedItems } from '@/stores/selectedStore';
import { reactiveSignal } from '../scenario/reactive-signal';

/**
 * Selection of units (and later features and events). The state is the shared selection module
 * (`src/stores/selectedStore.ts`), because the reused map layer controller reads and writes it;
 * this service exposes it as signals and keeps the same rules (one active unit, …).
 */
@Injectable({ providedIn: 'root' })
export class SelectionService {
  private readonly destroyRef = inject(DestroyRef);
  readonly items = useSelectedItems();

  readonly activeUnitId = reactiveSignal(() => this.items.activeUnitId.value ?? null, {
    destroyRef: this.destroyRef,
  });
  readonly selectedUnitIds = reactiveSignal(() => new Set(this.items.selectedUnitIds.value), {
    destroyRef: this.destroyRef,
  });

  /** Click on a unit: replaces the selection; with `add`, toggles the unit in it. */
  selectUnit(unitId: EntityId, { add = false } = {}): void {
    const selected = this.items.selectedUnitIds.value;
    if (add) {
      if (selected.has(unitId)) selected.delete(unitId);
      else selected.add(unitId);
      return;
    }
    selected.clear();
    selected.add(unitId);
    this.items.activeUnitId.value = unitId;
  }

  clear(): void {
    this.items.clear();
  }
}
