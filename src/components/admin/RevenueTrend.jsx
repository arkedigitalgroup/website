// src/components/admin/RevenueTrend.jsx
// Last 6 months: amount invoiced (track) with the part collected (filled) — one axis, one bar per month.
import { addisDate } from "../../lib/billing";

const fmt = (n) => Math.round(n).toLocaleString();

export function lastMonths(count, now = addisDate()) {
    return Array.from({ length: count }, (_, i) => {
        const d = new Date(Date.UTC(now.year, now.month - 1 - (count - 1 - i), 1));
        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    });
}

export default function RevenueTrend({ payments, lang }) {
    const am = lang === "am";
    const rows = lastMonths(6).map((month) => {
        const inMonth = payments.filter((p) => p.month === month);
        const billed = inMonth.reduce((s, p) => s + (Number(p.totalAmount) || 0), 0);
        const collected = inMonth.filter((p) => p.status === "paid").reduce((s, p) => s + (Number(p.totalAmount) || 0), 0);
        return { month, billed, collected };
    });
    const max = Math.max(1, ...rows.map((r) => r.billed));
    const L = { billed: am ? "የተጠየቀ" : "Invoiced", collected: am ? "የተሰበሰበ" : "Collected" };

    return (
        <section className="bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    {am ? "ወርሃዊ ክፍያ — ያለፉት 6 ወራት" : "Monthly billing — last 6 months"}
                </h2>
                <div className="flex gap-4 text-xs text-text-secondary" aria-hidden>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-navy-border" />{L.billed}</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-gold-primary" />{L.collected}</span>
                </div>
            </div>
            <div className="grid grid-cols-6 gap-3 items-end h-44" aria-hidden>
                {rows.map((r) => (
                    <div key={r.month} className="h-full flex flex-col justify-end items-center gap-1 group"
                        title={`${r.month}\n${L.billed}: ${fmt(r.billed)} ETB\n${L.collected}: ${fmt(r.collected)} ETB`}>
                        <span className="text-[10px] text-text-secondary opacity-0 group-hover:opacity-100">{fmt(r.collected)}</span>
                        <div className="w-full max-w-[3rem] bg-navy-border rounded-t flex flex-col justify-end overflow-hidden"
                            style={{ height: `${(r.billed / max) * 100}%`, minHeight: r.billed ? 4 : 0 }}>
                            <div className="w-full bg-gold-primary rounded-t" style={{ height: r.billed ? `${(r.collected / r.billed) * 100}%` : 0 }} />
                        </div>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-6 gap-3 text-center text-[10px] text-text-muted" aria-hidden>
                {rows.map((r) => <span key={r.month}>{r.month}</span>)}
            </div>
            <table className="sr-only">
                <caption>{am ? "ወርሃዊ ክፍያ" : "Monthly billing"}</caption>
                <thead><tr><th>{am ? "ወር" : "Month"}</th><th>{L.billed}</th><th>{L.collected}</th></tr></thead>
                <tbody>{rows.map((r) => <tr key={r.month}><td>{r.month}</td><td>{fmt(r.billed)} ETB</td><td>{fmt(r.collected)} ETB</td></tr>)}</tbody>
            </table>
        </section>
    );
}
