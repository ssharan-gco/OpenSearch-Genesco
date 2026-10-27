/* ================================================================
   VICTORIAMETRICS (Prometheus API) HELPERS
   ================================================================ */
import { vmFetch, vmUrl } from '../lib/envConfig';
import { MetricPoint, TimeWindow } from '../lib/types';

export interface VmRow {
  metric: { [label: string]: string };
  value?: [number, string | null];
  values?: Array<[number, string | null]>;
}

const readResult = async (res: Response | null): Promise<VmRow[]> => {
  if (!res || !res.ok) return [];
  const json = await res.json().catch(() => null);
  return json?.status === 'success' ? json.data?.result || [] : [];
};

const readRequiredResult = async (res: Response | null): Promise<VmRow[]> => {
  if (!res) {
    throw new Error('Could not connect to VictoriaMetrics.');
  }
  if (!res.ok) {
    throw new Error(`VictoriaMetrics returned HTTP ${res.status}.`);
  }

  const json = await res.json();
  if (json?.status !== 'success') {
    throw new Error(json?.error || 'VictoriaMetrics query failed.');
  }
  return json.data?.result || [];
};

/** Latest value per series. Returns [] on any failure. */
export const instantQuery = async (query: string): Promise<VmRow[]> =>
  readResult(await vmFetch(vmUrl('query', { query })));

/** Latest value per series; throws when VictoriaMetrics cannot serve the query. */
export const instantQueryRequired = async (query: string): Promise<VmRow[]> =>
  readRequiredResult(await vmFetch(vmUrl('query', { query })));

/** Instant query evaluated at the selected range end. */
export const instantQueryAt = async (query: string, timeMs: number): Promise<VmRow[]> =>
  readRequiredResult(
    await vmFetch(vmUrl('query', { query, time: Math.floor(timeMs / 1000) }))
  );

/** Range query over the window. Returns [] on any failure. */
export const rangeQuery = async (
  query: string,
  win: TimeWindow,
  stepSec: number
): Promise<VmRow[]> =>
  readResult(
    await vmFetch(
      vmUrl('query_range', {
        query,
        start: Math.floor(win.fromMs / 1000),
        end: Math.floor(win.toMs / 1000),
        step: `${stepSec}s`,
      })
    )
  );

/** Range query; throws when VictoriaMetrics cannot serve the query. */
export const rangeQueryRequired = async (
  query: string,
  win: TimeWindow,
  stepSec: number
): Promise<VmRow[]> =>
  readRequiredResult(
    await vmFetch(
      vmUrl('query_range', {
        query,
        start: Math.floor(win.fromMs / 1000),
        end: Math.floor(win.toMs / 1000),
        step: `${stepSec}s`,
      })
    )
  );

/** First series of a range result as chart points. */
export const toPoints = (rows: VmRow[]): MetricPoint[] =>
  (rows[0]?.values || [])
    .filter((point): point is [number, string] => point[1] !== null)
    .map(([ts, v]) => ({ t: ts * 1000, v: Number(v) }));
