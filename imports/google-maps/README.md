# Google Maps list imports

Place Google Takeout `.zip`, `.json`, `.csv`, `.kml`, or `.geojson` exports in this folder. Import files are ignored by Git so personal source data is not published with the website.

Run `npm run maps:import -- imports/google-maps/<takeout-file>.zip` to merge lists, remove duplicate URLs and write a preliminary classified dataset to `imports/google-maps/staging/restaurants.json`.

Opening hours are stored separately from Takeout imports so a later upload does not erase them. Review the number of places that need hours without making Google API requests with `npm run maps:sync-details -- --missing-hours-only --count-only`. To fill them, add a Google Places API key to `.env.local`, then run `npm run maps:sync-details -- --missing-hours-only --apply`. Google bills opening-hours fields as Place Details Enterprise requests, so check the current quota and pricing before a full backfill.
