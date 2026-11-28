// app/api/auth/welcome/route.js
// Sends the branded welcome email once, after the email is verified.
// Only accounts created with welcomeEmailPending (new sign-ups) get one.
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, verifyUser } from "../../../../src/lib/firebaseAdmin";
import { sendEmail, welcomeEmail } from "../../../../src/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request) {
    const caller = await verifyUser(request);
    if (!caller?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!caller.email_verified) return NextResponse.json({ error: "Email not verified" }, { status: 403 });

    const db = getAdminDb();
    const userRef = db.doc(`users/${caller.uid}`);
    // Claim the send in a transaction so two dashboard tabs can't both send it.
    const profile = await db.runTransaction(async (tx) => {
        const data = (await tx.get(userRef)).data();
        if (!data?.welcomeEmailPending || data.welcomeEmailSentAt) return null;
        tx.update(userRef, { welcomeEmailPending: false, welcomeEmailSentAt: FieldValue.serverTimestamp() });
        return data;
    });
    if (!profile) return NextResponse.json({ skipped: true });

    try {
        const sub = (await db.doc(`${profile.role === "teacher" ? "teachers" : "students"}/${caller.uid}`).get()).data() || {};
        await sendEmail({
            to: caller.email,
            ...welcomeEmail({ role: profile.role, serviceId: profile.serviceId, name: sub.fullName || caller.name || "" }),
        });
        return NextResponse.json({ sent: true });
    } catch (err) {
        console.error("welcome email failed:", err);
        await userRef.update({ welcomeEmailPending: true, welcomeEmailSentAt: FieldValue.delete() }); // retry next visit
        return NextResponse.json({ error: "Could not send the email." }, { status: 502 });
    }
}
