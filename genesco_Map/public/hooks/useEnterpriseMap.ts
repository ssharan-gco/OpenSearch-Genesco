import { useEffect, useRef, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Map as Maplibre, Marker, NavigationControl, Popup } from 'maplibre-gl';
import { CFG, displayLabel, escapeHtml, pinSvg, STATUS_COLORS } from '../lib/constants';
import { createPluginMap, destroyPluginMap } from '../lib/maplibreMap';
import { getStoreMapKey } from '../lib/storeMapKey';
import { createWeatherMapOverlay, WeatherOverlayController } from '../lib/weatherMapOverlay';
import { WeatherAlert } from '../lib/weatherAlerts';
import { SiteRecord, SiteStatus, StatusFilter } from '../lib/types';
import { RegisterNotes, RegisterNotesClient, normalizeNoteRegisterId } from '../services/registerNotes';

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

/** Preserve the existing operational status and expose resource-only warnings as amber. */
const getRegisterPopupStatuses = (site: SiteRecord): Array<[string, 'Up' | 'Degraded' | 'Down']> => {
  const operational = site.health.operationalRegisterStatuses || {};
  const healthStatuses = site.health.registerStatuses || {};
  const keys = new Set([...Object.keys(operational), ...Object.keys(healthStatuses)]);
  return Array.from(keys).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).map((register) => {
    const operationalStatus = operational[register];
    const healthStatus = healthStatuses[register];
    const registerStatus = operationalStatus === 'Down' || healthStatus === 'Down'
      ? 'Down'
      : healthStatus === 'Degraded'
        ? 'Degraded'
        : 'Up';
    return [register, registerStatus] as [string, 'Up' | 'Degraded' | 'Down'];
  });
};

const buildHealthPopup = (
  site: SiteRecord,
  status: SiteStatus,
  notes: RegisterNotes = {},
  notesState: 'loading' | 'ready' | 'error' = 'ready'
) => {
  const registerStatuses = getRegisterPopupStatuses(site);
  const registers =
    registerStatuses.length === 0
      ? `<div class="enterprise-health-popup__register"><span>Register status</span><strong class="unknown">${!site.health.operationalRegisterStatuses && site.health.registersDown ? 'Down' : 'No data'}</strong></div>`
      : registerStatuses
          .map(([register, registerStatus]) => {
            const statusClass = registerStatus.toLowerCase();
            const needsAttention = registerStatus === 'Down' || registerStatus === 'Degraded';
            const note = notes[normalizeNoteRegisterId(register)];
            // Keep the info button for every Warning/Down register, even when
            // the store itself is green or no incident has been entered yet.
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
            const info = needsAttention
              ? `<span class="enterprise-register-note-wrapper">` +
                `<button type="button" class="enterprise-register-note-info" data-register-incident-toggle="true" aria-expanded="false" aria-label="View incident details for register ${escapeHtml(register)}">i</button>` +
                `<span class="enterprise-register-incident-card" hidden role="group" aria-label="Register ${escapeHtml(register)} incident details">` +
                `<strong class="enterprise-register-incident-heading">Register ${escapeHtml(register)}</strong>` +
                detailsContent +
                `</span></span>`
              : '';
            return `<div class="enterprise-health-popup__register"><span>Register ${escapeHtml(register)}</span><span class="enterprise-register-note-status">${info}<strong class="${statusClass}">${escapeHtml(registerStatus === 'Degraded' ? 'Warning' : registerStatus)}</strong></span></div>`;
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
      element.addEventListener('click', (event) => {
        event.stopPropagation();
        popupRef.current?.remove();
        // Read notes whenever an individual register needs attention, even for a green store.
        const needsNotes = getRegisterPopupStatuses(site).some(
          ([, registerStatus]) => registerStatus === 'Down' || registerStatus === 'Degraded'
        );
        const popup = new Popup({
          closeButton: true,
          closeOnClick: true,
          offset: 14,
          className: 'enterprise-store-popup',
        })
          .setLngLat(coordinates)
          .setHTML(buildHealthPopup(site, displayedStatus, {}, needsNotes ? 'loading' : 'ready'))
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
        // Load incident details only for the clicked affected store. No requests per marker.
        if (needsNotes) {
          registerNotesClient.readStore(site.siteId)
            .then((notes) => {
              if (popupRef.current === popup) popup.setHTML(buildHealthPopup(site, displayedStatus, notes));
            })
            .catch(() => {
              if (popupRef.current === popup) popup.setHTML(buildHealthPopup(site, displayedStatus, {}, 'error'));
            });
        }
      });

      markersRef.current.set(
        getStoreMapKey(site),
        new Marker({ element, anchor: 'bottom' }).setLngLat(coordinates).addTo(map)
      );
    });
    updateMarkerSizes(map);
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
      syncMarkers(map, filteredRef.current, allRef.current);
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
      destroyPluginMap(map);
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (map && readyRef.current) {
      syncMarkers(map, filteredSites, allSites);
      fitDefaultView(map);
    }
  }, [allSites]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    syncMarkers(map, filteredSites, allSites);
    if (search.trim() !== '' && filteredSites.length === 1) {
      const site = filteredSites[0];
      map.easeTo({
        center: [site.lon, site.lat],
        zoom: Math.max(map.getZoom(), 10),
        duration: 600,
      });
    }
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
