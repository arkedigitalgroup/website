// src/components/auth/EmailVerifyGate.jsx
// Student/teacher dashboards: until the sign-in email is verified, show this screen.
// It checks every few seconds, and once verified asks the server for the welcome email.
"use client";

import { useEffect, useState } from "react";
import { sendEmailVerification } from "firebase/auth";
import { isPhoneAuthEmail } from "../../lib/phoneAuth";

/** Branded email via our server; falls back to Firebase's plain email if that fails. */
export async function requestVerificationEmail(user) {
    const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { Authorization: `Bearer ${await user.getIdToken()}` },
    });
    if (res.status === 429) return "wait";
    if (!res.ok) await sendEmailVerification(user);
    return "sent";
}

async function sendWelcomeIfPending(user, profile) {
    if (!user?.emailVerified || !profile?.welcomeEmailPending) return;
    await fetch("/api/auth/welcome", {
        method: "POST",
        headers: { Authorization: `Bearer ${await user.getIdToken(true)}` }, // fresh token carries email_verified
    }).catch((err) => console.error("Welcome email:", err));
}

/** Renders children once verified (old phone-only accounts have no real email and skip this). */
export default function EmailVerifyGate({ user, profile, lang, children }) {
    const am = lang === "am";
    const needsCheck = !!user && !user.emailVerified && !isPhoneAuthEmail(user.email);
    const [verified, setVerified] = useState(!needsCheck);
    const [status, setStatus] = useState(""); // "", "sending", "sent", "wait", "error", "checking"

    useEffect(() => {
        if (verified) sendWelcomeIfPending(user, profile);
    }, [verified, user, profile]);

    useEffect(() => {
        if (verified || !user) return;
        const timer = setInterval(async () => {
            await user.reload().catch(() => {});
            if (user.emailVerified) setVerified(true);
        }, 5000);
        return () => clearInterval(timer);
    }, [verified, user]);

    if (verified) return children;

    const check = async () => {
        setStatus("checking");
        await user.reload().catch(() => {});
        if (user.emailVerified) setVerified(true);
        else setStatus("not-yet");
    };
    const resend = async () => {
        setStatus("sending");
        try {
            setStatus(await requestVerificationEmail(user));
        } catch (err) {
            console.error("Verification email:", err);
            setStatus("error");
        }
    };
    const message = {
        sent: am ? "✅ Email ተልኳል። Inbox እና Spam folder-ዎን ይመልከቱ።" : "✅ Email sent. Check your inbox and spam folder.",
        wait: am ? "⏳ እባክዎ አንድ ደቂቃ ጠብቀው እንደገና ይሞክሩ።" : "⏳ Please wait a minute before asking again.",
        error: am ? "Email መላክ አልተቻለም። Internet-ዎን አረጋግጠው እንደገና ይሞክሩ።" : "Could not send the email. Check your internet and try again.",
        "not-yet": am ? "ገና አልተረጋገጠም። በEmail-ዎ የተላከውን Link ይጫኑ።" : "Not verified yet. Tap the link in the email we sent you.",
    }[status];

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="max-w-xl w-full bg-navy-surface border border-gold-primary/30 rounded-2xl p-8 sm:p-12 shadow-2xl space-y-6 relative overflow-hidden text-center">
                <div className="absolute top-0 left-0 w-full h-2 bg-gold-primary" />
                <span className="text-5xl block" aria-hidden>📧</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gold-primary font-ethiopic">
                    {am ? "Email-ዎን ያረጋግጡ" : "Verify your email"}
                </h1>
                <p className="text-sm text-text-secondary leading-relaxed">
                    {am ? "የማረጋገጫ Link ወደዚህ Email ልከናል፦" : "We sent a verification link to:"}
                    <span className="block text-white font-semibold mt-1 break-all">{user.email}</span>
                </p>
                <p className="text-xs text-text-muted">
                    {am ? "Link-ኡን ሲጫኑ ይህ ገጽ በራሱ ይከፈታል።" : "Once you tap the link, this page opens automatically."}
                </p>
                {message && <p className="text-xs text-white bg-navy-mid border border-navy-border rounded-md px-3 py-2" role="status">{message}</p>}
                <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                    <button onClick={check} disabled={status === "checking"}
                        className="px-6 py-2.5 rounded bg-gold-primary text-navy-deep font-bold text-sm hover:bg-gold-hover transition-all disabled:opacity-50">
                        {am ? "አረጋግጫለሁ" : "I've verified"}
                    </button>
                    <button onClick={resend} disabled={status === "sending"}
                        className="px-6 py-2.5 rounded border border-navy-border text-white font-bold text-sm hover:bg-navy-mid transition-all disabled:opacity-50">
                        {status === "sending" ? "..." : am ? "Email እንደገና ላክ" : "Resend email"}
                    </button>
                </div>
            </div>
        </div>
    );
}
