jest.mock('./victoriaMetrics', () => ({
  instantQuery: jest.fn(),
  instantQueryAt: jest.fn(),
  rangeQueryRequired: jest.fn(),
}));

import { instantQuery, instantQueryAt, rangeQueryRequired } from './victoriaMetrics';
import {
  calculateStoreHealth,
  fetchAllStoreHealth,
  fetchStoreRegisterDashboard,
  getResourceStatus,
  summarizeStoreRegisters,
} from './registerMetrics';

const instantQueryMock = instantQuery as jest.Mock;
const instantQueryAtMock = instantQueryAt as jest.Mock;
const rangeQueryRequiredMock = rangeQueryRequired as jest.Mock;
const SAMPLE_TIMESTAMP_MS = Date.UTC(2026, 9, 19, 0, 0);

describe('fetchAllStoreHealth register aggregation', () => {
  beforeEach(() => {
    instantQueryMock.mockImplementation((query: string) => {
      if (query.startsWith('count by (store)')) {
        return Promise.resolve([
          { metric: { store: 'partial' }, value: [100, '2'] },
          { metric: { store: 'down' }, value: [100, '1'] },
          { metric: { store: 'healthy' }, value: [100, '1'] },
          { metric: { store: 'no-data' }, value: [100, '1'] },
        ]);
      }
      if (query.includes('xstore_pos_service_ratio')) {
        return Promise.resolve([
          {
            metric: { store: 'partial', register: '1', instance: 'service-a' },
            value: [100, '0'],
          },
        ]);
      }
      if (query.includes('xstore_pos_Process_id_ratio')) {
        return Promise.resolve([
          { metric: { store: 'partial', register: '1', instance: 'process-a' }, value: [100, '0'] },
          { metric: { store: 'partial', register: '1', instance: 'process-b' }, value: [100, '123'] },
          { metric: { store: 'down', register: '1', instance: 'process-a' }, value: [100, '0'] },
          { metric: { store: 'down', register: '1', instance: 'process-b' }, value: [100, '0'] },
          { metric: { store: 'healthy', register: '1', instance: 'process-a' }, value: [100, '123'] },
          { metric: { store: 'no-data', register: '1', instance: 'process-a' }, value: [100, null] },
        ]);
      }
      return Promise.resolve([]);
    });
  });

  it('distinguishes one failed process/service from an entirely down register', async () => {
    const health = await fetchAllStoreHealth();

    expect(health.get('partial')).toMatchObject({
      registersDown: true,
      services: { 'POS 1 service-a': false },
    });
    expect(health.get('partial')).not.toHaveProperty('registersDegraded');
    expect(health.get('down')?.registersDown).toBe(true);
    expect(health.get('healthy')?.registersDown).toBeUndefined();
    expect(health.get('healthy')?.registersDegraded).toBeUndefined();
    expect(health.get('no-data')?.registersDown).toBe(true);
    expect(health.get('no-data')?.registersDegraded).toBeUndefined();
  });
});

describe('getResourceStatus', () => {
  it('uses green below 80%, amber from 80% to below 90%, and red from 90%', () => {
    [0, 1, 2].forEach((resourceIndex) => {
      const values = [25, 25, 25];
      values[resourceIndex] = 79;
      expect(getResourceStatus(values[0], values[1], values[2])).toBe('Healthy');
      values[resourceIndex] = 80;
      expect(getResourceStatus(values[0], values[1], values[2])).toBe('Degraded');
      values[resourceIndex] = 89.99;
      expect(getResourceStatus(values[0], values[1], values[2])).toBe('Degraded');
      values[resourceIndex] = 90;
      expect(getResourceStatus(values[0], values[1], values[2])).toBe('Down');
    });
  });
});

describe('fetchStoreRegisterDashboard history', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    instantQueryAtMock.mockImplementation((query: string) => {
      if (query.startsWith('min by')) {
        return Promise.resolve([
          {
            metric: { store: '6200', register: '1' },
            value: [SAMPLE_TIMESTAMP_MS / 1000, String(SAMPLE_TIMESTAMP_MS / 1000)],
          },
        ]);
      }
      if (query.startsWith('tlast_over_time')) {
        return Promise.resolve([
          {
            metric: { store: '6200', register: '1' },
            value: [SAMPLE_TIMESTAMP_MS / 1000, String(SAMPLE_TIMESTAMP_MS / 1000)],
          },
        ]);
      }
      return Promise.resolve([
        {
          metric: {
            __name__: 'xstore_pos_Process_id_ratio',
            store: '6200',
            register: '1',
            host_name: 'awsd6200r01',
            instance: 'xstore',
          },
          value: [100, '1234'],
        },
        {
          metric: {
            __name__: 'xstore_pos_service_ratio',
            store: '6200',
            register: '1',
            host_name: 'awsd6200r01',
            instance: 'posi.service',
          },
          value: [100, '1'],
        },
        {
          metric: {
            __name__: 'xstore_pos_uptime_seconds',
            store: '6200',
            register: '1',
            host_name: 'awsd6200r01',
          },
          value: [100, '3600'],
        },
      ]);
    });
    rangeQueryRequiredMock.mockImplementation((query: string) => {
      if (query.startsWith('xstore_pos_Process_id_ratio')) {
        return Promise.resolve([
          {
            metric: { register: '1', instance: 'xstore' },
            values: [
              [100, '1234'],
              [200, '0'],
              [300, null],
            ],
          },
        ]);
      }
      if (query.startsWith('xstore_pos_service_ratio')) {
        return Promise.resolve([
          {
            metric: { register: '1', instance: 'posi.service' },
            values: [
              [100, '1'],
              [200, '0'],
              [300, '1'],
            ],
          },
        ]);
      }
      return Promise.resolve([
        {
          metric: { register: '1' },
          values: [
            [100, '3600'],
            [200, '5'],
            [300, '65'],
          ],
        },
      ]);
    });
  });

  it('uses the selected end time for current status and the full range for status history', async () => {
    const timeWindow = {
      fromMs: Date.UTC(2026, 9, 18, 0, 0),
      toMs: Date.UTC(2026, 9, 19, 0, 0),
    };
    const dashboard = await fetchStoreRegisterDashboard('6200', timeWindow);
    const [register] = dashboard.registers;

    expect(register.status).toBe('Healthy');
    expect(register.history).toEqual([1, 0, 1]);
    expect(register.processes[0].history).toEqual([1, 0, 0]);
    expect(register.services[0].history).toEqual([1, 0, 1]);
    expect(register.healthHistory).toEqual([1, 0, 0]);
    expect(instantQueryAtMock).toHaveBeenCalledWith(
      'last_over_time({__name__=~"xstore_pos_.*",store="6200"}[86400s])',
      timeWindow.toMs
    );
    expect(rangeQueryRequiredMock).toHaveBeenCalledWith(
      'xstore_pos_Process_id_ratio{store="6200"}',
      timeWindow,
      12 * 60
    );
    expect(rangeQueryRequiredMock).toHaveBeenCalledWith(
      'xstore_pos_service_ratio{store="6200"}',
      timeWindow,
      12 * 60
    );
  });

  it('marks the register down when a process is down at the selected end time', async () => {
    const timeWindow = {
      fromMs: Date.UTC(2026, 9, 18, 0, 0),
      toMs: Date.UTC(2026, 9, 19, 0, 0),
    };
    const toTimestamp = timeWindow.toMs / 1000;
    instantQueryAtMock.mockImplementation((query: string) => {
      if (query.startsWith('min by') || query.startsWith('tlast_over_time')) {
        return Promise.resolve([
          {
            metric: { store: '6200', register: '1' },
            value: [toTimestamp, String(toTimestamp)],
          },
        ]);
      }
      return Promise.resolve([
        {
          metric: {
            __name__: 'xstore_pos_Process_id_ratio',
            store: '6200',
            register: '1',
            host_name: 'awsd6200r01',
            instance: 'xstore',
          },
          value: [toTimestamp, '0'],
        },
        {
          metric: {
            __name__: 'xstore_pos_service_ratio',
            store: '6200',
            register: '1',
            host_name: 'awsd6200r01',
            instance: 'posi.service',
          },
          value: [toTimestamp, '1'],
        },
        {
          metric: {
            __name__: 'xstore_pos_uptime_seconds',
            store: '6200',
            register: '1',
            host_name: 'awsd6200r01',
          },
          value: [toTimestamp, '3600'],
        },
      ]);
    });

    const dashboard = await fetchStoreRegisterDashboard('6200', timeWindow);
    const [register] = dashboard.registers;

    expect(register.status).toBe('Down');
    expect(register.processes[0].status).toBe('Down');
    expect(instantQueryAtMock).toHaveBeenCalledWith(
      'last_over_time({__name__=~"xstore_pos_.*",store="6200"}[86400s])',
      timeWindow.toMs
    );
  });

  it('keeps the register down when the latest uptime sample indicates a restart in progress', async () => {
    rangeQueryRequiredMock.mockImplementation((query: string) =>
      query.startsWith('xstore_pos_uptime_seconds')
        ? Promise.resolve([
            {
              metric: { register: '1' },
              values: [
                [100, '3600'],
                [200, '7200'],
                [300, '5'],
              ],
            },
          ])
        : Promise.resolve([])
    );
    const timeWindow = {
      fromMs: Date.UTC(2026, 9, 18, 0, 0),
      toMs: Date.UTC(2026, 9, 19, 0, 0),
    };

    const dashboard = await fetchStoreRegisterDashboard('6200', timeWindow);
    const [register] = dashboard.registers;

    expect(register.processes.every((process) => process.status === 'Up')).toBe(true);
    expect(register.services.every((service) => service.status === 'Up')).toBe(true);
    expect(register.history).toEqual([1, 1, 0]);
    expect(register.status).toBe('Down');
  });

  it('counts each register and reported process/service from the response', async () => {
    const timeWindow = {
      fromMs: Date.UTC(2026, 9, 18, 0, 0),
      toMs: SAMPLE_TIMESTAMP_MS,
    };
    const timestampSeconds = SAMPLE_TIMESTAMP_MS / 1000;
    const responseRows = [
      { register: '1', metric: 'xstore_pos_uptime_seconds', value: '3600' },
      { register: '1', metric: 'xstore_pos_cpu_usage_percent', value: '70' },
      { register: '1', metric: 'xstore_pos_memory_usage_percent', value: '70' },
      { register: '1', metric: 'xstore_pos_disk_usage_percent', value: '70' },
      { register: '1', metric: 'xstore_pos_Process_id_ratio', instance: 'process-a', value: '101' },
      {
        register: '1',
        metric: 'xstore_pos_Process_id_ratio',
        instance: 'process-b',
        value: '202',
      },
      { register: '1', metric: 'xstore_pos_service_ratio', instance: 'service-a', value: '1' },
      { register: '2', metric: 'xstore_pos_uptime_seconds', value: '3600' },
      { register: '2', metric: 'xstore_pos_memory_usage_percent', value: '85' },
      { register: '2', metric: 'xstore_pos_Process_id_ratio', instance: 'process-a', value: '101' },
      { register: '2', metric: 'xstore_pos_Process_id_ratio', instance: 'process-b', value: '202' },
      { register: '2', metric: 'xstore_pos_service_ratio', instance: 'service-a', value: '0' },
      { register: '3', metric: 'xstore_pos_uptime_seconds', value: '3600' },
      { register: '3', metric: 'xstore_pos_cpu_usage_percent', value: '80' },
      { register: '3', metric: 'xstore_pos_Process_id_ratio', instance: 'process-a', value: '0' },
      { register: '3', metric: 'xstore_pos_service_ratio', instance: 'service-a', value: '1' },
      { register: '4', metric: 'xstore_pos_uptime_seconds', value: '3600' },
      { register: '4', metric: 'xstore_pos_disk_usage_percent', value: '90' },
    ].map(({ register, metric, instance, value }) => ({
      metric: {
        __name__: metric,
        store: '6200',
        register,
        host_name: `host-${register}`,
        ...(instance ? { instance } : {}),
      },
      value: [timestampSeconds, value] as [number, string],
    }));
    const freshnessRows = ['1', '2', '3', '4'].map((register) => ({
      metric: { store: '6200', register },
      value: [timestampSeconds, String(timestampSeconds)] as [number, string],
    }));

    instantQueryAtMock.mockImplementation((query: string) => {
      const isFreshnessQuery =
        query.startsWith('min by') || query.startsWith('tlast_over_time');
      return Promise.resolve(isFreshnessQuery ? freshnessRows : responseRows);
    });
    rangeQueryRequiredMock.mockImplementation((query: string) =>
      Promise.resolve(
        query.startsWith('xstore_pos_uptime_seconds')
          ? ['1', '2', '3', '4'].map((register) => ({
              metric: { register },
              values: [
                [timestampSeconds, register === '3' ? null : '3600'],
              ] as Array<[number, string | null]>,
            }))
          : query.startsWith('xstore_pos_Process_id_ratio')
            ? [
                ...['1', '2'].map((register) => ({
                  metric: { register, instance: 'process-a' },
                  values: [[timestampSeconds, '101']] as Array<[number, string]>,
                })),
                ...['1', '2'].map((register) => ({
                  metric: { register, instance: 'process-b' },
                  values: [[timestampSeconds, '202']] as Array<[number, string]>,
                })),
                {
                  metric: { register: '3', instance: 'process-a' },
                  values: [[timestampSeconds, '0']] as Array<[number, string]>,
                },
              ]
            : ['1', '2', '3'].map((register) => ({
                metric: { register, instance: 'service-a' },
                values: [
                  [timestampSeconds, register === '2' ? '0' : '1'],
                ] as Array<[number, string]>,
              }))
      )
    );

    const dashboard = await fetchStoreRegisterDashboard('6200', timeWindow);
    const counts = summarizeStoreRegisters(dashboard.registers);

    expect(dashboard.registers.map(({ status }) => status)).toEqual([
      'Healthy',
      'Down',
      'Down',
      'Down',
    ]);
    expect(dashboard.registers[3].processes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'process-a', pid: null, status: 'Down', history: [0] }),
        expect.objectContaining({ name: 'process-b', pid: null, status: 'Down', history: [0] }),
      ])
    );
    expect(dashboard.registers[3].services).toEqual([
      expect.objectContaining({ name: 'service-a', status: 'Down', history: [0] }),
    ]);
    expect(dashboard.registers[2].processes).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'process-a', status: 'Down' })])
    );
    expect(dashboard.registers[2].services).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'service-a', status: 'Up' })])
    );
    expect(dashboard.registers[1].services).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'service-a', status: 'Down' })])
    );
    expect(dashboard.registers.map(({ healthHistory }) => healthHistory)).toEqual([
      [1],
      [0],
      [0],
      [0],
    ]);
    expect(calculateStoreHealth(dashboard.registers)).toBe(25);
    expect(counts).toEqual({
      registers: 4,
      healthy: 1,
      degraded: 0,
      down: 3,
      processes: 8,
      processesUp: 4,
      services: 4,
      servicesUp: 2,
    });
  });

  it('marks null process and service readings as down with red history samples', async () => {
    const timeWindow = {
      fromMs: Date.UTC(2026, 9, 18, 0, 0),
      toMs: SAMPLE_TIMESTAMP_MS,
    };
    const timestampSeconds = SAMPLE_TIMESTAMP_MS / 1000;
    instantQueryAtMock.mockImplementation((query: string) => {
      if (query.startsWith('min by') || query.startsWith('tlast_over_time')) {
        return Promise.resolve([
          {
            metric: { store: '6200', register: '1' },
            value: [timestampSeconds, String(timestampSeconds)],
          },
        ]);
      }
      return Promise.resolve([
        {
          metric: {
            __name__: 'xstore_pos_uptime_seconds',
            store: '6200',
            register: '1',
            host_name: 'awsd6200r01',
          },
          value: [timestampSeconds, '3600'],
        },
        {
          metric: {
            __name__: 'xstore_pos_Process_id_ratio',
            store: '6200',
            register: '1',
            instance: 'xstore',
          },
          value: [timestampSeconds, null],
        },
        {
          metric: {
            __name__: 'xstore_pos_service_ratio',
            store: '6200',
            register: '1',
            instance: 'posi.service',
          },
          value: [timestampSeconds, null],
        },
      ]);
    });
    rangeQueryRequiredMock.mockImplementation((query: string) =>
      Promise.resolve(
        query.startsWith('xstore_pos_uptime_seconds')
          ? [
              {
                metric: { register: '1' },
                values: [[timestampSeconds, '3600']] as Array<[number, string | null]>,
              },
            ]
          : [
              {
                metric: {
                  register: '1',
                  instance: query.includes('Process_id') ? 'xstore' : 'posi.service',
                },
                values: [[timestampSeconds, null]] as Array<[number, string | null]>,
              },
            ]
      )
    );

    const dashboard = await fetchStoreRegisterDashboard('6200', timeWindow);
    const [register] = dashboard.registers;

    expect(register.status).toBe('Down');
    expect(register.processes[0]).toMatchObject({ status: 'Down', history: [0] });
    expect(register.services[0]).toMatchObject({ status: 'Down', history: [0] });
  });
});
