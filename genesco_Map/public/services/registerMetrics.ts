import { CFG, POS_METRICS } from '../lib/constants';
import { stepFor } from '../lib/timeRange';
import { SiteHealth, TimeWindow } from '../lib/types';
import { instantQuery, instantQueryAt, rangeQueryRequired, VmRow } from './victoriaMetrics';

const LOOKBACK = `[${CFG.instantLookback}]`;
const STALE_AFTER_MS = 6 * 60 * 60 * 1000;

export interface RegisterProcess {
  name: string;
  pid: number | null;
  status: 'Up' | 'Down' | 'No data';
  history: Array<number | null>;
}

export interface RegisterService {
  name: string;
  status: 'Up' | 'Down' | 'No data';
  history: Array<number | null>;
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
  healthHistory: Array<number | null>;
  status: 'Healthy' | 'Degraded' | 'Down' | 'No data' | 'Stale';
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
  if (percentages.some((value) => value >= 90)) return 'Down';
  if (percentages.some((value) => value >= 80 && value < 90)) return 'Degraded';
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
    .filter((sample): sample is number => sample !== null);
  return samples.length > 0
    ? (samples.reduce((total, sample) => total + sample, 0) / samples.length) * 100
    : null;
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
  return values.map(([timestamp, rawValue], index) => {
    if (rawValue === null) return null;
    if (index === 0) return 1;
    if (values[index - 1][1] === null) return null;
    const elapsedSeconds = timestamp - values[index - 1][0];
    const previousUptime = Number(values[index - 1][1]);
    const currentUptime = Number(rawValue);
    return currentUptime >= previousUptime + elapsedSeconds * 0.5 ? 1 : 0;
  });
};

const createStatusHistory = (row: VmRow | undefined): Array<number | null> =>
  (row?.values || []).map(([, rawValue]) => {
    if (rawValue === null) return 0;
    const value = Number(rawValue);
    return Number.isFinite(value) ? (value > 0 ? 1 : 0) : null;
  });

const getValueAt = (row: VmRow, timestamp: number): number | null => {
  const point = row.values?.find(([sampleTimestamp]) => sampleTimestamp === timestamp);
  if (!point || point[1] === null) return null;
  const value = Number(point[1]);
  return Number.isFinite(value) ? value : null;
};

const createHealthHistory = (
  uptimeRow: VmRow | undefined,
  processRows: VmRow[],
  serviceRows: VmRow[]
): Array<number | null> => {
  const uptimeValues = uptimeRow?.values || [];
  const uptimeHistory = createHistory(uptimeRow);
  const processNames = Array.from(
    new Set(processRows.map((row) => row.metric.instance).filter((name): name is string => !!name))
  );
  const serviceNames = Array.from(
    new Set(serviceRows.map((row) => row.metric.instance).filter((name): name is string => !!name))
  );

  return uptimeValues.map(([timestamp], index) => {
    const uptimeStatus = uptimeHistory[index];
    if (uptimeStatus === 0) return 0;
    if (
      processRows.length === 0 ||
      serviceRows.length === 0 ||
      processNames.length === 0 ||
      serviceNames.length === 0
    ) {
      return 0;
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
    if (reportedValues.some((value) => value !== null && value <= 0)) return 0;
    if (uptimeStatus === null || reportedValues.some((value) => value === null)) return 0;
    return 1;
  });
};

const seriesKey = (register: string, instance: string) => `${register}:${instance}`;

const buildDashboard = (
  storeId: string,
  rows: VmRow[],
  historyRows: VmRow[],
  processHistoryRows: VmRow[],
  serviceHistoryRows: VmRow[],
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
  const processRowsByRegister = rowsByRegister(currentProcessRows);
  const serviceRowsByRegister = rowsByRegister(currentServiceRows);
  const processHistoryRowsByRegister = rowsByRegister(processHistoryRows);
  const serviceHistoryRowsByRegister = rowsByRegister(serviceHistoryRows);
  const processNames = new Set(
    [...currentProcessRows, ...processHistoryRows]
      .map((row) => row.metric.instance)
      .filter((name): name is string => Boolean(name))
  );
  const serviceNames = new Set(
    [...currentServiceRows, ...serviceHistoryRows]
      .map((row) => row.metric.instance)
      .filter((name): name is string => Boolean(name))
  );
  [...rows, ...historyRows, ...processHistoryRows, ...serviceHistoryRows, ...freshnessRows].forEach(
    (row) => getRegister(row)
  );
  const historyByRegister = new Map(
    historyRows
      .filter((row) => row.metric.register)
      .map((row) => [row.metric.register, createHistory(row)])
  );
  const uptimeRowByRegister = new Map(
    historyRows.filter((row) => row.metric.register).map((row) => [row.metric.register, row])
  );
  const createSeriesHistoryMap = (rowsWithHistory: VmRow[]) => {
    const histories = new Map<string, Array<number | null>>();
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
            history:
              processHistoryBySeries.get(seriesKey(register.id, row.metric.instance)) ||
              (value === null ? [0] : []),
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
            history:
              serviceHistoryBySeries.get(seriesKey(register.id, row.metric.instance)) ||
              (value === null ? [0] : []),
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
    processNames.forEach((name) => {
      if (register.processes.some((process) => process.name === name)) return;
      register.processes.push({
        name,
        pid: null,
        status: 'Down',
        history:
          processHistoryBySeries.get(seriesKey(register.id, name)) ||
          Array(Math.max(1, historyByRegister.get(register.id)?.length || 0)).fill(0),
      });
    });
    serviceNames.forEach((name) => {
      if (register.services.some((service) => service.name === name)) return;
      register.services.push({
        name,
        status: 'Down',
        history:
          serviceHistoryBySeries.get(seriesKey(register.id, name)) ||
          Array(Math.max(1, historyByRegister.get(register.id)?.length || 0)).fill(0),
      });
    });
    if (
      (processRowsByRegister.get(register.id) || []).length === 0 &&
      (processHistoryRowsByRegister.get(register.id) || []).length === 0 &&
      processNames.size === 0
    ) {
      register.processes.push({ name: 'No response', pid: null, status: 'Down', history: [0] });
    }
    if (
      (serviceRowsByRegister.get(register.id) || []).length === 0 &&
      (serviceHistoryRowsByRegister.get(register.id) || []).length === 0 &&
      serviceNames.size === 0
    ) {
      register.services.push({ name: 'No response', status: 'Down', history: [0] });
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
        const status = !hasMetrics
          ? 'No data'
          : componentDown
            ? 'Down'
            : isStale
              ? 'Stale'
              : restartInProgress || resourceStatus === 'Down'
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
          healthHistory: createHealthHistory(
            uptimeRowByRegister.get(register.id),
            processHistoryRowsByRegister.get(register.id) || [],
            serviceHistoryRowsByRegister.get(register.id) || []
          ),
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
    freshnessRows,
    uptimeTimestampRows,
  ] = await Promise.all([
    instantQueryAt(query, window.toMs),
    rangeQueryRequired(`${POS_METRICS.uptime}{store="${store}"}`, window, stepSeconds),
    rangeQueryRequired(`${POS_METRICS.processId}{store="${store}"}`, window, stepSeconds),
    rangeQueryRequired(`${POS_METRICS.service}{store="${store}"}`, window, stepSeconds),
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
    freshnessRows,
    uptimeTimestampRows,
    window
  );
};

/** Aggregated live POS health used for site pins without loading every detail series. */
export const fetchAllStoreHealth = async (): Promise<Map<string, SiteHealth>> => {
  const latest = (metric: string) => `last_over_time(${metric}${LOOKBACK})`;
  const [registerRows, serviceRows, processRows, cpuRows, memoryRows, diskRows] = await Promise.all(
    [
      instantQuery(`count by (store) (${latest(POS_METRICS.uptime)})`),
      instantQuery(latest(POS_METRICS.service)),
      instantQuery(latest(POS_METRICS.processId)),
      instantQuery(`max by (store) (${latest(POS_METRICS.cpu)})`),
      instantQuery(`max by (store) (${latest(POS_METRICS.memoryUsage)})`),
      instantQuery(`max by (store) (${latest(POS_METRICS.diskUsage)})`),
    ]
  );
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
      });
    }
    return health.get(store);
  };

  registerRows.forEach((row) => get(row));
  serviceRows.forEach((row) => {
    const value = getValue(row);
    const siteHealth = get(row);
    const register = row.metric.register;
    const service = row.metric.instance;
    if (siteHealth && register && service) {
      const isRunning = value !== null && value > 0;
      siteHealth.services[`POS ${register} ${service}`] = isRunning;
      if (!isRunning) siteHealth.registersDown = true;
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
    if (value === null) {
      const siteHealth = health.get(store);
      if (siteHealth) siteHealth.registersDown = true;
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
    registers.forEach(({ total, running }) => {
      if (running < total) siteHealth.registersDown = true;
    });
  });
  cpuRows.forEach((row) => {
    const value = getValue(row);
    const siteHealth = get(row);
    if (siteHealth && value !== null) siteHealth.cpu = value;
  });
  memoryRows.forEach((row) => {
    const value = getValue(row);
    const siteHealth = get(row);
    if (siteHealth && value !== null) siteHealth.memory = value;
  });
  diskRows.forEach((row) => {
    const value = getValue(row);
    const siteHealth = get(row);
    if (siteHealth && value !== null) siteHealth.disk = value;
  });
  return health;
};
