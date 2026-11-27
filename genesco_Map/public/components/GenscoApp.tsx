import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { I18nProvider } from '@osd/i18n/react';
import moment from 'moment-timezone';
import tzLookup from 'tz-lookup';
import { BrowserRouter as Router, useHistory, useLocation } from 'react-router-dom';
import { PLUGIN_ID } from '../../common';
import { GenscoAppDeps, SiteRecord, StatusFilter } from '../lib/types';
import { normalizeUsState, UsStateName } from '../lib/us_states';
import { getUsStateRegion, UsRegionName } from '../lib/us_regions';
import { BrandCode, BRANDS, getBrandCode } from '../lib/brands';
import { resolveTimeWindow } from '../lib/timeRange';
import { getStoreMapKey } from '../lib/storeMapKey';
import { createOsSearch } from '../services/searchClient';
import { createRegisterNotesClient } from '../services/registerNotes';
import { createCustomStoreClient } from '../services/customStores';
import { CustomStoreManager } from './CustomStoreManager';
import { useWeatherAlerts } from '../hooks/useWeatherAlerts';
import { DASHBOARD_AUTO_REFRESH_MS } from '../lib/autoRefresh';
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
const GenscoAppContent = ({ notifications, http, navigation }: GenscoAppDeps) => {
  const history = useHistory();
  const location = useLocation();
  // Dedicated IT management page. The map and its polling are suspended here.
  const managingStores = location.pathname.replace(/\/$/, '') === '/stores';
  const osSearch = useRef(createOsSearch(http)).current;
  const registerNotesClient = useRef(createRegisterNotesClient(http)).current;
  const customStoreClient = useRef(createCustomStoreClient(http)).current;
  const [customStoreRevision, setCustomStoreRevision] = useState(0);
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
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const hasLoadedMapOnceRef = useRef(false);
  const {
    alerts: weatherAlerts,
    loading: weatherLoading,
    error: weatherError,
    refresh: refreshWeather,
  } = useWeatherAlerts(osSearch, selectedSiteId === null && !managingStores);
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
    enabled: !managingStores,
  });

  /* ── MAP DATA: automatic polling only while the map view is active.
     Custom-store mutations trigger a one-off background reload without
     re-mounting the store management dialog. */
  useEffect(() => {
    if (selectedSiteId !== null || managingStores) return;
    let cancelled = false;
    let inFlight = false;
    let firstLoad = true;
    let errorReported = false;
    const load = async () => {
      // Do not overlap slow VictoriaMetrics requests or reset UI during polling.
      if (cancelled || inFlight) return;
      inFlight = true;
      if (firstLoad && !hasLoadedMapOnceRef.current) setLoading(true);
      try {
        const { records, sampleSites: sample, sampleMetrics: sm } = await fetchSiteRecords(osSearch, customStoreClient);
        if (cancelled) return;
        setAllSites(records);
        setSampleSites(sample);
        setSampleMetrics(sm);
        errorReported = false;
      } catch (cause: any) {
        if (!cancelled && !errorReported) {
          notifications.toasts.addError(cause, { title: 'Failed to load Gensco map data' });
          errorReported = true;
        }
      } finally {
        inFlight = false;
        firstLoad = false;
        if (!cancelled) {
          hasLoadedMapOnceRef.current = true;
          setLoading(false);
        }
      }
    };
    void load();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, DASHBOARD_AUTO_REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void load();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [osSearch, notifications, customStoreClient, customStoreRevision, selectedSiteId, managingStores]);

  // Store-detail metrics and incident editors refresh ONLY on the user's manual
  // Refresh action or when the selected range changes. Do not interrupt typing.

  const selectedSite = allSites.find((s) => getStoreMapKey(s) === selectedSiteId) || null;
  const usingSample = sampleSites || sampleMetrics;

  return (
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

          {managingStores ? (
            <CustomStoreManager
              client={customStoreClient}
              onChanged={() => setCustomStoreRevision((revision) => revision + 1)}
              onBack={() => history.push('/')}
            />
          ) : (
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

            <div className="float" id="bottom-search-stack">
              <div id="search-control-stack">
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
                <SearchBar value={search} onChange={setSearch} />
              </div>
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

            {/* Store management is a dedicated IT route, not a map popup. */}
            <div className="genesco-it-bottom-left-stack">
              {!selectedSiteId && (
                <button className="genesco-custom-launch" type="button" onClick={() => history.push('/stores')}>
                  <span aria-hidden="true">＋</span> Manage Stores
                </button>
              )}
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
            </div>

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
          )}
        </div>
      </I18nProvider>
  );
};

export const GenscoApp = (props: GenscoAppDeps) => (
  <Router basename={props.basename}>
    <GenscoAppContent {...props} />
  </Router>
);
