import assert from "node:assert/strict";
import fs from "node:fs";
import { registerHooks } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (!specifier.startsWith("@/")) return nextResolve(specifier, context);
    const unresolved = path.join(repositoryRoot, specifier.slice(2));
    const resolved = path.extname(unresolved) ? unresolved : `${unresolved}.ts`;
    return { shortCircuit: true, url: pathToFileURL(resolved).href };
  },
  load(url, context, nextLoad) {
    if (!url.endsWith(".json")) return nextLoad(url, context);
    const source = fs.readFileSync(fileURLToPath(url), "utf8");
    return { format: "module", shortCircuit: true, source: `export default ${source};` };
  },
});

const nmr = await import("../lib/nmr-spectrum.ts");
const ir = await import("../lib/ir-spectrum.ts");
const { compounds, calculateCompound } = await import("../lib/compound-properties.ts");
const { generateVleDiagram } = await import("../lib/vle.ts");
const { computeVlePhaseSplit } = await import("../lib/vle-split.ts");
const requirements = await import("../data/caltech-requirements.ts");

const defaultVleParameters = {
  a12: 0,
  a21: 0,
  alpha: 0.3,
  lambda12: 1,
  lambda21: 1,
  kij: 0,
};

function approximately(actual, expected, tolerance, message) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${message}: expected ${expected} ± ${tolerance}, received ${actual}`,
  );
}

test("Spinsolve processing scripts retain both phase orders and use the app FFT sign convention", () => {
  const processing = nmr.parseProcessingScript("Phase(2.2e0, -1.5E+1); LineBroaden(.2, 0);");
  assert.deepEqual(processing, {
    phase0Degrees: 2.2,
    phase1Degrees: -15,
    lineBroadeningHz: 0.2,
  });
  const correction = nmr.spinsolvePhaseCorrection(processing);
  approximately(correction.phase0Degrees, -2.2, 1e-12, "Spinsolve zero-order phase sign");
  assert.equal(correction.phase1Degrees, 15);
  approximately(
    nmr.spinsolvePhaseCorrection({ phase0Degrees: 255.3 }).phase0Degrees,
    104.7,
    1e-12,
    "equivalent phase normalization",
  );
});

test("NMR integration clips and interpolates exact user-selected boundaries", () => {
  const triangle = [
    { shift: 0, intensity: 0 },
    { shift: 1, intensity: 1 },
    { shift: 2, intensity: 0 },
  ];
  approximately(nmr.integrateNmrRegion(triangle, 0.5, 1.5), 0.75, 1e-12, "clipped triangular area");
  approximately(nmr.integrateNmrRegion([...triangle].reverse(), 1.5, 0.5), 0.75, 1e-12, "order-independent area");
});

test("CH9 J values and solvent referencing use the correct frequency and offset math", () => {
  const observationMHz = 80.3118401672691;
  approximately(
    nmr.couplingConstantHz(3.6035867, 3.5161894, "ppm", observationMHz),
    7.019037988650878,
    1e-12,
    "CH9 quartet spacing",
  );
  approximately(
    nmr.couplingConstantHz(1.1393610, 1.0529136, "ppm", observationMHz),
    6.9427497716759925,
    1e-12,
    "CH9 triplet spacing",
  );
  approximately(nmr.solventReferenceOffset(2.5548183, 2.5), -0.0548183, 1e-12, "DMSO-d6 reference");
  assert.equal(nmr.couplingConstantHz(100, 93, "hz", 0), 7);
});

test("automatic NMR phase refinement terminates inside its documented bounds", () => {
  const pointCount = 128;
  const dwellTime = 0.001;
  const phase = 38 * Math.PI / 180;
  const time = Float32Array.from({ length: pointCount }, (_, index) => index * dwellTime);
  const real = new Float64Array(pointCount);
  const imaginary = new Float64Array(pointCount);
  for (let index = 0; index < pointCount; index += 1) {
    const envelope = Math.exp(-12 * time[index]);
    const angle = 2 * Math.PI * 83 * time[index] + phase;
    real[index] = envelope * Math.cos(angle);
    imaginary[index] = envelope * Math.sin(angle);
  }
  const correction = nmr.estimatePhaseCorrection({ time, real, imaginary, pointCount, dwellTime });
  assert.ok(Number.isFinite(correction.phase0Degrees));
  assert.ok(Number.isFinite(correction.phase1Degrees));
  assert.ok(correction.phase0Degrees >= -180 && correction.phase0Degrees < 180);
  assert.ok(Math.abs(correction.phase1Degrees) <= 370);
});

test("IR parsing ignores blank spreadsheet cells and keeps the latest duplicate point", () => {
  assert.deepEqual(
    ir.normaliseSpectrumRows([
      ["", ""],
      ["4000", "90"],
      [null, "85"],
      ["3900", "80"],
      ["3900", "81"],
    ]),
    [
      { wavenumber: 3900, value: 81 },
      { wavenumber: 4000, value: 90 },
    ],
  );
});

test("IR transmittance/absorbance conversion round-trips and peak direction is correct", () => {
  for (const transmittance of [0.1, 5, 50, 99.5]) {
    const absorbance = ir.convertSpectrumValue(transmittance, "transmittance", "absorbance");
    approximately(
      ir.convertSpectrumValue(absorbance, "absorbance", "transmittance"),
      transmittance,
      1e-10,
      "IR mode round-trip",
    );
  }
  const points = [
    { wavenumber: 1000, value: 95 },
    { wavenumber: 1100, value: 70 },
    { wavenumber: 1200, value: 95 },
  ];
  assert.equal(ir.guessSpectrumMode(points), "transmittance");
  assert.deepEqual(ir.detectSpectrumPeaks(points, "transmittance", 20, 1, 5).map((peak) => peak.wavenumber), [1100]);
});

test("ideal P-x-y obeys Raoult's law at every point", () => {
  const benzene = compounds.find((compound) => compound.name === "Benzene");
  const toluene = compounds.find((compound) => compound.name === "Toluene");
  assert.ok(benzene && toluene);
  const temperature = 350;
  const result = generateVleDiagram(benzene, toluene, "pxy", temperature, "ideal", defaultVleParameters);
  assert.equal(result.failed, 0);
  assert.equal(result.points.length, 41);
  const p1 = Math.exp(benzene.antoineA - benzene.antoineB / (temperature + benzene.antoineC));
  const p2 = Math.exp(toluene.antoineA - toluene.antoineB / (temperature + toluene.antoineC));
  for (const point of result.points) {
    const pressure = point.x * p1 + (1 - point.x) * p2;
    approximately(point.value, pressure, 1e-12, "Raoult bubble pressure");
    approximately(point.y, point.x * p1 / pressure, 1e-12, "Raoult vapour composition");
  }
});

test("ideal T-x-y pure-component endpoints invert the Antoine equation", () => {
  const benzene = compounds.find((compound) => compound.name === "Benzene");
  const toluene = compounds.find((compound) => compound.name === "Toluene");
  assert.ok(benzene && toluene);
  const pressure = 1;
  const result = generateVleDiagram(benzene, toluene, "txy", pressure, "ideal", defaultVleParameters);
  assert.equal(result.failed, 0);
  assert.equal(result.points.length, 41);
  const expectedBenzene = benzene.antoineB / (benzene.antoineA - Math.log(pressure)) - benzene.antoineC;
  const expectedToluene = toluene.antoineB / (toluene.antoineA - Math.log(pressure)) - toluene.antoineC;
  approximately(result.points[0].value, expectedToluene, 1e-10, "pure toluene endpoint");
  approximately(result.points.at(-1).value, expectedBenzene, 1e-10, "pure benzene endpoint");
});

test("every VLE model returns bounded, finite composition diagrams for a standard binary", () => {
  const benzene = compounds.find((compound) => compound.name === "Benzene");
  const toluene = compounds.find((compound) => compound.name === "Toluene");
  assert.ok(benzene && toluene);
  const parameters = { ...defaultVleParameters, a12: 0.3, a21: -0.1, lambda12: 1.2, lambda21: 0.8 };
  for (const model of ["ideal", "nrtl", "wilson", "van-der-waals", "peng-robinson"]) {
    for (const [type, fixedValue] of [["pxy", 350], ["txy", 1]]) {
      const result = generateVleDiagram(benzene, toluene, type, fixedValue, model, parameters);
      assert.equal(result.failed, 0, `${model} ${type} should converge`);
      assert.equal(result.points.length, 41, `${model} ${type} should cover the full composition axis`);
      for (const point of result.points) {
        assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y) && Number.isFinite(point.value));
        assert.ok(point.x >= 0 && point.x <= 1);
        assert.ok(point.y >= 0 && point.y <= 1);
        assert.ok(point.value > 0);
      }
    }
  }
});

test("VLE phase split satisfies the lever-rule material balance", () => {
  const points = [
    { x: 0, y: 0, value: 100 },
    { x: 0.25, y: 0.55, value: 90 },
    { x: 0.5, y: 0.75, value: 80 },
    { x: 0.75, y: 0.9, value: 70 },
    { x: 1, y: 1, value: 60 },
  ];
  const split = computeVlePhaseSplit(points, "txy", 0.6, 85);
  assert.ok(split && split.phase === "two-phase" && split.xStar !== null && split.yStar !== null);
  approximately(
    (1 - split.beta) * split.xStar + split.beta * split.yStar,
    split.z,
    1e-12,
    "overall-composition material balance",
  );
  assert.ok(split.beta >= 0 && split.beta <= 1);
});

test("compound-property results preserve reduced-state, density, and fugacity identities", () => {
  const carbonDioxide = compounds.find((compound) => compound.name === "Carbon dioxide");
  assert.ok(carbonDioxide);
  const temperature = 350;
  const pressure = 20;
  const result = calculateCompound(carbonDioxide, temperature, pressure);
  assert.ok(result);
  approximately(result.reducedTemperature, temperature / carbonDioxide.criticalTemperature, 1e-12, "reduced temperature");
  approximately(result.reducedPressure, pressure / carbonDioxide.criticalPressure, 1e-12, "reduced pressure");
  approximately(result.density * result.molarVolume, carbonDioxide.molecularWeight, 1e-10, "density-volume identity");
  approximately(result.fugacity, result.fugacityCoefficient * pressure, 1e-12, "fugacity identity");
  assert.ok(result.compressibility > 0 && Number.isFinite(result.compressibility));
});

test("compound properties converge to ideal-gas behaviour at low pressure", () => {
  const carbonDioxide = compounds.find((compound) => compound.name === "Carbon dioxide");
  assert.ok(carbonDioxide);
  const result = calculateCompound(carbonDioxide, 350, 0.001);
  assert.ok(result, "low-pressure state should remain calculable");
  approximately(result.compressibility, 1, 1e-4, "low-pressure compressibility");
  approximately(result.fugacityCoefficient, 1, 1e-4, "low-pressure fugacity coefficient");
});

test("course-planner catalog has unique IDs and valid category routing", () => {
  const collections = [
    ["major", requirements.majors],
    ["category", requirements.requirementCategories],
    ["requirement", requirements.requirementTemplates],
    ["integrated-core requirement", requirements.integratedCoreRequirementTemplates],
  ];
  for (const [name, collection] of collections) {
    assert.equal(new Set(collection.map((item) => item.id)).size, collection.length, `${name} IDs must be unique`);
  }

  const categoryIds = new Set(requirements.requirementCategories.map((category) => category.id));
  for (const template of [...requirements.requirementTemplates, ...requirements.integratedCoreRequirementTemplates]) {
    assert.ok(categoryIds.has(template.categoryId), `${template.id} refers to missing category ${template.categoryId}`);
  }

  for (const major of requirements.majors) {
    const categories = requirements.categoriesForMajors([major.id]);
    const templates = requirements.templatesForMajors([major.id]);
    assert.ok(categories.length > 0, `${major.id} must have visible categories`);
    assert.ok(templates.length > 0, `${major.id} must have visible requirements`);
    const visible = new Set(categories.map((category) => category.id));
    assert.ok(templates.every((template) => visible.has(template.categoryId)), `${major.id} has an invalid requirement route`);
  }
});
