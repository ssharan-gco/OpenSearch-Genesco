import { CoreStart } from '../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';

export type SiteStatus =
  'Up' | 'Down' | 'Warning' | 'Registers Down' | 'EOD / Maintenance' | 'NoStatus';
export type StatusFilter = 'All' | SiteStatus;

/** Static site info (from the sites index). */
export interface SiteLocation {
  siteId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lon: number;
}

/** Latest health snapshot for a site (from VictoriaMetrics instant queries). */
export interface SiteHealth {
  up: boolean | null;
  services: { [service: string]: boolean };
  cpu: number | null;
  memory: number | null;
  disk?: number | null;
  registersDown?: boolean;
  registersDegraded?: boolean;
  maintenance?: boolean;
}

export interface SiteRecord extends SiteLocation {
  status: SiteStatus;
  filterStatuses: SiteStatus[];
  health: SiteHealth;
}

export interface MetricPoint {
  t: number; // epoch ms
  v: number;
}

export interface LogRecord {
  time: string;
  severity: string;
  service: string;
  message: string;
}

export interface SiteDetail {
  cpuSeries: MetricPoint[];
  memorySeries: MetricPoint[];
  logs: LogRecord[];
  logCounts: { [severity: string]: number };
  /** True when that part of the detail came from built-in sample data. */
  sample: { metrics: boolean; logs: boolean };
}

export interface TimeWindow {
  fromMs: number;
  toMs: number;
}

export type OsSearch = (index: string, queryBody: any) => Promise<any>;

export interface GenscoAppDeps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
}
