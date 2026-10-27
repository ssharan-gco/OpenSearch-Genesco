# genesco_Map — Gensco map plugin for OpenSearch Dashboards 3.8

A minimal, self-contained OSD plugin that renders one map app, **Gensco**, under the
**MAP** section of the side nav. It shows how to:

- plot site pins on a MapLibre map (status colors, white-outlined pins, hover tooltip, pulsing halo for Down sites),
- read **live health metrics from VictoriaMetrics** (through a server-side proxy),
- read **logs from OpenSearch** (through the OSD data plugin search route),
- open a **store operations dashboard** with register uptime, process and service status, summary cards and history for the selected time range.

If the OpenSearch index or VictoriaMetrics isn't available, the map uses built-in sample
locations/health and shows a "Sample data" banner. The store register dashboard only displays
live VictoriaMetrics readings; it reports when live register data is unavailable rather than
substituting sample register/process/service values.

---

## 1. Folder layout

```
genesco_Map/
├─ opensearch_dashboards.json   plugin manifest (id: genescoMapStores)
├─ package.json                 bundled deps: maplibre-gl, chart.js
├─ common/index.ts              PLUGIN_ID, PLUGIN_NAME ("Gensco"), VM proxy route prefix
├─ server/
│  ├─ index.ts                  config schema: sample_map.victoriaMetricsUrl
│  ├─ plugin.ts                 reads config, registers routes
│  └─ routes/index.ts           GET /api/sample_map/vm/query and /query_range -> VictoriaMetrics
├─ public/
│  ├─ plugin.ts                 registers the "Gensco" app + nav-group links
│  ├─ application.tsx           React 18 mount/unmount
│  ├─ index.scss                app control styles and map/detail styles scoped under .sample-map-container
│  ├─ lib/
│  │  ├─ constants.ts           index names, metric names, status colors, pin SVG
│  │  ├─ types.ts               SiteLocation / SiteHealth / SiteRecord / SiteDetail ...
│  │  ├─ sampleData.ts          fallback sites, health, series and logs
│  │  ├─ envConfig.ts           OSD base path + vmUrl()/vmFetch()
│  │  ├─ timeRange.ts           date-picker values -> epoch ms, chart step
│  │  └─ maplibreMap.ts         base map style + create/destroy
│  ├─ services/
│  │  ├─ searchClient.ts        OpenSearch query helper
│  │  ├─ victoriaMetrics.ts     instantQuery / rangeQuery
│  │  ├─ siteService.ts         sites (OS) + health (VM) -> SiteRecord[] with status
│  │  └─ detailService.ts       CPU/memory history (VM) + logs (OS) for one site
│  ├─ hooks/useGenscoMap.ts     map lifecycle, pins, popups, filter updates
│  └─ components/
│     ├─ GenscoApp.tsx          orchestrator: app-local date/time controls, data loading, layout
│     ├─ FilterPanel.tsx        status filter pills (top-right)
│     ├─ SearchBar.tsx          site # / city search (bottom-center)
│     └─ detail/                DetailPanel, MetricChart, LogsTable
├─ sample-data/gensco-sites.json
├─ sample-data/store-dashboard-by-store.json legacy sample register data (not used by live detail view)
└─ scripts/seed-sample-data.ps1 seeds OpenSearch + VictoriaMetrics
```

Register CPU, memory, and disk bars use live VictoriaMetrics percentages when reported. Green is
below 80%, amber is 80–89.99%, and red is 90% or higher. Missing metrics are shown as "No data."

---

## 2. Data contracts

### OpenSearch

| Index          | Fields                                                                                   |
| -------------- | ---------------------------------------------------------------------------------------- |
| `gensco-sites` | `site_id` (keyword), `name`, `address`, `city`, `state`, `zip`, `lat`, `lon`             |
| `gensco-logs`  | `@timestamp` (date), `site_id`, `severity` (ERROR/WARN/INFO/DEBUG), `service`, `message` |

Change index names / time field in `public/lib/constants.ts` (`CFG`).

### VictoriaMetrics (Prometheus API)

All series carry a `site` label matching `site_id`.

| Metric                            | Meaning                          |
| --------------------------------- | -------------------------------- |
| `gensco_site_up{site}`            | 1 = site reporting, 0 = down     |
| `gensco_service_up{site,service}` | 1 = service running, 0 = stopped |
| `gensco_cpu_percent{site}`        | CPU %                            |
| `gensco_memory_percent{site}`     | Memory %                         |

The Xstore POS register dashboard reads the live per-register series below. Each series has
`store` and `register` labels; process and service series also carry an `instance` label. The
store detail panel contains a time picker with editable from/to date and time fields, a time-zone
display, and common range presets from the last five minutes through the last seven days. The
register's current Up/Down status is evaluated at the selected To time; process, service, and
uptime history is queried across the full From–To interval. The selected time zone is used to
display timestamps in the detail panel. Refreshing the detail panel reloads its metrics without
reloading the map. A stale-data warning appears when the latest sample is over six hours before the
selected range end.

The per-register detail cards also read `xstore-register-version` for the selected store and show
the non-identifying version fields from each document under its matching register.

| Metric                              | Meaning                                     |
| ----------------------------------- | ------------------------------------------- |
| `xstore_pos_Process_id_ratio`       | Process ID; `instance` is the process name  |
| `xstore_pos_service_ratio`          | Service state; `1` = running, `0` = stopped |
| `xstore_pos_uptime_seconds`         | Register uptime in seconds                  |
| `xstore_pos_cpu_usage_percent`      | Register CPU utilization percentage         |
| `xstore_pos_memory_usage_percent`   | Register memory utilization percentage      |
| `xstore_pos_memory_available_bytes` | Available register memory in bytes          |
| `xstore_pos_disk_usage_percent`     | Disk utilization; includes `mountpoint`     |
| `xstore_pos_disk_free_bytes`        | Free disk space; includes `mountpoint`      |

Register health counts are derived from each register's live response. A register is Healthy when
process and service series are both present, all reported processes and services are up, the data
is fresh, and no restart is detected in the selected range. Any reported process or service that is
Down makes the register Down, even when resource usage is in the degraded range. Missing process or
service names are inferred from other registers' returned series where possible, otherwise a red
"No response" / Down item is shown. Missing or null process/service readings are treated as Down
and their status-history bars are red. The count does not assume a fixed number of processes or
services.
The range health percentage counts samples where uptime, all reported process series, and all
reported service series indicate healthy status; known down, missing, or restart samples count as
unhealthy. The summary cards count parsed registers and reported
process/service series; their "Up" totals include only series whose latest returned value indicates
they are running. Process and service metrics are binary: positive PID/service values show green
Up; zero, missing, or null values show red Down.

### Status rules (`services/siteService.ts → deriveStatus`)

| Map status         | Rule                                                 | Pin color                         |
| ------------------ | ---------------------------------------------------- | --------------------------------- |
| App Services Up    | Site is reporting; processes and services are healthy; resources are below 80 % | `#4f9d69` |
| Attention Required | CPU / memory / disk is 80–89.99 %, or a register has a degraded resource state | `#e0a030` |
| App Services Down  | `gensco_site_up == 0`                                | `#ef4444` (2x pin + pulsing halo) |
| Registers Down     | A process or service is down or has no response for a known register, or CPU / memory / disk is ≥90 % | `#ec4899` |
| EOD / Maintenance  | sample store is marked for end-of-day or maintenance | `#a855f7`                         |
| No Status          | no `gensco_site_up` sample                           | `#94a3b8`                         |

When a register is down—including when its process or service metrics have no response—and CPU,
memory, or disk is also between 80% and 89.99%, the map pin remains **Registers Down**, while the
site is included in both the **Registers Down** and **Attention Required** filter counts and
results. Missing process or service responses are detected by comparing their series with the
registers that have uptime metrics.

The map's **Export CSV** button appears above the status filters and downloads all loaded stores,
regardless of the selected filter, with store number, address, and display status columns. CSV
doesn't support cell formatting, so its header is not styled when opened in Excel.

---

## 3. Run locally

Prerequisites: OSD 3.8 source checkout at `C:\dev\OpenSearch-Dashboards-3.8.0`, the Node.js
version required by that checkout, and yarn 1.x.

```powershell
cd C:\dev\OpenSearch-Dashboards-3.8.0\plugins\genesco_Map
yarn install --ignore-engines           # installs maplibre-gl + chart.js
```

Add to `config/opensearch_dashboards.yml` (only if VictoriaMetrics isn't at the default `http://localhost:8428`):

```yaml
sample_map.victoriaMetricsUrl: 'http://<vm-host>:8428' # include any -http.pathPrefix, e.g. .../victoriametrics
```

Start OSD from the repo root (plugins in `plugins/` are auto-discovered in dev mode):

```powershell
cd C:\dev\OpenSearch-Dashboards-3.8.0
yarn start --no-base-path
```

Open http://localhost:5601 → side nav **MAP → Gensco**.

> If the browser gets a 404 for `genescoMapStores.plugin.js` after changing dependencies, delete
> `plugins/genesco_Map/target` and restart `yarn start` (stale optimizer cache).

### Seed demo data (optional)

Without seeding, the app runs on built-in sample data. To see real queries working:

```powershell
cd C:\dev\OpenSearch-Dashboards-3.8.0\plugins\genesco_Map
./scripts/seed-sample-data.ps1 -OpenSearchUrl https://localhost:9200 `
                               -VictoriaMetricsUrl http://localhost:8428 `
                               -SkipCertificateCheck          # add -NoAuth for an unsecured cluster, -Reset to recreate indices
```

This creates `gensco-sites`, writes ~600 log lines into `gensco-logs`, and imports 6 h of
`gensco_*` samples into VictoriaMetrics (`/api/v1/import/prometheus`). Scenario:
site 103 is Down, 106 has a stopped printer service (Warning), 109 runs hot CPU (Warning).

The map uses `last_over_time(metric[6h])` for "current" values (`CFG.instantLookback`), so
seeded data stays visible for a few hours. For a live feed, push samples on a schedule
(e.g. a Prometheus exporter or OTEL collector writing the same metric names).

---

## 4. Build & install

### 4.1 Build the plugin on its own (build machine)

A plugin zip can only be built **inside an OSD source checkout of the exact target version**
(the build uses OSD's `plugin_helpers` and optimizer). The OSD server you install on does
**not** need the source — only the zip.

1. **Tools** (once): Git, Node.js matching the OSD checkout's `.nvmrc`, and yarn 1.x:
   ```powershell
   corepack enable
   corepack prepare yarn@1.22.19 --activate
   ```
2. **OSD source at the same version as the target server** (once):
   ```powershell
   git clone --branch 3.8.0 --depth 1 https://github.com/opensearch-project/OpenSearch-Dashboards.git C:\dev\OpenSearch-Dashboards-3.8.0
   cd C:\dev\OpenSearch-Dashboards-3.8.0
   yarn osd bootstrap        # installs root node_modules (only needs to succeed once)
   ```
3. **Copy this plugin** into the checkout's `plugins` folder (keep the source folder name `genesco_Map`):
   ```powershell
   Copy-Item -Recurse <path-to>\genesco_Map C:\dev\OpenSearch-Dashboards-3.8.0\plugins\genesco_Map
   ```
4. **Install plugin deps and build** — answer the version prompt with the **exact** OSD version
   of the target server (e.g. `3.8.0`):
   ```powershell
   cd C:\dev\OpenSearch-Dashboards-3.8.0\plugins\genesco_Map
   yarn install --ignore-engines
   "3.8.0" | yarn build
   ```
   The build clears its previous `build` and `target` output before packaging.
   Output: `build\genescoMapStore-3.8.0.zip`.

> The zip is version-locked: OSD refuses to install a plugin built for a different version.
> Rebuild with the matching version for every OSD upgrade.

### 4.2 Install on OpenSearch Dashboards (Windows Server 2022)

Assumes OSD is installed from the Windows zip distribution, e.g. in
`C:\opensearch-dashboards` (adjust paths to your install). Run in an **elevated** PowerShell.

1. **Copy the newly built zip** to the server, e.g. `C:\temp\genescoMapStore-3.8.0.zip`.

2. **Stop OSD** (service or console process):

   ```powershell
   Stop-Service opensearch-dashboards        # if installed as a Windows service (name may differ)
   # or: stop the running opensearch-dashboards.bat console window
   ```

3. **Remove an older version** (only when upgrading):

   ```powershell
   cd C:\opensearch-dashboards
   .\bin\opensearch-dashboards-plugin.bat remove genescoMapStore
   ```

4. **Install** (note the `file:///` URL with forward slashes):

   ```powershell
   cd C:\opensearch-dashboards
   .\bin\opensearch-dashboards-plugin.bat install file:///C:/temp/genescoMapStore-3.8.0.zip
   .\bin\opensearch-dashboards-plugin.bat list            # should include genescoMapStore
   ```

   If OSD runs as a dedicated service account, make sure that account can read
   `C:\opensearch-dashboards\plugins\genescoMapStore`.

   Reinstalling the plugin updates its code, not the OpenSearch indices or VictoriaMetrics
   samples. If those still show old records, update the backend data separately.

5. **Configure** `C:\opensearch-dashboards\config\opensearch_dashboards.yml` — add **once** at the end:

   ```yaml
   sample_map.victoriaMetricsUrl: 'http://<vm-host>:8428' # include any -http.pathPrefix
   ```

   The server must be able to reach this URL (OSD proxies all metric calls). Test from the server:

   ```powershell
   Invoke-RestMethod "http://<vm-host>:8428/api/v1/query?query=gensco_site_up"
   ```

6. **Start OSD** and watch the log for `genescoMapStores` in the plugin list:

   ```powershell
   Start-Service opensearch-dashboards
   # or: .\bin\opensearch-dashboards.bat
   ```

   First start after an install can take a little longer.

7. **Verify**: open `http://<server>:5601` → side nav **MAP → Gensco**. If the browser shows an
   old version, do a hard reload (Ctrl+F5).

8. **Seed demo data** (optional) from any machine that can reach OpenSearch / VictoriaMetrics —
   see _Seed demo data_ above. Users need read access to the `gensco-sites` and `gensco-logs`
   indices (OpenSearch security role) to see live data instead of the sample fallback.

**Uninstall**

```powershell
Stop-Service opensearch-dashboards
C:\opensearch-dashboards\bin\opensearch-dashboards-plugin.bat remove genescoMapStores
# remove the sample_map.* line from opensearch_dashboards.yml, then
Start-Service opensearch-dashboards
```

**Troubleshooting**

- _"Plugin installation was unsuccessful due to error: incompatible version"_ — the zip was built for
  a different OSD version; rebuild with the server's exact version (step 4.1.4).
- _OSD fails to start after editing the yml_ — check for a duplicated key or bad indentation;
  every `sample_map.*` key must appear only once.
- _Map shows "Sample data · metrics"_ — OSD can't reach `sample_map.victoriaMetricsUrl`, or there
  are no `gensco_*` series in the last 6 h. Check `http://<server>:5601/api/sample_map/vm/query?query=gensco_site_up`
  while logged in.
- _Map shows "Sample data · sites"_ — the `gensco-sites` index is missing/empty or the user lacks read access.

---

## 5. How to extend

### Add a new metric to the detail panel

1. Add the metric name to `METRICS` in `public/lib/constants.ts`.
2. In `services/detailService.ts → fetchSiteDetail`, add a `rangeQuery(...)` to the `Promise.all`
   and return it as a new `MetricPoint[]` field (add the field to `SiteDetail` in `lib/types.ts`).
3. Render it in `components/detail/DetailPanel.tsx` with another
   `<MetricChart title="..." points={detail?.newSeries || []} color="#..." unit="..." theme={theme} />`.
4. Optionally add a `sampleSeries(...)` fallback so the demo still shows it without data.

### Add a new value to the map status

1. Read it in `services/siteService.ts → fetchAllSiteHealth` (one extra instant query) and store it on `SiteHealth`.
2. Use it in `deriveStatus`.

### Add a new status (e.g. `Maintenance`)

1. `lib/types.ts` – add to `SiteStatus`.
2. `lib/constants.ts` – add a color to `STATUS_COLORS` (pin images are generated from this map automatically) and a label in `displayLabel` if needed.
3. `services/siteService.ts` – return it from `deriveStatus`.
4. `components/FilterPanel.tsx` – add a pill to `FILTERS`.
5. Optional: give it emphasis in `hooks/useGenscoMap.ts` (`buildIconSizeExpr`, `PIN_SORT_KEY_EXPR`, or the pulse layer filter).

### Add a new log-based section

1. Write a query function next to `fetchSiteLogs` in `services/detailService.ts` (use `osSearch(index, body)`).
2. Add the result to `SiteDetail`, then render a new `<div className="dp-sec">` block in `DetailPanel.tsx`
   (reuse `.gen-tbl` for tables, `.dp-card` for cards).

### Point at different indices / metric names

Only `public/lib/constants.ts` (`CFG`, `METRICS`) needs to change, plus the field names in
`siteService.fetchSiteLocations` / `detailService.fetchSiteLogs` if your documents differ.

### Add a second map app

1. `public/plugin.ts` – register another app id (and add it to both `addNavLinksToGroup` calls) with a new `mount`.
2. Create a sibling `components/<Name>App.tsx` + `hooks/use<Name>Map.ts` (copy the Gensco ones as a starting point).
3. Keep styles under `.sample-map-container` so they don't leak into other OSD apps.

### Conventions / gotchas

- All OpenSearch reads go through `/internal/search/opensearch` (user's session & permissions apply).
- All VictoriaMetrics reads go through the plugin's server proxy (`/api/sample_map/vm/*`); the
  browser never talks to VM directly, so VM can stay cluster-internal.
- `maplibre-gl` and `chart.js` are bundled — no CDN, so OSD's CSP is not an issue.
- The app root measures its own height (stacked OSD header rows), don't switch it to `height: 100%`.
- `@mapbox/jsonlint-lines-primitives` is pinned to `2.0.2` via `resolutions` because 2.0.3 requires
  Node ≥ 22 and breaks `yarn build` on Node 20.
