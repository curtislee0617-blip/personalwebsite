"use client";

import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Restaurant } from "@/data/restaurants";

type RestaurantExplorerProps = {
  apiKey: string;
  mapId: string;
  restaurants: Restaurant[];
};

type MapStatus = "idle" | "loading" | "ready" | "error";
type MapBounds = { north: number; south: number; east: number; west: number };

let mapsConfigured = false;
const resultListLimit = 250;

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

export function RestaurantExplorer({ apiKey, mapId, restaurants }: RestaurantExplorerProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRefs = useRef(new Map<string, google.maps.marker.AdvancedMarkerElement>());
  const markerElementRefs = useRef(new Map<string, HTMLElement>());
  const [activeCategory, setActiveCategory] = useState("All");
  const [activePrice, setActivePrice] = useState("All");
  const [activeLocation, setActiveLocation] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(restaurants[0]?.id ?? "");
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [mapStatus, setMapStatus] = useState<MapStatus>(apiKey ? "idle" : "error");

  const categories = useMemo(() => {
    const categoryCounts = restaurants.reduce((counts, restaurant) => {
      counts.set(restaurant.category, (counts.get(restaurant.category) ?? 0) + 1);
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
  const locations = useMemo(
    () => ["All", ...Array.from(new Set(restaurants.map((restaurant) => restaurant.area))).sort()],
    [restaurants],
  );

  const filteredRestaurants = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("en");
    return restaurants.filter((restaurant) => {
      const matchesCategory = activeCategory === "All" || restaurant.category === activeCategory;
      const matchesPrice = activePrice === "All" || restaurant.priceLevel === Number(activePrice);
      const matchesLocation = activeLocation === "All" || restaurant.area === activeLocation;
      const matchesSearch = !query || [restaurant.name, restaurant.area, restaurant.city, restaurant.category, ...restaurant.tags]
        .some((value) => value.toLocaleLowerCase("en").includes(query));
      return matchesCategory && matchesPrice && matchesLocation && matchesSearch;
    });
  }, [activeCategory, activeLocation, activePrice, restaurants, search]);

  const restaurantsInView = useMemo(
    () => mapBounds
      ? filteredRestaurants.filter((restaurant) => isWithinBounds(restaurant.position, mapBounds))
      : filteredRestaurants,
    [filteredRestaurants, mapBounds],
  );
  const selectedRestaurant = filteredRestaurants.find((restaurant) => restaurant.id === selectedId);
  const listedRestaurants = restaurantsInView.slice(0, resultListLimit);
  const hasFilters = activeCategory !== "All" || activePrice !== "All" || activeLocation !== "All" || search.length > 0;

  useEffect(() => {
    if (!apiKey || !mapElementRef.current) return;

    let cancelled = false;
    const markers = markerRefs.current;
    const markerElements = markerElementRefs.current;

    async function initialiseMap() {
      setMapStatus("loading");

      try {
        if (!mapsConfigured) {
          setOptions({ key: apiKey, v: "weekly", mapIds: [mapId] });
          mapsConfigured = true;
        }

        const [{ Map }, { AdvancedMarkerElement, PinElement }] = await Promise.all([
          importLibrary("maps"),
          importLibrary("marker"),
        ]);

        if (cancelled || !mapElementRef.current) return;

        const map = new Map(mapElementRef.current, {
          center: { lat: 22.3027, lng: 114.1772 },
          zoom: 12,
          mapId,
          gestureHandling: "cooperative",
          isFractionalZoomEnabled: true,
          clickableIcons: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });

        mapRef.current = map;
        map.addListener("click", () => setSelectedId(""));
        map.addListener("idle", () => {
          const nextBounds = map.getBounds()?.toJSON();
          if (!nextBounds) return;
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
        });

        restaurants.forEach((restaurant) => {
          const pin = new PinElement({
            background: "#f7f5ef",
            borderColor: "#20231f",
            glyphText: restaurant.emoji,
            scale: 1.12,
          });
          const markerElement = document.createElement("div");
          markerElement.className = "restaurant-map-marker";
          markerElement.append(pin);

          const label = document.createElement("span");
          label.className = "restaurant-map-marker-label";
          label.textContent = restaurant.name;
          markerElement.append(label);

          const marker = new AdvancedMarkerElement({
            map,
            position: restaurant.position,
            title: `${restaurant.name}, ${restaurant.area}`,
            gmpClickable: true,
          });

          marker.append(markerElement);
          marker.addEventListener("gmp-click", () => setSelectedId(restaurant.id));
          markers.set(restaurant.id, marker);
          markerElements.set(restaurant.id, markerElement);
        });

        setMapStatus("ready");
      } catch (error) {
        console.error("Google Maps failed to load", error);
        setMapStatus("error");
      }
    }

    void initialiseMap();

    return () => {
      cancelled = true;
      markers.forEach((marker) => { marker.map = null; });
      markers.clear();
      markerElements.clear();
      mapRef.current = null;
    };
  }, [apiKey, mapId, restaurants]);

  useEffect(() => {
    if (mapStatus !== "ready" || !mapRef.current) return;

    const filteredIds = new Set(filteredRestaurants.map((restaurant) => restaurant.id));
    markerRefs.current.forEach((marker, id) => {
      marker.map = filteredIds.has(id) ? mapRef.current : null;
    });

    if (filteredRestaurants.length === 1) {
      mapRef.current.panTo(filteredRestaurants[0].position);
      if ((mapRef.current.getZoom() ?? 0) < 15) mapRef.current.setZoom(15);
    }
  }, [filteredRestaurants, mapStatus]);

  useEffect(() => {
    markerElementRefs.current.forEach((element, id) => {
      element.classList.toggle("is-selected", id === selectedId);
    });
  }, [selectedId]);

  function selectRestaurant(restaurant: Restaurant) {
    setSelectedId(restaurant.id);
    mapRef.current?.panTo(restaurant.position);
    if ((mapRef.current?.getZoom() ?? 0) < 14) mapRef.current?.setZoom(14);
  }

  function clearFilters() {
    setActiveCategory("All");
    setActivePrice("All");
    setActiveLocation("All");
    setSearch("");
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
        <label className="restaurant-search">
          <span>Search</span>
          <input onChange={(event) => setSearch(event.target.value)} placeholder="Name, cuisine or area" type="search" value={search} />
        </label>
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
          <span>Location</span>
          <select onChange={(event) => setActiveLocation(event.target.value)} value={activeLocation}>
            {locations.map((location) => <option key={location}>{location === "All" ? "All locations" : location}</option>)}
          </select>
        </label>
        <button className="restaurant-export" disabled={restaurantsInView.length === 0 || restaurantsInView.length > 2000} onClick={downloadFilteredList} type="button">
          Download filtered list ↓
        </button>
      </div>

      <div className="restaurant-filter-row" aria-label="Filter restaurants by category">
        {categories.map((category) => (
          <button
            className={`restaurant-filter ${category === activeCategory ? "is-active" : ""}`}
            key={category}
            onClick={() => setActiveCategory(category)}
            type="button"
          >
            {category}
          </button>
        ))}
      </div>

      <p className="restaurant-export-note">The downloaded CSV can be imported into Google My Maps. Google limits each imported layer to 2,000 rows.</p>

      <div className="restaurant-map-layout">
        <div className="restaurant-map-shell">
          <div className="restaurant-map" ref={mapElementRef} />

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

        <aside className="restaurant-results" aria-label="Visible restaurants">
          <div className="restaurant-results-heading">
            <p>{restaurantsInView.length} places in this map area</p>
            {hasFilters ? <button onClick={clearFilters} type="button">Clear filters</button> : <span>Saved places</span>}
          </div>
          <div className="restaurant-results-list">
            {listedRestaurants.map((restaurant) => (
              <article className={`restaurant-result ${restaurant.id === selectedRestaurant?.id ? "is-selected" : ""}`} key={restaurant.id}>
                <button className="restaurant-result-main" onClick={() => selectRestaurant(restaurant)} type="button">
                  <span className="restaurant-result-emoji" aria-hidden="true">{restaurant.emoji}</span>
                  <span className="restaurant-result-copy">
                    <strong>{restaurant.name}</strong>
                    <small>{restaurant.address} · {"$".repeat(restaurant.priceLevel)}</small>
                    {restaurant.description && <span>{restaurant.description}</span>}
                    <span className="restaurant-tags">
                      {restaurant.tags.map((tag) => <small key={tag}>{tag}</small>)}
                    </span>
                  </span>
                </button>
                <div className="restaurant-result-meta">
                  <span className={restaurant.businessStatus === "CLOSED_TEMPORARILY" ? "is-temporarily-closed" : restaurant.openingHours?.openNow ? "is-open" : ""}>
                    {restaurant.businessStatus === "CLOSED_TEMPORARILY"
                      ? "Temporarily closed"
                      : restaurant.openingHours ? (restaurant.openingHours.openNow ? "Open now" : "Closed") : "Hours awaiting sync"}
                  </span>
                  <a href={googleMapsUrl(restaurant)} rel="noreferrer" target="_blank">Google Maps ↗</a>
                </div>
              </article>
            ))}
            {restaurantsInView.length > resultListLimit && (
              <p className="restaurant-results-limit">Showing the first {resultListLimit} places. Use search or filters to narrow the list.</p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
