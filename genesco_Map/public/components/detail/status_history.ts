export interface StatusHistoryBucket {
  status: number | null;
  index: number;
}

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
