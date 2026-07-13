import sharp from "sharp";

const assets = [
  {
    input: "public/contact-cities-pixel-art-day-from-night-v1.png",
    output: "public/contact-cities-pixel-art-day-foreground-v1.png",
    matte: [254, 250, 237],
    isBackground(r, g, b) {
      return r >= 238 && g >= 233 && b >= 210 && r >= g && g >= b && r - b <= 42;
    },
  },
  {
    input: "public/contact-cities-pixel-art-night-v2.png",
    output: "public/contact-cities-pixel-art-night-foreground-v1.png",
    matte: [0, 20, 52],
    isBackground(r, g, b) {
      return r <= 45 && g <= 70 && b <= 120 && g >= r + 2 && b >= g + 10;
    },
  },
];

for (const asset of assets) {
  const { data, info } = await sharp(asset.input)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const pixelCount = width * height;
  const connectedBackground = new Uint8Array(pixelCount);
  const queue = new Uint32Array(pixelCount);
  let head = 0;
  let tail = 0;

  const canRemove = (index) => {
    const offset = index * channels;
    return asset.isBackground(data[offset], data[offset + 1], data[offset + 2]);
  };
  const enqueue = (index) => {
    if (connectedBackground[index] || !canRemove(index)) return;
    connectedBackground[index] = 1;
    queue[tail++] = index;
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x);
    enqueue((height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y += 1) {
    enqueue(y * width);
    enqueue(y * width + width - 1);
  }

  while (head < tail) {
    const index = queue[head++];
    const x = index % width;
    if (x > 0) enqueue(index - 1);
    if (x + 1 < width) enqueue(index + 1);
    if (index >= width) enqueue(index - width);
    if (index + width < pixelCount) enqueue(index + width);
  }

  // The source art was rendered against an opaque sky, so a binary cutout
  // leaves a light/dark matte around silhouettes. Restrict de-matting to a
  // three-pixel inner edge band so fine city details remain untouched.
  const edgeDistance = new Uint8Array(pixelCount);
  let edgeFrontier = new Uint32Array(pixelCount);
  let edgeLength = 0;
  const hasConnectedBackgroundNeighbour = (index) => {
    const x = index % width;
    const y = Math.floor(index / width);
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (dx === 0 && dy === 0) continue;
        const neighbourX = x + dx;
        const neighbourY = y + dy;
        if (neighbourX < 0 || neighbourY < 0 || neighbourX >= width || neighbourY >= height) continue;
        if (connectedBackground[neighbourY * width + neighbourX]) return true;
      }
    }
    return false;
  };

  for (let index = 0; index < pixelCount; index += 1) {
    if (connectedBackground[index] || !hasConnectedBackgroundNeighbour(index)) continue;
    edgeDistance[index] = 1;
    edgeFrontier[edgeLength++] = index;
  }

  for (let distance = 2; distance <= 3; distance += 1) {
    const nextFrontier = new Uint32Array(pixelCount);
    let nextLength = 0;
    for (let cursor = 0; cursor < edgeLength; cursor += 1) {
      const index = edgeFrontier[cursor];
      const x = index % width;
      const y = Math.floor(index / width);
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (dx === 0 && dy === 0) continue;
          const neighbourX = x + dx;
          const neighbourY = y + dy;
          if (neighbourX < 0 || neighbourY < 0 || neighbourX >= width || neighbourY >= height) continue;
          const neighbour = neighbourY * width + neighbourX;
          if (connectedBackground[neighbour] || edgeDistance[neighbour]) continue;
          edgeDistance[neighbour] = distance;
          nextFrontier[nextLength++] = neighbour;
        }
      }
    }
    edgeFrontier = nextFrontier;
    edgeLength = nextLength;
  }

  const rgba = Buffer.allocUnsafe(pixelCount * 4);
  for (let index = 0; index < pixelCount; index += 1) {
    const source = index * channels;
    const target = index * 4;
    if (connectedBackground[index]) {
      rgba[target] = 0;
      rgba[target + 1] = 0;
      rgba[target + 2] = 0;
      rgba[target + 3] = 0;
      continue;
    }

    const sourceColor = [data[source], data[source + 1], data[source + 2]];
    if (!edgeDistance[index]) {
      rgba[target] = sourceColor[0];
      rgba[target + 1] = sourceColor[1];
      rgba[target + 2] = sourceColor[2];
      rgba[target + 3] = 255;
      continue;
    }

    let alpha = 0;
    for (let channel = 0; channel < 3; channel += 1) {
      const color = sourceColor[channel];
      const matte = asset.matte[channel];
      const distance = color >= matte
        ? (color - matte) / Math.max(1, 255 - matte)
        : (matte - color) / Math.max(1, matte);
      alpha = Math.max(alpha, distance);
    }
    alpha = Math.max(0, Math.min(1, alpha));

    if (alpha < 0.024) {
      rgba[target] = 0;
      rgba[target + 1] = 0;
      rgba[target + 2] = 0;
      rgba[target + 3] = 0;
      continue;
    }

    for (let channel = 0; channel < 3; channel += 1) {
      const decontaminated = (sourceColor[channel] - asset.matte[channel] * (1 - alpha)) / alpha;
      rgba[target + channel] = Math.round(Math.max(0, Math.min(255, decontaminated)));
    }
    rgba[target + 3] = Math.round(alpha * 255);
  }

  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(asset.output);
}
