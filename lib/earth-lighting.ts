import { Body, EquatorFromVector, GeoVector, Illumination, KM_PER_AU, RotateVector, Rotation_EQJ_EQD, SiderealTime } from "astronomy-engine";

export type EarthVector = [number, number, number];
const radians = Math.PI / 180;

// Matches Three.js SphereGeometry and a north-up, Greenwich-centered
// equirectangular texture: +X is Greenwich, +Y north, -Z is 90° east.
export function earthVector(latitude: number, longitude: number): EarthVector {
  const lat = latitude * radians;
  const lon = longitude * radians;
  return [Math.cos(lat) * Math.cos(lon), Math.sin(lat), -Math.cos(lat) * Math.sin(lon)];
}

export function earthLighting(instant: Date) {
  const rotation = Rotation_EQJ_EQD(instant);
  const sidereal = SiderealTime(instant);
  const sun = EquatorFromVector(RotateVector(rotation, GeoVector(Body.Sun, instant, true)));
  const moon = EquatorFromVector(RotateVector(rotation, GeoVector(Body.Moon, instant, true)));
  const theta = sidereal * 15 * radians;
  const cos = Math.cos(theta), sin = Math.sin(theta);
  // Rows of the inverse sky transform: Earth-fixed directions -> ICRF/J2000.
  // Astronomy Engine's rotation stores each input basis vector as a column.
  const earthToEquatorial = rotation.rot.flatMap(([x, y, z]) => [cos * x + sin * y, z, sin * x - cos * y]);
  // Right ascension and sidereal time are hours, geographic longitude degrees.
  // Use geocentric geometry directly; atmospheric refraction is local to an observer.
  return {
    sun: earthVector(sun.dec, 15 * (sun.ra - sidereal)),
    moon: earthVector(moon.dec, 15 * (moon.ra - sidereal)),
    moonFraction: Illumination(Body.Moon, instant).phase_fraction,
    moonDistance: moon.dist * KM_PER_AU,
    earthToEquatorial,
  };
}
