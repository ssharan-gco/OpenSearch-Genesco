import { CoreStart } from '../../../../src/core/public';
import { SiteLocation } from '../lib/types';

/** The shared, indexed store catalog for IT (write) and USERS (read). */
export interface CustomStore extends SiteLocation {
  recordId: string;
  origin?: string;
  createdAt?: string;
  updatedAt?: string;
}
export type StoreFields = SiteLocation;
export interface CustomStoreClient {
  list: () => Promise<CustomStore[]>;
  add: (store: StoreFields) => Promise<CustomStore>;
  update: (recordId: string, store: StoreFields) => Promise<CustomStore>;
  remove: (recordId: string) => Promise<void>;
}

export const createCustomStoreClient = (http: CoreStart['http']): CustomStoreClient => ({
  async list() {
    const result = await http.get<{ stores: CustomStore[] }>('/api/genesco_map/stores');
    return result.stores || [];
  },
  async add(store) {
    const result = await http.post<{ store: CustomStore }>('/api/genesco_map/stores', {
      body: JSON.stringify(store),
    });
    return result.store;
  },
  async update(recordId, store) {
    const result = await http.put<{ store: CustomStore }>(
      `/api/genesco_map/stores/${encodeURIComponent(recordId)}`,
      { body: JSON.stringify(store) }
    );
    return result.store;
  },
  async remove(recordId) {
    await http.delete(`/api/genesco_map/stores/${encodeURIComponent(recordId)}`);
  },
});
