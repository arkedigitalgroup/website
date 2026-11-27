// src/components/payments/InvoiceLedger.jsx
// Admin: every monthly invoice, filterable by month / status / search, with
// totals for the current filter and CSV export of exactly what is shown.
"use client";

import { useMemo, useState } from "react";
import { downloadCsv } from "../../lib/csv";
import { invoiceDueDate } from "../../lib/billing";

const STATUSES = ["all", "pending", "submitted", "overdue", "rejected", "paid"];
const STATUS_LABEL = {
    all: ["All", "ሁሉም"],
    pending: ["Unpaid", "ያልተከፈለ"],
    submitted: ["Under review", "በግምገማ ላይ"],
    overdue: ["Overdue", "ዘግይቷል"],
    rejected: ["Rejected", "ውድቅ"],
    paid: ["Paid", "ተከፍሏል"],
};
const STATUS_CLS = {
    pending: "bg-warning-faint text-warning",
    submitted: "bg-navy-mid text-gold-primary",
    overdue: "bg-error-faint text-error",
    rejected: "bg-error-faint text-error",
    paid: "bg-success-faint text-success",
};
const fmt = (n) => Math.round(Number(n) || 0).toLocaleString();

export default function InvoiceLedger({ payments, students, teachers, lang }) {
    const am = lang === "am";
    const label = (s) => STATUS_LABEL[s]?.[am ? 1 : 0] ?? s;
    const [month, setMonth] = useState("all");
    const [status, setStatus] = useState("all");
    const [search, setSearch] = useState("");

    const studentById = useMemo(() => Object.fromEntries(students.map((s) => [s.id, s])), [students]);
    const teacherById = useMemo(() => Object.fromEntries(teachers.map((t) => [t.id, t])), [teachers]);
    const months = useMemo(() => [...new Set(payments.map((p) => p.month).filter(Boolean))].sort().reverse(), [payments]);

    const rows = useMemo(() => {
        const q = search.trim().toLowerCase();
        return payments
            .filter((p) => (month === "all" || p.month === month) && (status === "all" || p.status === status))
            .map((p) => ({ ...p, student: studentById[p.studentId] || {}, teacher: teacherById[p.teacherId] || {} }))
            .filter(
                (r) =>
                    !q ||
                    [r.student.fullName, r.student.phone, r.student.serviceId, r.teacher.fullName, r.transactionRef]
                        .some((v) => String(v || "").toLowerCase().includes(q)),
            )
            .sort((a, b) => (b.month || "").localeCompare(a.month || "") || (a.student.fullName || "").localeCompare(b.student.fullName || ""));
    }, [payments, month, status, search, studentById, teacherById]);

    const billed = rows.reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);
    const collected = rows.filter((r) => r.status === "paid").reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);
    const overdueCount = rows.filter((r) => r.status === "overdue").length;

    const exportCsv = () =>
        downloadCsv(`arke-invoices-${month}-${status}.csv`, [
            ["Month", "Student", "Phone", "Service ID", "Teacher", "Total (ETB)", "Course price", "Service fee", "Teacher share", "Status", "Due date", "Transaction ref"],
            ...rows.map((r) => [
                r.month, r.student.fullName, r.student.phone, r.student.serviceId, r.teacher.fullName,
                r.totalAmount, r.coursePrice, r.serviceFee, r.teacherPayout, r.status, invoiceDueDate(r), r.transactionRef,
            ]),
        ]);

    const SELECT = "px-3 py-2 bg-navy-mid border border-navy-border rounded-md text-white text-sm focus:outline-none focus:border-gold-primary";

    return (
        <div className="bg-navy-surface border border-navy-border rounded-xl shadow-lg p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-navy-border pb-3">
                <h2 className="text-xl font-bold text-white font-ethiopic">{am ? "ሁሉም ደረሰኞች" : "All Invoices"}</h2>
                <button onClick={exportCsv} disabled={rows.length === 0}
                    className="px-3 py-2 rounded-md border border-gold-primary text-gold-primary text-xs font-semibold hover:bg-navy-mid disabled:opacity-40 self-start">
                    ⬇ {am ? "CSV አውርድ" : "Download CSV"} ({rows.length})
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                <select aria-label={am ? "ወር" : "Month"} value={month} onChange={(e) => setMonth(e.target.value)} className={SELECT}>
                    <option value="all">{am ? "ሁሉም ወራት" : "All months"}</option>
                    {months.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder={am ? "ተማሪ፣ ስልክ፣ መለያ ቁጥር፣ መምህር..." : "Student, phone, ID, teacher, ref..."}
                    className={`${SELECT} flex-grow min-w-[12rem]`} />
            </div>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label={am ? "ሁኔታ" : "Status"}>
                {STATUSES.map((s) => (
                    <button key={s} onClick={() => setStatus(s)} aria-pressed={status === s}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${status === s ? "bg-gold-primary text-navy-deep border-gold-primary" : "border-navy-border text-text-secondary hover:text-white"}`}>
                        {label(s)}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
                {[
                    [am ? "የተጠየቀ" : "Billed", `${fmt(billed)} ETB`, "text-white"],
                    [am ? "የተሰበሰበ" : "Collected", `${fmt(collected)} ETB`, "text-success"],
                    [am ? "የዘገዩ" : "Overdue", overdueCount, overdueCount ? "text-error" : "text-text-muted"],
                ].map(([k, v, cls]) => (
                    <div key={k} className="bg-navy-mid border border-navy-border rounded-lg p-3">
                        <div className="text-[10px] uppercase text-text-secondary font-semibold">{k}</div>
                        <div className={`text-base font-extrabold ${cls}`}>{v}</div>
                    </div>
                ))}
            </div>

            {rows.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-8">{am ? "ምንም ደረሰኝ አልተገኘም።" : "No invoices match these filters."}</p>
            ) : (
                <div className="overflow-x-auto max-h-[32rem] overflow-y-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead className="sticky top-0">
                            <tr className="bg-navy-mid border-b border-navy-border text-xs text-text-secondary uppercase font-bold tracking-wider">
                                <th className="p-3">{am ? "ወር" : "Month"}</th>
                                <th className="p-3">{am ? "ተማሪ" : "Student"}</th>
                                <th className="p-3">{am ? "መምህር" : "Teacher"}</th>
                                <th className="p-3">{am ? "መጠን" : "Amount"}</th>
                                <th className="p-3">{am ? "የመክፈያ ቀን" : "Due"}</th>
                                <th className="p-3">{am ? "ሁኔታ" : "Status"}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-navy-border">
                            {rows.map((r) => (
                                <tr key={r.id} className="hover:bg-navy-hover">
                                    <td className="p-3 text-white">{r.month}{r.prorated && <span className="block text-[10px] text-text-muted">{am ? "ከፊል ወር" : "prorated"}</span>}</td>
                                    <td className="p-3">
                                        <div className="text-white font-semibold">{r.student.fullName || r.student.phone || r.studentId}</div>
                                        <div className="text-[10px] text-text-muted">{r.student.serviceId}</div>
                                    </td>
                                    <td className="p-3 text-text-secondary">{r.teacher.fullName || "—"}</td>
                                    <td className="p-3 text-gold-primary font-bold">{fmt(r.totalAmount)} ETB</td>
                                    <td className="p-3 text-text-secondary">{invoiceDueDate(r)}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${STATUS_CLS[r.status] || "text-text-muted"}`}>{label(r.status)}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
