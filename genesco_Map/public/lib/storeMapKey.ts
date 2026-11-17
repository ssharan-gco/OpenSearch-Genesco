import { SiteLocation } from './types';

/** Unique location key for map markers/IT selection; do not use for POS metrics. */
export const getStoreMapKey = (site: Pick<SiteLocation, 'siteId' | 'name' | 'address' | 'city' | 'state'>): string =>
  [site.siteId, site.name, site.address, site.city, site.state].join('|');
