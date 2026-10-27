/* ================================================================
   CONFIGURATION, METRIC NAMES & STYLING MAPS
   ================================================================ */

export const CFG = {
  /** One document per site: site_id, name, address, city, state, zip, lat, lon. */
  sitesIndex: 'gensco-sites',
  /** Log documents: @timestamp, site_id, severity, service, message. */
  logsIndex: 'gensco-logs',
  logsTimeField: '@timestamp',
  logsPageSize: 200,
  mapCenter: [-120.5, 46.5] as [number, number],
  mapZoom: 5,
  tileUrl: 'https://tiles.maps.opensearch.org/tiles/{z}/{x}/{y}.png',
  /** Resource usage at or above this marks a site as Warning. */
  resourceWarnPct: 80,
  /** Resource usage at or above this marks registers as down. */
  resourceDownPct: 90,
  /** Window for "latest value" lookups; large enough that seeded (non-live) demo samples still count. */
  instantLookback: '6h',
};

/** VictoriaMetrics series read by the plugin (all carry a `site` label). */
export const METRICS = {
  siteUp: 'gensco_site_up', // 1 = reporting/healthy host, 0 = down
  serviceUp: 'gensco_service_up', // {service="..."} 1 = running, 0 = stopped
  cpu: 'gensco_cpu_percent',
  memory: 'gensco_memory_percent',
};

/** Register-level VictoriaMetrics series for the Xstore POS dashboard. */
export const POS_METRICS = {
  processId: 'xstore_pos_Process_id_ratio',
  cpu: 'xstore_pos_cpu_usage_percent',
  diskFree: 'xstore_pos_disk_free_bytes',
  diskUsage: 'xstore_pos_disk_usage_percent',
  memoryAvailable: 'xstore_pos_memory_available_bytes',
  memoryUsage: 'xstore_pos_memory_usage_percent',
  service: 'xstore_pos_service_ratio',
  uptime: 'xstore_pos_uptime_seconds',
};

/** Map-pin / badge colors per site status. */
export const STATUS_COLORS: { [key: string]: string } = {
  Up: '#4f9d69',
  Down: '#ef4444',
  Warning: '#e0a030',
  'Registers Down': '#ec4899',
  'EOD / Maintenance': '#a855f7',
  NoStatus: '#94a3b8',
};

export const getColor = (s: string) => STATUS_COLORS[s] || STATUS_COLORS.NoStatus;

export const displayLabel = (s: string) => {
  if (s === 'NoStatus') return 'No Status';
  if (s === 'Down') return 'App Services Down';
  if (s === 'Warning') return 'Attention Required';
  return s;
};

export const svcColor = (up: boolean | null) =>
  up === true ? '#22c55e' : up === false ? '#ef4444' : '#9ca3af';

export const SEVERITY_COLORS: { [key: string]: string } = {
  ERROR: '#ef4444',
  WARN: '#e0a030',
  INFO: '#60a5fa',
  DEBUG: '#94a3b8',
};

export const pinSvg = (color: string, size = 40) =>
  [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="-10 -10 20 20" style="overflow:visible">`,
    `<path d="M0,-10 C-4,-10 -7,-7 -7,-3 C-7,3 0,10 0,10 S7,3 7,-3 C7,-7 4,-10 0,-10 Z M0,-5 C-1.5,-5 -3,-3.5 -3,-2 C-3,-0.5 -1.5,1 0,1 C1.5,1 3,-0.5 3,-2 C3,-3.5 1.5,-5 0,-5 Z" fill="${color}" fill-rule="evenodd" stroke="white" stroke-width="0.8"/>`,
    '</svg>',
  ].join('');

export const escapeHtml = (value: string) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
