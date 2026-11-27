import { ENTERPRISE_APP_ID, PLUGIN_ID } from '../common';

export const GENESCO_IT_ROLE = 'Genesco_IT';
export const GENESCO_USERS_ROLE = 'Genesco_Users';
export const GENESCO_ADMIN_ROLE = 'admin';

export type GenesCoMapAppId = typeof PLUGIN_ID | typeof ENTERPRISE_APP_ID;

export const canAccessMapApp = (roles: string[], appId: GenesCoMapAppId): boolean => {
  if (roles.includes(GENESCO_ADMIN_ROLE)) return true;
  if (appId === PLUGIN_ID) return roles.includes(GENESCO_IT_ROLE);
  return roles.includes(GENESCO_USERS_ROLE);
};

export const canAccessMapApi = (roles: string[], method: string, pathname: string): boolean => {
  if (roles.includes(GENESCO_ADMIN_ROLE)) return true;
  const isGenesCoRole = roles.includes(GENESCO_IT_ROLE) || roles.includes(GENESCO_USERS_ROLE);
  if (!isGenesCoRole) return false;

  const isRegisterNoteWrite =
    method.toLowerCase() === 'put' &&
    /^\/api\/genesco_map\/register_notes\/[^/]+\/[^/]+$/.test(pathname);
  return !isRegisterNoteWrite || roles.includes(GENESCO_IT_ROLE);
};

export const getGenesCoAppIdFromPath = (pathname: string): GenesCoMapAppId | undefined => {
  const match = pathname.match(/^\/app\/([^/]+)/);
  if (match?.[1] === PLUGIN_ID) return PLUGIN_ID;
  if (match?.[1] === ENTERPRISE_APP_ID) return ENTERPRISE_APP_ID;
  return undefined;
};

export const isGenesCoMapApiPath = (pathname: string): boolean =>
  pathname.startsWith('/api/genesco_map/') || pathname.startsWith('/api/sample_map/');
