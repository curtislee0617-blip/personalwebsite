import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import sharp from "sharp";
import { highlightPython } from "../lib/python-highlight.ts";

const publicRoot = new URL("../public/", import.meta.url);
const reports = await Promise.all(Array.from({ length: 6 }, (_, index) =>
  readFile(new URL(`bi1x/data/lab-${index + 1}.json`, publicRoot), "utf8").then(JSON.parse)
));
const dimensions = JSON.parse(await readFile(new URL("bi1x/image-dimensions.json", publicRoot), "utf8"));

test("every report image exists and reserves its actual aspect ratio", async () => {
  const sources = new Set();
  for (const report of reports) for (const section of report.sections) for (const block of section.blocks) {
    if (block.type === "image") {
      sources.add(block.src);
      assert.deepEqual({ width: block.width, height: block.height }, dimensions[block.src]);
    }
    if (block.type === "markdown") for (const match of block.text.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) sources.add(match[1]);
  }
  for (const src of sources) {
    const bytes = await readFile(new URL(src.slice(1), publicRoot));
    const actual = await sharp(bytes).metadata();
    assert.equal(dimensions[src]?.width, actual.width, src);
    assert.equal(dimensions[src]?.height, actual.height, src);
  }
});

test("two plots from one bacterial-growth cell cannot overwrite each other", () => {
  const images = reports[3].sections.flatMap(s => s.blocks).filter(b => b.type === "image" && b.sourceCell === 28);
  assert.equal(images.length, 2);
  assert.equal(new Set(images.map(image => image.src)).size, 2);
  assert.deepEqual(images.map(image => image.alt), ["Group 1 Results", "Group 2 Results"]);
});

test("efflux concentrations remain separate and the growth-rate scatter is included", () => {
  const images = reports[5].sections.flatMap(s => s.blocks).filter(b => b.type === "image");
  const concentrations = images.filter(image => image.sourceCell === 8);
  assert.equal(concentrations.length, 12);
  assert.equal(new Set(concentrations.map(image => image.src)).size, 12);
  assert.equal(new Set(concentrations.map(image => image.alt)).size, 12);
  assert.equal(images.filter(image => image.sourceCell === 17).length, 1);
  assert.equal(images.filter(image => image.sourceCell === 27).length, 1);
  assert.ok(images.every(image => image.code?.trim()), "Each plot has its relevant Python code");
});

test("saved QIIME visualizations have static figures with the original display code", () => {
  const images = reports[4].sections.flatMap(s => s.blocks)
    .filter(b => b.type === "image" && b.src.includes("lab-5-qiime-"));
  assert.equal(new Set(images.map(image => image.src)).size, 6);
  for (const cell of [23, 25, 27]) {
    assert.ok(images.some(image => image.sourceCell === cell && image.code?.includes("Visualization.load(")));
  }
});

test("Python highlighting includes both palettes and escapes markup in code", async () => {
  const html = await highlightPython('import numpy as np\n# comment\nvalue = 2.5\nprint("<script>alert(1)</script>")');
  assert.ok(html.includes("--shiki-light:"));
  assert.ok(html.includes("--shiki-dark:"));
  assert.ok(!html.includes("<script>"));
  assert.ok(new Set([...html.matchAll(/--shiki-light:([^;\"]+)/g)].map(m => m[1])).size >= 4);
});
