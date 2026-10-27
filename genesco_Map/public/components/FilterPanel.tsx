import React from 'react';
import { SiteRecord, StatusFilter, SiteStatus } from '../lib/types';
import { exportStoresToCsv } from '../services/storeExport';

interface FilterDef {
  label: string;
  value: SiteStatus;
  color: string;
  def: string;
}

// To add a status: extend SiteStatus (lib/types), STATUS_COLORS (lib/constants),
// sample health / deriveStatus (services and lib), and add a row here.
const FILTERS: FilterDef[] = [
  {
    label: 'App Services Up',
    value: 'Up',
    color: '#27ae60',
    def: 'Site is reporting and all services are healthy.',
  },
  {
    label: 'Attention Required',
    value: 'Warning',
    color: '#e0a030',
    def: 'CPU, memory, or disk is 80% to below 90%, or a register process or service is down. Process/service outages also appear under Registers Down.',
  },
  {
    label: 'App Services Down',
    value: 'Down',
    color: '#e74c3c',
    def: 'Site host is down (gensco_site_up == 0).',
  },
  {
    label: 'Registers Down',
    value: 'Registers Down',
    color: '#ec4899',
    def: 'Any process or service is down, or CPU, memory, or disk is 90% or higher.',
  },
  {
    label: 'EOD / Maintenance',
    value: 'EOD / Maintenance',
    color: '#a855f7',
    def: 'Store is in end-of-day processing or scheduled maintenance.',
  },
  {
    label: 'No Status',
    value: 'NoStatus',
    color: '#94a3b8',
    def: 'No live health data is available for this store.',
  },
];

interface FilterPanelProps {
  statusFilter: StatusFilter;
  counts: { [key: string]: number };
  totalSites: number;
  sites: SiteRecord[];
  onChange: (filter: StatusFilter) => void;
}

export const FilterPanel = ({
  statusFilter,
  counts,
  totalSites,
  sites,
  onChange,
}: FilterPanelProps) => {
  return (
    <div id="filter-panel">
      <button
        className="filter-export-button"
        type="button"
        disabled={sites.length === 0}
        onClick={() => exportStoresToCsv(sites)}
      >
        Export CSV
      </button>
      <div id="filter-title">
        Filter by Status
        <span className="f-total-cnt">{totalSites} sites</span>
      </div>
      <div id="filter-buttons">
        {FILTERS.map((f) => {
          const active = statusFilter === f.value;
          return (
            <div
              key={f.value}
              className="filter-pill"
              data-tooltip={f.def}
              style={
                active
                  ? { background: f.color, borderColor: f.color }
                  : { background: 'transparent', borderColor: 'var(--border)' }
              }
              onClick={() => onChange(active ? 'All' : f.value)}
            >
              <div className="f-dot" style={{ background: f.color }}></div>
              <span className="f-lbl" style={{ color: active ? '#fff' : undefined }}>
                {f.label}
              </span>
              <span
                className="f-cnt"
                style={{ color: active ? 'rgba(255,255,255,0.9)' : undefined }}
              >
                {counts[f.value] || 0}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
