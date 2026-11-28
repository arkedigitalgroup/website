// app/api/auth/send-verification/route.js
// Sends the Firebase email-verification link in Arke's branded email (Resend).
// The link is generated server-side and only mailed, never returned, so a user
// can't verify an address they don't own.
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb, verifyUser } from "../../../../src/lib/firebaseAdmin";
import { sendEmail, verificationEmail } from "../../../../src/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RESEND_COOLDOWN_MS = 60 * 1000;

export async function POST(request) {
    const caller = await verifyUser(request);
    if (!caller?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (caller.email_verified) return NextResponse.json({ alreadyVerified: true });

    const userRef = getAdminDb().doc(`users/${caller.uid}`);
    const last = (await userRef.get()).data()?.verificationEmailSentAt?.toMillis?.() || 0;
    if (Date.now() - last < RESEND_COOLDOWN_MS) {
        return NextResponse.json({ error: "Please wait a minute before asking again." }, { status: 429 });
    }

    try {
        const continueUrl = `${new URL(request.url).origin}/login?verified=1`;
        const link = await getAdminAuth().generateEmailVerificationLink(caller.email, { url: continueUrl });
        await sendEmail({ to: caller.email, ...verificationEmail(link) });
        await userRef.set({ verificationEmailSentAt: FieldValue.serverTimestamp() }, { merge: true });
        return NextResponse.json({ sent: true });
    } catch (err) {
        console.error("send-verification failed:", err);
        return NextResponse.json({ error: "Could not send the email." }, { status: 502 });
    }
}
