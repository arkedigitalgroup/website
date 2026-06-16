// app/(dashboard)/admin/finances/page.js
"use client";

import React, { useState, useEffect } from "react";
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../../src/lib/firebase";
import { useLanguage } from "../../../../src/context/LanguageContext";
import {
    usePlatformConfig,
    calcMonthlyTotal,
    calcCompanyRevenue,
    calcTeacherPayout,
} from "../../../../src/hooks/Useplatformconfig";
import { useCourses, getCoursePrice } from "../../../../src/hooks/Usecourses";

export default function AdminFinances() {
    const { t, lang } = useLanguage();
    const { config, loading: configLoading } = usePlatformConfig();

    // Yeneta courses for price lookup — finance page is Yeneta-only for now.
    // When Fidel goes live, fetch both and merge: [...yeneta, ...fidel]
    const { courses, loading: coursesLoading } = useCourses("yeneta", lang);

    const [payments, setPayments] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setDataLoading(true);
                const [studentsSnap, teachersSnap, paymentsSnap] =
                    await Promise.all([
                        getDocs(collection(db, "students")),
                        getDocs(collection(db, "teachers")),
                        getDocs(collection(db, "payments")),
                    ]);
                setStudents(
                    studentsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
                );
                setTeachers(
                    teachersSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
                );
                setPayments(
                    paymentsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
                );
            } catch (err) {
                console.error("Error loading finance data:", err);
            } finally {
                setDataLoading(false);
            }
        };
        load();
    }, []);

    const handleApprove = async (paymentId) => {
        try {
            await updateDoc(doc(db, "payments", paymentId), {
                status: "paid",
                approvedAt: serverTimestamp(),
            });
            // Optimistic local update — no need to re-fetch all payments
            setPayments((prev) =>
                prev.map((p) =>
                    p.id === paymentId ? { ...p, status: "paid" } : p,
                ),
            );
        } catch (err) {
            console.error("Approval failed:", err);
        }
    };

    const loading = configLoading || coursesLoading || dataLoading;

    // ── Monthly aggregates ────────────────────────────────────────────────────
    const monthlyAggregates = {};
    payments.forEach((payment) => {
        const month = payment.month || new Date().toISOString().slice(0, 7);
        if (!monthlyAggregates[month]) {
            monthlyAggregates[month] = {
                month,
                studentsCount: 0,
                totalCollected: 0,
                companyCut: 0,
                teacherPayouts: 0,
                paidCount: 0,
            };
        }
        // Use price stored on the payment record — never look up from courses here.
        // The payment document captures the price at the time of billing, so
        // a future course price change doesn't retroactively alter old invoices.
        const price = payment.coursePrice ?? 0;
        const isPaid = payment.status === "paid";
        monthlyAggregates[month].studentsCount++;
        if (isPaid) {
            monthlyAggregates[month].paidCount++;
            monthlyAggregates[month].totalCollected += calcMonthlyTotal(
                config,
                price,
            );
            monthlyAggregates[month].companyCut += calcCompanyRevenue(
                config,
                price,
            );
            monthlyAggregates[month].teacherPayouts += calcTeacherPayout(
                config,
                price,
            );
        }
    });
    const monthlyList = Object.values(monthlyAggregates).sort((a, b) =>
        b.month.localeCompare(a.month),
    );

    // ── Teacher payout table ──────────────────────────────────────────────────
    const teacherPayoutsList = teachers
        .map((teacher) => {
            let activeStudentsCount = 0;
            let earnedThisMonth = 0;
            students.forEach((student) => {
                if (student.assignedTeacherId === teacher.id) {
                    activeStudentsCount++;
                    // getCoursePrice replaces the hardcoded 7100 / 4700 / 4200 switch.
                    // It looks up the live price from Firestore courses array.
                    const price = getCoursePrice(courses, student.courseId);
                    earnedThisMonth += calcTeacherPayout(config, price);
                }
            });
            return { ...teacher, activeStudentsCount, earnedThisMonth };
        })
        .filter((t) => t.verified && t.activeStudentsCount > 0);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="w-10 h-10 border-4 border-gold-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-text-secondary text-sm animate-pulse">
                    Loading finance statements...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Title */}
            <div>
                <h1 className="text-3xl font-extrabold text-white font-ethiopic">
                    {lang === "am" ? "የፋይናንስ አስተዳደር" : "Financial Management"}
                </h1>
                <p className="text-sm text-text-secondary">
                    Track billing, monthly total collections, company cut, and
                    teacher payouts. Rates update live from Admin Settings.
                </p>
            </div>

            {/* Live Rates Card — reads from config, never hardcoded */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md text-sm">
                <div className="space-y-1">
                    <span className="text-xs text-text-secondary font-semibold uppercase">
                        Registration Fee (Student)
                    </span>
                    <div className="text-xl font-extrabold text-gold-primary">
                        {config.registrationFeeStudent} ETB
                    </div>
                    <p className="text-xs text-text-muted">
                        One-time upon registration
                    </p>
                </div>
                <div className="space-y-1">
                    <span className="text-xs text-text-secondary font-semibold uppercase">
                        Registration Fee (Teacher)
                    </span>
                    <div className="text-xl font-extrabold text-gold-primary">
                        {config.registrationFeeTeacher} ETB
                    </div>
                    <p className="text-xs text-text-muted">
                        One-time activation fee
                    </p>
                </div>
                <div className="space-y-1">
                    <span className="text-xs text-text-secondary font-semibold uppercase">
                        Monthly Service Fee
                    </span>
                    <div className="text-xl font-extrabold text-gold-primary">
                        {config.serviceFeeMonthly} ETB
                    </div>
                    <p className="text-xs text-text-muted">
                        Arke cut per student / month
                    </p>
                </div>
                <div className="space-y-1">
                    <span className="text-xs text-text-secondary font-semibold uppercase">
                        Teacher Payout Ratio
                    </span>
                    <div className="text-xl font-extrabold text-gold-primary">
                        {(config.teacherPayoutRatio * 100).toFixed(0)}%
                    </div>
                    <p className="text-xs text-text-muted">
                        Of course price to teacher
                    </p>
                </div>
            </div>
            {/* ── Pending Approvals ─────────────────────────────────────────── */}
            {(() => {
                const submitted = payments.filter(
                    (p) => p.status === "submitted",
                );
                return (
                    <div className="bg-navy-surface border border-gold-primary/30 rounded-xl shadow-lg overflow-hidden space-y-4 p-6 sm:p-8">
                        <div className="flex items-center justify-between border-b border-navy-border pb-3">
                            <h2 className="text-xl font-bold text-white font-ethiopic">
                                Pending Payment Approvals
                            </h2>
                            {submitted.length > 0 && (
                                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-gold-primary/20 text-gold-primary">
                                    {submitted.length} awaiting
                                </span>
                            )}
                        </div>
                        {submitted.length === 0 ? (
                            <p className="text-sm text-text-muted text-center py-8">
                                No payments pending approval.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-navy-mid border-b border-navy-border text-xs text-text-secondary uppercase font-bold tracking-wider">
                                            <th className="p-4">Student</th>
                                            <th className="p-4">Service ID</th>
                                            <th className="p-4">Month</th>
                                            <th className="p-4">
                                                Course Price
                                            </th>
                                            <th className="p-4">
                                                Transaction #
                                            </th>
                                            <th className="p-4">
                                                Submitted At
                                            </th>
                                            <th className="p-4">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-navy-border font-medium">
                                        {submitted.map((p) => {
                                            const student = students.find(
                                                (s) => s.id === p.studentId,
                                            );
                                            return (
                                                <tr
                                                    key={p.id}
                                                    className="hover:bg-navy-hover transition-colors"
                                                >
                                                    <td className="p-4 text-white font-bold">
                                                        {student?.fullName ??
                                                            "—"}
                                                    </td>
                                                    <td className="p-4 text-text-secondary text-xs font-mono">
                                                        {student?.serviceId ??
                                                            p.studentId}
                                                    </td>
                                                    <td className="p-4 text-white">
                                                        {p.month}
                                                    </td>
                                                    <td className="p-4 text-gold-primary font-bold">
                                                        {(
                                                            p.coursePrice ?? 0
                                                        ).toLocaleString()}{" "}
                                                        ETB
                                                    </td>
                                                    <td className="p-4 font-mono text-white text-xs">
                                                        {p.transactionRef ??
                                                            "—"}
                                                    </td>
                                                    <td className="p-4 text-text-secondary text-xs">
                                                        {p.submittedAt
                                                            ? new Date(
                                                                  p.submittedAt
                                                                      .seconds *
                                                                      1000,
                                                              ).toLocaleDateString()
                                                            : "—"}
                                                    </td>
                                                    <td className="p-4">
                                                        <button
                                                            onClick={() =>
                                                                handleApprove(
                                                                    p.id,
                                                                )
                                                            }
                                                            className="px-3 py-1.5 bg-gold-primary hover:bg-gold-hover text-navy-deep text-xs font-bold rounded-md transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            })()}
            {/* Monthly Billings */}
            <div className="bg-navy-surface border border-navy-border rounded-xl shadow-lg overflow-hidden space-y-4 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-white font-ethiopic border-b border-navy-border pb-3">
                    Monthly Billings &amp; Collections
                </h2>
                {monthlyList.length === 0 ? (
                    <p className="text-sm text-text-muted text-center py-8">
                        No payments logged yet. Complete student matches to
                        generate invoices.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-navy-mid border-b border-navy-border text-xs text-text-secondary uppercase font-bold tracking-wider">
                                    <th className="p-4">Billing Month</th>
                                    <th className="p-4">Total Students</th>
                                    <th className="p-4">Paid Invoices</th>
                                    <th className="p-4">Total Collected</th>
                                    <th className="p-4">
                                        Company Cut (
                                        {(
                                            (1 - config.teacherPayoutRatio) *
                                            100
                                        ).toFixed(0)}
                                        % + {config.serviceFeeMonthly} ETB)
                                    </th>
                                    <th className="p-4">
                                        Teacher Payout (
                                        {(
                                            config.teacherPayoutRatio * 100
                                        ).toFixed(0)}
                                        %)
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-navy-border font-medium">
                                {monthlyList.map((row) => (
                                    <tr
                                        key={row.month}
                                        className="hover:bg-navy-hover transition-colors"
                                    >
                                        <td className="p-4 text-white font-bold">
                                            {row.month}
                                        </td>
                                        <td className="p-4 text-white">
                                            {row.studentsCount}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-0.5 text-xs font-bold rounded bg-success-faint text-success">
                                                {row.paidCount} /{" "}
                                                {row.studentsCount} Paid
                                            </span>
                                        </td>
                                        <td className="p-4 text-gold-primary font-bold">
                                            {row.totalCollected.toLocaleString()}{" "}
                                            ETB
                                        </td>
                                        <td className="p-4 text-success">
                                            {row.companyCut.toLocaleString()}{" "}
                                            ETB
                                        </td>
                                        <td className="p-4 text-white">
                                            {row.teacherPayouts.toLocaleString()}{" "}
                                            ETB
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Teacher Payout Breakdown */}
            <div className="bg-navy-surface border border-navy-border rounded-xl shadow-lg overflow-hidden space-y-4 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-white font-ethiopic border-b border-navy-border pb-3">
                    {t("payoutBreakdown")}
                </h2>
                {teacherPayoutsList.length === 0 ? (
                    <p className="text-sm text-text-muted text-center py-8">
                        No active payouts for teachers. Complete matches and
                        lessons first.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-navy-mid border-b border-navy-border text-xs text-text-secondary uppercase font-bold tracking-wider">
                                    <th className="p-4">Tutor Details</th>
                                    <th className="p-4">Payment Channel</th>
                                    <th className="p-4">Bank Provider</th>
                                    <th className="p-4">Active Students</th>
                                    <th className="p-4">
                                        This Month Payout (
                                        {(
                                            config.teacherPayoutRatio * 100
                                        ).toFixed(0)}
                                        % Net)
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-navy-border font-medium">
                                {teacherPayoutsList.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="hover:bg-navy-hover transition-colors"
                                    >
                                        <td className="p-4 space-y-1">
                                            <div className="font-bold text-white">
                                                {row.fullName}
                                            </div>
                                            <div className="text-[10px] text-text-muted">
                                                ID: {row.serviceId}
                                            </div>
                                        </td>
                                        <td className="p-4 font-mono text-white text-xs">
                                            {row.bankAccount}
                                        </td>
                                        <td className="p-4 text-white">
                                            {row.bankProvider}
                                        </td>
                                        <td className="p-4 text-gold-primary">
                                            {row.activeStudentsCount} matched
                                        </td>
                                        <td className="p-4 text-white font-bold">
                                            {row.earnedThisMonth.toLocaleString()}{" "}
                                            ETB
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
