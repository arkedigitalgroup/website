// src/components/ui/MapPickerInner.jsx
"use client";

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function MapPickerInner({ value, onChange, label = "Pin Location" }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  
  // Default coordinates (Addis Ababa, Ethiopia)
  const defaultLat = value?.lat || 9.03;
  const defaultLng = value?.lng || 38.74;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map if not initialized yet
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([defaultLat, defaultLng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);

      // Custom icon setup to prevent missing icon image error in Leaflet Webpack builds
      const DefaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      L.Marker.prototype.options.icon = DefaultIcon;

      // Add a marker at default location
      markerRef.current = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(mapRef.current);

      // Handle marker drag end
      markerRef.current.on('dragend', () => {
        const position = markerRef.current.getLatLng();
        onChange?.({ lat: position.lat, lng: position.lng });
      });

      // Handle map click
      mapRef.current.on('click', (e) => {
        const { lat, lng } = e.latlng;
        markerRef.current.setLatLng([lat, lng]);
        onChange?.({ lat, lng });
      });
    }

    return () => {
      // Clean up map when component unmounts
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update marker position if value changes externally
  useEffect(() => {
    if (markerRef.current && value) {
      const currentPos = markerRef.current.getLatLng();
      if (currentPos.lat !== value.lat || currentPos.lng !== value.lng) {
        markerRef.current.setLatLng([value.lat, value.lng]);
        mapRef.current?.setView([value.lat, value.lng]);
      }
    }
  }, [value]);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          onChange?.({ lat, lng });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-text-secondary uppercase">
        <span>{label}</span>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="text-gold-primary hover:underline font-bold normal-case flex items-center space-x-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Locate Me</span>
        </button>
      </div>
      <div 
        ref={mapContainerRef} 
        className="w-full h-64 border border-navy-border rounded-lg overflow-hidden shadow-inner bg-navy-mid z-10"
      />
    </div>
  );
}
