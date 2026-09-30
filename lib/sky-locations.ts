import type { ContactPresenceCity } from "./contact-presence";

export const skyLocations = {
  losAngeles: { name: "Los Angeles", latitude: 34.0522, longitude: -118.2437, timeZone: "America/Los_Angeles" },
  london: { name: "London", latitude: 51.5074, longitude: -0.1278, timeZone: "Europe/London" },
  hongKong: { name: "Hong Kong", latitude: 22.3193, longitude: 114.1694, timeZone: "Asia/Hong_Kong" },
} satisfies Record<ContactPresenceCity, { name: string; latitude: number; longitude: number; timeZone: string }>;

export function pinnedSkyLocation(city: unknown) {
  return typeof city === "string" && Object.prototype.hasOwnProperty.call(skyLocations, city)
    ? skyLocations[city as ContactPresenceCity]
    : skyLocations.losAngeles;
}

export function globeViewpoint(location: { latitude: number; longitude: number }) {
  // Turn the globe slightly left and lower the viewing latitude so LA's view
  // includes more of both Americas while every selected city remains in view.
  return { latitude: location.latitude * .8, longitude: location.longitude + 15 };
}
