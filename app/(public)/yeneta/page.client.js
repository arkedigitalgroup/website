// app/(public)/yeneta/page.client.js
"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "../../../src/context/LanguageContext";
import { useCourses } from "../../../src/hooks/Usecourses";

export default function YenetaPageClient() {
    const { t, lang } = useLanguage();
    const { courses: packages, loading: coursesLoading } = useCourses(
        "yeneta",
        lang,
    );

    return (
        <div className="space-y-16 pb-20">
            {/* Hero section with Yeneta Maroon styling */}
            <section className="relative bg-gradient-to-b from-yt-maroon/20 to-navy-deep min-h-[60vh] max-h-[100vh] py-16 px-4 border-b border-yt-maroon overflow-hidden flex items-center">
                {/* Full-width background image aligned right */}
                <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
                    <img
                        src="/yenetapageHero.png"
                        alt=""
                        className="w-full h-full object-cover object-right opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/80 to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-start gap-6 text-left w-full">
                    <div className="w-full lg:w-[60%] space-y-5">
                        <div className="flex flex-col items-start gap-4 mb-2">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gold-primary/25 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-300"></div>
                                <img
                                    src="/yenetalogo.png"
                                    alt="Yeneta Logo"
                                    className="relative w-32 h-32 sm:w-20 sm:h-20 md:w-44 md:h-44 object-contain transition-transform duration-500 group-hover:scale-110 select-none pointer-events-none"
                                />
                            </div>
                            <span className="px-4 py-1.5 rounded-full bg-yt-maroon-faint border border-yt-maroon text-gold-primary text-sm font-semibold uppercase tracking-wider">
                                {lang === "am"
                                    ? "የየኔታ አስጠኚ | ጥበብን ከምንጩ፣ ስነ-ምግባርን ከቤቱ!"
                                    : "Yeneta Spiritual Tutors | Wisdom from the Source, Ethics from the Home!"}
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-ethiopic leading-snug">
                            {lang === "am"
                                ? "መንፈሳዊ የቤት ውስጥ ትምህርቶች"
                                : "Spiritual Home Tutoring"}
                        </h1>
                        <p className="text-base sm:text-lg text-text-secondary font-medium leading-relaxed">
                            {lang === "am"
                                ? "ልጆች በባዕድ ባህል እንዳይበከሉ መንፈሳዊ እውቀትን (ግዕዝ፣ ዜማ፣ ስነ-ምግባር) በቤታቸው እንዲማሩ በማድረግ፣ ውስጣዊ ማንነታቸውን እንዲያውቁ፣ ወላጆቻቸውን እንዲያከብሩ እና ከክፉ ድርጊቶች እንዲርቁ እናደርጋለን።"
                                : "To prevent children from losing their roots to foreign cultural erosion, Yeneta Tutors provides spiritual and traditional wisdom (Ge'ez, Zema, and Ethics) at home. This ensures they grow up respecting their heritage and their parents."}
                        </p>
                        <p className="text-sm text-gold-primary font-medium">
                            {lang === "am"
                                ? "በቤተክርስቲያን የተመሰከረላቸውን ብቁ የኔታዎች ከተማሪዎች ጋር በማገናኘት፣ በቤቶት ሆነው ግዕዝ፣ ቅዳሴ፣ ዜማ እና ስነ-ምግባርን ይማሩ።"
                                : "Empowering the next generation with deep cultural identity, liturgical chants, Ge'ez literacy, and Orthodox theology from vetted tutors in your home."}
                        </p>
                        <div className="flex flex-col sm:flex-row items-start gap-4 pt-2">
                            <a
                                href="#courses"
                                className="px-8 py-3.5 text-base font-bold rounded-xl bg-ft-amber text-ft-obsidian hover:bg-ft-amber-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md"
                            >
                                {lang === "am"
                                    ? "ኮርሶችን ይመልከቱ ↓"
                                    : "Browse Courses ↓"}
                            </a>
                            <a
                                href="/register?role=teacher&line=yeneta"
                                className="px-8 py-3.5 text-base font-semibold rounded-xl border border-ft-teal/60 text-ft-teal hover:bg-ft-teal/10 transition-colors"
                            >
                                {lang === "am"
                                    ? "እንደ መምህር ይመዝገቡ"
                                    : "Register as Teacher"}
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Course Packages Table/Grid */}

            <section
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10"
                id="courses"
            >
                <div className="text-center max-w-2xl mx-auto space-y-3">
                    <h2 className="text-3xl font-bold text-white font-ethiopic">
                        {t("yenetaPackagesTitle")}
                    </h2>
                    <p className="text-sm text-text-secondary">
                        {t("yenetaPackagesSub")}
                    </p>
                    <p className="text-sm text-text-secondary">
                        የሚፈልጉትን ት/ት መርጠው ለአስተማር ወይም ለመማር ይመዝገቡ
                    </p>
                </div>

                {/* Packages Stack */}
                <div className="space-y-8 max-w-5xl mx-auto">
                    {coursesLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-2 border-gold-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        packages.map((pkg) => (
                            <div
                                key={pkg.id}
                                className="relative border border-navy-border rounded-2xl overflow-hidden hover:border-gold-primary hover:shadow-gold transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 group"
                            >
                                {console.log(pkg)}
                                {/* Background Image */}
                                <div className="absolute inset-0 z-0">
                                    <img
                                        src={pkg.image}
                                        alt={pkg.alt}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-25 group-hover:scale-105 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-l from-navy-deep/10 via-navy-deep/25 to-navy-deep/10"></div>
                                </div>

                                {/* Main Info Side */}
                                <div className="relative z-10 p-6 sm:p-8 lg:col-span-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10">
                                    <div className="space-y-5">
                                        <div className="flex justify-between items-start gap-4">
                                            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-ethiopic leading-snug group-hover:text-gold-primary transition-colors duration-300">
                                                {pkg.name}
                                            </h3>
                                        </div>
                                        <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-medium">
                                            {pkg.desc}
                                        </p>
                                        <div className="inline-flex items-baseline gap-2 pt-2">
                                            <span className="text-3xl sm:text-4xl font-black text-gold-primary">
                                                {pkg.price.toLocaleString()}
                                            </span>
                                            <span className="text-sm text-text-muted">
                                                ETB /{" "}
                                                {lang === "am" ? "ወር" : "mo"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="pt-8">
                                        <Link
                                            href={`/register?role=student&line=yeneta&course=${pkg.id}`}
                                            className="inline-block w-full sm:w-auto text-center px-8 py-3.5 text-base font-bold rounded-xl bg-gold-primary text-navy-deep hover:bg-gold-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md"
                                        >
                                            {t("btnRegisterStudent")}
                                        </Link>
                                    </div>
                                </div>

                                {/* Syllabus Side */}
                                <div className="relative z-10 p-6 sm:p-8 lg:col-span-5 bg-navy-deep/30 backdrop-blur-sm flex flex-col justify-center">
                                    <h4 className="text-sm font-semibold text-gold-primary tracking-wider uppercase mb-4 flex items-center gap-2">
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2.5"
                                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                            />
                                        </svg>
                                        {lang === "am"
                                            ? "የትምህርት ይዘቶች (Syllabus)"
                                            : "Course Syllabus"}
                                    </h4>
                                    <ul className="space-y-3">
                                        {(() => {
                                            const raw =
                                                lang === "am"
                                                    ? pkg.syllabusAm
                                                    : pkg.syllabusEn;

                                            const items = pkg.syllabus
                                                ? pkg.syllabus
                                                      .split(/[,፣]/)
                                                      .map((s) => s.trim())
                                                      .filter(Boolean)
                                                : [];
                                            return items.map((item, idx) => (
                                                <li
                                                    key={idx}
                                                    className="flex items-start gap-3 text-sm text-text-secondary"
                                                >
                                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gold-faint border border-gold-primary/30 flex items-center justify-center mt-0.5">
                                                        <svg
                                                            className="w-3 h-3 text-gold-primary"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="3"
                                                                d="M5 13l4 4L19 7"
                                                            />
                                                        </svg>
                                                    </span>
                                                    <span className="leading-relaxed font-medium">
                                                        {item}
                                                    </span>
                                                </li>
                                            ));
                                        })()}
                                    </ul>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* CTA Join as Teacher */}
            <section className="max-w-4xl mx-auto px-4 text-center">
                <div className="bg-navy-surface border border-yt-maroon border-l-4 rounded-xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
                    <div className="text-left space-y-2">
                        <h3 className="text-xl font-bold text-white font-ethiopic">
                            {lang === "am"
                                ? "የየኔታ መምህር ነዎት?"
                                : "Are you a qualified Yeneta/Tutor?"}
                        </h3>
                        <p className="text-sm text-text-secondary max-w-md">
                            {lang === "am"
                                ? "በክብር ሙያዎ ተማሪዎችን እያስተማሩ ክፍያ በማግኘት ኑሮዎን ያሻሽሉ። ዛሬውኑ ይመዝገቡ።"
                                : "Join our platform, preserve our indigenous identity, and earn a premium payout. Register as a teacher now."}
                        </p>
                    </div>
                    <Link
                        href="/register?role=teacher&line=yeneta"
                        className="w-full sm:w-auto px-6 py-3 rounded-md border border-gold-primary text-gold-primary hover:bg-gold-faint transition-colors text-sm font-semibold whitespace-nowrap"
                    >
                        {t("btnRegisterTeacher")}
                    </Link>
                </div>
            </section>
        </div>
    );
}
