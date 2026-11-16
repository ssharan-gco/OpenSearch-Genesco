/* ================================================================
   SITE LIST + STATUS (MAP VIEW)
   Locations come from OpenSearch, live health from VictoriaMetrics.
   ================================================================ */
import { CFG, METRICS } from '../lib/constants';
import { BrandCode, getBrandCode } from '../lib/brands';
import { DASHBOARD_DEMO_SITE, sampleHealth } from '../lib/sampleData';
import { ACTIVE_SITES } from '../lib/activeStores';
import { normalizeUsState, UsStateName } from '../lib/us_states';
import { getUsStateRegion, UsRegionName } from '../lib/us_regions';
import {
  OsSearch,
  SiteHealth,
  SiteLocation,
  SiteRecord,
  SiteStatus,
} from '../lib/types';
import { fetchAllStoreHealth } from './registerMetrics';
import { instantQuery } from './victoriaMetrics';

export const getSiteFilterCounts = (
  sites: SiteRecord[],
  selectedBrands: ReadonlySet<BrandCode>,
  search: string,
  stateFilter: UsStateName | null = null,
  regionFilter: UsRegionName | null = null
): { counts: { [key: string]: number }; totalSites: number } => {
  const counts: { [key: string]: number } = {};
  const term = search.trim().toLowerCase();
  let totalSites = 0;

  sites.forEach((site) => {
    const brandCode = getBrandCode(site);
    if (
      (selectedBrands.size > 0 && (brandCode === null || !selectedBrands.has(brandCode))) ||
      (stateFilter !== null && normalizeUsState(site.state) !== stateFilter) ||
      (regionFilter !== null && getUsStateRegion(site.state) !== regionFilter) ||
      (term !== '' &&
        !site.siteId.toLowerCase().includes(term) &&
        !site.city.toLowerCase().includes(term))
    ) {
      return;
    }

    totalSites += 1;
    site.filterStatuses.forEach((status: SiteStatus) => {
      counts[status] = (counts[status] || 0) + 1;
    });
  });

  return { counts, totalSites };
};

/** The Active Store Excel is authoritative for both IT and USERS map locations.
 * Locations remain available even when an OpenSearch telemetry index is empty.
 * The existing live health/metric loading and status derivation are not changed.
 */
export const fetchSiteLocations = async (
  _osSearch: OsSearch
): Promise<{ sites: SiteLocation[]; sample: boolean }> => ({
  sites: ACTIVE_SITES,
  sample: false,
});

/**
 * Latest health for every site in 4 instant queries (one per metric).
 * Returns an empty map when VictoriaMetrics has no `gensco_*` series.
 */
export const fetchAllSiteHealth = async (): Promise<Map<string, SiteHealth>> => {
  const latest = (metric: string) =>
    instantQuery(`last_over_time(${metric}[${CFG.instantLookback}])`);
  const [upRows, svcRows, cpuRows, memRows, storeHealth] = await Promise.all([
    latest(METRICS.siteUp),
    latest(METRICS.serviceUp),
    latest(METRICS.cpu),
    latest(METRICS.memory),
    fetchAllStoreHealth(),
  ]);

  const map = new Map<string, SiteHealth>();
  const get = (site: string) => {
    if (!map.has(site)) map.set(site, { up: null, services: {}, cpu: null, memory: null });
    return map.get(site)!;
  };

  upRows.forEach((r) => r.metric.site && (get(r.metric.site).up = Number(r.value?.[1]) > 0));
  svcRows.forEach((r) => {
    if (r.metric.site && r.metric.service) {
      get(r.metric.site).services[r.metric.service] = Number(r.value?.[1]) > 0;
    }
  });
  cpuRows.forEach((r) => r.metric.site && (get(r.metric.site).cpu = Number(r.value?.[1])));
  memRows.forEach((r) => r.metric.site && (get(r.metric.site).memory = Number(r.value?.[1])));
  storeHealth.forEach((posHealth, store) => {
    const currentHealth = map.get(store);
    map.set(store, {
      ...posHealth,
      up: currentHealth?.up === false ? false : posHealth.up,
      services: { ...currentHealth?.services, ...posHealth.services },
      cpu: posHealth.cpu ?? currentHealth?.cpu ?? null,
      memory: posHealth.memory ?? currentHealth?.memory ?? null,
      disk: posHealth.disk ?? currentHealth?.disk ?? null,
    });
  });
  return map;
};

/** Host outage takes precedence over maintenance, register outage, and resource status. */
export const deriveStatus = (h: SiteHealth | undefined): SiteStatus => {
  if (!h || h.up === null) return 'NoStatus';
  if (!h.up) return 'Down';
  if (h.maintenance) return 'EOD / Maintenance';
  const registerStatuses = Object.values(h.registerStatuses || {});
  const allRegistersDown =
    registerStatuses.length > 0 && registerStatuses.every((registerStatus) => registerStatus === 'Down');
  const someRegistersDown = registerStatuses.some((registerStatus) => registerStatus === 'Down');
  if (allRegistersDown) return 'Registers Down';
  if (someRegistersDown) return 'Warning';
  const resourceDown =
    (h.cpu ?? 0) >= CFG.resourceDownPct ||
    (h.memory ?? 0) >= CFG.resourceDownPct ||
    (h.disk ?? 0) >= CFG.resourceDownPct;
  if (h.registersDown || resourceDown) {
    return 'Registers Down';
  }
  const anyServiceDown =
    registerStatuses.length === 0 && Object.values(h.services).some((v) => !v);
  if (anyServiceDown) return 'Warning';
  const hot =
    (h.cpu ?? 0) >= CFG.resourceWarnPct ||
    (h.memory ?? 0) >= CFG.resourceWarnPct ||
    (h.disk ?? 0) >= CFG.resourceWarnPct;
  return h.registersDegraded || hot ? 'Warning' : 'Up';
};

export const deriveFilterStatuses = (h: SiteHealth | undefined): SiteStatus[] => {
  const status = deriveStatus(h);
  if (!h || h.up === null || h.maintenance || status === 'NoStatus') {
    return [status];
  }
  const registerStatuses = Object.values(h.registerStatuses || {});
  const anyRegisterDown =
    Boolean(h.registersDown) || registerStatuses.some((registerStatus) => registerStatus === 'Down');
  const allRegistersDown =
    Boolean(h.registersDown) ||
    (registerStatuses.length > 0 &&
      registerStatuses.every((registerStatus) => registerStatus === 'Down'));

  const hasDegradedResource = [h.cpu, h.memory, h.disk].some(
    (value) =>
      value !== null &&
      value !== undefined &&
      value >= CFG.resourceWarnPct &&
      value < CFG.resourceDownPct
  );
  const hasDownResource = [h.cpu, h.memory, h.disk].some(
    (value) => value !== null && value !== undefined && value >= CFG.resourceDownPct
  );

  if (!h.up) {
    const filterStatuses: SiteStatus[] = [status];
    if (hasDegradedResource || hasDownResource || anyRegisterDown) {
      filterStatuses.push('Registers Down');
    }
    if (hasDegradedResource) filterStatuses.push('Warning');
    return filterStatuses;
  }

  if (allRegistersDown) {
    return [status, 'Down'];
  }

  const filterStatuses: SiteStatus[] = [status];
  if (anyRegisterDown && !filterStatuses.includes('Registers Down')) {
    filterStatuses.push('Registers Down');
  }
  if (hasDegradedResource) filterStatuses.push('Warning');
  return Array.from(new Set(filterStatuses));
};

/** Enterprise health ignores resource thresholds and uses operational register/service signals only. */
export const deriveEnterpriseStatus = (h: SiteHealth | undefined): SiteStatus => {
  if (!h || h.up === null) return 'NoStatus';
  if (!h.up) return 'Down';
  if (h.maintenance) return 'EOD / Maintenance';

  const operationalStatuses = h.operationalRegisterStatuses
    ? Object.values(h.operationalRegisterStatuses)
    : Object.values(h.registerStatuses || {}).map((status) =>
        status === 'Down' ? 'Down' : 'Up'
      );
  const allRegistersDown =
    operationalStatuses.length > 0 && operationalStatuses.every((status) => status === 'Down');
  if (allRegistersDown || (!h.operationalRegisterStatuses && h.registersDown)) {
    return 'Down';
  }
  if (
    operationalStatuses.some((status) => status === 'Down') ||
    Object.values(h.services).some((isUp) => !isUp)
  ) {
    return 'Warning';
  }
  return 'Up';
};

export const deriveEnterpriseFilterStatuses = (h: SiteHealth | undefined): SiteStatus[] => {
  const status = deriveEnterpriseStatus(h);
  return [status];
};

/** Joins locations + health. When VM returned nothing at all, sample health is used instead. */
export const buildSiteRecords = (
  sites: SiteLocation[],
  health: Map<string, SiteHealth>
): { records: SiteRecord[]; sampleMetrics: boolean } => {
  const sampleMetrics = health.size === 0;
  const records = sites.map((s) => {
    const liveHealth = health.get(s.siteId);
    const h =
      sampleMetrics || (s.siteId === DASHBOARD_DEMO_SITE.siteId && !liveHealth)
        ? sampleHealth(s.siteId)
        : liveHealth || { up: null, services: {}, cpu: null, memory: null };
    return {
      ...s,
      health: h,
      status: deriveStatus(h),
      filterStatuses: deriveFilterStatuses(h),
    };
  });
  return { records, sampleMetrics };
};

/** Loads the shared location and health data used by both Gensco map applications. */
export const fetchSiteRecords = async (
  osSearch: OsSearch
): Promise<{ records: SiteRecord[]; sampleSites: boolean; sampleMetrics: boolean }> => {
  const [{ sites, sample: sampleSites }, health] = await Promise.all([
    fetchSiteLocations(osSearch),
    fetchAllSiteHealth(),
  ]);
  const { records, sampleMetrics } = buildSiteRecords(sites, health);
  return { records, sampleSites, sampleMetrics };
};
