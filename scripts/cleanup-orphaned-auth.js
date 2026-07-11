/**
 * scripts/cleanup-orphaned-auth.js
 *
 * Finds Firebase Auth users who have NO corresponding /users/{uid} doc in Firestore,
 * and prints them for review. Run with --delete to also delete those auth accounts.
 *
 * Usage:
 *   node scripts/cleanup-orphaned-auth.js          ← list only
 *   node scripts/cleanup-orphaned-auth.js --delete ← delete orphaned accounts
 */
"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const admin = require("firebase-admin");

const sak = JSON.parse(process.env.FIREBASE_SAK);
admin.initializeApp({ credential: admin.credential.cert(sak) });

const auth = admin.auth();
const db = admin.firestore();
const DELETE = process.argv.includes("--delete");

(async () => {
    console.log("🔍 Scanning Firebase Auth accounts for orphaned registrations...\n");

    const orphaned = [];
    let pageToken;

    do {
        const result = await auth.listUsers(100, pageToken);
        for (const user of result.users) {
            const snap = await db.collection("users").doc(user.uid).get();
            if (!snap.exists) {
                orphaned.push({
                    uid: user.uid,
                    email: user.email,
                    createdAt: user.metadata.creationTime,
                });
            }
        }
        pageToken = result.pageToken;
    } while (pageToken);

    if (orphaned.length === 0) {
        console.log("✅ No orphaned auth accounts found. All auth users have a /users document.\n");
        process.exit(0);
    }

    console.log(`⚠️  Found ${orphaned.length} orphaned auth account(s) (auth exists, no /users doc):\n`);
    orphaned.forEach((u) => {
        console.log(`  • ${u.email} | uid: ${u.uid} | created: ${u.createdAt}`);
    });

    if (!DELETE) {
        console.log("\n→ Run with --delete flag to remove these accounts:");
        console.log("  node scripts/cleanup-orphaned-auth.js --delete\n");
        process.exit(0);
    }

    console.log("\n🗑️  Deleting orphaned accounts...");
    for (const u of orphaned) {
        try {
            await auth.deleteUser(u.uid);
            console.log(`  ✓ Deleted: ${u.email} (${u.uid})`);
        } catch (err) {
            console.error(`  ✗ Failed to delete ${u.email}: ${err.message}`);
        }
    }
    console.log("\n✅ Cleanup complete.\n");
    process.exit(0);
})();
