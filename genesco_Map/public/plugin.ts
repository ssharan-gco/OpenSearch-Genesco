import {
  AppCategory,
  AppMountParameters,
  CoreSetup,
  CoreStart,
  DEFAULT_NAV_GROUPS,
  Plugin,
} from '../../../src/core/public';
import { SampleMapPluginSetup, SampleMapPluginStart, AppPluginStartDependencies } from './types';
import { ENTERPRISE_APP_ID, ENTERPRISE_APP_NAME, PLUGIN_ID, PLUGIN_NAME } from '../common';

// Side-nav "MAP" header. Reusing the same category id lets other map apps group under it.
const MAP_CATEGORY: AppCategory = {
  id: 'storeMapGroup',
  label: 'MAP',
  order: 500,
};

export class SampleMapPlugin implements Plugin<SampleMapPluginSetup, SampleMapPluginStart> {
  public setup(core: CoreSetup): SampleMapPluginSetup {
    const registerMapApp = (
      id: string,
      title: string,
      render: 'renderEnterpriseApp' | 'renderGenscoMapApp',
      order: number
    ) => {
      core.application.register({
        id,
        title,
        category: MAP_CATEGORY,
        order,
        async mount(params: AppMountParameters) {
          const application = await import('./application');
          const [coreStart, depsStart] = await core.getStartServices();
          return application[render](coreStart, depsStart as AppPluginStartDependencies, params);
        },
      });
    };

    registerMapApp(PLUGIN_ID, PLUGIN_NAME, 'renderGenscoMapApp', 6100);
    registerMapApp(ENTERPRISE_APP_ID, ENTERPRISE_APP_NAME, 'renderEnterpriseApp', 6101);

    // With nav-group navigation, apps not added to a group fall into "Custom".
    const link = [
      { id: PLUGIN_ID, category: MAP_CATEGORY, order: 410 },
      { id: ENTERPRISE_APP_ID, category: MAP_CATEGORY, order: 420 },
    ];
    core.chrome.navGroup.addNavLinksToGroup(DEFAULT_NAV_GROUPS.all, link);
    core.chrome.navGroup.addNavLinksToGroup(DEFAULT_NAV_GROUPS.observability, link);

    return {};
  }

  public start(core: CoreStart): SampleMapPluginStart {
    return {};
  }

  public stop() {}
}
