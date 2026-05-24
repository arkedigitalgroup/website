// src/components/dashboard/MatchingMapInner.jsx
"use client";

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function MatchingMapInner({ students, teachers, selectedStudent, onSelectStudent, onSelectTeacher }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});

  // Default coordinate (Addis Ababa)
  const defaultLat = 9.03;
  const defaultLng = 38.74;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([defaultLat, defaultLng], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Markers when students, teachers, or selectedStudent change
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach((marker) => {
      mapRef.current.removeLayer(marker);
    });
    markersRef.current = {};

    // Custom Icons setup
    const StudentIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const SelectedStudentIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [28, 45],
      iconAnchor: [14, 45],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const TeacherIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Draw Teachers
    teachers.forEach((t) => {
      if (t.locationPin && t.locationPin.lat) {
        const marker = L.marker([t.locationPin.lat, t.locationPin.lng], { icon: TeacherIcon })
          .addTo(mapRef.current)
          .bindPopup(`<b>Teacher: ${t.fullName}</b><br/>ID: ${t.serviceId}<br/>Rating: ${t.rating} ⭐`);
        
        marker.on('click', () => {
          onSelectTeacher?.(t);
        });

        markersRef.current[`teacher-${t.id}`] = marker;
      }
    });

    // Draw Students
    students.forEach((s) => {
      if (s.locationPin && s.locationPin.lat) {
        const isSelected = selectedStudent && selectedStudent.id === s.id;
        const icon = isSelected ? SelectedStudentIcon : StudentIcon;
        
        const marker = L.marker([s.locationPin.lat, s.locationPin.lng], { icon: icon })
          .addTo(mapRef.current)
          .bindPopup(`<b>Student: ${s.fullName}</b><br/>Course: ${s.courseId}<br/>Status: ${s.assignedTeacherId ? 'Matched' : 'Unmatched'}`);

        marker.on('click', () => {
          onSelectStudent?.(s);
        });

        markersRef.current[`student-${s.id}`] = marker;

        if (isSelected) {
          // Centering and panning to selected student
          mapRef.current.setView([s.locationPin.lat, s.locationPin.lng], 13);
          marker.openPopup();
        }
      }
    });

  }, [students, teachers, selectedStudent]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full border border-navy-border rounded-xl overflow-hidden shadow-inner bg-navy-mid"
      style={{ minHeight: '450px' }}
    />
  );
}
