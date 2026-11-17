import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { I18nProvider } from '@osd/i18n/react';
import moment from 'moment-timezone';
import tzLookup from 'tz-lookup';
import { BrowserRouter as Router } from 'react-router-dom';
import { PLUGIN_ID } from '../../common';
import { GenscoAppDeps, SiteRecord, StatusFilter } from '../lib/types';
import { normalizeUsState, UsStateName } from '../lib/us_states';
import { getUsStateRegion, UsRegionName } from '../lib/us_regions';
import { BrandCode, BRANDS, getBrandCode } from '../lib/brands';
import { resolveTimeWindow } from '../lib/timeRange';
import { getStoreMapKey } from '../lib/storeMapKey';
import { createOsSearch } from '../services/searchClient';
import { createRegisterNotesClient } from '../services/registerNotes';
import { useWeatherAlerts } from '../hooks/useWeatherAlerts';
import { WeatherAlertsPanel } from './WeatherAlertsPanel';
import { fetchSiteRecords, getSiteFilterCounts } from '../services/siteService';
import { useGenscoMap } from '../hooks/useGenscoMap';
import { SearchBar } from './SearchBar';
import { FilterPanel } from './FilterPanel';
import { BrandFilterPanel } from './BrandFilterPanel';
import { StateFilterDropdown } from './state_filter_dropdown';
import { RegionFilterDropdown } from './region_filter_dropdown';
import { DetailPanel } from './detail/DetailPanel';

const detectSystemTimeZone = () => {
  const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return systemTimeZone && moment.tz.zone(systemTimeZone) ? systemTimeZone : moment.tz.guess(true);
};
/* ================================================================
   MAIN APPLICATION
   ================================================================ */
export const GenscoApp = ({ basename, notifications, http, navigation }: GenscoAppDeps) => {
  const osSearch = useRef(createOsSearch(http)).current;
  const registerNotesClient = useRef(createRegisterNotesClient(http)).current;
  const onRegisterMetricsError = useCallback(
    (error: Error) =>
      notifications.toasts.addError(error, { title: 'Failed to load live register metrics' }),
    [notifications]
  );

  const [loading, setLoading] = useState(false);
  const [allSites, setAllSites] = useState<SiteRecord[]>([]);
  const [sampleSites, setSampleSites] = useState(false);
  const [sampleMetrics, setSampleMetrics] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [brandFilters, setBrandFilters] = useState<Set<BrandCode>>(() => new Set());
  const [stateFilter, setStateFilter] = useState<UsStateName | null>(null);
  const [regionFilter, setRegionFilter] = useState<UsRegionName | null>(null);
  const [search, setSearch] = useState('');
  const { alerts: weatherAlerts, loading: weatherLoading, error: weatherError, refresh: refreshWeather } = useWeatherAlerts(osSearch);
  const [showWeatherAlerts, setShowWeatherAlerts] = useState(false);
  const [focusedWeatherAlertId, setFocusedWeatherAlertId] = useState<string | null>(null);
  const [weatherFocusRevision, setWeatherFocusRevision] = useState(0);
  const [timeStart, setTimeStart] = useState('now-5m');
  const [timeEnd, setTimeEnd] = useState('now');
  const [timeZone, setTimeZone] = useState(detectSystemTimeZone);
  const [detailRefreshTrigger, setDetailRefreshTrigger] = useState(0);

  useEffect(() => {
    let usingLocationTimeZone = false;
    let locationErrorNotified = false;

    const refreshTimeZone = () => {
      if (usingLocationTimeZone) return;
      const detectedTimeZone = detectSystemTimeZone();
      setTimeZone((currentTimeZone) =>
        currentTimeZone === detectedTimeZone ? currentTimeZone : detectedTimeZone
      );
    };
    const useSystemTimeZone = () => {
      usingLocationTimeZone = false;
      refreshTimeZone();
      if (!locationErrorNotified) {
        notifications.toasts.addWarning({
          title: 'Location unavailable',
          text: 'Check browser location permission, then reload to try again. Using the system time zone instead.',
        });
        locationErrorNotified = true;
      }
    };
    const refreshTimeZoneWhenVisible = () => {
      if (document.visibilityState === 'visible') refreshTimeZone();
    };
    const interval = window.setInterval(refreshTimeZone, 60_000);

    window.addEventListener('focus', refreshTimeZone);
    document.addEventListener('visibilitychange', refreshTimeZoneWhenVisible);
    refreshTimeZone();
    const geolocation = navigator.geolocation;
    if (!geolocation) {
      useSystemTimeZone();
    }
    const watchId = geolocation?.watchPosition(
      ({ coords }) => {
        try {
          const detectedTimeZone = tzLookup(coords.latitude, coords.longitude);
          usingLocationTimeZone = true;
          locationErrorNotified = false;
          setTimeZone(detectedTimeZone);
        } catch (error) {
          useSystemTimeZone();
          notifications.toasts.addError(error, {
            title: 'Unable to determine time zone from location',
          });
        }
      },
      useSystemTimeZone,
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 15_000 }
    );

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshTimeZone);
      document.removeEventListener('visibilitychange', refreshTimeZoneWhenVisible);
      if (watchId !== undefined) geolocation?.clearWatch(watchId);
    };
  }, [notifications]);

  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const selectedTimeWindow = useMemo(
    () => resolveTimeWindow(timeStart, timeEnd),
    [timeStart, timeEnd, detailRefreshTrigger]
  );
  const brandCounts = useMemo(() => {
    const counts = new Map<BrandCode, number>(BRANDS.map(({ code }) => [code, 0]));
    allSites.forEach((site) => {
      const code = getBrandCode(site);
      if (code) counts.set(code, (counts.get(code) || 0) + 1);
    });
    return counts;
  }, [allSites]);
  const { counts: statusCounts, totalSites: statusCountSites } = useMemo(
    () => getSiteFilterCounts(allSites, brandFilters, search, stateFilter, regionFilter),
    [allSites, brandFilters, search, stateFilter, regionFilter]
  );

  // Fill exactly the viewport space below the (variable-height) OSD header.
  const rootRef = useRef<HTMLDivElement>(null);
  const [rootHeight, setRootHeight] = useState('calc(100vh - 48px)');
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () =>
      setRootHeight(`${Math.max(0, window.innerHeight - el.getBoundingClientRect().top)}px`);
    measure();
    window.addEventListener('resize', measure);
    const ro = el.parentElement ? new ResizeObserver(measure) : null;
    if (ro && el.parentElement) ro.observe(el.parentElement);
    return () => {
      window.removeEventListener('resize', measure);
      ro?.disconnect();
    };
  }, []);

  const filteredSites = useMemo(() => {
    const term = search.trim().toLowerCase();
    return allSites.filter((site) => {
      const brandCode = getBrandCode(site);
      return (
        (statusFilter === 'All' || site.filterStatuses.includes(statusFilter)) &&
        (brandFilters.size === 0 || (brandCode !== null && brandFilters.has(brandCode))) &&
        (stateFilter === null || normalizeUsState(site.state) === stateFilter) &&
        (regionFilter === null || getUsStateRegion(site.state) === regionFilter) &&
        (term === '' ||
          site.siteId.toLowerCase().includes(term) ||
          site.city.toLowerCase().includes(term))
      );
    });
  }, [allSites, statusFilter, brandFilters, stateFilter, regionFilter, search]);

  const { mapContainerRef, mapMoved, resetMapView } = useGenscoMap({
    allSites,
    filteredSites,
    statusFilter,
    search,
    weatherAlerts,
    showWeatherAlerts,
    focusedWeatherAlertId,
    weatherFocusRevision,
    onSelectSite: setSelectedSiteId,
  });

  /* ── MAP DATA ── */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const {
          records,
          sampleSites: sample,
          sampleMetrics: sm,
        } = await fetchSiteRecords(osSearch);
        if (cancelled) return;
        setAllSites(records);
        setSampleSites(sample);
        setSampleMetrics(sm);
      } catch (e: any) {
        notifications.toasts.addError(e, { title: 'Failed to load Gensco map data' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [osSearch, notifications]);

  const selectedSite = allSites.find((s) => getStoreMapKey(s) === selectedSiteId) || null;
  const usingSample = sampleSites || sampleMetrics;

  return (
    <Router basename={basename}>
      <I18nProvider>
        <div
          ref={rootRef}
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: rootHeight,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <navigation.ui.TopNavMenu
            appName={PLUGIN_ID}
            showSearchBar={false}
            useDefaultBehaviors={true}
          />

          <div className="sample-map-container dark" style={{ flex: 1, position: 'relative' }}>
            <div id="map" ref={mapContainerRef} />

            {usingSample && !loading && (
              <div
                className="float"
                id="sample-banner"
                title="Seed the indices / VictoriaMetrics to see live data"
              >
                Genesco Stores - Map View
              </div>
            )}

            {mapMoved && (
              <button
                className="float"
                id="reset-view-btn"
                onClick={resetMapView}
                title="Return to initial map position"
              >
                ⌖ Reset View
              </button>
            )}

            <div className="float" id="bottom-search-stack">
              <SearchBar value={search} onChange={setSearch} />
              <div className="filter-location-row">
                <StateFilterDropdown
                  selectedState={stateFilter}
                  selectedRegion={regionFilter}
                  sites={allSites}
                  onChange={setStateFilter}
                />
                <RegionFilterDropdown
                  selectedRegion={regionFilter}
                  sites={allSites}
                  onChange={(region) => {
                    setRegionFilter(region);
                    if (region && stateFilter && getUsStateRegion(stateFilter) !== region) {
                      setStateFilter(null);
                    }
                  }}
                />
              </div>
            </div>

              <WeatherAlertsPanel
                alerts={weatherAlerts}
                loading={weatherLoading}
                error={weatherError}
                visible={showWeatherAlerts}
                onVisibleChange={setShowWeatherAlerts}
                onRefresh={refreshWeather}
                onFocus={(alert) => {
                  setFocusedWeatherAlertId(alert.id);
                  setWeatherFocusRevision((current) => current + 1);
                }}
              />

            <div className="float" id="top-right-stack">
              <BrandFilterPanel
                selectedBrands={brandFilters}
                counts={brandCounts}
                onChange={setBrandFilters}
              />
              <FilterPanel
                statusFilter={statusFilter}
                counts={statusCounts}
                totalSites={statusCountSites}
                sites={allSites}
                onChange={setStatusFilter}
              />
            </div>

            {loading && (
              <div className="float" id="loading">
                <div className="spinner"></div>
                Loading Gensco sites…
              </div>
            )}

            {selectedSite && (
              <DetailPanel
                site={selectedSite}
                timeWindow={selectedTimeWindow}
                onTimeChange={(start, end) => {
                  setTimeStart(start);
                  setTimeEnd(end);
                }}
                osSearch={osSearch}
                registerNotesClient={registerNotesClient}
                timeZone={timeZone}
                refreshToken={detailRefreshTrigger}
                onRefresh={() => setDetailRefreshTrigger((current) => current + 1)}
                onMetricsError={onRegisterMetricsError}
                onClose={() => setSelectedSiteId(null)}
              />
            )}
          </div>
        </div>
      </I18nProvider>
    </Router>
  );
};
