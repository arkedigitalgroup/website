// app/(dashboard)/teacher/page.js
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    collection,
    getDocs,
    query,
    where,
    doc,
    getDoc,
} from "firebase/firestore";
import { db } from "../../../src/lib/firebase";
import { useAuth } from "../../../src/context/AuthContext";
import { useLanguage } from "../../../src/context/LanguageContext";
import RegistrationFeeCard from "../../../src/components/payments/RegistrationFeeCard";
import TeacherChecklist from "../../../src/components/teacher/TeacherChecklist";
import EarningsCard from "../../../src/components/teacher/EarningsCard";
import { usePlatformConfig } from "../../../src/hooks/Useplatformconfig";
import { addisDate } from "../../../src/lib/billing";

export default function TeacherHome() {
    const { user, profile } = useAuth();
    const { t, lang } = useLanguage();
    const [studentsList, setStudentsList] = useState([]);
    const [reports, setReports] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [teacherProfile, setTeacherProfile] = useState(null);
    const [payments, setPayments] = useState([]);
    const [payouts, setPayouts] = useState([]);
    const { config } = usePlatformConfig();
    const [loading, setLoading] = useState(true);

    const fetchTeacherData = async () => {
        if (!user) return;
        try {
            setLoading(true);

            // 0. Fetch full teacher sub-profile from /teachers/{uid}
            const teacherSnap = await getDoc(doc(db, "teachers", user.uid));
            if (teacherSnap.exists()) {
                setTeacherProfile(teacherSnap.data());
            }

            // 1. Fetch Assigned Students
            const studentsQuery = query(
                collection(db, "students"),
                where("assignedTeacherId", "==", user.uid),
            );
            const studentsSnap = await getDocs(studentsQuery);
            const students = [];
            studentsSnap.forEach((d) =>
                students.push({ id: d.id, ...d.data() }),
            );
            setStudentsList(students);

            // 2. Fetch Attendance Reports
            const reportsQuery = query(
                collection(db, "attendanceReports"),
                where("teacherId", "==", user.uid),
            );
            const reportsSnap = await getDocs(reportsQuery);
            const repList = [];
            reportsSnap.forEach((d) => repList.push({ id: d.id, ...d.data() }));
            setReports(repList);

            // 2b. Invoices for my students + salary transfers (earnings card)
            const [paySnap, payoutSnap] = await Promise.all([
                getDocs(query(collection(db, "payments"), where("teacherId", "==", user.uid))),
                getDocs(query(collection(db, "payouts"), where("teacherId", "==", user.uid))),
            ]);
            setPayments(paySnap.docs.map((d) => ({ id: d.id, ...d.data() })));
            setPayouts(payoutSnap.docs.map((d) => d.data()));

            // 3. Fetch announcements targeting "all" or "teacher"
            const annSnap = await getDocs(collection(db, "announcements"));
            const anns = [];
            annSnap.forEach((d) => {
                const data = d.data();
                if (
                    data.targetRole === "all" ||
                    data.targetRole === "teacher"
                ) {
                    anns.push({ id: d.id, ...data });
                }
            });
            anns.sort(
                (a, b) =>
                    (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
            );
            setAnnouncements(anns);
        } catch (err) {
            console.error("Error fetching teacher dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchTeacherData();
    }, [user]);

    // ─── Calculations ─────────────────────────────────────────────────────────
    const dayOf = (r) => (r.date?.seconds ? addisDate(new Date(r.date.seconds * 1000)).today : "");
    const { monthKey, today } = addisDate();
    const sessionsThisMonth = reports.filter((r) => dayOf(r).startsWith(monthKey)).length;
    const studentStats = (id) => {
        const mine = reports.filter((r) => r.studentId === id);
        const days = mine.map(dayOf).filter(Boolean).sort();
        return {
            month: mine.filter((r) => dayOf(r).startsWith(monthKey)).length,
            last: days[days.length - 1],
            loggedToday: days.includes(today),
            stars: mine.length ? (mine.reduce((n, r) => n + (r.engagementStars || 5), 0) / mine.length).toFixed(1) : null,
        };
    };

    const totalRatingStars = reports.reduce(
        (acc, curr) => acc + (curr.engagementStars || 5),
        0,
    );
    const avgEngagementRating =
        reports.length > 0
            ? (totalRatingStars / reports.length).toFixed(1)
            : "5.0";

    // ─── Loading state ────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="w-10 h-10 border-4 border-gold-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-text-secondary text-sm animate-pulse">
                    Loading teacher dashboard...
                </p>
            </div>
        );
    }

    // ─── Account pending approval ─────────────────────────────────────────────
    // Note: phoneVerified gate removed — phoneVerified is set true at
    // registration for all teachers. Phone verification via Africa's Talking
    // will be added in Phase 2 as a separate post-login flow.
    if (profile?.status !== "active") {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-4">
                <div className="max-w-xl w-full bg-navy-surface border border-gold-primary/30 rounded-2xl p-8 sm:p-12 shadow-2xl space-y-6 relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gold-primary" />
                    <span className="text-5xl block animate-pulse">⏳</span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gold-primary font-ethiopic">
                        {lang === "am"
                            ? "የመለያ ማረጋገጫ በመጠባበቅ ላይ"
                            : "Account Verification Pending"}
                    </h1>
                    <h3 className="text-sm md:text-basefont-semibold text-gold-primary font-ethiopic">
                        <Link href="/teacher/account">
                            {lang === "am"
                                ? "ወደ ፕሮፋይል በመሄድ አስገብተው ያላጠናቀቋቸው ዶክመንቶች ያጠናቁ፡፡"
                                : "Go to profile and complete the documents you haven't submitted."}
                        </Link>
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        {lang === "am"
                            ? "የአርኬ አስተማሪ መለያዎ በአድሚን እየተገመገመ ነው። እባክዎ በትዕግስት ይጠብቁ፤ መለያዎ ሲረጋገጥ እናሳውቅዎታለን።"
                            : "Your Arke teacher account is currently under review by our administration team. We will notify you once your verification is complete."}
                    </p>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        {lang === "am"
                            ? "ያላስገቡት መረጃ ካለ፣ accountዎ 'pending' ሆኖ ይቀጥላል፡፡"
                            : "If you haven't submitted all the required information, your account will remain 'pending'."}
                    </p>
                    <div className="pt-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2.5 rounded bg-gold-primary text-navy-deep font-bold text-xs hover:bg-gold-hover shadow-gold transition-all"
                        >
                            {lang === "am" ? "እንደገና ጫን" : "Refresh Status"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Main dashboard ───────────────────────────────────────────────────────
    return (
        <div className="space-y-8">
            <RegistrationFeeCard uid={user?.uid} role="teacher" feePaid={teacherProfile?.registrationFeePaid !== false} lang={lang} />
            <TeacherChecklist teacher={teacherProfile} lang={lang} />

            {/* Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-navy-border pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-white font-ethiopic leading-snug">
                        {t("teacherDashTitle")}
                    </h1>
                    <p className="text-sm text-text-secondary">
                        {lang === "am"
                            ? `እንኳን ደህና መጡ መምህር ${profile?.fullName}!`
                            : `Welcome back, Tutor ${profile?.fullName}!`}
                    </p>
                </div>
                <Link
                    href="/teacher/attendance"
                    className="self-start px-5 py-3 rounded-md bg-gold-primary text-navy-deep font-semibold hover:bg-gold-hover shadow-gold transition-all"
                >
                    📝 {t("fillReportBtn")}
                </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md relative overflow-hidden">
                    <div className="absolute top-4 right-4 text-3xl opacity-20">
                        📅
                    </div>
                    <span className="text-xs font-semibold text-text-secondary uppercase block">
                        {t("sessionsThisMonth")}
                    </span>
                    <span className="text-3xl font-extrabold text-white">
                        {sessionsThisMonth}
                    </span>
                </div>

                <div className="bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md relative overflow-hidden">
                    <div className="absolute top-4 right-4 text-3xl opacity-20">
                        ⭐
                    </div>
                    <span className="text-xs font-semibold text-text-secondary uppercase block">
                        {t("avgRating")}
                    </span>
                    <span className="text-3xl font-extrabold text-gold-primary">
                        {avgEngagementRating}{" "}
                        <span className="text-sm text-text-muted">/ 5.0</span>
                    </span>
                </div>

                <div className="bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md relative overflow-hidden">
                    <div className="absolute top-4 right-4 text-3xl opacity-20">
                        👶
                    </div>
                    <span className="text-xs font-semibold text-text-secondary uppercase block">
                        {lang === "am" ? "የተመደቡ ተማሪዎች" : "Matched Students"}
                    </span>
                    <span className="text-3xl font-extrabold text-white">
                        {studentsList.length}
                    </span>
                </div>
            </div>

            <EarningsCard payments={payments} payouts={payouts} config={config} lang={lang} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Student List */}
                <div className="lg:col-span-7 bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md space-y-4">
                    <h2 className="text-lg font-bold text-white border-b border-navy-border pb-3 uppercase tracking-wider">
                        {t("assignedStudents")}
                    </h2>

                    {studentsList.length === 0 ? (
                        <div className="text-center py-12 text-text-muted text-sm space-y-2">
                            <p className="text-xs text-text-muted">
                                {lang === "am"
                                    ? "ተማሪ ሲመደብልዎ ወዲያውኑ እናሳውቅዎታለን።"
                                    : "You will be notified as soon as students are matched to you."}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {studentsList.map((student) => {
                                const st = studentStats(student.id);
                                return (
                                <div
                                    key={student.id}
                                    className="bg-navy-mid border border-navy-border rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                                >
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-white text-base flex items-center space-x-2">
                                            <span>{student.fullName}</span>
                                            {student.christianName && (
                                                <span className="text-xs font-normal text-gold-primary">
                                                    ({student.christianName})
                                                </span>
                                            )}
                                        </h3>
                                        <p className="text-xs text-text-secondary capitalize">
                                            {lang === "am" ? "ኮርስ" : "Course"}:{" "}
                                            {student.courseId} |{" "}
                                            {lang === "am" ? "ጾታ" : "Gender"}:{" "}
                                            {student.gender} |{" "}
                                            {lang === "am" ? "ዕድሜ" : "Age"}:{" "}
                                            {student.age}
                                        </p>
                                        <p className="text-xs text-text-muted">
                                            {lang === "am" ? "ስልክ" : "Phone"}:{" "}
                                            {student.phone}
                                        </p>
                                        <p className="text-xs text-text-secondary">
                                            📅 {lang === "am" ? `በዚህ ወር ${st.month} ትምህርቶች` : `${st.month} lesson${st.month === 1 ? "" : "s"} this month`}
                                            {" · "}
                                            {lang === "am" ? "የመጨረሻ" : "Last"}: {st.last || "—"}
                                            {st.stars && <> · ⭐ {st.stars}</>}
                                        </p>
                                    </div>

                                    {st.loggedToday ? (
                                        <span className="px-3 py-1.5 rounded bg-success-faint text-success font-bold text-xs">
                                            ✓ {lang === "am" ? "ዛሬ ተመዝግቧል" : "Logged today"}
                                        </span>
                                    ) : (
                                        <Link
                                            href={`/teacher/attendance?studentId=${student.id}`}
                                            className="px-3 py-1.5 rounded bg-gold-primary text-navy-deep font-bold text-xs hover:bg-gold-hover transition-all whitespace-nowrap"
                                        >
                                            📝 {lang === "am" ? "የዛሬን ትምህርት መዝግብ" : "Log today's lesson"}
                                        </Link>
                                    )}
                                </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right: Announcements */}
                <div className="lg:col-span-5 bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md space-y-4">
                    <h2 className="text-lg font-bold text-white border-b border-navy-border pb-3 uppercase tracking-wider">
                        {lang === "am"
                            ? "የመድረክ ማስታወቂያዎች"
                            : "Platform Bulletins"}
                    </h2>

                    <div className="space-y-4 overflow-y-auto max-h-96 pr-2">
                        {announcements.length === 0 ? (
                            <p className="text-xs text-text-muted text-center py-8">
                                {lang === "am"
                                    ? "ለአስተማሪዎች የተለቀቀ ማስታወቂያ የለም።"
                                    : "No active announcements for tutors."}
                            </p>
                        ) : (
                            announcements.map((ann) => (
                                <div
                                    key={ann.id}
                                    className="bg-navy-mid border-l-4 border-l-gold-primary border-t border-r border-b border-navy-border rounded-r-lg p-4 space-y-2"
                                >
                                    <h3 className="font-bold text-gold-primary text-sm">
                                        {ann.title}
                                    </h3>
                                    <p className="text-xs text-text-secondary leading-relaxed">
                                        {ann.content}
                                    </p>
                                    <div className="text-[10px] text-text-muted text-right">
                                        {ann.createdAt
                                            ? new Date(
                                                  ann.createdAt.seconds * 1000,
                                              ).toLocaleDateString()
                                            : "Today"}
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
