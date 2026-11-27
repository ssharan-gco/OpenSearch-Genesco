export interface AuthInfo {
  roles?: unknown;
  backend_roles?: unknown;
}

export const hasBusinessUsersRole = ({ roles, backend_roles }: AuthInfo): boolean =>
  [roles, backend_roles].some(
    (roleList) =>
      Array.isArray(roleList) &&
      roleList.some((role: unknown) => role === 'Business_Users')
  );
