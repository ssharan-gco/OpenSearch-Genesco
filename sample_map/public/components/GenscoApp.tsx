import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { I18nProvider } from '@osd/i18n/react';
import { EuiSuperDatePicker } from '@elastic/eui';
import { BrowserRouter as Router } from 'react-router-dom';
import { PLUGIN_ID } from '../../common';
import { GenscoAppDeps, SiteRecord, StatusFilter } from '../lib/types';
import { createOsSearch } from '../services/searchClient';
import { buildSiteRecords, fetchAllSiteHealth, fetchSiteLocations } from '../services/siteService';
import { useGenscoMap } from '../hooks/useGenscoMap';
import { SearchBar } from './SearchBar';
import { FilterPanel } from './FilterPanel';
import { DetailPanel } from './detail/DetailPanel';

const COMMONLY_USED_RANGES = [
  { start: 'now-15m', end: 'now', label: 'Last 15 minutes' },
  { start: 'now-1h', end: 'now', label: 'Last 1 hour' },
  { start: 'now-6h', end: 'now', label: 'Last 6 hours' },
  { start: 'now-24h', end: 'now', label: 'Last 24 hours' },
  { start: 'now-7d', end: 'now', label: 'Last 7 days' },
];

/** Portals the date picker + theme toggle into the OSD primary header row. */
const HeaderControls = ({
  loading,
  timeStart,
  timeEnd,
  theme,
  onTimeChange,
  onRefresh,
  onThemeToggle,
}: {
  loading: boolean;
  timeStart: string;
  timeEnd: string;
  theme: 'dark' | 'light';
  onTimeChange: (s: string, e: string) => void;
  onRefresh: () => void;
  onThemeToggle: () => void;
}) => {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let container: HTMLElement | null = null;
    let raf = 0;
    const attach = () => {
      const section = document.querySelector('.primaryHeader .euiHeaderSection--grow.euiHeaderSection--left');
      if (!section) {
        raf = window.requestAnimationFrame(attach);
        return;
      }
      container = document.createElement('div');
      container.className = 'sample-map-header-controls';
      section.appendChild(container);
      setHost(container);
    };
    attach();
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      container?.parentNode?.removeChild(container);
    };
  }, []);

  if (!host) return null;
  return createPortal(
    <>
      <EuiSuperDatePicker
        start={timeStart}
        end={timeEnd}
        onTimeChange={({ start, end }) => onTimeChange(start, end)}
        onRefresh={onRefresh}
        isLoading={loading}
        isPaused
        refreshInterval={0}
        commonlyUsedRanges={COMMONLY_USED_RANGES}
        compressed
      />
      <button
        className="sample-map-theme-btn"
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={onThemeToggle}
        style={{ background: theme === 'dark' ? '#374151' : '#fbbf24' }}
      >
        <span style={{ transform: theme === 'light' ? 'translateX(16px)' : 'translateX(0)' }}>
          {theme === 'dark' ? '🌙' : '☀️'}
        </span>
      </button>
    </>,
    host
  );
};

/* ================================================================
   MAIN APPLICATION
   ================================================================ */
export const GenscoApp = ({ basename, notifications, http, navigation }: GenscoAppDeps) => {
  const osSearch = useRef(createOsSearch(http)).current;

  const [loading, setLoading] = useState(false);
  const [allSites, setAllSites] = useState<SiteRecord[]>([]);
  const [sampleSites, setSampleSites] = useState(false);
  const [sampleMetrics, setSampleMetrics] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [timeStart, setTimeStart] = useState('now-6h');
  const [timeEnd, setTimeEnd] = useState('now');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  // Fill exactly the viewport space below the (variable-height) OSD header.
  const rootRef = useRef<HTMLDivElement>(null);
  const [rootHeight, setRootHeight] = useState('calc(100vh - 48px)');
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => setRootHeight(`${Math.max(0, window.innerHeight - el.getBoundingClientRect().top)}px`);
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
    return allSites.filter(
      (s) =>
        (statusFilter === 'All' || s.status === statusFilter) &&
        (term === '' || s.siteId.toLowerCase().includes(term) || s.city.toLowerCase().includes(term))
    );
  }, [allSites, statusFilter, search]);

  const { mapContainerRef, counts, mapMoved, resetMapView } = useGenscoMap({
    allSites,
    filteredSites,
    search,
    onSelectSite: setSelectedSiteId,
  });

  /* ── MAP DATA ── */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [{ sites, sample }, health] = await Promise.all([fetchSiteLocations(osSearch), fetchAllSiteHealth()]);
        if (cancelled) return;
        const { records, sampleMetrics: sm } = buildSiteRecords(sites, health);
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
  }, [refreshTrigger, osSearch, notifications]);

  const selectedSite = allSites.find((s) => s.siteId === selectedSiteId) || null;
  const usingSample = sampleSites || sampleMetrics;

  return (
    <Router basename={basename}>
      <I18nProvider>
        <div
          ref={rootRef}
          style={{ display: 'flex', flexDirection: 'column', width: '100%', height: rootHeight, minHeight: 0, overflow: 'hidden' }}
        >
          <navigation.ui.TopNavMenu appName={PLUGIN_ID} showSearchBar={false} useDefaultBehaviors={true} />

          <HeaderControls
            loading={loading}
            timeStart={timeStart}
            timeEnd={timeEnd}
            theme={theme}
            onTimeChange={(s, e) => {
              setTimeStart(s);
              setTimeEnd(e);
            }}
            onRefresh={() => setRefreshTrigger((n) => n + 1)}
            onThemeToggle={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          />

          <div className={`sample-map-container ${theme}`} style={{ flex: 1, position: 'relative' }}>
            <div id="map" ref={mapContainerRef} />

            {usingSample && !loading && (
              <div className="float" id="sample-banner" title="Seed the indices / VictoriaMetrics to see live data">
                Sample data{sampleSites ? ' · sites' : ''}
                {sampleMetrics ? ' · metrics' : ''}
              </div>
            )}

            {mapMoved && (
              <button className="float" id="reset-view-btn" onClick={resetMapView} title="Return to initial map position">
                ⌖ Reset View
              </button>
            )}

            <SearchBar value={search} onChange={setSearch} />

            <div className="float" id="top-right-stack">
              <FilterPanel statusFilter={statusFilter} counts={counts} onChange={setStatusFilter} />
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
                onRefresh={() => setRefreshTrigger((n) => n + 1)}
                onClose={() => setSelectedSiteId(null)}
              />
            )}
          </div>
        </div>
      </I18nProvider>
    </Router>
  );
};
