import { BehaviorSubject } from 'rxjs';
import {
  AppCategory,
  AppNavLinkStatus,
  AppUpdater,
  AppMountParameters,
  CoreSetup,
  CoreStart,
  DEFAULT_NAV_GROUPS,
  Plugin,
} from '../../../src/core/public';
import { SampleMapPluginSetup, SampleMapPluginStart, AppPluginStartDependencies } from './types';
import { ENTERPRISE_APP_ID, ENTERPRISE_APP_NAME, PLUGIN_ID, PLUGIN_NAME } from '../common';
import { AuthInfo, hasBusinessUsersRole } from './lib/user_roles';

// Side-nav "MAP" header. Reusing the same category id lets other map apps group under it.
const MAP_CATEGORY: AppCategory = {
  id: 'storeMapGroup',
  label: 'MAP',
  order: 500,
};

export class SampleMapPlugin implements Plugin<SampleMapPluginSetup, SampleMapPluginStart> {
  private readonly itAppUpdater$ = new BehaviorSubject<AppUpdater>(() => ({
    navLinkStatus: AppNavLinkStatus.hidden,
  }));

  public setup(core: CoreSetup): SampleMapPluginSetup {
    const registerMapApp = (
      id: string,
      title: string,
      render: 'renderEnterpriseApp' | 'renderGenscoMapApp',
      order: number,
      updater$?: BehaviorSubject<AppUpdater>
    ) => {
      core.application.register({
        id,
        title,
        category: MAP_CATEGORY,
        order,
        updater$,
        async mount(params: AppMountParameters) {
          const application = await import('./application');
          const [coreStart, depsStart] = await core.getStartServices();
          return application[render](coreStart, depsStart as AppPluginStartDependencies, params);
        },
      });
    };

    registerMapApp(PLUGIN_ID, PLUGIN_NAME, 'renderGenscoMapApp', 6100, this.itAppUpdater$);
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
      .get<AuthInfo>('/api/v1/auth/authinfo')
      .then((authInfo) => {
        const isBusinessUsers = hasBusinessUsersRole(authInfo);
        this.itAppUpdater$.next(() => ({
          navLinkStatus: isBusinessUsers
            ? AppNavLinkStatus.hidden
            : AppNavLinkStatus.default,
        }));

        if (isBusinessUsers) {
          core.chrome.navLinks.showOnly(ENTERPRISE_APP_ID);
        }
      })
      .catch((error: unknown) => {
        console.error('Unable to determine the current user roles for Genesco navigation.', error);
        this.itAppUpdater$.next(() => ({ navLinkStatus: AppNavLinkStatus.default }));
      });

    return {};
  }

  public stop() {
    this.itAppUpdater$.complete();
  }
}
