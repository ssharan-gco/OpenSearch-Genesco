import {
  canAccessMapApi,
  canAccessMapApp,
  getGenesCoAppIdFromPath,
  GENESCO_ADMIN_ROLE,
  GENESCO_IT_ROLE,
  GENESCO_USERS_ROLE,
} from './roleAccess';
import { ENTERPRISE_APP_ID, PLUGIN_ID } from '../common';

describe('GenesCo map role access', () => {
  test('Genesco_IT can access only the IT app', () => {
    expect(canAccessMapApp([GENESCO_IT_ROLE], PLUGIN_ID)).toBe(true);
    expect(canAccessMapApp([GENESCO_IT_ROLE], ENTERPRISE_APP_ID)).toBe(false);
  });

  test('Genesco_Users can access only the USERS app', () => {
    expect(canAccessMapApp([GENESCO_USERS_ROLE], PLUGIN_ID)).toBe(false);
    expect(canAccessMapApp([GENESCO_USERS_ROLE], ENTERPRISE_APP_ID)).toBe(true);
  });

  test('admin can access both apps', () => {
    expect(canAccessMapApp([GENESCO_ADMIN_ROLE], PLUGIN_ID)).toBe(true);
    expect(canAccessMapApp([GENESCO_ADMIN_ROLE], ENTERPRISE_APP_ID)).toBe(true);
  });

  test('unknown roles cannot access either app or API', () => {
    expect(canAccessMapApp(['other'], PLUGIN_ID)).toBe(false);
    expect(canAccessMapApi(['other'], 'GET', '/api/sample_map/vm/query')).toBe(false);
  });

  test('either GenesCo role can read APIs, but only IT and admin can save notes', () => {
    const notePath = '/api/genesco_map/register_notes/0013/1';
    expect(canAccessMapApi([GENESCO_USERS_ROLE], 'GET', notePath)).toBe(true);
    expect(canAccessMapApi([GENESCO_USERS_ROLE], 'PUT', notePath)).toBe(false);
    expect(canAccessMapApi([GENESCO_IT_ROLE], 'PUT', notePath)).toBe(true);
    expect(canAccessMapApi([GENESCO_ADMIN_ROLE], 'PUT', notePath)).toBe(true);
  });

  test('identifies direct app URLs for authorization checks', () => {
    expect(getGenesCoAppIdFromPath('/app/genescoMapStore')).toBe(PLUGIN_ID);
    expect(getGenesCoAppIdFromPath('/app/genescoEnterprise/some/path')).toBe(ENTERPRISE_APP_ID);
    expect(getGenesCoAppIdFromPath('/app/discover')).toBeUndefined();
  });
});
