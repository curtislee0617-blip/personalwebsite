import { HomeLanding } from "@/components/home-landing";
import homePhotos from "@/data/home-photos.json";

export default function HomePage() {
  return <HomeLanding photos={homePhotos} />;
}
