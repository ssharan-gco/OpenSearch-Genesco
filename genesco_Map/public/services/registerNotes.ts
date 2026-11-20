import { CoreStart } from '../../../../src/core/public';
import { fetchStoreRegisterDashboard } from './registerMetrics';
import { noteRecoveryWindow, notesWithObservedRecovery } from './registerNoteRecovery';

export interface RegisterNote {
  storeId: string;
  registerId: string;
  incidentNumber?: string;
  comment: string;
  updatedAt: string;
}

export type RegisterNotes = Record<string, RegisterNote>;
export interface RegisterNotesClient {
  readStore: (storeId: string) => Promise<RegisterNotes>;
  save: (storeId: string, registerId: string, incidentNumber: string, comment: string) => Promise<RegisterNote | null>;
}

export const normalizeNoteStoreId = (storeId: string) => {
  const id = String(storeId).trim();
  return /^\d{1,4}$/.test(id) ? id.padStart(4, '0') : id;
};
export const normalizeNoteRegisterId = (registerId: string) => {
  const id = String(registerId).trim();
  return /^\d{1,3}$/.test(id) ? String(Number(id)) : id;
};

/** Same-origin OSD API; the server uses the current authenticated OpenSearch user. */
export const createRegisterNotesClient = (http: CoreStart['http']): RegisterNotesClient => ({
  async readStore(storeId) {
    const key = encodeURIComponent(normalizeNoteStoreId(storeId));
    const result = await http.get<{ notes: RegisterNote[] }>(`/api/genesco_map/register_notes/${key}`);
    const notes: RegisterNotes = {};
    for (const note of result.notes || []) {
      if (note && note.registerId && (note.incidentNumber?.trim() || note.comment?.trim())) {
        notes[normalizeNoteRegisterId(note.registerId)] = note;
      }
    }
    // Reconcile saved notes against actual register health *since each note
    // was written*. A brief recovery may happen while neither map is open;
    // once it is observed in VictoriaMetrics history the old incident note
    // must never be displayed for a later outage.
    const recoveryWindow = noteRecoveryWindow(notes, Date.now());
    if (recoveryWindow) {
      try {
        const dashboard = await fetchStoreRegisterDashboard(normalizeNoteStoreId(storeId), recoveryWindow);
        const recovered = notesWithObservedRecovery(notes, dashboard);
        await Promise.all(recovered.map(async (note) => {
          // Hide as soon as recovery is confirmed, even when a read-only user
          // cannot persist the cleanup. Next authorized read retries it.
          delete notes[normalizeNoteRegisterId(note.registerId)];
          try {
            await http.post(
              `/api/genesco_map/register_notes/${key}/${encodeURIComponent(normalizeNoteRegisterId(note.registerId))}/resolve`,
              { body: JSON.stringify({ updatedAt: note.updatedAt }) }
            );
          } catch (error) {
            // Best-effort persistence, conditional on the exact note version.
            // The note is still hidden from this read to avoid stale comments.
            console.warn('Unable to remove recovered register comment', error);
          }
        }));
      } catch (error) {
        // A telemetry outage must never delete comments on assumption alone.
        console.warn('Unable to check register note recovery history', error);
      }
    }
    return notes;
  },
  async save(storeId, registerId, incidentNumber, comment) {
    const storeKey = encodeURIComponent(normalizeNoteStoreId(storeId));
    const registerKey = encodeURIComponent(normalizeNoteRegisterId(registerId));
    const result = await http.put<{ note: RegisterNote | null }>(
      `/api/genesco_map/register_notes/${storeKey}/${registerKey}`,
      { body: JSON.stringify({ incidentNumber, comment }) }
    );
    return result.note;
  },
});
