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

    // Manual payment entry simulation
    const [payReference, setPayReference] = useState("");
    const [payingId, setPayingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

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
        if (!payReference || !payingId) return;
        setSubmitting(true);

        try {
            // 1. Update /payments/{payingId} status = "paid", submittedAt = now
            const paymentRef = doc(db, "payments", payingId);

            await updateDoc(paymentRef, {
                status: "submitted",
                submittedAt: new Date(),
                transactionRef: payReference,
            });

            // 2. Also ensure student profile dashboardLocked is updated to false
            const studentRef = doc(db, "students", user.uid);
            await updateDoc(studentRef, {
                dashboardLocked: false,
                registrationFeePaid: true,
            });

            setPayReference("");
            setPayingId(null);
            fetchPaymentData(); // Refresh list
        } catch (err) {
            console.error("Submit payment error:", err);
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
                    Payments &amp; Invoices
                </h1>
                <p className="text-sm text-text-secondary">
                    Review invoices, current month status, and transfer directly
                    to Arke corporate bank accounts. We show only unified
                    all-inclusive rates.
                </p>
            </div>

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

                                    return (
                                        <tr
                                            key={invoice.id}
                                            className="hover:bg-navy-hover transition-colors"
                                        >
                                            <td className="p-4 text-white font-bold">
                                                {invoice.month}
                                            </td>
                                            <td className="p-4 text-text-secondary capitalize">
                                                Course Package: Course Package:{" "}
                                                {courses.find(
                                                    (c) =>
                                                        c.id ===
                                                        student?.courseId,
                                                )?.name ?? student?.courseId}
                                            </td>
                                            <td className="p-4 text-gold-primary font-bold">
                                                {total.toLocaleString()} ETB
                                            </td>
                                            <td className="p-4">
                                                {isSubmitted ? (
                                                    <span className="px-2.5 py-0.5 rounded bg-success-faint text-success font-bold text-xs uppercase border border-success/15">
                                                        Submitted
                                                    </span>
                                                ) : isOverdue ? (
                                                    <span className="px-2.5 py-0.5 rounded bg-error-faint text-error font-bold text-xs uppercase border border-error/15">
                                                        Overdue
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-0.5 rounded bg-warning-faint text-warning font-bold text-xs uppercase border border-warning/15">
                                                        Unpaid
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                {!isSubmitted ? (
                                                    <span className="text-xs text-text-muted">
                                                        Paid at{" "}
                                                        {invoice.submittedAt
                                                            ? new Date(
                                                                  invoice
                                                                      .submittedAt
                                                                      .seconds *
                                                                      1000,
                                                              ).toLocaleDateString()
                                                            : "Just now"}
                                                    </span>
                                                ) : (
                                                    <button
                                                        disabled={isSubmitted}
                                                        onClick={() =>
                                                            setPayingId(
                                                                invoice.id,
                                                            )
                                                        }
                                                        className="px-3 py-1.5 rounded bg-gold-primary text-navy-deep font-bold text-xs hover:bg-gold-hover transition-all"
                                                    >
                                                        {isSubmitted
                                                            ? "Done"
                                                            : "Submit Reference"}
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
                            <input
                                type="text"
                                required
                                placeholder="Transaction Reference"
                                value={payReference}
                                onChange={(e) =>
                                    setPayReference(e.target.value)
                                }
                                className="w-full px-4 py-3 bg-navy-mid border border-navy-border rounded-md text-white placeholder-text-muted focus:outline-none focus:border-gold-primary text-sm font-mono uppercase text-center"
                            />
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setPayingId(null)}
                                    className="px-4 py-2 rounded border border-navy-border text-text-secondary hover:bg-navy-mid text-xs font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 rounded bg-gold-primary text-navy-deep text-xs font-bold hover:bg-gold-hover transition-all"
                                >
                                    {submitting
                                        ? "Verifying..."
                                        : "Verify Transfer"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
