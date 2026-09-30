// Spherical spiral sampling adapted from inventhq/dot-globe (MIT).
// Attribution and original licenses: public/astronomy/licenses/.
export const EARTH_PLAYBACK_RATE = 1800; // 30 simulated minutes per real second.
// A visual model of dusk-to-dawn lighting, independent of astronomical night.
export const CITY_LIGHTS_FADE = { fullAltitude: -6, offAltitude: 2 };

export function globeDotPositions(count = 12500) {
  const positions = new Float32Array((count + 1) * 3);
  for (let index = 0; index <= count; index++) {
    const phi = Math.acos(-1 + 2 * index / count);
    const theta = Math.sqrt(count * Math.PI) * phi;
    // Adapt the source's Z-up sphere to our Y-up geographic convention.
    positions[index * 3] = Math.sin(phi) * Math.cos(theta) * 1.002;
    positions[index * 3 + 1] = Math.cos(phi) * 1.002;
    positions[index * 3 + 2] = -Math.sin(phi) * Math.sin(theta) * 1.002;
  }
  return positions;
}
