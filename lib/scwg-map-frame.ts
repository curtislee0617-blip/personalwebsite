// Geographic framing for the siting map. Pure geometry, no JSX, so it stays out
// of the component's size budget.
//
// The frame is a MultiPoint grid rather than a polygon: d3 treats polygon edges
// as great circles and reads a bare four-corner box as its own inverse, which
// collapses the projection scale and shrinks the map to a fraction of the canvas.

// Canvas proportioned to the framed region's aspect (~1.08 wide to tall).
export const MAP_W = 560;
export const MAP_H = 518;
export const MAP_PAD = 2;

function frameGrid(west: number, south: number, east: number, north: number) {
  const step = 1;
  const coordinates: [number, number][] = [];
  for (let lon = west; lon <= east; lon += step) coordinates.push([lon, south], [lon, north]);
  for (let lat = south; lat <= north; lat += step) coordinates.push([west, lat], [east, lat]);
  return {
    type: "Feature" as const,
    properties: {},
    geometry: { type: "MultiPoint" as const, coordinates },
  };
}

/**
 * Deliberately NOT the whole country: the frame covers the eastern half, from
 * Guangxi and Hainan up to Heilongjiang, which is where every site in the
 * dataset sits. Xinjiang, Tibet and the far west carry no data and are cropped,
 * and the South China Sea islands fall outside it too.
 */
export const MAINLAND_FOCUS = frameGrid(97, 19, 133, 48);
