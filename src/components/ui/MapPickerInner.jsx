// // src/components/ui/MapPickerInner.jsx
// "use client";

// import React, { useEffect, useRef, useState } from 'react';
// import L from 'leaflet';
// import { useLanguage } from '../../context/LanguageContext';

// export default function MapPickerInner({ value, onChange, label = "Pin Location" }) {
//   const { lang } = useLanguage();
//   const mapContainerRef = useRef(null);
//   const mapRef = useRef(null);
//   const markerRef = useRef(null);

//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchLoading, setSearchLoading] = useState(false);
//   const [searchError, setSearchError] = useState("");

//   // Default coordinates (Addis Ababa, Ethiopia)
//   const defaultLat = value?.lat || 9.03;
//   const defaultLng = value?.lng || 38.74;

//   useEffect(() => {
//     if (!mapContainerRef.current) return;

//     // Initialize Leaflet map if not initialized yet
//     if (!mapRef.current) {
//       mapRef.current = L.map(mapContainerRef.current).setView([defaultLat, defaultLng], 13);

//       L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution: '&copy; OpenStreetMap contributors'
//       }).addTo(mapRef.current);

//       // Custom icon setup to prevent missing icon image error in Leaflet Webpack builds
//       const DefaultIcon = L.icon({
//         iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
//         shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
//         iconSize: [25, 41],
//         iconAnchor: [12, 41],
//         popupAnchor: [1, -34],
//         shadowSize: [41, 41]
//       });
//       L.Marker.prototype.options.icon = DefaultIcon;

//       // Add a marker at default location
//       markerRef.current = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(mapRef.current);

//       // Handle marker drag end
//       markerRef.current.on('dragend', () => {
//         const position = markerRef.current.getLatLng();
//         onChange?.({ lat: position.lat, lng: position.lng });
//       });

//       // Handle map click
//       mapRef.current.on('click', (e) => {
//         const { lat, lng } = e.latlng;
//         markerRef.current.setLatLng([lat, lng]);
//         onChange?.({ lat, lng });
//       });

//       // Invalidate map size after a short delay to ensure correct rendering in the DOM
//       setTimeout(() => {
//         mapRef.current?.invalidateSize();
//       }, 300);
//     }

//     return () => {
//       // Clean up map when component unmounts
//       if (mapRef.current) {
//         mapRef.current.remove();
//         mapRef.current = null;
//       }
//     };
//   }, []);

//   // Update marker position if value changes externally
//   useEffect(() => {
//     if (markerRef.current && value) {
//       const currentPos = markerRef.current.getLatLng();
//       if (currentPos.lat !== value.lat || currentPos.lng !== value.lng) {
//         markerRef.current.setLatLng([value.lat, value.lng]);
//         mapRef.current?.setView([value.lat, value.lng]);

//         // Force size recalculation
//         mapRef.current?.invalidateSize();
//       }
//     }
//   }, [value]);

//   const handleGetCurrentLocation = () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const lat = position.coords.latitude;
//           const lng = position.coords.longitude;
//           onChange?.({ lat, lng });
//           mapRef.current?.setView([lat, lng], 15);
//           markerRef.current?.setLatLng([lat, lng]);
//           mapRef.current?.invalidateSize();
//         },
//         (error) => {
//           console.error("Error getting location:", error);
//           setSearchError(
//             lang === "am"
//               ? "የጂኦሎኬሽን ፈቃድ አልተሰጠም ወይም ግንኙነቱ አስተማማኝ አይደለም። እባክዎ ከላይ ያለውን መፈለጊያ ሳጥን ይጠቀሙ።"
//               : "Geolocation denied or insecure connection. Please use the search bar above instead."
//           );
//         }
//       );
//     } else {
//       setSearchError(
//         lang === "am"
//           ? "የአሳሽዎ ጂኦሎኬሽን አገልግሎት አይሰራም።"
//           : "Geolocation is not supported by your browser."
//       );
//     }
//   };

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     if (!searchQuery.trim()) return;

//     setSearchLoading(true);
//     setSearchError("");

//     try {
//       const response = await fetch(
//         `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
//           searchQuery.trim()
//         )}`
//       );
//       const data = await response.json();

//       if (data && data.length > 0) {
//         const lat = parseFloat(data[0].lat);
//         const lng = parseFloat(data[0].lon);

//         onChange?.({ lat, lng });
//         mapRef.current?.setView([lat, lng], 15);
//         markerRef.current?.setLatLng([lat, lng]);
//         mapRef.current?.invalidateSize();
//       } else {
//         setSearchError("No results found. Try a broader search (e.g. Bole, Addis Ababa).");
//       }
//     } catch (err) {
//       console.error("Geocoding search failed:", err);
//       setSearchError("Search failed. Please check network connection.");
//     } finally {
//       setSearchLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-3">
//       <div className="flex items-center justify-between text-xs font-semibold text-text-secondary uppercase">
//         <span>{label}</span>
//         <button
//           type="button"
//           onClick={handleGetCurrentLocation}
//           className="text-gold-primary hover:text-gold-hover hover:underline font-bold normal-case flex items-center space-x-1"
//         >
//           <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//           </svg>
//           <span>Locate Me</span>
//         </button>
//       </div>

//       {/* Geocoding Search Input */}
//       <div className="flex gap-2">
//         <input
//           type="text"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           placeholder="Search location (e.g. Bole, Addis Ababa)"
//           className="flex-grow px-3 py-1.5 bg-navy-mid border border-navy-border rounded-md text-white text-xs placeholder-text-muted focus:outline-none focus:border-gold-primary"
//           onKeyDown={(e) => {
//             if (e.key === "Enter") {
//               handleSearch(e);
//             }
//           }}
//         />
//         <button
//           type="button"
//           onClick={handleSearch}
//           disabled={searchLoading}
//           className="px-4 py-1.5 bg-gold-primary hover:bg-gold-hover text-navy-deep font-bold rounded-md text-xs transition-colors disabled:opacity-50"
//         >
//           {searchLoading ? "..." : "Search"}
//         </button>
//       </div>

//       {searchError && (
//         <p className="text-[10px] text-error font-semibold">⚠️ {searchError}</p>
//       )}

//       <div
//         ref={mapContainerRef}
//         className="w-full h-64 border border-navy-border rounded-lg overflow-hidden shadow-inner bg-navy-mid z-10"
//       />
//     </div>
//   );
// }

// src/components/ui/MapPickerInner.jsx
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import { useLanguage } from "../../context/LanguageContext";

const DEFAULT_LAT = 9.03;
const DEFAULT_LNG = 38.74;
const DEFAULT_ZOOM = 13;

export default function MapPickerInner({
    value,
    onChange,
    label = "Pin Location",
}) {
    const { lang } = useLanguage();

    // Modal state
    const [isOpen, setIsOpen] = useState(false);

    // Internal draft state — only committed to parent on "Confirm"
    const [draft, setDraft] = useState(null);

    // Search
    const [searchQuery, setSearchQuery] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState("");

    // Map refs
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    // ─── Map bootstrap (runs once when modal opens) ──────────────────────────
    useEffect(() => {
        if (!isOpen || !mapContainerRef.current) return;
        if (mapRef.current) return; // already initialized

        const startLat = value?.lat ?? DEFAULT_LAT;
        const startLng = value?.lng ?? DEFAULT_LNG;

        mapRef.current = L.map(mapContainerRef.current).setView(
            [startLat, startLng],
            DEFAULT_ZOOM,
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
        }).addTo(mapRef.current);

        const DefaultIcon = L.icon({
            iconUrl:
                "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            shadowUrl:
                "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
        });
        L.Marker.prototype.options.icon = DefaultIcon;

        markerRef.current = L.marker([startLat, startLng]).addTo(
            mapRef.current,
        );

        setDraft({ lat: startLat, lng: startLng });

        setTimeout(() => mapRef.current?.invalidateSize(), 300);

        return () => {
            // Cleanup on unmount only — not on every re-render
        };
    }, [isOpen]);

    // ─── Tear down map when modal closes ─────────────────────────────────────
    const closeModal = useCallback(() => {
        setIsOpen(false);
        setSearchQuery("");
        setSearchError("");

        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
            markerRef.current = null;
        }
    }, []);

    // ─── Search handler ───────────────────────────────────────────────────────
    const handleSearch = async (e) => {
        e?.preventDefault();
        const q = searchQuery.trim();
        if (!q) return;

        setSearchLoading(true);
        setSearchError("");

        try {
            // Replace the fetch line inside handleSearch with this:

            const biasedQuery =
                q.split(/[\s,]+/).filter(Boolean).length <= 2
                    ? `${q}, Addis Ababa`
                    : q;

            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&limit=1` +
                    `&q=${encodeURIComponent(biasedQuery)}` +
                    `&viewbox=38.6500,9.2000,38.9000,8.8500` +
                    `&bounded=1`,
            );
            const data = await res.json();

            if (!data || data.length === 0) {
                setSearchError(
                    lang === "am"
                        ? "ምንም ውጤት አልተገኘም። ሌላ አካባቢ ስም ይሞክሩ (ለምሳሌ: ቦሌ፣ ፒያሳ)።"
                        : "No results found in Addis Ababa. Try a neighborhood name (e.g. Bole, Piassa).",
                );
                return;
            }

            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            const label = data[0].display_name;

            // Move map + marker to result
            mapRef.current?.setView([lat, lng], 15);
            markerRef.current?.setLatLng([lat, lng]);
            mapRef.current?.invalidateSize();

            // Stage as draft (not yet committed to parent)
            setDraft({ lat, lng, label });
        } catch (err) {
            console.error("Geocoding search failed:", err);
            setSearchError(
                lang === "am"
                    ? "ፍለጋው አልተሳካም። የኔትወርክ ግንኙነቱን ያረጋግጡ።"
                    : "Search failed. Please check your network connection.",
            );
        } finally {
            setSearchLoading(false);
        }
    };

    // ─── Confirm: push draft to parent and close ──────────────────────────────
    const handleConfirm = () => {
        if (draft) {
            onChange?.(draft);
        }
        closeModal();
    };

    // ─── Display label for the trigger button ────────────────────────────────
    const displayLabel = value?.label
        ? value.label.split(",").slice(0, 2).join(",") // first two segments of address
        : null;

    return (
        <>
            {/* ── Trigger button ─────────────────────────────────────────────── */}
            <div className="space-y-1.5">
                <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wide">
                    {label}
                </span>

                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 bg-navy-mid border border-navy-border rounded-md text-sm text-left transition-colors hover:border-gold-primary focus:outline-none focus:border-gold-primary"
                >
                    <svg
                        className="w-4 h-4 text-gold-primary flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                    <span
                        className={
                            displayLabel
                                ? "text-white truncate"
                                : "text-text-muted"
                        }
                    >
                        {displayLabel ??
                            (lang === "am"
                                ? "ቦታ ይምረጡ..."
                                : "Select a location...")}
                    </span>
                </button>
            </div>

            {/* ── Modal ──────────────────────────────────────────────────────────── */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closeModal();
                    }}
                >
                    <div className="w-full max-w-xl bg-navy-deep border border-navy-border rounded-xl shadow-2xl flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-navy-border">
                            <h3 className="text-sm font-semibold text-white">
                                {lang === "am" ? "ቦታ ይምረጡ" : "Select Location"}
                            </h3>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-text-secondary hover:text-white transition-colors"
                                aria-label="Close"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Search bar */}
                        <div className="px-4 pt-3 pb-2 space-y-1.5">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        e.key === "Enter" && handleSearch(e)
                                    }
                                    placeholder={
                                        lang === "am"
                                            ? "አካባቢ ፈልጉ (ለምሳሌ: ቦሌ, አዲስ አበባ)"
                                            : "Search area (e.g. Bole, Addis Ababa)"
                                    }
                                    className="flex-grow px-3 py-1.5 bg-navy-mid border border-navy-border rounded-md text-white text-xs placeholder-text-muted focus:outline-none focus:border-gold-primary"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={handleSearch}
                                    disabled={searchLoading}
                                    className="px-4 py-1.5 bg-gold-primary hover:bg-gold-hover text-navy-deep font-bold rounded-md text-xs transition-colors disabled:opacity-50"
                                >
                                    {searchLoading
                                        ? "..."
                                        : lang === "am"
                                          ? "ፈልግ"
                                          : "Search"}
                                </button>
                            </div>

                            {searchError && (
                                <p className="text-[10px] text-error font-semibold">
                                    ⚠️ {searchError}
                                </p>
                            )}

                            {draft?.label && (
                                <p className="text-[10px] text-text-secondary truncate">
                                    📍 {draft.label}
                                </p>
                            )}
                        </div>

                        {/* Map */}
                        <div
                            ref={mapContainerRef}
                            className="w-full h-72 bg-navy-mid z-10"
                        />

                        {/* Footer */}
                        <div className="px-4 py-3 border-t border-navy-border flex items-center justify-between gap-3">
                            <p className="text-[11px] text-text-secondary">
                                {lang === "am"
                                    ? "ፈልጉ ካርታውን ወደ ቦታው ይውሰደዋል"
                                    : "Search moves the map to your area"}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-1.5 border border-navy-border text-text-secondary hover:text-white rounded-md text-xs transition-colors"
                                >
                                    {lang === "am" ? "ይቅር" : "Cancel"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirm}
                                    disabled={!draft}
                                    className="px-4 py-1.5 bg-gold-primary hover:bg-gold-hover text-navy-deep font-bold rounded-md text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {lang === "am"
                                        ? "ቦታ አረጋግጥ"
                                        : "Confirm Location"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
