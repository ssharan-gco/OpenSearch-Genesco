import { useEffect, useRef, useState } from 'react';
import moment from 'moment-timezone';
import genescoLogo from '../../assets/genesco_med_c.svg';
import { OsSearch, SiteRecord, TimeWindow } from '../../lib/types';
import {
  calculateStoreHealth,
  fetchStoreRegisterDashboard,
  StoreRegister,
  summarizeStoreRegisters,
} from '../../services/registerMetrics';
import {
  fetchStoreRegisterVersions,
  RegisterVersionDetails,
} from '../../services/registerVersions';
import { ErrorAnalysisChart } from './ErrorAnalysisChart';

const COMMONLY_USED_RANGES = [
  { start: 'now-5m', end: 'now', label: 'Last 5 minutes' },
  { start: 'now-15m', end: 'now', label: 'Last 15 minutes' },
  { start: 'now-30m', end: 'now', label: 'Last 30 minutes' },
  { start: 'now-1h', end: 'now', label: 'Last 1 hour' },
  { start: 'now-3h', end: 'now', label: 'Last 3 hours' },
  { start: 'now-6h', end: 'now', label: 'Last 6 hours' },
  { start: 'now-24h', end: 'now', label: 'Last 24 hours' },
  { start: 'now-7d', end: 'now', label: 'Last 7 days' },
  { start: 'now-30d', end: 'now', label: 'Last 30 days' },
  { start: 'now-90d', end: 'now', label: 'Last 90 days' },
  { start: 'now-180d', end: 'now', label: 'Last 180 days' },
  { start: 'now-1y', end: 'now', label: 'Last 1 year' },
  { start: 'now-1d/d', end: 'now-1d/d', label: 'Yesterday' },
  { start: 'now/d', end: 'now/d', label: 'Today' },
];

interface DetailPanelProps {
  site: SiteRecord;
  timeWindow: TimeWindow;
  onTimeChange: (start: string, end: string) => void;
  osSearch: OsSearch;
  timeZone: string;
  refreshToken: number;
  onRefresh: () => void;
  onMetricsError: (error: Error) => void;
  onClose: () => void;
}

const STATUS_CLASS: { [status: string]: string } = {
  Healthy: 'healthy',
  Up: 'healthy',
  Degraded: 'degraded',
  Down: 'down',
  'No data': 'no-data',
  Stale: 'stale',
};

interface TimeRangePickerProps {
  timeWindow: TimeWindow;
  timeZone: string;
  onTimeChange: (start: string, end: string) => void;
}

const DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

const normalizeDateTimeInput = (value: string) => (value.length === 16 ? `${value}:00` : value);

export const TimeRangePicker = ({ timeWindow, timeZone, onTimeChange }: TimeRangePickerProps) => {
  const pickerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState('');
  const [draftTo, setDraftTo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const selectedRange = `${moment.tz(timeWindow.fromMs, timeZone).format('YYYY-MM-DD HH:mm')} – ${moment
    .tz(timeWindow.toMs, timeZone)
    .format('YYYY-MM-DD HH:mm')}`;

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !pickerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  const openPicker = () => {
    setDraftFrom(moment.tz(timeWindow.fromMs, timeZone).format(DATE_TIME_FORMAT));
    setDraftTo(moment.tz(timeWindow.toMs, timeZone).format(DATE_TIME_FORMAT));
    setError(null);
    setIsOpen(true);
  };

  const applyCustomRange = () => {
    const normalizedFrom = normalizeDateTimeInput(draftFrom);
    const normalizedTo = normalizeDateTimeInput(draftTo);
    const from = moment.tz(normalizedFrom, DATE_TIME_FORMAT, true, timeZone);
    const to = moment.tz(normalizedTo, DATE_TIME_FORMAT, true, timeZone);
    if (
      !from.isValid() ||
      !to.isValid() ||
      from.format(DATE_TIME_FORMAT) !== normalizedFrom ||
      to.format(DATE_TIME_FORMAT) !== normalizedTo ||
      from.valueOf() >= to.valueOf()
    ) {
      setError('Enter a valid range with the From time earlier than the To time.');
      return;
    }

    onTimeChange(from.format(), to.format());
    setIsOpen(false);
  };

  return (
    <div className="sample-map-range-picker" ref={pickerRef}>
      <button
        className="sample-map-range-trigger"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={isOpen ? () => setIsOpen(false) : openPicker}
      >
        <span aria-hidden="true">▦</span>
        <span>{selectedRange}</span>
        <span aria-hidden="true">▾</span>
      </button>
      {isOpen && (
        <div
          className="sample-map-range-popover"
          role="dialog"
          aria-label="Select date and time range"
          onKeyDown={(event) => {
            if (event.key === 'Escape') setIsOpen(false);
          }}
        >
          <div className="sample-map-range-fields">
            <label>
              <span>From</span>
              <input
                className="sample-map-date-time-input"
                type="datetime-local"
                step="1"
                autoFocus
                aria-label="From date and time"
                value={draftFrom}
                onChange={(event) => setDraftFrom(event.target.value)}
              />
            </label>
            <label>
              <span>To</span>
              <input
                className="sample-map-date-time-input"
                type="datetime-local"
                step="1"
                aria-label="To date and time"
                value={draftTo}
                onChange={(event) => setDraftTo(event.target.value)}
              />
            </label>
            <div className="sample-map-range-zone">
              <span>{timeZone}</span>
              <span>{moment.tz(timeZone).format('[UTC]Z')}</span>
            </div>
            <button
              className="sample-map-range-now"
              type="button"
              onClick={() => setDraftTo(moment().tz(timeZone).format(DATE_TIME_FORMAT))}
            >
              ◷ Switch To Now
            </button>
          </div>
          <div className="sample-map-range-presets">
            <strong>Commonly used</strong>
            {COMMONLY_USED_RANGES.map((range) => (
              <button
                key={range.label}
                type="button"
                onClick={() => {
                  onTimeChange(range.start, range.end);
                  setIsOpen(false);
                }}
              >
                {range.label}
              </button>
            ))}
          </div>
          <div className="sample-map-range-actions">
            {error && <span role="alert">{error}</span>}
            <button type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </button>
            <button type="button" onClick={applyCustomRange}>
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const DetailPanel = ({
  site,
  timeWindow,
  onTimeChange,
  osSearch,
  timeZone,
  refreshToken,
  onRefresh,
  onMetricsError,
  onClose,
}: DetailPanelProps) => {
  const [dashboard, setDashboard] = useState<Awaited<
    ReturnType<typeof fetchStoreRegisterDashboard>
  > | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [registerVersions, setRegisterVersions] = useState<RegisterVersionDetails[]>([]);
  const [versionLoadError, setVersionLoadError] = useState<string | null>(null);
  const [versionLoading, setVersionLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setDashboard(null);
    setLastRefreshedAt(null);
    fetchStoreRegisterDashboard(site.siteId, timeWindow)
      .then((data) => {
        if (!cancelled) {
          setDashboard(data);
          setLastRefreshedAt(Date.now());
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        setLoadError(normalizedError.message);
        onMetricsError(normalizedError);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [site.siteId, timeWindow.fromMs, timeWindow.toMs, refreshToken, onMetricsError]);

  useEffect(() => {
    let cancelled = false;
    setVersionLoading(true);
    setRegisterVersions([]);
    setVersionLoadError(null);
    fetchStoreRegisterVersions(osSearch, site.siteId)
      .then((versions) => {
        if (!cancelled) setRegisterVersions(versions);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        setVersionLoadError(normalizedError.message);
      })
      .finally(() => {
        if (!cancelled) setVersionLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [site.siteId, refreshToken, osSearch]);

  const registers = dashboard?.registers || [];
  const registerCounts = summarizeStoreRegisters(registers);
  const healthyRegisters = registers.filter((register) => register.status === 'Healthy');
  const degradedRegisters = registers.filter((register) => register.status === 'Degraded');
  const downRegisters = registers.filter((register) => register.status === 'Down');
  const versionsByRegister = new Map(
    registerVersions.map((version) => [version.registerId, version.fields])
  );
  const healthyCount = registerCounts.healthy;
  const degradedCount = registerCounts.degraded;
  const downCount = registerCounts.down;
  const staleRegisters = registers.filter((register) => register.isStale);
  const processCount = registerCounts.processes;
  const runningProcessCount = registerCounts.processesUp;
  const serviceCount = registerCounts.services;
  const runningServiceCount = registerCounts.servicesUp;
  const storeHealth = calculateStoreHealth(registers);
  const location = [
    site.address,
    [site.city, [site.state, site.zip].filter(Boolean).join(' ')].filter(Boolean).join(', '),
  ]
    .filter(Boolean)
    .join(' · ');
  const storeTitle = `Store #${site.siteId} — ${site.city}${site.state ? `, ${site.state}` : ''}`;
  const formatInTimeZone = (timestamp: number) =>
    moment.tz(timestamp, timeZone).format('YYYY-MM-DD HH:mm:ss z');
  return (
    <>
      <div id="overlay-bg" onClick={onClose} />
      <div id="detail-panel">
        <div className="dp-header">
          <div className="store-dashboard-heading">
            <div className="store-dashboard-eyebrow">XSTORE POS · STORE DETAIL VIEW</div>
            <div className="dp-title">{storeTitle}</div>
            <div className="gm-subtitle">
              {location} · {registerCounts.registers} registers
            </div>
            <div className="store-dashboard-tags">
              <span className="store-dashboard-tag">{registerCounts.registers} registers</span>
              <span className="store-dashboard-tag tag-healthy">{healthyCount} healthy</span>
              {downCount > 0 && (
                <span className="store-dashboard-tag tag-down">{downCount} down</span>
              )}
              {degradedCount > 0 && (
                <span className="store-dashboard-tag tag-degraded">{degradedCount} degraded</span>
              )}
              {registers.some((register) => register.history.some((uptime) => uptime === 0)) && (
                <span className="store-dashboard-tag tag-degraded">Restart detected</span>
              )}
            </div>
          </div>
          <div className="sample-map-dashboard-controls">
            <TimeRangePicker
              timeWindow={timeWindow}
              timeZone={timeZone}
              onTimeChange={onTimeChange}
            />
            <div className="sample-map-timezone" role="status" aria-label={`Time zone ${timeZone}`}>
              <svg
                className="sample-map-timezone-icon"
                aria-hidden="true"
                viewBox="0 0 16 16"
                width="16"
                height="16"
                fill="none"
              >
                <circle className="sample-map-timezone-icon-face" cx="8" cy="8.5" r="6" />
                <path
                  className="sample-map-timezone-icon-hands"
                  d="M8 5v3.5l2.25 1.25M6 1.5h4M8 1.5v1"
                />
              </svg>
              <span>Time zone</span>
              <span className="sample-map-timezone-current">{timeZone}</span>
            </div>
            <button
              className="sample-map-refresh-btn"
              type="button"
              onClick={onRefresh}
              disabled={loading}
              title="Refresh register metrics"
            >
              {loading ? 'Refreshing…' : '⟳ '}
            </button>
          </div>
          <div className="store-dashboard-header-actions">
            <div className="store-dashboard-brand">
              <img className="store-dashboard-logo" src={genescoLogo} alt="Genesco" />
              <button
                className="store-dashboard-back"
                type="button"
                onClick={onClose}
                aria-label="Back to map"
              >
                <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14" fill="none">
                  <path
                    d="M10.5 3.5 6 8l4.5 4.5M6.5 8h7"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.6"
                  />
                </svg>
              </button>
            </div>
            <div className="store-dashboard-refresh">
              <span>LAST REFRESHED</span>
              <strong>{lastRefreshedAt === null ? '—' : formatInTimeZone(lastRefreshedAt)}</strong>
              <span>Source: VictoriaMetrics · store POS · {timeZone}</span>
              <span className="store-dashboard-legend">
                <span className="store-dashboard-legend-item">
                  <i className="healthy" />
                  <span>Up / Running</span>
                </span>
                <span className="store-dashboard-legend-item">
                  <i className="degraded" />
                  <span>Degraded</span>
                </span>
                <span className="store-dashboard-legend-item">
                  <i className="down" />
                  <span>Down</span>
                </span>
                <span className="store-dashboard-legend-item">
                  <i className="no-data" />
                  <span>No data</span>
                </span>
                <span className="store-dashboard-legend-item">
                  <i className="restart" />
                  <span>Restart</span>
                </span>
              </span>
            </div>
            {/* <button className="gm-icon-btn" onClick={refreshDashboard} title="Refresh this site" data-detail-refresh="true">
              ⟳
            </button>
            <button className="dp-close" onClick={onClose} title="Close dashboard">
              ✕
            </button> */}
          </div>
        </div>

        <div className="dp-cards">
          <SummaryCard
            label="Registers"
            value={String(registerCounts.registers)}
            sub={formatRegisterIds(registers, 'Reg ')}
          />
          <SummaryCard
            label="Healthy"
            value={String(healthyCount)}
            sub={formatRegisterIds(healthyRegisters, 'Reg ')}
            tone="healthy"
          />
          <SummaryCard
            label="Degraded"
            value={String(degradedCount)}
            sub={formatRegisterIds(degradedRegisters, 'Reg ')}
            tone="degraded"
          />
          <SummaryCard
            label="Down"
            value={String(downCount)}
            sub={formatRegisterIds(downRegisters, 'Reg ')}
            tone="down"
          />
          <SummaryCard
            label="Processes Up"
            value={`${runningProcessCount}/${processCount}`}
            sub={trackedPerRegisterLabel(registers.map((register) => register.processes.length))}
          />
          <SummaryCard
            label="Services Up"
            value={`${runningServiceCount}/${serviceCount}`}
            sub={trackedPerRegisterLabel(registers.map((register) => register.services.length))}
          />
          <SummaryCard
            label="Store Health (range)"
            value={storeHealth === null ? '—' : `${storeHealth.toFixed(1)}%`}
            sub="Healthy status samples"
            tone={storeHealth === 100 ? 'healthy' : undefined}
          />
        </div>

        <div className="dp-body store-dashboard-body">
          {!loading && !loadError && staleRegisters.length > 0 && (
            <div className="store-live-state stale">
              Last sample is more than 6 hours before the selected range end for registers{' '}
              {staleRegisters.map((register) => register.id).join(', ')}.
            </div>
          )}
          <section className="store-dashboard-section">
            <SectionHeading
              title="Register Status & System Uptime"
              subtitle="Latest readings and history within the selected time range"
            />
            {loading && <div className="store-live-state">Loading live register metrics…</div>}
            {loadError && (
              <div className="store-live-state down-text">
                Unable to load register metrics: {loadError}
              </div>
            )}
            {!loading && !loadError && registers.length === 0 && (
              <>
                <div className="store-live-state">
                  No live register metrics found for this store. Missing process and service
                  responses are shown as Down.
                </div>
                <div className="store-register-group">
                  <div className="store-group-heading">
                    <span>PROCESSES</span>
                    <strong>0 / 1 UP</strong>
                  </div>
                  <div className="store-process-grid">
                    <NoResponseMetric label="No process response" />
                  </div>
                  <div className="store-group-heading">
                    <span>SERVICES</span>
                    <strong>0 / 1 UP</strong>
                  </div>
                  <div className="store-service-grid">
                    <NoResponseMetric label="No service response" />
                  </div>
                </div>
              </>
            )}
            {!loading && !loadError && registers.length > 0 && (
              <div className="store-dashboard-table-wrap">
                <table className="store-dashboard-table">
                  <colgroup>
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Register</th>
                      <th>Host</th>
                      <th>System Uptime</th>
                      <th>Last Boot</th>
                      <th>Processes</th>
                      <th>Services</th>
                      <th>Selected range status</th>
                      <th>Latest Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registers.map((register) => (
                      <tr key={register.id}>
                        <td>Register {register.id}</td>
                        <td>{register.host}</td>
                        <td>
                          <strong>{register.uptime}</strong>
                        </td>
                        <td>
                          {register.lastBootTimestamp === null
                            ? 'No data'
                            : formatInTimeZone(register.lastBootTimestamp)}
                        </td>
                        <td>
                          {register.processes.filter((process) => process.status === 'Up').length} /{' '}
                          {register.processes.length}
                        </td>
                        <td>
                          {register.services.filter((service) => service.status === 'Up').length} /{' '}
                          {register.services.length}
                        </td>
                        <td>
                          <UptimeBars
                            history={register.healthHistory}
                            registerId={register.id}
                            timeWindow={timeWindow}
                            timeZone={timeZone}
                          />
                        </td>
                        <td>
                          <StatusBadge status={register.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Independent, read-only OpenSearch error analysis; existing register health is unchanged. */}
          <section className="store-dashboard-section">
            <SectionHeading
              title="Top 10 Errors by Occurrence"
              subtitle="Xstore register errors for this store in the selected time range"
            />
            <ErrorAnalysisChart
              osSearch={osSearch}
              storeId={site.siteId}
              timeWindow={timeWindow}
              refreshToken={refreshToken}
            />
          </section>

          <section className="store-dashboard-section">
            <SectionHeading
              title="Register Depth View"
              subtitle="Live process, service, and resource metrics"
            />
            {versionLoadError && (
              <div className="store-live-state down-text">
                Unable to load Xstore version details: {versionLoadError}
              </div>
            )}
            {!loading && !loadError && registers.length > 0 && (
              <div className="store-register-grid">
                {registers.map((register) => (
                  <article className="store-register-card" key={register.id}>
                    <header className="store-register-header">
                      <div>
                        <span className="store-mini-label">REGISTER</span>
                        <h3>Reg {register.id}</h3>
                        <small>{register.host}</small>
                        <small>
                          Last sample:{' '}
                          {formatSampleAge(register.lastMetricTimestamp, timeWindow.toMs)}
                        </small>
                      </div>
                      <div className="store-register-health">
                        <StatusBadge status={register.status} />
                        <strong>{register.uptime}</strong>
                        <small>SYSTEM UPTIME</small>
                      </div>
                    </header>

                    <div className="store-register-version">
                      <strong>Xstore version</strong>
                      {(versionsByRegister.get(register.id) || []).length > 0 ? (
                        <dl>
                          {versionsByRegister.get(register.id)?.map(({ label, value }) => (
                            <div key={label}>
                              <dt>{label}</dt>
                              <dd>{value}</dd>
                            </div>
                          ))}
                        </dl>
                      ) : (
                        <span>
                          {versionLoading ? 'Loading version details…' : 'No version details found'}
                        </span>
                      )}
                    </div>

                    <RegisterUtilization register={register} />

                    <div className="store-register-group">
                      <div className="store-group-heading">
                        <span>PROCESSES</span>
                        <strong>
                          {register.processes.filter((process) => process.status === 'Up').length} /{' '}
                          {register.processes.length} UP
                        </strong>
                      </div>
                      <div className="store-process-grid">
                        {register.processes.map((process) => (
                          <div
                            className={`store-health-item ${STATUS_CLASS[process.status] || 'down'}`}
                            key={process.name}
                          >
                            <div>
                              <strong>{process.name}</strong>
                              <small>
                                {process.pid === null ? 'No response' : `pid ${process.pid}`}
                              </small>
                            </div>
                            <span>{process.status}</span>
                            <StatusHistoryBars
                              history={process.history}
                              label={`${process.name} history for register ${register.id}`}
                              timeWindow={timeWindow}
                              timeZone={timeZone}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="store-register-group">
                      <div className="store-group-heading">
                        <span>SERVICES</span>
                        <strong>
                          {register.services.filter((service) => service.status === 'Up').length} /{' '}
                          {register.services.length} UP
                        </strong>
                      </div>
                      <div className="store-service-grid">
                        {register.services.map((service) => (
                          <div
                            className={`store-health-item ${STATUS_CLASS[service.status] || 'down'}`}
                            key={service.name}
                          >
                            <strong>{service.name}</strong>
                            <span>{service.status}</span>
                            <StatusHistoryBars
                              history={service.history}
                              label={`${service.name} history for register ${register.id}`}
                              timeWindow={timeWindow}
                              timeZone={timeZone}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

const SummaryCard = ({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone?: string;
}) => (
  <div className="dp-card">
    <div className="c-label">{label}</div>
    <div className={`c-value ${tone ? `${tone}-text` : ''}`}>{value}</div>
    <div className="c-sub">{sub}</div>
  </div>
);

const SectionHeading = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="store-section-heading">
    <strong>{title}</strong>
    <span>{subtitle}</span>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => (
  <span className={`store-status-badge ${STATUS_CLASS[status] || 'down'}`}>{status}</span>
);

const NoResponseMetric = ({ label }: { label: string }) => (
  <div className="store-health-item down">
    <strong>{label}</strong>
    <span>Down</span>
    <div className="store-health-history" aria-label={`${label}: Down`}>
      <span className="down" />
    </div>
  </div>
);

const MAX_UPTIME_BARS = 24;

const getHistoryBuckets = (history: Array<number | null>) => {
  const bucketCount = Math.min(history.length, MAX_UPTIME_BARS);
  return Array.from({ length: bucketCount }, (_, index) => {
    const start = Math.floor((index * history.length) / bucketCount);
    const end = Math.floor(((index + 1) * history.length) / bucketCount);
    const samples = history.slice(start, end);
    const status = samples.includes(0) ? 0 : samples.includes(1) ? 1 : null;
    return { status, index: Math.floor((start + end - 1) / 2) };
  });
};

const StatusHistoryBars = ({
  history,
  label,
  timeWindow,
  timeZone,
}: {
  history: Array<number | null>;
  label: string;
  timeWindow: TimeWindow;
  timeZone: string;
}) => {
  const buckets = getHistoryBuckets(history);

  return (
    <div className="store-health-history" aria-label={label}>
      {history.length === 0 ? (
        <span className="no-data" title="No history available in the selected range" />
      ) : (
        buckets.map(({ status, index }) => (
          <span
            className={status === null ? 'no-data' : status === 1 ? 'healthy' : 'down'}
            key={`${label}-${index}`}
            title={`${formatHistoryTime(index, history.length, timeWindow, timeZone)}: ${
              status === null ? 'No data' : status === 1 ? 'Up' : 'Down'
            }`}
          />
        ))
      )}
    </div>
  );
};

const formatRegisterIds = (registers: Array<{ id: string }>, prefix: string): string =>
  registers.length > 0
    ? registers.map(({ id }) => `${prefix}${prefix === 'R' ? id.padStart(2, '0') : id}`).join(', ')
    : 'None';

const trackedPerRegisterLabel = (counts: number[]): string => {
  if (counts.length === 0) return 'No registers reporting';
  if (!counts.every((count) => count === counts[0])) return 'Tracked counts vary by register';
  return `${counts[0]} tracked per register`;
};

const formatPercent = (value: number | null) => (value === null ? '—' : `${value.toFixed(1)}%`);

const formatHistoryTime = (
  index: number,
  length: number,
  timeWindow: TimeWindow,
  timeZone: string
) => {
  const position = length <= 1 ? 1 : index / (length - 1);
  const timestamp = timeWindow.fromMs + (timeWindow.toMs - timeWindow.fromMs) * position;
  return moment.tz(timestamp, timeZone).format('YYYY-MM-DD HH:mm z');
};

const formatSampleAge = (timestamp: number | null, referenceTime: number) => {
  if (timestamp === null) return 'unknown';
  const ageSeconds = Math.max(0, Math.floor((referenceTime - timestamp) / 1000));
  if (ageSeconds < 60) return `${ageSeconds}s ago`;
  const ageMinutes = Math.floor(ageSeconds / 60);
  if (ageMinutes < 60) return `${ageMinutes}m ago`;
  const ageHours = Math.floor(ageMinutes / 60);
  if (ageHours < 24) return `${ageHours}h ago`;
  return `${Math.floor(ageHours / 24)}d ago`;
};

const formatBytes = (value: number) => {
  if (value < 1024 ** 3) return `${(value / 1024 ** 2).toFixed(0)} MB`;
  return `${(value / 1024 ** 3).toFixed(1)} GB`;
};

const RegisterUtilization = ({ register }: { register: StoreRegister }) => {
  const metrics = [
    { label: 'CPU', value: register.cpuPercent, detail: null as string | null },
    {
      label: 'Memory',
      value: register.memoryPercent,
      detail:
        register.memoryAvailableBytes === null
          ? null
          : `${formatBytes(register.memoryAvailableBytes)} available`,
    },
    {
      label: register.disk ? `Disk space · ${register.disk.mountpoint}` : 'Disk space',
      value: register.disk?.usagePercent ?? null,
      detail:
        register.disk?.freeBytes === null || register.disk?.freeBytes === undefined
          ? null
          : `${formatBytes(register.disk.freeBytes)} free`,
    },
  ];

  return (
    <div className="store-register-group">
      <div className="store-group-heading">
        <span>RESOURCE UTILIZATION</span>
        <span title="Green: under 80%. Amber: 80–89%. Red: 90% or higher.">80 / 90% LIMITS</span>
      </div>
      <div className="store-utilization-thresholds">
        {metrics.map(({ label, value, detail }) => {
          const tone =
            value === null
              ? 'no-data'
              : value >= 90
                ? 'down'
                : value >= 80
                  ? 'degraded'
                  : 'healthy';
          const barWidth = value === null ? 0 : Math.max(0, Math.min(100, value));

          return (
            <div className={`store-utilization-threshold-row ${tone}`} key={label}>
              <div className="store-utilization-metric-label">
                <strong>{label}</strong>
                <span>{formatPercent(value)}</span>
              </div>
              <div className="store-utilization-track">
                {value !== null && (
                  <span
                    className="store-utilization-fill"
                    role="progressbar"
                    aria-label={`${label} utilization`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={barWidth}
                    aria-valuetext={`${value}%`}
                    style={{ width: `${barWidth}%` }}
                  />
                )}
              </div>
              {detail && <small className="store-utilization-detail">{detail}</small>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const UptimeBars = ({
  history,
  registerId,
  timeWindow,
  timeZone,
  compact = false,
}: {
  history: Array<number | null>;
  registerId: string;
  timeWindow: TimeWindow;
  timeZone: string;
  compact?: boolean;
}) => {
  const buckets = compact
    ? history.map((status, index) => ({ status, index }))
    : getHistoryBuckets(history);

  return (
    <div
      className={`store-uptime-bars${compact ? ' compact' : ''}`}
      aria-label={`Selected-range health status for register ${registerId}`}
    >
      {history.length === 0 ? (
        <span className="no-data" title="No status history available in the selected range" />
      ) : (
        buckets.map(({ status, index }) => (
          <span
            className={status === null ? 'no-data' : status ? 'healthy' : 'down'}
            key={`${registerId}-${index}`}
            title={`${formatHistoryTime(index, history.length, timeWindow, timeZone)}: ${
              status === null ? 'No data' : status ? 'Healthy' : 'Down'
            }`}
          />
        ))
      )}
    </div>
  );
};
