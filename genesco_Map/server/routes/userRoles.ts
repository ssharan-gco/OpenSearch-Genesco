import { IRouter } from '../../../../src/core/server';

const getStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((role): role is string => typeof role === 'string') : [];

export function registerUserRolesRoute(router: IRouter) {
  router.get(
    { path: '/api/genesco_map/user_roles', validate: false },
    async (context, _request, response) => {
      try {
        const { body } = await context.core.opensearch.client.asCurrentUser.transport.request({
          method: 'GET',
          path: '/_plugins/_security/authinfo',
        });
        const authInfo = body as { roles?: unknown; backend_roles?: unknown };
        const roles = [
          ...new Set([
            ...getStringArray(authInfo.roles),
            ...getStringArray(authInfo.backend_roles),
          ]),
        ];
        return response.ok({ body: { roles } });
      } catch (error) {
        const err = error as { message?: string; meta?: { statusCode?: number } };
        return response.customError({
          statusCode: Number(err.meta?.statusCode) === 403 ? 403 : 502,
          body: `Unable to retrieve the current user's OpenSearch roles: ${
            err.message || 'OpenSearch request failed'
          }`,
        });
      }
    }
  );
}
