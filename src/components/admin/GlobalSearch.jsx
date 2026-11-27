// src/components/admin/GlobalSearch.jsx
// One box to find any student or teacher by name, phone or service ID; links into the right admin list.
"use client";

import { useState } from "react";
import Link from "next/link";

export default function GlobalSearch({ students, teachers, lang }) {
    const am = lang === "am";
    const [q, setQ] = useState("");
    const term = q.trim().toLowerCase();
    const people = [
        ...students.map((p) => ({ ...p, role: "student" })),
        ...teachers.map((p) => ({ ...p, role: "teacher" })),
    ];
    const hits = term.length < 2 ? [] : people
        .filter((p) => [p.fullName, p.christianName, p.phone, p.serviceId].some((v) => String(v || "").toLowerCase().includes(term)))
        .slice(0, 8);

    return (
        <div className="relative">
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)}
                aria-label={am ? "ተማሪ ወይም መምህር ፈልግ" : "Search students and teachers"}
                placeholder={am ? "🔍 ተማሪ ወይም መምህር ፈልግ (ስም፣ ስልክ፣ መለያ ቁጥር)" : "🔍 Find a student or teacher (name, phone, service ID)"}
                className="w-full px-4 py-3 bg-navy-mid border border-navy-border rounded-lg text-white text-sm placeholder-text-muted focus:outline-none focus:border-gold-primary" />
            {term.length >= 2 && (
                <ul className="absolute z-20 mt-1 w-full bg-navy-surface border border-navy-border rounded-lg shadow-2xl divide-y divide-navy-border overflow-hidden">
                    {hits.length === 0 ? (
                        <li className="px-4 py-3 text-xs text-text-muted">{am ? "ምንም አልተገኘም።" : "No one matches."}</li>
                    ) : hits.map((p) => (
                        <li key={`${p.role}-${p.id}`}>
                            <Link href={`/admin/${p.role}s?q=${encodeURIComponent(p.serviceId || p.phone || p.fullName || "")}`}
                                className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-navy-hover">
                                <span>
                                    <span className="block text-sm text-white font-semibold">{p.fullName || p.phone}</span>
                                    <span className="block text-[11px] text-text-muted">{[p.serviceId, p.phone].filter(Boolean).join(" · ")}</span>
                                </span>
                                <span className="text-[10px] font-bold uppercase text-gold-primary">
                                    {p.role === "student" ? (am ? "ተማሪ" : "Student") : am ? "መምህር" : "Teacher"}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
