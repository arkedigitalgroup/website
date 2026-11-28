// app/api/auth/phone-login/route.js
// Sign in with phone number + password for accounts whose sign-in email is a real
// address. The server finds the account by phone, checks the password with Firebase,
// and returns a custom token — the email itself is never sent to the browser.
import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "../../../../src/lib/firebaseAdmin";
import { normalizePhone } from "../../../../src/lib/phoneAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const INVALID = () => NextResponse.json({ error: "invalid-credential" }, { status: 401 });

async function passwordMatches(email, password, origin) {
    const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json", Referer: origin }, // API key may be restricted to the site
            body: JSON.stringify({ email, password, returnSecureToken: false }),
        },
    );
    return res.ok;
}

export async function POST(request) {
    const { phone, password } = await request.json().catch(() => ({}));
    const normalized = normalizePhone(phone);
    if (!normalized || typeof password !== "string" || !password) return INVALID();

    const matches = await getAdminDb().collection("users").where("phone", "==", normalized).limit(5).get();
    const origin = new URL(request.url).origin;
    for (const docSnap of matches.docs) {
        const authUser = await getAdminAuth().getUser(docSnap.id).catch(() => null);
        if (!authUser?.email || authUser.disabled) continue;
        if (await passwordMatches(authUser.email, password, origin)) {
            return NextResponse.json({ token: await getAdminAuth().createCustomToken(docSnap.id) });
        }
    }
    return INVALID();
}
