import { useEffect, useState } from 'react';
import { RegisterNote } from '../../services/registerNotes';

interface Props {
  registerId: string;
  note?: RegisterNote;
  onSave: (registerId: string, text: string) => Promise<void>;
}

/** This component is mounted only for warning/down registers. */
export const RegisterNoteEditor = ({ registerId, note, onSave }: Props) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(note?.comment || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) setDraft(note?.comment || '');
  }, [note?.comment, open]);

  const edit = () => {
    setDraft(note?.comment || '');
    setError('');
    setOpen(true);
  };
  const save = async () => {
    const value = draft.trim();
    if (value.length > 1000) {
      setError('Comments cannot exceed 1,000 characters.');
      return;
    }
    // An empty draft intentionally removes an existing register comment.
    if (!value && !note?.comment) return;
    setSaving(true);
    setError('');
    try {
      await onSave(registerId, value);
      setOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save this comment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="register-comment-control">
      <div className="register-comment-actions">
        <button
          className="register-comment-edit"
          type="button"
          aria-label={`Edit comment for register ${registerId}`}
          onClick={edit}
        >
          ✎ Edit
        </button>
      </div>
      {note?.comment && !open && (
        <span className="register-comment-preview" title={note.comment}>
          {note.comment}
        </span>
      )}
      {open && (
        <div className="register-comment-editor" role="group" aria-label={`Register ${registerId} comment editor`}>
          <label htmlFor={`register-comment-${registerId}`}>Register {registerId} comment</label>
          <textarea
            id={`register-comment-${registerId}`}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Enter an update for this register..."
            autoFocus
          />
          {note?.comment && (
            <small className="register-comment-clear-hint">Clear the text and save to remove this comment.</small>
          )}
          <div className="register-comment-editor-footer">
            <span>{draft.length}/1000</span>
            <button type="button" onClick={() => setOpen(false)} disabled={saving}>Cancel</button>
            <button type="button" onClick={save} disabled={saving || (!draft.trim() && !note?.comment)}>
              {saving ? 'Saving…' : !draft.trim() && note?.comment ? 'Clear note' : 'Save'}
            </button>
          </div>
          {error && <p className="register-comment-error" role="alert">{error}</p>}
        </div>
      )}
    </div>
  );
};
