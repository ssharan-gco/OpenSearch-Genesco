import { randomBytes } from 'crypto';
import { schema } from '@osd/config-schema';
import { IRouter } from '../../../../src/core/server';

/** The store catalog is the ONLY live source for map locations in DEV/PROD. */
const STORES_INDEX = 'genesco-stores';
const ID_FORMAT = /^[a-zA-Z0-9_-]{1,90}$/;
const normalizeStoreNumber = (value: string) => {
  const number = String(value || '').trim();
  return /^\d{1,6}$/.test(number) ? number.padStart(4, '0') : number;
};
const codeOf = (error: any) => Number(error?.meta?.statusCode || error?.statusCode || 500);
const messageOf = (error: any) =>
  error?.meta?.body?.error?.reason || error?.message || 'OpenSearch request failed';
const currentClient = (context: any) => context.core.opensearch.client.asCurrentUser;
const catalogExists = async (client: any) =>
  Boolean((await client.indices.exists({ index: STORES_INDEX })).body);

interface StoreFields {
  siteId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lon: number;
}
const storeFieldsSchema = schema.object({
  siteId: schema.string(),
  name: schema.string(),
  address: schema.string(),
  city: schema.string(),
  state: schema.string(),
  zip: schema.string(),
  lat: schema.number(),
  lon: schema.number(),
});
const validateStore = (raw: StoreFields): { store?: StoreFields; error?: string } => {
  const store = {
    siteId: normalizeStoreNumber(raw.siteId),
    name: raw.name.trim(),
    address: raw.address.trim(),
    city: raw.city.trim(),
    state: raw.state.trim().toUpperCase(),
    zip: raw.zip.trim(),
    lat: raw.lat,
    lon: raw.lon,
  };
  if (!/^\d{4,6}$/.test(store.siteId)) return { error: 'Store number must be 1–6 digits' };
  if (!store.name || store.name.length > 160) return { error: 'Store name must be 1–160 characters' };
  if (!store.address || store.address.length > 300) return { error: 'Address must be 1–300 characters' };
  if (!store.city || store.city.length > 120) return { error: 'City must be 1–120 characters' };
  if (!/^[A-Z]{2,3}$/.test(store.state)) return { error: 'State/province must be a 2–3 letter code' };
  if (!store.zip || store.zip.length > 20) return { error: 'ZIP/postal code must be 1–20 characters' };
  if (!Number.isFinite(store.lat) || store.lat < -90 || store.lat > 90) return { error: 'Latitude must be between −90 and 90' };
  if (!Number.isFinite(store.lon) || store.lon < -180 || store.lon > 180) return { error: 'Longitude must be between −180 and 180' };
  return { store };
};
const ensureCatalog = async (client: any) => {
  if (!(await catalogExists(client))) {
    const error: any = new Error('The genesco-stores index has not been seeded. Run the DEV migration before using the maps.');
    error.statusCode = 503;
    throw error;
  }
};
const apiError = (response: any, action: string, error: any) => {
  const code = codeOf(error);
  const statusCode = [400, 403, 404, 409, 503].includes(code) ? code : 502;
  return response.customError({ statusCode, body: `${action}: ${messageOf(error)}` });
};

export function registerCustomStoresRoutes(router: IRouter) {
  router.get(
    { path: '/api/genesco_map/stores', validate: false },
    async (context, _request, response) => {
      try {
        const client = currentClient(context);
        await ensureCatalog(client);
        const stores: any[] = [];
        let after: any[] | undefined;
        do {
          const result = await client.search({
            index: STORES_INDEX,
            body: {
              size: 500,
              query: { match_all: {} },
              sort: [{ recordId: { order: 'asc' } }],
              ...(after ? { search_after: after } : {}),
            },
          });
          const hits: any[] = result.body?.hits?.hits || [];
          for (const hit of hits) {
            const record = hit._source;
            if (record && record.recordId && record.siteId) stores.push(record);
          }
          if (hits.length < 500) break;
          after = hits[hits.length - 1].sort;
        } while (after?.length);
        return response.ok({ body: { stores } });
      } catch (error) {
        return apiError(response, 'Unable to load the store catalog', error);
      }
    }
  );

  router.post(
    { path: '/api/genesco_map/stores', validate: { body: storeFieldsSchema } },
    async (context, request, response) => {
      const checked = validateStore(request.body);
      if (!checked.store) return response.badRequest({ body: checked.error || 'Invalid store' });
      try {
        const client = currentClient(context);
        await ensureCatalog(client); // Only the migration tool creates the catalog.
        const recordId = `manual-${randomBytes(16).toString('hex')}`;
        const now = new Date().toISOString();
        const record = { ...checked.store, recordId, origin: 'manual', createdAt: now, updatedAt: now };
        await client.index({
          index: STORES_INDEX,
          id: recordId,
          op_type: 'create',
          body: record,
          refresh: 'wait_for',
        });
        return response.ok({ body: { store: record } });
      } catch (error) {
        return apiError(response, 'Unable to create store', error);
      }
    }
  );

  router.put(
    {
      path: '/api/genesco_map/stores/{recordId}',
      validate: {
        params: schema.object({ recordId: schema.string() }),
        body: storeFieldsSchema,
      },
    },
    async (context, request, response) => {
      const recordId = request.params.recordId;
      if (!ID_FORMAT.test(recordId)) return response.badRequest({ body: 'Invalid store record ID' });
      const checked = validateStore(request.body);
      if (!checked.store) return response.badRequest({ body: checked.error || 'Invalid store' });
      try {
        const client = currentClient(context);
        await ensureCatalog(client);
        // Update ONLY editable fields, preserving original identity/audit metadata.
        await client.update({
          index: STORES_INDEX,
          id: recordId,
          body: { doc: { ...checked.store, updatedAt: new Date().toISOString() } },
          refresh: 'wait_for',
        });
        const updated = await client.get({ index: STORES_INDEX, id: recordId });
        return response.ok({ body: { store: updated.body._source } });
      } catch (error) {
        return apiError(response, 'Unable to update store', error);
      }
    }
  );

  router.delete(
    {
      path: '/api/genesco_map/stores/{recordId}',
      validate: { params: schema.object({ recordId: schema.string() }) },
    },
    async (context, request, response) => {
      const recordId = request.params.recordId;
      if (!ID_FORMAT.test(recordId)) return response.badRequest({ body: 'Invalid store record ID' });
      try {
        const client = currentClient(context);
        await ensureCatalog(client);
        // Deletes one catalog document. Never deletes the index or any other documents.
        await client.delete({ index: STORES_INDEX, id: recordId, refresh: 'wait_for' });
        return response.ok({ body: { deleted: true, recordId } });
      } catch (error) {
        return apiError(response, 'Unable to delete store', error);
      }
    }
  );
}
