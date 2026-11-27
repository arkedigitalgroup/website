// src/components/teacher/EarningsCard.jsx
// Teacher home: this month's salary so far (paid invoices only), what students still owe, and the last transfer.
import Link from "next/link";
import { addisDate, calcTeacherPayout, teacherEarnings } from "../../lib/billing";

const fmt = (n) => Math.round(Number(n) || 0).toLocaleString();

export default function EarningsCard({ payments, payouts, config, lang }) {
    const am = lang === "am";
    const month = addisDate().monthKey;
    const earned = teacherEarnings(payments, config).find((r) => r.month === month)?.earned || 0;
    const awaiting = payments
        .filter((p) => p.month === month && p.status !== "paid")
        .reduce((sum, p) => sum + (p.teacherPayout ?? calcTeacherPayout(config, Number(p.coursePrice) || 0)), 0);
    const lastTransfer = [...payouts].sort((a, b) => (b.month || "").localeCompare(a.month || ""))[0];

    const tiles = [
        [am ? "የዚህ ወር ገቢ" : "Earned this month", `${fmt(earned)} ETB`, "text-success"],
        [am ? "ከተማሪዎች የሚጠበቅ" : "Awaiting student payment", `${fmt(awaiting)} ETB`, "text-warning"],
        [
            am ? "የመጨረሻ ዝውውር" : "Last salary sent",
            lastTransfer ? `${fmt(lastTransfer.amountPaid)} ETB` : "—",
            "text-white",
            lastTransfer?.month,
        ],
    ];

    return (
        <div className="bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-navy-border pb-3">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">{am ? "ገቢ" : "Earnings"}</h2>
                <Link href="/teacher/payouts" className="text-xs text-gold-primary hover:underline">
                    {am ? "ዝርዝር →" : "Details →"}
                </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {tiles.map(([label, value, cls, sub]) => (
                    <div key={label} className="bg-navy-mid border border-navy-border rounded-lg p-3">
                        <div className="text-[10px] uppercase text-text-secondary font-semibold">{label}</div>
                        <div className={`text-lg font-extrabold ${cls}`}>{value}</div>
                        {sub && <div className="text-[10px] text-text-muted">{sub}</div>}
                    </div>
                ))}
            </div>
            <p className="text-[11px] text-text-muted">
                {am
                    ? "ደመወዝ የሚቆጠረው ተማሪው ከፍሎ አስተዳዳሪ ሲያረጋግጥ ብቻ ነው። አርኬ በየወሩ ወደ ባንክ ሂሳብዎ ያስተላልፋል።"
                    : "Salary counts only once a student's payment is approved. Arke transfers it to your bank account monthly."}
            </p>
        </div>
    );
}
