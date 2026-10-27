import { IRouter } from '../../../../src/core/server';

const dashboardData = require('../../sample-data/dashboard.json');

export function registerDashboardRoute(router: IRouter) {
  router.get(
    {
      path: '/api/sample_map/dashboard',
      validate: false,
    },
    async (context, request, response) => {
      return response.ok({
        body: dashboardData,
      });
    }
  );
}