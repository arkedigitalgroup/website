/**
 * scripts/recover-orphaned-users.js
 *
 * For each orphaned auth account (auth exists, no /users doc),
 * this script creates a minimal /users/{uid} doc so they can log in again.
 *
 * Run: node scripts/recover-orphaned-users.js
 */
"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const admin = require("firebase-admin");

const sak = JSON.parse(process.env.FIREBASE_SAK);
admin.initializeApp({ credential: admin.credential.cert(sak) });

const auth = admin.auth();
const db = admin.firestore();

// ── The 3 confirmed orphaned UIDs ────────────────────────────────────────────
const ORPHANED_UIDS = [
    "2oUxaNG7CQRSV9z8q9gqFFuGB8g1", // assegidmihret3@gmail.com   – created 09 Jul 2026
    "9M2tTHrMl0gypszmQxqw7Cv9eUP2", // tomasman360@gmail.com      – created 07 Jul 2026
    "W6JI4WOhYfbBWQX0OX4SqMmslN02", // destaaychew2721@gmail.com  – created 29 Jun 2026
];

(async () => {
    console.log("🔧 Recovering orphaned auth accounts by creating /users docs...\n");

    for (const uid of ORPHANED_UIDS) {
        try {
            // Get auth user details
            const authUser = await auth.getUser(uid);

            // Check if /students or /teachers doc exists for this uid
            const studentSnap = await db.collection("students").doc(uid).get();
            const teacherSnap = await db.collection("teachers").doc(uid).get();

            let role = "student"; // default — admin can correct later
            let status = "active";
            let serviceLine = "yeneta"; // default — admin can correct later
            let serviceId = `SY-${uid.slice(0, 6).toUpperCase()}`;

            if (teacherSnap.exists) {
                role = "teacher";
                status = "pending";
                serviceLine = teacherSnap.data().serviceLine || "yeneta";
                serviceId = teacherSnap.data().serviceId || `YT-${uid.slice(0, 6).toUpperCase()}`;
            } else if (studentSnap.exists) {
                role = "student";
                status = "active";
                serviceLine = studentSnap.data().serviceLine || "yeneta";
                serviceId = studentSnap.data().serviceId || `SY-${uid.slice(0, 6).toUpperCase()}`;
            }

            const userDoc = {
                id: uid,
                role,
                serviceId,
                serviceLine,
                email: authUser.email.toLowerCase(),
                status,
                createdAt: admin.firestore.Timestamp.fromDate(
                    new Date(authUser.metadata.creationTime)
                ),
                recoveredAt: admin.firestore.FieldValue.serverTimestamp(),
                recoveryNote: "Auto-recovered by recover-orphaned-users.js — was orphaned auth account",
            };

            await db.collection("users").doc(uid).set(userDoc);

            console.log(`  ✓ Created /users/${uid}`);
            console.log(`    email: ${authUser.email}`);
            console.log(`    role:  ${role} | status: ${status} | serviceLine: ${serviceLine}`);
            if (studentSnap.exists) console.log(`    → existing /students doc found — kept intact`);
            if (teacherSnap.exists) console.log(`    → existing /teachers doc found — kept intact`);
            console.log();
        } catch (err) {
            console.error(`  ✗ Failed to recover uid ${uid}: ${err.message}\n`);
        }
    }

    console.log("✅ Recovery complete. Users can now log in at /login.\n");
    console.log("   ⚠️  Admin should review and verify role/status for each recovered user.\n");
    process.exit(0);
})();
