import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUTPUT_DIRECTORY = path.join(ROOT, "public", "recipes", "sushi-guide", "species");
const MANIFEST_PATH = path.join(ROOT, "data", "sushi-species-images.json");

const species = [
  ["bluefin-tuna", "Pacific bluefin tuna"],
  ["skipjack-tuna", "Skipjack tuna"],
  ["atlantic-salmon", "Atlantic salmon"],
  ["greater-amberjack", "Greater amberjack"],
  ["japanese-amberjack", "Japanese amberjack"],
  ["yellowtail-amberjack", "Yellowtail amberjack"],
  ["striped-jack", "Pseudocaranx dentex"],
  ["horse-mackerel", "Japanese jack mackerel"],
  ["chub-mackerel", "Chub mackerel"],
  [
    "japanese-sardine",
    "Sardinops melanostictus",
    "File:Sardinops melanostictus.jpg",
    "OpenCage / Daiju Azuma; colour adjustment by Togabi",
  ],
  ["gizzard-shad", "Konosirus punctatus"],
  [
    "young-gizzard-shad-reference",
    "Konosirus punctatus",
    "File:コノシロ（熊本県）.jpg",
  ],
  ["pacific-saury", "Pacific saury"],
  ["japanese-halfbeak", "Hyporhamphus sajori"],
  ["red-seabream", "Red seabream"],
  [
    "young-red-seabream-reference",
    "Pagrus major",
    "File:Red sea bream.jpg",
  ],
  ["olive-flounder", "Olive flounder"],
  ["japanese-seabass", "Japanese sea bass"],
  ["alfonsino", "Splendid alfonsino"],
  ["spanish-mackerel", "Japanese Spanish mackerel"],
  ["japanese-whiting", "Japanese whiting"],
  ["threadsail-filefish", "Stephanolepis cirrhifer"],
  ["chicken-grunt", "Parapristipoma trilineatum"],
  ["takabe", "Labracoglossa argentiventris"],
  ["blackthroat-seaperch", "Doederleinia berycoides"],
  ["bluefin-gurnard", "Chelidonichthys spinosus"],
  ["tiger-puffer", "Takifugu rubripes"],
  ["bigfin-reef-squid", "Bigfin reef squid"],
  ["spear-squid", "Heterololigo bleekeri"],
  ["golden-cuttlefish", "Sepia esculenta"],
  ["firefly-squid", "Watasenia scintillans"],
  ["common-octopus", "Octopus sinensis", "File:Octopus sinensis.jpg", "Daiju Azuma"],
  ["kuruma-prawn", "Marsupenaeus japonicus"],
  ["northern-shrimp", "Pandalus borealis"],
  ["humpback-shrimp", "Pandalus hypsinotus"],
  ["japanese-mantis-shrimp", "Oratosquilla oratoria"],
  ["snow-crab", "Chionoecetes opilio"],
  ["ark-shell", "Anadara broughtonii"],
  ["yesso-scallop", "Mizuhopecten yessoensis"],
  ["disc-abalone", "Haliotis discus"],
  ["sakhalin-surf-clam", "Pseudocardium sachalinense"],
  ["gaper-clam", "Tresus keenae"],
  ["geoduck", "Panopea generosa"],
  ["japanese-cockle", "Fulvia mutica"],
  ["pen-shell", "Atrina pectinata"],
  ["chinese-surf-clam", "Mactra chinensis"],
  ["whitespotted-conger", "Conger myriaster"],
  ["japanese-eel", "Japanese eel"],
  ["green-sea-urchin", "Strongylocentrotus intermedius"],
  ["bafun-sea-urchin", "Hemicentrotus pulcherrimus"],
  ["kita-murasaki-sea-urchin", "Mesocentrotus nudus"],
  ["murasaki-sea-urchin", "Heliocidaris crassispina"],
  ["aka-sea-urchin", "Pseudocentrotus depressus"],
  ["california-red-sea-urchin", "Mesocentrotus franciscanus"],
  ["chum-salmon", "Chum salmon"],
  ["pacific-herring", "Pacific herring"],
  ["pacific-cod", "Pacific cod"],
  ["yellow-goosefish", "Lophius litulon"],
  ["nori", "Pyropia yezoensis"],
  ["wasabi", "Wasabi"],
  ["ginger", "Ginger"],
  ["rice", "Rice"],
  ["cucumber", "Cucumber"],
  ["bottle-gourd", "Calabash"],
];

const WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php";
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const USER_AGENT = "CurtisLeePersonalWebsite/1.0 (sushi guide image attribution)";

function plainText(value = "") {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function isReusableLicense(name = "") {
  const normalized = name.toLowerCase();
  return (
    normalized.startsWith("cc ") ||
    normalized.includes("creative commons") ||
    normalized.includes("public domain") ||
    normalized === "cc0" ||
    normalized.includes("gfdl")
  );
}

const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchWithRetry(url) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (response.status !== 429 && response.status < 500) return response;
    const retryAfter = Number(response.headers.get("retry-after"));
    await pause(Number.isFinite(retryAfter) ? retryAfter * 1000 : 1_500 * (attempt + 1));
  }
  return fetch(url, { headers: { "User-Agent": USER_AGENT } });
}

async function fetchJson(base, params) {
  const url = new URL(base);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetchWithRetry(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

async function wikipediaImage(articleTitle) {
  const payload = await fetchJson(WIKIPEDIA_API, {
    action: "query",
    format: "json",
    formatversion: "2",
    redirects: "1",
    prop: "pageimages",
    piprop: "name|thumbnail|original",
    pithumbsize: "1200",
    titles: articleTitle,
  });
  const page = payload.query?.pages?.[0];
  if (!page?.pageimage || !page?.thumbnail?.source) return null;
  return {
    articleTitle: page.title,
    fileTitle: `File:${page.pageimage}`,
    height: page.thumbnail.height,
    source: page.thumbnail.source,
    width: page.thumbnail.width,
  };
}

async function commonsMetadata(fileTitle) {
  const payload = await fetchJson(COMMONS_API, {
    action: "query",
    format: "json",
    formatversion: "2",
    iiprop: "url|extmetadata",
    prop: "imageinfo",
    titles: fileTitle,
  });
  const page = payload.query?.pages?.[0];
  const info = page?.imageinfo?.[0];
  if (!info) return null;
  const metadata = info.extmetadata ?? {};
  const license = plainText(metadata.LicenseShortName?.value);
  if (!isReusableLicense(license)) return null;
  return {
    artist: plainText(metadata.Artist?.value) || "Wikimedia Commons contributor",
    descriptionUrl: info.descriptionurl,
    license,
    licenseUrl: metadata.LicenseUrl?.value || info.descriptionurl,
    objectName: plainText(metadata.ObjectName?.value),
  };
}

async function commonsFileImage(fileTitle, articleTitle) {
  const payload = await fetchJson(COMMONS_API, {
    action: "query",
    format: "json",
    formatversion: "2",
    iiprop: "url|extmetadata",
    iiurlwidth: "1200",
    prop: "imageinfo",
    titles: fileTitle,
  });
  const page = payload.query?.pages?.[0];
  const info = page?.imageinfo?.[0];
  const metadata = info?.extmetadata ?? {};
  const license = plainText(metadata.LicenseShortName?.value);
  if (!info || !isReusableLicense(license)) return null;
  return {
    articleTitle,
    artist: plainText(metadata.Artist?.value) || "Wikimedia Commons contributor",
    descriptionUrl: info.descriptionurl,
    fileTitle: page.title,
    height: info.thumbheight ?? info.height,
    license,
    licenseUrl: metadata.LicenseUrl?.value || info.descriptionurl,
    objectName: plainText(metadata.ObjectName?.value),
    source: info.thumburl ?? info.url,
    width: info.thumbwidth ?? info.width,
  };
}

async function commonsSearchImage(searchTerm) {
  const payload = await fetchJson(COMMONS_API, {
    action: "query",
    format: "json",
    formatversion: "2",
    generator: "search",
    gsrnamespace: "6",
    gsrlimit: "12",
    gsrsearch: `"${searchTerm}"`,
    iiprop: "url|extmetadata",
    iiurlwidth: "1200",
    prop: "imageinfo",
  });

  for (const page of payload.query?.pages ?? []) {
    const info = page.imageinfo?.[0];
    const metadata = info?.extmetadata ?? {};
    const license = plainText(metadata.LicenseShortName?.value);
    if (!info?.thumburl || !isReusableLicense(license)) continue;
    return {
      articleTitle: searchTerm,
      artist: plainText(metadata.Artist?.value) || "Wikimedia Commons contributor",
      descriptionUrl: info.descriptionurl,
      fileTitle: page.title,
      height: info.thumbheight,
      license,
      licenseUrl: metadata.LicenseUrl?.value || info.descriptionurl,
      objectName: plainText(metadata.ObjectName?.value),
      source: info.thumburl,
      width: info.thumbwidth,
    };
  }

  return null;
}

function extensionFor(contentType, source) {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("gif")) return "gif";
  if (contentType.includes("svg")) return "svg";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  const pathname = new URL(source).pathname.toLowerCase();
  if (pathname.includes(".png")) return "png";
  if (pathname.includes(".webp")) return "webp";
  if (pathname.includes(".gif")) return "gif";
  if (pathname.includes(".svg")) return "svg";
  return "jpg";
}

async function downloadImage(key, source) {
  const response = await fetchWithRetry(source);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${source}`);
  const extension = extensionFor(response.headers.get("content-type") ?? "", source);
  const filename = `${key}.${extension}`;
  await writeFile(path.join(OUTPUT_DIRECTORY, filename), Buffer.from(await response.arrayBuffer()));
  return filename;
}

async function existingManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  } catch {
    return {};
  }
}

await mkdir(OUTPUT_DIRECTORY, { recursive: true });

const previous = await existingManifest();
const manifest = { ...previous };
const failures = [];

async function fetchSpecies([key, articleTitle, preferredFileTitle, artistOverride]) {
  if (manifest[key] && process.argv.includes("--missing-only")) {
    console.log(`keep     ${key}`);
    return;
  }

  try {
    let image = preferredFileTitle
      ? await commonsFileImage(preferredFileTitle, articleTitle)
      : await wikipediaImage(articleTitle);
    let metadata = preferredFileTitle ? image : image ? await commonsMetadata(image.fileTitle) : null;
    if (!image || !metadata) {
      const fallback = await commonsSearchImage(articleTitle);
      if (!fallback) throw new Error(`No reusable image found for ${articleTitle}`);
      image = fallback;
      metadata = fallback;
    }
    const filename = await downloadImage(key, image.source);
    manifest[key] = {
      articleTitle: image.articleTitle,
      artist: artistOverride ?? metadata.artist,
      descriptionUrl: metadata.descriptionUrl,
      height: image.height,
      license: metadata.license,
      licenseUrl: metadata.licenseUrl,
      objectName: metadata.objectName,
      src: `/recipes/sushi-guide/species/${filename}`,
      width: image.width,
    };
    console.log(`fetched  ${key} ← ${image.fileTitle}`);
  } catch (error) {
    failures.push({ articleTitle, error: String(error), key });
    console.warn(`missing  ${key}: ${error}`);
  }
}

const onlyArgumentIndex = process.argv.indexOf("--only");
const onlyKeys = onlyArgumentIndex >= 0
  ? new Set((process.argv[onlyArgumentIndex + 1] ?? "").split(",").filter(Boolean))
  : null;
const requestedSpecies = onlyKeys
  ? species.filter(([key]) => onlyKeys.has(key))
  : species;

for (let index = 0; index < requestedSpecies.length; index += 2) {
  await Promise.all(requestedSpecies.slice(index, index + 2).map(fetchSpecies));
  await pause(300);
}

await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`\n${Object.keys(manifest).length} images in manifest; ${failures.length} missing.`);
if (failures.length) {
  console.log(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
}
