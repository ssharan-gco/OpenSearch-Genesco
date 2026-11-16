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
  colorName: string;
  labelTextColor: string;
}

// Names are shown in the legend so color is never the only way to identify a slice.
// Ordering follows error occurrence rank, as in the existing component.
const ERROR_COLORS = [
  { name: 'Blue', color: '#3B82F6', text: '#FFFFFF' },
  { name: 'Coral', color: '#F16A78', text: '#FFFFFF' },
  { name: 'Amber', color: '#F2B84B', text: '#172033' },
  { name: 'Violet', color: '#8B5CF6', text: '#FFFFFF' },
  { name: 'Teal', color: '#1DBFA5', text: '#172033' },
  { name: 'Orange', color: '#F97316', text: '#172033' },
  { name: 'Cyan', color: '#22B8CF', text: '#172033' },
  { name: 'Magenta', color: '#D946EF', text: '#FFFFFF' },
  { name: 'Lime', color: '#84CC16', text: '#172033' },
  { name: 'Indigo', color: '#6366F1', text: '#FFFFFF' },
];
const OTHER_COLOR = { name: 'Slate gray', color: '#64748B', text: '#FFFFFF' };
const ERROR_PAGE_SIZE = 5;

// Reduced from 320px / 136 radius to 240px / 104 radius.
const PIE_CENTER = 120;
const PIE_RADIUS = 104;

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

/** Read-only pie chart and paginated error table for the selected store/range. */
export const ErrorAnalysisChart = ({
  osSearch,
  storeId,
  timeWindow,
  refreshToken,
}: ErrorAnalysisChartProps) => {
  const [result, setResult] = useState<StoreErrorAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    let active = true;
    setResult(null);
    setError(null);
    setLoading(true);
    setCurrentPage(0);

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
  const topErrors = result.errors.slice(0, ERROR_PAGE_SIZE);
  const topFiveTotal = topErrors.reduce((sum, item) => sum + item.count, 0);
  const otherCount = Math.max(0, result.processedEvents - topFiveTotal);
  const slices: PieSlice[] = topErrors.map((item, index) => {
    const paletteColor = ERROR_COLORS[index % ERROR_COLORS.length];
    return {
      message: item.message,
      count: item.count,
      registerIds: item.registerIds,
      color: paletteColor.color,
      colorName: paletteColor.name,
      labelTextColor: paletteColor.text,
    };
  });
  if (otherCount > 0) {
    slices.push({
      message: 'Other errors (outside top 5)',
      count: otherCount,
      registerIds: [],
      color: OTHER_COLOR.color,
      colorName: OTHER_COLOR.name,
      labelTextColor: OTHER_COLOR.text,
    });
  }
  const totalDisplayed = slices.reduce((sum, item) => sum + item.count, 0);
  const pageCount = Math.ceil(result.errors.length / ERROR_PAGE_SIZE);
  const firstRowNumber = currentPage * ERROR_PAGE_SIZE;
  const pageErrors = result.errors
    .slice(firstRowNumber, firstRowNumber + ERROR_PAGE_SIZE)
    .map((item, index) => {
      const errorRank = firstRowNumber + index;
      const paletteColor =
        errorRank < ERROR_PAGE_SIZE
          ? ERROR_COLORS[errorRank]
          : { name: OTHER_COLOR.name, color: OTHER_COLOR.color };
      return { ...item, color: paletteColor.color, colorName: paletteColor.name };
    });
  let cumulativeCount = 0;

  return (
    <div
      className="store-error-analysis"
      aria-label={`Top error occurrences for store ${storeId}`}
      style={{
        padding: 14,
        borderRadius: 12,
        border: '1px solid rgba(148, 163, 184, 0.22)',
        background: 'rgba(148, 163, 184, 0.035)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          marginBottom: 15,
          fontSize: 12,
        }}
      >
        <span style={{ opacity: 0.84, fontVariantNumeric: 'tabular-nums' }}>
          {result.isPartial
            ? `Total Error Counts : ${scannedLabel} of ${matchedLabel || 'more'}`
            : `Total Error Counts : ${scannedLabel}`}
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

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '18px 26px',
        }}
      >
        {/* Compact pie, giving most of the section width to readable log messages. */}
        <div
          style={{
            flex: '0 1 244px',
            width: '100%',
            maxWidth: 244,
            margin: '0 auto',
            padding: '8px 6px 12px',
            borderRadius: 12,
            border: '1px solid rgba(148, 163, 184, 0.18)',
            background: 'rgba(148, 163, 184, 0.045)',
            textAlign: 'center',
          }}
        >
          <svg
            viewBox="0 0 240 240"
            role="img"
            aria-label={`Pie chart of the top five errors and other errors for store ${storeId}`}
            style={{
              display: 'block',
              width: '100%',
              maxWidth: 228,
              height: 'auto',
              margin: '0 auto',
            }}
          >
            {slices.map((item, index) => {
              const start = cumulativeCount / totalDisplayed;
              cumulativeCount += item.count;
              const end = cumulativeCount / totalDisplayed;
              const portion = end - start;
              const centerAngle = ((start + end) / 2) * Math.PI * 2 - Math.PI / 2;
              const labelRadius = portion >= 0.999999 ? 0 : PIE_RADIUS * 0.65;
              const textX = PIE_CENTER + labelRadius * Math.cos(centerAngle);
              const textY = PIE_CENTER + labelRadius * Math.sin(centerAngle);
              const percentage = percentLabel(item.count, totalDisplayed);
              const tooltip = `${item.colorName} — ${item.message}: ${item.count.toLocaleString()} occurrences (${percentage})`;

              return (
                <g key={`${item.message}-${index}`}>
                  {portion >= 0.999999 ? (
                    <circle
                      cx={PIE_CENTER}
                      cy={PIE_CENTER}
                      r={PIE_RADIUS}
                      fill={item.color}
                      stroke="#172033"
                      strokeWidth="1.8"
                    >
                      <title>{tooltip}</title>
                    </circle>
                  ) : (
                    <path
                      d={slicePath(start, end)}
                      fill={item.color}
                      stroke="#172033"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    >
                      <title>{tooltip}</title>
                    </path>
                  )}
                  {/* Tiny slices are named with exact percentages in the aligned legend below/right. */}
                  {portion >= 0.13 && (
                    <text
                      x={textX}
                      y={textY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={item.labelTextColor}
                      fontSize="12.5"
                      fontWeight="700"
                      style={{ pointerEvents: 'none', fontVariantNumeric: 'tabular-nums' }}
                    >
                      {percentage}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>
            Share of analyzed error events
          </div>
        </div>

        {/* Keep error messages and counts readable; show the ranked results five at a time. */}
        <div
          aria-label="Error categories, colors, percentages and occurrence counts"
          style={{ flex: '1 1 480px', minWidth: 0, overflowX: 'auto' }}
        >
          <div style={{ minWidth: 410 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '22px minmax(0, 1fr) 66px 70px',
                alignItems: 'center',
                columnGap: 10,
                padding: '7px 9px 9px',
                borderBottom: '1px solid rgba(148, 163, 184, 0.3)',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                opacity: 0.75,
              }}
            >
              <span aria-hidden="true" />
              <span>Error message</span>
              <span style={{ textAlign: 'right' }}>Share</span>
              <span style={{ textAlign: 'right' }}>Count</span>
            </div>

            {pageErrors.map((item, index) => (
              <div
                key={`${item.message}-${firstRowNumber + index}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '22px minmax(0, 1fr) 66px 70px',
                  alignItems: 'start',
                  columnGap: 10,
                  padding: '10px 9px',
                  borderBottom: '1px solid rgba(148, 163, 184, 0.13)',
                  fontSize: 12,
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}
                >
                  <span
                    aria-hidden="true"
                    title={item.colorName}
                    style={{
                      flexShrink: 0,
                      width: 13,
                      height: 13,
                      borderRadius: 4,
                      backgroundColor: item.color,
                      boxShadow: '0 0 0 1px rgba(148, 163, 184, 0.23)',
                    }}
                  />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, overflowWrap: 'anywhere' }} title={item.message}>
                    {firstRowNumber + index + 1}. {item.message}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      opacity: 0.72,
                      fontSize: 11,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {item.registerIds.length > 0
                      ? `Register${item.registerIds.length > 1 ? 's' : ''}: ${item.registerIds.join(', ')}`
                      : 'Register not provided in log'}
                  </div>
                </div>
                <strong
                  style={{
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                    fontSize: 12,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {percentLabel(item.count, totalDisplayed)}
                </strong>
                <span
                  style={{
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                    fontVariantNumeric: 'tabular-nums',
                    opacity: 0.88,
                  }}
                >
                  {item.count.toLocaleString()}
                </span>
              </div>
            ))}
            {pageCount > 1 && (
              <div
                aria-label="Error message pages"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '12px 9px 4px',
                  fontSize: 12,
                }}
              >
                <span>
                  Showing {firstRowNumber + 1}–{firstRowNumber + pageErrors.length} of{' '}
                  {result.errors.length.toLocaleString()} error messages
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    aria-label="Previous error messages"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage((page) => page - 1)}
                  >
                    Previous
                  </button>
                  <span>
                    Page {currentPage + 1} of {pageCount}
                  </span>
                  <button
                    type="button"
                    aria-label="Next error messages"
                    disabled={currentPage + 1 >= pageCount}
                    onClick={() => setCurrentPage((page) => page + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
