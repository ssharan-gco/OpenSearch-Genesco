import type { StoreRegister, StoreRegisterDashboard } from './registerMetrics';
import type { RegisterNote, RegisterNotes } from './registerNotes';

const normalizeNoteRegisterId = (id: string) => {
  const value = String(id).trim();
  return /^\d{1,3}$/.test(value) ? String(Number(value)) : value;
};

/**
 * Comments belong to a single *uninterrupted* unhealthy episode. A later
 * confirmed Healthy sample closes that episode even if the register is Down
 * again by the time someone next opens the map.
 *
 * Do not infer a recovery from an absent register, a missing sample, or a
 * Degraded/No-data sample. Only an explicit Healthy (status=1) sample counts.
 */
export const notesWithObservedRecovery = (
  notes: RegisterNotes,
  dashboard: StoreRegisterDashboard
): RegisterNote[] => {
  const registers = new Map<string, StoreRegister>(
    dashboard.registers.map((register): [string, StoreRegister] => [
      normalizeNoteRegisterId(register.id), register,
    ])
  );
  return Object.values(notes).filter((note) => {
    const savedMs = Date.parse(note.updatedAt);
    const register = registers.get(normalizeNoteRegisterId(note.registerId));
    if (!Number.isFinite(savedMs) || !register) return false;
    return register.healthTimeline.some(
      (point) => point.status === 1 && point.timestampMs > savedMs
    );
  });
};

/** Read recovery history from the earliest note onwards, independently of the
 * IT dashboard's user-selected (possibly historical) time range. */
export const noteRecoveryWindow = (
  notes: RegisterNotes,
  nowMs: number
): { fromMs: number; toMs: number } | null => {
  const savedAt = Object.values(notes)
    .map((note) => Date.parse(note.updatedAt))
    .filter((value) => Number.isFinite(value) && value <= nowMs);
  if (savedAt.length === 0) return null;
  return { fromMs: Math.max(0, Math.min(...savedAt) - 60_000), toMs: nowMs };
};
