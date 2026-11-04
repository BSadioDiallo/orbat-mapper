import { TestBed } from '@angular/core/testing';
import { SelectionService } from './selection.service';

describe('SelectionService (shared selectedStore)', () => {
  it('clearing the selection clears the active unit, after the deferred watch as in Vue', async () => {
    const selection = TestBed.inject(SelectionService);
    selection.selectUnit('u1');
    expect(selection.activeUnitId()).toBe('u1');
    selection.clear();
    await Promise.resolve();
    await Promise.resolve();
    expect(selection.selectedUnitIds().size).toBe(0);
    expect(selection.activeUnitId()).toBeNull();
  });
});
