export type WineMapLine = {
  name: string;
  coordinates: Array<[number, number]>;
  labelAt?: [number, number];
};

export type WineMapContour = WineMapLine & {
  elevation: string;
};

export type WineMapCountryContext = {
  contours?: WineMapContour[];
  rivers?: WineMapLine[];
};

/*
 * These are deliberately light atlas guides, not navigation data. They keep
 * the rivers that organise wine regions visible after the tiled terrain map
 * was removed. Fine legal boundaries come from the dedicated source layers.
 */
export const wineMapCountryContext: Partial<Record<string, WineMapCountryContext>> = {
  FRA: {
    rivers: [
      { name: "Loire", coordinates: [[-2.1, 47.25], [-0.65, 47.35], [0.7, 47.38], [2.2, 47.15], [3.0, 46.7]], labelAt: [0.35, 47.45] },
      { name: "Garonne", coordinates: [[-0.63, 44.88], [0.7, 44.1], [1.45, 43.6]], labelAt: [0.1, 44.45] },
      { name: "Dordogne", coordinates: [[-0.6, 44.98], [0.45, 44.9], [1.45, 45.05]], labelAt: [0.35, 45.0] },
      { name: "Rhône", coordinates: [[4.85, 45.8], [4.83, 44.4], [4.65, 43.5]], labelAt: [4.95, 44.65] },
      { name: "Saône", coordinates: [[4.95, 47.35], [4.86, 46.7], [4.83, 45.8]], labelAt: [5.0, 46.75] },
      { name: "Rhine", coordinates: [[7.55, 48.95], [7.58, 48.1], [7.58, 47.6]], labelAt: [7.7, 48.2] },
    ],
    contours: [
      { name: "French uplands", elevation: "500 m", coordinates: [[2.1, 46.7], [3.7, 47.2], [5.3, 46.9], [6.7, 47.3]], labelAt: [4.1, 47.28] },
      { name: "Alpine edge", elevation: "1,000 m", coordinates: [[5.1, 44.0], [6.0, 44.6], [6.65, 45.4], [6.8, 46.2]], labelAt: [6.25, 45.0] },
    ],
  },
  ITA: {
    rivers: [
      { name: "Po", coordinates: [[7.2, 45.15], [9.2, 45.0], [11.0, 45.05], [12.3, 44.95]], labelAt: [9.85, 45.15] },
      { name: "Adige", coordinates: [[11.0, 46.8], [11.1, 46.1], [11.0, 45.45]], labelAt: [11.2, 46.1] },
      { name: "Arno", coordinates: [[11.35, 43.75], [10.7, 43.7], [10.25, 43.65]], labelAt: [10.75, 43.8] },
    ],
    contours: [
      { name: "Apennines", elevation: "500 m", coordinates: [[8.7, 44.7], [10.7, 43.8], [12.8, 42.5], [14.4, 41.2]], labelAt: [12.0, 43.1] },
      { name: "Alpine foothills", elevation: "1,000 m", coordinates: [[7.4, 45.9], [9.4, 46.1], [11.8, 46.4], [13.1, 46.1]], labelAt: [10.3, 46.3] },
    ],
  },
  ESP: {
    rivers: [
      { name: "Ebro", coordinates: [[-3.0, 42.75], [-2.0, 42.45], [-0.9, 41.75], [0.7, 40.8]], labelAt: [-1.05, 42.0] },
      { name: "Duero", coordinates: [[-6.8, 41.15], [-5.2, 41.5], [-3.4, 41.65], [-2.3, 41.75]], labelAt: [-4.45, 41.68] },
      { name: "Tajo", coordinates: [[-7.0, 39.45], [-5.2, 39.8], [-3.7, 40.0], [-1.8, 40.3]], labelAt: [-4.5, 40.05] },
    ],
    contours: [
      { name: "Meseta", elevation: "500 m", coordinates: [[-7.0, 42.0], [-5.0, 42.2], [-3.0, 41.9], [-1.0, 41.5]], labelAt: [-4.0, 42.18] },
      { name: "Central system", elevation: "1,000 m", coordinates: [[-6.0, 40.5], [-4.5, 40.7], [-3.0, 40.5], [-1.8, 40.2]], labelAt: [-4.0, 40.82] },
    ],
  },
  PRT: {
    rivers: [
      { name: "Douro", coordinates: [[-8.65, 41.14], [-7.75, 41.15], [-6.7, 41.05]], labelAt: [-7.7, 41.28] },
      { name: "Dão", coordinates: [[-8.2, 40.65], [-7.85, 40.55], [-7.55, 40.45]], labelAt: [-7.95, 40.67] },
      { name: "Tejo", coordinates: [[-9.1, 38.72], [-8.45, 39.0], [-7.2, 39.45]], labelAt: [-8.35, 39.12] },
    ],
    contours: [
      { name: "Northern uplands", elevation: "500 m", coordinates: [[-8.5, 41.9], [-7.8, 41.5], [-6.9, 41.45]], labelAt: [-7.6, 41.7] },
    ],
  },
  DEU: {
    rivers: [
      { name: "Rhine", coordinates: [[7.6, 47.7], [7.6, 49.1], [7.1, 50.6], [6.6, 51.5]], labelAt: [7.3, 49.8] },
      { name: "Mosel", coordinates: [[6.15, 49.6], [6.65, 49.8], [7.1, 50.2], [7.6, 50.35]], labelAt: [6.7, 50.0] },
      { name: "Main", coordinates: [[8.2, 50.0], [9.0, 49.8], [10.1, 49.8], [10.8, 50.0]], labelAt: [9.4, 49.95] },
    ],
    contours: [
      { name: "Central uplands", elevation: "500 m", coordinates: [[7.0, 50.7], [8.2, 50.4], [9.7, 50.6], [11.2, 50.2]], labelAt: [9.1, 50.72] },
    ],
  },
  AUT: {
    rivers: [
      { name: "Danube", coordinates: [[13.1, 48.55], [14.6, 48.35], [16.45, 48.2], [17.0, 48.15]], labelAt: [15.25, 48.45] },
    ],
    contours: [
      { name: "Alpine edge", elevation: "500 m", coordinates: [[13.5, 47.5], [14.7, 47.7], [16.2, 47.8]], labelAt: [14.8, 47.85] },
    ],
  },
  HUN: {
    rivers: [
      { name: "Danube", coordinates: [[18.8, 47.8], [19.05, 47.5], [18.95, 46.8], [18.8, 46.1]], labelAt: [19.1, 47.05] },
      { name: "Tisza", coordinates: [[21.3, 48.2], [21.1, 47.4], [20.4, 46.8]], labelAt: [21.2, 47.5] },
    ],
  },
  GRC: {
    rivers: [
      { name: "Aliakmon", coordinates: [[22.4, 40.3], [22.1, 40.45], [21.7, 40.3]], labelAt: [22.05, 40.5] },
    ],
    contours: [
      { name: "Mainland mountains", elevation: "1,000 m", coordinates: [[20.6, 39.7], [21.5, 39.4], [22.2, 38.8]], labelAt: [21.4, 39.6] },
    ],
  },
  USA: {
    rivers: [
      { name: "Columbia", coordinates: [[-124.0, 46.25], [-122.7, 45.7], [-120.5, 45.8], [-118.2, 46.0]], labelAt: [-121.2, 46.05] },
      { name: "Willamette", coordinates: [[-123.0, 44.1], [-123.0, 45.0], [-122.7, 45.65]], labelAt: [-122.8, 44.9] },
      { name: "Russian River", coordinates: [[-123.0, 38.75], [-122.85, 38.55], [-122.75, 38.4]], labelAt: [-122.9, 38.62] },
      { name: "Napa River", coordinates: [[-122.4, 38.75], [-122.32, 38.3], [-122.3, 38.05]], labelAt: [-122.25, 38.4] },
    ],
    contours: [
      { name: "Coast ranges", elevation: "500 m", coordinates: [[-123.8, 46.5], [-123.1, 43.0], [-122.7, 39.0], [-121.8, 35.0]], labelAt: [-123.0, 41.5] },
    ],
  },
  CAN: {
    rivers: [
      { name: "Fraser", coordinates: [[-121.6, 49.3], [-122.4, 49.2], [-123.1, 49.15]], labelAt: [-122.3, 49.35] },
      { name: "Niagara", coordinates: [[-79.05, 43.25], [-79.0, 43.05], [-78.95, 42.9]], labelAt: [-78.85, 43.08] },
      { name: "St Lawrence", coordinates: [[-76.0, 44.3], [-73.7, 45.5], [-71.2, 46.8]], labelAt: [-73.5, 45.75] },
    ],
  },
  CHL: {
    rivers: [
      { name: "Maipo", coordinates: [[-71.7, -33.6], [-70.7, -33.6], [-70.2, -33.8]], labelAt: [-70.9, -33.45] },
      { name: "Rapel", coordinates: [[-71.75, -34.15], [-71.0, -34.25], [-70.6, -34.4]], labelAt: [-71.15, -34.05] },
      { name: "Maule", coordinates: [[-72.1, -35.4], [-71.3, -35.5], [-70.8, -35.7]], labelAt: [-71.45, -35.3] },
      { name: "Biobío", coordinates: [[-73.1, -37.0], [-72.3, -37.0], [-71.3, -37.2]], labelAt: [-72.2, -36.85] },
    ],
    contours: [
      { name: "Andean foothills", elevation: "1,000 m", coordinates: [[-70.2, -30.0], [-70.0, -34.0], [-70.2, -38.0]], labelAt: [-69.8, -34.7] },
    ],
  },
  ARG: {
    rivers: [
      { name: "Mendoza", coordinates: [[-69.5, -32.8], [-68.9, -32.9], [-68.4, -33.1]], labelAt: [-68.9, -32.7] },
      { name: "Tunuyán", coordinates: [[-69.25, -33.55], [-68.85, -33.6], [-68.3, -33.45]], labelAt: [-68.8, -33.75] },
      { name: "Río Negro", coordinates: [[-70.2, -39.1], [-68.4, -39.2], [-66.7, -39.0]], labelAt: [-68.6, -38.9] },
    ],
    contours: [
      { name: "Andean foothills", elevation: "1,000 m", coordinates: [[-68.9, -23.0], [-69.2, -29.0], [-69.4, -34.0], [-70.0, -39.0]], labelAt: [-69.0, -31.5] },
    ],
  },
  ZAF: {
    rivers: [
      { name: "Berg", coordinates: [[18.8, -33.2], [18.7, -32.8], [18.4, -32.6]], labelAt: [18.55, -32.85] },
      { name: "Breede", coordinates: [[19.0, -33.8], [19.5, -33.7], [20.0, -34.0]], labelAt: [19.45, -33.55] },
      { name: "Orange", coordinates: [[17.6, -28.6], [20.0, -28.7], [23.5, -29.0]], labelAt: [20.5, -28.5] },
    ],
    contours: [
      { name: "Cape Fold Belt", elevation: "500 m", coordinates: [[18.5, -34.0], [19.5, -33.7], [20.6, -33.8]], labelAt: [19.5, -33.55] },
    ],
  },
  AUS: {
    rivers: [
      { name: "Murray", coordinates: [[138.6, -35.6], [142.0, -34.5], [146.5, -35.3], [148.8, -36.0]], labelAt: [143.5, -34.7] },
      { name: "Murrumbidgee", coordinates: [[143.2, -34.7], [146.5, -34.8], [148.5, -35.2]], labelAt: [146.4, -34.6] },
      { name: "Derwent", coordinates: [[147.3, -43.0], [147.1, -42.7], [146.9, -42.4]], labelAt: [147.15, -42.65] },
    ],
    contours: [
      { name: "Great Dividing Range", elevation: "500 m", coordinates: [[145.0, -38.0], [149.0, -35.0], [151.0, -31.0]], labelAt: [149.2, -34.0] },
    ],
  },
  NZL: {
    rivers: [
      { name: "Wairau", coordinates: [[173.8, -41.5], [173.2, -41.55], [172.7, -41.7]], labelAt: [173.25, -41.4] },
      { name: "Awatere", coordinates: [[174.0, -41.65], [173.5, -41.8], [173.0, -42.0]], labelAt: [173.55, -41.7] },
      { name: "Clutha", coordinates: [[169.7, -46.2], [169.9, -45.8], [169.3, -45.1]], labelAt: [169.6, -45.6] },
    ],
    contours: [
      { name: "Southern Alps", elevation: "1,000 m", coordinates: [[167.2, -45.5], [169.0, -43.5], [171.2, -42.0]], labelAt: [169.2, -43.3] },
    ],
  },
  CHN: {
    rivers: [
      { name: "Yellow River", coordinates: [[103.5, 36.0], [108.0, 37.0], [113.0, 35.5], [118.0, 37.2]], labelAt: [110.0, 36.8] },
      { name: "Yangtze", coordinates: [[99.0, 28.0], [105.0, 29.5], [111.0, 30.5], [118.0, 31.0]], labelAt: [108.0, 30.7] },
    ],
    contours: [
      { name: "Western plateau", elevation: "1,000 m", coordinates: [[86.0, 44.0], [94.0, 37.0], [99.0, 28.0]], labelAt: [94.5, 35.0] },
    ],
  },
  GBR: {
    rivers: [
      { name: "Thames", coordinates: [[-1.6, 51.7], [-0.8, 51.55], [0.0, 51.5], [0.7, 51.5]], labelAt: [-0.45, 51.65] },
      { name: "Severn", coordinates: [[-3.1, 52.7], [-2.5, 52.1], [-2.6, 51.6]], labelAt: [-2.7, 52.1] },
    ],
    contours: [
      { name: "Downs", elevation: "200 m", coordinates: [[-1.8, 51.1], [-0.8, 51.0], [0.6, 51.15]], labelAt: [-0.65, 51.18] },
    ],
  },
};
