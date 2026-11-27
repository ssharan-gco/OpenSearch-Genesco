# GenesCo IT – Full-page Store Manager + USERS green-pin icon fix

## What changed

- **IT only:** Manage Stores button above Weather Alerts now navigates to its own page at `/app/genescoMapStore/stores`, not a popup.
- Page provides **Add Store, View Stores, Modify Store and Delete Store**.
- The View/Modify/Delete table shows 10 locations per page with First/Previous/page-number/Next/Last controls.
- Search includes store number, name, brand, location, coordinates, record ID and catalog metadata.
- Brand and State/Province filters can be combined with search. Brand is derived from the store name using the existing GenesCo brand mapping; it is not a new index field.
- Columns show all current catalog fields: siteId, name, address, city, state, zip, lat, lon, origin, createdAt, updatedAt and recordId. The derived Brand column is additional.
- **Back to IT Map** button navigates to the original map. Browser Back also works.
- IT 30-second map polling and weather polling pause on the store-management page so they cannot interrupt forms. When returning to the map, live data and the updated catalog are loaded again.
- Add/Modify/Delete persist in the same existing `genesco-stores` index. A second migration is NOT required.
- **USERS only:** when a store pin displays Green/Up, register status labels still display Up and the register incident `i` icon is hidden. For non-green stores, register incident icons remain unchanged. No incident documents, IT functionality or health data are changed.

## Installation (Git Bash, OSD38)

1. Stop your local OSD instance (`Ctrl+C`).
2. Back up `plugins/genesco_Map`.
3. Extract the PATCH ZIP to `<OSD38>/plugins`. The ZIP begins with `genesco_Map/`.
4. Start OSD normally with `yarn start --no-base-path`.

There are no new Node dependencies, OpenSearch indices or schema changes.

## DEV validation

1. Confirm `GET genesco-stores/_count` returns at least 1085 (unless catalog edits changed it).
2. Open `http://localhost:5601/app/genescoMapStore`, click Manage Stores at the bottom-left above Weather Alerts. URL should change to `/app/genescoMapStore/stores`.
3. View Stores should show 10 rows, a scrollable wide table, and page navigation. The original 1,085 rows span 109 pages.
4. Search store `2101` and verify duplicated store numbers remain separate records.
5. Filter by Brand and State/Province, including both together.
6. Test adding/editing/deleting only an approved temporary store, then use Back to IT Map and verify map data updates.
7. On USERS, verify a green store with a previously warning/down register displays `Up` without the `i` button. Confirm IT still shows the actual warning/down and its incident controls.

Note: UI/browser verification requires the actual OSD DEV environment. Tests included in our release process were source syntax parsing, catalog table filtering/pagination against all 1,085 seed entries, and USERS popup HTML checks. The build has not been executed in the user's VDI.

## Rollback

Stop OSD, restore the backed-up `plugins/genesco_Map` folder, and restart. No index changes are performed by installing this patch.
