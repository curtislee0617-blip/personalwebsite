# Google Maps list imports

Place Google Takeout `.zip`, `.json`, `.csv`, `.kml`, or `.geojson` exports in this folder. Import files are ignored by Git so personal source data is not published with the website.

Run `npm run maps:import -- imports/google-maps/<takeout-file>.zip` to merge lists, remove duplicate URLs and write a preliminary classified dataset to `imports/google-maps/staging/restaurants.json`.
