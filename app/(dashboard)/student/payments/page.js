// app/(dashboard)/student/payments/page.js
"use client";

import React, { useState, useEffect } from "react";
import {
    collection,
    getDocs,
    doc,
    getDoc,
    query,
    where,
    updateDoc,
} from "firebase/firestore";
import { db } from "../../../../src/lib/firebase";
import { uploadToSupabase } from "../../../../src/lib/supabase";
import { useAuth } from "../../../../src/context/AuthContext";
import { useLanguage } from "../../../../src/context/LanguageContext";
import {
    usePlatformConfig,
    calcMonthlyTotal,
} from "../../../../src/hooks/Useplatformconfig";
import { useCourses } from "../../../../src/hooks/Usecourses";

export default function StudentPayments() {
    const { user } = useAuth();
    const { lang } = useLanguage();
    const { config } = usePlatformConfig();
    const { courses: yenetaCourses } = useCourses("yeneta", lang);
    const { courses: fidelCourses } = useCourses("fidel", lang);
    const courses = [...yenetaCourses, ...fidelCourses];
    const [payments, setPayments] = useState([]);
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    // Receipt submission state
    const [payReference, setPayReference] = useState("");
    const [receiptFile, setReceiptFile] = useState(null);
    const [payingId, setPayingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const fetchPaymentData = async () => {
        if (!user) return;
        try {
            setLoading(true);
            // Fetch student details
            const studentSnap = await getDoc(doc(db, "students", user.uid));
            if (studentSnap.exists()) {
                setStudent(studentSnap.data());
            }

            // Fetch payment records for this student
            const q = query(
                collection(db, "payments"),
                where("studentId", "==", user.uid),
            );
            const snap = await getDocs(q);
            const list = [];
            snap.forEach((doc) => {
                list.push({ id: doc.id, ...doc.data() });
            });
            // Sort newest month first
            list.sort((a, b) => b.month.localeCompare(a.month));
            setPayments(list);
        } catch (err) {
            console.error("Error loading payment records:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPaymentData();
    }, [user]);

    const handlePaySubmit = async (e) => {
        e.preventDefault();
        if (!payingId) return;
        setSubmitting(true);

        try {
            let receiptUrl = "";
            if (receiptFile) {
                const storagePath = `receipts/${user.uid}/${payingId}_${Date.now()}.jpg`;
                receiptUrl = await uploadToSupabase(receiptFile, storagePath);
            }

            // 1. Update /payments/{payingId} status = "submitted", submittedAt = now, receiptUrl
            const paymentRef = doc(db, "payments", payingId);

            await updateDoc(paymentRef, {
                status: "submitted",
                submittedAt: new Date(),
                transactionRef: payReference || "PHOTO_PROOF",
                ...(receiptUrl && { receiptUrl }),
            });

            // 2. Clear inputs & indicate success
            setPayReference("");
            setReceiptFile(null);
            setPayingId(null);
            setSubmitSuccess(true);
            setTimeout(() => setSubmitSuccess(false), 5000);
            fetchPaymentData(); // Refresh list
        } catch (err) {
            console.error("Submit payment error:", err);
            setSubmitError(
                lang === "am"
                    ? "ደረሰኝ መላክ አልተሳካም። እባክዎ እንደገና ሞክሩ።"
                    : "Failed to submit receipt. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="w-10 h-10 border-4 border-gold-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-text-secondary text-sm animate-pulse">
                    Loading billing statements...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Title */}
            <div>
                <h1 className="text-3xl font-extrabold text-white font-ethiopic leading-snug">
                    {lang === "am" ? "ክፍያ እና ደረሰኞች" : "Payments & Invoices"}
                </h1>
                <p className="text-sm text-text-secondary">
                    {lang === "am"
                        ? "ደረሰኝ፣ የወሩ ሁኔታ ያርምዱ። ወደ አርኬ የባንክ ሂሳቦች ቀጥታ ያስተላልፉ።"
                        : "Review invoices, current month status, and transfer directly to Arke corporate bank accounts."}
                </p>
            </div>

            {/* Success alert */}
            {submitSuccess && (
                <div className="flex items-center gap-3 bg-success/10 border border-success/30 rounded-lg px-4 py-3 text-success text-sm font-semibold">
                    <span>✅</span>
                    <span>
                        {lang === "am"
                            ? "ደረሰኝ ተልኳል። አስተዳዳሪ ያረጋግጣሉ።"
                            : "Receipt submitted successfully! Admin will verify it shortly."}
                    </span>
                </div>
            )}

            {/* Rejection notices */}
            {payments
                .filter((p) => p.status === "rejected")
                .map((p) => (
                    <div key={p.id} className="flex items-start gap-3 bg-error/10 border border-error/30 rounded-lg px-4 py-3 text-error text-sm">
                        <span className="mt-0.5">❌</span>
                        <div>
                            <p className="font-bold">
                                {lang === "am" ? "ደረሰኝ ውድቅ ተደርጓል" : "Receipt Rejected"} — {p.month}
                            </p>
                            {p.rejectionReason && (
                                <p className="text-xs text-text-secondary mt-1">
                                    {lang === "am" ? "ምክንያት:" : "Reason:"} {p.rejectionReason}
                                </p>
                            )}
                            <p className="text-xs text-text-muted mt-1">
                                {lang === "am"
                                    ? "እባክዎ ትክክለኛ ደረሰኝ ዳግም ይስቀሉ።"
                                    : "Please re-submit a valid payment receipt."}
                            </p>
                        </div>
                    </div>
                ))}

            {/* Payment details list */}
            <div className="bg-navy-surface border border-navy-border rounded-xl p-6 sm:p-8 shadow-md space-y-6">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider border-b border-navy-border pb-3">
                    Billing Statements &amp; Statements
                </h2>

                {payments.length === 0 ? (
                    <p className="text-sm text-text-muted text-center py-6">
                        No billing statements available yet. Invoices are
                        generated monthly upon tutor match.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-navy-mid border-b border-navy-border text-xs text-text-secondary uppercase font-bold tracking-wider">
                                    <th className="p-4">Invoice Month</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4">
                                        Total Amount (Inc. Service Fee)
                                    </th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">
                                        Payment Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-navy-border font-medium">
                                {payments.map((invoice) => {
                                    const total =
                                        invoice.totalAmount ??
                                        calcMonthlyTotal(
                                            config,
                                            invoice.coursePrice ?? 0,
                                        );
                                    const isSubmitted =
                                        invoice.status === "submitted";
                                    const isOverdue =
                                        invoice.status === "overdue";

                                    const isPaid = invoice.status === "paid";
                                    const isRejected = invoice.status === "rejected";

                                    return (
                                        <tr
                                            key={invoice.id}
                                            className="hover:bg-navy-hover transition-colors"
                                        >
                                            <td className="p-4 text-white font-bold">
                                                {invoice.month}
                                            </td>
                                            <td className="p-4 text-text-secondary capitalize">
                                                {courses.find(
                                                    (c) =>
                                                        c.id ===
                                                        student?.courseId,
                                                )?.name ?? student?.courseId ?? "—"}
                                            </td>
                                            <td className="p-4 text-gold-primary font-bold">
                                                {total.toLocaleString()} ETB
                                            </td>
                                            <td className="p-4">
                                                {isPaid ? (
                                                    <span className="px-2.5 py-0.5 rounded bg-success-faint text-success font-bold text-xs uppercase border border-success/15">
                                                        {lang === "am" ? "ተረጋግጧል" : "Verified"}
                                                    </span>
                                                ) : isSubmitted ? (
                                                    <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-xs uppercase border border-blue-400/20">
                                                        {lang === "am" ? "በምርምር ላይ" : "Pending"}
                                                    </span>
                                                ) : isRejected ? (
                                                    <span className="px-2.5 py-0.5 rounded bg-error-faint text-error font-bold text-xs uppercase border border-error/15">
                                                        {lang === "am" ? "ውድቅ" : "Rejected"}
                                                    </span>
                                                ) : isOverdue ? (
                                                    <span className="px-2.5 py-0.5 rounded bg-error-faint text-error font-bold text-xs uppercase border border-error/15">
                                                        {lang === "am" ? "ዘግይቷል" : "Overdue"}
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-0.5 rounded bg-warning-faint text-warning font-bold text-xs uppercase border border-warning/15">
                                                        {lang === "am" ? "አልተከፈለም" : "Unpaid"}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                {isPaid ? (
                                                    <span className="text-xs text-success font-semibold">
                                                        ✅ {lang === "am" ? "ተፈቅዷል" : "Approved"}
                                                    </span>
                                                ) : isSubmitted ? (
                                                    <span className="text-xs text-text-muted italic">
                                                        {lang === "am" ? "ምርምር ይጠብቃሉ..." : "Awaiting review..."}
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() =>
                                                            setPayingId(
                                                                invoice.id,
                                                            )
                                                        }
                                                        className="px-3 py-1.5 rounded bg-gold-primary text-navy-deep font-bold text-xs hover:bg-gold-hover transition-all"
                                                    >
                                                        {lang === "am" ? "ደረሰኝ ስቀል" : "Submit Receipt"}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Bank Account options card */}
            <div className="bg-navy-surface border border-navy-border rounded-xl p-6 sm:p-8 shadow-md space-y-4">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider border-b border-navy-border pb-2">
                    Arke Bank Channels For Transfers
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                    <div className="bg-navy-mid border border-navy-border p-4 rounded-lg space-y-1">
                        <span className="text-[10px] text-text-secondary uppercase font-semibold block">
                            Commercial Bank of Ethiopia (CBE)
                        </span>
                        <div className="text-base font-extrabold text-gold-primary font-mono">
                            1000452367123
                        </div>
                        <span className="text-[10px] text-text-muted block">
                            Account: Arke Digital Group
                        </span>
                    </div>
                    <div className="bg-navy-mid border border-navy-border p-4 rounded-lg space-y-1">
                        <span className="text-[10px] text-text-secondary uppercase font-semibold block">
                            Bank of Abyssinia (BOA)
                        </span>
                        <div className="text-base font-extrabold text-gold-primary font-mono">
                            45210985
                        </div>
                        <span className="text-[10px] text-text-muted block">
                            Account: Arke Digital Group
                        </span>
                    </div>
                    <div className="bg-navy-mid border border-navy-border p-4 rounded-lg space-y-1">
                        <span className="text-[10px] text-text-secondary uppercase font-semibold block">
                            Telebirr Merchant Wallet
                        </span>
                        <div className="text-base font-extrabold text-gold-primary font-mono">
                            98520
                        </div>
                        <span className="text-[10px] text-text-muted block">
                            Merchant ID: ArkeDigital
                        </span>
                    </div>
                </div>
            </div>

            {/* Submit transaction reference modal */}
            {payingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-navy-surface border border-navy-border rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <div>
                            <h3 className="text-lg font-bold text-white">
                                Submit Transfer Receipt Reference
                            </h3>
                            <p className="text-xs text-text-secondary">
                                Input the transaction reference code (e.g.
                                FT26145892) generated by your bank app to unlock
                                account.
                            </p>
                        </div>

                        <form onSubmit={handlePaySubmit} className="space-y-4">
                            <div>
                                <label className="text-xs text-text-secondary font-semibold uppercase block mb-1">
                                    Transaction Reference (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. FT26145892 or Telebirr Txn ID"
                                    value={payReference}
                                    onChange={(e) =>
                                        setPayReference(e.target.value)
                                    }
                                    className="w-full px-4 py-3 bg-navy-mid border border-navy-border rounded-md text-white placeholder-text-muted focus:outline-none focus:border-gold-primary text-sm font-mono uppercase text-center"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-gold-primary font-semibold uppercase block mb-1">
                                    📸 Upload Receipt Photo / Screenshot
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setReceiptFile(e.target.files[0])
                                    }
                                    className="w-full text-xs text-text-secondary border border-navy-border rounded bg-navy-mid px-3 py-2 focus:outline-none"
                                />
                                <p className="text-[11px] text-text-muted mt-1">
                                    Attach a photo of your CBE deposit slip or Telebirr confirmation screenshot for admin authentication.
                                </p>
                            </div>
                            {submitError && (
                                <p className="text-xs text-error bg-error/10 border border-error/20 rounded px-3 py-2">
                                    {submitError}
                                </p>
                            )}
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => { setPayingId(null); setSubmitError(""); }}
                                    className="px-4 py-2 rounded border border-navy-border text-text-secondary hover:bg-navy-mid text-xs font-semibold"
                                >
                                    {lang === "am" ? "ሰርዝ" : "Cancel"}
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 rounded bg-gold-primary text-navy-deep text-xs font-bold hover:bg-gold-hover transition-all"
                                >
                                    {submitting
                                        ? (lang === "am" ? "በማስረከብ ላይ..." : "Submitting...")
                                        : (lang === "am" ? "ደረሰኝ አስረክብ" : "Submit Receipt")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
