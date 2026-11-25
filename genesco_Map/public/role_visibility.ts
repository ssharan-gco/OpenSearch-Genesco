export const getVisibleMapApps = (roles: string[]) => {
  if (roles.includes('admin') || roles.includes('all_access')) {
    return { showGenscoIt: true, showGenscoUsers: true };
  }

  const hasGenscoUserRole = roles.includes('Genesco_Users');
  const hasGenscoItRole = roles.includes('Genesco_IT');

  if (hasGenscoUserRole && !hasGenscoItRole) {
    return { showGenscoIt: false, showGenscoUsers: true };
  }
  if (hasGenscoItRole && !hasGenscoUserRole) {
    return { showGenscoIt: true, showGenscoUsers: false };
  }
  return { showGenscoIt: true, showGenscoUsers: true };
};
