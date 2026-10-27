import { displayLabel } from '../lib/constants';
import { SiteHealth } from '../lib/types';
import { deriveFilterStatuses, deriveStatus } from './siteService';

describe('deriveStatus resource thresholds', () => {
  const createHealth = (overrides: Partial<SiteHealth> = {}): SiteHealth => ({
    up: true,
    services: {},
    cpu: null,
    memory: null,
    ...overrides,
  });

  it.each([
    ['CPU', 'cpu'],
    ['memory', 'memory'],
    ['disk', 'disk'],
  ] as const)('maps %s utilization to the expected site status', (_resource, field) => {
    const statusAt = (value: number) =>
      deriveStatus(createHealth({ [field]: value })) as string;

    expect(statusAt(0)).toBe('Up');
    expect(statusAt(79.99)).toBe('Up');
    expect(statusAt(80)).toBe('Warning');
    expect(statusAt(89.99)).toBe('Warning');
    expect(statusAt(90)).toBe('Registers Down');
    expect(statusAt(100)).toBe('Registers Down');
  });

  it('maps a stopped service or partially down register to Registers Down', () => {
    expect(displayLabel('Up')).toBe('Up');
    expect(displayLabel('Warning')).toBe('Attention Required');
    expect(displayLabel('Registers Down')).toBe('Registers Down');
    expect(deriveStatus(createHealth({ services: { 'POS 1 service-a': false } }))).toBe(
      'Registers Down'
    );
    expect(deriveStatus(createHealth({ registersDegraded: true }))).toBe('Warning');
    expect(
      deriveStatus(
        createHealth({
          registersDegraded: true,
          services: { 'POS 1 service-a': false },
        })
      )
    ).toBe('Registers Down');
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
    ).toBe('Registers Down');
  });

  it.each([
    ['CPU', 'cpu'],
    ['memory', 'memory'],
    ['disk', 'disk'],
  ] as const)('includes a down register with degraded %s in both filters', (_resource, field) => {
    [80, 82.6, 89.99].forEach((value) => {
      const health = createHealth({ registersDown: true, [field]: value });

      expect(deriveStatus(health)).toBe('Registers Down');
      expect(deriveFilterStatuses(health)).toEqual(['Registers Down', 'Warning']);
    });
  });

  it('does not add Attention Required when a resource is below 80% or at least 90%', () => {
    expect(
      deriveFilterStatuses(createHealth({ registersDown: true, memory: 79.99 }))
    ).toEqual(['Registers Down']);
    expect(
      deriveFilterStatuses(createHealth({ registersDown: true, memory: 90 }))
    ).toEqual(['Registers Down']);
  });
});
