import { Map as Maplibre, MapOptions } from 'maplibre-gl';
import { CFG } from './constants';

// Chrome blocks WebGL after context-loss when MapLibre 5 asks for "high-performance".
const MAP_CANVAS_CONTEXT_ATTRIBUTES = {
  antialias: false,
  alpha: true,
  depth: true,
  stencil: true,
  premultipliedAlpha: true,
  preserveDrawingBuffer: false,
  failIfMajorPerformanceCaveat: false,
  powerPreference: 'default' as WebGLPowerPreference,
};

/** Raster base map (same tile source + water color as the other map apps). */
export const MAP_STYLE: MapOptions['style'] = {
  version: 8,
  sources: {
    base: {
      type: 'raster',
      tiles: [CFG.tileUrl],
      tileSize: 256,
      attribution: 'Map data &copy; OpenSearch Maps contributors',
    },
  },
  layers: [{ id: 'base-tiles', type: 'raster', source: 'base' }],
};

export function createPluginMap(container: HTMLElement): Maplibre {
  return new Maplibre({
    container,
    center: CFG.mapCenter,
    zoom: CFG.mapZoom,
    style: MAP_STYLE,
    canvasContextAttributes: MAP_CANVAS_CONTEXT_ATTRIBUTES,
    maxTileCacheSize: 80,
  } as MapOptions);
}

export function destroyPluginMap(mapInstance: Maplibre | null) {
  if (!mapInstance) return;
  try {
    mapInstance.remove();
  } catch {
    /* already removed / context lost */
  }
}
