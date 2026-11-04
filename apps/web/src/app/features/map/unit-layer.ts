import type { AddLayerObject, GeoJSONSource, Map as MlMap } from 'maplibre-gl';
import type { Feature, FeatureCollection, Position } from 'geojson';
import type { SymbolOptions } from 'milsymbol';
import { symbolGenerator } from '@/symbology/milsymbwrapper';
import { hashObject, wordWrap } from '@/utils';
import { UNIT_LAYER_ID } from '@/geo/engines/maplibre/unitLayer';
import { registerMissingStyleImageResolver } from '@/modules/maplibreview/missingStyleImageResolver';

/** What the map needs of a unit: read from `scenario.geo.everyVisibleUnit` at the current time. */
export interface MapUnit {
  id: string;
  name: string;
  shortName?: string;
  sidc: string;
  location: Position;
  symbolRotation: number;
  symbolOptions: SymbolOptions;
  textAmplifiers: Record<string, unknown>;
}

export interface UnitLabelSettings {
  below: boolean;
  size: number;
  wrap: boolean;
  wrapWidth: number;
}

interface SymbolEntry {
  sidc: string;
  symbolOptions: SymbolOptions;
  textAmplifiers: Record<string, unknown>;
  uniqueDesignation: string;
}

export const UNIT_SOURCE_ID = 'unitSource';
const UNIT_LABEL_MAX_WIDTH = 1000;
const UNIT_LABEL_GAP = 2;

/**
 * Draws units as a MapLibre symbol layer, the way src/modules/maplibreview/MlMapLogic.vue does:
 * one milsymbol image per distinct symbol (selected units get a yellow outline), the icon offset
 * from the symbol anchor, and the label below the symbol when enabled.
 *
 * TODO(migration): zoom visibility groups, moving-unit source, custom symbols, range rings, unit
 * history, drag to move and hover tooltips of MlMapLogic.vue are not ported yet (KNOWN_GAPS G-004).
 */
export class UnitLayer {
  private readonly symbols = new Map<string, SymbolEntry>();
  private readonly metrics = new Map<string, { iconOffset: [number, number]; bottom: number }>();
  private readonly unregisterResolver: () => void;

  constructor(
    private readonly map: MlMap,
    private readonly pixelRatio = globalThis.devicePixelRatio || 1,
  ) {
    // The resolver registry of the Vue app, shared with the scenario layer controller.
    this.unregisterResolver = registerMissingStyleImageResolver(this.map, (id) =>
      this.addImage(id),
    );
  }

  /** Adds the source and layer if the current style lacks them (after each style load). */
  setup(labels: UnitLabelSettings): void {
    if (!this.map.getSource(UNIT_SOURCE_ID)) {
      this.map.addSource(UNIT_SOURCE_ID, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
    }
    if (!this.map.getLayer(UNIT_LAYER_ID)) this.map.addLayer(this.layerSpec(labels));
  }

  update(
    units: readonly MapUnit[],
    selected: ReadonlySet<string>,
    labels: UnitLabelSettings,
  ): void {
    const source = this.map.getSource(UNIT_SOURCE_ID) as GeoJSONSource | undefined;
    if (!source) return;
    if (this.map.getLayer(UNIT_LAYER_ID)) {
      this.map.setLayoutProperty(UNIT_LAYER_ID, 'text-size', labels.size);
    }
    const features: Feature[] = units.map((unit) => this.feature(unit, selected, labels));
    const data: FeatureCollection = { type: 'FeatureCollection', features };
    source.setData(data);
  }

  /** The id of the unit drawn at a screen point, if any. */
  unitAt(point: [number, number]): string | undefined {
    if (!this.map.getLayer(UNIT_LAYER_ID)) return undefined;
    const [hit] = this.map.queryRenderedFeatures(point, { layers: [UNIT_LAYER_ID] });
    return hit?.properties?.['id'] as string | undefined;
  }

  destroy(): void {
    this.unregisterResolver();
  }

  private feature(
    unit: MapUnit,
    selected: ReadonlySet<string>,
    labels: UnitLabelSettings,
  ): Feature {
    const { uniqueDesignation, ...textAmplifiers } = unit.textAmplifiers as {
      uniqueDesignation?: string;
    } & Record<string, unknown>;
    const hasOwnDesignation = Object.prototype.hasOwnProperty.call(
      unit.textAmplifiers,
      'uniqueDesignation',
    );
    const resolved = uniqueDesignation ?? unit.shortName ?? unit.name ?? '';
    const entry: SymbolEntry = {
      sidc: unit.sidc,
      symbolOptions: unit.symbolOptions,
      textAmplifiers,
      uniqueDesignation: labels.below && !hasOwnDesignation ? '' : resolved,
    };
    const symbolKey = hashObject(entry);
    if (!this.symbols.has(symbolKey)) this.symbols.set(symbolKey, entry);
    const imageId = selected.has(unit.id) ? `sel-${symbolKey}` : symbolKey;
    // As in MlMapLogic.vue: the icon offset is measured on the drawn image (selection outline
    // included), the label offset without it, so the label does not move on selection.
    const { bottom } = this.symbolMetrics(symbolKey);
    return {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: unit.location },
      properties: {
        id: unit.id,
        symbolKey: imageId,
        iconOffset: this.symbolMetrics(imageId).iconOffset,
        sidc: unit.sidc,
        label: this.label(unit, labels),
        textOffset: [0, (bottom + UNIT_LABEL_GAP) / labels.size],
        symbolRotation: unit.symbolRotation,
      },
    };
  }

  private label(unit: MapUnit, labels: UnitLabelSettings): string {
    if (!labels.below) return '';
    const label = unit.shortName || unit.name || 'Unnamed Unit';
    return labels.wrap && labels.wrapWidth > 0
      ? wordWrap(label, { width: labels.wrapWidth })
      : label;
  }

  private args(imageId: string) {
    const isSelected = imageId.startsWith('sel-');
    const entry = this.symbols.get(isSelected ? imageId.slice(4) : imageId);
    const outline = isSelected
      ? { outlineWidth: 20, outlineColor: 'yellow' }
      : { outlineWidth: 7, outlineColor: 'white' };
    return {
      sidc: entry?.sidc ?? 'xxxxxxx',
      options: {
        uniqueDesignation: entry?.uniqueDesignation ?? '',
        ...outline,
        ...(entry?.textAmplifiers ?? {}),
        ...(entry?.symbolOptions ?? {}),
      } as SymbolOptions,
    };
  }

  private symbolMetrics(imageId: string) {
    let metrics = this.metrics.get(imageId);
    if (!metrics) {
      const { sidc, options } = this.args(imageId);
      const symbol = symbolGenerator(sidc, options);
      const { width, height } = symbol.getSize();
      const anchor = symbol.getAnchor();
      metrics = {
        iconOffset: [width / 2 - anchor.x, height / 2 - anchor.y],
        bottom: height - anchor.y,
      };
      this.metrics.set(imageId, metrics);
    }
    return metrics;
  }

  private addImage(imageId: string): void {
    const key = imageId.startsWith('sel-') ? imageId.slice(4) : imageId;
    if (!this.symbols.has(key) || this.map.hasImage(imageId)) return;
    const { sidc, options } = this.args(imageId);
    const canvas = symbolGenerator(sidc, options).asCanvas(this.pixelRatio);
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    this.map.addImage(imageId, ctx.getImageData(0, 0, canvas.width, canvas.height), {
      pixelRatio: this.pixelRatio,
    });
  }

  private layerSpec(labels: UnitLabelSettings): AddLayerObject {
    return {
      id: UNIT_LAYER_ID,
      type: 'symbol',
      source: UNIT_SOURCE_ID,
      layout: {
        'icon-image': ['get', 'symbolKey'],
        'icon-offset': ['get', 'iconOffset'],
        'icon-rotate': ['get', 'symbolRotation'],
        'icon-rotation-alignment': 'viewport',
        'text-rotate': ['get', 'symbolRotation'],
        'text-rotation-alignment': 'viewport',
        'text-font': ['Noto Sans Italic'],
        'text-offset': ['get', 'textOffset'],
        'text-anchor': 'top',
        'text-size': labels.size,
        'text-max-width': UNIT_LABEL_MAX_WIDTH,
        'icon-allow-overlap': true,
        'text-allow-overlap': false,
        'text-overlap': 'never',
        'text-ignore-placement': false,
        'text-optional': true,
        'icon-optional': false,
        'text-field': ['get', 'label'],
      },
      paint: {
        'text-color': '#111827',
        'text-halo-color': 'rgba(255, 255, 255, 0.9)',
        'text-halo-width': 1.75,
        'text-halo-blur': 0.6,
      },
    };
  }
}
