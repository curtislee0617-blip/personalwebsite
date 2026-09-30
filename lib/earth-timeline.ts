export type EarthTimeline = {
  instant: number;
  anchor: number;
  rate: number;
  start: number;
  end: number;
};

// One monotonic timeline is shared by the thumbnail clock and WebGL render.
// A day can contain 23, 24, or 25 hours, depending on the selected city's DST.
export function sampleEarthTimeline(timeline: EarthTimeline, timestamp: number) {
  const value = timeline.instant + Math.max(0, timestamp - timeline.anchor) * timeline.rate;
  if (timeline.rate === 0) return timeline.instant;
  const duration = timeline.end - timeline.start;
  return timeline.start + ((value - timeline.start) % duration + duration) % duration;
}
