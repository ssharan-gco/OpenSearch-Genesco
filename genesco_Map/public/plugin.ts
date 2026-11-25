import { BehaviorSubject } from 'rxjs';
import {
  AppCategory,
  AppMountParameters,
  AppNavLinkStatus,
  AppUpdater,
  CoreSetup,
  CoreStart,
  DEFAULT_NAV_GROUPS,
  Plugin,
} from '../../../src/core/public';
import { SampleMapPluginSetup, SampleMapPluginStart, AppPluginStartDependencies } from './types';
import { ENTERPRISE_APP_ID, ENTERPRISE_APP_NAME, PLUGIN_ID, PLUGIN_NAME } from '../common';
import { getVisibleMapApps } from './role_visibility';

// Side-nav "MAP" header. Reusing the same category id lets other map apps group under it.
const MAP_CATEGORY: AppCategory = {
  id: 'storeMapGroup',
  label: 'MAP',
  order: 500,
};

export class SampleMapPlugin implements Plugin<SampleMapPluginSetup, SampleMapPluginStart> {
  private readonly genscoAppUpdater = new BehaviorSubject<AppUpdater>(() => ({
    navLinkStatus: AppNavLinkStatus.hidden,
  }));
  private readonly enterpriseAppUpdater = new BehaviorSubject<AppUpdater>(() => ({
    navLinkStatus: AppNavLinkStatus.hidden,
  }));

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
        updater$: id === PLUGIN_ID ? this.genscoAppUpdater : this.enterpriseAppUpdater,
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
    void core.http
      .get<{ roles: string[] }>('/api/genesco_map/user_roles')
      .then(({ roles }) => this.updateAppVisibility(roles))
      .catch((error: Error) => {
        core.notifications.toasts.addError(error, {
          title: 'Unable to determine Gensco map role visibility',
        });
        this.updateAppVisibility([]);
      });
    return {};
  }

  public stop() {}

  private updateAppVisibility(roles: string[]) {
    const { showGenscoIt, showGenscoUsers } = getVisibleMapApps(roles);
    this.genscoAppUpdater.next(() => ({
      navLinkStatus: showGenscoIt ? AppNavLinkStatus.visible : AppNavLinkStatus.hidden,
    }));
    this.enterpriseAppUpdater.next(() => ({
      navLinkStatus: showGenscoUsers ? AppNavLinkStatus.visible : AppNavLinkStatus.hidden,
    }));
  }
}
