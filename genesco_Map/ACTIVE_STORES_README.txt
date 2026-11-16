Active stores applied to teammate's latest GenesCo Map (genesco_Map(1).zip)

1,085 entries from Active_store_info 1.xlsx (1,058 distinct numeric POS_STORE identifiers).
Source location metadata: public/lib/activeStores.ts and sample-data/gensco-sites.json.
Coordinates carried over unchanged from prior working active-store catalog. They include
store matches and approximate city/postal positions, not verified storefront geocodes.
See sample-data/active-stores-coordinate-audit.json for per-store source details.
Both IT and USERS apps share the same active locations through siteService.ts.
Two brands can share one numeric store ID: unique marker/selection keys are used,
while live metrics and XStore error logs remain keyed by numeric store ID.
The developer's new USERS status policy, brand labels, filter behavior, map placement,
error chart and 5-minute default selected time range have not been changed.
There is NO automatic PROD log connection; your localhost OSD configuration controls
which OpenSearch cluster is searched. Only sources in the DEV index are accessible if
localhost is configured for DEV.
Do not deploy bundled build/target artifacts without rebuilding the plugin.
