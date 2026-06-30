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

let mapsConfigured = false;

function googleMapsUrl(restaurant: Restaurant) {
  if (restaurant.googleMapsUrl) return restaurant.googleMapsUrl;
  const query = `${restaurant.name}, ${restaurant.address}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function csvCell(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export function RestaurantExplorer({ apiKey, mapId, restaurants }: RestaurantExplorerProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRefs = useRef(new Map<string, google.maps.marker.AdvancedMarkerElement>());
  const [activeCategory, setActiveCategory] = useState("All");
  const [activePrice, setActivePrice] = useState("All");
  const [activeLocation, setActiveLocation] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(restaurants[0]?.id ?? "");
  const [mapStatus, setMapStatus] = useState<MapStatus>(apiKey ? "idle" : "error");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(restaurants.map((restaurant) => restaurant.category))).sort()],
    [restaurants],
  );
  const locations = useMemo(
    () => ["All", ...Array.from(new Set(restaurants.map((restaurant) => restaurant.area))).sort()],
    [restaurants],
  );

  const visibleRestaurants = useMemo(() => {
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

  const selectedRestaurant = visibleRestaurants.find((restaurant) => restaurant.id === selectedId) ?? visibleRestaurants[0];
  const hasFilters = activeCategory !== "All" || activePrice !== "All" || activeLocation !== "All" || search.length > 0;

  useEffect(() => {
    if (!apiKey || !mapElementRef.current) return;

    let cancelled = false;
    const markers = markerRefs.current;

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
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });

        mapRef.current = map;

        restaurants.forEach((restaurant) => {
          const pin = new PinElement({
            background: "#f7f5ef",
            borderColor: "#20231f",
            glyphText: restaurant.emoji,
            scale: 1.12,
          });
          const marker = new AdvancedMarkerElement({
            map,
            position: restaurant.position,
            title: `${restaurant.name}, ${restaurant.area}`,
            gmpClickable: true,
          });

          marker.append(pin);
          marker.addEventListener("gmp-click", () => setSelectedId(restaurant.id));
          markers.set(restaurant.id, marker);
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
      mapRef.current = null;
    };
  }, [apiKey, mapId, restaurants]);

  useEffect(() => {
    if (mapStatus !== "ready" || !mapRef.current) return;

    const visibleIds = new Set(visibleRestaurants.map((restaurant) => restaurant.id));
    markerRefs.current.forEach((marker, id) => {
      marker.map = visibleIds.has(id) ? mapRef.current : null;
    });

    if (visibleRestaurants.length === 0) return;
    if (visibleRestaurants.length === 1) {
      mapRef.current.setCenter(visibleRestaurants[0].position);
      mapRef.current.setZoom(15);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    visibleRestaurants.forEach((restaurant) => bounds.extend(restaurant.position));
    mapRef.current.fitBounds(bounds, 56);
  }, [mapStatus, visibleRestaurants]);

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
    const rows = visibleRestaurants.map((restaurant) => [
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
        <button className="restaurant-export" disabled={visibleRestaurants.length === 0 || visibleRestaurants.length > 2000} onClick={downloadFilteredList} type="button">
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
          {mapStatus === "ready" && visibleRestaurants.length === 0 && (
            <div className="restaurant-map-empty"><p>No places match these filters.</p><button onClick={clearFilters} type="button">Clear filters</button></div>
          )}
          {mapStatus === "ready" && selectedRestaurant && (
            <article className="restaurant-map-card" aria-live="polite">
              <span className="restaurant-card-emoji" aria-hidden="true">{selectedRestaurant.emoji}</span>
              <div>
                <p>{selectedRestaurant.category} · {"$".repeat(selectedRestaurant.priceLevel)} · {selectedRestaurant.area}</p>
                <h2>{selectedRestaurant.name}</h2>
                {selectedRestaurant.description && <span>{selectedRestaurant.description}</span>}
              </div>
            </article>
          )}
        </div>

        <aside className="restaurant-results" aria-label="Visible restaurants">
          <div className="restaurant-results-heading">
            <p>{visibleRestaurants.length} places</p>
            {hasFilters ? <button onClick={clearFilters} type="button">Clear filters</button> : <span>Saved places</span>}
          </div>
          <div className="restaurant-results-list">
            {visibleRestaurants.map((restaurant) => (
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
                  <span className={restaurant.openingHours?.openNow ? "is-open" : ""}>
                    {restaurant.openingHours ? (restaurant.openingHours.openNow ? "Open now" : "Closed") : "Hours awaiting sync"}
                  </span>
                  <a href={googleMapsUrl(restaurant)} rel="noreferrer" target="_blank">Google Maps ↗</a>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
