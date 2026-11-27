// app/(dashboard)/student/progress/page.js
"use client";

import React, { useState, useEffect } from "react";
import {
    collection,
    getDocs,
    doc,
    getDoc,
    query,
    where,
} from "firebase/firestore";
import { db } from "../../../../src/lib/firebase";
import { useAuth } from "../../../../src/context/AuthContext";
import { useLanguage } from "../../../../src/context/LanguageContext";
import { isYenetaUser } from "../../../../src/lib/serviceLine";
import { addisDate } from "../../../../src/lib/billing";
import LessonCalendar from "../../../../src/components/student/LessonCalendar";

export default function StudentProgress() {
    const { user } = useAuth();
    const { t, lang } = useLanguage();
    const [student, setStudent] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProgressData = async () => {
            if (!user) return;
            try {
                setLoading(true);
                // Fetch student profile
                const studentSnap = await getDoc(doc(db, "students", user.uid));
                if (studentSnap.exists()) {
                    setStudent(studentSnap.data());
                }

                // Fetch attendance reports for this student
                const reportsQuery = query(
                    collection(db, "attendanceReports"),
                    where("studentId", "==", user.uid),
                );
                const reportsSnap = await getDocs(reportsQuery);
                const list = [];
                reportsSnap.forEach((doc) => {
                    list.push({ id: doc.id, ...doc.data() });
                });
                // Sort newest date first
                list.sort(
                    (a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0),
                );
                setReports(list);
            } catch (err) {
                console.error("Error loading progress tracking data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProgressData();
    }, [user]);

    // Calculate course completion progress %
    // Typically, a course package has 12 sessions per billing cycle.
    const sessionsGoal = 12;
    // The target resets monthly, so count only this month's lessons.
    const thisMonth = addisDate().monthKey;
    const monthLessons = reports.filter(
        (r) => r.date?.seconds && addisDate(new Date(r.date.seconds * 1000)).monthKey === thisMonth,
    ).length;
    const progressPercent = Math.min(
        Math.round((monthLessons / sessionsGoal) * 100),
        100,
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="w-10 h-10 border-4 border-gold-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-text-secondary text-sm animate-pulse">
                    Loading progress tracker...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Title */}
            <div>
                <h1 className="text-3xl font-extrabold text-white font-ethiopic leading-snug">
                    {t("courseProgress")}
                </h1>
                <p className="text-sm text-text-secondary">
                    {isYenetaUser(student)
                        ? "Track session calendars, study topics, and moral/behavioral feedback submitted by your assigned teacher."
                        : "Track session calendars, study topics, and progress feedback submitted by your assigned teacher."}
                </p>
            </div>

            {/* Course Completion Progress Bar */}
            <div className="bg-navy-surface border border-navy-border rounded-xl p-6 sm:p-8 shadow-md space-y-4">
                <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-white">
                        {lang === "am" ? "የዚህ ወር ትምህርቶች" : "This month's lessons"}
                    </span>
                    <span className="text-gold-primary font-bold">
                        {progressPercent}% ({monthLessons} / {sessionsGoal}{" "}
                        {lang === "am" ? "ትምህርቶች" : "sessions"})
                    </span>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full h-4 bg-navy-mid rounded-full overflow-hidden border border-navy-border">
                    <div
                        className="h-full bg-gold-primary rounded-full transition-all duration-500 shadow-gold"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                    {lang === "am"
                        ? "ግቡ በየወሩ እንደገና ይጀምራል። 12 ትምህርቶች የወሩ 100% ናቸው።"
                        : "The target resets every month. 12 lessons is 100% of the monthly target."}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side: Visual Lesson Log History */}
                <div className="lg:col-span-8 bg-navy-surface border border-navy-border rounded-xl p-6 sm:p-8 shadow-md space-y-6">
                    <h2 className="text-lg font-bold text-white uppercase tracking-wider border-b border-navy-border pb-3">
                        Lesson Logs &amp; Attendance Calendar
                    </h2>

                    {reports.length === 0 ? (
                        <p className="text-sm text-text-muted text-center py-12">
                            No sessions logged yet. Your tutor will submit
                            reports after lessons.
                        </p>
                    ) : (
                        <div className="space-y-6">
                            {reports.map((report, index) => (
                                <div
                                    key={report.id}
                                    className="relative pl-6 border-l-2 border-gold-primary/30 last:border-l-0 pb-6 last:pb-0 space-y-4"
                                >
                                    {/* Timeline Node dot */}
                                    <div className="absolute top-1.5 -left-1.5 w-3 h-3 bg-gold-primary rounded-full border border-navy-deep shadow-gold" />

                                    <div className="bg-navy-mid border border-navy-border rounded-xl p-5 space-y-3 shadow-sm">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-navy-border/40 pb-2">
                                            <span className="text-xs font-bold text-gold-primary uppercase">
                                                Lesson #{reports.length - index}
                                            </span>
                                            <span className="text-xs text-text-secondary font-semibold font-mono">
                                                📅{" "}
                                                {report.date
                                                    ? new Date(
                                                          report.date.seconds *
                                                              1000,
                                                      ).toLocaleDateString()
                                                    : "Today"}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            <h4 className="font-bold text-white text-sm">
                                                {lang === "am"
                                                    ? report.topicAm
                                                    : report.topic}
                                            </h4>
                                            <div className="flex items-center space-x-2 text-xs">
                                                <span className="text-text-secondary">
                                                    Engagement:
                                                </span>
                                                <span className="text-gold-primary">
                                                    {"⭐".repeat(
                                                        report.engagementStars ||
                                                            5,
                                                    )}
                                                    {"☆".repeat(
                                                        5 -
                                                            (report.engagementStars ||
                                                                5),
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-[10px] text-text-secondary font-semibold uppercase block">
                                                Tutor Comments:
                                            </span>
                                            <p className="text-xs text-text-secondary leading-relaxed bg-navy-surface p-3 rounded border border-navy-border">
                                                {report.moralNotes}
                                            </p>
                                        </div>

                                        {/* Report Media image if present */}
                                        {report.mediaUrl && (
                                            <div className="pt-2">
                                                <span className="text-[10px] text-text-secondary font-semibold uppercase block mb-1">
                                                    Attached Media:
                                                </span>
                                                <div className="max-w-xs overflow-hidden rounded-lg border border-navy-border">
                                                    <img
                                                        src={report.mediaUrl}
                                                        alt="session snapshot"
                                                        className="w-full h-auto object-cover hover:scale-105 transition-transform duration-200"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Side: Quick metrics and rating rules */}
                <div className="lg:col-span-4 space-y-6">
                    <LessonCalendar reports={reports} lang={lang} />
                    {/* Rating Legend card */}
                    <div className="bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-navy-border pb-2">
                            Behavior Guidelines
                        </h3>
                        <p className="text-xs text-text-secondary leading-relaxed">
                            {isYenetaUser(student)
                                ? "Arke Tutors focus heavily on spiritual, cultural, and moral excellence. In addition to academia/syllabus, we rate students based on:"
                                : "In addition to the syllabus, tutors rate each session based on:"}
                        </p>
                        <ul className="space-y-2.5 text-xs text-text-secondary">
                            {(isYenetaUser(student)
                                ? [
                                      "Spiritual respect and attention (ሥርዓተ-አምልኮ)",
                                      "Moral integrity & listening (ሥነ-ምግባር)",
                                      "Homework completion (ትጋት)",
                                  ]
                                : [
                                      "Focus and participation (ትኩረት)",
                                      "Listening and conduct (ባህሪ)",
                                      "Homework completion (ትጋት)",
                                  ]
                            ).map((item) => (
                                <li key={item} className="flex items-start space-x-2">
                                    <span className="text-gold-primary">🔹</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
