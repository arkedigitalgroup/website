// src/components/payments/TeacherSalaries.jsx
// Admin: monthly teacher salaries = teacher's share of invoices approved as paid.
// Marking a month paid writes payouts/{teacherId}_{month}; if more invoices are
// approved later, the difference shows as due again.
"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDocs, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { teacherEarnings } from "../../lib/billing";

const fmt = (n) => Math.round(n).toLocaleString();

export default function TeacherSalaries({ payments, teachers, config, lang }) {
    const am = lang === "am";
    const [payouts, setPayouts] = useState({});
    const [banks, setBanks] = useState({});
    const [paying, setPaying] = useState(null); // row being marked paid
    const [reference, setReference] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        getDocs(collection(db, "teacherBankAccounts"))
            .then((snap) => setBanks(Object.fromEntries(snap.docs.map((d) => [d.id, d.data()]))))
            .catch((err) => console.error("Bank accounts:", err));
        return onSnapshot(
            collection(db, "payouts"),
            (snap) => setPayouts(Object.fromEntries(snap.docs.map((d) => [d.id, d.data()]))),
            (err) => console.error("Payouts:", err),
        );
    }, []);

    const teacherById = Object.fromEntries(teachers.map((t) => [t.id, t]));
    const rows = teacherEarnings(payments, config).map((r) => {
        const paid = payouts[r.id]?.amountPaid || 0;
        return { ...r, paid, due: Math.max(0, Math.round(r.earned - paid)) };
    });

    const markPaid = async () => {
        if (!reference.trim()) return;
        setError("");
        try {
            await setDoc(
                doc(db, "payouts", paying.id),
                {
                    teacherId: paying.teacherId,
                    month: paying.month,
                    amountPaid: Math.round(paying.earned),
                    invoiceCount: paying.invoiceCount,
                    reference: reference.trim(),
                    paidAt: serverTimestamp(),
                    paidBy: auth.currentUser?.uid || null,
                },
                { merge: true },
            );
            setPaying(null);
            setReference("");
        } catch (err) {
            console.error("Mark payout paid:", err);
            setError(err.message);
        }
    };

    return (
        <div className="bg-navy-surface border border-navy-border rounded-xl shadow-lg p-6 sm:p-8 space-y-4">
            <div className="border-b border-navy-border pb-3">
                <h2 className="text-xl font-bold text-white font-ethiopic">{am ? "የመምህራን ደመወዝ" : "Teacher Salaries"}</h2>
                <p className="text-xs text-text-muted">
                    {am
                        ? `ከተከፈሉ (የተረጋገጡ) ደረሰኞች ብቻ የመምህሩ ${Math.round(config.teacherPayoutRatio * 100)}% ድርሻ።`
                        : `The teacher's ${Math.round(config.teacherPayoutRatio * 100)}% share of invoices you approved as paid.`}
                </p>
            </div>
            {error && <p className="text-xs text-error">{error}</p>}
            {rows.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-8">{am ? "እስካሁን የተከፈለ ደረሰኝ የለም።" : "No paid invoices yet."}</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-navy-mid border-b border-navy-border text-xs text-text-secondary uppercase font-bold tracking-wider">
                                <th className="p-3">{am ? "መምህር" : "Teacher"}</th>
                                <th className="p-3">{am ? "ወር" : "Month"}</th>
                                <th className="p-3">{am ? "ባንክ" : "Bank"}</th>
                                <th className="p-3">{am ? "የተገኘ" : "Earned"}</th>
                                <th className="p-3">{am ? "የተከፈለ" : "Paid"}</th>
                                <th className="p-3">{am ? "ቀሪ" : "Due"}</th>
                                <th className="p-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-navy-border">
                            {rows.map((r) => {
                                const t = teacherById[r.teacherId] || {};
                                const bank = banks[r.teacherId] || t; // legacy fields until migrated
                                return (
                                    <tr key={r.id} className="hover:bg-navy-hover">
                                        <td className="p-3">
                                            <div className="text-white font-semibold">{t.fullName || t.phone || r.teacherId}</div>
                                            <div className="text-[10px] text-text-muted">{t.serviceId}</div>
                                        </td>
                                        <td className="p-3 text-white">{r.month}</td>
                                        <td className="p-3 text-xs">
                                            {bank.bankAccount ? (
                                                <span className="font-mono text-white">{bank.bankProvider}: {bank.bankAccount}</span>
                                            ) : (
                                                <span className="text-warning">{am ? "አልተሞላም" : "Not provided"}</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-white">{fmt(r.earned)} ETB</td>
                                        <td className="p-3 text-success">
                                            {fmt(r.paid)} ETB
                                            {payouts[r.id]?.reference && (
                                                <div className="text-[10px] text-text-muted font-mono">{payouts[r.id].reference}</div>
                                            )}
                                        </td>
                                        <td className={`p-3 font-bold ${r.due > 0 ? "text-gold-primary" : "text-text-muted"}`}>{fmt(r.due)} ETB</td>
                                        <td className="p-3 text-right">
                                            {r.due > 0 && (
                                                <button onClick={() => { setPaying(r); setReference(""); }}
                                                    className="px-3 py-1.5 bg-gold-primary hover:bg-gold-hover text-navy-deep text-xs font-bold rounded-md">
                                                    {am ? "ተከፍሏል" : "Mark paid"}
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

            {paying && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-navy-surface border border-navy-border rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <h3 className="text-lg font-bold text-white">
                            {am ? "ደመወዝ ተከፍሏል" : "Mark salary paid"}: {fmt(paying.due)} ETB · {paying.month}
                        </h3>
                        <input value={reference} onChange={(e) => setReference(e.target.value)}
                            placeholder={am ? "የባንክ ዝውውር ቁጥር" : "Bank transfer reference"}
                            className="w-full px-3 py-2 bg-navy-mid border border-navy-border rounded-md text-white text-sm focus:outline-none focus:border-gold-primary" />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setPaying(null)} className="px-4 py-2 rounded border border-navy-border text-text-secondary text-xs font-semibold">
                                {am ? "ተመለስ" : "Cancel"}
                            </button>
                            <button onClick={markPaid} disabled={!reference.trim()}
                                className="px-4 py-2 rounded bg-gold-primary text-navy-deep text-xs font-bold disabled:opacity-50">
                                {am ? "አረጋግጥ" : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
