import { getMapCoordinates } from './mapCoordinates';

describe('getMapCoordinates', () => {
  it('keeps contiguous U.S. and Canadian store coordinates unchanged', () => {
    expect(getMapCoordinates({ lon: -122.3, lat: 47.6, state: 'WA' })).toEqual([-122.3, 47.6]);
    expect(getMapCoordinates({ lon: -79.4, lat: 43.7, state: 'ON' })).toEqual([-79.4, 43.7]);
  });

  it('moves Alaska and Hawaii stores to distinct nearby West Coast positions', () => {
    const alaskaNorth = getMapCoordinates({ lon: -149.9, lat: 61.2, state: 'AK' });
    const alaskaSouth = getMapCoordinates({ lon: -134.4, lat: 58.3, state: 'AK' });
    const hawaiiWest = getMapCoordinates({ lon: -159.5, lat: 22.1, state: 'HI' });
    const hawaiiEast = getMapCoordinates({ lon: -155.6, lat: 19.7, state: 'HI' });

    [alaskaNorth, alaskaSouth, hawaiiWest, hawaiiEast].forEach(([lon, lat]) => {
      expect(lon).toBeGreaterThan(-128);
      expect(lon).toBeLessThan(-119);
      expect(lat).toBeGreaterThan(30);
      expect(lat).toBeLessThan(49);
    });
    expect(alaskaNorth).not.toEqual(alaskaSouth);
    expect(hawaiiWest).not.toEqual(hawaiiEast);
    expect(alaskaNorth).not.toEqual(hawaiiWest);
  });
});
