import { readdir } from "node:fs/promises";
import path from "node:path";
import { HomeOrbit } from "@/components/home-orbit";

const supportedImage = /\.(avif|gif|jpe?g|png|webp)$/i;

function orderScore(name: string) {
  let hash = 2166136261;
  for (const character of name) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

async function findBackgroundPhotos() {
  try {
    const files = await readdir(path.join(process.cwd(), "public", "photos"));
    return files
      .filter((file) => supportedImage.test(file))
      .sort((a, b) => orderScore(a) - orderScore(b))
      .map((file) => `/photos/${encodeURIComponent(file)}`);
  } catch {
    return [];
  }
}

async function findProfilePhoto() {
  try {
    const files = await readdir(path.join(process.cwd(), "public"));
    const profile = files.find((file) => /^profile\.(avif|jpe?g|png|webp)$/i.test(file));
    return profile ? `/${encodeURIComponent(profile)}` : null;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const [photos, profilePhoto] = await Promise.all([findBackgroundPhotos(), findProfilePhoto()]);
  return <HomeOrbit photos={photos} profilePhoto={profilePhoto} />;
}
