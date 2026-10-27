import {
  AppCategory,
  AppMountParameters,
  CoreSetup,
  CoreStart,
  DEFAULT_NAV_GROUPS,
  Plugin,
} from '../../../src/core/public';
import { SampleMapPluginSetup, SampleMapPluginStart, AppPluginStartDependencies } from './types';
import { PLUGIN_ID, PLUGIN_NAME } from '../common';

// Side-nav "MAP" header. Reusing the same category id lets other map apps group under it.
const MAP_CATEGORY: AppCategory = {
  id: 'storeMapGroup',
  label: 'MAP',
  order: 500,
};

export class SampleMapPlugin implements Plugin<SampleMapPluginSetup, SampleMapPluginStart> {
  public setup(core: CoreSetup): SampleMapPluginSetup {
    core.application.register({
      id: PLUGIN_ID,
      title: PLUGIN_NAME,
      category: MAP_CATEGORY,
      order: 6100,
      async mount(params: AppMountParameters) {
        const { renderApp } = await import('./application');
        const [coreStart, depsStart] = await core.getStartServices();
        return renderApp(coreStart, depsStart as AppPluginStartDependencies, params);
      },
    });

    // With nav-group navigation, apps not added to a group fall into "Custom".
    const link = [{ id: PLUGIN_ID, category: MAP_CATEGORY, order: 410 }];
    core.chrome.navGroup.addNavLinksToGroup(DEFAULT_NAV_GROUPS.all, link);
    core.chrome.navGroup.addNavLinksToGroup(DEFAULT_NAV_GROUPS.observability, link);

    return {};
  }

  public start(core: CoreStart): SampleMapPluginStart {
    return {};
  }

  public stop() {}
}
