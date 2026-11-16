import { getUsStateRegion, US_REGIONS } from './us_regions';
import { US_STATES } from './us_states';

describe('US regions', () => {
  it('assigns every state to exactly one region', () => {
    const assignedRegions = US_STATES.map(({ name }) => getUsStateRegion(name));

    expect(assignedRegions).not.toContain(null);
    expect(new Set(assignedRegions).size).toBe(US_REGIONS.length);
  });

  it.each([
    ['MA', 'North East'],
    ['Georgia', 'South East'],
    ['WI', 'Mid West'],
    ['TX', 'South Central'],
    ['AZ', 'South West'],
    ['CA', 'West'],
    ['NV', 'Mountain'],
  ])('maps %s to %s', (state, region) => {
    expect(getUsStateRegion(state)).toBe(region);
  });

  it('returns null for values that are not a US state', () => {
    expect(getUsStateRegion('Ontario')).toBeNull();
  });
});
