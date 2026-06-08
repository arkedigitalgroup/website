/**
 * seed-platform-config.js
 *
 * Writes the single `platform_config/global` document to Firestore.
 * Run this ONCE before going live. Re-running is safe — it uses set()
 * with merge:true so existing admin edits are not overwritten if you
 * only want to add a new field later.
 *
 * Usage:
 *   node seed-platform-config.js
 *
 * Requires:
 *   GOOGLE_APPLICATION_CREDENTIALS env var pointing to your Firebase
 *   service account JSON, OR set SERVICE_ACCOUNT_PATH below.
 *
 * The values below match the numbers currently hardcoded in
 * src/types/index.js  — change them here, then delete that file.
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { createRequire } from "module";
import { existsSync } from "fs";
import { resolve } from "path";

// ─── Service account ────────────────────────────────────────────────────────
// Option A: set GOOGLE_APPLICATION_CREDENTIALS in your shell before running.
// Option B: paste the path to your serviceAccountKey.json below.
// const SERVICE_ACCOUNT_PATH = "./serviceAccountKey.json";
const SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SAK;

let app;
if (existsSync(resolve(SERVICE_ACCOUNT_PATH))) {
    const require = createRequire(import.meta.url);
    const serviceAccount = require(resolve(SERVICE_ACCOUNT_PATH));
    app = initializeApp({ credential: cert(serviceAccount) });
    console.log("✓ Authenticated via service account file");
} else if (process.env.FIREBASE_SAK) {
    const { applicationDefault } = await import("firebase-admin/app");
    app = initializeApp({ credential: applicationDefault() });
    console.log("✓ Authenticated via GOOGLE_APPLICATION_CREDENTIALS");
} else {
    console.error(
        "✗ No credentials found.\n" +
            "  Place serviceAccountKey.json next to this script, or set\n" +
            "  GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json",
    );
    process.exit(1);
}

const db = getFirestore(app);

// ─── Platform config values ──────────────────────────────────────────────────
// These are the only numbers the admin will ever need to change.
// After seeding, admins edit them through the Admin Settings page in the UI.
// All financial calculations in the app read from this document via
// the usePlatformConfig() hook — nothing is hardcoded in component files.

const platformConfig = {
    // ── Registration fees ──────────────────────────────────────────────────
    // One-time fee collected when a new user registers.
    registrationFeeStudent: 0, // ETB — currently free; change when monetised
    registrationFeeTeacher: 0, // ETB — currently free; change when monetised

    // ── Monthly service fee ────────────────────────────────────────────────
    // The flat fee Arke collects per student per month, on top of the
    // teacherPayoutRatio split below. This maps to SERVICE_FEE in types/index.
    serviceFeeMonthly: 100, // ETB

    // ── Teacher payout ratio ───────────────────────────────────────────────
    // Fraction of the course price that goes to the teacher.
    // 0.85 means teacher gets 85%, Arke keeps 15%.
    // Store as a decimal — the UI can display it as a percentage.
    teacherPayoutRatio: 0.85,

    // ── Audit fields ───────────────────────────────────────────────────────
    // These are updated by the Admin Settings page on every save.
    // The seed sets them to null so the schema is clear from day one.
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: "seed-script", // replaced by admin UID on first UI save
};

// ─── Write ───────────────────────────────────────────────────────────────────
console.log("\nSeeding platform_config/global …");
console.log(
    "Values:",
    JSON.stringify(
        { ...platformConfig, updatedAt: "<serverTimestamp>" },
        null,
        2,
    ),
);

try {
    await db.collection("platform_config").doc("global").set(platformConfig, {
        merge: true, // safe to re-run; won't wipe admin edits to other fields
    });
    console.log("\n✓ platform_config/global written successfully.");
    console.log(
        "  Admin can now edit fees at any time from the Admin Settings page.\n" +
            "  All pages using usePlatformConfig() will update in real-time via onSnapshot.",
    );
} catch (err) {
    console.error("✗ Firestore write failed:", err.message);
    process.exit(1);
}

process.exit(0);
