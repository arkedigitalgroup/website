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
    setDoc,
} from "firebase/firestore";
import { db } from "../../../src/lib/firebase";
import { useAuth } from "../../../src/context/AuthContext";
import { useLanguage } from "../../../src/context/LanguageContext";
import { useRef } from "react";
import { auth } from "../../../src/lib/firebase";
import {
    signInWithPhoneNumber,
    PhoneAuthProvider,
    linkWithCredential,
    RecaptchaVerifier,
    updatePhoneNumber,
} from "firebase/auth";

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

    // ─── Firebase Phone Auth Component ──────────────────────────────────────────
    function FirebasePhoneVerifier({ phone: initialPhone, onSuccess }) {
        const [phone, setPhone] = useState(initialPhone || "");
        const [verificationId, setVerificationId] = useState("");
        const [otp, setOtp] = useState("");
        const [step, setStep] = useState("input");
        const [busy, setBusy] = useState(false);
        const [error, setError] = useState("");

        const recaptchaContainerRef = useRef(null);
        const verifierRef = useRef(null);

        useEffect(() => {
            // Clean up any previous instance (Strict Mode safety)
            verifierRef.current?.clear();
            verifierRef.current = null;

            if (recaptchaContainerRef.current) {
                try {
                    // CRITICAL FIX: size "normal" shows the checkbox.
                    // Invisible fails on localhost because Google sees it as automated.
                    verifierRef.current = new RecaptchaVerifier(
                        auth,
                        recaptchaContainerRef.current,
                        {
                            size: "normal", // ← was "invisible"
                            callback: () => {},
                            "expired-callback": () => {
                                setError(
                                    lang === "am"
                                        ? "reCAPTCHA ጊዜው አልፎታል። እባክዎ እንደገና ይሞክሩ።"
                                        : "reCAPTCHA expired. Please try again.",
                                );
                            },
                        },
                    );
                } catch (initErr) {
                    console.error("Recaptcha init error:", initErr);
                }
            }

            return () => {
                verifierRef.current?.clear();
                verifierRef.current = null;
            };
        }, []);

        const formatPhone = (num) => {
            let cleaned = num.replace(/\D/g, "");
            if (cleaned.startsWith("0")) cleaned = "+251" + cleaned.slice(1);
            else if (cleaned.startsWith("9") || cleaned.startsWith("7"))
                cleaned = "+251" + cleaned;
            else if (!cleaned.startsWith("+")) cleaned = "+" + cleaned;
            return cleaned;
        };

        const handleSend = async (e) => {
            e.preventDefault();
            setError("");
            setBusy(true);

            if (!verifierRef.current) {
                setError(
                    lang === "am"
                        ? "የማረጋገጫ ሲስተም አልተዘጋጀም። ገጹን ያድሱ።"
                        : "Security system not ready. Please refresh the page.",
                );
                setBusy(false);
                return;
            }

            try {
                const formatted = formatPhone(phone);

                console.log("Original:", phone);
                console.log("Formatted:", formatted);

                const confirmation = await signInWithPhoneNumber(
                    auth,
                    formatted,
                    verifierRef.current,
                );
                setVerificationId(confirmation.verificationId);
                setStep("verify");
            } catch (err) {
                console.error("Firebase Phone Error:", err.code, err.message);
                console.error(err);
                console.log(JSON.stringify(err, null, 2));
                if (err.code === "auth/invalid-phone-number") {
                    setError(
                        lang === "am"
                            ? "የስልክ ቁጥር ትክክል አይደለም።"
                            : "Invalid phone number.",
                    );
                } else if (err.code === "auth/too-many-requests") {
                    setError(
                        lang === "am"
                            ? "በጣም ብዙ ሙከራ። እባክዎ ትንሽ ቆዩ።"
                            : "Too many attempts. Please wait.",
                    );
                } else if (err.code === "auth/internal-error") {
                    setError(
                        lang === "am"
                            ? "የአገልግሎት ስህተት። እባክዎ ገጹን ያድሱ እና እንደገና ይሞክሩ።"
                            : "Service error. Please refresh the page and try again.",
                    );
                } else {
                    setError(err.message);
                }
            } finally {
                setBusy(false);
            }
        };

        const handleVerify = async (e) => {
            e.preventDefault();
            setError("");
            setBusy(true);

            try {
                const credential = PhoneAuthProvider.credential(
                    verificationId,
                    otp,
                );

                console.log("Current User", auth.currentUser);
                console.log("Verification ID", verificationId);
                console.log("OTP", otp);

                await updatePhoneNumber(auth.currentUser, credential);

                await setDoc(
                    doc(db, "teachers", auth.currentUser.uid),
                    {
                        phoneVerified: true,
                        phoneVerifiedAt: new Date(),
                    },
                    { merge: true }
                );

                onSuccess();
            } catch (err) {
                console.error(err);
                if (err.code === "auth/invalid-verification-code") {
                    setError(
                        lang === "am"
                            ? "የተሳሳተ ኮድ።"
                            : "Invalid verification code.",
                    );
                } else if (err.code === "auth/provider-already-linked") {
                    setError(
                        lang === "am"
                            ? "ይህ ስልክ ቀደም ሲል ተገናኝቷል።"
                            : "This phone is already linked.",
                    );
                } else {
                    setError(err.message);
                }
                setBusy(false);
            }
        };

        return (
            <div className="space-y-4">
                {/* 
                  VISIBLE reCAPTCHA container.
                  Do NOT hide this with display:none or hidden class.
                  Google must render the checkbox widget here.
                */}
                <div
                    ref={recaptchaContainerRef}
                    className="flex justify-center py-2"
                />

                {step === "input" ? (
                    <form onSubmit={handleSend} className="space-y-4">
                        <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder={
                                lang === "am"
                                    ? "ምሳሌ: 0911000000"
                                    : "e.g. 0911000000"
                            }
                            className="w-full px-3 py-2.5 bg-navy-mid border border-navy-border rounded-md text-white focus:outline-none focus:border-gold-primary text-sm text-center"
                        />
                        {error && (
                            <p className="text-error text-xs font-semibold bg-error-faint p-2.5 rounded border border-error">
                                ❌ {error}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={busy || !phone}
                            className="w-full py-3 font-bold rounded-md bg-gold-primary text-navy-deep hover:bg-gold-hover transition-all disabled:opacity-50"
                        >
                            {busy
                                ? lang === "am"
                                    ? "በመላክ ላይ..."
                                    : "Sending..."
                                : lang === "am"
                                  ? "ኮድ ላክ"
                                  : "Send Code"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerify} className="space-y-4">
                        <p className="text-xs text-text-secondary">
                            {lang === "am"
                                ? `ኮድ ወደ ${phone} ተልኳል።`
                                : `Code sent to ${phone}.`}
                        </p>
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            required
                            value={otp}
                            onChange={(e) =>
                                setOtp(e.target.value.replace(/\D/g, ""))
                            }
                            placeholder="------"
                            className="w-full px-4 py-3 bg-navy-mid border border-navy-border rounded-md text-white text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:border-gold-primary"
                        />
                        {error && (
                            <p className="text-error text-xs font-semibold bg-error-faint p-2.5 rounded border border-error">
                                ❌ {error}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={busy || otp.length !== 6}
                            className="w-full py-3 font-bold rounded-md bg-gold-primary text-navy-deep hover:bg-gold-hover transition-all disabled:opacity-50"
                        >
                            {busy
                                ? lang === "am"
                                    ? "በማረጋገጥ ላይ..."
                                    : "Verifying..."
                                : lang === "am"
                                  ? "ኮድ አረጋግጥ"
                                  : "Verify Code"}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setStep("input");
                                setOtp("");
                                setError("");
                                // Reset reCAPTCHA for resend
                                verifierRef.current?.clear();
                                verifierRef.current = null;
                                if (recaptchaContainerRef.current) {
                                    verifierRef.current = new RecaptchaVerifier(
                                        auth,
                                        recaptchaContainerRef.current,
                                        { size: "normal" },
                                    );
                                }
                            }}
                            className="text-xs text-gold-primary hover:underline"
                        >
                            {lang === "am"
                                ? "ተለዋጭ ቁጥር / እንደገና ላክ"
                                : "Change number / Resend"}
                        </button>
                    </form>
                )}
            </div>
        );
    }

    useEffect(() => {
        fetchTeacherData();
    }, [user]);

    // Calculations
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

    // ─── Compute warnings ────────────────────────────────────────────────────────
    const warnings = [];
    if (teacherProfile) {
        const missingInfo = [];
        if (!teacherProfile.christianName)
            missingInfo.push(lang === "am" ? "የክርስትና ስም" : "Christian name");
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
        if (!teacherProfile.churchDocUrl)
            missingDocs.push(
                lang === "am" ? "የቤተ ክርስቲያን ደብዳቤ" : "church endorsement letter",
            );
        if (!teacherProfile.idCardUrl)
            missingDocs.push(lang === "am" ? "መታወቂያ" : "government ID card");
        if (!teacherProfile.educationCertUrl)
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

        // Not yet verified
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

    // Phone Verification Check
    // ─── Firebase Phone Verification Gate ───────────────────────────────────────
    if (user && teacherProfile && !teacherProfile.phoneVerified) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-navy-surface border border-gold-primary/30 rounded-2xl p-8 shadow-2xl space-y-6 relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gold-primary" />
                    <span className="text-5xl block animate-pulse">📱</span>
                    <h1 className="text-2xl font-extrabold text-gold-primary font-ethiopic">
                        {lang === "am" ? "ስልክ ቁጥር ያረጋግጡ" : "Verify Your Phone"}
                    </h1>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        {lang === "am"
                            ? "የአስተማሪ መለያ ለመጠቀም ስልክ ቁጥርዎ መረጋገጥ አለበት።"
                            : "Your phone number must be verified to access the teacher dashboard."}
                    </p>
                    <FirebasePhoneVerifier
                        phone={teacherProfile?.phone}
                        onSuccess={() => window.location.reload()}
                    />
                </div>
            </div>
        );
    }

    // Verification status check
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
                    <p className="text-sm text-text-secondary leading-relaxed">
                        {lang === "am"
                            ? "የኔታ አስተማሪ መለያዎ በአድሚን እየተገመገመ ነው። እባክዎ በትዕግስት ይጠብቁ፤ መለያዎ ሲረጋገጥ በኤስኤምኤስ እናሳውቅዎታለን።"
                            : "Your Arke teacher account is currently under review by our administration team. We will notify you via SMS once your verification is complete."}
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

    return (
        <div className="space-y-8">
            {/* ── Warning Banners ─────────────────────────────────────────────────── */}
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
                {/* Sessions this Month */}
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

                {/* Avg Engagement Rating */}
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

                {/* Assigned Students Count */}
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
                {/* Left Side: Student List */}
                <div className="lg:col-span-7 bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md space-y-4">
                    <h2 className="text-lg font-bold text-white border-b border-navy-border pb-3 uppercase tracking-wider">
                        {t("assignedStudents")}
                    </h2>

                    {studentsList.length === 0 ? (
                        <div className="text-center py-12 text-text-muted text-sm space-y-2">
                            <p>{t("noTeacherAssigned")}</p>
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

                {/* Right Side: Announcements */}
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
