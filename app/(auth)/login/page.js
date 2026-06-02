// app/(auth)/login/page.js
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../../src/lib/firebase";
import { useLanguage } from "../../../src/context/LanguageContext";
import { useAuth } from "../../../src/context/AuthContext";
import AuthNavbar from "../../../src/components/layout/AuthNavbar";

export default function LoginPage() {
    const { t, lang } = useLanguage();
    const { loginWithEmail, loginWithGoogle, setProfile } = useAuth();
    const router = useRouter();

    // Inputs
    const [emailOrPhone, setEmailOrPhone] = useState("");
    const [password, setPassword] = useState("");

    // Statuses
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [error, setError] = useState("");

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const input = emailOrPhone.trim();
            // Simple check: if it contains only digits, +, -, spaces, or parentheses, or doesn't have '@', we treat it as a phone number
            const isPhone = /^[+\d\s()-]+$/.test(input) || !input.includes('@');
            let loginEmail = input;
            
            if (isPhone) {
                // Clean phone number (remove spaces, dashes, parentheses)
                const cleanPhone = input.replace(/[^\d+]/g, "");
                
                // 1. Search in /students
                const studentsQuery = query(collection(db, "students"), where("phone", "==", cleanPhone));
                const studentDocs = await getDocs(studentsQuery);
                let foundUid = null;

                if (!studentDocs.empty) {
                    foundUid = studentDocs.docs[0].id;
                } else {
                    // 2. Search in /teachers
                    const teachersQuery = query(collection(db, "teachers"), where("phone", "==", cleanPhone));
                    const teacherDocs = await getDocs(teachersQuery);
                    if (!teacherDocs.empty) {
                        foundUid = teacherDocs.docs[0].id;
                    }
                }

                if (foundUid) {
                    const userDocSnap = await getDoc(doc(db, "users", foundUid));
                    if (userDocSnap.exists()) {
                        loginEmail = userDocSnap.data().email;
                    } else {
                        throw new Error(
                            lang === "am"
                                ? "የተጠቃሚ መለያ በሲስተሙ ውስጥ አልተገኘም።"
                                : "User profile not found in system."
                        );
                    }
                } else {
                    throw new Error(
                        lang === "am"
                            ? "በዚህ ስልክ ቁጥር የተመዘገበ አካውንት የለም።"
                            : "No account found with this phone number."
                    );
                }
            } else {
                loginEmail = input.toLowerCase();
            }

            await loginWithEmail(loginEmail, password);
        } catch (err) {
            console.error("Login error:", err);
            if (
                err.code === "auth/user-not-found" ||
                err.code === "auth/wrong-password" ||
                err.code === "auth/invalid-credential"
            ) {
                setError(
                    lang === "am"
                        ? "የተሳሳተ ኢሜል/ስልክ ወይም የይለፍ ቃል።"
                        : "Invalid email/phone or password.",
                );
            } else if (err.code === "auth/configuration-not-found" || err.message?.includes("configuration-not-found")) {
                setError(
                    lang === "am"
                        ? "የኢሜል/ይለፍ ቃል አገልግሎት በFirebase አልነቃም። እባክዎ Firebase Console → Authentication → Sign-in method ውስጥ 'Email/Password' ያብሩ።"
                        : "Email/Password sign-in method is disabled in Firebase. Please open Firebase Console → Authentication → Sign-in method and enable 'Email/Password' to test login.",
                );
            } else {
                setError(err.message || "Login failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError("");
        setLoading(true);
        try {
            await loginWithGoogle();
        } catch (err) {
            console.error("Google Sign-In error:", err);
            setError(err.message || "Google Sign-In failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        const input = emailOrPhone.trim();
        const isPhone = /^[+\d\s()-]+$/.test(input) || !input.includes('@');
        if (isPhone) {
            setError(
                lang === "am"
                    ? "እባክዎ የይለፍ ቃል ለማደስ ኢሜልዎን ይጠቀሙ።"
                    : "Please enter an email address to reset password.",
            );
            return;
        }
        if (!input) {
            setError(
                lang === "am"
                    ? "እባክዎ መጀመሪያ የኢሜል አድራሻዎን ያስገቡ።"
                    : "Please enter your email address first.",
            );
            return;
        }
        setLoading(true);
        setError("");
        setSuccessMsg("");
        try {
            await sendPasswordResetEmail(auth, input.toLowerCase());
            setSuccessMsg(
                lang === "am"
                    ? "የይለፍ ቃል ማደሻ ሊንክ ወደ ኢሜልዎ ተልኳል!"
                    : "Password reset link sent to your email!",
            );
        } catch (err) {
            console.error("Password reset error:", err);
            setError(err.message || "Could not send password reset email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-navy-deep">
            <AuthNavbar />
            <div className="flex-grow py-12 px-4 flex items-center justify-center">
                <div className="max-w-md w-full bg-navy-surface border border-navy-border rounded-2xl p-8 sm:p-12 shadow-lg space-y-6 relative overflow-hidden">
                {/* Decorative gold/teal line */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yt-maroon to-ft-teal" />

                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-extrabold text-gold-primary font-ethiopic leading-snug">
                        {t("loginTitle")}
                    </h1>
                    <p className="text-sm text-text-secondary">
                        {t("loginSub")}
                    </p>
                </div>

                {/* Form Container */}
                <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs text-text-secondary font-semibold uppercase">
                            {lang === "am" ? "ኢሜል ወይም ስልክ ቁጥር" : "Email Address or Phone Number"}
                        </label>
                        <input
                            type="text"
                            required
                            placeholder={lang === "am" ? "ኢሜል ወይም 0911000000" : "email@example.com or 0911000000"}
                            value={emailOrPhone}
                            onChange={(e) => setEmailOrPhone(e.target.value)}
                            className="w-full px-4 py-3 bg-navy-mid border border-navy-border rounded-md text-white focus:outline-none focus:border-gold-primary text-sm"
                        />
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <label className="text-xs text-text-secondary font-semibold uppercase">
                                {t("passwordLabel")}
                            </label>
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-xs text-gold-primary hover:underline font-semibold"
                            >
                                {t("forgotPasswordLink")}
                            </button>
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-navy-mid border border-navy-border rounded-md text-white focus:outline-none focus:border-gold-primary text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 font-bold rounded-md bg-gold-primary text-navy-deep hover:bg-gold-hover shadow-gold transition-all duration-200 disabled:opacity-50 text-sm"
                    >
                        {loading
                            ? lang === "am"
                                ? "በማረጋገጥ ላይ..."
                                : "Verifying..."
                            : t("btnLoginSubmit")}
                    </button>
                                </form>

                {/* Google Continue (Unified) */}
                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-navy-border"></div>
                    <span className="flex-shrink mx-4 text-xs text-text-muted font-semibold uppercase">
                        Or
                    </span>
                    <div className="flex-grow border-t border-navy-border"></div>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-md border border-navy-border hover:border-gold-primary text-white bg-navy-mid font-semibold hover:bg-navy-hover flex items-center justify-center space-x-2 text-sm transition-all duration-200"
                >
                    {/* Google Icon SVG */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="#EA4335"
                            d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.99 5.99 0 0 1 8 12.5a5.99 5.99 0 0 1 5.99-6.013c1.55 0 2.902.583 3.923 1.545l3.15-3.14A9.95 9.95 0 0 0 13.99 2 9.99 9.99 0 0 0 4 12a9.99 9.99 0 0 0 9.99 10c5.3 0 9.75-3.87 9.75-10 0-.612-.048-1.285-.16-1.715h-11.34z"
                        />
                    </svg>
                    <span>{t("googleLoginBtn")}</span>
                </button>

                {/* Success / Error Messages */}
                {successMsg && (
                    <p className="text-success text-xs font-semibold bg-success-faint p-2.5 rounded border border-success text-center">
                        {successMsg}
                    </p>
                )}

                {error && (
                    <p className="text-error text-xs font-semibold bg-error-faint p-2.5 rounded border border-error text-center">
                        ❌ {error}
                    </p>
                )}

                <div className="text-center pt-2 text-xs">
                    <Link
                        href="/register"
                        className="text-gold-primary hover:underline font-semibold"
                    >
                        {t("dontHaveAccount")}
                    </Link>
                </div>
            </div>
        </div>
    </div>
    );
}
