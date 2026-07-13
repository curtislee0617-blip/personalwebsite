import sharp from "sharp";

const variants = [
  {
    boatless: "public/contact-cities-pixel-art-day-boatless-v1.png",
    foreground: "public/contact-cities-pixel-art-day-foreground-v1.png",
    source: "public/contact-cities-pixel-art-day-from-night-v1.png",
    outputBase: "public/contact-cities-pixel-art-day-foreground-boatless-v1.png",
    outputBoat: "public/contact-harbour-boat-day-v1.png",
    matte: [254, 250, 237],
    isBackground: (red, green, blue) =>
      red >= 238 && green >= 233 && blue >= 210
      && red >= green && green >= blue && red - blue <= 42,
  },
  {
    boatless: "public/contact-cities-pixel-art-night-boatless-v1.png",
    foreground: "public/contact-cities-pixel-art-night-foreground-v1.png",
    source: "public/contact-cities-pixel-art-night-v2.png",
    outputBase: "public/contact-cities-pixel-art-night-foreground-boatless-v1.png",
    outputBoat: "public/contact-harbour-boat-night-v1.png",
    matte: [0, 20, 52],
    isBackground: (red, green, blue) =>
      red <= 45 && green <= 70 && blue <= 120
      && green >= red + 2 && blue >= green + 10,
  },
];

const canonicalWidth = 1916;
const canonicalHeight = 821;

const region = {
  bottom: 0.722,
  left: 0.12,
  right: 0.21,
  top: 0.545,
};

const boatPolygons = [
  // Port sail and flag.
  [[0.125, 0.67], [0.125, 0.615], [0.13, 0.604], [0.13, 0.584], [0.146, 0.602], [0.146, 0.67]],
  [[0.134, 0.59], [0.134, 0.57], [0.148, 0.588]],
  // Main sail.
  [[0.15, 0.67], [0.15, 0.61], [0.156, 0.597], [0.156, 0.575], [0.165, 0.557], [0.178, 0.597], [0.178, 0.67]],
  // Starboard sail.
  [[0.179, 0.67], [0.179, 0.626], [0.186, 0.614], [0.19, 0.598], [0.202, 0.62], [0.202, 0.67]],
  // Hull and cabin.
  [[0.119, 0.665], [0.129, 0.699], [0.143, 0.718], [0.188, 0.718], [0.204, 0.697], [0.21, 0.665], [0.199, 0.658], [0.19, 0.681], [0.139, 0.681], [0.129, 0.658]],
  [[0.148, 0.657], [0.181, 0.657], [0.181, 0.69], [0.148, 0.69]],
  // Three masts.
  [[0.143, 0.574], [0.147, 0.574], [0.147, 0.682], [0.143, 0.682]],
  [[0.176, 0.552], [0.18, 0.552], [0.18, 0.682], [0.176, 0.682]],
  [[0.2, 0.592], [0.204, 0.592], [0.204, 0.682], [0.2, 0.682]],
];

function pointInPolygon(x, y, polygon) {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const [currentX, currentY] = polygon[index];
    const [previousX, previousY] = polygon[previous];
    if (
      (currentY > y) !== (previousY > y)
      && x < (previousX - currentX) * (y - currentY) / (previousY - currentY) + currentX
    ) inside = !inside;
  }
  return inside;
}

function registerReplacement(source, replacement, width, height, variant) {
  const sample = (buffer, x, y, channel) => buffer[(y * width + x) * 3 + channel];
  let best = { offsetX: 0, offsetY: 0, score: Number.POSITIVE_INFINITY };

  for (let offsetY = -8; offsetY <= 8; offsetY += 1) {
    for (let offsetX = -8; offsetX <= 8; offsetX += 1) {
      let score = 0;
      let samples = 0;

      for (let y = 230; y < 690; y += 2) {
        for (let x = 20; x < 540; x += 2) {
          if (
            x >= width * 0.105 && x <= width * 0.225
            && y >= height * 0.515 && y <= height * 0.75
          ) continue;
          const replacementX = x + offsetX;
          const replacementY = y + offsetY;
          if (
            replacementX < 0 || replacementX >= width
            || replacementY < 0 || replacementY >= height
          ) continue;

          const sourceColour = [
            sample(source, x, y, 0),
            sample(source, x, y, 1),
            sample(source, x, y, 2),
          ];
          const replacementColour = [
            sample(replacement, replacementX, replacementY, 0),
            sample(replacement, replacementX, replacementY, 1),
            sample(replacement, replacementX, replacementY, 2),
          ];
          if (
            variant.isBackground(...sourceColour)
            && variant.isBackground(...replacementColour)
          ) continue;

          score += Math.min(80, Math.max(
            Math.abs(sourceColour[0] - replacementColour[0]),
            Math.abs(sourceColour[1] - replacementColour[1]),
            Math.abs(sourceColour[2] - replacementColour[2]),
          ));
          samples += 1;
        }
      }

      const average = samples ? score / samples : Number.POSITIVE_INFINITY;
      if (average < best.score) best = { offsetX, offsetY, score: average };
    }
  }

  const registered = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const sourceX = x + best.offsetX;
      const sourceY = y + best.offsetY;
      const target = (y * width + x) * 3;
      if (sourceX < 0 || sourceX >= width || sourceY < 0 || sourceY >= height) {
        registered[target] = variant.matte[0];
        registered[target + 1] = variant.matte[1];
        registered[target + 2] = variant.matte[2];
        continue;
      }
      const sourceOffset = (sourceY * width + sourceX) * 3;
      registered[target] = replacement[sourceOffset];
      registered[target + 1] = replacement[sourceOffset + 1];
      registered[target + 2] = replacement[sourceOffset + 2];
    }
  }

  return { best, registered };
}

function createBoatEraseMask(foreground, width, height) {
  const pixelCount = width * height;
  const mask = new Uint8Array(pixelCount);
  const minimumX = Math.floor(width * region.left);
  const maximumX = Math.ceil(width * region.right);
  const minimumY = Math.floor(height * region.top);
  const maximumY = Math.ceil(height * region.bottom);

  for (let y = minimumY; y <= maximumY; y += 1) {
    for (let x = minimumX; x <= maximumX; x += 1) {
      const index = y * width + x;
      const rgbaOffset = index * 4;
      if (foreground[rgbaOffset + 3] === 0) continue;
      const normalizedX = x / width;
      const normalizedY = y / height;
      if (boatPolygons.some((polygon) => pointInPolygon(normalizedX, normalizedY, polygon))) {
        mask[index] = 1;
      }
    }
  }

  // The rigging uses a few nearly black edge pixels just outside the hand-drawn
  // silhouette. Expand only the erase mask so those pixels cannot remain as a
  // stationary shadow when the transparent boat sprite moves.
  const expanded = mask.slice();
  const radius = 5;
  for (let index = 0; index < pixelCount; index += 1) {
    if (!mask[index]) continue;
    const x = index % width;
    const y = Math.floor(index / width);
    for (let offsetY = -radius; offsetY <= radius; offsetY += 1) {
      for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
        const neighbourX = x + offsetX;
        const neighbourY = y + offsetY;
        if (
          neighbourX < minimumX || neighbourX > maximumX
          || neighbourY < minimumY || neighbourY > maximumY
        ) continue;
        expanded[neighbourY * width + neighbourX] = 1;
      }
    }
  }

  return expanded;
}

function createBoatSpriteMask(source, replacement, foreground, width, height) {
  const pixelCount = width * height;
  const candidate = new Uint8Array(pixelCount);
  const seed = new Uint8Array(pixelCount);
  const minimumX = Math.floor(width * region.left);
  const maximumX = Math.ceil(width * 0.204);
  const minimumY = Math.floor(height * region.top);
  const maximumY = Math.ceil(height * region.bottom);

  for (let y = minimumY; y <= maximumY; y += 1) {
    for (let x = minimumX; x <= maximumX; x += 1) {
      const index = y * width + x;
      const rgbOffset = index * 3;
      const rgbaOffset = index * 4;
      const red = source[rgbOffset];
      const green = source[rgbOffset + 1];
      const blue = source[rgbOffset + 2];
      const difference = Math.max(
        Math.abs(red - replacement[rgbOffset]),
        Math.abs(green - replacement[rgbOffset + 1]),
        Math.abs(blue - replacement[rgbOffset + 2]),
      );
      if (foreground[rgbaOffset + 3] === 0 || difference < 8) continue;

      candidate[index] = 1;
      const sailRed = red >= 92 && green <= 85 && blue <= 80
        && red >= green * 1.4 && red >= blue * 1.22;
      const hullBrown = y >= height * 0.655
        && red >= 38 && green <= 100 && blue <= 70
        && red >= green * 1.18 && green >= blue * 1.04;
      if (difference >= 24 && (sailRed || hullBrown)) seed[index] = 1;
    }
  }

  const mask = seed.slice();
  for (let index = 0; index < pixelCount; index += 1) {
    if (!seed[index]) continue;
    const x = index % width;
    const y = Math.floor(index / width);
    for (let offsetY = -3; offsetY <= 3; offsetY += 1) {
      for (let offsetX = -3; offsetX <= 3; offsetX += 1) {
        const neighbourX = x + offsetX;
        const neighbourY = y + offsetY;
        if (
          neighbourX < minimumX || neighbourX > maximumX
          || neighbourY < minimumY || neighbourY > maximumY
        ) continue;
        const neighbour = neighbourY * width + neighbourX;
        if (candidate[neighbour]) mask[neighbour] = 1;
      }
    }
  }

  return mask;
}

for (const variant of variants) {
  const foregroundResult = await sharp(variant.foreground)
    .resize(canonicalWidth, canonicalHeight, { fit: "fill", kernel: "nearest" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = foregroundResult.info;
  const source = await sharp(variant.source)
    .resize(width, height, { fit: "fill", kernel: "nearest" })
    .removeAlpha()
    .raw()
    .toBuffer();
  const replacementSource = await sharp(variant.boatless)
    .resize(width, height, { fit: "fill", kernel: "nearest" })
    .removeAlpha()
    .raw()
    .toBuffer();
  const { best, registered: replacement } = registerReplacement(
    source,
    replacementSource,
    width,
    height,
    variant,
  );
  console.log(`${variant.outputBoat}: registered boatless source at ${best.offsetX}, ${best.offsetY}`);
  const foreground = foregroundResult.data;
  const eraseMask = createBoatEraseMask(foreground, width, height);
  const spriteMask = createBoatSpriteMask(source, replacement, foreground, width, height);
  const boatlessForeground = Buffer.from(foreground);
  const boat = Buffer.alloc(width * height * 4);

  for (let index = 0; index < width * height; index += 1) {
    const rgbOffset = index * 3;
    const rgbaOffset = index * 4;

    if (spriteMask[index]) {
      boat[rgbaOffset] = foreground[rgbaOffset];
      boat[rgbaOffset + 1] = foreground[rgbaOffset + 1];
      boat[rgbaOffset + 2] = foreground[rgbaOffset + 2];
      boat[rgbaOffset + 3] = foreground[rgbaOffset + 3];
    }

    if (!eraseMask[index]) continue;

    const red = replacement[rgbOffset];
    const green = replacement[rgbOffset + 1];
    const blue = replacement[rgbOffset + 2];
    boatlessForeground[rgbaOffset] = red;
    boatlessForeground[rgbaOffset + 1] = green;
    boatlessForeground[rgbaOffset + 2] = blue;
    boatlessForeground[rgbaOffset + 3] = variant.isBackground(red, green, blue) ? 0 : 255;
  }

  await Promise.all([
    sharp(boatlessForeground, { raw: { width, height, channels: 4 } })
      .png({ compressionLevel: 9 })
      .toFile(variant.outputBase),
    sharp(boat, { raw: { width, height, channels: 4 } })
      .png({ compressionLevel: 9 })
      .toFile(variant.outputBoat),
  ]);
}
