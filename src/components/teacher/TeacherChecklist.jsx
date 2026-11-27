// src/components/teacher/TeacherChecklist.jsx
// Everything a teacher needs before they can be matched; hidden once all done.
import Link from "next/link";
import { isYenetaUser } from "../../lib/serviceLine";

export default function TeacherChecklist({ teacher, lang }) {
    if (!teacher) return null;
    const am = lang === "am";
    const yeneta = isYenetaUser(teacher);
    const items = [
        [am ? "ሙሉ ስም" : "Full name", teacher.fullName],
        ...(yeneta ? [[am ? "የክርስትና ስም" : "Christian name", teacher.christianName]] : []),
        [am ? "ስልክ ቁጥር" : "Phone number", teacher.phone],
        [am ? "አካባቢ" : "Location pin", teacher.locationPin?.lat],
        [am ? "የባንክ መለያ" : "Bank account", teacher.hasBankAccount || teacher.bankAccount],
        [am ? "መታወቂያ" : "ID card", teacher.idCardUrl],
        [am ? "የትምህርት ሰርተፊኬት" : "Education certificate", teacher.eduCertUrl],
        ...(yeneta ? [[am ? "የቤተ ክርስቲያን ደብዳቤ" : "Church endorsement letter", teacher.churchDocUrl]] : []),
        [am ? "የምዝገባ ክፍያ" : "Registration fee", teacher.registrationFeePaid !== false],
    ];
    const done = items.filter(([, ok]) => ok).length;
    const allFilled = done === items.length;
    if (allFilled && teacher.verified) return null;

    return (
        <div className="bg-navy-surface border border-gold-primary/30 rounded-xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between gap-3 border-b border-navy-border pb-3">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                    {am ? "የመምህር ዝግጁነት" : "Getting ready to teach"}
                </h2>
                <span className="text-sm font-bold text-gold-primary">{done}/{items.length}</span>
            </div>
            <div className="w-full h-2 bg-navy-mid rounded-full overflow-hidden">
                <div className="h-full bg-gold-primary" style={{ width: `${(done / items.length) * 100}%` }} />
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {items.map(([label, ok]) => (
                    <li key={label} className={`flex items-center gap-2 ${ok ? "text-text-secondary" : "text-white font-semibold"}`}>
                        <span className={ok ? "text-success" : "text-warning"} aria-hidden>{ok ? "✓" : "○"}</span>
                        <span className={ok ? "line-through opacity-70" : ""}>{label}</span>
                        <span className="sr-only">{ok ? (am ? "ተጠናቋል" : "done") : am ? "ይቀራል" : "missing"}</span>
                    </li>
                ))}
            </ul>
            {allFilled ? (
                <p className="text-xs text-text-secondary">
                    ⏳ {am ? "ሁሉም ተሟልቷል። አስተዳዳሪ እየገመገመ ነው፤ ሲጸድቅ ተማሪ ይመደብልዎታል።" : "All done. An admin is reviewing your account; students are matched once you're approved."}
                </p>
            ) : (
                <Link href="/teacher/account" className="inline-block px-4 py-2 rounded bg-gold-primary text-navy-deep font-bold text-xs hover:bg-gold-hover">
                    {am ? "መገለጫዬን አሟላ" : "Complete my profile"}
                </Link>
            )}
        </div>
    );
}
