import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const playlistJsonPath = process.argv[2] ?? "/tmp/youtube-food-playlist/000-PLbOskrmXg_jy2KziGo3Ai6SKuHntUmojH.info.json";
const outputPath = process.argv[3] ?? "/tmp/youtube-food-playlist-analysis.json";
const thumbnailDirectory = path.join(projectRoot, "public", "recipes", "youtube-saved");
const concurrency = 6;

function findJsonObject(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) return null;
  const start = source.indexOf("{", markerIndex + marker.length);
  if (start < 0) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === "\"") inString = false;
      continue;
    }
    if (character === "\"") inString = true;
    else if (character === "{") depth += 1;
    else if (character === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  return null;
}

function parsePlayerResponse(source) {
  const markers = [
    "var ytInitialPlayerResponse =",
    "ytInitialPlayerResponse =",
    "\"playerResponse\":",
  ];
  for (const marker of markers) {
    const raw = findJsonObject(source, marker);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.videoDetails) return parsed;
    } catch {
      // Try the next copy embedded in the page.
    }
  }
  return null;
}

function pickCaptionTrack(playerResponse) {
  const renderer = playerResponse?.captions?.playerCaptionsTracklistRenderer;
  const tracks = renderer?.captionTracks ?? [];
  if (tracks.length === 0) return null;

  const english =
    tracks.find((track) => track.languageCode === "en" && track.kind !== "asr") ??
    tracks.find((track) => track.languageCode?.startsWith("en") && track.kind !== "asr") ??
    tracks.find((track) => track.languageCode === "en") ??
    tracks.find((track) => track.languageCode?.startsWith("en"));
  if (english) return { track: english, translateToEnglish: false };

  const manual = tracks.find((track) => track.kind !== "asr") ?? tracks[0];
  const canTranslate = (renderer.translationLanguages ?? []).some((language) => language.languageCode === "en");
  return { track: manual, translateToEnglish: canTranslate };
}

function transcriptFromJson3(payload) {
  const paragraphs = [];
  for (const event of payload?.events ?? []) {
    const text = (event.segs ?? []).map((segment) => segment.utf8 ?? "").join("");
    const clean = text
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!clean || clean === "[Music]" || clean === "[Applause]") continue;
    paragraphs.push({
      startSeconds: Number(((event.tStartMs ?? 0) / 1000).toFixed(2)),
      text: clean,
    });
  }
  return paragraphs;
}

function externalLinks(description) {
  return [...new Set(
    (description.match(/https?:\/\/[^\s<>()\]]+/g) ?? [])
      .map((url) => url.replace(/[.,;!?]+$/, ""))
      .filter((url) => !/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\//i.test(url)),
  )];
}

async function fetchWithRetry(url, options, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      lastError = new Error(`${response.status} ${response.statusText}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 500));
  }
  throw lastError;
}

async function downloadThumbnail(videoId) {
  const output = path.join(thumbnailDirectory, `${videoId}.jpg`);
  try {
    await fs.access(output);
    return `/recipes/youtube-saved/${videoId}.jpg`;
  } catch {
    const response = await fetchWithRetry(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);
    await fs.writeFile(output, Buffer.from(await response.arrayBuffer()));
    return `/recipes/youtube-saved/${videoId}.jpg`;
  }
}

async function extractVideo(entry, index) {
  const videoId = entry.id;
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const page = await fetchWithRetry(watchUrl, {
    headers: {
      "accept-language": "en-US,en;q=0.9",
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/150 Safari/537.36",
    },
  }).then((response) => response.text());
  const playerResponse = parsePlayerResponse(page);
  if (!playerResponse) throw new Error("No player response found");

  const details = playerResponse.videoDetails ?? {};
  const microformat = playerResponse.microformat?.playerMicroformatRenderer ?? {};
  const captionSelection = pickCaptionTrack(playerResponse);
  let transcript = [];
  let transcriptLanguage;
  let transcriptTranslated = false;
  if (captionSelection?.track?.baseUrl) {
    const separator = captionSelection.track.baseUrl.includes("?") ? "&" : "?";
    const translated = captionSelection.translateToEnglish ? "&tlang=en" : "";
    const transcriptUrl = `${captionSelection.track.baseUrl}${separator}fmt=json3${translated}`;
    try {
      const transcriptResponse = await fetchWithRetry(transcriptUrl);
      transcript = transcriptFromJson3(await transcriptResponse.json());
      transcriptLanguage = captionSelection.track.languageCode;
      transcriptTranslated = captionSelection.translateToEnglish;
    } catch (error) {
      console.warn(`[${index + 1}] ${videoId}: transcript unavailable (${error.message})`);
    }
  }

  const thumbnail = await downloadThumbnail(videoId);
  console.log(`[${index + 1}] ${details.title ?? entry.title} — ${transcript.length} caption segments`);
  return {
    playlistIndex: index + 1,
    videoId,
    title: details.title ?? entry.title,
    channel: details.author ?? entry.channel,
    description: details.shortDescription ?? entry.description ?? "",
    durationSeconds: Number(details.lengthSeconds ?? entry.duration ?? 0),
    publishDate: microformat.publishDate ?? entry.upload_date ?? null,
    uploadDate: microformat.uploadDate ?? entry.upload_date ?? null,
    sourceUrl: watchUrl,
    thumbnail,
    externalLinks: externalLinks(details.shortDescription ?? ""),
    transcriptLanguage: transcriptLanguage ?? null,
    transcriptTranslated,
    transcript,
  };
}

async function mapWithConcurrency(values, limit, callback) {
  const results = new Array(values.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      try {
        results[index] = await callback(values[index], index);
      } catch (error) {
        console.warn(`[${index + 1}] ${values[index]?.id ?? "unknown"}: ${error.message}`);
        results[index] = {
          playlistIndex: index + 1,
          videoId: values[index]?.id,
          title: values[index]?.title ?? "Unavailable video",
          channel: values[index]?.channel ?? "",
          description: values[index]?.description ?? "",
          sourceUrl: values[index]?.webpage_url ?? values[index]?.url ?? "",
          thumbnail: values[index]?.id ? `/recipes/youtube-saved/${values[index].id}.jpg` : null,
          externalLinks: [],
          transcript: [],
          extractionError: error.message,
        };
      }
    }
  }

  await Promise.all(Array.from({ length: limit }, () => worker()));
  return results;
}

const playlist = JSON.parse(await fs.readFile(playlistJsonPath, "utf8"));
const entries = (playlist.entries ?? []).filter((entry) => entry?.id);
await fs.mkdir(thumbnailDirectory, { recursive: true });
const videos = await mapWithConcurrency(entries, concurrency, extractVideo);
await fs.writeFile(outputPath, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  playlistId: playlist.id,
  playlistTitle: playlist.title,
  videos,
}, null, 2)}\n`);
console.log(`Wrote ${videos.length} videos to ${outputPath}`);
