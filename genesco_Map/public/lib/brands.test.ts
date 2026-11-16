import { getBrandCode } from './brands';

describe('getBrandCode', () => {
  it.each([
    ['Underground #123', 'WA', '01'],
    ['JOURNEYS KIDZ #7048', 'OR', '05'],
    ['JOURNEY KIDZ #7135', 'ON', '05'],
    ['JOHNSTON & MURPHY #123', 'ON', null],
    ['J&M #123', 'ON', null],
    ['J & M FACTORY STORE', 'ON', null],
    ['JOHNSTON & MURPHY #123', 'TN', '07'],
    ['J&M #123', 'TN', '07'],
    ['JOURNEYS #1945', 'TN', '08'],
    ['SHI #3001', 'WA', '08'],
    ['JOURNEYS #123', 'QC', '83'],
    ['LITTLE BURGUNDY #123', 'QC', '43'],
    ['Unrecognized Store', 'WA', null],
  ] as Array<[string, string, string | null]>)(
    'classifies %s in %s',
    (name, state, expectedCode) => {
      expect(getBrandCode({ name, state })).toBe(expectedCode);
    }
  );
});
