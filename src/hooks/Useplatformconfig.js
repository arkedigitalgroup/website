// src/hooks/usePlatformConfig.js
//
// Real-time listener on platform_config/global.
//
// WHY onSnapshot instead of getDocs?
//   getDocs is a one-shot read. If the admin changes a fee while the finance
//   page is open, the page shows stale numbers until the user refreshes.
//   onSnapshot keeps a persistent WebSocket connection — the moment admin
//   saves a new value, every open tab updates automatically with no refresh.
//
// WHERE this is used:
//   - Admin Finance page  (calculates payouts from live config)
//   - Admin Settings page (displays and edits config values)
//   - Registration page   (shows registration fees to new users)
//
// HOW calc functions work:
//   calcFinancials(config, coursePrice) is a pure function — it accepts the
//   config object returned by this hook and returns all derived numbers.
//   No constants are imported anywhere else in the app.

"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

// Default values are used only while the first Firestore snapshot is loading.
// They match the seeded values so the UI never shows 0 during the brief load.
const DEFAULT_CONFIG = {
    registrationFeeStudent: 0,
    registrationFeeTeacher: 0,
    serviceFeeMonthly:      100,
    teacherPayoutRatio:     0.85,
};

/**
 * Returns live platform config from Firestore.
 *
 * @returns {{
 *   config: {
 *     registrationFeeStudent: number,
 *     registrationFeeTeacher: number,
 *     serviceFeeMonthly:      number,
 *     teacherPayoutRatio:     number,
 *     updatedAt:              import('firebase/firestore').Timestamp | null,
 *     updatedBy:              string | null,
 *   },
 *   loading: boolean,
 *   error:   Error | null,
 * }}
 */
export function usePlatformConfig() {
    const [config, setConfig]   = useState(DEFAULT_CONFIG);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    useEffect(() => {
        const ref = doc(db, "platform_config", "global");

        const unsubscribe = onSnapshot(
            ref,
            (snapshot) => {
                if (snapshot.exists()) {
                    // Merge with defaults so missing fields never cause NaN in calcs
                    setConfig({ ...DEFAULT_CONFIG, ...snapshot.data() });
                } else {
                    // Document doesn't exist yet — use defaults and warn once
                    console.warn(
                        "[usePlatformConfig] platform_config/global not found. " +
                        "Run scripts/seed-platform-config.js to create it."
                    );
                    setConfig(DEFAULT_CONFIG);
                }
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error("[usePlatformConfig] Firestore error:", err);
                setError(err);
                setLoading(false);
            }
        );

        // Clean up the listener when the component unmounts
        return () => unsubscribe();
    }, []); // no deps — this listener is stable for the component's lifetime

    return { config, loading, error };
}

// ── Pure financial calculation functions ────────────────────────────────────
//
// These replace the hardcoded calcMonthlyTotal / calcCompanyRevenue /
// calcTeacherPayout functions in src/types/index.ts.
//
// WHY pure functions that accept config instead of reading from a hook?
//   Hooks can only be called at the top of a React component. Financial
//   calculations also happen in loops (mapping over payments, mapping over
//   teachers × students). Pure functions work anywhere — inside .map(),
//   inside reduce(), inside a util file, inside a test.
//
// Usage:
//   const { config } = usePlatformConfig();
//   const payout = calcTeacherPayout(config, student.coursePrice);

/**
 * Total amount billed to parent per month.
 * = coursePrice + serviceFeeMonthly
 */
export function calcMonthlyTotal(config, coursePrice) {
    return coursePrice + config.serviceFeeMonthly;
}

/**
 * Arke's revenue per student per month.
 * = (coursePrice × (1 - teacherPayoutRatio)) + serviceFeeMonthly
 *
 * Example with defaults: coursePrice=4200
 *   = (4200 × 0.15) + 100 = 630 + 100 = 730 ETB
 */
export function calcCompanyRevenue(config, coursePrice) {
    return (coursePrice * (1 - config.teacherPayoutRatio)) + config.serviceFeeMonthly;
}

/**
 * Teacher's net payout per student per month.
 * = coursePrice × teacherPayoutRatio
 *
 * Example with defaults: coursePrice=4200
 *   = 4200 × 0.85 = 3570 ETB
 */
export function calcTeacherPayout(config, coursePrice) {
    return coursePrice * config.teacherPayoutRatio;
}
