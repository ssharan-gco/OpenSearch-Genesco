GenesCo Weather Alerts — merged with teammate feature-genescoChanges branch (2026-11-17)

This folder is based on the supplied OpenSearch-Genesco-feature-genescoChanges.zip,
NOT on an older GenesCo plugin snapshot. Latest State and Region filter additions
and all other teammate source files have been retained.

Only these existing files are changed relative to teammate base:
- public/components/EnterpriseApp.tsx
- public/components/GenscoApp.tsx
- public/hooks/useEnterpriseMap.ts
- public/hooks/useGenscoMap.ts
- public/index.scss

New weather-related files (front-end only):
- public/components/WeatherAlertsPanel.tsx
- public/hooks/useWeatherAlerts.ts
- public/lib/weatherAlerts.ts
- public/lib/weatherAlerts.test.ts
- public/lib/weatherMapOverlay.ts (red polygon SVG rendering fix)
- public/services/weatherAlerts.ts

The Go Weather Loader is NOT included or modified. The existing Go processes
continue to populate the shared weather-alerts index in DEV / PROD.
The browser reads that index and checks for refreshed content every 2 minutes.
No Go executable, credentials or node_modules are bundled with this ZIP.

Install:
1) Back up existing OSD38/plugins/genesco_map or genesco_Map folder.
2) Stop yarn start (Ctrl+C).
3) Extract genesco_Map folder into OSD38/plugins/, replacing the old plugin
   folder instead of blending old and new snapshots.
4) Run yarn start --no-base-path from OSD38 root.
5) Verify new State/Region filters, site pins/status and weather widgets in BOTH
   GenesCo IT and USERS dashboards. Alert data requires readable weather-alerts
   in the connected OpenSearch cluster.
