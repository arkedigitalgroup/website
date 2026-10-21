// app/(public)/fidel/page.client.js
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "../../../src/context/LanguageContext";
import FidelCourseCard from "../../../src/components/fidel/FidelCourseCard";
import {
    formatLabel,
    publicFidelCourses,
    subjectLabel,
} from "../../../src/lib/fidelCatalog";

const allSubjects = [
    ...new Set(publicFidelCourses.map((course) => course.subject)),
];
const allFormats = [
    ...new Set(publicFidelCourses.map((course) => course.format)),
];

export default function FidelPageClient() {
    const { t, lang } = useLanguage();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedFormat, setSelectedFormat] = useState("");
    const [openFaq, setOpenFaq] = useState(0);

    const filteredCourses = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return publicFidelCourses.filter((course) => {
            const matchesSearch =
                !query ||
                course.course_name.toLowerCase().includes(query) ||
                course.description.toLowerCase().includes(query) ||
                course.subject.toLowerCase().includes(query) ||
                (course.subjects_covered ?? []).some((subject) =>
                    subject.toLowerCase().includes(query),
                );

            const matchesSubject =
                !selectedSubject || course.subject === selectedSubject;
            const matchesFormat =
                !selectedFormat || course.format === selectedFormat;

            return matchesSearch && matchesSubject && matchesFormat;
        });
    }, [searchQuery, selectedSubject, selectedFormat]);

    const hasFilters = Boolean(
        searchQuery || selectedSubject || selectedFormat,
    );

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedSubject("");
        setSelectedFormat("");
    };

    const steps = [
        t("fidelHowStep1"),
        t("fidelHowStep2"),
        t("fidelHowStep3"),
    ];

    const faqs = [
        { q: t("fidelFaq1Q"), a: t("fidelFaq1A") },
        { q: t("fidelFaq2Q"), a: t("fidelFaq2A") },
        { q: t("fidelFaq3Q"), a: t("fidelFaq3A") },
        { q: t("fidelFaq4Q"), a: t("fidelFaq4A") },
        { q: t("fidelFaq5Q"), a: t("fidelFaq5A") },
    ];

    return (
        <div className="space-y-16 bg-navy-deep pb-20">
            {/* ─── HERO ─────────────────────────────────────────── */}
            <section className="relative overflow-hidden border-b border-navy-border/60">
                <div className="absolute inset-0">
                    <img
                        src="/fidelPageHero.jpg"
                        alt=""
                        aria-hidden="true"
                        className="h-full w-full object-cover object-center opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/90 to-navy-deep/40" />
                </div>

                <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                    <div className="max-w-2xl space-y-5">
                        <div className="flex items-center gap-4">
                            <img
                                src="/fidellogo.png"
                                alt="Fidel academic tutoring"
                                className="h-16 w-16 object-contain"
                            />
                            <span className="rounded-full border border-ft-teal/40 bg-ft-teal-faint px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-ft-teal-text">
                                {t("fidelTagline")}
                            </span>
                        </div>

                        <h1 className="text-3xl font-extrabold leading-tight text-white font-ethiopic sm:text-4xl lg:text-5xl">
                            {t("fidelHeroTitle")}
                        </h1>

                        <p className="text-base leading-relaxed text-text-secondary sm:text-lg">
                            {t("fidelHeroDesc")}
                        </p>

                        <p className="text-sm font-medium text-ft-teal-text">
                            {t("fidelHeroNote")}
                        </p>

                        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                            <a
                                href="#courses"
                                className="rounded-xl bg-gold-primary px-7 py-3.5 text-center text-sm font-extrabold text-navy-deep transition-colors hover:bg-gold-hover"
                            >
                                {t("fidelBrowseCta")} ↓
                            </a>
                            <a
                                href="tel:+251990285748"
                                className="rounded-xl border border-navy-border px-7 py-3.5 text-center text-sm font-bold text-white transition-colors hover:border-gold-primary"
                            >
                                {t("contactCallLabel")} +251 990 285 748
                            </a>
                            <Link
                                href="/register?role=teacher&line=fidel"
                                className="rounded-xl border border-ft-teal/50 px-7 py-3.5 text-center text-sm font-bold text-ft-teal-text transition-colors hover:bg-ft-teal/10"
                            >
                                {t("fidelTeacherCtaBtn")}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── HOW IT WORKS ─────────────────────────────────── */}
            <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-extrabold text-white font-ethiopic">
                    {t("fidelHowTitle")}
                </h2>
                <ol className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {steps.map((step, index) => (
                        <li
                            key={step}
                            className="rounded-xl border border-navy-border bg-navy-surface p-5"
                        >
                            <span className="text-3xl font-extrabold text-gold-primary/60">
                                {String(index + 1).padStart(2, "0")}
                            </span>
                            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                                {step}
                            </p>
                        </li>
                    ))}
                </ol>
            </section>

            {/* ─── FOCUS PAGES ──────────────────────────────────── */}
            <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Link
                        href="/fidel/mathematics-tutoring"
                        className="group rounded-2xl border border-navy-border bg-navy-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold-primary/40"
                    >
                        <p className="text-xs font-bold uppercase tracking-wider text-ft-teal-text">
                            {t("fidelMathPageEyebrow")}
                        </p>
                        <h2 className="mt-2 text-xl font-extrabold text-white font-ethiopic">
                            {t("fidelMathPageTitle")}
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                            {t("fidelMathPageSummary")}
                        </p>
                        <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-gold-primary">
                            {t("learnMore")} <span aria-hidden="true">→</span>
                        </span>
                    </Link>

                    <Link
                        href="/fidel/exam-preparation"
                        className="group rounded-2xl border border-navy-border bg-navy-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold-primary/40"
                    >
                        <p className="text-xs font-bold uppercase tracking-wider text-ft-teal-text">
                            {t("fidelExamPageEyebrow")}
                        </p>
                        <h2 className="mt-2 text-xl font-extrabold text-white font-ethiopic">
                            {t("fidelExamPageTitle")}
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                            {t("fidelExamPageSummary")}
                        </p>
                        <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-gold-primary">
                            {t("learnMore")} <span aria-hidden="true">→</span>
                        </span>
                    </Link>
                </div>
            </section>

            {/* ─── CATALOG ──────────────────────────────────────── */}
            <section
                id="courses"
                className="mx-auto max-w-7xl scroll-mt-8 space-y-8 px-4 sm:px-6 lg:px-8"
            >
                <div className="space-y-3">
                    <h2 className="text-2xl font-extrabold text-white font-ethiopic sm:text-3xl">
                        {t("fidelCatalogTitle")}
                    </h2>
                    <p className="max-w-2xl text-sm leading-relaxed text-text-secondary">
                        {t("fidelCatalogSub")}
                    </p>
                </div>

                {publicFidelCourses.length === 0 ? (
                    <div className="rounded-xl border border-navy-border bg-navy-surface p-8 text-center">
                        <p className="text-sm text-text-secondary">
                            {t("fidelCatalogEmpty")}
                        </p>
                        <Link
                            href="/contact"
                            className="mt-3 inline-flex text-sm font-bold text-gold-primary hover:underline"
                        >
                            {t("finalCtaSecondary")}
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <label className="flex-grow">
                                <span className="sr-only">
                                    {t("fidelSearchPlaceholder")}
                                </span>
                                <input
                                    type="search"
                                    placeholder={t("fidelSearchPlaceholder")}
                                    value={searchQuery}
                                    onChange={(event) =>
                                        setSearchQuery(event.target.value)
                                    }
                                    className="w-full rounded-lg border border-navy-border bg-navy-surface px-4 py-2.5 text-sm text-white placeholder:text-text-muted focus:border-gold-primary focus:outline-none"
                                />
                            </label>

                            <label>
                                <span className="sr-only">
                                    {t("fidelAllSubjects")}
                                </span>
                                <select
                                    value={selectedSubject}
                                    onChange={(event) =>
                                        setSelectedSubject(event.target.value)
                                    }
                                    className="w-full rounded-lg border border-navy-border bg-navy-surface px-3 py-2.5 text-sm text-white focus:border-gold-primary focus:outline-none sm:w-52"
                                >
                                    <option value="">
                                        {t("fidelAllSubjects")}
                                    </option>
                                    {allSubjects.map((subject) => (
                                        <option key={subject} value={subject}>
                                            {subjectLabel(subject, lang)}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                <span className="sr-only">
                                    {t("fidelAllFormats")}
                                </span>
                                <select
                                    value={selectedFormat}
                                    onChange={(event) =>
                                        setSelectedFormat(event.target.value)
                                    }
                                    className="w-full rounded-lg border border-navy-border bg-navy-surface px-3 py-2.5 text-sm text-white focus:border-gold-primary focus:outline-none sm:w-48"
                                >
                                    <option value="">
                                        {t("fidelAllFormats")}
                                    </option>
                                    {allFormats.map((format) => (
                                        <option key={format} value={format}>
                                            {formatLabel(format, lang)}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-xs text-text-secondary">
                                {filteredCourses.length} {t("fidelResults")}
                            </p>
                            {hasFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="text-xs font-semibold text-ft-teal-text hover:underline"
                                >
                                    {t("fidelClearFilters")}
                                </button>
                            )}
                        </div>

                        {filteredCourses.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {filteredCourses.map((course) => (
                                    <FidelCourseCard
                                        key={course.course_slug}
                                        course={course}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-navy-border bg-navy-surface p-10 text-center">
                                <p className="text-sm text-text-secondary">
                                    {t("fidelNoResults")}
                                </p>
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="mt-3 text-sm font-bold text-gold-primary hover:underline"
                                >
                                    {t("fidelClearFilters")}
                                </button>
                            </div>
                        )}

                        <div className="space-y-2 rounded-xl border border-navy-border bg-navy-surface p-5">
                            <p className="text-xs leading-relaxed text-text-secondary">
                                {t("fidelFeesNote")}
                            </p>
                            <p className="text-xs leading-relaxed text-text-muted">
                                {t("fidelCatalogNote")}
                            </p>
                        </div>
                    </>
                )}
            </section>

            {/* ─── TEACHER CTA ──────────────────────────────────── */}
            <section className="mx-auto max-w-4xl px-4 sm:px-6">
                <div className="flex flex-col items-start justify-between gap-6 rounded-xl border border-ft-teal/30 border-l-4 border-l-ft-teal bg-navy-surface p-7 sm:flex-row sm:items-center">
                    <div className="space-y-2">
                        <h2 className="text-xl font-extrabold text-white font-ethiopic">
                            {t("fidelTeacherCtaTitle")}
                        </h2>
                        <p className="max-w-md text-sm leading-relaxed text-text-secondary">
                            {t("fidelTeacherCtaDesc")}
                        </p>
                    </div>
                    <Link
                        href="/register?role=teacher&line=fidel"
                        className="w-full whitespace-nowrap rounded-lg border border-ft-teal px-6 py-3 text-center text-sm font-bold text-ft-teal-text transition-colors hover:bg-ft-teal/10 sm:w-auto"
                    >
                        {t("fidelTeacherCtaBtn")}
                    </Link>
                </div>
            </section>

            {/* ─── FAQ ──────────────────────────────────────────── */}
            <section className="mx-auto max-w-4xl px-4 sm:px-6">
                <h2 className="text-2xl font-extrabold text-white font-ethiopic">
                    {t("fidelFaqTitle")}
                </h2>
                <div className="mt-5 space-y-3">
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
                                        aria-controls={`fidel-faq-${index}`}
                                        className="flex w-full items-center justify-between gap-4 p-5 text-left text-sm font-bold text-white hover:bg-navy-deep/40"
                                    >
                                        <span>{faq.q}</span>
                                        <span
                                            aria-hidden="true"
                                            className={`text-lg text-gold-primary transition-transform ${
                                                isOpen ? "rotate-45" : ""
                                            }`}
                                        >
                                            +
                                        </span>
                                    </button>
                                </h3>
                                <div
                                    id={`fidel-faq-${index}`}
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
            <section className="mx-auto max-w-4xl px-4 text-center sm:px-6">
                <div className="rounded-2xl border border-gold-primary/20 bg-navy-surface p-8">
                    <h2 className="text-2xl font-extrabold text-white font-ethiopic">
                        {t("finalCtaTitle")}
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-text-secondary">
                        {t("finalCtaDesc")}
                    </p>
                    <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link
                            href="/register?role=student&line=fidel&course=in-person-home-tutoring-all-subjects"
                            className="rounded-xl bg-gold-primary px-7 py-3.5 text-sm font-extrabold text-navy-deep transition-colors hover:bg-gold-hover"
                        >
                            {t("finalCtaPrimary")}
                        </Link>
                        <a
                            href="tel:+251990285748"
                            className="rounded-xl border border-navy-border px-7 py-3.5 text-sm font-bold text-white transition-colors hover:border-gold-primary"
                        >
                            {t("contactCallLabel")} +251 990 285 748
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
