import { useEffect, useMemo, useRef, useState } from 'react';
import { I18nProvider } from '@osd/i18n/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ENTERPRISE_APP_ID } from '../../common';
import { BRANDS, BrandCode, getBrandCode } from '../lib/brands';
import { GenscoAppDeps, SiteRecord, StatusFilter } from '../lib/types';
import { createOsSearch } from '../services/searchClient';
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

export const EnterpriseApp = ({ basename, notifications, http, navigation }: GenscoAppDeps) => {
  const osSearch = useRef(createOsSearch(http)).current;
  const rootRef = useRef<HTMLDivElement>(null);
  const [rootHeight, setRootHeight] = useState('calc(100vh - 48px)');
  const [loading, setLoading] = useState(false);
  const [allSites, setAllSites] = useState<SiteRecord[]>([]);
  const [sampleSites, setSampleSites] = useState(false);
  const [sampleMetrics, setSampleMetrics] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [brandFilters, setBrandFilters] = useState<Set<BrandCode>>(() => new Set());
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const {
          records,
          sampleSites: sample,
          sampleMetrics: metricsAreSample,
        } = await fetchSiteRecords(osSearch);
        if (cancelled) return;
        setAllSites(records);
        setSampleSites(sample);
        setSampleMetrics(metricsAreSample);
      } catch (error) {
        notifications.toasts.addError(error instanceof Error ? error : new Error(String(error)), {
          title: 'Failed to load enterprise store health',
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
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
        (term === '' ||
          site.siteId.toLowerCase().includes(term) ||
          site.city.toLowerCase().includes(term))
      );
    });
  }, [enterpriseSites, statusFilter, brandFilters, search]);

  const brandCounts = useMemo(() => {
    const counts = new Map<BrandCode, number>(BRANDS.map(({ code }) => [code, 0]));
    allSites.forEach((site) => {
      const code = getBrandCode(site);
      if (code) counts.set(code, (counts.get(code) || 0) + 1);
    });
    return counts;
  }, [allSites]);
  const { counts: statusCounts, totalSites: statusCountSites } = useMemo(
    () => getSiteFilterCounts(enterpriseSites, brandFilters, search),
    [enterpriseSites, brandFilters, search]
  );

  const { mapContainerRef, mapMoved, resetMapView } = useEnterpriseMap({
    allSites: enterpriseSites,
    filteredSites,
    statusFilter,
    search,
  });
  const healthSummary = useMemo(() => {
    const summary = { total: allSites.length, healthy: 0, attention: 0, down: 0, noData: 0 };
    enterpriseSites.forEach(({ status }) => {
      if (status === 'Up') summary.healthy += 1;
      else if (
        status === 'Warning' ||
        status === 'Registers Down' ||
        status === 'EOD / Maintenance'
      ) {
        summary.attention += 1;
      } else if (status === 'Down') summary.down += 1;
      else summary.noData += 1;
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
                  <div className="enterprise-kpi is-no-data">
                    <span className="enterprise-kpi-label">No data</span>
                    <strong>{healthSummary.noData}</strong>
                  </div>
                </div>
                {usingSample && (
                  <p className="enterprise-sample-note">
                    Connect the local OpenSearch and VictoriaMetrics services for live store health.
                  </p>
                )}
              </section>

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
