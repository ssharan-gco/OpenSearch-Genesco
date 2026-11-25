import { useEffect, useRef, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Map as Maplibre, Marker, NavigationControl, Popup } from 'maplibre-gl';
import { CFG, displayLabel, escapeHtml, getColor, pinSvg, STATUS_COLORS } from '../lib/constants';
import { createPluginMap, destroyPluginMap } from '../lib/maplibreMap';
import { getStoreMapKey } from '../lib/storeMapKey';
import { createWeatherMapOverlay, WeatherOverlayController } from '../lib/weatherMapOverlay';
import { WeatherAlert } from '../lib/weatherAlerts';
import { SiteRecord, StatusFilter } from '../lib/types';

interface UseGenscoMapArgs {
  allSites: SiteRecord[];
  filteredSites: SiteRecord[];
  statusFilter: StatusFilter;
  search: string;
  weatherAlerts: WeatherAlert[];
  showWeatherAlerts: boolean;
  focusedWeatherAlertId: string | null;
  weatherFocusRevision: number;
  onSelectSite: (siteId: string) => void;
}

// Pins grow as you zoom in.
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

const buildTooltipHtml = (p: Record<string, any>, status: string) => {
  const cityStateZip = [p.city, [p.state, p.zip].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ');
  return (
    `<div style="padding:10px 12px;min-width:200px;max-width:260px;font-size:12px;line-height:1.5">` +
    `<div style="font-weight:700;font-size:13px;margin-bottom:4px">${escapeHtml(p.name || `Site #${p.siteId}`)}</div>` +
    (p.address ? `<div style="opacity:0.85">${escapeHtml(p.address)}</div>` : '') +
    (cityStateZip
      ? `<div style="opacity:0.85;margin-bottom:6px">${escapeHtml(cityStateZip)}</div>`
      : '') +
    `<div style="display:flex;align-items:center;gap:6px;margin-top:6px">` +
    `<span style="width:8px;height:8px;border-radius:50%;background:${getColor(status)};display:inline-block"></span>` +
    `<span style="opacity:0.9">${escapeHtml(displayLabel(status))}</span>` +
    `</div></div>`
  );
};

/**
 * MapLibre lifecycle: init, pins, hover/click popups, Down-site pulse,
 * filter/search updates and "reset view".
 */
export function useGenscoMap({
  allSites,
  filteredSites,
  statusFilter,
  search,
  weatherAlerts,
  showWeatherAlerts,
  focusedWeatherAlertId,
  weatherFocusRevision,
  onSelectSite,
}: UseGenscoMapArgs) {
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
  const stickyPopupRef = useRef(false);
  const readyRef = useRef(false);
  const homeRef = useRef<{ center: [number, number]; zoom: number } | null>(null);
  const fittingRef = useRef(false);
  const allRef = useRef(allSites);
  allRef.current = allSites;
  const filteredRef = useRef(filteredSites);
  filteredRef.current = filteredSites;
  const onSelectRef = useRef(onSelectSite);
  onSelectRef.current = onSelectSite;
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
    statusFilter !== 'All' && site.filterStatuses.includes(statusFilter)
      ? statusFilter
      : site.status;

  const showPopup = (map: Maplibre, site: SiteRecord, sticky: boolean) => {
    popupRef.current?.remove();
    stickyPopupRef.current = sticky;
    popupRef.current = new Popup({
      closeButton: sticky,
      closeOnClick: sticky,
      offset: 14,
      className: 'store-popup',
    })
      .setLngLat([site.lon, site.lat])
      .setHTML(buildTooltipHtml(site, getDisplayedStatus(site)))
      .addTo(map);
  };

  const syncMarkers = (map: Maplibre, sites: SiteRecord[]) => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    sites
      .filter((site) => Number.isFinite(site.lat) && Number.isFinite(site.lon))
      .forEach((site) => {
        const displayedStatus = getDisplayedStatus(site);
        const element = document.createElement('button');
        element.type = 'button';
        element.className = `site-pin ${site.status === 'Down' ? 'site-pin-down' : ''}`;
        element.setAttribute('aria-label', `${site.name} - ${displayLabel(displayedStatus)}`);
        element.style.background = 'transparent';
        element.style.border = '0';
        element.style.padding = '0';
        element.style.lineHeight = '0';
        element.innerHTML = pinSvg(STATUS_COLORS[displayedStatus]);
        const siteKey = getStoreMapKey(site);
        const currentSite = () => allRef.current.find((record) => getStoreMapKey(record) === siteKey) || site;
        element.addEventListener('mouseenter', () => showPopup(map, currentSite(), false));
        element.addEventListener('mouseleave', () => {
          if (!stickyPopupRef.current) popupRef.current?.remove();
        });
        element.addEventListener('click', (event) => {
          event.stopPropagation();
          showPopup(map, currentSite(), true);
          onSelectRef.current(siteKey);
        });

        markersRef.current.set(
          getStoreMapKey(site),
          new Marker({ element, anchor: 'bottom' })
            .setLngLat([site.lon, site.lat])
            .addTo(map)
        );
      });

    updateMarkerSizes(map);
  };

  // Skip marker teardown when a 30-second poll reports the same statuses.
  // This leaves an open popup and the user's current map view alone.
  const syncMarkersIfChanged = (map: Maplibre, sites: SiteRecord[]) => {
    const signature = sites.map((site) =>
      `${getStoreMapKey(site)}:${site.status}:${getDisplayedStatus(site)}`
    ).join('|');
    if (markerSignatureRef.current === signature) return;
    markerSignatureRef.current = signature;
    syncMarkers(map, sites);
  };

  const fitDefaultView = (map: Maplibre) => {
    fittingRef.current = true;
    map.fitBounds(CFG.mapBounds, {
      padding: { top: 40, bottom: 70, left: 40, right: 320 },
      maxZoom: 9,
      animate: false,
    });
    homeRef.current = {
      center: map.getCenter().toArray() as [number, number],
      zoom: map.getZoom(),
    };
    setMapMoved(false);
    fittingRef.current = false;
  };

  const resetMapView = () => {
    const map = mapRef.current;
    if (!map || !homeRef.current) return;
    popupRef.current?.remove();
    map.easeTo({
      center: homeRef.current.center,
      zoom: homeRef.current.zoom,
      bearing: 0,
      pitch: 0,
      duration: 500,
    });
  };

  /* ── MAP INITIALIZATION ── */
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
      const c = map.getCenter();
      setMapMoved(
        Math.abs(c.lng - home.center[0]) > 0.05 ||
          Math.abs(c.lat - home.center[1]) > 0.05 ||
          Math.abs(map.getZoom() - home.zoom) > 0.15
      );
    });

    map.on('load', () => {
      readyRef.current = true;
      weatherOverlayRef.current = createWeatherMapOverlay(map);
      weatherOverlayRef.current.update(weatherAlertsRef.current, allRef.current, showWeatherRef.current);
      if (weatherFocusRef.current) weatherOverlayRef.current.focus(weatherFocusRef.current);
      syncMarkersIfChanged(map, filteredRef.current);
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

  /* ── Update pin status on polling, without resetting zoom/position ── */
  useEffect(() => {
    if (mapRef.current && readyRef.current) {
      syncMarkersIfChanged(mapRef.current, filteredRef.current);
    }
  }, [allSites]);

  /* ── FILTER & SEARCH VISIBILITY ── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    syncMarkersIfChanged(map, filteredSites);
    // A polling tick should never re-run the user's search animation.
    const focusKey = search.trim() !== '' && filteredSites.length === 1
      ? `${search.trim().toLowerCase()}:${getStoreMapKey(filteredSites[0])}` : '';
    if (focusKey && focusKey !== lastSearchFocusRef.current) {
      const s = filteredSites[0];
      map.easeTo({
        center: [s.lon, s.lat],
        zoom: Math.max(map.getZoom(), 10),
        duration: 600,
      });
    }
    lastSearchFocusRef.current = focusKey;
  }, [filteredSites, search, statusFilter]);

  // Weather polygons are independent of store pins, health and location filters.
  useEffect(() => {
    weatherOverlayRef.current?.update(weatherAlerts, allSites, showWeatherAlerts);
  }, [weatherAlerts, allSites, showWeatherAlerts]);

  useEffect(() => {
    if (focusedWeatherAlertId) weatherOverlayRef.current?.focus(focusedWeatherAlertId);
  }, [focusedWeatherAlertId, weatherFocusRevision]);

  return { mapContainerRef, mapMoved, resetMapView };
}
