// src/components/fidel/FidelCourseCard.jsx
"use client";

import React, { useId, useState } from "react";
import Link from "next/link";
import { useLanguage } from "../../context/LanguageContext";
import {
    billingUnitLabel,
    buildRegisterHref,
    formatCoursePrice,
    formatLabel,
    gradeLabel,
    subjectLabel,
} from "../../lib/fidelCatalog";

/**
 * One standardized Fidel course card.
 *
 * Every card shows the same facts in the same order: subject, grades, delivery
 * format, price with its billing unit, what is included, and the learning
 * focus. Nothing is shown unless it exists in the course record.
 */
export default function FidelCourseCard({ course, compact = false }) {
    const { t, lang } = useLanguage();
    const [expanded, setExpanded] = useState(false);
    const detailsId = useId();

    const pricing = course.pricing ?? {};
    const price = formatCoursePrice(pricing, lang);
    const unit = billingUnitLabel(pricing.pricing_model, lang);
    const grades = gradeLabel(course.grade_range, lang);
    const features = course.features ?? [];
    const outcomes = course.learning_outcomes ?? [];
    const visibleFeatures = compact ? features.slice(0, 3) : features;

    return (
        <article className="group flex flex-col rounded-2xl border border-navy-border bg-navy-surface p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-ft-teal/50 hover:shadow-navy">
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-ft-teal/30 bg-ft-teal-faint px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-ft-teal-text">
                    {subjectLabel(course.subject, lang)}
                </span>
                <span className="rounded-md border border-navy-border bg-navy-deep/60 px-2.5 py-1 text-[11px] font-semibold text-text-secondary">
                    {formatLabel(course.format, lang)}
                </span>
            </div>

            <h3 className="text-lg font-bold leading-snug text-white">
                {course.course_name}
            </h3>

            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-navy-border/70 bg-navy-deep/40 px-3 py-2">
                    <dt className="text-text-muted">{t("fidelGradesLabel")}</dt>
                    <dd className="mt-0.5 font-semibold text-white">{grades}</dd>
                </div>
                <div className="rounded-lg border border-navy-border/70 bg-navy-deep/40 px-3 py-2">
                    <dt className="text-text-muted">{t("fidelDeliveryLabel")}</dt>
                    <dd className="mt-0.5 font-semibold text-white">
                        {course.delivery_mode || formatLabel(course.format, lang)}
                    </dd>
                </div>
            </dl>

            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                {course.description}
            </p>

            {visibleFeatures.length > 0 && (
                <div className="mt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                        {t("fidelIncludesLabel")}
                    </p>
                    <ul className="mt-2 space-y-1.5">
                        {visibleFeatures.map((feature, index) => (
                            <li
                                key={index}
                                className="flex items-start gap-2 text-xs leading-relaxed text-text-secondary"
                            >
                                <span
                                    aria-hidden="true"
                                    className="mt-0.5 shrink-0 text-ft-teal-text"
                                >
                                    ✓
                                </span>
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                    {compact && features.length > visibleFeatures.length && (
                        <p className="mt-2 text-[11px] text-text-muted">
                            +{features.length - visibleFeatures.length}{" "}
                            {lang === "am" ? "ተጨማሪ" : "more"}
                        </p>
                    )}
                </div>
            )}

            {!compact && (
                <div
                    id={detailsId}
                    className={`grid transition-all duration-300 ${
                        expanded
                            ? "mt-4 grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
                    }`}
                >
                    <div className="overflow-hidden">
                        {outcomes.length > 0 && (
                            <div className="rounded-xl border border-navy-border/70 bg-navy-deep/40 p-4">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                                    {t("fidelOutcomesLabel")}
                                </p>
                                <ul className="mt-2 space-y-1.5">
                                    {outcomes.map((outcome, index) => (
                                        <li
                                            key={index}
                                            className="flex items-start gap-2 text-xs leading-relaxed text-text-secondary"
                                        >
                                            <span
                                                aria-hidden="true"
                                                className="mt-0.5 shrink-0 text-gold-primary"
                                            >
                                                →
                                            </span>
                                            <span>{outcome}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            <div className="rounded-lg border border-navy-border/70 bg-navy-deep/40 px-3 py-2">
                                <dt className="text-text-muted">
                                    {t("fidelSessionLabel")}
                                </dt>
                                <dd className="mt-0.5 font-semibold text-white">
                                    {course.duration_per_session || "—"}
                                </dd>
                            </div>
                            <div className="rounded-lg border border-navy-border/70 bg-navy-deep/40 px-3 py-2">
                                <dt className="text-text-muted">
                                    {t("fidelTypeLabel")}
                                </dt>
                                <dd className="mt-0.5 font-semibold text-white">
                                    {course.session_type || "—"}
                                </dd>
                            </div>
                            <div className="rounded-lg border border-navy-border/70 bg-navy-deep/40 px-3 py-2">
                                <dt className="text-text-muted">
                                    {t("fidelScheduleLabel")}
                                </dt>
                                <dd className="mt-0.5 font-semibold text-white">
                                    {course.schedule_flexibility || "—"}
                                </dd>
                            </div>
                            <div className="rounded-lg border border-navy-border/70 bg-navy-deep/40 px-3 py-2">
                                <dt className="text-text-muted">
                                    {lang === "am" ? "ሥርዓተ ትምህርት" : "Curriculum"}
                                </dt>
                                <dd className="mt-0.5 font-semibold text-white">
                                    {course.curriculum || "—"}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            )}

            <div className="mt-auto pt-5">
                <div className="flex items-end justify-between gap-3 border-t border-navy-border/70 pt-4">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                            {t("fidelPriceLabel")}
                        </p>
                        <p className="text-xl font-extrabold text-gold-primary">
                            {price}
                        </p>
                        {unit && (
                            <p className="text-[11px] text-text-secondary">
                                {unit}
                            </p>
                        )}
                    </div>
                    <Link
                        href={buildRegisterHref(course)}
                        className="rounded-lg bg-gold-primary px-4 py-2.5 text-sm font-bold text-navy-deep transition-colors hover:bg-gold-hover"
                        aria-label={`${t("fidelRegister")}: ${course.course_name}`}
                    >
                        {t("fidelRegister")}
                    </Link>
                </div>

                {!compact && (
                    <button
                        type="button"
                        onClick={() => setExpanded((value) => !value)}
                        aria-expanded={expanded}
                        aria-controls={detailsId}
                        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-ft-teal-text transition-colors hover:text-gold-primary"
                    >
                        {expanded ? t("fidelLess") : t("fidelDetails")}
                        <span aria-hidden="true">{expanded ? "↑" : "↓"}</span>
                    </button>
                )}
            </div>
        </article>
    );
}
