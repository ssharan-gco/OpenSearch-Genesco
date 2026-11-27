import storeHoursData from './store-hours.json';

export interface StoreHoursWindow {
  start: number;
  end: number;
}

export interface StoreHours {
  timezone: string;
  weekly: Record<string, StoreHoursWindow | null>;
}

export type StoreHoursMap = Record<string, StoreHours>;

export const STORE_HOURS: StoreHoursMap = storeHoursData;

const getStoreNumber = (siteId: string) => {
  const id = siteId.trim();
  return /^\d{1,4}$/.test(id) ? id.padStart(4, '0') : id;
};

const weekdayNames = new Set([
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]);

export const isOutsideStoreHours = (
  siteId: string,
  at: Date,
  hoursByStore: StoreHoursMap = STORE_HOURS
): boolean => {
  const storeHours = hoursByStore[getStoreNumber(siteId)];
  if (!storeHours) return false;
  if (!Number.isFinite(at.getTime())) {
    throw new Error('Cannot determine store status for an invalid date');
  }

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: storeHours.timezone,
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(at);
  const localParts = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const weekday = localParts.weekday?.toLowerCase();
  if (!weekday || !weekdayNames.has(weekday)) {
    throw new Error(`Unable to determine local weekday for store ${siteId}`);
  }

  const window = storeHours.weekly[weekday];
  if (!window) return true;

  const minute = Number(localParts.hour) * 60 + Number(localParts.minute);
  return minute < window.start || minute >= window.end;
};
