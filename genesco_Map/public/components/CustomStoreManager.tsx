import { useEffect, useMemo, useState } from 'react';
import { BRANDS, BrandCode } from '../lib/brands';
import { filterCatalogStores, getCatalogBrandLabel, pageCatalogStores, STORE_CATALOG_PAGE_SIZE } from '../lib/storeCatalogTable';
import { CustomStore, CustomStoreClient, StoreFields } from '../services/customStores';

type FormFields = {
  siteId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: string;
  lon: string;
};
type Tab = 'add' | 'view' | 'delete';
const EMPTY_FORM: FormFields = {
  siteId: '', name: '', address: '', city: '', state: '', zip: '', lat: '', lon: '',
};
const asForm = (s: CustomStore): FormFields => ({
  siteId: s.siteId,
  name: s.name,
  address: s.address,
  city: s.city,
  state: s.state,
  zip: s.zip,
  lat: String(s.lat),
  lon: String(s.lon),
});
const readableError = (error: any) =>
  error?.body?.message || error?.body?.error || error?.message || 'Request failed';
// OpenSearch timestamps are UTC; display them in the viewer's browser/local time zone.
const prettyDate = (value?: string) => value
  ? new Date(value).toLocaleString(undefined, { timeZoneName: 'short' })
  : '—';

/** Full-page IT-only editor. Catalog entries are the indexed records, not static JSON. */
export function CustomStoreManager({
  client,
  onChanged,
  onBack,
}: {
  client: CustomStoreClient;
  onChanged: () => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<Tab>('view');
  const [form, setForm] = useState<FormFields>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stores, setStores] = useState<CustomStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [listSearch, setListSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState<BrandCode | 'all' | 'other'>('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    client.list()
      .then((all) => { if (!cancelled) setStores(all); })
      .catch((cause) => { if (!cancelled) setError(readableError(cause)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [client]);

  const reloadList = async () => {
    setLoading(true);
    setError('');
    try { setStores(await client.list()); }
    catch (cause) { setError(readableError(cause)); }
    finally { setLoading(false); }
  };

  const availableStates = useMemo(() => Array.from(new Set(
    stores.map((s) => s.state.trim().toUpperCase()).filter(Boolean)
  )).sort(), [stores]);

  const matchingStores = useMemo(() => filterCatalogStores(stores, {
    search: listSearch,
    brand: brandFilter,
    state: stateFilter,
  }), [stores, listSearch, brandFilter, stateFilter]);

  const { pageCount, currentPage, firstIndex, pageStores, pageNumbers } =
    pageCatalogStores(matchingStores, page);

  const changeTab = (next: Tab) => {
    setTab(next);
    setEditingId(null);
    setConfirmId(null);
    setPage(1);
    setError('');
    setSuccess('');
    setForm(EMPTY_FORM);
  };

  const fields = (name: keyof FormFields, label: string, options: {
    type?: string; placeholder?: string; maxLength?: number; step?: string;
  } = {}) => (
    <label className={`genesco-custom-field${name === 'address' ? ' is-wide' : ''}`} key={name}>
      <span>{label} <em>*</em></span>
      <input
        type={options.type || 'text'}
        value={form[name]}
        required
        maxLength={options.maxLength}
        step={options.step}
        placeholder={options.placeholder}
        onChange={(event) => {
          const value = event.target.value;
          setForm((prev) => ({ ...prev, [name]: value }));
          setError('');
          setSuccess('');
        }}
      />
    </label>
  );

  const formValue = (): StoreFields | null => {
    const siteId = form.siteId.trim().padStart(4, '0');
    const lat = Number(form.lat);
    const lon = Number(form.lon);
    if (!/^\d{4,6}$/.test(siteId)) { setError('Store number must have 1–6 digits.'); return null; }
    if (!form.lat.trim() || !form.lon.trim() || !Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setError('Enter valid latitude (−90 to 90) and longitude (−180 to 180).');
      return null;
    }
    return {
      siteId,
      name: form.name.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim().toUpperCase(),
      zip: form.zip.trim(),
      lat,
      lon,
    };
  };

  const submitStore = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = formValue();
    if (!value) return;
    setBusy(true);
    setError('');
    try {
      const saved = editingId ? await client.update(editingId, value) : await client.add(value);
      setStores((old) => [...old.filter((s) => s.recordId !== saved.recordId), saved]);
      setForm(EMPTY_FORM);
      if (editingId) {
        setEditingId(null);
        setSuccess(`Store #${saved.siteId} updated in genesco-stores. Both maps will show the change on their next reload.`);
      } else {
        setSuccess(`Store #${saved.siteId} added to genesco-stores. Both maps will show it on their next reload.`);
      }
      onChanged();
      // This page is deliberately not auto-refreshed while someone edits a store.
    } catch (cause) { setError(readableError(cause)); }
    finally { setBusy(false); }
  };

  const beginEdit = (store: CustomStore) => {
    setEditingId(store.recordId);
    setForm(asForm(store));
    setError('');
    setSuccess('');
  };

  const deleteStore = async (store: CustomStore) => {
    if (confirmId !== store.recordId) { setConfirmId(store.recordId); return; }
    setBusy(true);
    setError('');
    try {
      await client.remove(store.recordId);
      setStores((old) => old.filter((s) => s.recordId !== store.recordId));
      setConfirmId(null);
      setSuccess(`Store #${store.siteId} — ${store.name} deleted from genesco-stores. Both maps will show the change on their next reload.`);
      onChanged();
    } catch (cause) { setError(readableError(cause)); }
    finally { setBusy(false); }
  };

  const showForm = tab === 'add' || (tab === 'view' && editingId !== null);
  return (
    <main className="genesco-store-page" aria-label="Manage stores page">
      <div className="genesco-store-page-inner">
        <header className="genesco-store-page-header">
          <div>
            <div className="genesco-store-page-eyebrow">GenesCo / IT Dashboard</div>
            <h1>Manage Stores</h1>
            <p>Manage every location in the <code>genesco-stores</code> OpenSearch index. Changes are shared with the IT and USERS maps.</p>
          </div>
          <button type="button" className="genesco-store-page-back" disabled={busy} onClick={onBack}>
            ← Back to IT Map
          </button>
        </header>

        <section className="genesco-store-page-panel" aria-label="Store catalog actions">
          <div className="genesco-store-page-toolbar">
            <div className="genesco-custom-tabs" role="tablist" aria-label="Store management">
              <button type="button" role="tab" aria-selected={tab === 'add'} className={tab === 'add' ? 'is-active' : ''} disabled={busy} onClick={() => changeTab('add')}>＋ Add Store</button>
              <button type="button" role="tab" aria-selected={tab === 'view'} className={tab === 'view' ? 'is-active' : ''} disabled={busy} onClick={() => changeTab('view')}>View Stores ({stores.length})</button>
              <button type="button" role="tab" aria-selected={tab === 'delete'} className={tab === 'delete' ? 'is-active' : ''} disabled={busy} onClick={() => changeTab('delete')}>− Delete Store</button>
            </div>
          </div>

          {error && <div className="genesco-custom-error" role="alert">{error}</div>}
          {success && <div className="genesco-custom-success" role="status">{success}</div>}

          {showForm ? (
            <form onSubmit={submitStore} className="genesco-custom-form">
              <h2>{editingId ? 'Modify an existing store' : 'Add a new store'}</h2>
              {editingId && <p className="genesco-custom-hint">Changes are saved to the existing store record. Changing a store number may affect matching telemetry and incident IDs.</p>}
              <div className="genesco-custom-grid">
                {fields('siteId', 'Store number', { placeholder: 'e.g. 9150', maxLength: 6 })}
                {fields('name', 'Store name (include brand)', { placeholder: 'e.g. JOURNEYS #9150 08', maxLength: 160 })}
                {fields('address', 'Street / mall address', { placeholder: 'Street address and suite', maxLength: 300 })}
                {fields('city', 'City', { maxLength: 120 })}
                {fields('state', 'State / province code', { placeholder: 'e.g. TX', maxLength: 3 })}
                {fields('zip', 'ZIP / postal code', { maxLength: 20 })}
                {fields('lat', 'Latitude', { type: 'number', step: 'any', placeholder: 'e.g. 32.515' })}
                {fields('lon', 'Longitude', { type: 'number', step: 'any', placeholder: 'e.g. -93.729' })}
              </div>
              <p className="genesco-custom-hint">Coordinates determine the pin location. Health and incident records continue to come from the existing telemetry and notes systems.</p>
              <div className="genesco-custom-actions">
                {editingId && <button type="button" disabled={busy} onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setError(''); }}>← Back to View Stores</button>}
                <button type="button" disabled={busy} onClick={onBack}>← Back to Map</button>
                <button type="submit" className="is-primary" disabled={busy}>{busy ? 'Saving…' : editingId ? 'Save Changes' : 'Save New Store'}</button>
              </div>
            </form>
          ) : (
            <div className="genesco-custom-list-section">
              <div className="genesco-custom-list-toolbar">
                <label className="genesco-custom-list-search">
                  <span>Search store number, name, brand or location</span>
                  <input type="search" value={listSearch} placeholder="Search all indexed stores…"
                    onChange={(event) => { setListSearch(event.target.value); setPage(1); setConfirmId(null); }} />
                </label>
                <label className="genesco-custom-list-select">
                  <span>Brand</span>
                  <select value={brandFilter} onChange={(event) => { setBrandFilter(event.target.value as BrandCode | 'all' | 'other'); setPage(1); setConfirmId(null); }}>
                    <option value="all">All brands</option>
                    {BRANDS.map((brand) => <option key={brand.code} value={brand.code}>{brand.label}</option>)}
                    <option value="other">Other / Unknown</option>
                  </select>
                </label>
                <label className="genesco-custom-list-select">
                  <span>State / Province</span>
                  <select value={stateFilter} onChange={(event) => { setStateFilter(event.target.value); setPage(1); setConfirmId(null); }}>
                    <option value="all">All states</option>
                    {availableStates.map((state) => <option key={state} value={state}>{state}</option>)}
                  </select>
                </label>
                <button type="button" disabled={busy || loading} onClick={() => void reloadList()}>
                  {loading ? 'Loading…' : '↻ Reload'}
                </button>
              </div>
              <div className="genesco-custom-list-summary" aria-live="polite">
                <span>{matchingStores.length} matching store location(s) · {STORE_CATALOG_PAGE_SIZE} per page</span>
                <span>{matchingStores.length ? `Showing ${firstIndex + 1}–${Math.min(firstIndex + STORE_CATALOG_PAGE_SIZE, matchingStores.length)}` : 'No matching stores'}</span>
              </div>
              {tab === 'delete' && <p className="genesco-custom-hint">Deleting an indexed location is permanent. Verify the store name, brand, and address; duplicate store numbers can represent different locations.</p>}

              <div className="genesco-custom-table-scroll" role="region" aria-label="Indexed store details" tabIndex={0}>
                <table className="genesco-custom-table">
                  <thead><tr>
                    <th scope="col">Store #</th>
                    <th scope="col">{tab === 'view' ? 'Edit' : 'Delete'}</th>
                    <th scope="col">Store Name</th>
                    <th scope="col">Brand</th>
                    <th scope="col">Address</th>
                    <th scope="col">City</th>
                    <th scope="col">State</th>
                    <th scope="col">ZIP / Postal</th>
                    <th scope="col">Latitude</th>
                    <th scope="col">Longitude</th>
                    <th scope="col">Updated At</th>
                  </tr></thead>
                  <tbody>
                    {loading ? <tr><td colSpan={11}>Loading indexed catalog…</td></tr>
                      : stores.length === 0 ? <tr><td colSpan={11}>No indexed stores found. Seed the catalog before managing stores.</td></tr>
                      : pageStores.length === 0 ? <tr><td colSpan={11}>No stores match your search and filters.</td></tr>
                      : pageStores.map((store) => (
                        <tr key={store.recordId}>
                          <td><strong>{store.siteId}</strong></td>
                          <td className="genesco-custom-table-actions">
                            {tab === 'view' ? (
                              <button type="button" disabled={busy} aria-label={`Edit store #${store.siteId} — ${store.name}, ${store.city}, ${store.state}`} onClick={() => beginEdit(store)}>Edit</button>
                            ) : (
                              <div className="genesco-custom-delete-actions">
                                {confirmId === store.recordId && <button type="button" disabled={busy} onClick={() => setConfirmId(null)}>Cancel</button>}
                                <button type="button" className={confirmId === store.recordId ? 'is-confirm' : 'is-delete'} disabled={busy} onClick={() => void deleteStore(store)}>
                                  {confirmId === store.recordId ? 'Confirm delete' : 'Delete'}
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="genesco-custom-name-cell">{store.name}</td>
                          <td>{getCatalogBrandLabel(store)}</td>
                          <td className="genesco-custom-address-cell">{store.address}</td>
                          <td>{store.city}</td>
                          <td>{store.state}</td>
                          <td>{store.zip}</td>
                          <td>{store.lat}</td>
                          <td>{store.lon}</td>
                          <td>{prettyDate(store.updatedAt)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <p className="genesco-custom-hint">Updated At is shown in your browser's local time zone. The store record ID is kept internally so stores sharing a number can still be edited or deleted separately.</p>
              <nav className="genesco-custom-pagination" aria-label="Store pages">
                <button type="button" disabled={busy || currentPage === 1} onClick={() => setPage(1)}>« First</button>
                <button type="button" disabled={busy || currentPage === 1} onClick={() => setPage(currentPage - 1)}>‹ Previous</button>
                {pageNumbers.map((n) => (
                  <button type="button" key={n} className={n === currentPage ? 'is-current' : ''} aria-current={n === currentPage ? 'page' : undefined}
                    disabled={busy} onClick={() => setPage(n)}>{n}</button>
                ))}
                <button type="button" disabled={busy || currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Next ›</button>
                <button type="button" disabled={busy || currentPage === pageCount} onClick={() => setPage(pageCount)}>Last »</button>
                <span>Page {currentPage} of {pageCount}</span>
              </nav>
              <div className="genesco-custom-actions"><button type="button" disabled={busy} onClick={onBack}>← Back to IT Map</button></div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
