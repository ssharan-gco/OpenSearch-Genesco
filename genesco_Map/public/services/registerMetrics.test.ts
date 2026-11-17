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
      if (query.startsWith('count by (store, register)')) {
        return Promise.resolve([
          { metric: { store: 'partial', register: '1' }, value: [100, '1'] },
          { metric: { store: 'down', register: '1' }, value: [100, '1'] },
          { metric: { store: 'healthy', register: '1' }, value: [100, '1'] },
          { metric: { store: 'no-data', register: '1' }, value: [100, '1'] },
        ]);
      }
      if (query.includes('xstore_pos_service_ratio')) {
        return Promise.resolve([
          {
            metric: { store: 'partial', register: '1', instance: 'service-a' },
            value: [100, '0'],
          },
          {
            metric: { store: 'healthy', register: '1', instance: 'service-a' },
            value: [100, '1'],
          },
        ]);
      }
      if (query.includes('xstore_pos_Process_id_ratio')) {
        return Promise.resolve([
          { metric: { store: 'partial', register: '1', instance: 'process-a' }, value: [100, '0'] },
          {
            metric: { store: 'partial', register: '1', instance: 'process-b' },
            value: [100, '123'],
          },
          { metric: { store: 'down', register: '1', instance: 'process-a' }, value: [100, '0'] },
          { metric: { store: 'down', register: '1', instance: 'process-b' }, value: [100, '0'] },
          {
            metric: { store: 'healthy', register: '1', instance: 'process-a' },
            value: [100, '123'],
          },
          {
            metric: { store: 'no-data', register: '1', instance: 'process-a' },
            value: [100, null],
          },
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
      registerStatuses: { '1': 'Down' },
    });
    expect(health.get('partial')).not.toHaveProperty('registersDegraded');
    expect(health.get('down')?.registersDown).toBe(true);
    expect(health.get('down')?.registerStatuses).toEqual({ '1': 'Down' });
    expect(health.get('down')?.operationalRegisterStatuses).toEqual({ '1': 'Down' });
    expect(health.get('healthy')?.registersDown).toBeUndefined();
    expect(health.get('healthy')?.registersDegraded).toBeUndefined();
    expect(health.get('healthy')?.registerStatuses).toEqual({ '1': 'Up' });
    expect(health.get('healthy')?.operationalRegisterStatuses).toEqual({ '1': 'Up' });
    expect(health.get('no-data')?.registersDown).toBe(true);
    expect(health.get('no-data')?.registersDegraded).toBeUndefined();
    expect(health.get('no-data')?.registerStatuses).toEqual({ '1': 'Down' });
  });

  it('marks a register degraded when its resource usage reaches the warning threshold', async () => {
    instantQueryMock.mockImplementation((query: string) => {
      if (query.startsWith('count by (store, register)')) {
        return Promise.resolve([
          { metric: { store: 'resource-warning', register: '1' }, value: [100, '1'] },
          { metric: { store: 'resource-warning', register: '2' }, value: [100, '1'] },
        ]);
      }
      if (query.includes('xstore_pos_service_ratio')) {
        return Promise.resolve([
          {
            metric: { store: 'resource-warning', register: '1', instance: 'service-a' },
            value: [100, '1'],
          },
          {
            metric: { store: 'resource-warning', register: '2', instance: 'service-a' },
            value: [100, '1'],
          },
        ]);
      }
      if (query.includes('xstore_pos_Process_id_ratio')) {
        return Promise.resolve([
          {
            metric: { store: 'resource-warning', register: '1', instance: 'process-a' },
            value: [100, '123'],
          },
          {
            metric: { store: 'resource-warning', register: '2', instance: 'process-a' },
            value: [100, '123'],
          },
        ]);
      }
      if (query.includes('xstore_pos_cpu_usage_percent')) {
        return Promise.resolve([
          { metric: { store: 'resource-warning', register: '1' }, value: [100, '82'] },
          { metric: { store: 'resource-warning', register: '2' }, value: [100, '35'] },
        ]);
      }
      if (query.includes('xstore_pos_memory_usage_percent')) {
        return Promise.resolve([
          { metric: { store: 'resource-warning', register: '1' }, value: [100, '30'] },
        ]);
      }
      return Promise.resolve([]);
    });

    const health = await fetchAllStoreHealth();

    expect(health.get('resource-warning')).toMatchObject({
      registersDegraded: true,
      cpu: 82,
      memory: 30,
      registerStatuses: { '1': 'Degraded', '2': 'Up' },
      operationalRegisterStatuses: { '1': 'Up', '2': 'Up' },
    });
  });

  it('marks a store degraded when only some of its registers are down', async () => {
    instantQueryMock.mockImplementation((query: string) => {
      if (query.startsWith('count by (store, register)')) {
        return Promise.resolve([
          { metric: { store: 'partial-outage', register: '1' }, value: [100, '1'] },
          { metric: { store: 'partial-outage', register: '2' }, value: [100, '1'] },
        ]);
      }
      if (query.includes('xstore_pos_service_ratio')) {
        return Promise.resolve([
          {
            metric: { store: 'partial-outage', register: '1', instance: 'service-a' },
            value: [100, '0'],
          },
          {
            metric: { store: 'partial-outage', register: '2', instance: 'service-a' },
            value: [100, '1'],
          },
        ]);
      }
      if (query.includes('xstore_pos_Process_id_ratio')) {
        return Promise.resolve([
          {
            metric: { store: 'partial-outage', register: '1', instance: 'process-a' },
            value: [100, '0'],
          },
          {
            metric: { store: 'partial-outage', register: '2', instance: 'process-a' },
            value: [100, '123'],
          },
        ]);
      }
      return Promise.resolve([]);
    });

    const health = await fetchAllStoreHealth();

    expect(health.get('partial-outage')).toMatchObject({
      registersDegraded: true,
      registerStatuses: { '1': 'Down', '2': 'Up' },
    });
    expect(health.get('partial-outage')).not.toHaveProperty('registersDown');
  });

  it('checks current POS metrics and uses a 24-hour history baseline', async () => {
    instantQueryMock.mockClear();
    await fetchAllStoreHealth();

    expect(instantQueryMock.mock.calls.map(([query]) => query)).toEqual([
      'count by (store, register) (last_over_time(xstore_pos_uptime_seconds[5m]))',
      'last_over_time(xstore_pos_service_ratio[5m])',
      'last_over_time(xstore_pos_Process_id_ratio[5m])',
      'last_over_time(xstore_pos_cpu_usage_percent[5m])',
      'last_over_time(xstore_pos_memory_usage_percent[5m])',
      'last_over_time(xstore_pos_disk_usage_percent[5m])',
      'count by (store, register) (last_over_time({__name__=~"xstore_pos_.*"}[24h]))',
    ]);
  });

  it('marks a historically reporting store down when no current process or service data arrives', async () => {
    instantQueryMock.mockImplementation((query: string) =>
      Promise.resolve(
        query === 'count by (store, register) (last_over_time({__name__=~"xstore_pos_.*"}[24h]))'
          ? [
              {
                metric: {
                  __name__: 'xstore_pos_uptime_seconds',
                  store: 'stale-store',
                  register: '1',
                },
                value: [100, '3600'],
              },
            ]
          : []
      )
    );

    const health = await fetchAllStoreHealth();

    expect(health.get('stale-store')).toMatchObject({
      up: false,
      registersDown: true,
      registerStatuses: { '1': 'Down' },
      operationalRegisterStatuses: { '1': 'Down' },
    });
  });
});

describe('getResourceStatus', () => {
  it('uses green below 80%, amber from 80% to below 98%, and red from 98%', () => {
    [0, 1, 2].forEach((resourceIndex) => {
      const values = [25, 25, 25];
      values[resourceIndex] = 79;
      expect(getResourceStatus(values[0], values[1], values[2])).toBe('Healthy');
      values[resourceIndex] = 80;
      expect(getResourceStatus(values[0], values[1], values[2])).toBe('Degraded');
      values[resourceIndex] = 97.99;
      expect(getResourceStatus(values[0], values[1], values[2])).toBe('Degraded');
      values[resourceIndex] = 98;
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
    expect(register.processes[0].history).toEqual([
      { timestampMs: 100000, value: 1234, status: 1 },
      { timestampMs: 200000, value: 0, status: 0 },
      { timestampMs: 300000, value: null, status: 0 },
    ]);
    expect(register.services[0].history).toEqual([
      { timestampMs: 100000, value: 1, status: 1 },
      { timestampMs: 200000, value: 0, status: 0 },
      { timestampMs: 300000, value: 1, status: 1 },
    ]);
    expect(register.healthHistory).toEqual([1, 0, 1]);
    expect(
      register.healthTimeline.map(({ timestampMs, status }) => ({ timestampMs, status }))
    ).toEqual([
      { timestampMs: 100000, status: 1 },
      { timestampMs: 200000, status: 0 },
      { timestampMs: 300000, status: 1 },
    ]);
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
    expect(instantQueryAtMock).toHaveBeenCalledWith(
      'last_over_time({__name__=~"xstore_pos_Process_id_ratio|xstore_pos_service_ratio",store="6200"}[24h])',
      timeWindow.toMs
    );
    expect(instantQueryAtMock).toHaveBeenCalledWith(
      'last_over_time({__name__=~"xstore_pos_Process_id_ratio|xstore_pos_service_ratio",store="6200"}[5m])',
      timeWindow.toMs
    );
  });

  it('marks store, process, and service range bars down when component telemetry stops', async () => {
    const timeWindow = {
      fromMs: Date.UTC(2026, 9, 18, 0, 0),
      toMs: Date.UTC(2026, 9, 19, 0, 0),
    };
    const timestamp = timeWindow.toMs / 1000;
    const historicalRows = [
      {
        metric: {
          __name__: 'xstore_pos_uptime_seconds',
          store: '6200',
          register: '1',
        },
        value: [timestamp - 60, '3600'] as [number, string],
      },
      {
        metric: {
          __name__: 'xstore_pos_Process_id_ratio',
          store: '6200',
          register: '1',
          instance: 'xstore',
        },
        value: [timestamp - 60, '1234'] as [number, string],
      },
      {
        metric: {
          __name__: 'xstore_pos_service_ratio',
          store: '6200',
          register: '1',
          instance: 'posi.service',
        },
        value: [timestamp - 60, '1'] as [number, string],
      },
    ];
    const currentRows = [
      historicalRows[1],
      historicalRows[2],
      {
        metric: {
          __name__: 'xstore_pos_uptime_seconds',
          store: '6200',
          register: '1',
        },
        value: [timestamp, '3600'] as [number, string],
      },
    ];
    instantQueryAtMock.mockImplementation((query: string) => {
      if (query.startsWith('min by') || query.startsWith('tlast_over_time')) {
        return Promise.resolve([
          {
            metric: { store: '6200', register: '1' },
            value: [timestamp, String(timestamp)],
          },
        ]);
      }
      if (query.endsWith('[24h])') && query.includes('__name__=~')) {
        return Promise.resolve(historicalRows);
      }
      if (query.endsWith('[5m])') && query.includes('__name__=~')) {
        return Promise.resolve([]);
      }
      return Promise.resolve(currentRows);
    });

    const dashboard = await fetchStoreRegisterDashboard('6200', timeWindow);
    const [register] = dashboard.registers;
    const process = register.processes.find(({ name }) => name === 'xstore');
    const service = register.services.find(({ name }) => name === 'posi.service');

    expect(register.status).toBe('Down');
    expect(register.healthTimeline[register.healthTimeline.length - 1]).toMatchObject({
      timestampMs: timeWindow.toMs,
      status: 0,
    });
    expect(process?.status).toBe('Down');
    expect(process?.history[process.history.length - 1]).toMatchObject({
      timestampMs: timeWindow.toMs,
      status: 0,
    });
    expect(service?.status).toBe('Down');
    expect(service?.history[service.history.length - 1]).toMatchObject({
      timestampMs: timeWindow.toMs,
      status: 0,
    });
  });

  it('marks a silent register down when another register is still reporting', async () => {
    const timeWindow = {
      fromMs: Date.UTC(2026, 9, 18, 0, 0),
      toMs: Date.UTC(2026, 9, 19, 0, 0),
    };
    const timestamp = timeWindow.toMs / 1000;
    const processRow = (register: string) => ({
      metric: {
        __name__: 'xstore_pos_Process_id_ratio',
        store: '6200',
        register,
        instance: 'xstore',
      },
      value: [timestamp, '1234'] as [number, string],
    });
    const serviceRow = (register: string) => ({
      metric: {
        __name__: 'xstore_pos_service_ratio',
        store: '6200',
        register,
        instance: 'posi.service',
      },
      value: [timestamp, '1'] as [number, string],
    });
    const uptimeRow = (register: string) => ({
      metric: { __name__: 'xstore_pos_uptime_seconds', store: '6200', register },
      value: [timestamp, '3600'] as [number, string],
    });
    const historicalRows = [
      {
        ...uptimeRow('1'),
      },
      processRow('1'),
      serviceRow('1'),
      uptimeRow('2'),
      processRow('2'),
      serviceRow('2'),
    ];
    const currentServiceRows = [processRow('2'), serviceRow('2')];
    instantQueryAtMock.mockImplementation((query: string) => {
      if (query.startsWith('min by') || query.startsWith('tlast_over_time')) {
        return Promise.resolve([
          {
            metric: { store: '6200', register: '1' },
            value: [timestamp, String(timestamp)],
          },
        ]);
      }
      if (query.endsWith('[24h])') && query.includes('xstore_pos_Process_id_ratio|')) {
        return Promise.resolve(
          historicalRows.filter((row) => row.metric.__name__ !== 'xstore_pos_uptime_seconds')
        );
      }
      if (query.endsWith('[24h])') && query.includes('xstore_pos_.*')) {
        return Promise.resolve(historicalRows);
      }
      if (query.endsWith('[5m])') && query.includes('__name__=~')) {
        return Promise.resolve(currentServiceRows);
      }
      return Promise.resolve(historicalRows);
    });

    const dashboard = await fetchStoreRegisterDashboard('6200', timeWindow);
    const register1 = dashboard.registers.find(({ id }) => id === '1');
    const register2 = dashboard.registers.find(({ id }) => id === '2');
    const process1 = register1?.processes.find(({ name }) => name === 'xstore');
    const service1 = register1?.services.find(({ name }) => name === 'posi.service');

    expect(register1?.status).toBe('Down');
    expect(process1?.status).toBe('Down');
    expect(process1?.history[process1.history.length - 1].status).toBe(0);
    expect(service1?.status).toBe('Down');
    expect(service1?.history[service1.history.length - 1].status).toBe(0);
    expect(register2?.status).toBe('Healthy');
    expect(register2?.processes[0].status).toBe('Up');
    expect(register2?.services[0].status).toBe('Up');
  });

  it('includes resource thresholds in range status and aligns the last sample with latest status', async () => {
    const timeWindow = {
      fromMs: Date.UTC(2026, 9, 18, 0, 0),
      toMs: Date.UTC(2026, 9, 19, 0, 0),
    };
    const timestamps = [100, 200, 300];
    instantQueryAtMock.mockImplementation((query: string) => {
      if (query.startsWith('min by') || query.startsWith('tlast_over_time')) {
        return Promise.resolve([
          {
            metric: { store: '6200', register: '1' },
            value: [300, '300'],
          },
        ]);
      }
      return Promise.resolve([
        {
          metric: {
            __name__: 'xstore_pos_Process_id_ratio',
            store: '6200',
            register: '1',
            instance: 'xstore',
          },
          value: [300, '1234'],
        },
        {
          metric: {
            __name__: 'xstore_pos_service_ratio',
            store: '6200',
            register: '1',
            instance: 'posi.service',
          },
          value: [300, '1'],
        },
        {
          metric: {
            __name__: 'xstore_pos_uptime_seconds',
            store: '6200',
            register: '1',
          },
          value: [300, '1200'],
        },
        {
          metric: {
            __name__: 'xstore_pos_cpu_usage_percent',
            store: '6200',
            register: '1',
          },
          value: [300, '98'],
        },
      ]);
    });
    rangeQueryRequiredMock.mockImplementation((query: string) => {
      const metricName = query.startsWith('xstore_pos_uptime_seconds')
        ? 'xstore_pos_uptime_seconds'
        : query.startsWith('xstore_pos_Process_id_ratio')
          ? 'xstore_pos_Process_id_ratio'
          : query.startsWith('xstore_pos_service_ratio')
            ? 'xstore_pos_service_ratio'
            : 'xstore_pos_cpu_usage_percent';
      const sampleValues =
        metricName === 'xstore_pos_uptime_seconds'
          ? ['1000', '1100', '1200']
          : metricName === 'xstore_pos_Process_id_ratio'
            ? ['1234', '1234', '1234']
            : metricName === 'xstore_pos_service_ratio'
              ? ['1', '1', '1']
              : ['70', '85', '98'];
      return Promise.resolve([
        {
          metric: {
            __name__: metricName,
            register: '1',
            ...(metricName === 'xstore_pos_Process_id_ratio' ||
            metricName === 'xstore_pos_service_ratio'
              ? {
                  instance:
                    metricName === 'xstore_pos_Process_id_ratio' ? 'xstore' : 'posi.service',
                }
              : {}),
          },
          values: timestamps.map(
            (timestamp, index) => [timestamp, sampleValues[index]] as [number, string]
          ),
        },
      ]);
    });

    const dashboard = await fetchStoreRegisterDashboard('6200', timeWindow);
    const [register] = dashboard.registers;

    expect(register.status).toBe('Down');
    expect(register.healthTimeline.map(({ status }) => status)).toEqual([1, 2, 0]);
    expect(register.healthHistory).toEqual([1, 2, 0]);
    expect(calculateStoreHealth([register])).toBe(50);
    expect(rangeQueryRequiredMock).toHaveBeenCalledWith(
      '{__name__=~"xstore_pos_cpu_usage_percent|xstore_pos_memory_usage_percent|xstore_pos_disk_usage_percent",store="6200"}',
      timeWindow,
      12 * 60
    );
  });

  it('marks the status down when stale metrics have no current process or service data', async () => {
    const timeWindow = {
      fromMs: Date.UTC(2026, 9, 18, 0, 0),
      toMs: SAMPLE_TIMESTAMP_MS + 7 * 60 * 60 * 1000,
    };
    const previousImplementation = instantQueryAtMock.getMockImplementation();
    instantQueryAtMock.mockImplementation((query: string) => {
      if (query.endsWith('[5m])') && query.includes('__name__=~')) return Promise.resolve([]);
      return previousImplementation ? previousImplementation(query) : Promise.resolve([]);
    });

    const dashboard = await fetchStoreRegisterDashboard('6200', timeWindow);
    const [register] = dashboard.registers;

    expect(register.isStale).toBe(true);
    expect(register.status).toBe('Down');
    expect(register.lastMetricTimestamp).toBe(SAMPLE_TIMESTAMP_MS);
    expect(register.healthTimeline[register.healthTimeline.length - 1].status).toBe(0);
  });

  it('shows down when a process responds with an explicit zero', async () => {
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

  it('does not flag a slower increasing uptime counter as a restart', async () => {
    const timeWindow = {
      fromMs: 1793156400 * 1000,
      toMs: 1793157120 * 1000,
    };
    const fromTimestamp = timeWindow.fromMs / 1000;
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
            instance: 'xenv_eng',
          },
          value: [toTimestamp, '8896'],
        },
        {
          metric: {
            __name__: 'xstore_pos_service_ratio',
            store: '6200',
            register: '1',
            instance: 'posi.service',
          },
          value: [toTimestamp, '1'],
        },
        {
          metric: {
            __name__: 'xstore_pos_uptime_seconds',
            store: '6200',
            register: '1',
          },
          value: [toTimestamp, '559219'],
        },
      ]);
    });
    rangeQueryRequiredMock.mockImplementation((query: string) => {
      if (query.startsWith('xstore_pos_uptime_seconds')) {
        return Promise.resolve([
          {
            metric: { register: '1' },
            values: [
              [fromTimestamp, '558919'],
              [toTimestamp, '559219'],
            ],
          },
        ]);
      }
      const isProcessQuery = query.startsWith('xstore_pos_Process_id_ratio');
      return Promise.resolve([
        {
          metric: { register: '1', instance: isProcessQuery ? 'xenv_eng' : 'posi.service' },
          values: [
            [fromTimestamp, isProcessQuery ? '8896' : '1'],
            [toTimestamp, isProcessQuery ? '8896' : '1'],
          ],
        },
      ]);
    });

    const dashboard = await fetchStoreRegisterDashboard('6200', timeWindow);
    const [register] = dashboard.registers;

    expect(register.history).toEqual([1, 1]);
    expect(register.status).toBe('Healthy');
  });

  it('only expects processes and services reported by each register', async () => {
    const timeWindow = {
      fromMs: SAMPLE_TIMESTAMP_MS - 5 * 60 * 1000,
      toMs: SAMPLE_TIMESTAMP_MS,
    };
    const timestampSeconds = SAMPLE_TIMESTAMP_MS / 1000;
    const currentRows: Array<{
      metric: { [label: string]: string };
      value: [number, string];
    }> = [
      ...['1', '2'].map((register) => ({
        metric: {
          __name__: 'xstore_pos_uptime_seconds',
          store: '6200',
          register,
        },
        value: [timestampSeconds, '3600'] as [number, string],
      })),
      ...[
        { register: '1', instance: 'xstore', value: '101' },
        { register: '2', instance: 'xstore', value: '102' },
        { register: '2', instance: 'xenv_eng', value: '103' },
      ].map(({ register, instance, value }) => ({
        metric: {
          __name__: 'xstore_pos_Process_id_ratio',
          store: '6200',
          register,
          instance,
        },
        value: [timestampSeconds, value] as [number, string],
      })),
      ...[
        { register: '1', instance: 'posi.service' },
        { register: '2', instance: 'posi.service' },
        { register: '2', instance: 'browser.service' },
        { register: '2', instance: 'eftlink.service' },
        { register: '2', instance: 'tenderretail.service' },
      ].map(({ register, instance }) => ({
        metric: {
          __name__: 'xstore_pos_service_ratio',
          store: '6200',
          register,
          instance,
        },
        value: [timestampSeconds, '1'] as [number, string],
      })),
    ];
    const freshnessRows = ['1', '2'].map((register) => ({
      metric: { store: '6200', register },
      value: [timestampSeconds, String(timestampSeconds)] as [number, string],
    }));

    instantQueryAtMock.mockImplementation((query: string) =>
      Promise.resolve(
        query.startsWith('min by') || query.startsWith('tlast_over_time')
          ? freshnessRows
          : currentRows
      )
    );
    rangeQueryRequiredMock.mockImplementation((query: string) => {
      if (query.startsWith('xstore_pos_uptime_seconds')) {
        return Promise.resolve(
          ['1', '2'].map((register) => ({
            metric: { register },
            values: [[timestampSeconds, '3600']] as Array<[number, string]>,
          }))
        );
      }

      const metricName = query.startsWith('xstore_pos_Process_id_ratio')
        ? 'xstore_pos_Process_id_ratio'
        : 'xstore_pos_service_ratio';
      return Promise.resolve(
        currentRows
          .filter((row) => row.metric.__name__ === metricName)
          .map((row) => ({
            metric: { register: row.metric.register, instance: row.metric.instance },
            values: [[timestampSeconds, row.value[1]]] as Array<[number, string]>,
          }))
      );
    });

    const dashboard = await fetchStoreRegisterDashboard('6200', timeWindow);

    expect(
      dashboard.registers.map(({ status, processes, services }) => ({
        status,
        processes: processes.map(({ name }) => name),
        services: services.map(({ name }) => name),
      }))
    ).toEqual([
      {
        status: 'Healthy',
        processes: ['xstore'],
        services: ['posi.service'],
      },
      {
        status: 'Healthy',
        processes: ['xenv_eng', 'xstore'],
        services: ['browser.service', 'eftlink.service', 'posi.service', 'tenderretail.service'],
      },
    ]);
    expect(summarizeStoreRegisters(dashboard.registers)).toMatchObject({
      processes: 3,
      processesUp: 3,
      services: 5,
      servicesUp: 5,
    });
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
      const isFreshnessQuery = query.startsWith('min by') || query.startsWith('tlast_over_time');
      return Promise.resolve(isFreshnessQuery ? freshnessRows : responseRows);
    });
    rangeQueryRequiredMock.mockImplementation((query: string) =>
      Promise.resolve(
        query.startsWith('xstore_pos_uptime_seconds')
          ? ['1', '2', '3', '4'].map((register) => ({
              metric: { register },
              values: [[timestampSeconds, register === '3' ? null : '3600']] as Array<
                [number, string | null]
              >,
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
                values: [[timestampSeconds, register === '2' ? '0' : '1']] as Array<
                  [number, string]
                >,
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
    expect(dashboard.registers[3].processes).toEqual([
      expect.objectContaining({
        name: 'Process data unavailable',
        pid: null,
        status: 'Down',
        history: [],
      }),
    ]);
    expect(dashboard.registers[3].services).toEqual([
      expect.objectContaining({ name: 'Service data unavailable', status: 'Down', history: [] }),
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
      processes: 6,
      processesUp: 4,
      services: 4,
      servicesUp: 2,
    });
  });

  it('shows null current readings as down with red range samples', async () => {
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
    expect(register.processes[0]).toMatchObject({
      status: 'Down',
      history: [{ timestampMs: expect.any(Number), value: null, status: 0 }],
    });
    expect(register.services[0]).toMatchObject({
      status: 'Down',
      history: [{ timestampMs: expect.any(Number), value: null, status: 0 }],
    });
  });
});
