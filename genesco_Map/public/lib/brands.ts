import { SiteLocation } from './types';

export type BrandCode = '01' | '05' | '07' | '08' | '43' | '83';

export const BRANDS: Array<{ code: BrandCode; label: string }> = [
  { code: '01', label: 'Underground' },
  { code: '05', label: 'Journeys Kidz' },
  { code: '07', label: 'J&M (US)' },
  { code: '08', label: 'Journeys (US)' },
  { code: '43', label: 'Little Burgundy' },
  { code: '83', label: 'Journeys (CA)' },
];

export const BRAND_SHORTCUTS: Record<BrandCode, string> = {
  '01': 'UG',
  '05': 'JK',
  '07': 'JM',
  '08': 'JY',
  '43': 'LB',
  '83': 'JY',
};

const CANADIAN_PROVINCES = new Set([
  'AB',
  'BC',
  'MB',
  'NB',
  'NL',
  'NS',
  'NT',
  'NU',
  'ON',
  'PE',
  'QC',
  'SK',
  'YT',
]);

export const getBrandCode = (site: Pick<SiteLocation, 'name' | 'state'>): BrandCode | null => {
  const name = site.name.toUpperCase();
  const isCanadian = CANADIAN_PROVINCES.has(site.state.trim().toUpperCase());

  if (name.includes('UNDERGROUND')) return '01';
  if (name.includes('JOURNEYS KIDZ') || name.includes('JOURNEY KIDZ')) return '05';
  if (name.includes('LITTLE BURGUNDY')) return '43';
  if (name.includes('JOHNSTON') || /\bJ\s*&\s*M\b/.test(name)) {
    return isCanadian ? null : '07';
  }
  if (name.includes('JOURNEYS')) return isCanadian ? '83' : '08';
  if (name.includes('SHI')) return '08';

  return null;
};
