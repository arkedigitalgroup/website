// app/(public)/yeneta/page.client.js
"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "../../../src/context/LanguageContext";

export default function YenetaPageClient() {
    const { t, lang } = useLanguage();

    const packages = [
        {
            id: "meserete-imnet",
            name: t("package1"),
            desc: t("package1Desc"),
            syllabus: t("package1Syllabus"),
            price: 4199,
        },
        {
            id: "quanquanna-zema",
            name: t("package2"),
            desc: t("package2Desc"),
            syllabus: t("package2Syllabus"),
            price: 5499,
        },
        {
            id: "diquna-zegajat",
            name: t("package3"),
            desc: t("package3Desc"),
            syllabus: t("package3Syllabus"),
            price: 5999,
        },
        {
            id: "all-courses",
            name: t("package4"),
            desc: t("package4Desc"),
            syllabus: t("package4Syllabus"),
            price: 7999,
        },
    ];

    return (
        <div className="space-y-16 pb-20">
            {/* Hero section with Yeneta Maroon styling */}
            <section className="relative bg-gradient-to-b from-yt-maroon/20 to-navy-deep py-20 px-4 text-center border-b border-yt-maroon overflow-hidden">
                {/* Giant elegant watermark logo */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 flex items-center justify-center">
                    <img 
                        src="/yenetalogo.png" 
                        alt="" 
                        className="w-[450px] h-[450px] sm:w-[650px] sm:h-[650px] object-contain opacity-[0.05] pointer-events-none select-none transform rotate-12 scale-110" 
                    />
                </div>

                <div className="max-w-4xl mx-auto space-y-6 relative z-10">
                    <div className="flex flex-col items-center gap-4 mb-2">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gold-primary/25 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-300"></div>
                            <img 
                                src="/yenetalogo.png" 
                                alt="Yeneta Logo" 
                                className="relative w-20 h-20 sm:w-24 sm:h-24 object-contain transition-transform duration-500 group-hover:scale-110 select-none pointer-events-none" 
                            />
                        </div>
                        <span className="px-4 py-1.5 rounded-full bg-yt-maroon-faint border border-yt-maroon text-gold-primary text-sm font-semibold uppercase tracking-wider">
                            {lang === "am"
                                ? "የየኔታ አስጠኚ"
                                : "Yeneta Spiritual Tutors"}
                        </span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white font-ethiopic leading-snug">
                        {lang === "am"
                            ? "መንፈሳዊና ባህላዊ የቤት ውስጥ ትምህርቶች"
                            : "Spiritual & Traditional Home Tutoring"}
                    </h1>
                    <p className="text-base sm:text-xl text-text-secondary max-w-2xl mx-auto font-medium">
                        {lang === "am"
                            ? "በቤተክርስቲያን የተመሰከረላቸውን ብቁ የኔታዎች ከተማሪዎች ጋር በማገናኘት፣ በቤቶት ሆነው ግዕዝ፣ ቅዳሴ፣ ዜማ እና ስነ-ምግባርን ያስተምሩ።"
                            : "Empowering the next generation with deep cultural identity, liturgical chants, Ge'ez literacy, and traditional Orthodox theology from vetted tutors in your home."}
                    </p>
                </div>
            </section>

            {/* Course Packages Table/Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                <div className="text-center max-w-2xl mx-auto space-y-3">
                    <h2 className="text-3xl font-bold text-white font-ethiopic">
                        {t("yenetaPackagesTitle")}
                    </h2>
                    <p className="text-sm text-text-secondary">
                        {t("yenetaPackagesSub")}
                    </p>
                </div>

                {/* Packages Stack */}
                <div className="space-y-8 max-w-5xl mx-auto">
                    {packages.map((pkg) => (
                        <div
                            key={pkg.id}
                            className="bg-navy-surface border border-navy-border rounded-2xl overflow-hidden hover:border-gold-primary hover:shadow-gold transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 group"
                        >
                            {/* Main Info Side */}
                            <div className="p-6 sm:p-8 lg:col-span-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-navy-border bg-gradient-to-br from-navy-surface to-navy-mid">
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
                                            ETB / {lang === "am" ? "ወር" : "mo"}
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
                            <div className="p-6 sm:p-8 lg:col-span-5 bg-navy-deep/40 flex flex-col justify-center">
                                <h4 className="text-sm font-semibold text-gold-primary tracking-wider uppercase mb-4 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                    </svg>
                                    {lang === "am" ? "የትምህርት ይዘቶች (Syllabus)" : "Course Syllabus"}
                                </h4>
                                <ul className="space-y-3">
                                    {Array.isArray(pkg.syllabus) && pkg.syllabus.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm text-text-secondary">
                                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gold-faint border border-gold-primary/30 flex items-center justify-center mt-0.5">
                                                <svg className="w-3 h-3 text-gold-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                                </svg>
                                            </span>
                                            <span className="leading-relaxed font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
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
                                ? "በክብር ሙያዎ ተማሪዎችን እያስተማሩ 85% ክፍያ በማግኘት ኑሮዎን ያሻሽሉ። ዛሬውኑ ይመዝገቡ።"
                                : "Join our platform, preserve our indigenous identity, and earn a premium 85% payout. Register as a teacher now."}
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
