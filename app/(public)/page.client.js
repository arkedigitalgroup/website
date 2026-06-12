// app/(public)/page.client.js
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLanguage } from "../../src/context/LanguageContext";

// Animated counter hook
function useCounter(target, duration = 1600, start = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start) return;
        let startTime = null;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [start, target, duration]);
    return count;
}

// Scroll reveal hook
function useScrollReveal() {
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        const delay = el.dataset.delay || "0";
                        setTimeout(() => {
                            el.classList.add("revealed");
                        }, parseInt(delay));
                        observer.unobserve(el);
                    }
                });
            },
            { threshold: 0.08, rootMargin: "0px 0px -20px 0px" },
        );

        // Defer selection briefly to ensure hydration is completed
        const timer = setTimeout(() => {
            const els = document.querySelectorAll("[data-reveal]");
            els.forEach((el) => {
                observer.observe(el);
            });
        }, 100);

        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, []);
}

// Stats Bar component
function StatsBar({ t, lang }) {
    const [fired, setFired] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setFired(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.3 },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const families = useCounter(500, 1800, fired);
    const teachers = useCounter(50, 1400, fired);

    return (
        <div
            ref={ref}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            data-reveal
            data-delay="0"
        >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    {
                        value: `${families}+`,
                        label:
                            lang === "am"
                                ? "የተመዘገቡ ቤተሰቦች"
                                : "Families Enrolled",
                    },
                    {
                        value: `${teachers}+`,
                        label:
                            lang === "am"
                                ? "የተረጋገጡ መምህራን"
                                : "Verified Teachers",
                    },
                    {
                        value: "2",
                        label:
                            lang === "am" ? "የአገልግሎት መስመሮች" : "Service Lines",
                    },
                    {
                        value: "Addis",
                        label:
                            lang === "am" ? "አዲስ አበባ ይሸፍናል" : "Ababa Coverage",
                    },
                ].map((stat, i) => (
                    <div
                        key={i}
                        className="glass-panel rounded-xl p-5 text-center border border-navy-border/50 hover:border-gold-primary/30 transition-all duration-300"
                    >
                        <p className="text-3xl sm:text-4xl font-extrabold text-gold-primary font-ethiopic">
                            {stat.value}
                        </p>
                        <p className="text-xs text-text-secondary mt-1 font-medium tracking-wide">
                            {stat.label}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function HomePageClient() {
    const { t, lang } = useLanguage();
    useScrollReveal();

    const [showPreloader, setShowPreloader] = useState(true);
    const [openFaq, setOpenFaq] = useState(null);
    const [activeTestimonial, setActiveTestimonial] = useState(0);
    const [activeHeroImage, setActiveHeroImage] = useState(0);

    const heroImages = [
        "/allCourse.jpg",
        "/fidelPageHero.jpg",
        "/begenaBack.jpg",
        "/quanquaEnaZema.jpg"
    ];

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowPreloader(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, []);

    // Cycle testimonials every 6 seconds
    useEffect(() => {
        if (showPreloader) return;
        const interval = setInterval(() => {
            setActiveTestimonial((prev) => (prev === 0 ? 1 : 0));
        }, 6000);
        return () => clearInterval(interval);
    }, [showPreloader]);

    // Cycle hero images every 5 seconds
    useEffect(() => {
        if (showPreloader) return;
        const interval = setInterval(() => {
            setActiveHeroImage((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [showPreloader]);

    const whyItems = [
        {
            title: t("whySafetyTitle"),
            desc: t("whySafetyDesc"),
            icon: (
                <svg
                    className="w-7 h-7"
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
                    className="w-7 h-7"
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
                    className="w-7 h-7"
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
                    className="w-7 h-7"
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
                    className="w-7 h-7"
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

    const howSteps =
        lang === "am"
            ? [
                  {
                      step: "01",
                      title: "የሚፈልጉትን ለልጆችዎ ይምረጡ",
                      desc: "ለልጅዎ ተስማሚ አገልግሎት ይምረጡ — መንፈሳዊ (የኔታ) ወይም አካዳሚክ (ፊደል)።",
                      color: "border-gold-primary/40 hover:border-gold-primary/70",
                  },
                  {
                      step: "02",
                      title: "ይመዝገቡ",
                      desc: "ስም ያስመዝግቡ፣ ቦታዎን ይምረጡ፣ ተስማሚ የሆነ አስጠኚ ይጠብቁ።",
                      color: "border-yt-maroon/40 hover:border-yt-maroon/70",
                  },
                  {
                      step: "03",
                      title: "ይጀምሩ",
                      desc: "አስጠኚው ቤቶ ይጎብኙና ትምህርቱ ይጀምሩ — ሂደቱን በዳሽቦርዱ ይከታተሉ።",
                      color: "border-ft-teal/40 hover:border-ft-teal/70",
                  },
              ]
            : [
                  {
                      step: "01",
                      title: "Choose",
                      desc: "Pick the service that fits your child — Yeneta for spiritual education or Fidel for academic support.",
                      color: "border-gold-primary/40 hover:border-gold-primary/70",
                  },
                  {
                      step: "02",
                      title: "Register",
                      desc: "Create an account, share your location, and we'll match you with a verified teacher nearby.",
                      color: "border-yt-maroon/40 hover:border-yt-maroon/70",
                  },
                  {
                      step: "03",
                      title: "Start Learning",
                      desc: "Your teacher visits your home. Track attendance, progress, and reports from your dashboard.",
                      color: "border-ft-teal/40 hover:border-ft-teal/70",
                  },
              ];

    const featuredCourses = [
        {
            title: lang === "am" ? "መሠረተ-እምነት" : "Meserete Imnet",
            desc: lang === "am" ? "የኦርቶዶክስ ተዋህዶ መሠረተ እምነት፣ ጸሎትና ስነ-ምግባር ትምህርት" : "Basic Orthodox Tewahedo dogma, prayers, and ethical morals.",
            badge: "Yeneta",
            color: "border-yt-maroon/40"
        },
        {
            title: lang === "am" ? "ቋንቋና ዜማ" : "Geez & Chants",
            desc: lang === "am" ? "የግዕዝ ቋንቋ፣ የፊደል ንባብ እና የመዝሙር/ዜማ መሰረታዊ ትምህርቶች" : "Ge'ez language reading, grammar, and traditional zema/hymns.",
            badge: "Yeneta",
            color: "border-yt-maroon/40"
        },
        {
            title: lang === "am" ? "የበገና ትምህርት" : "Begena Classes",
            desc: lang === "am" ? "የበገና አሰማም፣ መቃኘት፣ እና መንፈሳዊ መዝሙራትን መጫወት" : "History, tuning, and playing the sacred Davidic Harp.",
            badge: "Yeneta",
            color: "border-yt-maroon/40"
        },
        {
            title: lang === "am" ? "አካዳሚክ ድጋፍ" : "Fidel Academic",
            desc: lang === "am" ? "ክፍል 5–12 ለሚገኙ ተማሪዎች ሂሳብ፣ ሳይንስና ቋንቋዎችን ማገዝ" : "School support for Grades 5-12 in Math, Sciences, and English.",
            badge: "Fidel",
            color: "border-ft-teal/40"
        }
    ];

    const faqs = [
        { q: t("faqQ1"), a: t("faqA1") },
        { q: t("faqQ2"), a: t("faqA2") },
        { q: t("faqQ3"), a: t("faqA3") }
    ];

    return (
        <>
            {/* JSON-LD Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "EducationalOrganization",
                        name: "Arke Digital Learning Platform",
                        alternateName: "አርኬ ዲጂታል",
                        url: "https://www.arke-group.com",
                        logo: "https://www.arke-group.com/arkelogo.png",
                        description:
                            "Bilingual Ethiopian tutoring platform connecting students with church-verified Yeneta teachers for Geez and spiritual education, and academic tutors for Grades 5–12 in Addis Ababa.",
                        address: {
                            "@type": "PostalAddress",
                            addressLocality: "Addis Ababa",
                            addressCountry: "ET",
                        },
                        contactPoint: {
                            "@type": "ContactPoint",
                            telephone: "+251990285748",
                            contactType: "customer service",
                        },
                        sameAs: [
                            "https://t.me/arkegroup",
                            "https://facebook.com/share/17kUg7tM9n/",
                            "https://www.instagram.com/arke_.group",
                        ],
                        hasOfferCatalog: {
                            "@type": "OfferCatalog",
                            name: "Tutoring Services",
                            itemListElement: [
                                {
                                    "@type": "Offer",
                                    itemOffered: {
                                        "@type": "Service",
                                        name: "Yeneta — Spiritual & Religious Tutoring",
                                        description:
                                            "Home-based tutoring in Geez, Qidasse, Zema, and Ethiopian Orthodox faith by church-verified teachers.",
                                    },
                                },
                                {
                                    "@type": "Offer",
                                    itemOffered: {
                                        "@type": "Service",
                                        name: "Fidel — Academic Tutoring",
                                        description:
                                            "Grade 5–12 academic support in Math, Science, and languages in Addis Ababa.",
                                    },
                                },
                            ],
                        },
                    }),
                }}
            />

            {/* PRELOADER SCREEN */}
            <div className={`fixed inset-0 z-[9999] bg-navy-deep flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${showPreloader ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none scale-105"}`}>
                <div className="relative flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border-2 border-gold-primary/20 border-t-gold-primary animate-spin" />
                    <img src="/arkelogo.png" alt="Arke Logo" className="absolute w-14 h-14 object-contain animate-pulse" />
                </div>
                <p className="mt-6 text-gold-primary font-bold tracking-widest text-sm uppercase animate-pulse font-ethiopic">
                    {lang === "am" ? "አርኬ ዲጂታል..." : "Arke Digital..."}
                </p>
            </div>

            <main className="space-y-24 pb-24 overflow-hidden bg-navy-deep bg-grid-pattern relative">
                {/* ─── HERO (SPLIT LAYOUT) ─────────────────────────── */}
                <section
                    aria-label="Hero"
                    className="relative min-h-[calc(100vh-5rem)] py-12 px-4 sm:px-6 lg:px-8 border-b border-navy-border/60 flex items-center justify-center overflow-hidden"
                >
                    {/* Ambient glows */}
                    <div
                        className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-gold-faint rounded-full filter blur-[120px] pointer-events-none animate-pulse-glow"
                        style={{ animationDelay: "0s" }}
                    />
                    <div
                        className="absolute top-1/3 left-2/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yt-maroon-faint rounded-full filter blur-[140px] pointer-events-none animate-pulse-glow"
                        style={{ animationDelay: "3s" }}
                    />

                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 w-full">
                        {/* Left Content */}
                        <div className="lg:col-span-7 space-y-6 text-left flex flex-col items-start">
                            {/* Tagline Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold-primary/30 bg-gold-faint backdrop-blur-md">
                                <span className="w-2 h-2 rounded-full bg-gold-primary animate-ping" />
                                <span className="text-xs font-bold tracking-widest text-gold-primary uppercase font-ethiopic">
                                    {t("heroTagline")}
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-ethiopic leading-tight text-left">
                                {lang === "am" ? (
                                    <>
                                        እውቀት ለስኬት <br className="hidden sm:inline" />
                                        ስነ-ምግባር ለህይወት!
                                    </>
                                ) : (
                                    <>
                                        Knowledge for Success <br className="hidden sm:inline" />
                                        Ethics for Life!
                                    </>
                                )}
                            </h1>

                            {/* Brand Line */}
                            <div className="w-28 h-1.5 bg-gradient-to-r from-yt-maroon via-gold-primary to-ft-teal rounded-full" />

                            {/* Subtitle */}
                            <p className="text-lg text-text-secondary font-medium font-ethiopic leading-relaxed max-w-xl text-left">
                                {lang === "am"
                                    ? "አዲስ አበባ ውስጥ ለቤተሰቦች — በቤት ውስጥ መንፈሳዊ እና አካዳሚክ አስጠኝ ያገናኛቸዋል።"
                                    : "Home-based spiritual & academic tutoring for families in Addis Ababa — church-verified teachers, Grades 5–12 support."}
                            </p>

                            {/* Signature CTA buttons */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-2">
                                <Link
                                    href="/yeneta"
                                    className="hero-chip group relative flex items-center gap-3 px-6 py-4 rounded-xl bg-yt-maroon border-2 border-yt-maroon/0 hover:border-gold-primary shadow-[0_8px_30px_rgba(128,0,32,0.35)] hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
                                    aria-label="Yeneta spiritual tutoring"
                                >
                                    <span className="flex items-center justify-center w-9 h-9 rounded-full bg-navy-deep/40 border border-white/20 text-gold-primary flex-shrink-0">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </span>
                                    <span className="text-left">
                                        <span className="block text-[10px] text-white/70 font-semibold tracking-widest uppercase">
                                            {lang === "am" ? "መንፈሳዊ" : "Spiritual"}
                                        </span>
                                        <span className="block text-base font-extrabold text-white font-ethiopic">
                                            {lang === "am" ? "የኔታ አስጠኚ" : "Yeneta Tutoring"}
                                        </span>
                                    </span>
                                </Link>

                                <Link
                                    href="/fidel"
                                    className="hero-chip group relative flex items-center gap-3 px-6 py-4 rounded-xl bg-ft-teal border-2 border-ft-teal/0 hover:border-gold-primary shadow-[0_8px_30px_rgba(0,128,128,0.35)] hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
                                    aria-label="Fidel academic tutoring"
                                >
                                    <span className="flex items-center justify-center w-9 h-9 rounded-full bg-navy-deep/40 border border-white/20 text-gold-primary flex-shrink-0">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                                        </svg>
                                    </span>
                                    <span className="text-left">
                                        <span className="block text-[10px] text-white/70 font-semibold tracking-widest uppercase">
                                            {lang === "am" ? "አካዳሚክ" : "Academic"}
                                        </span>
                                        <span className="block text-base font-extrabold text-white font-ethiopic">
                                            {lang === "am" ? "ፊደል አስጠኚ" : "Fidel Tutoring"}
                                        </span>
                                    </span>
                                </Link>
                            </div>

                            {/* Social Proof */}
                            <div className="flex items-center gap-3 text-sm text-text-secondary pt-4">
                                <div className="flex -space-x-2">
                                    {[...Array(3)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-8 h-8 bg-gradient-to-br from-gold-primary to-yt-maroon rounded-full border-2 border-navy-deep"
                                        />
                                    ))}
                                </div>
                                <span className="font-medium">{t("heroDowntitle")}</span>
                            </div>
                        </div>

                        {/* Right Content: Premium Interactive Mockup Image */}
                        <div className="lg:col-span-5 relative w-full flex items-center justify-center">
                            {/* Decorative background glows */}
                            <div className="absolute w-72 h-72 bg-gold-primary/10 rounded-full filter blur-[60px]" />
                            <div className="absolute w-64 h-64 bg-yt-maroon/15 rounded-full filter blur-[80px] -translate-x-12 translate-y-12" />

                            <div className="relative w-full max-w-[420px] aspect-[4/5] rounded-3xl p-3 bg-gradient-to-br from-navy-border/60 to-navy-deep border border-navy-border/80 shadow-2xl overflow-hidden hover:scale-[1.02] transition-all duration-500 group">
                                <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-transparent to-transparent opacity-60 z-10" />

                                {/* Main Carousel Images */}
                                <div className="absolute inset-3 rounded-2xl overflow-hidden">
                                    {heroImages.map((src, idx) => (
                                        <img
                                            key={src}
                                            src={src}
                                            alt="Arke Learning Materials"
                                            className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
                                                idx === activeHeroImage 
                                                    ? "opacity-100 scale-100 pointer-events-auto" 
                                                    : "opacity-0 scale-105 pointer-events-none"
                                            }`}
                                        />
                                    ))}
                                </div>

                                {/* Floating Stat Badge 1 (Top Right) */}
                                <div className="absolute top-6 right-6 z-20 glass-panel border border-gold-primary/30 rounded-2xl p-3 flex items-center gap-2 shadow-lg animate-float">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-primary/20 text-gold-primary">
                                        ✓
                                    </span>
                                    <div>
                                        <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Tutor Verification</p>
                                        <p className="text-xs font-bold text-white">100% Church Certified</p>
                                    </div>
                                </div>

                                {/* Floating Stat Badge 2 (Bottom Left) */}
                                <div className="absolute bottom-6 left-6 z-20 glass-panel border border-ft-teal/30 rounded-2xl p-3 flex items-center gap-2 shadow-lg animate-float" style={{ animationDelay: "3s" }}>
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-ft-teal/20 text-ft-teal font-extrabold text-sm">
                                        5+
                                    </span>
                                    <div>
                                        <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Active Subjects</p>
                                        <p className="text-xs font-bold text-white">Geez, Liturgy & Math</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── STATS BAR ────────────────────────────────────── */}
                <StatsBar t={t} lang={lang} />

                {/* ─── CORE BELIEF QUOTE ────────────────────────────── */}
                <section
                    aria-label="Core belief"
                    className="max-w-7xl mx-auto px-4 text-center"
                    data-reveal
                    data-delay="0"
                >
                    <div className="relative inline-block py-10 px-8 sm:px-16 glass-panel rounded-2xl shadow-xl max-w-3xl border border-navy-border/60 hover:border-gold-primary/30 transition-all duration-300">
                        <div className="absolute -top-3 left-8 text-5xl text-gold-muted/40 font-serif leading-none">
                            "
                        </div>
                        <p className="text-xl sm:text-3xl font-extrabold text-gold-primary leading-relaxed font-ethiopic italic tracking-wide">
                            {t("coreBeliefQuote")}
                        </p>
                        <div className="absolute -bottom-10 right-8 text-5xl text-gold-muted/40 font-serif leading-none">
                            "
                        </div>
                    </div>
                </section>

                {/* ─── SERVICES CARDS ───────────────────────────────── */}
                <section
                    aria-label="Our services"
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-20"
                >
                    <div
                        className="text-center space-y-2"
                        data-reveal
                        data-delay="0"
                    >
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-ethiopic">
                            {t("serviceTitle")}
                        </h2>
                        <div className="w-20 h-1.5 bg-gold-primary mx-auto rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Yeneta Card */}
                        <div
                            className="glass-panel border-l-8 border-yt-maroon border-t border-r border-b border-navy-border/60 rounded-2xl p-8 sm:p-10 shadow-lg hover:shadow-[0_0_35px_rgba(128,0,32,0.25)] hover:border-yt-maroon/50 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
                            data-reveal
                            data-delay="100"
                        >
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="p-4 bg-yt-maroon-faint rounded-xl text-gold-primary border border-yt-maroon/20 group-hover:scale-110 transition-transform duration-300">
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
                                {/* Feature tags */}
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {(lang === "am"
                                        ? ["ግዕዝ", "ቅዳሴ", "ዜማ", "ስነ-ምግባር", "ቅኔ"]
                                        : [
                                              "Geez",
                                              "Qidasse",
                                              "Zema",
                                              "Ethics",
                                              "Qene",
                                          ]
                                    ).map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-2.5 py-1 text-xs font-semibold rounded-md bg-yt-maroon-faint text-gold-primary border border-yt-maroon/20"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
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
                        <div
                            className="glass-panel border-l-8 border-ft-teal border-t border-r border-b border-navy-border/60 rounded-2xl p-8 sm:p-10 shadow-lg hover:shadow-[0_0_35px_rgba(0,128,128,0.25)] hover:border-ft-teal/50 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
                            data-reveal
                            data-delay="200"
                        >
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="p-4 bg-ft-teal-faint rounded-xl text-gold-primary border border-ft-teal/20 group-hover:scale-110 transition-transform duration-300">
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
                                    <span className="px-3.5 py-1 text-xs font-bold rounded-full bg-success-faint text-success border border-success/20 uppercase tracking-widest animate-pulse">
                                        {t("activeNow")}
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
                                {/* Feature tags */}
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {(lang === "am"
                                        ? [
                                              "ሂሳብ",
                                              "ሳይንስ",
                                              "ቋንቋ",
                                              "ክፍል 5–12",
                                              "አዲስ አበባ",
                                          ]
                                        : [
                                              "Math",
                                              "Science",
                                              "English",
                                              "Grade 5–12",
                                              "Addis Ababa",
                                          ]
                                    ).map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-2.5 py-1 text-xs font-semibold rounded-md bg-ft-teal-faint text-ft-teal border border-ft-teal/20"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-8">
                                <Link
                                    href="/fidel"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-ft-teal/40 text-ft-teal hover:bg-ft-teal hover:text-navy-deep font-bold transition-all duration-300 text-sm"
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
                    </div>
                </section>

                {/* ─── NEW: FEATURED COURSES SECTION ────────────────── */}
                <section
                    aria-label="Featured courses"
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-20"
                    data-reveal
                    data-delay="0"
                >
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-ethiopic">
                            {t("coursesTitle")}
                        </h2>
                        <p className="text-text-secondary text-base max-w-xl mx-auto font-ethiopic">
                            {t("coursesSubtitle")}
                        </p>
                        <div className="w-20 h-1.5 bg-gold-primary mx-auto rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {featuredCourses.map((course, index) => (
                            <div
                                key={index}
                                className={`glass-panel border-t-4 ${course.color} rounded-2xl p-6 flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 border border-navy-border/50 shadow-md`}
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${course.badge === "Yeneta" ? "bg-yt-maroon-faint text-gold-primary border border-yt-maroon/20" : "bg-ft-teal-faint text-ft-teal border border-ft-teal/20"}`}>
                                            {course.badge}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white font-ethiopic">{course.title}</h3>
                                    <p className="text-xs text-text-secondary font-medium font-ethiopic leading-relaxed">{course.desc}</p>
                                </div>
                                <div className="pt-4 border-t border-navy-border/30 mt-4">
                                    <Link
                                        href={course.badge === "Yeneta" ? "/yeneta" : "/fidel"}
                                        className="text-xs font-bold text-gold-primary hover:text-gold-hover transition-colors flex items-center gap-1"
                                    >
                                        {lang === "am" ? "ተጨማሪ ተማር" : "Learn More"} &rarr;
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Integrated allCourse.jpg promo card */}
                    <div className="glass-panel border border-gold-primary/20 rounded-3xl p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-8 hover:border-gold-primary/40 transition-all duration-300 mt-12">
                        <div className="w-full lg:w-1/3 aspect-[4/3] rounded-2xl overflow-hidden border border-navy-border">
                            <img src="/allCourse.jpg" alt="All course learning materials" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 space-y-4 text-left">
                            <span className="px-3 py-1 text-xs font-bold rounded-full bg-gold-primary/10 text-gold-primary border border-gold-primary/20 uppercase tracking-widest">
                                {lang === "am" ? "የቅናሽ ጥቅል" : "Special Bundle"}
                            </span>
                            <h3 className="text-2xl font-bold text-white font-ethiopic">
                                {lang === "am" ? "ሙሉ ትምህርቶች ጥቅል (All Courses Bundle)" : "Spiritual + Language Complete Bundle"}
                            </h3>
                            <p className="text-sm text-text-secondary leading-relaxed font-ethiopic">
                                {lang === "am" 
                                    ? "የመሠረተ እምነት፣ የግዕዝ ቋንቋ፣ የዜማ እና የበገና ትምህርቶችን በአንድ ላይ በማካተት ተመጣጣኝ በሆነ ወርሃዊ ክፍያ ለልጅዎ የተሟላ መንፈሳዊ ስብዕና ይገንቡ።"
                                    : "Combine dogma, prayers, Ge'ez grammar, chants, and Begena harp classes under a single integrated package. Perfect for households wanting detailed spiritual training."}
                            </p>
                            <Link
                                href="/yeneta"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gold-primary text-navy-deep font-bold hover:bg-gold-hover transition-colors text-sm shadow-gold"
                            >
                                {lang === "am" ? "በጥቅሉ ይመዝገቡ" : "Register For Bundle"}
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ─── HOW IT WORKS ─────────────────────────────────── */}
                <section
                    aria-label="How it works"
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-20"
                >
                    <div
                        className="text-center space-y-2"
                        data-reveal
                        data-delay="0"
                    >
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-ethiopic">
                            {lang === "am" ? "እንዴት ይሰራል?" : "How It Works"}
                        </h2>
                        <p className="text-text-secondary text-base max-w-xl mx-auto font-ethiopic">
                            {lang === "am"
                                ? "ሶስት ቀላል ደረጃዎች — ለሁለቱም አገልግሎቶች።"
                                : "Three simple steps — for both Yeneta and Fidel."}
                        </p>
                        <div className="w-20 h-1.5 bg-gold-primary mx-auto rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                        {/* Connecting line (desktop only) */}
                        <div className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-gold-primary/20 via-gold-primary/60 to-gold-primary/20 z-0" />

                        {howSteps.map((step, i) => (
                            <div
                                key={i}
                                className={`glass-panel rounded-2xl p-7 border ${step.color} transition-all duration-300 hover:-translate-y-2 relative z-10 flex flex-col items-start gap-4`}
                                data-reveal
                                data-delay={String(i * 120)}
                            >
                                <span className="text-5xl font-extrabold text-gold-primary/20 font-ethiopic leading-none select-none">
                                    {step.step}
                                </span>
                                <h3 className="text-xl font-extrabold text-white font-ethiopic -mt-2">
                                    {step.title}
                                </h3>
                                <p className="text-text-secondary text-sm leading-relaxed font-medium font-ethiopic">
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ─── WHY ARKE ─────────────────────────────────────── */}
                <section
                    aria-label="Why choose Arke"
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-20"
                >
                    <div
                        className="text-center space-y-2"
                        data-reveal
                        data-delay="0"
                    >
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
                                data-reveal
                                data-delay={String(index * 80)}
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

                {/* ─── NEW: TESTIMONIALS SECTION ────────────────────── */}
                <section
                    aria-label="Parent Testimonials"
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-20"
                    data-reveal
                    data-delay="0"
                >
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-ethiopic">
                            {t("testimonialsTitle")}
                        </h2>
                        <p className="text-text-secondary text-base max-w-xl mx-auto font-ethiopic">
                            {t("testimonialsSubtitle")}
                        </p>
                        <div className="w-20 h-1.5 bg-gold-primary mx-auto rounded-full" />
                    </div>

                    <div className="relative max-w-4xl mx-auto overflow-hidden min-h-[260px] flex items-center justify-center">
                        {/* Testimonial Card 1 */}
                        <div className={`glass-panel border border-navy-border/80 rounded-2xl p-8 sm:p-12 transition-all duration-700 absolute inset-x-0 flex flex-col items-center text-center gap-6 ${activeTestimonial === 0 ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 translate-x-24 pointer-events-none"}`}>
                            {/* Stars */}
                            <div className="flex gap-1 text-gold-primary text-lg">★★★★★</div>
                            <p className="text-lg sm:text-xl font-medium text-white font-ethiopic italic max-w-2xl leading-relaxed">
                                "{t("parent1Text")}"
                            </p>
                            <div>
                                <p className="text-base font-bold text-gold-primary font-ethiopic">{t("parent1Name")}</p>
                                <p className="text-xs text-text-secondary mt-0.5">{t("parent1Role")}</p>
                            </div>
                        </div>

                        {/* Testimonial Card 2 */}
                        <div className={`glass-panel border border-navy-border/80 rounded-2xl p-8 sm:p-12 transition-all duration-700 absolute inset-x-0 flex flex-col items-center text-center gap-6 ${activeTestimonial === 1 ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 -translate-x-24 pointer-events-none"}`}>
                            {/* Stars */}
                            <div className="flex gap-1 text-gold-primary text-lg">★★★★★</div>
                            <p className="text-lg sm:text-xl font-medium text-white font-ethiopic italic max-w-2xl leading-relaxed">
                                "{t("parent2Text")}"
                            </p>
                            <div>
                                <p className="text-base font-bold text-gold-primary font-ethiopic">{t("parent2Name")}</p>
                                <p className="text-xs text-text-secondary mt-0.5">{t("parent2Role")}</p>
                            </div>
                        </div>
                    </div>

                    {/* Manual Navigation Bullets */}
                    <div className="flex items-center justify-center gap-2 pt-4">
                        <button
                            onClick={() => setActiveTestimonial(0)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${activeTestimonial === 0 ? "bg-gold-primary w-6" : "bg-navy-border"}`}
                        />
                        <button
                            onClick={() => setActiveTestimonial(1)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${activeTestimonial === 1 ? "bg-gold-primary w-6" : "bg-navy-border"}`}
                        />
                    </div>
                </section>

                {/* ─── NEW: FAQ ACCORDION SECTION ───────────────────── */}
                <section
                    aria-label="FAQ"
                    className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12 relative z-20"
                    data-reveal
                    data-delay="0"
                >
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-ethiopic">
                            {t("faqTitle")}
                        </h2>
                        <p className="text-text-secondary text-base max-w-xl mx-auto font-ethiopic">
                            {t("faqSubtitle")}
                        </p>
                        <div className="w-20 h-1.5 bg-gold-primary mx-auto rounded-full" />
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => {
                            const isOpen = openFaq === index;
                            return (
                                <div
                                    key={index}
                                    className="glass-panel border border-navy-border/60 rounded-2xl overflow-hidden transition-all duration-300"
                                >
                                    <button
                                        onClick={() => setOpenFaq(isOpen ? null : index)}
                                        className="w-full flex items-center justify-between p-6 text-left text-white font-bold font-ethiopic hover:bg-navy-border/20 transition-colors gap-4"
                                    >
                                        <span>{faq.q}</span>
                                        <span className={`text-gold-primary text-xl font-bold transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>
                                            +
                                        </span>
                                    </button>
                                    <div
                                        className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? "max-h-[300px] border-t border-navy-border/40" : "max-h-0"}`}
                                    >
                                        <div className="p-6 text-sm text-text-secondary font-medium font-ethiopic leading-relaxed bg-navy-deep/20">
                                            {faq.a}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ─── FINAL CTA BAND ───────────────────────────────── */}
                <section
                    aria-label="Call to action"
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
                    data-reveal
                    data-delay="0"
                >
                    <div className="glass-panel rounded-3xl p-8 sm:p-16 text-center border border-gold-primary/20 hover:border-gold-primary/40 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-faint rounded-full filter blur-[90px] pointer-events-none" />
                        <div className="relative z-10 space-y-6">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-ethiopic">
                                {lang === "am" ? "ዛሬ ይጀምሩ" : "Start Today"}
                            </h2>
                            <p className="text-text-secondary text-base sm:text-lg max-w-xl mx-auto font-ethiopic leading-relaxed">
                                {lang === "am"
                                    ? "ለልጅዎ ትክክለኛው አስጠኚ እዚህ ይጠብቀዎታል — መንፈሳዊም ሆነ አካዳሚካዊ።"
                                    : "The right teacher for your child is here — whether spiritual or academic."}
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
                                <Link
                                    href="/yeneta"
                                    className="px-8 py-4 rounded-lg bg-gold-primary text-navy-deep font-extrabold hover:bg-gold-hover transition-colors text-sm shadow-gold"
                                >
                                    {lang === "am"
                                        ? "የኔታ ይመዝገቡ"
                                        : "Register for Yeneta"}
                                </Link>
                                <Link
                                    href="/fidel"
                                    className="px-8 py-4 rounded-lg border border-ft-teal/40 text-ft-teal hover:bg-ft-teal/10 font-extrabold transition-all duration-300 text-sm"
                                >
                                    {lang === "am"
                                        ? "ፊደል ይመዝገቡ"
                                        : "Register for Fidel"}
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Scroll-reveal CSS injected once */}
            <style>{`
                [data-reveal] {
                    opacity: 0;
                    transform: translateY(28px);
                    transition: opacity 0.55s ease, transform 0.55s ease;
                }
                [data-reveal].revealed {
                    opacity: 1;
                    transform: translateY(0);
                }
                .hero-chip {
                    opacity: 0;
                    animation: hero-chip-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                @keyframes hero-chip-pop {
                    0% {
                        opacity: 0;
                        transform: translateY(24px) scale(0.92);
                    }
                    60% {
                        opacity: 1;
                        transform: translateY(-4px) scale(1.03);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                @media (prefers-reduced-motion: reduce) {
                    [data-reveal] {
                        opacity: 1;
                        transform: none;
                        transition: none;
                    }
                    .hero-chip {
                        opacity: 1;
                        animation: none;
                    }
                }
            `}</style>
        </>
    );
}
