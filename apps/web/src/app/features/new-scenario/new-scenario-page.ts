import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { form, FormField, max, min, required } from '@angular/forms/signals';
import { timeZonesNames } from '@vvo/tzdb';
import dayjs from 'dayjs';
import { createEmptyScenario } from '@/scenariostore/io';
import type { SymbologyStandard } from '@/types/scenarioModels';
import { SID, type SidValue, standardIdentityValues } from '@/symbology/values';
import { echelonItems } from '@/symbology/helpers';
import { stableSymbologyStandardOptions } from '@/symbology/standards';
import { Sidc } from '@/symbology/sidc';
import { nanoid } from '@/utils';
import { MILITARY_TIME_ZONE_NAMES, resolveTimeZone } from '@/utils/militaryTimeZones';
import { SCENARIO_REPOSITORY } from '../../core/persistence/scenario-repository';
import { ScenarioService } from '../../core/scenario/scenario.service';
import { ButtonDirective } from '../../shared/ui/button';
import { MilitarySymbol } from '../../shared/military-symbol';

interface RootUnit {
  rootUnitName: string;
  rootUnitEchelon: string;
  rootUnitIcon: string;
}

interface InitialSide {
  name: string;
  standardIdentity: SidValue;
  units: RootUnit[];
}

interface NewScenarioModel {
  name: string;
  description: string;
  noInitialOrbat: boolean;
  sides: InitialSide[];
  timeZone: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  symbologyStandard: SymbologyStandard;
}

/** The main icons offered for root units, as in NewScenarioView.vue. */
const ICONS = [
  { code: '000000', text: 'Unspecified' },
  { code: '110000', text: 'Command and Control' },
  { code: '121100', text: 'Infantry' },
  { code: '121000', text: 'Combined Arms' },
  { code: '121102', text: 'Mechanized' },
  { code: '130300', text: 'Artillery' },
  { code: '120500', text: 'Armor' },
  { code: '160600', text: 'Combat Service Support' },
];

/** Port of src/modules/scenarioeditor/NewScenarioView.vue. */
@Component({
  selector: 'app-new-scenario-page',
  imports: [RouterLink, FormField, ButtonDirective, MilitarySymbol],
  templateUrl: './new-scenario-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full overflow-auto' },
})
export class NewScenarioPage {
  private readonly scenarioService = inject(ScenarioService);
  private readonly repository = inject(SCENARIO_REPOSITORY);
  private readonly router = inject(Router);

  private readonly newScenario = createEmptyScenario({
    addGroups: true,
    symbologyStandard: 'app6d',
  });
  protected readonly timeZones = [...timeZonesNames, 'UTC', ...MILITARY_TIME_ZONE_NAMES];
  protected readonly identities = standardIdentityValues;
  protected readonly icons = ICONS;
  protected readonly standards = stableSymbologyStandardOptions;
  protected readonly creating = signal(false);

  protected readonly model = signal<NewScenarioModel>(this.initialModel());
  protected readonly scenarioForm = form(this.model, (path) => {
    required(path.name);
    min(path.month, 1);
    max(path.month, 12);
    min(path.day, 1);
    max(path.day, 31);
    min(path.hour, 0);
    max(path.hour, 23);
    min(path.minute, 0);
    max(path.minute, 59);
  });

  /** `resDateTime` of useYMDElements: the start time read in the chosen time zone. */
  protected readonly startTime = computed(() => {
    const { year, month, day, hour, minute, timeZone } = this.model();
    try {
      return dayjs.tz(`${year}-${month}-${day} ${hour}:${minute}`, resolveTimeZone(timeZone));
    } catch {
      return dayjs(0);
    }
  });

  protected echelons(sid: SidValue) {
    return echelonItems(sid);
  }

  protected unitSidc(unit: RootUnit, side: InitialSide): string {
    return (
      '100' +
      side.standardIdentity +
      '10' +
      '00' +
      unit.rootUnitEchelon +
      unit.rootUnitIcon +
      '0000'
    );
  }

  protected addSide(): void {
    this.model.update((m) => ({
      ...m,
      sides: [
        ...m.sides,
        {
          name: 'Side',
          standardIdentity: SID.Friend,
          units: [{ rootUnitName: 'HQ', rootUnitEchelon: '18', rootUnitIcon: '121000' }],
        },
      ],
    }));
  }

  protected addRootUnit(sideIndex: number): void {
    this.updateSide(sideIndex, (side) => ({
      ...side,
      units: [...side.units, { rootUnitName: 'HQ', rootUnitEchelon: '18', rootUnitIcon: '121000' }],
    }));
  }

  protected removeUnit(sideIndex: number, unitIndex: number): void {
    this.updateSide(sideIndex, (side) => ({
      ...side,
      units: side.units.filter((_, i) => i !== unitIndex),
    }));
  }

  private updateSide(index: number, fn: (side: InitialSide) => InitialSide): void {
    this.model.update((m) => ({ ...m, sides: m.sides.map((s, i) => (i === index ? fn(s) : s)) }));
  }

  /** Same steps as `create()` in NewScenarioView.vue. */
  protected async create(event: Event): Promise<void> {
    event.preventDefault();
    if (this.scenarioForm().invalid() || this.creating()) return;
    this.creating.set(true);
    const m = this.model();
    const scenario = this.newScenario;
    const startTime = this.startTime().valueOf();
    scenario.startTime = startTime;
    scenario.name = m.name;
    scenario.description = m.description;
    scenario.layerStack = [{ name: 'Features', id: nanoid(), kind: 'overlay', items: [] }];
    scenario.timeZone = m.timeZone;
    scenario.symbologyStandard = m.symbologyStandard;

    const api = this.scenarioService.scenario;
    api.io.loadFromObject(scenario);
    const active = this.scenarioService.scenario;
    active.time.setCurrentTime(startTime);
    if (!m.noInitialOrbat) {
      for (const side of m.sides) {
        const sideId = active.unitActions.addSide(
          { name: side.name, standardIdentity: side.standardIdentity, symbolOptions: {} },
          { markAsNew: false },
        );
        const parentId = active.helpers.getSideById(sideId).groups[0];
        for (const unit of side.units) {
          const sidc = new Sidc('10031000000000000000');
          sidc.standardIdentity = side.standardIdentity;
          sidc.emt = unit.rootUnitEchelon || '00';
          sidc.mainIcon = unit.rootUnitIcon || '000000';
          active.unitActions.addUnit(
            {
              id: nanoid(),
              name: unit.rootUnitName ?? 'test',
              sidc: sidc.toString(),
              subUnits: [],
              _pid: 'nn',
              _sid: 'nn',
              _gid: 'nn',
              equipment: [],
              personnel: [],
            },
            parentId,
          );
        }
      }
    }
    active.store.clearUndoRedoStack();
    const scenarioId = await this.repository.addScenario(active.io.serializeToObject());
    await this.router.navigate(['/scenario', scenarioId]);
  }

  private initialModel(): NewScenarioModel {
    const timeZone = this.newScenario.timeZone || 'UTC';
    const start = dayjs.utc(this.newScenario.startTime).tz(resolveTimeZone(timeZone));
    return {
      name: 'New scenario',
      description: '',
      noInitialOrbat: false,
      sides: [
        {
          name: 'Side 1',
          standardIdentity: SID.Friend,
          units: [{ rootUnitName: 'HQ', rootUnitEchelon: '18', rootUnitIcon: '121100' }],
        },
        {
          name: 'Side 2',
          standardIdentity: SID.Hostile,
          units: [{ rootUnitName: 'HQ', rootUnitEchelon: '18', rootUnitIcon: '121100' }],
        },
      ],
      timeZone,
      year: start.year(),
      month: start.month() + 1,
      day: start.date(),
      hour: start.hour(),
      minute: start.minute(),
      symbologyStandard: this.newScenario.symbologyStandard ?? 'app6d',
    };
  }
}
