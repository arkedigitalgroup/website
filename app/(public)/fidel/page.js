// app/(public)/fidel/page.js
"use client";

import React, { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../src/lib/firebase";
import { useLanguage } from "../../../src/context/LanguageContext";

export default function FidelPage() {
    const { t, lang } = useLanguage();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleWaitlistSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setError("");
        try {
            // Use setDoc with the email as key to prevent duplicate email entries
            const waitlistDocRef = doc(
                db,
                "waitlist",
                email.toLowerCase().trim(),
            );
            await setDoc(waitlistDocRef, {
                email: email.toLowerCase().trim(),
                createdAt: new Date(),
                serviceLine: "fidel",
            });
            setSuccess(true);
            setEmail("");
        } catch (err) {
            console.error("Waitlist error:", err);
            setError(
                lang === "am"
                    ? "ማስገባት አልተቻለም። እባክዎ እንደገና ይሞክሩ።"
                    : "Could not join waitlist. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    const samplePackages = [
        {
            id: "fidel-math",
            name:
                lang === "am"
                    ? "መሠረተ-ሂሳብ (Mathematics)"
                    : "Fundamental Mathematics",
            desc:
                lang === "am"
                    ? "ለልጆችዎ የሂሳብ መሰረታዊ እውቀት፣ ስሌት እና አመክንዮ በቤቶት ማስተማር።"
                    : "Core mathematics tutoring covering basic arithmetic, logic, and problem-solving.",
            price: 4500,
        },
        {
            id: "fidel-science",
            name:
                lang === "am"
                    ? "የተፈጥሮ ሳይንስ (General Science)"
                    : "General Science",
            desc:
                lang === "am"
                    ? "ፊዚክስ፣ ኬሚስትሪ እና ባዮሎጂን ያካተተ የተግባር ሳይንስ ድጋፍ።"
                    : "Introduction to physics, chemistry, and biology tailored for primary and secondary students.",
            price: 4800,
        },
    ];

    return (
        <div className="relative space-y-16 pb-20">
            {/* Coming Soon absolute overlay banner */}
            {/* <div className="bg-warning text-navy-deep font-bold text-center py-3 text-lg tracking-wider font-ethiopic relative z-30 shadow-md">
        ⚠️ {t('comingSoon')} — {lang === 'am' ? 'በዝግጅት ላይ ነን' : 'We are preparing to launch!'}
      </div> */}

            {/* Hero section with Fidel Teal styling */}
            <section className="relative bg-gradient-to-b from-ft-teal to-navy-deep py-20 px-4 text-center border-b border-ft-teal">
                {/* Semi-transparent coming soon huge text behind */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5 text-7xl sm:text-9xl font-extrabold uppercase select-none pointer-events-none z-0">
                    {t("comingSoon")}
                </div>

                <div className="max-w-4xl mx-auto space-y-6 relative z-10">
                    <span className="px-4 py-1.5 rounded-full bg-ft-teal-faint border border-ft-teal text-gold-primary text-sm font-semibold uppercase tracking-wider">
                        {lang === "am" ? "የፊደል አስጠኚ" : "Fidel Academic Tutors"}
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white font-ethiopic leading-snug">
                        {lang === "am"
                            ? "ዘመናዊ አካዳሚክ አስጠኚ ለልጆችዎ"
                            : "Modern Academic Tutoring in Ethiopia"}
                    </h1>
                    <p className="text-base sm:text-xl text-text-secondary max-w-2xl mx-auto font-medium">
                        {lang === "am"
                            ? "የክፍል ትምህርትን የሚያግዝ፣ በሂሳብ፣ ሳይንስ፣ እንግሊዝኛ እና ሌሎች ቋንቋዎች ከፍተኛ ውጤት እንዲያመጡ የሚያግዝ ብቁ የአካዳሚክ አስተማሪዎች ስብስብ።"
                            : "Secure, high-quality, in-home academic tutoring covering school curriculum, STEM subjects, and languages to boost student performance."}
                    </p>
                </div>
            </section>

            {/* Waitlist capture Form */}
            <section className="max-w-3xl mx-auto px-4 relative z-10">
                <div className="bg-navy-surface border border-navy-border rounded-2xl p-8 sm:p-12 shadow-lg relative overflow-hidden text-center space-y-6">
                    <div className="absolute top-0 left-0 w-2 h-full bg-ft-teal" />

                    <div className="space-y-3">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white font-ethiopic">
                            {t("fidelWaitlistTitle")}
                        </h2>
                        <p className="text-sm sm:text-base text-text-secondary max-w-lg mx-auto">
                            {t("fidelWaitlistDesc")}
                        </p>
                    </div>

                    <form
                        onSubmit={handleWaitlistSubmit}
                        className="max-w-md mx-auto flex flex-col sm:flex-row gap-3"
                    >
                        <input
                            type="email"
                            required
                            disabled={loading || success}
                            placeholder={t("emailInputPlaceholder")}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-grow px-4 py-3 bg-navy-mid border border-navy-border rounded-md text-white placeholder-text-muted focus:outline-none focus:border-ft-teal text-sm transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={loading || success}
                            className="px-6 py-3 font-semibold rounded-md bg-gold-primary text-navy-deep hover:bg-gold-hover shadow-gold transition-all duration-200 disabled:opacity-50 text-sm whitespace-nowrap"
                        >
                            {loading
                                ? lang === "am"
                                    ? "በማስገባት ላይ..."
                                    : "Joining..."
                                : t("btnJoinWaitlist")}
                        </button>
                    </form>

                    {success && (
                        <p className="text-success text-sm font-semibold animate-pulse">
                            🎉 {t("waitlistSuccess")}
                        </p>
                    )}

                    {error && (
                        <p className="text-error text-sm font-semibold">
                            ❌ {error}
                        </p>
                    )}
                </div>
            </section>

            {/* Course previews (coming soon) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10 opacity-70">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white font-ethiopic">
                        {lang === "am"
                            ? "የትምህርት ጥቅሎች ቅድመ-እይታ"
                            : "Upcoming Academic Packages Preview"}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {samplePackages.map((pkg) => (
                        <div
                            key={pkg.id}
                            className="bg-navy-surface border border-navy-border rounded-xl p-6 flex flex-col justify-between"
                        >
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-white font-ethiopic">
                                        {pkg.name}
                                    </h3>
                                    <span className="text-lg font-bold text-gold-primary">
                                        {pkg.price.toLocaleString()} ETB
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                                    {pkg.desc}
                                </p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-navy-border flex justify-end">
                                <span className="text-xs font-semibold text-warning uppercase">
                                    {t("comingSoon")}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
