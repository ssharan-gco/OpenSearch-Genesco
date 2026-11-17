import { OsSearch } from '../lib/types';
import { WeatherAlert } from '../lib/weatherAlerts';

export const WEATHER_ALERTS_INDEX = 'weather-alerts';

/** Read the NWS data already indexed by the separate Go loader. Never call NWS from a browser. */
export const fetchWeatherAlerts = async (search: OsSearch): Promise<WeatherAlert[]> => {
  // The loader replaces active alerts every ten minutes. This is an active-alerts
  // index; unlike historical logs, it must not use the dashboard's time filter.
  const unique = new Map<string, WeatherAlert>();
  let searchAfter: any[] | undefined;
  // Paginate by mapped keyword ID to avoid losing severe alerts if NWS returns
  // more than one OpenSearch page. Don't fetch from the NWS API in the browser.
  for (let page = 0; page < 20; page++) {
    const body: any = {
      size: 1000,
      sort: [{ id: { order: 'asc' } }],
      query: { match_all: {} },
      _source: ['id', 'geometry', 'properties'],
    };
    if (searchAfter) body.search_after = searchAfter;
    const response = await search(WEATHER_ALERTS_INDEX, body);
    const hits = response?.hits?.hits || response?.body?.hits?.hits || [];
    if (!Array.isArray(hits)) break;
    hits.forEach((hit: any) => {
      const source = hit._source || hit;
      if (!source || !source.properties) return;
      const id = String(source.id || hit._id || '');
      if (!id) return;
      // Avoid showing expired shapes when the collector is offline and its
      // last successful snapshot is still present in OpenSearch.
      const now = Date.now();
      const expiry = [source.properties.ends, source.properties.expires]
        .map((value) => (value ? Date.parse(String(value)) : NaN))
        .filter((value) => Number.isFinite(value));
      if (expiry.some((value) => value <= now)) return;
      unique.set(id, { id, geometry: source.geometry || null, properties: source.properties });
    });
    if (hits.length < 1000) break;
    const next = hits[hits.length - 1]?.sort;
    if (!Array.isArray(next) || !next.length) break;
    searchAfter = next;
  }
  return Array.from(unique.values());
};
