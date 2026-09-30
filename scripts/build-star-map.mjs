// NASA SVS Deep Star Maps 2020, ICRF/J2000 (RA increases to the left).
// node scripts/build-star-map.mjs /path/to/starmap_2020_8k.exr
import { readFile } from 'node:fs/promises';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { FloatType } from 'three';
import sharp from 'sharp';

const source = await readFile(process.argv[2]);
const map = new EXRLoader().setDataType(FloatType).parse(source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength));
if (map.width < 8192) throw new Error('Use the original NASA 8K map; do not upscale a smaller texture.');
const pixels = Buffer.alloc(map.width * map.height * 3);
for (let i = 0; i < map.width * map.height; i++) {
  for (let c = 0; c < 3; c++) {
    const linear = Math.max(0, map.data[i * 4 + c]);
    const exposed = 1 - Math.exp(-linear * 1.25);
    const srgb = exposed <= .0031308 ? exposed * 12.92 : 1.055 * exposed ** (1 / 2.4) - .055;
    pixels[i * 3 + c] = Math.round(255 * srgb);
  }
}
// EXRLoader returns bottom-up rows; browser image textures expect top-down.
const image = sharp(pixels, { raw: { width: map.width, height: map.height, channels: 3 } }).flip();
await image.clone().resize(8192).webp({ quality: 94 }).toFile('public/astronomy/stars-2020-8k.webp');
await image.clone().resize(4096).webp({ quality: 94 }).toFile('public/astronomy/stars-2020-4k.webp');
console.log('Created full and thumbnail NASA star textures.');
