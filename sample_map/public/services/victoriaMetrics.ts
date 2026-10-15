/* ================================================================
   VICTORIAMETRICS (Prometheus API) HELPERS
   ================================================================ */
import { vmFetch, vmUrl } from '../lib/envConfig';
import { MetricPoint, TimeWindow } from '../lib/types';

export interface VmRow {
  metric: { [label: string]: string };
  value?: [number, string];
  values?: Array<[number, string]>;
}

const readResult = async (res: Response | null): Promise<VmRow[]> => {
  if (!res || !res.ok) return [];
  const json = await res.json().catch(() => null);
  return json?.status === 'success' ? json.data?.result || [] : [];
};

/** Latest value per series. Returns [] on any failure. */
export const instantQuery = async (query: string): Promise<VmRow[]> =>
  readResult(await vmFetch(vmUrl('query', { query })));

/** Range query over the window. Returns [] on any failure. */
export const rangeQuery = async (query: string, win: TimeWindow, stepSec: number): Promise<VmRow[]> =>
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

/** First series of a range result as chart points. */
export const toPoints = (rows: VmRow[]): MetricPoint[] =>
  (rows[0]?.values || []).map(([ts, v]) => ({ t: ts * 1000, v: Number(v) }));
