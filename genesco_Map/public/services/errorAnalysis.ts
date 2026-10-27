import { OsSearch, TimeWindow } from '../lib/types';

/**
 * The OpenSearch mapping has body.keyword ignore_above: 256. Many Java exceptions
 * contain long stack traces, so a terms aggregation on body.keyword silently
 * omits those errors. Read the matching ERROR events instead and group by the
 * first message line. Cap the request volume and disclose partial results.
 * This is read-only: no OpenSearch index or document is changed.
 */
const INDEX = 'xstore-register-logs-*';
const PAGE_SIZE = 500;
const MAX_EVENTS = 5000;

export interface ErrorOccurrence {
  message: string;
  count: number;
  registerIds: string[];
}

export interface StoreErrorAnalysis {
  errors: ErrorOccurrence[];
  processedEvents: number;
  matchingEvents: number | null;
  isPartial: boolean;
}

interface MutableErrorGroup {
  message: string;
  count: number;
  registerIds: Set<string>;
}

const getSourceValue = (source: Record<string, unknown>, field: string): unknown => {
  if (source[field] !== undefined) return source[field];
  return field.split('.').reduce<unknown>((value, segment) => {
    if (value === null || typeof value !== 'object') return undefined;
    return (value as Record<string, unknown>)[segment];
  }, source);
};

/** Ignore stack-trace detail and variable thread suffixes; group by the error headline. */
const errorHeadline = (raw: unknown): string => {
  if (typeof raw !== 'string' || !raw.trim()) return '(Error message unavailable)';
  const firstLine = raw.trim().split(/\r?\n/, 1)[0];
  return firstLine.replace(/\s+::\s+.*$/, '').trim() || '(Error message unavailable)';
};

const getRegisterId = (source: Record<string, unknown>): string | null => {
  const raw =
    getSourceValue(source, 'log.attributes.register') ??
    getSourceValue(source, 'log.attributes.register_id') ??
    getSourceValue(source, 'register');
  return typeof raw === 'string' || typeof raw === 'number' ? String(raw).trim() || null : null;
};

const totalHits = (response: any): number | null => {
  const total = response?.hits?.total;
  const count = typeof total === 'number' ? total : total?.value;
  return typeof count === 'number' && Number.isFinite(count) && count >= 0 ? count : null;
};

/**
 * Get the 10 most repeated error headlines for a selected store and time range.
 * At most 5000 of the newest matching errors are read, and any truncation is
 * reported to the user instead of presenting sample counts as exact totals.
 */
export const fetchStoreErrorAnalysis = async (
  osSearch: OsSearch,
  storeId: string,
  window: TimeWindow,
  shouldContinue: () => boolean = () => true
): Promise<StoreErrorAnalysis> => {
  const groups = new Map<string, MutableErrorGroup>();
  let processedEvents = 0;
  let matchingEvents: number | null = null;

  while (processedEvents < MAX_EVENTS && shouldContinue()) {
    const size = Math.min(PAGE_SIZE, MAX_EVENTS - processedEvents);
    const response = await osSearch(INDEX, {
      from: processedEvents,
      size,
      track_total_hits: true,
      _source: [
        'body',
        'log.attributes.register',
        'log.attributes.register_id',
        'register',
      ],
      query: {
        bool: {
          filter: [
            { term: { 'log.attributes.store.keyword': storeId } },
            {
              range: {
                time: {
                  gte: new Date(window.fromMs).toISOString(),
                  lte: new Date(window.toMs).toISOString(),
                },
              },
            },
            {
              bool: {
                should: [
                  { range: { severityNumber: { gte: 17 } } },
                  { terms: { 'severityText.keyword': ['ERROR', 'FATAL', 'CRITICAL'] } },
                  { terms: { 'log.attributes.level.keyword': ['ERROR', 'FATAL', 'CRITICAL'] } },
                ],
                minimum_should_match: 1,
              },
            },
          ],
        },
      },
      sort: [{ time: { order: 'desc' } }],
    });

    const hits: unknown = response?.hits?.hits;
    if (!Array.isArray(hits)) {
      throw new Error('Unexpected response from the Xstore register logs index');
    }
    if (matchingEvents === null) matchingEvents = totalHits(response);

    for (const hit of hits) {
      const source = hit?._source;
      if (!source || typeof source !== 'object' || Array.isArray(source)) continue;
      const fields = source as Record<string, unknown>;
      const message = errorHeadline(getSourceValue(fields, 'body'));
      const key = message.toLowerCase();
      const group = groups.get(key) || { message, count: 0, registerIds: new Set<string>() };
      group.count += 1;
      const registerId = getRegisterId(fields);
      if (registerId) group.registerIds.add(registerId);
      groups.set(key, group);
    }

    processedEvents += hits.length;
    if (hits.length < size || (matchingEvents !== null && processedEvents >= matchingEvents)) break;
  }

  return {
    errors: Array.from(groups.values())
      .sort((a, b) => b.count - a.count || a.message.localeCompare(b.message))
      .slice(0, 10)
      .map(({ message, count, registerIds }) => ({
        message,
        count,
        registerIds: Array.from(registerIds).sort((a, b) =>
          a.localeCompare(b, undefined, { numeric: true })
        ),
      })),
    processedEvents,
    matchingEvents,
    isPartial: matchingEvents === null
      ? processedEvents >= MAX_EVENTS
      : processedEvents < matchingEvents,
  };
};
