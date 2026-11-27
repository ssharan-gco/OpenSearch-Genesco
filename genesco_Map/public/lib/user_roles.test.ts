import { hasBusinessUsersRole } from './user_roles';

describe('hasBusinessUsersRole', () => {
  it('matches the Business_Users role', () => {
    expect(hasBusinessUsersRole({ roles: ['Business_Users'] })).toBe(true);
    expect(hasBusinessUsersRole({ backend_roles: ['Business_Users'] })).toBe(true);
  });

  it('does not match other roles', () => {
    expect(hasBusinessUsersRole({ roles: ['all_access'] })).toBe(false);
  });

  it('ignores invalid role data', () => {
    expect(hasBusinessUsersRole({ roles: 'Business_Users', backend_roles: [null] })).toBe(false);
  });
});
