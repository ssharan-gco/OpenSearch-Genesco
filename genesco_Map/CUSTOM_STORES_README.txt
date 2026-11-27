GenesCo IT Map - Add / Delete Stores (Custom Store Catalog)
=========================================================

This feature is separate from the static active-store catalog. All existing
stores in public/lib/activeStores.ts are left unchanged and protected.

IT dashboard:
- On the MAP page, click "Add / Delete Stores" near the upper-left map controls.
- Add: enter store number, name, street/mall address, city, state/province,
  ZIP/postal code, latitude, longitude. All fields are required.
- Use a store NAME containing the brand (e.g. "JOURNEYS #9150 08") for existing
  brand-filter behavior.
- Coordinates must be decimal degrees (latitude -90..90, longitude -180..180).
- Store number must be unique and not be present anywhere in static activeStores.ts.
  1-3 digit store numbers are left-padded to four digits automatically.
- Delete: shows only stores created using this feature. Click Delete and then
  Confirm delete. Static stores never appear in this list.

USERS dashboard:
- The same added stores appear as map pins and in search/filters; no edit controls.
- Other open browser sessions see changes during the normal 30-second data refresh.
- No changes are required to the existing VictoriaMetrics / weather loaders.

Data storage:
- New OpenSearch index: genesco-custom-stores.
- Before any Add, GET /api/genesco_map/custom_stores returns [] and does not
  create the index. The first successful Add creates the index.
- Each custom store is stored by store number (stable document ID).
- A delete removes its custom-store document, NOT any static store JSON record.
- Deleting the final custom store does not delete the index.
- DEV and PROD keep independent index contents on their respective clusters.
- Writes use the authenticated user's OpenSearch permissions via OSD server routes.

OpenSearch Dev Tools (read-only verification):
  GET genesco-custom-stores/_count
  GET genesco-custom-stores/_search

Implementation:
  server/routes/customStores.ts        - list, create, delete, input validation
  server/plugin.ts                     - routes registered with plugin
  public/services/customStores.ts     - authenticated client
  public/services/siteService.ts      - static + added store location merge
  public/components/CustomStoreManager.tsx - IT-only popup
  public/components/GenscoApp.tsx     - IT launcher and refresh
  public/components/EnterpriseApp.tsx - same stores loaded in USERS
  public/index.scss                   - isolated store-manager styles

Notes:
- New stores with no VictoriaMetrics telemetry inherit the existing No Data /
  Down health behavior. The feature does not fabricate telemetry.
- The custom-store index is not used for weather alerts or register comments.
- To prevent static-store deletion, server-side checks reject IDs present in
  the static catalog even if an API is called directly.
- Removal of a custom-store entry does not erase separate incident-note documents.
