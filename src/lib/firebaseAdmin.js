// src/lib/firebaseAdmin.js
// Server-only Firebase Admin SDK (bypasses security rules). Never import this
// from a "use client" file. Credentials: FIREBASE_SAK = service-account JSON.
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export function getAdminDb() {
    if (!getApps().length) {
        const raw = process.env.FIREBASE_SAK;
        if (!raw) throw new Error("FIREBASE_SAK is not set");
        initializeApp({ credential: cert(JSON.parse(raw)) });
    }
    return getFirestore();
}
