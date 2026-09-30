import test from 'node:test';
import assert from 'node:assert/strict';
import { getPosition, getMoonPosition } from 'suncalc';
import { earthLighting, earthVector } from '../lib/earth-lighting.ts';
import { atlasCell, decodeAtlasBrightness } from '../lib/light-pollution.ts';
import { getDayInterval } from '../lib/astronomical-darkness.ts';
import { sampleEarthTimeline } from '../lib/earth-timeline.ts';
import { pinnedSkyLocation, globeViewpoint } from '../lib/sky-locations.ts';
import { CITY_LIGHTS_FADE } from '../lib/globe-effects.ts';

const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0);

test('solar lighting follows seasons and the ephemeris across Earth', () => {
  for (const [date, expectedDeclination] of [['2026-06-21T12:00:00Z', 23.44], ['2026-12-21T12:00:00Z', -23.44]]) {
    const instant = new Date(date);
    const light = earthLighting(instant);
    assert.ok(Math.abs(Math.asin(light.sun[1]) * 180 / Math.PI - expectedDeclination) < 0.1);
    for (const [lat, lon] of [[34, -118], [51, 0], [-34, 151], [0, 90], [70, 30]]) {
      const projected = Math.asin(dot(earthVector(lat, lon), light.sun)) * 180 / Math.PI;
      assert.ok(Math.abs(projected - getPosition(instant, lat, lon).altitude) < 0.6);
    }
  }
});

test('moonlight hemisphere agrees with local lunar positions', () => {
  const instant = new Date('2026-09-29T05:00:00Z');
  const light = earthLighting(instant);
  for (const [lat, lon] of [[34, -118], [51, 0], [-34, 151], [0, 90], [70, 30]]) {
    const normal = earthVector(lat, lon);
    const local = light.moon.map((v, i) => v * light.moonDistance - normal[i] * 6378.14);
    const length = Math.hypot(...local);
    const projected = Math.asin(dot(normal, local.map(v => v / length))) * 180 / Math.PI;
    assert.ok(Math.abs(projected - getMoonPosition(instant, lat, lon).altitude) < 0.65);
  }
});

test('atlas decoding follows signed row and column deltas', () => {
  const tile = new Int8Array(360001);
  tile[0] = 1; tile[1] = 5;
  tile[601] = -4; tile[602] = 3;
  const result = decodeAtlasBrightness(tile, 2, 2);
  const expected = 5 / 195 * Math.expm1(0.0195 * 132);
  assert.ok(Math.abs(result.ratio - expected) < 1e-10);
  assert.ok(Math.abs(result.magnitude - (22 - 2.5 * Math.log10(1 + expected))) < 1e-10);
  assert.throws(() => decodeAtlasBrightness(new Int8Array(2), 1, 1));
});

test('atlas edges and longitude wrapping stay within valid tile cells', () => {
  assert.equal(atlasCell(75, 0), null);
  assert.equal(atlasCell(-65.1, 0), null);
  assert.deepEqual(atlasCell(0, 180), atlasCell(0, -180));
  assert.deepEqual(atlasCell(-65, -180), {tileX:1, tileY:1, column:1, row:1});
  for (const lat of [-64.999, 0, 74.9999]) {
    const point = atlasCell(lat, 179.9999);
    assert.ok(point.row >= 1 && point.row <= 600);
    assert.ok(point.column >= 1 && point.column <= 600);
  }
});

test('globe slider follows 23-hour and 25-hour local calendar days', () => {
  for (const [date, hours] of [['2026-03-08',23],['2026-11-01',25]]) {
    const {start,end} = getDayInterval(date, 'America/Los_Angeles');
    assert.equal((end - start) / 3600000, hours);
  }
});

test('texture longitude and latitude align with the Three.js sphere and location pins', async () => {
  const { SphereGeometry } = await import('three');
  const geometry = new SphereGeometry(1, 32, 16);
  const position = geometry.getAttribute('position');
  const uv = geometry.getAttribute('uv');
  for (let index = 0; index < position.count; index++) {
    const latitude = uv.getY(index) * 180 - 90;
    if (Math.abs(latitude) > 89) continue; // Pole UVs have a seam correction.
    const longitude = uv.getX(index) * 360 - 180;
    const expected = earthVector(latitude, longitude);
    const actual = [position.getX(index), position.getY(index), position.getZ(index)];
    assert.ok(Math.hypot(...actual.map((value, axis) => value - expected[axis])) < 1e-6);
  }
  geometry.dispose();
});

test('day/night hemispheres remain opposite and follow Earth rotation', () => {
  const morning = earthLighting(new Date('2026-03-20T06:00:00Z')).sun;
  const evening = earthLighting(new Date('2026-03-20T18:00:00Z')).sun;
  assert.ok(dot(morning, evening) < -0.999);
  for (const vector of [morning, evening]) assert.ok(Math.abs(Math.hypot(...vector) - 1) < 1e-10);
  assert.ok(dot(earthVector(0, 90), morning) > 0.99);
  assert.ok(dot(earthVector(0, -90), evening) > 0.99);
});

test('adapted dot sampling stays on the geographic globe without invalid coordinates', async () => {
  const { globeDotPositions } = await import('../lib/globe-effects.ts');
  const points = globeDotPositions(12500);
  assert.equal(points.length, 12501 * 3);
  for (let index = 0; index < points.length; index += 3) {
    assert.ok(Math.abs(Math.hypot(points[index], points[index + 1], points[index + 2]) - 1.002) < 1e-6);
  }
});

test('NASA star lookup recovers J2000 directions from the time-dependent Earth frame', async () => {
  const { Body, GeoVector } = await import('astronomy-engine');
  for (const date of ['2026-03-20T06:00:00Z', '2026-09-29T22:00:00Z', '2030-12-21T00:00:00Z']) {
    const instant = new Date(date);
    const { sun, earthToEquatorial: rows } = earthLighting(instant);
    const recovered = [0, 1, 2].map(row => dot(rows.slice(row * 3, row * 3 + 3), sun));
    const original = GeoVector(Body.Sun, instant, true);
    const expected = [original.x, original.y, original.z].map(v => v / original.Length());
    assert.ok(Math.hypot(...recovered.map((value, i) => value - expected[i])) < 1e-10);
  }
});

test('thumbnail clock and renderer share a continuous timeline through midnight and pauses', () => {
  for (const date of ['2026-03-08', '2026-09-29', '2026-11-01']) {
    const { start, end } = getDayInterval(date, 'America/Los_Angeles');
    const frame = { instant: end.getTime() - 60_000, start: start.getTime(), end: end.getTime(), anchor: 1000, rate: 1800 };
    assert.equal(sampleEarthTimeline(frame, 1100), start.getTime() + 120_000);
    const time = sampleEarthTimeline(frame, 1100);
    const paused = { ...frame, instant: time, anchor: 1100, rate: 0 };
    assert.equal(sampleEarthTimeline(paused, 100_000), time);
    const resumed = { ...paused, anchor: 100_000, rate: 1800 };
    assert.equal(sampleEarthTimeline(resumed, 100_100), time + 180_000);
  }
});

test('pixel-art city pins select their own hemisphere and local clock', () => {
  for (const [city, zone, longitude] of [
    ['losAngeles', 'America/Los_Angeles', -118.2437],
    ['london', 'Europe/London', -.1278],
    ['hongKong', 'Asia/Hong_Kong', 114.1694],
  ]) {
    const spot = pinnedSkyLocation(city);
    assert.equal(spot.timeZone, zone);
    assert.equal(spot.longitude, longitude);
    const view = globeViewpoint(spot);
    assert.ok(dot(earthVector(view.latitude, view.longitude), earthVector(spot.latitude, spot.longitude)) > .95);
  }
  assert.equal(pinnedSkyLocation(null).name, 'Los Angeles');
  assert.equal(pinnedSkyLocation('__proto__').name, 'Los Angeles');
});

test('city lighting covers civil dusk and dawn, independently of astronomical darkness', () => {
  const intensity = altitude => {
    const radians = Math.PI / 180;
    const low = Math.sin(CITY_LIGHTS_FADE.fullAltitude * radians);
    const high = Math.sin(CITY_LIGHTS_FADE.offAltitude * radians);
    const t = Math.max(0, Math.min(1, (Math.sin(altitude * radians) - low) / (high - low)));
    return 1 - t * t * (3 - 2 * t);
  };
  assert.equal(intensity(-18), 1);
  assert.equal(intensity(-6), 1);
  assert.ok(intensity(-3) > .6);
  assert.ok(intensity(0) > .15);
  assert.equal(intensity(3), 0);
});
