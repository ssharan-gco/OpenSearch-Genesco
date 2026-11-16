import { OsSearch } from '../lib/types';
import { fetchStoreErrorAnalysis } from './errorAnalysis';

describe('fetchStoreErrorAnalysis', () => {
  it('returns all distinct error messages ranked by occurrence', async () => {
    const hits = Array.from({ length: 12 }, (_, index) => ({
      _source: {
        body: `Error ${index + 1}`,
        register: `${index + 1}`,
      },
    }));
    hits.push(
      { _source: { body: 'Error 1', register: '13' } },
      { _source: { body: 'Error 1', register: '14' } }
    );
    const osSearch = jest.fn().mockResolvedValue({
      hits: { total: hits.length, hits },
    }) as unknown as OsSearch;

    const result = await fetchStoreErrorAnalysis(osSearch, '1001', { fromMs: 0, toMs: 1 });

    expect(result.errors).toHaveLength(12);
    expect(result.errors[0]).toEqual({
      message: 'Error 1',
      count: 3,
      registerIds: ['1', '13', '14'],
    });
    expect(result.errors[1].count).toBe(1);
    expect(osSearch).toHaveBeenCalledWith(
      'xstore-register-logs-*',
      expect.objectContaining({
        query: expect.objectContaining({
          bool: expect.objectContaining({
            filter: expect.arrayContaining([
              { term: { 'log.attributes.store': '1001' } },
              expect.objectContaining({ range: expect.any(Object) }),
            ]),
          }),
        }),
        _source: expect.arrayContaining(['body', 'message', 'log.body']),
      })
    );
  });

  it('uses alternate log message fields when body is absent', async () => {
    const osSearch = jest.fn().mockResolvedValue({
      hits: {
        total: 2,
        hits: [
          { _source: { message: 'Printer failure', register: '2' } },
          { _source: { log: { body: 'Network timeout', attributes: { register: '3' } } } },
        ],
      },
    }) as unknown as OsSearch;

    const result = await fetchStoreErrorAnalysis(osSearch, '1001', { fromMs: 0, toMs: 1 });

    expect(result.errors).toEqual([
      { message: 'Network timeout', count: 1, registerIds: ['3'] },
      { message: 'Printer failure', count: 1, registerIds: ['2'] },
    ]);
  });

});
