// app/(dashboard)/student/page.js
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    doc,
    getDoc,
    getDocs,
    collection,
    updateDoc,
    query,
    where,
} from "firebase/firestore";
import { db, auth } from "../../../src/lib/firebase";
import { useAuth } from "../../../src/context/AuthContext";
import { useLanguage } from "../../../src/context/LanguageContext";
import { sendEmailVerification } from "firebase/auth";

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

export default function StudentHome() {
    const { user, profile } = useAuth();
    const { t, lang } = useLanguage();

    const [student, setStudent] = useState(null);
    const [teacher, setTeacher] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [overduePayments, setOverduePayments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Locked overlay simulated payment reference
    const [paymentRefInput, setPaymentRefInput] = useState("");
    const [unlocking, setUnlocking] = useState(false);

    const fetchStudentDashboardData = async () => {
        if (!user) return;
        try {
            setLoading(true);

            // 1. Fetch Student profile from /students/{uid}
            const studentSnap = await getDoc(doc(db, "students", user.uid));
            if (studentSnap.exists()) {
                const studentData = studentSnap.data();
                setStudent(studentData);

                // 2. Fetch assigned teacher if assignedTeacherId is present
                if (studentData.assignedTeacherId) {
                    const teacherSnap = await getDoc(
                        doc(db, "teachers", studentData.assignedTeacherId),
                    );
                    if (teacherSnap.exists()) {
                        setTeacher(teacherSnap.data());
                    }
                }
            }

            // 3. Fetch announcements targeting student or all
            const annSnap = await getDocs(collection(db, "announcements"));
            const anns = [];
            annSnap.forEach((d) => {
                const data = d.data();
                if (
                    data.targetRole === "all" ||
                    data.targetRole === "student"
                ) {
                    anns.push({ id: d.id, ...data });
                }
            });
            anns.sort(
                (a, b) =>
                    (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
            );
            setAnnouncements(anns);

            // 4. Fetch overdue / unpaid payments
            const payQ = query(
                collection(db, "payments"),
                where("studentId", "==", user.uid),
                where("status", "in", ["pending", "overdue"]),
            );
            const paySnap = await getDocs(payQ);
            const unpaid = [];
            paySnap.forEach((d) => unpaid.push({ id: d.id, ...d.data() }));
            setOverduePayments(unpaid);
        } catch (err) {
            console.error("Error loading student dashboard:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentDashboardData();
    }, [user]);

    // Handler to self-verify mock payment to unlock dashboard
    const handleVerifyMockPayment = async (e) => {
        e.preventDefault();
        if (!paymentRefInput) return;
        setUnlocking(true);

        try {
            const studentRef = doc(db, "students", user.uid);
            await updateDoc(studentRef, {
                dashboardLocked: false,
                registrationFeePaid: true,
            });
            fetchStudentDashboardData();
        } catch (err) {
            console.error("Unlock dashboard error:", err);
        } finally {
            setUnlocking(false);
        }
    };

    // ─── Compute warnings ────────────────────────────────────────────────────
    const warnings = [];

    if (student) {
        // Incomplete profile
        const missingFields = [];
        if (!student.phone)
            missingFields.push(lang === "am" ? "ስልክ ቁጥር" : "phone number");
        if (!student.christianName)
            missingFields.push(lang === "am" ? "የክርስትና ስም" : "Christian name");
        if (!student.locationPin?.lat)
            missingFields.push(lang === "am" ? "አካባቢ" : "location");

        if (missingFields.length > 0) {
            warnings.push({
                type: "info",
                icon: "👤",
                title: lang === "am" ? "መገለጫ ሙሉ አይደለም" : "Profile Incomplete",
                description:
                    lang === "am"
                        ? `የሚጎድሉ ሜዳዎች፡ ${missingFields.join("، ")}። እባክዎ ሙሉ ያድርጉ።`
                        : `Missing: ${missingFields.join(", ")}. Please complete your profile so we can match you faster.`,
                actionLabel: lang === "am" ? "አሳካ" : "Complete Profile",
                actionHref: "/student/account",
            });
        }

        // Unpaid registration
        if (!student.registrationFeePaid) {
            warnings.push({
                type: "error",
                icon: "💳",
                title:
                    lang === "am"
                        ? "የምዝገባ ክፍያ አልተፈጸመም"
                        : "Registration Fee Unpaid",
                description:
                    lang === "am"
                        ? "የምዝገባ ክፍያ (400 ብር) ሳይፈጸም መምህር ሊመደብልዎ አይቻልም።"
                        : "Your registration fee (400 ETB) has not been confirmed. A tutor cannot be matched until payment is cleared.",
                actionLabel: lang === "am" ? "ክፍያ ፈጽም" : "Pay Now",
                actionHref: "/student/payments",
            });
        }

        // Outstanding monthly invoices
        if (overduePayments.length > 0) {
            warnings.push({
                type: "warning",
                icon: "⚠️",
                title:
                    lang === "am"
                        ? "ያልተከፈለ ወርሃዊ ክፍያ አለ"
                        : `${overduePayments.length} Unpaid Monthly Invoice${overduePayments.length > 1 ? "s" : ""}`,
                description:
                    lang === "am"
                        ? `${overduePayments.length} ወርሃዊ ሂሳብ ያልተከፈለ ነው። ከ10ኛው ቀን በኋላ ዳሽቦርዱ ይዘጋል።`
                        : "Clear outstanding invoices to avoid your dashboard being locked after the 10th of the month.",
                actionLabel: lang === "am" ? "ሂሳቦች" : "View Invoices",
                actionHref: "/student/payments",
            });
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="w-10 h-10 border-4 border-gold-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-text-secondary text-sm animate-pulse">
                    Loading parent/student dashboard...
                </p>
            </div>
        );
    }

    // Firebase Email Verification Check
    if (user && !user.emailVerified) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-4">
                <div className="max-w-xl w-full bg-navy-surface border border-gold-primary/30 rounded-2xl p-8 sm:p-12 shadow-2xl space-y-6 relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gold-primary" />
                    <span className="text-5xl block animate-pulse">📧</span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gold-primary font-ethiopic">
                        {lang === "am"
                            ? "እባክዎ ኢሜልዎን ያረጋግጡ"
                            : "Verify Your Email Address"}
                    </h1>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        {lang === "am"
                            ? `ወደ ኢሜልዎ (${user.email}) ማረጋገጫ ሊንክ ላክ። እባክዎ ኢሜልዎን ያረጋግጡ።`
                            : `Please send a verification link to your email (${user.email}). Please verify your email to access your dashboard.`}
                    </p>
                    <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2.5 rounded bg-gold-primary text-navy-deep font-bold text-sm hover:bg-gold-hover shadow-gold transition-all"
                        >
                            {lang === "am"
                                ? "አረጋግጬ ጨርሻለሁ፣ አስገባኝ!!"
                                : "I've Verified (Refresh)"}
                        </button>
                        <button
                            onClick={async () => {
                                try {
                                    await sendEmailVerification(user);
                                    alert(
                                        lang === "am"
                                            ? "የማረጋገጫ ኢሜል ተልኳል!"
                                            : "Verification email sent!",
                                    );
                                } catch (e) {
                                    console.error(e);
                                }
                            }}
                            className="px-6 py-2.5 rounded border border-navy-border text-white font-bold text-sm hover:bg-navy-mid transition-all"
                        >
                            {lang === "am"
                                ? "ማረጋገጫ ኢሜል ላክ"
                                : "Send Verification Email"}
                        </button>
                    </div>
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
                            ? "የመለያዎ ምዝገባ በመታየት ላይ ነው። በአስተዳዳሪው ሲፈቀድ መግባት ይችላሉ።"
                            : "Your parent/student registration is currently being processed. Access will be granted once your account status is activated by the admin."}
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

    // RENDER LOCKED DASHBOARD COVER OVERLAY
    if (student?.dashboardLocked) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-4">
                <div className="max-w-xl w-full bg-navy-surface border border-error/30 rounded-2xl p-8 sm:p-12 shadow-2xl space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-error" />

                    <div className="text-center space-y-3">
                        <span className="text-5xl block animate-bounce">
                            🔒
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-error font-ethiopic">
                            {t("lockTitle")}
                        </h1>
                        <p className="text-sm text-text-secondary">
                            {lang === "am"
                                ? "የየኔታ አስጠኚ ወርሃዊ ክፍያ ባለመፈጸሙ ምክንያት የርስዎ ዳሽቦርድ ለጊዜው ተዘግቷል። እባክዎን ክፍያ ፈጽመው የማረጋገጫ ቁጥር ያስገቡ።"
                                : "Your parent portal has been temporarily locked past the 10th of the month due to an outstanding invoice. Please clear payment to restore access."}
                        </p>
                    </div>

                    {/* Payment Instructions Card */}
                    <div className="bg-navy-mid border border-navy-border p-5 rounded-xl space-y-3 text-xs leading-relaxed text-text-secondary">
                        <h3 className="font-bold text-white text-sm">
                            Arke Corporate Bank Channels:
                        </h3>
                        <div className="space-y-1 font-mono">
                            <div>
                                🏦 Commercial Bank of Ethiopia (CBE):{" "}
                                <span className="text-gold-primary font-bold">
                                    1000452367123
                                </span>
                            </div>
                            <div>
                                🏦 Bank of Abyssinia (BOA):{" "}
                                <span className="text-gold-primary font-bold">
                                    45210985
                                </span>
                            </div>
                            <div>
                                📱 Telebirr merchant ID:{" "}
                                <span className="text-gold-primary font-bold">
                                    ArkeDigital (98520)
                                </span>
                            </div>
                        </div>
                        <div className="text-[10px] text-text-muted mt-2 border-t border-navy-border/40 pt-2">
                            Note: Include student ID{" "}
                            <span className="text-white font-bold">
                                {student.serviceId}
                            </span>{" "}
                            in transfer description.
                        </div>
                    </div>

                    {/* Quick Mock Verify ref to self-unlock */}
                    <form
                        onSubmit={handleVerifyMockPayment}
                        className="space-y-3"
                    >
                        <input
                            type="text"
                            required
                            placeholder={
                                lang === "am"
                                    ? "የማስተላለፊያ ማረጋገጫ ቁጥር (Transaction Ref)"
                                    : "Enter Bank Transaction Reference"
                            }
                            value={paymentRefInput}
                            onChange={(e) => setPaymentRefInput(e.target.value)}
                            className="w-full px-4 py-3 bg-navy-mid border border-navy-border rounded-md text-white placeholder-text-muted focus:outline-none focus:border-error text-sm text-center font-mono"
                        />
                        <button
                            type="submit"
                            disabled={unlocking}
                            className="w-full py-3.5 font-bold rounded-md bg-error text-white hover:bg-error-faint hover:text-error transition-all duration-200 text-sm"
                        >
                            {unlocking
                                ? "Verifying payment..."
                                : "Confirm Payment & Unlock"}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* ── Warning Banners ─────────────────────────────────────────── */}
            {warnings.length > 0 && (
                <div className="space-y-3">
                    {warnings.map((w, i) => (
                        <WarningBanner key={i} {...w} />
                    ))}
                </div>
            )}

            {/* Title */}
            <div className="border-b border-navy-border pb-6">
                <h1 className="text-3xl font-extrabold text-white font-ethiopic leading-snug">
                    {t("studentDashTitle")}
                </h1>
                <p className="text-sm text-text-secondary">
                    {lang === "am"
                        ? "ወደ አርኬ ወላጆች ማዕከል እንኳን ደህና መጡ። የትምህርት ካላንደር፣ የስነ-ምግባር ሪፖርቶች እና የወርሃዊ ክፍያ ሁኔታዎችን እዚህ ይከታተሉ።"
                        : "Welcome to Arke parent portal. Monitor course calendar, moral reports, and monthly billing status."}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side: Teacher info and active Course details */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Matched Teacher Card */}
                    <div className="bg-navy-surface border border-navy-border rounded-xl p-6 sm:p-8 shadow-md space-y-6">
                        <h2 className="text-lg font-bold text-white uppercase tracking-wider border-b border-navy-border pb-3">
                            {t("assignedTeacher")}
                        </h2>

                        {teacher ? (
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                {teacher.profilePhotoUrl && (
                                    <img
                                        src={teacher.profilePhotoUrl}
                                        alt="tutor photo"
                                        className="w-24 h-24 rounded-xl border-2 border-gold-primary object-cover shadow-gold"
                                    />
                                )}
                                <div className="space-y-3 flex-grow text-center sm:text-left">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-white flex items-center justify-center sm:justify-start space-x-2">
                                            <span>{teacher.fullName}</span>
                                            {teacher.christianName && (
                                                <span className="text-xs font-normal text-gold-primary font-ethiopic">
                                                    ({teacher.christianName})
                                                </span>
                                            )}
                                        </h3>
                                        <p className="text-xs text-text-secondary">
                                            {lang === "am"
                                                ? "የአገልግሎት መለያ:"
                                                : "Service ID:"}{" "}
                                            {teacher.serviceId} |{" "}
                                            {lang === "am" ? "ደረጃ:" : "Rating:"}{" "}
                                            {teacher.rating} ⭐
                                        </p>
                                    </div>

                                    <div className="text-xs text-text-secondary space-y-1">
                                        <div>
                                            {lang === "am"
                                                ? "📞 ስልክ: "
                                                : "📞 Phone: "}
                                            <span className="font-semibold text-white">
                                                {teacher.phone}
                                            </span>
                                        </div>
                                        {teacher.churchDocUrl && (
                                            <div>
                                                {lang === "am"
                                                    ? "⛪ የቤተክርስቲያን ምስክርነት: "
                                                    : "⛪ church endorsement: "}
                                                <a
                                                    href={teacher.churchDocUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-gold-primary hover:underline font-bold"
                                                >
                                                    {lang === "am"
                                                        ? "የምስክር ወረቀቱን እይ"
                                                        : "View Recommendation Document"}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-text-muted text-sm space-y-2">
                                <p>⚠️ {t("noTeacherAssigned")}</p>
                                <p className="text-xs text-text-muted">
                                    {lang === "am"
                                        ? "ምደባው በቅርበት ርቀት ላይ የተመሰረተ ነው። አስተዳዳሪው በአሁኑ ጊዜ በመመደብ ላይ ነው።"
                                        : "Matches are based on geolocation proximity. An administrator is matching your profile."}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Course Progress Brief card */}
                    <div className="bg-navy-surface border border-navy-border rounded-xl p-6 sm:p-8 shadow-md space-y-4">
                        <h2 className="text-lg font-bold text-white uppercase tracking-wider border-b border-navy-border pb-3">
                            {lang === "am" ? "የነቃ ጥቅል" : "Active Package"}
                        </h2>
                        <div className="flex justify-between items-center bg-navy-mid border border-navy-border rounded-lg p-5">
                            <div>
                                <span className="text-xs font-semibold text-text-secondary uppercase block">
                                    {lang === "am"
                                        ? "የተመዘገቡበት ኮርስ"
                                        : "Enrolled Course"}
                                </span>
                                <span className="font-bold text-white text-base capitalize font-ethiopic">
                                    {student?.courseId}
                                </span>
                            </div>
                            <Link
                                href="/student/progress"
                                className="px-4 py-2 bg-gold-primary text-navy-deep font-bold rounded text-xs hover:bg-gold-hover transition-all"
                            >
                                {lang === "am"
                                    ? "ሂደቱን ተከታተል"
                                    : "Track Progress"}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Side: Announcements */}
                <div className="lg:col-span-5 bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md space-y-4">
                    <h2 className="text-lg font-bold text-white border-b border-navy-border pb-3 uppercase tracking-wider">
                        {lang === "am" ? "አስፈላጊ ማስታወቂያዎች" : "Important Notices"}
                    </h2>

                    <div className="space-y-4 overflow-y-auto max-h-96 pr-2">
                        {announcements.length === 0 ? (
                            <p className="text-xs text-text-muted text-center py-8">
                                {lang === "am"
                                    ? "ምንም ንቁ ማስታወቂያዎች አልተለጠፉም።"
                                    : "No active notices published yet."}
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
