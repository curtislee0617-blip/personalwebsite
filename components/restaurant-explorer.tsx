"use client";

import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Restaurant } from "@/data/restaurants";

type RestaurantExplorerProps = {
  apiKey: string;
  mapId: string;
  restaurants: Restaurant[];
};

type MapStatus = "idle" | "loading" | "ready" | "error";
type MapBounds = { north: number; south: number; east: number; west: number };
type HoursFilter = "All" | "OpenNow" | "OpenAtDateTime";
type Position = { lat: number; lng: number };
type GeocodeSuggestion = {
  id: string;
  label: string;
  result: google.maps.GeocoderResult;
};

let mapsConfigured = false;
const resultListLimit = 250;
const mobileMarkerLimit = 350;
const mobileMapMediaQuery = "(max-width: 899px)";
const defaultMapCenter = { lat: 22.3027, lng: 114.1772 };

function googleMapsUrl(restaurant: Restaurant) {
  if (restaurant.googleMapsUrl) return restaurant.googleMapsUrl;
  const query = `${restaurant.name}, ${restaurant.address}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function csvCell(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function isWithinBounds(position: Restaurant["position"], bounds: MapBounds) {
  const withinLatitude = position.lat >= bounds.south && position.lat <= bounds.north;
  const withinLongitude = bounds.west <= bounds.east
    ? position.lng >= bounds.west && position.lng <= bounds.east
    : position.lng >= bounds.west || position.lng <= bounds.east;
  return withinLatitude && withinLongitude;
}

function uniqueLabels(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function fitRestaurantBounds(map: google.maps.Map, matchingRestaurants: Restaurant[], fallbackZoom = 12) {
  if (matchingRestaurants.length === 0) return false;
  if (matchingRestaurants.length === 1) {
    map.panTo(matchingRestaurants[0].position);
    if ((map.getZoom() ?? 0) < fallbackZoom) map.setZoom(fallbackZoom);
    return true;
  }

  const bounds = new google.maps.LatLngBounds();
  matchingRestaurants.forEach((restaurant) => bounds.extend(restaurant.position));
  map.fitBounds(bounds, 56);
  return true;
}

function requestBrowserPosition() {
  return new Promise<Position | null>((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => resolve(null),
      { enableHighAccuracy: false, maximumAge: 1000 * 60 * 30, timeout: 5000 },
    );
  });
}

function defaultDateTimeValue() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + (30 - (now.getMinutes() % 30 || 30)));
  now.setSeconds(0, 0);
  const timezoneOffsetMs = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateTimeInput(dateValue: string, timeValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hours, minutes] = timeValue.split(":").map(Number);

  if ([year, month, day, hours, minutes].some((value) => Number.isNaN(value))) {
    const fallback = new Date();
    fallback.setHours(23, 0, 0, 0);
    return fallback;
  }

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

function buildDateOptions() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 14 }, (_, index) => {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + index);
    const prefix = index === 0 ? "Today" : index === 1 ? "Tomorrow" : "";

    return {
      value: formatDateValue(nextDate),
      label: `${prefix ? `${prefix} · ` : ""}${new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(nextDate)}`,
    };
  });
}

function buildTimeOptions() {
  return Array.from({ length: 48 }, (_, index) => {
    const hours = Math.floor(index / 2);
    const minutes = index % 2 === 0 ? 0 : 30;
    const value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(2026, 0, 1, hours, minutes, 0, 0));

    return { value, label };
  });
}

function defaultDateValue() {
  return formatDateValue(new Date());
}

function defaultTimeValue() {
  return defaultDateTimeValue().slice(11, 16);
}

function parseTimeLabel(timeLabel: string) {
  const normalized = timeLabel.replace(/\u202f/g, " ").trim();
  const amPmMatch = normalized.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (amPmMatch) {
    const rawHour = Number(amPmMatch[1]);
    const minute = Number(amPmMatch[2] ?? "0");
    const meridiem = amPmMatch[3].toUpperCase();
    let hour = rawHour % 12;
    if (meridiem === "PM") hour += 12;
    return hour * 60 + minute;
  }

  const twentyFourHourMatch = normalized.match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (twentyFourHourMatch) {
    const hour = Number(twentyFourHourMatch[1]);
    const minute = Number(twentyFourHourMatch[2] ?? "0");
    if (hour >= 0 && hour <= 24 && minute >= 0 && minute < 60) {
      return (hour % 24) * 60 + minute;
    }
  }

  return null;
}

function parseTimeLabelWithFallback(timeLabel: string, fallbackMeridiem: "AM" | "PM" | null) {
  const direct = parseTimeLabel(timeLabel);
  if (direct !== null) return direct;

  if (!fallbackMeridiem) return null;
  return parseTimeLabel(`${timeLabel} ${fallbackMeridiem}`);
}

function extractMeridiem(timeLabel: string) {
  const match = timeLabel.replace(/\u202f/g, " ").trim().match(/\b(AM|PM)\b/i);
  if (!match) return null;
  return match[1].toUpperCase() as "AM" | "PM";
}

function parseTimeRange(segment: string) {
  const normalized = segment.replace(/\u2009/g, " ").replace(/\u202f/g, " ").trim();
  if (/open 24 hours/i.test(normalized)) return { start: 0, end: 0 };
  const parts = segment.split(/–|-/).map((part) => part.trim()).filter(Boolean);
  if (parts.length !== 2) return null;
  const fallbackMeridiem = extractMeridiem(parts[1]);
  const start = parseTimeLabelWithFallback(parts[0], fallbackMeridiem);
  const end = parseTimeLabel(parts[1]);
  if (start === null || end === null) return null;
  return { start, end };
}

function isOpenFromStructuredPeriods(restaurant: Restaurant, targetDateTime: Date) {
  const periods = restaurant.openingHours?.periods ?? [];
  if (!periods.length) return null;

  const targetDay = targetDateTime.getDay();
  const targetMinutes = targetDateTime.getHours() * 60 + targetDateTime.getMinutes();
  const targetAbsoluteMinutes = targetDay * 1440 + targetMinutes;

  return periods.some((period) => {
    const open = period.open;
    const close = period.close;
    const openAbsoluteMinutes = open.day * 1440 + open.hour * 60 + open.minute;

    // Google represents an always-open venue as one opening period without a
    // closing value. It applies to the whole week, not just the opening day.
    if (!close) return true;

    let closeAbsoluteMinutes = close.day * 1440 + close.hour * 60 + close.minute;
    if (closeAbsoluteMinutes <= openAbsoluteMinutes) closeAbsoluteMinutes += 7 * 1440;

    const normalizedTargetMinutes = targetAbsoluteMinutes < openAbsoluteMinutes
      ? targetAbsoluteMinutes + 7 * 1440
      : targetAbsoluteMinutes;

    return normalizedTargetMinutes >= openAbsoluteMinutes && normalizedTargetMinutes < closeAbsoluteMinutes;
  });
}

function isOpenAtDateTime(restaurant: Restaurant, targetDateTime: Date) {
  const structuredMatch = isOpenFromStructuredPeriods(restaurant, targetDateTime);
  if (structuredMatch !== null) return structuredMatch;

  const weekdayDescriptions = restaurant.openingHours?.weekdayDescriptions ?? [];
  if (!weekdayDescriptions.length) return false;

  const targetMinutes = targetDateTime.getHours() * 60 + targetDateTime.getMinutes();
  const weekdayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(targetDateTime);
  const previousDay = new Date(targetDateTime);
  previousDay.setDate(previousDay.getDate() - 1);
  const previousWeekdayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(previousDay);

  function rangesForDay(dayName: string) {
    const matchingDay = weekdayDescriptions.find((line) => line.toLocaleLowerCase("en").startsWith(dayName.toLocaleLowerCase("en")));
    if (!matchingDay || /closed/i.test(matchingDay)) return [];
    const schedule = matchingDay.split(":").slice(1).join(":").trim();
    if (!schedule) return [];
    return schedule
      .split(",")
      .map((segment) => parseTimeRange(segment.trim()))
      .filter((range): range is { start: number; end: number } => Boolean(range));
  }

  const todayMatch = rangesForDay(weekdayName).some(({ start, end }) => {
      if (start === end) return true;
      if (start < end) return targetMinutes >= start && targetMinutes < end;
      return targetMinutes >= start || targetMinutes < end;
    });

  if (todayMatch) return true;

  return rangesForDay(previousWeekdayName).some(({ start, end }) =>
    start > end && targetMinutes < end,
  );
}

function isOpenNow(restaurant: Restaurant) {
  return isOpenAtDateTime(restaurant, new Date());
}

export function RestaurantExplorer({ apiKey, mapId, restaurants }: RestaurantExplorerProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapIdleTimeoutRef = useRef<number | null>(null);
  const mobileMarkerPauseTimeoutRef = useRef<number | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const locationSearchTimeoutRef = useRef<number | null>(null);
  const didRequestUserLocationRef = useRef(false);
  const userPositionRef = useRef<Position | null>(null);
  const markerLibraryRef = useRef<{
    AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement;
    PinElement: typeof google.maps.marker.PinElement;
  } | null>(null);
  const markerRefs = useRef(new Map<string, google.maps.marker.AdvancedMarkerElement>());
  const markerElementRefs = useRef(new Map<string, HTMLElement>());
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activePrice, setActivePrice] = useState("All");
  const [activeHours, setActiveHours] = useState<HoursFilter>("All");
  const [hoursDate, setHoursDate] = useState(defaultDateValue);
  const [hoursTime, setHoursTime] = useState(defaultTimeValue);
  const [search, setSearch] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [geocodeSuggestions, setGeocodeSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [selectedGeocodeSuggestion, setSelectedGeocodeSuggestion] = useState<GeocodeSuggestion | null>(null);
  const [isShowingPlaceSearch, setIsShowingPlaceSearch] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [mapStatus, setMapStatus] = useState<MapStatus>(apiKey ? "idle" : "error");
  const [isMobileMap, setIsMobileMap] = useState<boolean | null>(null);
  const [isMobileMapMoving, setIsMobileMapMoving] = useState(false);
  const [loadedMobileRestaurantIds, setLoadedMobileRestaurantIds] = useState<Set<string>>(() => new Set());
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const dateOptions = useMemo(() => buildDateOptions(), []);
  const timeOptions = useMemo(() => buildTimeOptions(), []);

  const categories = useMemo(() => {
    const categoryCounts = restaurants.reduce((counts, restaurant) => {
      uniqueLabels([restaurant.category, ...restaurant.tags]).forEach((category) => {
        counts.set(category, (counts.get(category) ?? 0) + 1);
      });
      return counts;
    }, new Map<string, number>());

    return [
      "All",
      ...Array.from(categoryCounts)
        .sort(([firstCategory, firstCount], [secondCategory, secondCount]) =>
          secondCount - firstCount || firstCategory.localeCompare(secondCategory),
        )
        .map(([category]) => category),
    ];
  }, [restaurants]);
  const filteredRestaurants = useMemo(() => {
    const targetDateTime = parseDateTimeInput(hoursDate, hoursTime);
    return restaurants.filter((restaurant) => {
      const labels = uniqueLabels([restaurant.category, ...restaurant.tags]);
      const matchesCategory = activeCategories.length === 0
        || activeCategories.some((category) => labels.includes(category));
      const matchesPrice = activePrice === "All" || restaurant.priceLevel === Number(activePrice);
      const matchesHours =
        activeHours === "All"
        || (activeHours === "OpenNow" && restaurant.businessStatus !== "CLOSED_TEMPORARILY" && isOpenNow(restaurant))
        || (activeHours === "OpenAtDateTime" && restaurant.businessStatus !== "CLOSED_TEMPORARILY" && isOpenAtDateTime(restaurant, targetDateTime));
      return matchesCategory && matchesPrice && matchesHours;
    });
  }, [activeCategories, activeHours, activePrice, hoursDate, hoursTime, restaurants]);

  const restaurantsInView = useMemo(
    () => mapBounds
      ? filteredRestaurants.filter((restaurant) => isWithinBounds(restaurant.position, mapBounds))
      : filteredRestaurants,
    [filteredRestaurants, mapBounds],
  );
  const mobileRestaurantsInView = useMemo(
    () => isMobileMap && mapBounds && !isMobileMapMoving
      ? filteredRestaurants.filter((restaurant) => isWithinBounds(restaurant.position, mapBounds)).slice(0, mobileMarkerLimit)
      : [],
    [filteredRestaurants, isMobileMap, isMobileMapMoving, mapBounds],
  );
  const unloadedMobileRestaurants = useMemo(
    () => mobileRestaurantsInView.filter((restaurant) => !loadedMobileRestaurantIds.has(restaurant.id)),
    [loadedMobileRestaurantIds, mobileRestaurantsInView],
  );
  const selectedRestaurant = filteredRestaurants.find((restaurant) => restaurant.id === selectedId);
  const listedRestaurants = restaurantsInView.slice(0, resultListLimit);
  const selectedHoursDateTime = useMemo(
    () => parseDateTimeInput(hoursDate, hoursTime),
    [hoursDate, hoursTime],
  );
  const hasFilters = activeCategories.length > 0 || activePrice !== "All" || activeHours !== "All" || search.length > 0;
  const shouldShowMobileLoadPinsButton = Boolean(isMobileMap && mapStatus === "ready" && !isMobileMapMoving && unloadedMobileRestaurants.length > 0);
  const detachMarkers = useCallback(() => {
    markerRefs.current.forEach((marker) => { marker.map = null; });
  }, []);
  const ensureRestaurantMarker = useCallback((restaurant: Restaurant) => {
    if (markerRefs.current.has(restaurant.id)) return;
    const markerLibrary = markerLibraryRef.current;
    if (!markerLibrary) return;

    const pin = new markerLibrary.PinElement({
      background: "#f7f5ef",
      borderColor: "#20231f",
      glyphText: restaurant.emoji,
      scale: isMobileMap ? 0.92 : 1.12,
    });
    const markerElement = document.createElement("div");
    markerElement.className = "restaurant-map-marker";
    markerElement.classList.toggle("is-mobile", Boolean(isMobileMap));
    markerElement.append(pin);

    const label = document.createElement("span");
    label.className = "restaurant-map-marker-label";
    label.textContent = restaurant.name;
    markerElement.append(label);

    const marker = new markerLibrary.AdvancedMarkerElement({
      map: null,
      position: restaurant.position,
      title: `${restaurant.name}, ${restaurant.area}`,
      gmpClickable: true,
    });

    marker.append(markerElement);
    marker.addEventListener("gmp-click", () => setSelectedId(restaurant.id));
    markerRefs.current.set(restaurant.id, marker);
    markerElementRefs.current.set(restaurant.id, markerElement);
  }, [isMobileMap]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(mobileMapMediaQuery);

    function syncViewport() {
      setIsMobileMap(mediaQuery.matches);
      setIsResultsOpen((current) => (mediaQuery.matches ? current : true));
    }

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);
    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  useEffect(() => {
    if (!apiKey || !mapElementRef.current || isMobileMap === null) return;

    let cancelled = false;
    const mapElement = mapElementRef.current;
    const markers = markerRefs.current;
    const markerElements = markerElementRefs.current;

    async function initialiseMap() {
      setMapStatus("loading");

      try {
        if (!mapsConfigured) {
          setOptions({ key: apiKey, v: "weekly", mapIds: [mapId] });
          mapsConfigured = true;
        }

        const userPositionPromise = didRequestUserLocationRef.current
          ? Promise.resolve(userPositionRef.current)
          : requestBrowserPosition();
        didRequestUserLocationRef.current = true;

        const [[{ Map, RenderingType }, { AdvancedMarkerElement, PinElement }], initialUserPosition] = await Promise.all([
          Promise.all([
            importLibrary("maps"),
            importLibrary("marker"),
          ]),
          userPositionPromise,
        ]);

        if (cancelled || !mapElementRef.current) return;
        markerLibraryRef.current = { AdvancedMarkerElement, PinElement };
        if (initialUserPosition) {
          userPositionRef.current = initialUserPosition;
        }

        const map = new Map(mapElementRef.current, {
          center: initialUserPosition ?? defaultMapCenter,
          zoom: 12,
          mapId,
          gestureHandling: isMobileMap ? "greedy" : "cooperative",
          isFractionalZoomEnabled: !isMobileMap,
          renderingType: isMobileMap ? RenderingType.RASTER : RenderingType.VECTOR,
          clickableIcons: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: !isMobileMap,
          zoomControl: !isMobileMap,
          rotateControl: false,
          scaleControl: false,
          keyboardShortcuts: !isMobileMap,
        });

        mapRef.current = map;
        map.addListener("click", () => setSelectedId(""));
        const pauseMobileMarkers = () => {
          if (!isMobileMap) return;
          if (mobileMarkerPauseTimeoutRef.current) {
            window.clearTimeout(mobileMarkerPauseTimeoutRef.current);
          }
          detachMarkers();
          setIsMobileMapMoving(true);
        };
        map.addListener("dragstart", pauseMobileMarkers);
        map.addListener("zoom_changed", pauseMobileMarkers);
        map.addListener("idle", () => {
          if (mapIdleTimeoutRef.current) {
            window.clearTimeout(mapIdleTimeoutRef.current);
          }

          mapIdleTimeoutRef.current = window.setTimeout(() => {
            const nextBounds = map.getBounds()?.toJSON();
            if (nextBounds) {
              setMapBounds((currentBounds) => {
                if (
                  currentBounds
                  && currentBounds.north === nextBounds.north
                  && currentBounds.south === nextBounds.south
                  && currentBounds.east === nextBounds.east
                  && currentBounds.west === nextBounds.west
                ) return currentBounds;
                return nextBounds;
              });
            }
            if (isMobileMap) {
              if (mobileMarkerPauseTimeoutRef.current) {
                window.clearTimeout(mobileMarkerPauseTimeoutRef.current);
              }
              mobileMarkerPauseTimeoutRef.current = window.setTimeout(() => {
                setIsMobileMapMoving(false);
              }, 90);
            }
          }, isMobileMap ? 140 : 40);
        });

        setMapStatus("ready");
      } catch (error) {
        console.error("Google Maps failed to load", error);
        setMapStatus("error");
      }
    }

    void initialiseMap();

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest(".restaurant-map-marker")) return;
      setSelectedId("");
    }

    mapElement.addEventListener("pointerdown", handlePointerDown, { capture: true });

    return () => {
      cancelled = true;
      if (mapIdleTimeoutRef.current) {
        window.clearTimeout(mapIdleTimeoutRef.current);
      }
      if (mobileMarkerPauseTimeoutRef.current) {
        window.clearTimeout(mobileMarkerPauseTimeoutRef.current);
      }
      if (locationSearchTimeoutRef.current) {
        window.clearTimeout(locationSearchTimeoutRef.current);
      }
      mapElement.removeEventListener("pointerdown", handlePointerDown, { capture: true });
      markers.forEach((marker) => { marker.map = null; });
      markers.clear();
      markerElements.clear();
      markerLibraryRef.current = null;
      mapRef.current = null;
    };
  }, [apiKey, detachMarkers, isMobileMap, mapId, restaurants]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setOptions({ gestureHandling: isMobileMap ? "greedy" : "cooperative" });
  }, [isMobileMap]);

  useEffect(() => {
    if (mapStatus !== "ready") return;
    const query = search.trim();

    if (locationSearchTimeoutRef.current) {
      window.clearTimeout(locationSearchTimeoutRef.current);
    }

    if (query.length < 2 || selectedGeocodeSuggestion?.label === query) return;

    locationSearchTimeoutRef.current = window.setTimeout(() => {
      if (!geocoderRef.current) {
        geocoderRef.current = new google.maps.Geocoder();
      }

      void geocoderRef.current.geocode({ address: query }, (results, status) => {
        if (status !== "OK" || !results?.length) {
          setGeocodeSuggestions([]);
          setSearchStatus("No map location found.");
          return;
        }

        setGeocodeSuggestions(results.slice(0, 6).map((result, index) => ({
          id: `${result.place_id ?? result.formatted_address}-${index}`,
          label: result.formatted_address,
          result,
        })));
        setSearchStatus(results.length > 1 ? "Choose a matching place." : "");
      });
    }, 250);

    return () => {
      if (locationSearchTimeoutRef.current) {
        window.clearTimeout(locationSearchTimeoutRef.current);
      }
    };
  }, [mapStatus, search, selectedGeocodeSuggestion?.label]);

  useEffect(() => {
    if (mapStatus !== "ready" || !mapRef.current) return;
    if (isMobileMap && isMobileMapMoving) {
      detachMarkers();
      return;
    }

    const visibleRestaurants = isMobileMap
      ? mobileRestaurantsInView.filter((restaurant) => loadedMobileRestaurantIds.has(restaurant.id))
      : filteredRestaurants;
    visibleRestaurants.forEach((restaurant) => ensureRestaurantMarker(restaurant));

    const visibleIds = new Set(visibleRestaurants.map((restaurant) => restaurant.id));
    markerRefs.current.forEach((marker, id) => {
      marker.map = visibleIds.has(id) ? mapRef.current : null;
    });

    if (!isShowingPlaceSearch && filteredRestaurants.length === 1) {
      fitRestaurantBounds(mapRef.current, filteredRestaurants, 15);
    }
  }, [detachMarkers, ensureRestaurantMarker, filteredRestaurants, isMobileMap, isMobileMapMoving, isShowingPlaceSearch, loadedMobileRestaurantIds, mapStatus, mobileRestaurantsInView]);

  useEffect(() => {
    markerElementRefs.current.forEach((element, id) => {
      element.classList.toggle("is-mobile", Boolean(isMobileMap));
      element.classList.toggle("is-selected", id === selectedId);
    });
  }, [isMobileMap, selectedId]);

  function selectRestaurant(restaurant: Restaurant) {
    setSelectedId(restaurant.id);
    if (isMobileMap) {
      setIsResultsOpen(false);
      setLoadedMobileRestaurantIds((currentIds) => new Set(currentIds).add(restaurant.id));
    }
    mapRef.current?.panTo(restaurant.position);
    if ((mapRef.current?.getZoom() ?? 0) < 14) mapRef.current?.setZoom(14);
  }

  function loadMobileRestaurantsInArea() {
    if (!mobileRestaurantsInView.length) return;
    setLoadedMobileRestaurantIds((currentIds) => {
      const nextIds = new Set(currentIds);
      mobileRestaurantsInView.forEach((restaurant) => nextIds.add(restaurant.id));
      return nextIds;
    });
  }

  function applyGeocodeResult(result: google.maps.GeocoderResult) {
    const map = mapRef.current;
    if (!map) return;

    setSearch(result.formatted_address);
    setSearchStatus("");
    setGeocodeSuggestions([]);
    setSelectedId("");
    setIsShowingPlaceSearch(true);

    if (result.geometry.viewport) {
      map.fitBounds(result.geometry.viewport);
    } else {
      map.panTo(result.geometry.location);
      map.setZoom(13);
    }
    if (isMobileMap) setIsResultsOpen(false);
  }

  function applyGeocodeSuggestion(suggestion: GeocodeSuggestion) {
    setSearch(suggestion.label);
    setSelectedGeocodeSuggestion(suggestion);
    setGeocodeSuggestions([]);
    setSearchStatus("");
  }

  function runSearch(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const query = search.trim();
    const map = mapRef.current;
    if (!query || !map) return;

    if (selectedGeocodeSuggestion?.label === query) {
      applyGeocodeResult(selectedGeocodeSuggestion.result);
      return;
    }

    if (!geocoderRef.current) {
      geocoderRef.current = new google.maps.Geocoder();
    }

    setSearchStatus("Searching map...");
    void geocoderRef.current.geocode({ address: query }, (results, status) => {
      if (status !== "OK" || !results?.length) {
        setGeocodeSuggestions([]);
        setSearchStatus("No map location found.");
        return;
      }

      if (results.length > 1) {
        setGeocodeSuggestions(results.slice(0, 6).map((result, index) => ({
          id: `${result.place_id ?? result.formatted_address}-${index}`,
          label: result.formatted_address,
          result,
        })));
        setSearchStatus("Choose a matching place.");
        return;
      }

      applyGeocodeResult(results[0]);
    });
  }

  function clearFilters() {
    setActiveCategories([]);
    setActivePrice("All");
    setActiveHours("All");
    setHoursDate(defaultDateValue());
    setHoursTime(defaultTimeValue());
    setSearch("");
    setSearchStatus("");
    setGeocodeSuggestions([]);
    setSelectedGeocodeSuggestion(null);
    setIsShowingPlaceSearch(false);
  }

  function toggleCategory(category: string) {
    if (category === "All") {
      setActiveCategories([]);
      return;
    }

    setActiveCategories((currentCategories) =>
      currentCategories.includes(category)
        ? currentCategories.filter((currentCategory) => currentCategory !== category)
        : [...currentCategories, category],
    );
  }

  function openingStatus(restaurant: Restaurant) {
    if (restaurant.businessStatus === "CLOSED_TEMPORARILY") {
      return { label: "Temporarily closed", className: "is-temporarily-closed" };
    }
    if (!restaurant.openingHours) {
      return { label: "Hours awaiting sync", className: "" };
    }

    const checkingSelectedTime = activeHours === "OpenAtDateTime";
    const open = checkingSelectedTime
      ? isOpenAtDateTime(restaurant, selectedHoursDateTime)
      : isOpenNow(restaurant);

    return {
      label: checkingSelectedTime
        ? `${open ? "Open" : "Closed"} at ${new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(selectedHoursDateTime)}`
        : open ? "Open now" : "Closed now",
      className: open ? "is-open" : "",
    };
  }

  function downloadFilteredList() {
    const headers = ["Name", "Latitude", "Longitude", "Address", "Category", "Price", "Description", "Google Maps URL"];
    const rows = restaurantsInView.map((restaurant) => [
      restaurant.name,
      restaurant.position.lat,
      restaurant.position.lng,
      restaurant.address,
      restaurant.category,
      "$".repeat(restaurant.priceLevel),
      restaurant.description,
      googleMapsUrl(restaurant),
    ]);
    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "curtis-saved-places.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="restaurant-explorer" aria-label="Restaurant map and saved places">
      <div className="restaurant-filter-panel">
        <form className="restaurant-search" onSubmit={runSearch}>
          <label>
            <span>Search</span>
            <div className="restaurant-search-control">
              <input
                onChange={(event) => {
                  setSearch(event.target.value);
                  setSearchStatus("");
                  setGeocodeSuggestions([]);
                  setSelectedGeocodeSuggestion(null);
                  setIsShowingPlaceSearch(false);
                }}
                placeholder="City, town or address"
                type="search"
                value={search}
              />
              <button disabled={!search.trim() || mapStatus !== "ready"} type="submit">Go</button>
            </div>
          </label>
          {searchStatus && <span className="restaurant-search-status" role="status">{searchStatus}</span>}
          {geocodeSuggestions.length > 0 && (
            <div className="restaurant-search-suggestions" aria-label="Search suggestions">
              {geocodeSuggestions.map((suggestion) => (
                <button
                  className={selectedGeocodeSuggestion?.id === suggestion.id ? "is-selected" : ""}
                  key={suggestion.id}
                  onClick={() => applyGeocodeSuggestion(suggestion)}
                  type="button"
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          )}
        </form>
        <label>
          <span>Price</span>
          <select onChange={(event) => setActivePrice(event.target.value)} value={activePrice}>
            <option value="All">All prices</option>
            <option value="1">$</option>
            <option value="2">$$</option>
            <option value="3">$$$</option>
            <option value="4">$$$$</option>
          </select>
        </label>
        <label>
          <span>Hours</span>
          <select onChange={(event) => setActiveHours(event.target.value as HoursFilter)} value={activeHours}>
            <option value="All">All hours</option>
            <option value="OpenNow">Open now</option>
            <option value="OpenAtDateTime">Open at a specific date & time</option>
          </select>
        </label>
        <label>
          <span>Choose day</span>
          <select
            disabled={activeHours !== "OpenAtDateTime"}
            onChange={(event) => setHoursDate(event.target.value)}
            value={hoursDate}
          >
            {dateOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label>
          <span>Choose time</span>
          <select
            disabled={activeHours !== "OpenAtDateTime"}
            onChange={(event) => setHoursTime(event.target.value)}
            value={hoursTime}
          >
            {timeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <button className="restaurant-export" disabled={restaurantsInView.length === 0 || restaurantsInView.length > 2000} onClick={downloadFilteredList} type="button">
          Download filtered list ↓
        </button>
      </div>

      <div className="restaurant-filter-row" aria-label="Filter restaurants by category">
        {categories.map((category) => (
          <button
            className={`restaurant-filter ${(category === "All" ? activeCategories.length === 0 : activeCategories.includes(category)) ? "is-active" : ""}`}
            key={category}
            onClick={() => toggleCategory(category)}
            type="button"
          >
            {category}
          </button>
        ))}
      </div>

      <p className="restaurant-export-note">The downloaded CSV can be imported into Google My Maps. Google limits each imported layer to 2,000 rows. Opening-hours filters use the latest Google hours synced into this site, including specific date-and-time checks.</p>

      <div className="restaurant-map-layout">
        <div className="restaurant-map-shell">
          <div className="restaurant-map" ref={mapElementRef} />

          {shouldShowMobileLoadPinsButton && (
            <button className="restaurant-load-area" onClick={loadMobileRestaurantsInArea} type="button">
              Restaurants in this area
            </button>
          )}

          {!apiKey && (
            <div className="restaurant-map-message">
              <span aria-hidden="true">🗺️</span>
              <h2>Map setup is ready</h2>
              <p>Add your Google Maps API key to <code>.env.local</code> to load the interactive map.</p>
            </div>
          )}
          {apiKey && mapStatus === "loading" && <div className="restaurant-map-message"><p>Loading the map…</p></div>}
          {apiKey && mapStatus === "error" && (
            <div className="restaurant-map-message">
              <span aria-hidden="true">⚠️</span>
              <h2>The map could not load</h2>
              <p>Check that the API key allows this domain and that Maps JavaScript API is enabled.</p>
            </div>
          )}
          {mapStatus === "ready" && filteredRestaurants.length === 0 && (
            <div className="restaurant-map-empty"><p>No places match these filters.</p><button onClick={clearFilters} type="button">Clear filters</button></div>
          )}
          {mapStatus === "ready" && selectedRestaurant && (
            <article className="restaurant-map-card" aria-live="polite">
              <span className="restaurant-card-emoji" aria-hidden="true">{selectedRestaurant.emoji}</span>
              <div>
                <p>{selectedRestaurant.category} · {"$".repeat(selectedRestaurant.priceLevel)} · {selectedRestaurant.area}</p>
                <h2>{selectedRestaurant.name}</h2>
                {selectedRestaurant.businessStatus === "CLOSED_TEMPORARILY" && <span className="is-temporarily-closed">Temporarily closed</span>}
                {selectedRestaurant.description && <span>{selectedRestaurant.description}</span>}
              </div>
            </article>
          )}
        </div>

        <aside className={`restaurant-results ${isMobileMap ? "is-mobile" : ""} ${isResultsOpen ? "is-open" : ""}`} aria-label="Visible restaurants">
          <div className="restaurant-results-heading">
            <p>{restaurantsInView.length} places in this map area</p>
            <div className="restaurant-results-heading-actions">
              {hasFilters ? <button onClick={clearFilters} type="button">Clear filters</button> : <span>Saved places</span>}
              {isMobileMap ? (
                <button onClick={() => setIsResultsOpen((current) => !current)} type="button">
                  {isResultsOpen ? "Hide list" : "Show list"}
                </button>
              ) : null}
            </div>
          </div>
          <div className={`restaurant-results-list ${isMobileMap && !isResultsOpen ? "is-collapsed" : ""}`}>
            {listedRestaurants.map((restaurant) => {
              const status = openingStatus(restaurant);
              return (
              <article className={`restaurant-result ${restaurant.id === selectedRestaurant?.id ? "is-selected" : ""}`} key={restaurant.id}>
                <button className="restaurant-result-main" onClick={() => selectRestaurant(restaurant)} type="button">
                  <span className="restaurant-result-emoji" aria-hidden="true">{restaurant.emoji}</span>
                  <span className="restaurant-result-copy">
                    <strong>{restaurant.name}</strong>
                    <small>{restaurant.address} · {"$".repeat(restaurant.priceLevel)}</small>
                    <span className="restaurant-category-tags">
                      <small>{uniqueLabels([restaurant.category, ...restaurant.tags]).slice(0, 4).join(", ")}</small>
                    </span>
                    {restaurant.description && <span>{restaurant.description}</span>}
                  </span>
                </button>
                <div className="restaurant-result-meta">
                  <span className={status.className}>{status.label}</span>
                  <a href={googleMapsUrl(restaurant)} rel="noreferrer" target="_blank">Google Maps ↗</a>
                </div>
              </article>
              );
            })}
            {restaurantsInView.length > resultListLimit && (
              <p className="restaurant-results-limit">Showing the first {resultListLimit} places. Use search or filters to narrow the list.</p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
