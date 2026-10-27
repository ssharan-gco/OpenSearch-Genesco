import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SampleMapPluginSetup {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SampleMapPluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
}
