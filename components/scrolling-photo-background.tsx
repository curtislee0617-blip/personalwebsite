/* eslint-disable @next/next/no-img-element */

"use client";

import { useEffect, useMemo, useState } from "react";

const placeholderColors = [
  ["#d8e4dc", "#94aa9c"], ["#ead8cb", "#c58f74"], ["#dce4ed", "#8fa7bd"],
  ["#e7dfbd", "#b7a86f"], ["#ded7e9", "#9f91b2"], ["#d7e5e8", "#7fa1a7"],
] as const;

const logoPhoto = "/logos/caltech-collage-orange.png";

function mixNumber(value: number) {
  let mixed = value + 0x6d2b79f5;
  mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
  mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
  return (mixed ^ (mixed >>> 14)) >>> 0;
}

function photoOrderScore(name: string) {
  let hash = 2166136261;
  for (const character of name) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function blockDistance(first: number, second: number, rows: number) {
  const firstRow = first % rows;
  const secondRow = second % rows;
  const firstColumn = Math.floor(first / rows);
  const secondColumn = Math.floor(second / rows);
  return Math.max(Math.abs(firstRow - secondRow), Math.abs(firstColumn - secondColumn));
}

function createLogoPlacements(itemCount: number, rows: number) {
  const candidates = Array.from({ length: itemCount }, (_, index) => index).sort(
    (first, second) => mixNumber(first) - mixNumber(second),
  );
  const placements: number[] = [];
  const priorTargetCount = Math.max(
    1,
    Math.ceil(Math.ceil(Math.ceil(itemCount / 13) * (2 / 3)) * (2 / 3) * (2 / 3)),
  );
  const targetCount = Math.max(1, Math.floor(priorTargetCount * 0.65));
  const rowCounts = Array.from({ length: rows }, () => 0);
  const basePerRow = Math.floor(targetCount / rows);
  const extraRows = targetCount % rows;
  const rowPriority = Array.from({ length: rows }, (_, row) => row).sort(
    (first, second) => mixNumber(itemCount + first * 37) - mixNumber(itemCount + second * 37),
  );
  const rowTargets = Array.from({ length: rows }, () => basePerRow);

  for (let index = 0; index < extraRows; index += 1) {
    rowTargets[rowPriority[index]] += 1;
  }

  for (const position of candidates) {
    const row = position % rows;
    if (rowCounts[row] >= rowTargets[row]) continue;

    const allowed = placements.every((existingPosition) =>
      blockDistance(position, existingPosition, rows) > 3,
    );

    if (allowed) {
      placements.push(position);
      rowCounts[row] += 1;
    }

    if (placements.length >= targetCount) break;
  }

  if (placements.length < targetCount) {
    for (const position of candidates) {
      if (placements.includes(position)) continue;

      const allowed = placements.every((existingPosition) =>
        blockDistance(position, existingPosition, rows) > 3,
      );

      if (allowed) placements.push(position);
      if (placements.length >= targetCount) break;
    }
  }

  return placements.sort((first, second) => mixNumber(first + 211) - mixNumber(second + 211));
}

export function ScrollingPhotoBackground({
  className = "",
  photos,
}: {
  className?: string;
  photos: string[];
}) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [itemCount, setItemCount] = useState(120);
  const [rowCount, setRowCount] = useState(8);
  const orderedPhotos = useMemo(
    () => [...photos].sort((first, second) => photoOrderScore(first) - photoOrderScore(second)),
    [photos],
  );
  const rootClassName = `home-photo-grid ${className}`.trim();

  useEffect(() => {
    const updateDensity = () => {
      const mobile = window.matchMedia("(max-width: 639px)").matches;
      setIsMobile(mobile);
      const rows = mobile ? 5 : 8;
      const columnWidth = mobile
        ? Math.max(72, window.innerHeight * 0.15)
        : Math.max(46, (window.innerHeight - 73) * 0.075);
      const columns = Math.ceil(window.innerWidth / columnWidth) + (mobile ? 3 : 2);
      setRowCount(rows);
      setItemCount(rows * columns);
    };

    updateDensity();
    window.addEventListener("resize", updateDensity);
    return () => window.removeEventListener("resize", updateDensity);
  }, []);

  if (isMobile === null) return <div className={rootClassName} aria-hidden="true" />;

  if (isMobile) {
    return (
      <div className={rootClassName} aria-hidden="true">
        <div className="mobile-photo-collage" />
      </div>
    );
  }

  const items = Array.from({ length: itemCount }, (_, index) => ({
    photo: orderedPhotos.length ? orderedPhotos[index % orderedPhotos.length] : null,
    isLogo: false,
  }));

  for (const position of createLogoPlacements(itemCount, rowCount)) {
    items[position] = {
      photo: logoPhoto,
      isLogo: true,
    };
  }

  return (
    <div className={rootClassName} aria-hidden="true">
      <div className="photo-grid-rail">
        {[0, 1].map((copy) => (
          <div className="photo-grid-track" key={copy}>
            {items.map(({ photo, isLogo }, index) => {
              const shuffledIndex = (index * 47) % itemCount;
              const colors = placeholderColors[shuffledIndex % placeholderColors.length];
              const style = photo
                ? { backgroundImage: `url("${photo}")` }
                : { backgroundImage: `linear-gradient(145deg, ${colors[0]}, ${colors[1]})` };

              return (
                <span
                  className={`photo-grid-tile ${isLogo ? "is-logo" : ""} ${photo === logoPhoto ? "is-caltech-logo" : ""}`}
                  key={`${copy}-${index}`}
                >
                  {photo ? (
                    <img
                      alt=""
                      className="photo-grid-image"
                      decoding="async"
                      loading={copy === 0 && index < 18 ? "eager" : "lazy"}
                      src={photo}
                    />
                  ) : (
                    <span className="photo-grid-placeholder" style={style}>
                      {String(shuffledIndex + 1).padStart(3, "0")}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
