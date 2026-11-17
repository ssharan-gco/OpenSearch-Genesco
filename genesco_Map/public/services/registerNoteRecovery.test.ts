import { noteRecoveryWindow, notesWithObservedRecovery } from './registerNoteRecovery';
import type { RegisterNotes } from './registerNotes';
import type { StoreRegisterDashboard } from './registerMetrics';

describe('register note recovery lifecycle', () => {
  const t0 = Date.parse('2026-11-17T12:00:00.000Z');
  const notes: RegisterNotes = {
    '1': { storeId: '6233', registerId: '1', comment: 'Investigating connectivity', updatedAt: new Date(t0).toISOString() },
    '2': { storeId: '6233', registerId: '2', comment: 'Still down', updatedAt: new Date(t0).toISOString() },
  };
  const dashboard = (statuses: Array<[number, 0 | 1 | 2 | null]>, id = '1') => ({
    oldestSampleAt: t0,
    registers: [{
      id,
      healthTimeline: statuses.map(([offsetMs, status]) => ({ timestampMs: t0 + offsetMs, status, value: null })),
    }],
  }) as StoreRegisterDashboard;

  it('resolves a note when there is a Healthy sample after the note was saved', () => {
    const result = notesWithObservedRecovery(notes, dashboard([[-60_000, 1], [60_000, 0], [3600_000, 1], [7200_000, 0]]));
    expect(result.map((note) => note.registerId)).toEqual(['1']);
  });
  it('does not resolve a note based on Healthy samples before saving', () => {
    expect(notesWithObservedRecovery(notes, dashboard([[-30_000, 1], [0, 1], [1800_000, 0]]))).toEqual([]);
  });
  it('retains warning, down and no-data notes until a confirmed recovery', () => {
    expect(notesWithObservedRecovery(notes, dashboard([[30_000, 2], [60_000, 0], [90_000, null]]))).toEqual([]);
  });
  it('normalizes register IDs and never clears a register absent from telemetry', () => {
    expect(notesWithObservedRecovery(notes, dashboard([[60_000, 1]], '01')).map((note) => note.registerId)).toEqual(['1']);
    expect(notesWithObservedRecovery(notes, dashboard([[60_000, 1]], '3'))).toEqual([]);
  });
  it('uses note timestamps rather than any selected historical dashboard time range', () => {
    const window = noteRecoveryWindow(notes, t0 + 7200_000);
    expect(window).toEqual({ fromMs: t0 - 60_000, toMs: t0 + 7200_000 });
  });
});
