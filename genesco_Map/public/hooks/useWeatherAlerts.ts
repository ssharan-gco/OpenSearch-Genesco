import { useCallback, useEffect, useState } from 'react';
import { OsSearch } from '../lib/types';
import { WeatherAlert } from '../lib/weatherAlerts';
import { fetchWeatherAlerts } from '../services/weatherAlerts';

/** The Go collector refreshes OpenSearch every 10 min; this just re-reads that index. */
export const useWeatherAlerts = (search: OsSearch) => {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastReadAt, setLastReadAt] = useState<number | null>(null);
  const load = useCallback(async () => {
    try {
      const data = await fetchWeatherAlerts(search);
      setAlerts(data);
      setError(null);
      setLastReadAt(Date.now());
    } catch (cause: any) {
      // Keep last successful alerts when connection temporarily fails.
      setError(cause?.message || 'Unable to read the weather-alerts index');
    } finally {
      setLoading(false);
    }
  }, [search]);
  useEffect(() => {
    load();
    const id = window.setInterval(load, 120_000);
    return () => window.clearInterval(id);
  }, [load]);
  return { alerts, loading, error, lastReadAt, refresh: load };
};
