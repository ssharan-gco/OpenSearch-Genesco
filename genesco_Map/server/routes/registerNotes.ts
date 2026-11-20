import { schema } from '@osd/config-schema';
import { IRouter } from '../../../../src/core/server';

/** An independent, shared index. Neither weather reloads nor metrics ingestion touch it. */
const NOTES_INDEX = 'genesco-register-notes';
const MAX_NOTE_LENGTH = 1000;
const MAX_INCIDENT_LENGTH = 11; // Incident IDs: ASCII letters/digits only.
const allowedId = /^[A-Za-z0-9_-]{1,32}$/;

const normalizeStore = (id: string) => {
  const value = id.trim();
  return /^\d{1,4}$/.test(value) ? value.padStart(4, '0') : value;
};
const normalizeRegister = (id: string) => {
  const value = id.trim();
  return /^\d{1,3}$/.test(value) ? String(Number(value)) : value;
};
const errorMessage = (error: any) =>
  error?.meta?.body?.error?.reason || error?.message || 'OpenSearch request failed';
const statusCode = (error: any) => Number(error?.meta?.statusCode || error?.statusCode || 500);
const getClient = (context: any) => context.core.opensearch.client.asCurrentUser;

const indexExists = async (client: any): Promise<boolean> => {
  const result = await client.indices.exists({ index: NOTES_INDEX });
  return Boolean(result.body);
};

/** Create only on first write, never during reads of healthy or uncommented stores. */
const ensureNotesIndex = async (client: any) => {
  if (await indexExists(client)) return;
  try {
    await client.indices.create({
      index: NOTES_INDEX,
      body: {
        mappings: {
          properties: {
            storeId: { type: 'keyword' },
            registerId: { type: 'keyword' },
            incidentNumber: { type: 'keyword', ignore_above: 256 },
            comment: { type: 'text' },
            updatedAt: { type: 'date' },
          },
        },
      },
    });
  } catch (error) {
    // Another user may have created the index at the same instant.
    if (statusCode(error) !== 400 || !(await indexExists(client))) throw error;
  }
};

export function registerRegisterNotesRoutes(router: IRouter) {
  router.get(
    {
      path: '/api/genesco_map/register_notes/{storeId}',
      validate: { params: schema.object({ storeId: schema.string() }) },
    },
    async (context, request, response) => {
      const storeId = normalizeStore(request.params.storeId);
      if (!allowedId.test(storeId)) {
        return response.badRequest({ body: 'Invalid store ID' });
      }
      try {
        const client = getClient(context);
        if (!(await indexExists(client))) return response.ok({ body: { notes: [] } });
        const result = await client.search({
          index: NOTES_INDEX,
          body: {
            size: 200,
            query: { term: { storeId } },
            _source: ['storeId', 'registerId', 'incidentNumber', 'comment', 'updatedAt'],
          },
        });
        const hits = result.body?.hits?.hits || [];
        const notes = hits.map((hit: any) => hit._source).filter((note: any) =>
          note && typeof note.registerId === 'string' && typeof note.comment === 'string' &&
          Boolean((typeof note.incidentNumber === 'string' && note.incidentNumber.trim()) || note.comment.trim())
        );
        return response.ok({ body: { notes } });
      } catch (error) {
        return response.customError({
          statusCode: statusCode(error) === 403 ? 403 : 502,
          body: `Unable to read register notes: ${errorMessage(error)}`,
        });
      }
    }
  );

  router.put(
    {
      path: '/api/genesco_map/register_notes/{storeId}/{registerId}',
      validate: {
        params: schema.object({ storeId: schema.string(), registerId: schema.string() }),
        body: schema.object({ incidentNumber: schema.string(), comment: schema.string() }),
      },
    },
    async (context, request, response) => {
      const storeId = normalizeStore(request.params.storeId);
      const registerId = normalizeRegister(request.params.registerId);
      const incidentNumber = request.body.incidentNumber;
      const comment = request.body.comment.trim();
      if (!allowedId.test(storeId) || !allowedId.test(registerId)) {
        return response.badRequest({ body: 'Invalid store or register ID' });
      }
      if (incidentNumber.length > MAX_INCIDENT_LENGTH) {
        return response.badRequest({ body: `Incident number cannot exceed ${MAX_INCIDENT_LENGTH} characters` });
      }
      // Reject all special characters and spaces, including in direct API requests.
      if (incidentNumber && !/^[A-Za-z0-9]+$/.test(incidentNumber)) {
        return response.badRequest({ body: 'Incident number must contain only letters and numbers (no spaces or special characters)' });
      }
      if (comment.length > MAX_NOTE_LENGTH) {
        return response.badRequest({ body: `Comment cannot exceed ${MAX_NOTE_LENGTH} characters` });
      }
      if (!incidentNumber && comment) {
        return response.badRequest({ body: 'Incident number is required when providing a status update' });
      }
      try {
        const client = getClient(context);
        if (!incidentNumber && !comment) {
          // Clearing a note deletes its stored document. Do not create an index
          // just to clear an absent note; repeated clears are safe.
          if (await indexExists(client)) {
            try {
              await client.delete({
                index: NOTES_INDEX,
                id: `${storeId}__${registerId}`,
                refresh: 'wait_for',
              });
            } catch (error) {
              if (statusCode(error) !== 404) throw error;
            }
          }
          return response.ok({ body: { note: null, cleared: true } });
        }
        await ensureNotesIndex(client);
        const note = { storeId, registerId, incidentNumber, comment, updatedAt: new Date().toISOString() };
        await client.index({
          index: NOTES_INDEX,
          id: `${storeId}__${registerId}`,
          body: note,
          refresh: 'wait_for',
        });
        return response.ok({ body: { note } });
      } catch (error) {
        return response.customError({
          statusCode: statusCode(error) === 403 ? 403 : 502,
          body: `Unable to save register note: ${errorMessage(error)}`,
        });
      }
    }
  );

  // Resolve a note only if it has not been edited since the client confirmed
  // a Healthy sample after that note was saved. This prevents an old cleanup
  // request from deleting a newer incident update.
  router.post(
    {
      path: '/api/genesco_map/register_notes/{storeId}/{registerId}/resolve',
      validate: {
        params: schema.object({ storeId: schema.string(), registerId: schema.string() }),
        body: schema.object({ updatedAt: schema.string() }),
      },
    },
    async (context, request, response) => {
      const storeId = normalizeStore(request.params.storeId);
      const registerId = normalizeRegister(request.params.registerId);
      const updatedAt = request.body.updatedAt;
      if (!allowedId.test(storeId) || !allowedId.test(registerId) || !Number.isFinite(Date.parse(updatedAt))) {
        return response.badRequest({ body: 'Invalid register ID or note timestamp' });
      }
      try {
        const client = getClient(context);
        if (!(await indexExists(client))) return response.ok({ body: { cleared: true } });
        const id = `${storeId}__${registerId}`;
        let current: any;
        try {
          current = (await client.get({ index: NOTES_INDEX, id })).body;
        } catch (error) {
          if (statusCode(error) === 404) return response.ok({ body: { cleared: true } });
          throw error;
        }
        if (current?._source?.updatedAt !== updatedAt) {
          return response.ok({ body: { cleared: false } });
        }
        try {
          await client.delete({
            index: NOTES_INDEX,
            id,
            if_seq_no: current._seq_no,
            if_primary_term: current._primary_term,
            refresh: 'wait_for',
          });
        } catch (error) {
          // Concurrent update or delete: never remove a newer note.
          if (statusCode(error) === 404 || statusCode(error) === 409) {
            return response.ok({ body: { cleared: false } });
          }
          throw error;
        }
        return response.ok({ body: { cleared: true } });
      } catch (error) {
        return response.customError({
          statusCode: statusCode(error) === 403 ? 403 : 502,
          body: `Unable to resolve register note: ${errorMessage(error)}`,
        });
      }
    }
  );

}
