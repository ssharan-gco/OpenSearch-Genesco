import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from '../../../src/core/server';

import { SampleMapPluginSetup, SampleMapPluginStart } from './types';
import { SampleMapConfig } from './index';
import { defineRoutes } from './routes';
import { registerRegisterNotesRoutes } from './routes/registerNotes';
import { registerCustomStoresRoutes } from './routes/customStores';

export class SampleMapPlugin implements Plugin<SampleMapPluginSetup, SampleMapPluginStart> {
  private readonly logger: Logger;
  private readonly initializerContext: PluginInitializerContext;
  private vmBaseUrl = '';

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
    this.initializerContext = initializerContext;
  }

  public setup(core: CoreSetup) {
    this.logger.debug('sample_map: Setup');

    // The observable emits synchronously on subscribe, so vmBaseUrl is set before any request.
    this.initializerContext.config.create<SampleMapConfig>().subscribe((cfg) => {
      this.vmBaseUrl = cfg.victoriaMetricsUrl;
    });

    const router = core.http.createRouter();
    defineRoutes(router, () => this.vmBaseUrl);
    registerRegisterNotesRoutes(router);
    registerCustomStoresRoutes(router);
    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('sample_map: Started');
    return {};
  }

  public stop() {}
}
