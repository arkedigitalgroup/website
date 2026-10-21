// app/(public)/fidel/mathematics-tutoring/page.client.js
"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "../../../../src/context/LanguageContext";
import FidelCourseCard from "../../../../src/components/fidel/FidelCourseCard";
import { buildRegisterHref, findPublicCourse } from "../../../../src/lib/fidelCatalog";

const COURSE_SLUG = "fidel-mathematics-advanced";

export default function MathematicsTutoringClient() {
    const { t } = useLanguage();
    const course = findPublicCourse(COURSE_SLUG);

    const focusAreas = [
        { title: t("mathFocusAlgebra"), desc: t("mathFocusAlgebraDesc") },
        { title: t("mathFocusGeometry"), desc: t("mathFocusGeometryDesc") },
        { title: t("mathFocusCalculus"), desc: t("mathFocusCalculusDesc") },
        { title: t("mathFocusStatistics"), desc: t("mathFocusStatisticsDesc") },
        { title: t("mathFocusExam"), desc: t("mathFocusExamDesc") },
    ];

    return (
        <div className="space-y-16 bg-navy-deep pb-20">
            <section className="relative overflow-hidden border-b border-navy-border/60">
                <div className="absolute inset-0">
                    <img
                        src="/fidelPageHero.jpg"
                        alt=""
                        aria-hidden="true"
                        className="h-full w-full object-cover object-center opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/90 to-navy-deep/50" />
                </div>

                <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                    <div className="max-w-3xl space-y-5">
                        <p className="text-xs font-bold uppercase tracking-widest text-ft-teal-text">
                            {t("fidelMathPageEyebrow")}
                        </p>
                        <h1 className="text-3xl font-extrabold leading-tight text-white font-ethiopic sm:text-4xl lg:text-5xl">
                            {t("mathHeroTitle")}
                        </h1>
                        <p className="text-base leading-relaxed text-text-secondary sm:text-lg">
                            {t("mathHeroDesc")}
                        </p>
                        <p className="text-sm font-medium text-ft-teal-text">
                            {t("mathHeroNote")}
                        </p>

                        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                            {course ? (
                                <Link
                                    href={buildRegisterHref(course)}
                                    className="rounded-xl bg-gold-primary px-7 py-3.5 text-center text-sm font-extrabold text-navy-deep transition-colors hover:bg-gold-hover"
                                >
                                    {t("fidelRegister")}
                                </Link>
                            ) : (
                                <Link
                                    href="/fidel#courses"
                                    className="rounded-xl bg-gold-primary px-7 py-3.5 text-center text-sm font-extrabold text-navy-deep transition-colors hover:bg-gold-hover"
                                >
                                    {t("fidelBrowseCta")}
                                </Link>
                            )}
                            <a
                                href="tel:+251990285748"
                                className="rounded-xl border border-navy-border px-7 py-3.5 text-center text-sm font-bold text-white transition-colors hover:border-gold-primary"
                            >
                                {t("contactCallLabel")} +251 990 285 748
                            </a>
                        </div>

                        <Link
                            href="/fidel#courses"
                            className="inline-flex text-xs font-semibold text-text-secondary underline-offset-4 hover:text-white hover:underline"
                        >
                            ← {t("landingBackToFidel")}
                        </Link>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-extrabold text-white font-ethiopic">
                    {t("mathFocusTitle")}
                </h2>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {focusAreas.map((area) => (
                        <div
                            key={area.title}
                            className="rounded-xl border border-navy-border bg-navy-surface p-5"
                        >
                            <h3 className="text-sm font-bold text-white">
                                {area.title}
                            </h3>
                            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                                {area.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-extrabold text-white font-ethiopic">
                    {t("mathCourseTitle")}
                </h2>
                {course ? (
                    <div className="mt-5 max-w-2xl">
                        <FidelCourseCard course={course} />
                    </div>
                ) : (
                    <p className="mt-4 rounded-xl border border-navy-border bg-navy-surface p-6 text-sm text-text-secondary">
                        {t("fidelCatalogEmpty")}
                    </p>
                )}
                <p className="mt-4 max-w-2xl text-xs leading-relaxed text-text-muted">
                    {t("fidelFeesNote")}
                </p>
            </section>

            <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Link
                        href="/fidel/exam-preparation"
                        className="rounded-2xl border border-navy-border bg-navy-surface p-6 transition-colors hover:border-gold-primary/40"
                    >
                        <p className="text-xs font-bold uppercase tracking-wider text-ft-teal-text">
                            {t("fidelExamPageEyebrow")}
                        </p>
                        <h2 className="mt-2 text-lg font-extrabold text-white font-ethiopic">
                            {t("fidelExamPageTitle")}
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                            {t("fidelExamPageSummary")}
                        </p>
                        <span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-gold-primary">
                            {t("learnMore")} <span aria-hidden="true">→</span>
                        </span>
                    </Link>

                    <Link
                        href="/fidel#courses"
                        className="rounded-2xl border border-navy-border bg-navy-surface p-6 transition-colors hover:border-gold-primary/40"
                    >
                        <p className="text-xs font-bold uppercase tracking-wider text-ft-teal-text">
                            {t("landingOtherPage")}
                        </p>
                        <h2 className="mt-2 text-lg font-extrabold text-white font-ethiopic">
                            {t("landingBackToFidel")}
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                            {t("fidelCatalogSub")}
                        </p>
                        <span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-gold-primary">
                            {t("fidelBrowseCta")} <span aria-hidden="true">→</span>
                        </span>
                    </Link>
                </div>
            </section>

            <section className="mx-auto max-w-4xl px-4 text-center sm:px-6">
                <div className="rounded-2xl border border-gold-primary/20 bg-navy-surface p-8">
                    <h2 className="text-2xl font-extrabold text-white font-ethiopic">
                        {t("mathCtaTitle")}
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-text-secondary">
                        {t("mathCtaDesc")}
                    </p>
                    <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                        {course && (
                            <Link
                                href={buildRegisterHref(course)}
                                className="rounded-xl bg-gold-primary px-7 py-3.5 text-sm font-extrabold text-navy-deep transition-colors hover:bg-gold-hover"
                            >
                                {t("fidelRegister")}
                            </Link>
                        )}
                        <Link
                            href="/contact"
                            className="rounded-xl border border-navy-border px-7 py-3.5 text-sm font-bold text-white transition-colors hover:border-gold-primary"
                        >
                            {t("landingContactCta")}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
