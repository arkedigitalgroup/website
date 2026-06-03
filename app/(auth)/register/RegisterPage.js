// app/(auth)/register/page.js
"use client";

import React, { useState, useEffect } from "react";
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

export default function RegisterPage() {
    const { t, lang } = useLanguage();
    const { setProfile } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Read URL query params with fallbacks
    const urlRole =
        searchParams.get("role") === "teacher" ? "teacher" : "student";
    const urlLine = searchParams.get("line") === "fidel" ? "fidel" : "yeneta";
    const urlCourse = searchParams.get("course") || "meserete-imnet";

    const [role, setRole] = useState(urlRole);
    const [serviceLine, setServiceLine] = useState(urlLine);

    // Sync role and line if query params change
    useEffect(() => {
        if (searchParams.get("role")) setRole(searchParams.get("role"));
        if (searchParams.get("line")) setServiceLine(searchParams.get("line"));
    }, [searchParams]);

    // Form Fields
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [christianName, setChristianName] = useState("");
    const [gender, setGender] = useState("male");
    const [phone, setPhone] = useState("");
    const [age, setAge] = useState(10);
    const [courseId, setCourseId] = useState(urlCourse);
    const [locationPin, setLocationPin] = useState({ lat: 9.03, lng: 38.74 });

    // Teacher-only Fields
    const [bankProvider, setBankProvider] = useState("CBE");
    const [bankAccount, setBankAccount] = useState("");
    const [churchDoc, setChurchDoc] = useState(null);
    const [profilePhoto, setProfilePhoto] = useState(null);

    // Statuses
    const [loading, setLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState("");
    const [error, setError] = useState("");

    // Helper: Generates YT-xxx / SY-xxx style Service ID
    const generateServiceId = (selectedRole, selectedLine) => {
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

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
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
            const serviceId = generateServiceId(role, serviceLine);

            let churchDocUrl = "";
            let profilePhotoUrl = "";

            // Upload files to Firebase Storage if files present (with fallback to mock URLs if storage is restricted)
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
                    } catch (storageErr) {
                        console.warn(
                            "Storage upload failed, using fallback:",
                            storageErr,
                        );
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
                    } catch (storageErr) {
                        console.warn(
                            "Storage upload failed, using fallback:",
                            storageErr,
                        );
                        churchDocUrl =
                            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
                    }
                } else {
                    churchDocUrl =
                        "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
                }
            }

            // 3. Write UserDoc to /users/{uid}
            const userDoc = {
                id: uid,
                role: role,
                serviceId: serviceId,
                serviceLine: serviceLine,
                email: email.toLowerCase().trim(),
                status: role === "teacher" ? "pending" : "active",
                createdAt: new Date(),
            };
            await setDoc(doc(db, "users", uid), userDoc);

            // 4. Write profile data to /teachers or /students
            if (role === "teacher") {
                const teacherProfile = {
                    id: uid,
                    fullName,
                    christianName,
                    gender,
                    phone,
                    locationPin,
                    churchDocUrl,
                    profilePhotoUrl,
                    bankProvider,
                    bankAccount,
                    verified: false,
                    rating: 5.0, // default rating
                    serviceId,
                    serviceLine,
                    assignedStudentIds: [],
                };
                await setDoc(doc(db, "teachers", uid), teacherProfile);
            } else {
                const studentProfile = {
                    id: uid,
                    fullName,
                    christianName,
                    age: Number(age),
                    gender,
                    phone,
                    locationPin,
                    courseId,
                    assignedTeacherId: null,
                    registrationFeePaid: true, // Auto marked as paid as per prompt for mock flow
                    serviceId,
                    serviceLine,
                    dashboardLocked: false,
                };
                await setDoc(doc(db, "students", uid), studentProfile);
            }

            // 5. Update Auth Context Profile & Redirect
            setProfile(userDoc);

            // Redirect to correct dashboard
            if (role === "admin") router.push("/admin");
            else if (role === "teacher") router.push("/teacher");
            else if (role === "student") router.push("/student");
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
                        ? "የኢሜል/ይለፍ ቃል አገልግሎት በFirebase አልነቃም። እባክዎ Firebase Console → Authentication → Sign-in method ውስጥ 'Email/Password' ያብሩ።"
                        : "Email/Password sign-in method is disabled in Firebase. Please open Firebase Console → Authentication → Sign-in method and enable 'Email/Password' to test registration.",
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

    return (
        <div className="min-h-screen flex flex-col bg-navy-deep">
            <AuthNavbar />
            <div className="flex-grow py-12 px-4 flex items-center justify-center">
                <div className="max-w-xl w-full bg-navy-surface border border-navy-border rounded-2xl p-8 sm:p-12 shadow-lg space-y-6 relative overflow-hidden">
                    {/* Branding badge top */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yt-maroon to-ft-teal" />

                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-extrabold text-gold-primary font-ethiopic leading-snug">
                            {t("registerTitle")}
                        </h1>
                        <p className="text-sm text-text-secondary">
                            {t("registerSub")}
                        </p>
                    </div>

                    {/* Form selection tabs */}
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
                        {/* General Fields: Full Name & Christian Name */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        </div>

                        {/* Email & Password */}
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

                        {/* Gender & Phone */}
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

                        {/* Service Line Toggle for Teacher / Student */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1 col-span-2">
                                <label className="text-xs text-text-secondary font-semibold uppercase block">
                                    Service Line
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center space-x-2 text-sm cursor-pointer">
                                        <input
                                            type="radio"
                                            name="serviceLine"
                                            value="yeneta"
                                            checked={serviceLine === "yeneta"}
                                            onChange={() =>
                                                setServiceLine("yeneta")
                                            }
                                            className="accent-gold-primary"
                                        />
                                        <span>Yeneta Brand (Spiritual)</span>
                                    </label>
                                    <label className="flex items-center space-x-2 text-sm cursor-pointer">
                                        <input
                                            type="radio"
                                            name="serviceLine"
                                            value="fidel"
                                            checked={serviceLine === "fidel"}
                                            onChange={() =>
                                                setServiceLine("fidel")
                                            }
                                            className="accent-gold-primary"
                                        />
                                        <span>Fidel Brand (Academic)</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* STUDENT FORM SPECIFIC */}
                        {role === "student" && (
                            <div className="space-y-4 pt-2 border-t border-navy-border">
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

                                    {/* Course Pack selection */}
                                    <div className="space-y-1">
                                        <label className="text-xs text-text-secondary font-semibold uppercase">
                                            {lang === "am"
                                                ? "የትምህርት ጥቅል"
                                                : "Course package"}
                                        </label>
                                        <select
                                            value={courseId}
                                            onChange={(e) =>
                                                setCourseId(e.target.value)
                                            }
                                            className="w-full px-3 py-2.5 bg-navy-mid border border-navy-border rounded-md text-white focus:outline-none focus:border-gold-primary text-sm"
                                        >
                                            <option value="meserete-imnet">
                                                {t("package1")}
                                            </option>
                                            <option value="quanquanna-zema">
                                                {t("package2")}
                                            </option>
                                            <option value="diquna-zegajat">
                                                {t("package3")}
                                            </option>
                                            <option value="begena">
                                                {t("package5")}
                                            </option>
                                            <option value="all-courses">
                                                {t("package4")}
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                {/* Registration Fee Payment Overlay */}
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

                        {/* TEACHER FORM SPECIFIC */}
                        {role === "teacher" && (
                            <div className="space-y-4 pt-2 border-t border-navy-border">
                                {/* Profile Photo & Church Doc */}
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
                                    <div className="space-y-1">
                                        <label className="text-xs text-text-secondary font-semibold uppercase">
                                            {t("kebeleId")}
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
                                </div>

                                {/* Bank Provider & Account */}
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
                            </div>
                        )}

                        {/* Location Pin Picker */}
                        <div className="pt-2 border-t border-navy-border">
                            <MapPicker
                                value={locationPin}
                                onChange={setLocationPin}
                                label={t("locationLabel")}
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <p className="text-error text-xs font-semibold bg-error-faint p-2.5 rounded border border-error">
                                ❌ {error}
                            </p>
                        )}

                        {/* Upload Status */}
                        {uploadStatus && (
                            <p className="text-gold-primary text-xs font-semibold animate-pulse text-center">
                                ⏳ {uploadStatus}
                            </p>
                        )}

                        {/* Submit button */}
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
