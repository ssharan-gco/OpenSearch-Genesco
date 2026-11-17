import {
  getWeatherBounds,
  getWeatherStates,
  pointInWeatherGeometry,
  storesInWeatherAlert,
  toWeatherFeatureCollection,
  WeatherAlert,
} from './weatherAlerts';

const alert: WeatherAlert = {
  id: 'https://api.weather.gov/alerts/example',
  geometry: {
    type: 'Polygon',
    coordinates: [[[-81, 28], [-80, 28], [-80, 29], [-81, 29], [-81, 28]]],
  },
  properties: { event: 'Flood Warning', severity: 'Severe', geocode: { UGC: ['FLZ015'] } },
};

describe('Weather alert geometry and location matching', () => {
  it('calculates bounds and tests mapped store points', () => {
    expect(getWeatherBounds(alert.geometry)).toEqual([[-81, 28], [-80, 29]]);
    expect(pointInWeatherGeometry(-80.5, 28.5, alert.geometry)).toBe(true);
    expect(pointInWeatherGeometry(-79.0, 28.5, alert.geometry)).toBe(false);
    expect(storesInWeatherAlert(alert, [
      { siteId: '1000', name: 'Inside', address: '', city: 'Orlando', state: 'FL', zip: '', lat: 28.5, lon: -80.5 },
      { siteId: '2000', name: 'Outside', address: '', city: 'Miami', state: 'FL', zip: '', lat: 25.7, lon: -80.2 },
    ]).map((s) => s.siteId)).toEqual(['1000']);
  });

  it('groups alerts by state and skips alerts without polygon geometry on the map', () => {
    expect(getWeatherStates(alert)).toEqual(['FL']);
    expect(toWeatherFeatureCollection([alert, { ...alert, id: 'none', geometry: null }]).features).toHaveLength(1);
  });
});
