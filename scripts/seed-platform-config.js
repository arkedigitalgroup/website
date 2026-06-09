/**
 * scripts/seed-platform-config.js
 *
 * Writes the single `platform_config/global` document to Firestore.
 * Run this ONCE before going live. Safe to re-run — uses set() with
 * merge:true so existing admin edits to other fields are preserved.
 *
 * Usage (from project root):
 *   node scripts/seed-platform-config.js
 *
 * Requires FIREBASE_SAK in your .env file.
 */

"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const admin = require("firebase-admin");

// ── Credentials ──────────────────────────────────────────────────────────────
// FIREBASE_SAK is the full service account JSON stored as a single env string.
const rawSak = process.env.FIREBASE_SAK;
if (!rawSak) {
    console.error(
        "✗  FIREBASE_SAK not found in .env\n" +
            "   Add: FIREBASE_SAK={...paste your service account JSON here...}",
    );
    process.exit(1);
}

let serviceAccount;
try {
    serviceAccount = JSON.parse(rawSak);
} catch (e) {
    console.error(
        "✗  FIREBASE_SAK is not valid JSON.\n" +
            "   Make sure the entire service account JSON is on one line with no extra quotes.\n" +
            "   Error: " +
            e.message,
    );
    process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
console.log(
    "✓  Firebase Admin initialised — project:",
    serviceAccount.project_id,
);

// ── Config values ─────────────────────────────────────────────────────────────
// These replace REGISTRATION_FEE_STUDENT, REGISTRATION_FEE_TEACHER,
// SERVICE_FEE, and the 0.85 ratio hardcoded in src/types/index.js.
// After seeding, admin edits these from the Admin Settings page — not here.

const platformConfig = {
    registrationFeeStudent: 0, // ETB — one-time fee on student registration
    registrationFeeTeacher: 0, // ETB — one-time activation fee for teachers
    serviceFeeMonthly: 100, // ETB — Arke's flat cut per student per month
    teacherPayoutRatio: 0.85, // teacher receives 85% of course price
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedBy: "seed-script",
};

// ── Write ─────────────────────────────────────────────────────────────────────
(async () => {
    console.log("\nWriting platform_config/global …");
    console.log(
        JSON.stringify(
            { ...platformConfig, updatedAt: "<serverTimestamp>" },
            null,
            2,
        ),
    );

    try {
        await db
            .collection("platform_config")
            .doc("global")
            .set(platformConfig, { merge: true });
        console.log("\n✓  platform_config/global written.");
        console.log("   Admin can now edit fees from the Admin Settings page.");
        console.log(
            "   All pages using usePlatformConfig() will update in real-time.\n",
        );
    } catch (err) {
        console.error("✗  Firestore write failed:", err.message);
        process.exit(1);
    }

    process.exit(0);
})();
