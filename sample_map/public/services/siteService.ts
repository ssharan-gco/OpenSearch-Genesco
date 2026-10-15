/* ================================================================
   SITE LIST + STATUS (MAP VIEW)
   Locations come from OpenSearch, live health from VictoriaMetrics.
   ================================================================ */
import { CFG, METRICS } from '../lib/constants';
import { DASHBOARD_DEMO_SITE, SAMPLE_SITES, sampleHealth } from '../lib/sampleData';
import { OsSearch, SiteHealth, SiteLocation, SiteRecord, SiteStatus } from '../lib/types';
import { instantQuery } from './victoriaMetrics';

/** Reads site documents. Falls back to SAMPLE_SITES when the index is missing or empty. */
export const fetchSiteLocations = async (
  osSearch: OsSearch
): Promise<{ sites: SiteLocation[]; sample: boolean }> => {
  try {
    const data = await osSearch(CFG.sitesIndex, { size: 10000, query: { match_all: {} } });
    const sites: SiteLocation[] = (data.hits?.hits || [])
      .map((h: any) => h._source || {})
      .map((s: any) => ({
        siteId: String(s.site_id ?? ''),
        name: String(s.name ?? `Site #${s.site_id}`),
        address: String(s.address ?? ''),
        city: String(s.city ?? ''),
        state: String(s.state ?? ''),
        zip: String(s.zip ?? ''),
        lat: Number(s.lat),
        lon: Number(s.lon),
      }))
      .filter((s: SiteLocation) => s.siteId && Number.isFinite(s.lat) && Number.isFinite(s.lon));
    if (sites.length > 0) {
      const siteIds = new Set(sites.map((site) => site.siteId));
      const missingSampleSites = SAMPLE_SITES.filter((site) => !siteIds.has(site.siteId));
      return { sites: [...sites, ...missingSampleSites], sample: missingSampleSites.length > 0 };
    }
  } catch (e) {
    console.warn(`[sample_map] ${CFG.sitesIndex} not readable, using sample sites`, e);
  }
  return { sites: SAMPLE_SITES, sample: true };
};

/**
 * Latest health for every site in 4 instant queries (one per metric).
 * Returns an empty map when VictoriaMetrics has no `gensco_*` series.
 */
export const fetchAllSiteHealth = async (): Promise<Map<string, SiteHealth>> => {
  const latest = (metric: string) => instantQuery(`last_over_time(${metric}[${CFG.instantLookback}])`);
  const [upRows, svcRows, cpuRows, memRows] = await Promise.all([
    latest(METRICS.siteUp),
    latest(METRICS.serviceUp),
    latest(METRICS.cpu),
    latest(METRICS.memory),
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
  return map;
};

/** Host outage takes precedence over maintenance, register outage, and resource warnings. */
export const deriveStatus = (h: SiteHealth | undefined): SiteStatus => {
  if (!h || h.up === null) return 'NoStatus';
  if (!h.up) return 'Down';
  if (h.maintenance) return 'EOD / Maintenance';
  if (h.registersDown) return 'Registers Down';
  const anyServiceDown = Object.values(h.services).some((v) => !v);
  const hot = (h.cpu ?? 0) >= CFG.resourceWarnPct || (h.memory ?? 0) >= CFG.resourceWarnPct;
  return anyServiceDown || hot ? 'Warning' : 'Up';
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
    return { ...s, health: h, status: deriveStatus(h) };
  });
  return { records, sampleMetrics };
};
