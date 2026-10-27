import moment from 'moment-timezone';
import { TimeWindow } from '../../lib/types';
import { StoreRegister } from '../../services/registerMetrics';
import { RegisterLogEvent } from '../../services/registerLogs';

interface RegisterActivityChartProps {
  events: RegisterLogEvent[];
  registers: StoreRegister[];
  timeWindow: TimeWindow;
  timeZone: string;
}

const CHART_WIDTH = 900;
const LEFT = 90;
const RIGHT = 16;
const TOP = 18;
const ROW_HEIGHT = 40;
const BOTTOM = 34;

export const RegisterActivityChart = ({
  events,
  registers,
  timeWindow,
  timeZone,
}: RegisterActivityChartProps) => {
  if (events.length === 0 && registers.length === 0) {
    return <div className="store-live-state">No register log events found for this store.</div>;
  }

  const registersById = new Map(registers.map((register) => [register.id, register]));
  const registerIds = Array.from(
    new Set([...registers.map(({ id }) => id), ...events.map(({ registerId }) => registerId)])
  ).sort((a, b) => Number(a) - Number(b) || a.localeCompare(b));
  const minTimestamp = timeWindow.fromMs;
  const maxTimestamp = timeWindow.toMs;
  const timestampRange = Math.max(1, maxTimestamp - minTimestamp);
  const plotWidth = CHART_WIDTH - LEFT - RIGHT;
  const height = TOP + registerIds.length * ROW_HEIGHT + BOTTOM;
  const xForTimestamp = (timestamp: number) =>
    LEFT + ((timestamp - minTimestamp) / timestampRange) * plotWidth;
  const formatTick = (timestamp: number) => moment.tz(timestamp, timeZone).format('MM-DD HH:mm');

  return (
    <div className="store-register-activity-chart">
      <svg
        role="img"
        aria-label="Register status and log activity by timestamp"
        viewBox={`0 0 ${CHART_WIDTH} ${height}`}
        preserveAspectRatio="xMinYMin meet"
      >
        {registerIds.map((registerId, index) => {
          const y = TOP + index * ROW_HEIGHT + ROW_HEIGHT / 2;
          return (
            <g key={registerId}>
              <text
                className="store-register-activity-label"
                x={LEFT - 12}
                y={y + 4}
                textAnchor="end"
              >
                Reg {registerId}
              </text>
              <rect
                className="store-register-activity-status-unknown"
                x={LEFT}
                y={y - 8}
                width={plotWidth}
                height="16"
                rx="2"
              />
              {(registersById.get(registerId)?.uptimeTimeline || []).map(
                ({ timestamp, status }, pointIndex, timeline) => {
                  const nextTimestamp = timeline[pointIndex + 1]?.timestamp ?? timeWindow.toMs;
                  const start = Math.max(timeWindow.fromMs, timestamp);
                  const end = Math.min(timeWindow.toMs, Math.max(start, nextTimestamp));
                  if (end <= start) return null;
                  return (
                    <rect
                      className={
                        status === 1
                          ? 'store-register-activity-status-up'
                          : status === 0
                            ? 'store-register-activity-status-down'
                            : 'store-register-activity-status-unknown'
                      }
                      key={`${registerId}-status-${pointIndex}`}
                      x={xForTimestamp(start)}
                      y={y - 8}
                      width={Math.max(1, xForTimestamp(end) - xForTimestamp(start))}
                      height="16"
                      rx="2"
                    >
                      <title>
                        {`${moment.tz(start, timeZone).format('YYYY-MM-DD HH:mm:ss z')}: ${
                          status === 1 ? 'Up' : status === 0 ? 'Down / restart' : 'No data'
                        }`}
                      </title>
                    </rect>
                  );
                }
              )}
            </g>
          );
        })}
        {events.map(({ registerId, timestamp }, index) => {
          const registerIndex = registerIds.indexOf(registerId);
          if (timestamp < minTimestamp || timestamp > maxTimestamp) return null;
          const x = xForTimestamp(timestamp);
          const y = TOP + registerIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
          return (
            <circle
              className="store-register-activity-point"
              key={`${registerId}-${timestamp}-${index}`}
              cx={x}
              cy={y}
              r="4"
            >
              <title>
                {`Register ${registerId} · ${moment
                  .tz(timestamp, timeZone)
                  .format('YYYY-MM-DD HH:mm:ss z')}`}
              </title>
            </circle>
          );
        })}
        {[0, 1, 2, 3, 4].map((tick) => {
          const timestamp = minTimestamp + (timestampRange * tick) / 4;
          const x = LEFT + (plotWidth * tick) / 4;
          return (
            <g key={tick}>
              <line
                className="store-register-activity-tick"
                x1={x}
                x2={x}
                y1={TOP}
                y2={height - BOTTOM}
              />
              <text
                className="store-register-activity-axis-label"
                x={x}
                y={height - 10}
                textAnchor="middle"
              >
                {formatTick(timestamp)}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="store-register-activity-legend" aria-label="Chart legend">
        <span>
          <i className="store-register-activity-status-up" /> Register up
        </span>
        <span>
          <i className="store-register-activity-status-down" /> Down / restart
        </span>
        <span>
          <i className="store-register-activity-status-unknown" /> No status history
        </span>
        <span>
          <i className="store-register-activity-point" /> Log event
        </span>
      </div>
      {events.length === 0 && (
        <div className="store-live-state">No register log events found in the selected range.</div>
      )}
    </div>
  );
};
