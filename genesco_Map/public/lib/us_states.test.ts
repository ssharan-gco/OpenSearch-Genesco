import { normalizeUsState, US_STATES } from './us_states';

describe('US states', () => {
  it('includes the 50 states', () => {
    expect(US_STATES).toHaveLength(50);
  });

  it.each([
    ['CA', 'California'],
    ['ca', 'California'],
    [' New York ', 'New York'],
    ['wyoming', 'Wyoming'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizeUsState(input)).toBe(expected);
  });

  it('returns null for values that are not a US state or postal abbreviation', () => {
    expect(normalizeUsState('District of Columbia')).toBeNull();
    expect(normalizeUsState('')).toBeNull();
  });
});
