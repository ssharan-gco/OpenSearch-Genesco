/* ================================================================
   SITE DETAIL: metrics history (VictoriaMetrics) + logs (OpenSearch)
   ================================================================ */
import { CFG, METRICS } from '../lib/constants';
import { sampleLogs, sampleSeries } from '../lib/sampleData';
import { stepFor } from '../lib/timeRange';
import { LogRecord, OsSearch, SiteDetail, TimeWindow } from '../lib/types';
import { rangeQuery, toPoints } from './victoriaMetrics';

/** Latest log lines (newest first) for a site in the window. */
export const fetchSiteLogs = async (
  osSearch: OsSearch,
  siteId: string,
  win: TimeWindow
): Promise<{ logs: LogRecord[] } | null> => {
  try {
    const data = await osSearch(CFG.logsIndex, {
      size: CFG.logsPageSize,
      sort: [{ [CFG.logsTimeField]: { order: 'desc' } }],
      _source: [CFG.logsTimeField, 'severity', 'service', 'message'],
      query: {
        bool: {
          filter: [
            { match: { site_id: siteId } },
            {
              range: {
                [CFG.logsTimeField]: {
                  gte: new Date(win.fromMs).toISOString(),
                  lte: new Date(win.toMs).toISOString(),
                },
              },
            },
          ],
        },
      },
    });
    const logs: LogRecord[] = (data.hits?.hits || []).map((h: any) => ({
      time: h._source?.[CFG.logsTimeField] || '',
      severity: String(h._source?.severity || 'INFO').toUpperCase(),
      service: String(h._source?.service || ''),
      message: String(h._source?.message || ''),
    }));
    return { logs };
  } catch (e) {
    console.warn(`[sample_map] ${CFG.logsIndex} not readable`, e);
    return null;
  }
};

const countBySeverity = (logs: LogRecord[]) =>
  logs.reduce((acc, l) => ({ ...acc, [l.severity]: (acc[l.severity] || 0) + 1 }), {} as { [k: string]: number });

/** Loads everything the detail panel shows; each source falls back to sample data independently. */
export const fetchSiteDetail = async (
  osSearch: OsSearch,
  siteId: string,
  win: TimeWindow,
  useSampleMetrics: boolean
): Promise<SiteDetail> => {
  const step = stepFor(win);
  const sel = `{site="${siteId.replace(/"/g, '')}"}`;

  const [cpuRows, memRows, logResult] = await Promise.all([
    useSampleMetrics ? Promise.resolve([]) : rangeQuery(`${METRICS.cpu}${sel}`, win, step),
    useSampleMetrics ? Promise.resolve([]) : rangeQuery(`${METRICS.memory}${sel}`, win, step),
    fetchSiteLogs(osSearch, siteId, win),
  ]);

  const logsAreSample = !logResult || logResult.logs.length === 0;
  const logs = logsAreSample ? sampleLogs(siteId, win) : logResult!.logs;

  return {
    cpuSeries: useSampleMetrics ? sampleSeries(siteId, 'cpu', win, step, 20, 45) : toPoints(cpuRows),
    memorySeries: useSampleMetrics ? sampleSeries(siteId, 'mem', win, step, 40, 30) : toPoints(memRows),
    logs,
    logCounts: countBySeverity(logs),
    sample: { metrics: useSampleMetrics, logs: logsAreSample },
  };
};
