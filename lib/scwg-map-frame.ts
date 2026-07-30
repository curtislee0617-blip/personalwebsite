// Geographic framing for the siting map. Pure geometry, no JSX, so it stays out
// of the component's size budget.
//
// The frame is a MultiPoint grid rather than a polygon: d3 treats polygon edges
// as great circles and reads a bare four-corner box as its own inverse, which
// collapses the projection scale and shrinks the map to a fraction of the canvas.

// Canvas proportioned to the framed region's aspect (~0.79 wide to tall).
export const MAP_W = 470;
export const MAP_H = 595;
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
 * Cropped to the pins, not to the country. The box is the bounding box of every
 * site in the dataset plus a small margin, so all 41 marks stay in frame while
 * Xinjiang, Tibet, the far west and the South China Sea — none of which carry
 * data — are cut away entirely.
 */
export const MAINLAND_FOCUS = frameGrid(104, 19.5, 130, 48.5);
