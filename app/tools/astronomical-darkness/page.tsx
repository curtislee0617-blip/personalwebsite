import type { Metadata } from "next";
import { AstronomicalDarknessTool } from "@/components/astronomical-darkness-tool";
import "leaflet/dist/leaflet.css";
import "./astronomical-darkness.css";

export const metadata: Metadata = {
  title: "Astronomical darkness tracker",
  description: "Find moonless astronomical-darkness windows, twilight and Moon events, cloud forecasts, and nearby night lights for night photography.",
};

export default function AstronomicalDarknessPage() {
  return <AstronomicalDarknessTool />;
}
