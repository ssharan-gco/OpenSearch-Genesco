import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppMountParameters, CoreStart } from '../../../src/core/public';
import { AppPluginStartDependencies } from './types';
import { setOsdBasePath } from './lib/envConfig';
import { GenscoApp } from './components/GenscoApp';

export const renderApp = (
  { notifications, http }: CoreStart,
  { navigation }: AppPluginStartDependencies,
  { appBasePath, element }: AppMountParameters
) => {
  setOsdBasePath(http.basePath.get());

  // OSD's `.app-wrapper` min-height assumes a one-row header; relax it while mounted
  // so the stacked new-topnav header rows don't add a stray scrollbar.
  const appWrapper = element.closest('.app-wrapper') as HTMLElement | null;
  const prevMinHeight = appWrapper?.style.minHeight ?? '';
  if (appWrapper) appWrapper.style.minHeight = '0';

  const root = createRoot(element);
  root.render(
    <GenscoApp basename={appBasePath} notifications={notifications} http={http} navigation={navigation} />
  );

  return () => {
    root.unmount();
    if (appWrapper) appWrapper.style.minHeight = prevMinHeight;
  };
};
