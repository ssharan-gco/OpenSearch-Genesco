import {
  getHealthHistoryBuckets,
  getStatusHistoryBuckets,
  HealthHistorySample,
} from './status_history';

describe('getHealthHistoryBuckets', () => {
  it('uses the most severe status in each bucket, keeping degraded distinct from down', () => {
    const history: HealthHistorySample[] = [
      { status: 1 },
      { status: 2 },
      { status: 2 },
      { status: 0 },
    ];
    expect(
      getHealthHistoryBuckets(history, 1)
    ).toEqual([
      {
        status: 0,
        samples: history,
      },
    ]);
    expect(getHealthHistoryBuckets(history.slice(0, 2), 1)[0].status).toBe(2);
  });

  it('keeps missing samples distinct from degraded and down', () => {
    expect(getHealthHistoryBuckets([{ status: null }, { status: 2 }, { status: 0 }])).toEqual([
      { status: null, samples: [{ status: null }] },
      { status: 2, samples: [{ status: 2 }] },
      { status: 0, samples: [{ status: 0 }] },
    ]);
  });
});

describe('getStatusHistoryBuckets', () => {
  it('uses the latest non-missing sample in each bucket', () => {
    const history = Array.from({ length: 48 }, () => 1);
    history[0] = 0;
    history[1] = 1;
    history[47] = 0;

    const buckets = getStatusHistoryBuckets(history);

    expect(buckets).toHaveLength(24);
    expect(buckets[0]).toEqual({ status: 1, index: 1 });
    expect(buckets[23]).toEqual({ status: 0, index: 47 });
  });

  it('keeps a bucket without any readings as no data', () => {
    expect(getStatusHistoryBuckets([1, null, null])).toEqual([
      { status: 1, index: 0 },
      { status: null, index: 1 },
      { status: null, index: 2 },
    ]);
  });
});
