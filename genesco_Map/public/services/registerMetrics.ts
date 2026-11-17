import { CFG, POS_METRICS } from '../lib/constants';
import { stepFor } from '../lib/timeRange';
import { SiteHealth, TimeWindow } from '../lib/types';
import { instantQuery, instantQueryAt, rangeQueryRequired, VmRow } from './victoriaMetrics';

const POS_LOOKBACK = '[5m]';
const POS_HISTORY_LOOKBACK = '[24h]';
const STALE_AFTER_MS = 6 * 60 * 60 * 1000;

export interface RegisterProcess {
  name: string;
  pid: number | null;
  status: 'Up' | 'Down' | 'No data';
  history: StatusHistoryPoint[];
}

export interface RegisterService {
  name: string;
  status: 'Up' | 'Down' | 'No data';
  history: StatusHistoryPoint[];
}

export interface StatusHistoryPoint {
  timestampMs: number;
  value: number | null;
  status: 0 | 1 | 2 | null;
}

export interface RegisterDisk {
  mountpoint: string;
  usagePercent: number;
  freeBytes: number | null;
}

export interface StoreRegister {
  id: string;
  host: string;
  uptimeSeconds: number | null;
  lastMetricTimestamp: number | null;
  isStale: boolean;
  uptime: string;
  lastBootTimestamp: number | null;
  processes: RegisterProcess[];
  services: RegisterService[];
  cpuPercent: number | null;
  memoryPercent: number | null;
  memoryAvailableBytes: number | null;
  disk: RegisterDisk | null;
  history: Array<number | null>;
  uptimeTimeline: Array<{ timestamp: number; status: number | null }>;
  healthHistory: StatusHistoryPoint['status'][];
  healthTimeline: StatusHistoryPoint[];
  status: 'Healthy' | 'Degraded' | 'Down' | 'No data';
}

export interface StoreRegisterDashboard {
  oldestSampleAt: number;
  registers: StoreRegister[];
}

export interface StoreRegisterCounts {
  registers: number;
  healthy: number;
  degraded: number;
  down: number;
  processes: number;
  processesUp: number;
  services: number;
  servicesUp: number;
}

export const getResourceStatus = (
  cpuPercent: number | null,
  memoryPercent: number | null,
  diskPercent: number | null
): 'Healthy' | 'Degraded' | 'Down' => {
  const percentages = [cpuPercent, memoryPercent, diskPercent].filter(
    (value): value is number => value !== null
  );
  if (percentages.some((value) => value >= CFG.resourceDownPct)) return 'Down';
  if (percentages.some((value) => value >= CFG.resourceWarnPct && value < CFG.resourceDownPct)) {
    return 'Degraded';
  }
  return 'Healthy';
};

export const summarizeStoreRegisters = (registers: StoreRegister[]): StoreRegisterCounts =>
  registers.reduce(
    (counts, register) => {
      counts.registers += 1;
      if (register.status === 'Healthy') counts.healthy += 1;
      if (register.status === 'Degraded') counts.degraded += 1;
      if (register.status === 'Down') counts.down += 1;
      counts.processes += register.processes.length;
      counts.processesUp += register.processes.filter((process) => process.status === 'Up').length;
      counts.services += register.services.length;
      counts.servicesUp += register.services.filter((service) => service.status === 'Up').length;
      return counts;
    },
    {
      registers: 0,
      healthy: 0,
      degraded: 0,
      down: 0,
      processes: 0,
      processesUp: 0,
      services: 0,
      servicesUp: 0,
    }
  );

export const calculateStoreHealth = (registers: StoreRegister[]): number | null => {
  const samples = registers
    .flatMap((register) => register.healthHistory)
    .filter((sample): sample is 0 | 1 | 2 => sample !== null);
  if (samples.length === 0) return null;

  const score = samples.reduce(
    (total, sample) => total + (sample === 2 ? 0.5 : sample === 1 ? 1 : 0),
    0
  );
  return (score / samples.length) * 100;
};

interface MutableRegister {
  id: string;
  host: string;
  uptimeSeconds: number | null;
  uptimeTimestampMs: number | null;
  processes: RegisterProcess[];
  services: RegisterService[];
  cpuPercent: number | null;
  memoryPercent: number | null;
  memoryAvailableBytes: number | null;
  disks: Map<string, { usagePercent: number | null; freeBytes: number | null }>;
}

const quoteLabel = (value: string) => value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
const getValue = (row: VmRow) => {
  const rawValue = row.value?.[1];
  if (rawValue === undefined || rawValue === null) return null;
  const value = Number(rawValue);
  return Number.isFinite(value) ? value : null;
};

const getLatestMetricValue = (row: VmRow) => {
  const rawValue = row.value?.[1];
  if (rawValue === undefined || rawValue === null) return null;
  const value = Number(rawValue);
  return Number.isFinite(value) ? value : null;
};

const createRegister = (id: string): MutableRegister => ({
  id,
  host: '',
  uptimeSeconds: null,
  uptimeTimestampMs: null,
  processes: [],
  services: [],
  cpuPercent: null,
  memoryPercent: null,
  memoryAvailableBytes: null,
  disks: new Map(),
});

const formatUptime = (seconds: number | null) => {
  if (seconds === null) return 'No data';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
};

const createHistory = (uptimeRow: VmRow | undefined) => {
  const values = uptimeRow?.values || [];
  return values.map(([, rawValue], index) => {
    if (rawValue === null) return null;
    if (index === 0) return 1;
    if (values[index - 1][1] === null) return null;
    const previousUptime = Number(values[index - 1][1]);
    const currentUptime = Number(rawValue);
    if (!Number.isFinite(previousUptime) || !Number.isFinite(currentUptime)) return null;
    if (currentUptime < previousUptime) return 0;
    return currentUptime === previousUptime ? null : 1;
  });
};

const createStatusHistory = (row: VmRow | undefined): StatusHistoryPoint[] =>
  (row?.values || []).map(([timestamp, rawValue]) => {
    const value = rawValue === null ? null : Number(rawValue);
    const status: StatusHistoryPoint['status'] =
      value !== null && Number.isFinite(value) && value > 0 ? 1 : 0;
    return {
      timestampMs: timestamp * 1000,
      value: value !== null && Number.isFinite(value) ? value : null,
      status,
    };
  });

const markHistoryDownAt = (history: StatusHistoryPoint[], timestampMs: number) => {
  const latest = history[history.length - 1];
  if (latest?.timestampMs === timestampMs) {
    return [...history.slice(0, -1), { ...latest, status: 0 as const }];
  }
  return [...history, { timestampMs, value: null, status: 0 as const }];
};

const getValueAt = (row: VmRow, timestamp: number): number | null => {
  const point = row.values?.find(([sampleTimestamp]) => sampleTimestamp === timestamp);
  if (!point || point[1] === null) return null;
  const value = Number(point[1]);
  return Number.isFinite(value) ? value : null;
};

const createHealthHistory = (
  uptimeRow: VmRow | undefined,
  processRows: VmRow[],
  serviceRows: VmRow[],
  resourceRows: VmRow[]
): StatusHistoryPoint[] => {
  const uptimeValues = uptimeRow?.values || [];
  const uptimeHistory = createHistory(uptimeRow);
  const processNames = Array.from(
    new Set(processRows.map((row) => row.metric.instance).filter((name): name is string => !!name))
  );
  const serviceNames = Array.from(
    new Set(serviceRows.map((row) => row.metric.instance).filter((name): name is string => !!name))
  );
  const resourceMetricNames = new Set([
    POS_METRICS.cpu,
    POS_METRICS.memoryUsage,
    POS_METRICS.diskUsage,
  ]);
  const resourcesByMetric = new Map<string, VmRow[]>();
  resourceRows.forEach((row) => {
    const metricName = row.metric.__name__;
    if (!metricName || !resourceMetricNames.has(metricName)) return;
    const metricRows = resourcesByMetric.get(metricName) || [];
    metricRows.push(row);
    resourcesByMetric.set(metricName, metricRows);
  });

  return uptimeValues.map(([timestamp, rawUptime], index) => {
    const uptimeStatus = uptimeHistory[index];
    const uptimeValue = rawUptime === null ? null : Number(rawUptime);
    if (rawUptime === null || !Number.isFinite(uptimeValue) || uptimeStatus === 0) {
      return { timestampMs: timestamp * 1000, value: uptimeValue, status: 0 };
    }
    if (
      processRows.length === 0 ||
      serviceRows.length === 0 ||
      processNames.length === 0 ||
      serviceNames.length === 0
    ) {
      return { timestampMs: timestamp * 1000, value: uptimeValue, status: 0 };
    }

    const getExpectedValues = (rows: VmRow[], names: string[]) =>
      names.map((name) => {
        const row = rows.find((metricRow) => metricRow.metric.instance === name);
        return row ? getValueAt(row, timestamp) : null;
      });
    const reportedValues = [
      ...getExpectedValues(processRows, processNames),
      ...getExpectedValues(serviceRows, serviceNames),
    ];
    const resourceValues = Array.from(resourcesByMetric.values()).flatMap((rows) =>
      rows
        .map((row) => getValueAt(row, timestamp))
        .filter((value): value is number => value !== null)
    );
    const status: 0 | 1 | 2 =
      reportedValues.some((value) => value === null || value <= 0) ||
      resourceValues.some((value) => value >= CFG.resourceDownPct)
        ? 0
        : resourceValues.some((value) => value >= CFG.resourceWarnPct)
          ? 2
          : 1;
    return { timestampMs: timestamp * 1000, value: uptimeValue, status };
  });
};

const seriesKey = (register: string, instance: string) => `${register}:${instance}`;

const buildDashboard = (
  storeId: string,
  rows: VmRow[],
  historyRows: VmRow[],
  processHistoryRows: VmRow[],
  serviceHistoryRows: VmRow[],
  resourceHistoryRows: VmRow[],
  recentRows: VmRow[],
  currentProcessServiceRows: VmRow[],
  historicalRows: VmRow[],
  freshnessRows: VmRow[],
  uptimeTimestampRows: VmRow[],
  window: TimeWindow
): StoreRegisterDashboard => {
  const registers = new Map<string, MutableRegister>();
  const getRegister = (row: VmRow) => {
    const id = row.metric.register;
    if (!id) return undefined;
    if (!registers.has(id)) registers.set(id, createRegister(id));
    const register = registers.get(id)!;
    register.host = row.metric.host_name || register.host;
    return register;
  };
  const rowsByRegister = (sourceRows: VmRow[]) => {
    const result = new Map<string, VmRow[]>();
    sourceRows.forEach((row) => {
      const register = row.metric.register;
      if (!register) return;
      const registerRows = result.get(register) || [];
      registerRows.push(row);
      result.set(register, registerRows);
    });
    return result;
  };
  const currentProcessRows = rows.filter((row) => row.metric.__name__ === POS_METRICS.processId);
  const currentServiceRows = rows.filter((row) => row.metric.__name__ === POS_METRICS.service);
  const historicalProcessRows = recentRows.filter(
    (row) => row.metric.__name__ === POS_METRICS.processId
  );
  const historicalServiceRows = recentRows.filter(
    (row) => row.metric.__name__ === POS_METRICS.service
  );
  const currentProcessRowsForStore = currentProcessServiceRows.filter(
    (row) => row.metric.__name__ === POS_METRICS.processId
  );
  const currentServiceRowsForStore = currentProcessServiceRows.filter(
    (row) => row.metric.__name__ === POS_METRICS.service
  );
  const hasCurrentProcessOrServiceData =
    currentProcessRowsForStore.length > 0 || currentServiceRowsForStore.length > 0;
  const storeTelemetryDown = !hasCurrentProcessOrServiceData;
  const processRowsByRegister = rowsByRegister(currentProcessRows);
  const serviceRowsByRegister = rowsByRegister(currentServiceRows);
  const processHistoryRowsByRegister = rowsByRegister(processHistoryRows);
  const serviceHistoryRowsByRegister = rowsByRegister(serviceHistoryRows);
  const historicalProcessRowsByRegister = rowsByRegister(historicalProcessRows);
  const historicalServiceRowsByRegister = rowsByRegister(historicalServiceRows);
  const resourceHistoryRowsByRegister = rowsByRegister(resourceHistoryRows);
  [
    ...rows,
    ...historyRows,
    ...processHistoryRows,
    ...serviceHistoryRows,
    ...recentRows,
    ...historicalRows,
    ...freshnessRows,
  ].forEach((row) => getRegister(row));
  const historyByRegister = new Map(
    historyRows
      .filter((row) => row.metric.register)
      .map((row) => [row.metric.register, createHistory(row)])
  );
  const uptimeRowByRegister = new Map(
    historyRows.filter((row) => row.metric.register).map((row) => [row.metric.register, row])
  );
  const createSeriesHistoryMap = (rowsWithHistory: VmRow[]) => {
    const histories = new Map<string, StatusHistoryPoint[]>();
    rowsWithHistory.forEach((row) => {
      const { register, instance } = row.metric;
      if (register && instance) {
        histories.set(seriesKey(register, instance), createStatusHistory(row));
      }
    });
    return histories;
  };
  const processHistoryBySeries = createSeriesHistoryMap(processHistoryRows);
  const serviceHistoryBySeries = createSeriesHistoryMap(serviceHistoryRows);
  const currentProcessSeries = new Set(
    currentProcessRowsForStore
      .filter((row) => row.metric.register && row.metric.instance)
      .map((row) => seriesKey(row.metric.register, row.metric.instance))
  );
  const currentServiceSeries = new Set(
    currentServiceRowsForStore
      .filter((row) => row.metric.register && row.metric.instance)
      .map((row) => seriesKey(row.metric.register, row.metric.instance))
  );
  const freshnessByRegister = new Map<string, number>();
  freshnessRows.forEach((row) => {
    const timestamp = getValue(row);
    if (row.metric.register && timestamp !== null) {
      freshnessByRegister.set(row.metric.register, timestamp * 1000);
    }
  });
  const uptimeTimestampByRegister = new Map<string, number>();
  uptimeTimestampRows.forEach((row) => {
    const timestamp = getValue(row);
    if (row.metric.register && timestamp !== null) {
      uptimeTimestampByRegister.set(row.metric.register, timestamp * 1000);
    }
  });

  rows.forEach((row) => {
    const register = getRegister(row);
    if (!register) return;
    const value = getLatestMetricValue(row);

    switch (row.metric.__name__) {
      case POS_METRICS.processId:
        if (row.metric.instance) {
          const process: RegisterProcess = {
            name: row.metric.instance,
            pid: value,
            status: value === null || value <= 0 ? 'Down' : 'Up',
            history: processHistoryBySeries.get(seriesKey(register.id, row.metric.instance)) || [],
          };
          const existingIndex = register.processes.findIndex(({ name }) => name === process.name);
          if (existingIndex === -1) register.processes.push(process);
          else register.processes[existingIndex] = process;
        }
        break;
      case POS_METRICS.service:
        if (row.metric.instance) {
          const service: RegisterService = {
            name: row.metric.instance,
            status: value === null || value <= 0 ? 'Down' : 'Up',
            history: serviceHistoryBySeries.get(seriesKey(register.id, row.metric.instance)) || [],
          };
          const existingIndex = register.services.findIndex(({ name }) => name === service.name);
          if (existingIndex === -1) register.services.push(service);
          else register.services[existingIndex] = service;
        }
        break;
      case POS_METRICS.cpu:
        if (value !== null) register.cpuPercent = value;
        break;
      case POS_METRICS.memoryUsage:
        if (value !== null) register.memoryPercent = value;
        break;
      case POS_METRICS.memoryAvailable:
        if (value !== null) register.memoryAvailableBytes = value;
        break;
      case POS_METRICS.uptime:
        if (value !== null) {
          register.uptimeSeconds = value;
          register.uptimeTimestampMs = uptimeTimestampByRegister.get(register.id) || null;
        }
        break;
      case POS_METRICS.diskUsage: {
        if (value !== null) {
          const mountpoint = row.metric.mountpoint || row.metric.device || 'Disk';
          const disk = register.disks.get(mountpoint) || { usagePercent: null, freeBytes: null };
          disk.usagePercent = value;
          register.disks.set(mountpoint, disk);
        }
        break;
      }
      case POS_METRICS.diskFree: {
        if (value !== null) {
          const mountpoint = row.metric.mountpoint || row.metric.device || 'Disk';
          const disk = register.disks.get(mountpoint) || { usagePercent: null, freeBytes: null };
          disk.freeBytes = value;
          register.disks.set(mountpoint, disk);
        }
        break;
      }
    }
  });

  registers.forEach((register) => {
    const processNames = new Set(
      [
        ...(processRowsByRegister.get(register.id) || []),
        ...(processHistoryRowsByRegister.get(register.id) || []),
        ...(historicalProcessRowsByRegister.get(register.id) || []),
      ]
        .map((row) => row.metric.instance)
        .filter((name): name is string => Boolean(name))
    );
    const serviceNames = new Set(
      [
        ...(serviceRowsByRegister.get(register.id) || []),
        ...(serviceHistoryRowsByRegister.get(register.id) || []),
        ...(historicalServiceRowsByRegister.get(register.id) || []),
      ]
        .map((row) => row.metric.instance)
        .filter((name): name is string => Boolean(name))
    );
    processNames.forEach((name) => {
      const key = seriesKey(register.id, name);
      const isDown = storeTelemetryDown || !currentProcessSeries.has(key);
      const process = register.processes.find((item) => item.name === name);
      if (process) {
        if (isDown) process.status = 'Down';
        if (isDown) process.history = markHistoryDownAt(process.history, window.toMs);
        return;
      }
      const history = processHistoryBySeries.get(key) || [];
      register.processes.push({
        name,
        pid: null,
        status: isDown ? 'Down' : 'No data',
        history: isDown ? markHistoryDownAt(history, window.toMs) : history,
      });
    });
    serviceNames.forEach((name) => {
      const key = seriesKey(register.id, name);
      const isDown = storeTelemetryDown || !currentServiceSeries.has(key);
      const service = register.services.find((item) => item.name === name);
      if (service) {
        if (isDown) service.status = 'Down';
        if (isDown) service.history = markHistoryDownAt(service.history, window.toMs);
        return;
      }
      const history = serviceHistoryBySeries.get(key) || [];
      register.services.push({
        name,
        status: isDown ? 'Down' : 'No data',
        history: isDown ? markHistoryDownAt(history, window.toMs) : history,
      });
    });
    if (processNames.size === 0) {
      register.processes.push({
        name: 'Process data unavailable',
        pid: null,
        status: 'Down',
        history: storeTelemetryDown ? markHistoryDownAt([], window.toMs) : [],
      });
    }
    if (serviceNames.size === 0) {
      register.services.push({
        name: 'Service data unavailable',
        status: 'Down',
        history: storeTelemetryDown ? markHistoryDownAt([], window.toMs) : [],
      });
    }
  });

  const now = window.toMs;
  const latestSampleTimestamps = Array.from(freshnessByRegister.values());
  return {
    oldestSampleAt: latestSampleTimestamps.length > 0 ? Math.min(...latestSampleTimestamps) : now,
    registers: Array.from(registers.values())
      .sort((a, b) => Number(a.id) - Number(b.id))
      .map((register) => {
        const disks = Array.from(register.disks.entries())
          .map(([mountpoint, disk]) => ({
            mountpoint,
            usagePercent: disk.usagePercent,
            freeBytes: disk.freeBytes,
          }))
          .filter(
            (disk): disk is RegisterDisk & { usagePercent: number } => disk.usagePercent !== null
          )
          .sort((a, b) => b.usagePercent - a.usagePercent);
        const processes = register.processes.sort((a, b) => a.name.localeCompare(b.name));
        const services = register.services.sort((a, b) => a.name.localeCompare(b.name));
        const hasMetrics =
          register.uptimeSeconds !== null ||
          register.cpuPercent !== null ||
          register.memoryPercent !== null ||
          disks.length > 0 ||
          processes.length > 0 ||
          services.length > 0;
        const lastMetricTimestamp = freshnessByRegister.get(register.id) || null;
        const isStale = lastMetricTimestamp === null || now - lastMetricTimestamp > STALE_AFTER_MS;
        const uptimeHistory = historyByRegister.get(register.id) || [];
        const restartInProgress = uptimeHistory[uptimeHistory.length - 1] === 0;
        const resourceStatus = getResourceStatus(
          register.cpuPercent,
          register.memoryPercent,
          disks[0]?.usagePercent ?? null
        );
        const componentDown =
          processes.some((process) => process.status === 'Down') ||
          services.some((service) => service.status === 'Down');
        const status = storeTelemetryDown
          ? 'Down'
          : !hasMetrics
            ? 'No data'
            : componentDown || restartInProgress || resourceStatus === 'Down'
              ? 'Down'
              : processes.length === 0 ||
                  services.length === 0 ||
                  processes.some((process) => process.status === 'No data') ||
                  services.some((service) => service.status === 'No data')
                ? 'No data'
                : resourceStatus;
        const uptimeSeconds = register.uptimeSeconds;
        const uptimeRow = uptimeRowByRegister.get(register.id);
        const uptimeTimeline = (uptimeRow?.values || []).map(([timestamp], index) => ({
          timestamp: timestamp * 1000,
          status: uptimeHistory[index],
        }));

        const healthTimeline = createHealthHistory(
          uptimeRowByRegister.get(register.id),
          processHistoryRowsByRegister.get(register.id) || [],
          serviceHistoryRowsByRegister.get(register.id) || [],
          resourceHistoryRowsByRegister.get(register.id) || []
        );
        const latestHealthStatus: StatusHistoryPoint['status'] =
          status === 'Healthy' ? 1 : status === 'Degraded' ? 2 : 0;
        if (
          storeTelemetryDown &&
          healthTimeline[healthTimeline.length - 1]?.timestampMs !== window.toMs
        ) {
          healthTimeline.push({ timestampMs: window.toMs, value: null, status: 0 });
        } else if (healthTimeline.length > 0) {
          healthTimeline[healthTimeline.length - 1].status = latestHealthStatus;
        }

        return {
          id: register.id,
          host: register.host || `${storeId} register ${register.id}`,
          uptimeSeconds,
          lastMetricTimestamp,
          isStale,
          uptime: formatUptime(uptimeSeconds),
          lastBootTimestamp:
            uptimeSeconds === null
              ? null
              : (register.uptimeTimestampMs || window.toMs) - uptimeSeconds * 1000,
          processes,
          services,
          cpuPercent: register.cpuPercent,
          memoryPercent: register.memoryPercent,
          memoryAvailableBytes: register.memoryAvailableBytes,
          disk: disks[0] || null,
          history: uptimeHistory,
          uptimeTimeline,
          healthHistory: healthTimeline.map(({ status }) => status),
          healthTimeline,
          status,
        };
      }),
  };
};

/** Fetches register metrics and status history restricted to the selected time window. */
export const fetchStoreRegisterDashboard = async (
  storeId: string,
  window: TimeWindow
): Promise<StoreRegisterDashboard> => {
  const store = quoteLabel(storeId);
  const selector = `{__name__=~"xstore_pos_.*",store="${store}"}`;
  const windowSeconds = Math.max(1, Math.ceil((window.toMs - window.fromMs) / 1000));
  const windowLookback = `[${windowSeconds}s]`;
  const query = `last_over_time(${selector}${windowLookback})`;
  const freshnessQuery = `min by (store, register, host_name) (tlast_over_time(${selector}${windowLookback}))`;
  const stepSeconds = stepFor(window);
  const [
    rows,
    historyRows,
    processHistoryRows,
    serviceHistoryRows,
    resourceHistoryRows,
    recentRows,
    currentProcessServiceRows,
    historicalRows,
    freshnessRows,
    uptimeTimestampRows,
  ] = await Promise.all([
    instantQueryAt(query, window.toMs),
    rangeQueryRequired(`${POS_METRICS.uptime}{store="${store}"}`, window, stepSeconds),
    rangeQueryRequired(`${POS_METRICS.processId}{store="${store}"}`, window, stepSeconds),
    rangeQueryRequired(`${POS_METRICS.service}{store="${store}"}`, window, stepSeconds),
    rangeQueryRequired(
      `{__name__=~"${POS_METRICS.cpu}|${POS_METRICS.memoryUsage}|${POS_METRICS.diskUsage}",store="${store}"}`,
      window,
      stepSeconds
    ),
    instantQueryAt(
      `last_over_time({__name__=~"${POS_METRICS.processId}|${POS_METRICS.service}",store="${store}"}${POS_HISTORY_LOOKBACK})`,
      window.toMs
    ),
    instantQueryAt(
      `last_over_time({__name__=~"${POS_METRICS.processId}|${POS_METRICS.service}",store="${store}"}${POS_LOOKBACK})`,
      window.toMs
    ),
    instantQueryAt(
      `last_over_time({__name__=~"xstore_pos_.*",store="${store}"}${POS_HISTORY_LOOKBACK})`,
      window.toMs
    ),
    instantQueryAt(freshnessQuery, window.toMs),
    instantQueryAt(
      `tlast_over_time(${POS_METRICS.uptime}{store="${store}"}${windowLookback})`,
      window.toMs
    ),
  ]);
  return buildDashboard(
    storeId,
    rows,
    historyRows,
    processHistoryRows,
    serviceHistoryRows,
    resourceHistoryRows,
    recentRows,
    currentProcessServiceRows,
    historicalRows,
    freshnessRows,
    uptimeTimestampRows,
    window
  );
};

/** Current POS health for site pins, with a 24-hour baseline to detect reporting gaps. */
export const fetchAllStoreHealth = async (): Promise<Map<string, SiteHealth>> => {
  const latest = (metric: string) => `last_over_time(${metric}${POS_LOOKBACK})`;
  const [registerRows, serviceRows, processRows, cpuRows, memoryRows, diskRows, historicalRows] =
    await Promise.all([
      instantQuery(`count by (store, register) (${latest(POS_METRICS.uptime)})`),
      instantQuery(latest(POS_METRICS.service)),
      instantQuery(latest(POS_METRICS.processId)),
      instantQuery(latest(POS_METRICS.cpu)),
      instantQuery(latest(POS_METRICS.memoryUsage)),
      instantQuery(latest(POS_METRICS.diskUsage)),
      instantQuery(
        `count by (store, register) (last_over_time({__name__=~"xstore_pos_.*"}${POS_HISTORY_LOOKBACK}))`
      ),
    ]);
  const health = new Map<string, SiteHealth>();
  const get = (row: VmRow) => {
    const store = row.metric.store;
    if (!store) return undefined;
    if (!health.has(store)) {
      health.set(store, {
        up: true,
        services: {},
        cpu: null,
        memory: null,
        registerStatuses: {},
      });
    }
    return health.get(store);
  };

  const expectedRegistersByStore = new Map<string, Set<string>>();
  const processRegistersByStore = new Map<string, Set<string>>();
  const serviceRegistersByStore = new Map<string, Set<string>>();
  const registerStatusesByStore = new Map<string, Map<string, 'Up' | 'Degraded' | 'Down'>>();
  const operationalRegisterStatusesByStore = new Map<string, Map<string, 'Up' | 'Down'>>();
  const updateRegisterStatus = (
    store: string,
    register: string,
    status: 'Up' | 'Degraded' | 'Down'
  ) => {
    const registers = registerStatusesByStore.get(store) || new Map();
    const currentStatus = registers.get(register);
    const nextStatus =
      currentStatus === 'Down' || status === 'Down'
        ? 'Down'
        : currentStatus === 'Degraded' || status === 'Degraded'
          ? 'Degraded'
          : 'Up';
    registers.set(register, nextStatus);
    registerStatusesByStore.set(store, registers);
  };
  const updateResourceStatus = (row: VmRow, value: number) => {
    const { store, register } = row.metric;
    if (!store || !register) return;
    const status =
      value >= CFG.resourceDownPct ? 'Down' : value >= CFG.resourceWarnPct ? 'Degraded' : 'Up';
    updateRegisterStatus(store, register, status);
  };
  const updateOperationalRegisterStatus = (
    store: string,
    register: string,
    status: 'Up' | 'Down'
  ) => {
    const registers = operationalRegisterStatusesByStore.get(store) || new Map();
    registers.set(
      register,
      registers.get(register) === 'Down' || status === 'Down' ? 'Down' : 'Up'
    );
    operationalRegisterStatusesByStore.set(store, registers);
  };
  const addRegister = (
    registersByStore: Map<string, Set<string>>,
    store: string,
    register: string
  ) => {
    const registers = registersByStore.get(store) || new Set<string>();
    registers.add(register);
    registersByStore.set(store, registers);
  };

  historicalRows.forEach((row) => {
    const siteHealth = get(row);
    const { store, register } = row.metric;
    if (siteHealth && store && register) addRegister(expectedRegistersByStore, store, register);
  });
  registerRows.forEach((row) => {
    get(row);
    const { store, register } = row.metric;
    if (store && register) addRegister(expectedRegistersByStore, store, register);
  });
  serviceRows.forEach((row) => {
    const value = getValue(row);
    const siteHealth = get(row);
    const register = row.metric.register;
    const service = row.metric.instance;
    const store = row.metric.store;
    if (siteHealth && store && register && service) {
      addRegister(serviceRegistersByStore, store, register);
      const isRunning = value !== null && value > 0;
      updateRegisterStatus(store, register, isRunning ? 'Up' : 'Down');
      updateOperationalRegisterStatus(store, register, isRunning ? 'Up' : 'Down');
      siteHealth.services[`POS ${register} ${service}`] = isRunning;
    }
  });
  const processHealthByRegister = new Map<
    string,
    Map<string, { total: number; running: number }>
  >();
  processRows.forEach((row) => {
    const value = getValue(row);
    const store = row.metric.store;
    const register = row.metric.register;
    if (!store || !register) return;
    get(row);
    addRegister(processRegistersByStore, store, register);
    if (value === null) {
      updateRegisterStatus(store, register, 'Down');
      updateOperationalRegisterStatus(store, register, 'Down');
      const siteHealth = health.get(store);
      if (siteHealth) {
        siteHealth.registerProcessesDown = true;
      }
      return;
    }
    const registers = processHealthByRegister.get(store) || new Map();
    const processHealth = registers.get(register) || { total: 0, running: 0 };
    processHealth.total += 1;
    if (value > 0) processHealth.running += 1;
    registers.set(register, processHealth);
    processHealthByRegister.set(store, registers);
  });
  processHealthByRegister.forEach((registers, store) => {
    const siteHealth = health.get(store);
    if (!siteHealth) return;
    registers.forEach(({ total, running }, register) => {
      updateRegisterStatus(store, register, running === total ? 'Up' : 'Down');
      updateOperationalRegisterStatus(store, register, running === total ? 'Up' : 'Down');
      if (running < total) siteHealth.registerProcessesDown = true;
    });
  });
  expectedRegistersByStore.forEach((registers, store) => {
    const siteHealth = health.get(store);
    if (!siteHealth) return;
    registers.forEach((register) => {
      updateRegisterStatus(store, register, 'Up');
      if (!processRegistersByStore.get(store)?.has(register)) {
        updateRegisterStatus(store, register, 'Down');
        updateOperationalRegisterStatus(store, register, 'Down');
        siteHealth.registerProcessesDown = true;
      }
      if (!serviceRegistersByStore.get(store)?.has(register)) {
        updateRegisterStatus(store, register, 'Down');
        updateOperationalRegisterStatus(store, register, 'Down');
      }
    });
  });
  cpuRows.forEach((row) => {
    const value = getValue(row);
    const siteHealth = get(row);
    if (siteHealth && value !== null) {
      siteHealth.cpu = Math.max(siteHealth.cpu ?? value, value);
      updateResourceStatus(row, value);
    }
  });
  memoryRows.forEach((row) => {
    const value = getValue(row);
    const siteHealth = get(row);
    if (siteHealth && value !== null) {
      siteHealth.memory = Math.max(siteHealth.memory ?? value, value);
      updateResourceStatus(row, value);
    }
  });
  diskRows.forEach((row) => {
    const value = getValue(row);
    const siteHealth = get(row);
    if (siteHealth && value !== null) {
      siteHealth.disk = Math.max(siteHealth.disk ?? value, value);
      updateResourceStatus(row, value);
    }
  });
  registerStatusesByStore.forEach((registers, store) => {
    const siteHealth = health.get(store);
    if (!siteHealth) return;
    const statuses = Array.from(registers.values());
    const downCount = statuses.filter((status) => status === 'Down').length;
    siteHealth.registerStatuses = Object.fromEntries(registers);
    siteHealth.operationalRegisterStatuses = Object.fromEntries(
      operationalRegisterStatusesByStore.get(store) || new Map()
    );
    if (downCount === statuses.length && statuses.length > 0) {
      siteHealth.registersDown = true;
    } else if (downCount > 0 || statuses.includes('Degraded')) {
      siteHealth.registersDegraded = true;
    }
  });
  const historicalStores = new Set(
    historicalRows.map((row) => row.metric.store).filter((store): store is string => !!store)
  );
  const currentOperationalStores = new Set(
    [...processRows, ...serviceRows]
      .map((row) => row.metric.store)
      .filter((store): store is string => !!store)
  );
  historicalStores.forEach((store) => {
    if (!currentOperationalStores.has(store)) {
      const siteHealth = health.get(store);
      if (siteHealth) siteHealth.up = false;
    }
  });
  return health;
};
