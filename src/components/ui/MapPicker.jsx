// src/components/ui/MapPicker.jsx
"use client";

import React from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import to load MapPickerInner only on the client-side to prevent SSR failures.
const MapPickerInner = dynamic(() => import('./MapPickerInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-navy-mid border border-navy-border rounded-md flex items-center justify-center text-text-secondary animate-pulse text-sm">
      Loading interactive map...
    </div>
  ),
});

export default function MapPicker(props) {
  return <MapPickerInner {...props} />;
}
