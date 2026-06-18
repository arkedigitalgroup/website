// app/(public)/about/page.client.js
"use client";

import React from "react";
import { useLanguage } from "../../../src/context/LanguageContext";

export default function AboutPageClient() {
    const { t } = useLanguage();

    return (
        <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gold-primary font-ethiopic leading-snug">
                    {t("aboutTitle")}
                </h1>
                <div className="h-1 w-24 bg-gold-primary mx-auto rounded-full" />
            </div>

            {/* Sections */}
            <div className="space-y-12">
                {/* 1. Essence of Arke */}
                <div className="bg-navy-surface border border-navy-border rounded-xl p-8 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gold-faint rounded-bl-full pointer-events-none" />
                    <div className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-gold-primary font-ethiopic border-b border-navy-border pb-2">
                            {t("aboutEssenceTitle")}
                        </h2>
                        <p className="text-text-secondary leading-relaxed text-sm sm:text-base  font-medium">
                            {t("aboutEssenceDesc")}
                        </p>
                    </div>
                </div>

                {/* 2. Core Belief */}
                <div className="bg-navy-surface border border-navy-border rounded-xl p-8 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-yt-maroon-faint rounded-bl-full pointer-events-none" />
                    <div className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-gold-primary font-ethiopic border-b border-navy-border pb-2">
                            {t("aboutBeliefTitle")}
                        </h2>
                        <p className="text-text-secondary leading-relaxed text-sm sm:text-base  font-medium italic">
                            {t("aboutBeliefDesc")}
                        </p>
                    </div>
                </div>

                {/* 3. Vision 2035 */}
                <div className="bg-navy-surface border border-navy-border rounded-xl p-8 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-ft-teal-faint rounded-bl-full pointer-events-none" />
                    <div className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-gold-primary font-ethiopic border-b border-navy-border pb-2">
                            {t("aboutVisionTitle")}
                        </h2>
                        <p className="text-text-secondary leading-relaxed text-sm sm:text-base  font-medium">
                            {t("aboutVisionDesc")}
                        </p>
                    </div>
                </div>

                {/* 4. Mission */}
                <div className="bg-navy-surface border border-navy-border rounded-xl p-8 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gold-faint rounded-bl-full pointer-events-none" />
                    <div className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-gold-primary font-ethiopic border-b border-navy-border pb-2">
                            {t("aboutMissionTitle")}
                        </h2>
                        <ul className="space-y-3 list-none">
                            {t("aboutMissionDesc")
                                .split("\n")
                                .filter((line) => line.trim() !== "")
                                .map((line, index) => (
                                    <li
                                        key={index}
                                        className="text-text-secondary leading-relaxed text-sm sm:text-base font-medium flex items-start gap-2"
                                    >
                                        <span className="text-gold-primary mt-1 shrink-0">
                                            •
                                        </span>
                                        <span>{line.trim()}</span>
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>

                {/* 5. Service Descriptions Brief */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {/* Yeneta */}
                    <div className="bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md border-t-4 border-t-yt-maroon">
                        <h3 className="text-lg font-bold text-white mb-3 font-ethiopic">
                            {t("yenetaTitle")}
                        </h3>
                        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                            {t("yenetaDesc")}
                        </p>
                        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                            {t("aboutIdentityTitleYeneta")}
                        </p>
                    </div>

                    {/* Fidel */}
                    <div className="bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md border-t-4 border-t-ft-teal">
                        <h3 className="text-lg font-bold text-white mb-3 font-ethiopic">
                            {t("fidelTitle")}
                        </h3>
                        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                            {t("fidelDesc")}
                        </p>
                        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                            {t("aboutIdentityTitleFidel")}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
