// src/components/student/LessonCalendar.jsx
// Month grid of lessons the tutor has logged (attendanceReports), in Addis time.
"use client";

import { useState } from "react";
import { addisDate, daysInMonth } from "../../lib/billing";

const WEEKDAYS = {
    en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    am: ["ሰኞ", "ማክ", "ረቡ", "ሐሙ", "ዓር", "ቅዳ", "እሁ"],
};

const reportDay = (r) => (r.date?.seconds ? addisDate(new Date(r.date.seconds * 1000)).today : null);

export default function LessonCalendar({ reports, lang }) {
    const am = lang === "am";
    const now = addisDate();
    const [view, setView] = useState({ year: now.year, month: now.month });

    const monthKey = `${view.year}-${String(view.month).padStart(2, "0")}`;
    const byDay = {};
    reports.forEach((r) => {
        const day = reportDay(r);
        if (day?.startsWith(monthKey)) (byDay[day] ||= []).push(r);
    });
    const lessonCount = Object.values(byDay).reduce((n, list) => n + list.length, 0);

    const firstWeekday = (new Date(Date.UTC(view.year, view.month - 1, 1)).getUTCDay() + 6) % 7; // Monday first
    const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth(view.year, view.month) }, (_, i) => i + 1)];
    const shift = (delta) =>
        setView(({ year, month }) => {
            const m = month + delta;
            return { year: year + Math.floor((m - 1) / 12), month: ((m - 1 + 12) % 12) + 1 };
        });
    const monthName = new Date(Date.UTC(view.year, view.month - 1, 1)).toLocaleDateString(am ? "am-ET" : "en-US", { month: "long", year: "numeric", timeZone: "UTC" });

    return (
        <div className="bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-navy-border pb-3">
                <button onClick={() => shift(-1)} aria-label={am ? "ያለፈው ወር" : "Previous month"} className="px-2 py-1 rounded text-text-secondary hover:text-white hover:bg-navy-mid">‹</button>
                <div className="text-center">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">{monthName}</h2>
                    <p className="text-xs text-gold-primary font-semibold">
                        {am ? `${lessonCount} ትምህርቶች` : `${lessonCount} lesson${lessonCount === 1 ? "" : "s"}`}
                    </p>
                </div>
                <button onClick={() => shift(1)} aria-label={am ? "ቀጣዩ ወር" : "Next month"} className="px-2 py-1 rounded text-text-secondary hover:text-white hover:bg-navy-mid">›</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
                {WEEKDAYS[am ? "am" : "en"].map((d) => (
                    <div key={d} className="text-[10px] font-semibold text-text-muted uppercase py-1">{d}</div>
                ))}
                {cells.map((day, i) => {
                    if (!day) return <div key={`blank-${i}`} />;
                    const key = `${monthKey}-${String(day).padStart(2, "0")}`;
                    const lessons = byDay[key];
                    return (
                        <div key={key}
                            title={lessons?.map((r) => (am ? r.topicAm : r.topic) || "").join(" · ")}
                            className={`aspect-square flex flex-col items-center justify-center rounded-md text-xs ${
                                lessons ? "bg-gold-primary text-navy-deep font-bold" : "bg-navy-mid text-text-secondary"
                            } ${key === now.today ? "ring-2 ring-gold-primary" : ""}`}>
                            {day}
                            {lessons?.length > 1 && <span className="text-[9px] leading-none">×{lessons.length}</span>}
                        </div>
                    );
                })}
            </div>
            <p className="text-[11px] text-text-muted">
                {am ? "ቢጫ ቀናት መምህሩ ትምህርት የመዘገበባቸው ናቸው።" : "Highlighted days are lessons your tutor has logged."}
            </p>
        </div>
    );
}
