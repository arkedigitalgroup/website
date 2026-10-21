// app/(public)/page.client.js
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "../../src/context/LanguageContext";
import FidelCourseCard from "../../src/components/fidel/FidelCourseCard";
import { publicFidelCourses } from "../../src/lib/fidelCatalog";

const FEATURED_COURSE_IDS = ["MT-001", "Fidel-002", "Fidel-012"];

const featuredCourses = FEATURED_COURSE_IDS.map((courseId) =>
    publicFidelCourses.find((course) => course.course_id === courseId),
).filter(Boolean);

const subjectIcons = {
    math: "M4 19V5m0 14h16M8 15l3-6 3 3 4-7",
    science: "M9 3h6M10 3v6l-5 9a2 2 0 001.8 3h10.4a2 2 0 001.8-3l-5-9V3M7 15h10",
    languages: "M4 5h9M8.5 5v2c0 4-2 7-4.5 9m2-5c1 3 3 5 5.5 6M14 20l4-10 4 10m-7-3h6",
    exam: "M8 4h8a2 2 0 012 2v14l-6-3-6 3V6a2 2 0 012-2zM9 9h6M9 12h4",
    computer: "M4 5h16v10H4zM9 19h6M12 15v4",
    study: "M4 5h7a2 2 0 012 2v12a2 2 0 00-2-2H4zm16 0h-7a2 2 0 00-2 2v12a2 2 0 012-2h7z",
};

function SectionHeading({ title, subtitle }) {
    return (
        <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-white font-ethiopic sm:text-4xl">
                {title}
            </h2>
            {subtitle && (
                <p className="max-w-2xl text-base leading-relaxed text-text-secondary">
                    {subtitle}
                </p>
            )}
            <div className="h-1.5 w-20 rounded-full bg-gold-primary" />
        </div>
    );
}

export default function HomePageClient() {
    const { t, lang } = useLanguage();
    const [openFaq, setOpenFaq] = useState(0);

    const subjects = [
        {
            key: "math",
            title: t("subjectMath"),
            desc: t("subjectMathDesc"),
        },
        {
            key: "science",
            title: t("subjectSciences"),
            desc: t("subjectSciencesDesc"),
        },
        {
            key: "languages",
            title: t("subjectLanguages"),
            desc: t("subjectLanguagesDesc"),
        },
        {
            key: "exam",
            title: t("subjectExam"),
            desc: t("subjectExamDesc"),
        },
        {
            key: "computer",
            title: t("subjectComputer"),
            desc: t("subjectComputerDesc"),
        },
        {
            key: "study",
            title: t("subjectStudy"),
            desc: t("subjectStudyDesc"),
        },
    ];

    const expectations = [
        {
            title: t("whySafetyTitle"),
            desc: t("whySafetyDesc"),
        },
        {
            title: t("whyMentorshipTitle"),
            desc: t("whyMentorshipDesc"),
        },
        {
            title: t("whyTechTitle"),
            desc: t("whyTechDesc"),
        },
        {
            title: t("whyLoyaltyTitle"),
            desc: t("whyLoyaltyDesc"),
        },
        {
            title: t("whyIdentityTitle"),
            desc: t("whyIdentityDesc"),
        },
    ];

    const steps = [
        {
            step: "01",
            title: t("howStep1Title"),
            desc: t("howStep1Desc"),
        },
        {
            step: "02",
            title: t("howStep2Title"),
            desc: t("howStep2Desc"),
        },
        {
            step: "03",
            title: t("howStep3Title"),
            desc: t("howStep3Desc"),
        },
    ];

    const coverage = [
        {
            value: t("coverageGradesValue"),
            label: t("coverageGradesLabel"),
        },
        {
            value: t("coverageSubjectsValue"),
            label: t("coverageSubjectsLabel"),
        },
        {
            value: t("coverageFormatsValue"),
            label: t("coverageFormatsLabel"),
        },
        {
            value: t("coverageLocationValue"),
            label: t("coverageLocationLabel"),
        },
    ];

    const faqs = [
        { q: t("faqQ1"), a: t("faqA1") },
        { q: t("faqQ2"), a: t("faqA2") },
        { q: t("faqQ3"), a: t("faqA3") },
        { q: t("faqQ4"), a: t("faqA4") },
        { q: t("faqQ5"), a: t("faqA5") },
    ];

    const pricingItems = [
        {
            title: t("pricingHourly"),
            desc: t("pricingHourlyDesc"),
        },
        {
            title: t("pricingMonthly"),
            desc: t("pricingMonthlyDesc"),
        },
        {
            title: t("pricingProgram"),
            desc: t("pricingProgramDesc"),
        },
    ];

    const progressItems = [
        t("progressItem1"),
        t("progressItem2"),
        t("progressItem3"),
        t("progressItem4"),
    ];

    return (
        <main className="overflow-hidden bg-navy-deep bg-grid-pattern">
            {/* ─── HERO ─────────────────────────────────────────── */}
            <section
                aria-label={t("heroTitle")}
                className="relative border-b border-navy-border/60 px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
            >
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-gold-primary/10 blur-[120px]"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-ft-teal/10 blur-[120px]"
                />

                <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-12">
                    <div className="space-y-6 lg:col-span-7">
                        <span className="inline-flex items-center gap-2 rounded-full border border-gold-primary/30 bg-gold-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold-primary">
                            {t("heroTagline")}
                        </span>

                        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white font-ethiopic sm:text-5xl lg:text-6xl">
                            {t("heroTitle")}
                        </h1>

                        <div className="h-1.5 w-28 rounded-full bg-gradient-to-r from-ft-teal via-gold-primary to-ft-teal" />

                        <p className="max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
                            {t("heroSubtitle")}
                        </p>

                        <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                            <Link
                                href="/register?role=student&line=fidel&course=in-person-home-tutoring-all-subjects"
                                className="rounded-xl bg-gold-primary px-7 py-3.5 text-center text-sm font-extrabold text-navy-deep shadow-gold transition-colors hover:bg-gold-hover"
                            >
                                {t("heroPrimaryCta")}
                            </Link>
                            <Link
                                href="/fidel#courses"
                                className="rounded-xl border border-ft-teal/50 px-7 py-3.5 text-center text-sm font-bold text-ft-teal-text transition-colors hover:bg-ft-teal/10"
                            >
                                {t("heroSecondaryCta")}
                            </Link>
                        </div>

                        <p className="text-sm font-medium text-text-secondary">
                            {t("heroNote")}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-text-muted">
                            <a
                                href="tel:+251990285748"
                                className="font-semibold text-gold-primary hover:underline"
                            >
                                ☎ +251 990 285 748
                            </a>
                            <span aria-hidden="true">·</span>
                            <Link href="/contact" className="hover:text-white">
                                {t("finalCtaSecondary")}
                            </Link>
                            <span aria-hidden="true">·</span>
                            <Link href="/yeneta" className="hover:text-white">
                                {t("heroYenetaCTA")}
                            </Link>
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-navy-border/80 bg-navy-surface shadow-navy">
                            <img
                                src="/fidelPageHero.jpg"
                                alt={
                                    lang === "am"
                                        ? "የአካዳሚክ ትምህርት ማስታወሻ ደብተርና የመጻሕፍት ጠረጴዛ"
                                        : "Academic study desk with notebooks and textbooks"
                                }
                                className="h-72 w-full object-cover sm:h-80"
                                loading="eager"
                                decoding="async"
                            />
                            <div className="space-y-3 p-5">
                                <p className="text-xs font-semibold uppercase tracking-widest text-ft-teal-text">
                                    {t("fidelBadge")}
                                </p>
                                <p className="text-lg font-bold text-white">
                                    {t("heroDowntitle")}
                                </p>
                                <div className="grid grid-cols-2 gap-2 pt-1">
                                    <div className="rounded-lg border border-navy-border bg-navy-deep/60 px-3 py-2">
                                        <p className="text-[10px] uppercase tracking-wider text-text-muted">
                                            {t("coverageGradesLabel")}
                                        </p>
                                        <p className="text-sm font-bold text-gold-primary">
                                            {t("coverageGradesValue")}
                                        </p>
                                    </div>
                                    <div className="rounded-lg border border-navy-border bg-navy-deep/60 px-3 py-2">
                                        <p className="text-[10px] uppercase tracking-wider text-text-muted">
                                            {t("coverageLocationLabel")}
                                        </p>
                                        <p className="text-sm font-bold text-gold-primary">
                                            {t("coverageLocationValue")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── COVERAGE ─────────────────────────────────────── */}
            <section
                aria-label={t("coverageTitle")}
                className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {coverage.map((item) => (
                        <div
                            key={item.label}
                            className="rounded-xl border border-navy-border/70 bg-navy-surface p-5"
                        >
                            <p className="text-lg font-extrabold text-gold-primary">
                                {item.value}
                            </p>
                            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-text-secondary">
                                {item.label}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── SERVICES ─────────────────────────────────────── */}
            <section
                aria-label={t("serviceTitle")}
                className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8"
            >
                <SectionHeading
                    title={t("serviceTitle")}
                    subtitle={t("serviceSubtitle")}
                />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Fidel — main academic service */}
                    <div className="rounded-2xl border border-navy-border border-l-4 border-l-ft-teal bg-navy-surface p-7 lg:col-span-2">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="rounded-full border border-ft-teal/30 bg-ft-teal-faint px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ft-teal-text">
                                {t("fidelBadge")}
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                                {t("coverageGradesValue")} ·{" "}
                                {t("coverageLocationValue")}
                            </span>
                        </div>

                        <h3 className="mt-4 text-2xl font-extrabold text-white font-ethiopic">
                            {t("fidelTitle")}
                        </h3>
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">
                            {t("fidelDesc")}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {[
                                t("subjectMath"),
                                t("subjectSciences"),
                                t("subjectLanguages"),
                                t("subjectExam"),
                                t("subjectComputer"),
                            ].map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-md border border-ft-teal/20 bg-ft-teal-faint px-2.5 py-1 text-xs font-semibold text-ft-teal-text"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/fidel#courses"
                                className="rounded-lg bg-gold-primary px-5 py-2.5 text-center text-sm font-bold text-navy-deep transition-colors hover:bg-gold-hover"
                            >
                                {t("subjectsCta")}
                            </Link>
                            <a
                                href="tel:+251990285748"
                                className="rounded-lg border border-navy-border px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:border-gold-primary"
                            >
                                {t("contactCallLabel")} +251 990 285 748
                            </a>
                        </div>
                    </div>

                    {/* Yeneta — dedicated branch */}
                    <div className="rounded-2xl border border-navy-border border-l-4 border-l-yt-maroon bg-navy-surface p-7">
                        <span className="rounded-full border border-yt-maroon/30 bg-yt-maroon/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gold-primary">
                            {t("yenetaBadge")}
                        </span>
                        <h3 className="mt-4 text-xl font-extrabold text-white font-ethiopic">
                            {t("yenetaTitle")}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                            {t("yenetaDesc")}
                        </p>
                        <Link
                            href="/yeneta"
                            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-gold-primary hover:text-gold-hover"
                        >
                            {t("heroYenetaCTA")} <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─── SUBJECTS ─────────────────────────────────────── */}
            <section
                id="subjects"
                aria-label={t("subjectsTitle")}
                className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8"
            >
                <SectionHeading
                    title={t("subjectsTitle")}
                    subtitle={t("subjectsSubtitle")}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {subjects.map((subject) => (
                        <Link
                            key={subject.key}
                            href="/fidel#courses"
                            className="group rounded-xl border border-navy-border bg-navy-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold-primary/40"
                        >
                            <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-navy-border bg-navy-deep text-gold-primary">
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.8"
                                        d={subjectIcons[subject.key]}
                                    />
                                </svg>
                            </span>
                            <h3 className="mt-4 text-lg font-bold text-white">
                                {subject.title}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                                {subject.desc}
                            </p>
                        </Link>
                    ))}
                </div>

                <div>
                    <Link
                        href="/fidel#courses"
                        className="inline-flex items-center gap-2 text-sm font-bold text-gold-primary hover:text-gold-hover"
                    >
                        {t("subjectsCta")} <span aria-hidden="true">→</span>
                    </Link>
                </div>
            </section>

            {/* ─── FEATURED COURSES ─────────────────────────────── */}
            <section
                aria-label={t("coursesTitle")}
                className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8"
            >
                <SectionHeading
                    title={t("coursesTitle")}
                    subtitle={t("coursesSubtitle")}
                />

                {featuredCourses.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {featuredCourses.map((course) => (
                            <FidelCourseCard
                                key={course.course_slug}
                                course={course}
                                compact
                            />
                        ))}
                    </div>
                ) : (
                    <p className="rounded-xl border border-navy-border bg-navy-surface p-6 text-sm text-text-secondary">
                        {t("fidelNoResults")}
                    </p>
                )}

                <div>
                    <Link
                        href="/fidel#courses"
                        className="inline-flex items-center gap-2 text-sm font-bold text-gold-primary hover:text-gold-hover"
                    >
                        {t("pricingCta")} <span aria-hidden="true">→</span>
                    </Link>
                </div>
            </section>

            {/* ─── HOW IT WORKS ─────────────────────────────────── */}
            <section
                aria-label={t("howTitle")}
                className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8"
            >
                <SectionHeading
                    title={t("howTitle")}
                    subtitle={t("howSubtitle")}
                />

                <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {steps.map((step) => (
                        <li
                            key={step.step}
                            className="rounded-xl border border-navy-border bg-navy-surface p-6"
                        >
                            <span className="text-4xl font-extrabold text-gold-primary/60">
                                {step.step}
                            </span>
                            <h3 className="mt-3 text-lg font-bold text-white">
                                {step.title}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                                {step.desc}
                            </p>
                        </li>
                    ))}
                </ol>
            </section>

            {/* ─── EXPECTATIONS ─────────────────────────────────── */}
            <section
                aria-label={t("whyTitle")}
                className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8"
            >
                <SectionHeading title={t("whyTitle")} />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {expectations.map((item, index) => (
                        <div
                            key={item.title}
                            className="rounded-xl border border-navy-border bg-navy-surface p-5"
                        >
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gold-primary/30 bg-gold-primary/10 text-xs font-extrabold text-gold-primary">
                                {index + 1}
                            </span>
                            <h3 className="mt-3 text-sm font-bold leading-snug text-white">
                                {item.title}
                            </h3>
                            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── PROGRESS + PRICING ───────────────────────────── */}
            <section
                aria-label={t("progressTitle")}
                className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
            >
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-navy-border bg-navy-surface p-7">
                        <h2 className="text-2xl font-extrabold text-white font-ethiopic">
                            {t("progressTitle")}
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                            {t("progressSubtitle")}
                        </p>
                        <ul className="mt-5 space-y-3">
                            {progressItems.map((item) => (
                                <li
                                    key={item}
                                    className="flex items-start gap-2 text-sm text-text-secondary"
                                >
                                    <span
                                        aria-hidden="true"
                                        className="mt-0.5 text-ft-teal-text"
                                    >
                                        ✓
                                    </span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-5 rounded-lg border border-gold-primary/20 bg-gold-primary/5 p-3 text-xs leading-relaxed text-gold-primary">
                            {t("progressNote")}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-navy-border bg-navy-surface p-7">
                        <h2 className="text-2xl font-extrabold text-white font-ethiopic">
                            {t("pricingTitle")}
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                            {t("pricingSubtitle")}
                        </p>
                        <div className="mt-5 space-y-3">
                            {pricingItems.map((item) => (
                                <div
                                    key={item.title}
                                    className="rounded-lg border border-navy-border bg-navy-deep/40 p-3"
                                >
                                    <p className="text-sm font-bold text-white">
                                        {item.title}
                                    </p>
                                    <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <p className="mt-4 text-xs leading-relaxed text-text-muted">
                            {t("pricingFeesNote")}
                        </p>
                        <Link
                            href="/fidel#courses"
                            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-gold-primary hover:text-gold-hover"
                        >
                            {t("pricingCta")} <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─── TRUST ────────────────────────────────────────── */}
            <section
                aria-label={t("trustTitle")}
                className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
            >
                <div className="rounded-2xl border border-gold-primary/20 bg-navy-surface p-7 sm:p-10">
                    <h2 className="text-2xl font-extrabold text-white font-ethiopic">
                        {t("trustTitle")}
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-secondary">
                        {t("trustDesc")}
                    </p>
                    <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {[
                            t("trustPoint1"),
                            t("trustPoint2"),
                            t("trustPoint3"),
                            t("trustPoint4"),
                        ].map((point) => (
                            <li
                                key={point}
                                className="flex items-start gap-2 text-sm text-text-secondary"
                            >
                                <span
                                    aria-hidden="true"
                                    className="mt-0.5 shrink-0 text-gold-primary"
                                >
                                    ✓
                                </span>
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ─── FAQ ──────────────────────────────────────────── */}
            <section
                aria-label={t("faqTitle")}
                className="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6"
            >
                <SectionHeading
                    title={t("faqTitle")}
                    subtitle={t("faqSubtitle")}
                />

                <div className="space-y-3">
                    {faqs.map((faq, index) => {
                        const isOpen = openFaq === index;
                        return (
                            <div
                                key={faq.q}
                                className="overflow-hidden rounded-xl border border-navy-border bg-navy-surface"
                            >
                                <h3>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setOpenFaq(isOpen ? null : index)
                                        }
                                        aria-expanded={isOpen}
                                        aria-controls={`faq-answer-${index}`}
                                        className="flex w-full items-center justify-between gap-4 p-5 text-left text-sm font-bold text-white transition-colors hover:bg-navy-deep/40"
                                    >
                                        <span>{faq.q}</span>
                                        <span
                                            aria-hidden="true"
                                            className={`text-lg text-gold-primary transition-transform duration-200 ${
                                                isOpen ? "rotate-45" : ""
                                            }`}
                                        >
                                            +
                                        </span>
                                    </button>
                                </h3>
                                <div
                                    id={`faq-answer-${index}`}
                                    hidden={!isOpen}
                                    className="border-t border-navy-border/60 p-5 text-sm leading-relaxed text-text-secondary"
                                >
                                    {faq.a}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ─── FINAL CTA ────────────────────────────────────── */}
            <section
                aria-label={t("finalCtaTitle")}
                className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8"
            >
                <div className="rounded-3xl border border-gold-primary/20 bg-navy-surface p-8 text-center sm:p-14">
                    <h2 className="text-3xl font-extrabold text-white font-ethiopic sm:text-4xl">
                        {t("finalCtaTitle")}
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-text-secondary sm:text-base">
                        {t("finalCtaDesc")}
                    </p>
                    <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link
                            href="/register?role=student&line=fidel&course=in-person-home-tutoring-all-subjects"
                            className="rounded-xl bg-gold-primary px-7 py-3.5 text-sm font-extrabold text-navy-deep transition-colors hover:bg-gold-hover"
                        >
                            {t("finalCtaPrimary")}
                        </Link>
                        <Link
                            href="/contact"
                            className="rounded-xl border border-navy-border px-7 py-3.5 text-sm font-bold text-white transition-colors hover:border-gold-primary"
                        >
                            {t("finalCtaSecondary")}
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
