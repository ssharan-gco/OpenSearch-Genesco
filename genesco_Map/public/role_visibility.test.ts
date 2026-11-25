import { getVisibleMapApps } from './role_visibility';

describe('getVisibleMapApps', () => {
  it('shows only the users map to Genesco_Users', () => {
    expect(getVisibleMapApps(['Genesco_Users'])).toEqual({
      showGenscoIt: false,
      showGenscoUsers: true,
    });
  });

  it('shows only the IT map to Genesco_IT', () => {
    expect(getVisibleMapApps(['Genesco_IT'])).toEqual({
      showGenscoIt: true,
      showGenscoUsers: false,
    });
  });

  it.each([
    [['admin']],
    [['all_access']],
    [['admin', 'Genesco_Users']],
    [['other_role']],
    [['Genesco_Users', 'Genesco_IT']],
    [[]],
  ])(
    'shows both maps for roles %j',
    (roles) => {
      expect(getVisibleMapApps(roles)).toEqual({
        showGenscoIt: true,
        showGenscoUsers: true,
      });
    }
  );
});
