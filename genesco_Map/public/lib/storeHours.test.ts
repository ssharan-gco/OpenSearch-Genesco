import { isOutsideStoreHours } from './storeHours';

describe('isOutsideStoreHours', () => {
  it('uses the store local timezone and includes the pre-open and post-close buffers', () => {
    expect(isOutsideStoreHours('0011', new Date('2026-11-22T15:59:00Z'))).toBe(true);
    expect(isOutsideStoreHours('0011', new Date('2026-11-22T16:00:00Z'))).toBe(false);
    expect(isOutsideStoreHours('0011', new Date('2026-11-23T00:29:00Z'))).toBe(false);
    expect(isOutsideStoreHours('0011', new Date('2026-11-23T00:30:00Z'))).toBe(true);
  });

  it('treats a fully closed weekday as EOD and does not apply workbook schedules to airports', () => {
    expect(isOutsideStoreHours('0011', new Date('2026-11-26T18:00:00Z'))).toBe(true);
    expect(isOutsideStoreHours('1702', new Date('2026-11-26T18:00:00Z'))).toBe(false);
  });

  it('leaves stores without a safe matching schedule unchanged', () => {
    expect(isOutsideStoreHours('1603', new Date('2026-11-26T18:00:00Z'))).toBe(false);
    expect(isOutsideStoreHours('9001', new Date('2026-11-26T18:00:00Z'))).toBe(false);
  });
});
