// src/hooks/useAdminBadges.js
// Live counts of things waiting for admin action, shown as sidebar badges.
"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

const WATCHES = {
    receipts: query(collection(db, "payments"), where("status", "==", "submitted")),
    fees: query(collection(db, "registrationFees"), where("status", "==", "submitted")),
    teachers: query(collection(db, "users"), where("role", "==", "teacher"), where("status", "==", "pending")),
};

export function useAdminBadges(enabled) {
    const [counts, setCounts] = useState({ receipts: 0, fees: 0, teachers: 0 });
    useEffect(() => {
        if (!enabled) return;
        const stops = Object.entries(WATCHES).map(([key, q]) =>
            onSnapshot(
                q,
                (snap) => setCounts((c) => ({ ...c, [key]: snap.size })),
                (err) => console.error(`[useAdminBadges] ${key}:`, err),
            ),
        );
        return () => stops.forEach((stop) => stop());
    }, [enabled]);
    return counts;
}
