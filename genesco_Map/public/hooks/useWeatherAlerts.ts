import { useCallback, useEffect, useRef, useState } from 'react';
import { OsSearch } from '../lib/types';
import { WeatherAlert } from '../lib/weatherAlerts';
import { fetchWeatherAlerts } from '../services/weatherAlerts';
import { DASHBOARD_AUTO_REFRESH_MS } from '../lib/autoRefresh';

/** The Go collector refreshes OpenSearch every 10 min; this just re-reads that index. */
export const useWeatherAlerts = (search: OsSearch) => {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastReadAt, setLastReadAt] = useState<number | null>(null);
  const inFlightRef = useRef(false);
  const load = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      const data = await fetchWeatherAlerts(search);
      setAlerts(data);
      setError(null);
      setLastReadAt(Date.now());
    } catch (cause: any) {
      // Keep last successful alerts when connection temporarily fails.
      setError(cause?.message || 'Unable to read the weather-alerts index');
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, [search]);
  useEffect(() => {
    void load();
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, DASHBOARD_AUTO_REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void load();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [load]);
  return { alerts, loading, error, lastReadAt, refresh: load };
};
