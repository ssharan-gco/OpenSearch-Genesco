import { schema, TypeOf } from '@osd/config-schema';
import { PluginConfigDescriptor, PluginInitializerContext } from '../../../src/core/server';
import { SampleMapPlugin } from './plugin';

export const configSchema = schema.object({
  // Base URL of VictoriaMetrics (Prometheus-compatible API). Include any
  // -http.pathPrefix the instance runs with. Override in opensearch_dashboards.yml:
  //   sample_map.victoriaMetricsUrl: "http://<host>:8428"
  victoriaMetricsUrl: schema.string({ defaultValue: 'http://localhost:8428' }),
});

export type SampleMapConfig = TypeOf<typeof configSchema>;

export const config: PluginConfigDescriptor<SampleMapConfig> = {
  schema: configSchema,
};

export function plugin(initializerContext: PluginInitializerContext) {
  return new SampleMapPlugin(initializerContext);
}

export { SampleMapPluginSetup, SampleMapPluginStart } from './types';
