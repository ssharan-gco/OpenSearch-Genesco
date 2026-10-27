import { CoreStart } from '../../../../src/core/public';
import { OsSearch } from '../lib/types';

/** All OpenSearch reads go through the data plugin's search route (uses the user's session). */
export const createOsSearch = (http: CoreStart['http']): OsSearch => {
  return async (index: string, queryBody: any): Promise<any> => {
    const res = await http.post('/internal/search/opensearch', {
      body: JSON.stringify({ params: { index, body: queryBody } }),
    });
    return (res as any).rawResponse || res;
  };
};
