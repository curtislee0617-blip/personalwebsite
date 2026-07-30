import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUTPUT_DIRECTORY = path.join(ROOT, "public", "recipes", "sushi-guide", "prepared");
const MANIFEST_PATH = path.join(ROOT, "data", "sushi-prepared-images.json");

const preparedImages = [
  ["akami", ["akami nigiri", "maguro nigiri"]],
  [
    "chutoro",
    ["chutoro nigiri", "medium fatty tuna nigiri"],
    "File:Maguro Chutoro (moderately fatty tuna) Nigiri.jpg",
  ],
  ["otoro", ["otoro nigiri", "fatty tuna nigiri"]],
  ["katsuo", ["katsuo tataki", "bonito sashimi"]],
  ["salmon", ["salmon sashimi", "salmon nigiri"], "File:Salmon sashimi close up.jpg"],
  ["buri", ["buri sushi", "Japanese amberjack nigiri"], "File:Kurose Amberjack Sushi.jpg"],
  ["kanpachi", ["kanpachi sushi", "amberjack sashimi"], "File:Nigiri zushi (kanpachi).jpg"],
  [
    "hiramasa",
    ["hiramasa sashimi", "yellowtail kingfish sashimi"],
    "File:Sashimi-dish Yellow tail amberijack01.jpg",
  ],
  ["shima-aji", ["shima aji sashimi", "striped jack sashimi"]],
  ["ma-aji", ["aji nigiri", "horse mackerel sushi"], "File:Aji (Horse mackerel) Nigiri.jpg"],
  ["saba", ["saba sushi", "mackerel nigiri"]],
  ["iwashi", ["iwashi sushi", "sardine nigiri"]],
  ["kohada", ["kohada sushi", "gizzard shad nigiri"]],
  [
    "kohada-online",
    ["kohada sushi", "gizzard shad nigiri"],
    "File:Kohada nigirizushi.jpg",
  ],
  [
    "shinko",
    [
      "shinko sushi",
      "young gizzard shad sushi",
      "新子 寿司",
      "コノシロ 寿司",
      "konoshiro sushi",
      "gizzard shad sushi",
    ],
    "File:Sushi Saito IMG 1728 (23694398062).jpg",
  ],
  [
    "sanma",
    ["sanma sashimi", "Pacific saury sashimi"],
    "File:Sanma sashimi by jetalone in Kushiro, Hokkaido.jpg",
  ],
  ["sayori", ["sayori sushi", "halfbeak sashimi"], "File:Sayori.JPG"],
  ["madai", ["madai nigiri", "red sea bream sashimi"]],
  [
    "kasugo",
    [
      "kasugo sushi",
      "young sea bream sushi",
      "春子鯛 寿司",
      "小鯛 寿司",
      "red sea bream nigiri",
      "red sea bream sashimi",
      "tai sashimi",
    ],
    "File:Sashimi-dish Red seabream01.jpg",
  ],
  [
    "hirame",
    ["hirame sashimi", "olive flounder sashimi"],
    "File:Korean cuisine olive flounder hoe Seoul.jpg",
  ],
  ["engawa", ["engawa nigiri", "flounder fin sushi"], "File:Engawa nigirizushi.jpg"],
  ["suzuki", ["suzuki sashimi", "Japanese sea bass sashimi"], "File:スズキの刺身.jpg"],
  ["kinmedai", ["kinmedai sushi", "alfonsino sashimi"], "File:2025-0118 Mujo 08kinmedai.jpg"],
  [
    "sawara",
    ["sawara sashimi", "Spanish mackerel sashimi"],
    "File:Japanese Sashimi bivalve Roasted Fish Tairagi Tachiuo Sawara.jpg",
  ],
  ["kisu", ["kisu sushi", "Japanese whiting sashimi"], "File:Kisu (Sillago) Sushi.jpg"],
  ["kawahagi", ["kawahagi sashimi", "filefish sashimi"]],
  [
    "isaki",
    ["isaki sushi", "chicken grunt sashimi", "イサキ 刺身", "イサキ 寿司"],
    "File:IsakiSashimi.jpg",
  ],
  ["takabe", ["takabe sushi", "takabe sashimi", "タカベ 刺身", "タカベ 寿司"]],
  [
    "anko",
    ["monkfish dish", "anko sashimi", "アンコウ 刺身"],
    "File:あんこうのともあえ（八食センター）.jpg",
  ],
  [
    "nodoguro",
    ["nodoguro sushi", "blackthroat seaperch sashimi"],
    "File:AV4A3621-Edit (25383851478).jpg",
  ],
  [
    "houbou",
    ["houbou sashimi", "gurnard sashimi"],
    "File:SASHIMI or raw sliced fishes 2024-05-06.jpg",
  ],
  ["torafugu", ["fugu sashimi", "torafugu sashimi"]],
  ["aori-ika", ["aori ika sushi", "squid nigiri"]],
  [
    "yari-ika",
    ["yari ika sashimi", "spear squid sashimi"],
    "File:Sushi-Choshimaru-2024-03-17 05.jpg",
  ],
  ["sumi-ika", ["sumi ika sashimi", "cuttlefish sashimi"], "File:Cuttlefish sashimi.jpg"],
  [
    "hotaru-ika",
    ["hotaru ika sushi", "firefly squid sushi"],
    "File:Nigirizushi (hotaru-ika).jpg",
  ],
  ["madako", ["tako nigiri", "octopus sushi"]],
  [
    "kuruma-ebi",
    ["kuruma ebi sushi", "prawn nigiri"],
    "File:Longfin ika and shiso, Pacific kuruma ebi.jpg",
  ],
  ["ama-ebi", ["amaebi sushi", "sweet shrimp nigiri"], "File:はま寿司 甘エビ.jpg"],
  ["botan-ebi", ["botan ebi sushi", "spot prawn sashimi"], "File:Botan ebi.jpg"],
  ["shako", ["shako sushi", "mantis shrimp sushi"], "File:Nigiri zushi (shako).jpg"],
  ["zuwaigani", ["snow crab sashimi", "crab nigiri"], "File:ズワイガニの刺し身.jpg"],
  ["akagai", ["akagai sushi", "ark shell sashimi"], "File:Akagai (Ark shell) Nigiri.jpg"],
  ["hotate", ["hotate sushi", "scallop nigiri"]],
  ["awabi", ["awabi sushi", "abalone sashimi"], "File:Awabi Nigiri DSC07593.jpg"],
  ["hokkigai", ["hokkigai sushi", "Sakhalin surf clam nigiri"], "File:ホッキ貝の握り.jpg"],
  ["mirugai", ["mirugai sushi", "gaper clam sashimi"]],
  [
    "geoduck",
    ["geoduck sashimi", "geoduck sushi", "geoduck nigiri", "Pacific geoduck sashimi"],
    "File:Geoduck & lemon.jpg",
  ],
  ["torigai", ["torigai sushi", "cockle nigiri"]],
  [
    "tairagi",
    ["tairagi sashimi", "pen shell sashimi"],
    "File:Japanese Sashimi bivalve Roasted Fish Tairagi Tachiuo Sawara.jpg",
  ],
  [
    "aoyagi",
    ["aoyagi sushi", "Mactra chinensis sushi"],
    "File:Kobashira (surf clam) Gunkanmaki.jpg",
  ],
  ["anago", ["anago sushi", "conger eel nigiri"]],
  ["unagi", ["unagi sushi", "eel nigiri"]],
  ["uni", ["uni sushi", "sea urchin nigiri"]],
  [
    "ikura",
    ["ikura sushi", "salmon roe gunkan"],
    "File:Ikura gunkan maki sushi by sfllaw in Toronto.jpg",
  ],
  [
    "ikura-ingredient",
    ["salmon roe", "ikura roe"],
    "File:Salmon caviar on a spoon.jpg",
  ],
  [
    "kazunoko",
    ["kazunoko sushi", "herring roe sushi"],
    "File:はま寿司 20240214 195516.jpg",
  ],
  [
    "kazunoko-ingredient",
    ["kazunoko herring roe", "herring roe"],
    "File:Herring roe.jpg",
  ],
  [
    "shirako",
    ["shirako sushi", "cod milt sushi"],
    "File:Shirako gunkanmaki.jpg",
  ],
  [
    "shirako-ingredient",
    ["shirako milt", "cod milt"],
    "File:Fugu-no-Shirako.JPG",
  ],
  ["ankimo", ["ankimo sushi", "monkfish liver sushi"]],
  ["tamago", ["tamago sushi", "tamagoyaki nigiri"]],
  ["uni-tray", ["boxed uni sea urchin", "uni tray"]],
  ["uni-saltwater", ["saltwater uni", "sea urchin saltwater pack"]],
  ["uni-gunkan", ["uni gunkan", "sea urchin sushi"]],
  [
    "uni-ezo-bafun",
    ["ezo bafun uni", "Hokkaido bafun uni", "エゾバフンウニ 身"],
    "File:AV4A3657-Edit (25383844728).jpg",
  ],
  [
    "uni-kita-murasaki",
    ["kita murasaki uni", "northern purple sea urchin uni", "キタムラサキウニ 身"],
    "File:KitaMurasakiUni Mesocentrotus Nudus.jpg",
  ],
  [
    "uni-bafun",
    ["bafun uni", "green sea urchin uni", "バフンウニ 身"],
    "File:AV4A3657-Edit (25383844728).jpg",
  ],
  [
    "uni-murasaki",
    ["murasaki uni", "purple sea urchin uni", "ムラサキウニ 身"],
    "File:Murasaki uni.jpg",
  ],
  [
    "uni-aka",
    ["aka uni", "red sea urchin uni", "赤ウニ 身"],
    "File:Uni, Uni, Uni. - Sea urchin eggs - Flickr - skyseeker.jpg",
  ],
];

const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const USER_AGENT = "CurtisLeePersonalWebsite/1.0 (sushi guide prepared-image attribution)";

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

function isLikelyPhotograph(title = "", mime = "") {
  const normalized = title.toLowerCase();
  const rejectedWords = [
    "diagram",
    "drawing",
    "emoji",
    "icon",
    "illustration",
    "logo",
    "map",
    "painting",
    "poster",
    "stamp",
    "woodblock",
  ];

  return (
    !rejectedWords.some((word) => normalized.includes(word)) &&
    mime.startsWith("image/") &&
    !mime.includes("svg")
  );
}

const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchWithRetry(url) {
  let lastError = null;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(20_000),
      });
      if (response.status !== 429 && response.status < 500) return response;
      const retryAfter = Number(response.headers.get("retry-after"));
      const retryDelay = Number.isFinite(retryAfter)
        ? Math.min(retryAfter * 1000, 15_000)
        : 1_500 * (attempt + 1);
      await pause(retryDelay);
    } catch (error) {
      lastError = error;
      await pause(1_500 * (attempt + 1));
    }
  }

  throw lastError ?? new Error(`Repeated request failure: ${url}`);
}

async function fetchJson(params) {
  const url = new URL(COMMONS_API);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetchWithRetry(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

async function commonsSearchImage(searchTerm) {
  const payload = await fetchJson({
    action: "query",
    format: "json",
    formatversion: "2",
    generator: "search",
    gsrnamespace: "6",
    gsrlimit: "24",
    gsrsearch: `"${searchTerm}"`,
    iiprop: "url|mime|extmetadata",
    iiurlwidth: "1200",
    prop: "imageinfo",
  });

  for (const page of payload.query?.pages ?? []) {
    const info = page.imageinfo?.[0];
    const metadata = info?.extmetadata ?? {};
    const license = plainText(metadata.LicenseShortName?.value);
    if (
      !info?.thumburl ||
      !isReusableLicense(license) ||
      !isLikelyPhotograph(page.title, info.mime)
    ) {
      continue;
    }

    return {
      articleTitle: searchTerm,
      artist: plainText(metadata.Artist?.value) || "Wikimedia Commons contributor",
      descriptionUrl: info.descriptionurl,
      fileTitle: page.title,
      height: info.thumbheight,
      license,
      licenseUrl: metadata.LicenseUrl?.value || info.descriptionurl,
      objectName: plainText(metadata.ObjectName?.value) || page.title.replace(/^File:/, ""),
      source: info.thumburl,
      width: info.thumbwidth,
    };
  }

  return null;
}

async function commonsFileImage(fileTitle, articleTitle) {
  const payload = await fetchJson({
    action: "query",
    format: "json",
    formatversion: "2",
    iiprop: "url|mime|extmetadata",
    iiurlwidth: "1200",
    prop: "imageinfo",
    titles: fileTitle,
  });
  const page = payload.query?.pages?.[0];
  const info = page?.imageinfo?.[0];
  const metadata = info?.extmetadata ?? {};
  const license = plainText(metadata.LicenseShortName?.value);
  if (
    !info?.thumburl ||
    !isReusableLicense(license) ||
    !isLikelyPhotograph(page.title, info.mime)
  ) {
    return null;
  }

  return {
    articleTitle,
    artist: plainText(metadata.Artist?.value) || "Wikimedia Commons contributor",
    descriptionUrl: info.descriptionurl,
    fileTitle: page.title,
    height: info.thumbheight,
    license,
    licenseUrl: metadata.LicenseUrl?.value || info.descriptionurl,
    objectName: plainText(metadata.ObjectName?.value) || page.title.replace(/^File:/, ""),
    source: info.thumburl,
    width: info.thumbwidth,
  };
}

async function commonsSearchCandidates(searchTerm) {
  const payload = await fetchJson({
    action: "query",
    format: "json",
    formatversion: "2",
    generator: "search",
    gsrnamespace: "6",
    gsrlimit: "16",
    gsrsearch: searchTerm,
    iiprop: "url|mime|extmetadata",
    iiurlwidth: "600",
    prop: "imageinfo",
  });

  return (payload.query?.pages ?? [])
    .filter((page) => {
      const info = page.imageinfo?.[0];
      const metadata = info?.extmetadata ?? {};
      return (
        info?.thumburl &&
        isReusableLicense(plainText(metadata.LicenseShortName?.value)) &&
        isLikelyPhotograph(page.title, info.mime)
      );
    })
    .map((page) => page.title);
}

function extensionFor(contentType, source) {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("gif")) return "gif";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  const pathname = new URL(source).pathname.toLowerCase();
  if (pathname.includes(".png")) return "png";
  if (pathname.includes(".webp")) return "webp";
  if (pathname.includes(".gif")) return "gif";
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

async function fetchPreparedImage([key, searchTerms, preferredFileTitle]) {
  if (manifest[key] && process.argv.includes("--missing-only")) {
    console.log(`keep     ${key}`);
    return;
  }

  try {
    let image = preferredFileTitle
      ? await commonsFileImage(preferredFileTitle, searchTerms[0])
      : null;
    if (!image) {
      for (const searchTerm of searchTerms) {
        image = await commonsSearchImage(searchTerm);
        if (image) break;
        await pause(200);
      }
    }
    if (!image) throw new Error(`No reusable photograph found for ${searchTerms.join(" / ")}`);

    const filename = await downloadImage(key, image.source);
    manifest[key] = {
      articleTitle: image.articleTitle,
      artist: image.artist,
      descriptionUrl: image.descriptionUrl,
      fileTitle: image.fileTitle,
      height: image.height,
      license: image.license,
      licenseUrl: image.licenseUrl,
      objectName: image.objectName,
      src: `/recipes/sushi-guide/prepared/${filename}`,
      width: image.width,
    };
    await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(`fetched  ${key} ← ${image.fileTitle}`);
  } catch (error) {
    failures.push({ error: String(error), key, searchTerms });
    console.warn(`missing  ${key}: ${error}`);
  }
}

const onlyArgumentIndex = process.argv.indexOf("--only");
const onlyKeys = onlyArgumentIndex >= 0
  ? new Set((process.argv[onlyArgumentIndex + 1] ?? "").split(",").filter(Boolean))
  : null;
const requestedImages = onlyKeys
  ? preparedImages.filter(([key]) => onlyKeys.has(key))
  : preparedImages;

if (process.argv.includes("--candidates")) {
  for (const [key, searchTerms] of requestedImages) {
    console.log(`\n${key}`);
    for (const searchTerm of searchTerms) {
      const candidates = await commonsSearchCandidates(searchTerm);
      console.log(`  ${searchTerm}:`);
      candidates.slice(0, 8).forEach((candidate) => console.log(`    ${candidate}`));
      await pause(150);
    }
  }
  process.exit(0);
}

for (let index = 0; index < requestedImages.length; index += 2) {
  await Promise.all(requestedImages.slice(index, index + 2).map(fetchPreparedImage));
  await pause(300);
}

await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`\n${Object.keys(manifest).length} images in manifest; ${failures.length} missing.`);
if (failures.length) {
  console.log(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
}
