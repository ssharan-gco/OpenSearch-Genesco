import { VM_PROXY_BASE } from '../../common';

// OSD server base path ('' with --no-base-path). Set once at mount.
let osdBasePath = '';

export const setOsdBasePath = (basePath: string): void => {
  osdBasePath = (basePath || '').replace(/\/+$/, '');
};

/** Same-origin URL of the plugin's VictoriaMetrics proxy (`query` or `query_range`). */
export const vmUrl = (api: 'query' | 'query_range', params: Record<string, string | number>) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => qs.set(k, String(v)));
  return `${osdBasePath}${VM_PROXY_BASE}/${api}?${qs.toString()}`;
};

/** Fetches through the OSD proxy with the session cookie + xsrf header; null on network failure. */
export const vmFetch = (url: string): Promise<Response | null> =>
  fetch(url, {
    credentials: 'same-origin',
    headers: { 'osd-xsrf': 'true' },
  }).catch(() => null);
