import { useEffect, useRef, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Map as Maplibre, Marker, NavigationControl, Popup } from 'maplibre-gl';
import { CFG, displayLabel, escapeHtml, pinSvg, STATUS_COLORS } from '../lib/constants';
import { createPluginMap, destroyPluginMap } from '../lib/maplibreMap';
import { getStoreMapKey } from '../lib/storeMapKey';
import { STORE_INCIDENT_SCOPE } from '../lib/storeIncident';
import { createWeatherMapOverlay, WeatherOverlayController } from '../lib/weatherMapOverlay';
import { WeatherAlert } from '../lib/weatherAlerts';
import { SiteRecord, SiteStatus, StatusFilter } from '../lib/types';
import { RegisterNotes, RegisterNotesClient, normalizeNoteRegisterId } from '../services/registerNotes';
import { fetchStoreRegisterDashboard } from '../services/registerMetrics';

interface UseEnterpriseMapArgs {
  allSites: SiteRecord[];
  filteredSites: SiteRecord[];
  statusFilter: StatusFilter;
  search: string;
  weatherAlerts: WeatherAlert[];
  showWeatherAlerts: boolean;
  focusedWeatherAlertId: string | null;
  weatherFocusRevision: number;
  registerNotesClient: RegisterNotesClient;
}

const ZOOM_SCALE_STOPS: Array<[number, number]> = [
  [3, 1],
  [8, 1.3],
  [12, 1.9],
  [16, 2.6],
];

const getPinScale = (width: number) => (width < 900 ? 0.3 : width < 1400 ? 0.35 : 0.4);

const getZoomScale = (zoom: number) => {
  if (zoom <= ZOOM_SCALE_STOPS[0][0]) return ZOOM_SCALE_STOPS[0][1];
  for (let i = 1; i < ZOOM_SCALE_STOPS.length; i++) {
    const [upperZoom, upperScale] = ZOOM_SCALE_STOPS[i];
    const [lowerZoom, lowerScale] = ZOOM_SCALE_STOPS[i - 1];
    if (zoom <= upperZoom) {
      return (
        lowerScale + ((zoom - lowerZoom) / (upperZoom - lowerZoom)) * (upperScale - lowerScale)
      );
    }
  }
  return ZOOM_SCALE_STOPS[ZOOM_SCALE_STOPS.length - 1][1];
};

/** Keep the existing per-register operational status, and additionally identify
 * registers whose metrics are unavailable in the detailed register view.
 * A saved note can also identify a register when the live map lacks its status.
 * Never infer an unknown register number from the overall store status.
 */
const getRegisterPopupStatuses = (
  site: SiteRecord,
  noDataRegisterIds: string[] = [],
  notes: RegisterNotes = {}
): Array<[string, 'Up' | 'Degraded' | 'Down' | 'No data']> => {
  const operational = Object.fromEntries(
    Object.entries(site.health.operationalRegisterStatuses || {}).map(([id, status]) =>
      [normalizeNoteRegisterId(id), status]
    )
  );
  const healthStatuses = Object.fromEntries(
    Object.entries(site.health.registerStatuses || {}).map(([id, status]) =>
      [normalizeNoteRegisterId(id), status]
    )
  );
  const noDataIds = new Set(noDataRegisterIds.map(normalizeNoteRegisterId));
  const keys = new Set([
    ...Object.keys(operational),
    ...Object.keys(healthStatuses),
    ...noDataIds,
    ...Object.keys(notes).filter((id) => id !== STORE_INCIDENT_SCOPE).map(normalizeNoteRegisterId),
  ]);
  return Array.from(keys)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((register) => {
      const operationalStatus = operational[register];
      const healthStatus = healthStatuses[register];
      const registerStatus: 'Up' | 'Degraded' | 'Down' | 'No data' =
        operationalStatus === 'Down' || healthStatus === 'Down'
        ? 'Down'
        : healthStatus === 'Degraded'
          ? 'Degraded'
          : noDataIds.has(register)
            ? 'No data'
            : operationalStatus === 'Up' || healthStatus === 'Up'
              ? 'Up'
              : 'No data';
      return [register, registerStatus] as [string, 'Up' | 'Degraded' | 'Down' | 'No data'];
    });
};

const buildHealthPopup = (
  site: SiteRecord,
  status: SiteStatus,
  notes: RegisterNotes = {},
  notesState: 'loading' | 'ready' | 'error' = 'ready',
  noDataRegisterIds: string[] = [],
  identifiedRegisterIds: string[] = []
) => {
  const registerStatuses = getRegisterPopupStatuses(site, noDataRegisterIds, notes);
  // Show the store-level info control ONLY when neither the map health summary
  // nor the on-demand detailed telemetry identifies any register.
  const needsStoreFallback = registerStatuses.length === 0 && identifiedRegisterIds.length === 0;
  const storeNote = notes[STORE_INCIDENT_SCOPE];
  const hasStoreIncident = Boolean(storeNote?.incidentNumber?.trim() || storeNote?.comment?.trim());
  const storeInfoContent = notesState === 'loading'
    ? `<span class="enterprise-register-incident-empty">Loading incident details…</span>`
    : notesState === 'error'
      ? `<span class="enterprise-register-incident-empty">Unable to load incident details.</span>`
      : !hasStoreIncident
        ? `<span class="enterprise-register-incident-empty">Waiting for the operations to update the Status</span>`
        : `<span class="enterprise-register-incident-label">Incident number</span>` +
          `<span class="enterprise-register-incident-value">${escapeHtml(storeNote?.incidentNumber || 'Not provided')}</span>` +
          `<span class="enterprise-register-incident-label">Status update</span>` +
          `<span class="enterprise-register-incident-value">${escapeHtml(storeNote?.comment || 'No status update provided.')}</span>`;
  const storeInfo = needsStoreFallback
    ? `<div class="enterprise-health-popup__register enterprise-store-incident-row">` +
      `<span>Store incident</span>` +
      `<span class="enterprise-register-note-wrapper">` +
      `<button type="button" class="enterprise-register-note-info" data-register-incident-toggle="true" aria-expanded="false" aria-label="View store incident details">i</button>` +
      `<span class="enterprise-register-incident-card" hidden role="group" aria-label="Store incident details">` +
      `<strong class="enterprise-register-incident-heading">Store #${escapeHtml(site.siteId)}</strong>` +
      storeInfoContent + `</span></span></div>`
    : '';
  // USERS presentation only: when the STORE pin is green, show its register
  // labels green too. Keep the actual register telemetry untouched for IT,
  // incident-note eligibility, filters, and any persisted data.
  const fallbackRegisterStatus = status === 'Up'
    ? 'Up'
    : (!site.health.operationalRegisterStatuses && site.health.registersDown ? 'Down' : 'No data');
  const registers =
    registerStatuses.length === 0
      ? `<div class="enterprise-health-popup__register"><span>Register status</span><strong class="${fallbackRegisterStatus === 'Up' ? 'up' : 'unknown'}">${fallbackRegisterStatus}</strong></div>`
      : registerStatuses
          .map(([register, registerStatus]) => {
            const displayedRegisterStatus = status === 'Up' ? 'Up' : registerStatus;
            const statusClass = displayedRegisterStatus === 'No data' ? 'unknown' : displayedRegisterStatus.toLowerCase();
            const needsAttention = registerStatus === 'Down' || registerStatus === 'Degraded' || registerStatus === 'No data';
            const note = notes[normalizeNoteRegisterId(register)];
            // USERS presentation only: when a Green store displays this register as Up,
            // hide its incident icon as well. Keep actual notes/statuses unchanged for IT.
            const hasIncidentDetails = Boolean(note?.incidentNumber?.trim() || note?.comment?.trim());
            const detailsContent = notesState === 'loading'
              ? `<span class="enterprise-register-incident-empty">Loading incident details…</span>`
              : notesState === 'error'
                ? `<span class="enterprise-register-incident-empty">Unable to load incident details.</span>`
                : !hasIncidentDetails
                  ? `<span class="enterprise-register-incident-empty">Waiting for the operations to update the Status</span>`
                  : `<span class="enterprise-register-incident-label">Incident number</span>` +
                    `<span class="enterprise-register-incident-value">${escapeHtml(note?.incidentNumber || 'Not provided')}</span>` +
                    `<span class="enterprise-register-incident-label">Status update</span>` +
                    `<span class="enterprise-register-incident-value">${escapeHtml(note?.comment || 'No status update provided.')}</span>`;
            const info = needsAttention && status !== 'Up'
              ? `<span class="enterprise-register-note-wrapper">` +
                `<button type="button" class="enterprise-register-note-info" data-register-incident-toggle="true" aria-expanded="false" aria-label="View incident details for register ${escapeHtml(register)}">i</button>` +
                `<span class="enterprise-register-incident-card" hidden role="group" aria-label="Register ${escapeHtml(register)} incident details">` +
                `<strong class="enterprise-register-incident-heading">Register ${escapeHtml(register)}</strong>` +
                detailsContent +
                `</span></span>`
              : '';
            return `<div class="enterprise-health-popup__register"><span>Register ${escapeHtml(register)}</span><span class="enterprise-register-note-status">${info}<strong class="${statusClass}">${escapeHtml(displayedRegisterStatus === 'Degraded' ? 'Warning' : displayedRegisterStatus)}</strong></span></div>`;
          })
          .join('');
  const location = [site.city, site.state].filter(Boolean).join(', ');
  const color = STATUS_COLORS[status] || STATUS_COLORS.Down;

  return (
    `<div class="enterprise-health-popup">` +
    `<div class="enterprise-health-popup__heading">` +
    `<strong>${escapeHtml(site.name || `Store #${site.siteId}`)}</strong>` +
    `<span>${escapeHtml(location || `Store #${site.siteId}`)}</span>` +
    `</div>` +
    `<div class="enterprise-health-popup__status">` +
    `<span style="background:${color}"></span>${escapeHtml(displayLabel(status))}` +
    `</div>` +
    `<div class="enterprise-health-popup__registers">` +
    `<div class="enterprise-health-popup__registers-title">Register status</div>` +
    registers +
    storeInfo +
    `</div>` +
    `</div>`
  );
};

export function useEnterpriseMap({
  allSites,
  filteredSites,
  statusFilter,
  search,
  weatherAlerts,
  showWeatherAlerts,
  focusedWeatherAlertId,
  weatherFocusRevision,
  registerNotesClient,
}: UseEnterpriseMapArgs) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Maplibre | null>(null);
  const weatherOverlayRef = useRef<WeatherOverlayController | null>(null);
  const weatherAlertsRef = useRef(weatherAlerts);
  weatherAlertsRef.current = weatherAlerts;
  const showWeatherRef = useRef(showWeatherAlerts);
  showWeatherRef.current = showWeatherAlerts;
  const weatherFocusRef = useRef(focusedWeatherAlertId);
  weatherFocusRef.current = focusedWeatherAlertId;
  const popupRef = useRef<Popup | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const markerSignatureRef = useRef('');
  const lastSearchFocusRef = useRef('');
  const allRef = useRef(allSites);
  allRef.current = allSites;
  const filteredRef = useRef(filteredSites);
  filteredRef.current = filteredSites;
  const statusFilterRef = useRef(statusFilter);
  statusFilterRef.current = statusFilter;
  const homeRef = useRef<{ center: [number, number]; zoom: number } | null>(null);
  const fittingRef = useRef(false);
  const readyRef = useRef(false);
  const [mapMoved, setMapMoved] = useState(false);

  const updateMarkerSizes = (map: Maplibre) => {
    const scale = getPinScale(window.innerWidth) * getZoomScale(map.getZoom());
    markersRef.current.forEach((marker) => {
      const size = 40 * scale;
      marker.getElement().style.width = `${size}px`;
      marker.getElement().style.height = `${size}px`;
    });
  };

  const getDisplayedStatus = (site: SiteRecord) =>
    statusFilterRef.current !== 'All' && site.filterStatuses.includes(statusFilterRef.current)
      ? statusFilterRef.current
      : site.status;

  const fitDefaultView = (map: Maplibre) => {
    fittingRef.current = true;
    map.fitBounds(CFG.mapBounds, {
      padding: { top: 40, bottom: 70, left: 40, right: 320 },
      maxZoom: 9,
      animate: false,
    });
    homeRef.current = {
      center: [map.getCenter().lng, map.getCenter().lat],
      zoom: map.getZoom(),
    };
    setMapMoved(false);
    fittingRef.current = false;
  };

  const syncMarkers = (map: Maplibre, sites: SiteRecord[], all: SiteRecord[]) => {
    popupRef.current?.remove();
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    sites.forEach((site) => {
      const displayedStatus = getDisplayedStatus(site);
      const coordinates: [number, number] = [site.lon, site.lat];
      const element = document.createElement('button');
      element.type = 'button';
      element.className =
        site.status === 'Down'
          ? 'site-pin enterprise-site-pin site-pin-down'
          : 'site-pin enterprise-site-pin';
      element.setAttribute(
        'aria-label',
        `${site.name} (${site.state}) - ${displayLabel(displayedStatus)}. Click for current health.`
      );
      element.title = `${site.name} (${site.state})`;
      element.style.background = 'transparent';
      element.style.border = '0';
      element.style.padding = '0';
      element.style.lineHeight = '0';
      element.innerHTML = pinSvg(STATUS_COLORS[displayedStatus] || STATUS_COLORS.Down);
      const siteKey = getStoreMapKey(site);
      element.addEventListener('click', (event) => {
        event.stopPropagation();
        popupRef.current?.remove();
        // Read the latest polled data even if the store pin color did not change.
        const currentSite = allRef.current.find((record) => getStoreMapKey(record) === siteKey) || site;
        const currentStatus = getDisplayedStatus(currentSite);
        // Notes and No-data register IDs are loaded only for the clicked store.
        // The green-store USERS display override suppresses the info icon only in this popup.
        const popup = new Popup({
          closeButton: true,
          closeOnClick: true,
          offset: 14,
          className: 'enterprise-store-popup',
        })
          .setLngLat([currentSite.lon, currentSite.lat])
          .setHTML(buildHealthPopup(currentSite, currentStatus, {}, 'loading'))
          .addTo(map);
        popupRef.current = popup;
        // Keep the info card click-only: delegated listener survives setHTML() after
        // the asynchronous note request, and does not rely on inline JS/hover.
        popup.getElement().addEventListener('click', (popupEvent) => {
          const target = popupEvent.target;
          if (!(target instanceof Element)) return;
          const root = popup.getElement();
          const clickedButton = target.closest<HTMLButtonElement>('[data-register-incident-toggle]');
          const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-register-incident-toggle]'));
          const shouldOpen = clickedButton?.getAttribute('aria-expanded') !== 'true';
          for (const button of buttons) {
            button.setAttribute('aria-expanded', 'false');
            const card = button.parentElement?.querySelector<HTMLElement>('.enterprise-register-incident-card');
            if (card) card.hidden = true;
          }
          if (clickedButton) {
            popupEvent.stopPropagation();
            if (shouldOpen) {
              clickedButton.setAttribute('aria-expanded', 'true');
              const card = clickedButton.parentElement?.querySelector<HTMLElement>('.enterprise-register-incident-card');
              if (card) card.hidden = false;
            }
          }
        });
        popup.getElement().addEventListener('keydown', (keyEvent) => {
          if (keyEvent.key !== 'Escape') return;
          popup.getElement().querySelectorAll<HTMLButtonElement>('[data-register-incident-toggle]').forEach((button) => {
            button.setAttribute('aria-expanded', 'false');
            const card = button.parentElement?.querySelector<HTMLElement>('.enterprise-register-incident-card');
            if (card) card.hidden = true;
          });
        });
        // The live map summary does not always contain a register when that
        // register has no recent status. Check the same detail service as IT,
        // but only when a user opens this store popup (never for every map pin).
        const now = Date.now();
        void Promise.all([
          registerNotesClient.readStore(currentSite.siteId)
            .then((notes) => ({ notes, state: 'ready' as const }))
            .catch(() => ({ notes: {} as RegisterNotes, state: 'error' as const })),
          fetchStoreRegisterDashboard(currentSite.siteId, {
            fromMs: now - 5 * 60 * 1000,
            toMs: now,
          })
            .then((dashboard) => ({
              noDataRegisterIds: dashboard.registers
                .filter((register) => register.status === 'No data')
                .map((register) => register.id),
              identifiedRegisterIds: dashboard.registers.map((register) => register.id),
            }))
            // A telemetry API error is not proof that registers don't exist;
            // rely on map summary plus any saved register IDs in that case.
            .catch(() => ({ noDataRegisterIds: [] as string[], identifiedRegisterIds: [] as string[] })),
        ]).then(([noteResult, detail]) => {
          if (popupRef.current === popup) {
            popup.setHTML(buildHealthPopup(
              currentSite, currentStatus, noteResult.notes, noteResult.state,
              detail.noDataRegisterIds, detail.identifiedRegisterIds
            ));
          }
        });
      });

      markersRef.current.set(
        getStoreMapKey(site),
        new Marker({ element, anchor: 'bottom' }).setLngLat(coordinates).addTo(map)
      );
    });
    updateMarkerSizes(map);
  };

  // Polling should not tear down the pins or close open popups unless the
  // displayed store/register statuses actually change.
  const syncMarkersIfChanged = (map: Maplibre, sites: SiteRecord[], all: SiteRecord[]) => {
    const signature = sites.map((site) =>
      `${getStoreMapKey(site)}:${site.status}:${getDisplayedStatus(site)}:` +
      JSON.stringify(site.health.registerStatuses || {}) + ':' +
      JSON.stringify(site.health.operationalRegisterStatuses || {})
    ).join('|');
    if (markerSignatureRef.current === signature) return;
    markerSignatureRef.current = signature;
    syncMarkers(map, sites, all);
  };

  const resetMapView = () => {
    const map = mapRef.current;
    const home = homeRef.current;
    if (!map || !home) return;
    popupRef.current?.remove();
    map.easeTo({ center: home.center, zoom: home.zoom, bearing: 0, pitch: 0, duration: 500 });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    const map = createPluginMap(mapContainerRef.current);
    mapRef.current = map;
    map.addControl(new NavigationControl({ showCompass: true }), 'top-left');

    const onResize = () => {
      map.resize();
      updateMarkerSizes(map);
    };
    window.addEventListener('resize', onResize);
    map.on('moveend', () => {
      const home = homeRef.current;
      if (!home || fittingRef.current) return;
      const center = map.getCenter();
      setMapMoved(
        Math.abs(center.lng - home.center[0]) > 0.05 ||
          Math.abs(center.lat - home.center[1]) > 0.05 ||
          Math.abs(map.getZoom() - home.zoom) > 0.15
      );
    });
    map.on('load', () => {
      readyRef.current = true;
      weatherOverlayRef.current = createWeatherMapOverlay(map);
      weatherOverlayRef.current.update(weatherAlertsRef.current, allRef.current, showWeatherRef.current);
      if (weatherFocusRef.current) weatherOverlayRef.current.focus(weatherFocusRef.current);
      syncMarkersIfChanged(map, filteredRef.current, allRef.current);
      map.on('zoom', () => updateMarkerSizes(map));
      fitDefaultView(map);
    });

    return () => {
      window.removeEventListener('resize', onResize);
      readyRef.current = false;
      weatherOverlayRef.current?.destroy();
      weatherOverlayRef.current = null;
      popupRef.current?.remove();
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      markerSignatureRef.current = '';
      destroyPluginMap(map);
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (map && readyRef.current) {
      syncMarkersIfChanged(map, filteredSites, allSites);
    }
  }, [allSites]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    syncMarkersIfChanged(map, filteredSites, allSites);
    const focusKey = search.trim() !== '' && filteredSites.length === 1
      ? `${search.trim().toLowerCase()}:${getStoreMapKey(filteredSites[0])}` : '';
    if (focusKey && focusKey !== lastSearchFocusRef.current) {
      const site = filteredSites[0];
      map.easeTo({
        center: [site.lon, site.lat],
        zoom: Math.max(map.getZoom(), 10),
        duration: 600,
      });
    }
    lastSearchFocusRef.current = focusKey;
  }, [allSites, filteredSites, search, statusFilter]);

  // Weather polygons are independent of store pins, health and location filters.
  useEffect(() => {
    weatherOverlayRef.current?.update(weatherAlerts, allSites, showWeatherAlerts);
  }, [weatherAlerts, allSites, showWeatherAlerts]);

  useEffect(() => {
    if (focusedWeatherAlertId) weatherOverlayRef.current?.focus(focusedWeatherAlertId);
  }, [focusedWeatherAlertId, weatherFocusRevision]);

  return { mapContainerRef, mapMoved, resetMapView };
}
