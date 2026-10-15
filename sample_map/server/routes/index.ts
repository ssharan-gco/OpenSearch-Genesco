import { schema } from '@osd/config-schema';
import { IRouter } from '../../../../src/core/server';
import { VM_PROXY_BASE } from '../../common';

// Node 18+/20 provides a global fetch; declared to avoid pulling DOM lib types into the server build.
declare const fetch: any;

const buildUpstreamUrl = (vmBaseUrl: string, apiPath: string, query: Record<string, unknown>) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query || {})) {
    if (value === undefined || value === null) continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return `${vmBaseUrl.replace(/\/+$/, '')}${apiPath}${qs ? `?${qs}` : ''}`;
};

const vmQueryValidation = schema.object(
  {
    query: schema.string(),
    time: schema.maybe(schema.string()),
    start: schema.maybe(schema.string()),
    end: schema.maybe(schema.string()),
    step: schema.maybe(schema.string()),
    timeout: schema.maybe(schema.string()),
  },
  { unknowns: 'allow' }
);

/**
 * Read-only VictoriaMetrics proxy. The browser calls OSD (same-origin, authenticated
 * session) and OSD forwards to the configured VM base URL. Only the Prometheus
 * query endpoints are exposed; the upstream host always comes from server config.
 */
export function defineRoutes(router: IRouter, getVmBaseUrl: () => string) {
  const proxy = (apiPath: string) => async (
    context: unknown,
    request: { query: Record<string, unknown> },
    response: any
  ) => {
    const url = buildUpstreamUrl(getVmBaseUrl(), apiPath, request.query);
    try {
      const upstream = await fetch(url, { method: 'GET' });
      return response.custom({
        statusCode: upstream.status,
        headers: { 'content-type': upstream.headers?.get?.('content-type') || 'application/json' },
        body: await upstream.text(),
      });
    } catch (err) {
      return response.customError({
        statusCode: 502,
        body: `VictoriaMetrics proxy error: ${(err as Error)?.message || 'unknown error'}`,
      });
    }
  };

  router.get(
    { path: `${VM_PROXY_BASE}/query`, validate: { query: vmQueryValidation } },
    proxy('/api/v1/query')
  );

  router.get(
    { path: `${VM_PROXY_BASE}/query_range`, validate: { query: vmQueryValidation } },
    proxy('/api/v1/query_range')
  );
}
