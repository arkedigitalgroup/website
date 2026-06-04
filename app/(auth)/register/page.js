// app/(auth)/register/page.js
"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../../../src/lib/firebase";
import { useLanguage } from "../../../src/context/LanguageContext";
import { useAuth } from "../../../src/context/AuthContext";
import AuthNavbar from "../../../src/components/layout/AuthNavbar";
import MapPicker from "../../../src/components/ui/MapPicker";
import { getYenetaCourses } from "../../../assets/yenetaCourse";
import fidelCourseData from "../../../assets/fidelCourse.json";
import emailjs from "@emailjs/browser";

// ─────────────────────────────────────────────────────────────────────────────
// BRAND DECLARATION BANNER
// Shown at the top of the form — communicates which service line the user
// arrived from. Locked from URL; not user-selectable on this page.
// ─────────────────────────────────────────────────────────────────────────────
function ServiceLineBadge({ serviceLine, lang }) {
    const isYeneta = serviceLine === "yeneta";
    return (
        <div
            className={`
                flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold
                ${
                    isYeneta
                        ? "bg-yt-maroon/10 border-yt-maroon/40 text-yt-maroon"
                        : "bg-ft-teal/10 border-ft-teal/40 text-ft-teal"
                }
            `}
        >
            {/* Icon */}
            <span className="text-xl text-gold-primary">
                {isYeneta ? "✝" : "📚"}
            </span>

            <div className="flex-1">
                <p className="font-bold text-gold-primary tracking-wide uppercase text-xs opacity-70">
                    {lang === "am" ? "የምዝገባ አይነት" : "Registering under"}
                </p>
                <p className="text-base font-extrabold text-gold-primary">
                    {isYeneta
                        ? lang === "am"
                            ? "የኔታ — መንፈሳዊ ትምህርት"
                            : "Yeneta — Spiritual Education"
                        : lang === "am"
                          ? "ፊደል — አካዳሚያዊ ትምህርት"
                          : "Fidel — Academic Tutoring"}
                </p>
            </div>

            {/* Lock indicator — communicates this is set by the referral link */}
            <span
                className="text-xs opacity-50 flex items-center gap-1"
                title={lang === "am" ? "ከኮርስ ገጽ የተወሰደ" : "Set from course page"}
            >
                🔒
            </span>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEACHER COURSE MULTI-SELECT
// Renders a checkbox grid scoped to the teacher's service line.
// ─────────────────────────────────────────────────────────────────────────────
function CourseMultiSelect({
    serviceLine,
    selectedCourses,
    onChange,
    t,
    lang,
}) {
    const courses =
        serviceLine === "yeneta"
            ? getYenetaCourses(t)
            : fidelCourseData.courses;

    const toggle = (id) => {
        if (selectedCourses.includes(id)) {
            onChange(selectedCourses.filter((c) => c !== id));
        } else {
            onChange([...selectedCourses, id]);
        }
    };

    // Resolve display label: Yeneta is already translated by getYenetaCourses(t), Fidel uses course_name directly
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

            {/* Checkbox grid */}
            <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-1 custom-scroll">
                {courses.map((course) => {
                    const id = getId(course);
                    const label = getLabel(course);
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
                            {/* Custom checkbox visual */}
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

                            {/* Hidden real checkbox for form semantics */}
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

            {/* Selection summary pill */}
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

            {/* Qualification reminder callout */}
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

// ─────────────────────────────────────────────────────────────────────────────
// PREFERRED TUTOR GENDER — Student field (Task 1)
// ─────────────────────────────────────────────────────────────────────────────
function TutorGenderPreference({ value, onChange, lang }) {
    const options = [
        {
            value: "any",
            labelEn: "No Preference",
            labelAm: "ምንም ምርጫ የለኝም",
            icon: "⚖",
            desc:
                lang === "am"
                    ? "ማንኛውም ተስማሚ አስተማሪ ይመደባል"
                    : "Any available tutor will be assigned",
        },
        {
            value: "male",
            labelEn: "Male Tutor",
            labelAm: "ወንድ አስተማሪ",
            icon: "👨‍🏫",
            desc:
                lang === "am"
                    ? "ወንድ አስተማሪ ይመደባል"
                    : "A male tutor will be assigned",
        },
        {
            value: "female",
            labelEn: "Female Tutor",
            labelAm: "ሴት አስተማሪ",
            icon: "👩‍🏫",
            desc:
                lang === "am"
                    ? "ሴት አስተማሪ ይመደባል"
                    : "A female tutor will be assigned",
        },
    ];

    return (
        <div className="space-y-2">
            <label className="text-xs text-text-secondary font-semibold uppercase block">
                {lang === "am" ? "የሚፈልጉት አስተማሪ ጾታ" : "Preferred Tutor Gender"}
            </label>
            <div className="grid grid-cols-3 gap-2">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        className={`
                            flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border
                            text-center cursor-pointer transition-all duration-150
                            ${
                                value === opt.value
                                    ? "bg-gold-primary/15 border-gold-primary shadow-[0_0_0_1px] shadow-gold-primary"
                                    : "bg-navy-mid border-navy-border hover:border-gold-primary/40"
                            }
                        `}
                    >
                        <span className="text-2xl">{opt.icon}</span>
                        <span
                            className={`text-xs font-bold leading-tight ${
                                value === opt.value
                                    ? "text-gold-primary"
                                    : "text-text-secondary"
                            }`}
                        >
                            {lang === "am" ? opt.labelAm : opt.labelEn}
                        </span>
                    </button>
                ))}
            </div>
            {/* Contextual note */}
            <p className="text-xs text-text-secondary/60 italic">
                {lang === "am"
                    ? "* ምርጫዎ ሁልጊዜ ሊረጋገጥ ላይችል ይችላል — ይህ ቅድሚያ ይሰጠዋል።"
                    : "* Preference is honoured where available — not always guaranteed."}
            </p>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN REGISTER PAGE
// ─────────────────────────────────────────────────────────────────────────────
function RegisterPageContent() {
    const { t, lang } = useLanguage();
    const { setProfile } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY) {
            emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY);
            console.log("✅ EmailJS initialized");
        } else {
            console.error("❌ NEXT_PUBLIC_EMAILJS_PUBLIC_KEY missing");
        }
    }, []);
    // ── URL-derived state (locked — user cannot change these on this page) ──
    const urlRole =
        searchParams.get("role") === "teacher" ? "teacher" : "student";
    const urlLine = searchParams.get("line") === "fidel" ? "fidel" : "yeneta";
    const urlCourse =
        searchParams.get("course") ||
        (urlLine === "yeneta" ? "meserete-imnet" : "MT-001");

    const [role, setRole] = useState(urlRole);

    /**
     * serviceLine is intentionally read-only on this form.
     * It is derived from the ?line= query param set by the course page.
     * The user chose their service line implicitly when they clicked
     * "Register" on a Yeneta or Fidel course page.
     */
    const [serviceLine] = useState(urlLine);

    // Keep role in sync if user navigates back/forward with different params
    useEffect(() => {
        if (searchParams.get("role")) setRole(searchParams.get("role"));
    }, [searchParams]);

    // ── Shared form fields ──
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [christianName, setChristianName] = useState("");
    const [gender, setGender] = useState("male");
    const [phone, setPhone] = useState("");

    // ── Student-only fields ──
    const [age, setAge] = useState(10);
    const [courseId, setCourseId] = useState(urlCourse);
    const [locationPin, setLocationPin] = useState({ lat: 9.03, lng: 38.74 });
    const [preferredTutorGender, setPreferredTutorGender] = useState("any"); // Task 1

    // ── Teacher-only fields ──
    const [bankProvider, setBankProvider] = useState("CBE");
    const [bankAccount, setBankAccount] = useState("");
    const [churchDoc, setChurchDoc] = useState(null);
    const [kebeleDoc, setKebeleDoc] = useState(null); // kept separate (was both using setChurchDoc)
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [qualifiedCourses, setQualifiedCourses] = useState([]); // Task 2

    // ── Statuses ──
    const [loading, setLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState("");
    const [error, setError] = useState("");

    // ── Derived: is this a Yeneta registration? ──
    const isYeneta = serviceLine === "yeneta";

    // ─────────────────────────────────────────────────────────────────────
    // Service ID generator
    // ─────────────────────────────────────────────────────────────────────
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

    // ─────────────────────────────────────────────────────────────────────
    // SUBMIT
    // ─────────────────────────────────────────────────────────────────────
    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        // Teacher must select at least one course
        if (role === "teacher" && qualifiedCourses.length === 0) {
            setError(
                lang === "am"
                    ? "ቢያንስ አንድ ኮርስ ይምረጡ።"
                    : "Please select at least one course you are qualified to teach.",
            );
            return;
        }

        setLoading(true);

        try {
            // 1. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password,
            );
            const uid = userCredential.user.uid;

            // 2. Generate unique service ID
            const serviceId = generateServiceId(role, serviceLine, uid);

            let churchDocUrl = "";
            let kebeleDocUrl = "";
            let profilePhotoUrl = "";

            // 3. Upload files (teacher only)
            if (role === "teacher") {
                setUploadStatus(t("uploadFileLoading"));

                // Profile Photo
                if (profilePhoto) {
                    try {
                        const photoRef = ref(
                            storage,
                            `teachers/${uid}/profile.jpg`,
                        );
                        await uploadBytes(photoRef, profilePhoto);
                        profilePhotoUrl = await getDownloadURL(photoRef);
                    } catch {
                        profilePhotoUrl =
                            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150";
                    }
                } else {
                    profilePhotoUrl =
                        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150";
                }

                // Church Verification Doc
                if (churchDoc) {
                    try {
                        const docRef = ref(
                            storage,
                            `teachers/${uid}/church-doc.pdf`,
                        );
                        await uploadBytes(docRef, churchDoc);
                        churchDocUrl = await getDownloadURL(docRef);
                    } catch {
                        churchDocUrl =
                            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
                    }
                } else {
                    churchDocUrl =
                        "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
                }

                // Kebele ID Doc
                if (kebeleDoc) {
                    try {
                        const kebeleRef = ref(
                            storage,
                            `teachers/${uid}/kebele-id.pdf`,
                        );
                        await uploadBytes(kebeleRef, kebeleDoc);
                        kebeleDocUrl = await getDownloadURL(kebeleRef);
                    } catch {
                        kebeleDocUrl =
                            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
                    }
                } else {
                    kebeleDocUrl =
                        "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
                }
            }

            // 4. Write /users/{uid}
            const userDoc = {
                id: uid,
                role,
                serviceId,
                serviceLine,
                email: email.toLowerCase().trim(),
                status: role === "teacher" ? "pending" : "active",
                createdAt: new Date(),
            };
            await setDoc(doc(db, "users", uid), userDoc);

            // 5. Write role-specific profile
            if (role === "teacher") {
                const teacherProfile = {
                    id: uid,
                    fullName,
                    // christianName only stored for Yeneta teachers
                    ...(isYeneta && { christianName }),
                    gender,
                    phone,
                    locationPin,
                    churchDocUrl,
                    kebeleDocUrl,
                    profilePhotoUrl,
                    bankProvider,
                    bankAccount,
                    verified: false,
                    rating: 0.0,
                    serviceId,
                    serviceLine,
                    // Task 2 — qualified courses stored as array of IDs
                    qualifiedCourses,
                    assignedStudentIds: [],
                };
                await setDoc(doc(db, "teachers", uid), teacherProfile);
            } else {
                const studentProfile = {
                    id: uid,
                    fullName,
                    // christianName only stored for Yeneta students
                    ...(isYeneta && { christianName }),
                    age: Number(age),
                    gender,
                    phone,
                    locationPin,
                    courseId,
                    // Task 1 — preferred tutor gender stored in student profile
                    preferredTutorGender,
                    assignedTeacherId: null,
                    registrationFeePaid: true,
                    serviceId,
                    serviceLine,
                    dashboardLocked: false,
                };
                await setDoc(doc(db, "students", uid), studentProfile);
            }

            // 6. Update Auth Context & redirect
            setProfile(userDoc);

            // ── EMAIL NOTIFICATIONS (non-blocking) ──
            try {
                if (role === "student") {
                    console.log("📧 Sending student welcome email to:", email);
                    const result = await emailjs.send(
                        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
                        process.env.NEXT_PUBLIC_EMAILJS_STU_TEMPLATE_ID,
                        {
                            to_name: fullName,
                            to_email: email,
                            service_id: serviceId,
                            role: "Student",
                            message:
                                lang === "am"
                                    ? "እንኳን ደህና መጡ! የተማሪ ምዝገባዎ ተሳክቷል።"
                                    : "Welcome! Your student registration was successful.",
                        },
                    );
                    console.log(
                        "✅ Student EmailJS success:",
                        result.status,
                        result.text,
                    );
                } else if (role === "teacher") {
                    console.log("📧 Sending teacher welcome email to:", email);
                    const result = await emailjs.send(
                        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
                        process.env.NEXT_PUBLIC_EMAILJS_TEACH_TEMPLATE_ID,
                        {
                            to_name: fullName,
                            to_email: email,
                            service_id: serviceId,
                            role: "Teacher",
                            phone: phone,
                            bank_name: bankProvider,
                            message:
                                lang === "am"
                                    ? "ሰላም መምህር፣ ምዝገባዎ ተሳክቷል። ሰነዶችዎ በመገመገም ላይ ናቸው። ዳሽቦርድዎ ላይ ስልክዎን ያረጋግጡ።"
                                    : "Welcome Tutor! Your registration is successful. Documents are under review. Please verify your phone in the dashboard.",
                        },
                    );
                    console.log(
                        "✅ Teacher EmailJS success:",
                        result.status,
                        result.text,
                    );
                }
            } catch (notifyErr) {
                console.error("❌ EmailJS failed:", notifyErr);
            }

            if (role === "admin") router.push("/admin");
            else if (role === "teacher") router.push("/teacher");
            else router.push("/student");
        } catch (err) {
            console.error("Registration error:", err);
            if (err.code === "auth/email-already-in-use") {
                setError(
                    lang === "am"
                        ? "ይህ ኢሜል ቀደም ሲል በሌላ ሰው ተመዝግቧል።"
                        : "This email is already in use.",
                );
            } else if (
                err.code === "auth/configuration-not-found" ||
                err.message?.includes("configuration-not-found")
            ) {
                setError(
                    lang === "am"
                        ? "የኢሜል/ይለፍ ቃል አገልግሎት በFirebase አልነቃም። Firebase Console → Authentication → Sign-in method ውስጥ 'Email/Password' ያብሩ።"
                        : "Email/Password sign-in is disabled in Firebase. Enable it under Firebase Console → Authentication → Sign-in method.",
                );
            } else {
                setError(
                    err.message ||
                        "Registration failed. Please check your credentials.",
                );
            }
        } finally {
            setLoading(false);
            setUploadStatus("");
        }
    };

    // ─────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen flex flex-col bg-navy-deep">
            <AuthNavbar />

            <div className="flex-grow py-12 px-4 flex items-center justify-center">
                <div className="max-w-xl w-full bg-navy-surface border border-navy-border rounded-2xl p-8 sm:p-12 shadow-lg space-y-6 relative overflow-hidden">
                    {/* Top gradient bar — Yeneta = maroon, Fidel = teal */}
                    <div
                        className={`absolute top-0 left-0 w-full h-2 ${
                            isYeneta
                                ? "bg-gradient-to-r from-yt-maroon to-yt-maroon/60"
                                : "bg-gradient-to-r from-ft-teal to-ft-teal/60"
                        }`}
                    />

                    {/* Page header */}
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-extrabold text-gold-primary font-ethiopic leading-snug">
                            {t("registerTitle")}
                        </h1>
                        <p className="text-sm text-text-secondary">
                            {t("registerSub")}
                        </p>
                    </div>

                    {/*
                     * ── Task 3: Service Line Declaration Badge ──
                     * Replaces the old radio selector. The user cannot switch
                     * service lines here — they come from a specific course page.
                     */}
                    <ServiceLineBadge serviceLine={serviceLine} lang={lang} />

                    {/* Role tabs — student vs teacher */}
                    <div className="grid grid-cols-2 gap-2 bg-navy-mid p-1 rounded-lg border border-navy-border">
                        <button
                            type="button"
                            onClick={() => setRole("student")}
                            className={`py-2 text-sm font-semibold rounded-md transition-colors ${
                                role === "student"
                                    ? "bg-gold-primary text-navy-deep"
                                    : "text-text-secondary hover:text-white"
                            }`}
                        >
                            {t("studentRole")}
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole("teacher")}
                            className={`py-2 text-sm font-semibold rounded-md transition-colors ${
                                role === "teacher"
                                    ? "bg-gold-primary text-navy-deep"
                                    : "text-text-secondary hover:text-white"
                            }`}
                        >
                            {t("teacherRole")}
                        </button>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        {/* ── Shared: Full Name + Christian Name ── */}
                        {/*
                         * Task 3: christianName only renders for Yeneta.
                         * For Fidel registrations this field is completely absent.
                         * When isYeneta is false, the full name takes the full width.
                         */}
                        <div
                            className={`grid gap-4 ${isYeneta ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}
                        >
                            <div className="space-y-1">
                                <label className="text-xs text-text-secondary font-semibold uppercase">
                                    {t("fullNameLabel")}
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) =>
                                        setFullName(e.target.value)
                                    }
                                    className="w-full px-3 py-2.5 bg-navy-mid border border-navy-border rounded-md text-white focus:outline-none focus:border-gold-primary text-sm"
                                />
                            </div>

                            {/* Christian name — Yeneta only */}
                            {isYeneta && (
                                <div className="space-y-1">
                                    <label className="text-xs text-text-secondary font-semibold uppercase">
                                        {t("christianNameLabel")}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={christianName}
                                        onChange={(e) =>
                                            setChristianName(e.target.value)
                                        }
                                        className="w-full px-3 py-2.5 bg-navy-mid border border-navy-border rounded-md text-white focus:outline-none focus:border-gold-primary text-sm"
                                    />
                                </div>
                            )}
                        </div>

                        {/* ── Shared: Email + Password ── */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs text-text-secondary font-semibold uppercase">
                                    {lang === "am" ? "ኢሜል" : "Email Address"}
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-navy-mid border border-navy-border rounded-md text-white focus:outline-none focus:border-gold-primary text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-text-secondary font-semibold uppercase">
                                    {t("passwordLabel")}
                                </label>
                                <input
                                    type="password"
                                    required
                                    minLength="8"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    className="w-full px-3 py-2.5 bg-navy-mid border border-navy-border rounded-md text-white focus:outline-none focus:border-gold-primary text-sm"
                                />
                            </div>
                        </div>

                        {/* ── Shared: Gender + Phone ── */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs text-text-secondary font-semibold uppercase">
                                    {t("genderLabel")}
                                </label>
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-navy-mid border border-navy-border rounded-md text-white focus:outline-none focus:border-gold-primary text-sm"
                                >
                                    <option value="male">{t("maleOpt")}</option>
                                    <option value="female">
                                        {t("femaleOpt")}
                                    </option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-text-secondary font-semibold uppercase">
                                    {t("phoneLabel")}
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="0911000000"
                                    className="w-full px-3 py-2.5 bg-navy-mid border border-navy-border rounded-md text-white focus:outline-none focus:border-gold-primary text-sm"
                                />
                            </div>
                        </div>

                        {/* ════════════════════════════════════════════════
                         *  STUDENT-SPECIFIC SECTION
                         * ════════════════════════════════════════════════ */}
                        {role === "student" && (
                            <div className="space-y-4 pt-2 border-t border-navy-border">
                                {/* Age + Course Package */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-text-secondary font-semibold uppercase">
                                            {t("ageLabel")}
                                        </label>
                                        <input
                                            type="number"
                                            min="4"
                                            max="99"
                                            required
                                            value={age}
                                            onChange={(e) =>
                                                setAge(e.target.value)
                                            }
                                            className="w-full px-3 py-2.5 bg-navy-mid border border-navy-border rounded-md text-white focus:outline-none focus:border-gold-primary text-sm"
                                        />
                                    </div>

                                    {/* Course Package selector */}
                                    <div className="space-y-1">
                                        <label className="text-xs text-text-secondary font-semibold uppercase">
                                            {lang === "am"
                                                ? "የትምህርት ጥቅል"
                                                : "Course Package"}
                                        </label>
                                        <select
                                            value={courseId}
                                            onChange={(e) =>
                                                setCourseId(e.target.value)
                                            }
                                            className="w-full px-3 py-2.5 bg-navy-mid border border-navy-border rounded-md text-white focus:outline-none focus:border-gold-primary text-sm"
                                        >
                                            {serviceLine === "yeneta"
                                                ? getYenetaCourses(t).map(
                                                      (pkg) => (
                                                          <option
                                                              key={pkg.id}
                                                              value={pkg.id}
                                                          >
                                                              {pkg.name}
                                                          </option>
                                                      ),
                                                  )
                                                : fidelCourseData.courses.map(
                                                      (c) => (
                                                          <option
                                                              key={c.course_id}
                                                              value={
                                                                  c.course_id
                                                              }
                                                          >
                                                              {c.course_name}
                                                          </option>
                                                      ),
                                                  )}
                                        </select>
                                    </div>
                                </div>

                                {/*
                                 * Task 1: Preferred Tutor Gender
                                 * Card-based 3-option selector (Any / Male / Female).
                                 * Defaults to "any" so no friction for students who don't care.
                                 */}
                                <div className="pt-1">
                                    <TutorGenderPreference
                                        value={preferredTutorGender}
                                        onChange={setPreferredTutorGender}
                                        lang={lang}
                                    />
                                </div>

                                {/* Registration Fee */}
                                <div className="bg-navy-mid border border-gold-primary/30 p-4 rounded-xl space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-semibold text-white">
                                            {lang === "am"
                                                ? "የምዝገባ ክፍያ"
                                                : "Registration Fee"}
                                        </span>
                                        <span className="font-extrabold text-gold-primary">
                                            400 ETB
                                        </span>
                                    </div>
                                    <p className="text-xs text-text-secondary">
                                        {lang === "am"
                                            ? "አካውንት ለመክፈት አንድ ጊዜ ብቻ የሚከፈል የምዝገባ ክፍያ ነው። ለሙከራ እንዲመች አሁን በራስ-ሰር ተከፍሏል ተብሎ ይመዘገባል።"
                                            : "This is a one-time registration fee required to activate student profiles. Mock payment is automatically authorized."}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ════════════════════════════════════════════════
                         *  TEACHER-SPECIFIC SECTION
                         * ════════════════════════════════════════════════ */}
                        {role === "teacher" && (
                            <div className="space-y-4 pt-2 border-t border-navy-border">
                                {/* Profile Photo + Church Doc */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-text-secondary font-semibold uppercase">
                                            {lang === "am"
                                                ? "የፎቶ ምስል (JPG)"
                                                : "Profile Photo (JPG)"}
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png"
                                            onChange={(e) =>
                                                setProfilePhoto(
                                                    e.target.files[0],
                                                )
                                            }
                                            className="w-full text-xs text-text-secondary border border-navy-border rounded bg-navy-mid px-2 py-1.5 focus:outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-text-secondary font-semibold uppercase">
                                            {t("churchDocLabel")}
                                        </label>
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={(e) =>
                                                setChurchDoc(e.target.files[0])
                                            }
                                            className="w-full text-xs text-text-secondary border border-navy-border rounded bg-navy-mid px-2 py-1.5 focus:outline-none"
                                        />
                                    </div>

                                    {/* Kebele ID — now correctly uses its own state variable */}
                                    <div className="space-y-1">
                                        <label className="text-xs text-text-secondary font-semibold uppercase">
                                            {t("kebeleId")}
                                        </label>
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={(e) =>
                                                setKebeleDoc(e.target.files[0])
                                            }
                                            className="w-full text-xs text-text-secondary border border-navy-border rounded bg-navy-mid px-2 py-1.5 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Bank Provider + Account */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-text-secondary font-semibold uppercase">
                                            {t("bankNameLabel")}
                                        </label>
                                        <select
                                            value={bankProvider}
                                            onChange={(e) =>
                                                setBankProvider(e.target.value)
                                            }
                                            className="w-full px-3 py-2.5 bg-navy-mid border border-navy-border rounded-md text-white focus:outline-none focus:border-gold-primary text-sm"
                                        >
                                            <option value="CBE">
                                                Commercial Bank of Ethiopia
                                                (CBE)
                                            </option>
                                            <option value="BOA">
                                                Bank of Abyssinia (BOA)
                                            </option>
                                            <option value="Telebirr">
                                                Telebirr Wallet
                                            </option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-text-secondary font-semibold uppercase">
                                            {t("bankAccountLabel")}
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={bankAccount}
                                            onChange={(e) =>
                                                setBankAccount(e.target.value)
                                            }
                                            className="w-full px-3 py-2.5 bg-navy-mid border border-navy-border rounded-md text-white focus:outline-none focus:border-gold-primary text-sm"
                                        />
                                    </div>
                                </div>

                                {/*
                                 * Task 2: Course Qualification Multi-Select
                                 * Scoped to serviceLine: Yeneta → YENETA_COURSES, Fidel → FIDEL_COURSES.
                                 * Stored as qualifiedCourses[] on the teacher Firestore document.
                                 * Validation: at least 1 must be selected before submit.
                                 */}
                                <div className="pt-1 border-t border-navy-border">
                                    <CourseMultiSelect
                                        serviceLine={serviceLine}
                                        selectedCourses={qualifiedCourses}
                                        onChange={setQualifiedCourses}
                                        t={t}
                                        lang={lang}
                                    />
                                </div>
                            </div>
                        )}

                        {/* ── Shared: Location Map Picker ── */}
                        <div className="pt-2 border-t border-navy-border">
                            <MapPicker
                                value={locationPin}
                                onChange={setLocationPin}
                                label={t("locationLabel")}
                            />
                        </div>

                        {/* ── Error Message ── */}
                        {error && (
                            <p className="text-error text-xs font-semibold bg-error-faint p-2.5 rounded border border-error">
                                ❌ {error}
                            </p>
                        )}

                        {/* ── Upload Status ── */}
                        {uploadStatus && (
                            <p className="text-gold-primary text-xs font-semibold animate-pulse text-center">
                                ⏳ {uploadStatus}
                            </p>
                        )}

                        {/* ── Submit ── */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 font-bold rounded-md bg-gold-primary text-navy-deep hover:bg-gold-hover shadow-gold hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 text-sm"
                        >
                            {loading
                                ? lang === "am"
                                    ? "በመመዝገብ ላይ..."
                                    : "Registering..."
                                : t("btnRegisterSubmit")}
                        </button>

                        <div className="text-center pt-2 text-xs">
                            <Link
                                href="/login"
                                className="text-gold-primary hover:underline font-semibold"
                            >
                                {t("alreadyHaveAccount")}
                            </Link>
                        </div>
                    </form>
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
