# GenesCo unified store catalog — DEV-first migration

## Goal and scope

- The `genesco-stores` OpenSearch index is the **only source of map locations** for both IT and USERS after plugin upgrade.
- Existing IT manager becomes **Add / View All / Edit / Delete** for any indexed location.
- Existing `genesco-custom-stores` documents are imported into the new index during the initial seed, but that legacy index is **not deleted**.
- Existing 1,085 store rows are migrated exactly from `sample-data/gensco-sites.json` (same values as the `ACTIVE_SITES` catalog). Coordinates are the existing best-effort data; audit approximate positions separately.
- There are 1,085 **rows**, 1,058 **unique store numbers**, and 26 store numbers repeated across multiple locations (27 extra rows). Do not key documents by store number alone.
- `recordId` is an immutable OpenSearch document identity; `siteId` remains the normal store number used for metrics and incident association.
- Do DEV first. This migration does not contact DEV or PROD unless you run `--apply` or `--verify` with a target URL.

## Important safety behavior

- `--dry-run` validates the bundled JSON offline; no OpenSearch access.
- `--apply` creates the index (if missing), copies the 1,085 rows and reads/adds any legacy custom stores. Uses bulk **create-only**, never overwrite, and leaves existing indices untouched.
- If the destination index is already populated, `--apply` **refuses** to proceed. `--resume` is only for an **interrupted initial seed** before anyone starts editing. Do not run it later or it could re-add intentionally deleted original entries.
- There is **NO automatic JSON fallback** in the new dashboard. This is critical: otherwise deleted stores would reappear on every refresh. Seed and verify the index *before* applying the plugin patch.
- OpenSearch index edits/deletions are persistent. Take an index snapshot/backup before any bulk changes. Keep the old full plugin ZIP for rollback.
- The store manager popup stays open during Add/Edit/Delete and the map refreshes in the background. The existing 30-second map-only refresh and detail-form protections are unchanged.
- This changes **locations only**, not VictoriaMetrics status and register telemetry, error analysis, incidents, weather, map colors or filters.
- Authorization: IT users need appropriate OpenSearch **write** privileges on `genesco-stores`; USERS only need **read** privileges. Hiding the editor in USERS is not an access-control boundary; configure index permissions separately before deployment.
- Existing incidents are stored by store number, not immutable location record ID. Changing a store's number can break incident/telemetry association. Existing repeated numbers may share telemetry by design.

## Phase 1 — seed DEV, while old dashboard continues operating

Freeze Add/Delete operations in the **old** IT store manager from the moment seeding starts until the new dashboard is running, so no new legacy custom store is missed during cutover.

### Local OpenSearch recovery

For a local Dashboards instance whose OpenSearch endpoint is `http://localhost:9200`, the migration tool also supports an explicitly selected `LOCAL` target. This creates `genesco-stores` from the bundled catalog using create-only writes; it does not contact DEV or PROD. From the repository root, run:

```powershell
$env:GENESCO_TARGET = "LOCAL"
$env:OPENSEARCH_URL = "http://localhost:9200"
node plugins\genesco_Map\scripts\seed-genesco-stores.mjs --apply
node plugins\genesco_Map\scripts\seed-genesco-stores.mjs --verify
Remove-Item Env:\GENESCO_TARGET
Remove-Item Env:\OPENSEARCH_URL
```

If running from the plugin directory, use `node scripts\seed-genesco-stores.mjs` instead. For secured local OpenSearch, also set `OPENSEARCH_USER` and `OPENSEARCH_PASS` in the current PowerShell session. The tool rejects non-loopback hosts for `LOCAL`. Do not use the VictoriaMetrics endpoint on port 8428 here; this migration requires an OpenSearch endpoint on port 9200.

Open a NEW Git Bash on the Windows VDI. Extract the separate *migration-only ZIP* into the OSD38 plugins directory, without replacing plugin source.

```bash
cd /c/Users/SSharan/Documents/OSD38/plugins/genesco_Map
node scripts/seed-genesco-stores.mjs --dry-run
```

Expect: `Bundled source: 1085 locations; 1058 unique store numbers`.

Only after DEV OpenSearch `D01-WA-OBS-01:9200` is reachable and returns HTTP 401/200:

```bash
cd /c/Users/SSharan/Documents/OSD38/plugins/genesco_Map
export GENESCO_TARGET="DEV"
export OPENSEARCH_URL="https://D01-WA-OBS-01:9200"
export OPENSEARCH_USER="admin"
export OPENSEARCH_VERIFY_CERTS="false"  # Only for an approved temporary diagnostic exception
read -rsp "Enter DEV OpenSearch password: " OPENSEARCH_PASS
printf '\n'
export OPENSEARCH_PASS
node scripts/seed-genesco-stores.mjs --apply
node scripts/seed-genesco-stores.mjs --verify
unset OPENSEARCH_PASS
```

Use your approved CA chain and `OPENSEARCH_VERIFY_CERTS=true` for permanent operation. Avoid saving passwords in `.env` files or shell history. Restrict writes using appropriate index privileges.

Check in DEV Dev Tools:

```http
GET genesco-stores/_count
GET genesco-stores/_search
{
  "size": 3,
  "query": { "match_all": {} }
}
```

Count should be **1085 + number of records in the legacy custom-store index**, not 1058. If the legacy index is empty, expect 1085. Confirm there are two (or more) docs for duplicated store numbers such as `2101`.

## Phase 2 — upgrade the local DEV plugin

Only after Phase 1 succeeds:

```bash
cd /c/Users/SSharan/Documents/OSD38
# Stop the existing `yarn start` first (Ctrl+C).
tar -czf ../genesco_Map_before_unified_store_catalog.tar.gz plugins/genesco_Map
unzip -o /c/Users/SSharan/Downloads/GenesCo_Unified_Store_Index_DEV_Patch.zip -d plugins
export NODE_USE_SYSTEM_CA=1
yarn start --no-base-path
```

Open IT map, select **Manage Stores** above Weather Alerts. Use **View All**, search for an existing store `2101`, and confirm duplicate-number locations are separate. Edit the address of a test store and verify both maps change. Add a temporary store, then delete it, verifying the index and maps; test deletion of an *original* store only if you have a backup and the change is approved. USERS map must have no edit controls.

## Rollback

Stop the dashboard, restore the pre-upgrade full plugin/backup, and restart. The old code will again read `ACTIVE_SITES` + `genesco-custom-stores` as before. The new `genesco-stores` index remains for investigation/restore and **is not deleted** by rollback. Writes made to `genesco-stores` while the new plugin was active will not automatically be copied back to the legacy index or static JSON.

## PROD later — NOT in DEV testing

Only after DEV validation, export/snapshot the PROD store catalog, check authorization, and follow the team's PROD change approval. The migration tool deliberately requires `GENESCO_TARGET=PROD`, a `P01-WA-OBS-*` URL, and an explicit `--allow-prod` argument before it can write there. Do not run it against PROD in the DEV trial.
