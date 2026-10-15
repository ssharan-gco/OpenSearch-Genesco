import React, { useState } from 'react';
import dashboardByStore from '../../../sample-data/store-dashboard-by-store.json';
import { SiteRecord } from '../../lib/types';

interface DetailPanelProps {
  site: SiteRecord;
  onRefresh: () => void;
  onClose: () => void;
}

const STATUS_CLASS: { [status: string]: string } = {
  Healthy: 'healthy',
  Degraded: 'degraded',
  Down: 'down',
  Up: 'healthy',
};

export const DetailPanel = ({ site, onRefresh, onClose }: DetailPanelProps) => {
  const dashboardData = (dashboardByStore as Record<string, typeof dashboardByStore[keyof typeof dashboardByStore]>)[site.siteId];
  const [lastRefreshed, setLastRefreshed] = useState(dashboardData?.lastRefreshed || new Date().toISOString());
  if (!dashboardData) return null;
  const registers = dashboardData.registers;
  const healthyCount = registers.filter((register) => register.status === 'Healthy').length;
  const degradedCount = registers.filter((register) => register.status === 'Degraded').length;
  const downCount = registers.filter((register) => register.status === 'Down').length;
  const processCount = registers.reduce((total, register) => total + register.processes.length, 0);
  const runningProcessCount = registers.reduce((total, register) => total + register.processesUp, 0);
  const serviceCount = registers.reduce((total, register) => total + register.services.length, 0);
  const runningServiceCount = registers.reduce((total, register) => total + register.servicesUp, 0);
  const location = [site.address, [site.city, [site.state, site.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ')]
    .filter(Boolean)
    .join(' · ');
  const storeTitle = `Store #${site.siteId} — ${site.city}${site.state ? `, ${site.state}` : ''}`;

  const refreshDashboard = () => {
    setLastRefreshed(new Date().toISOString());
    onRefresh();
  };

  return (
    <>
      <div id="overlay-bg" onClick={onClose} />
      <div id="detail-panel">
        <div className="dp-header">
          <div className="store-dashboard-heading">
            <div className="store-dashboard-eyebrow">XSTORE POS · STORE DETAIL VIEW</div>
            <div className="dp-title">{storeTitle}</div>
            <div className="gm-subtitle">
              {location} · {registers.length} registers · No back-office server
            </div>
            <div className="store-dashboard-tags">
              {downCount > 0 && <span className="store-dashboard-tag tag-down">Registers Down</span>}
              <span className="store-dashboard-tag">{registers.length} registers</span>
              <span className="store-dashboard-tag tag-healthy">{healthyCount} healthy</span>
              {downCount > 0 && <span className="store-dashboard-tag tag-down">{downCount} down</span>}
              {degradedCount > 0 && <span className="store-dashboard-tag tag-degraded">{degradedCount} degraded</span>}
              <span className="store-dashboard-tag">Last 24 hours</span>
            </div>
          </div>
          <div className="store-dashboard-header-actions">
            <div className="store-dashboard-refresh">
              <span>LAST REFRESHED</span>
              <strong>{new Date(lastRefreshed).toLocaleString()}</strong>
              <span>Source: VictoriaMetrics · store POS</span>
              <span className="store-dashboard-legend">
                <i className="healthy" /> Up / Running <i className="degraded" /> Degraded <i className="down" /> Down
                <i className="no-data" /> No data <i className="restart" /> Restart
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

        <div className="store-dashboard-notice">
          <strong>{dashboardData.storeMode}</strong>
          <span>{dashboardData.notice}</span>
        </div>

        <div className="dp-cards">
          <SummaryCard label="Registers" value={String(registers.length)} sub={registers.map((r) => `R${String(r.id).padStart(2, '0')}`).join(', ')} />
          <SummaryCard label="Healthy" value={String(healthyCount)} sub={registers.filter((r) => r.status === 'Healthy').map((r) => `Reg ${r.id}`).join(', ') || 'None'} tone="healthy" />
          <SummaryCard label="Degraded" value={String(degradedCount)} sub={registers.filter((r) => r.status === 'Degraded').map((r) => `Reg ${r.id}`).join(', ') || 'None'} tone="degraded" />
          <SummaryCard label="Down" value={String(downCount)} sub={registers.filter((r) => r.status === 'Down').map((r) => `Reg ${r.id}`).join(', ') || 'None'} tone="down" />
          <SummaryCard label="Processes Up" value={`${runningProcessCount}/${processCount}`} sub="6 tracked per register" />
          <SummaryCard label="Services Up" value={`${runningServiceCount}/${serviceCount}`} sub="4 tracked per register" />
          <SummaryCard label="Store Health (24h)" value={`${dashboardData.storeHealth}%`} sub="Weighted uptime" tone={dashboardData.storeHealth >= 90 ? 'healthy' : dashboardData.storeHealth >= 65 ? 'degraded' : 'down'} />
        </div>

        <div className="dp-body store-dashboard-body">
          <section className="store-dashboard-section">
            <SectionHeading title="Register Status & System Uptime" subtitle="xstore_pos_uptime_seconds · latest sample" />
            <div className="store-dashboard-table-wrap">
              <table className="store-dashboard-table">
                <thead>
                  <tr>
                    <th>Register</th>
                    <th>Host</th>
                    <th>System Uptime</th>
                    <th>Last Boot</th>
                    <th>Processes</th>
                    <th>Services</th>
                    <th>Last 24h</th>
                    <th>Latest Status</th>
                  </tr>
                </thead>
                <tbody>
                  {registers.map((register) => (
                    <tr key={register.id}>
                      <td>Register {register.id}</td>
                      <td>{register.host}<div style={{ fontSize: 11, opacity: 0.7 }}>{register.ip}</div></td>
                      <td><strong>{register.uptime}</strong></td>
                      <td>{register.lastBoot}</td>
                      <td className={register.processesUp === 6 ? 'healthy-text' : 'degraded-text'}>
                        {register.processesUp} / 6
                      </td>
                      <td className={register.servicesUp === 4 ? 'healthy-text' : 'degraded-text'}>
                        {register.servicesUp} / 4
                      </td>
                      <td><UptimeBars history={register.history} registerId={register.id} /></td>
                      <td><StatusBadge status={register.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="store-dashboard-section">
            <SectionHeading title="Register Depth View" subtitle="Latest process & service state per register, with 24h sparkline" />
            <div className="store-register-grid">
              {registers.map((register) => (
                <article className="store-register-card" key={register.id}>
                  <header className="store-register-header">
                    <div>
                      <span className="store-mini-label">REGISTER</span>
                      <h3>Reg {register.id}</h3>
                      <small>{register.host} · {register.ip}</small>
                    </div>
                    <div className="store-register-health">
                      <StatusBadge status={register.status} />
                      <strong>{register.uptime}</strong>
                      <small>SYSTEM UPTIME</small>
                    </div>
                  </header>

                  <RegisterUtilization siteId={site.siteId} registerId={register.id} />

                  <div className="store-register-group">
                    <div className="store-group-heading">
                      <span>PROCESSES</span>
                      <strong className={register.processesUp === 6 ? 'healthy-text' : 'degraded-text'}>
                        {register.processesUp} / 6 UP
                      </strong>
                    </div>
                    <div className="store-process-grid">
                      {register.processes.map((process) => (
                        <div className={`store-health-item ${STATUS_CLASS[process.status] || 'down'}`} key={process.name}>
                          <div><strong>{process.name}</strong><small>pid {process.pid}</small></div>
                          <span>{process.status}</span>
                          <UptimeBars history={register.history} registerId={register.id} compact />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="store-register-group">
                    <div className="store-group-heading">
                      <span>SERVICES</span>
                      <strong className={register.servicesUp === 4 ? 'healthy-text' : 'degraded-text'}>
                        {register.servicesUp} / 4 UP
                      </strong>
                    </div>
                    <div className="store-service-grid">
                      {register.services.map((service) => (
                        <div className={`store-health-item ${STATUS_CLASS[service.status] || 'down'}`} key={service.name}>
                          <strong>{service.name}</strong>
                          <span>{service.status}</span>
                          <UptimeBars history={register.history} registerId={register.id} compact />
                        </div>
                      ))}
                    </div>
                  </div>
                  {register.status !== 'Healthy' && (
                    <div className={`store-register-note ${STATUS_CLASS[register.status]}`}>
                      {register.status === 'Down'
                        ? 'Sample unavailable process or service (demo only)'
                        : 'Sample degraded health state (demo only)'}
                    </div>
                  )}
                </article>
              ))}
            </div>
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

const RegisterUtilization = ({ siteId, registerId }: { siteId: string; registerId: number }) => {
  const seed = Array.from(`${siteId}:${registerId}`).reduce(
    (total, character) => total + character.charCodeAt(0),
    0
  );
  const metrics = [
    { label: 'CPU', value: (seed * 17 + 13) % 101 },
    { label: 'Memory', value: (seed * 29 + 31) % 101 },
    { label: 'Disk space', value: (seed * 43 + 47) % 101 },
  ];

  return (
    <div className="store-register-group">
      <div className="store-group-heading">
        <span>RESOURCE UTILIZATION</span>
        <span title="Green: under 80%. Amber: 80–89%. Red: 90–100%.">80 / 90% LIMITS</span>
      </div>
      <div className="store-utilization-thresholds">
        {metrics.map(({ label, value }) => {
          const tone = value >= 90 ? 'down' : value >= 80 ? 'degraded' : 'healthy';

          return (
            <div className={`store-utilization-threshold-row ${tone}`} key={label}>
              <div className="store-utilization-metric-label">
                <strong>{label}</strong>
                <span>{value}%</span>
              </div>
              <div
                className="store-utilization-track"
                role="progressbar"
                aria-label={`${label} utilization (demo)`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={value}
                aria-valuetext={`${value}%`}
              >
                <span className="store-utilization-fill" style={{ width: `${value}%` }} />
              </div>
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
  compact = false,
}: {
  history: number[];
  registerId: number;
  compact?: boolean;
}) => (
  <div className={`store-uptime-bars${compact ? ' compact' : ''}`} aria-label={`24-hour uptime for register ${registerId}`}>
    {history.map((up, index) => (
      <span
        className={up ? 'healthy' : 'down'}
        key={`${registerId}-${index}`}
        title={`${24 - index} hours ago: ${up ? 'Up' : 'Down'}`}
      />
    ))}
  </div>
);
