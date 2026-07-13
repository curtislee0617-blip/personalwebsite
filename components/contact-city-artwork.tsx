"use client";

import {
  ContactCityArtCycle,
  type ContactCityTimeSource,
} from "@/components/contact-city-art-cycle";
import { ContactCityTimeRow } from "@/components/contact-city-clocks";
import {
  ContactPresenceCityTargets,
  ContactTravellingPresence,
} from "@/components/contact-presence";

type ContactCityArtworkProps = {
  className?: string;
  editable?: boolean;
  timeSource?: ContactCityTimeSource;
};

function PixelPassengerPlane({ className }: { className: string }) {
  return (
    <svg className={`contact-london-plane ${className}`} shapeRendering="crispEdges" viewBox="0 0 64 32">
      <path className="contact-plane-tail" d="M7 19V4h6v5h4v5h4v5Z" />
      <path className="contact-plane-tail-highlight" d="M10 6h3v5h4v5h3v3h-4v-3h-3v-5h-3Z" />
      <path className="contact-plane-wing-shadow" d="M20 21h30l7 5H39l-7 4H21l3-4H16Z" />
      <path className="contact-plane-wing" d="M22 20h28l5 4H38l-7 4H21l3-4H18Z" />
      <path className="contact-plane-engine" d="M25 24h11v6H25Zm20 0h10v6H45Z" />
      <path className="contact-plane-engine-highlight" d="M25 24h8v2h-8Zm20 0h7v2h-7Z" />
      <path className="contact-plane-engine-intake" d="M33 25h3v5h-3Zm19 0h3v5h-3Z" />
      <path className="contact-plane-outline" d="M6 16h44v1h6v2h4v2h3v4h-3v2H16l-5-3H6Z" />
      <path className="contact-plane-fuselage" d="M8 17h42v1h6v2h4v2h2v2h-3v1H16l-4-3H8Z" />
      <path className="contact-plane-belly" d="M6 22h56v3h-3v2H16l-5-3H6Z" />
      <path className="contact-plane-stripe" d="M9 21h50v2H9Z" />
      <path className="contact-plane-door" d="M14 18h3v5h-3Zm34 0h3v5h-3Z" />
      <path className="contact-plane-windows" d="M20 19h2v2h-2Zm5 0h2v2h-2Zm5 0h2v2h-2Zm5 0h2v2h-2Zm5 0h2v2h-2Zm5 0h2v2h-2Z" />
      <path className="contact-plane-cockpit" d="M53 19h3v2h-3Zm4 1h2v2h-2Z" />
      <rect className="contact-plane-nav-light contact-plane-nav-light-red" height="2" width="2" x="18" y="26" />
      <rect className="contact-plane-nav-light contact-plane-nav-light-green" height="2" width="2" x="55" y="24" />
    </svg>
  );
}

export function ContactCityArtwork({
  className,
  editable = false,
  timeSource,
}: ContactCityArtworkProps) {
  return (
    <>
      <link as="image" href="/contact-cities-pixel-art-day-foreground-v1.png" rel="preload" />
      <link as="image" href="/contact-cities-pixel-art-night-foreground-v1.png" rel="preload" />
      <link as="image" href="/contact-cities-pixel-art-day-foreground-boatless-v1.png" rel="preload" />
      <link as="image" href="/contact-cities-pixel-art-night-foreground-boatless-v1.png" rel="preload" />
      <link as="image" href="/contact-harbour-boat-day-v1.png" rel="preload" />
      <link as="image" href="/contact-harbour-boat-night-v1.png" rel="preload" />
      <div className={["contact-cities-art", className].filter(Boolean).join(" ")}>
        <ContactCityArtCycle timeSource={timeSource}>
          <ContactTravellingPresence />
          <div className="contact-cities-scene-frame">
            <div className="contact-cities-scene">
              <span
                aria-label="Pixel art of the Hollywood hills in Los Angeles, Big Ben and Westminster in London, and Hong Kong harbour"
                className="contact-cities-art-composite"
                role="img"
              >
                <span className="contact-city-art-layer contact-city-art-layer-day contact-city-art-layer-la" />
                <span className="contact-city-art-layer contact-city-art-layer-day contact-city-art-layer-london" />
                <span className="contact-city-art-layer contact-city-art-layer-day contact-city-art-layer-hk" />
                <span className="contact-city-night-art">
                  <span className="contact-city-art-layer contact-city-art-layer-night contact-city-art-layer-la" />
                  <span className="contact-city-art-layer contact-city-art-layer-night contact-city-art-layer-london" />
                  <span className="contact-city-art-layer contact-city-art-layer-night contact-city-art-layer-hk" />
                </span>
              </span>
              <span className="contact-city-star-field" aria-hidden="true">
                <span className="contact-city-stars contact-city-stars-la" />
                <span className="contact-city-stars contact-city-stars-london" />
                <span className="contact-city-stars contact-city-stars-hk" />
              </span>
              <div className="contact-city-celestial-track" aria-hidden="true">
                <span className="contact-city-celestial contact-city-celestial-primary">
                  <span className="contact-city-moon-face" />
                </span>
                <span className="contact-city-celestial contact-city-celestial-secondary">
                  <span className="contact-city-moon-face" />
                </span>
                <span className="contact-city-celestial contact-city-celestial-moon">
                  <span className="contact-city-moon-face" />
                </span>
              </div>
              <span className="contact-harbour-group contact-harbour-boat-group" aria-hidden="true">
                <span className="contact-harbour-boat contact-harbour-boat-light" />
                <span className="contact-harbour-boat contact-harbour-boat-dark" />
              </span>
              <div className="contact-london-planes" aria-hidden="true">
                <PixelPassengerPlane className="contact-london-plane-one" />
                <PixelPassengerPlane className="contact-london-plane-two" />
              </div>
              <div className="contact-hollywood-spotlights" aria-hidden="true">
                <span className="contact-hollywood-beam contact-hollywood-beam-left" />
                <span className="contact-hollywood-beam contact-hollywood-beam-right" />
                <span className="contact-hollywood-beam contact-hollywood-beam-center" />
                <span className="contact-hollywood-glow" />
              </div>
              {editable ? <ContactPresenceCityTargets /> : null}
              <ContactCityTimeRow />
            </div>
          </div>
          <span className="contact-city-atmosphere" aria-hidden="true">
            <span className="contact-city-atmosphere-blue" />
            <span className="contact-city-atmosphere-dawn" />
            <span className="contact-city-atmosphere-golden" />
            <span className="contact-city-atmosphere-sunset" />
          </span>
        </ContactCityArtCycle>
      </div>
    </>
  );
}
