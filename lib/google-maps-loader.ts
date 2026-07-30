import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

let isConfigured = false;

export function configureGoogleMaps(apiKey: string, mapId: string) {
  if (isConfigured) return;

  setOptions({
    key: apiKey,
    mapIds: [mapId],
    v: "weekly",
  });
  isConfigured = true;
}

export { importLibrary as importGoogleMapsLibrary };
