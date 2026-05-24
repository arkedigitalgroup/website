// src/components/dashboard/MatchingMap.jsx
"use client";

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import MatchingMapInner to bypass Server-Side Rendering (SSR) issues with Leaflet
const MatchingMapInner = dynamic(() => import('./MatchingMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[450px] bg-navy-mid border border-navy-border rounded-xl flex flex-col items-center justify-center text-text-secondary animate-pulse text-sm">
      <div className="w-8 h-8 border-4 border-gold-primary border-t-transparent rounded-full animate-spin mb-4" />
      <span>Loading matching coordinates map...</span>
    </div>
  ),
});

export default function MatchingMap(props) {
  return <MatchingMapInner {...props} />;
}
