# GenesCo Store Manager — Inline Edit in View Stores

- View Stores now includes an **Edit** button beside the store number in every table row. The separate Modify Store tab is removed.
- Keep Add Store / View Stores / Delete Store tabs. Editing opens the existing form in the View tab, and saving/canceling returns to the same filtered, paginated list.
- Removed visible Source, Created At, and Record ID columns. Renamed Brand (derived) to Brand. Retained Updated At; now includes local time zone abbreviation (e.g. EST/EDT), calculated from the browser system time zone. Stored timestamps remain UTC ISO-8601.
- The table has a narrower minimum width, wrapped Store Name and Address, and a second-column action so the user never needs to scroll to the far right to find Edit.
- OpenSearch still identifies and updates a record using its unique ID internally (important for duplicate store numbers).
- Add/Edit/Delete continue to write `genesco-stores`; IT reads it again upon returning to the map and USERS refreshes its map about every 30 seconds while visible. No index migration or schema changes.

## Install

1. Stop local OpenSearch Dashboards.
2. Back up `plugins/genesco_Map`.
3. Extract the PATCH ZIP to `OSD38/plugins` (it starts with `genesco_Map/`).
4. Restart: `export NODE_USE_SYSTEM_CA=1; yarn start --no-base-path`.

## Validate

1. View Stores: 10 rows, search and Brand/State filters, edit button beside Store #.
2. Open an existing store in Edit; cancel and verify the original filters/page remain.
3. Edit an approved test record, Save Changes, verify Updated At time and map contents on IT and USERS.
4. Add then delete an approved test location, ensuring both maps reflect changes; verify the index count changes only for add/delete.
5. Check duplicate-number stores (e.g. 2101) to ensure Edit targets the selected location, not every record sharing that number.

Testing performed: static source/table structure and consistency checks. Live browser/DEV OpenSearch behavior must be validated in the user's VDI.
