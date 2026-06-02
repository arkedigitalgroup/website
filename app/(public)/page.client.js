// app/(public)/page.client.js
"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "../../src/context/LanguageContext";

export default function HomePageClient() {
    const { t, lang } = useLanguage();

    const whyItems = [
        {
            title: t("whySafetyTitle"),
            desc: t("whySafetyDesc"),
            icon: (
                <svg
                    className="w-8 h-8 text-gold-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                </svg>
            ),
        },
        {
            title: t("whyMentorshipTitle"),
            desc: t("whyMentorshipDesc"),
            icon: (
                <svg
                    className="w-8 h-8 text-gold-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                </svg>
            ),
        },
        {
            title: t("whyTechTitle"),
            desc: t("whyTechDesc"),
            icon: (
                <svg
                    className="w-8 h-8 text-gold-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                </svg>
            ),
        },
        {
            title: t("whyLoyaltyTitle"),
            desc: t("whyLoyaltyDesc"),
            icon: (
                <svg
                    className="w-8 h-8 text-gold-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                </svg>
            ),
        },
        {
            title: t("whyIdentityTitle"),
            desc: t("whyIdentityDesc"),
            icon: (
                <svg
                    className="w-8 h-8 text-gold-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                </svg>
            ),
        },
    ];

    return (
        <div className="space-y-24 pb-24 overflow-hidden bg-navy-deep bg-grid-pattern relative">
            {/* 1. Hero Section */}
            <section className="relative h-[calc(100vh-5rem)] min-h-[600px] px-4 border-b border-navy-border/60 flex flex-col items-center justify-center text-center overflow-hidden">
                {/* Dual dynamic glowing mesh backdrops */}
                <div
                    className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-gold-faint rounded-full filter blur-[120px] pointer-events-none animate-pulse-glow"
                    style={{ animationDelay: "0s" }}
                />
                <div
                    className="absolute top-1/3 left-2/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yt-maroon-faint rounded-full filter blur-[140px] pointer-events-none animate-pulse-glow"
                    style={{ animationDelay: "3s" }}
                />
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-ft-teal-faint rounded-full filter blur-[130px] pointer-events-none animate-pulse-glow"
                    style={{ animationDelay: "5s" }}
                />

                <div className="max-w-4xl mx-auto space-y-8 relative z-10">
                    {/* Ethics Badging */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold-primary/30 bg-gold-faint backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-gold-primary animate-ping" />
                        <span className="text-xs font-bold tracking-widest text-gold-primary uppercase font-ethiopic">
                            {t("heroTagline")}
                        </span>
                    </div>

                    <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight text-white font-ethiopic leading-tight">
                        {lang === "am" ? (
                            <>
                                እውቀት ለስኬት <br className="sm:inline" />
                                ስነ-ምግባር ለህይወት!
                            </>
                        ) : (
                            <>
                                Knowledge for Success{" "}
                                <br className="sm:inline" />
                                Ethics for Life!
                            </>
                        )}
                    </h1>

                    {/* Premium brand divider */}
                    <div className="w-28 h-1 bg-gradient-to-r from-yt-maroon via-gold-primary to-ft-teal mx-auto rounded-full shadow-inner" />

                    <p className="text-lg sm:text-2xl text-text-secondary max-w-2xl mx-auto font-medium font-ethiopic leading-relaxed">
                        {t("heroSubtitle")}
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-6 animate-pop-up">
                        <Link
                            href="/yeneta"
                            className="w-full sm:w-auto px-10 py-5 text-base font-bold rounded-lg bg-gold-primary text-navy-deep btn-pop-gold flex items-center justify-center gap-2"
                        >
                            <span>{t("heroYenetaCTA")}</span>
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2.5"
                                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                                />
                            </svg>
                        </Link>
                        <Link
                            href="/fidel"
                            className="w-full sm:w-auto px-10 py-5 text-base font-bold rounded-lg border border-navy-border bg-navy-mid/40 backdrop-blur-md text-text-secondary btn-pop-teal flex items-center justify-center"
                        >
                            {t("heroFidelCTA")}
                        </Link>
                    </div>
                </div>
            </section>

            {/* 2. Core Belief Quote Section */}
            <section className="max-w-7xl mx-auto px-4 text-center">
                <div className="relative inline-block py-10 px-8 sm:px-16 glass-panel rounded-2xl shadow-xl max-w-3xl border border-navy-border/60 hover:border-gold-primary/30 transition-all duration-300">
                    <div className="absolute -top-3 left-8 text-5xl text-gold-muted/40 font-serif leading-none">
                        “
                    </div>
                    <p className="text-xl sm:text-3xl font-extrabold text-gold-primary leading-relaxed font-ethiopic italic tracking-wide">
                        {t("coreBeliefQuote")}
                    </p>
                    <div className="absolute -bottom-10 right-8 text-5xl text-gold-muted/40 font-serif leading-none">
                        ”
                    </div>
                </div>
            </section>

            {/* 3. Services Cards Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-20">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-ethiopic">
                        {t("serviceTitle")}
                    </h2>
                    <div className="w-20 h-1.5 bg-gold-primary mx-auto rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Yeneta Card */}
                    <div className="glass-panel border-l-8 border-yt-maroon border-t border-r border-b border-navy-border/60 rounded-2xl p-8 sm:p-10 shadow-lg hover:shadow-[0_0_35px_rgba(128,0,32,0.25)] hover:border-yt-maroon/50 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="p-4.5 bg-yt-maroon-faint rounded-xl text-gold-primary border border-yt-maroon/20 group-hover:scale-110 transition-transform duration-300">
                                    {/* Spiritual Church SVG icon */}
                                    <svg
                                        className="w-8 h-8"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                        />
                                    </svg>
                                </span>
                                <span className="px-3.5 py-1 text-xs font-bold rounded-full bg-success-faint text-success border border-success/20 uppercase tracking-widest animate-pulse">
                                    {t("activeNow")}
                                </span>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-ethiopic">
                                    {t("yenetaTitle")}
                                </h3>
                                <div className="w-12 h-1 bg-yt-maroon rounded-full" />
                            </div>
                            <p className="text-text-secondary text-base leading-relaxed font-medium font-ethiopic">
                                {t("yenetaDesc")}
                            </p>
                        </div>
                        <div className="pt-8">
                            <Link
                                href="/yeneta"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gold-primary text-navy-deep font-bold hover:bg-gold-hover transition-colors text-sm shadow-gold"
                            >
                                <span>
                                    {lang === "am"
                                        ? "ጥቅሎችን ይመልከቱ"
                                        : "View Packages"}
                                </span>
                                <span>&rarr;</span>
                            </Link>
                        </div>
                    </div>

                    {/* Fidel Card */}
                    <div className="glass-panel border-l-8 border-ft-teal border-t border-r border-b border-navy-border/60 rounded-2xl p-8 sm:p-10 shadow-lg hover:shadow-[0_0_35px_rgba(0,128,128,0.25)] hover:border-ft-teal/50 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="p-4.5 bg-ft-teal-faint rounded-xl text-gold-primary border border-ft-teal/20 group-hover:scale-110 transition-transform duration-300">
                                    {/* Graduation cap SVG icon */}
                                    <svg
                                        className="w-8 h-8"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                                        />
                                    </svg>
                                </span>
                                <span className="px-3.5 py-1 text-xs font-bold rounded-full bg-warning-faint text-warning border border-warning/20 uppercase tracking-widest">
                                    {t("comingSoon")}
                                </span>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-ethiopic">
                                    {t("fidelTitle")}
                                </h3>
                                <div className="w-12 h-1 bg-ft-teal rounded-full" />
                            </div>
                            <p className="text-text-secondary text-base leading-relaxed font-medium font-ethiopic">
                                {t("fidelDesc")}
                            </p>
                        </div>
                        <div className="pt-8">
                            <Link
                                href="/fidel"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gold-primary/30 text-gold-primary hover:bg-gold-primary hover:text-navy-deep font-bold transition-all duration-300 text-sm"
                            >
                                <span>
                                    {lang === "am"
                                        ? "በwaitlist ውስጥ ይግቡ"
                                        : "Join Waitlist"}
                                </span>
                                <span>&rarr;</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Why Arke Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-20">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-ethiopic">
                        {t("whyTitle")}
                    </h2>
                    <div className="w-20 h-1.5 bg-gold-primary mx-auto rounded-full" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {whyItems.map((item, index) => (
                        <div
                            key={index}
                            className="glass-panel hover:shadow-gold hover:border-gold-primary/40 hover:-translate-y-2 transition-all duration-300 text-center flex flex-col items-center space-y-4 p-6 sm:p-7 rounded-2xl group"
                        >
                            <div className="p-4 bg-navy-mid border border-navy-border/80 rounded-full shadow-inner text-gold-primary group-hover:scale-110 transition-transform duration-300">
                                {item.icon}
                            </div>
                            <h3 className="text-lg font-bold text-white leading-snug font-ethiopic">
                                {item.title}
                            </h3>
                            <p className="text-xs text-text-secondary leading-relaxed font-medium">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 5. Founders' Brotherhood Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20">
                <div className="glass-panel rounded-3xl p-8 sm:p-16 max-w-4xl mx-auto relative overflow-hidden border border-navy-border/60 shadow-xl hover:border-gold-primary/30 transition-all duration-300">
                    {/* Subtle gold glow behind */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gold-faint rounded-full filter blur-[80px] pointer-events-none" />

                    <div className="relative z-10 space-y-8">
                        <div className="space-y-3">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-gold-gradient font-ethiopic">
                                {t("foundersTitle")}
                            </h2>
                            <div className="w-16 h-1 bg-gold-primary mx-auto rounded-full animate-width" />
                        </div>
                        <p className="text-text-secondary text-base sm:text-xl leading-relaxed max-w-3xl mx-auto font-medium font-ethiopic">
                            {t("foundersDesc")}
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm font-bold text-white pt-4">
                            <span className="px-5 py-2.5 bg-navy-mid/70 border border-navy-border rounded-full shadow-md tracking-wider">
                                {lang === "am" ? "ቴዎድሮስ" : "Tewodros"}
                            </span>
                            <span className="text-gold-primary text-xl font-extrabold">
                                &amp;
                            </span>
                            <span className="px-5 py-2.5 bg-navy-mid/70 border border-navy-border rounded-full shadow-md tracking-wider">
                                {lang === "am" ? "ዮናስ" : "Yonas"}
                            </span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
