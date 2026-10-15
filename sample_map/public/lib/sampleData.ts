/* ================================================================
   BUILT-IN SAMPLE DATA
   Used only when the real sources return nothing (index missing,
   VictoriaMetrics unreachable / no series), so the demo always renders.
   Keep SAMPLE_SITES in sync with sample-data/gensco-sites.json.
   ================================================================ */
import { CFG } from './constants';
import { LogRecord, MetricPoint, SiteHealth, SiteLocation, TimeWindow } from './types';

const SAMPLE_DOWN_SITE_IDS = new Set(['0340', '1040']);
const SAMPLE_REGISTERS_DOWN_SITE_IDS = new Set(['1468']);
const SAMPLE_WARNING_SITE_IDS = new Set(['0303', '1005', '1141']);
const SAMPLE_MAINTENANCE_SITE_IDS = new Set(['0096', '1250', '1493', '1665', '1690']);

export const DASHBOARD_DEMO_SITE: SiteLocation = {
  siteId: '9001',
  name: 'Dashboard Demo Store #9001 - Tacoma',
  address: '900 Dashboard Demo Way',
  city: 'Tacoma',
  state: 'WA',
  zip: '98402',
  lat: 47.245,
  lon: -122.43,
};

export const SAMPLE_SITES: SiteLocation[] = [
  {
    "siteId": "0096",
    "name": "Store #0096 - Seattle (DEMO)",
    "address": "Demo location - not a real store address",
    "city": "Seattle",
    "state": "WA",
    "zip": "98101",
    "lat": 47.6062,
    "lon": -122.3321
  },
  {
    "siteId": "0303",
    "name": "Store #0303 - Portland (DEMO)",
    "address": "Demo location - not a real store address",
    "city": "Portland",
    "state": "OR",
    "zip": "97204",
    "lat": 45.5152,
    "lon": -122.6784
  },
  {
    "siteId": "0340",
    "name": "Store #0340 - San Francisco (DEMO)",
    "address": "Demo location - not a real store address",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94103",
    "lat": 37.7749,
    "lon": -122.4194
  },
  {
    "siteId": "1005",
    "name": "Store #1005 - Los Angeles (DEMO)",
    "address": "Demo location - not a real store address",
    "city": "Los Angeles",
    "state": "CA",
    "zip": "90012",
    "lat": 34.0522,
    "lon": -118.2437
  },
  {
    "siteId": "1040",
    "name": "Store #1040 - San Diego (DEMO)",
    "address": "Demo location - not a real store address",
    "city": "San Diego",
    "state": "CA",
    "zip": "92101",
    "lat": 32.7157,
    "lon": -117.1611
  },
  {
    "siteId": "1141",
    "name": "Store #1141 - Phoenix (DEMO)",
    "address": "Demo location - not a real store address",
    "city": "Phoenix",
    "state": "AZ",
    "zip": "85004",
    "lat": 33.4484,
    "lon": -112.074
  },
  {
    "siteId": "1250",
    "name": "Store #1250 - Las Vegas (DEMO)",
    "address": "Demo location - not a real store address",
    "city": "Las Vegas",
    "state": "NV",
    "zip": "89101",
    "lat": 36.1699,
    "lon": -115.1398
  },
  {
    "siteId": "1461",
    "name": "Store #1461 - Salt Lake City (DEMO)",
    "address": "Demo location - not a real store address",
    "city": "Salt Lake City",
    "state": "UT",
    "zip": "84101",
    "lat": 40.7608,
    "lon": -111.891
  },
  {
    "siteId": "1468",
    "name": "Store #1468 - Denver (DEMO)",
    "address": "Demo location - not a real store address",
    "city": "Denver",
    "state": "CO",
    "zip": "80202",
    "lat": 39.7392,
    "lon": -104.9903
  },
  {
    "siteId": "1493",
    "name": "Store #1493 - Albuquerque (DEMO)",
    "address": "Demo location - not a real store address",
    "city": "Albuquerque",
    "state": "NM",
    "zip": "87102",
    "lat": 35.0844,
    "lon": -106.6504
  },
  {
    "siteId": "1508",
    "name": "Store #1508 - Boise (DEMO)",
    "address": "Demo location - not a real store address",
    "city": "Boise",
    "state": "ID",
    "zip": "83702",
    "lat": 43.615,
    "lon": -116.2023
  },
  {
    "siteId": "1665",
    "name": "Store #1665 - Billings (DEMO)",
    "address": "Demo location - not a real store address",
    "city": "Billings",
    "state": "MT",
    "zip": "59101",
    "lat": 45.7833,
    "lon": -108.5007
  },
  {
    "siteId": "1690",
    "name": "Store #1690 - Cheyenne (DEMO)",
    "address": "Demo location - not a real store address",
    "city": "Cheyenne",
    "state": "WY",
    "zip": "82001",
    "lat": 41.14,
    "lon": -104.8202
  },
  {
    "siteId": "1715",
    "name": "Store #1715 - Dallas (DEMO)",
    "address": "Demo location - not a real store address",
    "city": "Dallas",
    "state": "TX",
    "zip": "75201",
    "lat": 32.7767,
    "lon": -96.797
  },
  {
    "siteId": "1726",
    "name": "Store #1726 - Austin (DEMO)",
    "address": "Demo location - not a real store address",
    "city": "Austin",
    "state": "TX",
    "zip": "78701",
    "lat": 30.2672,
    "lon": -97.7431
  },
  {
    "siteId": "1733",
    "name": "Store #1733 - Houston (DEMO)",
    "address": "Demo location - not a real store address",
    "city": "Houston",
    "state": "TX",
    "zip": "77002",
    "lat": 29.7604,
    "lon": -95.3698
  },
  {
    "siteId": "1804",
    "name": "Store #1804 - Oklahoma City (DEMO)",
    "address": "Demo location - not a real store address",
    "city": "Oklahoma City",
    "state": "OK",
    "zip": "73102",
    "lat": 35.4676,
    "lon": -97.5164
  },
  {
    "siteId": "1855",
    "name": "Store #1855 - Kansas City (DEMO)",
    "address": "Demo location - not a real store address",
    "city": "Kansas City",
    "state": "MO",
    "zip": "64106",
    "lat": 39.0997,
    "lon": -94.5786
  },
  {
    "siteId": "1885",
    "name": "Store #1885 - Omaha (DEMO)",
    "address": "Demo location - not a real store address",
    "city": "Omaha",
    "state": "NE",
    "zip": "68102",
    "lat": 41.2565,
    "lon": -95.9345
  },
  {
    "siteId": "2001",
    "name": "Store #2001 - Minneapolis (DEMO)",
    "address": "Demo location - not a real store address",
    "city": "Minneapolis",
    "state": "MN",
    "zip": "55401",
    "lat": 44.9778,
    "lon": -93.265
  },
  {
    "siteId": "2079",
    "name": "Store #2079 - Des Moines (DEMO)",
    "address": "Demo location - not a real store address",
    "city": "Des Moines",
    "state": "IA",
    "zip": "50309",
    "lat": 41.5868,
    "lon": -93.625
  },
  {
    "siteId": "2088",
    "name": "Store #2088 - Chicago (DEMO)",
    "address": "Demo location - not a real store address",
    "city": "Chicago",
    "state": "IL",
    "zip": "60601",
    "lat": 41.8781,
    "lon": -87.6298
  },
  {
    "siteId": "3501",
    "name": "Store #3501 - Indianapolis (DEMO)",
    "address": "Demo location - not a real store address",
    "city": "Indianapolis",
    "state": "IN",
    "zip": "46204",
    "lat": 39.7684,
    "lon": -86.1581
  },
  {
    "siteId": "5004",
    "name": "Store #5004 - Detroit (DEMO)",
    "address": "Demo location - not a real store address",
    "city": "Detroit",
    "state": "MI",
    "zip": "48226",
    "lat": 42.3314,
    "lon": -83.0458
  },
  {
    "siteId": "5012",
    "name": "Store #5012 - Columbus (DEMO)",
    "address": "Demo location - not a real store address",
    "city": "Columbus",
    "state": "OH",
    "zip": "43215",
    "lat": 39.9612,
    "lon": -82.9988
  },
  {
    "siteId": "6200",
    "name": "Store #6200 - Nashville (DEMO)",
    "address": "Demo location - not a real store address",
    "city": "Nashville",
    "state": "TN",
    "zip": "37219",
    "lat": 36.1627,
    "lon": -86.7816
  },
  {
    "siteId": "6237",
    "name": "Store #6237 - Louisville (DEMO)",
    "address": "Demo location - not a real store address",
    "city": "Louisville",
    "state": "KY",
    "zip": "40202",
    "lat": 38.2527,
    "lon": -85.7585
  },
  {
    "siteId": "6247",
    "name": "Store #6247 - Birmingham (DEMO)",
    "address": "Demo location - not a real store address",
    "city": "Birmingham",
    "state": "AL",
    "zip": "35203",
    "lat": 33.5186,
    "lon": -86.8104
  },
  {
    "siteId": "6270",
    "name": "Store #6270 - Atlanta (DEMO)",
    "address": "Demo location - not a real store address",
    "city": "Atlanta",
    "state": "GA",
    "zip": "30303",
    "lat": 33.749,
    "lon": -84.388
  },
  {
    "siteId": "7140",
    "name": "Store #7140 - Jacksonville (DEMO)",
    "address": "Demo location - not a real store address",
    "city": "Jacksonville",
    "state": "FL",
    "zip": "32202",
    "lat": 30.3322,
    "lon": -81.6557
  }
];

export const SAMPLE_SERVICES = ['pos', 'inventory', 'sync', 'printer'];

/** Deterministic 0..1 from a string seed. */
const hash01 = (seed: string) => {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619) >>> 0;
  return (h % 10000) / 10000;
};

/** Sample map health includes demo examples for each status category. */
export const sampleHealth = (siteId: string): SiteHealth => {
  const down = SAMPLE_DOWN_SITE_IDS.has(siteId);
  const registersDown = SAMPLE_REGISTERS_DOWN_SITE_IDS.has(siteId);
  const warning = SAMPLE_WARNING_SITE_IDS.has(siteId);
  const services: { [k: string]: boolean } = {};
  SAMPLE_SERVICES.forEach((svc) => {
    services[svc] = !down && !(warning && svc === 'printer');
  });
  return {
    up: !down,
    services,
    cpu: down ? null : warning ? 94 : Math.round(20 + hash01(siteId + 'cpu') * 40),
    memory: down ? null : Math.round(35 + hash01(siteId + 'mem') * 35),
    registersDown,
    maintenance: SAMPLE_MAINTENANCE_SITE_IDS.has(siteId),
  };
};

/** Smooth-ish synthetic series between `base` and `base+amp`. */
export const sampleSeries = (
  siteId: string,
  metric: string,
  win: TimeWindow,
  stepSec: number,
  base: number,
  amp: number
): MetricPoint[] => {
  if (SAMPLE_DOWN_SITE_IDS.has(siteId)) return [];
  const seed = hash01(siteId + metric) * 10;
  const points: MetricPoint[] = [];
  for (let t = win.fromMs; t <= win.toMs; t += stepSec * 1000) {
    const x = t / 600000 + seed;
    const v = base + amp * (0.5 + 0.35 * Math.sin(x) + 0.15 * Math.sin(x * 3.7));
    points.push({ t, v: Math.round(v * 10) / 10 });
  }
  return points;
};

const SAMPLE_MESSAGES: Array<[string, string, string]> = [
  ['INFO', 'pos', 'Transaction batch uploaded successfully'],
  ['INFO', 'sync', 'Inventory sync completed in 4.2s'],
  ['WARN', 'printer', 'Label printer paper low'],
  ['ERROR', 'printer', 'Label printer not responding (timeout after 30s)'],
  ['INFO', 'inventory', 'Stock levels refreshed for 1,284 SKUs'],
  ['WARN', 'sync', 'Sync retry 1/3 - upstream returned 503'],
  ['ERROR', 'pos', 'Payment terminal handshake failed'],
  ['DEBUG', 'inventory', 'Cache warm-up finished'],
];

/** ~40 synthetic log lines spread across the window, newest first. */
export const sampleLogs = (siteId: string, win: TimeWindow): LogRecord[] => {
  const count = 40;
  const span = Math.max(1, win.toMs - win.fromMs);
  const logs: LogRecord[] = [];
  for (let i = 0; i < count; i++) {
    const pick = Math.floor(hash01(`${siteId}-${i}`) * SAMPLE_MESSAGES.length);
    const [severity, service, message] = SAMPLE_MESSAGES[pick];
    logs.push({
      time: new Date(win.toMs - Math.floor((i / count) * span)).toISOString(),
      severity,
      service,
      message,
    });
  }
  return logs.slice(0, CFG.logsPageSize);
};
