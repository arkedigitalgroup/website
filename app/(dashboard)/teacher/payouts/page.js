// app/(dashboard)/teacher/payouts/page.js
"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../../src/lib/firebase";
import { useAuth } from "../../../../src/context/AuthContext";
import { useLanguage } from "../../../../src/context/LanguageContext";
import { calcTeacherPayout } from "../../../../src/types/index";

export default function TeacherPayouts() {
    const { user } = useAuth();
    const { lang } = useLanguage();
    const [payments, setPayments] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayouts = async () => {
            if (!user) return;
            try {
                setLoading(true);

                // 1. Fetch payments where teacherId == user.uid
                const paymentsQuery = query(
                    collection(db, "payments"),
                    where("teacherId", "==", user.uid),
                );
                const paymentsSnap = await getDocs(paymentsQuery);
                const list = [];
                paymentsSnap.forEach((doc) => {
                    list.push({ id: doc.id, ...doc.data() });
                });
                setPayments(list);

                // 2. Fetch matched students to show names in payout breakdown
                const studentsQuery = query(
                    collection(db, "students"),
                    where("assignedTeacherId", "==", user.uid),
                );
                const studentsSnap = await getDocs(studentsQuery);
                const sList = [];
                studentsSnap.forEach((doc) => {
                    sList.push({ id: doc.id, ...doc.data() });
                });
                setStudents(sList);
            } catch (err) {
                console.error("Error loading teacher payouts:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPayouts();
    }, [user]);

    // Aggregate monthly earnings
    const monthlyAggregates = {};
    payments.forEach((payment) => {
        const month = payment.month;
        if (!monthlyAggregates[month]) {
            monthlyAggregates[month] = {
                month,
                amount: 0,
                status: "pending",
                studentsCount: 0,
            };
        }

        // Add net teacher payout (85% of course price)
        const payout =
            payment.teacherPayout ||
            calcTeacherPayout(payment.coursePrice || 4200);
        monthlyAggregates[month].amount += payout;
        monthlyAggregates[month].studentsCount++;
        if (payment.status === "paid") {
            monthlyAggregates[month].status = "paid";
        }
    });

    const monthlyList = Object.values(monthlyAggregates).sort((a, b) =>
        b.month.localeCompare(a.month),
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="w-10 h-10 border-4 border-gold-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-text-secondary text-sm animate-pulse">
                    Loading payouts overview...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Title */}
            <div>
                <h1 className="text-3xl font-extrabold text-white font-ethiopic leading-snug">
                    {lang === "am" ? "የክፍያዎቼ መግለጫ" : "Tutor Payouts Statement"}
                </h1>
                <p className="text-sm text-text-secondary">
                    Track your monthly net earnings representing 85% of matched
                    course packages. Paid directly to your bank provider.
                </p>
            </div>

            {/* Payout Summary Cards */}
            <div className="bg-navy-surface border border-navy-border rounded-xl p-6 sm:p-8 shadow-md">
                <h2 className="text-lg font-bold text-white mb-4 border-b border-navy-border pb-2">
                    Monthly Payout Summary
                </h2>

                {monthlyList.length === 0 ? (
                    <p className="text-sm text-text-muted text-center py-6">
                        No payout statements generated yet.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-navy-mid border-b border-navy-border text-xs text-text-secondary uppercase font-bold tracking-wider">
                                    <th className="p-4">Billing Month</th>
                                    <th className="p-4">Total Students</th>
                                    <th className="p-4">
                                        Payout Amount (85% Net)
                                    </th>
                                    <th className="p-4 text-right">
                                        Payment Status
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
                                            {row.studentsCount} students
                                        </td>
                                        <td className="p-4 text-gold-primary font-bold">
                                            {row.amount.toLocaleString()} ETB
                                        </td>
                                        <td className="p-4 text-right">
                                            {row.status === "paid" ? (
                                                <span className="px-2.5 py-0.5 rounded bg-success-faint text-success font-bold text-xs uppercase border border-success/15">
                                                    Paid to Bank
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-0.5 rounded bg-warning-faint text-warning font-bold text-xs uppercase border border-warning/15">
                                                    Processing
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Payout breakdown per Student */}
            <div className="bg-navy-surface border border-navy-border rounded-xl p-6 sm:p-8 shadow-md">
                <h2 className="text-lg font-bold text-white mb-4 border-b border-navy-border pb-2">
                    Earnings Breakdown Per Student
                </h2>

                {students.length === 0 ? (
                    <p className="text-sm text-text-muted text-center py-6">
                        No active matched students.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {students.map((student) => {
                            const price =
                                student.courseId === "all-courses"
                                    ? 7100
                                    : student.courseId === "diquna-zegajat"
                                      ? 4700
                                      : 4200;
                            const netPayout = calcTeacherPayout(price);
                            return (
                                <div
                                    key={student.id}
                                    className="bg-navy-mid border border-navy-border rounded-lg p-4 flex items-center justify-between"
                                >
                                    <div>
                                        <h3 className="font-bold text-white text-sm">
                                            {student.fullName}
                                        </h3>
                                        <p className="text-xs text-text-secondary capitalize">
                                            Course: {student.courseId}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-extrabold text-gold-primary text-sm">
                                            {netPayout.toLocaleString()} ETB
                                        </span>
                                        <span className="text-[10px] text-text-muted block">
                                            85% Share
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
