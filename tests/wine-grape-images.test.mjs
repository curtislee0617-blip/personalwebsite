import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import sharp from 'sharp';
import { wineGrapes } from '../data/wine-grape-data.ts';
import { wineGrapeImages } from '../data/wine-grape-images.ts';

// Protect the atlas from missing files and accidental reuse under another cultivar.
test('grape reference images decode, have credits, and belong to known varieties', async () => {
  const ids = new Set(wineGrapes.map(grape => grape.id));
  const sources = new Set();
  for (const [id, image] of Object.entries(wineGrapeImages)) {
    assert.ok(ids.has(id), `Unknown grape: ${id}`);
    assert.ok(image.credit.trim() && image.license.trim(), `Missing attribution: ${id}`);
    assert.equal(new URL(image.sourceUrl).protocol, 'https:');
    assert.ok(!sources.has(image.sourceUrl), `Duplicate source needs an explicit cultivar review: ${id}`);
    sources.add(image.sourceUrl);
    for (const path of [image.file, image.thumb]) {
      const bytes = await readFile(new URL(`../public${path}`, import.meta.url));
      const metadata = await sharp(bytes).metadata();
      assert.equal(metadata.format, 'webp', path);
      assert.ok(metadata.width > 0 && metadata.height > 0, path);
    }
  }
});

test('family illustrations name a representative rather than imply a single cultivar', () => {
  for (const id of ['blauburgunder-family', 'lambrusco', 'malvasia']) {
    assert.ok(wineGrapeImages[id].subject, `Missing family image caption: ${id}`);
  }
});
