// src/lib/firebaseAdmin.js
// Server-only Firebase Admin SDK (bypasses security rules). Never import this
// from a "use client" file. Credentials: FIREBASE_SAK = service-account JSON.
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function app() {
    if (!getApps().length) {
        const raw = process.env.FIREBASE_SAK;
        if (!raw) throw new Error("FIREBASE_SAK is not set");
        initializeApp({ credential: cert(JSON.parse(raw)) });
    }
    return getApps()[0];
}

export const getAdminDb = () => getFirestore(app());
export const getAdminAuth = () => getAuth(app());

/** Returns the decoded Firebase ID token from "Authorization: Bearer …", or null. */
export async function verifyUser(request) {
    const token = (request.headers.get("authorization") || "").replace(/^Bearer /, "");
    if (!token) return null;
    try {
        return await getAdminAuth().verifyIdToken(token);
    } catch {
        return null;
    }
}

/** Returns the caller's uid if the request carries a valid ID token of an admin, else null. */
export async function verifyAdmin(request) {
    const token = (request.headers.get("authorization") || "").replace(/^Bearer /, "");
    if (!token) return null;
    try {
        const { uid } = await getAdminAuth().verifyIdToken(token);
        const user = await getAdminDb().doc(`users/${uid}`).get();
        return user.data()?.role === "admin" ? uid : null;
    } catch {
        return null;
    }
}
