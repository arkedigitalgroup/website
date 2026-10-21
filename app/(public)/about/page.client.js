// app/(public)/about/page.client.js
"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "../../../src/context/LanguageContext";

export default function AboutPageClient() {
    const { t } = useLanguage();

    const sections = [
        {
            key: "story",
            title: t("aboutEssenceTitle"),
            body: t("aboutEssenceDesc"),
            accent: "border-l-gold-primary",
        },
        {
            key: "belief",
            title: t("aboutBeliefTitle"),
            body: t("aboutBeliefDesc"),
            accent: "border-l-ft-teal",
        },
        {
            key: "vision",
            title: t("aboutVisionTitle"),
            body: t("aboutVisionDesc"),
            accent: "border-l-gold-primary",
        },
    ];

    const missionPoints = t("aboutMissionDesc")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    return (
        <div className="mx-auto max-w-5xl space-y-14 px-4 py-16 sm:px-6 lg:px-8">
            <header className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-ft-teal-text">
                    {t("fidelBadge")}
                </p>
                <h1 className="text-4xl font-extrabold tracking-tight text-white font-ethiopic sm:text-5xl">
                    {t("aboutTitle")}
                </h1>
                <div className="h-1.5 w-24 rounded-full bg-gold-primary" />
                <p className="max-w-3xl text-base leading-relaxed text-text-secondary sm:text-lg">
                    {t("aboutIntro")}
                </p>
            </header>

            <div className="space-y-6">
                {sections.map((section) => (
                    <section
                        key={section.key}
                        className={`rounded-2xl border border-navy-border border-l-4 ${section.accent} bg-navy-surface p-7 sm:p-8`}
                    >
                        <h2 className="text-xl font-extrabold text-white font-ethiopic">
                            {section.title}
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">
                            {section.body}
                        </p>
                    </section>
                ))}

                <section className="rounded-2xl border border-navy-border border-l-4 border-l-gold-primary bg-navy-surface p-7 sm:p-8">
                    <h2 className="text-xl font-extrabold text-white font-ethiopic">
                        {t("aboutMissionTitle")}
                    </h2>
                    <ul className="mt-4 space-y-3">
                        {missionPoints.map((point) => (
                            <li
                                key={point}
                                className="flex items-start gap-2 text-sm leading-relaxed text-text-secondary"
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
                </section>

                <section className="rounded-2xl border border-navy-border border-l-4 border-l-ft-teal bg-navy-surface p-7 sm:p-8">
                    <h2 className="text-xl font-extrabold text-white font-ethiopic">
                        {t("aboutApproachTitle")}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">
                        {t("aboutApproachDesc")}
                    </p>
                </section>
            </div>

            <section className="space-y-5">
                <h2 className="text-2xl font-extrabold text-white font-ethiopic">
                    {t("serviceTitle")}
                </h2>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="rounded-2xl border border-navy-border border-t-4 border-t-ft-teal bg-navy-surface p-6">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-ft-teal-text">
                            {t("fidelBadge")}
                        </span>
                        <h3 className="mt-2 text-lg font-extrabold text-white font-ethiopic">
                            {t("aboutIdentityTitleFidel")}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                            {t("aboutIdentityDescFidel")}
                        </p>
                        <Link
                            href="/fidel#courses"
                            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-gold-primary hover:text-gold-hover"
                        >
                            {t("subjectsCta")} <span aria-hidden="true">→</span>
                        </Link>
                    </div>

                    <div className="rounded-2xl border border-navy-border border-t-4 border-t-yt-maroon bg-navy-surface p-6">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gold-primary">
                            {t("yenetaBadge")}
                        </span>
                        <h3 className="mt-2 text-lg font-extrabold text-white font-ethiopic">
                            {t("aboutIdentityTitleYeneta")}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                            {t("aboutIdentityDescYeneta")}
                        </p>
                        <Link
                            href="/yeneta"
                            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-gold-primary hover:text-gold-hover"
                        >
                            {t("heroYenetaCTA")} <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-gold-primary/20 bg-navy-surface p-8 text-center">
                <h2 className="text-2xl font-extrabold text-white font-ethiopic">
                    {t("finalCtaTitle")}
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-text-secondary">
                    {t("finalCtaDesc")}
                </p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                        href="/fidel#courses"
                        className="rounded-xl bg-gold-primary px-7 py-3.5 text-sm font-extrabold text-navy-deep transition-colors hover:bg-gold-hover"
                    >
                        {t("heroPrimaryCta")}
                    </Link>
                    <Link
                        href="/contact"
                        className="rounded-xl border border-navy-border px-7 py-3.5 text-sm font-bold text-white transition-colors hover:border-gold-primary"
                    >
                        {t("finalCtaSecondary")}
                    </Link>
                </div>
            </section>
        </div>
    );
}
