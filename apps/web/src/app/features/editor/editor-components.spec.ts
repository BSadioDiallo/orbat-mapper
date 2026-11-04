import { TestBed } from '@angular/core/testing';
import { provideScenarioRepository } from '../../core/persistence/provide-scenario-repository';
import { SelectionService } from '../../core/ui/selection.service';
import { loadNarvik } from '../../testing/load-demo';
import { OrbatTree } from './orbat-tree';
import { UnitDetails } from './unit-details';

describe('editor components on the Narvik demo', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideScenarioRepository()] });
  });

  afterEach(() => TestBed.inject(SelectionService).clear());

  it('OrbatTree shows every side and the root units, like the Vue tree', async () => {
    const service = loadNarvik();
    const fixture = TestBed.createComponent(OrbatTree);
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement;
    const state = service.scenario.store.state;
    const sideNames = state.sides.map((id) => state.sideMap[id].name);
    for (const name of sideNames) expect(host.textContent).toContain(name);
    const rootUnits = state.sides.flatMap((id) =>
      state.sideMap[id].groups.flatMap((g) => state.sideGroupMap[g].subUnits),
    );
    expect(host.querySelectorAll('[role=treeitem]').length).toBe(rootUnits.length);
  });

  it('OrbatTree expands a unit and selects it', async () => {
    const service = loadNarvik();
    const fixture = TestBed.createComponent(OrbatTree);
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement;
    const item = host.querySelector<HTMLElement>('[role=treeitem]')!;
    const unitId = item.dataset['unitId']!;
    const children = service.scenario.store.state.unitMap[unitId].subUnits.length;
    const before = host.querySelectorAll('[role=treeitem]').length;
    item.querySelector('button')!.click();
    await fixture.whenStable();
    expect(host.querySelectorAll('[role=treeitem]').length).toBe(before + children);

    item.click();
    await fixture.whenStable();
    expect(TestBed.inject(SelectionService).activeUnitId()).toBe(unitId);
    expect(item.getAttribute('aria-selected')).toBe('true');
  });

  it('UnitDetails edits the active unit through the store, with undo', async () => {
    const service = loadNarvik();
    const selection = TestBed.inject(SelectionService);
    const unitId = Object.keys(service.scenario.store.state.unitMap)[0];
    const original = service.scenario.store.state.unitMap[unitId].name;
    selection.selectUnit(unitId);
    const fixture = TestBed.createComponent(UnitDetails);
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('[data-testid=unit-name]')!.textContent!.trim()).toBe(original);

    host.querySelector<HTMLButtonElement>('[data-testid=edit-unit]')!.click();
    await fixture.whenStable();
    const input = host.querySelector<HTMLInputElement>('#unit-name-input')!;
    expect(input.value).toBe(original);
    input.value = 'Edited in a test';
    input.dispatchEvent(new Event('input'));
    host.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(service.scenario.store.state.unitMap[unitId].name).toBe('Edited in a test');
    expect(host.querySelector('[data-testid=unit-name]')!.textContent!.trim()).toBe(
      'Edited in a test',
    );
    service.undo();
    await fixture.whenStable();
    expect(host.querySelector('[data-testid=unit-name]')!.textContent!.trim()).toBe(original);
  });

  it('UnitDetails refuses an empty name, as required', async () => {
    const service = loadNarvik();
    const unitId = Object.keys(service.scenario.store.state.unitMap)[0];
    const original = service.scenario.store.state.unitMap[unitId].name;
    TestBed.inject(SelectionService).selectUnit(unitId);
    const fixture = TestBed.createComponent(UnitDetails);
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement;
    host.querySelector<HTMLButtonElement>('[data-testid=edit-unit]')!.click();
    await fixture.whenStable();
    const input = host.querySelector<HTMLInputElement>('#unit-name-input')!;
    input.value = '';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(host.querySelector<HTMLButtonElement>('button[type=submit]')!.disabled).toBe(true);
    host.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    expect(service.scenario.store.state.unitMap[unitId].name).toBe(original);
  });
});
