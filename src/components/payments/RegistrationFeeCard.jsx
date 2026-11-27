// src/components/payments/RegistrationFeeCard.jsx
// Dashboard banner until the registration fee is approved: upload form,
// "under review" notice, or the admin's rejection reason with a retry.
"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { usePlatformConfig } from "../../hooks/Useplatformconfig";
import { registrationFeeFor, submitRegistrationFee } from "../../lib/registrationFee";
import RegistrationFeeFields from "./RegistrationFeeFields";

export default function RegistrationFeeCard({ uid, role, feePaid, lang }) {
    const { config, loading } = usePlatformConfig();
    const [fee, setFee] = useState(undefined); // undefined = loading
    const [file, setFile] = useState(null);
    const [transactionRef, setTransactionRef] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const am = lang === "am";

    useEffect(() => {
        if (!uid || feePaid) return;
        return onSnapshot(
            doc(db, "registrationFees", uid),
            (snap) => setFee(snap.exists() ? snap.data() : null),
            () => setFee(null),
        );
    }, [uid, feePaid]);

    const amount = registrationFeeFor(config, role);
    if (feePaid || loading || fee === undefined || amount <= 0 || fee?.status === "paid") return null;

    if (fee?.status === "submitted") {
        return (
            <div className="bg-navy-surface border border-gold-primary/30 rounded-xl p-5 text-sm text-text-secondary">
                ⏳ {am
                    ? "የምዝገባ ክፍያ ደረሰኝዎ በግምገማ ላይ ነው። ሲረጋገጥ መለያዎ ሙሉ በሙሉ ይነቃል።"
                    : "Your registration fee receipt is under review. Your account is fully activated once it is approved."}
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !transactionRef.trim()) return;
        setBusy(true);
        setError("");
        try {
            await submitRegistrationFee({ uid, role, amount, file, transactionRef });
        } catch (err) {
            console.error("Registration fee submit failed:", err);
            setError(am ? "ደረሰኙን መላክ አልተቻለም። እንደገና ይሞክሩ።" : "Could not send the receipt. Please try again.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-navy-surface border border-warning/40 rounded-xl p-5 space-y-3">
            <h2 className="text-base font-bold text-warning">
                {am ? "የምዝገባ ክፍያ ይጠበቃል" : "Registration fee required"}
            </h2>
            {fee?.status === "rejected" && (
                <p className="text-xs text-error bg-error-faint border border-error/20 rounded p-2">
                    {am ? "ደረሰኙ ውድቅ ተደርጓል፦ " : "Receipt rejected: "}
                    {fee.rejectionReason || (am ? "ሊረጋገጥ አልቻለም።" : "could not be verified.")}
                </p>
            )}
            <RegistrationFeeFields amount={amount} config={config} lang={lang}
                file={file} onFile={setFile} transactionRef={transactionRef} onRef={setTransactionRef} />
            {error && <p className="text-xs text-error">{error}</p>}
            <button type="submit" disabled={busy || !file || !transactionRef.trim()}
                className="w-full py-2.5 rounded-md bg-gold-primary text-navy-deep font-bold text-sm hover:bg-gold-hover disabled:opacity-50">
                {busy ? (am ? "በመላክ ላይ..." : "Sending...") : am ? "ደረሰኝ ላክ" : "Send receipt"}
            </button>
        </form>
    );
}
