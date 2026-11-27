#!/usr/bin/env node
/**
 * One-time migration from original 1,085 bundled locations (+ any legacy custom stores)
 * to genesco-stores. Intended to run from Windows Git Bash on the authenticated VDI.
 *
 * No external packages are required. Never deletes an index or updates existing docs.
 * --apply supports an explicit LOCAL or DEV target; PROD requires extra flags.
 */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import http from 'node:http';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const INDEX = 'genesco-stores';
const LEGACY = 'genesco-custom-stores';
const SEED_FILE = fileURLToPath(new URL('./genesco-stores-seed.json', import.meta.url));
const source = JSON.parse(readFileSync(SEED_FILE, 'utf8'));
const args = process.argv.slice(2);
const mode = args.includes('--apply') ? 'apply' : args.includes('--verify') ? 'verify' : args.includes('--dry-run') ? 'dry-run' : null;
const resume = args.includes('--resume');

const storeKey = (s) => [s.siteId, s.name, s.address, s.city, s.state].join('|');
const normalize = (s) => ({
  siteId: String(s.siteId || '').trim().padStart(4, '0'),
  name: String(s.name || '').trim(),
  address: String(s.address || '').trim(),
  city: String(s.city || '').trim(),
  state: String(s.state || '').trim().toUpperCase(),
  zip: String(s.zip || '').trim(),
  lat: Number(s.lat),
  lon: Number(s.lon),
});
const validate = (s) => {
  if (!/^\d{4,6}$/.test(s.siteId) || !s.name || !s.address || !s.city ||
      !/^[A-Z]{2,3}$/.test(s.state) || !s.zip || !Number.isFinite(s.lat) ||
      s.lat < -90 || s.lat > 90 || !Number.isFinite(s.lon) || s.lon < -180 || s.lon > 180) {
    throw new Error(`Bad seed record: ${JSON.stringify(s)}`);
  }
};
const baseStores = source.map(normalize);
baseStores.forEach(validate);
const uniqueKeys = new Set(baseStores.map(storeKey));
if (uniqueKeys.size !== baseStores.length) throw new Error('Duplicate exact locations in source seed JSON; aborting');
const bySiteId = new Map();
for (const s of baseStores) bySiteId.set(s.siteId, (bySiteId.get(s.siteId) || 0) + 1);
const repeated = [...bySiteId].filter(([, n]) => n > 1);
console.log(`Bundled source: ${baseStores.length} locations; ${bySiteId.size} unique store numbers; ${repeated.length} repeated store numbers.`);
console.log('Repeated store numbers are retained as distinct documents with stable location IDs.');

if (!mode) {
  console.log('Usage: node scripts/seed-genesco-stores.mjs --dry-run | --apply [--resume] | --verify');
  process.exit(2);
}
if (mode === 'dry-run') {
  console.log('DRY RUN COMPLETE: no connection made and no OpenSearch data changed.');
  process.exit(0);
}

const urlString = process.env.OPENSEARCH_URL;
const user = process.env.OPENSEARCH_USER;
const password = process.env.OPENSEARCH_PASS;
const target = String(process.env.GENESCO_TARGET || '').toUpperCase();
if (!urlString) throw new Error('Set OPENSEARCH_URL for the selected OpenSearch target');
const base = new URL(urlString);
if (base.username || base.password || !base.hostname || base.pathname !== '/') {
  throw new Error('OPENSEARCH_URL must be a bare endpoint with no embedded credentials');
}
if (Boolean(user) !== Boolean(password)) {
  throw new Error('Set both OPENSEARCH_USER and OPENSEARCH_PASS, or omit both for unsecured local OpenSearch');
}
if (target === 'LOCAL') {
  const isLoopback = ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname.toLowerCase());
  if (base.protocol !== 'http:' || !isLoopback || base.port !== '9200') {
    throw new Error('Safety stop: LOCAL requires http://localhost:9200 (or a loopback address on port 9200)');
  }
} else if (target !== 'DEV' && target !== 'PROD') {
  throw new Error('Set GENESCO_TARGET=LOCAL, DEV, or PROD explicitly');
} else if (base.protocol !== 'https:') {
  throw new Error('DEV and PROD OpenSearch URLs must use HTTPS');
}
if (target !== 'LOCAL' && (!user || !password)) {
  throw new Error('Set OPENSEARCH_USER and OPENSEARCH_PASS for DEV or PROD');
}
if (target === 'DEV' && !/^D01-WA-OBS-/i.test(base.hostname)) {
  throw new Error(`Safety stop: ${base.hostname} does not look like a DEV OpenSearch host`);
}
if (target === 'PROD' && (!/^P01-WA-OBS-/i.test(base.hostname) || !args.includes('--allow-prod'))) {
  throw new Error('Safety stop: PROD needs explicit --allow-prod and a P01-WA-OBS- hostname');
}
const tlsVerify = process.env.OPENSEARCH_VERIFY_CERTS !== 'false';
if (!tlsVerify) console.warn('WARNING: TLS certificate verification disabled; use only with approved security exception.');
const agent = base.protocol === 'https:' ? new https.Agent({ keepAlive: true, rejectUnauthorized: tlsVerify }) : undefined;

const request = async (method, path, data, options = {}) => {
  const body = data === undefined ? null : (typeof data === 'string' ? data : JSON.stringify(data));
  const lib = base.protocol === 'https:' ? https : http;
  const targetUrl = new URL(path, base);
  return await new Promise((resolve, reject) => {
    const req = lib.request(targetUrl, {
      method,
      agent,
      headers: {
        ...(user && password ? { authorization: `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}` } : {}),
        accept: 'application/json',
        ...(body === null ? {} : { 'content-type': options.ndjson ? 'application/x-ndjson' : 'application/json' }),
      },
      timeout: 60000,
    }, (res) => {
      let text = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { text += chunk; });
      res.on('end', () => {
        let parsed;
        try { parsed = text ? JSON.parse(text) : null; }
        catch { return reject(new Error(`Non-JSON OpenSearch response HTTP ${res.statusCode}: ${text.slice(0, 300)}`)); }
        const status = res.statusCode || 0;
        if (status >= 400 && !(options.allow404 && status === 404)) {
          return reject(new Error(`OpenSearch HTTP ${status} ${method} ${targetUrl.pathname}: ${JSON.stringify(parsed?.error || parsed).slice(0, 500)}`));
        }
        resolve({ status, body: parsed });
      });
    });
    req.on('timeout', () => req.destroy(new Error(`Timed out calling ${method} ${targetUrl.pathname}`)));
    req.on('error', reject);
    if (body !== null) req.write(body);
    req.end();
  });
};

const indexExists = async (name) => {
  const result = await request('HEAD', `/${name}`, undefined, { allow404: true });
  return result.status === 200;
};
const countIndex = async (name) => (await request('GET', `/${name}/_count`)).body.count;
const mapping = {
  mappings: {
    dynamic: 'strict',
    properties: {
      recordId: { type: 'keyword' },
      siteId: { type: 'keyword' },
      name: { type: 'keyword', ignore_above: 512 },
      address: { type: 'text' },
      city: { type: 'keyword', ignore_above: 256 },
      state: { type: 'keyword' },
      zip: { type: 'keyword' },
      lat: { type: 'double' },
      lon: { type: 'double' },
      origin: { type: 'keyword' },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' },
    },
  },
};

const readOldCustomStores = async () => {
  if (!(await indexExists(LEGACY))) return [];
  // Legacy custom store IDs were unique site numbers and were always < 10,000.
  const reply = await request('POST', `/${LEGACY}/_search`, {
    size: 10000,
    query: { match_all: {} },
    _source: ['siteId','name','address','city','state','zip','lat','lon','createdAt'],
  });
  const hits = reply.body?.hits?.hits || [];
  if (hits.length >= 10000) throw new Error('Legacy index has >= 10,000 rows; migrate in pages before proceeding');
  return hits.map(({ _source }) => _source);
};

if (mode === 'verify') {
  if (!(await indexExists(INDEX))) throw new Error(`${INDEX} is not present in ${target}`);
  const count = await countIndex(INDEX);
  console.log(`${target} ${INDEX} contains ${count} documents.`);
  const byOrigin = await request('POST', `/${INDEX}/_search`, {
    size: 0,
    aggs: { origin_counts: { terms: { field: 'origin', size: 20 } } },
  });
  console.log('By source:', JSON.stringify(byOrigin.body?.aggregations?.origin_counts?.buckets || []));
  process.exit(0);
}

const legacyCustom = await readOldCustomStores();
console.log(`Legacy ${LEGACY} records found: ${legacyCustom.length}`);
const now = new Date().toISOString();
const documents = baseStores.map((s) => {
  const hash = createHash('sha256').update(storeKey(s)).digest('hex').slice(0, 32);
  const recordId = `seed-${hash}`;
  return { ...s, recordId, origin: 'seed-json', createdAt: now, updatedAt: now };
});
for (const raw of legacyCustom) {
  const s = normalize(raw);
  validate(s);
  if (bySiteId.has(s.siteId)) {
    throw new Error(`Legacy custom store ${s.siteId} overlaps an original store number; investigate before migration`);
  }
  const recordId = `legacy-${s.siteId}`;
  documents.push({ ...s, recordId, origin: 'legacy-custom', createdAt: raw.createdAt || now, updatedAt: now });
}
const ids = new Set(documents.map((doc) => doc.recordId));
if (ids.size !== documents.length) throw new Error('Duplicate record IDs in source documents');
const alreadyExists = await indexExists(INDEX);
if (alreadyExists && (await countIndex(INDEX)) > 0 && !resume) {
  throw new Error(`${INDEX} already has records. Stopping to avoid overwriting manually edited stores. Only use --resume for an incomplete first-time seed.`);
}
if (!alreadyExists) {
  console.log(`Creating index ${INDEX} in ${target} (original indices left untouched)`);
  await request('PUT', `/${INDEX}`, mapping);
}
let written = 0;
let existed = 0;
for (let offset = 0; offset < documents.length; offset += 200) {
  const chunk = documents.slice(offset, offset + 200);
  let ndjson = '';
  for (const doc of chunk) {
    ndjson += JSON.stringify({ create: { _index: INDEX, _id: doc.recordId } }) + '\n';
    ndjson += JSON.stringify(doc) + '\n';
  }
  const result = await request('POST', '/_bulk?refresh=wait_for', ndjson, { ndjson: true });
  const failures = [];
  for (const item of result.body?.items || []) {
    const action = item.create;
    if (action?.status === 201) written += 1;
    else if (action?.status === 409 && resume) existed += 1;
    else failures.push({ id: action?._id, status: action?.status, error: action?.error });
  }
  if (failures.length) throw new Error(`Bulk write stopped. Rejections: ${JSON.stringify(failures.slice(0, 5))}`);
  console.log(`  processed ${Math.min(offset + chunk.length, documents.length)}/${documents.length}`);
}
await request('POST', `/${INDEX}/_refresh`);
const finalCount = await countIndex(INDEX);
console.log(`${target} migration: created=${written} already-present=${existed}; index count=${finalCount}; expected=${documents.length}`);
if (finalCount !== documents.length) throw new Error('Count mismatch: do not deploy the dashboard until catalog reconciled');
console.log(`SUCCESS: ${INDEX} has the complete location catalog. No source or legacy index was deleted.`);
