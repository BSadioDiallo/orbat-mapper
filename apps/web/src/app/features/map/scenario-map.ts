import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Map as MlMap, ScaleControl, setWorkerUrl } from 'maplibre-gl';
import { centerOfMass, featureCollection, point } from '@turf/turf';
import { MapLibreMapAdapter } from '@/geo/mapLibreMapAdapter';
import { createMapLibreScenarioLayerController } from '@/geo/engines/maplibre/mapLibreScenarioLayerController';
import { useMaplibreLayersStore } from '@/stores/maplibreLayersStore';
import { useMapSettingsStore } from '@/stores/mapSettingsStore';
import { useSymbolSettingsStore } from '@/stores/settingsStore';
import { unitSymbolSize } from '@/symbology/echelonSize';
import { resolveMaplibreBasemap } from '@/modules/maplibreview/maplibreBasemaps';
import { ScenarioService } from '../../core/scenario/scenario.service';
import { SelectionService } from '../../core/ui/selection.service';
import { reactiveSignal } from '../../core/scenario/reactive-signal';
import { type MapUnit, UnitLayer, type UnitLabelSettings } from './unit-layer';

setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');

/**
 * The scenario map (src/modules/maplibreview/MaplibreMap.vue + the unit part of MlMapLogic.vue).
 *
 * MapLibre is created after the first render (zoneless: its events do not trigger change
 * detection; only the signals it sets do). It is driven by signals: the visible units at the current time and the selection. Scenario features
 * and map layers are drawn by the upstream layer controller, reused unchanged.
 */
@Component({
  selector: 'app-scenario-map',
  template: `
    <div #container class="h-full w-full" data-testid="scenario-map"></div>
    @if (!ready()) {
      <p class="text-muted-foreground absolute inset-0 grid place-items-center text-sm">
        Loading map…
      </p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'absolute inset-0 block' },
})
export class ScenarioMap {
  private readonly container = viewChild.required<ElementRef<HTMLElement>>('container');
  private readonly scenarioService = inject(ScenarioService);
  private readonly selection = inject(SelectionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly mapSettings = useMapSettingsStore();
  private readonly layersStore = useMaplibreLayersStore();
  private readonly symbolSettingsStore = useSymbolSettingsStore();

  protected readonly ready = signal(false);
  private map?: MlMap;
  private unitLayer?: UnitLayer;

  private readonly units = this.scenarioService.select((scenario): MapUnit[] =>
    scenario.geo.everyVisibleUnit.value
      .filter((unit) => unit._state?.location)
      .map((unit) => {
        const { size: _size, ...combined } = scenario.unitActions.getCombinedSymbolOptions(unit);
        const sidc = unit._state?.sidc ?? unit.sidc;
        // As buildUnitFeature in MlMapLogic.vue: global symbol settings, then the map size of
        // the unit (echelon sizing, ADR-0009), then the unit's own options.
        const symbolOptions = {
          ...this.symbolSettingsStore.symbolOptions,
          size: unitSymbolSize(unit.style?.mapSymbolSize, sidc, this.mapSettings),
          ...combined,
        };
        return {
          id: unit.id,
          name: unit.name,
          shortName: unit.shortName,
          sidc,
          location: [...unit._state!.location!],
          symbolRotation: unit._state?.symbolRotation ?? 0,
          symbolOptions,
          textAmplifiers: { ...(unit.textAmplifiers ?? {}) },
        };
      }),
  );

  private readonly labels = reactiveSignal((): UnitLabelSettings => ({
    below: !!this.mapSettings.mapUnitLabelBelow,
    size: Number(this.mapSettings.mapLabelSize) > 0 ? Number(this.mapSettings.mapLabelSize) : 12,
    wrap: !!this.mapSettings.mapWrapUnitLabels,
    wrapWidth: Number(this.mapSettings.mapWrapLabelWidth) || 0,
  }));

  constructor() {
    afterNextRender(() => {
      void this.createMap();
    });
    effect(() => {
      const units = this.units();
      const selected = this.selection.selectedUnitIds();
      const labels = this.labels();
      if (!this.ready()) return;
      this.unitLayer?.update(units, selected, labels);
    });
    this.destroyRef.onDestroy(() => {
      this.unitLayer?.destroy();
      this.map?.remove();
    });
  }

  private async createMap(): Promise<void> {
    await this.layersStore.initialize();
    if (this.destroyRef.destroyed) return;
    const basemap = resolveMaplibreBasemap(
      this.mapSettings.maplibreBaseLayerName,
      this.layersStore.layers,
    );
    {
      const map = new MlMap({
        container: this.container().nativeElement,
        style: basemap.style,
        center: [0, 0],
        zoom: 3,
        canvasContextAttributes: { preserveDrawingBuffer: true },
      });
      this.map = map;
      map.addControl(new ScaleControl({ maxWidth: 100 }));
      const unitLayer = new UnitLayer(map);
      this.unitLayer = unitLayer;
      const onStyleLoad = () => {
        unitLayer.setup(this.labels());
        unitLayer.update(this.units(), this.selection.selectedUnitIds(), this.labels());
      };
      map.on('style.load', onStyleLoad);
      // As MaplibreMap.vue: the scenario is bound to the map on its `load` event ("ready").
      map.once('load', () => {
        onStyleLoad();
        const adapter = new MapLibreMapAdapter(map);
        const layers = createMapLibreScenarioLayerController(adapter, {});
        const unbind = layers.bindScenario(this.scenarioService.scenario);
        this.destroyRef.onDestroy(() => unbind());
        this.fitToScenario(map);
        this.ready.set(true);
      });
      map.on('click', (event) => {
        const unitId = unitLayer.unitAt([event.point.x, event.point.y]);
        if (unitId) {
          this.selection.selectUnit(unitId, { add: event.originalEvent.shiftKey });
        } else {
          this.selection.clear();
        }
      });
    }
  }

  /** As MlMapLogic.vue on first load: the scenario bounding box, or the centre of the units. */
  private fitToScenario(map: MlMap): void {
    const bbox = this.scenarioService.scenario.store.state.boundingBox;
    if (bbox && bbox.length === 4) {
      map.fitBounds(bbox as [number, number, number, number], {
        padding: 20,
        duration: 0,
        maxZoom: 16,
      });
      return;
    }
    const units = this.units();
    if (!units.length) return;
    const center = centerOfMass(featureCollection(units.map((u) => point(u.location))));
    map.setCenter(center.geometry.coordinates as [number, number]);
  }
}
