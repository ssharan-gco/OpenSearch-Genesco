import { SiteLocation } from './types';

/** NOAA NWS GeoJSON alerts, as stored unchanged in the weather-alerts index. */
export interface WeatherAlert {
  id: string;
  geometry: any | null;
  properties: {
    event?: string;
    severity?: string;
    headline?: string;
    description?: string;
    instruction?: string;
    areaDesc?: string;
    sent?: string;
    onset?: string;
    expires?: string;
    ends?: string;
    status?: string;
    geocode?: { UGC?: string[]; SAME?: string[] };
    [key: string]: any;
  };
}

type Coordinate = [number, number];

const isCoordinate = (value: any): value is Coordinate =>
  Array.isArray(value) &&
  value.length >= 2 &&
  Number.isFinite(value[0]) &&
  Number.isFinite(value[1]);

const appendCoordinates = (coordinates: any, out: Coordinate[]) => {
  if (isCoordinate(coordinates)) {
    out.push([coordinates[0], coordinates[1]]);
  } else if (Array.isArray(coordinates)) {
    coordinates.forEach((part) => appendCoordinates(part, out));
  }
};

/** GeoJSON supplies [longitude, latitude], not [latitude, longitude]. */
export const getWeatherBounds = (
  geometry: any | null
): [[number, number], [number, number]] | null => {
  if (!geometry) return null;
  const coords: Coordinate[] = [];
  if (geometry.type === 'GeometryCollection') {
    (geometry.geometries || []).forEach((item: any) => appendCoordinates(item.coordinates, coords));
  } else {
    appendCoordinates(geometry.coordinates, coords);
  }
  if (!coords.length) return null;
  let minLon = 180;
  let minLat = 90;
  let maxLon = -180;
  let maxLat = -90;
  coords.forEach(([lon, lat]) => {
    minLon = Math.min(minLon, lon);
    maxLon = Math.max(maxLon, lon);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  });
  return [[minLon, minLat], [maxLon, maxLat]];
};

/** Ray-casting; polygon holes are excluded. */
const pointInRing = (lon: number, lat: number, ring: any[]): boolean => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i];
    const b = ring[j];
    if (!isCoordinate(a) || !isCoordinate(b)) continue;
    if ((a[1] > lat) !== (b[1] > lat) &&
        lon < ((b[0] - a[0]) * (lat - a[1])) / (b[1] - a[1]) + a[0]) {
      inside = !inside;
    }
  }
  return inside;
};

const pointInPolygon = (lon: number, lat: number, rings: any[]): boolean =>
  Array.isArray(rings) &&
  rings.length > 0 &&
  pointInRing(lon, lat, rings[0]) &&
  !rings.slice(1).some((hole) => pointInRing(lon, lat, hole));

export const pointInWeatherGeometry = (lon: number, lat: number, geometry: any): boolean => {
  if (!geometry) return false;
  if (geometry.type === 'Polygon') return pointInPolygon(lon, lat, geometry.coordinates);
  if (geometry.type === 'MultiPolygon') {
    return (geometry.coordinates || []).some((polygon: any) => pointInPolygon(lon, lat, polygon));
  }
  if (geometry.type === 'GeometryCollection') {
    return (geometry.geometries || []).some((part: any) => pointInWeatherGeometry(lon, lat, part));
  }
  return false;
};

/** Only report confirmed polygon intersections. Don't guess affected stores for missing geometry. */
export const storesInWeatherAlert = (alert: WeatherAlert, sites: SiteLocation[]): SiteLocation[] => {
  const bounds = getWeatherBounds(alert.geometry);
  if (!bounds) return [];
  return sites.filter((site) =>
    Number.isFinite(site.lon) && Number.isFinite(site.lat) &&
    site.lon >= bounds[0][0] && site.lon <= bounds[1][0] &&
    site.lat >= bounds[0][1] && site.lat <= bounds[1][1] &&
    pointInWeatherGeometry(site.lon, site.lat, alert.geometry)
  );
};

const US_STATES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN',
  'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV',
  'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN',
  'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC', 'PR', 'VI', 'GU', 'AS', 'MP',
]);

export const getWeatherStates = (alert: WeatherAlert): string[] => {
  const zones = alert.properties.geocode?.UGC || [];
  const states = Array.from(new Set(zones.map((zone) => zone.slice(0, 2).toUpperCase())))
    .filter((state) => US_STATES.has(state));
  return states.length ? states.sort() : ['Other'];
};

export const getWeatherTitle = (alert: WeatherAlert) =>
  alert.properties.event || alert.properties.headline || 'Weather alert';

/** NWS GeoJSON features, suitable for MapLibre GeoJSON sources. */
export const toWeatherFeatureCollection = (alerts: WeatherAlert[]) => ({
  type: 'FeatureCollection',
  features: alerts
    .filter((a) => a.geometry && ['Polygon', 'MultiPolygon'].includes(a.geometry.type))
    .map((a) => ({
      type: 'Feature',
      id: a.id,
      geometry: a.geometry,
      properties: { id: a.id, event: a.properties.event || '', severity: a.properties.severity || '' },
    })),
});
