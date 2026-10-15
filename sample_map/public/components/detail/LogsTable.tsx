import React from 'react';
import { LogRecord } from '../../lib/types';
import { SEVERITY_COLORS } from '../../lib/constants';

interface LogsTableProps {
  logs: LogRecord[];
  counts: { [severity: string]: number };
}

/** Recent log lines read from the OpenSearch logs index. */
export const LogsTable = ({ logs, counts }: LogsTableProps) => (
  <div className="dp-sec">
    <div className="dp-sec-head">
      Recent Logs
      {Object.entries(counts).map(([sev, n]) => (
        <span key={sev} className="gm-sev-chip" style={{ borderColor: SEVERITY_COLORS[sev] || '#94a3b8' }}>
          <span className="gm-sev-dot" style={{ background: SEVERITY_COLORS[sev] || '#94a3b8' }} />
          {sev} {n}
        </span>
      ))}
    </div>
    {logs.length === 0 ? (
      <div className="gm-empty">No logs in range</div>
    ) : (
      <div className="gm-logs-scroll">
        <table className="gen-tbl">
          <thead>
            <tr>
              <th>Time</th>
              <th>Severity</th>
              <th>Service</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l, i) => (
              <tr key={`${l.time}-${i}`}>
                <td style={{ whiteSpace: 'nowrap' }}>{new Date(l.time).toLocaleString()}</td>
                <td style={{ color: SEVERITY_COLORS[l.severity] || undefined, fontWeight: 700 }}>{l.severity}</td>
                <td>{l.service}</td>
                <td className="gen-msg" title={l.message}>
                  {l.message}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);
