import dateMath from '@opensearch/datemath';
import { TimeWindow } from './types';

/** Resolves EuiSuperDatePicker values (e.g. `now-1h`, `now/d`, ISO) to epoch ms. */
export const resolveTimeWindow = (start: string, end: string): TimeWindow => {
  const now = Date.now();
  const from = dateMath.parse(start)?.valueOf();
  const to = dateMath.parse(end, { roundUp: true })?.valueOf();
  const toMs = Number.isFinite(to) ? (to as number) : now;
  const fromMs = Number.isFinite(from) ? (from as number) : toMs - 3600_000;
  return { fromMs, toMs };
};

/** Range-query step (seconds) that keeps charts around ~120 points. */
export const stepFor = ({ fromMs, toMs }: TimeWindow) =>
  Math.max(15, Math.round((toMs - fromMs) / 1000 / 120));
