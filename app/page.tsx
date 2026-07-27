import { HomeOrbit } from "@/components/home-orbit";
import homePhotos from "@/data/home-photos.json";

export default function HomePage() {
  return <HomeOrbit photos={homePhotos} profilePhoto="/profile.webp" />;
}
