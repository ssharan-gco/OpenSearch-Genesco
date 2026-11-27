import { BRANDS, BrandCode, getBrandCode } from './brands';
import type { CustomStore } from '../services/customStores';

export const STORE_CATALOG_PAGE_SIZE = 10;

export interface StoreCatalogFilters {
  search: string;
  brand: BrandCode | 'all' | 'other';
  state: string;
}

/** Brand is derived for display/filtering; no extra field is written to OpenSearch. */
export const getCatalogBrandLabel = (store: CustomStore) => {
  const code = getBrandCode(store);
  return BRANDS.find((brand) => brand.code === code)?.label || 'Other / Unknown';
};

export const filterCatalogStores = (stores: CustomStore[], filters: StoreCatalogFilters) => {
  const query = filters.search.trim().toLowerCase();
  return stores.filter((store) => {
    const brand = getBrandCode(store);
    if (filters.brand !== 'all' && (filters.brand === 'other' ? brand !== null : brand !== filters.brand)) return false;
    if (filters.state !== 'all' && store.state.toUpperCase() !== filters.state) return false;
    return !query || [
      store.recordId, store.siteId, store.name, store.address, store.city, store.state,
      store.zip, store.lat, store.lon, store.origin, store.createdAt, store.updatedAt,
      getCatalogBrandLabel(store),
    ].some((value) => String(value ?? '').toLowerCase().includes(query));
  }).sort((a, b) =>
    a.siteId.localeCompare(b.siteId, undefined, { numeric: true }) ||
    a.name.localeCompare(b.name) || a.recordId.localeCompare(b.recordId));
};

export const pageCatalogStores = (stores: CustomStore[], requestedPage: number) => {
  const pageCount = Math.max(1, Math.ceil(stores.length / STORE_CATALOG_PAGE_SIZE));
  const currentPage = Math.max(1, Math.min(requestedPage, pageCount));
  const firstIndex = (currentPage - 1) * STORE_CATALOG_PAGE_SIZE;
  const pageStores = stores.slice(firstIndex, firstIndex + STORE_CATALOG_PAGE_SIZE);
  const numberStart = Math.max(1, Math.min(currentPage - 2, pageCount - 4));
  const pageNumbers = Array.from(
    { length: Math.min(5, pageCount) }, (_, index) => numberStart + index
  );
  return { pageCount, currentPage, firstIndex, pageStores, pageNumbers };
};
