import './index.scss';

import { SampleMapPlugin } from './plugin';

export function plugin() {
  return new SampleMapPlugin();
}
export { SampleMapPluginSetup, SampleMapPluginStart } from './types';
