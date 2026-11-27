// app/(dashboard)/admin/page.js
"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { db } from "../../../src/lib/firebase";
import { useLanguage } from "../../../src/context/LanguageContext";
import { usePlatformConfig } from "../../../src/hooks/Useplatformconfig";
import Link from "next/link";
import { addisDate } from "../../../src/lib/billing";
import RevenueTrend from "../../../src/components/admin/RevenueTrend";
import GlobalSearch from "../../../src/components/admin/GlobalSearch";

const AM = {
    Students: "ተማሪዎች", Teachers: "መምህራን", Financials: "ፋይናንስ", "Billing health": "የክፍያ ሁኔታ",
    "Total Registered": "ጠቅላላ የተመዘገቡ", "all enrolled students": "ሁሉም የተመዘገቡ ተማሪዎች",
    "Awaiting Match": "መምህር የሚጠብቁ", "no teacher assigned yet": "መምህር ገና አልተመደበም", "Go to Matching": "ወደ ምደባ",
    "Active in Class": "በትምህርት ላይ", "matched + account unlocked": "የተመደቡና ያልተዘጉ",
    "Total Teachers": "ጠቅላላ መምህራን", "registered on platform": "በመድረኩ የተመዘገቡ",
    Verified: "የተረጋገጡ", "approved and active": "የጸደቁ", "Pending Verification": "ማረጋገጫ የሚጠብቁ",
    "awaiting document review": "ሰነድ ግምገማ የሚጠብቁ", "Review Now": "አሁን ገምግም",
    "company cut this month": "የዚህ ወር የአርኬ ድርሻ", "Arke Revenue — All Time": "የአርኬ ገቢ — ጠቅላላ",
    "total company cut": "ጠቅላላ የአርኬ ድርሻ", "Total Collected — All Time": "የተሰበሰበ — ጠቅላላ",
    "total paid by parents": "ወላጆች የከፈሉት ጠቅላላ", "View Finances": "ፋይናንስ እይ",
    "Collection Rate": "የመሰብሰብ መጠን", "of this month's invoices paid": "የዚህ ወር ደረሰኞች የተከፈሉ",
    Outstanding: "ያልተከፈለ", "unpaid, rejected or overdue": "ያልተከፈሉ፣ ውድቅ ወይም የዘገዩ",
    "Overdue Invoices": "የዘገዩ ደረሰኞች", "past the due date": "የመክፈያ ቀን ያለፈባቸው",
    "Locked Dashboards": "የተዘጉ ዳሽቦርዶች", "students blocked until they pay": "እስኪከፍሉ የተዘጉ ተማሪዎች",
    "Recent Announcements": "የቅርብ ማስታወቂያዎች", "No announcements yet.": "እስካሁን ማስታወቂያ የለም።",
    Title: "ርዕስ", "All Users": "ሁሉም ተጠቃሚዎች", "Teachers Only": "መምህራን ብቻ", "Students / Parents Only": "ተማሪዎች / ወላጆች ብቻ",
};

export default function AdminOverview() {
    const { t, lang } = useLanguage();
    const L = (en) => (lang === "am" && AM[en]) || en;
    const { config } = usePlatformConfig();
    const currentMonth = addisDate().monthKey; // "YYYY-MM" in Addis time

    const [stats, setStats] = useState(null);
    const [announcementList, setAnnouncementList] = useState([]);
    const [people, setPeople] = useState({ students: [], teachers: [] });
    const [payments, setPayments] = useState([]);
    const [targetRole, setTargetRole] = useState("all");
    const [announcementText, setAnnouncementText] = useState("");
    const [announcementTitleText, setAnnouncementTitleText] = useState("");
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [postSuccess, setPostSuccess] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);

            const [teachersSnap, studentsSnap, paymentsSnap, annSnap] =
                await Promise.all([
                    getDocs(collection(db, "teachers")),
                    getDocs(collection(db, "students")),
                    getDocs(collection(db, "payments")),
                    getDocs(collection(db, "announcements")),
                ]);

            // ── Teachers ───────────────────────────────────────────────────
            let totalTeachers = 0,
                verifiedTeachers = 0,
                pendingTeachers = 0;
            teachersSnap.forEach((d) => {
                totalTeachers++;
                d.data().verified ? verifiedTeachers++ : pendingTeachers++;
            });

            // ── Students ───────────────────────────────────────────────────
            let totalStudents = 0,
                unmatchedStudents = 0,
                activeStudents = 0;
            studentsSnap.forEach((d) => {
                const s = d.data();
                totalStudents++;
                if (!s.assignedTeacherId) unmatchedStudents++;
                if (s.assignedTeacherId && !s.dashboardLocked) activeStudents++;
            });

            // ── Payments ───────────────────────────────────────────────────
            // companyRevenue is snapshotted on each payment at billing time.
            // For records missing companyRevenue (legacy), derive from config.
            let revenueThisMonth = 0,
                revenueAllTime = 0,
                totalCollected = 0;
            paymentsSnap.forEach((d) => {
                const p = d.data();
                if (p.status !== "paid") return;

                const companyRevenue =
                    p.companyRevenue ??
                    p.coursePrice * (1 - config.teacherPayoutRatio) +
                        config.serviceFeeMonthly;
                const total =
                    p.totalAmount ?? p.coursePrice + config.serviceFeeMonthly;

                revenueAllTime += companyRevenue;
                totalCollected += total;
                if (p.month === currentMonth) {
                    revenueThisMonth += companyRevenue;
                }
            });

            // ── Billing health ─────────────────────────────────────────────
            const pays = paymentsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
            const open = pays.filter((p) => ["pending", "rejected", "overdue"].includes(p.status));
            const monthPays = pays.filter((p) => p.month === currentMonth);
            const outstanding = open.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
            const overdueCount = pays.filter((p) => p.status === "overdue").length;
            const lockedStudents = studentsSnap.docs.filter((d) => d.data().dashboardLocked).length;
            const collectionRate = monthPays.length
                ? Math.round((monthPays.filter((p) => p.status === "paid").length / monthPays.length) * 100)
                : null;

            // ── Announcements ──────────────────────────────────────────────
            const anns = annSnap.docs
                .map((d) => ({ id: d.id, ...d.data() }))
                .sort(
                    (a, b) =>
                        (b.createdAt?.seconds || 0) -
                        (a.createdAt?.seconds || 0),
                )
                .slice(0, 5);

            setStats({
                totalTeachers,
                verifiedTeachers,
                pendingTeachers,
                totalStudents,
                unmatchedStudents,
                activeStudents,
                revenueThisMonth,
                revenueAllTime,
                totalCollected,
                outstanding,
                overdueCount,
                lockedStudents,
                collectionRate,
            });
            setAnnouncementList(anns);
            setPayments(pays);
            setPeople({
                students: studentsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
                teachers: teachersSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
            });
        } catch (err) {
            console.error("Error loading admin overview:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handlePostAnnouncement = async (e) => {
        e.preventDefault();
        if (!announcementText || !announcementTitleText) return;
        setPosting(true);
        setPostSuccess("");
        try {
            await addDoc(collection(db, "announcements"), {
                title: announcementTitleText.trim(),
                content: announcementText.trim(),
                targetRole,
                createdAt: new Date(),
            });
            setPostSuccess(t("postSuccess"));
            setAnnouncementText("");
            setAnnouncementTitleText("");
            fetchData();
        } catch (err) {
            console.error("Announcement error:", err);
        } finally {
            setPosting(false);
        }
    };

    if (loading || !stats) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="w-10 h-10 border-4 border-gold-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-text-secondary text-sm animate-pulse">
                    Loading overview...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Title */}
            <div>
                <h1 className="text-3xl font-extrabold text-white font-ethiopic">
                    {t("adminDashTitle")}
                </h1>
                <p className="text-sm text-text-secondary">
                    {lang === "am"
                        ? "አርኬ ዲጂታል የቁጥጥር ፓነል"
                        : "Arke Digital Control Panel — " + currentMonth}
                </p>
            </div>

            <GlobalSearch students={people.students} teachers={people.teachers} lang={lang} />

            {/* ── Billing health ── */}
            <section className="space-y-3">
                <h2 className="text-xs font-bold text-text-secondary uppercase tracking-widest">{L("Billing health")}</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon="📈" label={L("Collection Rate")}
                        value={stats.collectionRate == null ? "—" : stats.collectionRate + "%"}
                        sub={L("of this month's invoices paid")} color="text-gold-primary" />
                    <StatCard icon="🧾" label={L("Outstanding")} value={Math.round(stats.outstanding).toLocaleString() + " ETB"}
                        sub={L("unpaid, rejected or overdue")} color={stats.outstanding > 0 ? "text-warning" : "text-success"}
                        action={{ label: L("View Finances"), href: "/admin/finances" }} />
                    <StatCard icon="⏰" label={L("Overdue Invoices")} value={stats.overdueCount}
                        sub={L("past the due date")} color={stats.overdueCount > 0 ? "text-error" : "text-success"} />
                    <StatCard icon="🔒" label={L("Locked Dashboards")} value={stats.lockedStudents}
                        sub={L("students blocked until they pay")} color={stats.lockedStudents > 0 ? "text-error" : "text-success"} />
                </div>
            </section>

            {/* ── Student Stats ── */}
            <section className="space-y-3">
                <h2 className="text-xs font-bold text-text-secondary uppercase tracking-widest">{L("Students")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        icon="👶"
                        label={L("Total Registered")}
                        value={stats.totalStudents}
                        sub={L("all enrolled students")}
                        color="text-white"
                    />
                    <StatCard
                        icon="⏳"
                        label={L("Awaiting Match")}
                        value={stats.unmatchedStudents}
                        sub={L("no teacher assigned yet")}
                        color={
                            stats.unmatchedStudents > 0
                                ? "text-warning"
                                : "text-success"
                        }
                        action={{
                            label: L("Go to Matching"),
                            href: "/admin/matching",
                        }}
                    />
                    <StatCard
                        icon="✅"
                        label={L("Active in Class")}
                        value={stats.activeStudents}
                        sub={L("matched + account unlocked")}
                        color="text-success"
                    />
                </div>
            </section>

            {/* ── Teacher Stats ── */}
            <section className="space-y-3">
                <h2 className="text-xs font-bold text-text-secondary uppercase tracking-widest">{L("Teachers")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        icon="👨‍🏫"
                        label={L("Total Teachers")}
                        value={stats.totalTeachers}
                        sub={L("registered on platform")}
                        color="text-white"
                    />
                    <StatCard
                        icon="✔️"
                        label={L("Verified")}
                        value={stats.verifiedTeachers}
                        sub={L("approved and active")}
                        color="text-success"
                    />
                    <StatCard
                        icon="🔍"
                        label={L("Pending Verification")}
                        value={stats.pendingTeachers}
                        sub={L("awaiting document review")}
                        color={
                            stats.pendingTeachers > 0
                                ? "text-warning"
                                : "text-success"
                        }
                        action={{
                            label: L("Review Now"),
                            href: "/admin/teachers",
                        }}
                    />
                </div>
            </section>

            {/* ── Financial Stats ── */}
            <section className="space-y-3">
                <h2 className="text-xs font-bold text-text-secondary uppercase tracking-widest">{L("Financials")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        icon="📅"
                        label={(lang === "am" ? "የአርኬ ገቢ — " : "Arke Revenue — ") + currentMonth}
                        value={stats.revenueThisMonth.toLocaleString() + " ETB"}
                        sub={L("company cut this month")}
                        color="text-gold-primary"
                        action={{
                            label: L("View Finances"),
                            href: "/admin/finances",
                        }}
                    />
                    <StatCard
                        icon="💼"
                        label={L("Arke Revenue — All Time")}
                        value={stats.revenueAllTime.toLocaleString() + " ETB"}
                        sub={L("total company cut")}
                        color="text-gold-primary"
                    />
                    <StatCard
                        icon="💰"
                        label={L("Total Collected — All Time")}
                        value={stats.totalCollected.toLocaleString() + " ETB"}
                        sub={L("total paid by parents")}
                        color="text-white"
                    />
                </div>
            </section>

            <RevenueTrend payments={payments} lang={lang} />

            {/* ── Announcements ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Post form */}
                <div className="bg-navy-surface border border-navy-border rounded-xl p-6 sm:p-8 shadow-lg space-y-4">
                    <h2 className="text-xl font-bold text-white font-ethiopic border-b border-navy-border pb-3">
                        {t("announcementTitle")}
                    </h2>
                    <form
                        onSubmit={handlePostAnnouncement}
                        className="space-y-4"
                    >
                        <div className="space-y-1">
                            <label className="text-xs text-text-secondary font-semibold uppercase">{L("Title")}</label>
                            <input
                                type="text"
                                required
                                value={announcementTitleText}
                                onChange={(e) =>
                                    setAnnouncementTitleText(e.target.value)
                                }
                                placeholder="e.g. System Maintenance Notice"
                                className="w-full px-4 py-2.5 bg-navy-mid border border-navy-border rounded-md text-white placeholder-text-muted focus:outline-none focus:border-gold-primary text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-text-secondary font-semibold uppercase">
                                {t("announcementRole")}
                            </label>
                            <select
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                className="w-full px-4 py-2.5 bg-navy-mid border border-navy-border rounded-md text-white focus:outline-none focus:border-gold-primary text-sm"
                            >
                                <option value="all">{L("All Users")}</option>
                                <option value="teacher">{L("Teachers Only")}</option>
                                <option value="student">{L("Students / Parents Only")}</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-text-secondary font-semibold uppercase">
                                {t("announcementContent")}
                            </label>
                            <textarea
                                required
                                rows="4"
                                value={announcementText}
                                onChange={(e) =>
                                    setAnnouncementText(e.target.value)
                                }
                                placeholder="Write your announcement here..."
                                className="w-full px-4 py-2.5 bg-navy-mid border border-navy-border rounded-md text-white placeholder-text-muted focus:outline-none focus:border-gold-primary text-sm resize-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={posting}
                            className="w-full py-2.5 font-semibold rounded bg-gold-primary text-navy-deep hover:bg-gold-hover transition-all duration-200 disabled:opacity-50 text-sm"
                        >
                            {posting
                                ? "Publishing..."
                                : t("btnPostAnnouncement")}
                        </button>
                        {postSuccess && (
                            <p className="text-success text-xs font-semibold text-center">
                                🎉 {postSuccess}
                            </p>
                        )}
                    </form>
                </div>

                {/* Recent announcements */}
                <div className="bg-navy-surface border border-navy-border rounded-xl p-6 sm:p-8 shadow-lg space-y-4">
                    <h2 className="text-xl font-bold text-white font-ethiopic border-b border-navy-border pb-3">{L("Recent Announcements")}</h2>
                    <div className="space-y-4 overflow-y-auto max-h-96 pr-2">
                        {announcementList.length === 0 ? (
                            <p className="text-text-muted text-sm text-center py-10">{L("No announcements yet.")}</p>
                        ) : (
                            announcementList.map((ann) => (
                                <div
                                    key={ann.id}
                                    className="bg-navy-mid border border-navy-border rounded-lg p-4 space-y-2"
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <h3 className="font-bold text-gold-primary text-sm">
                                            {ann.title}
                                        </h3>
                                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-navy-surface text-text-secondary flex-shrink-0">
                                            {ann.targetRole}
                                        </span>
                                    </div>
                                    <p className="text-xs text-text-secondary leading-relaxed">
                                        {ann.content}
                                    </p>
                                    <div className="text-[10px] text-text-muted text-right">
                                        {ann.createdAt
                                            ? new Date(
                                                  ann.createdAt.seconds * 1000,
                                              ).toLocaleString()
                                            : "Just now"}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Reusable stat card ────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, action }) {
    return (
        <div className="bg-navy-surface border border-navy-border rounded-xl p-5 shadow-md space-y-2 relative overflow-hidden flex flex-col justify-between">
            <div>
                <div className="absolute top-4 right-4 text-3xl opacity-10">
                    {icon}
                </div>
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide block">
                    {label}
                </span>
                <div className={`text-3xl font-extrabold mt-1 ${color}`}>
                    {value}
                </div>
                <p className="text-xs text-text-muted mt-0.5">{sub}</p>
            </div>
            {action && (
                <Link
                    href={action.href}
                    className="mt-3 inline-block text-xs font-bold text-gold-primary hover:underline"
                >
                    {action.label} →
                </Link>
            )}
        </div>
    );
}
