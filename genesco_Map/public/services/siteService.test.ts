jest.mock('./registerMetrics', () => ({
  fetchAllStoreHealth: jest.fn().mockResolvedValue(new Map()),
}));
jest.mock('./victoriaMetrics', () => ({
  instantQuery: jest.fn().mockResolvedValue([]),
}));

import { displayLabel } from '../lib/constants';
import { BrandCode } from '../lib/brands';
import { SiteHealth, SiteRecord, SiteStatus } from '../lib/types';
import {
  deriveEnterpriseFilterStatuses,
  deriveEnterpriseStatus,
  deriveFilterStatuses,
  deriveStatus,
  buildSiteRecords,
  fetchSiteRecords,
  getSiteFilterCounts,
} from './siteService';

describe('fetchSiteRecords', () => {
  it('uses the same indexed site locations and shared health builder for map apps', async () => {
    const osSearch = jest.fn().mockResolvedValue({
      hits: {
        hits: [
          {
            _source: {
              site_id: 'store-2026',
              name: 'Journeys Store',
              city: 'Seattle',
              state: 'WA',
              lat: 47.6,
              lon: -122.3,
            },
          },
        ],
      },
    });

    const { records, sampleSites, sampleMetrics } = await fetchSiteRecords(osSearch);

    expect(osSearch).toHaveBeenCalledWith(
      'gensco-sites',
      expect.objectContaining({ query: { match_all: {} } })
    );
    expect(records.find(({ siteId }) => siteId === 'store-2026')).toMatchObject({
      name: 'Journeys Store',
      city: 'Seattle',
      state: 'WA',
      lat: 47.6,
      lon: -122.3,
    });
    expect(sampleSites).toBe(true);
    expect(sampleMetrics).toBe(true);
  });
});

describe('getSiteFilterCounts', () => {
  const createSite = (
    siteId: string,
    name: string,
    city: string,
    filterStatuses: SiteStatus[]
  ): SiteRecord => ({
    siteId,
    name,
    address: '',
    city,
    state: 'TN',
    zip: '',
    lat: 0,
    lon: 0,
    status: filterStatuses[0] || 'Down',
    filterStatuses,
    health: { up: true, services: {}, cpu: null, memory: null },
  });

  const sites = [
    createSite('ug-1', 'Underground Store', 'Nashville', ['Up']),
    createSite('ug-2', 'Underground Store', 'Memphis', ['Warning', 'Registers Down']),
    createSite('jk-1', 'Journeys Kidz Store', 'Knoxville', ['Down']),
    createSite('jm-1', 'Johnston & Murphy Store', 'Franklin', ['Down']),
    createSite('jm-ca-1', 'J&M Factory Store', 'Toronto', ['Up']),
  ];

  it('updates status counts for one or multiple selected brands', () => {
    expect(getSiteFilterCounts(sites, new Set<BrandCode>(['01']), '')).toEqual({
      counts: { Up: 1, Warning: 1, 'Registers Down': 1 },
      totalSites: 2,
    });

    expect(getSiteFilterCounts(sites, new Set<BrandCode>(['01', '05']), '')).toEqual({
      counts: { Up: 1, Warning: 1, 'Registers Down': 1, Down: 1 },
      totalSites: 3,
    });
  });

  it('filters J&M US stores under the renamed brand and excludes Canadian J&M from brand filters', () => {
    const usJmStore = createSite('jm-us-1', 'Johnston & Murphy Store', 'Franklin', ['Up']);
    const canadianJmStore = createSite('jm-ca-2', 'J&M Factory Store', 'Toronto', ['Up']);
    usJmStore.state = 'TN';
    canadianJmStore.state = 'ON';

    expect(
      getSiteFilterCounts([usJmStore, canadianJmStore], new Set<BrandCode>(['07']), '')
    ).toEqual({
      counts: { Up: 1 },
      totalSites: 1,
    });
    expect(getSiteFilterCounts([usJmStore, canadianJmStore], new Set<BrandCode>(), '')).toEqual({
      counts: { Up: 2 },
      totalSites: 2,
    });
  });

  it('applies search to counts without restricting them to the selected status', () => {
    expect(getSiteFilterCounts(sites, new Set<BrandCode>(['01', '05']), 'memphis')).toEqual({
      counts: { Warning: 1, 'Registers Down': 1 },
      totalSites: 1,
    });
  });

  it('limits status counts to the selected state, including postal abbreviations', () => {
    const californiaSite = createSite('ca-1', 'Underground Store', 'Los Angeles', ['Up']);
    californiaSite.state = 'CA';

    expect(
      getSiteFilterCounts([...sites, californiaSite], new Set<BrandCode>(), '', 'California')
    ).toEqual({
      counts: { Up: 1 },
      totalSites: 1,
    });
  });

  it('limits status counts to the selected region, including state abbreviations', () => {
    const californiaSite = createSite('ca-1', 'Underground Store', 'Los Angeles', ['Up']);
    californiaSite.state = 'CA';

    expect(
      getSiteFilterCounts([...sites, californiaSite], new Set<BrandCode>(), '', null, 'West')
    ).toEqual({
      counts: { Up: 1 },
      totalSites: 1,
    });
  });
});

describe('deriveStatus resource thresholds', () => {
  const createHealth = (overrides: Partial<SiteHealth> = {}): SiteHealth => ({
    up: true,
    services: {},
    cpu: null,
    memory: null,
    ...overrides,
  });

  it('classifies stores without current health as Store Down', () => {
    const missingHealth = buildSiteRecords(
      [
        {
          siteId: 'missing-health',
          name: 'Missing Health Store',
          address: '',
          city: 'Seattle',
          state: 'WA',
          zip: '',
          lat: 47.6,
          lon: -122.3,
        },
        {
          siteId: 'reporting-store',
          name: 'Reporting Store',
          address: '',
          city: 'Portland',
          state: 'OR',
          zip: '',
          lat: 45.5,
          lon: -122.6,
        },
      ],
      new Map([['reporting-store', createHealth()]])
    ).records.find(({ siteId }) => siteId === 'missing-health');

    expect(deriveStatus(undefined)).toBe('Down');
    expect(deriveStatus(createHealth({ up: null }))).toBe('Down');
    expect(missingHealth).toMatchObject({
      status: 'Down',
      filterStatuses: ['Down'],
    });
    expect(deriveEnterpriseStatus(createHealth({ up: null }))).toBe('Down');
    expect(deriveEnterpriseFilterStatuses(createHealth({ up: null }))).toEqual(['Down']);
  });

  describe('Enterprise status thresholds', () => {
    const createHealth = (overrides: Partial<SiteHealth> = {}): SiteHealth => ({
      up: true,
      services: {},
      cpu: null,
      memory: null,
      ...overrides,
    });

    it('ignores resource thresholds and resource-derived register status', () => {
      const health = createHealth({
        cpu: 99,
        memory: 98,
        registersDown: true,
        registersDegraded: true,
        registerStatuses: { '1': 'Down', '2': 'Degraded' },
        operationalRegisterStatuses: { '1': 'Up', '2': 'Up' },
      });

      expect(deriveEnterpriseStatus(health)).toBe('Up');
      expect(deriveEnterpriseFilterStatuses(health)).toEqual(['Up']);
    });

    it('requires attention for partial outages and shows down when every register is down', () => {
      const partialOutage = createHealth({
        operationalRegisterStatuses: { '1': 'Down', '2': 'Up' },
      });
      const fullOutage = createHealth({
        operationalRegisterStatuses: { '1': 'Down', '2': 'Down' },
      });

      expect(deriveEnterpriseStatus(partialOutage)).toBe('Warning');
      expect(deriveEnterpriseStatus(fullOutage)).toBe('Down');
      expect(deriveEnterpriseFilterStatuses(partialOutage)).toEqual(['Warning']);
      expect(deriveEnterpriseFilterStatuses(fullOutage)).toEqual(['Down']);
    });
  });

  it.each([
    ['CPU', 'cpu'],
    ['memory', 'memory'],
    ['disk', 'disk'],
  ] as const)('maps %s utilization to the expected site status', (_resource, field) => {
    const statusAt = (value: number) => deriveStatus(createHealth({ [field]: value })) as string;

    expect(statusAt(0)).toBe('Up');
    expect(statusAt(79.99)).toBe('Up');
    expect(statusAt(80)).toBe('Warning');
    expect(statusAt(97.99)).toBe('Warning');
    expect(statusAt(98)).toBe('Down');
    expect(statusAt(100)).toBe('Down');
    expect(deriveFilterStatuses(createHealth({ [field]: 98 }))).toEqual(['Down', 'Registers Down']);
  });

  it('maps an unassigned stopped service to Attention Required', () => {
    expect(displayLabel('Up')).toBe('Up');
    expect(displayLabel('Warning')).toBe('Attention Required');
    expect(displayLabel('Registers Down')).toBe('Registers Down');
    expect(deriveStatus(createHealth({ services: { 'POS 1 service-a': false } }))).toBe('Warning');
    expect(deriveFilterStatuses(createHealth({ services: { 'POS 1 service-a': false } }))).toEqual([
      'Warning',
    ]);
    expect(deriveStatus(createHealth({ registersDegraded: true }))).toBe('Warning');
    expect(
      deriveStatus(
        createHealth({
          registersDegraded: true,
          services: { 'POS 1 service-a': false },
        })
      )
    ).toBe('Warning');
  });

  it('uses Attention Required for partial outages and Store Down for all-register outages', () => {
    const partiallyDown = createHealth({
      services: { 'POS 1 service-a': false, 'POS 2 service-a': true },
      registersDown: undefined,
      registersDegraded: true,
      registerStatuses: { '1': 'Down', '2': 'Up' },
    });
    expect(deriveStatus(partiallyDown)).toBe('Warning');
    expect(deriveFilterStatuses(partiallyDown)).toEqual(['Warning', 'Registers Down']);

    const allDown = createHealth({
      services: { 'POS 1 service-a': false, 'POS 2 service-a': false },
      registersDown: true,
      registersDegraded: true,
      cpu: 85,
      memory: 88,
      registerStatuses: { '1': 'Down', '2': 'Down' },
    });
    expect(deriveStatus(allDown)).toBe('Down');
    expect(deriveFilterStatuses(allDown)).toEqual(['Down', 'Registers Down']);
  });

  it('includes a site with all registers down in App Services Down and Registers Down', () => {
    const filterStatuses = deriveFilterStatuses(
      createHealth({
        registersDown: true,
        services: { 'POS 1 service-a': false },
      })
    );

    expect(filterStatuses).toEqual(['Down', 'Registers Down']);
  });

  it('includes a partial register outage only in Registers Down, not App Services Down', () => {
    expect(
      deriveFilterStatuses(
        createHealth({
          services: { 'POS 1 service-a': false, 'POS 2 service-a': true },
          registerStatuses: { '1': 'Down', '2': 'Up' },
        })
      )
    ).toEqual(['Warning', 'Registers Down']);
  });

  it('does not include a site with a down register process in Attention Required without a resource warning', () => {
    expect(
      deriveFilterStatuses(createHealth({ registersDown: true, registerProcessesDown: true }))
    ).toEqual(['Down', 'Registers Down']);
  });

  it('prioritizes a down register over service warnings and resource warnings', () => {
    expect(
      deriveStatus(
        createHealth({
          registersDown: true,
          registersDegraded: true,
          cpu: 85,
          services: { 'POS 1 service-a': false },
        })
      )
    ).toBe('Down');
  });

  it.each([
    ['CPU', 'cpu'],
    ['memory', 'memory'],
    ['disk', 'disk'],
  ] as const)('includes a down register with degraded %s in both filters', (_resource, field) => {
    [80, 82.6, 97.99].forEach((value) => {
      const health = createHealth({ registersDown: true, [field]: value });

      expect(deriveStatus(health)).toBe('Down');
      expect(deriveFilterStatuses(health)).toEqual(['Down', 'Registers Down']);
    });
  });

  it.each([
    ['CPU', 'cpu'],
    ['memory', 'memory'],
    ['disk', 'disk'],
  ] as const)(
    'includes a down host with degraded %s in both resource filters',
    (_resource, field) => {
      [80, 82.6, 97.99].forEach((value) => {
        const health = createHealth({ up: false, [field]: value });

        expect(deriveStatus(health)).toBe('Down');
        expect(deriveFilterStatuses(health)).toEqual(['Down', 'Registers Down', 'Warning']);
      });
    }
  );

  it('does not add Attention Required when a resource is below 80% or at least 98%', () => {
    expect(deriveFilterStatuses(createHealth({ registersDown: true, memory: 79.99 }))).toEqual([
      'Down',
      'Registers Down',
    ]);
    expect(deriveFilterStatuses(createHealth({ registersDown: true, memory: 98 }))).toEqual([
      'Down',
      'Registers Down',
    ]);
  });

  it('includes a down host with critical resource usage only in Registers Down', () => {
    expect(deriveFilterStatuses(createHealth({ up: false, memory: 98 }))).toEqual([
      'Down',
      'Registers Down',
    ]);
  });

  it('keeps a down host out of the resource filters when usage is below 80%', () => {
    expect(deriveFilterStatuses(createHealth({ up: false, memory: 79.99 }))).toEqual(['Down']);
  });
});
