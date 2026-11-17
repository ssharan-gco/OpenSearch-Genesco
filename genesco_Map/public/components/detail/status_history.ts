export interface StatusHistoryBucket {
  status: number | null;
  index: number;
}

export interface HealthHistorySample {
  status: 0 | 1 | 2 | null;
}

export interface HealthHistoryBucket<T extends HealthHistorySample> {
  status: HealthHistorySample['status'];
  samples: T[];
}

export const getHealthHistoryBuckets = <T extends HealthHistorySample>(
  history: T[],
  maxBuckets = 24
): HealthHistoryBucket<T>[] => {
  const bucketCount = Math.min(history.length, maxBuckets);
  return Array.from({ length: bucketCount }, (_, index) => {
    const start = Math.floor((index * history.length) / bucketCount);
    const end = Math.floor(((index + 1) * history.length) / bucketCount);
    const samples = history.slice(start, end);
    const status = samples.some((sample) => sample.status === 0)
      ? 0
      : samples.some((sample) => sample.status === 2)
        ? 2
        : samples.some((sample) => sample.status === 1)
          ? 1
          : null;
    return { status, samples };
  });
};

export const getStatusHistoryBuckets = (
  history: Array<number | null>,
  maxBuckets = 24
): StatusHistoryBucket[] => {
  const bucketCount = Math.min(history.length, maxBuckets);
  return Array.from({ length: bucketCount }, (_, bucketIndex) => {
    const start = Math.floor((bucketIndex * history.length) / bucketCount);
    const end = Math.floor(((bucketIndex + 1) * history.length) / bucketCount);
    let index = end - 1;

    while (index >= start && history[index] === null) index -= 1;
    return {
      status: index >= start ? history[index] : null,
      index: index >= start ? index : end - 1,
    };
  });
};
