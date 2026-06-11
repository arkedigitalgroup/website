// // app/(dashboard)/admin/page.js
// "use client";

// import React, { useState, useEffect } from "react";
// import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
// import { db } from "../../../src/lib/firebase";
// import { useLanguage } from "../../../src/context/LanguageContext";
// import Link from "next/link";

// export default function AdminOverview() {
//     const { t, lang } = useLanguage();

//     // Stats states
//     const [stats, setStats] = useState({
//         totalTeachers: 0,
//         verifiedTeachers: 0,
//         pendingTeachers: 0,
//         totalStudents: 0,
//         activeStudents: 0,
//         monthlyRevenue: 0,
//         pendingVerifications: 0,
//     });

//     // Announcement states
//     const [targetRole, setTargetRole] = useState("all");
//     const [announcementText, setAnnouncementText] = useState("");
//     const [announcementTitleText, setAnnouncementTitleText] = useState("");
//     const [announcementList, setAnnouncementList] = useState([]);

//     // Statuses
//     const [loading, setLoading] = useState(true);
//     const [posting, setPosting] = useState(false);
//     const [postSuccess, setPostSuccess] = useState("");

//     // Fetch stats from Firestore
//     const fetchStatsAndAnnouncements = async () => {
//         try {
//             setLoading(true);

//             // 1. Fetch Teachers
//             const teachersSnap = await getDocs(collection(db, "teachers"));
//             let totalT = 0,
//                 verifiedT = 0,
//                 pendingT = 0;
//             teachersSnap.forEach((doc) => {
//                 totalT++;
//                 if (doc.data().verified) {
//                     verifiedT++;
//                 } else {
//                     pendingT++;
//                 }
//             });

//             // 2. Fetch Students (total count)
//             const studentsSnap = await getDocs(collection(db, "students"));
//             let totalS = 0;
//             studentsSnap.forEach(() => {
//                 totalS++;
//             });
//             // 2b. Fetch Active Students
//             const activeStudentsSnap = await getDocs(
//                 query(collection(db, "students"), where("status", "==", "active"))
//             );
//             let activeS = 0;
//             activeStudentsSnap.forEach(() => {
//                 activeS++;
//             });

//             // 3. Fetch Payments to calculate Monthly Revenue
//             const paymentsSnap = await getDocs(collection(db, "payments"));
//             let revenue = 0;
//             paymentsSnap.forEach((doc) => {
//                 const payment = doc.data();
//                 if (payment.status === "paid" && payment.companyRevenue) {
//                     revenue += payment.companyRevenue;
//                 }
//             });

//             const menuItems = [
//                 { name: lang === 'am' ? 'አጠቃላይ እይታ' : 'Overview', path: '/admin', icon: "📊" },
//                 { name: lang === 'am' ? 'መምህራን ማረጋገጫ' : 'Teachers Verification', path: '/admin/teachers', icon: "👨‍🏫" },
//                 { name: lang === 'am' ? 'ተማሪዎች' : 'Students', path: '/admin/students', icon: "👶" },
//                 { name: lang === 'am' ? 'መምህር መድብ' : 'Matching Center', path: '/admin/matching', icon: "🗺️" },
//                 { name: lang === 'am' ? 'ፋይናንስ' : 'Financials', path: '/admin/finances', icon: "💼" },
//             ];

//             // If no payments, make mock revenue for presentation
//             if (revenue === 0 && totalS > 0) {
//                 revenue = totalS * 160; // Mock base: monthly company cut per student
//             }

//             setStats({
//                 totalTeachers: totalT,
//                 verifiedTeachers: verifiedT,
//                 pendingTeachers: pendingT,
//                 totalStudents: totalS,
//                 activeStudents: activeS,
//                 monthlyRevenue: revenue,
//                 pendingVerifications: pendingT,
//             });

//             // 4. Fetch Announcements
//             const annSnap = await getDocs(collection(db, "announcements"));
//             const anns = [];
//             annSnap.forEach((doc) => {
//                 anns.push({ id: doc.id, ...doc.data() });
//             });
//             // Sort newest first
//             anns.sort(
//                 (a, b) =>
//                     (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
//             );
//             setAnnouncementList(anns.slice(0, 5));
//         } catch (err) {
//             console.error("Error loading admin overview stats:", err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchStatsAndAnnouncements();
//     }, []);

//     const handlePostAnnouncement = async (e) => {
//         e.preventDefault();
//         if (!announcementText || !announcementTitleText) return;
//         setPosting(true);
//         setPostSuccess("");

//         try {
//             await addDoc(collection(db, "announcements"), {
//                 title: announcementTitleText.trim(),
//                 content: announcementText.trim(),
//                 targetRole: targetRole,
//                 createdAt: new Date(),
//             });
//             setPostSuccess(t("postSuccess"));
//             setAnnouncementText("");
//             setAnnouncementTitleText("");
//             fetchStatsAndAnnouncements(); // Reload lists
//         } catch (err) {
//             console.error("Announcement posting error:", err);
//         } finally {
//             setPosting(false);
//         }
//     };

//     if (loading) {
//         return (
//             <div className="flex flex-col items-center justify-center h-96 space-y-4">
//                 <div className="w-10 h-10 border-4 border-gold-primary border-t-transparent rounded-full animate-spin" />
//                 <p className="text-text-secondary text-sm animate-pulse">
//                     Loading overview data...
//                 </p>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-10">
//             {/* Page Title */}
//             <div>
//                 <h1 className="text-3xl font-extrabold text-white font-ethiopic">
//                     {t("adminDashTitle")}
//                 </h1>
//                 <p className="text-sm text-text-secondary">
//                     Welcome to Arke Control Panel. Manage tutors verification,
//                     student matching, and finances.
//                 </p>
//             </div>

//             {/* Stats Cards Grid */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//                 {/* Total Teachers */}
//                 <div className="bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md space-y-2 relative overflow-hidden">
//                     <div className="absolute top-4 right-4 text-3xl opacity-20">
//                         👨‍🏫
//                     </div>
//                     <span className="text-xs font-semibold text-text-secondary uppercase block">
//                         {t("statTotalTeachers")}
//                     </span>
//                     <div className="flex items-baseline space-x-2">
//                         <span className="text-3xl font-extrabold text-white">
//                             {stats.totalTeachers}
//                         </span>
//                         <span className="text-xs text-success font-semibold">
//                             ({stats.verifiedTeachers} verified)
//                         </span>
//                     </div>
//                 </div>

//                 {/* Total Students */}
//                 <div className="bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md space-y-2 relative overflow-hidden">
//                     <div className="absolute top-4 right-4 text-3xl opacity-20">
//                         👶
//                     </div>
//                     <span className="text-xs font-semibold text-text-secondary uppercase block">
//                         {t("statTotalStudents")}
//                     </span>
//                     <div className="flex items-baseline space-x-2">
//                         <span className="text-3xl font-extrabold text-white">
//                             {stats.totalStudents}
//                         </span>
//                         <span className="text-xs text-success font-semibold">
//                             Active
//                         </span>
//                     </div>
//                 </div>

//                 {/* Monthly Revenue */}
//                 <div className="bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md space-y-2 relative overflow-hidden">
//                     <div className="absolute top-4 right-4 text-3xl opacity-20">
//                         💼
//                     </div>
//                     <span className="text-xs font-semibold text-text-secondary uppercase block">
//                         {t("statMonthlyRevenue")}
//                     </span>
//                     <div className="flex items-baseline space-x-2">
//                         <span className="text-3xl font-extrabold text-gold-primary">
//                             {stats.monthlyRevenue.toLocaleString()}
//                         </span>
//                         <span className="text-xs text-text-muted">ETB</span>
//                     </div>
//                 </div>

//                 {/* Pending Verifications */}
//                 <div className="bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md space-y-2 relative overflow-hidden">
//                     <div className="absolute top-4 right-4 text-3xl opacity-20">
//                         ⏳
//                     </div>
//                     <span className="text-xs font-semibold text-text-secondary uppercase block">
//                         {t("statPendingVerifications")}
//                     </span>
//                     <div className="flex items-baseline space-x-2">
//                         <span className="text-3xl font-extrabold text-warning">
//                             {stats.pendingVerifications}
//                         </span>
//                         <span className="text-xs text-warning font-semibold">
//                             requires review
//                         </span>
//                     </div>
//                 </div>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 {/* Announcement Poster Form */}
//                 <div className="bg-navy-surface border border-navy-border rounded-xl p-6 sm:p-8 shadow-lg space-y-4">
//                     <h2 className="text-xl font-bold text-white font-ethiopic border-b border-navy-border pb-3">
//                         {t("announcementTitle")}
//                     </h2>

//                     <form
//                         onSubmit={handlePostAnnouncement}
//                         className="space-y-4"
//                     >
//                         {/* Title */}
//                         <div className="space-y-1">
//                             <label className="text-xs text-text-secondary font-semibold uppercase">
//                                 Announcement Title
//                             </label>
//                             <input
//                                 type="text"
//                                 required
//                                 value={announcementTitleText}
//                                 onChange={(e) =>
//                                     setAnnouncementTitleText(e.target.value)
//                                 }
//                                 placeholder="e.g. System Maintenance Notice"
//                                 className="w-full px-4 py-2.5 bg-navy-mid border border-navy-border rounded-md text-white placeholder-text-muted focus:outline-none focus:border-gold-primary text-sm"
//                             />
//                         </div>

//                         {/* Target Role */}
//                         <div className="space-y-1">
//                             <label className="text-xs text-text-secondary font-semibold uppercase">
//                                 {t("announcementRole")}
//                             </label>
//                             <select
//                                 value={targetRole}
//                                 onChange={(e) => setTargetRole(e.target.value)}
//                                 className="w-full px-4 py-2.5 bg-navy-mid border border-navy-border rounded-md text-white focus:outline-none focus:border-gold-primary text-sm"
//                             >
//                                 <option value="all">
//                                     All Users (Students + Teachers)
//                                 </option>
//                                 <option value="teacher">Teachers Only</option>
//                                 <option value="student">
//                                     Students / Parents Only
//                                 </option>
//                             </select>
//                         </div>

//                         {/* Content */}
//                         <div className="space-y-1">
//                             <label className="text-xs text-text-secondary font-semibold uppercase">
//                                 {t("announcementContent")}
//                             </label>
//                             <textarea
//                                 required
//                                 rows="4"
//                                 value={announcementText}
//                                 onChange={(e) =>
//                                     setAnnouncementText(e.target.value)
//                                 }
//                                 placeholder="Write your announcement details here..."
//                                 className="w-full px-4 py-2.5 bg-navy-mid border border-navy-border rounded-md text-white placeholder-text-muted focus:outline-none focus:border-gold-primary text-sm resize-none"
//                             />
//                         </div>

//                         <button
//                             type="submit"
//                             disabled={posting}
//                             className="w-full py-2.5 font-semibold rounded bg-gold-primary text-navy-deep hover:bg-gold-hover shadow-gold transition-all duration-200 disabled:opacity-50 text-sm"
//                         >
//                             {posting
//                                 ? "Publishing..."
//                                 : t("btnPostAnnouncement")}
//                         </button>

//                         {postSuccess && (
//                             <p className="text-success text-xs font-semibold text-center animate-pulse">
//                                 🎉 {postSuccess}
//                             </p>
//                         )}
//                     </form>
//                 </div>

//                 {/* Recent Announcements List */}
//                 <div className="bg-navy-surface border border-navy-border rounded-xl p-6 sm:p-8 shadow-lg space-y-4">
//                     <h2 className="text-xl font-bold text-white font-ethiopic border-b border-navy-border pb-3">
//                         Recent Announcements
//                     </h2>

//                     <div className="space-y-4 overflow-y-auto max-h-96 pr-2">
//                         {announcementList.length === 0 ? (
//                             <p className="text-text-muted text-sm text-center py-10">
//                                 No announcements published yet.
//                             </p>
//                         ) : (
//                             announcementList.map((ann) => (
//                                 <div
//                                     key={ann.id}
//                                     className="bg-navy-mid border border-navy-border rounded-lg p-4 space-y-2"
//                                 >
//                                     <div className="flex justify-between items-start gap-4">
//                                         <h3 className="font-bold text-gold-primary text-sm">
//                                             {ann.title}
//                                         </h3>
//                                         <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-navy-surface text-text-secondary">
//                                             to: {ann.targetRole}
//                                         </span>
//                                     </div>
//                                     <p className="text-xs text-text-secondary leading-relaxed">
//                                         {ann.content}
//                                     </p>
//                                     <div className="text-[10px] text-text-muted text-right">
//                                         {ann.createdAt
//                                             ? new Date(
//                                                   ann.createdAt.seconds * 1000,
//                                               ).toLocaleString()
//                                             : "Just now"}
//                                     </div>
//                                 </div>
//                             ))
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// app/(dashboard)/admin/page.js
"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { db } from "../../../src/lib/firebase";
import { useLanguage } from "../../../src/context/LanguageContext";
import { usePlatformConfig } from "../../../src/hooks/Useplatformconfig";
import Link from "next/link";

export default function AdminOverview() {
    const { t, lang } = useLanguage();
    const { config } = usePlatformConfig();
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

    const [stats, setStats] = useState(null);
    const [announcementList, setAnnouncementList] = useState([]);
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
            });
            setAnnouncementList(anns);
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

            {/* ── Student Stats ── */}
            <section className="space-y-3">
                <h2 className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                    Students
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        icon="👶"
                        label="Total Registered"
                        value={stats.totalStudents}
                        sub="all enrolled students"
                        color="text-white"
                    />
                    <StatCard
                        icon="⏳"
                        label="Awaiting Match"
                        value={stats.unmatchedStudents}
                        sub="no teacher assigned yet"
                        color={
                            stats.unmatchedStudents > 0
                                ? "text-warning"
                                : "text-success"
                        }
                        action={{
                            label: "Go to Matching",
                            href: "/admin/matching",
                        }}
                    />
                    <StatCard
                        icon="✅"
                        label="Active in Class"
                        value={stats.activeStudents}
                        sub="matched + account unlocked"
                        color="text-success"
                    />
                </div>
            </section>

            {/* ── Teacher Stats ── */}
            <section className="space-y-3">
                <h2 className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                    Teachers
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        icon="👨‍🏫"
                        label="Total Teachers"
                        value={stats.totalTeachers}
                        sub="registered on platform"
                        color="text-white"
                    />
                    <StatCard
                        icon="✔️"
                        label="Verified"
                        value={stats.verifiedTeachers}
                        sub="approved and active"
                        color="text-success"
                    />
                    <StatCard
                        icon="🔍"
                        label="Pending Verification"
                        value={stats.pendingTeachers}
                        sub="awaiting document review"
                        color={
                            stats.pendingTeachers > 0
                                ? "text-warning"
                                : "text-success"
                        }
                        action={{
                            label: "Review Now",
                            href: "/admin/teachers",
                        }}
                    />
                </div>
            </section>

            {/* ── Financial Stats ── */}
            <section className="space-y-3">
                <h2 className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                    Financials
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        icon="📅"
                        label={"Arke Revenue — " + currentMonth}
                        value={stats.revenueThisMonth.toLocaleString() + " ETB"}
                        sub="company cut this month"
                        color="text-gold-primary"
                        action={{
                            label: "View Finances",
                            href: "/admin/finances",
                        }}
                    />
                    <StatCard
                        icon="💼"
                        label="Arke Revenue — All Time"
                        value={stats.revenueAllTime.toLocaleString() + " ETB"}
                        sub="total company cut"
                        color="text-gold-primary"
                    />
                    <StatCard
                        icon="💰"
                        label="Total Collected — All Time"
                        value={stats.totalCollected.toLocaleString() + " ETB"}
                        sub="total paid by parents"
                        color="text-white"
                    />
                </div>
            </section>

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
                            <label className="text-xs text-text-secondary font-semibold uppercase">
                                Title
                            </label>
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
                                <option value="all">All Users</option>
                                <option value="teacher">Teachers Only</option>
                                <option value="student">
                                    Students / Parents Only
                                </option>
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
                    <h2 className="text-xl font-bold text-white font-ethiopic border-b border-navy-border pb-3">
                        Recent Announcements
                    </h2>
                    <div className="space-y-4 overflow-y-auto max-h-96 pr-2">
                        {announcementList.length === 0 ? (
                            <p className="text-text-muted text-sm text-center py-10">
                                No announcements yet.
                            </p>
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
