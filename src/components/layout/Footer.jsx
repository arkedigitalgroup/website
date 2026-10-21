// src/components/layout/Footer.jsx
"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "../../context/LanguageContext";

const socialLinks = [
    {
        label: "Telegram",
        href: "https://t.me/arkegroup",
        path: "M9.78 18.65l.28-4.28 7.76-7.01c.34-.3-.07-.47-.52-.17l-9.58 6.03-4.14-1.3c-.9-.28-.92-.9.19-1.33L20.1 4.25c.76-.28 1.43.18 1.18 1.34l-2.79 13.16c-.2 1-.8 1.25-1.63.78l-4.22-3.11-2.03 1.95c-.23.23-.42.42-.86.42z",
    },
    {
        label: "Facebook",
        href: "https://facebook.com/share/17kUg7tM9n/",
        path: "M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z",
    },
    {
        label: "Instagram",
        href: "https://www.instagram.com/arke_.group",
        path: "M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.18 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c4.35-.2 6.76-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.69 21.3.27 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.85-10.4a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z",
    },
    {
        label: "TikTok",
        href: "https://tiktok.com/@arke_group",
        path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.63 4.14.88.98 2.08 1.64 3.39 1.83v3.9c-1.4-.04-2.79-.44-3.99-1.21-.29-.18-.56-.39-.81-.62v7.7c.05 4.39-3.79 8.28-8.29 8.23-4.8-.05-8.39-4.52-7.58-9.28.53-3.13 3.12-5.63 6.27-5.83.69-.04 1.39.04 2.06.24V13.5c-.56-.25-1.19-.32-1.78-.19-1.52.33-2.61 1.8-2.39 3.34.19 1.34 1.38 2.37 2.76 2.35 1.76-.02 2.94-1.63 2.9-3.32-.01-5.18-.01-10.36-.01-15.54z",
    },
];

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="border-t border-navy-border bg-navy-deep py-12 text-text-secondary">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-3 lg:col-span-2">
                        <span className="text-xl font-bold tracking-wider text-gold-primary font-ethiopic">
                            {t("logoText")}
                        </span>
                        <p className="max-w-md text-sm leading-relaxed">
                            {t("footerTagline")}
                        </p>
                        <p className="max-w-md text-xs leading-relaxed text-text-muted">
                            {t("coreBeliefQuote")}
                        </p>
                    </div>

                    {/* Pages */}
                    <nav aria-label={t("footerLinksHeading")}>
                        <h2 className="mb-4 border-b border-navy-border pb-2 text-sm font-semibold uppercase tracking-wider text-white">
                            {t("footerLinksHeading")}
                        </h2>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/fidel"
                                    className="hover:text-gold-primary"
                                >
                                    {t("navFidel")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/fidel/mathematics-tutoring"
                                    className="hover:text-gold-primary"
                                >
                                    {t("fidelMathNavLabel")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/fidel/exam-preparation"
                                    className="hover:text-gold-primary"
                                >
                                    {t("fidelExamNavLabel")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/about"
                                    className="hover:text-gold-primary"
                                >
                                    {t("navAbout")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/yeneta"
                                    className="hover:text-gold-primary"
                                >
                                    {t("footerYenetaLabel")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="hover:text-gold-primary"
                                >
                                    {t("navContact")}
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* Contact + social */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="mb-4 border-b border-navy-border pb-2 text-sm font-semibold uppercase tracking-wider text-white">
                                {t("footerContactHeading")}
                            </h2>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a
                                        href="tel:+251990285748"
                                        className="hover:text-gold-primary"
                                    >
                                        {t("footerCallLabel")}: +251 990 285 748
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="tel:+251976977475"
                                        className="hover:text-gold-primary"
                                    >
                                        +251 976 977 475
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="mailto:info@arke-group.com"
                                        className="hover:text-gold-primary"
                                    >
                                        {t("footerEmailLabel")}: info@arke-group.com
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
                                {t("footerSocialHeading")}
                            </h2>
                            <div className="flex space-x-3">
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label={social.label}
                                        className="flex h-10 w-10 items-center justify-center rounded-md border border-navy-border bg-navy-surface transition-all duration-200 hover:border-gold-primary hover:text-gold-primary"
                                    >
                                        <svg
                                            className="h-5 w-5 fill-current"
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                        >
                                            <path d={social.path} />
                                        </svg>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-navy-border pt-6 text-xs text-text-muted md:flex-row">
                    <p>{t("footerCopyright")}</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/about" className="hover:underline">
                            {t("navAbout")}
                        </Link>
                        <Link href="/fidel" className="hover:underline">
                            {t("navFidel")}
                        </Link>
                        <Link href="/yeneta" className="hover:underline">
                            {t("footerYenetaLabel")}
                        </Link>
                        <Link href="/contact" className="hover:underline">
                            {t("navContact")}
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
