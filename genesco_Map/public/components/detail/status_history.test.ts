import { getStatusHistoryBuckets } from './status_history';

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
