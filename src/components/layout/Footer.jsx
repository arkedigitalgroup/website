// src/components/layout/Footer.jsx
"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "../../context/LanguageContext";

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="bg-navy-deep border-t border-navy-border py-12 text-text-secondary">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Logo & Vision Description */}
                    <div>
                        <div className="space-y-4">
                            <span className="text-xl font-bold tracking-wider text-gold-primary font-ethiopic">
                                {t("logoText")}
                            </span>
                            <p className="text-sm leading-relaxed max-w-xs text-text-secondary">
                                {t("heroSubtitle")} — {t("coreBeliefQuote")}
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-white text-sm font-semibold tracking-wider uppercase mb-4 border-b border-navy-border pb-2 w-28">
                                Links
                            </h3>
                            <ul className="flex gap-4 text-sm">
                                <li>
                                    <Link
                                        href="/"
                                        className="hover:text-gold-primary transition-colors"
                                    >
                                        {t("navHome")}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/about"
                                        className="hover:text-gold-primary transition-colors"
                                    >
                                        {t("navAbout")}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/yeneta"
                                        className="hover:text-gold-primary transition-colors"
                                    >
                                        {t("navYeneta")}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/fidel"
                                        className="hover:text-gold-primary transition-colors"
                                    >
                                        {t("navFidel")}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/contact"
                                        className="hover:text-gold-primary transition-colors"
                                    >
                                        {t("navContact")}
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Social Channels */}
                    <div>
                        <h3 className="text-white text-sm font-semibold tracking-wider uppercase mb-4 border-b border-navy-border pb-2 w-32">
                            Social Media
                        </h3>
                        <div className="flex space-x-4 mb-4">
                            {/* Telegram */}
                            <a
                                href="https://t.me/arkeeducation"
                                target="_blank"
                                rel="noreferrer"
                                className="w-10 h-10 rounded-md bg-navy-surface border border-navy-border flex items-center justify-center hover:border-gold-primary hover:text-gold-primary transition-all duration-200"
                            >
                                <svg
                                    className="w-5 h-5 fill-current"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M9.78 18.65l.28-4.28 7.76-7.01c.34-.3-.07-.47-.52-.17l-9.58 6.03-4.14-1.3c-.9-.28-.92-.9.19-1.33L20.1 4.25c.76-.28 1.43.18 1.18 1.34l-2.79 13.16c-.2 1-.8 1.25-1.63.78l-4.22-3.11-2.03 1.95c-.23.23-.42.42-.86.42z" />
                                </svg>
                            </a>
                            {/* Facebook */}
                            <a
                                href="https://facebook.com/arkeeducation"
                                target="_blank"
                                rel="noreferrer"
                                className="w-10 h-10 rounded-md bg-navy-surface border border-navy-border flex items-center justify-center hover:border-gold-primary hover:text-gold-primary transition-all duration-200"
                            >
                                <svg
                                    className="w-5 h-5 fill-current"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                                </svg>
                            </a>
                            {/* TikTok */}
                            <a
                                href="https://tiktok.com/@arkeeducation"
                                target="_blank"
                                rel="noreferrer"
                                className="w-10 h-10 rounded-md bg-navy-surface border border-navy-border flex items-center justify-center hover:border-gold-primary hover:text-gold-primary transition-all duration-200"
                            >
                                <svg
                                    className="w-5 h-5 fill-current"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.63 4.14.88.98 2.08 1.64 3.39 1.83v3.9c-1.4-.04-2.79-.44-3.99-1.21-.29-.18-.56-.39-.81-.62v7.7c.05 4.39-3.79 8.28-8.29 8.23-4.8-.05-8.39-4.52-7.58-9.28.53-3.13 3.12-5.63 6.27-5.83.69-.04 1.39.04 2.06.24V13.5c-.56-.25-1.19-.32-1.78-.19-1.52.33-2.61 1.8-2.39 3.34.19 1.34 1.38 2.37 2.76 2.35 1.76-.02 2.94-1.63 2.9-3.32-.01-5.18-.01-10.36-.01-15.54z" />
                                </svg>
                            </a>
                        </div>
                        <p className="text-xs text-text-muted">
                            Follow our official media handles for educational
                            tips and platform announcements.
                        </p>
                    </div>
                </div>

                <div className="border-t border-navy-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-text-muted">
                    <div>{t("footerCopyright")}</div>
                    <div className="mt-4 md:mt-0 flex space-x-4">
                        <Link href="/about" className="hover:underline">
                            Essence
                        </Link>
                        <Link href="/yeneta" className="hover:underline">
                            Yeneta Brand
                        </Link>
                        <Link href="/fidel" className="hover:underline">
                            Fidel Brand
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
