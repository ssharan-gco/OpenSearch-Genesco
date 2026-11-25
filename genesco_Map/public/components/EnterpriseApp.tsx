import { useEffect, useMemo, useRef, useState } from 'react';
import { I18nProvider } from '@osd/i18n/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ENTERPRISE_APP_ID } from '../../common';
import { BRANDS, BrandCode, getBrandCode } from '../lib/brands';
import { GenscoAppDeps, SiteRecord, StatusFilter } from '../lib/types';
import { normalizeUsState, UsStateName } from '../lib/us_states';
import { getUsStateRegion, UsRegionName } from '../lib/us_regions';
import { createOsSearch } from '../services/searchClient';
import { createRegisterNotesClient } from '../services/registerNotes';
import { useWeatherAlerts } from '../hooks/useWeatherAlerts';
import { DASHBOARD_AUTO_REFRESH_MS } from '../lib/autoRefresh';
import { WeatherAlertsPanel } from './WeatherAlertsPanel';
import {
  deriveEnterpriseFilterStatuses,
  deriveEnterpriseStatus,
  fetchSiteRecords,
  getSiteFilterCounts,
} from '../services/siteService';
import { useEnterpriseMap } from '../hooks/useEnterpriseMap';
import { BrandFilterPanel } from './BrandFilterPanel';
import { FilterPanel } from './FilterPanel';
import { SearchBar } from './SearchBar';
import { StateFilterDropdown } from './state_filter_dropdown';
import { RegionFilterDropdown } from './region_filter_dropdown';

export const EnterpriseApp = ({ basename, notifications, http, navigation }: GenscoAppDeps) => {
  const osSearch = useRef(createOsSearch(http)).current;
  const registerNotesClient = useRef(createRegisterNotesClient(http)).current;
  const rootRef = useRef<HTMLDivElement>(null);
  const [rootHeight, setRootHeight] = useState('calc(100vh - 48px)');
  const [loading, setLoading] = useState(false);
  const [allSites, setAllSites] = useState<SiteRecord[]>([]);
  const [sampleSites, setSampleSites] = useState(false);
  const [sampleMetrics, setSampleMetrics] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [brandFilters, setBrandFilters] = useState<Set<BrandCode>>(() => new Set());
  const [stateFilter, setStateFilter] = useState<UsStateName | null>(null);
  const [regionFilter, setRegionFilter] = useState<UsRegionName | null>(null);
  const [search, setSearch] = useState('');
  const {
    alerts: weatherAlerts,
    loading: weatherLoading,
    error: weatherError,
    refresh: refreshWeather,
  } = useWeatherAlerts(osSearch);
  const [showWeatherAlerts, setShowWeatherAlerts] = useState(false);
  const [focusedWeatherAlertId, setFocusedWeatherAlertId] = useState<string | null>(null);
  const [weatherFocusRevision, setWeatherFocusRevision] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let inFlight = false;
    let firstLoad = true;
    let errorReported = false;
    const load = async () => {
      // Skip overlapping requests and keep current map data when a poll fails.
      if (cancelled || inFlight) return;
      inFlight = true;
      if (firstLoad) setLoading(true);
      try {
        const { records, sampleSites: sample, sampleMetrics: metricsAreSample } =
          await fetchSiteRecords(osSearch);
        if (cancelled) return;
        setAllSites(records);
        setSampleSites(sample);
        setSampleMetrics(metricsAreSample);
        errorReported = false;
      } catch (error) {
        if (!cancelled && !errorReported) {
          notifications.toasts.addError(error instanceof Error ? error : new Error(String(error)), {
            title: 'Failed to load enterprise store health',
          });
          errorReported = true;
        }
      } finally {
        inFlight = false;
        firstLoad = false;
        if (!cancelled) setLoading(false);
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
  }, [osSearch, notifications]);

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;
    const measure = () =>
      setRootHeight(`${Math.max(0, window.innerHeight - element.getBoundingClientRect().top)}px`);
    measure();
    window.addEventListener('resize', measure);
    const observer = element.parentElement ? new ResizeObserver(measure) : null;
    if (observer && element.parentElement) observer.observe(element.parentElement);
    return () => {
      window.removeEventListener('resize', measure);
      observer?.disconnect();
    };
  }, []);

  const enterpriseSites = useMemo(
    () =>
      allSites.map((site) => ({
        ...site,
        status: deriveEnterpriseStatus(site.health),
        filterStatuses: deriveEnterpriseFilterStatuses(site.health),
      })),
    [allSites]
  );

  const filteredSites = useMemo(() => {
    const term = search.trim().toLowerCase();
    return enterpriseSites.filter((site) => {
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
  }, [enterpriseSites, statusFilter, brandFilters, stateFilter, regionFilter, search]);

  const brandCounts = useMemo(() => {
    const counts = new Map<BrandCode, number>(BRANDS.map(({ code }) => [code, 0]));
    allSites.forEach((site) => {
      const code = getBrandCode(site);
      if (code) counts.set(code, (counts.get(code) || 0) + 1);
    });
    return counts;
  }, [allSites]);
  const { counts: statusCounts, totalSites: statusCountSites } = useMemo(
    () => getSiteFilterCounts(enterpriseSites, brandFilters, search, stateFilter, regionFilter),
    [enterpriseSites, brandFilters, search, stateFilter, regionFilter]
  );

  const { mapContainerRef, mapMoved, resetMapView } = useEnterpriseMap({
    allSites: enterpriseSites,
    filteredSites,
    statusFilter,
    search,
    weatherAlerts,
    showWeatherAlerts,
    focusedWeatherAlertId,
    weatherFocusRevision,
    registerNotesClient,
  });
  const healthSummary = useMemo(() => {
    const summary = { total: allSites.length, healthy: 0, attention: 0, down: 0 };
    enterpriseSites.forEach(({ status }) => {
      if (status === 'Up') summary.healthy += 1;
      else if (
        status === 'Warning' ||
        status === 'Registers Down' ||
        status === 'EOD / Maintenance'
      ) {
        summary.attention += 1;
      } else if (status === 'Down') summary.down += 1;
    });
    return summary;
  }, [enterpriseSites]);
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
            appName={ENTERPRISE_APP_ID}
            showSearchBar={false}
            useDefaultBehaviors={true}
          />

          <div className="sample-map-container dark" style={{ flex: 1, position: 'relative' }}>
            <div className="enterprise-map-app" style={{ position: 'absolute', inset: 0 }}>
              <div className="enterprise-map-canvas" ref={mapContainerRef} />
              <section id="enterprise-overview" aria-label="Enterprise store health overview">
                <div className="enterprise-overview-header">
                  <div>
                    <span className="enterprise-eyebrow">BUSINESS OPERATIONS</span>
                    <h1>Enterprise Store Health</h1>
                    <p>Current health across your store network</p>
                  </div>
                  <div className={`enterprise-data-state ${usingSample ? 'is-sample' : ''}`}>
                    <span />
                    {loading ? 'Updating' : usingSample ? 'Sample data' : 'Live data'}
                  </div>
                </div>

                <div className="enterprise-kpis">
                  <div className="enterprise-kpi">
                    <span className="enterprise-kpi-label">Total stores</span>
                    <strong>{healthSummary.total}</strong>
                  </div>
                  <div className="enterprise-kpi is-healthy">
                    <span className="enterprise-kpi-label">Healthy</span>
                    <strong>{healthSummary.healthy}</strong>
                  </div>
                  <div className="enterprise-kpi is-attention">
                    <span className="enterprise-kpi-label">Attention</span>
                    <strong>{healthSummary.attention}</strong>
                  </div>
                  <div className="enterprise-kpi is-down">
                    <span className="enterprise-kpi-label">Down</span>
                    <strong>{healthSummary.down}</strong>
                  </div>
                </div>
                {usingSample && (
                  <p className="enterprise-sample-note">
                    Connect the local OpenSearch and VictoriaMetrics services for live store health.
                  </p>
                )}
              </section>

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
                    sites={enterpriseSites}
                    onChange={setStateFilter}
                  />
                  <RegionFilterDropdown
                    selectedRegion={regionFilter}
                    sites={enterpriseSites}
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
                  sites={enterpriseSites}
                  hideRegistersDown
                  onChange={setStatusFilter}
                />
              </div>

              {loading && (
                <div className="float" id="loading">
                  <div className="spinner" />
                  Loading enterprise store health…
                </div>
              )}
            </div>
          </div>
        </div>
      </I18nProvider>
    </Router>
  );
};
