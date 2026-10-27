export const getDashboardData = async () => {

  const response = await fetch(
    '/api/sample_map/dashboard'
  );

  if (!response.ok) {
    throw new Error('Dashboard API Failed');
  }

  return response.json();
};