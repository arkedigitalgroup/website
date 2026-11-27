// src/components/payments/RegistrationFeeQueue.jsx
// Admin queue of submitted registration-fee receipts. Approving sets
// registrationFeePaid on the student/teacher doc, which unblocks matching
// (students) and verification (teachers).
"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDoc, onSnapshot, query, serverTimestamp, updateDoc, where, writeBatch } from "firebase/firestore";
import { db } from "../../lib/firebase";

const profileCollection = (role) => (role === "teacher" ? "teachers" : "students");

export default function RegistrationFeeQueue({ lang }) {
    const am = lang === "am";
    const [items, setItems] = useState(null);
    const [busyId, setBusyId] = useState(null);
    const [rejecting, setRejecting] = useState(null);
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    useEffect(
        () =>
            onSnapshot(
                query(collection(db, "registrationFees"), where("status", "==", "submitted")),
                async (snap) => {
                    // Attach name/phone from the profile doc so admin knows who paid.
                    const rows = await Promise.all(
                        snap.docs.map(async (d) => {
                            const fee = { id: d.id, ...d.data() };
                            const p = await getDoc(doc(db, profileCollection(fee.role), d.id)).catch(() => null);
                            return { ...fee, profile: p?.exists() ? p.data() : {} };
                        }),
                    );
                    setItems(rows);
                },
                (err) => {
                    console.error("Registration fee queue:", err);
                    setItems([]);
                },
            ),
        [],
    );

    const approve = async (fee) => {
        setBusyId(fee.id);
        setError("");
        try {
            const batch = writeBatch(db);
            batch.update(doc(db, "registrationFees", fee.id), { status: "paid", approvedAt: serverTimestamp() });
            batch.update(doc(db, profileCollection(fee.role), fee.id), { registrationFeePaid: true });
            await batch.commit();
        } catch (err) {
            console.error("Approve registration fee:", err);
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    const reject = async () => {
        setBusyId(rejecting.id);
        setError("");
        try {
            await updateDoc(doc(db, "registrationFees", rejecting.id), {
                status: "rejected",
                rejectedAt: serverTimestamp(),
                rejectionReason: reason.trim() || "Receipt could not be verified.",
            });
            setRejecting(null);
            setReason("");
        } catch (err) {
            console.error("Reject registration fee:", err);
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="bg-navy-surface border border-gold-primary/30 rounded-xl shadow-lg p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-navy-border pb-3">
                <h2 className="text-xl font-bold text-white font-ethiopic">
                    {am ? "የምዝገባ ክፍያ ማረጋገጫ" : "Registration Fee Approvals"}
                </h2>
                {items?.length > 0 && (
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-gold-primary/20 text-gold-primary">
                        {items.length} {am ? "በመጠባበቅ ላይ" : "awaiting"}
                    </span>
                )}
            </div>
            {error && <p className="text-xs text-error">{error}</p>}
            {items === null ? (
                <p className="text-sm text-text-muted text-center py-6 animate-pulse">{am ? "በመጫን ላይ..." : "Loading..."}</p>
            ) : items.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-6">{am ? "የሚጠበቅ ክፍያ የለም።" : "No registration fees waiting."}</p>
            ) : (
                <div className="space-y-3">
                    {items.map((fee) => (
                        <div key={fee.id} className="bg-navy-mid border border-navy-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
                            <div className="flex-grow space-y-0.5">
                                <div className="text-white font-semibold">
                                    {fee.profile.fullName || fee.profile.phone || fee.id}{" "}
                                    <span className="text-xs text-text-muted">
                                        · {fee.role === "teacher" ? (am ? "መምህር" : "Teacher") : am ? "ተማሪ" : "Student"}
                                        {fee.profile.serviceId && ` · ${fee.profile.serviceId}`}
                                    </span>
                                </div>
                                <div className="text-xs text-text-secondary">
                                    <span className="text-gold-primary font-bold">{fee.amount} ETB</span> · {am ? "ቁጥር" : "Ref"}:{" "}
                                    <span className="font-mono text-white">{fee.transactionRef}</span>
                                    {fee.submittedAt?.toDate && ` · ${fee.submittedAt.toDate().toLocaleDateString()}`}
                                </div>
                            </div>
                            {fee.receiptUrl && (
                                <a href={fee.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gold-primary hover:underline font-semibold">
                                    {am ? "ደረሰኝ ይመልከቱ" : "View receipt"}
                                </a>
                            )}
                            <div className="flex gap-2">
                                <button onClick={() => approve(fee)} disabled={busyId === fee.id}
                                    className="px-3 py-1.5 bg-gold-primary hover:bg-gold-hover text-navy-deep text-xs font-bold rounded-md disabled:opacity-50">
                                    {am ? "አጽድቅ" : "Approve"}
                                </button>
                                <button onClick={() => { setRejecting(fee); setReason(""); }} disabled={busyId === fee.id}
                                    className="px-3 py-1.5 bg-error/20 hover:bg-error/30 text-error border border-error/30 text-xs font-bold rounded-md disabled:opacity-50">
                                    {am ? "ውድቅ አድርግ" : "Reject"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {rejecting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-navy-surface border border-navy-border rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <h3 className="text-lg font-bold text-white">{am ? "ደረሰኙን ውድቅ አድርግ" : "Reject receipt"}</h3>
                        <textarea rows="3" value={reason} onChange={(e) => setReason(e.target.value)}
                            placeholder={am ? "ምክንያት (ተጠቃሚው ያየዋል)" : "Reason (shown to the user)"}
                            className="w-full px-3 py-2 bg-navy-mid border border-navy-border rounded-md text-white text-sm resize-none focus:outline-none focus:border-gold-primary" />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setRejecting(null)} className="px-4 py-2 rounded border border-navy-border text-text-secondary text-xs font-semibold">
                                {am ? "ተመለስ" : "Cancel"}
                            </button>
                            <button onClick={reject} disabled={busyId === rejecting.id} className="px-4 py-2 rounded bg-error text-white text-xs font-bold disabled:opacity-50">
                                {am ? "ውድቅ አድርግ" : "Reject"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
