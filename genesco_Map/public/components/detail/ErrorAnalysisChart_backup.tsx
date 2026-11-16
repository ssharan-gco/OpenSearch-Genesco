import { useEffect, useState } from 'react';
import { OsSearch, TimeWindow } from '../../lib/types';
import { fetchStoreErrorAnalysis, StoreErrorAnalysis } from '../../services/errorAnalysis';

interface ErrorAnalysisChartProps {
  osSearch: OsSearch;
  storeId: string;
  timeWindow: TimeWindow;
  refreshToken: number;
}

interface PieSlice {
  message: string;
  count: number;
  registerIds: string[];
  color: string;
}

const ERROR_COLORS = [
  '#38bdf8', // sky blue
  '#fb7185', // pink
  '#fbbf24', // amber
  '#a78bfa', // violet
  '#34d399', // emerald
  '#fb923c', // orange
  '#22d3ee', // cyan
  '#e879f9', // fuchsia
  '#a3e635', // lime
  '#818cf8', // indigo
];
const OTHER_COLOR = '#64748b';
const PIE_CENTER = 160;
const PIE_RADIUS = 136;

const slicePath = (startFraction: number, endFraction: number): string => {
  const startAngle = startFraction * Math.PI * 2 - Math.PI / 2;
  const endAngle = endFraction * Math.PI * 2 - Math.PI / 2;
  const startX = PIE_CENTER + PIE_RADIUS * Math.cos(startAngle);
  const startY = PIE_CENTER + PIE_RADIUS * Math.sin(startAngle);
  const endX = PIE_CENTER + PIE_RADIUS * Math.cos(endAngle);
  const endY = PIE_CENTER + PIE_RADIUS * Math.sin(endAngle);
  const largeArc = endFraction - startFraction > 0.5 ? 1 : 0;
  return `M ${PIE_CENTER} ${PIE_CENTER} L ${startX} ${startY} A ${PIE_RADIUS} ${PIE_RADIUS} 0 ${largeArc} 1 ${endX} ${endY} Z`;
};

const percentLabel = (count: number, total: number): string =>
  total > 0 ? `${((count / total) * 100).toFixed(1)}%` : '0.0%';

/** Read-only pie chart of the ten most frequent Xstore error headlines for the selected store/range. */
export const ErrorAnalysisChart = ({
  osSearch,
  storeId,
  timeWindow,
  refreshToken,
}: ErrorAnalysisChartProps) => {
  const [result, setResult] = useState<StoreErrorAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setResult(null);
    setError(null);
    setLoading(true);

    fetchStoreErrorAnalysis(osSearch, storeId, timeWindow, () => active)
      .then((summary) => {
        if (active) setResult(summary);
      })
      .catch((failure: unknown) => {
        if (active) setError(failure instanceof Error ? failure.message : String(failure));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [osSearch, storeId, timeWindow.fromMs, timeWindow.toMs, refreshToken]);

  if (loading) {
    return <div className="store-live-state">Loading OpenSearch error analysis…</div>;
  }
  if (error) {
    return <div className="store-live-state down-text">Unable to load error analysis: {error}</div>;
  }
  if (!result || result.errors.length === 0) {
    return (
      <div className="store-live-state">
        No ERROR, FATAL, or CRITICAL log events found for this store in the selected range.
      </div>
    );
  }

  const scannedLabel = result.processedEvents.toLocaleString();
  const matchedLabel = result.matchingEvents?.toLocaleString();
  const topTenTotal = result.errors.reduce((sum, item) => sum + item.count, 0);
  const otherCount = Math.max(0, result.processedEvents - topTenTotal);
  const slices: PieSlice[] = result.errors.map((item, index) => ({
    message: item.message,
    count: item.count,
    registerIds: item.registerIds,
    color: ERROR_COLORS[index % ERROR_COLORS.length],
  }));
  if (otherCount > 0) {
    slices.push({ message: 'Other errors (outside top 10)', count: otherCount, registerIds: [], color: OTHER_COLOR });
  }
  const totalDisplayed = slices.reduce((sum, item) => sum + item.count, 0);
  let cumulativeCount = 0;

  return (
    <div
      className="store-error-analysis"
      aria-label={`Top error occurrences for store ${storeId}`}
      style={{ padding: '10px 0 2px' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 14,
          fontSize: 12,
        }}
      >
        <strong>Top error messages · Store {storeId}</strong>
        <span style={{ opacity: 0.8 }}>
          {result.isPartial
            ? `Latest ${scannedLabel} of ${matchedLabel || 'more'} errors analyzed`
            : `${scannedLabel} error events analyzed`}
        </span>
      </div>

      {result.isPartial && (
        <div
          role="status"
          style={{
            marginBottom: 14,
            padding: '8px 10px',
            border: '1px solid rgba(234,179,8,0.45)',
            background: 'rgba(234,179,8,0.08)',
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          Large result set: pie-chart proportions and counts cover only the newest {scannedLabel}
          errors, not every error in the selected range.
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '18px 34px' }}>
        <div style={{ width: 'min(100%, 340px)', flex: '0 1 340px', margin: '0 auto' }}>
          <svg
            viewBox="0 0 320 320"
            role="img"
            aria-label={`Pie chart of ${totalDisplayed.toLocaleString()} errors in store ${storeId}; details listed beside the chart`}
            style={{ display: 'block', width: '100%', maxWidth: 340, height: 'auto' }}
          >
            {slices.map((item, index) => {
              const start = cumulativeCount / totalDisplayed;
              cumulativeCount += item.count;
              const end = cumulativeCount / totalDisplayed;
              const portion = end - start;
              const centerAngle = ((start + end) / 2) * Math.PI * 2 - Math.PI / 2;
              const textRadius = PIE_RADIUS * 0.66;
              const textX = PIE_CENTER + textRadius * Math.cos(centerAngle);
              const textY = PIE_CENTER + textRadius * Math.sin(centerAngle);
              const tooltip = `${item.message}: ${item.count.toLocaleString()} occurrences (${percentLabel(item.count, totalDisplayed)})`;
              return (
                <g key={`${item.message}-${index}`}>
                  {portion >= 0.999999 ? (
                    <circle
                      cx={PIE_CENTER}
                      cy={PIE_CENTER}
                      r={PIE_RADIUS}
                      fill={item.color}
                      stroke="#111827"
                      strokeWidth="2"
                    >
                      <title>{tooltip}</title>
                    </circle>
                  ) : (
                    <path
                      d={slicePath(start, end)}
                      fill={item.color}
                      stroke="#111827"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    >
                      <title>{tooltip}</title>
                    </path>
                  )}
                  {portion >= 0.075 && (
                    <text
                      x={textX}
                      y={textY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#0f172a"
                      fontSize="14"
                      fontWeight="700"
                      style={{ pointerEvents: 'none' }}
                    >
                      {Math.round(portion * 100)}%
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div
          aria-label="Error categories and occurrence counts"
          style={{ flex: '1 1 420px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          {slices.map((item, index) => (
            <div
              key={`${item.message}-${index}`}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12 }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  flexShrink: 0,
                  width: 13,
                  height: 13,
                  marginTop: 3,
                  borderRadius: 3,
                  backgroundColor: item.color,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, overflowWrap: 'anywhere' }} title={item.message}>
                  {index + 1}. {item.message}
                </div>
                {item.message !== 'Other errors (outside top 10)' && (
                  <div style={{ marginTop: 3, opacity: 0.72, fontSize: 11 }}>
                    {item.registerIds.length > 0
                      ? `Register${item.registerIds.length > 1 ? 's' : ''}: ${item.registerIds.join(', ')}`
                      : 'Register not provided in log'}
                  </div>
                )}
              </div>
              <div
                style={{ textAlign: 'right', flexShrink: 0, minWidth: 88, fontVariantNumeric: 'tabular-nums' }}
              >
                <strong>{item.count.toLocaleString()}</strong>
                <div style={{ fontSize: 11, opacity: 0.8 }}>{percentLabel(item.count, totalDisplayed)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 18, fontSize: 11, opacity: 0.7 }}>
        Each pie slice represents its share of analyzed error log events. Messages are grouped by
        their first line; stack traces and thread details are excluded from grouping. Counts refer
        to log events, not unique incidents.
      </div>
    </div>
  );
};
