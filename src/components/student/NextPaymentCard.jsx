// src/components/student/NextPaymentCard.jsx
// Student home: the oldest open invoice (amount, due date, days left) plus recent history.
"use client";

import Link from "next/link";
import { addisDate, invoiceDueDate } from "../../lib/billing";

const OPEN = ["overdue", "rejected", "pending", "submitted"]; // most urgent first
const LABEL = {
    pending: ["Unpaid", "ያልተከፈለ", "text-warning"],
    submitted: ["Under review", "በግምገማ ላይ", "text-gold-primary"],
    overdue: ["Overdue", "ዘግይቷል", "text-error"],
    rejected: ["Receipt rejected", "ደረሰኝ ውድቅ", "text-error"],
    paid: ["Paid", "ተከፍሏል", "text-success"],
};
const fmt = (n) => Math.round(Number(n) || 0).toLocaleString();

export default function NextPaymentCard({ payments, lang }) {
    const am = lang === "am";
    const label = (s) => LABEL[s] || [s, s, "text-text-muted"];
    const today = addisDate().today;
    const open = payments
        .filter((p) => OPEN.includes(p.status))
        .sort((a, b) => OPEN.indexOf(a.status) - OPEN.indexOf(b.status) || (a.month || "").localeCompare(b.month || ""));
    const next = open[0];
    const recent = [...payments].sort((a, b) => (b.month || "").localeCompare(a.month || "")).slice(0, 3);
    const due = next && invoiceDueDate(next);
    const daysLeft = due && Math.round((Date.parse(due) - Date.parse(today)) / 86400000);

    return (
        <div className="bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md space-y-4">
            <h2 className="text-lg font-bold text-white border-b border-navy-border pb-3 uppercase tracking-wider">
                {am ? "ክፍያ" : "Billing"}
            </h2>

            {next ? (
                <div className="bg-navy-mid border border-navy-border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-baseline gap-2">
                        <span className="text-xs text-text-secondary font-semibold uppercase">
                            {next.month}{open.length > 1 && ` (+${open.length - 1})`}
                        </span>
                        <span className={`text-xs font-bold ${label(next.status)[2]}`}>{label(next.status)[am ? 1 : 0]}</span>
                    </div>
                    <div className="text-2xl font-extrabold text-gold-primary">{fmt(next.totalAmount)} ETB</div>
                    <p className={`text-xs ${daysLeft < 0 ? "text-error" : "text-text-secondary"}`}>
                        {am ? "የመክፈያ ቀን" : "Due"}: {due}
                        {next.status !== "submitted" &&
                            (daysLeft >= 0
                                ? am ? ` · ${daysLeft} ቀናት ቀርተዋል` : ` · ${daysLeft} day${daysLeft === 1 ? "" : "s"} left`
                                : am ? ` · በ${-daysLeft} ቀናት ዘግይቷል` : ` · ${-daysLeft} day${daysLeft === -1 ? "" : "s"} late`)}
                    </p>
                    {next.status !== "submitted" && (
                        <Link href="/student/payments"
                            className="block text-center py-2 rounded bg-gold-primary text-navy-deep font-bold text-xs hover:bg-gold-hover">
                            {am ? "ደረሰኝ ስቀል" : "Submit receipt"}
                        </Link>
                    )}
                </div>
            ) : (
                <p className="text-sm text-success font-semibold text-center py-3">
                    ✅ {payments.length ? (am ? "ሁሉም ክፍያዎች ተፈጽመዋል።" : "You're all paid up.") : am ? "እስካሁን ደረሰኝ የለም።" : "No invoices yet."}
                </p>
            )}

            {recent.length > 0 && (
                <ul className="divide-y divide-navy-border text-xs">
                    {recent.map((p) => (
                        <li key={p.id} className="flex justify-between py-2">
                            <span className="text-text-secondary">{p.month}</span>
                            <span className="text-white font-semibold">{fmt(p.totalAmount)} ETB</span>
                            <span className={`font-bold ${label(p.status)[2]}`}>{label(p.status)[am ? 1 : 0]}</span>
                        </li>
                    ))}
                </ul>
            )}
            <Link href="/student/payments" className="block text-center text-xs text-gold-primary hover:underline">
                {am ? "ሁሉንም ክፍያዎች እይ →" : "View full payment history →"}
            </Link>
        </div>
    );
}
