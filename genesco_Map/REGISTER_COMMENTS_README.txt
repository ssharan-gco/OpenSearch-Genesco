GENESCO REGISTER INCIDENT DETAILS - NOV 2026
============================================
This is based directly on the team's genesco_Map(2).zip source. Existing error graph,
State/Region filters, weather overlays, register health calculations, store data and
map behavior remain unchanged.

IT DASHBOARD (Register Depth View)
----------------------------------
- Only Warning/Degraded and Down registers show the incident controls.
- Add is enabled only if the register has no saved incident; Edit starts disabled.
- Click Add to enter a required Incident number (up to 80 characters) and an optional
  Status update (up to 1,000 characters). Save enables Edit and disables Add.
- Click Edit to change either field. Saving BOTH fields empty deletes that register's
  incident document, re-enables Add and disables Edit. An update alone without an
  incident number cannot be saved.
- Yellow (i) opens a click-only, read-only detail card with heading "Register N",
  followed by Incident number and Status update. No preview is printed below the status.
- Healthy registers show none of these controls.

USERS DASHBOARD (Store Pin Popup)
---------------------------------
- Down/Attention-Required stores show yellow (i) beside each Warning or Down register.
- CLICK the (i) to open/close a small detail card (not hover), showing "Register N",
  Incident number and Status update. USERS cannot edit either field.
- Missing values display "No incident recorded." and "No updates for this register."
- Healthy registers do not show an (i). Only the selected store's notes are fetched.

OPENSEARCH AND RECOVERY
-----------------------
- Index: genesco-register-notes. It is created on the first successful save.
- One document per store/register, containing storeId, registerId, incidentNumber,
  comment (status update), and updatedAt. Existing indexes accept the new incidentNumber
  field through default OpenSearch dynamic mapping; new indexes map it as keyword.
- DEV and PROD have separate indexes. Both IT and USERS read the same index in each
  environment through their local OpenSearch Dashboards backend.
- Saving both fields blank deletes the document, not the index.
- Existing comment-only documents remain readable. To update an old document, the user
  must supply its incident number; alternatively clear both fields to remove it.
- The previous confirmed-recovery logic is preserved: a Healthy VictoriaMetrics sample
  after a note's save time invalidates the note; cleanup is attempted on note reads or
  the IT detail's 60-second check, not by a permanent background cleanup service.
- Recovery detection depends on the relevant VictoriaMetrics samples being retained.

INSTALL / DEPLOYMENT
--------------------
- Both frontend code and server/routes/registerNotes.ts must be deployed together.
- Stop OpenSearch Dashboards, back up plugins/genesco_Map, install the new plugin,
  install dependencies if needed, then run yarn start --no-base-path from OSD38.
- The full source ZIP deliberately excludes old precompiled target/ and build/ output;
  rebuild the plugin using the team's normal production build process for deployment.
- No Go weather loader changes, environment variables, credentials or node_modules
  are included.
