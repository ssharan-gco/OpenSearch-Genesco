import { useEffect, useState } from 'react';
import { RegisterNote } from '../../services/registerNotes';

interface Props {
  registerId: string;
  note?: RegisterNote;
  onSave: (registerId: string, incidentNumber: string, statusUpdate: string) => Promise<void>;
}

type EditorMode = 'add' | 'edit' | null;

/** Mounted for Warning / Down registers only. Saved details belong to one outage episode. */
export const RegisterNoteEditor = ({ registerId, note, onSave }: Props) => {
  const hasDetails = Boolean(note?.incidentNumber?.trim() || note?.comment?.trim());
  const [mode, setMode] = useState<EditorMode>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [incidentDraft, setIncidentDraft] = useState(note?.incidentNumber || '');
  const [updateDraft, setUpdateDraft] = useState(note?.comment || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === null) {
      setIncidentDraft(note?.incidentNumber || '');
      setUpdateDraft(note?.comment || '');
    }
  }, [note?.incidentNumber, note?.comment, mode]);

  const openEditor = (nextMode: Exclude<EditorMode, null>) => {
    if ((nextMode === 'add' && hasDetails) || (nextMode === 'edit' && !hasDetails)) return;
    setIncidentDraft(nextMode === 'edit' ? note?.incidentNumber || '' : '');
    setUpdateDraft(nextMode === 'edit' ? note?.comment || '' : '');
    setError('');
    setShowDetails(false);
    setMode(nextMode);
  };

  const save = async () => {
    if (!mode || saving) return;
    const incidentNumber = incidentDraft;
    const statusUpdate = updateDraft.trim();
    if (incidentNumber.length > 11) {
      setError('Incident number cannot exceed 11 characters.');
      return;
    }
    // Incident identifiers contain only ASCII letters and digits.
    if (incidentNumber && !/^[A-Za-z0-9]+$/.test(incidentNumber)) {
      setError('Incident number must contain only letters and numbers (no spaces or special characters).');
      return;
    }
    if (statusUpdate.length > 1000) {
      setError('Status update cannot exceed 1,000 characters.');
      return;
    }
    // An existing incident may be removed by saving BOTH fields empty.
    // Any nonempty submission must include an incident number.
    if (!incidentNumber && (mode === 'add' || statusUpdate)) {
      setError('Incident number is required. Clear both fields to remove an existing entry.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(registerId, incidentNumber, statusUpdate);
      setMode(null);
      setShowDetails(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save register details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="register-comment-control">
      <div className="register-comment-actions">
        <button
          className="register-comment-add"
          type="button"
          disabled={hasDetails || saving}
          onClick={() => openEditor('add')}
          aria-label={`Add incident details for register ${registerId}`}
        >
          + Add
        </button>
        <button
          className="register-comment-edit"
          type="button"
          disabled={!hasDetails || saving}
          onClick={() => openEditor('edit')}
          aria-label={`Edit incident details for register ${registerId}`}
        >
          ✎ Edit
        </button>
        <button
          className="register-comment-info"
          type="button"
          aria-label={`View incident details for register ${registerId}`}
          aria-expanded={showDetails}
          onClick={() => { setShowDetails((visible) => !visible); setMode(null); setError(''); }}
        >
          i
        </button>
      </div>

      {showDetails && (
        <div className="register-incident-details" role="dialog" aria-label={`Register ${registerId} incident details`}>
          <div className="register-incident-details-heading">
            <strong>Register {registerId}</strong>
            <button type="button" onClick={() => setShowDetails(false)} aria-label="Close incident details">×</button>
          </div>
          {!hasDetails ? (
            <p className="enterprise-register-incident-empty">Waiting for the operations to update the Status</p>
          ) : (
            <>
              <div className="register-incident-field">
                <span>Incident number</span>
                <p>{note?.incidentNumber || 'Not provided'}</p>
              </div>
              <div className="register-incident-field">
                <span>Status update</span>
                <p>{note?.comment || 'No status update provided.'}</p>
              </div>
            </>
          )}
        </div>
      )}

      {mode && (
        <form
          className="register-comment-editor"
          aria-label={`Register ${registerId} incident editor`}
          onSubmit={(event) => { event.preventDefault(); void save(); }}
        >
          <strong className="register-comment-editor-title">Register {registerId}</strong>
          <label htmlFor={`register-incident-${registerId}`}>Incident number <span aria-hidden="true">*</span></label>
          <input
            id={`register-incident-${registerId}`}
            type="text"
            value={incidentDraft}
            onChange={(event) => setIncidentDraft(event.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 11))}
            maxLength={11}
            pattern="[A-Za-z0-9]{1,11}"
            placeholder="e.g. INC12345"
            aria-required="true"
            autoFocus
          />
          <label htmlFor={`register-update-${registerId}`}>Status update (optional)</label>
          <textarea
            id={`register-update-${registerId}`}
            value={updateDraft}
            onChange={(event) => setUpdateDraft(event.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Enter the current register update..."
          />
          {mode === 'edit' && (
            <small className="register-comment-clear-hint">To remove the incident, clear both fields and select Save.</small>
          )}
          <div className="register-comment-editor-footer">
            <span>{updateDraft.length}/1000</span>
            <button type="button" onClick={() => { setMode(null); setError(''); }} disabled={saving}>Cancel</button>
            <button type="submit" disabled={saving || (mode === 'add' && !incidentDraft.trim())}>
              {saving ? 'Saving…' : mode === 'edit' && !incidentDraft.trim() && !updateDraft.trim() ? 'Clear entry' : 'Save'}
            </button>
          </div>
          {error && <p className="register-comment-error" role="alert">{error}</p>}
        </form>
      )}
    </div>
  );
};
