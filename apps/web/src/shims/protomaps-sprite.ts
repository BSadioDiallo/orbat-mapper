/**
 * Replaces `@/geo/protomapsSprite` for the Angular build. The module is the upstream one except
 * where the sprite files come from: Vite's `import.meta.glob` there; here the files of
 * src/assets/protomaps/sprites/, copied by angular.json to /protomaps/sprites/.
 */
import { addProtocol, removeProtocol } from 'maplibre-gl';
import type { BasemapFlavor } from '@/geo/maplibreLayerConfigTypes';

export const PROTOMAPS_SPRITE_PROTOCOL = 'pmsprite';

const SPRITE_URL_PREFIX = `${PROTOMAPS_SPRITE_PROTOCOL}://protomaps/`;
const SPRITE_ASSET_BASE = '/protomaps/sprites/';

export function protomapsSpriteUrl(flavor: BasemapFlavor): string {
  return `${SPRITE_URL_PREFIX}${flavor}`;
}

let registered = false;

/** Registers the `pmsprite://` protocol with MapLibre. Idempotent. */
export function registerProtomapsSpriteProtocol(): void {
  if (registered) return;
  addProtocol(PROTOMAPS_SPRITE_PROTOCOL, async (params) => {
    const fileName = decodeURIComponent(params.url.slice(SPRITE_URL_PREFIX.length));
    if (!/^[\w@.-]+\.(json|png)$/.test(fileName)) {
      throw new Error(`Unknown Protomaps sprite asset "${fileName}"`);
    }
    const response = await fetch(SPRITE_ASSET_BASE + fileName);
    if (!response.ok) throw new Error(`Unknown Protomaps sprite asset "${fileName}"`);
    const buffer = await response.arrayBuffer();
    if (fileName.endsWith('.json')) {
      return { data: JSON.parse(new TextDecoder().decode(buffer)) };
    }
    return { data: buffer };
  });
  registered = true;
}

/** Test helper. */
export function resetProtomapsSpriteProtocol(): void {
  if (!registered) return;
  removeProtocol(PROTOMAPS_SPRITE_PROTOCOL);
  registered = false;
}
