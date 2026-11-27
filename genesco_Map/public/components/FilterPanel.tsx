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
    label: 'Store Up',
    value: 'Up',
    color: '#27ae60',
    def: 'Site is reporting and all services are healthy.',
  },
  {
    label: 'Attention Required',
    value: 'Warning',
    color: '#e0a030',
    def: 'CPU, memory, or disk is 80% to below 98%. Register outages are reflected in the store health status.',
  },
  {
    label: 'Store Down',
    value: 'Down',
    color: '#e74c3c',
    def: 'The site host is down, or all registers in the store are down.',
  },
  {
    label: 'Registers Down',
    value: 'Registers Down',
    color: '#ec4899',
    def: 'At least one register is down, or CPU, memory, or disk is 98% or higher.',
  },
  {
    label: 'EOD / Maintenance',
    value: 'EOD / Maintenance',
    color: '#a855f7',
    def: 'Store is outside its scheduled hours, in end-of-day processing, or under scheduled maintenance.',
  },
];

interface FilterPanelProps {
  statusFilter: StatusFilter;
  counts: { [key: string]: number };
  totalSites: number;
  sites: SiteRecord[];
  hideRegistersDown?: boolean;
  onChange: (filter: StatusFilter) => void;
}

export const FilterPanel = ({
  statusFilter,
  counts,
  totalSites,
  sites,
  hideRegistersDown = false,
  onChange,
}: FilterPanelProps) => {
  const filters = hideRegistersDown
    ? FILTERS.filter(({ value }) => value !== 'Registers Down')
    : FILTERS;

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
        {filters.map((f) => {
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
