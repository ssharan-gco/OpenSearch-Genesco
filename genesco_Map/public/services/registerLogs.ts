import { OsSearch, TimeWindow } from '../lib/types';

export interface RegisterLogEvent {
  registerId: string;
  timestamp: number;
}

const getSourceValue = (source: Record<string, unknown>, field: string) => {
  const value = source[field];
  if (value !== undefined) return value;
  return field.split('.').reduce<unknown>((current, key) => {
    if (!current || typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[key];
  }, source);
};

const toRegisterId = (value: unknown) => {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const registerId = String(value).trim();
  return registerId || null;
};

export const fetchStoreRegisterLogs = async (
  osSearch: OsSearch,
  storeId: string,
  timeWindow: TimeWindow
): Promise<RegisterLogEvent[]> => {
  const response = await osSearch('xstore-register-logs-*', {
    size: 100,
    query: {
      bool: {
        filter: [
          {
            term: {
              'log.attributes.store': storeId,
            },
          },
          {
            range: {
              time: {
                gte: new Date(timeWindow.fromMs).toISOString(),
                lte: new Date(timeWindow.toMs).toISOString(),
              },
            },
          },
        ],
      },
    },
    sort: [{ time: { order: 'desc' } }],
  });
  const hits: unknown = response?.hits?.hits;
  if (!Array.isArray(hits)) {
    throw new Error('Invalid response from xstore-register-logs index');
  }

  return hits.flatMap((hit: unknown): RegisterLogEvent[] => {
    if (!hit || typeof hit !== 'object' || !('_source' in hit)) return [];
    const source = (hit as { _source?: unknown })._source;
    if (!source || typeof source !== 'object' || Array.isArray(source)) return [];

    const sourceFields = source as Record<string, unknown>;
    const registerId = toRegisterId(
      getSourceValue(sourceFields, 'log.attributes.register') ??
        getSourceValue(sourceFields, 'log.attributes.register_id') ??
        getSourceValue(sourceFields, 'register') ??
        getSourceValue(sourceFields, 'register_id')
    );
    const rawTimestamp =
      getSourceValue(sourceFields, 'time') ?? getSourceValue(sourceFields, '@timestamp');
    const numericTimestamp =
      typeof rawTimestamp === 'number'
        ? rawTimestamp
        : typeof rawTimestamp === 'string' && rawTimestamp.trim() !== ''
          ? Number(rawTimestamp)
          : NaN;
    const parsedTimestamp = Number.isFinite(numericTimestamp)
      ? numericTimestamp
      : typeof rawTimestamp === 'string'
        ? Date.parse(rawTimestamp)
        : NaN;
    const timestamp =
      Number.isFinite(numericTimestamp) && Math.abs(parsedTimestamp) < 1_000_000_000_000
        ? parsedTimestamp * 1000
        : parsedTimestamp;

    return registerId && Number.isFinite(timestamp) ? [{ registerId, timestamp }] : [];
  });
};
