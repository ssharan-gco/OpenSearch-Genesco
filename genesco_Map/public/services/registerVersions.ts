import { OsSearch } from '../lib/types';

export interface RegisterVersionDetails {
  registerId: string;
  fields: Array<{ label: string; value: string }>;
}

const REGISTER_FIELDS = ['register', 'register_id', 'registerId', 'register_number', 'register_no'];
const STORE_FIELDS = ['store', 'store_id', 'storeId'];
const TIMESTAMP_FIELDS = ['@timestamp', 'timestamp', 'updated_at', 'last_updated'];
const VERSION_FIELDS = ['xstore_cust_version', 'environment_cust_version'];

const toDisplayValue = (value: unknown): string | null => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return JSON.stringify(value);
};

const getFieldValue = (source: Record<string, unknown>, names: string[]) => {
  const name = names.find((field) => source[field] !== undefined);
  return name ? source[name] : undefined;
};

const getRegisterId = (source: Record<string, unknown>) => {
  const registerId = getFieldValue(source, REGISTER_FIELDS);
  return registerId === undefined || registerId === null ? null : String(registerId);
};

export const fetchStoreRegisterVersions = async (
  osSearch: OsSearch,
  storeId: string
): Promise<RegisterVersionDetails[]> => {
  const response = await osSearch('xstore-register-version', {
    size: 100,
    query: {
      match: {
        store: storeId,
      },
    },
  });
  const hits: unknown = response?.hits?.hits;
  if (!Array.isArray(hits)) {
    throw new Error('Invalid response from xstore-register-version index');
  }

  const detailsByRegister = new Map<string, RegisterVersionDetails>();
  hits.forEach((hit: unknown) => {
    if (!hit || typeof hit !== 'object' || !('_source' in hit)) return;
    const source = (hit as { _source?: unknown })._source;
    if (!source || typeof source !== 'object' || Array.isArray(source)) return;

    const sourceFields = source as Record<string, unknown>;
    const registerId = getRegisterId(sourceFields);
    if (!registerId || detailsByRegister.has(registerId)) return;

    const fields = Object.entries(sourceFields)
      .filter(([name]) => VERSION_FIELDS.includes(name))
      .map(([name, value]) => {
        const displayValue = toDisplayValue(value);
        return displayValue === null ? null : { label: name, value: displayValue };
      })
      .filter((field): field is { label: string; value: string } => field !== null);

    if (fields.length > 0) detailsByRegister.set(registerId, { registerId, fields });
  });

  return Array.from(detailsByRegister.values());
};
