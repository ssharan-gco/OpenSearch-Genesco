import { useMemo, useState } from 'react';
import { WeatherAlert, getWeatherStates, getWeatherTitle, getWeatherBounds } from '../lib/weatherAlerts';

interface WeatherAlertsPanelProps {
  alerts: WeatherAlert[];
  loading: boolean;
  error: string | null;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  onFocus: (alert: WeatherAlert) => void;
  onRefresh: () => void;
}

/** Weather alerts panel shared by the IT and USERS maps. */
export const WeatherAlertsPanel = ({
  alerts, loading, error, visible, onVisibleChange, onFocus, onRefresh,
}: WeatherAlertsPanelProps) => {
  const [expanded, setExpanded] = useState(false);
  const [openState, setOpenState] = useState<string | null>(null);
  const [openUnmappedAlert, setOpenUnmappedAlert] = useState<string | null>(null);
  const [term, setTerm] = useState('');

  const groups = useMemo(() => {
    const q = term.trim().toLowerCase();
    const byState = new Map<string, WeatherAlert[]>();
    alerts.forEach((alert) => {
      const value = [alert.properties.event, alert.properties.headline, alert.properties.areaDesc,
        ...getWeatherStates(alert)].join(' ').toLowerCase();
      if (q && !value.includes(q)) return;
      getWeatherStates(alert).forEach((state) => {
        const rows = byState.get(state) || [];
        rows.push(alert);
        byState.set(state, rows);
      });
    });
    return Array.from(byState.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [alerts, term]);

  const countInList = groups.reduce((sum, [, rows]) => sum + rows.length, 0);
  const openPanel = () => {
    setExpanded((wasExpanded) => !wasExpanded);
    if (!expanded) onVisibleChange(true);
  };

  return (
    <aside className="genesco-weather-widget" aria-label="Weather alerts">
      <div className="genesco-weather-widget-controls">
        <button
          type="button"
          className={`genesco-weather-widget-toggle ${visible ? 'is-active' : ''}`}
          onClick={() => onVisibleChange(!visible)}
          title={visible ? 'Hide weather alert areas on map' : 'Show weather alert areas on map'}
          aria-pressed={visible}
        >
          <span aria-hidden="true">⛈</span> Weather Alerts
          <span className="genesco-weather-widget-count">{alerts.length}</span>
        </button>
        <button
          type="button"
          className="genesco-weather-widget-expand"
          onClick={openPanel}
          aria-label={expanded ? 'Close weather alert list' : 'Expand weather alert list'}
          aria-expanded={expanded}
        >
          {expanded ? '⌄' : '›'}
        </button>
      </div>
      {expanded && (
        <div className="genesco-weather-widget-list">
          <div className="genesco-weather-widget-description">
            Active NWS Severe / Extreme hurricane, storm and flood alerts
          </div>
          <div className="genesco-weather-widget-tools">
            <span>🔴 Severe/Extreme {alerts.length}</span>
            <button type="button" onClick={onRefresh} title="Refresh weather alerts">↻</button>
          </div>
          <input
            className="genesco-weather-widget-search"
            aria-label="Search weather alerts"
            placeholder="Search state, county, event…"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
          />
          {error && <p className="genesco-weather-widget-warning">Weather-alert index unavailable: {error}</p>}
          {loading && <p className="genesco-weather-widget-muted">Loading alerts…</p>}
          {!loading && !error && !alerts.length && (
            <p className="genesco-weather-widget-muted">No active matching alerts in the connected OpenSearch index.</p>
          )}
          {alerts.length > 0 && (
            <>
              <p className="genesco-weather-widget-muted">{countInList} state entries · {groups.length} states</p>
              <div className="genesco-weather-widget-groups">
                {groups.map(([state, rows]) => (
                  <div className="genesco-weather-widget-group" key={state}>
                    <button
                      type="button"
                      className="genesco-weather-widget-state"
                      onClick={() => setOpenState(openState === state ? null : state)}
                      aria-expanded={openState === state}
                    >
                      <span><span className="genesco-weather-red-dot" />{state}</span>
                      <span>{rows.length} {openState === state ? '⌄' : '›'}</span>
                    </button>
                    {openState === state && rows.map((alert) => {
                      const hasPolygon = !!getWeatherBounds(alert.geometry);
                      return (
                        <div key={alert.id}>
                        <button
                          type="button"
                          className="genesco-weather-widget-alert"
                          onClick={() => {
                            if (hasPolygon) { onVisibleChange(true); onFocus(alert); }
                            else setOpenUnmappedAlert(openUnmappedAlert === alert.id ? null : alert.id);
                          }}
                          title={hasPolygon ? 'Zoom to alert area' : 'View details (NWS did not include map geometry)'}
                        >
                          <strong>{getWeatherTitle(alert)}</strong>
                          <span>{alert.properties.areaDesc || 'Area details unavailable'}</span>
                          {!hasPolygon && <small>No polygon provided by NWS</small>}
                        </button>
                        {!hasPolygon && openUnmappedAlert === alert.id && (
                          <div className="genesco-weather-widget-unmapped-details">
                            <strong>{alert.properties.severity || 'Alert'}</strong>
                            <p>{alert.properties.headline || alert.properties.description || 'No further details from NWS.'}</p>
                          </div>
                        )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </>
          )}
          <p className="genesco-weather-widget-note">
            Alert areas are from NOAA/NWS. Store impact is estimated using mapped store coordinates.
          </p>
        </div>
      )}
    </aside>
  );
};
