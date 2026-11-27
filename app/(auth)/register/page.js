// app/(auth)/register/page.js
"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    getAdditionalUserInfo,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { auth, db, googleProvider } from "../../../src/lib/firebase";
import { normalizePhone, phoneToAuthEmail } from "../../../src/lib/phoneAuth";
import { useLanguage } from "../../../src/context/LanguageContext";
import { useAuth } from "../../../src/context/AuthContext";
import AuthNavbar from "../../../src/components/layout/AuthNavbar";
import { useCourses } from "../../../src/hooks/Usecourses";
import { usePlatformConfig } from "../../../src/hooks/Useplatformconfig";
import emailjs from "@emailjs/browser";
import { registrationFeeFor, submitRegistrationFee } from "../../../src/lib/registrationFee";
import RegistrationFeeFields from "../../../src/components/payments/RegistrationFeeFields";

// ─────────────────────────────────────────────────────────────────────────────
// TEACHER COURSE MULTI-SELECT
// ─────────────────────────────────────────────────────────────────────────────
function CourseMultiSelect({ courses, selectedCourses, onChange, t, lang }) {
    const toggle = (id) => {
        if (selectedCourses.includes(id)) {
            onChange(selectedCourses.filter((c) => c !== id));
        } else {
            onChange([...selectedCourses, id]);
        }
    };

    const getLabel = (course) =>
        serviceLine === "yeneta" ? course.name : course.course_name;

    const getId = (course) =>
        serviceLine === "yeneta" ? course.id : course.course_id;

    return (
        <div className="space-y-3">
            <div>
                <label className="text-xs text-text-secondary font-semibold uppercase block mb-1">
                    {lang === "am"
                        ? "ማስተማር የሚችሉባቸው ኮርሶች"
                        : "Courses You Are Qualified to Teach"}
                </label>
                <p className="text-xs text-text-secondary/70 italic mb-3">
                    {lang === "am"
                        ? "ቢያንስ አንድ ኮርስ ይምረጡ። ብቃቶ ማረጋገጫ ሰነዶች በዳሽቦርዱ ውስጥ ሊቀርቡ ይገባል።"
                        : "Select at least one. Proof of qualification for each subject must be submitted in your dashboard after registration."}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-1 custom-scroll">
                {courses.map((course) => {
                    const id = course.id;
                    const label = course.name;
                    const checked = selectedCourses.includes(id);

                    return (
                        <label
                            key={id}
                            className={`
                                flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer
                                transition-all duration-150 select-none
                                ${
                                    checked
                                        ? "bg-gold-primary/10 border-gold-primary text-white"
                                        : "bg-navy-mid border-navy-border text-text-secondary hover:border-gold-primary/50 hover:text-white"
                                }
                            `}
                        >
                            <span
                                className={`
                                    flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center
                                    transition-colors duration-150
                                    ${
                                        checked
                                            ? "bg-gold-primary border-gold-primary"
                                            : "border-navy-border bg-transparent"
                                    }
                                `}
                            >
                                {checked && (
                                    <svg
                                        className="w-2.5 h-2.5 text-navy-deep"
                                        fill="none"
                                        viewBox="0 0 10 8"
                                    >
                                        <path
                                            d="M1 4l3 3 5-6"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                )}
                            </span>
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={checked}
                                onChange={() => toggle(id)}
                            />
                            <span className="text-sm font-medium leading-snug">
                                {label}
                            </span>
                        </label>
                    );
                })}
            </div>

            {selectedCourses.length > 0 && (
                <p className="text-xs text-gold-primary font-semibold">
                    ✓ {selectedCourses.length}{" "}
                    {lang === "am"
                        ? "ኮርስ ተመርጧል"
                        : selectedCourses.length === 1
                          ? "course selected"
                          : "courses selected"}
                </p>
            )}

            <div className="flex items-start gap-2 bg-gold-primary/5 border border-gold-primary/20 rounded-lg px-3 py-2.5">
                <span className="text-gold-primary text-sm mt-0.5">⚠</span>
                <p className="text-xs text-gold-primary/80 leading-relaxed">
                    {lang === "am"
                        ? "ለእያንዳንዱ ኮርስ ብቃት ማስረጃ (ዲፕሎማ፣ ሰርቲፊኬት ወዘተ) ከምዝገባ በኋላ በዳሽቦርዱ ውስጥ ማስገባት አለብዎ። ያልተረጋገጡ ኮርሶች ለተማሪዎች አይታዩም።"
                        : "Qualification proof (diploma, certificate, etc.) for each selected course must be uploaded in your dashboard after registration. Unverified courses will not be shown to students."}
                </p>
            </div>
        </div>
    );
}


const INPUT_CLS =
    "w-full px-3 py-2.5 bg-navy-mid border border-navy-border rounded-md text-white focus:outline-none focus:border-gold-primary text-sm";

// ─────────────────────────────────────────────────────────────────────────────
// MAIN REGISTER PAGE
// Sign up with email + password, phone + password, or Google.
// Everything else (name, location, documents) is completed in the dashboard.
// ─────────────────────────────────────────────────────────────────────────────
function RegisterPageContent() {
    const { t, lang } = useLanguage();
    const { setProfile } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // ── EmailJS init ──
    useEffect(() => {
        if (process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY) {
            emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY);
        }
    }, []);

    // ── URL-derived state ──
    // The general site is academic-first: only course pages that pass
    // ?line=yeneta register under Yeneta.
    const urlRole =
        searchParams.get("role") === "teacher" ? "teacher" : "student";
    const serviceLine =
        searchParams.get("line") === "yeneta" ? "yeneta" : "fidel";
    const urlCourse = searchParams.get("course") || "";

    const [role, setRole] = useState(urlRole);

    const { config, loading: configLoading } = usePlatformConfig();
    const { courses, loading: coursesLoading } = useCourses(serviceLine, lang);

    // ── Form fields ──
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [courseId, setCourseId] = useState(urlCourse);
    const [qualifiedCourses, setQualifiedCourses] = useState([]);

    // Safe fallback: the URL may carry a course that is not in the active
    // Firestore list. Keep the enrollment usable by selecting the first one.
    useEffect(() => {
        if (coursesLoading || courses.length === 0) return;
        if (!courses.some((course) => course.id === courseId)) {
            setCourseId(courses[0].id);
        }
    }, [courses, coursesLoading, courseId]);

    // ── Statuses ──
    const [loading, setLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState("");
    const [error, setError] = useState("");

    // Registration fee set by admin on /admin/settings; 0 = free, otherwise a receipt is required.
    const feeAmount = registrationFeeFor(config, role);
    const feeRequired = feeAmount > 0;
    const [receiptFile, setReceiptFile] = useState(null);
    const [transactionRef, setTransactionRef] = useState("");

    // Service ID tied to Firebase UID slice — no collision risk
    const generateServiceId = (selectedRole, selectedLine, uid) => {
        const prefix =
            selectedRole === "teacher"
                ? selectedLine === "yeneta"
                    ? "YT"
                    : "FT"
                : selectedLine === "yeneta"
                  ? "SY"
                  : "SF";
        return `${prefix}-${uid.slice(0, 6).toUpperCase()}`;
    };

    const goToDashboard = (r) => {
        if (r === "admin") router.push("/admin");
        else if (r === "teacher") router.push("/teacher");
        else router.push("/student");
    };

    // Writes /users/{uid} plus the role sub-profile, right after Auth creation.
    const createProfile = async (uid, { profileEmail, profilePhone, fullName }) => {
        const serviceId = generateServiceId(role, serviceLine, uid);
        const userDoc = {
            id: uid,
            role,
            serviceId,
            serviceLine,
            email: profileEmail,
            phone: profilePhone,
            status: role === "teacher" ? "pending" : "active",
            createdAt: new Date(),
        };
        await setDoc(doc(db, "users", uid), userDoc);

        if (role === "teacher") {
            await setDoc(doc(db, "teachers", uid), {
                id: uid,
                fullName,
                phone: profilePhone,
                email: profileEmail,
                verified: false,
                rating: 0.0,
                serviceId,
                serviceLine,
                qualifiedCourses,
                assignedStudentIds: [],
                registrationFeePaid: !feeRequired,
                // Real phone verification via Africa's Talking will come in Phase 2.
                phoneVerified: true,
            });
        } else {
            await setDoc(doc(db, "students", uid), {
                id: uid,
                fullName,
                phone: profilePhone,
                email: profileEmail,
                courseId,
                assignedTeacherId: null,
                registrationFeePaid: !feeRequired,
                serviceId,
                serviceLine,
                dashboardLocked: false,
            });
        }
        if (feeRequired) {
            setUploadStatus(lang === "am" ? "ደረሰኝ በመላክ ላይ..." : "Sending receipt...");
            await submitRegistrationFee({ uid, role, amount: feeAmount, file: receiptFile, transactionRef })
                .catch((feeErr) => console.error("Receipt upload failed; dashboard will ask again:", feeErr));
        }
        setProfile(userDoc);
        return userDoc;
    };

    // Welcome email is non-blocking and only sent to a real address.
    const sendWelcome = async (toEmail, toName, serviceId) => {
        if (!toEmail) return;
        try {
            await emailjs.send(
                process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
                role === "teacher"
                    ? process.env.NEXT_PUBLIC_EMAILJS_TEACH_TEMPLATE_ID
                    : process.env.NEXT_PUBLIC_EMAILJS_STU_TEMPLATE_ID,
                {
                    to_name: toName || toEmail,
                    to_email: toEmail,
                    service_id: serviceId,
                    role: role === "teacher" ? "Teacher" : "Student",
                    message:
                        role === "teacher"
                            ? lang === "am"
                                ? "ሰላም መምህር፣ ምዝገባዎ ተሳክቷል። መገለጫዎን በዳሽቦርዱ ያጠናቅቁ።"
                                : "Welcome Tutor! Your registration is successful. Please complete your profile in the dashboard."
                            : lang === "am"
                              ? "እንኳን ደህና መጡ! የተማሪ ምዝገባዎ ተሳክቷል።"
                              : "Welcome! Your student registration was successful.",
                },
            );
        } catch (notifyErr) {
            console.error("EmailJS failed:", notifyErr);
        }
    };

    const describeError = (err) => {
        const am = lang === "am";
        switch (err.code) {
            case "auth/weak-password":
                return am ? "የይለፍ ቃሉ ቢያንስ 6 ቁምፊ መሆን አለበት።" : "Password must be at least 6 characters.";
            case "auth/invalid-email":
                return am ? "የኢሜል አድራሻው ትክክል አይደለም።" : "The email address is not valid.";
            case "auth/configuration-not-found":
            case "auth/operation-not-allowed":
                return am
                    ? "ይህ የመመዝገቢያ መንገድ በFirebase አልነቃም። Console → Authentication → Sign-in method ውስጥ ያብሩ።"
                    : "This sign-up method is not enabled. Enable it in Firebase Console → Authentication → Sign-in method.";
            case "permission-denied":
                return am
                    ? "ምዝገባ አልተሳካም: የ Firestore ፈቃድ ተከልክሏል።"
                    : "Registration failed: Firestore permission denied.";
            default:
                return err.message || (am ? "ምዝገባ አልተሳካም። እንደገና ይሞክሩ።" : "Registration failed. Please try again.");
        }
    };

    const validateTeacherCourses = () => {
        if (feeRequired && (!receiptFile || !transactionRef.trim())) {
            setError(
                lang === "am"
                    ? "የምዝገባ ክፍያ ደረሰኝ እና የግብይት ቁጥር ያስፈልጋሉ።"
                    : "Please upload the registration fee receipt and enter the transaction reference.",
            );
            return false;
        }
        if (role === "teacher" && qualifiedCourses.length === 0) {
            setError(
                lang === "am"
                    ? "ቢያንስ አንድ ኮርስ ይምረጡ።"
                    : "Please select at least one course you are qualified to teach.",
            );
            return false;
        }
        return true;
    };

    // ─────────────────────────────────────────────────────────────────────
    // SUBMIT — email + password or phone + password
    // ─────────────────────────────────────────────────────────────────────
    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        if (!validateTeacherCourses()) return;

        // Phone is the sign-in identity; email is optional contact info only.
        const normalizedPhone = normalizePhone(phone);
        if (!normalizedPhone) {
            setError(
                lang === "am"
                    ? "ትክክለኛ ስልክ ቁጥር ያስገቡ (ለምሳሌ 0912345678)።"
                    : "Enter a valid phone number (for example 0912345678).",
            );
            return;
        }
        const profileEmail = email.toLowerCase().trim();
        const profilePhone = normalizedPhone;
        const authEmail = phoneToAuthEmail(normalizedPhone);

        // Delete the new auth user if a later step fails, so a retry is not
        // blocked by "email already in use".
        let createdAuthUser = null;
        setLoading(true);

        try {
            const cred = await createUserWithEmailAndPassword(auth, authEmail, password);
            createdAuthUser = cred.user;
            const userDoc = await createProfile(cred.user.uid, {
                profileEmail,
                profilePhone,
                fullName: "",
            });
            createdAuthUser = null;
            await sendWelcome(profileEmail, "", userDoc.serviceId);
            goToDashboard(role);
        } catch (err) {
            console.error("Registration error:", err);
            if (createdAuthUser) {
                await createdAuthUser.delete().catch((cleanupErr) =>
                    console.error("Could not delete partial auth account:", cleanupErr),
                );
                createdAuthUser = null;
            }

            if (err.code !== "auth/email-already-in-use") {
                setError(describeError(err));
                return;
            }

            // Existing account: sign in and add this service line to it.
            try {
                setUploadStatus(
                    lang === "am"
                        ? "የነበረ መለያን በመቀላቀል ላይ..."
                        : "Adding service line to existing account...",
                );
                const existingUserCred = await signInWithEmailAndPassword(auth, authEmail, password);
                const uid = existingUserCred.user.uid;

                const userRef = doc(db, "users", uid);
                const userSnap = await getDoc(userRef);
                let existingLines = [serviceLine];
                let userRole = role;
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    userRole = data.role || role;
                    existingLines = Array.isArray(data.service_lines)
                        ? data.service_lines
                        : [data.serviceLine || serviceLine];
                }
                const updatedLines = Array.from(new Set([...existingLines, serviceLine]));
                await updateDoc(userRef, {
                    service_lines: updatedLines,
                    serviceLine,
                }).catch((userUpdateErr) => {
                    console.warn("Notice: /users update bypassed or pending rule deployment:", userUpdateErr);
                });

                if (userRole === "teacher") {
                    const teacherRef = doc(db, "teachers", uid);
                    await updateDoc(teacherRef, {
                        service_lines: updatedLines,
                        ...(qualifiedCourses.length > 0 && {
                            qualifiedCourses: arrayUnion(...qualifiedCourses),
                        }),
                    }).catch(async () => {
                        await setDoc(
                            teacherRef,
                            { id: uid, email: profileEmail, phone: profilePhone, serviceLine, qualifiedCourses },
                            { merge: true },
                        );
                    });
                } else {
                    const studentRef = doc(db, "students", uid);
                    await updateDoc(studentRef, {
                        service_lines: updatedLines,
                        enrolledCourses: arrayUnion({
                            courseId,
                            serviceLine,
                            enrolledAt: new Date().toISOString(),
                        }),
                        courseId,
                    }).catch(async () => {
                        await setDoc(
                            studentRef,
                            { id: uid, email: profileEmail, phone: profilePhone, serviceLine, courseId },
                            { merge: true },
                        );
                    });
                }

                goToDashboard(userRole);
            } catch (signInErr) {
                console.error("Multi-niche sign in failed:", signInErr);
                setError(
                    lang === "am"
                        ? "ይህ መለያ አስቀድሞ ተመዝግቧል። ለመግባት ትክክለኛውን የይለፍ ቃል ያስገቡ።"
                        : "This phone number is already registered. Enter your existing password to continue.",
                );
            }
        } finally {
            setLoading(false);
            setUploadStatus("");
        }
    };

    // ─────────────────────────────────────────────────────────────────────
    // GOOGLE SIGN-UP
    // ─────────────────────────────────────────────────────────────────────
    const handleGoogleRegister = async () => {
        setError("");
        if (!validateTeacherCourses()) return;
        setLoading(true);
        let createdAuthUser = null;
        try {
            const res = await signInWithPopup(auth, googleProvider);
            const uid = res.user.uid;

            // Already registered — just go to the dashboard.
            const existing = await getDoc(doc(db, "users", uid));
            if (existing.exists()) {
                goToDashboard(existing.data().role);
                return;
            }

            if (getAdditionalUserInfo(res)?.isNewUser) createdAuthUser = res.user;
            const profileEmail = (res.user.email || "").toLowerCase();
            const fullName = res.user.displayName || "";
            const userDoc = await createProfile(uid, {
                profileEmail,
                profilePhone: "",
                fullName,
            });
            createdAuthUser = null;
            await sendWelcome(profileEmail, fullName, userDoc.serviceId);
            goToDashboard(role);
        } catch (err) {
            console.error("Google registration error:", err);
            if (createdAuthUser) {
                await createdAuthUser.delete().catch((cleanupErr) =>
                    console.error("Could not delete partial auth account:", cleanupErr),
                );
            }
            if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
                setError(describeError(err));
            }
        } finally {
            setLoading(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────
    const tabCls = (active) =>
        `py-2 text-sm font-semibold rounded-md transition-colors ${
            active ? "bg-gold-primary text-navy-deep" : "text-text-secondary hover:text-white"
        }`;

    return (
        <div className="min-h-screen flex flex-col bg-navy-deep">
            <AuthNavbar />

            <div className="flex-grow py-12 px-4 flex items-center justify-center">
                <div className="max-w-md w-full bg-navy-surface border border-navy-border rounded-2xl p-8 sm:p-10 shadow-lg space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-ft-teal to-ft-teal/60" />

                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-extrabold text-gold-primary font-ethiopic leading-snug">
                            {t("registerTitle")}
                        </h1>
                        <p className="text-sm text-text-secondary">{t("registerSub")}</p>
                    </div>

                    {/* Role tabs — student vs teacher */}
                    <div className="grid grid-cols-2 gap-2 bg-navy-mid p-1 rounded-lg border border-navy-border">
                        <button type="button" onClick={() => setRole("student")} className={tabCls(role === "student")}>
                            {t("studentRole")}
                        </button>
                        <button type="button" onClick={() => setRole("teacher")} className={tabCls(role === "teacher")}>
                            {t("teacherRole")}
                        </button>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-1">
                            <label htmlFor="reg-phone" className="text-xs text-text-secondary font-semibold uppercase">
                                {t("phoneLabel")}
                            </label>
                            <input
                                id="reg-phone"
                                type="tel"
                                autoComplete="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="0912345678"
                                className={INPUT_CLS}
                            />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="reg-email" className="text-xs text-text-secondary font-semibold uppercase">
                                {lang === "am" ? "ኢሜል (አማራጭ)" : "Email Address (optional)"}
                            </label>
                            <input
                                id="reg-email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={INPUT_CLS}
                            />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="reg-password" className="text-xs text-text-secondary font-semibold uppercase">
                                {t("passwordLabel")}
                            </label>
                            <input
                                id="reg-password"
                                type="password"
                                autoComplete="new-password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={INPUT_CLS}
                            />
                        </div>

                        {role === "student" && (
                            <div className="space-y-4 pt-2 border-t border-navy-border">
                                <div className="space-y-1">
                                    <label htmlFor="reg-course" className="text-xs text-text-secondary font-semibold uppercase">
                                        {lang === "am" ? "የትምህርት ጥቅል" : "Course"}
                                    </label>
                                    <select
                                        id="reg-course"
                                        value={courseId}
                                        onChange={(e) => setCourseId(e.target.value)}
                                        className={INPUT_CLS}
                                    >
                                        {coursesLoading ? (
                                            <option disabled value="">
                                                {lang === "am" ? "ኮርሶች በመጫን ላይ..." : "Loading courses..."}
                                            </option>
                                        ) : courses.length === 0 ? (
                                            <option disabled value="">
                                                {lang === "am" ? "ንቁ ኮርስ አልተገኘም" : "No active course available"}
                                            </option>
                                        ) : (
                                            courses.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>
                            </div>
                        )}

                        {role === "teacher" && (
                            <div className="pt-2 border-t border-navy-border">
                                <CourseMultiSelect
                                    courses={courses}
                                    selectedCourses={qualifiedCourses}
                                    onChange={setQualifiedCourses}
                                    t={t}
                                    lang={lang}
                                />
                            </div>
                        )}

                        {feeRequired && (
                            <RegistrationFeeFields amount={feeAmount} config={config} lang={lang}
                                file={receiptFile} onFile={setReceiptFile}
                                transactionRef={transactionRef} onRef={setTransactionRef} />
                        )}

                        {error && (
                            <p role="alert" className="text-error text-xs font-semibold bg-error-faint p-2.5 rounded border border-error">
                                ❌ {error}
                            </p>
                        )}

                        {uploadStatus && (
                            <p className="text-gold-primary text-xs font-semibold animate-pulse text-center">
                                ⏳ {uploadStatus}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading || configLoading}
                            className="w-full py-3.5 font-bold rounded-md bg-gold-primary text-navy-deep hover:bg-gold-hover shadow-gold transition-all duration-200 disabled:opacity-50 text-sm"
                        >
                            {loading
                                ? lang === "am"
                                    ? "በመመዝገብ ላይ..."
                                    : "Registering..."
                                : t("btnRegisterSubmit")}
                        </button>
                    </form>

                    <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-navy-border"></div>
                        <span className="flex-shrink mx-4 text-xs text-text-muted font-semibold uppercase">
                            {lang === "am" ? "ወይም" : "Or"}
                        </span>
                        <div className="flex-grow border-t border-navy-border"></div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleRegister}
                        disabled={loading || configLoading}
                        className="w-full py-3 px-4 rounded-md border border-navy-border hover:border-gold-primary text-white bg-navy-mid font-semibold hover:bg-navy-hover flex items-center justify-center space-x-2 text-sm transition-all duration-200 disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                            <path
                                fill="#EA4335"
                                d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.99 5.99 0 0 1 8 12.5a5.99 5.99 0 0 1 5.99-6.013c1.55 0 2.902.583 3.923 1.545l3.15-3.14A9.95 9.95 0 0 0 13.99 2 9.99 9.99 0 0 0 4 12a9.99 9.99 0 0 0 9.99 10c5.3 0 9.75-3.87 9.75-10 0-.612-.048-1.285-.16-1.715h-11.34z"
                            />
                        </svg>
                        <span>{t("googleLoginBtn")}</span>
                    </button>

                    <div className="text-center text-xs">
                        <Link href="/login" className="text-gold-primary hover:underline font-semibold">
                            {t("alreadyHaveAccount")}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-navy-deep flex items-center justify-center text-white">
                    Loading...
                </div>
            }
        >
            <RegisterPageContent />
        </Suspense>
    );
}
