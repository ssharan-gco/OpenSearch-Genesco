import { Map as Maplibre, Popup } from 'maplibre-gl';
import { escapeHtml } from './constants';
import { SiteRecord } from './types';
import {
  WeatherAlert,
  getWeatherBounds,
  getWeatherTitle,
  pointInWeatherGeometry,
  storesInWeatherAlert,
} from './weatherAlerts';

/**
 * Weather polygon overlay shared by the GenesCo IT and USERS maps.
 *
 * MapLibre's GeoJSON fill layer was not displaying the NWS geo_shape polygons
 * in the user's local Dashboards build, although the data and map zoom worked.
 * Draw the exact same GeoJSON boundaries using the already-created MapLibre map's
 * coordinate projection, on a transparent SVG OVER its WebGL canvas.  This
 * avoids the GeoJSON tile/worker rendering path, and does not change store pins,
 * the underlying raster map, search, or status logic.
 *
 * SVG uses pointer-events:none so the map keeps full drag/zoom/pin behavior;
 * polygon hover/click hit testing uses the same geographic polygons.
 */
const NS = 'http://www.w3.org/2000/svg';
type Coord = [number, number];

type MappedAlert = {
  alert: WeatherAlert;
  bounds: [[number, number], [number, number]];
};

const isCoordinate = (p: any): p is Coord =>
  Array.isArray(p) && p.length >= 2 &&
  typeof p[0] === 'number' && typeof p[1] === 'number' &&
  Number.isFinite(p[0]) && Number.isFinite(p[1]) &&
  p[0] >= -180 && p[0] <= 180 && p[1] >= -90 && p[1] <= 90;

const getPolygons = (geometry: any): any[][] => {
  if (!geometry) return [];
  if (geometry.type === 'Polygon' && Array.isArray(geometry.coordinates)) {
    return [geometry.coordinates];
  }
  if (geometry.type === 'MultiPolygon' && Array.isArray(geometry.coordinates)) {
    return geometry.coordinates;
  }
  return [];
};

const alertPopupHtml = (alert: WeatherAlert, sites: SiteRecord[]): string => {
  const p = alert.properties;
  const matching = alert.geometry ? storesInWeatherAlert(alert, sites) : [];
  const storeText = alert.geometry
    ? `${matching.length} mapped GenesCo store(s) inside this alert polygon` +
      (matching.length
        ? `<div class="genesco-weather-popup-stores">${matching.slice(0, 12)
            .map((s) => escapeHtml(`#${s.siteId} ${s.city}, ${s.state}`)).join(' · ')}` +
            (matching.length > 12 ? ' · …' : '') + '</div>'
        : '')
    : 'Affected-store count unavailable: NWS has not provided a mapped polygon';
  const dateText = p.ends || p.expires || '';
  const summary = p.headline || p.description || '';
  return (
    `<div class="genesco-weather-popup">` +
    `<strong>${escapeHtml(getWeatherTitle(alert))}</strong>` +
    `<div class="genesco-weather-popup-level">${escapeHtml(p.severity || 'Alert')}</div>` +
    (p.areaDesc ? `<p>${escapeHtml(p.areaDesc)}</p>` : '') +
    (dateText ? `<p>Ends/expires: ${escapeHtml(new Date(dateText).toLocaleString())}</p>` : '') +
    (summary ? `<p>${escapeHtml(summary.slice(0, 330))}${summary.length > 330 ? '…' : ''}</p>` : '') +
    `<div class="genesco-weather-popup-stores-title">${storeText}</div>` +
    `<div class="genesco-weather-popup-note">Store positions are approximate where source coordinates were approximate.</div>` +
    `</div>`
  );
};

/**
 * Project GeoJSON polygon rings onto the actual MapLibre canvas. Use even-odd
 * fill so NWS inner rings remain holes and not falsely marked affected areas.
 * During interactive zoom/pan, nearly identical screen points are skipped.
 */
const projectedPath = (map: Maplibre, geometry: any): string => {
  const subpaths: string[] = [];
  for (const polygon of getPolygons(geometry)) {
    if (!Array.isArray(polygon)) continue;
    for (const ring of polygon) {
      if (!Array.isArray(ring) || ring.length < 4) continue;
      const projected: Array<{ x: number; y: number }> = [];
      for (const position of ring) {
        if (!isCoordinate(position)) continue;
        const point = map.project([position[0], position[1]]);
        if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) continue;
        const prev = projected[projected.length - 1];
        // Screen-space thinning avoids huge DOM paths from detailed NWS zones.
        if (prev && Math.abs(point.x - prev.x) < 0.7 && Math.abs(point.y - prev.y) < 0.7) {
          continue;
        }
        projected.push({ x: point.x, y: point.y });
      }
      if (projected.length < 3) continue;
      const parts = projected.map((p, index) =>
        `${index ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`
      );
      subpaths.push(`${parts.join('')}Z`);
    }
  }
  return subpaths.join('');
};

export const createWeatherMapOverlay = (map: Maplibre) => {
  let alerts: WeatherAlert[] = [];
  let mapped: MappedAlert[] = [];
  let sites: SiteRecord[] = [];
  let visible = false;
  let focusedId: string | null = null;
  let hoveredId: string | null = null;
  let pinnedId: string | null = null;
  let popup: Popup | null = null;
  let drawingFrame: number | null = null;
  let destroyed = false;

  // Inside the map's canvas container: above raster tiles, below MapLibre's
  // popup/controls and the existing GenesCo floating panels.
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', 'genesco-weather-svg-overlay');
  Object.assign(svg.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: '1',
  });
  map.getCanvasContainer().appendChild(svg);

  const lookup = (id: string) => alerts.find((a) => a.id === id);
  const showPopup = (alert: WeatherAlert, lngLat: Coord, pinned: boolean) => {
    popup?.remove();
    const nextPopup = new Popup({
      closeButton: pinned,
      closeOnClick: false,
      maxWidth: '330px',
      className: 'genesco-weather-map-popup',
      offset: 14,
    })
      .setLngLat(lngLat)
      .setHTML(alertPopupHtml(alert, sites))
      .addTo(map);
    popup = nextPopup;
    nextPopup.on('close', () => {
      if (popup !== nextPopup) return;
      popup = null;
      if (pinned) pinnedId = null;
    });
  };

  const draw = () => {
    drawingFrame = null;
    if (destroyed || !visible) {
      svg.style.display = 'none';
      return;
    }
    svg.style.display = 'block';
    const canvas = map.getCanvas();
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    // Paint selected area last and with a thicker outline so a selected alert
    // is conspicuous even if its boundary is only a few pixels across.
    const ordered = mapped.slice().sort((a, b) =>
      Number(a.alert.id === focusedId) - Number(b.alert.id === focusedId)
    );
    for (const item of ordered) {
      const { alert, bounds } = item;
      const [west, south] = bounds[0];
      const [east, north] = bounds[1];
      // Cheap bounds culling: don't construct SVG paths for offscreen states.
      // Skip this optimization for dateline-spanning shapes, e.g. Alaska.
      if (east - west < 180) {
        const topLeft = map.project([west, north]);
        const bottomRight = map.project([east, south]);
        if (Math.max(topLeft.x, bottomRight.x) < -25 ||
            Math.min(topLeft.x, bottomRight.x) > width + 25 ||
            Math.max(topLeft.y, bottomRight.y) < -25 ||
            Math.min(topLeft.y, bottomRight.y) > height + 25) continue;
      }
      const pathData = projectedPath(map, alert.geometry);
      if (!pathData) continue;
      const selected = alert.id === focusedId;
      const extreme = (alert.properties.severity || '').toLowerCase() === 'extreme';
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('fill-rule', 'evenodd');
      path.setAttribute('fill', extreme ? '#b91c1c' : '#ef4444');
      path.setAttribute('fill-opacity', selected ? '0.55' : '0.36');
      path.setAttribute('stroke', selected ? '#991b1b' : '#dc2626');
      path.setAttribute('stroke-width', selected ? '4' : '2.4');
      path.setAttribute('stroke-opacity', '1');
      path.setAttribute('stroke-linejoin', 'round');
      path.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(path);
    }
  };

  const scheduleDraw = () => {
    if (destroyed || drawingFrame !== null) return;
    drawingFrame = window.requestAnimationFrame(draw);
  };

  // Compute bounds once per refresh. The same geometry is used for highlighting,
  // geographic hover/click detection and fitBounds.
  const findAt = (lon: number, lat: number): WeatherAlert | undefined => {
    if (!visible) return undefined;
    for (let index = mapped.length - 1; index >= 0; index--) {
      const item = mapped[index];
      if (lon < item.bounds[0][0] || lon > item.bounds[1][0] ||
          lat < item.bounds[0][1] || lat > item.bounds[1][1]) continue;
      if (pointInWeatherGeometry(lon, lat, item.alert.geometry)) return item.alert;
    }
    return undefined;
  };

  const onMove = (event: any) => {
    if (pinnedId) return;
    const alert = findAt(event.lngLat.lng, event.lngLat.lat);
    const nextId = alert?.id || null;
    if (nextId === hoveredId) return;
    hoveredId = nextId;
    map.getCanvas().style.cursor = nextId ? 'pointer' : '';
    if (alert) {
      showPopup(alert, [event.lngLat.lng, event.lngLat.lat], false);
    } else {
      popup?.remove();
      popup = null;
    }
  };

  const onLeave = () => {
    hoveredId = null;
    map.getCanvas().style.cursor = '';
    if (!pinnedId) {
      popup?.remove();
      popup = null;
    }
  };

  const focus = (id: string) => {
    if (!visible) return;
    const alert = lookup(id);
    const bounds = alert && getWeatherBounds(alert.geometry);
    if (!alert || !bounds) return;
    focusedId = id;
    hoveredId = null;
    scheduleDraw();
    const [[west, south], [east, north]] = bounds;
    if (west === east && south === north) {
      map.flyTo({ center: [west, south], zoom: 9, duration: 700 });
    } else {
      const mobile = map.getContainer().clientWidth < 720;
      map.fitBounds(bounds, {
        padding: mobile
          ? { top: 40, bottom: 60, left: 20, right: 20 }
          : { top: 90, bottom: 95, left: 350, right: 90 },
        maxZoom: 10,
        duration: 700,
      });
    }
    showPopup(alert, [(west + east) / 2, (south + north) / 2], true);
    pinnedId = id;
  };

  const onClick = (event: any) => {
    const alert = findAt(event.lngLat.lng, event.lngLat.lat);
    if (alert) {
      focus(alert.id);
    } else if (pinnedId) {
      pinnedId = null;
      focusedId = null;
      popup?.remove();
      popup = null;
      scheduleDraw();
    }
  };

  map.on('move', scheduleDraw);
  map.on('resize', scheduleDraw);
  map.on('mousemove', onMove);
  map.on('click', onClick);
  map.getCanvas().addEventListener('mouseleave', onLeave);

  return {
    update(nextAlerts: WeatherAlert[], nextSites: SiteRecord[], nextVisible: boolean) {
      alerts = nextAlerts;
      sites = nextSites;
      visible = nextVisible;
      mapped = alerts
        .map((alert) => ({ alert, bounds: getWeatherBounds(alert.geometry) }))
        .filter((row): row is MappedAlert => !!row.bounds);
      if (!visible) {
        focusedId = null;
        pinnedId = null;
        onLeave();
        popup?.remove();
        popup = null;
      } else if (focusedId && !lookup(focusedId)) {
        focusedId = null;
        pinnedId = null;
      }
      scheduleDraw();
    },
    focus,
    destroy() {
      destroyed = true;
      if (drawingFrame !== null) window.cancelAnimationFrame(drawingFrame);
      popup?.remove();
      map.getCanvas().style.cursor = '';
      map.off('move', scheduleDraw);
      map.off('resize', scheduleDraw);
      map.off('mousemove', onMove);
      map.off('click', onClick);
      map.getCanvas().removeEventListener('mouseleave', onLeave);
      svg.remove();
    },
  };
};

export type WeatherOverlayController = ReturnType<typeof createWeatherMapOverlay>;
