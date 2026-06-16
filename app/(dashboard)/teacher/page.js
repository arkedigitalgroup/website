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

// ─── Warning Banner Component ─────────────────────────────────────────────────
function WarningBanner({
    type = "warning",
    icon,
    title,
    description,
    actionLabel,
    actionHref,
}) {
    const colors = {
        warning: "border-warning/40 bg-warning/10 text-warning",
        error: "border-error/40 bg-error/10 text-error",
        info: "border-gold-primary/40 bg-gold-primary/10 text-gold-primary",
    };
    return (
        <div
            className={`border rounded-xl px-5 py-4 flex items-start gap-4 ${colors[type]}`}
        >
            <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>
            <div className="flex-grow min-w-0">
                <p className="font-bold text-sm">{title}</p>
                <p className="text-xs opacity-80 mt-0.5 leading-relaxed">
                    {description}
                </p>
            </div>
            {actionLabel && actionHref && (
                <Link
                    href={actionHref}
                    className="flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-bold border border-current hover:opacity-80 transition-opacity whitespace-nowrap"
                >
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}

export default function TeacherHome() {
    const { user, profile } = useAuth();
    const { t, lang } = useLanguage();
    const [studentsList, setStudentsList] = useState([]);
    const [reports, setReports] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [teacherProfile, setTeacherProfile] = useState(null);
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
    console.log("Teacher Profile", teacherProfile);
    useEffect(() => {
        fetchTeacherData();
    }, [user]);

    // ─── Calculations ─────────────────────────────────────────────────────────
    const sessionsThisMonth = reports.filter((r) => {
        const reportDate = r.date
            ? new Date(r.date.seconds * 1000)
            : new Date();
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return (
            reportDate.getMonth() === currentMonth &&
            reportDate.getFullYear() === currentYear
        );
    }).length;

    const totalRatingStars = reports.reduce(
        (acc, curr) => acc + (curr.engagementStars || 5),
        0,
    );
    const avgEngagementRating =
        reports.length > 0
            ? (totalRatingStars / reports.length).toFixed(1)
            : "5.0";

    // ─── Compute warnings ────────────────────────────────────────────────────
    const warnings = [];
    if (teacherProfile) {
        const missingInfo = [];

        // christianName warning only applies to Yeneta teachers
        if (
            teacherProfile.serviceLine === "yeneta" &&
            !teacherProfile.christianName
        ) {
            missingInfo.push(lang === "am" ? "የክርስትና ስም" : "Christian name");
        }
        if (!teacherProfile.phone)
            missingInfo.push(lang === "am" ? "ስልክ ቁጥር" : "phone number");
        if (!teacherProfile.bankAccount)
            missingInfo.push(lang === "am" ? "የባንክ መለያ" : "bank account");
        if (!teacherProfile.locationPin?.lat)
            missingInfo.push(lang === "am" ? "አካባቢ" : "location pin");

        if (missingInfo.length > 0) {
            warnings.push({
                type: "info",
                icon: "👤",
                title: lang === "am" ? "መገለጫ ሙሉ አይደለም" : "Profile Incomplete",
                description:
                    lang === "am"
                        ? `የሚጎድሉ ሜዳዎች: ${missingInfo.join("، ")}። ሙሉ ካልሆነ ምደባ ሊፈጠር አይችልም።`
                        : `Missing fields: ${missingInfo.join(", ")}. Complete your profile so students can be matched to you.`,
                actionLabel: lang === "am" ? "አሳካ" : "Complete Profile",
                actionHref: "/teacher/account",
            });
        }

        // Missing documents
        const missingDocs = [];
        // churchDocUrl only required for Yeneta teachers
        if (
            teacherProfile.serviceLine === "yeneta" &&
            !teacherProfile.churchDocUrl
        ) {
            missingDocs.push(
                lang === "am" ? "የቤተ ክርስቲያን ደብዳቤ" : "church endorsement letter",
            );
        }
        if (!teacherProfile.idCardUrl)
            missingDocs.push(lang === "am" ? "የመታወቂያ" : "ID");
        if (!teacherProfile.eduCertUrl)
            missingDocs.push(
                lang === "am" ? "የትምህርት ሰርተፊኬት" : "education certificate",
            );

        if (missingDocs.length > 0) {
            warnings.push({
                type: "warning",
                icon: "📄",
                title:
                    lang === "am"
                        ? "ሰነዶች ያልተሰቀሉ"
                        : "Required Documents Missing",
                description:
                    lang === "am"
                        ? `ያልተሰቀሉ ሰነዶች: ${missingDocs.join("، ")}። ለማረጋጠ አስፈላጊ ናቸው።`
                        : `Missing: ${missingDocs.join(", ")}. Upload these documents to be approved by the admin and start teaching.`,
                actionLabel: lang === "am" ? "ሰነዶች ስቀል" : "Upload Documents",
                actionHref: "/teacher/account",
            });
        }

        // Awaiting admin approval (all docs present but not yet verified)
        if (
            !teacherProfile.verified &&
            missingDocs.length === 0 &&
            missingInfo.length === 0
        ) {
            warnings.push({
                type: "info",
                icon: "⏳",
                title:
                    lang === "am"
                        ? "ማረጋገጫ በመጠባበቅ ላይ"
                        : "Awaiting Admin Approval",
                description:
                    lang === "am"
                        ? "ሰነዶችዎ ተሰቅለዋል። አድሚን እየገመገሙ ነው — ሲጠናቀቅ ስልክ ቁጥርዎ ላይ ይደርስዎታል።"
                        : "Your documents have been submitted. The admin is reviewing them — you'll be notified once approved.",
                actionLabel: null,
                actionHref: null,
            });
        }
    }

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
            {/* Warning Banners */}
            {warnings.length > 0 && (
                <div className="space-y-3">
                    {warnings.map((w, i) => (
                        <WarningBanner key={i} {...w} />
                    ))}
                </div>
            )}

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
                            {studentsList.map((student) => (
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
                                    </div>

                                    <Link
                                        href={`/teacher/attendance?studentId=${student.id}`}
                                        className="px-3 py-1.5 rounded bg-gold-primary text-navy-deep font-bold text-xs hover:bg-gold-hover transition-all"
                                    >
                                        {lang === "am"
                                            ? "ሪፖርት አስገባ"
                                            : "Submit Report"}
                                    </Link>
                                </div>
                            ))}
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
