import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppMountParameters, CoreStart } from '../../../src/core/public';
import { AppPluginStartDependencies } from './types';
import { setOsdBasePath } from './lib/envConfig';
import { EnterpriseApp } from './components/EnterpriseApp';
import { GenscoApp } from './components/GenscoApp';
import genescoLogo from './assets/genesco_med_c.svg';

const GENESCO_HEADER_CLASS = 'gensco-header-brand-active';
const GENESCO_HEADER_LOGO_PROPERTY = '--gensco-header-logo';

const render = (
  App: typeof EnterpriseApp | typeof GenscoApp,
  { notifications, http }: CoreStart,
  { navigation }: AppPluginStartDependencies,
  { appBasePath, element }: AppMountParameters
) => {
  setOsdBasePath(http.basePath.get());
  const body = document.body;
  const hadBrandClass = body.classList.contains(GENESCO_HEADER_CLASS);
  const previousLogo = body.style.getPropertyValue(GENESCO_HEADER_LOGO_PROPERTY);
  const previousLogoPriority = body.style.getPropertyPriority(GENESCO_HEADER_LOGO_PROPERTY);
  body.classList.add(GENESCO_HEADER_CLASS);
  body.style.setProperty(GENESCO_HEADER_LOGO_PROPERTY, `url("${genescoLogo}")`);

  // OSD's `.app-wrapper` min-height assumes a one-row header; relax it while mounted
  // so the stacked new-topnav header rows don't add a stray scrollbar.
  const appWrapper = element.closest('.app-wrapper') as HTMLElement | null;
  const prevMinHeight = appWrapper?.style.minHeight ?? '';
  if (appWrapper) appWrapper.style.minHeight = '0';

  const root = createRoot(element);
  root.render(
    <App basename={appBasePath} notifications={notifications} http={http} navigation={navigation} />
  );

  return () => {
    root.unmount();
    if (appWrapper) appWrapper.style.minHeight = prevMinHeight;
    if (!hadBrandClass) body.classList.remove(GENESCO_HEADER_CLASS);
    if (previousLogo) {
      body.style.setProperty(GENESCO_HEADER_LOGO_PROPERTY, previousLogo, previousLogoPriority);
    } else {
      body.style.removeProperty(GENESCO_HEADER_LOGO_PROPERTY);
    }
  };
};

export const renderEnterpriseApp = (
  coreStart: CoreStart,
  depsStart: AppPluginStartDependencies,
  params: AppMountParameters
) => render(EnterpriseApp, coreStart, depsStart, params);

export const renderGenscoMapApp = (
  coreStart: CoreStart,
  depsStart: AppPluginStartDependencies,
  params: AppMountParameters
) => render(GenscoApp, coreStart, depsStart, params);
