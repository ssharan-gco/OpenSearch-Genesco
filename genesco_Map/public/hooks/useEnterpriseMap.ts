import { useEffect, useRef, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Map as Maplibre, Marker, NavigationControl, Popup } from 'maplibre-gl';
import { CFG, displayLabel, escapeHtml, pinSvg, STATUS_COLORS } from '../lib/constants';
import { createPluginMap, destroyPluginMap } from '../lib/maplibreMap';
import { getStoreMapKey } from '../lib/storeMapKey';
import { SiteRecord, SiteStatus, StatusFilter } from '../lib/types';

interface UseEnterpriseMapArgs {
  allSites: SiteRecord[];
  filteredSites: SiteRecord[];
  statusFilter: StatusFilter;
  search: string;
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

const buildHealthPopup = (site: SiteRecord, status: SiteStatus) => {
  const operationalStatuses: { [register: string]: 'Up' | 'Down' } =
    site.health.operationalRegisterStatuses ||
    Object.entries(site.health.registerStatuses || {}).reduce<
      { [register: string]: 'Up' | 'Down' }
    >((statuses, [register, registerStatus]) => {
      statuses[register] = registerStatus === 'Down' ? 'Down' : 'Up';
      return statuses;
    }, {});
  const registerStatuses = Object.entries(operationalStatuses).sort(([a], [b]) =>
    a.localeCompare(b, undefined, { numeric: true })
  );
  const registers =
    registerStatuses.length === 0
      ? `<div class="enterprise-health-popup__register"><span>Register status</span><strong class="unknown">${!site.health.operationalRegisterStatuses && site.health.registersDown ? 'Down' : 'No data'}</strong></div>`
      : registerStatuses
          .map(([register, registerStatus]) => {
            const statusClass = registerStatus.toLowerCase();
            return `<div class="enterprise-health-popup__register"><span>Register ${escapeHtml(register)}</span><strong class="${statusClass}">${escapeHtml(registerStatus)}</strong></div>`;
          })
          .join('');
  const location = [site.city, site.state].filter(Boolean).join(', ');
  const color = STATUS_COLORS[status] || STATUS_COLORS.NoStatus;

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
}: UseEnterpriseMapArgs) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Maplibre | null>(null);
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
      element.innerHTML = pinSvg(STATUS_COLORS[displayedStatus] || STATUS_COLORS.NoStatus);
      element.addEventListener('click', (event) => {
        event.stopPropagation();
        popupRef.current?.remove();
        popupRef.current = new Popup({
          closeButton: true,
          closeOnClick: true,
          offset: 14,
          className: 'enterprise-store-popup',
        })
          .setLngLat(coordinates)
          .setHTML(buildHealthPopup(site, displayedStatus))
          .addTo(map);
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
      syncMarkers(map, filteredRef.current, allRef.current);
      map.on('zoom', () => updateMarkerSizes(map));
      fitDefaultView(map);
    });

    return () => {
      window.removeEventListener('resize', onResize);
      readyRef.current = false;
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

  return { mapContainerRef, mapMoved, resetMapView };
}
