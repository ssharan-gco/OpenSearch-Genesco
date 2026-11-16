import { SiteLocation } from './types';

const RELOCATED_STATES: {
  [state: string]: {
    sourceCenter: [number, number];
    mapCenter: [number, number];
    scale: number;
  };
} = {
  AK: {
    sourceCenter: [-152, 64],
    mapCenter: [-124.2, 47],
    scale: 0.1,
  },
  HI: {
    sourceCenter: [-157, 20.8],
    mapCenter: [-123.5, 33.5],
    scale: 0.5,
  },
};

/** Returns map-only coordinates, bringing Alaska and Hawaii stores near the West Coast. */
export const getMapCoordinates = (
  site: Pick<SiteLocation, 'lat' | 'lon' | 'state'>
): [number, number] => {
  const relocation = RELOCATED_STATES[site.state.trim().toUpperCase()];
  if (!relocation) return [site.lon, site.lat];

  const [sourceLon, sourceLat] = relocation.sourceCenter;
  const [mapLon, mapLat] = relocation.mapCenter;
  return [
    mapLon + (site.lon - sourceLon) * relocation.scale,
    mapLat + (site.lat - sourceLat) * relocation.scale,
  ];
};
