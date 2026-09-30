# Earth imagery

Day texture: NASA Earth Observatory, Blue Marble Next Generation, September 2004.
https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-map/

Night texture: NASA Earth Observatory, Black Marble 2016, 3km global color composite.
https://science.nasa.gov/earth/earth-observatory/earth-at-night/maps/

These historical, cloud-free composites are exported directly from NASA's 5400×2700 day map and 13500×6750 night map to 4096×2048 (full globe) and 2048×1024 (thumbnail) WebP. They are not live weather or satellite images. No endorsement by NASA is implied.

Day source: https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-base/september/world.200409.3x5400x2700.jpg
Night source: https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/144000/144898/BlackMarble_2016_3km.jpg

Geocentric Sun and Moon positions: Astronomy Engine by Don Cross (MIT license).
https://github.com/cosinekitty/astronomy

The globe uses equatorial-of-date coordinates and Greenwich apparent sidereal time to project celestial directions into Earth-fixed longitude and latitude. Geography and location markers use the same north-up, Greenwich-centered texture convention. SunCalc remains the source of the planner’s local rise/set and twilight times.

## Adapted open-source rendering

- inventhq/dot-globe: spherical spiral dot sampling, converted from Swift/SceneKit to a single WebGL point cloud in `lib/globe-effects.ts` and `components/earth-canvas.tsx`. https://github.com/inventhq/dot-globe
- Pana-g/flutter_earth_globe: textureSwap day/night cosine blending from `shaders/sphere.frag`, adapted to a Three.js world-space normal and an ephemeris-derived Sun direction. https://github.com/Pana-g/flutter_earth_globe

Original MIT notices are retained in `licenses/`. These are React/WebGL adaptations, not embedded Swift or Flutter runtimes. Initial time-lapse begins 90 minutes before sunset where available. The thumbnail clock, condition, and globe use the same simulated instant. Reduced-motion users start with current lighting and no autoplay. The initial viewpoint and thumbnail time zone follow the public pixel-art city pin; LA is used when no supported city is pinned. A visitor's manually selected observing spot takes precedence in the full tool.

## Star field

NASA/Goddard Space Flight Center Scientific Visualization Studio, Deep Star Maps 2020, Ernie Wright. Gaia DR2: ESA/Gaia/DPAC.
https://svs.gsfc.nasa.gov/4851/
Source: https://svs.gsfc.nasa.gov/vis/a000000/a004800/a004851/starmap_2020_8k.exr

The original ICRF/J2000 equirectangular map is centered at RA 0h, with RA increasing leftward. `scripts/build-star-map.mjs` converts its linear HDR pixels into 8192×4096 and 4096×2048 display textures with a consistent exposure curve, preserving positions and relative colors. The 8K texture is reserved for large full-globe canvases on supported GPUs; thumbnails and smaller canvases use 4K. Rendering matches screen density up to 2×. The renderer converts Earth-fixed viewing directions back to J2000 using precession/nutation and Greenwich sidereal time, then samples the map without camera-position parallax. This is a catalog-based space backdrop, not a simulation of local atmospheric visibility or a calibrated sky photograph.

City-light visibility is a visual dusk/dawn model: emission fades from full at a solar altitude of −6° to off at +2°, independently of the −18° astronomical-darkness threshold. It does not claim to model individual cities' switching schedules.

The dotted view uses a north-up land mask from the public-domain Natural Earth 110m geography bundled in @d3-maps/atlas, rather than inferring land from satellite pixel brightness.

## Clouds and local weather

Cloud texture: NASA Goddard Space Flight Center, Blue Marble: Clouds (2002 release), Reto Stöckli; enhancements by Robert Simmon.
https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57747/cloud_combined_2048.jpg

Exported at its original 2048×1024 resolution as grayscale WebP. The density map is rendered on one transparent shell, lit by the same Sun direction as the surface. Dense clouds are capped at 24% opacity over land and 46% over water; night opacity is further reduced so geography and city lights remain visible. Slow drift is illustrative, not a wind forecast. The historical composite does not represent current cloud locations. Clouds can be hidden in the full globe.

Local hourly temperature, cloud cover, wind speed, rain probability and WMO weather codes: Open-Meteo (CC BY 4.0), https://open-meteo.com/en/docs. Readings use the selected globe time and observing coordinates; unavailable/out-of-range hours are not replaced with current readings. Temperature is Celsius and wind speed is km/h. The global cloud texture is independent of these local forecasts.
