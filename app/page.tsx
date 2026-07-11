import { HomeOrbit } from "@/components/home-orbit";
import homePhotos from "@/data/home-photos.json";

function orderScore(name: string) {
  let hash = 2166136261;
  for (const character of name) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export default function HomePage() {
  const photos = [...homePhotos].sort((a, b) => orderScore(a) - orderScore(b));
  return <HomeOrbit photos={photos} profilePhoto="/profile.webp" />;
}
