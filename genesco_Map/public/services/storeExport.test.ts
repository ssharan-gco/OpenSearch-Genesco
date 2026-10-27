import { SiteRecord } from '../lib/types';
import { createStoresCsv } from './storeExport';

const createSite = (overrides: Partial<SiteRecord> = {}): SiteRecord => ({
  siteId: '5004',
  name: 'Hamilton',
  address: '1 Main "First"',
  city: 'Hamilton',
  state: 'ON',
  zip: 'L9A 4X5',
  lat: 43,
  lon: -79,
  status: 'Registers Down',
  filterStatuses: ['Registers Down'],
  health: { up: true, services: {}, cpu: null, memory: null },
  ...overrides,
});

describe('createStoresCsv', () => {
  it('exports store number, full address, and display status as escaped CSV', () => {
    const csv = createStoresCsv([
      createSite(),
      createSite({
        siteId: '6200',
        address: '99 Oak Street',
        city: 'Toronto',
        state: 'ON',
        zip: '',
        status: 'Warning',
      }),
    ]);
    const contents = csv.replace(/^\uFEFF/, '');

    expect(contents.split('\r\n')).toEqual([
      '"Store Number","Address","Status"',
      '"5004","1 Main ""First"", Hamilton, ON, L9A 4X5","Registers Down"',
      '"6200","99 Oak Street, Toronto, ON","Attention Required"',
    ]);
  });
});
